<script setup>
import { useRouter } from 'vue-router'
import { useChatStore } from '../stores/chat'
import { useLanguageStore } from '../i18n'
import { computed } from 'vue'

const router = useRouter()
const chatStore = useChatStore()
const languageStore = useLanguageStore()

// 直接使用 languageStore.currentLanguage 来获取当前语言
const currentLang = computed(() => languageStore.currentLanguage)

// 翻译辅助函数
const t = (key) => {
  const translations = {
    'zh-CN': {
      appName: '知几',
      'home.heroTitle': '古老智慧的低语<br/>指引你的未来',
      'home.heroSubtitle': '"知几者，动之微，吉之先见者也"<br/>寻求清晰，开启命途，发现真我',
      'home.startBtn': '开始探索',
      'home.feature1': '随时随地',
      'home.feature2': '19+测算',
      'home.feature3': '精准解读',
      'home.exploreServices': '探索服务',
      'home.questionTitle': '有问题？随时问我',
      'home.questionSubtitle': '知几会结合古老智慧与现代AI为你解答',
      'home.askPlaceholder': '现在是换工作的好时机吗？',
      'home.askBtn': '询问',
      'home.footer': '© 2026 知几 · 古老智慧，现代解读',
      'modules.bazi': '生辰八字',
      'modules.baziDesc': '揭开人生的密码图谱',
      'modules.fengshui': '风水布局',
      'modules.fengshuiDesc': '调和空间，激发潜能',
      'modules.tarot': '塔罗牌',
      'modules.tarotDesc': '神秘而智慧的占卜',
      'modules.palm': '手相揭秘',
      'modules.palmDesc': '掌纹中的命运轨迹',
      'modules.dream': '周公解梦',
      'modules.dreamDesc': '让梦境化作生命启示'
    },
    'en': {
      appName: 'ZhiJi',
      'home.heroTitle': 'Whispers of ancient wisdom<br/>Guiding your future',
      'home.heroSubtitle': '"Those who know the signs, notice the subtle movements,<br/>are the first to see fortune"<br/>Seek clarity, discover your path, find your true self',
      'home.startBtn': 'Start Exploring',
      'home.feature1': 'Anytime Anywhere',
      'home.feature2': '19+ Readings',
      'home.feature3': 'Accurate Insights',
      'home.exploreServices': 'Explore Services',
      'home.questionTitle': 'Have questions? Ask me anytime',
      'home.questionSubtitle': 'ZhiJi combines ancient wisdom with modern AI to answer you',
      'home.askPlaceholder': 'Is now a good time to change jobs?',
      'home.askBtn': 'Ask',
      'home.footer': '© 2026 ZhiJi · Ancient Wisdom, Modern Interpretation',
      'modules.bazi': 'Birth Chart',
      'modules.baziDesc': 'Unlock the code of life',
      'modules.fengshui': 'Feng Shui',
      'modules.fengshuiDesc': 'Harmonize space, unleash potential',
      'modules.tarot': 'Tarot',
      'modules.tarotDesc': 'Mysterious and wise divination',
      'modules.palm': 'Palmistry',
      'modules.palmDesc': 'Destiny in palm lines',
      'modules.dream': 'Dream Interpretation',
      'modules.dreamDesc': 'Turn dreams into life insights'
    },
    'ja': {
      appName: '知幾',
      'home.heroTitle': '古からの知恵の囁き<br/>あなたの未来を導く',
      'home.heroSubtitle': '"幾者は動くこと微なり、吉の先見者也"<br/>明確さを求め、運命を発見し、真の自分を見つける',
      'home.startBtn': '探索を始める',
      'home.feature1': 'いつでもどこでも',
      'home.feature2': '19+占術',
      'home.feature3': '正確な解釈',
      'home.exploreServices': 'サービスを探索',
      'home.questionTitle': '質問がありますか？いつでも聞いてください',
      'home.questionSubtitle': '知幾は古代の知恵と現代AIを組み合わせてあなたにお答えします',
      'home.askPlaceholder': '今、仕事を変えるべきですか？',
      'home.askBtn': '聞く',
      'home.footer': '© 2026 知幾 · 古代の知恵、現代の解釈',
      'modules.bazi': '八字',
      'modules.baziDesc': '人生のマスターコードを明らかにする',
      'modules.fengshui': '風水',
      'modules.fengshuiDesc': '空間を調和させ、潜在能力を引き出す',
      'modules.tarot': 'タロット',
      'modules.tarotDesc': '神秘で知恵的な占術',
      'modules.palm': '手相',
      'modules.palmDesc': '掌紋の運命',
      'modules.dream': '夢解釈',
      'modules.dreamDesc': '夢を人生の洞察に変える'
    },
    'ko': {
      appName: '지기',
      'home.heroTitle': '고대 지혜의 속삭임<br/>당신의 미래를 이끈다',
      'home.heroSubtitle': '"몇자는 움직임이 미세하고, 길otis先見者也"<br/>명확성을 추구하고, 운명을 발견하고, 진정한 나를 찾으세요',
      'home.startBtn': '탐험 시작',
      'home.feature1': '언제 어디서나',
      'home.feature2': '19+ 占術',
      'home.feature3': '정확한 해설',
      'home.exploreServices': '서비스 탐색',
      'home.questionTitle': '질문이 있으신가요? 언제든 물어보세요',
      'home.questionSubtitle': '지기는 고대 지혜와 현대 AI를 결합하여 당신에게 답변합니다',
      'home.askPlaceholder': '지금 직장을 바꾸는 것이 좋은가요?',
      'home.askBtn': '묻기',
      'home.footer': '© 2026지기 · 고대 지혜, 현대적 해석',
      'modules.bazi': '팔자',
      'modules.baziDesc': '인생의 비밀 코드를 밝히다',
      'modules.fengshui': '풍수',
      'modules.fengshuiDesc': '공간을 조화시키고 잠재력을 끌어낸다',
      'modules.tarot': '타로',
      'modules.tarotDesc': '신비롭고 현명한 점술',
      'modules.palm': '수상',
      'modules.palmDesc': '손금의 운명',
      'modules.dream': '꿈해석',
      'modules.dreamDesc': ' dreams을 삶의 통찰력으로'
    },
    'es': {
      appName: 'ZhiJi',
      'home.heroTitle': 'Susurros de sabiduría antigua<br/>Guiando tu futuro',
      'home.heroSubtitle': '"Aquellos que conocen las señales, notan los movimientos sutiles,<br/>son los primeros en ver la fortuna"<br/>Busca claridad, descubre tu camino, encuentra tu verdadero yo',
      'home.startBtn': 'Comenzar Exploración',
      'home.feature1': 'En cualquier momento y lugar',
      'home.feature2': '19+ Lecturas',
      'home.feature3': 'Interpretaciones precisas',
      'home.exploreServices': 'Explorar Servicios',
      'home.questionTitle': '¿Tienes preguntas? Pregúntame cuando quieras',
      'home.questionSubtitle': 'ZhiJi combina sabiduría antigua con IA moderna para responderte',
      'home.askPlaceholder': '¿Es buen momento para cambiar de trabajo?',
      'home.askBtn': 'Preguntar',
      'home.footer': '© 2026 ZhiJi · Sabiduría Antigua, Interpretación Moderna',
      'modules.bazi': 'Carta Astral',
      'modules.baziDesc': 'Desbloquea el código de la vida',
      'modules.fengshui': 'Feng Shui',
      'modules.fengshuiDesc': 'Armoniza el espacio, libera el potencial',
      'modules.tarot': 'Tarot',
      'modules.tarotDesc': 'Adivinación misteriosa y sabia',
      'modules.palm': 'Quiromancia',
      'modules.palmDesc': 'Destino en las líneas de la mano',
      'modules.dream': 'Interpretación de Sueños',
      'modules.dreamDesc': 'Transforma los sueños en conocimientos vitales'
    },
    'it': {
      appName: 'ZhiJi',
      'home.heroTitle': 'Sussurri di saggezza antica<br/>Guidano il tuo futuro',
      'home.heroSubtitle': '"Coloro che conoscono i segni, notano i movimenti sottili,<br/>sono i primi a vedere la fortuna"<br/>Cerca chiarezza, scopri il tuo cammino, trova il tuo vero io',
      'home.startBtn': 'Inizia Esplorazione',
      'home.feature1': 'In qualsiasi momento e luogo',
      'home.feature2': '19+ Letture',
      'home.feature3': 'Interpretazioni precise',
      'home.exploreServices': 'Esplora Servizi',
      'home.questionTitle': 'Hai domande? Chiedimi quando vuoi',
      'home.questionSubtitle': 'ZhiJi combina saggezza antica con IA moderna per risponderti',
      'home.askPlaceholder': 'È un buon momento per cambiare lavoro?',
      'home.askBtn': 'Chiedi',
      'home.footer': '© 2026 ZhiJi · Saggezza Antica, Interpretazione Moderna',
      'modules.bazi': 'Carta Natale',
      'modules.baziDesc': 'Sblocca il codice della vita',
      'modules.fengshui': 'Feng Shui',
      'modules.fengshuiDesc': 'Armonizza lo spazio, libera il potenziale',
      'modules.tarot': 'Tarocchi',
      'modules.tarotDesc': 'Divinazione misteriosa e saggia',
      'modules.palm': 'Chiromanzia',
      'modules.palmDesc': 'Destino nelle linee della mano',
      'modules.dream': 'Interpretazione dei Sogni',
      'modules.dreamDesc': 'Trasforma i sogni in conoscenza della vita'
    },
    'fr': {
      appName: 'ZhiJi',
      'home.heroTitle': 'Murmures de sagesse ancienne<br/>Guidant votre avenir',
      'home.heroSubtitle': '"Ceux qui connaissent les signes, remarquent les mouvements subtils,<br/>sont les premiers à voir la fortune"<br/>Cherchez la clarté, découvrez votre chemin, trouvez votre vrai moi',
      'home.startBtn': 'Commencer Exploration',
      'home.feature1': 'N\'importe quand et n\'importe où',
      'home.feature2': '19+ Lectures',
      'home.feature3': 'Interprétations précises',
      'home.exploreServices': 'Explorer Services',
      'home.questionTitle': 'Avez-vous des questions? Demandez-moi quand vous voulez',
      'home.questionSubtitle': 'ZhiJi combine sagesse ancienne et IA moderne pour vous répondre',
      'home.askPlaceholder': 'Est-ce un bon moment pour changer de travail?',
      'home.askBtn': 'Demander',
      'home.footer': '© 2026 ZhiJi · Sagesse Ancienne, Interprétation Moderne',
      'modules.bazi': 'Thème Astral',
      'modules.baziDesc': 'Déverrouillez le code de la vie',
      'modules.fengshui': 'Feng Shui',
      'modules.fengshuiDesc': 'Harmonisez l\'espace, libérez le potentiel',
      'modules.tarot': 'Tarot',
      'modules.tarotDesc': 'Divination mystérieuse et sage',
      'modules.palm': 'Chiromancie',
      'modules.palmDesc': 'Destin dans les lignes de la main',
      'modules.dream': 'Interprétation des Rêves',
      'modules.dreamDesc': 'Transformez les rêves en connaissances vital'
    },
    'de': {
      appName: 'ZhiJi',
      'home.heroTitle': 'Flüstern der alten Weisheit<br/>Lenkt Ihre Zukunft',
      'home.heroSubtitle': '"Diejenigen, die die Zeichen kennen, bemerken die feinen Bewegungen,<br/>sind die ersten, die das Glück sehen"<br/>Suchen Sie Klarheit, entdecken Sie Ihren Weg, finden Sie Ihr wahres Ich',
      'home.startBtn': 'Erkundung Starten',
      'home.feature1': 'Jederzeit und überall',
      'home.feature2': '19+ Lesungen',
      'home.feature3': 'Genaue Einsichten',
      'home.exploreServices': 'Dienste Erkunden',
      'home.questionTitle': 'Haben Sie Fragen? Fragen Sie mich jederzeit',
      'home.questionSubtitle': 'ZhiJi kombiniert alte Weisheit mit moderner KI, um Ihnen zu antworten',
      'home.askPlaceholder': 'Ist jetzt ein guter Zeitpunkt, den Job zu wechseln?',
      'home.askBtn': 'Fragen',
      'home.footer': '© 2026 ZhiJi · Alte Weisheit, Moderne Interpretation',
      'modules.bazi': 'Geburtshoroskop',
      'modules.baziDesc': 'Entsperren Sie den Code des Lebens',
      'modules.fengshui': 'Feng Shui',
      'modules.fengshuiDesc': 'Harmonisieren Sie den Raum, entfalten Sie das Potenzial',
      'modules.tarot': 'Tarot',
      'modules.tarotDesc': 'Mystische und kluge Wahrsagerei',
      'modules.palm': 'Handlesen',
      'modules.palmDesc': 'Schicksal in den Handlinien',
      'modules.dream': 'Traumdeutung',
      'modules.dreamDesc': 'Verwandeln Sie Träume in Lebenserkenntnisse'
    },
    'pt': {
      appName: 'ZhiJi',
      'home.heroTitle': 'Sussurros de sabedoria antiga<br/>Guiando seu futuro',
      'home.heroSubtitle': '"Aqueles que conhecem os sinais, notam os movimentos sutis,<br/>são os primeiros a ver a fortune"<br/>Busque clareza, descubra seu caminho, encontre seu verdadeiro eu',
      'home.startBtn': 'Começar Exploração',
      'home.feature1': 'A qualquer hora e lugar',
      'home.feature2': '19+ Leituras',
      'home.feature3': 'Insights Precisos',
      'home.exploreServices': 'Explorar Serviços',
      'home.questionTitle': 'Tem perguntas? Me pergunte a qualquer hora',
      'home.questionSubtitle': 'ZhiJi combina sabedoria antiga com IA moderna para responder você',
      'home.askPlaceholder': 'É um bom momento para mudar de emprego?',
      'home.askBtn': 'Perguntar',
      'home.footer': '© 2026 ZhiJi · Sabedoria Antiga, Interpretação Moderna',
      'modules.bazi': 'Mapa Astral',
      'modules.baziDesc': 'Desbloqueie o código da vida',
      'modules.fengshui': 'Feng Shui',
      'modules.fengshuiDesc': 'Harmonize o espaço, libere o potencial',
      'modules.tarot': 'Tarô',
      'modules.tarotDesc': 'Adivinhação misteriosa e sábia',
      'modules.palm': 'Quiromancia',
      'modules.palmDesc': 'Destino nas linhas da mão',
      'modules.dream': 'Interpretação de Sonhos',
      'modules.dreamDesc': 'Transforme sonhos em conhecimentos vitais'
    },
    'ar': {
      appName: 'زيجي',
      'home.heroTitle': 'همسات الحكمة القديمة<br/>ترشدك إلى مستقبلك',
      'home.heroSubtitle': '"الذين يعرفون العلامات، يلاحظون الحركات الدقيقة،<br/>هم أول من يرى الحظ"<br/>ابحث عن الوضوح، اكتشف طريقك، اعثر على ذاتك الحقيقية',
      'home.startBtn': 'ابدأ الاستكشاف',
      'home.feature1': 'في أي وقت وأي مكان',
      'home.feature2': '19+ قراءات',
      'home.feature3': 'رؤى دقيقة',
      'home.exploreServices': 'استكشف الخدمات',
      'home.questionTitle': 'هل لديك أسئلة؟ اسألني في أي وقت',
      'home.questionSubtitle': 'زيجي يجمع بين الحكمة القديمة والذكاء الاصطناعي الحديث للإجابة عليك',
      'home.askPlaceholder': 'هل الوقت مناسب لتغيير الوظيفة؟',
      'home.askBtn': 'اسأل',
      'home.footer': '© 2026 زيجي · حكمة قديمة، تفسير حديث',
      'modules.bazi': 'مخطط الولادة',
      'modules.baziDesc': 'افتح رمز الحياة',
      'modules.fengshui': 'فنغ شوي',
      'modules.fengshuiDesc': 'حلل المساحة، اطلق العنان للإمكانات',
      'modules.tarot': 'التارو',
      'modules.tarotDesc': 'تنبؤ غامض وحكيم',
      'modules.palm': 'قراءة الكف',
      'modules.palmDesc': 'الم судьбы в линиях',
      'modules.dream': 'تفسير الأحلام',
      'modules.dreamDesc': 'حوّل الاحلام إلى رؤى حياتية'
    },
    'id': {
      appName: 'ZhiJi',
      'home.heroTitle': 'Bisikan kebijaksanaan kuno<br/>Membimbing masa depan Anda',
      'home.heroSubtitle': '"Mereka yang mengetahui tanda-tanda, memperhatikan gerakan halus,<br/>adalah yang pertama melihat keberuntungan"<br/>Cari kejelasan, temukan jalan Anda, temukan diri sejati Anda',
      'home.startBtn': 'Mulai Eksplorasi',
      'home.feature1': 'Kapan pun dan di mana pun',
      'home.feature2': '19+ Pembacaan',
      'home.feature3': 'Wawasan Akurat',
      'home.exploreServices': 'Jelajahi Layanan',
      'home.questionTitle': 'Punya pertanyaan? Tanyakan kapan saja',
      'home.questionSubtitle': 'ZhiJi menggabungkan kebijaksanaan kuno dengan AI modern untuk menjawab Anda',
      'home.askPlaceholder': 'Apakah sekarang saat yang tepat untuk换工作?',
      'home.askBtn': 'Tanya',
      'home.footer': '© 2026 ZhiJi · Kebijaksanaan Kuno, Interpretasi Modern',
      'modules.bazi': 'Bagan Kelahiran',
      'modules.baziDesc': 'Buka kode kehidupan',
      'modules.fengshui': 'Feng Shui',
      'modules.fengshuiDesc': 'Harmonisikan Ruang, Lepaskan Potensi',
      'modules.tarot': 'Tarot',
      'modules.tarotDesc': 'Peramalan misterius dan bijaksana',
      'modules.palm': 'Ilmu Telapak',
      'modules.palmDesc': 'Nasib di Garis Tangan',
      'modules.dream': 'Interpretasi Mimpi',
      'modules.dreamDesc': 'Ubah Mimpi menjadi Wawasan Hidup'
    },
    'ms': {
      appName: 'ZhiJi',
      'home.heroTitle': 'Bisikan kebijaksanaan kuno<br/>Membimbing masa depan anda',
      'home.heroSubtitle': '"Mereka yang mengetahui tanda-tanda, perhatikan gerakan halus,<br/>adalah yang pertama melihat nasib baik"<br/>Cari kejelasan, temui jalan anda, temui diri anda yang sebenar',
      'home.startBtn': 'Mula Eksplorasi',
      'home.feature1': 'Bilabila dan di manapun',
      'home.feature2': '19+ Pembacaan',
      'home.feature3': 'Panduan Tepat',
      'home.exploreServices': 'Terokai Perkhidmatan',
      'home.questionTitle': 'Ada soalan? Tanya bila-bila masa',
      'home.questionSubtitle': 'ZhiJi menggabungkan kebijaksanaan kuno dengan AI moden untuk menjawab anda',
      'home.askPlaceholder': 'Adakah masa yang sesuai untuk menukar kerja?',
      'home.askBtn': 'Tanya',
      'home.footer': '© 2026 ZhiJi · Kebijaksanaan Kuno, Tafsiran Moden',
      'modules.bazi': 'Carta Kelahiran',
      'modules.baziDesc': 'Buka kod kehidupan',
      'modules.fengshui': 'Feng Shui',
      'modules.fengshuiDesc': 'Harmoni Ruang, Lepaskan Potensi',
      'modules.tarot': 'Tarot',
      'modules.tarotDesc': 'Ramalan misteri dan bijaksana',
      'modules.palm': 'Ilmu Tapak',
      'modules.palmDesc': 'Nasib dalam Garisan Tangan',
      'modules.dream': 'Tafsiran Mimpi',
      'modules.dreamDesc': 'Tukar Mimpi kepada Panduan Hidup'
    }
  }
  const lang = currentLang.value
  return translations[lang]?.[key] || translations['en'][key] || key
}

