// Mock AI 响应 - 当真实 API 不可用时使用
// 用于演示、离线开发、API 配额耗尽等情况
// 多语言支持：根据用户语言返回对应语言的 Mock 回复

const moduleNames = {
  'zh-CN': {
    bazi: '生辰八字', fengshui: '风水布局', tarot: '塔罗牌', palm: '手相揭秘',
    dream: '周公解梦', zodiac: '星座运势', mbti: 'MBTI人格测试', draw: '求签问卜',
    huangdi: '黄帝内经', lifenumber: '生命灵数', ziwei: '紫微斗数', zhouyi: '周易占卜',
    naming: '起名', marriage: '婚配', company: '公司起名', luckyday: '吉日选择',
    digital: '数字命理', daodejing: '道德经', question: '易经问卦'
  },
  'en': {
    bazi: 'BaZi Fortune', fengshui: 'Feng Shui', tarot: 'Tarot Reading', palm: 'Palmistry',
    dream: 'Dream Analysis', zodiac: 'Zodiac', mbti: 'MBTI Test', draw: 'Fortune Stick',
    huangdi: 'Yellow Emperor', lifenumber: 'Life Number', ziwei: 'Ziwei Astrology', zhouyi: 'I Ching',
    naming: 'Naming', marriage: 'Marriage Match', company: 'Company Name', luckyday: 'Lucky Day',
    digital: 'Numerology', daodejing: 'Tao Te Ching', question: 'I Ching Divination'
  },
  'ja': {
    bazi: '八字鑑定', fengshui: '風水鑑定', tarot: 'タロット', palm: '手相',
    dream: '夢占い', zodiac: '星座占い', mbti: 'MBTI', draw: 'おみくじ',
    huangdi: '黄帝内経', lifenumber: '数秘術', ziwei: '紫微斗数', zhouyi: '周易',
    naming: '命名', marriage: '相性', company: '社名', luckyday: '吉日',
    digital: '数占い', daodejing: '道徳経', question: '易経占断'
  },
  'ko': {
    bazi: '사주팔자', fengshui: '풍수', tarot: '타로', palm: '손금',
    dream: '꿈해석', zodiac: '별자리', mbti: 'MBTI', draw: '점괘',
    huangdi: '황제내경', lifenumber: '생명수', ziwei: '자미두수', zhouyi: '주역',
    naming: '작명', marriage: '궁합', company: '회사이름', luckyday: '길일',
    digital: '숫자역학', daodejing: '도덕경', question: '주역점'
  }
}

