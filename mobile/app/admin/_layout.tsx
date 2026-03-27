import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { useSession } from '@/components/providers/session-provider';
import { HapticTab } from '@/components/haptic-tab';
import { TabBarSvgIcon } from '@/components/ui/tab-bar-svg-icon';
import { useSolarTheme } from '@/constants/solar-theme';

export default function AdminTabLayout() {
  const { isAuthenticated, user } = useSession();
  const colors = useSolarTheme();
  const activeTint = colors.primary;
  const inactiveTint = colors.subtle;
  const tabBackground = colors.surface;
  const borderColor = colors.border;

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: activeTint,
        tabBarInactiveTintColor: inactiveTint,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          textAlign: 'center',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 0,
          borderRadius: 18,
          marginHorizontal: 4,
          marginTop: 6,
          marginBottom: 6,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 12,
          height: 78,
          paddingHorizontal: 12,
          paddingTop: 6,
          paddingBottom: 8,
          borderRadius: 28,
          backgroundColor: tabBackground,
          borderWidth: 1,
          borderColor,
          elevation: 10,
          shadowColor: colors.primary,
          shadowOpacity: 0.12,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: -4 },
          ...(Platform.OS === 'web' ? { maxWidth: 520, alignSelf: 'center', width: '100%' } : null),
        },
        tabBarIconStyle: {
          marginBottom: 0,
          marginTop: 0,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
          tabBarIcon: ({ color }) => <TabBarSvgIcon color={color} name="dashboard" />,
        }}
      />
      <Tabs.Screen
        name="leads"
        options={{
          title: 'Leads',
          tabBarIcon: ({ color }) => <TabBarSvgIcon color={color} name="leads" />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => <TabBarSvgIcon color={color} name="orders" />,
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: 'Catalog',
          tabBarIcon: ({ color }) => <TabBarSvgIcon color={color} name="shop" />,
        }}
      />
      <Tabs.Screen
        name="hub"
        options={{
          title: 'Hub',
          tabBarIcon: ({ color }) => <TabBarSvgIcon color={color} name="support" />,
        }}
      />
      <Tabs.Screen
        name="add-product"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="staff-new"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="assignments"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="lead/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="quotation/create"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="quotation/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="order/create"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="order/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
