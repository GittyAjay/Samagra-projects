import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useToast } from '@/components/providers/toast-provider';
import { PrimaryButton } from '@/components/ui/primary-button';
import {
  SolarScreenConfig,
  SolarScreenField,
} from '@/constants/solar-needs';
import { useSolarTheme } from '@/constants/solar-theme';

function keyFromField(field: SolarScreenField, index: number) {
  return `${field.label}-${index}`;
}

export function SolarScreenShell({ screen }: { screen: SolarScreenConfig }) {
  const router = useRouter();
  const colors = useSolarTheme();
  const { showToast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});

  const fieldKeys = useMemo(
    () => screen.fields?.map((field, index) => keyFromField(field, index)) ?? [],
    [screen.fields]
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.brandIcon, { backgroundColor: colors.primarySoft }]}>
            <MaterialIcons name={screen.spotlight.icon} size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.groupLabel, { color: colors.primary }]}>{screen.group}</Text>
            <Text style={[styles.screenLabel, { color: colors.text }]}>{screen.screenName}</Text>
          </View>
        </View>
        <View style={[styles.headerAction, { backgroundColor: colors.surfaceAlt }]}>
          <Ionicons name="arrow-back" size={20} color={colors.text} onPress={() => router.back()} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}>
          <View style={[styles.heroOrb, { backgroundColor: colors.primarySoft }]} />
          <Text style={[styles.eyebrow, { color: colors.primary }]}>{screen.group}</Text>
          <Text style={[styles.title, { color: colors.text }]}>{screen.title}</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>{screen.subtitle}</Text>

          <View style={[styles.spotlight, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <View style={[styles.spotlightIcon, { backgroundColor: colors.primarySoft }]}>
              <MaterialIcons name={screen.spotlight.icon} size={24} color={colors.primary} />
            </View>
            <View style={styles.spotlightCopy}>
              <Text style={[styles.spotlightLabel, { color: colors.subtle }]}>{screen.spotlight.label}</Text>
              <Text style={[styles.spotlightValue, { color: colors.primary }]}>{screen.spotlight.value}</Text>
              <Text style={[styles.spotlightCaption, { color: colors.muted }]}>
                {screen.spotlight.caption}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricsRow}>
          {screen.metrics.map((metric) => (
            <View
              key={metric.label}
              style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.metricLabel, { color: colors.subtle }]}>{metric.label}</Text>
              <Text style={[styles.metricValue, { color: colors.text }]}>{metric.value}</Text>
            </View>
          ))}
        </ScrollView>

        {screen.timeline?.length ? (
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Process Timeline</Text>
            <View style={styles.timelineWrap}>
              <View style={[styles.timelineRail, { backgroundColor: colors.border }]} />
              {screen.timeline.map((step) => (
                <View key={step.title} style={styles.timelineRow}>
                  <View
                    style={[
                      styles.timelineDot,
                      {
                        backgroundColor: step.active ? colors.primary : colors.surfaceMuted,
                        borderColor: colors.surface,
                      },
                    ]}
                  />
                  <View style={styles.timelineCopy}>
                    <Text style={[styles.timelineTitle, { color: step.active ? colors.primary : colors.text }]}>
                      {step.title}
                    </Text>
                    <Text style={[styles.timelineDetail, { color: colors.muted }]}>{step.detail}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {screen.fields?.length ? (
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Form Preview</Text>
            <View style={styles.formGrid}>
              {screen.fields.map((field, index) => {
                const fieldKey = fieldKeys[index];

                return (
                  <View key={fieldKey} style={styles.fieldWrap}>
                    <Text style={[styles.fieldLabel, { color: colors.text }]}>{field.label}</Text>
                    <View
                      style={[
                        styles.fieldShell,
                        {
                          backgroundColor: colors.surfaceAlt,
                          borderColor: colors.border,
                        },
                      ]}>
                      {field.prefix ? (
                        <View
                          style={[
                            styles.fieldPrefix,
                            { backgroundColor: colors.surfaceMuted, borderRightColor: colors.border },
                          ]}>
                          <Text style={[styles.fieldPrefixText, { color: colors.muted }]}>{field.prefix}</Text>
                        </View>
                      ) : null}
                      <TextInput
                        multiline={field.multiline}
                        numberOfLines={field.multiline ? 4 : 1}
                        onChangeText={(text) =>
                          setValues((current) => ({
                            ...current,
                            [fieldKey]: text,
                          }))
                        }
                        placeholder={field.placeholder}
                        placeholderTextColor={colors.subtle}
                        style={[
                          styles.fieldInput,
                          field.multiline ? styles.fieldInputMultiline : null,
                          { color: colors.text },
                        ]}
                        value={values[fieldKey] ?? ''}
                      />
                    </View>
                    {field.helper ? <Text style={[styles.helperText, { color: colors.muted }]}>{field.helper}</Text> : null}
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        <View style={styles.panelsGrid}>
          {screen.panels.map((panel) => (
            <View
              key={panel.title}
              style={[styles.panelCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.panelIcon, { backgroundColor: colors.primarySoft }]}>
                <MaterialIcons name={panel.icon} size={20} color={colors.primary} />
              </View>
              <Text style={[styles.panelTitle, { color: colors.text }]}>{panel.title}</Text>
              <Text style={[styles.panelDescription, { color: colors.muted }]}>{panel.description}</Text>
              {panel.bullets?.length ? (
                <View style={styles.bulletsWrap}>
                  {panel.bullets.map((bullet) => (
                    <View key={bullet} style={styles.bulletRow}>
                      <View style={[styles.bulletDot, { backgroundColor: colors.accent }]} />
                      <Text style={[styles.bulletText, { color: colors.text }]}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
              {panel.footer ? <Text style={[styles.footerNote, { color: colors.subtle }]}>{panel.footer}</Text> : null}
            </View>
          ))}
        </View>

        {screen.ctaLabel ? (
          <PrimaryButton
            backgroundColor={colors.primary}
            shadowColor={colors.shadow}
            title={screen.ctaLabel}
            trailingIcon={<Ionicons name="arrow-forward" size={18} color="#ffffff" />}
            onPress={() =>
              showToast({
                type: 'success',
                title: 'Preview action captured',
                message: `${screen.screenName} is ready for API wiring.`,
              })
            }
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  screenLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 44,
  },
  heroCard: {
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
  heroOrb: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 999,
    right: -44,
    top: -36,
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
    maxWidth: '90%',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },
  spotlight: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
  },
  spotlightIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotlightCopy: {
    flex: 1,
  },
  spotlightLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  spotlightValue: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
    letterSpacing: -0.6,
    marginBottom: 4,
  },
  spotlightCaption: {
    fontSize: 13,
    lineHeight: 19,
  },
  metricsRow: {
    gap: 12,
    paddingTop: 18,
    paddingBottom: 4,
  },
  metricCard: {
    minWidth: 132,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  sectionCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  timelineWrap: {
    position: 'relative',
    gap: 16,
  },
  timelineRail: {
    position: 'absolute',
    left: 9,
    top: 8,
    bottom: 8,
    width: 2,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 4,
    marginTop: 2,
  },
  timelineCopy: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  timelineDetail: {
    fontSize: 12,
    lineHeight: 18,
  },
  formGrid: {
    gap: 14,
  },
  fieldWrap: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  fieldShell: {
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  fieldPrefix: {
    minWidth: 68,
    borderRightWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    paddingHorizontal: 12,
  },
  fieldPrefixText: {
    fontSize: 15,
    fontWeight: '700',
  },
  fieldInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 15,
    fontWeight: '500',
  },
  fieldInputMultiline: {
    minHeight: 108,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    lineHeight: 18,
  },
  panelsGrid: {
    gap: 14,
    marginTop: 18,
  },
  panelCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
  },
  panelIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  panelTitle: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '800',
    marginBottom: 6,
  },
  panelDescription: {
    fontSize: 14,
    lineHeight: 21,
  },
  bulletsWrap: {
    gap: 8,
    marginTop: 14,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  bulletDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  footerNote: {
    marginTop: 14,
    fontSize: 12,
    lineHeight: 18,
  },
});
