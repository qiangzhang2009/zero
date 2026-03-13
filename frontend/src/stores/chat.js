import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import axios from 'axios'
import { useProfileStore } from './profile'
import { useLanguageStore } from '../i18n'

// 处理可能的 /api 后缀，避免路径重复
let apiBase = import.meta.env.VITE_API_URL || ''
// 如果是 Vercel 部署（相对路径），使用 Railway API
if (!apiBase || apiBase === '/api') {
  apiBase = 'https://zero-production-4a85.up.railway.app/api'
}
const API_URL = apiBase

// 后台管理系统 API 地址
const TRACKING_API_URL = 'https://websites-admin.zxqconsulting.com/api/tracking'
const TENANT_SLUG = 'zero'

// 前端敏感词过滤函数（额外保障）
function filterClientSensitiveWords(message) {
  if (!message) return message
  // 过滤 deepseek 相关的敏感词
  const sensitiveWords = [
    'deepseek', 'DeepSeek', 'DEEPSEEK', 'Deepseek',
    '深度求索', '深度搜索', 'deep seek', 'deep-seek',
    'DS模型', 'ds模型', 'DS的', 'ds的'
  ]
  
  let filtered = message
  for (const word of sensitiveWords) {
    const regex = new RegExp(word, 'gi')
    filtered = filtered.replace(regex, '知几')
  }
  
  return filtered
}

// 生成或获取用户ID
function getUserId() {
  let userId = localStorage.getItem('zhiJi_user_id')
  if (!userId) {
    // 生成唯一的用户ID
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem('zhiJi_user_id', userId)
  }
  return userId
}

// 生成或获取会话ID（用于追踪同一对话）
function getSessionId() {
  let sessionId = sessionStorage.getItem('zhiJi_session_id')
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    sessionStorage.setItem('zhiJi_session_id', sessionId)
  }
  return sessionId
}

// 从localStorage加载保存的数据
function loadFromStorage(key, defaultValue) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch {
    return defaultValue
  }
}

// 保存到localStorage
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.warn('Failed to save to localStorage:', e)
  }
}

// 发送到后台管理系统
async function trackToBackend(module, userMessage, aiMessage, action = 'response') {
  try {
    const visitorId = getUserId()
    const sessionId = getSessionId()
    await fetch(TRACKING_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: action === 'start' ? 'chat_start' : 'chat_message',
        tenant_slug: TENANT_SLUG,
        visitor_id: visitorId,
        session_id: sessionId,
        timestamp: new Date().toISOString(),
        website_url: window.location.origin,
        page_url: window.location.href,
        page_title: document.title,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        event_data: {
          module: module,
          user_message: userMessage,
          ai_message: aiMessage || '',
          action: action,
          conversation_turns: action === 'response' ? 1 : 0
        }
      })
    })
  } catch (error) {
    console.warn('Failed to track to backend:', error)
  }
}

// 追踪模块选择
function trackModuleSelect(moduleId, moduleName) {
  try {
    const visitorId = getUserId()
    fetch(TRACKING_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'module_select',
        tenant_slug: TENANT_SLUG,
        visitor_id: visitorId,
        event_data: {
          module_id: moduleId,
          module_name: moduleName,
          timestamp: new Date().toISOString()
        }
      })
    })
  } catch (error) {
    console.warn('Failed to track module select:', error)
  }
}

// 追踪模块切换
function trackModuleSwitch(fromModule, toModule) {
  try {
    const visitorId = getUserId()
    fetch(TRACKING_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'module_switch',
        tenant_slug: TENANT_SLUG,
        visitor_id: visitorId,
        event_data: {
          from_module: fromModule,
          to_module: toModule,
          timestamp: new Date().toISOString()
        }
      })
    })
  } catch (error) {
    console.warn('Failed to track module switch:', error)
  }
}

// 追踪档案创建/更新
function trackProfile(profileData, action = 'create') {
  try {
    const visitorId = getUserId()
    fetch(TRACKING_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'profile_' + action,
        tenant_slug: TENANT_SLUG,
        visitor_id: visitorId,
        event_data: {
          profile_id: profileData.profile_id || 'default',
          profile_type: profileData.profile_type || 'bazi',
          name: profileData.name,
          birthday: profileData.birthday,
          birth_time: profileData.hour,
          gender: profileData.gender,
          profile_data: profileData.bazi || {},
          completeness: calculateProfileCompleteness(profileData),
          timestamp: new Date().toISOString()
        }
      })
    })
  } catch (error) {
    console.warn('Failed to track profile:', error)
  }
}

// 计算档案完整度
function calculateProfileCompleteness(profile) {
  if (!profile) return 0
  let completeness = 0
  if (profile.name) completeness += 20
  if (profile.birthday) completeness += 30
  if (profile.hour) completeness += 20
  if (profile.gender) completeness += 10
  if (profile.bazi && Object.keys(profile.bazi).length > 0) completeness += 20
  return completeness
}

// 获取当前模块对应的消息存储key
function getModuleMessagesKey(moduleId) {
  return `chat_messages_${moduleId}`
}

