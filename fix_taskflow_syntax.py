#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复TaskFlowCanvas.vue文件中的语法错误
"""

import re
import os

def fix_taskflow_canvas_syntax():
    file_path = '/Users/mac/nis_mock/data_comunity/data_comunity/src/pages/marketing/tasks/components/TaskFlowCanvas.vue'
    
    if not os.path.exists(file_path):
        print(f"文件不存在: {file_path}")
        return
    
    # 读取文件内容
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # 1. 替换中文引号为英文引号
    content = content.replace('