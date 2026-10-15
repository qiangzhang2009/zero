# 知几 (ZhiJi) — AI Fortune-Telling Platform
## 产品需求文档 (PRD) v1.1

**日期：** 2026-10-15  
**版本：** 1.1  
**作者：** Product Team

---

## 修订历史

| 版本 | 日期 | 修订内容 |
|------|------|---------|
| 1.0 | 2026-10-15 | 初版：多语言设计、订阅 + 付费模式、补充角度 |
| 1.1 | 2026-10-15 | 补充：AI 多语言响应、合规免责声明体系、支付方案详细分析 |

---

## 1. 背景与目标

### 1.1 产品愿景

**知几** 是一个融合东方传统智慧与现代 AI 技术的命理咨询平台，面向全球用户提供服务。平台的核心价值在于：**让古老的命理智慧，通过 AI 技术，以更便捷、更个性化的方式触达每一个需要指引的人。**

### 1.2 目标用户

| 用户画像 | 特征 | 核心需求 |
|---------|------|---------|
| **海外华人** | 18-55岁，移民或留学海外 | 在异文化环境中保持传统文化连接 |
| **文化好奇者** | 25-45岁，西方用户 | 对东方哲学、命理文化感兴趣 |
| **实用主义者** | 28-50岁，各国用户 | 寻求人生决策的参考依据 |
| **高频咨询者** | 30-55岁 | 需要持续的专业命理指导 |

### 1.3 成功指标

- **DAU/MAU 比：** ≥ 15%
- **付费转化率：** ≥ 5%
- **用户留存（30天）：** ≥ 25%
- **NPS 评分：** ≥ 40
- **支持语言覆盖率：** 覆盖目标市场 95% 用户

---

## 2. 多语言系统设计

### 2.1 语言支持策略

#### 阶段一：首发语言（v1.0）

| 语言 | 地区 | 优先级 | 备注 |
|-----|------|--------|-----|
| **中文（简体）** | 中国大陆 | P0 | 核心用户群 |
| **中文（繁体）** | 台湾、香港、澳门 | P0 | 文化圈扩展 |
| **英语** | 全球通用 | P0 | 海外市场入口 |
| **日语** | 日本 | P1 | 文化相近市场 |
| **韩语** | 韩国 | P1 | 文化相近市场 |

#### 阶段二：扩展语言（v2.0）

越南语、泰语、马来语、德语、法语、西班牙语、葡萄牙语

### 2.2 自动语言切换机制

```
┌─────────────────────────────────────────────────────────┐
│                    语言检测流程                          │
├─────────────────────────────────────────────────────────┤
│  用户访问 → 检测优先级顺序：                            │
│  1. URL 参数 ?lang=xx  (最高优先级)                    │
│  2. localStorage 存储的上次选择                         │
│  3. navigator.language / navigator.languages            │
│  4. Accept-Language HTTP Header (SSR)                  │
│  5. 默认语言 (zh-CN)                                   │
└─────────────────────────────────────────────────────────┘
```

### 2.3 技术实现方案

```javascript
// 伪代码：语言检测优先级
function detectLanguage() {
  // 1. URL 参数
  const urlLang = new URLSearchParams(location.search).get('lang');
  if (urlLang && isSupported(urlLang)) return urlLang;
  
  // 2. 本地存储
  const savedLang = localStorage.getItem('zxq_language');
  if (savedLang && isSupported(savedLang)) return savedLang;
  
  // 3. 浏览器语言
  const browserLang = navigator.language.split('-')[0];
  if (isSupported(browserLang)) return browserLang;
  
  // 4. 默认
  return 'zh';
}
```

### 2.4 国际化（i18n）架构

```
frontend/
├── src/
│   ├── i18n/
│   │   ├── index.js           # i18n 初始化
│   │   ├── config.js          # 支持语言配置
│   │   ├── locales/
│   │   │   ├── zh.json        # 简体中文
│   │   │   ├── zh-TW.json     # 繁体中文
│   │   │   ├── en.json        # 英语
│   │   │   ├── ja.json        # 日语
│   │   │   └── ko.json        # 韩语
│   │   └── utils/
│   │       ├── detectLanguage.js
│   │       └── formatMessage.js
```