export const useChatStore = defineStore('chat', () => {
  // 加载当前模块的消息
  const currentModule = ref(loadFromStorage('chat_current_module', 'bazi'))
  const messages = ref(loadFromStorage(getModuleMessagesKey(currentModule.value), []))
  const isLoading = ref(false)
  const history = ref(loadFromStorage(`chat_history_${currentModule.value}`, []))
  
  // 记录上次保存到服务器的聊天记录ID
  const lastSavedChatId = ref(loadFromStorage('last_saved_chat_id', null))

  // 监听消息变化，自动保存到localStorage
  watch(messages, (newMessages) => {
    saveToStorage(getModuleMessagesKey(currentModule.value), newMessages)
  }, { deep: true })

  // 监听当前模块变化，加载对应模块的消息
  watch(currentModule, (newModule) => {
    saveToStorage('chat_current_module', newModule)
    // 切换模块时，加载该模块保存的消息
    messages.value = loadFromStorage(getModuleMessagesKey(newModule), [])
    history.value = loadFromStorage(`chat_history_${newModule}`, [])
  })

  // 监听历史记录变化
  watch(history, (newHistory) => {
    saveToStorage(`chat_history_${currentModule.value}`, newHistory)
  }, { deep: true })

  // 从服务器加载历史聊天记录
  async function loadChatFromServer() {
    const userId = getUserId()
    
    try {
      // 获取聊天记录列表
      const response = await axios.get(`${API_URL}/chat/history`, {
        params: { userId, limit: 20 }
      })
      
      if (response.data.success && response.data.data.history) {
        const historyList = response.data.data.history
        
        // 如果有历史记录，尝试加载最新一个与当前模块匹配的记录
        if (historyList.length > 0) {
          // 查找当前模块的最新记录
          const moduleHistory = historyList.filter(h => h.module === currentModule.value)
          
          if (moduleHistory.length > 0) {
            // 获取最新记录的详情
            const latestChat = moduleHistory[0]
            
            try {
              const detailResponse = await axios.get(`${API_URL}/chat/${latestChat.id}`, {
                params: { userId }
              })
              
              if (detailResponse.data.success && detailResponse.data.data.messages) {
                // 只有当本地没有消息时才加载服务器的消息
                if (messages.value.length === 0) {
                  messages.value = detailResponse.data.data.messages
                  saveToStorage(getModuleMessagesKey(currentModule.value), messages.value)
                  
                  // 同时更新历史记录
                  const historyMessages = []
                  for (const msg of detailResponse.data.data.messages) {
                    historyMessages.push({ role: msg.role, content: msg.content })
                  }
                  history.value = historyMessages
                  saveToStorage(`chat_history_${currentModule.value}`, history.value)
                  
                  lastSavedChatId.value = latestChat.id
                  saveToStorage('last_saved_chat_id', latestChat.id)
                  
                  console.log('成功从服务器加载聊天记录')
                }
              }
            } catch (detailError) {
              console.warn('获取聊天记录详情失败:', detailError.message)
            }
          }
        }
      }
    } catch (error) {
      console.warn('从服务器加载聊天记录失败:', error.message)
    }
  }

  // 初始化时尝试从服务器加载聊天记录
  // 延迟一下确保页面完全加载
  setTimeout(() => {
    if (messages.value.length === 0) {
      loadChatFromServer()
    }
  }, 1500)

  // 功能模块列表
  const modules = ref([
    { id: 'bazi', name: '八字', icon: '📊', description: '生辰八字分析' },
    { id: 'fengshui', name: '风水', icon: '🏠', description: '风水布局咨询' },
    { id: 'tarot', name: '塔罗', icon: '🃏', description: '塔罗牌占卜' },
    { id: 'palm', name: '手相', icon: '✋', description: '手相揭秘' },
    { id: 'dream', name: '梦境', icon: '🌙', description: '周公解梦' },
    { id: 'zodiac', name: '星座', icon: '⭐', description: '星座运势' },
    { id: 'mbti', name: 'MBTI', icon: '🎯', description: '人格测试' },
    { id: 'draw', name: '抽签', icon: '🎋', description: '求签问卜' },
    { id: 'huangdi', name: '黄帝内经', icon: '📜', description: '养生智慧' },
    { id: 'lifenumber', name: '生命灵数', icon: '🔢', description: '数字能量' },
    { id: 'ziwei', name: '紫微斗数', icon: '🌟', description: '斗数命盘' },
    { id: 'zhouyi', name: '周易', icon: '☯️', description: '易经占卜' },
    { id: 'naming', name: '起名', icon: '✏️', description: '姓名评测' },
    { id: 'marriage', name: '婚配', icon: '💑', description: '婚姻配对' },
    { id: 'company', name: '公司起名', icon: '🏢', description: '商业命名' },
    { id: 'luckyday', name: '吉日', icon: '📅', description: '黄道吉日' },
    { id: 'digital', name: '数字命理', icon: '🔢', description: '数字分析' },
    { id: 'daodejing', name: '道德经', icon: '📖', description: '经典智慧' },
    { id: 'question', name: '问卦', icon: '🔮', description: '易经问卜' }
  ])

  // 模块介绍 - 乔布斯风格：简洁、温暖、有画面感
  // 多语言欢迎语
  const moduleIntros = {
    bazi: {
      'zh-CN': '生辰八字，藏着您一生的命运密码。让我们一起探索您五行八字的奥秘，了解您的性格、天赋与运势走向。请告诉我您的出生年月日时。',
      'en': 'The Eight Characters (Bazi) hold the secrets of your lifelong destiny. Let us explore the mysteries of your Five Elements and Eight Characters, understand your personality, talents, and fortune. Please tell me your birth date and time.',
      'ja': '八字には運命の秘密が隠されています。五行八字の奥秘を探り、あなたの性格·smart·運勢走向を理解しましょう。生年月日時を教えてください。',
      'ko': '팔자는 평생의 운명의 비밀이 담겨 있습니다. 팔자의 신비로움을 탐구하여 당신의 성격, 재능, 운세를 이해해 보세요. 생년월일시를告诉我주세요.',
      'es': 'Los ocho caracteres guardan los secretos de tu destino vital. Exploremos los misterios de tus Cinco Elementos y Ocho Caracteres, comprendamos tu personalidad, talentos y suerte. Por favor, dime tu fecha y hora de nacimiento.',
      'it': 'Gli Otto Caratteri nascondono i segreti del tuo destino. Esploriamo i misteri dei Tuoi Otto Caratteri, comprendiamo la tua personalità, i tuoi talenti e la tua fortuna. Per favore, comunicami la tua data e ora di nascita.',
      'fr': 'Les huit caractères détiennent les secrets de votre destin. Explorons les mystères de vos huit caractères, comprenons votre personnalité, vos talents et votre fortune. Veuillez me donner votre date et heure de naissance.',
      'de': 'Die Acht Zeichen verbergen die Geheimnisse Ihres Schicksals. Erkunden wir die Geheimnisse Ihrer acht Zeichen, verstehen wir Ihre Persönlichkeit, Talente und Ihr Glück. Bitte teilen Sie mir Ihr Geburtsdatum und Ihre Geburtszeit mit.',
      'pt': 'Os oito caracteres guardam os segredos do seu destino. Vamos explorar os mistérios dos seus Oito Caracteres, entender sua personalidade, talentos e sorte. Por favor, me diga sua data e hora de nascimento.',
      'ar': 'تحمل أحرف рождения أسرار مصيرك. دعنا نستكشف أسرار أحرف الولادة الثمانية، ونفهم شخصيتك ومواهبك وحظك. من فضلك أخبرني بتاريخ ووقت ميلادك.',
      'id': 'Delapan karakter menyimpan rahasia nasib seumur hidup Anda. Mari kita jelajahi misteri delapan karakter Anda, pahami kepribadian, bakat, dan rezeki Anda. Silakan beri tahu tanggal dan waktu lahir Anda.'
    },
    fengshui: {
      'zh-CN': '风水之道，在于人与自然的和谐共生。我来帮您解读环境中的能量奥秘，让您的居所成为滋养身心的港湾。请描述您想了解的空间。',
      'en': 'The art of Feng Shui is about harmonious coexistence between humans and nature. Let me help you decode the energy secrets of your environment, making your home a harbor for nourishing body and mind. Please describe the space you want to know about.',
      'ja': '風水之道は人間と自然の調和共生にあります。環境のエネルギー的秘密を解き明かし、あなたの住空間を身を養う港口にしましょう知りたい空間を描述してください。',
      'ko': '풍수의 도는 인간과 자연의 조화로운 공존에 있습니다. 환경의 에너지 비밀이 해독하여 당신의 집이 몸과 마음에 영양이 되는 항구가 되도록 도와드릴까요? 알고 싶은 공간을 설명해 주세요.',
      'es': 'El arte del Feng Shui trata sobre la coexistencia armoniosa entre humanos y naturaleza. Déjame ayudarte a descifrar los secretos energéticos de tu entorno, haciendo de tu hogar un refugio nutritivo cuerpo y mente. Por favor, describe el espacio que quieres conocer.',
      'it': "L'arte del Feng Shui riguarda la coesistenza armoniosa tra umani e natura. Permettimi di aiutarti a decifrare i segreti energetici del tuo ambiente, rendendo la tua casa un rifugio nutriente per corpo e mente. Per favore, descrivi lo spazio che desideri conoscere.",
      'fr': "L'art du Feng Shui concerne la coexistence harmonieuse entre les humains et la nature. Permettez-moi de vous aider à décrypter les secrets énergétiques de votre environnement, faisant de votre maison un havre de repos pour le corps et l'esprit. Veuillez décrire l'espace que vous souhaitez connaître.",
      'de': 'Die Kunst des Feng Shui geht um das harmonische Zusammenleben zwischen Mensch und Natur. Lassen Sie mich Ihnen helfen, die Energierätsel Ihrer Umgebung zu entschlüsseln und Ihr Zuhause zu einem Ort der Erholung für Körper und Geist zu machen. Bitte beschreiben Sie den Raum, den Sie kennenlernen möchten.',
      'pt': 'A arte do Feng Shui trata da coexistência harmoniosa entre humanos e natureza. Deixe-me ajudá-lo a decifrar os segredos energéticos do seu ambiente, tornando sua casa um refúgio nutritivo para corpo e mente. Por favor, descreva o espaço que deseja conhecer.',
      'ar': 'فنغ شوي يدور حول التعايش المتناغم بين الإنسان والطبيعة. دعني أساعدك في فك رموز الطاقة في بيئتك، مما يجعل منزلك ملاذًا يغذي الجسم والعقل. يرجى وصف المساحة التي تريد معرفتها.',
      'id': 'Seni Feng Shui adalah tentang koeksistensi harmonis antara manusia dan alam. Biarkan saya membantu Anda memecahkan rahasia energi lingkungan Anda, menjadikan rumah Anda tempat perlindungan yang menyehatkan tubuh dan pikiran. Silakan jelaskan ruang yang ingin Anda ketahui.'
    },
    tarot: {
      'zh-CN': '塔罗牌是心灵的镜子，每一张牌都蕴含着智慧的启示。静心思考您的问题，让我为您揭开命运的层层面纱。请问您想探索哪方面的困惑？',
      'en': 'Tarot cards are mirrors of the soul, each card containing wisdom\'s revelations. Meditate on your question, let me reveal the layers of destiny for you. What aspect of your life would you like to explore?',
      'ja': 'タロット牌は心の鏡で、すべての牌に知恵の启示が込められています。心静かに вопросし、運命のベールを一枚一枚剥がしましょうどこの面の困惑を探索したいですか？',
      'ko': '타로 카드는 영혼의 거울이며,每一 장의 카드には知恵の启示が込められています。心を静め 질문에 대해 생각하고, 제가 당신에게 운명의 베일을 벗겨 드릴게요. 어느方面的问题을 탐색하고 싶으세요?',
      'es': 'Los naipes tarot son espejos del alma, cada carta contiene revelaciones de sabiduría. Medita en tu pregunta, déjame revelarte las capas del destino. ¿Qué aspecto de tu vida te gustaría explorar?',
      'it': 'Le carte tarot sono specchi dell\'anima, ogni carta contiene rivelazioni di saggezza. Medita sulla tua domanda, lasciami rivelarti gli strati del destino. Quale aspetto della tua vita vorresti esplorare?',
      'fr': 'Les cartes de tarot sont des miroirs de l\'âme, chaque carte contenant des révélations de sagesse. Méditez sur votre question, laissez-moi vous révéler les couches du destin. Quel aspect de votre vie souhaiteriez-vous explorer?',
      'de': 'Tarotkarten sind Spiegel der Seele, jede Karte enthält Weisheitsoffenbarungen. Meditieren Sie über Ihre Frage, lassen Sie mich die Schichten des Schicksals für Sie enthüllen. Welchen Aspekt Ihres Lebens möchten Sie erkunden?',
      'pt': 'As cartas de tarot são espelhos da alma, cada carta contém revelações de sabedoria. Medite em sua pergunta, deixe-me revelar as camadas do destino. Qual aspecto da sua vida você gostaria de explorar?',
      'ar': 'أوراق التارو هي مرايا الروح، كل ورقة تحتوي على حكمة كاشفة. فكر في سؤالك، دعني أكشف طبقات المصير. ما الجانب من حياتك تود استكشافه؟',
      'id': 'Kartu tarot adalah cermin jiwa, setiap kartu mengandung wahyu kebijaksanaan. Pikirkan pertanyaan Anda, biarkan saya mengungkapkan lapisan takdir. Aspek kehidupan mana yang ingin Anda jelajahi?'
    },
    palm: {
      'zh-CN': '掌纹是生命的日记，记录着您走过的每一步。让我为您解读掌纹中的故事，洞察您的性格特质与命运轨迹。请描述您想了解的手相特征。',
      'en': 'Palm lines are the diary of life, recording every step you\'ve taken. Let me interpret the stories in your palm lines, insight into your character traits and destiny. Please describe the palm features you\'d like to know about.',
      'ja': '掌紋は生命の日記で是你人生の足跡を記しています。掌紋の物語を解釈し、あなたの性格特質と運命の軌跡を読み取りましょう知りたい手相の特徴を描述してください。',
      'ko': '손금들은 삶의 일기이며, 당신이 걸어온 모든 발자국을 기록하고 있습니다. 손금 속 이야기를 해석하고, 당신의 성격 특성과 운명의 궤적을洞察해 드릴게요. 알고 싶은 손금 특성을 설명해 주세요.',
      'es': 'Las líneas de la palma son el diario de la vida, registrando cada paso que has tomado. Déjame interpretar las historias en tus líneas de la palma, insight sobre tus rasgos de carácter y destino. Por favor, describe las características de la mano que te gustaría conocer.',
      'it': 'Le linee del palmo sono il diario della vita, registrano ogni passo che hai fatto. Permettimi di interpretare le storie nelle tue linee del palmo, intuizioni sui tuoi tratti del carattere e destino. Per favore, descrivi le caratteristiche della mano che vorresti conoscere.',
      'fr': 'Les lignes de la paume sont le journal de la vie, enregistrant chaque pas que vous avez fait. Permettez-moi d\'interpréter les histoires dans vos lignes de paume, perspicacité sur vos traits de caractère et destin. Veuillez描述 les caractéristiques de la paume que vous souhaitez connaître.',
      'de': 'Handlinien sind das Tagebuch des Lebens und zeichnen jeden Schritt auf, den Sie gegangen sind. Lassen Sie mich die Geschichten in Ihren Handlinien interpretieren, Einblicke in Ihre Charaktereigenschaften und Ihr Schicksal. Bitte beschreiben Sie die Handmerkmale, die Sie gerne kennenlernen möchten.',
      'pt': 'As linhas da palma são o diário da vida, registrando cada passo que você deu. Deixe-me interpretar as histórias em suas linhas da palma, insight sobre suas características de personalidade e destino. Por favor, descreva as características da palma que gostaria de conhecer.',
      'ar': 'خطوط راحة اليد هي يوميات الحياة، تسجل كل خطوة قطعتها. دعني أفسر القصص في خطوط راحة يدك، ونظرة ثاقبة في سمات شخصيتك ومصيرك. يرجى وصف سمات راحة اليد التي تريد معرفتها.',
      'id': 'Garis telapak tangan adalah buku harian kehidupan, mencatat setiap langkah yang Anda tempuh. Biarkan saya menafsirkan cerita di garis telapak tangan Anda, wawasan tentang karakter dan takdir Anda. Silakan jelaskan fitur telapak tangan yang ingin Anda ketahui.'
    },
    mbti: {
      'zh-CN': '您好，欢迎参与MBTI职业性格测试。MBTI旨在帮助人们更深入地了解自己的性格特点和行为偏好。接下来，我将基于您的回答，为您生成一份详细的性格类型分析报告。',
      'en': 'Welcome to the MBTI Career Personality Test. MBTI aims to help people gain deeper understanding of their personality traits and behavioral preferences. Based on your answers, I will generate a detailed personality type analysis report for you.',
      'ja': 'MBTI職業性格テストへの参加ようこそ。MBTIは人々が自分の性格的特点と行動の好みをより深く理解することを助けることを目的にしています。接下来、あなたの回答に基づいて、詳細な性格タイプ分析レポートを生成します。',
      'ko': 'MBTI 직업 성격 테스트에 오신 것을 환영합니다. MBTI는 사람들이 자신의 성격 특성과 행동 선호도를 더 깊이 이해하도록 돕는 것을 목표로 합니다. 다음으로,您的 답변에 기반하여詳細な 성격 유형 분석 보고서를 생성해 드리겠습니다.',
      'es': 'Bienvenido a la prueba de personalidad profesional MBTI. MBTI busca ayudar a las personas a comprender más profundamente sus rasgos de personalidad y preferencias de comportamiento. Basándome en sus respuestas, le generaré un informe detallado de análisis de tipo de personalidad.',
      'it': 'Benvenuto al test di personalità professionale MBTI. MBTI mira ad aiutare le persone a comprendere più in profondità i tratti della loro personalità e le preferenze comportamentali. In base alle tue risposte, genererò un rapporto dettagliato di analisi del tipo di personalità.',
      'fr': 'Bienvenue au test de personnalité professionnelle MBTI. MBTI vise à aider les gens à mieux comprendre leurs traits de personnalité et leurs préférences comportementales. Basé sur vos réponses, je générerai un rapport détaillé d\'analyse du type de personnalité.',
      'de': 'Willkommen beim MBTI-Berufspersönlichkeitstest. MBTI soll den Menschen helfen, ihre Persönlichkeitsmerkmale und Verhaltenspräferenzen besser zu verstehen. Basierend auf Ihren Antworten erstelle ich einen detaillierten Persönlichkeitstyp-Analysebericht für Sie.',
      'pt': 'Bem-vindo ao teste de personalidade profissional MBTI. O MBTI visa ajudar as pessoas a entender mais profundamente suas características de personalidade e preferências comportamentais. Com base nas suas respostas, gerarei um relatório detalhado de análise do tipo de personalidade.',
      'ar': 'مرحبًا بك في اختبار شخصية MBTI المهني. يهدف MBTI إلى مساعدة الناس على فهم سمات شخصيتهم وتفضيلاتهم السلوكية بشكل أعمق. بناءً على إجاباتك، سأولد تقريرًا مفصلاً لتحليل نوع شخصيتك.',
      'id': 'Selamat datang di tes kepribadian MBTI. MBTI bertujuan untuk membantu orang memahami lebih dalam karakteristik kepribadian dan preferensi perilaku mereka. Berdasarkan jawaban Anda, saya akan menghasilkan laporan analisis tipe kepribadian yang detail.'
    },
    dream: {
      'zh-CN': '梦境是潜意识的语言，是内心深处的messages。让我帮您解读梦境的含义，探索潜意识想告诉您的信息。请描述您印象最深的梦境。',
      'en': 'Dreams are the language of the subconscious, messages from your inner depths. Let me help you interpret the meaning of your dreams, explore what your subconscious wants to tell you. Please describe your most memorable dream.',
      'ja': '夢は潜在意識の言語で是你内面深处からのメッセージです。夢の意味を解釈し、潜在意識가 당신에게 알려주고 싶은 정보를 탐색しましょう。最も印象的な夢を描述してください。',
      'ko': '꿈은 잠재의식의 언어이며, 내면深处의 메시지입니다. 꿈의 의미를 해석하고,潜意识가 당신에게 말하고 싶은 정보를 탐색해 드릴게요. 가장 인상적인 꿈을 설명해 주세요.',
      'es': 'Los sueños son el lenguaje del subconsciente, mensajes de las profundidades de tu ser. Déjame ayudarte a interpretar el significado de tus sueños, explorar lo que tu subconsciente quiere decirte. Por favor, describe tu sueño más memorable.',
      'it': 'I sogni sono il linguaggio del subconscio, messaggi dalle profondità del tuo essere. Permettimi di aiutarti a interpretare il significato dei tuoi sogni, esplorare cosa il tuo subconscio vuole dirti. Per favore, descrivi il tuo sogno più memorabile.',
      'fr': 'Les rêves sont le langage du subconscient, des messages des profondeurs de votre être. Permettez-moi de vous aider à interpréter le sens de vos rêves, explorer ce que votre subconscient veut vous dire. Veuillez描述 votre rêve le plus mémorable.',
      'de': 'Träume sind die Sprache des Unterbewusstseins, Botschaften aus den Tiefen Ihres Seins. Lassen Sie mich Ihnen helfen, die Bedeutung Ihrer Träume zu interpretieren, zu erkunden, was Ihr Unterbewusstsein Ihnen mitteilen möchte. Bitte beschreiben Sie Ihren unvergesslichsten Traum.',
      'pt': 'Os sonhos são a linguagem do subconsciente, mensagens das profundezas do seu ser. Deixe-me ajudá-lo a interpretar o significado dos seus sonhos, explorar o que seu subconsciente quer dizer. Por favor, descreva seu sonho mais memorável.',
      'ar': 'الأحلام هي لغة اللاوعي، رسائل من أعماق كيانك. دعني أساعدك في تفسير معنى أحلامك، واستكشاف ما يريد لاوعيك أن يخبرك به. يرجى وصف أحلك الأكثر تميزًا.',
      'id': 'Mimpi adalah bahasa bawah sadar, pesan dari kedalaman jiwa Anda. Biarkan saya membantu Anda menafsirkan makna mimpi Anda, jelajahi apa yang ingin dikatakan oleh bawah sadar Anda. Silakan jelaskan mimpi paling berkesan Anda.'
    },
    zodiac: {
      'zh-CN': '星座是星空写给人类的诗篇，诉说着性格与命运的古老秘密。让我们一起探索星座的奥秘，了解您独特的星芒特质。请告诉我您的出生月日。',
      'en': 'Constellations are poems written in the stars for humanity, telling ancient secrets of personality and destiny. Let us explore the mysteries of the constellations, discover your unique stellar traits. Please tell me your birth month and day.',
      'ja': '星座は人類に書かれた星空の詩で、性格と運命の古代の秘密を語っています。星座の奥秘を探索し、あなた独特の星芒の特質を理解しましょう。出生年月日を教えてください。',
      'ko': '별자리는 인간에게 쓰인 별의 시이며, 성격과 운명의 고대 비밀이 담겨 있습니다. 별자리의 신비로움을 탐색하고, 당신만의 별의 특성을 이해해 보세요. 생월일을告诉我주세요.',
      'es': 'Las constelaciones son poemas escritos en las estrellas para la humanidad, contando secretos antiguos de personalidad y destino. Exploremos los misterios de las constelaciones, descubramos tus únicos rasgos estelares. Por favor, dime tu mes y día de nacimiento.',
      'it': 'Le costellazioni sono poesie scritte nelle stelle per l\'umanità, che raccontano antichi segreti di personalità e destino. Esploriamo i misteri delle costellazioni, scopriamo i tuoi tratti stellari unici. Per favore, dimmi il tuo mese e giorno di nascita.',
      'fr': 'Les constellations sont des poème\'s écrits dans les étoiles pour l\'humanité, racontant les secrets anciens de la personnalité et du destin. Explorons les mystères des constellations, découvrons vos traits stellaires uniques. Veuillez me donner votre mois et jour de naissance.',
      'de': 'Sternbilder sind Gedichte, die für die Menschheit in den Sternen geschrieben wurden, und erzählen uralte Geheimnisse über Persönlichkeit und Schicksal. Erkunden wir die Geheimnisse der Sternbilder, entdecken wir Ihre einzigartigen Sternmerkmale. Bitte teilen Sie mir Ihren Geburtsmonat und -tag mit.',
      'pt': 'Constelações são poemas escritos nas estrelas para a humanidade, contando segredos antigos de personalidade e destino. Vamos explorar os mistérios das constelações, descobrir seus traços estelares únicos. Por favor, me diga seu mês e dia de nascimento.',
      'ar': 'الكوكبات هي قصائد كتبتها النجوم للبشرية، تحكي أسرار الشخصية والقدر القديمة. دعنا نستكشف mysteries of the constellations، ونكتشف سماتك النجمية الفريدة. من فضلك أخبرني بشهر ويوم ميلادك.',
      'id': 'Konstelasi adalah puisi yang ditulis oleh bintang-bintang untuk umat manusia, menceritakan rahasia kuno tentang kepribadian dan takdir. Mari kita jelajahi misteri konstelasi, temukan traits bintang unik Anda. Silakan beritahu bulan dan tanggal lahir Anda.'
    },
    draw: {
      'zh-CN': '每一次抽签，都是与古老智慧的对话。静心默念您的问题，然后抽取一支属于您的签诗，让我为您解读其中的启示。',
      'en': 'Each divination is a conversation with ancient wisdom. Quietly contemplate your question, then draw your fate poem, let me interpret the revelation within.',
      'ja': '每一次の抽籤都是古代の知恵との対話です。心静かに質問默念し、そしてあなたの签詩を引，让我在其中为您解读启示。',
      'ko': '每一次 음주는 고대 지혜와의 대화입니다. 조용히 질문을 명상하고, 당신의 차诗를 뽑으세요, 제가 그 속에서 계시를 해석해 드리겠습니다.',
      'es': 'Cada divinidad es una conversación con la sabiduría antigua. Contempla tranquilamente tu pregunta, luego dibuja tu poema del destino, déjame interpretar la revelación.',
      'it': 'Ogni divinazione è una conversazione con la saggezza antica. Medita tranquillamente sulla tua domanda, poi estrai la tua poesia del destino, permettimi di interpretare la rivelazione.',
      'fr': 'Chaque divination est une conversation avec la sagesse ancienne. Méditez calmement sur votre question, puis tirez votre poème du destin, laissez-moi interpréter la révélation.',
      'de': 'Jede Wahrsagerei ist ein Gespräch mit alter Weisheit. Meditieren Sie still über Ihre Frage, dann ziehen Sie Ihr Schicksalsgedicht, lassen Sie mich die Offenbarung interpretieren.',
      'pt': 'Cada divinação é uma conversa com a sabedoria antiga. Contemple tranquilamente sua pergunta, então tire seu poema do destino, deixe-me interpretar a revelação.',
      'ar': 'كل عرافة هي محادثة مع الحكمة القديمة. فكر بهدوء في سؤالك، ثم اسحب قصيدة مصيرك، دعني أفسرRevelation فيها.',
      'id': 'Setiap ramalan adalah percakapan dengan kebijaksanaan kuno. Pertimbangkan pertanyaan Anda dengan tenang, lalu tarik puisi nasib Anda, biarkan saya menafsirkan wahyu di dalamnya.'
    },
    huangdi: {
      'zh-CN': '《黄帝内经》是中华养生智慧的瑰宝，蕴含着天人合一的奥秘。让我们一起探索这部经典，寻求身心健康之道。请问您想了解哪方面的养生知识？',
      'en': 'The Huangdi Neijing is a treasure of Chinese health wisdom, containing the mysteries of heaven-human unity. Let us explore this classic, seek the path of physical and mental health. What aspect of health knowledge would you like to know?',
      'ja': '『黄帝内経』は中華養生知恵の瑰宝で、天人合一の奥秘を含んでいます。この经典を探索し、心身の健康之道を求めましょう。どの方面の養生知識をえたいですか？',
      'ko': '『황제내경』은 중화 양생 지혜의 보배이며,天人合一의 신비가 담겨 있습니다. 이 고전을 탐색하고,身心健康之道를寻求합시다. 어느 분야의 양생 지식을 알고 싶으세요?',
      'es': 'El Huangdi Neijing es un tesoro de la sabiduría sanitaria china, que contiene los misterios de la unidad cielo-humano. Exploremos este clásico, busquemos el camino de la salud física y mental. ¿Qué aspecto del conocimiento sanitario le gustaría conocer?',
      'it': "L'Huangdi Neijing è un tesoro della saggezza sanitaria cinese, contenente i misteri dell'unità cielo-umano. Esploriamo questo classico, cerchiamo la via della salute fisica e mentale. Quale aspetto della conoscenza sanitaria vorresti conoscere?",
      'fr': 'Le Huangdi Neijing est un trésor de la sagesse sanitaire chinoise, contenant les mystères de l\'unité ciel-humain. Explorons ce classique, cherchons la voie de la santé physique et mentale. Quel aspect des connaissances sanitaires souhaiteriez-vous connaître?',
      'de': 'Das Huangdi Neijing ist ein Schatz der chinesischen Gesundheitsweisheit und enthält die Geheimnisse der Einheit von Himmel und Mensch. Erkunden wir dieses Klassiker, suchen wir den Weg der körperlichen und geistigen Gesundheit. Welchen Aspekt des Gesundheitswissens möchten Sie kennenlernen?',
      'pt': 'O Huangdi Neijing é um tesouro da sabedoria de saúde chinês, contendo os mistérios da unidade céu-humano. Vamos explorar este clássico, buscar o caminho da saúde física e mental. Qual aspecto do conhecimento de saúde você gostaria de conhecer?',
      'ar': 'نص Huangdi Neijing هو كنز للحكمة الصحية الصينية، الذي يحتوي على أسرار وحدة السماء والبشر. دعنا نستكشف هذا الكلاسيكي، ونبحث عن طريق الصحة الجسدية والنفسية. ما الجانب من المعرفة الصحية الذي تود معرفته؟',
      'id': 'Huangdi Neijing adalah harta karun kebijaksanaan kesehatan Tiongkok, yang mengandung misteri kesatuan langit-manusia. Mari kita jelajahi klasik ini, cari jalan kesehatan fisik dan mental. Aspek pengetahuan kesehatan mana yang ingin Anda ketahui?'
    },
    lifenumber: {
      'zh-CN': '生命灵数是出生日期蕴含的能量密码，揭示着您的天赋才华与人生使命。让我们一起解读您独特的生命数字。请告诉我您的出生日期。',
      'en': 'Life Path Number is the energy code embedded in your birth date, revealing your talents and life purpose. Let us decode your unique Life Numbers. Please tell me your birth date.',
      'ja': '生命霊数は出生日に込められたエネルギーパスコードで、あなたの天赋と人生使命を明かしています。あなた独特の生命数字を解读しましょう。出生日を教えてください。',
      'ko': '생명 영수는 탄생일에 담긴 에너지 암호이며, 당신의 재능과 삶使명를 드러냅니다. 당신만의 생명 숫자를 해석해 드릴게요. 탄생일을告诉我주세요.',
      'es': 'El Número de Vida es el código de energía incrustado en tu fecha de nacimiento, revelando tus talentos y propósito vital. Decodifiquemos tus Números de Vida únicos. Por favor, dime tu fecha de nacimiento.',
      'it': 'Il Numero di Vita è il codice energetico incorporato nella tua data di nascita, rivelando i tuoi talenti e scopo di vita. Decodifichiamo i tuoi Numeri di Vita unici. Per favore, dimmi la tua data di nascita.',
      'fr': 'Le Nombre de Vie est le code énergétique incorporé dans votre date de naissance, révélant vos talents et votre purpose de vie. Décodifions vos Nombres de Vie uniques. Veuillez me donner votre date de naissance.',
      'de': 'Die Lebenszahl ist der in Ihrem Geburtsdatum eingebettete Energiecode, der Ihre Talente und Ihren Lebenszweck offenbart. Lassen Sie uns Ihre einzigartigen Lebenszahlen entschlüsseln. Bitte teilen Sie mir Ihr Geburtsdatum mit.',
      'pt': 'O Número da Vida é o código de energia incorporado na sua data de nascimento, revelando seus talentos e propósito de vida. Vamos decodificar seus Números da Vida únicos. Por favor, me diga sua data de nascimento.',
      'ar': 'رقم مسار الحياة هو رمز الطاقة المضمن في تاريخ ميلادك، يكشف عن مواهبك وغرض حياتك. دعنا نفك رموز أرقام حياتك الفريدة. من فضلك أخبرني بتاريخ ميلادك.',
      'id': 'Angka Jalur Hidup adalah kode energi yang tertanam dalam tanggal lahir Anda, mengungkapkan bakat dan tujuan hidup Anda. Mari kita pecahkan Angka Kehidupan unik Anda. Silakan beritahu tanggal lahir Anda.'
    },
    ziwei: {
      'zh-CN': '紫微斗数是中国古代皇家命理绝学，宏观呈现您一生的命运图谱。让我们一起探索您的紫微命盘，洞察命运起伏与人生机遇。请提供您的出生信息。',
      'en': 'Zwei Dou Shu is the ancient Chinese imperial astrology, macroscopically presenting your lifelong destiny map. Let us explore your Zwei fortune chart, insight into life\'s ups and downs and opportunities. Please provide your birth information.',
      'ja': '紫微斗数は中国古代皇家命理絶学で、你の一生の運命図譜を宏观的に提示しています。紫微運命盤を探索し、運命の浮き沈みと人生機会を洞察しましょう。出生情報を提供してください。',
      'ko': '자미두수는 중국 고대 황실 역술이며, 당신 평생의 운명 지도를宏观적으로 제시합니다. 자미 운명반을 탐색하고, 운명의浮き沈み牡馬人生 기회를洞察해 드릴게요. 탄생 정보를 제공해 주세요.',
      'es': 'Zwei Dou Shu es la astrología imperial china antigua, presentando macroscópicamente tu mapa de destino vital. Exploremos tu carta de fortuna Zwei, perspectiva sobre altibajos y oportunidades vitales. Por favor, proporciona tu información de nacimiento.',
      'it': 'Zwei Dou Shu è l\'astrologia imperiale cinese antica, che presenta macroscopicamente la mappa del tuo destino vitale. Esploriamo la tua carta della fortuna Zwei, intuizioni sui alti e bassi della vita e le opportunità. Per favore, fornisci le tue informazioni di nascita.',
      'fr': 'Zwei Dou Shu est l\'astrologie impériale chinoise ancienne, présentant macroscopiquement votre carte de destinée vitale. Explorons votre carte de fortune Zwei, perspicacité sur les hauts et bas de la vie et les opportunités. Veuillez fournir vos informations de naissance.',
      'de': 'Zwei Dou Shu ist die alte chinesische kaiserliche Astrologie, die makroskopisch Ihre Lebensschicksalskarte präsentiert. Erkunden wir Ihr Zwei-Glücksdiagramm, Einblicke in die Höhen und Tiefen des Lebens und Chancen. Bitte geben Sie Ihre Geburtsinformationen an.',
      'pt': 'Zwei Dou Shu é a astrologia imperial chinesa antiga, presentando macroscopicamente seu mapa de destino vital. Vamos explorar sua carta de fortuna Zwei, insights sobre os altos e baixos da vida e oportunidades. Por favor, forneça suas informações de nascimento.',
      'ar': 'Zwei Dou Shu هي علم التنجيم الإمبراطوري الصيني القديم، الذي يعرض بشكل كلي خريطة مصيرك Lifetime. دعنا نستكشف مخطوطة حظ Zwei، ونظرة ثاقبة على صعود وهبوط الحياة والفرص. يرجى提供 معلومات ميلادك.',
      'id': 'Zwei Dou Shu adalah astrologi kekaisaran Tiongkok kuno, yang menyajikan secara makroskopis peta nasib seumur hidup Anda. Mari kita jelajahi grafik luck Zwei Anda, wawasan tentang naik turun kehidupan dan peluang. Silakan berikan informasi lahir Anda.'
    },
    zhouyi: {
      'zh-CN': '《周易》是群经之首，大道之源。天地变化之道，尽在其中。让我们一起通过易经智慧，解答您心中的困惑。请告诉我您想问的事情。',
      'en': 'The Zhouyi is the head of all classics, the source of the Great Way. The way of heaven and earth changes, all contained within. Let us answer your confusion through the wisdom of the I Ching. Please tell me what you wish to ask.',
      'ja': '『周易』は群経之首で、大道の源です。天地変化の道は尽くここに含まれています。易经の知恵を通じて心中的困惑を解答しましょう。私が聞きたいことを教えてください。',
      'ko': '『주역』은 군경之首이며大道의 원천입니다.天地变化之道는盡皆 여기에 포함되어 있습니다. 역경의 지혜를 통해心中的困惑를解答합시다. 제가 묻고 싶은 것을告诉我주세요.',
      'es': 'El Zhouyi es la cabeza de todos los clásicos, la fuente de la Gran Vía. El camino de los cambios del cielo y la tierra, todo contenido en él. Resolvamos su confusión a través de la sabiduría del I Ching. Por favor, dime qué quieres preguntar.',
      'it': 'Lo Zhouyi è il capo di tutti i classici, la fonte della Grande Via. Il modo dei cambiamenti del cielo e della terra, tutto contenuto in esso. Risolviamo la tua confusione attraverso la saggezza dell\'I Ching. Per favore, dimmi cosa desideri chiedere.',
      'fr': 'Le Zhouyi est la tête de tous les classiques, la source de la Grande Voie. Le chemin des changements du ciel et de la terre, tout contenu en lui. Résolvons votre confusion à travers la sagesse du Yi Jing. Veuillez me dire ce que vous souhaitez demander.',
      'de': 'Das Zhouyi ist das Haupt aller Klassiker, die Quelle des Großen Weges. Der Weg der Veränderungen von Himmel und Erde, alles darin enthalten. Lassen Sie uns Ihre Verwirrung durch die Weisheit des I Ching beantworten. Bitte teilen Sie mir mit, was Sie fragen möchten.',
      'pt': 'O Zhouyi é o cabeça de todos os clássicos, a fonte do Grande Caminho. O caminho das mudanças do céu e da terra, tudo contido nele. Vamos responder à sua confusão através da sabedoria do I Ching. Por favor, me diga o que você gostaria de perguntar.',
      'ar': 'Zhouyi هو رئيس جميع الكلاسيكيات، مصدر الطريق العظيم. طريقة تغيرات السماء والأرض، كل شيء موجود فيها. دعنا نجيب على حيرتك من خلال حكمة I Ching. من فضلك أخبرني بما تريد أن تسأله.',
      'id': 'Zhouyi adalah kepala semua klasik, sumber Jalan Besar. Jalur perubahan langit dan bumi, semuanya terkandung di dalamnya. Mari kita jawab kebingungan Anda melalui kebijaksanaan I Ching. Silakan beritahu apa yang ingin Anda tanyakan.'
    },
    naming: {
      'zh-CN': '名字是一个人的符号，承载着父母的期望与人生的祝福。让我们一起探讨姓名的奥秘，为您找到最适合的名字。请告诉我您的需求。',
      'en': 'A name is a person\'s symbol, carrying parents\' hopes and life\'s blessings. Let us explore the mysteries of names, find the most suitable name for you. Please tell me your needs.',
      'ja': '名前は人間の記号で、親の期望と人生の祝福を載せています。姓名の奥秘を探讨し、あなたに最も合う名前を見つけましょう。ニーズを教えてください。',
      'ko': '이름은 사람의 상징이며, 부모의 기대와 삶의 축복이 담겨 있습니다. 이름의奥秘를探讨하고, 당신에게 가장 알맞은 이름을 찾읍시다. 제안을告诉我주세요.',
      'es': 'Un nombre es el símbolo de una persona, llevando las esperanzas de los padres y las bendiciones de la vida. Exploremos los misterios de los nombres, encontremos el nombre más adecuado para ti. Por favor, dime tus necesidades.',
      'it': 'Un nome è il simbolo di una persona, che porta le speranze dei genitori e le benedizioni della vita. Esploriamo i misteri dei nomi, troviamo il nome più adatto a te. Per favore, dimmi le tue esigenze.',
      'fr': 'Un nom est le symbole d\'une personne, portant les espoirs des parents et les bénédictions de la vie. Explorons les mystères des noms, trouvons le nom le plus approprié pour vous. Veuillez me faire part de vos besoins.',
      'de': 'Ein Name ist das Symbol einer Person, das die Hoffnungen der Eltern und die Segnungen des Lebens trägt. Erkunden wir die Geheimnisse der Namen, finden wir den am besten geeigneten Namen für Sie. Bitte teilen Sie mir Ihre Bedürfnisse mit.',
      'pt': 'Um nome é o símbolo de uma pessoa, carregando as esperanças dos pais e as bênçãos da vida. Vamos explorar os mistérios dos nomes, encontrar o nome mais adequado para você. Por favor, me diga suas necessidades.',
      'ar': 'الاسم هو رمز الشخص، يحمل آمال الوالدين وبركات الحياة. دعنا نستكشف أسرار الأسماء، ونجد الاسم الأنسب لك. من فضلك أخبرني باحتياجاتك.',
      'id': 'Nama adalah simbol seseorang, membawa harapan orang tua dan berkah hidup. Mari kita jelajahi misteri nama, temukan nama yang paling cocok untuk Anda. Silakan beritahu kebutuhan Anda.'
    },
    marriage: {
      'zh-CN': '百年修得同船渡，千年修得共枕眠。两个人的相遇，是缘分的交织。让我们一起解读您们的缘分深浅与婚姻走向。请提供两人的出生信息。',
      'en': 'A hundred years to earn the same boat crossing, a thousand years to share the same pillow. The meeting of two people is the weaving of fate. Let us interpret the depth of your bond and marriage direction. Please provide both birth information.',
      'ja': '百年同じ舟を乗るを修め、千年同じ枕を寝るを得る。二人の出会いは、縁分の織り成し입니다。あなたたちの縁の深さと結婚走向を読み取りましょう。二人の出生情報を提供してください。',
      'ko': '百年 같은 배를 건너는 것을修め, 천 년 같은 베개를 베고寝る 것을修득합니다. 두 사람의 만남은 인연의 fabric입니다. 당신들의 인연 깊이와 결혼走向을 해석합시다. 두 사람의 탄생 정보를 제공해 주세요.',
      'es': 'Cien años para ganar el mismo cruce de barco, mil años para compartir la misma almohada. El encuentro de dos personas es el entrelazamiento del destino. Interpretemos la profundidad de su vínculo y dirección matrimonial. Por favor, proporcione la información de nacimiento de ambos.',
      'it': 'Cent\'anni per guadagnare la stessa traversata in barca, mille anni per condividere lo stesso cuscino. L\'incontro di due persone è la tessitura del destino. Interpretiamo la profondità del vostro legame e direzione matrimoniale. Per favore, fornite le informazioni di nascita di entrambi.',
      'fr': 'Cent ans pour gagner la même traversée en bateau, mille ans pour partager le même oreiller. La rencontre de deux personnes est le tissage du destin. Interprétons la profondeur de votre lien et direction matrimoniale. Veuillez fournir les informations de naissance des deux.',
      'de': 'Hundert Jahre, um dieselbe Bootsüberfahrt zu verdienen, tausend Jahre, um dasselbe Kissen zu teilen. Das Treffen zweier Menschen ist das Weben des Schicksals. Lassen Sie uns die Tiefe Ihrer Bindung und Eherichtung interpretieren. Bitte geben Sie die Geburtsinformationen beider an.',
      'pt': 'Cem anos para ganhar a mesma travessia de barco, mil anos para compartilhar o mesmo travesseiro. O encontro de duas pessoas é o tecelame do destino. Vamos interpretar a profundidade da ligação e direção matrimonial. Por favor, forneça as informações de nascimento de ambos.',
      'ar': 'مائة عام لكسب نفس عبور القارب، ألف عام لمشاركة نفس الوسادة. لقاء شخصين هو نسج القدر. دعنا نفسر عمق رابطك وتوجيه الزواج. يرجى تقديم معلومات ميلاد كلاهما.',
      'id': 'Seratus tahun untuk menyeberangi perahu yang sama, seribu tahun untuk berbagi bantal yang sama. Pertemuan dua orang adalah tenunan takdir. Mari kita interpretasikan kedalaman ikatan dan arah pernikahan Anda. Silakan berikan informasi lahir keduanya.'
    },
    company: {
      'zh-CN': '商海如战场，一个好名字是企业的第一印象。让我们一起为您打造一个寓意深远、朗朗上口的商业名称。请告诉我您的行业和期望。',
      'en': 'The business sea is like a battlefield, a good name is the first impression of an enterprise. Let us create a profound and catchy business name for you. Please tell me your industry and expectations.',
      'ja': '商海は戦場のようで、良い名前は企業の第一印象です。意味深遠で語り口のよいビジネス名を一緒に作りましょう。業界と期待を教えてください。',
      'ko': '상해는 전장 같으며, 좋은 이름은 기업의 첫 인상입니다. 의미깊고 입에착착 달라붙는 상호명을 함께 만릅시다. 업계와 기대를告诉我주세요.',
      'es': 'El mar de los negocios es como un campo de batalla, un buen nombre es la primera impresión de una empresa. Creemos un nombre comercial profundo y pegadizo para ti. Por favor, dime tu industria y expectativas.',
      'it': 'Il mare degli affari è come un campo di battaglia, un buon nome è la prima impressione di un\'impresa. Creiamo un nome commerciale profondo e accattivante per te. Per favore, dimmi la tua industria e aspettative.',
      'fr': 'La mer des affaires est comme un champ de bataille, un bon nom est la première impression d\'une entreprise. Créons un nom commercial profond et accrocheur pour vous. Veuillez me parler de votre industrie et de vos attentes.',
      'de': 'Das Geschäftsmeer ist wie ein Schlachtfeld, ein guter Name ist der erste Eindruck eines Unternehmens. Lassen Sie uns einen tiefgründigen und einprägsamen Firmennamen für Sie erstellen. Bitte teilen Sie mir Ihre Branche und Erwartungen mit.',
      'pt': 'O mar dos negócios é como um campo de batalha, um bom nome é a primeira impressão de uma empresa. Vamos criar um nome comercial significativo e memorável para você. Por favor, me diga sua indústria e expectativas.',
      'ar': 'البحر التجاري مثل ساحة المعركة، والاسم الجيد هو الانطباع الأول للشركة. دعنا نصنع اسم تجاري عميق وسهل النطق لك. من فضلك أخبرني بindustria وتوقعاتك.',
      'id': 'Laut bisnis seperti medan pertempuran, nama yang baik adalah kesan pertama perusahaan. Mari kita buat nama bisnis yang bermakna dan mudah diingat untuk Anda. Silakan beritahu industri dan harapan Anda.'
    },
    luckyday: {
      'zh-CN': '天时地利人和，成功需要顺势而为。让我们一起选择最适合您的好日子，让大事小事都能顺应天时。请告诉我您想选择日期的事情。',
      'en': 'Timing, location, and people are essential, success requires going with the flow. Let us choose the most suitable lucky day for you, so everything can follow the heavens\' timing. Please tell me what you need to select a date for.',
      'ja': '天時地利人和、成功は流れに顺势じるが必要です。あなたに最適な吉日を選択して、大きな тоже小さなことも天時に顺じましょう。日期を選びたいことを教えてください。',
      'ko': '천시地利人和, 성공은 시대에順応해야 합니다. 당신에게 가장 적합한 吉日를 함께 선택하여,大小的 문제든 모두 천時に 순응하도록 합시다. 날짜를 선택하고 싶은 것을告诉我주세요.',
      'es': 'El momento, el lugar y las personas son esenciales, el éxito requiere ir con la flujo. Elegamos el día más afortunado para ti, para que todo pueda seguir el tiempo del cielo. Por favor, dime para qué necesitas seleccionar una fecha.',
      'it': 'Tempo, luogo e persone sono essenziali, il successo richiede andare con il flusso. Scegliamo il giorno più fortunato per te, così tutto può seguire il tempismo celeste. Per favore, dimmi per cosa hai bisogno di selezionare una data.',
      'fr': 'Le moment, le lieu et les personnes sont essentiels, le succès nécessite d\'aller avec le flux. Choisissons le jour le plus chanceux pour vous, afin que tout puisse suivre le timing du ciel. Veuillez me dire pour quoi vous avez besoin de sélectionner une date.',
      'de': 'Zeit, Ort und Menschen sind wesentlich, Erfolg erfordert mit dem Strom zu schwimmen. Lassen Sie uns den glücklichsten Tag für Sie wählen, damit alles dem Himmelszeit folgen kann. Bitte teilen Sie mir mit, wofür Sie ein Datum auswählen müssen.',
      'pt': 'Tempo, local e pessoas são essenciais, o sucesso requer ir com o fluxo. Vamos escolher o dia de mais sorte para você, para que tudo possa seguir o tempo do céu. Por favor, me diga para que você precisa selecionar uma data.',
      'ar': 'الوقت والمكان والأشخاص ضروريون، والنجاح يتطلب المضي مع التيار. دعنا نختار اليوم الأكثر حظًا لك، بحيث يمكن لكل شيءاتباع توقيت السماء. من فضلك أخبرني بما تحتاج لتحديد التاريخ.',
      'id': 'Waktu, tempat, dan orang-orang sangat penting, kesuksesan membutuhkan mengikuti arus. Mari kita pilih hari paling beruntun untuk Anda, sehingga semuanya dapat mengikuti waktu surga. Silakan beritahu apa yang Anda butuhkan untuk memilih tanggal.'
    },
    digital: {
      'zh-CN': '数字蕴含着宇宙的能量密码，每个数字都有其独特的振动频率。让我们一起解读您生命中的数字奥秘。请选择一个数字或告诉我您的出生日期。',
      'en': 'Numbers contain the energy codes of the universe, each number has its unique vibrational frequency. Let us decode the numerical mysteries in your life. Please choose a number or tell me your birth date.',
      'ja': '数字には宇宙のエネルギーパスコードが含まれており每の数字には独特の振動周波数があります。人生の数字の奥秘を解码しましょう。数字を選択するか、生年月日を教えてください。',
      'ko': '숫자에는 우주의 에너지 암호가 담겨 있으며, 각 숫자에는 고유한 진동 주파수가 있습니다. 삶 속의 숫자奥秘를解码합시다. 숫자를 선택하거나 탄생일을告诉我주세요.',
      'es': 'Los números contienen los códigos de energía del universo, cada número tiene su única frecuencia vibratoria. Decodifiquemos los misterios numéricos en tu vida. Por favor, elige un número o dime tu fecha de nacimiento.',
      'it': 'I numeri contengono i codici energetici dell\'universo, ogni numero ha la sua unica frequenza vibratoria. Decodifichiamo i misteri numerici nella tua vita. Per favore, scegli un numero o dimmi la tua data di nascita.',
      'fr': 'Les nombres contiennent les codes énergétiques de l\'univers, chaque nombre a sa fréquence vibratoire unique. Décodifions les mystères numériques dans votre vie. Veuillez choisir un nombre ou me donner votre date de naissance.',
      'de': 'Zahlen enthalten die Energiecodes des Universums, jede Zahl hat ihre einzigartige Schwingungsfrequenz. Lassen Sie uns die Zahlengeheimnisse in Ihrem Leben entschlüsseln. Bitte wählen Sie eine Zahl oder teilen Sie mir Ihr Geburtsdatum mit.',
      'pt': 'Os números contêm os códigos de energia do universo, cada número tem sua frequência vibratória única. Vamos decodificar os mistérios numéricos na sua vida. Por favor, escolha um número ou me diga sua data de nascimento.',
      'ar': 'الأرقام تحتوي على رموز طاقة الكون، كل رقم له تردده الاهتزازي الفريد. دعنا نفك رموز الأسرار الرقمية في حياتك. من فضلك اختر رقمًا أو أخبرني بتاريخ ميلادك.',
      'id': 'Angka mengandung kode energi semesta, setiap angka memiliki frekuensi getaran uniknya sendiri. Mari kita pecahkan misteri angka dalam hidup Anda. Silakan pilih angka atau beritahu tanggal lahir Anda.'
    },
    daodejing: {
      'zh-CN': '《道德经》言：道可道，非常道。让我们一起领悟这部智慧之海的深邃内涵，寻求心灵的宁静与人生的智慧。请问您想探讨哪一章的内容？',
      'en': 'The Daodejing says: The Way that can be told is not the eternal Way. Let us comprehend the profound depths of this sea of wisdom, seek the tranquility of the soul and wisdom of life. Which chapter would you like to explore?',
      'ja': '『道德経』に言われている：道可道，非常道。この智慧の海の深邃さを悟り、心の宁静と人生の智慧を求めましょう。どの章の内容を探讨したいですか？',
      'ko': '『도덕경』에 말하기를: 도 可道, 常道가 아닙니다. 이 지혜의 바다의 깊은内涵을领悟하고, 마음의 평온함과 삶의 지혜를寻求합시다. 어느 장의 내용을 탐구하고 싶으세요?',
      'es': 'El Daodejing dice: El Camino que puede ser dicho no es el Camino eterno. Comprendamos las profundidades de este mar de sabiduría, busquemos la tranquilidad del alma y la sabiduría de la vida. ¿Qué capítulo te gustaría explorar?',
      'it': 'Il Daodejing dice: La Via che può essere detta non è la Via eterna. Comprendiamo le profondità di questo mare di saggezza, cerchiamo la tranquillità dell\'anima e la saggezza della vita. Quale capitolo vorresti esplorare?',
      'fr': 'Le Daodejing dit: La Voie qui peut être dite n\'est pas la Voie éternelle. Comprenons les profondeurs de cette mer de sagesse, cherchons la tranquillité de l\' âme et la sagesse de la vie. Quel chapitre souhaiteriez-vous explorer?',
      'de': 'Der Daodejing sagt: Der Weg, der gesagt werden kann, ist nicht der ewige Weg. Lassen Sie uns die tiefen dieses Weisheitsmeeres begreifen, die Ruhe der Seele und die Weisheit des Lebens suchen. Welches Kapitel möchten Sie erkunden?',
      'pt': 'O Daodejing diz: O Caminho que pode ser dito não é o Caminho eterno. Compreendamos as profundezas deste mar de sabedoria, busquemos a tranquilidade da alma e a sabedoria da vida. Qual capítulo você gostaria de explorar?',
      'ar': 'داوي ديجينغ يقول: الطريق الذي يمكن قوله ليس الطريق الأبدي. دعنا نفهم أعماق هذا البحر من الحكمة، ونطلب هدوء الروح وحكمة الحياة. أي فصل تود استكشافه?',
      'id': 'Daodejing mengatakan: Jalan yang dapat dikatakan bukan Jalan abadi. Mari kita pahami kedalaman lautan kebijaksanaan ini, cari ketenangan jiwa dan kebijaksanaan hidup. Bab mana yang ingin Anda jelajahi?'
    },
    question: {
      'zh-CN': '易者，变也。穷则变，变则通。让我们通过易经八卦，为您答疑解惑，指引迷津。请告诉我您想问的事情。',
      'en': 'Change, that is the Yi. Exhaustion leads to change, change leads to passage. Let us use the Eight Trigrams to answer your questions and guide you through confusion. Please tell me what you wish to ask.',
      'ja': '易者、変也。窮すれば変じ、変じれば通ず。让我们通过易经八卦，为您答疑解惑，请告诉我您想问的事情。',
      'ko': '역자, 변也窮하면 변하고, 변하면 통합니다. 역경 팔괘를 통해 당신의 질문에 대답하고, 혼란을指引해 드리겠습니다. 제가 묻고 싶은 것을告诉我주세요.',
      'es': 'Yi, el cambio. El agotamiento conduce al cambio, el cambio conduce al paso. Usemos los ocho trigramas para responder sus preguntas y guiarlo. Por favor, dime qué deseas preguntar.',
      'it': 'Yi, il cambiamento. L\'esaurimento porta al cambiamento, il cambiamento porta al passaggio. Usiamo gli otto trigrammi per rispondere alle tue domande e guidarti. Per favore, dimmi cosa desideri chiedere.',
      'fr': 'Yi, le changement. L\'épuisement conduit au changement, le changement conduit au passage. Utilisons les huit trigrammes pour répondre à vos questions et vous guider. Veuillez me dire ce que vous souhaitez demander.',
      'de': 'Yi, die Veränderung. Erschöpfung führt zur Veränderung, Veränderung führt zum Durchgang. Lassen Sie uns die acht Trigramme verwenden, um Ihre Fragen zu beantworten und Sie zu führen. Bitte teilen Sie mir mit, was Sie fragen möchten.',
      'pt': 'Yi, a mudança. O esgotamento leva à mudança, a mudança leva à passagem. Usemos os oito trigramas para responder suas perguntas e guiá-lo. Por favor, me diga o que você gostaria de perguntar.',
      'ar': 'يي، التغيير. الإنهاك يؤدي إلى التغيير، التغيير يؤدي إلى المرور. دعنا نستخدم الثمانية ثلاثيات للرد على أسئلتك وتوجيهك. من فضلك أخبرني بما تريد أن تسأله.',
      'id': 'Yi, perubahan. Kelelahan menyebabkan perubahan, perubahan menyebabkan kemajuan. Mari kita gunakan delapan trigram untuk menjawab pertanyaan dan memandu Anda. Silakan beritahu apa yang ingin Anda tanyakan.'
    }
  }

  // 发送消息
  async function sendMessage(content) {
    if (!content.trim()) return
    
    // 获取当前档案信息
    const profileStore = useProfileStore()
    const profile = profileStore.currentProfile
    
    // 添加用户消息
    messages.value.push({
      role: 'user',
      content: content,
      timestamp: Date.now()
    })
    
    // 记录用户发送的消息到后台
    trackToBackend(currentModule.value, content, '', 'start')
    
    // 更新历史记录
    history.value.push(
      { role: 'user', content: content },
      { role: 'assistant', content: '' }
    )
    
    isLoading.value = true
    
    // 获取用户本地时间和语言
    const userLocalTime = new Date().toISOString();
    const languageStore = useLanguageStore();
    const currentLanguage = languageStore.currentLanguage;
    
    try {
      const response = await axios.post(`${API_URL}/chat/${currentModule.value}`, {
        message: content,
        history: history.value.slice(0, -1),
        profile: profile ? {
          name: profile.name,
          birthday: profile.birthday,
          gender: profile.gender,
          hour: profile.hour,
          bazi: profile.bazi
        } : null,
        userTime: userLocalTime,
        language: currentLanguage
      })
      
      const aiMessage = response.data.data.message
      
      // 前端过滤敏感词（额外保障）
      const filteredMessage = filterClientSensitiveWords(aiMessage)
      
      // 更新最后一条消息
      messages.value.push({
        role: 'assistant',
        content: filteredMessage,
        timestamp: Date.now()
      })

      // 发送到后台管理系统（AI 回复）
      trackToBackend(currentModule.value, '', filteredMessage, 'response')
      
      // 更新历史
      history.value[history.value.length - 1] = { role: 'assistant', content: filteredMessage }
      
    } catch (error) {
      let errorMsg = '抱歉，发生了错误，请稍后再试。'
      if (error.response?.data?.error) {
        errorMsg = error.response.data.error
      }
      
      messages.value.push({
        role: 'assistant',
        content: errorMsg,
        timestamp: Date.now()
      })
    } finally {
      isLoading.value = false
      
      // 保存聊天记录到服务器
      saveChatToServer()
    }
  }

  // 保存聊天记录到服务器
  async function saveChatToServer() {
    if (messages.value.length === 0) return
    
    const profileStore = useProfileStore()
    const profile = profileStore.currentProfile
    
    try {
      await axios.post(`${API_URL}/chat/save`, {
        module: currentModule.value,
        messages: messages.value,
        userId: getUserId(), // 添加用户ID
        profile: profile ? {
          name: profile.name,
          birthday: profile.birthday,
          gender: profile.gender
        } : null
      })
    } catch (error) {
      console.warn('Failed to save chat to server:', error)
    }
  }

  // 切换模块
  function setModule(moduleId) {
    const previousModule = currentModule.value
    // 追踪模块切换
    if (previousModule && previousModule !== moduleId) {
      trackModuleSwitch(previousModule, moduleId)
    }
    // 追踪模块选择
    trackModuleSelect(moduleId, modules.value.find(m => m.id === moduleId)?.name || moduleId)
    
    // 切换模块，保留当前模块的消息（已通过watch自动保存）
    currentModule.value = moduleId
    // messages 和 history 会通过 watch 自动加载对应模块的数据
  }

  // 清空当前模块对话
  function clearChat() {
    messages.value = []
    history.value = []
    // 清除当前模块的localStorage
    localStorage.removeItem(getModuleMessagesKey(currentModule.value))
    localStorage.removeItem(`chat_history_${currentModule.value}`)
  }

  // 发送带图片的消息
  async function sendMessageWithImage(content, imageBase64) {
    if (!content.trim()) return
    
    // 获取当前档案信息
    const profileStore = useProfileStore()
    const profile = profileStore.currentProfile
    
    // 更新历史记录
    history.value.push(
      { role: 'user', content: content, image: imageBase64 },
      { role: 'assistant', content: '' }
    )

    // 记录用户发送的消息到后台
    trackToBackend(currentModule.value, content, '', 'start')
    
    isLoading.value = true
    
    // 获取用户本地时间和语言
    const userLocalTime = new Date().toISOString();
    const languageStore = useLanguageStore();
    const currentLanguage = languageStore.currentLanguage;

    try {
      const response = await axios.post(`${API_URL}/chat/${currentModule.value}`, {
        message: content,
        image: imageBase64,
        history: history.value.slice(0, -1),
        profile: profile ? {
          name: profile.name,
          birthday: profile.birthday,
          gender: profile.gender,
          hour: profile.hour,
          bazi: profile.bazi
        } : null,
        userTime: userLocalTime,
        language: currentLanguage
      })
      
      const aiMessage = response.data.data.message
      
      // 前端过滤敏感词（额外保障）
      const filteredMessage = filterClientSensitiveWords(aiMessage)
      
      // 更新最后一条消息
      messages.value.push({
        role: 'assistant',
        content: filteredMessage,
        timestamp: Date.now()
      })

      // 发送到后台管理系统（AI 回复）
      trackToBackend(currentModule.value, '', filteredMessage, 'response')

      // 更新历史
      history.value[history.value.length - 1] = { role: 'assistant', content: filteredMessage }

    } catch (error) {
      let errorMsg = '抱歉，发生了错误，请稍后再试。'
      if (error.response?.data?.error) {
        errorMsg = error.response.data.error
      }

      messages.value.push({
        role: 'assistant',
        content: errorMsg,
        timestamp: Date.now()
      })
    } finally {
      isLoading.value = false

      // 保存聊天记录到服务器
      saveChatToServer()
    }
  }

  return {
    messages,
    currentModule,
    isLoading,
    history,
    modules,
    moduleIntros,
    sendMessage,
    sendMessageWithImage,
    setModule,
    clearChat,
    loadChatFromServer
  }
})
