import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'heading1' | 'heading2' | 'heading3' | 'subtitle' | 'body' | 'caption' | 'link' | 'button';
  color?: 'default' | 'secondary' | 'muted' | 'inverse' | 'primary' | 'success' | 'warning' | 'error';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  color: colorType = 'default',
  ...rest
}: ThemedTextProps) {
  // Determine the color based on colorType or fallback to lightColor/darkColor
  const getColorKey = () => {
    switch (colorType) {
      case 'secondary': return 'textSecondary';
      case 'muted': return 'textMuted';
      case 'inverse': return 'textInverse';
      case 'primary': return 'primary';
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'text';
    }
  };

  const textColor = useThemeColor({ light: lightColor, dark: darkColor }, getColorKey());
  
  function flattenStyle(input: any): any[] {
    if (!input) return [];
    if (Array.isArray(input)) {
      const out: any[] = [];
      for (const item of input) out.push(...flattenStyle(item));
      return out.filter(Boolean);
    }
    return [input];
  }
  const styleArray = flattenStyle(style);

  return (
    <Text
      style={[
        { color: textColor },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'heading1' ? styles.heading1 : undefined,
        type === 'heading2' ? styles.heading2 : undefined,
        type === 'heading3' ? styles.heading3 : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'body' ? styles.body : undefined,
        type === 'caption' ? styles.caption : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'button' ? styles.button : undefined,
        ...styleArray,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  heading1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  heading2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  heading3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  button: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
