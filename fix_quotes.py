#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re

# 读取文件
with open('/Users/mac/nis_mock/data_comunity/data_comunity/src/pages/discovery/asset-management/metric-management/index.vue', 'r', encoding='utf-8') as f:
    content = f.read()

# 替换中文引号
# 替换中文单引号
content = content.replace(''', "'")
content = content.replace(''', "'")
# 替换中文双引号
content = content.replace('"', '"')
content = content.replace('"', '"')

# 写回文件
with open('/Users/mac/nis_mock/data_comunity/data_comunity/src/pages/discovery/asset-management/metric-management/index.vue', 'w', encoding='utf-8') as f:
    f.write(content)

print('中文引号替换完成')