const templates = {
  'zh-CN': {
    bazi: `## 📊 八字基础信息
- 乾/坤造：您提供的生辰信息
- 日主：暂以Mock演示
- 五行分布：金木水火土（演示数据）

## 🔮 五行分析
### 五行强弱
根据您提供的八字，五行分布相对平衡。

### 喜用神
木、火为喜用神，有助事业发展和人际关系。

### 忌神
金、水过旺时需注意情绪管理和健康。

## 💼 事业运势
### 2026年
2026年为丙午年，火气旺盛，有利事业发展。您的专业能力将得到认可，**是换工作或升职的好时机**。

### 2027年
进入丁未年，土气渐旺，适合稳固根基、深化专业。

## 💰 财运分析
正财稳定，偏财有意外之喜的可能。建议稳健投资，避免大额冒险。

## ❤️ 感情婚姻
单身者2026年下半年有桃花运；有伴侣者关系将更加稳固。

## 💡 综合建议
### 宜
- 主动争取机会
- 学习新技能
- 拓展人脉
### 忌
- 冲动决策
- 过度劳累
- 财务冒险

---
*⚠️ 免责声明：本演示内容由系统自动生成，仅供娱乐参考，不构成专业建议。请基于理性判断做出重要决策。*`,

    fengshui: `## 🏠 房屋风水概览
- 坐向：演示数据
- 整体格局：藏风聚气

## ⭐ 玄空飞星分析
### 本年吉位
- 东方：木气旺，利于学业、事业
- 南方：火气盛，利于名声、社交

### 本年凶位
- 西方：金气过旺，注意健康
- 北方：水气寒湿，避免久坐

## 🚪 重要位置建议
### 门
大门宜保持整洁明亮，避免杂物堆放。
### 床
床头宜靠实墙，避开横梁压顶。
### 灶
厨房保持通风，避免水火对冲。

## 💰 催旺财运法
在财位（2026年为东南方）摆放流水摆件或绿植。

## 💼 事业运提升法
书房宜设在文昌位，摆放文房四宝。

## ⚠️ 注意事项
保持室内空气流通，定期整理环境。

---
*⚠️ 免责声明：风水建议仅供参考，请结合实际情况使用。*`,

    tarot: `## 🃏 抽牌结果
### 牌阵
单张牌阵：指引之牌

### 抽到的牌
**愚者 (The Fool) - 正位**

## 🔮 牌卡解读
### 牌义分析
愚者代表新的开始、纯真、自由和无限可能。

### 正位含义
当前是一个绝佳的起步时机，您应该：
- 放下过去的包袱
- 相信直觉
- 拥抱未知
- 保持开放心态

## 💡 指引与建议
### 当前状态
您正站在新旅程的起点，内心充满期待和些许不安。

### 建议行动
- 大胆尝试新事物
- 相信自己的判断
- 把握眼前的机会
- 保持乐观心态

### 注意事项
- 不要因恐惧而退缩
- 做好基本准备
- 注意安全边界

---
*⚠️ 免责声明：塔罗牌为启示性工具，不是确定性预言。*`,

    default: `## 🎯 演示模式提示

您好！这是一个**演示版本**的回复。当前 AI 服务（DeepSeek）API 密钥未配置或已过期，因此返回模拟内容。

## 💡 您可以这样使用

1. **完整版功能**：需要有效的 API 密钥
2. **当前演示**：展示系统架构、UI 流程、用户体验
3. **多语言测试**：英文、日文、韩文用户都能获得对应语言的演示回复

## 🔧 启用真实 AI 回复

请联系管理员：
- 在 Vercel/Railway 后台更新 DEEPSEEK_API_KEY
- 或在 backend/.env 文件中设置有效密钥

---
*⚠️ 免责声明：当前内容为系统演示数据，仅供功能测试，不构成专业建议。*`
  },

  'en': {
    bazi: `## 📊 BaZi Foundation
- Chart: Based on your birth info
- Day Master: Demo data
- Five Elements: Balanced (demo)

## 🔮 Five Elements Analysis
### Strength
Your chart shows balanced energy distribution.

### Favorable Elements
Wood and Fire are your favorable elements, supporting career and relationships.

### Unfavorable
Avoid excess Metal and Water energy.

## 💼 Career Luck
### 2026 (Bing Wu Year)
Fire energy is strong, great for career advancement. **Excellent time to change jobs or seek promotion.**

### 2027 (Ding Wei Year)
Earth energy grows, ideal for consolidating achievements and deepening expertise.

## 💰 Wealth Analysis
Steady main income, possible windfall. Invest conservatively, avoid big risks.

## ❤️ Relationships
Singles: romantic opportunities in late 2026. Couples: deeper bond.

## 💡 Overall Advice
### Recommended
- Pursue opportunities actively
- Learn new skills
- Expand your network
### Avoid
- Impulsive decisions
- Overwork
- Financial risks

---
*⚠️ Disclaimer: This is demo content for entertainment only. Not professional advice. Please make decisions based on rational judgment.*`,

    fengshui: `## 🏠 Home Feng Shui Overview
- Facing direction: Demo
- Layout: Harmonious energy flow

## ⭐ Xuan Kong Flying Star
### Auspicious Sectors 2026
- East: Wood energy, good for learning and career
- South: Fire energy, good for reputation

### Inauspicious Sectors
- West: Excess metal, watch health
- North: Cold dampness, avoid prolonged sitting

## 🚪 Key Positions
### Door
Keep clean and bright, avoid clutter.
### Bed
Headboard against solid wall, avoid beams.
### Kitchen
Well-ventilated, avoid water-fire conflict.

## 💰 Wealth Enhancement
Place water feature or plants in Southeast (2026 wealth corner).

## 💼 Career Boost
Study room in Wen Chang position, with writing tools.

## ⚠️ Notes
Keep air flowing, regularly declutter.

---
*⚠️ Disclaimer: Feng Shui advice for reference only.*`,

    tarot: `## 🃏 Card Drawn
### Spread
Single Card: Guiding Light

### The Card
**The Fool - Upright**

## 🔮 Interpretation
### Card Meaning
The Fool represents new beginnings, innocence, freedom, and infinite possibilities.

### Upright Significance
This is a perfect time to:
- Release the past
- Trust your intuition
- Embrace the unknown
- Stay open-minded

## 💡 Guidance
### Current State
You stand at the beginning of a new journey, with excitement and some uncertainty.

### Suggested Actions
- Try new things boldly
- Trust your judgment
- Seize opportunities
- Stay optimistic

### Cautions
- Don't retreat from fear
- Prepare basics
- Mind safety boundaries

---
*⚠️ Disclaimer: Tarot is illuminative, not deterministic.*`,

    default: `## 🎯 Demo Mode Notice

Hello! This is a **demo response**. The current AI service (DeepSeek) API key is not configured or has expired, so mock content is returned.

## 💡 How to Use

1. **Full Version**: Requires a valid API key
2. **Current Demo**: Shows system architecture, UI flow, UX
3. **Multi-language Test**: English, Japanese, Korean users all get demo responses in their language

## 🔧 Enable Real AI Replies

Contact administrator to:
- Update DEEPSEEK_API_KEY in Vercel/Railway dashboard
- Or set a valid key in backend/.env file

---
*⚠️ Disclaimer: Demo content for testing only, not professional advice.*`
  },

  'ja': {
    bazi: `## 📊 八字基礎情報
- 命式：提供された生年月日時
- 日主：デモデータ
- 五行：バランス良好（デモ）

## 🔮 五行分析
### 強弱
五行のバランスが取れています。

### 喜用神
木と火が喜用神で、仕事と人間関係に良い影響。

### 忌神
金と水の過多に注意。

## 💼 仕事運
### 2026年（丙午年）
火気が旺盛で、キャリアアップに最適。**転職や昇進の良いタイミング**です。

### 2027年（丁未年）
土気が増し、基盤固めと専門性深化に良い。

## 💰 財運分析
本業は安定、副業で臨時収入の可能性。保守的投資を推奨。

## ❤️ 恋愛・結婚
独身者は2026年後半に縁あり。既婚者は絆が深まる。

## 💡 総合アドバイス
### 宜
- 積極的にチャンスを掴む
- 新しいスキル習得
- 人脈拡大
### 忌
- 衝動的判断
- 過労
- 財務的リスク

---
*⚠️ 免責事項：このデモコンテンツは娯楽目的のみ。*`,

    default: `## 🎯 デモモードのお知らせ

こんにちは！これは**デモ版**の返信です。AIサービス（DeepSeek）のAPIキーが未設定または期限切れのため、モックコンテンツを返しています。

## 💡 使い方

1. **完全版**：有効なAPIキーが必要
2. **現在のデモ**：システムアーキテクチャ、UI、UXを表示
3. **多言語テスト**：英語、日本語、韓国語のユーザーがそれぞれの言語でデモを取得

## 🔧 実際のAI返答を有効化

管理者に連絡：
- Vercel/RailwayダッシュボードでDEEPSEEK_API_KEYを更新
- または backend/.env に有効なキーを設定

---
*⚠️ 免責事項：テスト用のみ、専門的助言ではありません。*`
  },

  'ko': {
    bazi: `## 📊 사주팔자 기초 정보
- 명식: 제공된 생년월일시
- 일주: 데모 데이터
- 오행: 균형 (데모)

## 🔮 오행 분석
### 강약
오행이 균형잡혀 있습니다.

### 희용신
목과 화가 희용신으로, 직업과 인간관계에 유리.

### 기신
금과 수의 과다에 주의.

## 💼 직업운
### 2026년 (병오년)
화기가 왕성하여 커리어 발전에 최적. **이직이나 승진에 좋은 시기**.

### 2027년 (정미년)
토기가 증가하여 기반 다지기에 좋음.

## 💰 재물운
본업 안정, 부업에서 임시 수입 가능. 보수적 투자 권장.

## ❤️ 연애/결혼
미혼자는 2026년 하반기에 인연, 기혼자는 유대 강화.

## 💡 종합 조언
### 길
- 적극적으로 기회 추구
- 새 기술 학습
- 인맥 확대
### 흉
- 충동적 결정
- 과로
- 재무적 위험

---
*⚠️ 면책: 이 데모 콘텐츠는 오락 목적만.*`,

    default: `## 🎯 데모 모드 안내

안녕하세요! 이것은 **데모 버전** 응답입니다. AI 서비스(DeepSeek) API 키가 설정되지 않았거나 만료되어 모의 콘텐츠가 반환됩니다.

## 💡 사용 방법

1. **전체 버전**: 유효한 API 키 필요
2. **현재 데모**: 시스템 아키텍처, UI, UX 표시
3. **다국어 테스트**: 영어, 일본어, 한국어 사용자가 각 언어로 데모 받기

## 🔧 실제 AI 응답 활성화

관리자에게 연락:
- Vercel/Railway 대시보드에서 DEEPSEEK_API_KEY 업데이트
- 또는 backend/.env에 유효한 키 설정

---
*⚠️ 면책: 테스트 목적만, 전문적 조언 아님.*`
  }
}

