import { SessionProvider } from '@/components/providers/session-provider';
import { ToastProvider } from '@/components/providers/toast-provider';
import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable } from 'react-native';
import 'react-native-reanimated';

import { solarPalette } from '@/constants/solar-theme';
import { installPoppinsAsDefaultFont, poppinsFonts } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';

void SplashScreen.preventAutoHideAsync();
let hasInstalledPoppinsDefaults = false;

function StackBackButton({ color }: { color: string }) {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.back()} hitSlop={10} style={{ marginLeft: 4, padding: 4 }}>
      <Ionicons name="arrow-back" size={22} color={color} />
    </Pressable>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts(poppinsFonts);
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? solarPalette.dark : solarPalette.light;
  const navigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  useEffect(() => {
    if (!fontsLoaded) {
      return;
    }

    if (!hasInstalledPoppinsDefaults) {
      installPoppinsAsDefaultFont();
      hasInstalledPoppinsDefaults = true;
    }

    void SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SessionProvider>
      <ToastProvider>
        <ThemeProvider
          value={{
            ...navigationTheme,
            colors: {
              ...navigationTheme.colors,
              primary: colors.primary,
              background: colors.background,
              card: colors.surface,
              text: colors.text,
              border: colors.border,
              notification: colors.accent,
            },
          }}>
          <Stack
            screenOptions={{
              headerShown: false,
              headerTitleStyle: {
                fontFamily: 'Poppins-SemiBold',
              },
            }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="admin" options={{ headerShown: false }} />
            <Stack.Screen name="staff" options={{ headerShown: false }} />
            <Stack.Screen name="quotation" options={{ headerShown: false }} />
            <Stack.Screen
              name="chat"
              options={{
                headerShown: true,
                title: 'Live Chat',
                headerBackButtonDisplayMode: 'minimal',
                headerShadowVisible: false,
                headerStyle: {
                  backgroundColor: colors.background,
                },
                headerTintColor: colors.text,
                headerTitleStyle: {
                  fontFamily: 'Poppins-SemiBold',
                  fontSize: 18,
                  letterSpacing: -0.3,
                },
              }}
            />
            <Stack.Screen
              name="products/[slug]"
              options={{
                headerShown: true,
                title: 'Product Details',
                headerShadowVisible: false,
                headerStyle: {
                  backgroundColor: colors.background,
                },
                headerTintColor: colors.text,
                headerLeft: () => <StackBackButton color={colors.text} />,
                headerTitleStyle: {
                  fontFamily: 'Poppins-SemiBold',
                  fontSize: 18,
                  letterSpacing: -0.3,
                },
              }}
            />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen
              name="register"
              options={{
                headerShown: true,
                title: 'Create Account',
                headerBackButtonDisplayMode: 'minimal',
                headerShadowVisible: false,
                headerStyle: {
                  backgroundColor: colors.background,
                },
                headerTintColor: colors.text,
                headerTitleStyle: {
                  fontFamily: 'Poppins-SemiBold',
                  fontSize: 18,
                  letterSpacing: -0.3,
                },
              }}
            />
            <Stack.Screen
              name="profile"
              options={{
                headerShown: true,
                title: 'Profile',
                headerBackButtonDisplayMode: 'minimal',
                headerShadowVisible: false,
                headerStyle: {
                  backgroundColor: colors.background,
                },
                headerTintColor: colors.text,
                headerTitleStyle: {
                  fontFamily: 'Poppins-SemiBold',
                  fontSize: 18,
                  letterSpacing: -0.3,
                },
              }}
            />
            <Stack.Screen name="notifications" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} />
          </Stack>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
