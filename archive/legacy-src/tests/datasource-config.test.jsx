import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import DataSourceConfig from '../pages/exploration/workflows/DataSourceConfig.vue';

// Mock Vue Router
const mockRouter = {
  push: vi.fn()
};

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter
}));

// Mock Arco Design components
vi.mock('@arco-design/web-vue', () => ({
  Message: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  },
  Modal: {
    confirm: vi.fn()
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('数据源配置测试', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(JSON.stringify({
      files: [],
      databases: []
    }));
  });

  it('应该正确渲染数据源配置页面', () => {
    wrapper = mount(DataSourceConfig, {
      global: {
        stubs: {
          'a-button': true,
          'a-tabs': true,
          'a-tab-pane': true,
          'a-empty': true,
          'a-dropdown': true,
          'a-doption': true,
          'a-tag': true,
          'a-modal': true,
          'a-upload': true,
          'a-form': true,
          'a-form-item': true,
          'a-input': true,
          'a-select': true,
          'a-option': true,
          'a-input-password': true,
          'a-input-number': true,
          'icon-arrow-left': true,
          'icon-plus': true,
          'icon-file': true,
          'icon-more': true,
          'icon-eye': true,
          'icon-download': true,
          'icon-delete': true,
          'icon-database': true,
          'icon-wifi': true,
          'icon-edit': true
        }
      }
    });

    expect(wrapper.find('.datasource-config').exists()).toBe(true);
    expect(wrapper.find('h2').text()).toBe('数据源配置');
  });

  it('应该显示空状态当没有数据源时', async () => {
    // 确保localStorage返回空数据
    localStorageMock.getItem.mockReturnValue(JSON.stringify({
      files: [],
      databases: []
    }));

    wrapper = mount(DataSourceConfig, {
      global: {
        stubs: {
          'a-button': true,
          'a-tabs': true,
          'a-tab-pane': true,
          'a-empty': {
            template: '<div class="empty-state"><slot /></div>'
          },
          'a-dropdown': true,
          'a-doption': true,
          'a-tag': true,
          'a-modal': true,
          'a-upload': true,
          'a-form': true,
          'a-form-item': true,
          'a-input': true,
          'a-select': true,
          'a-option': true,
          'a-input-password': true,
          'a-input-number': true,
          'icon-arrow-left': true,
          'icon-plus': true,
          'icon-file': true,
          'icon-more': true,
          'icon-eye': true,
          'icon-download': true,
          'icon-delete': true,
          'icon-database': true,
          'icon-wifi': true,
          'icon-edit': true
        }
      }
    });

    await wrapper.vm.$nextTick();
    
    // 检查是否显示空状态，如果组件结构不同，可能需要调整选择器
    const hasEmptyState = wrapper.find('.empty-state').exists() || 
                         wrapper.find('[data-testid="empty-state"]').exists() ||
                         wrapper.text().includes('暂无数据') ||
                         wrapper.text().includes('空状态');
    
    expect(hasEmptyState).toBe(true);
  });
});