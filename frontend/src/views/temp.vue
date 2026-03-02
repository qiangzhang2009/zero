<script setup>
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useChatStore } from '../stores/chat'
import { useProfileStore } from '../stores/profile'
import { useLanguageStore } from '../i18n'
import { soundManager } from '../utils/sound'
import { voiceInput } from '../utils/voice'
import ProfileSelector from '../components/ProfileSelector.vue'
import ImageUpload from '../components/ImageUpload.vue'

const route = useRoute()
const chatStore = useChatStore()
const profileStore = useProfileStore()
const languageStore = useLanguageStore()

// 翻译辅助函数
const t = (key) => languageStore.t(key)

const inputMessage = ref('')
const messagesContainer = ref(null)
const isStreaming = ref(false)
const inputRef = ref(null)

// 打字机效果相关
const displayText = ref('')
const isTyping = ref(false)
const currentMessageIndex = ref(-1)

// 新增：弹窗控制
const showProfileSelector = ref(false)
const showImageUpload = ref(false)

// 新增：语音输入状态
const isVoiceListening = ref(false)

// 音效 - 发送消息时
function playSendSound() {
  soundManager.playSend()
}

// 音效 - 收到回复时
function playReceiveSound() {
  soundManager.playReceive()
}

// 猜你想问 - 预制问题（多语言版本）
const guessYouWantQuestions = computed(() => {
  const module = chatStore.currentModule
  const lang = languageStore.currentLanguage
  
    const questions = {
    'zh-CN': {
      bazi: [
        '我的命有多好？',
        '我的五行喜用神是什么？',
        '今年事业发展如何？',
        '我的婚姻何时到来？',
        '财运亨通还是堪忧？'
      ],
      fengshui: [
        '我的房子缺角吗？',
        '财位在哪里？',
        '卧室应该怎么布置？',
        '大门朝向好吗？',
        '办公室风水注意什么？'
      ],
      tarot: [
        '我的爱情运如何？',
        '事业发展的建议？',
        '当前处境该如何选择？',
        '我和他有未来吗？',
        '下个月运势怎么样？'
      ],
      palm: [
        '我的事业线好吗？',
        '我的婚姻线如何？',
        '我的财运怎么样？',
        '生命线长吗？',
        '手掌透露什么秘密？'
      ],
      dream: [
        '我梦到蛇意味着什么？',
        '梦到去世的亲人',
        '飞翔的梦代表什么？',
        '梦见考试好不好？',
        '噩梦是凶兆吗？'
      ],
      zodiac: [
        '我的性格特点？',
        '我和什么星座最配？',
        '本月运势如何？',
        '适合什么职业？',
        '如何提升财运？'
      ],
      mbti: [
        '我的人格类型？',
        'INFP的特质？',
        'ENTJ适合的工作？',
        '如何与INTJ相处？',
        'MBTI能改变吗？'
      ],
      draw: [
        '求一支事业签',
        '求一支财运签',
        '求一支姻缘签',
        '求一支健康签',
        '今日运势如何？'
      ],
      huangdi: [
        '黄帝内经讲什么？',
        '如何春季养生？',
        '气血不足怎么办？',
        '脾胃虚弱如何调理？',
        '阴阳平衡是什么？'
      ],
      lifenumber: [
        '我的生命灵数是多少？',
        '我的性格特点？',
        '我的天赋才华？',
        '我的爱情运如何？',
        '我的事业方向？'
      ],
      ziwei: [
        '我的紫微命盘如何？',
        '我的主星是什么？',
        '财帛宫代表什么？',
        '事业宫运势如何？',
        '婚姻状况如何？'
      ],
      zhouyi: [
        '易经64卦是什么？',
        '乾卦代表什么？',
        '坤卦有什么含义？',
        '如何起卦问事？',
        '卦象如何解读？'
      ],
      naming: [
        '我的名字好吗？',
        '如何取个好名字？',
        '名字会影响命运吗？',
        '五行缺什么？',
        '姓名评分多少？'
      ],
      marriage: [
        '我和TA合适吗？',
        '我们的婚姻运如何？',
        '最佳结婚年龄？',
        '配对指数是多少？',
        '如何提升感情运？'
      ],
      company: [
        '公司取什么名字好？',
        '名字五行属性？',
        '如何起商标名？',
        '品牌命名建议？',
        '公司名称评分？'
      ],
      luckyday: [
        '今天适合搬家吗？',
        '哪天开业最好？',
        '婚期怎么选？',
        '动土吉日？',
        '出行吉时？'
      ],
      digital: [
        '我的幸运数字是？',
        '数字能量分析',
        '车牌号好不好？',
        '手机号寓意？',
        '数字与命运？'
      ],
      daodejing: [
        '道德经讲什么？',
        '道法自然含义？',
        '无为而治是什么？',
        '上善若水解读？',
        '如何修心养性？'
      ],
      question: [
        '卦象解读',
        '事业方向',
        '财运如何？',
        '婚姻状况',
        '健康提示'
      ],
      default: [
        '我的运势怎么样？',
        '需要注意什么？',
        '适合做什么？',
        '何时有好运？',
        '如何提升运气？'
      ]
    },
    en: {
      bazi: [
        'How good is my destiny?',
        'What is my favorable element?',
        'How is my career this year?',
        'When will my marriage come?',
        'Will my fortune be good?'
      ],
      fengshui: [
        'Is my house missing a corner?',
        'Where is the wealth position?',
        'How should the bedroom be arranged?',
        'Is the main door direction good?',
        'What to note for office feng shui?'
      ],
      tarot: [
        'How is my love fortune?',
        'Advice for career development?',
        'How should I choose in my current situation?',
        'Do I have a future with him/her?',
        'How will my luck be next month?'
      ],
      palm: [
        'Is my career line good?',
        'How is my marriage line?',
        'How is my financial luck?',
        'Is my life line long?',
        'What secrets does my palm reveal?'
      ],
      dream: [
        'What does it mean to dream of a snake?',
        'Dreaming of deceased relatives',
        'What does a flying dream represent?',
        'Is dreaming of exams good?',
        'Is a nightmare a bad omen?'
      ],
      zodiac: [
        'What are my personality traits?',
        'Which zodiac sign am I most compatible with?',
        'How is my luck this month?',
        'What career suits me?',
        'How to improve my wealth luck?'
      ],
      mbti: [
        'What is my personality type?',
        'Traits of INFP?',
        'What work suits ENTJ?',
        'How to get along with INTJ?',
        'Can MBTI change?'
      ],
      draw: [
        'Draw a career fortune stick',
        'Draw a wealth fortune stick',
        'Draw a love fortune stick',
        'Draw a health fortune stick',
        'How is my luck today?'
      ],
      huangdi: [
        'What does Huangdi Neijing say?',
        'How to maintain health in spring?',
        'What to do with insufficient qi and blood?',
        'How to regulate weak spleen and stomach?',
        'What is yin-yang balance?'
      ],
      lifenumber: [
        'What is my life path number?',
        'What are my personality traits?',
        'What are my talents?',
        'How is my love fortune?',
        'What is my career direction?'
      ],
      ziwei: [
        'How is my Ziwei destiny chart?',
        'What is my main star?',
        'What does the Wealth Palace represent?',
        'How is the Career Palace luck?',
        'What is my marriage status?'
      ],
      zhouyi: [
        'What are the 64 hexagrams of Yijing?',
        'What does the Qian hexagram represent?',
        'What does the Kun hexagram mean?',
        'How to cast hexagrams?',
        'How to interpret hexagrams?'
      ],
      naming: [
        'Is my name good?',
        'How to choose a good name?',
        'Does name affect destiny?',
        'What elements am I missing?',
        'What is my name score?'
      ],
      marriage: [
        'Am I compatible with my partner?',
        'How is our marriage luck?',
        'What is the best age to marry?',
        'What is our matching index?',
        'How to improve our relationship luck?'
      ],
      company: [
        'What name is good for my company?',
        'What is the five elements attribute?',
        'How to create a trademark name?',
        'Brand naming suggestions?',
        'Company name rating?'
      ],
      luckyday: [
        'Is today good for moving?',
        'Which day is best for opening?',
        'How to choose a wedding date?',
        'Auspicious day for construction?',
        'Auspicious time for travel?'
      ],
      digital: [
        'What are my lucky numbers?',
        'Digital energy analysis',
        'Is my license plate number good?',
        'What does my phone number mean?',
        'Numbers and destiny?'
      ],
      daodejing: [
        'What does Tao Te Ching say?',
        'Meaning of Tao follows nature?',
        'What is ruling by non-action?',
        'Interpretation of highest goodness is like water?',
        'How to cultivate mind and nature?'
      ],
      question: [
        'Hexagram interpretation',
        'Career direction',
        'How is my wealth luck?',
        'Marriage status',
        'Health tips'
      ],
      default: [
        'How is my luck lately?',
        'What should I pay attention to?',
        'What am I suitable for?',
        'When will I have good luck?',
        'How to improve my luck?'
      ]
    },
    ja: {
      bazi: [
        '私の運命は良いですか？',
        '私の五行の用神は何ですか？',
        '今年の開発はいかがですか？',
        '私の結婚はいつですか？',
        '財運は良いですか？'
      ],
      fengshui: [
        '私の家は角が欠けていますか？',
        '財位はどこですか？',
        '寝室はどう配置すればよいですか？',
        '玄関の方角は良いですか？',
        'オフィスの風水に注意点は？'
      ],
      tarot: [
        '私の恋愛運はいかがですか？',
        '事業展開の提案は？',
        '現在の状況でどう選択すべき？',
        '彼と私に未来はありますか？',
        '来月の運勢は？'
      ],
      palm: [
        '私の事業は良いですか？',
        '私の結婚線はいかがですか？',
        '私の財運は？',
        '生命線は長いですか？',
        '掌は何を漏らしますか？'
      ],
      dream: [
        '蛇の夢を見る意味着什么？',
        '亡くなった親戚の夢',
        '飛ぶ夢は何を表す？',
        '試験の夢は良いですか？',
        '悪夢は凶兆ですか？'
      ],
      zodiac: [
        '私の性格的特点は？',
        'どの星座と一番合う？',
        '今月の運勢は？',
        'どんな職業に適している？',
        '財運をどう上げる？'
      ],
      mbti: [
        '私の性格タイプは何？',
        '？',
        'INFPの特徴はENTJに適した仕事は？',
        'INTJとどう相处う？',
        'MBTIは変わる？'
      ],
      draw: [
        '事業の籤を引く',
        '財運の籤を引く',
        '姻縁の籤を引く',
        '健康の籤を引く',
        '今日の運勢は？'
      ],
      huangdi: [
        '黄帝内経は何を言う？',
        '春の健康法は？',
        '気血不足怎么办？',
        '脾胃虚弱怎么调理？',
        '陰陽バランスとは？'
      ],
      lifenumber: [
        '私のライフパス番号は？',
        '私の性格的特点は？',
        '私の才能は？',
        '私の恋愛運は？',
        '私的事业方向は？'
      ],
      ziwei: [
        '私の紫微命盤は？',
        '私の主星は？',
        '財帛宮は何を表す？',
        '事業宮の運勢は？',
        '婚姻状정은？'
      ],
      zhouyi: [
        '易経64卦とは？',
        '乾卦は何を表す？',
        '坤卦の意味は？',
        '起卦の仕方は？',
        '卦象の解き方は？'
      ],
      naming: [
        '私の名前は良いですか？',
        '良い名前の付け方は？',
        '名前は運命に影響しますか？',
        '五行は何が欠けている？',
        '名前のスコアは？'
      ],
      marriage: [
        '私と彼は合う？',
        '私達の婚姻運は？',
        '最適な結婚年齢は？',
        '相性指数は？',
        '恋愛運をどう上げる？'
      ],
      company: [
        '会社名はどんなが良い？',
        '名前の五行属性は？',
        '商标名の付け方は？',
        'ブランド命名提案は？',
        '会社名評価は？'
      ],
      luckyday: [
        '今日は引越しに適している？',
        'いつ開業が最も良い？',
        '結婚式の日はどう選ぶ？',
        '動土の吉日は？',
        '出行の吉時は？'
      ],
      digital: [
        '私のラッキーナンバーは？',
        'デジタルエネルギー分析',
        'ナンバープレートは良い？',
        'スマホの番号の意味は？',
        '数字と運命？'
      ],
      daodejing: [
        '道德経は何を言う？',
        '道法自然の meant？',
        '無為而治とは？',
        '上善若水の解釈は？',
        'どう修心養性する？'
      ],
      question: [
        '卦象解釈',
        '事業方向',
        '財運は？',
        '婚姻状%',
        '健康ヒント'
      ],
      default: [
        '最近の運勢は？',
        '何を注意すべき？',
        '何に適している？',
        'いつ良い運が来る？',
        'どう運気を上げる？'
      ]
    }
