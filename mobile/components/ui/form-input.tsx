import { ReactNode } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

type FormInputColors = {
  background: string;
  border: string;
  label: string;
  text: string;
  mutedText: string;
  prefixBackground?: string;
  primary?: string;
};

type FormInputProps = TextInputProps & {
  colors: FormInputColors;
  containerStyle?: StyleProp<ViewStyle>;
  label?: string;
  leftAddon?: ReactNode;
  leftIcon?: ReactNode;
  rightAction?: ReactNode;
  rightLabel?: string;
  onRightLabelPress?: () => void;
  inputStyle?: StyleProp<TextStyle>;
};

export function FormInput({
  colors,
  containerStyle,
  inputStyle,
  label,
  leftAddon,
  leftIcon,
  onRightLabelPress,
  rightAction,
  rightLabel,
  ...inputProps
}: FormInputProps) {
  return (
    <View style={[styles.field, containerStyle]}>
      {label || rightLabel ? (
        <View style={styles.labelRow}>
          {label ? <Text style={[styles.label, { color: colors.label }]}>{label}</Text> : <View />}
          {rightLabel ? (
            <Pressable accessibilityRole="button" onPress={onRightLabelPress}>
              <Text style={[styles.rightLabel, { color: colors.primary ?? colors.text }]}>
                {rightLabel}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View style={[styles.inputShell, { backgroundColor: colors.background, borderColor: colors.border }]}>
        {leftAddon ? (
          <View
            style={[
              styles.leftAddon,
              {
                backgroundColor: colors.prefixBackground ?? colors.background,
                borderRightColor: colors.border,
              },
            ]}>
            {leftAddon}
          </View>
        ) : null}

        {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}

        <TextInput
          placeholderTextColor={colors.mutedText}
          style={[styles.input, leftAddon ? styles.inputWithAddon : null, inputStyle, { color: colors.text }]}
          {...inputProps}
        />

        {rightAction ? <View style={styles.rightAction}>{rightAction}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    paddingHorizontal: 2,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  rightLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  inputShell: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftAddon: {
    alignSelf: 'stretch',
    minWidth: 64,
    borderRightWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    paddingHorizontal: 12,
  },
  leftIcon: {
    marginLeft: 14,
    marginRight: 8,
  },
  input: {
    flex: 1,
    minHeight: 50,
    paddingLeft: 10,
    paddingRight: 12,
    fontSize: 14,
    fontWeight: '400',
  },
  inputWithAddon: {
    paddingLeft: 12,
  },
  rightAction: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
});
