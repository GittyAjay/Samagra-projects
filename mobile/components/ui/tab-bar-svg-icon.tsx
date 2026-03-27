import Svg, { Circle, Path, Rect } from 'react-native-svg';

type TabBarSvgIconProps = {
  color: string;
  name: 'dashboard' | 'orders' | 'shop' | 'support' | 'leads';
  size?: number;
};

export function TabBarSvgIcon({ color, name, size = 22 }: TabBarSvgIconProps) {
  if (name === 'dashboard') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="4" y="4" width="6" height="6" rx="1.5" stroke={color} strokeWidth="2" />
        <Rect x="14" y="4" width="6" height="6" rx="1.5" stroke={color} strokeWidth="2" />
        <Rect x="4" y="14" width="6" height="6" rx="1.5" stroke={color} strokeWidth="2" />
        <Rect x="14" y="14" width="6" height="6" rx="1.5" stroke={color} strokeWidth="2" />
      </Svg>
    );
  }

  if (name === 'orders') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M3.5 7.5H20.5V18.5H3.5V7.5Z"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <Path d="M3.5 7.5L7 4.5H17L20.5 7.5" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <Path d="M12 10V14" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Path d="M9.5 12H14.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </Svg>
    );
  }

  if (name === 'leads') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M16 11C17.6569 11 19 9.65685 19 8C19 6.34315 17.6569 5 16 5C14.3431 5 13 6.34315 13 8C13 9.65685 14.3431 11 16 11Z"
          stroke={color}
          strokeWidth="2"
        />
        <Path
          d="M8 11C9.65685 11 11 9.65685 11 8C11 6.34315 9.65685 5 8 5C6.34315 5 5 6.34315 5 8C5 9.65685 6.34315 11 8 11Z"
          stroke={color}
          strokeWidth="2"
        />
        <Path
          d="M2 19.5C2 16.4624 4.46243 14 7.5 14H8.5C11.5376 14 14 16.4624 14 19.5"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Path
          d="M14 19.5C14 17.567 15.567 16 17.5 16H18.5C20.433 16 22 17.567 22 19.5"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  if (name === 'shop') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M6 9.5L7.2 5.5H16.8L18 9.5"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M5 9.5H19V17.5C19 18.6046 18.1046 19.5 17 19.5H7C5.89543 19.5 5 18.6046 5 17.5V9.5Z"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <Path d="M9 12H15" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 13.8101 4.60113 15.4799 5.61545 16.8214C5.87006 17.1581 5.9957 17.5659 5.93127 17.9833L5.5 20L7.64864 19.4828C8.00571 19.3969 8.38266 19.4711 8.68822 19.674C9.67484 20.3294 10.8587 20.7126 12 20Z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <Circle cx="9" cy="12" r="1" fill={color} />
      <Circle cx="12" cy="12" r="1" fill={color} />
      <Circle cx="15" cy="12" r="1" fill={color} />
    </Svg>
  );
}
