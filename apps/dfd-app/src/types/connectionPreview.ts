/**
 * 连接预览管理器类型定义
 */

export interface NodeData {
  type?: string;
  nodeType?: string;
  label?: string;
  [key: string]: any;
}

export interface NodePosition {
  x: number;
  y: number;
}

export interface NodeSize {
  width: number;
  height: number;
}

export interface BranchInfo {
  id: string;
  label: string;
  condition?: string;
  color?: string;
}

export interface PreviewPosition {
  start: NodePosition;
  end: NodePosition;
  snapZone: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface PersistentPreview {
  line: any; // X6 Edge对象
  label: any; // X6 Node对象
}

export interface SnapTarget {
  sourceNodeId: string;
  branchId?: string;
  distance: number;
  position: NodePosition;
}

export interface LayoutConfig {
  VERTICAL_SPACING: number;
  NODE_SPACING: number;
  BRANCH_SPACING: number;
  PREVIEW_LINE_LENGTH: number;
  SNAP_DISTANCE: number;
  PREVIEW_STYLES: {
    PERSISTENT: {
      BRANCH: any;
      SINGLE: any;
    };
    HIGHLIGHT: any;
  };
  LABEL_STYLES: {
    BRANCH: any;
    SINGLE: any;
    HIGHLIGHT: any;
  };
}

export interface ConnectionPreviewManagerOptions {
  graph: any; // X6 Graph对象
  branchManager: any;
  layoutConfig?: LayoutConfig;
}

export interface NodeEvent {
  node: any; // X6 Node对象
  [key: string]: any;
}

export interface EdgeEvent {
  edge: any; // X6 Edge对象
  [key: string]: any;
}