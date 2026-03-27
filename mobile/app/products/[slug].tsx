import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/primary-button';
import { useSession } from '@/components/providers/session-provider';
import { useToast } from '@/components/providers/toast-provider';
import { DetailSkeleton } from '@/components/ui/page-skeletons';
import { createInquiry, fetchLeads, fetchProduct } from '@/lib/api';
import { useSolarTheme } from '@/constants/solar-theme';
import type { ApiProduct } from '@/types/api';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ProductDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ slug?: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const colors = useSolarTheme();
  const { isAuthenticated, user } = useSession();
  const { showToast } = useToast();
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isInterestModalVisible, setIsInterestModalVisible] = useState(false);
  const [monthlyBill, setMonthlyBill] = useState('');
  const [requiredLoadKw, setRequiredLoadKw] = useState('');
  const [roofType, setRoofType] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmittingInterest, setIsSubmittingInterest] = useState(false);
  const [hasRequestedInterest, setHasRequestedInterest] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      if (!slug) {
        return;
      }

      try {
        setError('');
        setIsLoading(true);
        const response = await fetchProduct(slug);

        if (isMounted) {
          setProduct(response);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load product');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProduct();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  useEffect(() => {
    let isMounted = true;

    async function loadExistingInterest() {
      if (!isAuthenticated || !user || !product) {
        if (isMounted) {
          setHasRequestedInterest(false);
        }
        return;
      }

      try {
        const leads = await fetchLeads({ clientId: user.id });
        const alreadyRequested = leads.some((lead) => lead.interestedProductId === product.id);

        if (isMounted) {
          setHasRequestedInterest(alreadyRequested);
        }
      } catch {
        if (isMounted) {
          setHasRequestedInterest(false);
        }
      }
    }

    void loadExistingInterest();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, product, user]);

  if (!slug) {
    return <Redirect href="/shop" />;
  }

  if (!isLoading && !product && error) {
    return <Redirect href="/shop" />;
  }

  async function submitInterest() {
    if (!isAuthenticated || !user) {
      showToast({
        type: 'error',
        title: 'Sign in required',
        message: 'Please log in before submitting your interest.',
      });
      return;
    }

    if (!product) {
      return;
    }

    if (hasRequestedInterest) {
      return;
    }

    const billValue = Number(monthlyBill.trim());
    const loadValue = Number(requiredLoadKw.trim());

    if (!Number.isFinite(billValue) || billValue <= 0) {
      showToast({
        type: 'error',
        title: 'Monthly bill required',
        message: 'Enter a valid monthly electricity bill amount.',
      });
      return;
    }

    if (!Number.isFinite(loadValue) || loadValue <= 0) {
      showToast({
        type: 'error',
        title: 'Load required',
        message: 'Enter a valid required load in kW.',
      });
      return;
    }

    if (!roofType.trim() || !address.trim()) {
      showToast({
        type: 'error',
        title: 'Complete the details',
        message: 'Roof type and address are required to create a lead.',
      });
      return;
    }

    try {
      setIsSubmittingInterest(true);
      const response = await createInquiry({
        clientId: user.id,
        monthlyElectricityBill: billValue,
        requiredLoadKw: loadValue,
        roofType: roofType.trim(),
        address: address.trim(),
        phone: user.phone,
        interestedProductId: product.id,
        notes: notes.trim() || undefined,
      });

      setIsInterestModalVisible(false);
      setMonthlyBill('');
      setRequiredLoadKw('');
      setRoofType('');
      setAddress('');
      setNotes('');
      setHasRequestedInterest(true);

      showToast({
        type: 'success',
        title: 'Interest submitted',
        message: response.autoAssigned
          ? 'Your inquiry was created and assigned to the team.'
          : 'Your inquiry was created successfully.',
      });
    } catch (submitError) {
      showToast({
        type: 'error',
        title: 'Could not submit interest',
        message: submitError instanceof Error ? submitError.message : 'Try again.',
      });
    } finally {
      setIsSubmittingInterest(false);
    }
  }

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: product?.name || 'Product Details',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={10} style={styles.stackBackButton}>
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </Pressable>
          ),
          headerTitleStyle: {
            fontFamily: 'Poppins-SemiBold',
            fontSize: 18,
            letterSpacing: -0.3,
          },
        }}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <DetailSkeleton />
        ) : product ? (
          <>
            <View style={[styles.imageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Image
                source={{ uri: product.imageUrls[0] || 'https://placehold.co/600x400' }}
                contentFit="cover"
                style={styles.image}
              />
            </View>

            <View style={styles.content}>
              <Text style={[styles.category, { color: colors.primary }]}>
                {product.category.replaceAll('_', ' ').toUpperCase()}
              </Text>
              <Text style={[styles.title, { color: colors.text }]}>{product.name}</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>{product.description}</Text>

              <View style={styles.metricsRow}>
                <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.metricLabel, { color: colors.subtle }]}>Capacity</Text>
                  <Text style={[styles.metricValue, { color: colors.text }]}>
                    {product.capacityKw ? `${product.capacityKw} kW` : 'Standard'}
                  </Text>
                </View>
                <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.metricLabel, { color: colors.subtle }]}>Warranty</Text>
                  <Text style={[styles.metricValue, { color: colors.text }]}>
                    {product.warrantyYears ? `${product.warrantyYears} years` : 'On request'}
                  </Text>
                </View>
              </View>

              <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.priceLabel, { color: colors.subtle }]}>Estimated Price</Text>
                <Text style={[styles.priceValue, { color: colors.primary }]}>
                  {formatCurrency(product.estimatedPrice)}
                </Text>
                <Text style={[styles.sectionCopy, { color: colors.muted }]}>
                  Compatibility: {product.compatibility?.join(', ') || 'Standard rooftop use'}
                </Text>
              </View>

              <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Specifications</Text>
                {Object.entries(product.specifications).map(([key, value]) => (
                  <View key={key} style={styles.specRow}>
                    <Text style={[styles.specKey, { color: colors.muted }]}>{key}</Text>
                    <Text style={[styles.specValue, { color: colors.text }]}>{String(value)}</Text>
                  </View>
                ))}
              </View>

              <PrimaryButton
                backgroundColor={hasRequestedInterest ? colors.surfaceAlt : colors.primary}
                shadowColor={colors.shadow}
                title={hasRequestedInterest ? 'Requested' : "I'm Interested"}
                disabled={hasRequestedInterest}
                onPress={() => {
                  if (!product || hasRequestedInterest) {
                    return;
                  }
                  setIsInterestModalVisible(true);
                }}
              />
              {hasRequestedInterest ? (
                <Text style={[styles.requestedMessage, { color: colors.muted }]}>
                  Your request has already been submitted. Our team will contact you soon.
                </Text>
              ) : null}
            </View>
          </>
        ) : null}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent
        visible={isInterestModalVisible}
        onRequestClose={() => setIsInterestModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setIsInterestModalVisible(false)} />
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Submit Interest</Text>
            <Text style={[styles.modalSubtitle, { color: colors.muted }]}>
              Share your basic installation details so we can create a real lead for the team.
            </Text>

            <TextInput
              value={monthlyBill}
              onChangeText={setMonthlyBill}
              keyboardType="numeric"
              placeholder="Monthly electricity bill"
              placeholderTextColor={colors.subtle}
              style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]}
            />
            <TextInput
              value={requiredLoadKw}
              onChangeText={setRequiredLoadKw}
              keyboardType="decimal-pad"
              placeholder="Required load (kW)"
              placeholderTextColor={colors.subtle}
              style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]}
            />
            <TextInput
              value={roofType}
              onChangeText={setRoofType}
              placeholder="Roof type"
              placeholderTextColor={colors.subtle}
              style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]}
            />
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Installation address"
              placeholderTextColor={colors.subtle}
              style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]}
            />
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes (optional)"
              placeholderTextColor={colors.subtle}
              multiline
              style={[
                styles.modalInput,
                styles.modalTextarea,
                { borderColor: colors.border, color: colors.text },
              ]}
            />

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setIsInterestModalVisible(false)}
                style={[styles.modalSecondaryButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
              >
                <Text style={[styles.modalSecondaryText, { color: colors.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => void submitInterest()}
                disabled={isSubmittingInterest}
                style={[styles.modalPrimaryButton, { backgroundColor: colors.primary }]}
              >
                {isSubmittingInterest ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.modalPrimaryText}>Submit</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  stackBackButton: {
    marginLeft: 4,
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageCard: {
    marginHorizontal: 20,
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 280,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  requestedMessage: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  category: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '700',
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
  },
  priceLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionCopy: {
    fontSize: 13,
    lineHeight: 20,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  specKey: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  specValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  modalCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: 'transparent',
  },
  modalTextarea: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  modalSecondaryButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSecondaryText: {
    fontSize: 15,
    fontWeight: '700',
  },
  modalPrimaryButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
