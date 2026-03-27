import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '@/components/providers/session-provider';
import { useToast } from '@/components/providers/toast-provider';
import { FormInput } from '@/components/ui/form-input';
import { PrimaryButton } from '@/components/ui/primary-button';
import { createProduct } from '@/lib/api';
import { useSolarTheme } from '@/constants/solar-theme';
import type { ProductCategory } from '@/types/api';

const CATEGORY_OPTIONS: { value: ProductCategory; label: string }[] = [
  { value: 'solar_panel', label: 'Panel' },
  { value: 'solar_inverter', label: 'Inverter' },
  { value: 'solar_battery', label: 'Battery' },
  { value: 'installation_package', label: 'Package' },
];

const formInputColors = (colors: ReturnType<typeof useSolarTheme>) => ({
  background: colors.surfaceAlt,
  border: colors.border,
  label: colors.text,
  text: colors.text,
  mutedText: colors.muted,
});

export default function AdminAddProductScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useSolarTheme();
  const fc = formInputColors(colors);
  const { showToast } = useToast();
  const { user } = useSession();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('solar_panel');
  const [description, setDescription] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [capacityKw, setCapacityKw] = useState('');
  const [warrantyYears, setWarrantyYears] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    setError('');

    const trimmedName = name.trim();
    const trimmedDesc = description.trim();
    const priceNum = Number(estimatedPrice.replace(/,/g, '').trim());

    if (!trimmedName) {
      setError('Product name is required.');
      return;
    }
    if (!trimmedDesc) {
      setError('Description is required.');
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setError('Enter a valid estimated price (INR).');
      return;
    }

    if (!user) {
      setError('You must be signed in as an admin.');
      return;
    }

    const cap =
      capacityKw.trim() === ''
        ? undefined
        : Number(capacityKw.replace(/,/g, '').trim());
    if (capacityKw.trim() !== '' && (!Number.isFinite(cap) || (cap ?? 0) < 0)) {
      setError('Capacity (kW) must be a valid number.');
      return;
    }

    const warranty =
      warrantyYears.trim() === ''
        ? undefined
        : Number.parseInt(warrantyYears.trim(), 10);
    if (warrantyYears.trim() !== '' && (!Number.isFinite(warranty) || (warranty ?? 0) < 0)) {
      setError('Warranty years must be a valid whole number.');
      return;
    }

    const imageUrls =
      imageUrl.trim() === '' ? [] : [imageUrl.trim()];

    try {
      setIsSubmitting(true);
      await createProduct(user, {
        name: trimmedName,
        category,
        description: trimmedDesc,
        estimatedPrice: priceNum,
        ...(cap !== undefined && Number.isFinite(cap) ? { capacityKw: cap } : {}),
        ...(warranty !== undefined && Number.isFinite(warranty) ? { warrantyYears: warranty } : {}),
        ...(imageUrls.length ? { imageUrls } : {}),
      });

      showToast({
        type: 'success',
        title: 'Product created',
        message: `${trimmedName} was added to the catalog.`,
      });
      router.back();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not create product';
      setError(message);
      showToast({ type: 'error', title: 'Create failed', message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.select({ ios: 'padding', android: 'height' })}
        keyboardVerticalOffset={insets.top}>
        <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: colors.surfaceAlt }]}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <Text style={[styles.topTitle, { color: colors.text }]}>Add product</Text>
          <View style={styles.backBtnPlaceholder} />
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}>
          {error ? (
            <View style={[styles.errorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.errorText, { color: '#dc2626' }]}>{error}</Text>
            </View>
          ) : null}

          <Text style={[styles.sectionLabel, { color: colors.subtle }]}>Category</Text>
          <View style={styles.categoryRow}>
            {CATEGORY_OPTIONS.map((opt) => {
              const active = category === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setCategory(opt.value)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: active ? colors.primarySoft : colors.surfaceAlt,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.categoryChipText,
                      { color: active ? colors.primary : colors.muted, fontWeight: active ? '800' : '600' },
                    ]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <FormInput
            colors={fc}
            label="Product name"
            placeholder="e.g. EcoSun 5kW Residential Panel Kit"
            value={name}
            onChangeText={setName}
            selectionColor={colors.primary}
          />

          <FormInput
            colors={fc}
            label="Description"
            placeholder="Short description for the catalog"
            value={description}
            onChangeText={setDescription}
            multiline
            inputStyle={styles.descriptionInput}
          />

          <FormInput
            colors={fc}
            label="Estimated price (INR)"
            placeholder="e.g. 285000"
            keyboardType="decimal-pad"
            value={estimatedPrice}
            onChangeText={setEstimatedPrice}
            selectionColor={colors.primary}
          />

          <FormInput
            colors={fc}
            label="Capacity (kW) — optional"
            placeholder="e.g. 5"
            keyboardType="decimal-pad"
            value={capacityKw}
            onChangeText={setCapacityKw}
            selectionColor={colors.primary}
          />

          <FormInput
            colors={fc}
            label="Warranty (years) — optional"
            placeholder="e.g. 25"
            keyboardType="number-pad"
            value={warrantyYears}
            onChangeText={setWarrantyYears}
            selectionColor={colors.primary}
          />

          <FormInput
            colors={fc}
            label="Image URL — optional"
            placeholder="https://…"
            value={imageUrl}
            onChangeText={setImageUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            selectionColor={colors.primary}
          />

          <PrimaryButton
            backgroundColor={colors.primary}
            shadowColor={colors.shadow}
            title={isSubmitting ? 'Saving…' : 'Save product'}
            disabled={isSubmitting}
            onPress={() => void handleSubmit()}
            style={styles.submitBtn}
            trailingIcon={
              isSubmitting ? <ActivityIndicator color="#fff" size="small" /> : undefined
            }
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnPlaceholder: {
    width: 40,
  },
  topTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 14,
  },
  errorCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: -6,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
  },
  submitBtn: {
    marginTop: 8,
  },
  descriptionInput: {
    minHeight: 100,
    paddingTop: 14,
    textAlignVertical: 'top',
    alignSelf: 'stretch',
  },
});