### 2.5 文化适配要点

| 模块 | 中国用户 | 英语用户 | 日韩用户 |
|-----|---------|---------|---------|
| **命理术语** | 八字、大运、流年 | Eight Characters, Destiny Cycle | 八字、大運 |
| **吉祥物/色彩** | 红色、金色 | 紫色、蓝色（神秘感） | 黑色、金色 |
| **日期格式** | 农历/公历 | 公历 | 公历/和历 |
| **姓名顺序** | 姓在前 | 名在前 | 姓在前 |
| **支付方式** | 支付宝、微信 | Stripe、PayPal | PayPal、本地支付 |

---

## 3. AI 多语言响应机制

### 3.1 核心原则

> **用户用什么语言提问，AI 就用什么语言回答**

```
┌─────────────────────────────────────────────────────────┐
│              多语言闭环流程                              │
├─────────────────────────────────────────────────────────┤
│  用户界面语言 ←─── 检测系统语言 ───→ AI 响应语言        │
│  ┌─────────────────┐                                  │
│  │  1. 界面文本    │  ← 静态文案                      │
│  │  2. AI 回复    │  ← 动态生成                      │
│  │  3. 命理术语    │  ← 文化适配                     │
│  └─────────────────┘                                  │
└─────────────────────────────────────────────────────────┘
```

### 3.2 技术实现

#### 前端语言检测 → AI 请求头

```javascript
// 发送请求时携带语言标识
const requestPayload = {
  query: userInput,
  language: detectLanguage(), // 从 i18n 系统获取当前语言
};

// AI 模型根据 language 参数选择响应语言
```

#### AI Prompt 示例

```
你是一位专业的命理师。用户使用 [zh-CN] 语言提问，
请使用相同的语言 [zh-CN] 回答。
回答时使用该语言的文化习惯和专业术语。
```

### 3.3 多语言命理术语对照

| 中文 | 英文 | 日文 | 韩文 |
|-----|------|------|------|
| 八字 | Eight Characters / BaZi | 八字 | 팔자 |
| 大运 | Decade Luck Cycle | 大運 | 대운 |
| 流年 | Year Luck / Liu Nian | 流年 | 류년 |
| 喜用神 | Favored Elements | 喜用神 | 희용신 |
| 五行 | Five Elements | 五行 | 오행 |
| 命宫 | Life Palace | 命宮 | 명궁 |
| 事业宫 | Career Palace | 事業宮 | 사업궁 |
| 财帛宫 | Wealth Palace | 財帛宮 | 재복궁 |

### 3.4 文化适配输出示例

**英语用户看到的解读：**
> "Your Eight Characters (BaZi) chart reveals a Wood-Dominant constitution with Fire as your Wealth Element. The upcoming Dragon Year (2028) brings significant career opportunities in creative and communication fields..."

**日语用户看到的解读：**
> "您的八字显示木气旺盛，喜用神为火。2028年是您的事业发展年，适合从事与火相关的行业..."

---

## 4. 合规体系设计

### 4.1 合规风险矩阵

| 风险类型 | 触发场景 | 潜在后果 | 优先级 |
|---------|---------|---------|--------|
| **法律免责声明缺失** | 用户因建议做重大决策失败 | 法律诉讼、赔偿 | P0 |
| **隐私合规** | 收集用户生日、命理数据 | GDPR/CCPA 罚款 | P0 |
| **金融误导** | 暗示可以预测投资/赌博 | 监管警告 | P0 |
| **年龄误导** | 未成年用户使用服务 | 家长投诉 | P1 |
| **退款争议** | Credit 购买后要求退款 | 支付平台处罚 | P1 |

### 4.2 免责声明体系