// 使用计算属性
const heroTitle = computed(() => t('home.heroTitle'))
const heroSubtitle = computed(() => t('home.heroSubtitle'))
const startBtn = computed(() => t('home.startBtn'))
const feature1 = computed(() => t('home.feature1'))
const feature2 = computed(() => t('home.feature2'))
const feature3 = computed(() => t('home.feature3'))
const exploreServices = computed(() => t('home.exploreServices'))
const questionTitle = computed(() => t('home.questionTitle'))
const questionSubtitle = computed(() => t('home.questionSubtitle'))
const askPlaceholder = computed(() => t('home.askPlaceholder'))
const askBtn = computed(() => t('home.askBtn'))
const footer = computed(() => t('home.footer'))

const features = [
  { icon: '📊', titleKey: 'modules.bazi', descKey: 'modules.baziDesc', color: 'from-blue-500 to-cyan-400' },
  { icon: '🏠', titleKey: 'modules.fengshui', descKey: 'modules.fengshuiDesc', color: 'from-green-500 to-emerald-400' },
  { icon: '🃏', titleKey: 'modules.tarot', descKey: 'modules.tarotDesc', color: 'from-purple-500 to-violet-400' },
  { icon: '✋', titleKey: 'modules.palm', descKey: 'modules.palmDesc', color: 'from-orange-500 to-amber-400' },
  { icon: '🌙', titleKey: 'modules.dream', descKey: 'modules.dreamDesc', color: 'from-indigo-500 to-blue-400' }
]

