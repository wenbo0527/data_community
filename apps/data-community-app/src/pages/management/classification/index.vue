<template>
  <PageContainer>
    <PageHeader title="数据分级分类" sub-title="按个人信息 / 商业信息 / 监管信息 / 一般信息 分类 · 按 L0~L3 分级">
      <template #extra>
        <a-button @click="goBack">返回工作台</a-button>
      </template>
    </PageHeader>

    <a-row :gutter="16" style="margin-bottom: 16px">
      <a-col :span="6">
        <a-statistic title="分类数" :value="categories.length" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="已映射标准" :value="mappings.length" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="高敏字段(≥L2)" :value="highSensitiveCount" :value-style="{ color: '#f53f3f' }" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="低敏字段(L0)" :value="lowSensitiveCount" :value-style="{ color: '#00b42a' }" />
      </a-col>
    </a-row>

    <a-row :gutter="16">
      <!-- 左侧:分类树 -->
      <a-col :span="8">
        <a-card :bordered="false" title="分类树">
          <a-list>
            <a-list-item v-for="cat in categories" :key="cat.code" class="cat-item" :class="{ active: activeCategory === cat.code }" @click="onSelectCategory(cat.code)">
              <a-list-item-meta>
                <template #title>
                  <a-space>
                    <span class="cat-name">{{ cat.name }}</span>
                    <a-tag size="small" :color="levelColor(cat.defaultLevel)">{{ levelLabel(cat.defaultLevel) }}</a-tag>
                  </a-space>
                </template>
                <template #description>
                  <div>{{ cat.description }}</div>
                  <div style="color: #86909c; margin-top: 4px">已挂 {{ cat.standardCount }} 个标准 · Owner: {{ cat.owner }}</div>
                </template>
              </a-list-item-meta>
            </a-list-item>
          </a-list>
        </a-card>

        <!-- 分级说明 -->
        <a-card :bordered="false" title="分级说明" style="margin-top: 16px">
          <a-list size="small">
            <a-list-item v-for="lv in levels" :key="lv">
              <a-list-item-meta>
                <template #title>
                  <a-tag :color="levelColor(lv)">{{ lv }}</a-tag>
                  <strong style="margin-left: 8px">{{ levelLabel(lv) }}</strong>
                </template>
                <template #description>{{ levelDesc(lv) }}</template>
              </a-list-item-meta>
            </a-list-item>
          </a-list>
        </a-card>
      </a-col>

      <!-- 右侧:该分类下的标准映射 -->
      <a-col :span="16">
        <a-card :bordered="false" :title="`${activeCat?.name || ''} · 已挂标准 (${filteredMappings.length})`">
          <template #extra>
            <a-space>
              <a-select v-model="filterLevel" placeholder="分级" allow-clear size="small" style="width: 110px">
                <a-option v-for="lv in levels" :key="lv" :value="lv">{{ levelLabel(lv) }}</a-option>
              </a-select>
              <a-button size="small" type="primary" @click="onCreateMapping">
                <template #icon><icon-plus /></template>挂载标准
              </a-button>
            </a-space>
          </template>

          <a-table :columns="mappingColumns" :data="filteredMappings" row-key="standardCode" :pagination="{ pageSize: 10 }" stripe size="medium">
            <template #level="{ record }">
              <a-tag :color="levelColor(record.level)">{{ levelLabel(record.level) }}</a-tag>
            </template>
            <template #categories="{ record }">
              <a-space>
                <a-tag v-for="c in record.categories" :key="c" color="cyan">{{ categoryLabel(c) }}</a-tag>
              </a-space>
            </template>
            <template #actions="{ record }">
              <a-space>
                <a-link @click="onEditMapping(record)">调整</a-link>
                <a-link status="danger" @click="onUnmount(record)">解绑</a-link>
              </a-space>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>

    <!-- 调整映射抽屉 -->
    <a-drawer v-model:visible="editVisible" :title="editingMapping ? `调整分类分级 · ${editingMapping.standardCode}` : '挂载标准到分类'" :width="520" :footer="false">
      <a-form layout="vertical">
        <a-form-item label="标准编码" required>
          <a-input v-model="form.standardCode" placeholder="如 STD-007" :disabled="!!editingMapping" />
        </a-form-item>
        <a-form-item label="标准名称" required>
          <a-input v-model="form.standardName" placeholder="如 客户邮箱" />
        </a-form-item>
        <a-form-item label="挂载分类(可多选)" required>
          <a-checkbox-group v-model="form.categories">
            <a-checkbox v-for="c in categories" :key="c.code" :value="c.code">{{ c.name }}</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
        <a-form-item label="安全级别" required>
          <a-radio-group v-model="form.level">
            <a-radio v-for="lv in levels" :key="lv" :value="lv">
              <a-tag :color="levelColor(lv)">{{ levelLabel(lv) }}</a-tag>
            </a-radio>
          </a-radio-group>
          <div class="form-tip">{{ form.level ? levelDesc(form.level) : '' }}</div>
        </a-form-item>
      </a-form>
      <a-space style="margin-top: 16px; justify-content: flex-end; display: flex">
        <a-button @click="editVisible = false">取消</a-button>
        <a-button type="primary" @click="onSaveMapping">保存</a-button>
      </a-space>
    </a-drawer>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import PageContainer from '@/components-dca/common/PageContainer.vue'
