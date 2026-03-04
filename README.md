# 知几 (ZhiJi) - 玄学命理AI平台

> 一个结合古老智慧与现代AI技术的命理咨询平台

## 📋 项目概述

**项目名称**: 知几 (ZhiJi)  
**项目类型**: 全栈Web应用 (Vue.js + Node.js)  
**核心功能**: 八字算命、玄空风水、紫微斗数、梅花易数等玄学服务  
**目标用户**: 对中国传统命理、风水感兴趣的 用户

---

## 🏗 技术架构

### 前端技术栈
| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | ^3.4 | 核心框架 |
| Vite | ^5.0 | 构建工具 |
| Pinia | ^2.1 | 状态管理 |
| Vue Router | ^4.2 | 路由管理 |
| Axios | ^1.6 | HTTP请求 |
| Tailwind CSS | ^3.4 | 样式框架 |

### 后端技术栈
| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | ^20 | 运行时 |
| Express | ^4.18 | Web框架 |
| AI API | DeepSeek | AI对话服务 |

### 部署平台
- **前端**: Vercel
- **后端**: Railway
- **域名**: zero.zxqconsulting.com

---

## 📁 项目结构

```
zero/
├── frontend/                    # 前端项目
│   ├── src/
│   │   ├── components/         # 可复用组件
│   │   │   ├── AppHeader.vue    # 顶部导航
│   │   │   ├── Sidebar.vue     # 侧边栏
│   │   │   ├── MobileNav.vue   # 移动端导航
│   │   │   ├── LanguageSelector.vue  # 语言选择器
│   │   │   ├── ProfileSelector.vue   # 档案选择器
│   │   │   └── ImageUpload.vue # 图片上传
│   │   ├── views/              # 页面视图
│   │   │   ├── Home.vue        # 首页
│   │   │   ├── Chat.vue        # 聊天页面
│   │   │   └── Admin.vue       # 管理后台
│   │   ├── stores/             # Pinia状态管理
│   │   │   ├── chat.js         # 聊天状态
│   │   │   ├── profile.js      # 档案状态
│   │   │   └── user.js         # 用户状态
│   │   ├── i18n/               # 国际化
│   │   │   ├── index.js        # i18n配置
│   │   │   └── translations.js # 翻译内容
│   │   ├── utils/              # 工具函数
│   │   │   ├── sound.js        # 声音播放
│   │   │   └── voice.js        # 语音识别
│   │   ├── router/             # 路由配置
│   │   ├── App.vue             # 根组件
│   │   └── main.js             # 入口文件
│   ├── public/                 # 静态资源
│   ├── vite.config.js          # Vite配置
│   └── vercel.json             # Vercel配置
│
├── backend/                     # 后端项目
│   ├── src/
│   │   ├── index.js            # 主入口
│   │   └── services/
│   │       └── aiService.js    # AI服务
│   └── package.json
│
└── README.md                   # 本文档
```

---

## 🔑 核心功能模块

### 1. 多语言支持 (i18n)
- 支持12种语言: 中文、英语、日语、韩语、西班牙语、意大利语、法语、德语、葡萄牙语、阿拉伯语、印尼语、马来语
- 自动检测系统语言
- 语言持久化存储
- 完整翻译所有UI和预设问题

### 2. 用户档案系统
- 创建个人档案 (姓名、出生日期、性别、出生时辰)
- 八字自动计算
- 档案本地存储
- 多档案管理

### 3. AI对话系统
- 多模块支持 (八字、玄空、紫微、梅花易数)
- 流式响应
- 历史记录保存
- 用户本地时间同步

### 4. 运营管理后台
- 数据统计看板
- 用户管理
- 聊天记录查看
- 数据导出
- 会员管理

---

## 🚀 GEO (生成式引擎优化) 指南

> 基于AI搜索时代的SEO优化策略，让网站内容成为AI的"标准答案"

### 什么是GEO？

GEO（Generative Engine Optimization）是将网站内容优化为AI搜索引擎"首选答案"的技术。不同于传统SEO，GEO的核心目标是：
- 让AI在回答用户问题时引用你的网站内容
- 提供结构化、答案优先的内容
- 构建多维度的可信度信号

### 本项目的GEO实施

#### 1. Schema.org 结构化数据 (`index.html`)

