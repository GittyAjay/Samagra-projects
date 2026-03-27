import { MaterialIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/components/providers/session-provider';
import { AppScreenHeader } from '@/components/ui/app-screen-header';
import { ListSkeleton } from '@/components/ui/page-skeletons';
import { PrimaryButton } from '@/components/ui/primary-button';
import { PromptDialog } from '@/components/ui/prompt-dialog';
import { fetchAllLeads } from '@/lib/api';
import { useSolarTheme } from '@/constants/solar-theme';
import type { ApiLead } from '@/types/api';

function leadStatusLabel(status: ApiLead['status']) {
  return status.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function AdminHubScreen() {
  const router = useRouter();
  const colors = useSolarTheme();
  const { logout } = useSession();
  const [leads, setLeads] = useState<ApiLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLogoutPromptVisible, setIsLogoutPromptVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadLeads() {
      try {
        setError('');
        setIsLoading(true);
        const response = await fetchAllLeads();

        if (isMounted) {
          setLeads(response);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load leads');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadLeads();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <AppScreenHeader title="Admin Hub" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <ListSkeleton cards={2} showBanner />
        ) : (
          <>
            {error ? (
              <View style={[styles.errorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.errorText, { color: '#dc2626' }]}>{error}</Text>
              </View>
            ) : null}

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Team & tasks</Text>
            <Pressable
              onPress={() => router.push('/admin/staff-new')}
              style={[styles.teamCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.teamIcon, { backgroundColor: colors.primarySoft }]}>
                <MaterialIcons name="person-add-alt-1" size={22} color={colors.primary} />
              </View>
              <View style={styles.teamCopy}>
                <Text style={[styles.teamTitle, { color: colors.text }]}>Add team member</Text>
                <Text style={[styles.teamDesc, { color: colors.muted }]}>
                  Create staff logins with job titles (stored as metadata). Role is always staff.
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={colors.subtle} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/admin/assignments')}
              style={[styles.teamCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.teamIcon, { backgroundColor: colors.primarySoft }]}>
                <MaterialIcons name="assignment-ind" size={22} color={colors.primary} />
              </View>
              <View style={styles.teamCopy}>
                <Text style={[styles.teamTitle, { color: colors.text }]}>Assign leads & orders</Text>
                <Text style={[styles.teamDesc, { color: colors.muted }]}>
                  Workload view, task tags, manual pick, or one-tap auto-assign by task type and load.
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={colors.subtle} />
            </Pressable>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Leads</Text>
            <View style={styles.leadsWrap}>
              {leads.map((lead) => (
                <View
                  key={lead.id}
                  style={[styles.leadCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={[styles.leadIcon, { backgroundColor: colors.primarySoft }]}>
                    <MaterialIcons name="person-search" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.leadCopy}>
                    <Text style={[styles.leadId, { color: colors.primary }]}>{lead.id}</Text>
                    <Text style={[styles.leadStatus, { color: colors.text }]}>{leadStatusLabel(lead.status)}</Text>
                    <Text style={[styles.leadMeta, { color: colors.muted }]} numberOfLines={2}>
                      {lead.address} · {lead.requiredLoadKw} kW
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <Link href="/needs" asChild>
              <Pressable style={[styles.libraryCard, { backgroundColor: colors.darkPanel }]}>
                <Text style={[styles.libraryEyebrow, { color: colors.primary }]}>Design library</Text>
                <Text style={[styles.libraryTitle, { color: colors.darkPanelText }]}>
                  Proposal screen kit
                </Text>
                <Text style={[styles.libraryCopy, { color: colors.darkPanelMuted }]}>
                  Preview admin, staff, and client spec screens in one place.
                </Text>
              </Pressable>
            </Link>

            <PrimaryButton
              backgroundColor={colors.primary}
              shadowColor={colors.shadow}
              title="Log out"
              onPress={() => setIsLogoutPromptVisible(true)}
            />
          </>
        )}
      </ScrollView>

      <PromptDialog
        cancelLabel="Stay Logged In"
        confirmLabel="Logout"
        message="You will need to sign in again to access admin tasks, assignments, and leads."
        onCancel={() => setIsLogoutPromptVisible(false)}
        onConfirm={() => {
          setIsLogoutPromptVisible(false);
          logout();
          router.replace('/login');
        }}
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
    paddingTop: 20,
    paddingBottom: 120,
    gap: 4,
  },
  errorCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
    marginTop: 8,
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  teamIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamCopy: {
    flex: 1,
    minWidth: 0,
  },
  teamTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  teamDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  leadsWrap: {
    gap: 10,
    marginBottom: 20,
  },
  leadCard: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  leadIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leadCopy: {
    flex: 1,
    minWidth: 0,
  },
  leadId: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  leadStatus: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  leadMeta: {
    fontSize: 12,
    lineHeight: 17,
  },
  libraryCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  libraryEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  libraryTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  libraryCopy: {
    fontSize: 13,
    lineHeight: 19,
  },
});
