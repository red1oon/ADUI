// TaskListField.tsx v2.5 slight canvas adjust
// Save as: src/components/fields/TaskListField.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedGestureHandler,
  withTiming,
  runOnJS,
  useDerivedValue
} from 'react-native-reanimated';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';

// Import extracted components and types
import { TaskCard } from './tasks/TaskCard';
import { TaskMetricsHeader } from './tasks/TaskMetricsHeader';
import TaskGraphView from './tasks/TaskGraphView';
import { 
  TaskListFieldProps, 
  TaskListData, 
  TaskItem, 
  TaskMetrics,
  TaskViewMode 
} from './tasks/TaskTypes';

// ==================== MAIN TASK LIST FIELD COMPONENT ====================

const TaskListField: React.FC<TaskListFieldProps> = ({
  fieldDef,
  value,
  onChange,
  readonly = false
}) => {
  // ==================== STATE ====================
  
  // FIX 1: Start with graph overview (strategic view)
  const [viewMode, setViewMode] = useState<TaskViewMode>('graph');
  
  // FIX 2: Initialize scale at 0.5 for better visibility (graph overview)
  const scale = useSharedValue(0.5);
  const [currentZoom, setCurrentZoom] = useState(0.5);
  const initialScale = useSharedValue(0.5);
  const [debugInfo, setDebugInfo] = useState({ mode: 'graph', zoom: 50, scale: 50 });

  // Derived value for debug display (prevents Reanimated warnings)
  const debugScale = useDerivedValue(() => {
    return Math.round(scale.value * 100);
  });

  // ==================== DEBUG FUNCTIONS ====================
  
  const logGestureEvent = (stage: string, event: any, additionalInfo?: any) => {
    console.log(`🔧 GESTURE [${stage}]:`, {
      eventScale: event?.scale || 'N/A',
      scaleValue: scale.value,
      currentZoom,
      viewMode,
      initialScale: initialScale.value,
      ...additionalInfo
    });
  };

  const logViewModeChange = (newMode: TaskViewMode, reason: string) => {
    console.log(`🔧 VIEW MODE CHANGE: ${viewMode} → ${newMode} (${reason})`);
  };

  const updateDebugInfo = (mode: TaskViewMode, zoom: number, scaleVal: number) => {
    setDebugInfo({
      mode,
      zoom: Math.round(zoom * 100),
      scale: Math.round(scaleVal * 100)
    });
  };

  // ==================== DATA INITIALIZATION ====================

  const initializeTaskData = (): TaskListData => {
    if (value?.raw?.tasks && Array.isArray(value.raw.tasks)) {
      return value.raw as TaskListData;
    }
    
    if (fieldDef?.data?.tasks && Array.isArray(fieldDef.data.tasks)) {
      return fieldDef.data as TaskListData;
    }
    
    return { tasks: [] };
  };

  const taskData = initializeTaskData();
  const tasks = taskData.tasks || [];

  // UI Configuration
  const priorityColors = fieldDef?.ui?.priorityColors || {
    critical: '#E53E3E',
    high: '#FF9800',
    normal: '#3182CE',
    low: '#38A169'
  };

  // ==================== CALCULATED METRICS ====================

  const taskMetrics = useMemo((): TaskMetrics => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const inProgress = tasks.filter(task => task.status === 'in_progress').length;
    const blocked = tasks.filter(task => task.status === 'blocked').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const criticalPathTasks = tasks.filter(task => task.isCriticalPath).length;
    
    // Calculate overdue tasks
    const now = new Date();
    const overdueTasks = tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return dueDate < now && task.status !== 'completed';
    }).length;

    return { 
      total, 
      completed, 
      inProgress, 
      blocked, 
      percentage, 
      criticalPathTasks,
      overdueTasks 
    };
  }, [tasks]);

  // ==================== HANDLERS ====================

  const handleTaskStatusChange = useCallback((taskId: string, currentStatus: string) => {
    if (readonly) return;

    const statusCycle = {
      'not_started': 'in_progress',
      'in_progress': 'completed',
      'completed': 'not_started',
      'blocked': 'in_progress'
    };

    const newStatus = statusCycle[currentStatus] || 'not_started';
    const newCompletion = newStatus === 'completed' ? 100 : 
                         newStatus === 'in_progress' ? 50 : 0;

    const updatedTasks = tasks.map(task =>
      task.id === taskId 
        ? { ...task, status: newStatus as any, completion: newCompletion }
        : task
    );

    const updatedData: TaskListData = {
      ...taskData,
      tasks: updatedTasks
    };

    onChange({
      raw: updatedData,
      display: generateDisplayString(updatedTasks),
      metadata: { 
        type: 'task_list',
        lastUpdated: new Date().toISOString()
      }
    });
  }, [tasks, taskData, readonly, onChange]);

