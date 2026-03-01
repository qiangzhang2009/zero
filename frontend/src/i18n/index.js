// 多语言配置文件
import { ref, computed } from 'vue'

// 支持的语言列表
export const supportedLanguages = [
  { code: 'zh-CN', name: '中文', nativeName: '中文', flag: '🇨🇳', dir: 'ltr' },
  { code: 'en', name: '英语', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'ja', name: '日语', nativeName: '日本語', flag: '🇯🇵', dir: 'ltr' },
  { code: 'ko', name: '韩语', nativeName: '한국어', flag: '🇰🇷', dir: 'ltr' },
  { code: 'es', name: '西班牙语', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'it', name: '意大利语', nativeName: 'Italiano', flag: '🇮🇹', dir: 'ltr' },
  { code: 'fr', name: '法语', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'de', name: '德语', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'pt', name: '葡萄牙语', nativeName: 'Português', flag: '🇧🇷', dir: 'ltr' },
  { code: 'ar', name: '阿拉伯语', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'id', name: '印度尼西亚语', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', dir: 'ltr' },
  { code: 'ms', name: '马来西亚语', nativeName: 'Bahasa Melayu', flag: '🇲🇾', dir: 'ltr' }
]

// 语言代码映射表
const languageCodeMap = {
  'zh': 'zh-CN', 'zh-CN': 'zh-CN', 'zh-TW': 'zh-CN', 'zh-HK': 'zh-CN',
  'en': 'en', 'en-US': 'en', 'en-GB': 'en',
  'ja': 'ja', 'ko': 'ko', 'es': 'es', 'it': 'it', 'fr': 'fr', 'de': 'de',
  'pt': 'pt', 'pt-BR': 'pt', 'pt-PT': 'pt', 'ar': 'ar', 'id': 'id', 'ms': 'ms'
}

// 检测系统语言
export function detectSystemLanguage() {
  const browserLang = navigator.language || navigator.userLanguage || 'zh-CN'
  const langCode = browserLang.split('-')[0].toLowerCase()
  
  if (languageCodeMap[browserLang]) return languageCodeMap[browserLang]
  if (languageCodeMap[langCode]) return languageCodeMap[langCode]
  
  return 'zh-CN' // 默认中文
}

// 获取语言信息
export function getLanguageByCode(code) {
  return supportedLanguages.find(lang => lang.code === code) || supportedLanguages[0]
}

// 翻译数据
const translations = {
  'zh-CN': {
    appName: '知几', appDesc: '古老智慧的低语，指引你的未来',
    features: '功能', contact: '联系我们', login: '登录', start: '开始',
    chat: { inputPlaceholder: '输入您的问题...', send: '发送', newChat: '新对话', guessYouWant: '猜你想问', tryAsking: '试试这样问：', loading: '倾听天机中...', selectModule: '选择功能', profile: '档案', uploadImage: '上传图片', voiceInput: '语音输入', copy: '复制', retry: '重试', copied: '已复制' },
    profile: { selectProfile: '选择档案', createProfile: '新建档案', editProfile: '修改档案', name: '姓名', birthday: '出生日期', birthTime: '出生时辰', gender: '性别', male: '男', female: '女', save: '保存', cancel: '取消', delete: '删除', confirmDelete: '确定要删除这个档案吗？', create: '创建', selectAvatar: '选择头像', required: '*', timePlaceholder: '请选择时辰' },
    imageUpload: { title: '📸 上传图片', invalidType: '请上传图片文件 (JPG, PNG, GIF, WebP)', fileTooLarge: '图片大小不能超过5MB', notSupported: '当前模块暂不支持图片上传', supportedModules: '支持模块：手相、塔罗、梦境、风水、星座', dropText: '点击或拖拽图片到这里', dropHint: '支持 JPG, PNG, GIF, WebP (最大5MB)', tipPalm: '💡 建议：上传清晰的手掌照片，掌心朝上，光线均匀', tipTarot: '💡 建议：确保塔罗牌图像清晰完整', tipDream: '💡 建议：可以上传与梦境相关的图片或符号', tipGeneral: '💡 建议：上传清晰的图片以获得更准确的解读', uploading: '上传中...', analyze: '开始解读' },
    home: { 
      heroTitle: '古老智慧的低语<br/>指引你的未来', 
      heroSubtitle: '"知几者，动之微，吉之先见者也"<br/>寻求清晰，开启命途，发现真我', 
      startBtn: '开始探索', 
      feature1: '随时随地', 
      feature2: '19+测算', 
      feature3: '精准解读', 
      exploreServices: '探索服务', 
      questionTitle: '有问题？随时问我', 
      questionSubtitle: '知几会结合古老智慧与现代AI为你解答',
      footer: '© 2026 知几 · 古老智慧，现代解读',
      features: { title: '调和空间，激发潜能', desc: '通过风水智慧，让您的居所或工作环境成为和谐与成功的源泉。', btn: '开始' }, bazi: { title: '八字解密，探寻天命', desc: '揭开人生的密码图谱。', btn: '开始' }, palm: { title: '掌纹中的命运轨迹', desc: '手相蕴藏着生命故事的蓝图。', btn: '开始' }, dream: { title: '让梦境化作生命启示', desc: '每个梦境都承载着讯息。', btn: '开始' }, community: '社区故事', askPlaceholder: '现在是换工作的好时机吗？', askBtn: '询问' },
    language: { title: '选择语言', current: '当前语言', switch: '切换语言' },
    today: '今天', yesterday: '昨天', back: '返回', home: '首页', loading: '加载中...', error: '抱歉，发生了错误，请稍后再试。', success: '成功',
    modules: { bazi: '八字', baziDesc: '生辰八字分析', fengshui: '风水', fengshuiDesc: '风水布局咨询', tarot: '塔罗', tarotDesc: '塔罗牌占卜', palm: '手相', palmDesc: '手相揭秘', dream: '梦境', dreamDesc: '周公解梦', zodiac: '星座', zodiacDesc: '星座运势', mbti: 'MBTI', mbtiDesc: '人格测试', draw: '抽签', drawDesc: '求签问卜', huangdi: '黄帝内经', huangdiDesc: '养生智慧', lifenumber: '生命灵数', lifenumberDesc: '数字能量', ziwei: '紫微斗数', ziweiDesc: '斗数命盘', zhouyi: '周易', zhouyiDesc: '易经占卜', naming: '起名', namingDesc: '姓名评测', marriage: '婚配', marriageDesc: '婚姻配对', company: '公司起名', companyDesc: '商业命名', luckyday: '吉日', luckydayDesc: '黄道吉日', digital: '数字命理', digitalDesc: '数字分析', daodejing: '道德经', daodejingDesc: '经典智慧', question: '问卦', questionDesc: '易经问卜' }
  },
  'en': {
    appName: 'ZhiJi', appDesc: 'Whispers of ancient wisdom, guiding your future',
    features: 'Features', contact: 'Contact', login: 'Login', start: 'Start',
    chat: { inputPlaceholder: 'Ask your question...', send: 'Send', newChat: 'New Chat', guessYouWant: 'You Might Ask', tryAsking: 'Try asking:', loading: 'Consulting the spirits...', selectModule: 'Select Feature', profile: 'Profile', uploadImage: 'Upload Image', voiceInput: 'Voice Input', copy: 'Copy', retry: 'Retry', copied: 'Copied' },
    profile: { selectProfile: 'Select Profile', createProfile: 'Create Profile', editProfile: 'Edit Profile', name: 'Name', birthday: 'Birthday', birthTime: 'Birth Time', gender: 'Gender', male: 'Male', female: 'Female', save: 'Save', cancel: 'Cancel', delete: 'Delete', confirmDelete: 'Are you sure you want to delete this profile?', create: 'Create', selectAvatar: 'Select Avatar', required: '*', timePlaceholder: 'Select Birth Time' },
    imageUpload: { title: '📸 Upload Image', invalidType: 'Please upload an image file (JPG, PNG, GIF, WebP)', fileTooLarge: 'Image size cannot exceed 5MB', notSupported: 'Current module does not support image upload', supportedModules: 'Supported: Palmistry, Tarot, Dreams, Feng Shui, Zodiac', dropText: 'Click or drag image here', dropHint: 'Supports JPG, PNG, GIF, WebP (max 5MB)', tipPalm: '💡 Tip: Upload a clear photo of your palm, facing up, with even lighting', tipTarot: '💡 Tip: Ensure the Tarot card image is clear and complete', tipDream: '💡 Tip: You can upload images or symbols related to your dream', tipGeneral: '💡 Tip: Upload clear images for more accurate readings', uploading: 'Uploading...', analyze: 'Start Reading' },
    home: { 
      heroTitle: 'Whispers of ancient wisdom<br/>Guiding your future', 
      heroSubtitle: '"Those who know the signs, notice the subtle movements,<br/>are the first to see fortune"<br/>Seek clarity, discover your path, find your true self', 
      startBtn: 'Start Exploring', 
      feature1: 'Anytime Anywhere', 
      feature2: '19+ Readings', 
      feature3: 'Accurate Insights', 
      exploreServices: 'Explore Services', 
      questionTitle: 'Have questions? Ask me anytime', 
      questionSubtitle: 'ZhiJi combines ancient wisdom with modern AI to answer you',
      footer: '© 2026 ZhiJi · Ancient Wisdom, Modern Interpretation',
      features: { title: 'Harmonize Space, Unleash Potential', desc: 'Through Feng Shui wisdom, make your home a source of harmony and success.', btn: 'Start' }, bazi: { title: 'Bazi Decoding, Explore Destiny', desc: 'Unlock the code of life.', btn: 'Start' }, palm: { title: 'Destiny in Palm Lines', desc: 'Palmistry holds the blueprint of your life story.', btn: 'Start' }, dream: { title: 'Turn Dreams into Life Insights', desc: 'Every dream carries a message.', btn: 'Start' }, community: 'Community Stories', askPlaceholder: 'Is now a good time to change jobs?', askBtn: 'Ask' },
    language: { title: 'Select Language', current: 'Current Language', switch: 'Switch Language' },
    today: 'Today', yesterday: 'Yesterday', back: 'Back', home: 'Home', loading: 'Loading...', error: 'Sorry, an error occurred. Please try again later.', success: 'Success',
    modules: { bazi: 'Bazi', baziDesc: 'Birth Chart Analysis', fengshui: 'Feng Shui', fengshuiDesc: 'Feng Shui Consultation', tarot: 'Tarot', tarotDesc: 'Tarot Divination', palm: 'Palmistry', palmDesc: 'Palm Reading', dream: 'Dream', dreamDesc: 'Dream Interpretation', zodiac: 'Zodiac', zodiacDesc: 'Horoscope', mbti: 'MBTI', mbtiDesc: 'Personality Test', draw: 'Divination', drawDesc: 'Fate Drawing', huangdi: 'Huangdi', huangdiDesc: 'Wellness Wisdom', lifenumber: 'Life Number', lifenumberDesc: 'Numerology', ziwei: 'Ziwei', ziweiDesc: 'Astrology', zhouyi: 'Zhouyi', zhouyiDesc: 'I Ching', naming: 'Naming', namingDesc: 'Name Analysis', marriage: 'Marriage', marriageDesc: 'Matchmaking', company: 'Company Name', companyDesc: 'Business Naming', luckyday: 'Lucky Day', luckydayDesc: 'Auspicous Dates', digital: 'Numerology', digitalDesc: 'Number Analysis', daodejing: 'Tao Te Ching', daodejingDesc: 'Classic Wisdom', question: 'Divination', questionDesc: 'I Ching Reading' }
  },
  'ja': {
    appName: '知幾', appDesc: '古からの知恵があなたの未来を導く',
    features: '機能', contact: 'お問い合わせ', login: 'ログイン', start: '始める',
    chat: { inputPlaceholder: '質問を入力...', send: '送信', newChat: '新規チャット', guessYouWant: 'おすすめの質問', tryAsking: '聞いてみる:', loading: '天機を開いています...', selectModule: '機能を選択', profile: 'プロフィール', uploadImage: '画像をアップロード', voiceInput: '音声入力', copy: 'コピー', retry: '再試行', copied: 'コピーしました' },
    profile: { selectProfile: 'プロフィールを選択', createProfile: '新規作成', editProfile: '編集', name: '名前', birthday: '生年月日', birthTime: '生まれの時間', gender: '性別', male: '男', female: '女', save: '保存', cancel: 'キャンセル', delete: '削除', confirmDelete: 'このプロフィールを削除しますか？', create: '作成', selectAvatar: 'アバターを選択', required: '*', timePlaceholder: '生まれの時間を選択' },
    imageUpload: { title: '📸 画像をアップロード', invalidType: '画像ファイルをアップロードしてください (JPG, PNG, GIF, WebP)', fileTooLarge: '画像サイズは5MBを超えることはできません', notSupported: '現在のモジュールは画像アップロードをサポートしていません', supportedModules: '対応：手相、タロット、夢、風水、星座', dropText: 'クリックまたは画像をここにドラッグ', dropHint: 'JPG, PNG, GIF, WebP対応 (最大5MB)', tipPalm: '💡 ヒント：清晰んな手の写真をアップロードしてください', tipTarot: '💡 ヒント：タロットカードの画像が清晰んで完全であることを確認してください', tipDream: '💡 ヒント：夢に関連する画像や記号をアップロードできます', tipGeneral: '💡 ヒント：清晰んな画像をアップロードすると、より正確な解釈が得られます', uploading: 'アップロード中...', analyze: '解釈を開始' },
    home: { 
      heroTitle: '古からの知恵の囁き<br/>あなたの未来を導く', 
      heroSubtitle: '"幾者 Bradley、微，吉之先見者也"<br/>明確さを求め、運命を発見し、真の自分を見つける', 
      startBtn: '探索を始める', 
      feature1: 'いつでもどこでも', 
      feature2: '19+占術', 
      feature3: '正確な解釈', 
      exploreServices: 'サービスを探索', 
      questionTitle: '質問がありますか？ 언제でも聞いてください', 
      questionSubtitle: '知幾は古代の知恵と現代AIを組み合わせてあなたにお答えします',
      footer: '© 2026 知幾 · 古代の知恵、現代の解釈',
      features: { title: '空間を調和させ、潜在能力を引き出す', desc: '風水の知恵を通じて、あなたの家を調和と成功の源にします。', btn: '始める' }, bazi: { title: '八字を解く、運命を探る', desc: '人生のマスターコードを明らかにする。', btn: '始める' }, palm: { title: '掌紋の運命', desc: '手相は人生的故事の青写真を持っています。', btn: '始める' }, dream: { title: '夢を人生の洞察に変える', desc: 'すべての夢はメッセージを持っています。', btn: '始める' }, community: 'コミュニティストーリー', askPlaceholder: '今、仕事を変えるべきですか？', askBtn: '聞く' },
    language: { title: '言語を選択', current: '現在の言語', switch: '言語を切り替え' },
    today: '今日', yesterday: '昨日', back: '戻る', home: 'ホーム', loading: '読み込み中...', error: 'エラーが発生しました。', success: '成功',
    modules: { bazi: '八字', baziDesc: '出生八字分析', fengshui: '风水', fengshuiDesc: '风水コンサルティング', tarot: 'タロット', tarotDesc: 'タロット占術', palm: '手相', palmDesc: '手相診断', dream: '夢', dreamDesc: '夢解釈', zodiac: '星座', zodiacDesc: '星座運勢', mbti: 'MBTI', mbtiDesc: '性格テスト', draw: 'おみくじ', drawDesc: '占いです', huangdi: '黄帝内経', huangdiDesc: '養生智慧', lifenumber: '生命数', lifenumberDesc: '数秘術', ziwei: '紫微斗数', ziweiDesc: '命盤分析', zhouyi: '周易', zhouyiDesc: '易経占術', naming: '命名', namingDesc: '姓名分析', marriage: '婚配', marriageDesc: '相性診断', company: '会社名', companyDesc: 'ビジネス命名', luckyday: '吉日', luckydayDesc: '開運日', digital: '数字命理', digitalDesc: '数字分析', daodejing: '道德経', daodejingDesc: '古典智慧', question: '占卦', questionDesc: '易経占断' }
  },
  'ko': {
    appName: '지기', appDesc: '고대의 지혜가 당신의 미래를 이끕니다',
    features: '기능', contact: '문의하기', login: '로그인', start: '시작',
    chat: { inputPlaceholder: '질문을 입력하세요...', send: '보내기', newChat: '새 채팅', guessYouWant: '추천 질문', tryAsking: '다양한 질문:', loading: '천기를 듣고 있습니다...', selectModule: '기능 선택', profile: '프로필', uploadImage: '이미지 업로드', voiceInput: '음성 입력', copy: '복사', retry: '다시 시도', copied: '복사됨' },
    profile: { selectProfile: '프로필 선택', createProfile: '새 프로필', editProfile: '프로필 수정', name: '이름', birthday: '생년월일', birthTime: '태어난 시간', gender: '성별', male: '남', female: '여', save: '저장', cancel: '취소', delete: '삭제', confirmDelete: '이 프로필을 삭제하시겠습니까?', create: '만들기', selectAvatar: '아바타 선택', required: '*', timePlaceholder: '태어난 시간 선택' },
    imageUpload: { title: '📸 이미지 업로드', invalidType: '이미지 파일을 업로드하세요 (JPG, PNG, GIF, WebP)', fileTooLarge: '이미지 크기는 5MB를 초과할 수 없습니다', notSupported: '현재 모듈은 이미지 업로드를 지원하지 않습니다', supportedModules: '지원: 손금, 타로, 꿈, 풍수, 별자리', dropText: '클릭하거나 이미지를 여기로 드래그', dropHint: 'JPG, PNG, GIF, WebP 지원 (최대 5MB)', tipPalm: '💡 팁: 명확한 손바닥 사진을アップロードしてください', tipTarot: '💡 팁: 타로 카드 이미지가清晰하고完整한지 확인하세요', tipDream: '💡 팁: 꿈과 관련된 이미지를 업로드할 수 있습니다', tipGeneral: '💡 팁: 더 정확한 해석을 위해清晰的 이미지를 업로드하세요', uploading: '업로드 중...', analyze: '해석 시작' },
    home: { 
      heroTitle: '고대 지혜의 속삭임<br/>당신의 미래를 이끈다', 
      heroSubtitle: '"几者 Bradley、微, 吉之先見者也"<br/>명확성을 추구하고, 운명을 발견하고, 진정한 나를 찾으세요', 
      startBtn: '탐험 시작', 
      feature1: '언제 어디서나', 
      feature2: '19+ 占術', 
      feature3: '정확한 해설', 
      exploreServices: '서비스 탐색', 
      questionTitle: '질문이 있으신가요? 언제든 물어보세요', 
      questionSubtitle: '지기는 고대 지혜와 현대 AI를 결합하여 당신에게 답변합니다',
      footer: '© 2026지기 · 고대 지혜, 현대적 해석',
      features: { title: '공간을 조화시키고 잠재력을 끌어낸다', desc: '풍수의 지혜를 통해 당신의 집을 조화와 성공의 원천으로 만듭니다.', btn: '시작' }, bazi: { title: '팔자 解, 운명 탐구', desc: '인생의 비밀이 담긴 코드을 밝히다.', btn: '시작' }, palm: { title: '손금의 운명', desc: '수상은 삶 이야기의 청사진을 담고 있습니다.', btn: '시작' }, dream: { title: ' dreams을 삶의 통찰력으로', desc: '모든 꿈은 메시지를 담고 있습니다.', btn: '시작' }, community: '커뮤니티 스토리', askPlaceholder: '지금 직장을 바꾸는 것이 좋은가요?', askBtn: '묻기' },
    language: { title: '언어 선택', current: '현재 언어', switch: '언어 변경' },
    today: '오늘', yesterday: '어제', back: '뒤로', home: '홈', loading: '로딩 중...', error: '오류가 발생했습니다.', success: '성공',
    modules: { bazi: '팔자', baziDesc: '생辰팔자 분석', fengshui: '풍수', fengshuiDesc: '풍수 컨설팅', tarot: '타로', tarotDesc: '타로 점술', palm: '수상', palmDesc: '수상rivistry', dream: '꿈', dreamDesc: '꿈해석', zodiac: '별자리', zodiacDesc: '운세', mbti: 'MBTI', mbtiDesc: '성격 테스트', draw: '점签', drawDesc: '운세 뽑기', huangdi: '황제내경', huangdiDesc: '건강 지혜', lifenumber: '생명수', lifenumberDesc: '수비술', ziwei: '자미투수', ziweiDesc: '명판 분석', zhouyi: '주역', zhouyiDesc: '주역 점술', naming: '이름짓기', namingDesc: '성명 분석', marriage: '혼配', marriageDesc: '궁합', company: '회사이름', companyDesc: '비즈니스 이름짓기', luckyday: '길일', luckydayDesc: '복스러운 날', digital: '숫자역리', digitalDesc: '숫자 분석', daodejing: '도덕경', daodejingDesc: '고전 지혜', question: '점卦', questionDesc: '주역 점치기' }
  },
  'es': {
    appName: 'ZhiJi', appDesc: 'Susurros de sabiduría antigua guiando tu futuro',
    features: 'Funciones', contact: 'Contacto', login: 'Iniciar sesión', start: 'Comenzar',
    chat: { inputPlaceholder: 'Escribe tu pregunta...', send: 'Enviar', newChat: 'Nuevo chat', guessYouWant: 'Quizás quieras preguntar', tryAsking: 'Intenta preguntar:', loading: 'Consultando los espíritus...', selectModule: 'Seleccionar función', profile: 'Perfil', uploadImage: 'Subir imagen', voiceInput: 'Entrada de voz', copy: 'Copiar', retry: 'Reintentar', copied: 'Copiado' },
    profile: { selectProfile: 'Seleccionar perfil', createProfile: 'Crear perfil', editProfile: 'Editar perfil', name: 'Nombre', birthday: 'Fecha de nacimiento', birthTime: 'Hora de nacimiento', gender: 'Género', male: 'Hombre', female: 'Mujer', save: 'Guardar', cancel: 'Cancelar', delete: 'Eliminar', confirmDelete: '¿Estás seguro de que deseas eliminar este perfil?', create: 'Crear', selectAvatar: 'Seleccionar avatar', required: '*', timePlaceholder: 'Seleccionar hora de nacimiento' },
    imageUpload: { title: '📸 Subir imagen', invalidType: 'Por favor sube un archivo de imagen (JPG, PNG, GIF, WebP)', fileTooLarge: 'El tamaño de la imagen no puede exceder 5MB', notSupported: 'El módulo actual no soporta subida de imágenes', supportedModules: 'Soportado: Quiromancia, Tarot, Sueños, Feng Shui, Zodiaco', dropText: 'Haz clic o arrastra la imagen aquí', dropHint: 'Soporta JPG, PNG, GIF, WebP (máx 5MB)', tipPalm: '💡 Sugerencia: Sube una foto clara de tu palma', tipTarot: '💡 Sugerencia: Asegúrate de que la imagen del tarot sea clara', tipDream: '💡 Sugerencia: Puedes subir imágenes relacionadas con tu sueño', tipGeneral: '💡 Sugerencia: Sube imágenes claras para lecturas más precisas', uploading: 'Subiendo...', analyze: 'Comenzar lectura' },
    home: { 
      heroTitle: 'Susurros de sabiduría antigua<br/>Guiando tu futuro', 
      heroSubtitle: '"Aquellos que conocen las señales, notan los movimientos sutiles,<br/>son los primeros en ver la fortuna"<br/>Busca claridad, descubre tu camino, encuentra tu verdadero yo', 
      startBtn: 'Comenzar Exploración', 
      feature1: 'En cualquier momento y lugar', 
      feature2: '19+ Lecturas', 
      feature3: 'Interpretaciones precisas', 
      exploreServices: 'Explorar Servicios', 
      questionTitle: '¿Tienes preguntas? Pregúntame cuando quieras', 
      questionSubtitle: 'ZhiJi combina sabiduría antigua con IA moderna para responderte',
      footer: '© 2026 ZhiJi · Sabiduría Antigua, Interpretación Moderna',
      features: { title: 'Armoniza el espacio, libera el potencial', desc: 'A través de la sabiduría del Feng Shui, haz de tu hogar una fuente de armonía y éxito.', btn: 'Comenzar' }, bazi: { title: 'Descifra el Bazi, Explora el Destino', desc: 'Desbloquea el código de la vida.', btn: 'Comenzar' }, palm: { title: 'Destino en las líneas de la mano', desc: 'La quiromancia contiene el blueprint de tu historia.', btn: 'Comenzar' }, dream: { title: 'Transforma los sueños en conocimientos vitales', desc: 'Cada sueño porta un mensaje.', btn: 'Comenzar' }, community: 'Historias de la comunidad', askPlaceholder: '¿Es buen momento para cambiar de trabajo?', askBtn: 'Preguntar' },
    language: { title: 'Seleccionar idioma', current: 'Idioma actual', switch: 'Cambiar idioma' },
    today: 'Hoy', yesterday: 'Ayer', back: 'Volver', home: 'Inicio', loading: 'Cargando...', error: 'Lo sentimos, ocurrió un error.', success: 'Éxito',
    modules: { bazi: 'Bazi', baziDesc: 'Análisis del carta astral', fengshui: 'Feng Shui', fengshuiDesc: 'Consultoría Feng Shui', tarot: 'Tarot', tarotDesc: 'Adivinación Tarot', palm: 'Quiromancia', palmDesc: 'Lectura de mano', dream: 'Sueños', dreamDesc: 'Interpretación de sueños', zodiac: 'Zodiaco', zodiacDesc: 'Horóscopo', mbti: 'MBTI', mbtiDesc: 'Test de personalidad', draw: 'Sorteo', drawDesc: 'Adivinación', huangdi: 'Huangdi', huangdiDesc: 'Sabiduría Wellness', lifenumber: 'Número de vida', lifenumberDesc: 'Numerología', ziwei: 'Ziwei', ziweiDesc: 'Astrología china', zhouyi: 'Zhouyi', zhouyiDesc: 'I Ching', naming: 'Nombramiento', namingDesc: 'Análisis de nombre', marriage: 'Matrimonio', marriageDesc: 'Compatibilidad', company: 'Nombre empresa', companyDesc: 'Nombres comerciales', luckyday: 'Día afortunado', luckydayDesc: 'Fechas favorables', digital: 'Numerología', digitalDesc: 'Análisis de números', daodejing: 'Tao Te Ching', daodejingDesc: 'Sabiduría clásica', question: 'Adivinación', questionDesc: 'Lectura I Ching' }
  },
  'it': {
    appName: 'ZhiJi', appDesc: 'Sussurri di saggezza antica guidano il tuo futuro',
    features: 'Funzioni', contact: 'Contatti', login: 'Accedi', start: 'Inizia',
    chat: { inputPlaceholder: 'Scrivi la tua domanda...', send: 'Invia', newChat: 'Nuova chat', guessYouWant: 'Potresti chiedere', tryAsking: 'Prova a chiedere:', loading: 'Consultando gli spiriti...', selectModule: 'Seleziona funzione', profile: 'Profilo', uploadImage: 'Carica immagine', voiceInput: 'Input vocale', copy: 'Copia', retry: 'Riprova', copied: 'Copiato' },
    profile: { selectProfile: 'Seleziona profilo', createProfile: 'Crea profilo', editProfile: 'Modifica profilo', name: 'Nome', birthday: 'Data di nascita', birthTime: 'Ora di nascita', gender: 'Genere', male: 'Maschio', female: 'Femmina', save: 'Salva', cancel: 'Annulla', delete: 'Elimina', confirmDelete: 'Sei sicuro di voler eliminare questo profilo?', create: 'Crea', selectAvatar: 'Seleziona avatar', required: '*', timePlaceholder: 'Seleziona ora di nascita' },
    imageUpload: { title: '📸 Carica immagine', invalidType: 'Per favore carica un file immagine (JPG, PNG, GIF, WebP)', fileTooLarge: 'La dimensione dell\'immagine non può superare 5MB', notSupported: 'Il modulo corrente non supporta il caricamento di immagini', supportedModules: 'Supportato: Chiromanzia, Tarot, Sogni, Feng Shui, Zodiaco', dropText: 'Clicca o trascina l\'immagine qui', dropHint: 'Supporta JPG, PNG, GIF, WebP (max 5MB)', tipPalm: '💡 Suggerimento: Carica una foto chiara del tuo palmo', tipTarot: '💡 Suggerimento: Assicurati che l\'immagine della carta tarot sia chiara', tipDream: '💡 Suggerimento: Puoi caricare immagini relative al tuo sogno', tipGeneral: '💡 Suggerimento: Carica immagini chiare per letture più accurate', uploading: 'Caricamento...', analyze: 'Inizia lettura' },
    home: { features: { title: 'Armonizza lo spazio', desc: 'Attraverso la saggezza del Feng Shui, rendi la tua vita fonte di armonia e successo.', btn: 'Inizia' }, bazi: { title: 'Decodifica il Bazi', desc: 'Sblocca il codice della vita.', btn: 'Inizia' }, palm: { title: 'Destino nelle linee', desc: 'La chiromanzia contiene il progetto della tua storia.', btn: 'Inizia' }, dream: { title: 'Trasforma i sogni', desc: 'Ogni sogno porta un messaggio.', btn: 'Inizia' }, community: 'Storie della comunità', askPlaceholder: 'È un buon momento per cambiare lavoro?', askBtn: 'Chiedi' },
    language: { title: 'Seleziona lingua', current: 'Lingua attuale', switch: 'Cambia lingua' },
    today: 'Oggi', yesterday: 'Ieri', back: 'Indietro', home: 'Home', loading: 'Caricamento...', error: 'Si è verificato un errore.', success: 'Successo',
    modules: { bazi: 'Bazi', baziDesc: 'Analisi della carta natales', fengshui: 'Feng Shui', fengshuiDesc: 'Consulenza Feng Shui', tarot: 'Tarocchi', tarotDesc: 'Divinazione Tarot', palm: 'Chiromanzia', palmDesc: 'Lettura della mano', dream: 'Sogni', dreamDesc: 'Interpretazione dei sogni', zodiac: 'Zodiaco', zodiacDesc: 'Oroscopo', mbti: 'MBTI', mbtiDesc: 'Test di personalità', draw: 'Divinazione', drawDesc: 'Sorteggio', huangdi: 'Huangdi', huangdiDesc: 'Sapienza Benessere', lifenumber: 'Numero della vita', lifenumberDesc: 'Numerologia', ziwei: 'Ziwei', ziweiDesc: 'Astrologia cinese', zhouyi: 'Zhouyi', zhouyiDesc: 'I Ching', naming: 'Nomismo', namingDesc: 'Analisi del nome', marriage: 'Matrimonio', marriageDesc: 'Compatibilità', company: 'Nome azienda', companyDesc: 'Nomi commerciali', luckyday: 'Giorno fortunato', luckydayDesc: 'Date favorevoli', digital: 'Numerologia', digitalDesc: 'Analisi numerica', daodejing: 'Tao Te Ching', daodejingDesc: 'Sapienza classica', question: 'Divinazione', questionDesc: 'Lettura I Ching' }
  },
  'fr': {
    appName: 'ZhiJi', appDesc: 'Les murmures de la sagesse ancienne guident votre avenir',
    features: 'Fonctionnalités', contact: 'Contact', login: 'Connexion', start: 'Commencer',
    chat: { inputPlaceholder: 'Posez votre question...', send: 'Envoyer', newChat: 'Nouveau chat', guessYouWant: 'Vous pourriez demander', tryAsking: 'Essayez de demander:', loading: 'Consultation des esprits...', selectModule: 'Sélectionner fonction', profile: 'Profil', uploadImage: 'Télécharger image', voiceInput: 'Entrée vocale', copy: 'Copier', retry: 'Réessayer', copied: 'Copié' },
    profile: { selectProfile: 'Sélectionner profil', createProfile: 'Créer profil', editProfile: 'Modifier profil', name: 'Nom', birthday: 'Date de naissance', birthTime: 'Heure de naissance', gender: 'Genre', male: 'Homme', female: 'Femme', save: 'Sauvegarder', cancel: 'Annuler', delete: 'Supprimer', confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce profil?', create: 'Créer', selectAvatar: 'Sélectionner avatar', required: '*', timePlaceholder: 'Sélectionner heure de naissance' },
    imageUpload: { title: '📸 Télécharger image', invalidType: 'Veuillez télécharger un fichier image (JPG, PNG, GIF, WebP)', fileTooLarge: 'La taille de l\'image ne peut pas dépasser 5MB', notSupported: 'Le module actuel ne supporte pas le téléchargement d\'images', supportedModules: 'Supporté: Chiromancie, Tarot, Rêves, Feng Shui, Zodiaque', dropText: 'Cliquez ou glissez l\'image ici', dropHint: 'Supporte JPG, PNG, GIF, WebP (max 5MB)', tipPalm: '💡 Conseil: Téléchargez une photo claire de votre paume', tipTarot: '💡 Conseil: Assurez-vous que l\'image de la carte tarot est claire', tipDream: '💡 Conseil: Vous pouvez télécharger des images liées à votre rêve', tipGeneral: '💡 Conseil: Téléchargez des images claires pour des lectures plus précises', uploading: 'Téléchargement...', analyze: 'Commencer lecture' },
    home: { features: { title: 'Harmonisez l\'espace', desc: 'Par la sagesse du Feng Shui, faites de votre vie une source d\'harmonie et de succès.', btn: 'Commencer' }, bazi: { title: 'Décryptez le Bazi', desc: 'Déverrouillez le code de la vie.', btn: 'Commencer' }, palm: { title: 'Destin dans les lignes', desc: 'La chiromancie contient le blueprint de votre histoire.', btn: 'Commencer' }, dream: { title: 'Transformez les rêves', desc: 'Chaque rêve porte un message.', btn: 'Commencer' }, community: 'Histoires de la communauté', askPlaceholder: 'Est-ce un bon moment pour changer de travail?', askBtn: 'Demander' },
    language: { title: 'Sélectionner langue', current: 'Langue actuelle', switch: 'Changer langue' },
    today: 'Aujourd\'hui', yesterday: 'Hier', back: 'Retour', home: 'Accueil', loading: 'Chargement...', error: 'Désolé, une erreur s\'est produite.', success: 'Succès',
    modules: { bazi: 'Bazi', baziDesc: 'Analyse du thème astral', fengshui: 'Feng Shui', fengshuiDesc: 'Conseil Feng Shui', tarot: 'Tarot', tarotDesc: 'Divination Tarot', palm: 'Chiromancie', palmDesc: 'Lecture de la main', dream: 'Rêves', dreamDesc: 'Interprétation des rêves', zodiac: 'Zodiaque', zodiacDesc: 'Horoscope', mbti: 'MBTI', mbtiDesc: 'Test de personnalité', draw: 'Tirage', drawDesc: 'Divination', huangdi: 'Huangdi', huangdiDesc: 'Sagesses du bien-être', lifenumber: 'Numéro de vie', lifenumberDesc: 'Numérologie', ziwei: 'Ziwei', ziweiDesc: 'Astrologie chinoise', zhouyi: 'Zhouyi', zhouyiDesc: 'I Ching', naming: 'Nommmage', namingDesc: 'Analyse du nom', marriage: 'Mariage', marriageDesc: 'Compatibilité', company: 'Nom d\'entreprise', companyDesc: 'Nommage commercial', luckyday: 'Jour chanceux', luckydayDesc: 'Dates favorables', digital: 'Numérologie', digitalDesc: 'Analyse numérique', daodejing: 'Tao Te Ching', daodejingDesc: 'Sagesse classique', question: 'Divination', questionDesc: 'Lecture I Ching' }
  },
  'de': {
    appName: 'ZhiJi', appDesc: 'Flüstern der alten Weisheit lenkt Ihre Zukunft',
    features: 'Funktionen', contact: 'Kontakt', login: 'Anmelden', start: 'Starten',
    chat: { inputPlaceholder: 'Stellen Sie Ihre Frage...', send: 'Senden', newChat: 'Neuer Chat', guessYouWant: 'Sie könnten fragen', tryAsking: 'Versuchen Sie zu fragen:', loading: 'Konsultiere die Geister...', selectModule: 'Funktion auswählen', profile: 'Profil', uploadImage: 'Bild hochladen', voiceInput: 'Spracheingabe', copy: 'Kopieren', retry: 'Wiederholen', copied: 'Kopiert' },
    profile: { selectProfile: 'Profil auswählen', createProfile: 'Profil erstellen', editProfile: 'Profil bearbeiten', name: 'Name', birthday: 'Geburtsdatum', birthTime: 'Geburtszeit', gender: 'Geschlecht', male: 'Männlich', female: 'Weiblich', save: 'Speichern', cancel: 'Abbrechen', delete: 'Löschen', confirmDelete: 'Sind Sie sicher, dass Sie dieses Profil löschen möchten?', create: 'Erstellen', selectAvatar: 'Avatar auswählen', required: '*', timePlaceholder: 'Geburtszeit auswählen' },
    imageUpload: { title: '📸 Bild hochladen', invalidType: 'Bitte laden Sie eine Bilddatei hoch (JPG, PNG, GIF, WebP)', fileTooLarge: 'Die Bildgröße darf 5MB nicht überschreiten', notSupported: 'Das aktuelle Modul unterstützt keinen Bildupload', supportedModules: 'Unterstützt: Handlesen, Tarot, Träume, Feng Shui, Tierkreis', dropText: 'Klicken oder Bild hierher ziehen', dropHint: 'Unterstützt JPG, PNG, GIF, WebP (max 5MB)', tipPalm: '💡 Tipp: Laden Sie ein klares Foto Ihrer Handfläche hoch', tipTarot: '💡 Tipp: Stellen Sie sicher, dass das Tarot-Bild klar ist', tipDream: '💡 Tipp: Sie können Bilder hochladen, die mit Ihrem Traum zusammenhängen', tipGeneral: '💡 Tipp: Laden Sie klare Bilder für genauere Lesungen hoch', uploading: 'Hochladen...', analyze: 'Lesung starten' },
    home: { features: { title: 'Harmonisieren Sie den Raum', desc: 'Durch die Weisheit des Feng Shui machen Sie Ihr Leben zu einer Quelle von Harmonie und Erfolg.', btn: 'Starten' }, bazi: { title: 'Entschlüsseln Sie das Bazi', desc: 'Entsperren Sie den Code des Lebens.', btn: 'Starten' }, palm: { title: 'Schicksal in den Linien', desc: 'Die Handlesen enthält den Grundriss Ihrer Geschichte.', btn: 'Starten' }, dream: { title: 'Verwandeln Sie Träume', desc: 'Jeder Traum trägt eine Botschaft.', btn: 'Starten' }, community: 'Community-Geschichten', askPlaceholder: 'Ist jetzt ein guter Zeitpunkt, den Job zu wechseln?', askBtn: 'Fragen' },
    language: { title: 'Sprache auswählen', current: 'Aktuelle Sprache', switch: 'Sprache wechseln' },
    today: 'Heute', yesterday: 'Gestern', back: 'Zurück', home: 'Startseite', loading: 'Laden...', error: 'Entschuldigung, ein Fehler ist aufgetreten.', success: 'Erfolg',
    modules: { bazi: 'Bazi', baziDesc: 'Geburts-Horoskop Analyse', fengshui: 'Feng Shui', fengshuiDesc: 'Feng Shui Beratung', tarot: 'Tarot', tarotDesc: 'Tarot Wahrsagerei', palm: 'Handlesen', palmDesc: 'Handleserei', dream: 'Träume', dreamDesc: 'Traumdeutung', zodiac: 'Tierkreis', zodiacDesc: 'Horoskop', mbti: 'MBTI', mbtiDesc: 'Persönlichkeitstest', draw: 'Wahrsagerei', drawDesc: 'Losziehung', huangdi: 'Huangdi', huangdiDesc: 'Wellness-Weisheit', lifenumber: 'Lebenszahl', lifenumberDesc: 'Numerologie', ziwei: 'Ziwei', ziweiDesc: 'Chinesische Astrologie', zhouyi: 'Zhouyi', zhouyiDesc: 'I Ching', naming: 'Benennung', namingDesc: 'Namenanalyse', marriage: 'Ehe', marriageDesc: 'Kompatibilität', company: 'Firmenname', companyDesc: 'Geschäftsbenennung', luckyday: 'Glückstag', luckydayDesc: 'Günstige Termine', digital: 'Numerologie', digitalDesc: 'Zahlenanalyse', daodejing: 'Tao Te Ching', daodejingDesc: 'Klassische Weisheit', question: 'Wahrsagerei', questionDesc: 'I Ching Lesung' }
  },
  'pt': {
    appName: 'ZhiJi', appDesc: 'Sussurros de sabedoria antiga guiam seu futuro',
    features: 'Funcionalidades', contact: 'Contato', login: 'Entrar', start: 'Começar',
    chat: { inputPlaceholder: 'Faça sua pergunta...', send: 'Enviar', newChat: 'Novo chat', guessYouWant: 'Você pode perguntar', tryAsking: 'Tente perguntar:', loading: 'Consultando os espíritos...', selectModule: 'Selecionar função', profile: 'Perfil', uploadImage: 'Enviar imagem', voiceInput: 'Entrada de voz', copy: 'Copiar', retry: 'Tentar novamente', copied: 'Copiado' },
    profile: { selectProfile: 'Selecionar perfil', createProfile: 'Criar perfil', editProfile: 'Editar perfil', name: 'Nome', birthday: 'Data de nascimento', birthTime: 'Hora de nascimento', gender: 'Gênero', male: 'Masculino', female: 'Feminino', save: 'Salvar', cancel: 'Cancelar', delete: 'Excluir', confirmDelete: 'Tem certeza de que deseja excluir este perfil?', create: 'Criar', selectAvatar: 'Selecionar avatar', required: '*', timePlaceholder: 'Selecionar hora de nascimento' },
    imageUpload: { title: '📸 Enviar imagem', invalidType: 'Por favor envie um arquivo de imagem (JPG, PNG, GIF, WebP)', fileTooLarge: 'O tamanho da imagem não pode exceder 5MB', notSupported: 'O módulo atual não suporta envio de imagens', supportedModules: 'Suportado: Quiromancia, Tarot, Sonhos, Feng Shui, Zodíaco', dropText: 'Clique ou arraste a imagem aqui', dropHint: 'Suporta JPG, PNG, GIF, WebP (máx 5MB)', tipPalm: '💡 Dica: Envie uma foto clara da sua palma', tipTarot: '💡 Dica: Certifique-se de que a imagem do tarot está clara', tipDream: '💡 Dica: Você pode enviar imagens relacionadas ao seu sonho', tipGeneral: '💡 Dica: Envie imagens claras para leituras mais precisas', uploading: 'Enviando...', analyze: 'Iniciar leitura' },
    home: { features: { title: 'Harmonize o espaço', desc: 'Através da sabedoria do Feng Shui, faça de sua vida uma fonte de harmonia e sucesso.', btn: 'Começar' }, bazi: { title: 'Decodifique o Bazi', desc: 'Desbloqueie o código da vida.', btn: 'Começar' }, palm: { title: 'Destino nas linhas', desc: 'A quiromancia contém o blueprint da sua história.', btn: 'Começar' }, dream: { title: 'Transforme sonhos', desc: 'Cada sonho carrega uma mensagem.', btn: 'Começar' }, community: 'Histórias da comunidade', askPlaceholder: 'É um bom momento para mudar de emprego?', askBtn: 'Perguntar' },
    language: { title: 'Selecionar idioma', current: 'Idioma atual', switch: 'Mudar idioma' },
    today: 'Hoje', yesterday: 'Ontem', back: 'Voltar', home: 'Início', loading: 'Carregando...', error: 'Desculpe, ocorreu um erro.', success: 'Sucesso',
    modules: { bazi: 'Bazi', baziDesc: 'Análise do mapa astral', fengshui: 'Feng Shui', fengshuiDesc: 'Consultoria Feng Shui', tarot: 'Tarô', tarotDesc: 'Adivinhação Tarot', palm: 'Quiromancia', palmDesc: 'Leitura da mão', dream: 'Sonhos', dreamDesc: 'Interpretação de sonhos', zodiac: 'Zodíaco', zodiacDesc: 'Horóscopo', mbti: 'MBTI', mbtiDesc: 'Teste de personalidade', draw: 'Sorteio', drawDesc: 'Adivinhação', huangdi: 'Huangdi', huangdiDesc: 'Sabedoria Wellness', lifenumber: 'Número da vida', lifenumberDesc: 'Numerologia', ziwei: 'Ziwei', ziweiDesc: 'Astrologia chinesa', zhouyi: 'Zhouyi', zhouyiDesc: 'I Ching', naming: 'Nomeação', namingDesc: 'Análise do nome', marriage: 'Casamento', marriageDesc: 'Compatibilidade', company: 'Nome da empresa', companyDesc: 'Nomeação comercial', luckyday: 'Dia de sorte', luckydayDesc: 'Datas favoráveis', digital: 'Numerologia', digitalDesc: 'Análise numérica', daodejing: 'Tao Te Ching', daodejingDesc: 'Sabedoria clássica', question: 'Adivinhação', questionDesc: 'Leitura I Ching' }
  },
  'ar': {
    appName: 'زيجي', appDesc: 'همسات الحكمة القديمة ترشدك إلى مستقبلك',
    features: 'الميزات', contact: 'اتصل بنا', login: 'تسجيل الدخول', start: 'ابدأ',
    chat: { inputPlaceholder: 'اكتب سؤالك...', send: 'إرسال', newChat: 'محادثة جديدة', guessYouWant: 'يمكنك أن تسأل', tryAsking: 'حاول أن تسأل:', loading: 'استشارة الارواح...', selectModule: 'اختر الوظيفة', profile: 'الملف الشخصي', uploadImage: 'رفع صورة', voiceInput: 'ادخال صوتي', copy: 'نسخ', retry: 'إعادة المحاولة', copied: 'تم النسخ' },
    profile: { selectProfile: 'اختر الملف', createProfile: 'انشئ ملف', editProfile: 'تعديل الملف', name: 'الاسم', birthday: 'تاريخ الميلاد', birthTime: 'وقت الميلاد', gender: 'الجنس', male: 'ذكر', female: 'انثى', save: 'حفظ', cancel: 'الغاء', delete: 'حذف', confirmDelete: 'هل انت متاكد من حذف هذا الملف؟', create: 'انشاء', selectAvatar: 'اختر الصورة', required: '*', timePlaceholder: 'اختر وقت الميلاد' },
    imageUpload: { title: '📸 رفع صورة', invalidType: 'الرجاء رفع ملف صورة (JPG, PNG, GIF, WebP)', fileTooLarge: 'لا يمكن أن تتجاوز صورة الحجم 5 ميجابايت', notSupported: 'الوحدة الحالية لا تدعم رفع الصور', supportedModules: 'مدعوم: قراءة الكف، التارو، الأحلام، فنغ شوي، البرج', dropText: 'انقر أو اسحب الصورة هنا', dropHint: 'يدعم JPG, PNG, GIF, WebP (الحد الأقصى 5 ميجابايت)', tipPalm: '💡 نصيحة: رفع صورة واضحة من راحة يدك', tipTarot: '💡 نصيحة: تأكد من وضوح صورة Tarot', tipDream: '💡 نصيحة: يمكنك رفع صور مرتبطة بحلمك', tipGeneral: '💡 نصيحة: رفع صور واضحة للحصول على قراءات أدق', uploading: 'جاري الرفع...', analyze: 'ابدأ القراءة' },
    home: { features: { title: 'حلل المساحة', desc: 'من خلال حكمة فنغ شوي، اجعل حياتك مصدرا للانسجام والنجاح.', btn: 'ابدأ' }, bazi: { title: 'فك شفرة البازي', desc: 'افتح رمز الحياة.', btn: 'ابدأ' }, palm: { title: 'الم судьбы в линиях', desc: 'قراءة الكف تحتوي على مخطط قصة حياتنا.', btn: 'ابدأ' }, dream: { title: 'حوّل الاحلام', desc: 'كل حلم يحمل رسالة.', btn: 'ابدأ' }, community: 'قصص المجتمع', askPlaceholder: 'هل الوقت مناسب لتغيير الوظيفة؟', askBtn: 'اسأل' },
    language: { title: 'اختر اللغة', current: 'اللغة الحالية', switch: 'تغيير اللغة' },
    today: 'اليوم', yesterday: 'امس', back: 'رجوع', home: 'الرئيسية', loading: 'جاري التحميل...', error: 'عذرا، حدث خطأ.', success: 'نجاح',
    modules: { bazi: 'البازي', baziDesc: 'تحليل مخطط الولادة', fengshui: 'فنغ شوي', fengshuiDesc: 'استشارة فنغ شوي', tarot: 'التارو', tarotDesc: 'تنبؤ التارو', palm: 'قراءة الكف', palmDesc: 'قراءة الكف', dream: 'الأحلام', dreamDesc: 'تفسير الأحلام', zodiac: 'البرج', zodiacDesc: 'الابراج', mbti: 'MBTI', mbtiDesc: 'اختبار الشخصية', draw: 'السحب', drawDesc: 'العرافة', huangdi: 'هوانغدي', huangdiDesc: 'حكمةالعافية', lifenumber: 'رقم الحياة', lifenumberDesc: 'العددومية', ziwei: 'زيووي', ziweiDesc: 'الابراج الصينية', zhouyi: 'زويي', zhouyiDesc: 'كتاب التغيرات', naming: 'تسمية', namingDesc: 'تحليل الاسم', marriage: 'زواج', marriageDesc: 'التوافق', company: 'اسم الشركة', companyDesc: 'تسمية الاعمال', luckyday: 'يوم الحظ', luckydayDesc: 'تواريخ مواتية', digital: 'العددومية', digitalDesc: 'تحليل الارقام', daodejing: 'الكتاب الكلاسيكية', daodejingDesc: 'الحكمة الكلاسيكية', question: 'عرافة', questionDesc: 'قراءة كتاب التغيرات' }
  },
  'id': {
    appName: 'ZhiJi', appDesc: 'Bisikan kebijaksanaan kuno memandu masa depan Anda',
    features: 'Fitur', contact: 'Hubungi', login: 'Masuk', start: 'Mulai',
    chat: { inputPlaceholder: 'Tulis pertanyaan Anda...', send: 'Kirim', newChat: 'Obrolan Baru', guessYouWant: 'Mungkin ingin ditanyakan', tryAsking: 'Coba tanyakan:', loading: 'Berkonsultasi dengan roh...', selectModule: 'Pilih Fitur', profile: 'Profil', uploadImage: 'Unggah Gambar', voiceInput: 'Input Suara', copy: 'Salin', retry: 'Coba Lagi', copied: 'Disalin' },
    profile: { selectProfile: 'Pilih Profil', createProfile: 'Buat Profil', editProfile: 'Edit Profil', name: 'Nama', birthday: 'Tanggal Lahir', birthTime: 'Waktu Lahir', gender: 'Jenis Kelamin', male: 'Pria', female: 'Wanita', save: 'Simpan', cancel: 'Batal', delete: 'Hapus', confirmDelete: 'Apakah Anda yakin ingin menghapus profil ini?', create: 'Buat', selectAvatar: 'Pilih Avatar', required: '*', timePlaceholder: 'Pilih Waktu Lahir' },
    imageUpload: { title: '📸 Unggah Gambar', invalidType: 'Silakanunggah file gambar (JPG, PNG, GIF, WebP)', fileTooLarge: 'Ukuran gambar tidak boleh melebihi 5MB', notSupported: 'Modul saat ini tidak mendukung pengunggahan gambar', supportedModules: 'Didukung: Ilmu Telapak, Tarot, Mimpi, Feng Shui, Zodiak', dropText: 'Klik atau seret gambar ke sini', dropHint: 'Mendukung JPG, PNG, GIF, WebP (maks 5MB)', tipPalm: '💡 Saran: Unggah foto telapak tangan yang jelas', tipTarot: '💡 Saran: Pastikan gambar Tarot jelas dan lengkap', tipDream: '💡 Saran: Anda dapat mengunggah gambar yang terkait dengan mimpi Anda', tipGeneral: '💡 Saran: Unggah gambar yang jelas untuk pembacaan yang lebih akurat', uploading: 'Mengunggah...', analyze: 'Mulai Pembacaan' },
    home: { features: { title: 'Harmonisikan Ruang', desc: 'Melalui kebijaksanaan Feng Shui, buat hidup Anda sumber keharmonisan dan kesuksesan.', btn: 'Mulai' }, bazi: { title: 'Pecahkan Bazi', desc: 'Buka kode kehidupan.', btn: 'Mulai' }, palm: { title: 'Nasib di Garis Tangan', desc: 'Ilmu telapak mengandung blueprint cerita hidup Anda.', btn: 'Mulai' }, dream: { title: 'Ubah Mimpi', desc: 'Setiap mimpi membawa pesan.', btn: 'Mulai' }, community: 'Cerita Komunitas', askPlaceholder: 'Apakah sekarang saat yang tepat untuk换工作?', askBtn: 'Tanya' },
    language: { title: 'Pilih Bahasa', current: 'Bahasa Saat Ini', switch: 'Ganti Bahasa' },
    today: 'Hari Ini', yesterday: 'Kemarin', back: 'Kembali', home: 'Beranda', loading: 'Memuat...', error: 'Maaf, terjadi kesalahan.', success: 'Berhasil',
    modules: { bazi: 'Bazi', baziDesc: 'Analisis Bagan Kelahiran', fengshui: 'Feng Shui', fengshuiDesc: 'Konsultasi Feng Shui', tarot: 'Tarot', tarotDesc: 'Peramalan Tarot', palm: 'Ilmu Telapak', palmDesc: 'Pembacaan Telapak', dream: 'Mimpi', dreamDesc: 'Interpretasi Mimpi', zodiac: 'Zodiak', zodiacDesc: 'Horoskop', mbti: 'MBTI', mbtiDesc: 'Tes Kepribadian', draw: 'Undian', drawDesc: 'Peramalan', huangdi: 'Huangdi', huangdiDesc: 'Kebijaksanaan Wellness', lifenumber: 'Angka Hidup', lifenumberDesc: 'Numerologi', ziwei: 'Ziwei', ziweiDesc: 'Astrologi Tionghoa', zhouyi: 'Zhouyi', zhouyiDesc: 'I Ching', naming: 'Pemberian Nama', namingDesc: 'Analisis Nama', marriage: 'Pernikahan', marriageDesc: 'Kompatibilitas', company: 'Nama Perusahaan', companyDesc: 'Pemberian Nama Bisnis', luckyday: 'Hari Keberuntungan', luckydayDesc: 'Tanggal Menguntungkan', digital: 'Numerologi', digitalDesc: 'Analisis Angka', daodejing: 'Tao Te Ching', daodejingDesc: 'Kebijaksanaan Klasik', question: 'Peramalan', questionDesc: 'Pembacaan I Ching' }
  },
  'ms': {
    appName: 'ZhiJi', appDesc: 'Bisikan kebijaksanaan kuno membimbing masa depan anda',
    features: 'Ciri-ciri', contact: 'Hubungi', login: 'Log masuk', start: 'Mula',
    chat: { inputPlaceholder: 'Tulis soalan anda...', send: 'Hantar', newChat: 'Cakap Baru', guessYouWant: 'Mungkin anda mahu bertanya', tryAsking: 'Cuba tanyakan:', loading: 'Merunding dengan roh...', selectModule: 'Pilih Fungsi', profile: 'Profil', uploadImage: 'Muat naik Gambar', voiceInput: 'Input Suara', copy: 'Salin', retry: 'Cuba Lagi', copied: 'Disalin' },
    profile: { selectProfile: 'Pilih Profil', createProfile: 'Buat Profil', editProfile: 'Edit Profil', name: 'Nama', birthday: 'Tarikh Lahir', birthTime: 'Masa Lahir', gender: 'Jantina', male: 'Lelaki', female: 'Perempuan', save: 'Simpan', cancel: 'Batal', delete: 'Padam', confirmDelete: 'Adakah anda pasti mahu memadam profil ini?', create: 'Buat', selectAvatar: 'Pilih Avatar', required: '*', timePlaceholder: 'Pilih Masa Lahir' },
    imageUpload: { title: '📸 Muat naik Gambar', invalidType: 'Sila muat naik fail gambar (JPG, PNG, GIF, WebP)', fileTooLarge: 'Saiz gambar tidak boleh melebihi 5MB', notSupported: 'Modul semasa tidak menyokong muat naik gambar', supportedModules: 'Disokong: Ilmu Tapak, Tarot, Mimpi, Feng Shui, Zodiak', dropText: 'Klik atau seret gambar ke sini', dropHint: 'Menyokong JPG, PNG, GIF, WebP (maks 5MB)', tipPalm: '💡 Cadangan: Muat naik foto tapak tangan yang jelas', tipTarot: '💡 Cadangan: Pastikan imej Tarot jelas dan lengkap', tipDream: '💡 Cadangan: Anda boleh memuat naik gambar yang berkaitan dengan mimpi anda', tipGeneral: '💡 Cadangan: Muat naik gambar yang jelas untuk pembacaan yang lebih tepat', uploading: 'Muat naik...', analyze: 'Mula Pembacaan' },
    home: { features: { title: 'Harmoni Ruang', desc: 'Melalui kebijaksanaan Feng Shui, buat hidup anda sumber harmoni dan kejayaan.', btn: 'Mula' }, bazi: { title: 'Edit Kod Bazi', desc: 'Buka kod kehidupan.', btn: 'Mula' }, palm: { title: 'Nasib dalam Garisan Tangan', desc: 'Ilmu tapak mengandungi pelan biru cerita hidup anda.', btn: 'Mula' }, dream: { title: 'Tukar Mimpi', desc: 'Setiap mimpi membawa mesej.', btn: 'Mula' }, community: 'Cerita Komuniti', askPlaceholder: 'Adakah masa yang sesuai untuk menukar kerja?', askBtn: 'Tanya' },
    language: { title: 'Pilih Bahasa', current: 'Bahasa Semasa', switch: 'Tukar Bahasa' },
    today: 'Hari Ini', yesterday: 'Semalam', back: 'Kembali', home: 'Laman Utama', loading: 'Memuat...', error: 'Maaf, berlaku ralat.', success: 'Berjaya',
    modules: { bazi: 'Bazi', baziDesc: 'Analisis Carta Kelahiran', fengshui: 'Feng Shui', fengshuiDesc: 'Konsultasi Feng Shui', tarot: 'Tarot', tarotDesc: 'Ramalan Tarot', palm: 'Ilmu Tapak', palmDesc: 'Pembacaan Tapak', dream: 'Mimpi', dreamDesc: 'Tafsiran Mimpi', zodiac: 'Zodiak', zodiacDesc: 'Horoskop', mbti: 'MBTI', mbtiDesc: 'Ujian Personaliti', draw: 'Undian', drawDesc: 'Ramalan', huangdi: 'Huangdi', huangdiDesc: 'Kebijaksanaan Wellness', lifenumber: 'Nombor Hayat', lifenumberDesc: 'Numerologi', ziwei: 'Ziwei', ziweiDesc: 'Astrologi Cina', zhouyi: 'Zhouyi', zhouyiDesc: 'I Ching', naming: 'Penamaan', namingDesc: 'Analisis Nama', marriage: 'Perkahwinan', marriageDesc: 'Keserasian', company: 'Nama Syarikat', companyDesc: 'Penamaan Perniagaan', luckyday: 'Hari Bertuah', luckydayDesc: 'Tarikh Menguntungkan', digital: 'Numerologi', digitalDesc: 'Analisis Nombor', daodejing: 'Tao Te Ching', daodejingDesc: 'Kebijaksanaan Klasik', question: 'Ramalan', questionDesc: 'Pembacaan I Ching' }
  }
}

// 获取翻译
export function t(key, lang = 'zh-CN') {
  const keys = key.split('.')
  
  // 首先尝试在请求的语言中获取完整路径
  let value = translations[lang]
  let foundInLang = true
  
  for (const k of keys) {
    if (value && value[k] !== undefined) {
      value = value[k]
    } else {
      foundInLang = false
      break
    }
  }
  
  // 如果在请求的语言中找不到完整的键路径，则使用英语作为后备
  if (!foundInLang) {
    value = translations['en']
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k]
      } else {
        return key // 如果英语也没有，返回键名
      }
    }
  }
  
  return value || key
}

// 语言 Store
import { defineStore } from 'pinia'

export const useLanguageStore = defineStore('language', () => {
  const currentLanguage = ref(loadFromStorage('zhiJi_language', detectSystemLanguage()))
  
  function loadFromStorage(key, defaultValue) {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  }
  
  function saveToStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.warn('Failed to save to localStorage:', e)
    }
  }
  
  function setLanguage(lang) {
    currentLanguage.value = lang
    saveToStorage('zhiJi_language', lang)
    
    // 更新页面方向（RTL支持）
    const langInfo = getLanguageByCode(lang)
    document.documentElement.dir = langInfo.dir
    document.documentElement.lang = lang
    
    // 保存语言到服务器（可选）
  }
  
  function getCurrentLanguage() {
    return currentLanguage.value
  }
  
  // 初始化时设置页面方向
  const langInfo = getLanguageByCode(currentLanguage.value)
  if (typeof document !== 'undefined') {
    document.documentElement.dir = langInfo.dir
    document.documentElement.lang = currentLanguage.value
  }
  
  return {
    currentLanguage,
    setLanguage,
    getCurrentLanguage,
    t: (key) => t(key, currentLanguage.value)
  }
})
