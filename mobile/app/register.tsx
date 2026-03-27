import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
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

import { FormInput } from '@/components/ui/form-input';
import { PrimaryButton } from '@/components/ui/primary-button';
import { useToast } from '@/components/providers/toast-provider';
import { register as registerRequest, verifyRegistrationOtp } from '@/lib/api';
import { useColorScheme } from '@/hooks/use-color-scheme';

const palette = {
  light: {
    background: '#ffffff',
    surface: '#fbfbf8',
    surfaceBorder: '#ece9e2',
    text: '#1a1a1a',
    textMuted: '#6f6b63',
    label: '#0d233a',
    primary: '#FF8C00',
    primaryShadow: 'rgba(255, 140, 0, 0.18)',
    accent: '#38c172',
    countryCodeBg: '#f3f0e8',
    iconBg: '#f7f7f7',
    overlay: 'rgba(255, 140, 0, 0.06)',
  },
  dark: {
    background: '#081521',
    surface: 'rgba(16, 38, 61, 0.92)',
    surfaceBorder: 'rgba(255, 255, 255, 0.08)',
    text: '#ffffff',
    textMuted: 'rgba(255, 255, 255, 0.72)',
    label: 'rgba(255, 255, 255, 0.86)',
    primary: '#FF8C00',
    primaryShadow: 'rgba(255, 140, 0, 0.22)',
    accent: '#2ecc71',
    countryCodeBg: '#17314d',
    iconBg: '#17314d',
    overlay: 'rgba(255, 140, 0, 0.10)',
  },
} as const;

const heroImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCjTNbUm0uQuRUWhOAWWy3otS48SqGjcfS2382sflPw5LvCs-fLj58yLVmvetZwzsIAi6I-Yr4VeXzSD-a37gUnfoVYbScgRQjVyrBdoBlb7wu2O-E2ydXiI6axauUu7QHAK7a6bgmRVpI4KNAaFOzLTuuFjvUm5AfBkjS6xn55sTGkpdGVo2gsaouYXMsJmtqN4B698_58bd3WyOYoDolqIyoWrDu8h7QRTyl3g_eukOjIkYFkpYb9rSuQdfyph8izrUK-yBLBjARr';

