import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '@/components/providers/session-provider';
import { useToast } from '@/components/providers/toast-provider';
import { FormInput } from '@/components/ui/form-input';
import { PrimaryButton } from '@/components/ui/primary-button';
import { createStaffUser } from '@/lib/api';
import { useSolarTheme } from '@/constants/solar-theme';
import { LEAD_TASK_TYPES, type LeadTaskType } from '@/types/api';

const fc = (colors: ReturnType<typeof useSolarTheme>) => ({
  background: colors.surfaceAlt,
  border: colors.border,
  label: colors.text,
  text: colors.text,
  mutedText: colors.muted,
});

export default function AdminAddStaffScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useSolarTheme();
  const inputColors = fc(colors);
  const { showToast } = useToast();
  const { user } = useSession();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [designation, setDesignation] = useState('');
  const [taskTypes, setTaskTypes] = useState<LeadTaskType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  function toggleTaskType(t: LeadTaskType) {
    setTaskTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  async function handleSubmit() {
    setError('');
    const name = fullName.trim();
    const em = email.trim().toLowerCase();
    const ph = phone.replace(/\D/g, '').slice(0, 15);

    if (!name) {
      setError('Full name is required.');
      return;
    }
    if (!em.includes('@')) {
      setError('Enter a valid email.');
      return;
    }
    if (ph.length < 10) {
      setError('Enter a valid phone number (10+ digits).');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!user) {
      setError('You must be signed in as an admin.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createStaffUser(user, {
        fullName: name,
        email: em,
        phone: ph,
        password,
        role: 'staff',
        designation: designation.trim() || undefined,
        taskTypes: taskTypes.length ? taskTypes : undefined,
      });

      showToast({
        type: 'success',
        title: 'Staff account created',
        message: `${name} can sign in with the email and password you set.`,
      });
      router.back();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not create staff';
      setError(message);
      showToast({ type: 'error', title: 'Create failed', message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.select({ ios: 'padding', android: 'height' })}
        keyboardVerticalOffset={insets.top}>
        <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: colors.surfaceAlt }]}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <Text style={[styles.topTitle, { color: colors.text }]}>Add staff</Text>
          <View style={styles.backBtnPlaceholder} />
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}>
          {error ? (
            <View style={[styles.errorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.errorText, { color: '#dc2626' }]}>{error}</Text>
            </View>
          ) : null}

          <FormInput
            colors={inputColors}
            label="Full name"
            placeholder="Aarav Sharma"
            value={fullName}
            onChangeText={setFullName}
            selectionColor={colors.primary}
          />
          <FormInput
            colors={inputColors}
            label="Work email"
            placeholder="sales@solar.local"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            selectionColor={colors.primary}
          />
          <FormInput
            colors={inputColors}
            label="Mobile"
            placeholder="10-digit number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            selectionColor={colors.primary}
          />
          <FormInput
            colors={inputColors}
            label="Job title / role label"
            placeholder="e.g. Sales Executive"
            value={designation}
            onChangeText={setDesignation}
            selectionColor={colors.primary}
          />

          <Text style={[styles.taskSectionLabel, { color: colors.subtle }]}>Task tags (auto-assign)</Text>
          <View style={styles.taskChipWrap}>
            {LEAD_TASK_TYPES.map((t) => {
              const on = taskTypes.includes(t);
              return (
                <Pressable
                  key={t}
                  onPress={() => toggleTaskType(t)}
                  style={[
                    styles.taskChip,
                    {
                      backgroundColor: on ? colors.primarySoft : colors.surfaceAlt,
                      borderColor: on ? colors.primary : colors.border,
                    },
                  ]}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '800',
                      color: on ? colors.primary : colors.muted,
                      textTransform: 'capitalize',
                    }}>
                    {t}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <FormInput
            colors={inputColors}
            label="Temporary password"
            placeholder="They can change this later"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            selectionColor={colors.primary}
          />

          <PrimaryButton
            backgroundColor={colors.primary}
            shadowColor={colors.shadow}
            title={isSubmitting ? 'Creating…' : 'Create staff account'}
            disabled={isSubmitting}
            onPress={() => void handleSubmit()}
            trailingIcon={
              isSubmitting ? <ActivityIndicator color="#fff" size="small" /> : undefined
            }
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnPlaceholder: { width: 40 },
  topTitle: { fontSize: 17, fontWeight: '800' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, gap: 14 },
  errorCard: { borderRadius: 14, borderWidth: 1, padding: 12 },
  errorText: { fontSize: 13, fontWeight: '600' },
  taskSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: -4,
  },
  taskChipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  taskChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
});
