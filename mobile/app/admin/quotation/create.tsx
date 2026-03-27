import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
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
import { createQuotation, fetchLead, fetchProducts } from '@/lib/api';
import { useSolarTheme } from '@/constants/solar-theme';
import type { ApiLead, ApiProduct, QuotationLineItem } from '@/types/api';
const SUBSIDY_PER_KW_INR = 12_000;

const FALLBACK_PANELS: { id: string; label: string }[] = [
  { id: 'mono-450', label: 'Mono Perc 450W' },
  { id: 'bifacial-500', label: 'Bifacial 500W Premium' },
  { id: 'shingled-400', label: 'Shingled 400W Black' },
];

const FALLBACK_INVERTERS: { id: string; label: string }[] = [
  { id: 'hybrid-5kw', label: 'Hybrid 5kW Single Phase' },
  { id: 'string-10kw', label: 'String 10kW Three Phase' },
  { id: 'micro-inverter', label: 'Enphase Microinverters' },
];

function parseAmount(raw: string) {
  const n = Number.parseFloat(raw.replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : 0;
}

function formatInr(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function productsToOptions(products: ApiProduct[]): { id: string; label: string; productId: string }[] {
  return products.map((p) => ({ id: p.id, label: p.name, productId: p.id }));
}

type PickerKind = 'panel' | 'inverter' | null;

export default function CreateQuotationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const colors = useSolarTheme();
  const { user } = useSession();
  const { showToast } = useToast();
  const { leadId } = useLocalSearchParams<{ leadId: string }>();

  const [lead, setLead] = useState<ApiLead | null>(null);
  const [loadError, setLoadError] = useState('');
  const [panelOptions, setPanelOptions] = useState<{ id: string; label: string; productId?: string }[]>([]);
  const [inverterOptions, setInverterOptions] = useState<{ id: string; label: string; productId?: string }[]>([]);

  const [systemSizeKw, setSystemSizeKw] = useState('');
  const [panelId, setPanelId] = useState<string | null>(null);
  const [inverterId, setInverterId] = useState<string | null>(null);
  const [equipmentCost, setEquipmentCost] = useState('');
  const [subsidyInput, setSubsidyInput] = useState('');
  const [subsidyAuto, setSubsidyAuto] = useState(true);

  const [pickerOpen, setPickerOpen] = useState<PickerKind>(null);
  const [isSending, setIsSending] = useState(false);

  const load = useCallback(async () => {
    if (!leadId || typeof leadId !== 'string') {
      setLoadError('Missing lead');
      return;
    }
    try {
      setLoadError('');
      const [leadRow, panels, inverters] = await Promise.all([
        fetchLead(leadId),
        fetchProducts({ category: 'solar_panel' }).catch(() => [] as ApiProduct[]),
        fetchProducts({ category: 'solar_inverter' }).catch(() => [] as ApiProduct[]),
      ]);
      setLead(leadRow);
      setPanelOptions(panels.length ? productsToOptions(panels) : FALLBACK_PANELS);
      setInverterOptions(inverters.length ? productsToOptions(inverters) : FALLBACK_INVERTERS);
      const kw = leadRow.requiredLoadKw;
      if (kw && kw > 0) {
        setSystemSizeKw(String(kw));
      }
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load');
      setLead(null);
    }
  }, [leadId]);

  useEffect(() => {
    void load();
  }, [load]);

  const kwNum = useMemo(() => {
    const n = Number.parseFloat(systemSizeKw.replace(/,/g, '').trim());
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [systemSizeKw]);

  useEffect(() => {
    if (!subsidyAuto || kwNum <= 0) {
      return;
    }
    const est = Math.round(kwNum * SUBSIDY_PER_KW_INR);
    setSubsidyInput(String(est));
  }, [kwNum, subsidyAuto]);

  const equipmentNum = parseAmount(equipmentCost);
  const subsidyNum = parseAmount(subsidyInput);
  const finalPrice = Math.max(0, equipmentNum - subsidyNum);

  const panelLabel = panelOptions.find((o) => o.id === panelId)?.label ?? '';
  const inverterLabel = inverterOptions.find((o) => o.id === inverterId)?.label ?? '';
  const quotationDetailPath = user?.role === 'staff' ? '/staff/quotation/[id]' : '/admin/quotation/[id]';

  const openPicker = (kind: PickerKind) => setPickerOpen(kind);
  const closePicker = () => setPickerOpen(null);

  const handleSubsidyChange = (text: string) => {
    setSubsidyAuto(false);
    setSubsidyInput(text);
  };

  const sendToClient = async () => {
    if (!user || !lead) {
      return;
    }
    if (kwNum <= 0) {
      showToast({ type: 'error', title: 'System size', message: 'Enter a valid system size (kW).' });
      return;
    }
    if (!panelId || !inverterId) {
      showToast({ type: 'error', title: 'Selections', message: 'Choose a panel and an inverter.' });
      return;
    }
    if (equipmentNum <= 0) {
      showToast({ type: 'error', title: 'Equipment cost', message: 'Enter total equipment cost.' });
      return;
    }

    const panel = panelOptions.find((o) => o.id === panelId)!;
    const inverter = inverterOptions.find((o) => o.id === inverterId)!;
    const lineLabel = `${panel.label} + ${inverter.label} (${kwNum}kW system)`;
    const items: QuotationLineItem[] = [
      {
        id: `qi_${Date.now()}`,
        productId: panel.productId,
        label: lineLabel,
        quantity: 1,
        unitPrice: equipmentNum,
      },
    ];

    const staffId = lead.assignedStaffId ?? user.id;

    try {
      setIsSending(true);
      const created = await createQuotation(user, {
        leadId: lead.id,
        clientId: lead.clientId,
        staffId,
        systemSizeKw: kwNum,
        items,
        subsidyScheme: 'Government subsidy estimate',
        subsidyAmount: subsidyNum,
        finalPrice,
        status: 'sent',
        sharedVia: ['in_app'],
      });
      showToast({
        type: 'success',
        title: 'Quotation sent',
        message: 'The client will see this in the app.',
      });
      router.replace({
        pathname: quotationDetailPath,
        params: { id: created.id },
      });
    } catch (e) {
      showToast({
        type: 'error',
        title: 'Could not create quotation',
        message: e instanceof Error ? e.message : 'Try again.',
      });
    } finally {
      setIsSending(false);
    }
  };

  const pickerOptions = pickerOpen === 'panel' ? panelOptions : pickerOpen === 'inverter' ? inverterOptions : [];
  const pickerTitle = pickerOpen === 'panel' ? 'Panel selection' : 'Inverter selection';
  const pickerSelected = pickerOpen === 'panel' ? panelId : inverterId;
  const accent = colors.primary;
  const accentGlow = colors.border;
  const accentSoft = colors.primarySoft;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: accentGlow }]}>
          <Pressable onPress={() => router.back()} style={styles.headerIcon} hitSlop={10}>
            <MaterialIcons name="arrow-back" size={24} color={accent} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Create Quotation</Text>
          <View style={styles.headerSpacer} />
        </View>

        {loadError ? (
          <View style={styles.centerMsg}>
            <Text style={[styles.err, { color: '#dc2626' }]}>{loadError}</Text>
            <Pressable onPress={() => void load()} style={[styles.retry, { backgroundColor: accent }]}>
              <Text style={styles.retryTxt}>Retry</Text>
            </Pressable>
          </View>
        ) : !lead ? (
          <View style={styles.centerMsg}>
            <ActivityIndicator color={accent} size="large" />
          </View>
        ) : (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.scroll,
                { paddingBottom: tabBarHeight + 100 + insets.bottom },
              ]}>
              <View style={styles.section}>
                <Text style={[styles.sectionEyebrow, { color: accent }]}>System Details</Text>

                <View style={styles.field}>
                  <Text style={[styles.label, { color: colors.text }]}>System Size (kW)</Text>
                  <View style={styles.inputWrap}>
                    <TextInput
                      value={systemSizeKw}
                      onChangeText={setSystemSizeKw}
                      placeholder="e.g. 5.0"
                      placeholderTextColor={colors.subtle}
                      keyboardType="decimal-pad"
                      style={[
                        styles.inputLg,
                        {
                          backgroundColor: colors.surface,
                          borderColor: accentGlow,
                          color: colors.text,
                        },
                      ]}
                    />
                    <Text style={[styles.inputSuffix, { color: colors.subtle }]}>kW</Text>
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={[styles.label, { color: colors.text }]}>Panel Selection</Text>
                  <Pressable
                    onPress={() => openPicker('panel')}
                    style={[
                      styles.select,
                      {
                        backgroundColor: colors.surface,
                        borderColor: accentGlow,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.selectText,
                        { color: panelId ? colors.text : colors.subtle },
                      ]}
                      numberOfLines={1}>
                      {panelId ? panelLabel : 'Select panels'}
                    </Text>
                    <MaterialIcons name="keyboard-arrow-down" size={24} color={accent} />
                  </Pressable>
                </View>

                <View style={styles.field}>
                  <Text style={[styles.label, { color: colors.text }]}>Inverter Selection</Text>
                  <Pressable
                    onPress={() => openPicker('inverter')}
                    style={[
                      styles.select,
                      {
                        backgroundColor: colors.surface,
                        borderColor: accentGlow,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.selectText,
                        { color: inverterId ? colors.text : colors.subtle },
                      ]}
                      numberOfLines={1}>
                      {inverterId ? inverterLabel : 'Select inverter'}
                    </Text>
                    <MaterialIcons name="keyboard-arrow-down" size={24} color={accent} />
                  </Pressable>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: accentGlow }]} />

              <View style={styles.section}>
                <Text style={[styles.sectionEyebrow, { color: accent }]}>Financial Summary</Text>
                <View style={[styles.financeCard, { backgroundColor: accentSoft, borderColor: accentGlow }]}>
                  <View style={styles.field}>
                    <Text style={[styles.labelSm, { color: colors.muted }]}>Total Equipment Cost</Text>
                    <View style={styles.moneyWrap}>
                      <Text style={[styles.rupeePrefix, { color: colors.muted }]}>₹</Text>
                      <TextInput
                        value={equipmentCost}
                        onChangeText={setEquipmentCost}
                        placeholder="0"
                        placeholderTextColor={colors.subtle}
                        keyboardType="decimal-pad"
                        style={[
                        styles.inputMoney,
                        {
                          backgroundColor: colors.surface,
                          borderColor: accentGlow,
                          color: colors.text,
                        },
                      ]}
                      />
                    </View>
                  </View>

                  <View style={styles.field}>
                    <Text style={[styles.labelSm, { color: colors.muted }]}>Government Subsidy Estimate</Text>
                    <View style={styles.moneyWrap}>
                      <Text style={[styles.rupeeMinus, { color: accent }]}>- ₹</Text>
                      <TextInput
                        value={subsidyInput}
                        onChangeText={handleSubsidyChange}
                        placeholder="0"
                        placeholderTextColor={colors.subtle}
                        keyboardType="decimal-pad"
                        style={[
                        styles.inputMoneySubsidy,
                        {
                          backgroundColor: colors.surface,
                          borderColor: accentGlow,
                          color: accent,
                        },
                      ]}
                      />
                    </View>
                    <Text style={[styles.hint, { color: colors.subtle }]}>
                      Auto-calculated based on system size
                    </Text>
                  </View>

                  <View style={[styles.finalRow, { borderTopColor: accentGlow }]}>
                    <Text style={[styles.finalLabel, { color: colors.text }]}>Final Price to Client</Text>
                    <Text style={[styles.finalValue, { color: accent }]}>{formatInr(finalPrice)}</Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            <View
              style={[
                styles.footer,
                {
                  backgroundColor: `${colors.background}E6`,
                  borderTopColor: accentGlow,
                  bottom: tabBarHeight,
                  paddingBottom: Math.max(insets.bottom, 12),
                },
              ]}>
              <Pressable
                onPress={() => void sendToClient()}
                disabled={isSending}
                style={({ pressed }) => [
                  styles.sendBtn,
                  {
                    backgroundColor: accent,
                    shadowColor: colors.shadow,
                    opacity: isSending ? 0.7 : pressed ? 0.92 : 1,
                  },
                ]}
              >
                {isSending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <MaterialIcons name="send" size={22} color="#fff" />
                    <Text style={styles.sendBtnText}>Send to Client</Text>
                  </>
                )}
              </Pressable>
            </View>
          </>
        )}
      </KeyboardAvoidingView>

      <Modal visible={pickerOpen !== null} animationType="slide" transparent onRequestClose={closePicker}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={closePicker} />
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{pickerTitle}</Text>
            <FlatList
              data={pickerOptions}
              keyExtractor={(item) => item.id}
              style={styles.pickerList}
              renderItem={({ item }) => {
                const selected = item.id === pickerSelected;
                return (
                  <Pressable
                    onPress={() => {
                      if (pickerOpen === 'panel') {
                        setPanelId(item.id);
                      } else if (pickerOpen === 'inverter') {
                        setInverterId(item.id);
                      }
                      closePicker();
                    }}
                    style={[
                      styles.pickerRow,
                      { borderBottomColor: colors.border },
                      selected && { backgroundColor: accentSoft },
                    ]}>
                    <Text style={[styles.pickerRowText, { color: colors.text }]}>{item.label}</Text>
                    {selected ? <MaterialIcons name="check" color={accent} size={22} /> : null}
                  </Pressable>
                );
              }}
            />
            <Pressable onPress={closePicker} style={styles.modalClose}>
              <Text style={{ color: accent, fontWeight: '800' }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1, maxWidth: 560, width: '100%', alignSelf: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    paddingRight: 40,
    letterSpacing: -0.3,
  },
  headerSpacer: { width: 40 },
  centerMsg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  err: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
  retry: { paddingHorizontal: 20, paddingVertical: 11, borderRadius: 12 },
  retryTxt: { color: '#fff', fontWeight: '800' },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  section: {
    paddingVertical: 20,
  },
  sectionEyebrow: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 4,
  },
  labelSm: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 4,
  },
  inputWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputLg: {
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingRight: 48,
    fontSize: 16,
  },
  inputSuffix: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
    fontSize: 15,
    fontWeight: '600',
  },
  select: {
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  divider: {
    height: 1,
    marginHorizontal: 0,
  },
  financeCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 4,
  },
  moneyWrap: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  rupeePrefix: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  rupeeMinus: {
    position: 'absolute',
    left: 10,
    zIndex: 1,
    fontSize: 15,
    fontWeight: '800',
  },
  inputMoney: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    paddingLeft: 32,
    paddingRight: 14,
    fontSize: 16,
    fontWeight: '700',
  },
  inputMoneySubsidy: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    paddingLeft: 52,
    paddingRight: 14,
    fontSize: 16,
    fontWeight: '700',
  },
  hint: {
    fontSize: 10,
    marginTop: 6,
    marginLeft: 4,
  },
  finalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    marginTop: 8,
    borderTopWidth: 1,
    paddingHorizontal: 4,
  },
  finalLabel: {
    fontSize: 18,
    fontWeight: '800',
  },
  finalValue: {
    fontSize: 26,
    fontWeight: '800',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxWidth: 560,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  sendBtn: {
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  sendBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingHorizontal: 16,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  pickerList: {
    maxHeight: 360,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pickerRowText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    paddingRight: 12,
  },
  modalClose: {
    alignItems: 'center',
    paddingVertical: 16,
  },
});