function startChat(moduleId) {
  chatStore.setModule(moduleId)
  router.push(`/chat/${moduleId}`)
}

// 获取模块ID
function getModuleId(index) {
  const ids = ['bazi', 'fengshui', 'tarot', 'palm', 'dream']
  return ids[index] || 'bazi'
}
</script>

<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-bg">
        <div class="bg-orb bg-orb-1"></div>
        <div class="bg-orb bg-orb-2"></div>
        <div class="bg-orb bg-orb-3"></div>
      </div>
      
      <div class="hero-content">
        <div class="hero-logo">
          <img src="/logo.png" :alt="t('appName')" class="logo-img" />
        </div>
        <h1 class="hero-title" v-html="heroTitle"></h1>
        <p class="hero-subtitle" v-html="heroSubtitle"></p>
        <button class="start-btn" @click="startChat('bazi')">
          <span class="btn-text">{{ startBtn }}</span>
          <span class="btn-icon">→</span>
        </button>
      </div>
      
      <div class="hero-features">
        <div class="feature-item">
          <span class="feature-icon">⏰</span>
          <span>{{ feature1 }}</span>
        </div>
        <div class="feature-divider"></div>
        <div class="feature-item">
          <span class="feature-icon">📚</span>
          <span>{{ feature2 }}</span>
        </div>
        <div class="feature-divider"></div>
        <div class="feature-item">
          <span class="feature-icon">🎯</span>
          <span>{{ feature3 }}</span>
        </div>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="features-section">
      <h2 class="section-title">
        <span class="title-icon">✦</span>
        {{ exploreServices }}
        <span class="title-icon">✦</span>
      </h2>
      <div class="features-grid">
        <div 
          v-for="(feature, index) in features" 
          :key="feature.title"
          class="feature-card"
          :class="feature.color"
          @click="startChat(getModuleId(index))"
        >
          <div class="card-glow"></div>
          <div class="card-content">
            <span class="card-icon">{{ feature.icon }}</span>
            <h3 class="card-title">{{ t(feature.titleKey) }}</h3>
            <p class="card-desc">{{ t(feature.descKey) }}</p>
            <div class="card-arrow">→</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Question -->
    <section class="quick-question">
      <div class="question-box">
        <div class="question-decor question-decor-left">☯</div>
        <h2 class="question-title">{{ questionTitle }}</h2>
        <p class="question-subtitle">{{ questionSubtitle }}</p>
        <div class="question-input-wrap">
          <input 
            type="text" 
            :placeholder="askPlaceholder"
            class="question-input"
            @keyup.enter="startChat('bazi')"
          />
          <button class="ask-btn" @click="startChat('bazi')">
            <span>{{ askBtn }}</span>
            <span class="ask-icon">➤</span>
          </button>
        </div>
      </div>
    </section>
    
    <!-- Footer -->
    <footer class="footer">
      <p>{{ footer }}</p>
    </footer>
  </div>
