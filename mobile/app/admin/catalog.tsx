import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppScreenHeader } from '@/components/ui/app-screen-header';
import { ListSkeleton } from '@/components/ui/page-skeletons';
import { fetchProducts } from '@/lib/api';
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
      return 'Panels';
    case 'solar_inverter':
      return 'Inverter';
    case 'solar_battery':
      return 'Battery';
    case 'installation_package':
      return 'Package';
    default:
      return 'Solar';
  }
}

export default function AdminCatalogScreen() {
  const router = useRouter();
  const colors = useSolarTheme();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function loadProducts() {
        try {
          setError('');
          setIsLoading(true);
          const response = await fetchProducts();

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
    }, [])
  );

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
      <AppScreenHeader
        title="Solar Catalog"
        actions={[
          {
            icon: 'add-circle-outline',
            label: 'Add product',
            onPress: () => router.push('/admin/add-product'),
          },
        ]}
      />

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
                        color={active ? colors.darkPanelText : colors.text}
                      />
                    ) : null}
                    <Text style={[styles.filterChipText, { color: active ? colors.darkPanelText : colors.text }]}>
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Pressable
              onPress={() => router.push('/admin/add-product')}
              style={[styles.addButton, { backgroundColor: colors.primary }]}>
              <MaterialIcons name="add" size={18} color="#ffffff" />
              <Text style={styles.addButtonText}>Add Product</Text>
            </Pressable>

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
                    {product.imageUrls[0] ? (
                      <Image source={{ uri: product.imageUrls[0] }} style={styles.media} contentFit="cover" />
                    ) : (
                      <View style={[styles.placeholder, { backgroundColor: colors.surfaceAlt }]}>
                        <MaterialIcons name="image-not-supported" size={28} color={colors.subtle} />
                      </View>
                    )}

                    {index === 0 ? (
                      <View style={[styles.cornerBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.cornerBadgeText}>Top Rated</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.cardBody}>
                    <Text style={[styles.productName, { color: colors.text }]} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text style={[styles.productMeta, { color: colors.primary }]}>{categoryLabel(product.category)}</Text>
                    <View style={styles.productFooter}>
                      <Text style={[styles.productPrice, { color: colors.text }]}>
                        {formatCurrency(product.estimatedPrice)}
                      </Text>
                      <View style={[styles.addMiniButton, { backgroundColor: colors.primarySoft }]}>
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
  safeArea: {
    flex: 1,
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
    height: 50,
    borderRadius: 16,
    paddingLeft: 46,
    paddingRight: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  filterRow: {
    gap: 10,
    paddingBottom: 14,
  },
  filterChip: {
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  addButton: {
    marginBottom: 16,
    borderRadius: 16,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  errorCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '700',
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
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
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
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  cardBody: {
    padding: 12,
    gap: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '800',
  },
  productMeta: {
    fontSize: 12,
    fontWeight: '700',
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
    fontWeight: '900',
  },
  addMiniButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
