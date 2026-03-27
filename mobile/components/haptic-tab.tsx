import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { StyleSheet, View } from 'react-native';

import { useSolarTheme } from '@/constants/solar-theme';

export function HapticTab(props: BottomTabBarButtonProps) {
  const colors = useSolarTheme();
  const isSelected = Boolean(props.accessibilityState?.selected);

  return (
    <PlatformPressable
      {...props}
      style={[
        styles.button,
        {
          backgroundColor: isSelected ? colors.surfaceAlt : 'transparent',
        },
      ]}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}>
      <View style={styles.content}>
        {props.children}
        {isSelected ? <View style={[styles.indicator, { backgroundColor: colors.primary }]} /> : null}
      </View>
    </PlatformPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    paddingBottom: 8,
  },
  indicator: {
    position: 'absolute',
    bottom: 2,
    width: 28,
    height: 3,
    borderRadius: 999,
  },
});