</template>

<style scoped>
.home {
  flex: 1;
  overflow-y: auto;
  position: relative;
}

/* Hero Section */
.hero {
  position: relative;
  padding: 60px 20px 40px;
  text-align: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  animation: float 8s ease-in-out infinite;
}

.bg-orb-1 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  top: -100px;
  left: -50px;
}

.bg-orb-2 {
  width: 250px;
  height: 250px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  top: 50px;
  right: -80px;
  animation-delay: -3s;
}

.bg-orb-3 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #34d399, #10b981);
  bottom: -50px;
  left: 30%;
  animation-delay: -5s;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-logo {
  margin-bottom: 24px;
}

.logo-img {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(251, 191, 36, 0.3);
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 10px 40px rgba(251, 191, 36, 0.3); }
  50% { transform: scale(1.05); box-shadow: 0 15px 50px rgba(251, 191, 36, 0.5); }
}

.hero-title {
  font-size: 42px;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 0%, #fbbf24 50%, #fff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
  line-height: 1.3;
}

.hero-subtitle {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 36px;
  line-height: 1.8;
}

.start-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 40px;
  font-size: 17px;
  font-weight: 600;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  border-radius: 30px;
  color: #1a1a2e;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(251, 191, 36, 0.3);
}

.start-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 40px rgba(251, 191, 36, 0.5);
}