#### 4.2.1 首页底部固定免责声明

**英文版本：**
```
⚠️ Disclaimer & Legal Notice
▸ Entertainment Purposes Only
  Our services are for entertainment and cultural reference
  only. They do not constitute professional advice.
▸ No Financial Decisions
  Do not make investment, legal, or medical decisions
  based on fortune-telling results.
▸ Entertainment Only
  Fortune-telling is for amusement purposes only.
```

**中文版本：**
```
⚠️ 免责声明
• 本服务仅供娱乐和文化参考，不构成专业建议
• 请勿根据命理结果做出投资、法律、医疗等重大决策
• 命理结果仅供参考，人生掌握在自己手中
```

#### 4.2.2 用户注册/购买前的强制确认

```
┌─────────────────────────────────────────────────────────┐
│  📜 Before You Continue                                │
├─────────────────────────────────────────────────────────┤
│  □ I understand this service is for ENTERTAINMENT       │
│    ONLY and does not constitute professional advice.    │
│  □ I will NOT make financial, legal, or medical        │
│    decisions based on the fortune-telling results.      │
│  □ I am 18 years of age or older.                      │
│  [ Continue to Registration ]                          │
└─────────────────────────────────────────────────────────┘
```

#### 4.2.3 每次咨询结束后的弹窗提示

```
┌─────────────────────────────────────────────────────────┐
│  📌 Remember                                           │
├─────────────────────────────────────────────────────────┤
│  This reading is for entertainment purposes only.      │
│  • Not a substitute for professional advice            │
│  • Past results do not guarantee future outcomes       │
│  • Your choices shape your destiny                     │
│  [ I Understand ]  [ Share My Results ]                │
└─────────────────────────────────────────────────────────┘
```

#### 4.2.4 AI 回复末尾的标准脚注

> **⚠️ Disclaimer:** This fortune-telling reading is for entertainment and cultural reference only. It does not constitute professional financial, legal, medical, or psychological advice. The accuracy of predictions cannot be guaranteed. Please make important life decisions based on rational judgment and professional consultation.

### 4.3 隐私合规设计

#### 4.3.1 数据收集最小化原则

| 数据类型 | 是否必须 | 用途 | 保留期限 |
|---------|---------|------|---------|
| 出生日期 | 必填 | 八字计算 | 用户删除前 |
| 出生时辰 | 可选 | 精确八字 | 用户删除前 |
| 性别 | 可选 | 命理参考 | 用户删除前 |
| 姓名 | 不收集 | - | - |
| 邮箱 | 必填 | 账户 | 用户删除前 |
| 支付信息 | 由支付平台处理 | 支付 | 金融合规 |

#### 4.3.2 隐私政策页面（必须）

- 明确说明收集哪些数据
- 说明数据如何存储和保护
- GDPR Cookie 同意横幅
- 用户数据导出/删除功能
- 儿童隐私条款（13/16岁以下禁止）

### 4.4 合规技术实现检查清单

- 首页底部添加全局免责声明
- 注册/购买流程添加强制确认
- 每次咨询结束添加结果说明
- AI 回复末尾添加标准脚注
- 隐私政策页面（多语言版本）
- Cookie 同意横幅（欧盟用户）
- 年龄验证（18+）
- 数据删除功能（GDPR Article 17）
- 支付前显示退款政策
- 禁止投资/赌博相关内容的 AI 过滤

### 4.5 退款政策

| 情况 | 政策 |
|-----|------|
| 误购买（24小时内） | 全额退款 |
| 技术问题导致无法使用 | 全额退款 |
| Credit 未使用 | 按比例退款（扣除手续费） |
| 已使用部分 | 不支持退款 |
| 订阅费 | 月度订阅可随时取消，按剩余天数退款 |

### 4.6 防沉迷机制

- 单日使用超过 10 次 → 弹窗提醒"今日已咨询较多"
- 连续 7 天使用 → 推送"建议适当休息"
- 月度消费超过阈值 → 发送理性消费提醒
- 未成年用户检测 → 引导家长确认

