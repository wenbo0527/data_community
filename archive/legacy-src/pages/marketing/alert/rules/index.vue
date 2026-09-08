<template>
  <div class="alert-rules-container">
    <a-card title="预警规则配置" :loading="loading">
      <template #extra>
        <a-space>
          <a-input-search
            placeholder="搜索规则名称"
            style="width: 200px"
            allow-clear
            @search="handleSearch"
          />
          <a-button type="primary" @click="handleCreate">
            <template #icon><IconPlus /></template>
            新建规则
          </a-button>
        </a-space>
      </template>

      <a-table
        :data="filteredRules"
        :pagination="{
          pageSize: 10,
          showTotal: true,
          showJumper: true,
          showPageSize: true
        }"
        :bordered="false"
        stripe
      >
        <template #columns>
          <a-table-column title="规则名称" data-index="name" align="left" />
          <a-table-column title="监控类型" data-index="type" align="center">
            <template #cell="{ record }">
              <a-tag :color="getTypeColor(record.type)">
                {{ getTypeText(record.type) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="预警条件" data-index="conditions" align="left">
            <template #cell="{ record }">
              <span>{{ formatConditions(record.conditions) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="通知渠道" data-index="channels" align="center">
            <template #cell="{ record }">
              <a-space>
                <a-tag v-for="channel in record.channels" :key="channel" :color="getChannelColor(channel)">
                  {{ getChannelText(channel) }}
                </a-tag>
              </a-space>
            </template>
          </a-table-column>
          <a-table-column title="状态" data-index="status" align="center">
            <template #cell="{ record }">
              <StatusTag :status="record.status" dictKey="alertRuleStatus" />
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="created_at" align="center">
            <template #cell="{ record }">
              {{ DateUtils.formatDateTime(record.created_at) }}
            </template>
          </a-table-column>
          <a-table-column title="操作" align="center" :width="150">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleEdit(record)">
                  编辑
                </a-button>
                <a-button type="text" size="small" status="danger" @click="handleDelete(record)">
                  删除
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 创建/编辑规则模态框 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="isEdit ? '编辑预警规则' : '新建预警规则'"
      width="800px"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form :model="formData" :rules="formRules" ref="formRef" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="规则名称" field="name">
              <a-input v-model="formData.name" placeholder="请输入规则名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="监控类型" field="type">
              <a-select v-model="formData.type" placeholder="请选择监控类型" @change="handleTypeChange">
                <a-option value="inventory">库存监控</a-option>
                <a-option value="expiry">过期监控</a-option>
                <a-option value="failure">发放失败监控</a-option>
                <a-option value="coupon_inventory">券库存粒度监控</a-option>
                <a-option value="coupon_package">券包粒度监控</a-option>
                <a-option value="coupon_lifecycle">券实例生命周期监控</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="预警条件" field="conditions">
          <a-card :bordered="false" class="condition-card">
            <!-- 库存监控条件 -->
            <div v-if="formData.type === 'inventory'">
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item 
                    label="库存阈值" 
                    field="conditions.threshold"
                    :rules="[{ required: true, message: '请输入库存阈值' }]"
                  >
                    <a-input-number
                      v-model="formData.conditions.threshold"
                      placeholder="请输入库存阈值"
                      :min="0"
                      :max="999999"
                      style="width: 100%"
                    />
                    <div class="form-help-text">当库存数量低于此值时触发预警</div>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item 
                    label="阈值类型" 
                    field="conditions.thresholdType"
                    :rules="[{ required: true, message: '请选择阈值类型' }]"
                  >
                    <a-select v-model="formData.conditions.thresholdType">
                      <a-option value="absolute">绝对数量</a-option>
                      <a-option value="percentage">百分比</a-option>
                    </a-select>
                    <div class="form-help-text">
                      {{ formData.conditions.thresholdType === 'percentage' ? '相对于总库存的百分比' : '具体的库存数量' }}
                    </div>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="检查频率">
                    <a-select v-model="formData.conditions.checkInterval" placeholder="选择检查频率">
                      <a-option value="5min">每5分钟</a-option>
                      <a-option value="15min">每15分钟</a-option>
                      <a-option value="30min">每30分钟</a-option>
                      <a-option value="1hour">每小时</a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="连续触发次数">
                    <a-input-number
                      v-model="formData.conditions.consecutiveCount"
                      placeholder="连续触发几次后发送预警"
                      :min="1"
                      :max="10"
                      style="width: 100%"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
            </div>

            <!-- 过期监控条件 -->
            <div v-if="formData.type === 'expiry'">
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item 
                    label="提前预警天数" 
                    field="conditions.advanceDays"
                    :rules="[{ required: true, message: '请输入提前预警天数' }]"
                  >
                    <a-input-number
                      v-model="formData.conditions.advanceDays"
                      placeholder="请输入提前天数"
                      :min="1"
                      :max="365"
                      style="width: 100%"
                    />
                    <div class="form-help-text">在券过期前多少天开始预警</div>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item 
                    label="预警级别" 
                    field="conditions.level"
                    :rules="[{ required: true, message: '请选择预警级别' }]"
                  >
                    <a-select v-model="formData.conditions.level">
                      <a-option value="high">高级预警</a-option>
                      <a-option value="medium">中级预警</a-option>
                      <a-option value="low">低级预警</a-option>
                    </a-select>
                    <div class="form-help-text">
                      {{ getLevelDescription(formData.conditions.level) }}
                    </div>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="批量阈值">
                    <a-input-number
                      v-model="formData.conditions.batchThreshold"
                      placeholder="批量过期券数量阈值"
                      :min="1"
                      style="width: 100%"
                    />
                    <div class="form-help-text">当即将过期的券数量超过此值时触发预警</div>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="检查时间">
                    <a-time-picker
                      v-model="formData.conditions.checkTime"
                      placeholder="选择每日检查时间"
                      format="HH:mm"
                      style="width: 100%"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
            </div>

            <!-- 发放失败监控条件 -->
            <div v-if="formData.type === 'failure'">
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item 
                    label="失败率阈值(%)" 
                    field="conditions.failureRate"
                    :rules="[{ required: true, message: '请输入失败率阈值' }]"
                  >
                    <a-input-number
                      v-model="formData.conditions.failureRate"
                      placeholder="请输入失败率阈值"
                      :min="0"
                      :max="100"
                      :precision="2"
                      style="width: 100%"
                    />
                    <div class="form-help-text">当失败率超过此百分比时触发预警</div>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item 
                    label="统计时间窗口" 
                    field="conditions.timeWindow"
                    :rules="[{ required: true, message: '请选择统计时间窗口' }]"
                  >
                    <a-select v-model="formData.conditions.timeWindow">
                      <a-option value="5min">5分钟</a-option>
                      <a-option value="15min">15分钟</a-option>
                      <a-option value="30min">30分钟</a-option>
                      <a-option value="1hour">1小时</a-option>
                      <a-option value="6hour">6小时</a-option>
                      <a-option value="24hour">24小时</a-option>
                    </a-select>
                    <div class="form-help-text">统计失败率的时间范围</div>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="最小样本数">
                    <a-input-number
                      v-model="formData.conditions.minSampleSize"
                      placeholder="最小发放次数"
                      :min="1"
                      style="width: 100%"
                    />
                    <div class="form-help-text">只有发放次数达到此值才进行失败率统计</div>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="连续触发次数">
                    <a-input-number
                      v-model="formData.conditions.consecutiveFailures"
                      placeholder="连续失败多少次后预警"
                      :min="1"
                      :max="20"
                      style="width: 100%"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
            </div>

            <!-- 券库存粒度监控条件 -->
            <div v-if="formData.type === 'coupon_inventory'">
              <a-row :gutter="16">
                <a-col :span="24">
                  <a-form-item label="监控范围" field="conditions.scope">
                    <a-radio-group v-model="formData.conditions.scope">
                      <a-radio value="all">全部券库存</a-radio>
                      <a-radio value="specific">指定券库存</a-radio>
                    </a-radio-group>
                  </a-form-item>
                </a-col>
              </a-row>
              
              <a-row v-if="formData.conditions.scope === 'specific'" :gutter="16">
                <a-col :span="24">
                  <a-form-item label="选择券库存" field="conditions.couponInventories">
                    <a-select
                      v-model="formData.conditions.couponInventories"
                      placeholder="请选择要监控的券库存"
                      multiple
                      allow-clear
                      style="width: 100%"
                      :loading="couponInventoriesLoading"
                    >
                      <a-option 
                        v-for="inventory in couponInventories" 
                        :key="inventory.id" 
                        :value="inventory.id"
                      >
                        {{ inventory.name }} (剩余: {{ inventory.remaining_stock }})
                      </a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>

              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="监控指标" field="conditions.metricType">
                    <a-select
                      v-model="formData.conditions.metricType"
                      placeholder="请选择监控指标"
                      style="width: 100%"
                    >
                      <a-option value="remaining_stock">剩余有效库存量</a-option>
                      <a-option value="remaining_ratio">剩余有效库存比例</a-option>
                      <a-option value="remaining_days">剩余有效天数</a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="阈值" field="conditions.threshold">
                    <a-input-number
                      v-model="formData.conditions.threshold"
                      :placeholder="getThresholdPlaceholder(formData.conditions.metricType)"
                      :min="0"
                      :max="formData.conditions.metricType === 'remaining_ratio' ? 100 : undefined"
                      style="width: 100%"
                    />
                    <div class="form-help-text">{{ getThresholdHelpText(formData.conditions.metricType) }}</div>
                  </a-form-item>
                </a-col>
              </a-row>

              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="预警级别" field="conditions.level">
                    <a-select
                      v-model="formData.conditions.level"
                      placeholder="请选择预警级别"
                      style="width: 100%"
                    >
                      <a-option value="high">高级 - 立即通知</a-option>
                      <a-option value="medium">中级 - 正常通知</a-option>
                      <a-option value="low">低级 - 延迟通知</a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="检查频率" field="conditions.checkInterval">
                    <a-select
                      v-model="formData.conditions.checkInterval"
                      placeholder="请选择检查频率"
                      style="width: 100%"
                    >
                      <a-option value="5min">每5分钟</a-option>
                      <a-option value="15min">每15分钟</a-option>
                      <a-option value="30min">每30分钟</a-option>
                      <a-option value="1hour">每小时</a-option>
                      <a-option value="6hour">每6小时</a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
            </div>

            <!-- 券包粒度监控条件 -->
            <div v-if="formData.type === 'coupon_package'">
              <a-row :gutter="16">
                <a-col :span="24">
                  <a-form-item label="监控范围" field="conditions.scope">
                    <a-radio-group v-model="formData.conditions.scope">
                      <a-radio value="all">全部券包</a-radio>
                      <a-radio value="specific">指定券包</a-radio>
                    </a-radio-group>
                  </a-form-item>
                </a-col>
              </a-row>
              
              <a-row v-if="formData.conditions.scope === 'specific'" :gutter="16">
                <a-col :span="24">
                  <a-form-item label="选择券包" field="conditions.couponPackages">
                    <a-select
                      v-model="formData.conditions.couponPackages"
                      placeholder="请选择要监控的券包"
                      multiple
                      allow-clear
                      style="width: 100%"
                      :loading="couponPackagesLoading"
                    >
                      <a-option 
                        v-for="pkg in couponPackages" 
                        :key="pkg.id" 
                        :value="pkg.id"
                      >
                        {{ pkg.name }} (剩余: {{ pkg.remaining_days }}天)
                      </a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>

              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="监控指标" field="conditions.metricType">
                    <a-select
                      v-model="formData.conditions.metricType"
                      placeholder="请选择监控指标"
                      style="width: 100%"
                    >
                      <a-option value="package_expiry_days">券包剩余有效期天数</a-option>
                      <a-option value="package_remaining_stock">券包下有效库存量</a-option>
                      <a-option value="daily_success_rate">当日下发成功率</a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="阈值" field="conditions.threshold">
                    <a-input-number
                      v-model="formData.conditions.threshold"
                      :placeholder="getPackageThresholdPlaceholder(formData.conditions.metricType)"
                      :min="0"
                      :max="formData.conditions.metricType === 'daily_success_rate' ? 100 : undefined"
                      style="width: 100%"
                    />
                    <div class="form-help-text">{{ getPackageThresholdHelpText(formData.conditions.metricType) }}</div>
                  </a-form-item>
                </a-col>
              </a-row>

              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="预警级别" field="conditions.level">
                    <a-select
                      v-model="formData.conditions.level"
                      placeholder="请选择预警级别"
                      style="width: 100%"
                    >
                      <a-option value="high">高级 - 立即通知</a-option>
                      <a-option value="medium">中级 - 正常通知</a-option>
                      <a-option value="low">低级 - 延迟通知</a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="检查频率" field="conditions.checkInterval">
                    <a-select
                      v-model="formData.conditions.checkInterval"
                      placeholder="请选择检查频率"
                      style="width: 100%"
                    >
                      <a-option value="5min">每5分钟</a-option>
                      <a-option value="15min">每15分钟</a-option>
                      <a-option value="30min">每30分钟</a-option>
                      <a-option value="1hour">每小时</a-option>
                      <a-option value="6hour">每6小时</a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
            </div>

            <!-- 券实例生命周期监控条件 -->
            <div v-if="formData.type === 'coupon_lifecycle'">
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="监控指标" field="conditions.metricType">
                    <a-select
                      v-model="formData.conditions.metricType"
                      placeholder="请选择监控指标"
                      style="width: 100%"
                    >
                      <a-option value="verification_failure_rate">券核销失败占比</a-option>
                      <a-option value="conversion_rate">核销率与转化漏斗</a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="阈值" field="conditions.threshold">
                    <a-input-number
                      v-model="formData.conditions.threshold"
                      :placeholder="getLifecycleThresholdPlaceholder(formData.conditions.metricType)"
                      :min="0"
                      :max="100"
                      style="width: 100%"
                    />
                    <div class="form-help-text">{{ getLifecycleThresholdHelpText(formData.conditions.metricType) }}</div>
                  </a-form-item>
                </a-col>
              </a-row>

              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="统计时间窗口" field="conditions.timeWindow">
                    <a-select
                      v-model="formData.conditions.timeWindow"
                      placeholder="请选择统计时间窗口"
                      style="width: 100%"
                    >
                      <a-option value="5min">5分钟</a-option>
                      <a-option value="15min">15分钟</a-option>
                      <a-option value="30min">30分钟</a-option>
                      <a-option value="1hour">1小时</a-option>
                      <a-option value="6hour">6小时</a-option>
                      <a-option value="24hour">24小时</a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="预警级别" field="conditions.level">
                    <a-select
                      v-model="formData.conditions.level"
                      placeholder="请选择预警级别"
                      style="width: 100%"
                    >
                      <a-option value="high">高级 - 立即通知</a-option>
                      <a-option value="medium">中级 - 正常通知</a-option>
                      <a-option value="low">低级 - 延迟通知</a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>

              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="最小样本数" field="conditions.minSampleSize">
                    <a-input-number
                      v-model="formData.conditions.minSampleSize"
                      placeholder="最小核销次数"
                      :min="1"
                      style="width: 100%"
                    />
                    <div class="form-help-text">只有核销次数达到此值才进行统计</div>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="检查频率" field="conditions.checkInterval">
                    <a-select
                      v-model="formData.conditions.checkInterval"
                      placeholder="请选择检查频率"
                      style="width: 100%"
                    >
                      <a-option value="5min">每5分钟</a-option>
                      <a-option value="15min">每15分钟</a-option>
                      <a-option value="30min">每30分钟</a-option>
                      <a-option value="1hour">每小时</a-option>
                      <a-option value="6hour">每6小时</a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
            </div>

            <!-- 通用条件提示 -->
            <div v-if="!formData.type" class="no-type-selected">
              <a-empty description="请先选择监控类型以配置预警条件" />
            </div>
          </a-card>
        </a-form-item>

        <a-form-item label="通知渠道" field="channels">
          <a-checkbox-group v-model="formData.channels">
            <a-checkbox value="wechat">企业微信</a-checkbox>
            <a-checkbox value="sms">短信</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
        <a-form-item label="文案配置" field="content">
          <a-card :bordered="false" class="content-card">
            <div v-if="formData.channels.includes('wechat')">
              <a-form-item label="企业微信文案" field="content.wechat">
                <a-textarea v-model="formData.content.wechat" placeholder="请输入企业微信通知文案" :rows="3" />
              </a-form-item>
            </div>
            <div v-if="formData.channels.includes('sms')" :style="formData.channels.includes('wechat') ? 'margin-top: 12px;' : ''">
              <a-form-item label="短信文案" field="content.sms">
                <a-textarea v-model="formData.content.sms" placeholder="请输入短信通知文案" :rows="3" />
              </a-form-item>
            </div>
            <div v-if="formData.channels.length === 0" class="no-channel-selected">
              <a-empty description="请选择通知渠道以配置文案" />
            </div>
          </a-card>
        </a-form-item>

        <a-form-item label="接收人配置" field="recipients">
          <a-card :bordered="false" class="recipients-card">
            <!-- 企业微信接收人配置 -->
            <div v-if="formData.channels.includes('wechat')">
              <div class="recipient-section">
                <h4>
                  <IconWechat />
                  企业微信接收人
                </h4>
                <div class="recipient-list">
                  <div 
                    v-for="(user, index) in formData.recipients.wechatUsers" 
                    :key="index"
                    class="recipient-item"
                  >
                    <a-row :gutter="8" align="middle">
                      <a-col :span="8">
                        <a-input 
                          v-model="user.userId" 
                          placeholder="用户ID"
                          :rules="[{ required: true, message: '请输入用户ID' }]"
                        />
                      </a-col>
                      <a-col :span="8">
                        <a-input 
                          v-model="user.userName" 
                          placeholder="用户姓名"
                        />
                      </a-col>
                      <a-col :span="6">
                        <a-select 
                          v-model="user.department" 
                          placeholder="部门"
                          allow-clear
                        >
                          <a-option value="marketing">营销部</a-option>
                          <a-option value="operations">运营部</a-option>
                          <a-option value="tech">技术部</a-option>
                          <a-option value="finance">财务部</a-option>
                        </a-select>
                      </a-col>
                      <a-col :span="2">
                        <a-button 
                          type="text" 
                          status="danger" 
                          size="small"
                          @click="removeWechatUser(index)"
                        >
                          <template #icon><IconDelete /></template>
                        </a-button>
                      </a-col>
                    </a-row>
                  </div>
                  <a-button 
                    type="dashed" 
                    @click="addWechatUser"
                    style="width: 100%; margin-top: 8px;"
                  >
                    <template #icon><IconPlus /></template>
                    添加企业微信用户
                  </a-button>
                </div>
                <div class="batch-input" style="margin-top: 16px;">
                  <a-textarea
                    v-model="wechatBatchInput"
                    placeholder="批量添加：每行一个用户ID，或使用逗号分隔多个用户ID"
                    :rows="3"
                    style="margin-bottom: 8px;"
                  />
                  <a-button @click="batchAddWechatUsers" size="small">
                    批量添加
                  </a-button>
                </div>
              </div>
            </div>

            <!-- 短信接收人配置 -->
            <div v-if="formData.channels.includes('sms')" :style="formData.channels.includes('wechat') ? 'margin-top: 24px;' : ''">
              <div class="recipient-section">
                <h4>
                  <IconMobile />
                  短信接收人
                </h4>
                <div class="recipient-list">
                  <div 
                    v-for="(contact, index) in formData.recipients.smsContacts" 
                    :key="index"
                    class="recipient-item"
                  >
                    <a-row :gutter="8" align="middle">
                      <a-col :span="8">
                        <a-input 
                          v-model="contact.phone" 
                          placeholder="手机号码"
                          :rules="phoneValidationRules"
                          @blur="validatePhone(contact.phone, index)"
                        />
                        <div v-if="contact.phoneError" class="error-text">{{ contact.phoneError }}</div>
                      </a-col>
                      <a-col :span="8">
                        <a-input 
                          v-model="contact.name" 
                          placeholder="联系人姓名"
                        />
                      </a-col>
                      <a-col :span="6">
                        <a-select 
                          v-model="contact.role" 
                          placeholder="角色"
                          allow-clear
                        >
                          <a-option value="manager">管理员</a-option>
                          <a-option value="operator">操作员</a-option>
                          <a-option value="observer">观察员</a-option>
                        </a-select>
                      </a-col>
                      <a-col :span="2">
                        <a-button 
                          type="text" 
                          status="danger" 
                          size="small"
                          @click="removeSmsContact(index)"
                        >
                          <template #icon><IconDelete /></template>
                        </a-button>
                      </a-col>
                    </a-row>
                  </div>
                  <a-button 
                    type="dashed" 
                    @click="addSmsContact"
                    style="width: 100%; margin-top: 8px;"
                  >
                    <template #icon><IconPlus /></template>
                    添加短信联系人
                  </a-button>
                </div>
                <div class="batch-input" style="margin-top: 16px;">
                  <a-textarea
                    v-model="smsBatchInput"
                    placeholder="批量添加：每行一个手机号，或使用逗号分隔多个手机号"
                    :rows="3"
                    style="margin-bottom: 8px;"
                  />
                  <a-button @click="batchAddSmsContacts" size="small">
                    批量添加
                  </a-button>
                </div>
              </div>
            </div>

            <!-- 未选择通知渠道时的提示 -->
            <div v-if="formData.channels.length === 0" class="no-channel-selected">
              <a-empty description="请先选择通知渠道以配置接收人" />
            </div>

            <!-- 接收人配置总结 -->
            <div v-if="formData.channels.length > 0" class="recipients-summary">
              <a-divider />
              <div class="summary-content">
                <h5>接收人配置总结</h5>
                <div v-if="formData.channels.includes('wechat')" class="summary-item">
                  <IconWechat />
                  企业微信: {{ formData.recipients.wechatUsers.length }} 人
                </div>
                <div v-if="formData.channels.includes('sms')" class="summary-item">
                  <IconMobile />
                  短信: {{ formData.recipients.smsContacts.length }} 人
                </div>
              </div>
            </div>
          </a-card>
        </a-form-item>

        <a-form-item label="规则描述" field="description">
          <a-textarea
            v-model="formData.description"
            placeholder="请输入规则描述"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { IconPlus, IconDelete, IconWechat, IconMobile } from '@arco-design/web-vue/es/icon'
import { Message, Modal } from '@arco-design/web-vue'
import StatusTag from '@/components/common/StatusTag.vue'
import DateUtils from '@/utils/dateUtils'

// 数据加载状态
const loading = ref(false)

// 搜索关键词
const searchKeyword = ref('')

// 模态框状态
const modalVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

// 批量输入
const wechatBatchInput = ref('')
const smsBatchInput = ref('')

// 券库存和券包数据
const couponInventories = ref([])
const couponPackages = ref([])
const couponInstances = ref([])
const couponInventoriesLoading = ref(false)
const couponPackagesLoading = ref(false)
const couponInstancesLoading = ref(false)

// 表单数据
const formData = reactive({
  id: '',
  name: '',
  type: '',
  conditions: {},
  channels: [],
  recipients: {
    wechatUsers: [],
    smsContacts: []
  },
  content: {
    wechat: '',
    sms: ''
  },
  description: '',
  status: 'active'
})

// 手机号验证规则
const phoneValidationRules = [
  { required: true, message: '请输入手机号码' },
  { 
    pattern: /^1[3-9]\d{9}$/, 
    message: '请输入正确的手机号码格式' 
  }
]

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入规则名称' }],
  type: [{ required: true, message: '请选择监控类型' }],
  channels: [{ required: true, message: '请选择通知渠道' }],
  'conditions.threshold': [
    { required: true, message: '请输入库存阈值' }
  ],
  'conditions.thresholdType': [
    { required: true, message: '请选择阈值类型' }
  ],
  'conditions.advanceDays': [
    { required: true, message: '请输入提前预警天数' }
  ],
  'conditions.level': [
    { required: true, message: '请选择预警级别' }
  ],
  'conditions.failureRate': [
    { required: true, message: '请输入失败率阈值' }
  ],
  'conditions.timeWindow': [
    { required: true, message: '请选择统计时间窗口' }
  ]
}

// Mock数据
const alertRules = ref([
  {
    id: '1',
    name: '券库存低库存预警',
    type: 'inventory',
    conditions: {
      threshold: 100,
      thresholdType: 'absolute',
      checkInterval: '15min',
      consecutiveCount: 2
    },
    channels: ['wechat', 'sms'],
    recipients: {
      wechatUsers: [
        { userId: 'user001', userName: '张三', department: 'marketing' },
        { userId: 'user002', userName: '李四', department: 'operations' }
      ],
      smsContacts: [
        { phone: '13800138000', name: '张三', role: 'manager' },
        { phone: '13900139000', name: '李四', role: 'operator' }
      ]
    },
    status: 'active',
    created_at: '2024-01-15 10:30:00',
    switching: false
  },
  {
    id: '2',
    name: '券即将过期预警',
    type: 'expiry',
    conditions: {
      advanceDays: 7,
      level: 'high',
      batchThreshold: 50,
      checkTime: '09:00'
    },
    channels: ['wechat'],
    recipients: {
      wechatUsers: [
        { userId: 'user003', userName: '王五', department: 'marketing' },
        { userId: 'user004', userName: '赵六', department: 'tech' }
      ],
      smsContacts: []
    },
    status: 'active',
    created_at: '2024-01-14 14:20:00',
    switching: false
  },
  {
    id: '3',
    name: '券包发放失败率预警',
    type: 'failure',
    conditions: {
      failureRate: 10,
      timeWindow: '15min',
      minSampleSize: 100,
      consecutiveFailures: 3
    },
    channels: ['wechat', 'sms'],
    recipients: {
      wechatUsers: [
        { userId: 'user005', userName: '钱七', department: 'tech' }
      ],
      smsContacts: [
        { phone: '13700137000', name: '钱七', role: 'manager' }
      ]
    },
    status: 'inactive',
    created_at: '2024-01-13 09:15:00',
    switching: false
  }
])

// 过滤后的规则列表
const filteredRules = computed(() => {
  if (!searchKeyword.value) {
    return alertRules.value
  }
  return alertRules.value.filter(rule =>
    rule.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 获取预警级别描述
const getLevelDescription = (level) => {
  const descriptions = {
    high: '立即通知，优先级最高',
    medium: '正常通知，中等优先级',
    low: '延迟通知，优先级较低'
  }
  return descriptions[level] || ''
}

// 获取监控类型颜色
const getTypeColor = (type) => {
  const colors = {
    inventory: 'blue',
    expiry: 'orange',
    failure: 'red',
    coupon_inventory: 'purple',
    coupon_package: 'cyan',
    coupon_lifecycle: 'green'
  }
  return colors[type] || 'gray'
}

// 获取监控类型文本
const getTypeText = (type) => {
  const texts = {
    inventory: '库存监控',
    expiry: '过期监控',
    failure: '发放失败监控',
    coupon_inventory: '券库存粒度监控',
    coupon_package: '券包粒度监控',
    coupon_lifecycle: '券实例生命周期监控'
  }
  return texts[type] || '未知类型'
}

// 获取通知渠道颜色
const getChannelColor = (channel) => {
  const colors = {
    wechat: 'green',
    sms: 'blue'
  }
  return colors[channel] || 'gray'
}

// 获取通知渠道文本
const getChannelText = (channel) => {
  const texts = {
    wechat: '企业微信',
    sms: '短信'
  }
  return texts[channel] || '未知渠道'
}

// 格式化预警条件
const formatConditions = (conditions) => {
  if (!conditions) return '-'
  
  if (conditions.threshold !== undefined) {
    const type = conditions.thresholdType === 'percentage' ? '%' : '个'
    return `阈值: ${conditions.threshold}${type}`
  }
  
  if (conditions.advanceDays !== undefined) {
    return `提前${conditions.advanceDays}天预警`
  }
  
  if (conditions.failureRate !== undefined) {
    return `失败率>${conditions.failureRate}% (${conditions.timeWindow})`
  }
  
  return '-'
}

// 企业微信用户管理
const addWechatUser = () => {
  formData.recipients.wechatUsers.push({
    userId: '',
    userName: '',
    department: ''
  })
}

const removeWechatUser = (index) => {
  formData.recipients.wechatUsers.splice(index, 1)
}

const batchAddWechatUsers = () => {
  if (!wechatBatchInput.value.trim()) return
  
  const userIds = wechatBatchInput.value
    .split(/[,\n]/)
    .map(id => id.trim())
    .filter(id => id)
  
  userIds.forEach(userId => {
    if (!formData.recipients.wechatUsers.find(user => user.userId === userId)) {
      formData.recipients.wechatUsers.push({
        userId,
        userName: '',
        department: ''
      })
    }
  })
  
  wechatBatchInput.value = ''
  Message.success(`批量添加了 ${userIds.length} 个企业微信用户`)
}

// 获取阈值占位符和帮助文本
const getThresholdPlaceholder = (metricType) => {
  const placeholders = {
    remaining_stock: '库存数量',
    remaining_ratio: '百分比(%)',
    remaining_days: '天数'
  }
  return placeholders[metricType] || '请输入阈值'
}

const getThresholdHelpText = (metricType) => {
  const helpTexts = {
    remaining_stock: '当剩余库存量低于此值时触发预警',
    remaining_ratio: '当剩余库存比例低于此值时触发预警',
    remaining_days: '当剩余有效天数低于此值时触发预警'
  }
  return helpTexts[metricType] || ''
}

const getPackageThresholdPlaceholder = (metricType) => {
  const placeholders = {
    package_expiry_days: '天数',
    package_remaining_stock: '库存数量',
    daily_success_rate: '成功率(%)'
  }
  return placeholders[metricType] || '请输入阈值'
}

const getPackageThresholdHelpText = (metricType) => {
  const helpTexts = {
    package_expiry_days: '当券包剩余有效期低于此值时触发预警',
    package_remaining_stock: '当券包下有效库存量低于此值时触发预警',
    daily_success_rate: '当当日下发成功率低于此值时触发预警'
  }
  return helpTexts[metricType] || ''
}

const getLifecycleThresholdPlaceholder = (metricType) => {
  const placeholders = {
    verification_failure_rate: '失败率(%)',
    conversion_rate: '转化率(%)'
  }
  return placeholders[metricType] || '请输入阈值'
}

const getLifecycleThresholdHelpText = (metricType) => {
  const helpTexts = {
    verification_failure_rate: '当核销失败占比高于此值时触发预警',
    conversion_rate: '当核销转化率低于此值时触发预警'
  }
  return helpTexts[metricType] || ''
}

// 短信联系人管理
const addSmsContact = () => {
  formData.recipients.smsContacts.push({
    phone: '',
    name: '',
    role: '',
    phoneError: ''
  })
}

const removeSmsContact = (index) => {
  formData.recipients.smsContacts.splice(index, 1)
}

const validatePhone = (phone, index) => {
  const phoneRegex = /^1[3-9]\d{9}$/
  if (phone && !phoneRegex.test(phone)) {
    formData.recipients.smsContacts[index].phoneError = '请输入正确的手机号码格式'
  } else {
    formData.recipients.smsContacts[index].phoneError = ''
  }
}

const batchAddSmsContacts = () => {
  if (!smsBatchInput.value.trim()) return
  
  const phones = smsBatchInput.value
    .split(/[,\n]/)
    .map(phone => phone.trim())
    .filter(phone => phone)
  
  const phoneRegex = /^1[3-9]\d{9}$/
  const validPhones = phones.filter(phone => phoneRegex.test(phone))
  const invalidPhones = phones.filter(phone => !phoneRegex.test(phone))
  
  validPhones.forEach(phone => {
    if (!formData.recipients.smsContacts.find(contact => contact.phone === phone)) {
      formData.recipients.smsContacts.push({
        phone,
        name: '',
        role: '',
        phoneError: ''
      })
    }
  })
  
  smsBatchInput.value = ''
  
  if (validPhones.length > 0) {
    Message.success(`批量添加了 ${validPhones.length} 个短信联系人`)
  }
  if (invalidPhones.length > 0) {
    Message.warning(`${invalidPhones.length} 个手机号格式不正确，已跳过`)
  }
}

// 搜索处理
const handleSearch = (value) => {
  searchKeyword.value = value
}

// 创建规则
const handleCreate = () => {
  isEdit.value = false
  resetForm()
  modalVisible.value = true
}

// 编辑规则
const handleEdit = (record) => {
  isEdit.value = true
  Object.assign(formData, {
    ...record,
    recipients: {
      wechatUsers: [...(record.recipients.wechatUsers || [])],
      smsContacts: [...(record.recipients.smsContacts || [])]
    },
    content: {
      wechat: record.content && record.content.wechat ? record.content.wechat : '',
      sms: record.content && record.content.sms ? record.content.sms : ''
    }
  })
  modalVisible.value = true
}

// 删除规则
const handleDelete = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除规则"${record.name}"吗？`,
    onOk: () => {
      const index = alertRules.value.findIndex(item => item.id === record.id)
      if (index > -1) {
        alertRules.value.splice(index, 1)
        Message.success('删除成功')
      }
    }
  })
}

// 状态切换
const handleStatusChange = (record, value) => {
  record.switching = true
  
  // 模拟异步操作
  setTimeout(() => {
    record.status = value ? 'active' : 'inactive'
    record.switching = false
    Message.success(`规则已${value ? '启用' : '禁用'}`)
  }, 1000)
}

// 监控类型变化处理
const handleTypeChange = (value) => {
  formData.conditions = {}
  
  // 根据类型设置默认条件
  if (value === 'inventory') {
    formData.conditions = {
      threshold: 100,
      thresholdType: 'absolute',
      checkInterval: '15min',
      consecutiveCount: 2
    }
  } else if (value === 'expiry') {
    formData.conditions = {
      advanceDays: 7,
      level: 'medium',
      batchThreshold: 50,
      checkTime: '09:00'
    }
  } else if (value === 'failure') {
    formData.conditions = {
      failureRate: 10,
      timeWindow: '15min',
      minSampleSize: 100,
      consecutiveFailures: 3
    }
  } else if (value === 'coupon_inventory') {
    formData.conditions = {
      scope: 'all',
      metricType: 'remaining_stock',
      threshold: 100,
      level: 'medium',
      checkInterval: '15min'
    }
  } else if (value === 'coupon_package') {
    formData.conditions = {
      scope: 'all',
      metricType: 'package_expiry_days',
      threshold: 3,
      level: 'medium',
      checkInterval: '15min'
    }
  } else if (value === 'coupon_lifecycle') {
    formData.conditions = {
      metricType: 'verification_failure_rate',
      threshold: 5,
      timeWindow: '1hour',
      level: 'medium',
      minSampleSize: 100,
      checkInterval: '15min'
    }
  }
  
  // 加载相关数据
  if (value === 'coupon_inventory') {
    loadCouponInventories()
  } else if (value === 'coupon_package') {
    loadCouponPackages()
  } else if (value === 'coupon_lifecycle') {
    loadCouponInstances()
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    id: '',
    name: '',
    type: '',
    conditions: {},
    channels: [],
    recipients: {
      wechatUsers: [],
      smsContacts: []
    },
    content: {
      wechat: '',
      sms: ''
    },
    description: '',
    status: 'active'
  })
  wechatBatchInput.value = ''
  smsBatchInput.value = ''
}

// 表单验证
const validateForm = () => {
  // 验证接收人配置
  if (formData.channels.includes('wechat') && formData.recipients.wechatUsers.length === 0) {
    Message.error('请至少添加一个企业微信接收人')
    return false
  }
  
  if (formData.channels.includes('sms') && formData.recipients.smsContacts.length === 0) {
    Message.error('请至少添加一个短信接收人')
    return false
  }
  
  // 验证企业微信用户ID
  for (const user of formData.recipients.wechatUsers) {
    if (!user.userId.trim()) {
      Message.error('企业微信用户ID不能为空')
      return false
    }
  }
  
  // 验证短信联系人手机号
  for (const contact of formData.recipients.smsContacts) {
    if (!contact.phone.trim()) {
      Message.error('短信联系人手机号不能为空')
      return false
    }
    if (!/^1[3-9]\d{9}$/.test(contact.phone)) {
      Message.error('请输入正确的手机号码格式')
      return false
    }
  }
  if (formData.channels.includes('wechat') && !formData.content.wechat.trim()) {
    Message.error('请输入企业微信通知文案')
    return false
  }
  if (formData.channels.includes('sms') && !formData.content.sms.trim()) {
    Message.error('请输入短信通知文案')
    return false
  }
  
  return true
}

// 提交表单
const handleSubmit = async () => {
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    // 自定义验证
    if (!validateForm()) return

    if (isEdit.value) {
      // 编辑模式
      const index = alertRules.value.findIndex(item => item.id === formData.id)
      if (index > -1) {
        alertRules.value[index] = {
          ...formData,
          recipients: {
            wechatUsers: [...formData.recipients.wechatUsers],
            smsContacts: [...formData.recipients.smsContacts]
          },
          content: {
            wechat: formData.content.wechat,
            sms: formData.content.sms
          },
          updated_at: new Date().toLocaleString()
        }
        Message.success('规则更新成功')
      }
    } else {
      // 新建模式
      const newRule = {
        ...formData,
        id: Date.now().toString(),
        recipients: {
          wechatUsers: [...formData.recipients.wechatUsers],
          smsContacts: [...formData.recipients.smsContacts]
        },
        content: {
          wechat: formData.content.wechat,
          sms: formData.content.sms
        },
        created_at: new Date().toLocaleString(),
        switching: false
      }
      alertRules.value.unshift(newRule)
      Message.success('规则创建成功')
    }

    modalVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 取消操作
const handleCancel = () => {
  modalVisible.value = false
  resetForm()
}

// 加载券库存数据
const loadCouponInventories = async () => {
  couponInventoriesLoading.value = true
  try {
    // 模拟API调用
    const response = await fetch('/api/coupon-inventories')
    const data = await response.json()
    couponInventories.value = data
  } catch (error) {
    console.error('加载券库存数据失败:', error)
    // 使用mock数据
    couponInventories.value = [
      { id: 'inventory_1', name: '新用户注册券库存', remaining_stock: 1500, total_stock: 2000 },
      { id: 'inventory_2', name: '满减优惠券库存', remaining_stock: 800, total_stock: 1000 },
      { id: 'inventory_3', name: '生日特惠券库存', remaining_stock: 200, total_stock: 500 },
      { id: 'inventory_4', name: '节日促销券库存', remaining_stock: 50, total_stock: 300 }
    ]
  } finally {
    couponInventoriesLoading.value = false
  }
}

// 加载券包数据
const loadCouponPackages = async () => {
  couponPackagesLoading.value = true
  try {
    // 模拟API调用
    const response = await fetch('/api/coupon-packages')
    const data = await response.json()
    couponPackages.value = data
  } catch (error) {
    console.error('加载券包数据失败:', error)
    // 使用mock数据
    couponPackages.value = [
      { id: 'package_1', name: '新用户礼包', remaining_days: 15, total_coupons: 100 },
      { id: 'package_2', name: '会员专享包', remaining_days: 7, total_coupons: 50 },
      { id: 'package_3', name: '节日特惠包', remaining_days: 3, total_coupons: 200 },
      { id: 'package_4', name: '生日福利包', remaining_days: 30, total_coupons: 80 }
    ]
  } finally {
    couponPackagesLoading.value = false
  }
}

// 加载券实例数据
const loadCouponInstances = async () => {
  couponInstancesLoading.value = true
  try {
    // 模拟API调用
    const response = await fetch('/api/coupon-instances')
    const data = await response.json()
    couponInstances.value = data
  } catch (error) {
    console.error('加载券实例数据失败:', error)
    // 使用mock数据
    couponInstances.value = [
      { id: 'instance_1', name: '满100减20券', status: '已发放' },
      { id: 'instance_2', name: '新用户专享券', status: '已核销' },
      { id: 'instance_3', name: '生日特惠券', status: '已过期' },
      { id: 'instance_4', name: '节日促销券', status: '已发放' }
    ]
  } finally {
    couponInstancesLoading.value = false
  }
}

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.alert-rules-container {
  padding: 20px;
}

.condition-card,
.recipients-card,
.content-card {
  background-color: #f7f8fa;
  margin-top: 8px;
}

.recipients-card h4 {
  margin: 0 0 8px 0;
  color: #1d2129;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-help-text {
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
  line-height: 1.4;
}

.recipient-section {
  margin-bottom: 16px;
}

.recipient-item {
  margin-bottom: 8px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e6eb;
}

.batch-input {
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e6eb;
}

.no-type-selected,
.no-channel-selected {
  padding: 40px 20px;
  text-align: center;
  color: #86909c;
}

.recipients-summary {
  margin-top: 16px;
}

.summary-content h5 {
  margin: 0 0 12px 0;
  color: #1d2129;
  font-size: 14px;
  font-weight: 500;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #4e5969;
  font-size: 13px;
}

.error-text {
  color: #f53f3f;
  font-size: 12px;
  margin-top: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .alert-rules-container {
    padding: 12px;
  }
  
  .recipient-item .arco-col {
    margin-bottom: 8px;
  }
}
</style>
