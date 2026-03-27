import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useSession } from '@/components/providers/session-provider';
import { useSolarTheme } from '@/constants/solar-theme';
import { getHomeRouteForUser } from '@/lib/user-routing';

type HeaderAction = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
};

export function AppScreenHeader({
  title,
  subtitle,
  actions = [],
  showBack = false,
  borderless = false,
}: {
  title: string;
  subtitle?: string;
  actions?: HeaderAction[];
  /** When true, shows a back control for stack routes opened from tabs or deep links. */
  showBack?: boolean;
  borderless?: boolean;
}) {
  const colors = useSolarTheme();
  const router = useRouter();
  const { effectiveUser, isAuthenticated } = useSession();

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    if (isAuthenticated) {
      router.replace(getHomeRouteForUser(effectiveUser));
      return;
    }
    router.replace('/(tabs)');
  }

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
        borderless ? styles.headerBorderless : null,
      ]}>
      {showBack ? (
        <Pressable
          onPress={handleBack}
          style={[styles.backButton, { backgroundColor: colors.surfaceMuted }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
      ) : null}

      <View style={[styles.copy, showBack ? styles.copyAfterBack : null]}>
        {subtitle ? <Text style={[styles.subtitle, { color: colors.primary }]}>{subtitle}</Text> : null}
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      </View>

      {actions.length ? (
        <View style={styles.actions}>
          {actions.map((action) => (
            <Pressable
              key={`${action.label}-${action.icon}`}
              onPress={action.onPress}
              style={[styles.actionButton, { backgroundColor: colors.surfaceAlt }]}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              hitSlop={8}
            >
              <Ionicons name={action.icon} size={20} color={colors.text} />
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerBorderless: {
    borderBottomWidth: 0,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
    marginLeft: -4,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  copyAfterBack: {
    paddingRight: 4,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
