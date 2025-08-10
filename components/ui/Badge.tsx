import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export type BadgeProps = {
  children: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
};

export function Badge({ children, variant = 'default', size = 'medium' }: BadgeProps) {
  const getColors = () => {
    switch (variant) {
      case 'primary':
        return {
          background: useThemeColor({}, 'primary'),
          text: useThemeColor({}, 'textInverse'),
        };
      case 'success':
        return {
          background: useThemeColor({}, 'successLight'),
          text: useThemeColor({}, 'success'),
        };
      case 'warning':
        return {
          background: useThemeColor({}, 'warningLight'),
          text: useThemeColor({}, 'warning'),
        };
      case 'error':
        return {
          background: useThemeColor({}, 'errorLight'),
          text: useThemeColor({}, 'error'),
        };
      default:
        return {
          background: useThemeColor({}, 'backgroundCard'),
          text: useThemeColor({}, 'textSecondary'),
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 2,
          paddingHorizontal: 8,
          borderRadius: 6,
          fontSize: 12,
        };
      case 'large':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 12,
          fontSize: 16,
        };
      default: // medium
        return {
          paddingVertical: 4,
          paddingHorizontal: 12,
          borderRadius: 8,
          fontSize: 14,
        };
    }
  };

  const colors = getColors();
  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.background,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          borderRadius: sizeStyles.borderRadius,
        },
      ]}
    >
      <ThemedText
        type="caption"
        style={{
          color: colors.text,
          fontSize: sizeStyles.fontSize,
          fontWeight: '600',
        }}
      >
        {children}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
});