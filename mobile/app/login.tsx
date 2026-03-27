import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
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
import { useColorScheme } from '@/hooks/use-color-scheme';
import { requestPasswordReset, verifyPasswordReset } from '@/lib/api';
import { getHomeRouteForUser } from '@/lib/user-routing';

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
    terms: '#0d233a',
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
    terms: '#ffffff',
  },
} as const;

const heroImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCjTNbUm0uQuRUWhOAWWy3otS48SqGjcfS2382sflPw5LvCs-fLj58yLVmvetZwzsIAi6I-Yr4VeXzSD-a37gUnfoVYbScgRQjVyrBdoBlb7wu2O-E2ydXiI6axauUu7QHAK7a6bgmRVpI4KNAaFOzLTuuFjvUm5AfBkjS6xn55sTGkpdGVo2gsaouYXMsJmtqN4B698_58bd3WyOYoDolqIyoWrDu8h7QRTyl3g_eukOjIkYFkpYb9rSuQdfyph8izrUK-yBLBjARr';

export default function LoginScreen() {
  const router = useRouter();
  const { isLoading, login } = useSession();
  const { showToast } = useToast();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const colors = colorScheme === 'dark' ? palette.dark : palette.light;
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [isResetPasswordVisible, setIsResetPasswordVisible] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetHint, setResetHint] = useState('');
  const [isRequestingReset, setIsRequestingReset] = useState(false);
  const [isVerifyingReset, setIsVerifyingReset] = useState(false);
  const [hasRequestedReset, setHasRequestedReset] = useState(false);

  const displayIdentifier = useMemo(() => {
    const hasEmailPattern = identifier.includes('@') || /[a-zA-Z]/.test(identifier);

    if (hasEmailPattern) {
      return identifier;
    }

    return identifier.replace(/[^\d]/g, '').slice(0, 10);
  }, [identifier]);

  const displayResetIdentifier = useMemo(() => {
    const hasEmailPattern = resetIdentifier.includes('@') || /[a-zA-Z]/.test(resetIdentifier);

    if (hasEmailPattern) {
      return resetIdentifier;
    }

    return resetIdentifier.replace(/[^\d]/g, '').slice(0, 15);
  }, [resetIdentifier]);

  function normalizeIdentifierInput(value: string) {
    const trimmed = value.trim();
    return trimmed.includes('@') || /[a-zA-Z]/.test(trimmed)
      ? trimmed.toLowerCase()
      : trimmed.replace(/[^\d]/g, '').slice(0, 15);
  }

  async function handleLogin() {
    setError('');

    try {
      const submittedIdentifier =
        displayIdentifier.includes('@')
          ? displayIdentifier.trim().toLowerCase()
          : displayIdentifier.replace(/[^\d]/g, '').slice(0, 10);

      const user = await login(submittedIdentifier, password);

      showToast({
        type: 'success',
        title: 'Login successful',
        message: `Welcome back, ${user.fullName.split(' ')[0]}.`,
      });

      router.replace(getHomeRouteForUser(user));
    } catch (loginError) {
      const message = loginError instanceof Error ? loginError.message : 'Login failed';
      setError(message);
      showToast({
        type: 'error',
        title: 'Unable to sign in',
        message,
      });
    }
  }

  async function handleRequestReset() {
    setResetError('');
    setResetHint('');
    setIsRequestingReset(true);

    try {
      const identifierToSubmit = normalizeIdentifierInput(displayResetIdentifier);
      const response = await requestPasswordReset({ identifier: identifierToSubmit });

      setResetIdentifier(response.identifier);
      setResetHint('Check your registered email for the 6-digit OTP. It is valid for 5 minutes.');
      setHasRequestedReset(true);
      showToast({
        type: 'success',
        title: 'OTP sent',
        message: 'Check your registered email and enter the OTP to reset your password.',
      });
    } catch (resetRequestError) {
      const message =
        resetRequestError instanceof Error ? resetRequestError.message : 'Unable to request password reset';
      setResetError(message);
      showToast({
        type: 'error',
        title: 'Reset request failed',
        message,
      });
    } finally {
      setIsRequestingReset(false);
    }
  }

  async function handleVerifyReset() {
    setResetError('');
    setIsVerifyingReset(true);

    try {
      await verifyPasswordReset({
        identifier: normalizeIdentifierInput(displayResetIdentifier),
        otp: resetOtp.trim(),
        newPassword: resetPassword,
      });

      setPassword(resetPassword);
      setIdentifier(normalizeIdentifierInput(displayResetIdentifier));
      setResetOtp('');
      setResetPassword('');
      setResetHint('');
      setHasRequestedReset(false);
      setIsResetMode(false);

      showToast({
        type: 'success',
        title: 'Password reset',
        message: 'Your password has been updated. Sign in with the new password.',
      });
    } catch (resetVerifyError) {
      const message =
        resetVerifyError instanceof Error ? resetVerifyError.message : 'Unable to reset password';
      setResetError(message);
      showToast({
        type: 'error',
        title: 'Reset failed',
        message,
      });
    } finally {
      setIsVerifyingReset(false);
    }
  }

  function enterResetMode() {
    setIsResetMode(true);
    setResetError('');
    setResetHint('');
    setHasRequestedReset(false);
    setResetIdentifier(displayIdentifier || identifier);
  }

  function exitResetMode() {
    setIsResetMode(false);
    setResetError('');
    setResetHint('');
    setResetOtp('');
    setResetPassword('');
    setHasRequestedReset(false);
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
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
              <Image
                source={{ uri: heroImage }}
                contentFit="cover"
                transition={200}
                style={styles.heroImage}
              />
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
                  <Text style={[styles.badgeText, { color: colors.primary }]}>Future Ready</Text>
                </View>

                <Text style={[styles.title, { color: colors.text }]}>Switch to Solar</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                  Powering India with clean, sustainable energy.
                </Text>
              </View>

              <View style={styles.form}>
                {isResetMode ? (
                  <>
                    <FormInput
                      colors={{
                        background: colors.surface,
                        border: colors.surfaceBorder,
                        label: colors.label,
                        text: colors.text,
                        mutedText: colors.textMuted,
                        primary: colors.primary,
                      }}
                      inputStyle={styles.mobileInput}
                      autoCapitalize="none"
                      keyboardType={displayResetIdentifier.includes('@') ? 'email-address' : 'default'}
                      label="Email or Mobile"
                      maxLength={100}
                      onChangeText={setResetIdentifier}
                      placeholder="Enter your email or mobile number"
                      selectionColor={colors.primary}
                      value={displayResetIdentifier}
                      leftIcon={<MaterialIcons name="person-outline" size={20} color={colors.textMuted} />}
                    />

                    <PrimaryButton
                      backgroundColor={colors.primary}
                      shadowColor={colors.primaryShadow}
                      title={isRequestingReset ? 'Sending OTP...' : 'Send Reset OTP'}
                      trailingIcon={isRequestingReset ? <ActivityIndicator color="#ffffff" /> : undefined}
                      onPress={handleRequestReset}
                    />

                    {resetHint ? <Text style={[styles.helperText, { color: colors.primary }]}>{resetHint}</Text> : null}
                    {resetError ? <Text style={[styles.errorText, { color: '#dc2626' }]}>{resetError}</Text> : null}

                    {hasRequestedReset ? (
                      <>
                        <FormInput
                          colors={{
                            background: colors.surface,
                            border: colors.surfaceBorder,
                            label: colors.label,
                            text: colors.text,
                            mutedText: colors.textMuted,
                          }}
                          autoCapitalize="none"
                          keyboardType="number-pad"
                          label="OTP"
                          maxLength={6}
                          onChangeText={setResetOtp}
                          placeholder="Enter OTP"
                          selectionColor={colors.primary}
                          value={resetOtp}
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
                          inputStyle={styles.passwordInput}
                          label="New Password"
                          onChangeText={setResetPassword}
                          placeholder="Enter your new password"
                          spellCheck={false}
                          secureTextEntry={!isResetPasswordVisible}
                          selectionColor={colors.primary}
                          textContentType="newPassword"
                          value={resetPassword}
                          autoComplete="password-new"
                          leftIcon={<MaterialIcons name="lock-outline" size={20} color={colors.textMuted} />}
                          rightAction={
                            <Pressable
                              accessibilityLabel={isResetPasswordVisible ? 'Hide new password' : 'Show new password'}
                              accessibilityRole="button"
                              hitSlop={10}
                              onPress={() => setIsResetPasswordVisible((current) => !current)}>
                              <Ionicons
                                name={isResetPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                                size={20}
                                color={colors.textMuted}
                              />
                            </Pressable>
                          }
                        />

                        <PrimaryButton
                          backgroundColor={colors.primary}
                          shadowColor={colors.primaryShadow}
                          title={isVerifyingReset ? 'Resetting Password...' : 'Reset Password'}
                          trailingIcon={isVerifyingReset ? <ActivityIndicator color="#ffffff" /> : undefined}
                          onPress={handleVerifyReset}
                        />
                      </>
                    ) : null}

                    <Pressable accessibilityRole="button" onPress={exitResetMode}>
                      <Text style={[styles.secondaryLink, { color: colors.textMuted }]}>Back to login</Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    <FormInput
                      colors={{
                        background: colors.surface,
                        border: colors.surfaceBorder,
                        label: colors.label,
                        text: colors.text,
                        mutedText: colors.textMuted,
                        prefixBackground: colors.countryCodeBg,
                      }}
                      inputStyle={styles.mobileInput}
                      autoCapitalize="none"
                      keyboardType={displayIdentifier.includes('@') ? 'email-address' : 'default'}
                      label="Email or Mobile"
                      maxLength={100}
                      onChangeText={setIdentifier}
                      placeholder="Enter your email or mobile number"
                      selectionColor={colors.primary}
                      value={displayIdentifier}
                      leftAddon={
                        <Text style={[styles.countryCodeText, { color: colors.textMuted }]}>
                          {displayIdentifier.includes('@') ? '@' : '+91'}
                        </Text>
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
                      inputStyle={styles.passwordInput}
                      label="Password"
                      onChangeText={setPassword}
                      placeholder="••••••••"
                      rightLabel="Forgot?"
                      onRightLabelPress={enterResetMode}
                      spellCheck={false}
                      secureTextEntry={!isPasswordVisible}
                      selectionColor={colors.primary}
                      textContentType="password"
                      value={password}
                      autoComplete="password"
                      leftIcon={<MaterialIcons name="lock-outline" size={20} color={colors.textMuted} />}
                      rightAction={
                        <Pressable
                          accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
                          accessibilityRole="button"
                          hitSlop={10}
                          onPress={() => setIsPasswordVisible((current) => !current)}>
                          <Ionicons
                            name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={colors.textMuted}
                          />
                        </Pressable>
                      }
                    />

                    {error ? <Text style={[styles.errorText, { color: '#dc2626' }]}>{error}</Text> : null}

                    <PrimaryButton
                      backgroundColor={colors.primary}
                      shadowColor={colors.primaryShadow}
                      title={isLoading ? 'Signing In...' : 'Login to Account'}
                      trailingIcon={
                        isLoading ? (
                          <ActivityIndicator color="#ffffff" />
                        ) : (
                          <MaterialIcons name="arrow-forward" size={22} color="#ffffff" />
                        )
                      }
                      onPress={handleLogin}
                    />
                  </>
                )}
              </View>

              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: colors.textMuted }]}>
                  New here?{' '}
                  <Text style={[styles.footerLink, { color: colors.primary }]} onPress={() => router.push('/register')}>
                    Create account
                  </Text>
                </Text>
                <Text style={[styles.footerText, { color: colors.textMuted }]}>
                  By continuing, you agree to our{' '}
                  <Text style={[styles.footerLink, { color: colors.terms }]}>Terms</Text> &{' '}
                  <Text style={[styles.footerLink, { color: colors.terms }]}>Privacy</Text>
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
  safeArea: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
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
    height: 244,
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
    marginTop: -26,
    marginHorizontal: 18,
    paddingHorizontal: 24,
    paddingTop: 26,
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
    maxWidth: 280,
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
  mobileInput: {
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  passwordInput: {
    fontSize: 15,
    fontWeight: '400',
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: -2,
  },
  helperText: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: -4,
    lineHeight: 18,
  },
  secondaryLink: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
    marginTop: -4,
  },
  footer: {
    marginTop: 28,
    paddingTop: 8,
    alignItems: 'center',
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
