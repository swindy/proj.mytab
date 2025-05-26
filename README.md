# MyTab Extension - TypeScript版本

这是一个使用TypeScript开发的Edge/Chrome浏览器扩展，提供自定义新标签页功能。

## 功能特性

- 🔖 书签管理：添加、删除和组织你的常用网站
- 🔍 搜索引擎选择：支持百度、Google、Bing
- 🎨 主题切换：浅色、深色、自动模式
- 📁 工作区管理：创建不同的书签工作区
- ⏰ 时钟和日期显示
- 🎯 快速访问常用网站

## 技术栈

- **TypeScript** - 类型安全的JavaScript
- **Chrome Extension API** - 浏览器扩展接口
- **CSS3** - 现代样式设计
- **HTML5** - 语义化标记

## 项目结构

```
src/
├── background/          # 后台脚本
│   └── background.ts
├── popup/              # 弹出窗口
│   ├── popup.html
│   ├── popup.css
│   └── popup.ts
├── newtab/             # 新标签页
│   ├── newtab.html
│   ├── newtab.css
│   └── newtab.ts
└── types/              # 类型定义
    └── index.ts

dist/                   # 编译输出目录
├── background/
├── popup/
├── newtab/
└── manifest.json

icons/                  # 扩展图标
├── icon16.png
├── icon48.png
└── icon128.png
```

## 开发环境设置

### 1. 安装依赖

```bash
npm install
```

### 2. 开发模式

```bash
# 监听文件变化并自动编译
npm run dev

# 或者单次编译
npm run build
```

### 3. 生产构建

```bash
npm run build:prod
```

## 安装扩展

1. 打开Edge浏览器，进入 `edge://extensions/`
2. 开启"开发者模式"
3. 点击"加载解压缩的扩展"
4. 选择项目的 `dist` 目录
5. 扩展安装完成！

## 类型定义

项目使用TypeScript提供完整的类型安全：

```typescript
// 书签接口
interface Bookmark {
  title: string;
  url: string;
  icon?: string;
  description?: string;
}

// 工作区接口
interface Workspace {
  id: string;
  name: string;
  bookmarks: Bookmark[];
  icon?: string;
}

// 搜索引擎类型
type SearchEngine = 'baidu' | 'google' | 'bing';

// 主题类型
type Theme = 'light' | 'dark' | 'auto';
```

## 构建脚本

- `npm run build` - 编译TypeScript文件
- `npm run watch` - 监听模式编译
- `npm run clean` - 清理输出目录
- `npm run dev` - 开发模式（清理+监听）
- `npm run build:prod` - 生产构建

## 开发说明

### TypeScript配置

项目使用严格的TypeScript配置：
- 启用所有严格检查
- 目标ES2020
- 模块系统ES2020
- 生成源码映射和声明文件

### Chrome API类型

使用 `@types/chrome` 包提供Chrome扩展API的类型定义。

### 模块系统

使用ES模块系统，支持现代JavaScript特性。

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 更新日志

### v1.0.0 (TypeScript版本)
- ✨ 完全重写为TypeScript
- 🔧 添加完整的类型定义
- 📦 改进构建系统
- �� 修复类型安全问题
- 📚 更新文档 