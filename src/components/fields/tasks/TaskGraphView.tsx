// TaskGraphView.tsx v1.9 - Multi-Node Selection Persistence Fix
// Fixed node tapping to persist multiple selections in graph view mode
// Save as: src/components/fields/tasks/TaskGraphView.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity,
  ScrollView 
} from 'react-native';
import { TaskItem, GraphNode, GraphEdge, TaskListData } from './TaskTypes';

// ==================== EASY TUNING CONFIGURATION ====================
const LAYOUT_CONFIG = {
  // Node dimensions - TUNE THESE EASILY
  NODE_WIDTH: 220,
  NODE_HEIGHT: 150,
  
  // Grid configuration
  GRID_COLS: 3,
  GRID_ROWS: 3,
  NODE_SPACING: 16,
  
  // Container padding
  CONTAINER_PADDING: 16,
  
  // Connection line settings
  CONNECTION_LINE_WIDTH: 3,
  CRITICAL_LINE_WIDTH: 4,
  ARROW_SIZE: 8,
  
  // Connection anchor points (as fraction of node size)
  CONNECTION_ANCHOR_X: 0.8, // Right side of node
  CONNECTION_ANCHOR_Y: 0.5, // Middle of node
} as const;

interface TaskGraphViewProps {
  taskData: TaskListData;
  priorityColors: Record<string, string>;
  zoomScale: number;
  onNodeTooltip?: (task: TaskItem, position: { x: number; y: number }) => void;
  onTaskStatusChange?: (taskId: string, currentStatus: string) => void;
  readonly?: boolean;
}

// ==================== MULTI-SELECTION STATE TYPES ====================
interface TooltipData {
  task: TaskItem;
  x: number;
  y: number;
}