import PageHeader from '@/components-dca/common/PageHeader.vue'
import {
  ClassificationStore,
  SECURITY_LEVELS,
  SECURITY_LEVEL_LABEL,
  SECURITY_LEVEL_COLOR,
  SECURITY_LEVEL_DESC,
  CATEGORY_LABEL,
  type Category,
  type ClassificationMapping,
  type SecurityLevel,
  type CategoryCode
} from '@/mock-shared/classification-store'

const router = useRouter()

const categories = ref<Category[]>([])
const mappings = ref<ClassificationMapping[]>([])
const activeCategory = ref<CategoryCode>('PII')
const filterLevel = ref<SecurityLevel | undefined>()
function refresh() {
  categories.value = ClassificationStore.getCategories()
  mappings.value = ClassificationStore.getMappings()
}
onMounted(refresh)

const activeCat = computed(() => categories.value.find(c => c.code === activeCategory.value))
const filteredMappings = computed(() => mappings.value
  .filter(m => m.categories.includes(activeCategory.value))
  .filter(m => !filterLevel.value || m.level === filterLevel.value))

const highSensitiveCount = computed(() => mappings.value.filter(m => m.level === 'L2' || m.level === 'L3').length)
const lowSensitiveCount = computed(() => mappings.value.filter(m => m.level === 'L0').length)

const levels = SECURITY_LEVELS
function levelColor(l: SecurityLevel) { return SECURITY_LEVEL_COLOR[l] }
function levelLabel(l: SecurityLevel) { return SECURITY_LEVEL_LABEL[l] }
function levelDesc(l: SecurityLevel) { return SECURITY_LEVEL_DESC[l] }
function categoryLabel(c: CategoryCode) { return CATEGORY_LABEL[c] }

function onSelectCategory(c: CategoryCode) {
  activeCategory.value = c
  filterLevel.value = undefined
}

const mappingColumns = [
  { title: '标准编码', dataIndex: 'standardCode', width: 110 },
  { title: '标准名称', dataIndex: 'standardName', width: 180 },
  { title: '挂载分类', dataIndex: 'categories', slotName: 'categories', width: 220 },
  { title: '级别', dataIndex: 'level', slotName: 'level', width: 100 },
  { title: '更新', dataIndex: 'updatedAt', width: 140 },
  { title: '操作', slotName: 'actions', width: 130, fixed: 'right' }
]

const editVisible = ref(false)
const editingMapping = ref<ClassificationMapping | null>(null)
const form = ref<{ standardCode: string; standardName: string; categories: CategoryCode[]; level: SecurityLevel }>({
  standardCode: '',
  standardName: '',
  categories: [],
  level: 'L1'
})

function onCreateMapping() {
  editingMapping.value = null
  form.value = { standardCode: '', standardName: '', categories: [activeCategory.value], level: activeCat.value?.defaultLevel || 'L1' }
  editVisible.value = true
}
function onEditMapping(m: ClassificationMapping) {
  editingMapping.value = m
  form.value = { standardCode: m.standardCode, standardName: m.standardName, categories: [...m.categories], level: m.level }
  editVisible.value = true
}

function onSaveMapping() {
  if (!form.value.standardCode || !form.value.standardName || !form.value.categories.length) {
    Message.error('请填写完整信息'); return
  }
  ClassificationStore.setMapping(form.value.standardCode, form.value.standardName, form.value.categories, form.value.level)
  Message.success('保存成功')
  editVisible.value = false
  refresh()
}

function onUnmount(m: ClassificationMapping) {
  Modal.confirm({
    title: '解绑映射',
    content: `确认要将「${m.standardCode}」从当前分类解绑?`,
    okText: '确认解绑',
    cancelText: '取消',
    onOk: () => {
      // 直接清掉该映射
      const idx = mappings.value.findIndex(x => x.standardCode === m.standardCode)
      if (idx > -1) {
        mappings.value.splice(idx, 1)
        Message.warning(`已解绑「${m.standardCode}」`)
      }
    }
  })
}

const goBack = () => router.push('workbench')
</script>

<style lang="scss" scoped>
/* 2026-08-06 统一:页面背景/高度/最大宽度由 PageContainer 提供 */
.cat-item {
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: var(--dca-bg-hover); }
  &.active { background: var(--dca-bg-emphasis); border-left: 3px solid var(--dca-brand-primary); }
  .cat-name { font-weight: 500; }
}
.form-tip { color: var(--dca-text-tertiary); font-size: 12px; margin-top: 4px; }
</style>