/**
 * 生成 Mock AI 响应
 * @param {string} module - 模块ID
 * @param {string} userMessage - 用户消息
 * @param {string} language - 语言代码
 * @returns {string} Mock 回复
 */
export function generateMockResponse(module, userMessage = '', language = 'zh-CN') {
  const lang = language in templates ? language : 'zh-CN'
  const moduleTemplates = templates[lang]
  const response = moduleTemplates[module] || moduleTemplates.default

  // 添加用户消息的简短回应
  const langs = {
    'zh-CN': `> 您的问题："${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}"\n\n`,
    'en': `> Your question: "${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}"\n\n`,
    'ja': `> あなたの質問：「${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}」\n\n`,
    'ko': `> 귀하의 질문: "${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}"\n\n`,
  }
  const intro = langs[lang] || langs['en']

  // 获取模块名
  const moduleDisplayName = (moduleNames[lang] && moduleNames[lang][module]) || module || ''

  return intro + response
}

/**
 * 检查是否启用 Mock 模式
 * 通过环境变量 AI_MOCK_MODE 控制
 * - 'true' / '1' 强制启用
 * - 'auto' (默认) 当 API 失败时自动启用
 * - 'false' 禁用
 */
export function isMockMode() {
  const mode = process.env.AI_MOCK_MODE || 'auto'
  return mode === 'true' || mode === '1'
}

export function getMockModeSetting() {
  return process.env.AI_MOCK_MODE || 'auto'
}
