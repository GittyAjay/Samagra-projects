import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/components/providers/session-provider';
import { ListSkeleton } from '@/components/ui/page-skeletons';
import { fetchClientDashboard, fetchProducts } from '@/lib/api';
import { useSolarTheme } from '@/constants/solar-theme';
import type { ApiProduct, ProductCategory } from '@/types/api';

const categoryFilters: { key: ProductCategory | 'all'; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { key: 'all', label: 'All', icon: 'grid-view' },
  { key: 'solar_panel', label: 'Panels', icon: 'solar-power' },
  { key: 'solar_inverter', label: 'Inverters', icon: 'electrical-services' },
  { key: 'solar_battery', label: 'Batteries', icon: 'battery-charging-full' },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function categoryLabel(category: ApiProduct['category']) {
  switch (category) {
    case 'solar_panel':
      return 'Capacity';
    case 'solar_inverter':
      return 'Output';
    case 'solar_battery':
      return 'Capacity';
    case 'installation_package':
      return 'Package';
    default:
      return 'Solar';
  }
}

function categoryValue(product: ApiProduct) {
  if (typeof product.capacityKw === 'number') {
    return `${product.capacityKw.toFixed(1)} kW`;
  }

  if (product.category === 'solar_battery' && typeof product.specifications.storage === 'number') {
    return `${product.specifications.storage} kWh`;
  }

  return 'Solar ready';
}

export default function ShopScreen() {
  const router = useRouter();
  const colors = useSolarTheme();
  const { effectiveUser } = useSession();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        setError('');
        setIsLoading(true);
        let response: ApiProduct[] = [];

        try {
          response = await fetchProducts();
        } catch {
          const dashboard = await fetchClientDashboard(effectiveUser.id);
          response = dashboard.recommendedProducts;
        }

        if (isMounted) {
          setProducts(response);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load products');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, [effectiveUser.id]);

  const filteredProducts = useMemo(() => {
    const lowered = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      const matchesQuery =
        !lowered ||
        product.name.toLowerCase().includes(lowered) ||
        product.description.toLowerCase().includes(lowered);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, products, query]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: `${colors.background}F2`,
            borderBottomColor: colors.border,
          },
        ]}>
        <Pressable onPress={() => router.push('/(tabs)')} style={styles.headerButton}>
          <MaterialIcons name="menu" size={22} color={colors.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Solar Catalog</Text>
        <Pressable onPress={() => router.push('/orders')} style={styles.headerButton}>
          <MaterialIcons name="shopping-cart" size={22} color={colors.primary} />
          <View style={[styles.cartBadge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.cartBadgeText, { color: colors.onPrimary }]}>{Math.min(9, filteredProducts.length || 3)}</Text>
          </View>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <ListSkeleton cards={4} showBanner />
        ) : (
          <>
            <View style={styles.searchWrap}>
              <MaterialIcons name="search" size={20} color={colors.primary} style={styles.searchIcon} />
              <TextInput
                placeholder="Search solar solutions..."
                placeholderTextColor={colors.subtle}
                style={[
                  styles.searchInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={query}
                onChangeText={setQuery}
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {categoryFilters.map((filter) => {
                const active = filter.key === activeCategory;

                return (
                  <Pressable
                    key={filter.key}
                    onPress={() => setActiveCategory(filter.key)}
                    style={[
                      styles.filterChip,
                      active
                        ? { backgroundColor: colors.primary, borderColor: colors.primary }
                        : { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}>
                    {filter.key !== 'all' ? (
                      <MaterialIcons
                        name={filter.icon}
                        size={18}
                        color={active ? colors.onPrimary : colors.text}
                      />
                    ) : null}
                    <Text style={[styles.filterChipText, { color: active ? colors.onPrimary : colors.text }]}>
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {error ? (
              <View style={[styles.errorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.grid}>
              {filteredProducts.map((product, index) => (
                <Pressable
                  key={product.id}
                  onPress={() => router.push(`/products/${product.id}`)}
                  style={[
                    styles.card,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}>
                  <View style={[styles.mediaWrap, { backgroundColor: colors.surfaceMuted }]}>
                    <Image
                      source={{ uri: product.imageUrls[0] || 'https://placehold.co/600x600' }}
                      contentFit="cover"
                      style={styles.media}
                    />
                    {index === 0 ? (
                      <View style={[styles.cornerBadge, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.cornerBadgeText, { color: colors.onPrimary }]}>Top Rated</Text>
                      </View>
                    ) : null}
                    {index === 2 ? (
                      <View style={[styles.cornerBadge, { backgroundColor: colors.warning }]}>
                        <Text style={[styles.cornerBadgeText, { color: colors.onPrimary }]}>New</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.cardBody}>
                    <Text style={[styles.productName, { color: colors.text }]} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text style={[styles.productMeta, { color: colors.primary }]}>
                      {categoryLabel(product.category)} {categoryValue(product)}
                    </Text>
                    <View style={styles.productFooter}>
                      <Text style={[styles.productPrice, { color: colors.text }]}>
                        {formatCurrency(product.estimatedPrice)}
                      </Text>
                      <View style={[styles.addButton, { backgroundColor: colors.primarySoft }]}>
                        <MaterialIcons name="add" size={16} color={colors.primary} />
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  cartBadge: {
    position: 'absolute',
    top: 5,
    right: 3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 120,
  },
  searchWrap: {
    position: 'relative',
    marginBottom: 14,
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    top: 14,
    zIndex: 1,
  },
  searchInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingLeft: 46,
    paddingRight: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  filterRow: {
    gap: 10,
    paddingBottom: 18,
  },
  filterChip: {
    height: 38,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  errorCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '47%',
    minWidth: 156,
    flexGrow: 1,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  mediaWrap: {
    aspectRatio: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  cornerBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cornerBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardBody: {
    padding: 12,
    gap: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
  },
  productMeta: {
    fontSize: 12,
    fontWeight: '600',
  },
  productFooter: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  productPrice: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
