<template>
  <div class="tag-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">标签管理</h2>
        <p class="page-description">管理用户标签，创建、编辑、删除标签</p>
      </div>
      <div class="header-actions">
        <a-space>
          <a-input 
            v-model="searchForm.tagName" 
            placeholder="请输入标签名称搜索"
            allow-clear
            style="width: 250px"
            @input="handleSearch"
          >
            <template #prefix><icon-search /></template>
          </a-input>
          <a-dropdown>
            <a-button type="primary">
              <template #icon><icon-plus /></template>
              新增标签
              <template #suffix><icon-down /></template>
            </a-button>
            <template #content>
              <a-doption @click="addTagByRule">
                <template #icon><icon-settings /></template>
                自定义规则创建
              </a-doption>
              <a-doption @click="addTagByImport">
                <template #icon><icon-import /></template>
                数据导入
              </a-doption>
            </template>
          </a-dropdown>
        </a-space>
      </div>
    </div>

    <!-- 标签列表 -->
    <div class="content-section">
      <a-card class="table-card">
        <template #title>
          <div class="table-header">
            <span class="table-title">标签列表</span>
            <span class="table-count">共 {{ pagination.total }} 条</span>
          </div>
        </template>
        
        <a-table 
          :data="tableData" 
          :loading="loading"
          :pagination="pagination"
          @page-change="handlePageChange"
          @page-size-change="handlePageSizeChange"
          class="tag-table"
          size="small"
          :scroll="{ x: 1600 }"
        >
          <template #columns>
            <a-table-column title="标签名称" data-index="name" :width="150" fixed="left">
              <template #cell="{ record }">
                <span>{{ record.name }}</span>
              </template>
            </a-table-column>
            <a-table-column title="标签ID" data-index="id" :width="120">
              <template #cell="{ record }">
                <span>{{ record.id }}</span>
              </template>
            </a-table-column>
            <a-table-column title="数据类型" data-index="dataType" :width="120">
              <template #cell="{ record }">
                <a-tag :color="getDataTypeColor(record.dataType)">
                  {{ getDataTypeText(record.dataType) }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="标签分类" data-index="category" :width="120">
              <template #cell="{ record }">
                <a-tag :color="getCategoryColor(record.category)">
                  {{ getCategoryText(record.category) }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="标签类型" data-index="tagType" :width="120">
              <template #cell="{ record }">
                <a-tag :color="getTagTypeColor(record.tagType)">
                  {{ getTagTypeText(record.tagType) }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="维度主键" data-index="dimensionKey" :width="150">
              <template #cell="{ record }">
                <span>{{ record.dimensionKey }}</span>
              </template>
            </a-table-column>
            <a-table-column title="状态" data-index="status" :width="100">
              <template #cell="{ record }">
                <a-tag :color="getStatusColor(record.status)">
                  {{ getStatusText(record.status) }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="更新频次" data-index="updateFrequency" :width="120">
              <template #cell="{ record }">
                <a-tag :color="getFrequencyColor(record.updateFrequency)">
                  {{ getFrequencyText(record.updateFrequency) }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="共享级别" data-index="shareLevel" :width="120">
              <template #cell="{ record }">
                <a-tag :color="getShareLevelColor(record.shareLevel)">
                  {{ getShareLevelText(record.shareLevel) }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="管理部门" data-index="department" :width="150">
              <template #cell="{ record }">
                <span>{{ record.department }}</span>
              </template>
            </a-table-column>
            <a-table-column title="创建人" data-index="createUser" :width="120">
              <template #cell="{ record }">
                <span>{{ record.createUser }}</span>
              </template>
            </a-table-column>
            <a-table-column title="操作" :width="200" fixed="right">
              <template #cell="{ record, rowIndex }">
                <a-space>
                  <a-button 
                    type="text" 
                    size="small" 
                    @click="editTag(record)"
                  >
                    编辑
                  </a-button>
                  <a-button 
                    type="text" 
                    size="small" 
                    @click="updateTag(record)"
                  >
                    更新
                  </a-button>
                  <a-button 
                    type="text" 
                    size="small" 
                    status="danger" 
                    @click="removeTag(rowIndex)"
                  >
                    删除
                  </a-button>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 标签编辑模态框 -->
    <a-modal 
      v-model:visible="editModalVisible" 
      :title="getModalTitle()"
      width="1000px"
      @ok="saveTag"
      @cancel="cancelEdit"
      :ok-text="editIndex === -1 ? '创建' : '保存'"
    >
      <!-- 简单编辑模式 -->
      <div v-if="createMode === 'edit'">
        <a-form :model="editForm" layout="vertical">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="标签ID" required>
                <a-input v-model="editForm.id" placeholder="请输入标签ID" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="标签名称" required>
                <a-input v-model="editForm.name" placeholder="请输入标签名称" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="数据类型" required>
                <a-select v-model="editForm.dataType" placeholder="请选择数据类型">
                  <a-option value="string">字符串</a-option>
                  <a-option value="number">数值</a-option>
                  <a-option value="boolean">布尔值</a-option>
                  <a-option value="date">日期</a-option>
                  <a-option value="enum">枚举</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="标签分类" required>
                <a-select v-model="editForm.category" placeholder="请选择标签分类">
                  <a-option value="basic">基础信息</a-option>
                  <a-option value="behavior">行为特征</a-option>
                  <a-option value="preference">偏好特征</a-option>
                  <a-option value="business">业务特征</a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="标签类型" required>
                <a-select v-model="editForm.tagType" placeholder="请选择标签类型">
                  <a-option value="static">静态标签</a-option>
                  <a-option value="dynamic">动态标签</a-option>
                  <a-option value="computed">计算标签</a-option>
                  <a-option value="rule">规则标签</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="维度主键" required>
                <a-input v-model="editForm.dimensionKey" placeholder="请输入维度主键" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="更新频次" required>
                <a-select v-model="editForm.updateFrequency" placeholder="请选择更新频次">
                  <a-option value="realtime">实时</a-option>
                  <a-option value="daily">每日</a-option>
                  <a-option value="weekly">每周</a-option>
                  <a-option value="monthly">每月</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="共享级别" required>
                <a-select v-model="editForm.shareLevel" placeholder="请选择共享级别">
                  <a-option value="public">公开</a-option>
                  <a-option value="internal">内部</a-option>
                  <a-option value="private">私有</a-option>
                  <a-option value="restricted">受限</a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="管理部门" required>
                <a-input v-model="editForm.department" placeholder="请输入管理部门" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="创建人">
                <a-input v-model="editForm.createUser" placeholder="请输入创建人" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item label="描述">
            <a-textarea v-model="editForm.description" placeholder="请输入标签描述" :rows="3" />
          </a-form-item>
        </a-form>
      </div>

      <!-- 自定义规则创建模式 -->
      <div v-else-if="createMode === 'rule'">
        <a-tabs v-model:active-key="activeTab" type="line">
          <!-- 基本属性 -->
          <a-tab-pane key="basic" title="基本属性">
            <a-form :model="ruleForm.basic" layout="vertical">
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="标签ID" required>
                    <a-input v-model="ruleForm.basic.id" placeholder="请输入标签ID" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="标签名称" required>
                    <a-input v-model="ruleForm.basic.name" placeholder="请输入标签名称" />
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="数据类型" required>
                    <a-select v-model="ruleForm.basic.dataType" placeholder="请选择数据类型">
                      <a-option value="string">字符串</a-option>
                      <a-option value="number">数值</a-option>
                      <a-option value="boolean">布尔值</a-option>
                      <a-option value="date">日期</a-option>
                      <a-option value="enum">枚举</a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="标签分类" required>
                    <a-select v-model="ruleForm.basic.category" placeholder="请选择标签分类">
                      <a-option value="basic">基础信息</a-option>
                      <a-option value="behavior">行为特征</a-option>
                      <a-option value="preference">偏好特征</a-option>
                      <a-option value="business">业务特征</a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="维度主键" required>
                    <a-input v-model="ruleForm.basic.dimensionKey" placeholder="请输入维度主键" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="管理部门" required>
                    <a-input v-model="ruleForm.basic.department" placeholder="请输入管理部门" />
                  </a-form-item>
                </a-col>
              </a-row>
              <a-form-item label="标签描述">
                <a-textarea v-model="ruleForm.basic.description" placeholder="请输入标签描述" :rows="3" />
              </a-form-item>
            </a-form>
          </a-tab-pane>

          <!-- 通知管理 -->
          <a-tab-pane key="notification" title="通知管理">
            <a-form :model="ruleForm.notification" layout="vertical">
              <a-form-item label="启用通知">
                <a-switch v-model="ruleForm.notification.enabled" />
                <span style="margin-left: 8px; color: #86909c;">开启后将在标签状态变化时发送通知</span>
              </a-form-item>
              
              <div v-if="ruleForm.notification.enabled">
                <a-form-item label="通知方式">
                  <a-checkbox-group v-model="ruleForm.notification.methods">
                    <a-checkbox value="email">邮件通知</a-checkbox>
                    <a-checkbox value="sms">短信通知</a-checkbox>
                    <a-checkbox value="webhook">Webhook</a-checkbox>
                    <a-checkbox value="internal">站内消息</a-checkbox>
                  </a-checkbox-group>
                </a-form-item>
                
                <a-form-item label="通知场景">
                  <a-checkbox-group v-model="ruleForm.notification.scenarios">
                    <a-checkbox value="created">标签创建</a-checkbox>
                    <a-checkbox value="updated">标签更新</a-checkbox>
                    <a-checkbox value="deleted">标签删除</a-checkbox>
                    <a-checkbox value="error">执行异常</a-checkbox>
                  </a-checkbox-group>
                </a-form-item>
                
                <a-form-item label="通知接收人">
                  <a-select v-model="ruleForm.notification.recipients" multiple placeholder="请选择通知接收人">
                    <a-option value="admin">管理员</a-option>
                    <a-option value="creator">创建人</a-option>
                    <a-option value="department">部门负责人</a-option>
                    <a-option value="custom">自定义用户</a-option>
                  </a-select>
                </a-form-item>
                
                <a-form-item label="Webhook地址" v-if="ruleForm.notification.methods.includes('webhook')">
                  <a-input v-model="ruleForm.notification.webhookUrl" placeholder="请输入Webhook地址" />
                </a-form-item>
              </div>
            </a-form>
          </a-tab-pane>

          <!-- 标签规则 -->
          <a-tab-pane key="rules" title="标签规则">
            <a-form :model="ruleForm.rules" layout="vertical">
              <a-form-item label="规则类型" required>
                <a-radio-group v-model="ruleForm.rules.type">
                  <a-radio value="sql">SQL查询</a-radio>
                  <a-radio value="condition">条件规则</a-radio>
                  <a-radio value="script">脚本规则</a-radio>
                </a-radio-group>
              </a-form-item>
              
              <!-- SQL查询规则 -->
              <div v-if="ruleForm.rules.type === 'sql'">
                <a-form-item label="数据源">
                  <a-select v-model="ruleForm.rules.dataSource" placeholder="请选择数据源">
                    <a-option value="mysql_main">MySQL主库</a-option>
                    <a-option value="mysql_slave">MySQL从库</a-option>
                    <a-option value="clickhouse">ClickHouse</a-option>
                    <a-option value="hive">Hive</a-option>
                  </a-select>
                </a-form-item>
                <a-form-item label="SQL语句" required>
                  <a-textarea 
                    v-model="ruleForm.rules.sqlQuery" 
                    placeholder="请输入SQL查询语句"
                    :rows="8"
                    style="font-family: 'Courier New', monospace;"
                  />
                </a-form-item>
                <a-form-item>
                  <a-space>
                    <a-button @click="validateSql">验证SQL</a-button>
                    <a-button @click="previewResult">预览结果</a-button>
                  </a-space>
                </a-form-item>
              </div>
              
              <!-- 条件规则 -->
              <div v-if="ruleForm.rules.type === 'condition'">
                <a-form-item label="条件配置">
                  <div class="condition-builder">
                    <div v-for="(condition, index) in ruleForm.rules.conditions" :key="index" class="condition-item">
                      <a-row :gutter="8" align="middle">
                        <a-col :span="5">
                          <a-select v-model="condition.field" placeholder="选择字段">
                            <a-option value="age">年龄</a-option>
                            <a-option value="gender">性别</a-option>
                            <a-option value="city">城市</a-option>
                            <a-option value="income">收入</a-option>
                            <a-option value="last_login">最后登录</a-option>
                          </a-select>
                        </a-col>
                        <a-col :span="4">
                          <a-select v-model="condition.operator" placeholder="操作符">
                            <a-option value="eq">等于</a-option>
                            <a-option value="ne">不等于</a-option>
                            <a-option value="gt">大于</a-option>
                            <a-option value="lt">小于</a-option>
                            <a-option value="in">包含</a-option>
                            <a-option value="like">模糊匹配</a-option>
                          </a-select>
                        </a-col>
                        <a-col :span="6">
                          <a-input v-model="condition.value" placeholder="输入值" />
                        </a-col>
                        <a-col :span="3" v-if="index > 0">
                          <a-select v-model="condition.logic" placeholder="逻辑">
                            <a-option value="and">AND</a-option>
                            <a-option value="or">OR</a-option>
                          </a-select>
                        </a-col>
                        <a-col :span="3">
                          <a-button 
                            type="text" 
                            status="danger" 
                            @click="removeCondition(index)"
                            v-if="ruleForm.rules.conditions.length > 1"
                          >
                            删除
                          </a-button>
                        </a-col>
                      </a-row>
                    </div>
                    <a-button type="dashed" @click="addCondition" style="width: 100%; margin-top: 8px;">
                      <template #icon><icon-plus /></template>
                      添加条件
                    </a-button>
                  </div>
                </a-form-item>
              </div>
              
              <!-- 脚本规则 -->
              <div v-if="ruleForm.rules.type === 'script'">
                <a-form-item label="脚本语言">
                  <a-select v-model="ruleForm.rules.scriptLanguage" placeholder="请选择脚本语言">
                    <a-option value="python">Python</a-option>
                    <a-option value="javascript">JavaScript</a-option>
                    <a-option value="groovy">Groovy</a-option>
                  </a-select>
                </a-form-item>
                <a-form-item label="脚本内容" required>
                  <a-textarea 
                    v-model="ruleForm.rules.scriptContent" 
                    placeholder="请输入脚本内容"
                    :rows="10"
                    style="font-family: 'Courier New', monospace;"
                  />
                </a-form-item>
                <a-form-item>
                  <a-space>
                    <a-button @click="validateScript">验证脚本</a-button>
                    <a-button @click="testScript">测试运行</a-button>
                  </a-space>
                </a-form-item>
              </div>
              
              <a-form-item label="执行频率">
                <a-select v-model="ruleForm.rules.frequency" placeholder="请选择执行频率">
                  <a-option value="realtime">实时</a-option>
                  <a-option value="hourly">每小时</a-option>
                  <a-option value="daily">每日</a-option>
                  <a-option value="weekly">每周</a-option>
                  <a-option value="monthly">每月</a-option>
                </a-select>
              </a-form-item>
            </a-form>
          </a-tab-pane>
        </a-tabs>
      </div>

      <!-- 数据导入模式 -->
      <div v-else-if="createMode === 'import'">
        <a-form :model="importForm" layout="vertical">
          <a-form-item label="导入方式">
            <a-radio-group v-model="importForm.method">
              <a-radio value="file">文件上传</a-radio>
              <a-radio value="database">数据库导入</a-radio>
              <a-radio value="api">API接口</a-radio>
            </a-radio-group>
          </a-form-item>
          
          <!-- 文件上传 -->
          <div v-if="importForm.method === 'file'">
            <a-form-item label="上传文件">
              <a-upload
                :file-list="importForm.fileList"
                :show-file-list="true"
                :auto-upload="false"
                accept=".csv,.xlsx,.json"
                @change="handleFileChange"
              >
                <template #upload-button>
                  <div class="upload-area">
                    <icon-cloud-upload style="font-size: 48px; color: #c9cdd4;" />
                    <div style="margin-top: 8px;">点击或拖拽文件到此处上传</div>
                    <div style="color: #86909c; font-size: 12px; margin-top: 4px;">支持 CSV、Excel、JSON 格式</div>
                  </div>
                </template>
              </a-upload>
            </a-form-item>
            
            <a-form-item label="字段映射" v-if="importForm.fileList.length > 0">
              <a-table :data="importForm.fieldMapping" :pagination="false" size="small">
                <template #columns>
                  <a-table-column title="源字段" data-index="sourceField" :width="200" />
                  <a-table-column title="目标字段" data-index="targetField" :width="200">
                    <template #cell="{ record }">
                      <a-select v-model="record.targetField" placeholder="选择目标字段">
                        <a-option value="id">标签ID</a-option>
                        <a-option value="name">标签名称</a-option>
                        <a-option value="value">标签值</a-option>
                        <a-option value="user_id">用户ID</a-option>
                        <a-option value="create_time">创建时间</a-option>
                      </a-select>
                    </template>
                  </a-table-column>
                  <a-table-column title="数据类型" data-index="dataType" :width="150">
                    <template #cell="{ record }">
                      <a-select v-model="record.dataType" placeholder="选择类型">
                        <a-option value="string">字符串</a-option>
                        <a-option value="number">数值</a-option>
                        <a-option value="date">日期</a-option>
                        <a-option value="boolean">布尔值</a-option>
                      </a-select>
                    </template>
                  </a-table-column>
                </template>
              </a-table>
            </a-form-item>
          </div>
          
          <!-- 数据库导入 -->
          <div v-if="importForm.method === 'database'">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="数据源">
                  <a-select v-model="importForm.dataSource" placeholder="请选择数据源">
                    <a-option value="mysql_main">MySQL主库</a-option>
                    <a-option value="mysql_slave">MySQL从库</a-option>
                    <a-option value="postgresql">PostgreSQL</a-option>
                    <a-option value="oracle">Oracle</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="数据表">
                  <a-select v-model="importForm.tableName" placeholder="请选择数据表">
                    <a-option value="user_tags">用户标签表</a-option>
                    <a-option value="customer_info">客户信息表</a-option>
                    <a-option value="behavior_data">行为数据表</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
            <a-form-item label="查询条件">
              <a-textarea v-model="importForm.queryCondition" placeholder="请输入WHERE条件（可选）" :rows="3" />
            </a-form-item>
          </div>
          
          <!-- API接口 -->
          <div v-if="importForm.method === 'api'">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="请求方法">
                  <a-select v-model="importForm.apiMethod" placeholder="请选择请求方法">
                    <a-option value="GET">GET</a-option>
                    <a-option value="POST">POST</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="16">
                <a-form-item label="API地址">
                  <a-input v-model="importForm.apiUrl" placeholder="请输入API地址" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-form-item label="请求头">
              <a-textarea v-model="importForm.apiHeaders" placeholder="请输入请求头（JSON格式）" :rows="3" />
            </a-form-item>
            <a-form-item label="请求参数" v-if="importForm.apiMethod === 'POST'">
              <a-textarea v-model="importForm.apiParams" placeholder="请输入请求参数（JSON格式）" :rows="3" />
            </a-form-item>
          </div>
          
          <a-form-item label="导入配置">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="批次大小">
                  <a-input-number v-model="importForm.batchSize" :min="100" :max="10000" placeholder="1000" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="重复处理">
                  <a-select v-model="importForm.duplicateHandling" placeholder="请选择重复处理方式">
                    <a-option value="skip">跳过</a-option>
                    <a-option value="update">更新</a-option>
                    <a-option value="error">报错</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconSearch, IconRefresh, IconDelete, IconDown, IconSettings, IconImport, IconUpload } from '@arco-design/web-vue/es/icon'

// 标签数据接口
interface TagItem {
  id: string
  name: string
  dataType: string // 数据类型
  category: string // 标签分类
  tagType: string // 标签类型
  dimensionKey: string // 维度主键
  status: 'active' | 'inactive'
  updateFrequency: string // 更新频次
  shareLevel: string // 共享级别
  department: string // 管理部门
  createUser: string // 创建人
  createTime: string
  description?: string
}

// 搜索表单
const searchForm = reactive({
  tagName: ''
})

// 表格数据
const tableData = ref<TagItem[]>([])
const loading = ref(false)

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showPageSize: true,
  pageSizeOptions: [10, 20, 50, 100]
})

// 标签编辑
const editModalVisible = ref(false)
const createMode = ref<'edit' | 'rule' | 'import'>('edit')
const activeTab = ref('basic')

const editForm = ref<TagItem>({
  id: '',
  name: '',
  dataType: 'string',
  category: 'basic',
  tagType: 'static',
  dimensionKey: '',
  status: 'active',
  updateFrequency: 'daily',
  shareLevel: 'internal',
  department: '',
  createUser: '',
  createTime: '',
  description: ''
})
const editIndex = ref(-1)

// 自定义规则表单
const ruleForm = ref({
  basic: {
    id: '',
    name: '',
    dataType: 'string',
    category: 'basic',
    dimensionKey: '',
    department: '',
    description: ''
  },
  notification: {
    enabled: false,
    methods: [] as string[],
    scenarios: [] as string[],
    recipients: [] as string[],
    webhookUrl: ''
  },
  rules: {
    type: 'sql',
    dataSource: '',
    sqlQuery: '',
    conditions: [{
      field: '',
      operator: '',
      value: '',
      logic: 'and'
    }],
    scriptLanguage: 'python',
    scriptContent: '',
    frequency: 'daily'
  }
})

// 数据导入表单
const importForm = ref({
  method: 'file',
  fileList: [] as any[],
  fieldMapping: [] as any[],
  dataSource: '',
  tableName: '',
  queryCondition: '',
  apiMethod: 'GET',
  apiUrl: '',
  apiHeaders: '',
  apiParams: '',
  batchSize: 1000,
  duplicateHandling: 'skip'
})

// 生成模拟数据
const generateTagData = (count: number): TagItem[] => {
  const dataTypes = ['string', 'number', 'boolean', 'date', 'enum']
  const categories = ['basic', 'behavior', 'preference', 'business']
  const tagTypes = ['static', 'dynamic', 'computed', 'rule']
  const statuses: ('active' | 'inactive')[] = ['active', 'inactive']
  const frequencies = ['realtime', 'daily', 'weekly', 'monthly']
  const shareLevels = ['public', 'internal', 'private', 'restricted']
  const departments = ['数据部', '产品部', '运营部', '技术部', '市场部']
  const users = ['张三', '李四', '王五', '赵六', '钱七']
  
  return Array.from({ length: count }, (_, index) => ({
    id: `TAG_${String(index + 1).padStart(3, '0')}`,
    name: `标签${index + 1}`,
    dataType: dataTypes[Math.floor(Math.random() * dataTypes.length)],
    category: categories[Math.floor(Math.random() * categories.length)],
    tagType: tagTypes[Math.floor(Math.random() * tagTypes.length)],
    dimensionKey: `dim_key_${index + 1}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    updateFrequency: frequencies[Math.floor(Math.random() * frequencies.length)],
    shareLevel: shareLevels[Math.floor(Math.random() * shareLevels.length)],
    department: departments[Math.floor(Math.random() * departments.length)],
    createUser: users[Math.floor(Math.random() * users.length)],
    createTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    description: `这是标签${index + 1}的描述信息`
  }))
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    // 模拟API请求
    setTimeout(() => {
      const data = generateTagData(50)
      
      // 根据搜索条件筛选
      let filteredData = data
      if (searchForm.tagName) {
        filteredData = filteredData.filter(item => 
          item.name.includes(searchForm.tagName) ||
          item.id.includes(searchForm.tagName)
        )
      }
      
      // 更新表格数据和分页信息
      pagination.total = filteredData.length
      const start = (pagination.current - 1) * pagination.pageSize
      const end = start + pagination.pageSize
      tableData.value = filteredData.slice(start, end)
      
      loading.value = false
    }, 500)
  } catch (error) {
    console.error('获取标签数据失败:', error)
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

// 重置搜索
const handleReset = () => {
  searchForm.tagName = ''
  pagination.current = 1
  fetchData()
}

// 分页变化
const handlePageChange = (page: number) => {
  pagination.current = page
  fetchData()
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  fetchData()
}

// 获取模态框标题
const getModalTitle = () => {
  if (editIndex.value >= 0) return '编辑标签'
  if (createMode.value === 'rule') return '自定义规则创建标签'
  if (createMode.value === 'import') return '数据导入创建标签'
  return '新增标签'
}

// 添加标签（编辑模式）
const addTag = () => {
  createMode.value = 'edit'
  editForm.value = {
    id: '',
    name: '',
    dataType: 'string',
    category: 'basic',
    tagType: 'static',
    dimensionKey: '',
    status: 'active',
    updateFrequency: 'daily',
    shareLevel: 'internal',
    department: '',
    createUser: '当前用户',
    createTime: new Date().toISOString(),
    description: ''
  }
  editIndex.value = -1
  editModalVisible.value = true
}

// 自定义规则创建标签
const addTagByRule = () => {
  createMode.value = 'rule'
  activeTab.value = 'basic'
  // 重置规则表单
  ruleForm.value = {
    basic: {
      id: '',
      name: '',
      dataType: 'string',
      category: 'basic',
      dimensionKey: '',
      department: '',
      description: ''
    },
    notification: {
      enabled: false,
      methods: [],
      scenarios: [],
      recipients: [],
      webhookUrl: ''
    },
    rules: {
      type: 'sql',
      dataSource: '',
      sqlQuery: '',
      conditions: [{
        field: '',
        operator: '',
        value: '',
        logic: 'and'
      }],
      scriptLanguage: 'python',
      scriptContent: '',
      frequency: 'daily'
    }
  }
  editIndex.value = -1
  editModalVisible.value = true
}

// 数据导入创建标签
const addTagByImport = () => {
  createMode.value = 'import'
  // 重置导入表单
  importForm.value = {
    method: 'file',
    fileList: [],
    fieldMapping: [],
    dataSource: '',
    tableName: '',
    queryCondition: '',
    apiMethod: 'GET',
    apiUrl: '',
    apiHeaders: '',
    apiParams: '',
    batchSize: 1000,
    duplicateHandling: 'skip'
  }
  editIndex.value = -1
  editModalVisible.value = true
}

// 删除标签
const removeTag = (index: number) => {
  tableData.value.splice(index, 1)
  Message.success('删除成功')
}

// 编辑标签
const editTag = (record: TagItem) => {
  createMode.value = 'edit'
  editForm.value = { ...record }
  editIndex.value = tableData.value.findIndex(item => item.id === record.id)
  editModalVisible.value = true
}

// 更新标签
const updateTag = (record: TagItem) => {
  Message.info('标签更新功能开发中...')
}

// 保存标签
const saveTag = () => {
  if (createMode.value === 'edit') {
    if (editIndex.value >= 0) {
      // 编辑现有标签
      tableData.value[editIndex.value] = { ...editForm.value }
      Message.success('标签更新成功')
    } else {
      // 新增标签
      const newTag = {
        ...editForm.value,
        createTime: new Date().toISOString()
      }
      tableData.value.unshift(newTag)
      Message.success('标签创建成功')
    }
  } else if (createMode.value === 'rule') {
    // 自定义规则创建标签
    const newTag: TagItem = {
      id: ruleForm.value.basic.id,
      name: ruleForm.value.basic.name,
      dataType: ruleForm.value.basic.dataType,
      category: ruleForm.value.basic.category,
      tagType: 'rule',
      dimensionKey: ruleForm.value.basic.dimensionKey,
      status: 'active',
      updateFrequency: ruleForm.value.rules.frequency,
      shareLevel: 'internal',
      department: ruleForm.value.basic.department,
      createUser: '当前用户',
      createTime: new Date().toISOString(),
      description: ruleForm.value.basic.description
    }
    tableData.value.unshift(newTag)
    Message.success('规则标签创建成功')
  } else if (createMode.value === 'import') {
    // 数据导入创建标签
    Message.success('数据导入任务已提交，请稍后查看结果')
  }
  editModalVisible.value = false
}

// 规则相关函数
const addCondition = () => {
  ruleForm.value.rules.conditions.push({
    field: '',
    operator: '',
    value: '',
    logic: 'and'
  })
}

const removeCondition = (index: number) => {
  ruleForm.value.rules.conditions.splice(index, 1)
}

const validateSql = () => {
  Message.info('SQL验证功能开发中...')
}

const previewResult = () => {
  Message.info('结果预览功能开发中...')
}

const validateScript = () => {
  Message.info('脚本验证功能开发中...')
}

const testScript = () => {
  Message.info('脚本测试功能开发中...')
}

// 导入相关函数
const handleFileChange = (fileList: any[]) => {
  importForm.value.fileList = fileList
  if (fileList.length > 0) {
    // 模拟解析文件字段
    importForm.value.fieldMapping = [
      { sourceField: 'user_id', targetField: 'user_id', dataType: 'string' },
      { sourceField: 'tag_name', targetField: 'name', dataType: 'string' },
      { sourceField: 'tag_value', targetField: 'value', dataType: 'string' },
      { sourceField: 'created_at', targetField: 'create_time', dataType: 'date' }
    ]
  }
}

// 取消编辑
const cancelEdit = () => {
  editModalVisible.value = false
  editIndex.value = -1
  createMode.value = 'edit'
  activeTab.value = 'basic'
}

// 获取数据类型颜色
const getDataTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    string: 'blue',
    number: 'green',
    boolean: 'orange',
    date: 'purple',
    enum: 'cyan'
  }
  return colors[type] || 'gray'
}

// 获取数据类型文本
const getDataTypeText = (type: string) => {
  const texts: Record<string, string> = {
    string: '字符串',
    number: '数值',
    boolean: '布尔值',
    date: '日期',
    enum: '枚举'
  }
  return texts[type] || type
}

// 获取标签分类颜色
const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    basic: 'blue',
    behavior: 'green',
    preference: 'orange',
    business: 'purple'
  }
  return colors[category] || 'gray'
}

// 获取标签分类文本
const getCategoryText = (category: string) => {
  const texts: Record<string, string> = {
    basic: '基础信息',
    behavior: '行为特征',
    preference: '偏好特征',
    business: '业务特征'
  }
  return texts[category] || category
}

// 获取标签类型颜色
const getTagTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    static: 'blue',
    dynamic: 'green',
    computed: 'orange',
    rule: 'purple'
  }
  return colors[type] || 'gray'
}

// 获取标签类型文本
const getTagTypeText = (type: string) => {
  const texts: Record<string, string> = {
    static: '静态标签',
    dynamic: '动态标签',
    computed: '计算标签',
    rule: '规则标签'
  }
  return texts[type] || type
}

// 获取状态颜色
const getStatusColor = (status: string) => {
  return status === 'active' ? 'green' : 'red'
}

// 获取状态文本
const getStatusText = (status: string) => {
  return status === 'active' ? '启用' : '禁用'
}

// 获取更新频次颜色
const getFrequencyColor = (frequency: string) => {
  const colors: Record<string, string> = {
    realtime: 'red',
    daily: 'orange',
    weekly: 'blue',
    monthly: 'green'
  }
  return colors[frequency] || 'gray'
}

// 获取更新频次文本
const getFrequencyText = (frequency: string) => {
  const texts: Record<string, string> = {
    realtime: '实时',
    daily: '每日',
    weekly: '每周',
    monthly: '每月'
  }
  return texts[frequency] || frequency
}

// 获取共享级别颜色
const getShareLevelColor = (level: string) => {
  const colors: Record<string, string> = {
    public: 'green',
    internal: 'blue',
    private: 'orange',
    restricted: 'red'
  }
  return colors[level] || 'gray'
}

// 获取共享级别文本
const getShareLevelText = (level: string) => {
  const texts: Record<string, string> = {
    public: '公开',
    internal: '内部',
    private: '私有',
    restricted: '受限'
  }
  return texts[level] || level
}

// 格式化时间
const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

// 初始化
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.tag-management {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  flex: 1;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.page-description {
  margin: 0;
  color: #86909c;
  font-size: 14px;
}

.header-actions {
  flex-shrink: 0;
}

/* 内容区域 */
.content-section {
  margin-bottom: 20px;
}

.table-card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.table-count {
  color: #86909c;
  font-size: 14px;
}

.tag-table {
  margin-top: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tag-management {
    padding: 12px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
  }
}
</style>