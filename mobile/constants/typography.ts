import { StyleSheet, Text, TextInput } from 'react-native';

type FontStyleValue = 'normal' | 'italic' | undefined;

type TextLikeComponent = {
  render?: (props: { style?: unknown }, ref?: unknown) => unknown;
  __poppinsPatched?: boolean;
};

const poppinsFamilyByWeight = {
  normal: {
    100: 'Poppins-Thin',
    200: 'Poppins-ExtraLight',
    300: 'Poppins-Light',
    400: 'Poppins-Regular',
    500: 'Poppins-Medium',
    600: 'Poppins-SemiBold',
    700: 'Poppins-Bold',
    800: 'Poppins-ExtraBold',
    900: 'Poppins-Black',
  },
  italic: {
    100: 'Poppins-ThinItalic',
    200: 'Poppins-ExtraLightItalic',
    300: 'Poppins-LightItalic',
    400: 'Poppins-Italic',
    500: 'Poppins-MediumItalic',
    600: 'Poppins-SemiBoldItalic',
    700: 'Poppins-BoldItalic',
    800: 'Poppins-ExtraBoldItalic',
    900: 'Poppins-BlackItalic',
  },
} as const;

export const poppinsFonts = {
  'Poppins-Thin': require('../assets/fonts/Poppins-Thin.ttf'),
  'Poppins-ThinItalic': require('../assets/fonts/Poppins-ThinItalic.ttf'),
  'Poppins-ExtraLight': require('../assets/fonts/Poppins-ExtraLight.ttf'),
  'Poppins-ExtraLightItalic': require('../assets/fonts/Poppins-ExtraLightItalic.ttf'),
  'Poppins-Light': require('../assets/fonts/Poppins-Light.ttf'),
  'Poppins-LightItalic': require('../assets/fonts/Poppins-LightItalic.ttf'),
  'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
  'Poppins-Italic': require('../assets/fonts/Poppins-Italic.ttf'),
  'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
  'Poppins-MediumItalic': require('../assets/fonts/Poppins-MediumItalic.ttf'),
  'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
  'Poppins-SemiBoldItalic': require('../assets/fonts/Poppins-SemiBoldItalic.ttf'),
  'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
  'Poppins-BoldItalic': require('../assets/fonts/Poppins-BoldItalic.ttf'),
  'Poppins-ExtraBold': require('../assets/fonts/Poppins-ExtraBold.ttf'),
  'Poppins-ExtraBoldItalic': require('../assets/fonts/Poppins-ExtraBoldItalic.ttf'),
  'Poppins-Black': require('../assets/fonts/Poppins-Black.ttf'),
  'Poppins-BlackItalic': require('../assets/fonts/Poppins-BlackItalic.ttf'),
};

function normalizeFontWeight(fontWeight: unknown): keyof (typeof poppinsFamilyByWeight)['normal'] {
  if (typeof fontWeight === 'number') {
    if (fontWeight <= 100) return 100;
    if (fontWeight <= 200) return 200;
    if (fontWeight <= 300) return 300;
    if (fontWeight <= 400) return 400;
    if (fontWeight <= 500) return 500;
    if (fontWeight <= 600) return 600;
    if (fontWeight <= 700) return 700;
    if (fontWeight <= 800) return 800;
    return 900;
  }

  switch (fontWeight) {
    case '100':
    case 'thin':
      return 100;
    case '200':
    case 'ultralight':
      return 200;
    case '300':
    case 'light':
      return 300;
    case '500':
    case 'medium':
      return 500;
    case '600':
    case 'semibold':
      return 600;
    case '700':
    case 'bold':
      return 700;
    case '800':
    case 'heavy':
      return 800;
    case '900':
    case 'black':
      return 900;
    default:
      return 400;
  }
}

function isPoppinsFamily(fontFamily: unknown) {
  return typeof fontFamily !== 'string' || fontFamily.length === 0 || fontFamily.startsWith('Poppins');
}

function resolvePoppinsFontFamily(fontWeight: unknown, fontStyle: FontStyleValue) {
  const styleKey = fontStyle === 'italic' ? 'italic' : 'normal';
  const weightKey = normalizeFontWeight(fontWeight);
  return poppinsFamilyByWeight[styleKey][weightKey];
}

function mapPoppinsStyle(style: unknown) {
  const flattened = StyleSheet.flatten(style) ?? {};

  if (!isPoppinsFamily(flattened.fontFamily)) {
    return style;
  }

  const fontFamily = resolvePoppinsFontFamily(flattened.fontWeight, flattened.fontStyle);

  return [
    style,
    {
      fontFamily,
      fontWeight: undefined,
      fontStyle: undefined,
    },
  ];
}

function patchTextLikeComponent(component: TextLikeComponent) {
  if (component.__poppinsPatched || !component.render) {
    return;
  }

  const originalRender = component.render;

  component.render = function patchedRender(props, ref) {
    return originalRender(
      {
        ...props,
        style: mapPoppinsStyle(props?.style),
      },
      ref
    );
  };

  component.__poppinsPatched = true;
}

export function installPoppinsAsDefaultFont() {
  patchTextLikeComponent(Text as unknown as TextLikeComponent);
  patchTextLikeComponent(TextInput as unknown as TextLikeComponent);
}
