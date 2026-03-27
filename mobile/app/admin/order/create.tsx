import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '@/components/providers/session-provider';
import { useToast } from '@/components/providers/toast-provider';
import { createOrder, fetchLead, fetchQuotation } from '@/lib/api';
import { orderJobLabel } from '@/lib/order-display';
import { useSolarTheme } from '@/constants/solar-theme';

function formatInr(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AdminCreateOrderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useSolarTheme();
  const { user } = useSession();
  const { showToast } = useToast();
  const { quotationId } = useLocalSearchParams<{ quotationId: string }>();
  const bottomBarOffset = user?.role === 'staff' ? 78 : 0;

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [finalPrice, setFinalPrice] = useState(0);
  const [systemKw, setSystemKw] = useState(0);
  const [leadSummary, setLeadSummary] = useState('');
  const [payload, setPayload] = useState<{
    leadId: string;
    quotationId: string;
    clientId: string;
    staffId: string;
  } | null>(null);

  const [installationTeam, setInstallationTeam] = useState('');
  const [sourcingNotes, setSourcingNotes] = useState('');
  const [installationDate, setInstallationDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!quotationId || typeof quotationId !== 'string') {
      setLoadError('Missing quotation');
      setIsLoading(false);
      return;
    }
    if (!user) {
      return;
    }
    try {
      setLoadError('');
      setIsLoading(true);
      const q = await fetchQuotation(quotationId);
      const lead = await fetchLead(q.leadId);
      setFinalPrice(q.finalPrice);
      setSystemKw(q.systemSizeKw);
      setLeadSummary(`${lead.requiredLoadKw}kW · ${lead.roofType} · ${lead.address.split(',').slice(-2).join(',').trim()}`);
      setPayload({
        leadId: q.leadId,
        quotationId: q.id,
        clientId: q.clientId,
        staffId: lead.assignedStaffId ?? q.staffId,
      });
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load');
      setPayload(null);
    } finally {
      setIsLoading(false);
    }
  }, [quotationId, user]);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async () => {
    if (!user || !payload) {
      return;
    }
    try {
      setIsSubmitting(true);
      const order = await createOrder(user, {
        ...payload,
        staffId: payload.staffId || user.id,
        installationTeam: installationTeam.trim() || undefined,
        sourcingNotes: sourcingNotes.trim() || undefined,
        installationDate: installationDate.trim() || undefined,
      });
      showToast({
        type: 'success',
        title: 'Order created',
        message: `${orderJobLabel(order.id)} is ready for installation tracking.`,
      });
      router.replace({
        pathname: user?.role === 'staff' ? '/staff/order/[id]' : '/admin/order/[id]',
        params: { id: order.id },
      });
    } catch (e) {
      showToast({
        type: 'error',
        title: 'Could not create order',
        message: e instanceof Error ? e.message : 'Try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
          <Pressable onPress={() => router.back()} style={styles.headerIcon} hitSlop={10}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Create Order</Text>
          <View style={styles.headerIcon} />
        </View>

        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : loadError || !payload ? (
          <View style={styles.centered}>
            <Text style={[styles.err, { color: colors.danger }]}>{loadError || 'Invalid quotation'}</Text>
            <Pressable onPress={() => void load()} style={[styles.retry, { backgroundColor: colors.primary }]}>
              <Text style={styles.retryTxt}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scroll, { paddingBottom: bottomBarOffset + insets.bottom + 100 }]}>
            <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>Quote snapshot</Text>
            <View style={[styles.snapshot, { backgroundColor: colors.primarySoft, borderColor: colors.border }]}>
              <View style={styles.snapRow}>
                <Text style={[styles.snapLabel, { color: colors.subtle }]}>System size</Text>
                <Text style={[styles.snapValue, { color: colors.text }]}>{systemKw} kW</Text>
              </View>
              <View style={styles.snapRow}>
                <Text style={[styles.snapLabel, { color: colors.subtle }]}>Contract value</Text>
                <Text style={[styles.snapValue, { color: colors.primary }]}>{formatInr(finalPrice)}</Text>
              </View>
              <Text style={[styles.snapMeta, { color: colors.muted }]} numberOfLines={2}>
                {leadSummary}
              </Text>
            </View>

            <Text style={[styles.sectionEyebrow, { color: colors.primary, marginTop: 8 }]}>Installation</Text>
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.text }]}>Installation team</Text>
              <TextInput
                value={installationTeam}
                onChangeText={setInstallationTeam}
                placeholder="e.g. Crew Alpha"
                placeholderTextColor={colors.subtle}
                style={[
                  styles.input,
                  { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
                ]}
              />
            </View>
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.text }]}>Target install date</Text>
              <TextInput
                value={installationDate}
                onChangeText={setInstallationDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.subtle}
                style={[
                  styles.input,
                  { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
                ]}
              />
            </View>
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.text }]}>Sourcing & logistics notes</Text>
              <TextInput
                value={sourcingNotes}
                onChangeText={setSourcingNotes}
                placeholder="Equipment delivery, warehouse, special access…"
                placeholderTextColor={colors.subtle}
                multiline
                style={[
                  styles.inputArea,
                  { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
                ]}
              />
            </View>

            <Text style={[styles.hint, { color: colors.subtle }]}>
              A single final payment milestone is created from the approved quotation total.
            </Text>
          </ScrollView>
        )}

        {!isLoading && payload ? (
          <View
            style={[
              styles.footer,
              {
                backgroundColor: `${colors.background}F2`,
                borderTopColor: colors.border,
                bottom: bottomBarOffset,
                paddingBottom: Math.max(12, insets.bottom),
              },
            ]}>
            <Pressable
              onPress={() => void submit()}
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: colors.primary, opacity: isSubmitting ? 0.7 : pressed ? 0.92 : 1 },
              ]}>
              {isSubmitting ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <>
                  <MaterialIcons name="check-circle" size={22} color={colors.onPrimary} />
                  <Text style={styles.primaryBtnText}>Confirm & create order</Text>
                </>
              )}
            </Pressable>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1, maxWidth: 560, width: '100%', alignSelf: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  err: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
  retry: { paddingHorizontal: 20, paddingVertical: 11, borderRadius: 12 },
  retryTxt: { color: '#fff', fontWeight: '800' },
  scroll: { paddingHorizontal: 16, paddingTop: 20 },
  sectionEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  snapshot: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
    marginBottom: 8,
  },
  snapRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  snapLabel: { fontSize: 13, fontWeight: '600' },
  snapValue: { fontSize: 16, fontWeight: '800' },
  snapMeta: { fontSize: 12, marginTop: 4 },
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 2 },
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputArea: {
    minHeight: 100,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  hint: { fontSize: 12, lineHeight: 18, marginTop: 8, marginBottom: 24 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  primaryBtn: {
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
