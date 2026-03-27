import { Ionicons } from '@expo/vector-icons';
import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSolarTheme } from '@/constants/solar-theme';

type ToastType = 'success' | 'error' | 'info';

type ToastConfig = {
  type?: ToastType;
  title: string;
  message?: string;
  duration?: number;
};

type ToastState = Required<ToastConfig> & {
  id: number;
};

type ToastContextValue = {
  hideToast: () => void;
  showToast: (config: ToastConfig) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function toastAccent(type: ToastType) {
  switch (type) {
    case 'success':
      return {
        icon: 'checkmark-circle',
        accent: '#2ecc71',
        soft: 'rgba(46, 204, 113, 0.14)',
      } as const;
    case 'error':
      return {
        icon: 'close-circle',
        accent: '#dc2626',
        soft: '#fef2f2',
      } as const;
    case 'info':
    default:
      return {
        icon: 'information-circle',
        accent: '#FF8C00',
        soft: 'rgba(255, 140, 0, 0.12)',
      } as const;
  }
}

export function ToastProvider({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  const colors = useSolarTheme();
  const [toast, setToast] = useState<ToastState | null>(null);
  const translateY = useRef(new Animated.Value(-24)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const hideToast = useCallback(() => {
    clearHideTimer();

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -24,
        duration: 180,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 160,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setToast(null);
      }
    });
  }, [clearHideTimer, opacity, translateY]);

  const showToast = useCallback(
    ({ type = 'success', title, message = '', duration = 2600 }: ToastConfig) => {
      clearHideTimer();

      setToast({
        id: Date.now(),
        type,
        title,
        message,
        duration,
      });

      translateY.setValue(-24);
      opacity.setValue(0);

      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 220,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();
      });

      hideTimerRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    },
    [clearHideTimer, hideToast, opacity, translateY]
  );

  useEffect(() => () => clearHideTimer(), [clearHideTimer]);

  const value = useMemo(
    () => ({
      hideToast,
      showToast,
    }),
    [hideToast, showToast]
  );

  const theme = toast ? toastAccent(toast.type) : null;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && theme ? (
        <View pointerEvents="box-none" style={styles.portal}>
          <Animated.View
            style={[
              styles.toastWrap,
              {
                paddingTop: Math.max(insets.top, 10) + 6,
                opacity,
                transform: [{ translateY }],
              },
            ]}>
            <Pressable
              accessibilityRole="alert"
              onPress={hideToast}
              style={[
                styles.toast,
                {
                  backgroundColor: colors.surface,
                  borderColor: `${theme.accent}22`,
                  shadowColor: theme.accent,
                },
              ]}>
              <View style={[styles.iconWrap, { backgroundColor: theme.soft }]}>
                <Ionicons name={theme.icon} size={22} color={theme.accent} />
              </View>
              <View style={styles.copy}>
                <Text style={[styles.title, { color: colors.text }]}>{toast.title}</Text>
                {toast.message ? <Text style={[styles.message, { color: colors.muted }]}>{toast.message}</Text> : null}
              </View>
            </Pressable>
          </Animated.View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}

const styles = StyleSheet.create({
  portal: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
    elevation: 200,
  },
  toastWrap: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  toast: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 8,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
});
