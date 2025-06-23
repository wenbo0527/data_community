#!/bin/sh

# 构建项目
npm run build

# 切换到 gh-pages 分支
git checkout gh-pages

# 删除旧文件（保留 .git）
git ls-files | grep -v -E '^(dist/|.gitignore$|.git/)$' | xargs rm -rf

# 复制构建文件到根目录
cp -r dist/* .

# 提交并推送
git add .
git commit -m "Deploy $(date +'%Y-%m-%d %H:%M')"
git push origin gh-pages

# 切回开发分支
git checkout -