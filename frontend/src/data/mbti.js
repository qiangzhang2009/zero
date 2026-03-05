// MBTI 测试题目数据
export const mbtiQuestions = {
  // 简易版 28 题（4组，每组7题）
  simple: [
    // E/I 组
    {
      dimension: 'EI',
      question: '在社交聚会中，你通常：',
      options: [
        { text: '与许多人交流，感到精力充沛', value: 'E' },
        { text: '与少数亲密朋友相处，感到舒适', value: 'I' }
      ]
    },
    {
      dimension: 'EI',
      question: '你更喜欢哪种工作方式：',
      options: [
        { text: '在团队中合作，频繁讨论', value: 'E' },
        { text: '独自思考，安静地工作', value: 'I' }
      ]
    },
    {
      dimension: 'EI',
      question: '当你需要能量时，你倾向于：',
      text: '你倾向于从何处得到力量',
      options: [
        { text: '从他人那里获得能量', value: 'E' },
        { text: '从自己的想法中获得能量', value: 'I' }
      ]
    },
    {
      dimension: 'EI',
      question: '在与他人相处时，你通常是：',
      options: [
        { text: '先说再做，主动表达', value: 'E' },
        { text: '先听再说，沉默观察', value: 'I' }
      ]
    },
    {
      dimension: 'EI',
      question: '你更喜欢的生活方式是：',
      options: [
        { text: '多样化、经常变化', value: 'E' },
        { text: '有规律、可预测', value: 'I' }
      ]
    },
    {
      dimension: 'EI',
      question: '在表达想法时，你更倾向于：',
      options: [
        { text: '直接了当，口头表达', value: 'E' },
        { text: '书面表达，文字更流畅', value: 'I' }
      ]
    },
    {
      dimension: 'EI',
      question: '你更喜欢的工作环境是：',
      options: [
        { text: '开放、互动性强', value: 'E' },
        { text: '安静、独立工作空间', value: 'I' }
      ]
    },
    // S/N 组
    {
      dimension: 'SN',
      question: '你更关注事物的：',
      options: [
        { text: '具体事实和细节', value: 'S' },
        { text: '可能性和未来潜力', value: 'N' }
      ]
    },
    {
      dimension: 'SN',
      question: '你更相信：',
      options: [
        { text: '经验和已验证的事实', value: 'S' },
        { text: '直觉和第六感', value: 'N' }
      ]
    },
    {
      dimension: 'SN',
      question: '学习新事物时，你更喜欢：',
      options: [
        { text: '动手实践，边做边学', value: 'S' },
        { text: '理论探索，理解原理', value: 'N' }
      ]
    },
    {
      dimension: 'SN',
      question: '你更倾向于记住：',
      options: [
        { text: '具体的数据和细节', value: 'S' },
        { text: '整体概念和关联', value: 'N' }
      ]
    },
    {
      dimension: 'SN',
      question: '当解决问题时，你更依赖：',
      options: [
        { text: '过去的经验和方法', value: 'S' },
        { text: '创新的想法和直觉', value: 'N' }
      ]
    },
    {
      dimension: 'SN',
      question: '你更喜欢的信息类型是：',
      options: [
        { text: '精确、可量化的数据', value: 'S' },
        { text: '比喻、象征性的表达', value: 'N' }
      ]
    },
    {
      dimension: 'SN',
      question: '描述事物时，你更常用：',
      options: [
        { text: '具体的描述和事实', value: 'S' },
        { text: '抽象的概念和联想', value: 'N' }
      ]
    },
    // T/F 组
    {
      dimension: 'TF',
      question: '做决定时，你更依赖：',
      options: [
        { text: '逻辑和分析', value: 'T' },
        { text: '个人价值观和情感', value: 'F' }
      ]
    },
    {
      dimension: 'TF',
      question: '你更容易被什么说服：',
      options: [
        { text: '有力的论据和数据', value: 'T' },
        { text: '真诚的情感表达', value: 'F' }
      ]
    },
    {
      dimension: 'TF',
      question: '当别人犯错时，你会：',
      options: [
        { text: '直接指出问题所在', value: 'T' },
        { text: '考虑对方的感受，委婉表达', value: 'F' }
      ]
    },
    {
      dimension: 'TF',
      question: '你更看重：',
      options: [
        { text: '公正和一致性', value: 'T' },
        { text: '同情和关怀', value: 'F' }
      ]
    },
    {
      dimension: 'TF',
      question: '在争论中，你的风格是：',
      options: [
        { text: '追求客观真理', value: 'T' },
        { text: '维护和谐关系', value: 'F' }
      ]
    },
    {
      dimension: 'TF',
      question: '你更欣赏的品质是：',
      options: [
        { text: '能力和效率', value: 'T' },
        { text: '善良和体贴', value: 'F' }
      ]
    },
    {
      dimension: 'TF',
      question: '当你感到压力时，你更倾向于：',
      options: [
        { text: '冷静分析问题根源', value: 'T' },
        { text: '倾诉并寻求情感支持', value: 'F' }
      ]
    },
    // J/P 组
    {
      dimension: 'JP',
      question: '你更倾向于：',
      options: [
        { text: '有计划、有条理', value: 'J' },
        { text: '灵活、随遇而安', value: 'P' }
      ]
    },
    {
      dimension: 'JP',
      question: '你更喜欢的生活方式是：',
      options: [
        { text: '提前规划，按计划执行', value: 'J' },
        { text: '随性而为，保持弹性', value: 'P' }
      ]
    },
    {
      dimension: 'JP',
      question: '面对截止日期时，你通常：',
      options: [
        { text: '提前完成，留有余地', value: 'J' },
        { text: '最后时刻冲刺完成', value: 'P' }
      ]
    },
    {
      dimension: 'JP',
      question: '你更喜欢的工作方式是：',
      options: [
        { text: '确定目标后严格执行', value: 'J' },
        { text: '边做边调整，灵活应变', value: 'P' }
      ]
    },
    {
      dimension: 'JP',
      question: '你更擅长：',
      options: [
        { text: '按时完成任务', value: 'J' },
        { text: '应对突发情况', value: 'P' }
      ]
    },
    {
      dimension: 'JP',
      question: '你更喜欢的生活节奏是：',
      options: [
        { text: '稳定有序，可预期', value: 'J' },
        { text: '多变灵活，有新鲜感', value: 'P' }
      ]
    },
    {
      dimension: 'JP',
      question: '做决定时，你通常：',
      options: [
        { text: '迅速果断', value: 'J' },
        { text: '深思熟虑，保留余地', value: 'P' }
      ]
    }
  ]
}