---

## 5. 定价模式设计

### 5.1 商业模式概述

**双轨制：订阅制 + 按次付费**

```
┌─────────────────────────────────────────────────────────┐
│                    收入模式                             │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐      ┌─────────────┐                 │
│  │   订阅制     │      │  按次付费    │                 │
│  │  (会员)      │      │  (Credit)   │                 │
│  │  月付/年付    │      │  预购次数    │                 │
│  └─────────────┘      └─────────────┘                 │
│  目标：高频用户           目标：低频用户                │
│  锁定用户                降低付费门槛                  │
└─────────────────────────────────────────────────────────┘
```

### 5.2 订阅会员体系

#### 会员等级设计

| 等级 | 月费 | 年费（折算） | 每日免费额度 | 核心权益 |
|-----|------|------------|-------------|---------|
| **Free** | $0 | - | 3 Credits | 基础八字查询 |
| **Basic** | $9.99 | $89.99/年 | 20 Credits | 所有基础模块 |
| **Premium** | $29.99 | $269.99/年 | 100 Credits | 高级模块 + 优先响应 |
| **Pro** | $99.99 | $899.99/年 | 无限 | 专属顾问 + 定制报告 |

#### 会员权益详解

**Free 用户：**
- 每日 3 Credits（仅限基础八字模块）
- 查看历史记录（最近 7 天）
- 基础 AI 回复质量
- 广告展示

**Basic 会员：**
- 每日 20 Credits（全模块可用）
- 历史记录无限
- 标准 AI 回复质量
- 无广告
- 邮件支持

**Premium 会员：**
- 每日 100 Credits
- 高级 AI 回复（更详细解读）
- 优先响应（< 30秒）
- 专属报告生成
- 24/7 邮件支持

**Pro 会员：**
- 无限 Credits
- 最高质量 AI 回复
- 人工顾问对接（每月 1 小时）
- 个性化年度运势报告
- 专属客服经理
- 新功能优先体验

### 5.3 Credit（点数）消耗体系

#### 各模块消耗

| 模块 | 单次消耗 | 会员折扣 |
|-----|---------|---------|
| 基础八字查询 | 1 Credit | Free 用户每日 3 次 |
| 详细八字分析 | 3 Credits | Basic 及以上 |
| 流年大运预测 | 5 Credits | Premium 及以上 |
| 风水布局建议 | 5 Credits | Basic 及以上 |
| 紫微斗数 | 5 Credits | Premium 及以上 |
| 姓名测试 | 2 Credits | Basic 及以上 |
| 每日运势推送 | 1 Credit/次 | 全部用户 |
| 专属报告生成 | 20 Credits | Premium 及以上 |

#### Credit 购买（按次付费模式）

| Package | Credits | 价格 | 单价 | 推荐标签 |
|--------|---------|------|-----|---------|
| **Starter** | 30 Credits | $4.99 | $0.17/次 | 首次购买 |
| **Explorer** | 100 Credits | $12.99 | $0.13/次 | - |
| **Master** | 300 Credits | $34.99 | $0.12/次 | 热门 |
| **Grandmaster** | 1000 Credits | $99.99 | $0.10/次 | 超值 |

### 5.4 定价策略考量

| 角度 | 说明 | 建议 |
|-----|------|-----|
| **心理定价** | $9.99 vs $10.00 的心理感知差异 | 使用 .99 结尾 |
| **锚定效应** | 先展示高价 Pro 版本，引导选择 Basic | 定价页面策略 |
| **免费试用** | 7 天 Premium 试用（收集信用卡） | 转化漏斗设计 |
| **首次购买优惠** | 新用户专属 Starter 包 $2.99 | 拉新策略 |
| **礼品卡/赠送** | 购买 Credits 作为礼物赠送 | 社交裂变 |
| **企业定价** | 多用户套餐、独立管理后台 | B2B 收入来源 |