const generateDisplayString = useCallback((taskList: TaskItem[]): string => {
  const completed = taskList.filter(t => t.status === 'completed').length;
  const summary = `${completed} of ${taskList.length} tasks completed`;
  
  // Add individual task details
  const taskDetails = taskList.map(task => 
    `• ${task.name}: ${task.status} (${task.completion}%)`
  ).join('\n');
  
  return `${summary}\n\nTask Details:\n${taskDetails}`;
}, []);

  // Graph node tooltip handler
  const handleNodeTooltip = useCallback((task: TaskItem, position: { x: number; y: number }) => {
    console.log(`🔧 TOOLTIP: ${task.name} at position:`, position);
  }, []);

  // ==================== FIXED PINCH GESTURE HANDLER ====================

  const pinchHandler = useAnimatedGestureHandler({
    onStart: (event) => {
      console.log('🔧 PINCH START - Current Mode:', viewMode, 'Scale:', scale.value);
      initialScale.value = scale.value;
      runOnJS(logGestureEvent)('START', event, { 
        storedInitialScale: initialScale.value,
        currentMode: viewMode
      });
    },
    onActive: (event) => {
      // Calculate absolute scale from relative gesture
      const newScale = Math.max(0.05, Math.min(2, initialScale.value * event.scale));  // ✅ Allow 5% zoom
      scale.value = newScale;
      
      console.log('🔧 PINCH ACTIVE - New Scale:', newScale, 'Current Mode:', viewMode);
      
      // FIXED: Clear threshold logic for mode switching
      const shouldBeCards = newScale > 0.9;   // Higher threshold for cards
      const shouldBeGraph = newScale <= 0.9;  // Lower threshold for graph
      
      if (shouldBeCards && viewMode === 'graph') {
        runOnJS(setViewMode)('cards');
        runOnJS(setCurrentZoom)(newScale);
        runOnJS(logViewModeChange)('cards', `Scale ${newScale.toFixed(2)} > 0.8 (Switch to Cards)`);
        runOnJS(updateDebugInfo)('cards', newScale, newScale);
      } else if (shouldBeGraph && viewMode === 'cards') {
        runOnJS(setViewMode)('graph');
        runOnJS(setCurrentZoom)(newScale);
        runOnJS(logViewModeChange)('graph', `Scale ${newScale.toFixed(2)} <= 0.8 (Switch to Graph)`);
        runOnJS(updateDebugInfo)('graph', newScale, newScale);
      }
    },
    onEnd: (event) => {
      console.log('🔧 PINCH END - Final Scale:', scale.value, 'Mode:', viewMode);
      
      // FIXED: Clear snap levels
      const currentScale = scale.value;
      let targetScale: number;
      let finalMode: TaskViewMode;
      
      if (currentScale < 0.15) {
        targetScale = 0.1;   // ✅ Ultra-tiny overview (10%)
        finalMode = 'graph';
      } else if (currentScale < 0.3) {
        targetScale = 0.2;   // ✅ Very small overview (20%)
        finalMode = 'graph';
      } else if (currentScale < 0.6) {
        targetScale = 0.5;   // Standard graph view  
        finalMode = 'graph';
      } else {
        targetScale = 1.0;   // Card details view
        finalMode = 'cards';
      }
      
      scale.value = withTiming(targetScale, { duration: 200 });
      
      runOnJS(setCurrentZoom)(targetScale);
      runOnJS(setViewMode)(finalMode);
      runOnJS(logViewModeChange)(finalMode, `Snapped to ${targetScale} (${finalMode})`);
      runOnJS(updateDebugInfo)(finalMode, targetScale, targetScale);
    },
    onFail: (event) => {
      console.log('🔧 PINCH FAILED');
      runOnJS(logGestureEvent)('FAILED', event);
    },
    onCancel: (event) => {
      console.log('🔧 PINCH CANCELLED');
      runOnJS(logGestureEvent)('CANCELLED', event);
    }
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      //transform: [{ scale: Math.max(scale.value, 0.7) }],
    };
  });

  // ==================== RENDER ====================

  if (tasks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Tasks</Text>
        <Text style={styles.emptyText}>No project tasks are configured.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Metrics */}
      <TaskMetricsHeader
        fieldName={fieldDef.name}
        metrics={taskMetrics}
        showCriticalPath={true}
        showOverdueWarning={true}
      />

      {/* FIXED: Pinch gesture wraps the entire content area */}
      <PinchGestureHandler 
        onGestureEvent={pinchHandler}
        minPointers={2}
        maxPointers={2}
        shouldCancelWhenOutside={false}
      >
        <Animated.View style={[styles.zoomableContainer, animatedStyle]}>
          {viewMode === 'cards' ? (
            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              scrollEnabled={true}
              simultaneousHandlers={[]}
            >
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleTaskStatusChange}
                  readonly={readonly}
                  priorityColors={priorityColors}
                  zoomScale={currentZoom}
                />
              ))}
            </ScrollView>
          ) : (
            <TaskGraphView
              taskData={taskData}
              priorityColors={priorityColors}
              zoomScale={currentZoom}
              onNodeTooltip={handleNodeTooltip}
              onTaskStatusChange={handleTaskStatusChange}  // ← ADD THIS LINE
              readonly={readonly}                
            />
          )}
        </Animated.View>
      </PinchGestureHandler>
    </View>
  );
};

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  zoomableContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // Debug Info
  debugContainer: {
    backgroundColor: '#e8f5e8',
    padding: 6,
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  debugText: {
    fontSize: 11,
    color: '#2e7d32',
    textAlign: 'center',
    fontFamily: 'monospace',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f5f7fa',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default TaskListField;