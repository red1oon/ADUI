// TaskCard.tsx v1.0 - Individual Task Card Component
// Displays single task with status, priority, progress, and interactive elements
// Save as: src/components/fields/tasks/TaskCard.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TaskItem } from './TaskTypes';

interface TaskCardProps {
  task: TaskItem;
  onStatusChange: (taskId: string, status: string) => void;
  readonly: boolean;
  priorityColors: Record<string, string>;
  zoomScale: number;
}

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onStatusChange, 
  readonly, 
  priorityColors, 
  zoomScale 
}) => {
  
  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'completed': return '✅';
      case 'in_progress': return '🟡';
      case 'blocked': return '⚠️';
      default: return '🔵';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return '#E8F5E8';
      case 'in_progress': return '#FFF8E1';
      case 'blocked': return '#FFEBEE';
      default: return '#F3F4F6';
    }
  };

  const formatDueDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due Today';
    if (diffDays === 1) return 'Due Tomorrow';
    return `Due in ${diffDays} days`;
  };

  const getDueDateColor = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return '#F44336'; // Overdue - red
    if (diffDays <= 1) return '#FF9800'; // Due soon - orange
    return '#666'; // Normal - gray
  };

  const priorityColor = priorityColors[task.priority] || '#666';

  return (
    <TouchableOpacity
      style={[
        styles.taskCard,
        { 
          backgroundColor: getStatusColor(task.status),
          borderLeftColor: priorityColor,
          opacity: zoomScale > 0.5 ? 1 : 0.8,
          transform: [{ scale: Math.max(zoomScale, 0.3) }]
        }
      ]}
      onPress={() => !readonly && onStatusChange(task.id, task.status)}
      disabled={readonly}
      activeOpacity={0.7}
    >
      {/* Task Header */}
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleContainer}>
          <Text style={styles.statusIcon}>{getStatusIcon(task.status)}</Text>
          <Text style={styles.taskName} numberOfLines={2}>
            {task.name}
          </Text>
          {task.isCriticalPath && (
            <View style={styles.criticalPathIndicator}>
              <Text style={styles.criticalPathText}>CP</Text>
            </View>
          )}
        </View>
      </View>

      {/* Task Details - Only show at higher zoom levels */}
      {zoomScale > 0.6 && (
        <View style={styles.taskDetails}>
          <View style={styles.taskMeta}>
            {task.assignee && (
              <Text style={styles.assigneeText}>👤 {task.assignee}</Text>
            )}
            {task.phase && (
              <Text style={styles.phaseText}>📁 {task.phase}</Text>
            )}
          </View>
          
          <View style={styles.dueDateContainer}>
            <Text style={[styles.dueDateText, { color: getDueDateColor(task.dueDate) }]}>
              {formatDueDate(task.dueDate)}
            </Text>
          </View>
        </View>
      )}

      {/* Progress Bar - Only show at medium zoom levels */}
      {zoomScale > 0.4 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${task.completion}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{task.completion}%</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    marginBottom: 8,
  },
  taskTitleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  statusIcon: {
    fontSize: 18,
    marginTop: 2,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  criticalPathIndicator: {
    backgroundColor: '#E53E3E',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  criticalPathText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  taskDetails: {
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  assigneeText: {
    fontSize: 12,
    color: '#666',
  },
  phaseText: {
    fontSize: 12,
    color: '#666',
  },
  dueDateContainer: {
    alignItems: 'flex-start',
  },
  dueDateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarBackground: {
    flex: 1,
    height: 4,
    backgroundColor: '#e0e6ed',
    borderRadius: 2,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#48BB78',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    minWidth: 35,
    textAlign: 'right',
  },
});