export const TaskGraphView: React.FC<TaskGraphViewProps> = ({
  taskData,
  priorityColors,
  zoomScale,
  onNodeTooltip,
  onTaskStatusChange,
  readonly = false
}) => {
  // ==================== MULTI-SELECTION STATE ====================
  // ✅ FIX: Changed from single tooltip to multi-selection state
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [activeTooltips, setActiveTooltips] = useState<Map<string, TooltipData>>(new Map());

  // ==================== DATA PREPARATION ====================
  const { tasks = [], relationships = [] } = taskData;
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // ==================== LAYOUT CALCULATIONS ====================
  const layoutMetrics = useMemo(() => {
    const { NODE_WIDTH, NODE_HEIGHT, GRID_COLS, NODE_SPACING, CONTAINER_PADDING } = LAYOUT_CONFIG;
    
    // Calculate total grid dimensions
    const totalGridWidth = GRID_COLS * NODE_WIDTH + (GRID_COLS - 1) * NODE_SPACING;
    const totalGridHeight = LAYOUT_CONFIG.GRID_ROWS * NODE_HEIGHT + (LAYOUT_CONFIG.GRID_ROWS - 1) * NODE_SPACING;
    
    // Calculate start positions (center the grid if it fits, otherwise start from padding)
    const startX = totalGridWidth > screenWidth ? 
      CONTAINER_PADDING : 
      (screenWidth - totalGridWidth) / 2;
    
    const startY = Math.max(CONTAINER_PADDING, (screenHeight - totalGridHeight) / 4);
    
    // Container dimensions for ScrollView
    const containerWidth = Math.max(totalGridWidth + (2 * CONTAINER_PADDING), screenWidth);
    const containerHeight = totalGridHeight + (6 * CONTAINER_PADDING);
    
    console.log('📐 Layout Metrics:', {
      nodeSize: `${NODE_WIDTH}x${NODE_HEIGHT}`,
      gridSize: `${totalGridWidth}x${totalGridHeight}`,
      startPos: `${startX},${startY}`,
      willScroll: totalGridWidth > screenWidth
    });
    
    return {
      nodeWidth: NODE_WIDTH,
      nodeHeight: NODE_HEIGHT,
      spacing: NODE_SPACING,
      cols: GRID_COLS,
      startX,
      startY,
      totalGridWidth,
      totalGridHeight,
      containerWidth,
      containerHeight,
      willScrollHorizontally: totalGridWidth > screenWidth
    };
  }, [screenWidth, screenHeight]);

  // ==================== HELPER FUNCTIONS ====================
  const getStatusColor = useCallback((status: string): string => {
    switch (status) {
      case 'completed': return '#3B82F6';
      case 'in_progress': return '#22C55E';
      case 'blocked': return '#EF4444';
      default: return '#808080';
    }
  }, []);

  const getPriorityGradient = useCallback((priority: string): string => {
    switch (priority) {
      case 'critical': return '#DC2626';
      case 'high': return '#EA580C';
      case 'normal': return '#2563EB';
      case 'low': return '#16A34A';
      default: return '#6B7280';
    }
  }, []);

  // ✅ FIX: Updated to clear all selections instead of single tooltip
  const clearAllSelections = useCallback(() => {
    setSelectedNodes(new Set());
    setActiveTooltips(new Map());
  }, []);

  // ==================== PROGRESS BAR TAP HANDLER ====================
  const handleProgressTap = useCallback((task: TaskItem, event: any) => {
    if (readonly || !onTaskStatusChange) return;
    
    // Stop event from bubbling to the main node tap
    event.stopPropagation();
    
    console.log('🎯 Progress bar tapped for task:', task.name);
    onTaskStatusChange(task.id, task.status);
  }, [readonly, onTaskStatusChange]);

  // ==================== NODE POSITIONING HELPER ====================
  const getNodePosition = useCallback((taskIndex: number) => {
    const { cols, nodeWidth, nodeHeight, spacing, startX, startY } = layoutMetrics;
    
    const row = Math.floor(taskIndex / cols);
    const col = taskIndex % cols;
    
    return {
      x: startX + col * (nodeWidth + spacing),
      y: startY + row * (nodeHeight + spacing),
      centerX: startX + col * (nodeWidth + spacing) + nodeWidth * LAYOUT_CONFIG.CONNECTION_ANCHOR_X,
      centerY: startY + row * (nodeHeight + spacing) + nodeHeight * LAYOUT_CONFIG.CONNECTION_ANCHOR_Y,
    };
  }, [layoutMetrics]);

  // ==================== CONNECTION LINES RENDERING ====================
  const renderConnectionLines = useCallback(() => {
    if (!relationships || relationships.length === 0) return null;

    return relationships.map((rel, index) => {
      const fromTask = tasks.find(t => t.id === rel.from);
      const toTask = tasks.find(t => t.id === rel.to);
      
      if (!fromTask || !toTask) return null;

      const fromIndex = tasks.findIndex(t => t.id === rel.from);
      const toIndex = tasks.findIndex(t => t.id === rel.to);
      
      if (fromIndex === -1 || toIndex === -1) return null;

      const fromPos = getNodePosition(fromIndex);
      const toPos = getNodePosition(toIndex);

      // Calculate connection line
      const deltaX = toPos.centerX - fromPos.centerX;
      const deltaY = toPos.centerY - fromPos.centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

      // Determine line style based on critical path
      const isCriticalPath = fromTask.isCriticalPath && toTask.isCriticalPath;
      const lineColor = isCriticalPath ? '#DC2626' : '#3B82F6';
      const lineWidth = isCriticalPath ? LAYOUT_CONFIG.CRITICAL_LINE_WIDTH : LAYOUT_CONFIG.CONNECTION_LINE_WIDTH;

      return (
        <View key={`connection-${rel.from}-${rel.to}-${index}`}>
          {/* Main connection line */}
          <View
            style={[
              styles.connectionLine,
              {
                left: fromPos.centerX,
                top: fromPos.centerY - lineWidth / 2,
                width: distance,
                height: lineWidth,
                backgroundColor: lineColor,
                transform: [{ rotate: `${angle}deg` }],
                transformOrigin: '0 50%',
              }
            ]}
          />
          
          {/* Arrow head at destination */}
          <View
            style={[
              styles.arrowHead,
              {
                left: toPos.centerX - LAYOUT_CONFIG.ARROW_SIZE / 2,
                top: toPos.centerY - LAYOUT_CONFIG.ARROW_SIZE / 2,
                borderLeftColor: lineColor,
                borderLeftWidth: LAYOUT_CONFIG.ARROW_SIZE,
                borderTopWidth: LAYOUT_CONFIG.ARROW_SIZE / 2,
                borderBottomWidth: LAYOUT_CONFIG.ARROW_SIZE / 2,
              }
            ]}
          />
        </View>
      );
    });
  }, [relationships, tasks, getNodePosition]);

  // ==================== TASK NODE RENDERING ====================
  const renderTaskNode = useCallback((task: TaskItem, index: number) => {
    const position = getNodePosition(index);
    const statusColor = getStatusColor(task.status);
    const priorityColor = getPriorityGradient(task.priority);
    
    // ✅ FIX: Updated to toggle multi-selection instead of replace
    const handlePress = () => {
      const tooltipData: TooltipData = {
        task,
        x: Math.min(position.x, screenWidth - 240),
        y: Math.max(position.y - 120, 20)
      };

      setSelectedNodes(prev => {
        const newSelected = new Set(prev);
        const wasSelected = newSelected.has(task.id);
        
        if (wasSelected) {
          // Deselect: remove from both sets
          newSelected.delete(task.id);
          setActiveTooltips(prevTooltips => {
            const newTooltips = new Map(prevTooltips);
            newTooltips.delete(task.id);
            return newTooltips;
          });
          console.log(`🔹 DESELECTED: ${task.name} (${newSelected.size} nodes selected)`);
        } else {
          // Select: add to both sets
          newSelected.add(task.id);
          setActiveTooltips(prevTooltips => {
            const newTooltips = new Map(prevTooltips);
            newTooltips.set(task.id, tooltipData);
            return newTooltips;
          });
          console.log(`🔸 SELECTED: ${task.name} (${newSelected.size} nodes selected)`);
        }
        
        return newSelected;
      });

      // Still call the original callback for compatibility
      onNodeTooltip?.(task, { x: position.x, y: position.y });
    };

    // ✅ FIX: Check if this node is selected for visual feedback
    const isSelected = selectedNodes.has(task.id);

    return (
      <TouchableOpacity
        key={task.id}
        style={[
          styles.taskNode,
          {
            left: position.x,
            top: position.y,
            width: layoutMetrics.nodeWidth,
            height: layoutMetrics.nodeHeight,
            backgroundColor: statusColor,
            shadowColor: priorityColor,
            // ✅ FIX: Add visual feedback for selected state
            borderWidth: isSelected ? 3 : 0,
            borderColor: isSelected ? '#FFD700' : 'transparent',
            shadowOpacity: isSelected ? 0.8 : 0.4,
          }
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {/* Header with priority and critical path indicators */}
        <View style={styles.nodeHeader}>
          <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
            <Text style={styles.priorityText}>{task.priority[0].toUpperCase()}</Text>
          </View>
          
          {task.isCriticalPath && (
            <View style={styles.criticalBadge}>
              <Text style={styles.criticalText}>⚡</Text>
            </View>
          )}
          
          {/* ✅ FIX: Show selection indicator */}
          <View style={styles.statusIndicator}>
            <View style={[
              styles.statusDot, 
              { 
                backgroundColor: isSelected ? '#FFD700' : '#fff',
                width: isSelected ? 12 : 8,
                height: isSelected ? 12 : 8,
              }
            ]} />
          </View>
        </View>

        {/* Task name */}
        <View style={styles.taskNameContainer}>
          <Text style={styles.taskName} numberOfLines={2}>
            {task.name}
          </Text>
        </View>

        {/* Progress section - Now tappable! */}
        <TouchableOpacity 
          style={styles.progressSection}
          onPress={(event) => handleProgressTap(task, event)}
          activeOpacity={readonly ? 1 : 0.7}
          disabled={readonly}
        >
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${task.completion}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{task.completion}%</Text>
          </View>
          
          <Text style={styles.statusLabel}>
            {task.status.replace('_', ' ').toUpperCase()}
            {!readonly && ' • TAP TO UPDATE'}
          </Text>
        </TouchableOpacity>

        {/* Bottom info */}
        <View style={styles.bottomInfo}>
          {task.assignee && (
            <Text style={styles.assigneeLabel} numberOfLines={1}>
              👤 {task.assignee.split(' ')[0]}
            </Text>
          )}
          {task.dueDate && (
            <Text style={styles.dueDateLabel} numberOfLines={1}>
              📅 {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [layoutMetrics, getNodePosition, getStatusColor, getPriorityGradient, screenWidth, onNodeTooltip, selectedNodes, onTaskStatusChange, readonly]);

  // ==================== MULTI-TOOLTIP RENDERING ====================
  // ✅ FIX: Render multiple tooltips instead of single tooltip
  const renderTooltips = useCallback(() => {
    return Array.from(activeTooltips.entries()).map(([taskId, tooltipData]) => {
      const { task, x, y } = tooltipData;
      const statusColor = getStatusColor(task.status);
      const priorityColor = getPriorityGradient(task.priority);

      return (
        <View
          key={`tooltip-${taskId}`}
          style={[
            styles.tooltip,
            {
              left: x,
              top: y,
              borderLeftColor: priorityColor
            }
          ]}
        >
          <View style={styles.tooltipHeader}>
            <Text style={styles.tooltipTitle}>{task.name}</Text>
            <View style={[styles.tooltipStatus, { backgroundColor: statusColor }]}>
              <Text style={styles.tooltipStatusText}>{task.status.replace('_', ' ')}</Text>
            </View>
          </View>
          
          <View style={styles.tooltipContent}>
            <Text style={styles.tooltipDetail}>📊 Progress: {task.completion}%</Text>
            <Text style={styles.tooltipDetail}>⚡ Priority: {task.priority}</Text>
            {task.assignee && (
              <Text style={styles.tooltipDetail}>👤 Assignee: {task.assignee}</Text>
            )}
            {task.dueDate && (
              <Text style={styles.tooltipDetail}>📅 Due: {new Date(task.dueDate).toLocaleDateString()}</Text>
            )}
            {task.estimatedHours && (
              <Text style={styles.tooltipDetail}>⏱️ Estimated: {task.estimatedHours}h</Text>
            )}
            {task.isCriticalPath && (
              <Text style={[styles.tooltipDetail, { color: '#DC2626', fontWeight: '700' }]}>⚠️ Critical Path Task</Text>
            )}
          </View>
        </View>
      );
    });
  }, [activeTooltips, getStatusColor, getPriorityGradient]);

  // ==================== MAIN RENDER ====================
  if (tasks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>📊 Task Graph View</Text>
        <Text style={styles.emptyText}>
          No tasks to display in graph view
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ✅ FIX: Show selection count when nodes are selected */}
      {selectedNodes.size > 0 && (
        <View style={styles.selectionHeader}>
          <Text style={styles.selectionText}>
            {selectedNodes.size} node{selectedNodes.size !== 1 ? 's' : ''} selected
          </Text>
          <TouchableOpacity onPress={clearAllSelections} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity 
        style={styles.graphContainer} 
        onPress={clearAllSelections}  // ✅ FIX: Clear all selections on background tap
        activeOpacity={1}
      >
        <ScrollView
          horizontal={layoutMetrics.willScrollHorizontally}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            width: layoutMetrics.containerWidth,
            height: layoutMetrics.containerHeight,
          }}
          style={styles.scrollView}
        >
          {/* Render connection lines first (behind nodes) */}
          {renderConnectionLines()}
          
          {/* Render task nodes */}
          {tasks.map((task, index) => renderTaskNode(task, index))}
        </ScrollView>
      </TouchableOpacity>

      {/* ✅ FIX: Render multiple tooltips */}
      {renderTooltips()}
    </View>
  );
};

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // ✅ FIX: New styles for selection header
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#E3F2FD',
    borderBottomWidth: 1,
    borderBottomColor: '#BBDEFB',
  },

  selectionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1565C0',
  },

  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#1976D2',
    borderRadius: 6,
  },

  clearButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },

  graphContainer: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  // ==================== TASK NODES ====================
  taskNode: {
    position: 'absolute',
    borderRadius: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },

  nodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  priorityBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  priorityText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },

  criticalBadge: {
    marginLeft: 4,
  },

  criticalText: {
    fontSize: 16,
  },

  statusIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },

  taskNameContainer: {
    flex: 1,
    marginBottom: 8,
  },

  taskName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  progressSection: {
    marginBottom: 8,
  },

  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    marginRight: 8,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },

  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    minWidth: 32,
    textAlign: 'right',
  },

  statusLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
  },

  bottomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  assigneeLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    flex: 1,
    marginRight: 8,
  },

  dueDateLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },

  // ==================== CONNECTION LINES ====================
  connectionLine: {
    position: 'absolute',
    zIndex: 5,
  },

  arrowHead: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    zIndex: 7,
  },

  // ==================== TOOLTIP ====================
  tooltip: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 16,
    maxWidth: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 1000,
  },

  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  tooltipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },

  tooltipStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  tooltipStatusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  tooltipContent: {
    gap: 4,
  },

  tooltipDetail: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },

  // ==================== EMPTY STATE ====================
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F8FAFC',
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },

  emptyText: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default TaskGraphView;