.btn-icon {
  transition: transform 0.3s;
}

.start-btn:hover .btn-icon {
  transform: translateX(4px);
}

.hero-features {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  margin-top: 50px;
  padding: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.feature-icon {
  font-size: 18px;
}

.feature-divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
}

/* Features Section */
.features-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.section-title {
  font-size: 24px;
  text-align: center;
  margin-bottom: 36px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.title-icon {
  color: #fbbf24;
  font-size: 18px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.feature-card {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 28px;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s ease;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--color-from), var(--color-to));
  opacity: 0;
  transition: opacity 0.4s;
}

.feature-card:hover {
  transform: translateY(-8px);
  border-color: rgba(251, 191, 36, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.feature-card:hover::before {
  opacity: 0.1;
}

.feature-card.from-blue-500 { --color-from: #3b82f6; --color-to: #22d3ee; }
.feature-card.from-green-500 { --color-from: #22c55e; --color-to: #34d399; }
.feature-card.from-purple-500 { --color-from: #a855f7; --color-to: #8b5cf6; }
.feature-card.from-orange-500 { --color-from: #f97316; --color-to: #fbbf24; }
.feature-card.from-indigo-500 { --color-from: #6366f1; --color-to: #60a5fa; }

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.4s;
  transform: rotate(30deg);
}

.feature-card:hover .card-glow {
  opacity: 1;
}

.card-content {
  position: relative;
  z-index: 1;
}

.card-icon {
  font-size: 42px;
  display: block;
  margin-bottom: 14px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
}

.card-title {
  font-size: 17px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 6px;
}

.card-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 16px;
}

.card-arrow {
  font-size: 20px;
  color: #fbbf24;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s;
}

.feature-card:hover .card-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* Quick Question */
.quick-question {
  max-width: 700px;
  margin: 50px auto;
  padding: 0 20px;
}

.question-box {
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 40px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.question-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #fbbf24, transparent);
}

.question-decor {
  position: absolute;
  font-size: 60px;
  opacity: 0.1;
}

.question-decor-left {
  top: 20px;
  left: 20px;
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.question-title {
  font-size: 24px;
  color: #fff;
  margin-bottom: 10px;
}

.question-subtitle {
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 28px;
}

.question-input-wrap {
  display: flex;
  gap: 12px;
  max-width: 500px;
  margin: 0 auto;
}

.question-input {
  flex: 1;
  padding: 16px 22px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 15px;
  transition: all 0.2s;
}

.question-input:focus {
  outline: none;
  border-color: rgba(251, 191, 36, 0.5);
  background: rgba(255, 255, 255, 0.1);
}

.question-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.ask-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 28px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  border-radius: 30px;
  color: #1a1a2e;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.ask-btn:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 20px rgba(251, 191, 36, 0.4);
}

.ask-icon {
  transition: transform 0.2s;
}

.ask-btn:hover .ask-icon {
  transform: translateX(3px);
}

/* Footer */
.footer {
  text-align: center;
  padding: 30px 20px;
  color: rgba(255, 255, 255, 0.3);
  font-size: 13px;
}

/* 响应式 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 28px;
  }
  
  .hero-subtitle br {
    display: none;
  }
  
  .hero-features {
    flex-direction: column;
    gap: 12px;
  }
  
  .feature-divider {
    width: 40px;
    height: 1px;
  }
  
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .feature-card {
    padding: 20px;
  }
  
  .card-icon {
    font-size: 32px;
  }
  
  .question-input-wrap {
    flex-direction: column;
  }
  
  .question-box {
    padding: 28px;
  }
}
</style>
