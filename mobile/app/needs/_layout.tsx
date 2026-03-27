import { Stack } from 'expo-router';

export default function NeedsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
