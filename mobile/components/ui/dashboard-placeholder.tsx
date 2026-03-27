import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useToast } from '@/components/providers/toast-provider';
import { PrimaryButton } from '@/components/ui/primary-button';
import { useColorScheme } from '@/hooks/use-color-scheme';

type DashboardPlaceholderProps = {
  badge: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
};

const palette = {
  light: {
    background: '#ffffff',
    panel: '#ffffff',
    panelSoft: '#fdfdfd',
    border: '#f0f0f0',
    text: '#1a1a1a',
    muted: '#666666',
    primary: '#FF8C00',
    shadow: 'rgba(255, 140, 0, 0.22)',
  },
  dark: {
    background: '#081521',
    panel: '#10263d',
    panelSoft: '#17314d',
    border: 'rgba(255, 255, 255, 0.08)',
    text: '#ffffff',
    muted: 'rgba(255, 255, 255, 0.72)',
    primary: '#FF8C00',
    shadow: 'rgba(255, 140, 0, 0.24)',
  },
} as const;

export function DashboardPlaceholder({
  badge,
  description,
  icon,
  title,
}: DashboardPlaceholderProps) {
  const colorScheme = useColorScheme();
  const { showToast } = useToast();
  const colors = colorScheme === 'dark' ? palette.dark : palette.light;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View style={[styles.hero, { backgroundColor: colors.panel, borderColor: colors.border }]}>
          <View style={[styles.iconWrap, { backgroundColor: colors.panelSoft }]}>
            <MaterialIcons name={icon} size={34} color={colors.primary} />
          </View>
          <Text style={[styles.badge, { color: colors.primary }]}>{badge}</Text>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.description, { color: colors.muted }]}>{description}</Text>
          <PrimaryButton
            backgroundColor={colors.primary}
            shadowColor={colors.shadow}
            title="Coming Soon"
            trailingIcon={<Ionicons name="arrow-forward" size={18} color="#ffffff" />}
            onPress={() =>
              showToast({
                type: 'info',
                title: 'Screen planned',
                message: `${title} is part of the next implementation pass.`,
              })
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  hero: {
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  badge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
});
