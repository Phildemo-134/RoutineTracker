import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
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

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const styleArray = flattenStyle(style);
  return <View style={[{ backgroundColor }, ...styleArray]} {...otherProps} />;
}
