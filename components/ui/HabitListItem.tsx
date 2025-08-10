import { ThemedText } from '@/components/ThemedText';
import type { Habit } from '@/types/habit';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { Badge } from './Badge';
import { Button } from './Button';
import { Card } from './Card';

export type HabitListItemProps = {
  habit: Habit;
  onDelete: () => void;
  onPress?: () => void;
};

export function HabitListItem({ habit, onDelete, onPress }: HabitListItemProps) {
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

  const content = (
    <Card elevation="low" style={styles.card}>
      <View style={styles.content}>
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

        <View style={styles.actions}>
          <Button
            title="Supprimer"
            variant="error"
            size="small"
            onPress={onDelete}
            style={styles.deleteButton}
          />
        </View>
      </View>
    </Card>
  );

  if (onPress) {
    return (
      <AnimatedPressable onPress={onPress} style={styles.container}>
        {content}
      </AnimatedPressable>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    // Card styles are handled by the Card component
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 12,
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
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
  },
  detailValue: {
    marginTop: 4,
    fontWeight: '500',
  },
  actions: {
    alignItems: 'flex-end',
  },
  deleteButton: {
    minWidth: 100,
  },
});