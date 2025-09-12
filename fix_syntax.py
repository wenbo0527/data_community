import re

# 读取文件
with open('/Users/mac/nis_mock/data_comunity/data_comunity/src/pages/discovery/asset-management/metric-management/index.vue', 'r', encoding='utf-8') as f:
    content = f.read()

# 修复模板字符串中的转义问题
# 将 \${date} 修复为 ${date}
content = content.replace('\\${date}', '${date}')
content = content.replace('\\${quarter_end_date}', '${quarter_end_date}')
content = content.replace('\\${month}', '${month}')

# 修复可能的语法问题
# 确保对象属性后面有逗号
content = re.sub(r'(\w+:\s*[^,}]+)\s*\n\s*(\w+:)', r'\1,\n    \2', content)

# 写回文件
with open('/Users/mac/nis_mock/data_comunity/data_comunity/src/pages/discovery/asset-management/metric-management/index.vue', 'w', encoding='utf-8') as f:
    f.write(content)

print('语法错误修复完成')