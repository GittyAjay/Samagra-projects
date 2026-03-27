import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/components/providers/session-provider';
import { AppScreenHeader } from '@/components/ui/app-screen-header';
import { ListSkeleton } from '@/components/ui/page-skeletons';
import { useSolarTheme } from '@/constants/solar-theme';
import { fetchStaffDashboard } from '@/lib/api';
import { getStaffExperience } from '@/lib/user-routing';
import type { StaffDashboardResponse } from '@/types/api';

export default function StaffOverviewScreen() {
  const router = useRouter();
  const colors = useSolarTheme();
  const { user } = useSession();
  const [dashboard, setDashboard] = useState<StaffDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      return;
    }

    void (async () => {
      try {
        setError('');
        setIsLoading(true);
        setDashboard(await fetchStaffDashboard(user.id));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load overview');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user]);

  const experience = user ? getStaffExperience(user) : 'general';
  const firstName = user?.fullName.split(' ')[0] ?? 'Team';

  const workspaceLabel = useMemo(() => {
    if (experience === 'sales') {
      return 'Sales workspace';
    }
    if (experience === 'survey') {
      return 'Survey workspace';
    }
    if (experience === 'installation') {
      return 'Installation workspace';
    }
    return 'Staff workspace';
  }, [experience]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <AppScreenHeader
        title={`Welcome back, ${firstName}`}
        subtitle={workspaceLabel}
        borderless
        actions={[
          {
            icon: 'notifications-outline',
            label: 'Notifications',
            onPress: () => router.push('/notifications'),
          },
          {
            icon: 'person-circle-outline',
            label: 'Profile',
            onPress: () => router.push('/profile'),
          },
        ]}
      />
      {isLoading ? (
        <ListSkeleton />
      ) : error ? (
        <View style={styles.centerState}>
          <Text style={[styles.title, { color: colors.text }]}>Could not load overview</Text>
          <Text style={[styles.copy, { color: colors.muted }]}>{error}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.metricLabel, { color: colors.subtle }]}>New leads</Text>
              <Text style={[styles.metricValue, { color: colors.text }]}>{dashboard?.newLeads ?? 0}</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.metricLabel, { color: colors.subtle }]}>Callbacks</Text>
              <Text style={[styles.metricValue, { color: colors.text }]}>{dashboard?.pendingCallbacks ?? 0}</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.metricLabel, { color: colors.subtle }]}>Survey queue</Text>
              <Text style={[styles.metricValue, { color: colors.text }]}>{dashboard?.surveyQueue ?? 0}</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.metricLabel, { color: colors.subtle }]}>Open orders</Text>
              <Text style={[styles.metricValue, { color: colors.text }]}>{dashboard?.ordersInProgress ?? 0}</Text>
            </View>
          </View>

          <View style={styles.quickRow}>
            <Pressable
              onPress={() => router.push('/staff/leads')}
              style={[styles.quickCard, { backgroundColor: colors.primarySoft, borderColor: colors.border }]}>
              <Text style={[styles.quickTitle, { color: colors.primary }]}>Open leads tab</Text>
              <Text style={[styles.quickCopy, { color: colors.text }]}>Assigned leads and follow-up</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/staff/orders')}
              style={[styles.quickCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.quickTitle, { color: colors.text }]}>Open workboard tab</Text>
              <Text style={[styles.quickCopy, { color: colors.muted }]}>Orders, surveys, and installs</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120,
    gap: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metricCard: {
    width: '47%',
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 10,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 16,
  },
  quickCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
  },
  quickTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  quickCopy: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  copy: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
  },
});
