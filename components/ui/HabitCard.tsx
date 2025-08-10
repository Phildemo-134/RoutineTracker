import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import type { Habit } from '@/types/habit';
import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { Badge } from './Badge';
import { Button } from './Button';
import { Card } from './Card';

export type HabitCardProps = {
  habit: Habit;
  isCompleted: boolean;
  onPress: () => void;
  onToggle: () => void;
};

export function HabitCard({ habit, isCompleted, onPress, onToggle }: HabitCardProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const successColor = useThemeColor({}, 'success');
  const progressAnim = React.useRef(new Animated.Value(isCompleted ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: isCompleted ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isCompleted, progressAnim]);

  const getFrequencyText = () => {
    switch (habit.frequency.kind) {
      case 'daily':
        return 'Quotidien';
      case 'weekly':
        const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        return habit.frequency.daysOfWeek.map(d => days[d]).join(', ');
      case 'custom':
        return `Tous les ${habit.frequency.intervalDays} jours`;
      default:
        return 'Quotidien';
    }
  };

  const getTargetText = () => {
    if (habit.quantity.kind === 'boolean') {
      return 'Oui/Non';
    }
    return `Objectif: ${habit.quantity.target}`;
  };

  return (
    <AnimatedPressable onPress={onPress}>
      <Card elevation="low" style={styles.card}>
      <View style={styles.content}>
        {/* Header with habit name and category */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <ThemedText type="title" style={styles.habitName}>
              {habit.name}
            </ThemedText>
            {habit.categoryId && (
              <Badge variant="default" size="small">
                {habit.categoryId}
              </Badge>
            )}
          </View>
        </View>

        {/* Habit details */}
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <ThemedText type="caption" color="secondary">
              Fréquence
            </ThemedText>
            <ThemedText type="body" style={styles.detailValue}>
              {getFrequencyText()}
            </ThemedText>
          </View>

          <View style={styles.detailItem}>
            <ThemedText type="caption" color="secondary">
              Type
            </ThemedText>
            <ThemedText type="body" style={styles.detailValue}>
              {getTargetText()}
            </ThemedText>
          </View>
        </View>

        {/* Action button */}
        <View style={styles.actionContainer}>
          <Button
            title={isCompleted ? 'Complété ✓' : 'Compléter'}
            variant={isCompleted ? 'success' : 'primary'}
            size="medium"
            onPress={onToggle}
            style={styles.actionButton}
          />
        </View>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              {
                backgroundColor: useThemeColor({}, 'border'),
              },
            ]}
          >
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: isCompleted ? successColor : primaryColor,
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>
      </View>
      </Card>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  habitName: {
    flex: 1,
    marginRight: 8,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailItem: {
    flex: 1,
  },
  detailValue: {
    marginTop: 4,
    fontWeight: '500',
  },
  actionContainer: {
    marginBottom: 16,
  },
  actionButton: {
    width: '100%',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});