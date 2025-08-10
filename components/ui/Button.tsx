import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, View, type PressableProps } from 'react-native';

export type ButtonProps = PressableProps & {
  title: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export function Button({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled,
  leftIcon,
  rightIcon,
  style,
  ...props
}: ButtonProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const getColors = () => {
    switch (variant) {
      case 'primary':
        return {
          background: useThemeColor({}, 'primary'),
          text: useThemeColor({}, 'textInverse'),
          border: 'transparent',
        };
      case 'secondary':
        return {
          background: useThemeColor({}, 'backgroundCard'),
          text: useThemeColor({}, 'text'),
          border: useThemeColor({}, 'border'),
        };
      case 'success':
        return {
          background: useThemeColor({}, 'success'),
          text: useThemeColor({}, 'textInverse'),
          border: 'transparent',
        };
      case 'warning':
        return {
          background: useThemeColor({}, 'warning'),
          text: useThemeColor({}, 'textInverse'),
          border: 'transparent',
        };
      case 'error':
        return {
          background: useThemeColor({}, 'error'),
          text: useThemeColor({}, 'textInverse'),
          border: 'transparent',
        };
      case 'ghost':
        return {
          background: 'transparent',
          text: useThemeColor({}, 'primary'),
          border: 'transparent',
        };
      default:
        return {
          background: useThemeColor({}, 'primary'),
          text: useThemeColor({}, 'textInverse'),
          border: 'transparent',
        };
    }
  };

  const colors = getColors();
  const isDisabled = disabled || loading;

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 8,
          minHeight: 36,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 24,
          borderRadius: 12,
          minHeight: 56,
        };
      default: // medium
        return {
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 10,
          minHeight: 48,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const handlePressIn = () => {
    if (!isDisabled) {
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      {...props}
    >
      <Animated.View
        style={[
          styles.button,
          sizeStyles,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderWidth: variant === 'secondary' ? 1 : 0,
            opacity: isDisabled ? 0.6 : 1,
            transform: [{ scale: scaleAnim }],
          },
          style,
        ]}
      >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.text} />
        ) : (
          <>
            {leftIcon}
            <ThemedText
              type="button"
              style={{
                color: colors.text,
                marginLeft: leftIcon ? 8 : 0,
                marginRight: rightIcon ? 8 : 0,
              }}
            >
              {title}
            </ThemedText>
            {rightIcon}
          </>
        )}
      </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});