// MBTI 类型描述
export const mbtiDescriptions = {
  'INTJ': {
    name: '战略家',
    desc: '富有想象力和战略性的思考者，有自己的规划蓝图。',
    strengths: ['战略思维', '独立自主', '高标准', '追求效率'],
    career: ['战略顾问', '科学家', '工程师', '企业高管']
  },
  'INTP': {
    name: '逻辑学家',
    desc: '热衷于探索理论，擅长分析各种想法和系统。',
    strengths: ['分析能力', '创新思维', '客观理性', '好奇心'],
    career: ['研究人员', '程序员', '哲学家', '设计师']
  },
  'ENTJ': {
    name: '指挥官',
    desc: '天生领导者，果断有魄力，善于组织团队达成目标。',
    strengths: ['领导力', '决策能力', '目标导向', '自信'],
    career: ['企业CEO', '律师', '管理顾问', '政治家']
  },
  'ENTP': {
    name: '辩论家',
    desc: '聪明好奇，喜欢挑战传统思维，善于发现问题。',
    strengths: ['创新能力', '沟通能力', '思维敏捷', '善于辩论'],
    career: ['企业家', '投资人', '记者', '营销顾问']
  },
  'INFJ': {
    name: '提倡者',
    desc: '理想主义者，有坚定的价值观，致力于帮助他人。',
    strengths: ['洞察力', '有理想', '忠诚', '富有创意'],
    career: ['心理咨询师', '作家', '教师', '社会工作者']
  },
  'INFP': {
    name: '调停者',
    desc: '富有同情心，追求意义和价值，注重内心世界。',
    strengths: ['同理心', '创意', '理想主义', '忠诚'],
    career: ['艺术家', '作家', '心理咨询师', '人力资源']
  },
  'ENFJ': {
    name: '主人公',
    desc: '天生的领导者，富有魅力，擅长激励他人。',
    strengths: ['沟通能力', '领导力', '同理心', '鼓舞人心'],
    career: ['教师', '培训师', '销售经理', '公共关系']
  },
  'ENFP': {
    name: '竞选者',
    desc: '热情洋溢，创意十足，热爱可能性和挑战。',
    strengths: ['热情', '创意', '沟通能力', '激励他人'],
    career: ['营销人员', '设计师', '演员', '记者']
  },
  'ISTJ': {
    name: '物流师',
    desc: '可靠务实，注重细节，遵守规则和传统。',
    strengths: ['可靠性', '责任感', '注重细节', '有条理'],
    career: ['会计', '律师', '医生', '管理人员']
  },
  'ISFJ': {
    name: '守卫者',
    desc: '温暖忠诚，默默付出，重视他人需求。',
    strengths: ['细心', '忠诚', '责任感', '乐于助人'],
    career: ['护士', '教师', '行政人员', '社会工作者']
  },
  'ESTJ': {
    name: '总经理',
    desc: '善于组织和管理，注重效率和结果。',
    strengths: ['组织能力', '执行力', '责任感', '实际'],
    career: ['管理人员', '军官', '法官', '财务经理']
  },
  'ESFJ': {
    name: '执政官',
    desc: '热情周到，重视和谐，善于照顾他人。',
    strengths: ['社交能力', '细心', '责任感', '团队合作'],
    career: ['教师', '护士', '销售', '人力资源']
  },
  'ISTP': {
    name: '鉴赏家',
    desc: '冷静理性，动手能力强，擅长解决实际问题。',
    strengths: ['动手能力', '冷静分析', '灵活', '实用主义'],
    career: ['工程师', '技术人员', '运动员', '机械师']
  },
  'ISFP': {
    name: '探险家',
    desc: '温柔敏感，注重审美，热爱自由和体验。',
    strengths: ['艺术天赋', '温柔', '观察力', '灵活'],
    career: ['艺术家', '设计师', '厨师', '摄影师']
  },
  'ESTP': {
    name: '企业家',
    desc: '充满活力，行动派，喜欢冒险和挑战。',
    strengths: ['行动力', '社交能力', '务实', '冒险精神'],
    career: ['企业家', '销售', '记者', '运动员']
  },
  'ESFP': {
    name: '表演者',
    desc: '热情奔放，喜欢成为焦点，充满活力。',
    strengths: ['热情', '社交能力', '创意', '实际'],
    career: ['演员', '销售', '主持人', '活动策划']
  }
}

// 计算 MBTI 类型
export function calculateMBTI(answers) {
  const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }
  
  answers.forEach(answer => {
    if (answer.value) {
      scores[answer.value]++
    }
  })
  
  let type = ''
  type += scores.E >= scores.I ? 'E' : 'I'
  type += scores.S >= scores.N ? 'S' : 'N'
  type += scores.T >= scores.F ? 'T' : 'F'
  type += scores.J >= scores.P ? 'J' : 'P'
  
  return type
}
