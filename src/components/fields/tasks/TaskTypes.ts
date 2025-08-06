// TaskTypes.ts v1.0 - Type definitions for Task List components
// Centralized type definitions for task management components
// Save as: src/components/fields/tasks/TaskTypes.ts

import { FieldValue } from '../../../types/ADTypes';

export interface TaskItem {
  id: string;
  name: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  priority: 'critical' | 'high' | 'normal' | 'low';
  dueDate: string;
  completion: number;
  assignee?: string;
  phase?: string;
  isCriticalPath?: boolean;
  nodeType?: 'task' | 'milestone' | 'decision';
  description?: string;
  estimatedHours?: number;
  actualHours?: number;
}

export interface TaskRelationship {
  from: string;
  to: string;
  type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  lag?: number; // in days
  description?: string;
}

export interface GraphNode {
  taskId: string;
  x: number;
  y: number;
  nodeType: 'task' | 'milestone' | 'decision';
  width?: number;
  height?: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  points: Array<{ x: number; y: number }>;
  type: TaskRelationship['type'];
}

export interface TaskListData {
  tasks: TaskItem[];
  relationships?: TaskRelationship[];
  layout?: {
    graphNodes: GraphNode[];
    graphEdges?: GraphEdge[];
    viewBox?: {
      width: number;
      height: number;
      minX: number;
      minY: number;
    };
  };
  projectInfo?: {
    name: string;
    startDate: string;
    endDate: string;
    totalDuration: number;
  };
}

export interface TaskMetrics {
  total: number;
  completed: number;
  inProgress: number;
  blocked: number;
  percentage: number;
  criticalPathTasks: number;
  overdueTasks: number;
}

export interface TaskListFieldProps {
  fieldDef: any;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  readonly?: boolean;
}

export interface TaskUIConfig {
  allowStatusChange?: boolean;
  showProgress?: boolean;
  groupByPhase?: boolean;
  allowZoomGraph?: boolean;
  priorityColors: Record<string, string>;
  statusColors?: Record<string, string>;
  graphTransition?: {
    enabled: boolean;
    minZoom: number;
    maxZoom: number;
    snapLevels?: number[];
  };
}

export type TaskViewMode = 'cards' | 'graph' | 'timeline';

export interface ZoomState {
  scale: number;
  viewMode: TaskViewMode;
  transitionInProgress: boolean;
}