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
import { fetchAllLeads, fetchClientDirectory } from '@/lib/api';
import { useSolarTheme } from '@/constants/solar-theme';
import type { ApiLead, LeadStatus, StaffProfile } from '@/types/api';

type FilterTab = 'all' | 'new' | 'callback' | 'survey_scheduled';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'callback', label: 'Callback' },
  { key: 'survey_scheduled', label: 'Survey Scheduled' },
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
  return address.length > 42 ? `${address.slice(0, 40)}…` : address;
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
        backgroundColor: colors.darkPanel === '#0d233a' ? 'rgba(13, 35, 58, 0.08)' : colors.primarySoft,
        color: colors.darkPanel,
      };
    case 'survey_scheduled':
      return {
        label: 'Survey Scheduled',
        backgroundColor: colors.primarySoft,
        color: colors.primary,
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
  if (filter === 'survey_scheduled') {
    return lead.status === 'survey_scheduled';
  }
  return true;
}

export default function AdminLeadsScreen() {
  const router = useRouter();
  const colors = useSolarTheme();
  const { user } = useSession();
  const { showToast } = useToast();
  const [leads, setLeads] = useState<ApiLead[]>([]);
  const [clients, setClients] = useState<StaffProfile[]>([]);
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
      const [leadList, clientList] = await Promise.all([
        fetchAllLeads(),
        fetchClientDirectory(user).catch(() => [] as StaffProfile[]),
      ]);
      setLeads(leadList);
      setClients(clientList);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const clientNames = useMemo(
    () => Object.fromEntries(clients.map((c) => [c.id, c.fullName])),
    [clients]
  );

  const filteredLeads = useMemo(() => {
    let list = leads.filter((l) => matchesFilter(l, filterTab));
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((l) => {
        const name = (clientNames[l.clientId] ?? '').toLowerCase();
        const phone = l.phone.replace(/\s/g, '').toLowerCase();
        const qDigits = q.replace(/\D/g, '');
        return (
          name.includes(q) ||
          l.address.toLowerCase().includes(q) ||
          (qDigits.length > 0 && phone.includes(qDigits))
        );
      });
    }
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [leads, filterTab, search, clientNames]);

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
          title="Leads Management"
          actions={[
            {
              icon: 'notifications-outline',
              label: 'Notifications',
              onPress: () => router.push('/notifications'),
            },
          ]}
        />

        <View style={styles.searchWrap}>
          <MaterialIcons name="search" size={20} color={colors.subtle} style={styles.searchIcon} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name or phone"
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
          style={styles.filterRow}>
          {FILTER_TABS.map((tab) => {
            const active = filterTab === tab.key;
            return (
              <Pressable key={tab.key} onPress={() => setFilterTab(tab.key)} style={styles.filterTab}>
                <Text
                  style={[
                    styles.filterTabText,
                    active
                      ? { color: colors.primary, fontWeight: '700' }
                      : { color: colors.subtle, fontWeight: '600' },
                  ]}>
                  {tab.label}
                </Text>
                <View
                  style={[
                    styles.filterIndicator,
                    { height: active ? 3 : 0, backgroundColor: active ? colors.primary : 'transparent' },
                  ]}
                />
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled">
        {isLoading ? (
          <ListSkeleton cards={4} />
        ) : error ? (
          <View style={[styles.errorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.errorText, { color: '#dc2626' }]}>{error}</Text>
            <Pressable onPress={() => void load()} style={[styles.retryBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </Pressable>
          </View>
        ) : filteredLeads.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MaterialIcons name="group-off" size={40} color={colors.subtle} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No leads</Text>
            <Text style={[styles.emptySub, { color: colors.subtle }]}>
              Try another filter or clear the search.
            </Text>
          </View>
        ) : (
          filteredLeads.map((lead) => {
            const badge = leadBadge(lead.status, colors);
            const displayName =
              clientNames[lead.clientId] ?? `Client ${lead.clientId.slice(-6)}`;
            const subtitle = `${lead.requiredLoadKw}kW · ${lead.roofType}`;

            return (
              <Pressable
                key={lead.id}
                onPress={() =>
                  router.push({
                    pathname: '/admin/lead/[id]',
                    params: { id: lead.id, clientName: displayName },
                  })
                }
                style={({ pressed }) => [
                  styles.card,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: pressed ? 0.94 : 1,
                  },
                ]}>
                <View style={styles.cardTop}>
                  <View style={styles.cardTopLeft}>
                    <View style={[styles.badge, { backgroundColor: badge.backgroundColor }]}>
                      <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                    </View>
                    <Text style={[styles.cardName, { color: colors.text }]}>{displayName}</Text>
                    <Text style={[styles.cardSubtitle, { color: colors.subtle }]}>{subtitle}</Text>
                  </View>
                  <View style={styles.cardTopRight}>
                    <Text style={[styles.receivedLabel, { color: colors.subtle }]}>Received</Text>
                    <Text style={[styles.receivedValue, { color: colors.muted }]}>
                      {formatReceived(lead.createdAt)}
                    </Text>
                  </View>
                </View>
                <View style={[styles.cardDivider, { borderTopColor: colors.border }]} />
                <View style={styles.cardBottom}>
                  <View style={styles.locationRow}>
                    <MaterialIcons name="location-on" size={16} color={colors.subtle} />
                    <Text style={[styles.locationText, { color: colors.subtle }]} numberOfLines={1}>
                      {shortLocation(lead.address)}
                    </Text>
                  </View>
                  <View style={styles.actionsRow}>
                    <Pressable
                      onPress={() => {
                        const url = `sms:${lead.phone.replace(/\s/g, '')}`;
                        void openDeviceUrl(url, 'Cannot open messages');
                      }}
                      style={[styles.iconAction, { backgroundColor: colors.surfaceMuted }]}>
                      <MaterialIcons name="chat" size={20} color={colors.text} />
                    </Pressable>
                    <Pressable
                      onPress={() =>
                        void openDeviceUrl(`tel:${lead.phone.replace(/\s/g, '')}`, 'Cannot make call')
                      }
                      style={[
                        styles.callButton,
                        { backgroundColor: colors.primary, shadowColor: colors.shadow },
                      ]}>
                      <MaterialIcons name="phone" size={18} color="#fff" />
                      <Text style={styles.callButtonText}>Call Now</Text>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            );
          })
        )}
        <View style={styles.listSpacer} />
      </ScrollView>

      <Pressable
        onPress={() => router.push('/admin/hub')}
        style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.shadow }]}
        accessibilityRole="button"
        accessibilityLabel="Add lead">
        <MaterialIcons name="add" size={32} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerTop: {
    borderBottomWidth: 1,
    paddingBottom: 4,
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    maxWidth: 560,
    alignSelf: 'center',
    width: '100%',
  },
  searchIcon: {
    position: 'absolute',
    left: 28,
    top: 13,
    zIndex: 1,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 11,
    paddingLeft: 40,
    paddingRight: 14,
    fontSize: 14,
  },
  filterRow: {
    maxHeight: 48,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 22,
    alignItems: 'flex-end',
    paddingBottom: 4,
  },
  filterTab: {
    paddingVertical: 10,
    marginRight: 4,
  },
  filterTabText: {
    fontSize: 14,
    paddingBottom: 8,
  },
  filterIndicator: {
    height: 3,
    borderRadius: 2,
    marginTop: -2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 140,
    gap: 16,
    maxWidth: 560,
    alignSelf: 'center',
    width: '100%',
  },
  errorCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
  },
  retryBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTopLeft: {
    flex: 1,
    gap: 4,
    paddingRight: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  cardName: {
    fontSize: 16,
    fontWeight: '800',
  },
  cardSubtitle: {
    fontSize: 14,
  },
  cardTopRight: {
    alignItems: 'flex-end',
  },
  receivedLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  receivedValue: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '700',
  },
  cardDivider: {
    borderTopWidth: 1,
    marginBottom: 12,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    minWidth: 0,
  },
  locationText: {
    fontSize: 12,
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconAction: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 8,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  listSpacer: {
    height: 24,
  },
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 102,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});
