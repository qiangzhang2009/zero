// 法律文案多语言文件 - 与 i18n 分离，避免污染主翻译文件
// 包含：免责声明、隐私政策、Cookie 同意、注册前强制确认

export const legalTranslations = {
  'zh-CN': {
    // 通用
    appName: '知几',
    // 免责声明
    disclaimer: {
      short: '本服务仅供娱乐和文化参考，不构成专业建议',
      full: {
        title: '免责声明',
        intro: '欢迎使用知几 (ZhiJi) AI 命理咨询服务。请仔细阅读以下条款：',
        section1Title: '🎭 仅供娱乐',
        section1Text: '本服务提供的所有命理、八字、风水、占卜等内容仅供娱乐、文化研究和个人参考。不构成专业建议。',
        section2Title: '💼 非专业建议',
        section2Text: '本服务不提供金融投资、法律、医疗或心理咨询方面的专业建议。请勿根据命理结果做出任何重大人生决策。',
        section3Title: '⚠️ 结果不保证',
        section3Text: '命理分析基于传统文化和AI算法，结果仅供参考。我们不保证任何预测的准确性，过去的结果也不能保证未来的表现。',
        section4Title: '👤 自主决策',
        section4Text: '您的人生由您自己做主。命理结果可作为思考参考，但所有决策应由您本人基于理性判断做出。',
        section5Title: '🌍 跨境服务',
        section5Text: '本服务面向全球用户，部分内容可能因文化差异而具有不同解读。在中国境内使用时，请遵守当地法律法规。',
        agree: '我已阅读并理解以上声明',
        continue: '继续使用',
      },
    },
    // Cookie 同意
    cookie: {
      title: '🍪 Cookie 与隐私',
      message: '我们使用 Cookie 和本地存储来记住您的语言偏好、保存聊天记录和提供更好的体验。继续使用即表示您同意我们的隐私政策。',
      learnMore: '了解更多',
      accept: '同意',
      reject: '仅必要',
    },
    // 注册前强制确认
    registrationConfirm: {
      title: '使用前确认',
      item1: '我理解本服务仅供娱乐，不构成专业建议',
      item2: '我不会根据命理结果做出投资、法律或医疗决策',
      item3: '我已年满 18 周岁',
      confirm: '同意并继续',
      cancel: '取消',
    },
    // 隐私政策
    privacy: {
      title: '隐私政策',
      lastUpdated: '最后更新：2026年10月15日',
      intro: '知几 (ZhiJi) 尊重并保护您的隐私。本政策说明我们如何收集、使用和保护您的个人信息。',
      section1Title: '1. 我们收集哪些信息',
      section1Content: '我们仅收集为您提供服务所必需的最少信息，包括：出生日期、出生时辰、性别（用于命理计算）、电子邮箱（用于账户）、使用记录（用于改进服务）。我们不收集您的真实姓名、身份证号等敏感信息。',
      section2Title: '2. 信息使用目的',
      section2Content: '您的信息仅用于：(1) 计算八字命盘并提供个性化解读；(2) 保存您的历史记录便于回顾；(3) 改善 AI 模型和服务质量；(4) 满足法律法规要求。',
      section3Title: '3. 信息存储与安全',
      section3Content: '我们采用行业标准加密技术保护您的数据。数据存储在安全的云服务器上，访问受到严格限制。您可以随时要求删除您的个人数据。',
      section4Title: '4. Cookie 与本地存储',
      section4Content: '我们使用 Cookie 和浏览器本地存储来记住您的语言偏好、保存使用进度。我们不与第三方共享这些数据。',
      section5Title: '5. 您的权利',
      section5Content: '根据 GDPR、CCPA 等隐私法规，您享有以下权利：访问您的数据、更正错误数据、删除您的数据、数据可携性。如需行使这些权利，请联系我们。',
      section6Title: '6. 儿童隐私',
      section6Content: '本服务面向 18 周岁及以上用户。我们不会故意收集未成年人的个人信息。',
      section7Title: '7. 政策变更',
      section7Content: '我们可能不时更新本政策。重大变更将通过站内通知告知。继续使用本服务即表示您接受更新后的政策。',
      section8Title: '8. 联系我们',
      section8Content: '如有隐私相关问题，请通过客服微信联系我们，或发送邮件至 privacy@zxqconsulting.com',
      backHome: '返回首页',
    },
    // 注册前强制确认（首次访问）
    ageConfirm: {
      title: '欢迎使用知几',
      subtitle: '请确认以下信息以继续',
      ageCheck: '我已年满 18 周岁',
      termsCheck: '我已阅读并同意《免责声明》和《隐私政策》',
      continue: '继续',
      viewTerms: '查看条款',
    },
  },
  'en': {
    appName: 'ZhiJi',
    disclaimer: {
      short: 'For entertainment and cultural reference only. Not professional advice.',
      full: {
        title: 'Disclaimer & Legal Notice',
        intro: 'Welcome to ZhiJi AI Fortune-Telling Service. Please read the following carefully:',
        section1Title: '🎭 Entertainment Only',
        section1Text: 'All content provided by this service (fortune-telling, BaZi, Feng Shui, divination, etc.) is for entertainment, cultural study, and personal reference only. It does not constitute professional advice.',
        section2Title: '💼 Not Professional Advice',
        section2Text: 'This service does not provide professional financial, legal, medical, or psychological advice. Please do not make major life decisions based on fortune-telling results.',
        section3Title: '⚠️ No Guarantees',
        section3Text: 'Fortune-telling analysis is based on traditional culture and AI algorithms. Results are for reference only. We do not guarantee the accuracy of any predictions. Past results do not guarantee future performance.',
        section4Title: '👤 Your Choices Matter',
        section4Text: 'Your life is in your own hands. Fortune-telling results can serve as a reference for thought, but all decisions should be made by you based on rational judgment.',
        section5Title: '🌍 Global Service',
        section5Text: 'This service is available globally. Some content may have different interpretations due to cultural differences. When used in mainland China, please comply with local laws and regulations.',
        agree: 'I have read and understood the above',
        continue: 'Continue',
      },
    },
    cookie: {
      title: '🍪 Cookies & Privacy',
      message: 'We use cookies and local storage to remember your language preferences, save chat history, and provide a better experience. By continuing to use, you agree to our privacy policy.',
      learnMore: 'Learn more',
      accept: 'Accept',
      reject: 'Necessary only',
    },
    registrationConfirm: {
      title: 'Confirmation Required',
      item1: 'I understand this service is for entertainment only and does not constitute professional advice',
      item2: 'I will not make investment, legal, or medical decisions based on fortune-telling results',
      item3: 'I am 18 years of age or older',
      confirm: 'Agree and Continue',
      cancel: 'Cancel',
    },
    privacy: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: October 15, 2026',
      intro: 'ZhiJi respects and protects your privacy. This policy explains how we collect, use, and protect your personal information.',
      section1Title: '1. What Information We Collect',
      section1Content: 'We collect only the minimum information necessary to provide our services: date of birth, birth time, gender (for fortune calculation), email (for account), usage records (for service improvement). We do not collect your real name, ID number, or other sensitive information.',
      section2Title: '2. How We Use Information',
      section2Content: 'Your information is used only to: (1) calculate BaZi charts and provide personalized readings; (2) save your history for review; (3) improve AI models and service quality; (4) comply with legal requirements.',
      section3Title: '3. Storage and Security',
      section3Content: 'We use industry-standard encryption to protect your data. Data is stored on secure cloud servers with strictly limited access. You can request deletion of your personal data at any time.',
      section4Title: '4. Cookies and Local Storage',
      section4Content: 'We use cookies and browser local storage to remember your language preferences and save your progress. We do not share this data with third parties.',
      section5Title: '5. Your Rights',
      section5Content: 'Under GDPR, CCPA, and other privacy regulations, you have the right to: access your data, correct inaccurate data, delete your data, and data portability. To exercise these rights, please contact us.',
      section6Title: '6. Children\'s Privacy',
      section6Content: 'This service is intended for users 18 years of age and older. We do not knowingly collect personal information from minors.',
      section7Title: '7. Policy Changes',
      section7Content: 'We may update this policy from time to time. Significant changes will be communicated through in-app notifications. Continued use of the service indicates acceptance of the updated policy.',
      section8Title: '8. Contact Us',
      section8Content: 'For privacy-related questions, please contact us via customer service WeChat or email privacy@zxqconsulting.com',
      backHome: 'Back to Home',
    },
    ageConfirm: {
      title: 'Welcome to ZhiJi',
      subtitle: 'Please confirm the following to continue',
      ageCheck: 'I am 18 years of age or older',
      termsCheck: 'I have read and agree to the Disclaimer and Privacy Policy',
      continue: 'Continue',
      viewTerms: 'View Terms',
    },
  },
  'ja': {
    appName: '知幾',
    disclaimer: {
      short: '娯楽・文化参考のみ。専門的な助言ではありません。',
      full: {
        title: '免責事項',
        intro: '知幾 (ZhiJi) AI 占いサービスへようこそ。以下をよくお読みください：',
        section1Title: '🎭 娯楽目的のみ',
        section1Text: '本サービス提供のすべての占い、八字、風水、占いの内容は娯楽、文化研究、個人的参考のみです。専門的な助言を構成しません。',
        section2Title: '💼 専門的助言ではない',
        section2Text: '本サービスは金融、法律、医療、心理学の専門的助言を提供しません。占いの結果に基づいて重大な人生決定をしないでください。',
        section3Title: '⚠️ 結果の保証なし',
        section3Text: '占い分析は传统文化とAIアルゴリズムに基づきます。結果は参考のみ。当社はいかなる予測の正確性も保証しません。',
        section4Title: '👤 自己決定',
        section4Text: 'あなたの人生はあなた自身の手にあります。占いの結果は思考の参考になりますが、すべての決定は理性的な判断に基づいてあなた自身が行うべきです。',
        section5Title: '🌍 グローバルサービス',
        section5Text: '本サービスはグローバルに用户提供します。一部の内容は文化的な違いにより異なる解釈を持つ場合があります。',
        agree: '上記を読み理解しました',
        continue: '続ける',
      },
    },
    cookie: {
      title: '🍪 Cookieとプライバシー',
      message: '当社は言語設定の記憶、会話履歴の保存、より良い体験の提供のためにCookieとローカルストレージを使用します。',
      learnMore: '詳細',
      accept: '同意',
      reject: '必要のみ',
    },
    registrationConfirm: {
      title: '使用前の確認',
      item1: '本サービスが娯楽のみであることを理解し、専門的助言とは見なしません',
      item2: '占いの結果に基づいて投資、法律、医療の決定をしません',
      item3: '私は18歳以上です',
      confirm: '同意して続ける',
      cancel: 'キャンセル',
    },
    privacy: {
      title: 'プライバシーポリシー',
      lastUpdated: '最終更新日：2026年10月15日',
      intro: '知幾はあなたのプライバシーを尊重し保護します。本ポリシーは個人情報の収集、使用、保護方法を説明します。',
      section1Title: '1. 収集する情報',
      section1Content: 'サービス提供に必要な最小限の情報のみ収集：生年月日、出生時間、性別、メールアドレス、使用記録。',
      section2Title: '2. 情報の使用目的',
      section2Content: '(1) 八字命盤の計算とパーソナライズされた解釈、(2) 履歴の保存、(3) AIモデルとサービス品質の改善、(4) 法的要件の遵守。',
      section3Title: '3. ストレージとセキュリティ',
      section3Content: '業界標準の暗号化技術を使用。データは安全なクラウドサーバーに保存され、アクセスは厳格に制限されています。',
      section4Title: '4. Cookieとローカルストレージ',
      section4Content: '言語設定の記憶と進捗状況の保存のために使用。第三者と共有しません。',
      section5Title: '5. お客様の権利',
      section5Content: 'GDPR、CCPAなどのプライバシー規制に基づき、データのアクセス、訂正、削除、移植の権利があります。',
      section6Title: '6. 子供のプライバシー',
      section6Content: '本サービスは18歳以上のユーザーを対象としています。',
      section7Title: '7. ポリシーの変更',
      section7Content: '本ポリシーを随時更新する場合があります。重要な変更はアプリ内通知でお知らせします。',
      section8Title: '8. お問い合わせ',
      section8Content: 'プライバシーに関するご質問は、プライバシー担当までご連絡ください。',
      backHome: 'ホームに戻る',
    },
    ageConfirm: {
      title: '知幾へようこそ',
      subtitle: '続行するために以下を確認してください',
      ageCheck: '私は18歳以上です',
      termsCheck: '免責事項とプライバシーポリシーを読み同意します',
      continue: '続ける',
      viewTerms: '利用規約を見る',
    },
  },
  'ko': {
    appName: '지기',
    disclaimer: {
      short: '오락 및 문화 참고용. 전문적인 조언이 아닙니다.',
      full: {
        title: '면책 조항',
        intro: '지기 AI 운세 서비스에 오신 것을 환영합니다. 다음을 주의 깊게 읽어주십시오:',
        section1Title: '🎭 오락 목적만',
        section1Text: '본 서비스가 제공하는 모든 운세, 팔자, 풍수, 점술 내용은 오락, 문화 연구 및 개인 참고용입니다. 전문적인 조언이 아닙니다.',
        section2Title: '💼 전문적 조언 아님',
        section2Text: '본 서비스는 금융, 법률, 의료 또는 심리 상담에 대한 전문적인 조언을 제공하지 않습니다. 운세 결과를 기반으로 중요한 인생 결정을 내리지 마십시오.',
        section3Title: '⚠️ 결과 보장 없음',
        section3Text: '운세 분석은 전통 문화와 AI 알고리즘을 기반으로 합니다. 결과는 참고용입니다. 어떠한 예측의 정확성도 보장하지 않습니다.',
        section4Title: '👤 자율 결정',
        section4Text: '인생은 자신의 손에 달려 있습니다. 운세 결과는 사고의 참고가 될 수 있지만 모든 결정은 이성적 판단에 기반하여 본인이 내려야 합니다.',
        section5Title: '🌍 글로벌 서비스',
        section5Text: '본 서비스는 전 세계 사용자에게 제공됩니다. 일부 내용은 문화적 차이로 인해 다른 해석을 가질 수 있습니다.',
        agree: '위 내용을 읽고 이해했습니다',
        continue: '계속',
      },
    },
    cookie: {
      title: '🍪 쿠키 및 개인 정보',
      message: '언어 설정 저장, 채팅 기록 저장 및 더 나은 경험 제공을 위해 쿠키와 로컬 저장소를 사용합니다.',
      learnMore: '자세히',
      accept: '동의',
      reject: '필수만',
    },
    registrationConfirm: {
      title: '사용 전 확인',
      item1: '본 서비스가 오락용이며 전문적 조언이 아님을 이해합니다',
      item2: '운세 결과를 기반으로 투자, 법률 또는 의료 결정을 내리지 않습니다',
      item3: '저는 18세 이상입니다',
      confirm: '동의하고 계속',
      cancel: '취소',
    },
    privacy: {
      title: '개인 정보 정책',
      lastUpdated: '최종 업데이트: 2026년 10월 15일',
      intro: '지기는 귀하의 개인 정보를 존중하고 보호합니다.',
      section1Title: '1. 수집하는 정보',
      section1Content: '서비스 제공에 필요한 최소한의 정보만 수집합니다: 생년월일, 출생 시간, 성별, 이메일, 사용 기록.',
      section2Title: '2. 정보 사용 목적',
      section2Content: '(1) 팔자 명반 계산, (2) 기록 저장, (3) AI 모델 개선, (4) 법적 요구 사항 준수.',
      section3Title: '3. 저장 및 보안',
      section3Content: '업계 표준 암호화 기술을 사용합니다. 데이터는 안전한 클라우드 서버에 저장됩니다.',
      section4Title: '4. 쿠키 및 로컬 저장소',
      section4Content: '언어 설정 저장 및 진행 상황 저장에 사용됩니다.',
      section5Title: '5. 귀하의 권리',
      section5Content: 'GDPR, CCPA 등에 따라 데이터 액세스, 수정, 삭제, 이동 권리가 있습니다.',
      section6Title: '6. 아동 개인 정보',
      section6Content: '본 서비스는 18세 이상 사용자를 대상으로 합니다.',
      section7Title: '7. 정책 변경',
      section7Content: '본 정책을 수시로 업데이트할 수 있습니다. 중요한 변경 사항은 앱 내 알림을 통해 알려드립니다.',
      section8Title: '8. 문의하기',
      section8Content: '개인 정보 관련 질문이 있으시면 문의하십시오.',
      backHome: '홈으로 돌아가기',
    },
    ageConfirm: {
      title: '지기에 오신 것을 환영합니다',
      subtitle: '계속하려면 다음을 확인하세요',
      ageCheck: '저는 18세 이상입니다',
      termsCheck: '면책 조항 및 개인 정보 정책을 읽고 동의합니다',
      continue: '계속',
      viewTerms: '약관 보기',
    },
  },
}

// 辅助函数 - 嵌套路径取值
export function tLegal(key, lang = 'zh-CN') {
  const keys = key.split('.')
  let value = legalTranslations[lang]
  let found = true
  for (const k of keys) {
    if (value && value[k] !== undefined) {
      value = value[k]
    } else {
      found = false
      break
    }
  }
  if (!found) {
    value = legalTranslations['en']
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k]
      } else {
        return key
      }
    }
  }
  return value || key
}