export default function RegisterScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const colors = colorScheme === 'dark' ? palette.dark : palette.light;
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otp, setOtp] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [hasRequestedOtp, setHasRequestedOtp] = useState(false);
  const [error, setError] = useState('');

  async function handleRegister() {
    setError('');

    if (!fullName.trim()) {
      const message = 'Full name is required';
      setError(message);
      showToast({
        type: 'error',
        title: 'Registration failed',
        message,
      });
      return;
    }

    if (!email.trim().includes('@')) {
      const message = 'Enter a valid email address';
      setError(message);
      showToast({
        type: 'error',
        title: 'Registration failed',
        message,
      });
      return;
    }

    if (phone.replace(/[^\d]/g, '').length < 10) {
      const message = 'Enter a valid mobile number';
      setError(message);
      showToast({
        type: 'error',
        title: 'Registration failed',
        message,
      });
      return;
    }

    if (password.length < 6) {
      const message = 'Password must be at least 6 characters';
      setError(message);
      showToast({
        type: 'error',
        title: 'Registration failed',
        message,
      });
      return;
    }

    if (password !== confirmPassword) {
      const message = 'Passwords do not match';
      setError(message);
      showToast({
        type: 'error',
        title: 'Registration failed',
        message,
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await registerRequest({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.replace(/[^\d]/g, '').slice(0, 10),
        password,
      });

      setPendingEmail(response.email);
      setHasRequestedOtp(true);

      showToast({
        type: 'success',
        title: 'OTP sent',
        message: 'Check your email for the verification OTP to finish creating your account.',
      });
    } catch (registerError) {
      const message = registerError instanceof Error ? registerError.message : 'Registration failed';
      setError(message);
      showToast({
        type: 'error',
        title: 'Registration failed',
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyOtp() {
    setError('');

    if (otp.trim().length !== 6) {
      const message = 'Enter the 6-digit OTP sent to your email';
      setError(message);
      showToast({
        type: 'error',
        title: 'Verification failed',
        message,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await verifyRegistrationOtp({
        email: pendingEmail || email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      showToast({
        type: 'success',
        title: 'Account created',
        message: 'Your email has been verified. Please sign in to continue.',
      });
      router.replace('/login');
    } catch (verifyError) {
      const message = verifyError instanceof Error ? verifyError.message : 'Verification failed';
      setError(message);
      showToast({
        type: 'error',
        title: 'Verification failed',
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.select({ ios: 'padding', android: 'height' })}
        keyboardVerticalOffset={insets.top}>
        <ScrollView
          bounces={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 20) + 28 },
          ]}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={[styles.screenCard, { backgroundColor: colors.background }]}>
            <View
              style={[
                styles.decorCircle,
                { backgroundColor: colors.overlay, borderColor: `${colors.accent}25` },
              ]}
            />

            <View style={styles.heroContainer}>
              <View style={[styles.heroGlow, { backgroundColor: colors.overlay }]} />
              <Image source={{ uri: heroImage }} contentFit="cover" transition={200} style={styles.heroImage} />
              <View
                pointerEvents="none"
                style={[
                  styles.heroFade,
                  {
                    backgroundColor:
                      colorScheme === 'dark' ? 'rgba(15, 23, 16, 0.62)' : 'rgba(255, 255, 255, 0.2)',
                  },
                ]}
              />
            </View>

            <View
              style={[
                styles.content,
                {
                  backgroundColor: colorScheme === 'dark' ? 'rgba(8, 21, 33, 0.96)' : 'rgba(255, 255, 255, 0.96)',
                  borderColor: colors.surfaceBorder,
                },
              ]}>
              <View style={styles.titleBlock}>
                <View style={styles.badgeRow}>
                  <View style={[styles.badgeLine, { backgroundColor: colors.accent }]} />
                  <Text style={[styles.badgeText, { color: colors.primary }]}>Get Started</Text>
                </View>

                <Text style={[styles.title, { color: colors.text }]}>Create your solar account</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                  Register to explore products, track orders, and manage your solar journey.
                </Text>
              </View>

              <View style={styles.form}>
                <FormInput
                  colors={{
                    background: colors.surface,
                    border: colors.surfaceBorder,
                    label: colors.label,
                    text: colors.text,
                    mutedText: colors.textMuted,
                  }}
                  label="Full Name"
                  onChangeText={setFullName}
                  placeholder="Write your full name"
                  selectionColor={colors.primary}
                  value={fullName}
                />

                <FormInput
                  colors={{
                    background: colors.surface,
                    border: colors.surfaceBorder,
                    label: colors.label,
                    text: colors.text,
                    mutedText: colors.textMuted,
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  label="Email"
                  onChangeText={setEmail}
                  placeholder="Write your email"
                  selectionColor={colors.primary}
                  value={email}
                />

                <FormInput
                  colors={{
                    background: colors.surface,
                    border: colors.surfaceBorder,
                    label: colors.label,
                    text: colors.text,
                    mutedText: colors.textMuted,
                    prefixBackground: colors.countryCodeBg,
                  }}
                  keyboardType="number-pad"
                  label="Mobile Number"
                  maxLength={10}
                  onChangeText={setPhone}
                  placeholder="Enter your mobile number"
                  selectionColor={colors.primary}
                  value={phone.replace(/[^\d]/g, '').slice(0, 10)}
                  leftAddon={<Text style={[styles.countryCodeText, { color: colors.textMuted }]}>+91</Text>}
                />

                <FormInput
                  colors={{
                    background: colors.surface,
                    border: colors.surfaceBorder,
                    label: colors.label,
                    text: colors.text,
                    mutedText: colors.textMuted,
                    primary: colors.primary,
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  label="Password"
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  spellCheck={false}
                  secureTextEntry={!isPasswordVisible}
                  selectionColor={colors.primary}
                  textContentType="newPassword"
                  value={password}
                  autoComplete="new-password"
                  leftIcon={<MaterialIcons name="lock-outline" size={20} color={colors.textMuted} />}
                  rightAction={
                    <Pressable onPress={() => setIsPasswordVisible((current) => !current)}>
                      <Ionicons
                        name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={colors.textMuted}
                      />
                    </Pressable>
                  }
                />

                <FormInput
                  colors={{
                    background: colors.surface,
                    border: colors.surfaceBorder,
                    label: colors.label,
                    text: colors.text,
                    mutedText: colors.textMuted,
                    primary: colors.primary,
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  label="Confirm Password"
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  spellCheck={false}
                  secureTextEntry={!isConfirmVisible}
                  selectionColor={colors.primary}
                  textContentType="newPassword"
                  value={confirmPassword}
                  autoComplete="new-password"
                  leftIcon={<MaterialIcons name="lock-outline" size={20} color={colors.textMuted} />}
                  rightAction={
                    <Pressable onPress={() => setIsConfirmVisible((current) => !current)}>
                      <Ionicons
                        name={isConfirmVisible ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={colors.textMuted}
                      />
                    </Pressable>
                  }
                />

                {hasRequestedOtp ? (
                  <FormInput
                    colors={{
                      background: colors.surface,
                      border: colors.surfaceBorder,
                      label: colors.label,
                      text: colors.text,
                      mutedText: colors.textMuted,
                    }}
                    keyboardType="number-pad"
                    label="Email OTP"
                    maxLength={6}
                    onChangeText={setOtp}
                    placeholder="Enter the 6-digit OTP"
                    selectionColor={colors.primary}
                    value={otp.replace(/[^\d]/g, '').slice(0, 6)}
                  />
                ) : null}

                {error ? <Text style={[styles.messageText, { color: '#dc2626' }]}>{error}</Text> : null}
                {hasRequestedOtp ? (
                  <Text style={[styles.messageText, { color: colors.textMuted }]}>
                    OTP sent to {pendingEmail || email.trim().toLowerCase()}. Enter it below to verify your email.
                  </Text>
                ) : null}
                <PrimaryButton
                  backgroundColor={colors.primary}
                  shadowColor={colors.primaryShadow}
                  title={
                    isSubmitting
                      ? 'Sending OTP...'
                      : hasRequestedOtp
                        ? 'Resend OTP'
                        : 'Send Verification OTP'
                  }
                  trailingIcon={
                    isSubmitting ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <MaterialIcons name="arrow-forward" size={22} color="#ffffff" />
                    )
                  }
                  disabled={isSubmitting}
                  onPress={handleRegister}
                />
                {hasRequestedOtp ? (
                  <PrimaryButton
                    backgroundColor={colors.accent}
                    shadowColor="rgba(56, 193, 114, 0.22)"
                    title={isSubmitting ? 'Verifying OTP...' : 'Verify Email & Create Account'}
                    trailingIcon={
                      isSubmitting ? (
                        <ActivityIndicator color="#ffffff" />
                      ) : (
                        <MaterialIcons name="verified-user" size={22} color="#ffffff" />
                      )
                    }
                    disabled={isSubmitting}
                    onPress={handleVerifyOtp}
                  />
                ) : null}
              </View>

              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: colors.textMuted }]}>
                  Already have an account?{' '}
                  <Text style={[styles.footerLink, { color: colors.primary }]} onPress={() => router.replace('/login')}>
                    Sign in
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  keyboardContainer: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  screenCard: {
    minHeight: '100%',
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    top: -24,
    right: -40,
    width: 168,
    height: 168,
    borderBottomLeftRadius: 96,
    borderWidth: 1,
  },
  heroContainer: {
    height: 232,
    overflow: 'hidden',
    position: 'relative',
  },
  heroGlow: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    opacity: 0.92,
  },
  heroFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -6,
    height: 88,
  },
  content: {
    marginTop: -24,
    marginHorizontal: 18,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 18,
    borderRadius: 28,
    borderWidth: 1,
    zIndex: 2,
  },
  titleBlock: {
    marginBottom: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  badgeLine: {
    width: 24,
    height: 3,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    lineHeight: 33,
    fontWeight: '800',
    letterSpacing: -0.9,
  },
  subtitle: {
    marginTop: 10,
    maxWidth: 290,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '400',
  },
  form: {
    gap: 16,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: -2,
  },
  footer: {
    marginTop: 28,
    paddingTop: 8,
    alignItems: 'center',
    paddingBottom: 8,
  },
  footerText: {
    maxWidth: 300,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
  },
  footerLink: {
    fontWeight: '700',
  },
});
