import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import WorkflowEditor from '../../components/workflow/WorkflowEditor.vue'
import WorkflowNode from '../../components/workflow/WorkflowNode.vue'
import { NodeType } from '../../utils/workflowNodeTypes.js'
import { createMockGraph, createMockNode, createMockWorkflow } from '../setup.js'

// Mock AntV X6
vi.mock('@antv/x6', () => ({
  Graph: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    off: vi.fn(),
    addNode: vi.fn((config) => ({ id: config.id, ...config })),
    addEdge: vi.fn((config) => ({ id: config.id, ...config })),
    removeNode: vi.fn(),
    removeEdge: vi.fn(),
    getNodes: vi.fn(() => []),
    getEdges: vi.fn(() => []),
    getCellById: vi.fn(),
    clearCells: vi.fn(),
    fromJSON: vi.fn(),
    toJSON: vi.fn(() => ({ cells: [] })),
    centerContent: vi.fn(),
    zoomToFit: vi.fn(),
    zoom: vi.fn(),
    translate: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn()
  })),
  Shape: {
    register: vi.fn()
  }
}))

// Mock Vue Router
const mockRouter = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/workflow/:id', component: { template: '<div>Workflow</div>' } }
  ]
})

// Mock Arco Design 组件
vi.mock('@arco-design/web-vue', () => ({
  Button: {
    name: 'AButton',
    template: '<button class="mock-button" @click="$emit(\"click\")"><slot /></button>',
    props: ['type', 'size', 'status', 'loading']
  },
  Dropdown: {
    name: 'ADropdown',
    template: '<div class="mock-dropdown"><slot /></div>',
    props: ['trigger', 'position']
  },
  Do