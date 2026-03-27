import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/components/providers/session-provider';
import { useToast } from '@/components/providers/toast-provider';
import { PrimaryButton } from '@/components/ui/primary-button';
import { PromptDialog } from '@/components/ui/prompt-dialog';
import { useSolarTheme } from '@/constants/solar-theme';

const profileImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBSeiiXrv1IfygLvUCBBrGt9pYY62PURMpSlaF1Z5f0ZnLXEVLgdmfDAkOqkSLI_6WFpLWw3hP886vQ2jm27a6CrefII6pFY0SDjJFSp_oxgUdAPjo4uDLEQ3W_Za3hh91P2ijBbxP0jVGeY1Gqk9e-uewLShUIEUVqeKM-b3TAo1HtoA4YkzSRfwq74TZ1pwUy2908EZVHWnBubRuioHdZa1iZrRG9Y709_XG-6Br_g41sJ1rsso_R8bj62zuiZ-XZQ_xzdjMa4_rm';

type DetailRowProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
};

function DetailRow({ icon, label, value }: DetailRowProps) {
  const colors = useSolarTheme();

  return (
    <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.detailIcon, { backgroundColor: colors.primarySoft }]}>
        <MaterialIcons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.detailCopy}>
        <Text style={[styles.detailLabel, { color: colors.subtle }]}>{label}</Text>
        <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useSolarTheme();
  const { effectiveUser, isAuthenticated, logout } = useSession();
  const { showToast } = useToast();
  const [isLogoutPromptVisible, setIsLogoutPromptVisible] = useState(false);

  function handleLogout() {
    setIsLogoutPromptVisible(false);
    logout();
    showToast({
      type: 'success',
      title: 'Logged out',
      message: 'You have been signed out successfully.',
    });
    router.replace('/login');
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Image source={{ uri: profileImage }} contentFit="cover" style={styles.avatar} />
          <Text style={[styles.name, { color: colors.text }]}>{effectiveUser.fullName}</Text>
          <Text style={[styles.rolePill, { color: colors.primary, backgroundColor: colors.primarySoft }]}>
            {effectiveUser.role.toUpperCase()}
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {isAuthenticated ? 'Manage your account, notifications, and session.' : 'Demo account preview'}
          </Text>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Details</Text>
          <DetailRow icon="mail-outline" label="Email" value={effectiveUser.email} />
          <DetailRow icon="call" label="Mobile" value={effectiveUser.phone} />
          <DetailRow icon="badge" label="User ID" value={effectiveUser.id} />
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <PrimaryButton
            backgroundColor={colors.danger}
            shadowColor={colors.dangerSoft}
            title="Logout"
            trailingIcon={<MaterialIcons name="logout" size={20} color="#ffffff" />}
            onPress={() => setIsLogoutPromptVisible(true)}
          />
        </View>
      </ScrollView>

      <PromptDialog
        cancelLabel="Stay Logged In"
        confirmLabel="Logout"
        message="You will need to sign in again to access your dashboard, orders, and profile."
        onCancel={() => setIsLogoutPromptVisible(false)}
        onConfirm={handleLogout}
        title="Logout from Samagra?"
        variant="danger"
        visible={isLogoutPromptVisible}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  rolePill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '600',
    overflow: 'hidden',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  sectionCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailCopy: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
  },
});
