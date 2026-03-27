import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useSolarTheme } from '@/constants/solar-theme';

type PromptDialogProps = {
  cancelLabel?: string;
  confirmLabel?: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  visible: boolean;
  variant?: 'default' | 'danger';
};

export function PromptDialog({
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  message,
  onCancel,
  onConfirm,
  title,
  visible,
  variant = 'default',
}: PromptDialogProps) {
  const colors = useSolarTheme();
  const isDanger = variant === 'danger';
  const accent = isDanger ? '#dc2626' : colors.primary;
  const softAccent = isDanger ? 'rgba(220, 38, 38, 0.10)' : colors.primarySoft;

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onCancel} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.iconWrap, { backgroundColor: softAccent }]}>
            <Ionicons
              name={isDanger ? 'alert-circle-outline' : 'help-circle-outline'}
              size={26}
              color={accent}
            />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.muted }]}>{message}</Text>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={onCancel}
              style={[styles.secondaryButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Text style={[styles.secondaryLabel, { color: colors.text }]}>{cancelLabel}</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={onConfirm}
              style={[styles.primaryButton, { backgroundColor: accent }]}>
              <Text style={styles.primaryLabel}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
  },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 22,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
  },
  secondaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  primaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
