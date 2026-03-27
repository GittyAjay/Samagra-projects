import { ReactNode } from 'react';
import { Pressable, PressableProps, StyleSheet, Text, View } from 'react-native';

type PrimaryButtonProps = PressableProps & {
  backgroundColor: string;
  shadowColor: string;
  title: string;
  trailingIcon?: ReactNode;
};

export function PrimaryButton({
  backgroundColor,
  shadowColor,
  title,
  trailingIcon,
  style,
  ...props
}: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      style={(state) => [
        styles.button,
        {
          backgroundColor,
          opacity: state.pressed ? 0.92 : 1,
          transform: [{ scale: state.pressed ? 0.985 : 1 }],
          shadowColor,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}>
      <Text style={styles.title}>{title}</Text>
      {trailingIcon ? <View style={styles.icon}>{trailingIcon}</View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 8,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 3,
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