---

## 6. 支付方案分析

### 6.1 关键发现：Stripe 无法直接支持中国注册企业

根据 Stripe 官方文档：

| 情况 | Stripe 支持 | 支付宝支持 |
|-----|------------|-----------|
| **Stripe 账户注册** | 不支持中国大陆企业 | 可以 |
| **中国用户付款给海外商户** | 支持（通过 Stripe 的商户） | - |
| **海外用户付款给中国商户** | - | 跨境支付 |

### 6.2 你的情况分析

```
┌─────────────────────────────────────────────────────────┐
│              当前情况                                  │
├─────────────────────────────────────────────────────────┤
│  企业： 上海咨询公司（有限公司）                        │
│  目标： 面向海外用户收费                               │
│  痛点： 无法直接注册 Stripe 商户                        │
└─────────────────────────────────────────────────────────┘
```

### 6.3 支付方案对比

#### 方案一：个人支付宝（推荐给你）

| 维度 | 评估 |
|-----|------|
| **开通难度** | 最简单 |
| **手续费** | 0.6% - 1.2%（当面付） |
| **覆盖范围** | 主要是中国大陆用户 |
| **外汇结算** | 支持，但有额度限制 |
| **品牌信任** | 中国用户熟悉 |
| **海外用户** | 海外用户无法使用 |

**适用场景：** 如果你的海外华人用户占比较大（>30%），个人支付宝可以覆盖这部分需求。

**配置方式：**
- 申请支付宝「境外卡支付」（支持 Visa/Mastercard）
- 或使用「当面付」+ 手动生成收款码
- 外汇结算到银行卡

---

#### 方案二：Airwallex / PingPong / LianLian Global

| 维度 | 评估 |
|-----|------|
| **开通难度** | 可以用中国公司注册 |
| **手续费** | 0.6% - 1.0% |
| **覆盖范围** | 支付宝 + 微信 + 国际信用卡 |
| **外汇结算** | 自动结算到海外账户 |
| **品牌信任** | 服务商背书 |

**推荐理由：**
- 支持中国大陆企业注册
- 一站式接入支付宝、微信、银联
- 自动处理外汇结算
- 有英文管理后台

---

#### 方案三：注册香港/海外公司 + Stripe

| 维度 | 评估 |
|-----|------|
| **开通难度** | 高（需要注册新公司） |
| **手续费** | 2.9% + $0.30（Stripe 标准） |
| **覆盖范围** | 全球信用卡 + Apple Pay + Google Pay |
| **外汇结算** | 自动结算 |
| **品牌信任** | 全球认可 |

**成本估算（年）：**
- 香港公司注册：$3,000 - $5,000（代理）
- 银行账户：$500 - $2,000
- 会计/审计：$1,000 - $3,000
- **总计：$4,500 - $10,000/年**

**适用场景：** 如果月收入预期 >$5,000，长期来看更划算。

---

#### 方案四：PayPal（备选）

| 维度 | 评估 |
|-----|------|
| **开通难度** | 相对简单 |
| **手续费** | 3.49% + $0.30 |
| **覆盖范围** | 全球 4 亿用户 |
| **外汇结算** | 自动结算 |
| **品牌信任** | 全球知名 |

**注意：** PayPal 在中国大陆也无法注册商户，但个人账户可以收海外款项（有额度限制）。

### 6.4 推荐方案

```
┌─────────────────────────────────────────────────────────┐
│              推荐方案                                   │
├─────────────────────────────────────────────────────────┤
│  Phase 1 (MVP, 月收入 < $3,000):                        │
│  → 个人支付宝 + 境外收款功能                             │
│  → 成本最低，快速启动                                   │
│                                                         │
│  Phase 2 (增长, 月收入 > $3,000):                       │
│  → 迁移到 Airwallex / PingPong                          │
│  → 一站式接入支付宝 + 微信 + 国际卡                     │
│                                                         │
│  Phase 3 (规模化, 月收入 > $10,000):                    │
│  → 注册香港公司 + Stripe                                │
│  → 最大化全球覆盖和品牌信任                             │
└─────────────────────────────────────────────────────────┘
```

