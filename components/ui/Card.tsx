import { ThemedView, type ThemedViewProps } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';

export type CardProps = ThemedViewProps & {
  pressable?: boolean;
  onPress?: PressableProps['onPress'];
  elevation?: 'none' | 'low' | 'medium' | 'high';
};

export function Card({
  children,
  pressable = false,
  onPress,
  elevation = 'low',
  style,
  ...props
}: CardProps) {
  const shadowColor = useThemeColor({}, 'shadow');
  const borderColor = useThemeColor({}, 'border');

  const getElevationStyles = () => {
    switch (elevation) {
      case 'none':
        return {
          shadowOpacity: 0,
          elevation: 0,
        };
      case 'medium':
        return {
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 4,
        };
      case 'high':
        return {
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2,
          shadowRadius: 16,
          elevation: 8,
        };
      default: // low
        return {
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        };
    }
  };

  const elevationStyles = getElevationStyles();

  const cardStyles = [
    styles.card,
    {
      shadowColor,
      borderColor,
      ...elevationStyles,
    },
    style,
  ];

  if (pressable && onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          cardStyles,
          { opacity: pressed ? 0.95 : 1 }
        ]}
      >
        <ThemedView variant="card" style={styles.content} {...props}>
          {children}
        </ThemedView>
      </Pressable>
    );
  }

  return (
    <ThemedView variant="card" style={cardStyles} {...props}>
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
});