已在 `frontend/index.html` 中添加完整的Schema.org标记：

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", ... },
    { "@type": "WebSite", ... },
    { "@type": "WebApplication", ... },
    { "@type": "FAQPage", ... },      <!-- 常见问题 -->
    { "@type": "HowTo", ... },        <!-- 操作指南 -->
    { "@type": "BreadcrumbList", ... }
  ]
}
</script>
```

**标记类型说明：**
| 类型 | 用途 |
|------|------|
| Organization | 网站/公司信息 |
| WebSite | 网站基本信息+搜索Action |
| WebApplication | 应用信息 |
| FAQPage | 常见问题（用户高频问题） |
| HowTo | 操作指南（如八字算命流程） |
| BreadcrumbList | 面包屑导航 |

#### 2. AI回答结构化 (`aiService.js`)

优化了核心模块的systemPrompt，要求AI输出结构化内容：

```markdown
## 📊 八字基础信息
- 乾/坤造：...
- 日主：...
- 五行分布：...

## 🔮 五行分析
### 五行强弱
### 喜用神
### 忌神

## 💼 事业运势
### 2024-2025年
### 2026-2027年
```

**已优化的模块：**
- 生辰八字 (bazi)
- 风水布局 (fengshui)
- 紫微斗数 (ziwei)
- 周易占卜 (zhouyi)
- 吉日选择 (luckyday)
- 塔罗牌 (tarot)

#### 3. 内容策略建议

**答案优先原则：**
- 每个页面只聚焦一个核心问题
- 提供完整、可操作的解决方案
- 包含具体步骤、工具、示例

**跨平台信任信号：**
- 知乎：发布精简版教程，链接至完整指南
- 小红书：分享案例和心得
- 公众号：深度文章
- GitHub：技术博客/开源项目

**AI引用监测：**
- 监控网站被DeepSeek等AI引用的情况
- 根据数据反馈优化高引用内容

### 验证工具

- [Google结构化数据测试工具](https://search.google.com/test/rich-results)
- [Schema.org验证器](https://validator.schema.org/)
- [AI搜索引用检测](https://perplexity.ai)

---

## ⚙️ 环境变量配置

### 前端 (.env)
```env
VITE_API_URL=https://zero-production-4a85.up.railway.app/api
```

### 后端 (.env)
```env
PORT=3001
DEEPSEEK_API_KEY=your_api_key_here
```

---

## 🚀 部署指南

### 前端部署 (Vercel)

1. **连接GitHub**
   ```bash
   # 安装Vercel CLI
   npm i -g vercel
   
   # 登录
   vercel login
   
   # 部署
   cd frontend
   vercel --prod
   ```

2. **配置环境变量**
   - 在Vercel项目设置中添加 `VITE_API_URL`

3. **SPA路由配置** (vercel.json)
   ```json
   {
     "framework": "vite",
     "rewrites": [
       { "source": "/(.*)", "destination": "/" }
     ]
   }
   ```

### 后端部署 (Railway)

1. **部署命令**
   ```bash
   # 安装Railway CLI
   npm i -g @railway/cli
   
   # 登录
   railway login
   
   # 初始化
   railway init
   
   # 部署
   railway up
   ```

2. **环境变量**
   - 在Railway项目设置中添加 `DEEPSEEK_API_KEY`

---

## 📝 关键代码片段

### 前端: API请求封装 (chat.js)
```javascript
// 关键：避免URL重复
let API_BASE = import.meta.env.VITE_API_URL || ''
if (API_BASE.endsWith('/api')) {
  API_BASE = API_BASE.slice(0, -4)
}
const API_URL = API_BASE + '/api'

// 发送用户本地时间
const userLocalTime = new Date().toISOString()
const response = await axios.post(`${API_URL}/chat/${currentModule.value}`, {
  message: content,
  history: history.value.slice(0, -1),
  profile: profile,
  userTime: userLocalTime
})
```

### 后端: 路由顺序 (index.js)
```javascript
// ⚠️ 重要：路由顺序必须正确
app.post('/api/chat', chatHandler)           // 通用聊天
app.post('/api/chat/save', saveHandler)      // 保存聊天 (必须在 /:module 之前)
app.post('/api/chat/:module', moduleHandler) // 模块聊天
```

### 后端: 用户时间处理 (index.js)
```javascript
function getUserDateTime(userTime) {
  let date = userTime ? new Date(userTime) : new Date()
  if (isNaN(date.getTime())) date = new Date()
  
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  return `当前日期：${year}年${month}月${day}日...`
}
```

---

## 🐛 常见问题排查

### 1. API返回404
- 检查路由顺序是否正确
- 确认 `VITE_API_URL` 配置正确

### 2. AI回答年份错误
- 确保前端传递 `userTime` 参数
- 检查后端 `getUserDateTime` 函数

### 3. 聊天记录保存失败
- 检查 Railway 日志
- 确认 `messages` 数组格式正确

### 4. 部署后资源缓存
- 使用 `vite.config.js` 添加内容哈希
- 清理浏览器缓存

---

## 📄 License

MIT License