### 6.5 支付国际化策略

| 地区 | 推荐支付方式 |
|-----|-------------|
| **北美** | Stripe (Cards), PayPal, Apple Pay, Google Pay |
| **欧洲** | Stripe, PayPal, Klarna, SEPA Direct Debit |
| **日本** | Stripe, PayPal, Konbini |
| **韩国** | Stripe, Kakao Pay, 当地银行卡 |
| **东南亚** | Stripe, GrabPay, GoPay |
| **中国** | 支付宝、微信支付（需要中国商户资质） |

### 6.6 多支付方案代码架构

```javascript
// payment/providers.js
const providers = {
  alipay: {
    enabled: true,
    type: 'qr_code', // 或 'checkout'
    currencies: ['CNY'],
    regions: ['CN', 'HK'],
  },
  airwallex: {
    enabled: true,
    type: 'api',
    currencies: ['USD', 'EUR', 'GBP', 'CNY', 'JPY'],
    regions: ['global'],
  },
  stripe: {
    enabled: false, // 未来启用
    type: 'api',
    currencies: ['USD', 'EUR', 'GBP'],
    regions: ['US', 'EU', 'UK', 'AU'],
  }
};

// 根据用户地区动态选择支付方式
function getAvailablePayments(userRegion, userLanguage) {
  return Object.entries(providers)
    .filter(([key, config]) => config.enabled)
    .map(([key, config]) => ({
      id: key,
      name: getPaymentName(key, userLanguage),
      currencies: config.currencies,
    }));
}
```

---

## 7. 你可能没有考虑到的其他角度

### 7.1 用户信任体系

| 机制 | 作用 | 实现难度 |
|-----|------|---------|
| **用户评价/晒单** | 社会认同 | ⭐⭐ |
| **AI 准确度自评** | 让用户验证 AI 能力 | ⭐⭐⭐ |
| **历史案例展示** | 展示成功案例（脱敏） | ⭐⭐ |
| **专业背书** | 命理师/学者合作 | ⭐⭐⭐ |

### 7.2 客户支持体系

| 级别 | 响应时间 | 渠道 |
|-----|---------|------|
| Free 用户 | 72 小时 | 邮件 |
| Basic 会员 | 24 小时 | 邮件 |
| Premium 会员 | 6 小时 | 邮件 + 工单 |
| Pro 会员 | 1 小时 | 邮件 + 工单 + 专属链接 |

### 7.3 税务合规

| 地区 | 要求 |
|-----|------|
| 中国大陆 | 个人所得税 / 企业所得税（支付宝结算需合规申报） |
| 美国 | Stripe 自动处理销售税 |
| 欧盟 | VAT OSS 申报（欧盟境内销售） |
| 其他 | 视地区而定 |

### 7.4 技术架构建议

| 组件 | 推荐方案 |
|-----|---------|
| **前端框架** | 现有 SPA → 支持 SSR（SEO 友好） |
| **国际化库** | i18next + react-i18next |
| **后端 API** | 统一 API，支持多语言返回 |
| **数据库** | 用户语言偏好 + 区域设置 |
| **CDN** | Cloudflare（全球节点） |
| **支付** | Airwallex（Phase 1）→ Stripe（Phase 3） |
| **客服** | Intercom / Zendesk（多语言） |

### 7.5 数据驱动增长

| 指标 | 追踪目的 |
|-----|---------|
| **语言分布** | 决定扩展语言优先级 |
| **付费漏斗** | 找出转化损失节点 |
| **模块使用率** | 优化功能开发优先级 |
| **留存曲线** | 预测用户流失时间点 |
| **NPS 追踪** | 按语言分组的满意度 |

---

## 8. 实施路线图

### Phase 1: MVP（4-6 周）

