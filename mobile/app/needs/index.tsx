import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/components/providers/session-provider';
import { solarNeedsGroups, solarNeedsScreens } from '@/constants/solar-needs';
import { useSolarTheme } from '@/constants/solar-theme';
import type { UserRole } from '@/types/api';

type SolarGroup = (typeof solarNeedsGroups)[number];

const DEFAULT_GROUP_ORDER: SolarGroup[] = [...solarNeedsGroups];

function orderedGroupsForViewer(role: UserRole | undefined, isAuthenticated: boolean): SolarGroup[] {
  if (!isAuthenticated || !role) {
    return DEFAULT_GROUP_ORDER;
  }
  if (role === 'admin') {
    return ['Admin Panel', 'Staff App', 'Client App', 'Landing Page'];
  }
  if (role === 'staff') {
    return ['Staff App', 'Admin Panel', 'Client App', 'Landing Page'];
  }
  return DEFAULT_GROUP_ORDER;
}

export default function NeedsIndexScreen() {
  const colors = useSolarTheme();
  const { isAuthenticated, user } = useSession();
  const groupOrder = orderedGroupsForViewer(user?.role, isAuthenticated);

  const adminScreenCount = solarNeedsScreens.filter((s) => s.group === 'Admin Panel').length;

  const heroSubtitle =
    user?.role === 'admin'
      ? 'Admin console previews are listed first. Scroll for staff, client, and landing flows in the same design system.'
      : user?.role === 'staff'
        ? 'Staff workflows are listed first, with admin oversight and client references below.'
        : 'Client, staff, admin, and landing page screens are now mapped into one reusable design system so you can preview each flow in the Expo app.';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View
          style={[
            styles.hero,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}>
          <View style={[styles.heroGlow, { backgroundColor: colors.primarySoft }]} />
          <Text style={[styles.eyebrow, { color: colors.primary }]}>Proposal Screen Kit</Text>
          <Text style={[styles.title, { color: colors.text }]}>All requested solar management screens</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>{heroSubtitle}</Text>

          <View style={styles.overviewRow}>
            <View style={[styles.overviewCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Text style={[styles.overviewLabel, { color: colors.subtle }]}>Total Screens</Text>
              <Text style={[styles.overviewValue, { color: colors.text }]}>{solarNeedsScreens.length}</Text>
            </View>
            <View style={[styles.overviewCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Text style={[styles.overviewLabel, { color: colors.subtle }]}>
                {user?.role === 'admin' ? 'Admin screens' : 'Modules'}
              </Text>
              <Text style={[styles.overviewValue, { color: colors.text }]}>
                {user?.role === 'admin' ? adminScreenCount : solarNeedsGroups.length}
              </Text>
            </View>
          </View>
        </View>

        {groupOrder.map((group) => {
          const screens = solarNeedsScreens.filter((screen) => screen.group === group);

          return (
            <View key={group} style={styles.groupWrap}>
              <Text style={[styles.groupTitle, { color: colors.text }]}>{group}</Text>
              <View style={styles.groupGrid}>
                {screens.map((screen) => (
                  <Link key={screen.slug} href={`/needs/${screen.slug}`} asChild>
                    <Pressable
                      style={[
                        styles.card,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                      ]}>
                      <View style={[styles.cardIcon, { backgroundColor: colors.primarySoft }]}>
                        <MaterialIcons name={screen.spotlight.icon} size={20} color={colors.primary} />
                      </View>
                      <Text style={[styles.cardName, { color: colors.text }]}>{screen.screenName}</Text>
                      <Text style={[styles.cardDescription, { color: colors.muted }]} numberOfLines={2}>
                        {screen.subtitle}
                      </Text>
                    </Pressable>
                  </Link>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
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
    paddingBottom: 40,
  },
  hero: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 22,
    overflow: 'hidden',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 3,
  },
  heroGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 999,
    top: -60,
    right: -50,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginBottom: 8,
    maxWidth: '88%',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
  },
  overviewRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  overviewCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
  },
  overviewLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  overviewValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  groupWrap: {
    marginTop: 26,
  },
  groupTitle: {
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  groupGrid: {
    gap: 12,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
  },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});
