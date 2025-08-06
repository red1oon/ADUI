// TaskMetricsHeader.tsx v1.0 - Task List Progress and Metrics Header
// Displays overall project progress, metrics, and status summary
// Save as: src/components/fields/tasks/TaskMetricsHeader.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TaskMetrics } from './TaskTypes';

interface TaskMetricsHeaderProps {
  fieldName: string;
  metrics: TaskMetrics;
  showCriticalPath?: boolean;
  showOverdueWarning?: boolean;
}

export const TaskMetricsHeader: React.FC<TaskMetricsHeaderProps> = ({
  fieldName,
  metrics,
  showCriticalPath = true,
  showOverdueWarning = true
}) => {

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return '#4CAF50'; // Green - excellent
    if (percentage >= 70) return '#8BC34A'; // Light green - good
    if (percentage >= 50) return '#FF9800'; // Orange - moderate
    return '#F44336'; // Red - needs attention
  };

  const formatProgressText = (): string => {
    const { completed, total, percentage } = metrics;
    return `${completed} of ${total} completed (${percentage}%)`;
  };

  const renderStatusBreakdown = (): string => {
    const { inProgress, blocked } = metrics;
    const parts = [];
    
    if (inProgress > 0) parts.push(`${inProgress} in progress`);
    if (blocked > 0) parts.push(`${blocked} blocked`);
    
    return parts.length > 0 ? ` • ${parts.join(' • ')}` : '';
  };

  return (
    <View style={styles.header}>
      {/* Field Title */}
      <Text style={styles.fieldTitle}>
        {fieldName || 'Project Tasks'}
      </Text>
      
      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {formatProgressText()}
            <Text style={styles.statusBreakdown}>
              {renderStatusBreakdown()}
            </Text>
          </Text>
        </View>
        
        {/* Critical Path & Overdue Indicators */}
        <View style={styles.indicators}>
          {showCriticalPath && metrics.criticalPathTasks > 0 && (
            <View style={styles.criticalPathBadge}>
              <Text style={styles.criticalPathText}>
                🔴 {metrics.criticalPathTasks} CP
              </Text>
            </View>
          )}
          
          {showOverdueWarning && metrics.overdueTasks > 0 && (
            <View style={styles.overdueBadge}>
              <Text style={styles.overdueText}>
                ⚠️ {metrics.overdueTasks} overdue
              </Text>
            </View>
          )}
        </View>
      </View>
      
      {/* Overall Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                width: `${metrics.percentage}%`,
                backgroundColor: getProgressColor(metrics.percentage)
              }
            ]} 
          />
        </View>
        
        {/* Progress Segments */}
        <View style={styles.progressSegments}>
          <Text style={styles.segmentLabel}>
            ✅ {metrics.completed}
          </Text>
          {metrics.inProgress > 0 && (
            <Text style={styles.segmentLabel}>
              🟡 {metrics.inProgress}
            </Text>
          )}
          {metrics.blocked > 0 && (
            <Text style={styles.segmentLabel}>
              ⚠️ {metrics.blocked}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e6ed',
  },
  fieldTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  progressInfo: {
    flex: 1,
    marginRight: 12,
  },
  progressText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statusBreakdown: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'normal',
  },
  indicators: {
    alignItems: 'flex-end',
    gap: 4,
  },
  criticalPathBadge: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  criticalPathText: {
    fontSize: 11,
    color: '#c62828',
    fontWeight: '600',
  },
  overdueBadge: {
    backgroundColor: '#fff3e0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffcc02',
  },
  overdueText: {
    fontSize: 11,
    color: '#f57c00',
    fontWeight: '600',
  },
  progressBarContainer: {
    gap: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#e0e6ed',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },
  progressSegments: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  segmentLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
});