- i18n 架构搭建
- 中英文双语支持
- AI 多语言响应机制
- 全局免责声明
- 注册前强制确认
- 隐私政策页面
- 基础 Credit 系统
- 个人支付宝收款
- 基础 Credit 系统

### Phase 2: 完整版（8-10 周）

- 全部语言支持
- 完整会员体系
- Airwallex 多支付集成
- 高级分析模块
- 邮件/推送通知
- 用户档案系统
- 退款政策
- 客户支持工单系统

### Phase 3: 增长期（持续）

- A/B 测试定价
- 本地化深度优化
- B2B 企业版
- API 开放平台
- 香港公司 + Stripe
- 新市场拓展

---

## 9. 风险管理

| 风险 | 概率 | 影响 | 缓解策略 |
|-----|------|-----|---------|
| 支付合规被拒 | 中 | 高 | 多支付渠道备份 |
| 文化误读导致差评 | 中 | 中 | 本地化团队审核 |
| AI 输出质量争议 | 高 | 中 | 明确免责声明 |
| 中国市场支付困难 | 高 | 中 | 企业账户 + 第三方 |
| 法规变化 | 中 | 高 | 持续监控合规要求 |

---

## 10. 成功标准

| 指标 | 6 个月目标 |
|-----|----------|
| **月活用户** | 10,000 |
| **付费用户** | 500 |
| **月收入** | $15,000 |
| **支持语言** | 5 种 |
| **用户满意度** | 4.2/5.0 |

---

## 附录

### A. 实施优先级清单

**MVP 必做项 (4-6 周)：**
- i18n 架构（中英文双语）
- AI 多语言响应机制
- 全局免责声明
- 注册前强制确认
- 隐私政策页面
- 个人支付宝收款
- 基础 Credit 系统
- 年龄验证
- Cookie 同意横幅

**成长期增加 (8-12 周)：**
- Airwallex 多支付集成
- 完整会员体系
- 退款政策
- 客户支持工单系统
- 香港公司 + Stripe

### B. 参考资源

- [Stripe 跨境支付](https://stripe.com/lp/china-cross-border)
- [Stripe Alipay 文档](https://docs.stripe.com/payments/alipay)
- [Airwallex](https://www.airwallex.com/)
- [PingPong](https://www.pingpongx.com/)
- [LianLian Global](https://global.lianlianpay.com/)

---

## ✅ 实现状态（2026-10-15）

### 全部完成

| 功能 | 文件 | 状态 |
|------|------|------|
| 多语言 AI 回复（12种语言） | `frontend/src/i18n/index.js` | ✅ |
| Mock AI 降级引擎（中英日韩） | `backend/src/services/mockService.js` | ✅ |
| AI 免责脚注 | `frontend/src/views/Chat.vue` | ✅ |
| 18+ 年龄验证弹窗 | `frontend/src/components/AgeVerification.vue` | ✅ |
| 防沉迷提醒（5/8/10次阈值） | `frontend/src/stores/usage.js` | ✅ |
| 定价页（Credit Pack + 订阅） | `frontend/src/views/Pricing.vue` | ✅ |
| 支付 API（创建/模拟/退款/会员） | `backend/src/services/paymentService.js` | ✅ |
| 账户中心（订单历史/退款） | `frontend/src/views/Account.vue` | ✅ |
| 联系客服（微信/邮箱） | `frontend/src/views/Contact.vue` | ✅ |
| 全路由（/pricing /account /contact） | `frontend/src/router/index.js` | ✅ |
| Cookie 同意横幅 | `frontend/src/components/CookieConsent.vue` | ✅ |

### 部署信息
- **Vercel Frontend**: https://zero.zxqconsulting.com
- **Build ID**: dpl_8FQqMz5zHiSTEBbhP2LEmVkUUBFK
- **Railway Backend**: https://xizi-production.up.railway.app (端口 3003)
- **Mock AI**: 当 DeepSeek API 不可用时自动启用，支持 zh-CN/en/ja/ko
