import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

export type ToggleOption = {
  value: string;
  label: string;
};

export type ToggleGroupProps = {
  options: ToggleOption[];
  value: string;
  onValueChange: (value: string) => void;
  multiple?: boolean;
  size?: 'small' | 'medium' | 'large';
};

export function ToggleGroup({
  options,
  value,
  onValueChange,
  multiple = false,
  size = 'medium',
}: ToggleGroupProps) {
  const backgroundColor = useThemeColor({}, 'backgroundCard');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const textInverseColor = useThemeColor({}, 'textInverse');

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 6,
        };
      case 'large':
        return {
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 12,
        };
      default: // medium
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 8,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const handlePress = (optionValue: string) => {
    if (multiple) {
      const values = value.split(',').filter(Boolean);
      const newValues = values.includes(optionValue)
        ? values.filter(v => v !== optionValue)
        : [...values, optionValue];
      onValueChange(newValues.join(','));
    } else {
      onValueChange(optionValue);
    }
  };

  const isSelected = (optionValue: string) => {
    if (multiple) {
      return value.split(',').includes(optionValue);
    }
    return value === optionValue;
  };

  return (
    <View style={styles.container}>
      {options.map((option, index) => {
        const selected = isSelected(option.value);
        return (
          <Pressable
            key={option.value}
            style={({ pressed }) => [
              styles.option,
              sizeStyles,
              {
                backgroundColor: selected ? primaryColor : backgroundColor,
                borderColor: selected ? primaryColor : borderColor,
                opacity: pressed ? 0.8 : 1,
              },
              index === 0 && styles.firstOption,
              index === options.length - 1 && styles.lastOption,
            ]}
            onPress={() => handlePress(option.value)}
          >
            <ThemedText
              type="body"
              style={{
                color: selected ? textInverseColor : textColor,
                fontWeight: selected ? '600' : '400',
              }}
            >
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  firstOption: {
    // Could add specific styles for first option if needed
  },
  lastOption: {
    // Could add specific styles for last option if needed
  },
});