/**
 * F8 字段编辑历史 Mock
 * 按字段 ID（schema.table.field）维护历史记录
 */
export interface ClassifyEditRecord {
  id: string
  field_key: string
  modified_at: string
  modified_by: string
  field_name: string
  old_value: string
  new_value: string
}

export const classifyEditHistory: ClassifyEditRecord[] = [
  { id: 'H001', field_key: 'crm_db.t_user_info.mobile', field_name: '敏感级别', modified_at: '2026-07-02 14:23', modified_by: '张三', old_value: 'L2', new_value: 'L3' },
  { id: 'H002', field_key: 'crm_db.t_user_info.id_card', field_name: '业务属于', modified_at: '2026-07-01 10:15', modified_by: '李四', old_value: '对公', new_value: '零售' },
  { id: 'H003', field_key: 'hive_dw.dwd_user_info.email', field_name: '四级业务目录', modified_at: '2026-06-28 16:40', modified_by: '王五', old_value: '邮箱地址', new_value: '邮箱' }
]
