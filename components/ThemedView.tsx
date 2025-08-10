import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'default' | 'secondary' | 'card' | 'elevated';
};

function flattenStyle(input: any): any[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    const out: any[] = [];
    for (const item of input) out.push(...flattenStyle(item));
    return out.filter(Boolean);
  }
  return [input];
}

export function ThemedView({ style, lightColor, darkColor, variant = 'default', ...otherProps }: ThemedViewProps) {
  const getBackgroundKey = () => {
    switch (variant) {
      case 'secondary': return 'backgroundSecondary';
      case 'card': return 'backgroundCard';
      case 'elevated': return 'backgroundElevated';
      default: return 'background';
    }
  };

  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, getBackgroundKey());
  const styleArray = flattenStyle(style);
  return <View style={[{ backgroundColor }, ...styleArray]} {...otherProps} />;
}
