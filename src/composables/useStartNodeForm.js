import { reactive, ref, computed } from 'vue';
import { Message } from '@arco-design/web-vue';
import { DEFAULT_START_NODE_CONFIG, VALIDATION_LIMITS } from '../constants/startNodeConfig';
export function useStartNodeForm() {
    const formRef = ref();
    // 表单数据
    const formData = reactive({
        ...DEFAULT_START_NODE_CONFIG,
        targetAudience: []
    });
    // 表单验证规则
    const rules = computed(() => ({
        taskType: [
            { required: true, message: '请选择任务类型' }
        ],
        entryDate: [
            { required: true, message: '请选择进入日期' }
        ],
        frequency: [
            { required: true, message: '请选择进入频率' }
        ],
        deduplicationDays: [
            { required: true, message: '请输入去重天数' },
            {
                type: 'number',
                min: VALIDATION_LIMITS.deduplicationDays.min,
                max: VALIDATION_LIMITS.deduplicationDays.max,
                message: `去重天数必须在${VALIDATION_LIMITS.deduplicationDays.min}-${VALIDATION_LIMITS.deduplicationDays.max}之间`
            }
        ],
        pushLimit: [
            { required: true, message: '请输入推送上限' },
            {
                type: 'number',
                min: VALIDATION_LIMITS.pushLimit.min,
                max: VALIDATION_LIMITS.pushLimit.max,
                message: `推送上限必须在${VALIDATION_LIMITS.pushLimit.min}-${VALIDATION_LIMITS.pushLimit.max}之间`
            }
        ],
        priority: [
            { required: true, message: '请选择优先级' }
        ],
        targetAudience: [
            { required: true, message: '请选择目标人群' }
        ],
        customAudienceConfig: [
            {
                validator: (value, callback) => {
                    if (formData.targetAudience?.includes('custom') && !value?.trim()) {
                        callback('请输入自定义人群筛选条件');
                    }
                    else {
                        callback();
                    }
                }
            }
        ]
    }));
    // 是否显示自定义人群配置
    const showCustomAudienceConfig = computed(() => formData.targetAudience?.includes('custom'));
    // 加载数据到表单
    const loadFormData = (nodeData) => {
        Object.assign(formData, { ...DEFAULT_START_NODE_CONFIG, ...nodeData });
    };
    // 重置表单
    const resetForm = () => {
        formRef.value?.resetFields();
        Object.assign(formData, { ...DEFAULT_START_NODE_CONFIG });
    };
    // 验证表单
    const validateForm = async () => {
        try {
            const valid = await formRef.value?.validate();
            return !valid; // validate() 返回错误信息，无错误时返回 undefined
        }
        catch (error) {
            console.error('表单验证失败:', error);
            return false;
        }
    };
    // 提交表单
    const submitForm = async () => {
        const isValid = await validateForm();
        if (!isValid) {
            return null;
        }
        const configData = { ...formData };
        Message.success('开始节点配置保存成功');
        return configData;
    };
    return {
        formRef,
        formData,
        rules,
        showCustomAudienceConfig,
        loadFormData,
        resetForm,
        validateForm,
        submitForm
    };
}
