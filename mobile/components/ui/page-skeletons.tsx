import { StyleSheet, View } from 'react-native';

import { useSolarTheme } from '@/constants/solar-theme';
import { ShimmerBlock } from '@/components/ui/shimmer-block';

export function DashboardSkeleton() {
  const colors = useSolarTheme();

  return (
    <View style={styles.section}>
      <ShimmerBlock style={styles.kicker} />
      <ShimmerBlock style={styles.title} />
      <View style={styles.grid}>
        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ShimmerBlock style={styles.heroHeader} />
          <ShimmerBlock style={styles.heroValue} />
          <ShimmerBlock style={styles.heroMeta} />
        </View>
        <View style={[styles.sideCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ShimmerBlock style={styles.sideHeader} />
          <ShimmerBlock style={styles.timelineRow} />
          <ShimmerBlock style={styles.timelineRow} />
          <ShimmerBlock style={styles.timelineRowShort} />
        </View>
      </View>
      <ShimmerBlock style={styles.sectionLabel} />
      <View style={styles.horizontalRow}>
        <View style={[styles.productCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ShimmerBlock style={styles.productImage} />
          <View style={styles.productBody}>
            <ShimmerBlock style={styles.productLineShort} />
            <ShimmerBlock style={styles.productLine} />
            <ShimmerBlock style={styles.productPrice} />
          </View>
        </View>
        <View style={[styles.productCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ShimmerBlock style={styles.productImage} />
          <View style={styles.productBody}>
            <ShimmerBlock style={styles.productLineShort} />
            <ShimmerBlock style={styles.productLine} />
            <ShimmerBlock style={styles.productPrice} />
          </View>
        </View>
      </View>
    </View>
  );
}

export function ListSkeleton({ cards = 3, showBanner = false }: { cards?: number; showBanner?: boolean }) {
  const colors = useSolarTheme();

  return (
    <View style={styles.section}>
      <ShimmerBlock style={styles.kicker} />
      <ShimmerBlock style={styles.titleWide} />
      <View style={styles.list}>
        {Array.from({ length: cards }).map((_, index) => (
          <View key={index} style={[styles.listCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ShimmerBlock style={styles.listIcon} />
            <View style={styles.listCopy}>
              <ShimmerBlock style={styles.listLine} />
              <ShimmerBlock style={styles.listLineShort} />
            </View>
          </View>
        ))}
      </View>
      {showBanner ? (
        <View style={[styles.bannerCard, { backgroundColor: colors.darkPanel }]}>
          <ShimmerBlock style={styles.bannerEyebrow} />
          <ShimmerBlock style={styles.bannerTitle} />
          <ShimmerBlock style={styles.bannerCopy} />
          <ShimmerBlock style={styles.bannerButton} />
        </View>
      ) : null}
    </View>
  );
}

export function DetailSkeleton() {
  const colors = useSolarTheme();

  return (
    <View style={styles.detailSection}>
      <ShimmerBlock style={styles.backButton} />
      <View style={[styles.detailHero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <ShimmerBlock style={styles.detailImage} />
      </View>
      <View style={styles.detailContent}>
        <ShimmerBlock style={styles.kicker} />
        <ShimmerBlock style={styles.detailTitle} />
        <ShimmerBlock style={styles.detailCopyLine} />
        <ShimmerBlock style={styles.detailCopyLineWide} />
        <View style={styles.metricsRow}>
          <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ShimmerBlock style={styles.metricValue} />
            <ShimmerBlock style={styles.metricCaption} />
          </View>
          <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ShimmerBlock style={styles.metricValue} />
            <ShimmerBlock style={styles.metricCaption} />
          </View>
        </View>
        <View style={[styles.detailSectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ShimmerBlock style={styles.sectionLabel} />
          <ShimmerBlock style={styles.detailCopyLineWide} />
          <ShimmerBlock style={styles.detailCopyLine} />
          <ShimmerBlock style={styles.detailCopyLineWide} />
        </View>
        <ShimmerBlock style={styles.ctaButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 16,
  },
  detailSection: {
    paddingBottom: 40,
  },
  kicker: {
    width: 92,
    height: 12,
    borderRadius: 999,
  },
  title: {
    width: '68%',
    height: 36,
  },
  titleWide: {
    width: '82%',
    height: 36,
  },
  grid: {
    gap: 16,
  },
  heroCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  heroHeader: {
    width: '44%',
    height: 20,
  },
  heroValue: {
    width: '58%',
    height: 52,
    borderRadius: 20,
  },
  heroMeta: {
    width: '72%',
    height: 16,
  },
  sideCard: {
    borderRadius: 26,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  sideHeader: {
    width: '38%',
    height: 18,
  },
  timelineRow: {
    width: '100%',
    height: 42,
    borderRadius: 18,
  },
  timelineRowShort: {
    width: '78%',
    height: 42,
    borderRadius: 18,
  },
  sectionLabel: {
    width: '48%',
    height: 28,
  },
  horizontalRow: {
    flexDirection: 'row',
    gap: 14,
  },
  productCard: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 160,
    borderRadius: 0,
  },
  productBody: {
    padding: 16,
    gap: 10,
  },
  productLineShort: {
    width: '34%',
    height: 12,
  },
  productLine: {
    width: '78%',
    height: 22,
  },
  productPrice: {
    width: '44%',
    height: 24,
  },
  list: {
    gap: 14,
  },
  listCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
  },
  listIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
  },
  listCopy: {
    flex: 1,
    gap: 10,
    justifyContent: 'center',
  },
  listLine: {
    width: '72%',
    height: 18,
  },
  listLineShort: {
    width: '52%',
    height: 14,
  },
  bannerCard: {
    borderRadius: 28,
    padding: 22,
    marginTop: 4,
    gap: 12,
  },
  bannerEyebrow: {
    width: '28%',
    height: 12,
  },
  bannerTitle: {
    width: '78%',
    height: 32,
  },
  bannerCopy: {
    width: '92%',
    height: 42,
  },
  bannerButton: {
    width: '44%',
    height: 56,
    borderRadius: 20,
  },
  backButton: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  detailHero: {
    marginHorizontal: 20,
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
  },
  detailImage: {
    width: '100%',
    height: 280,
    borderRadius: 0,
  },
  detailContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  detailTitle: {
    width: '70%',
    height: 40,
  },
  detailCopyLine: {
    width: '68%',
    height: 14,
  },
  detailCopyLineWide: {
    width: '100%',
    height: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  metricCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  metricValue: {
    width: '56%',
    height: 24,
  },
  metricCaption: {
    width: '72%',
    height: 14,
  },
  detailSectionCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 12,
    marginTop: 2,
  },
  ctaButton: {
    height: 56,
    borderRadius: 20,
    marginTop: 2,
  },
});
