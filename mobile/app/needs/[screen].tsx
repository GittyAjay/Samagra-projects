import { Redirect, useLocalSearchParams } from 'expo-router';

import { SolarScreenShell } from '@/components/ui/solar-screen-shell';
import { getSolarScreen } from '@/constants/solar-needs';

export default function SolarNeedScreen() {
  const params = useLocalSearchParams<{ screen?: string }>();
  const slug = Array.isArray(params.screen) ? params.screen[0] : params.screen;

  if (!slug) {
    return <Redirect href="/needs" />;
  }

  const screen = getSolarScreen(slug);

  if (!screen) {
    return <Redirect href="/needs" />;
  }

  return <SolarScreenShell screen={screen} />;
}
