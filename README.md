# 知几 (ZhiJi) - AI命理咨询平台

<p align="center">
  <img src="/frontend/public/logo.png" width="120" alt="知几logo">
</p>

<p align="center">
  古老智慧的低语，指引你的未来
</p>

## 简介

知几是一个基于AI的命理咨询平台。通过智慧API提供智能命理咨询服务，支持Web端和移动端PWA应用。

"知几"源自《易经》"知几者，动之微，吉之先见者也"，意为洞察事物细微的变化预知吉凶。

## 功能模块 (19+)

### 核心功能
- 📊 **生辰八字** - 八字命盘分析，五行喜用神解读
- 🏠 **风水布局** - 居家风水布局调整建议
- 🃏 **塔罗牌** - 塔罗占卜，牌阵解读
- ✋ **手相揭秘** - 掌纹分析，命运轨迹
- 🌙 **周公解梦** - 梦境分析，潜意识解读

### 扩展功能
- ⭐ **星座** - 星座运势分析
- 🎯 **MBTI人格测试** - 性格类型分析
- 🎋 **抽签** - 求签问卜
- 📜 **黄帝内经** - 中医养生智慧
- 🔢 **生命灵数** - 数字能量分析
- 🌟 **紫微斗数** - 斗数命盘解读
- ☯️ **周易** - 易经占卜
- ✏️ **起名/姓名评测** - 八字五行起名
- 💑 **婚姻配对** - 八字合婚分析
- 🏢 **公司起名** - 商业命名
- 📅 **吉日选择** - 黄道吉日
- 🔢 **数字命理** - 手机号/车牌号分析
- 📖 **道德经** - 道家智慧
- 🔮 **问卦** - 易经问卜

## 技术栈

- **前端**: Vue 3 + Vite + Pinia + TailwindCSS
- **后端**: Node.js + Express
- **AI**: 智慧API
- **部署**: 支持Vercel/Railway部署

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd zhiJi

# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 配置

1. 在 `backend/` 目录下创建 `.env` 文件：

```env
API_KEY=your-api-key
BASE_URL=https://api.example.com
PORT=3000
NODE_ENV=development
```

2. 获取智慧API Key:
   - 访问 AI API服务商
   - 注册账号并获取API Key

### 启动

```bash
# 终端1 - 启动后端
cd backend
npm run dev

# 终端2 - 启动前端
cd frontend
npm run dev
```

### 访问

- 前端: http://localhost:5173
- 后端: http://localhost:3000
- API健康检查: http://localhost:3000/api/health

## 移动端支持

本项目支持PWA（渐进式Web应用），可以在手机端安装使用：

1. 在手机浏览器中访问 http://your-domain.com
2. 点击"添加到主屏幕"或浏览器菜单中的"安装"
3. 即可像原生应用一样使用

## API文档

### 通用聊天

```http
POST /api/chat
Content-Type: application/json

{
  "message": "你好",
  "history": []
}
```

### 模块聊天

```http
POST /api/chat/:module
Content-Type: application/json

{
  "message": "我的八字怎么样",
  "history": []
}
```

### 获取模块列表

```http
GET /api/modules
```

## 注意事项

1. **API Key安全**: 不要将API Key提交到公开仓库
2. **使用限制**: 智慧API有调用频率限制，请留意使用
3. **命理仅供娱乐**: 所有预测仅供娱乐参考，不可迷信

## 许可证

MIT License
