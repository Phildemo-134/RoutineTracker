import React from 'react';
import { Animated, Pressable, type PressableProps } from 'react-native';

export type AnimatedPressableProps = PressableProps & {
  children: React.ReactNode;
  scaleValue?: number;
  duration?: number;
};

export function AnimatedPressable({
  children,
  scaleValue = 0.95,
  duration = 100,
  style,
  ...props
}: AnimatedPressableProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: scaleValue,
      duration,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={style}
      {...props}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}