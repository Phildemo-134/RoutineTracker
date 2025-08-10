import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

export type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
};

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  size = 'medium',
  style,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'textMuted');
  const backgroundColor = useThemeColor({}, 'backgroundCard');
  const borderColor = useThemeColor({}, error ? 'error' : isFocused ? 'borderFocus' : 'border');

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          height: 40,
          paddingHorizontal: 12,
          fontSize: 14,
        };
      case 'large':
        return {
          height: 56,
          paddingHorizontal: 16,
          fontSize: 18,
        };
      default: // medium
        return {
          height: 48,
          paddingHorizontal: 14,
          fontSize: 16,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={styles.container}>
      {label && (
        <ThemedText type="caption" color="secondary" style={styles.label}>
          {label}
        </ThemedText>
      )}
      
      <View
        style={[
          styles.inputContainer,
          sizeStyles,
          {
            backgroundColor,
            borderColor,
            borderWidth: error ? 2 : 1,
          },
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <TextInput
          style={[
            styles.input,
            {
              color: textColor,
              fontSize: sizeStyles.fontSize,
              paddingLeft: leftIcon ? 8 : 0,
              paddingRight: rightIcon ? 8 : 0,
            },
            style,
          ]}
          placeholderTextColor={placeholderColor}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>

      {(error || helperText) && (
        <ThemedText
          type="caption"
          color={error ? 'error' : 'secondary'}
          style={styles.helperText}
        >
          {error || helperText}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    flex: 1,
    fontWeight: '400',
  },
  leftIcon: {
    marginLeft: 12,
  },
  rightIcon: {
    marginRight: 12,
  },
  helperText: {
    marginTop: 6,
    marginLeft: 4,
  },
});