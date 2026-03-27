import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/components/providers/session-provider';
import { useToast } from '@/components/providers/toast-provider';
import { AppScreenHeader } from '@/components/ui/app-screen-header';
import { ListSkeleton } from '@/components/ui/page-skeletons';
import { useSolarTheme } from '@/constants/solar-theme';
import { fetchLeads } from '@/lib/api';
import { getStaffExperience } from '@/lib/user-routing';
import type { ApiLead, LeadStatus } from '@/types/api';

type FilterTab = 'all' | 'new' | 'callback' | 'survey_scheduled';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All leads' },
  { key: 'new', label: 'New' },
  { key: 'callback', label: 'Callbacks' },
  { key: 'survey_scheduled', label: 'Survey scheduled' },
];

function formatReceived(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function shortLocation(address: string) {
  const parts = address.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[parts.length - 2]}, ${parts[parts.length - 1]}`;
  }
  return address.length > 42 ? `${address.slice(0, 40)}...` : address;
}

function leadBadge(
  status: LeadStatus,
  colors: ReturnType<typeof useSolarTheme>
): { label: string; backgroundColor: string; color: string } {
  switch (status) {
    case 'new':
      return {
        label: 'New',
        backgroundColor: colors.primarySoft,
        color: colors.primary,
      };
    case 'contacted':
      return {
        label: 'Callback',
        backgroundColor: colors.surfaceMuted,
        color: colors.text,
      };
    case 'survey_scheduled':
      return {
        label: 'Survey Scheduled',
        backgroundColor: 'rgba(59, 130, 246, 0.12)',
        color: '#2563eb',
      };
    case 'survey_completed':
    case 'quotation_sent':
      return {
        label: 'Action Required',
        backgroundColor: 'rgba(245, 158, 11, 0.16)',
        color: '#d97706',
      };
    case 'won':
      return {
        label: 'Won',
        backgroundColor: colors.successBg,
        color: colors.successText,
      };
    case 'lost':
      return {
        label: 'Lost',
        backgroundColor: colors.neutralBg,
        color: colors.neutralText,
      };
    default:
      return {
        label: status,
        backgroundColor: colors.surfaceMuted,
        color: colors.text,
      };
  }
}

function matchesFilter(lead: ApiLead, filter: FilterTab) {
  if (filter === 'all') {
    return true;
  }

  if (filter === 'new') {
    return lead.status === 'new';
  }

  if (filter === 'callback') {
    return lead.status === 'contacted';
  }

  return lead.status === 'survey_scheduled';
}

export default function StaffLeadsScreen() {
  const router = useRouter();
  const colors = useSolarTheme();
  const { user } = useSession();
  const { showToast } = useToast();
  const [leads, setLeads] = useState<ApiLead[]>([]);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      setError('');
      setIsLoading(true);
      const response = await fetchLeads({ staffId: user.id });
      setLeads(response);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load assigned leads');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const experience = user ? getStaffExperience(user) : 'general';

  const filteredLeads = useMemo(() => {
    let list = leads.filter((lead) => matchesFilter(lead, filterTab));
    const q = search.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, '');

    if (q) {
      list = list.filter((lead) => {
        const address = lead.address.toLowerCase();
        const phone = lead.phone.replace(/\s/g, '').toLowerCase();
        const id = lead.id.toLowerCase();

        return (
          address.includes(q) ||
          id.includes(q) ||
          (qDigits.length > 0 && phone.includes(qDigits))
        );
      });
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [filterTab, leads, search]);

  const headline =
    experience === 'sales'
      ? 'Your sales leads'
      : experience === 'survey'
        ? 'Assigned survey queue'
        : 'Assigned team leads';

  async function openDeviceUrl(url: string, failureTitle: string) {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        showToast({
          type: 'error',
          title: failureTitle,
          message: 'This action is not available on the current device.',
        });
        return;
      }

      await Linking.openURL(url);
    } catch {
      showToast({
        type: 'error',
        title: failureTitle,
        message: 'This action is not available on the current device.',
      });
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <View
        style={[
          styles.headerTop,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}>
        <AppScreenHeader
          title={headline}
          subtitle={experience === 'sales' ? 'Staff workspace' : 'Team workspace'}
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

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.subtle }]}>Assigned</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{leads.length}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.subtle }]}>Need action</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {leads.filter((lead) => ['new', 'contacted', 'survey_completed', 'quotation_sent'].includes(lead.status)).length}
            </Text>
          </View>
        </View>

        <View style={styles.searchWrap}>
          <MaterialIcons name="search" size={20} color={colors.subtle} style={styles.searchIcon} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by area, phone, or lead ID"
            placeholderTextColor={colors.subtle}
            style={[
              styles.searchInput,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTER_TABS.map((tab) => {
            const active = tab.key === filterTab;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setFilterTab(tab.key)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}>
                <Text style={[styles.filterChipText, { color: active ? '#ffffff' : colors.text }]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <ListSkeleton />
      ) : error ? (
        <View style={styles.centerState}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Could not load leads</Text>
          <Text style={[styles.emptyText, { color: colors.muted }]}>{error}</Text>
          <Pressable
            onPress={() => void load()}
            style={[styles.retryButton, { backgroundColor: colors.primary }]}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : filteredLeads.length === 0 ? (
        <View style={styles.centerState}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No assigned leads yet</Text>
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            New leads assigned to this team member will appear here automatically.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {filteredLeads.map((lead) => {
            const badge = leadBadge(lead.status, colors);
            return (
              <Pressable
                key={lead.id}
                onPress={() => router.push(`/staff/lead/${lead.id}`)}
                style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.cardTop}>
                  <View style={styles.cardMeta}>
                    <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                      {shortLocation(lead.address)}
                    </Text>
                    <Text style={[styles.cardSubtitle, { color: colors.muted }]}>
                      Lead {lead.id.slice(-6).toUpperCase()} · {formatReceived(lead.createdAt)}
                    </Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: badge.backgroundColor }]}>
                    <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                  </View>
                </View>

                <View style={styles.statRow}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: colors.subtle }]}>Load</Text>
                    <Text style={[styles.statValue, { color: colors.text }]}>{lead.requiredLoadKw} kW</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: colors.subtle }]}>Bill</Text>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                      Rs. {Math.round(lead.monthlyElectricityBill).toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: colors.subtle }]}>Task</Text>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                      {(lead.taskType ?? 'general').replaceAll('_', ' ')}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <Pressable
                    onPress={() => void openDeviceUrl(`tel:${lead.phone}`, 'Calling unavailable')}
                    style={[styles.actionButton, { backgroundColor: colors.primarySoft }]}>
                    <MaterialIcons name="call" size={18} color={colors.primary} />
                    <Text style={[styles.actionText, { color: colors.primary }]}>Call</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => void openDeviceUrl(`sms:${lead.phone}`, 'Messaging unavailable')}
                    style={[styles.actionButton, { backgroundColor: colors.surfaceMuted }]}>
                    <MaterialIcons name="sms" size={18} color={colors.text} />
                    <Text style={[styles.actionText, { color: colors.text }]}>Message</Text>
                  </Pressable>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  headerTop: {
    borderBottomWidth: 1,
    paddingBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 6,
  },
  searchWrap: {
    marginTop: 16,
    marginHorizontal: 20,
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    top: 15,
    zIndex: 1,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 18,
    paddingLeft: 42,
    paddingRight: 14,
    paddingVertical: 14,
    fontSize: 15,
  },
  filterRow: {
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    padding: 20,
    paddingBottom: 120,
    gap: 14,
  },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 16,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardMeta: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  cardSubtitle: {
    fontSize: 13,
    marginTop: 6,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 10,
  },
  retryButton: {
    marginTop: 18,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
});
