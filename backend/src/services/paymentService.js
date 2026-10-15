// 支付服务 - 支持支付宝、Stripe (国际卡)、Mock 三种方式
// 设计为可插拔：现在默认 Mock，配置真密钥后自动切换

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// 支付配置文件 - 敏感信息从环境变量读取
const PAYMENT_CONFIG = {
  // 支付宝
  alipay: {
    enabled: process.env.ALIPAY_ENABLED === 'true',
    appId: process.env.ALIPAY_APP_ID || '',
    privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
    publicKey: process.env.ALIPAY_PUBLIC_KEY || '',
    gateway: process.env.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do',
    notifyUrl: process.env.ALIPAY_NOTIFY_URL || '',
  },
  // Stripe (需要海外公司)
  stripe: {
    enabled: process.env.STRIPE_ENABLED === 'true',
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  // Mock 模式 - 用于开发演示
  mock: {
    enabled: process.env.PAYMENT_MOCK !== 'false', // 默认开启
  }
};

// 套餐定义（与前端保持一致）
export const PRICING_PLANS = {
  // 点数套餐
  credits: [
    { id: 'starter', name: 'Starter', credits: 30, price: 4.99, currency: 'USD', popular: false, bonus: 0 },
    { id: 'explorer', name: 'Explorer', credits: 100, price: 12.99, currency: 'USD', popular: false, bonus: 0 },
    { id: 'master', name: 'Master', credits: 300, price: 34.99, currency: 'USD', popular: true, bonus: 0 },
    { id: 'grandmaster', name: 'Grandmaster', credits: 1000, price: 99.99, currency: 'USD', popular: false, bonus: 0 },
  ],
  // 订阅套餐
  subscriptions: [
    {
      id: 'basic_monthly',
      name: 'Basic Monthly',
      tier: 'basic',
      price: 9.99,
      currency: 'USD',
      period: 'month',
      dailyCredits: 20,
      features: ['all_modules', 'cloud_history', 'email_support'],
    },
    {
      id: 'premium_monthly',
      name: 'Premium Monthly',
      tier: 'premium',
      price: 29.99,
      currency: 'USD',
      period: 'month',
      dailyCredits: 100,
      features: ['all_modules', 'cloud_history', 'priority_ai', 'email_24_7'],
      popular: true,
    },
    {
      id: 'pro_monthly',
      name: 'Pro Monthly',
      tier: 'pro',
      price: 99.99,
      currency: 'USD',
      period: 'month',
      dailyCredits: -1, // -1 = 无限
      features: ['all_modules', 'cloud_history', 'priority_ai', 'dedicated_manager', 'custom_reports'],
    },
    {
      id: 'premium_yearly',
      name: 'Premium Yearly',
      tier: 'premium',
      price: 269.99,
      currency: 'USD',
      period: 'year',
      dailyCredits: 100,
      features: ['all_modules', 'cloud_history', 'priority_ai', 'email_24_7'],
      saveText: 'Save 25%'
    },
  ]
};

// 用户数据存储文件
const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const MEMBERSHIPS_FILE = path.join(DATA_DIR, 'memberships.json');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 加载/保存数据
function loadJson(file, defaultValue = []) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
  } catch (e) {
    console.error(`Failed to load ${file}:`, e.message);
  }
  return defaultValue;
}

function saveJson(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error(`Failed to save ${file}:`, e.message);
  }
}

// 订单管理
let orders = loadJson(ORDERS_FILE);
let memberships = loadJson(MEMBERSHIPS_FILE);

function saveOrders() { saveJson(ORDERS_FILE, orders); }
function saveMemberships() { saveJson(MEMBERSHIPS_FILE, memberships); }

/**
 * 创建支付订单
 * @param {Object} params
 * @param {string} params.userId - 用户ID
 * @param {string} params.planId - 套餐ID
 * @param {string} params.paymentMethod - 'alipay' | 'stripe' | 'mock'
 * @param {string} params.type - 'credit' | 'subscription'
 * @returns {Object} 订单详情 + 支付URL/二维码
 */
export function createOrder({ userId, planId, paymentMethod = 'mock', type = 'credit' }) {
  // 查找套餐
  const planList = type === 'credit' ? PRICING_PLANS.credits : PRICING_PLANS.subscriptions;
  const plan = planList.find(p => p.id === planId);

  if (!plan) {
    throw new Error(`Invalid plan: ${planId}`);
  }

  // 确定实际使用的支付方式
  let actualMethod = paymentMethod;
  if (paymentMethod === 'alipay' && !PAYMENT_CONFIG.alipay.enabled) {
    console.log('[Payment] Alipay not configured, falling back to mock');
    actualMethod = 'mock';
  }
  if (paymentMethod === 'stripe' && !PAYMENT_CONFIG.stripe.enabled) {
    console.log('[Payment] Stripe not configured, falling back to mock');
    actualMethod = 'mock';
  }
  if (actualMethod === 'mock' && !PAYMENT_CONFIG.mock.enabled) {
    throw new Error('No payment method available');
  }

  // 生成订单ID
  const orderId = 'ord_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');

  // 创建订单记录
  const order = {
    id: orderId,
    userId,
    planId,
    planName: plan.name,
    type,
    amount: plan.price,
    currency: plan.currency,
    paymentMethod: actualMethod,
    status: 'pending', // pending | paid | failed | refunded
    credits: plan.credits || 0,
    dailyCredits: plan.dailyCredits || 0,
    tier: plan.tier || null,
    durationDays: plan.period === 'year' ? 365 : plan.period === 'month' ? 30 : 0,
    createdAt: new Date().toISOString(),
    paidAt: null,
    expiresAt: null,
    metadata: {
      popular: plan.popular || false,
      saveText: plan.saveText || null,
      features: plan.features || []
    }
  };

  // 根据支付方式生成支付参数
  let paymentInfo = {};

  if (actualMethod === 'mock') {
    // Mock 模式：直接生成一个假支付链接
    paymentInfo = {
      type: 'mock',
      payUrl: `/api/payment/mock-pay?orderId=${orderId}`,
      qrCode: null, // 可以生成 SVG QR Code
      instructions: {
        'zh-CN': '【演示模式】点击下方按钮直接完成支付（无需真实交易）',
        'en': '[Demo Mode] Click the button below to complete payment (no real transaction)',
        'ja': '[デモモード] 下のボタンをクリックして支払いを完了してください（実際の取引なし）',
        'ko': '[데모 모드] 아래 버튼을 클릭하여 결제를 완료하세요 (실제 거래 없음)'
      }
    };
  } else if (actualMethod === 'alipay') {
    // 支付宝支付 - 需要 alipay-sdk，这里只返回结构
    paymentInfo = {
      type: 'alipay',
      payUrl: `${PAYMENT_CONFIG.alipay.gateway}?orderId=${orderId}`,
      // TODO: 实际接入 alipay-sdk
    };
  } else if (actualMethod === 'stripe') {
    // Stripe - 需要 stripe sdk
    paymentInfo = {
      type: 'stripe',
      // TODO: 调用 stripe.checkout.sessions.create
    };
  }

  // 保存订单
  order.paymentInfo = paymentInfo;
  orders.push(order);
  saveOrders();

  return {
    order: {
      id: order.id,
      planId: order.planId,
      planName: order.planName,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      type: order.type,
      credits: order.credits,
      dailyCredits: order.dailyCredits,
      createdAt: order.createdAt
    },
    payment: paymentInfo
  };
}

/**
 * 处理支付成功（Mock 模式直接调用，真实模式由 webhook 触发）
 */
export function markOrderPaid(orderId, paymentData = {}) {
  const order = orders.find(o => o.id === orderId);
  if (!order) throw new Error('Order not found');
  if (order.status === 'paid') return { order, alreadyPaid: true };

  order.status = 'paid';
  order.paidAt = new Date().toISOString();
  order.paymentData = paymentData;

  // 如果是订阅套餐，创建/更新会员记录
  if (order.type === 'subscription') {
    const startDate = new Date();
    const expiresAt = new Date(startDate.getTime() + order.durationDays * 24 * 60 * 60 * 1000);

    // 移除同一用户已存在的会员
    memberships = memberships.filter(m => m.userId !== order.userId);

    // 创建新会员
    const membership = {
      id: 'mem_' + Date.now(),
      userId: order.userId,
      tier: order.tier,
      orderId: order.id,
      startDate: startDate.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'active',
      dailyCredits: order.dailyCredits,
      features: order.metadata.features || []
    };
    memberships.push(membership);
    saveMemberships();
    order.membershipId = membership.id;
  }

  saveOrders();
  return { order };
}

/**
 * 查询订单状态
 */
export function getOrder(orderId) {
  return orders.find(o => o.id === orderId);
}

/**
 * 查询用户订单列表
 */
export function getUserOrders(userId) {
  return orders.filter(o => o.userId === userId).sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  );
}

/**
 * 查询用户当前会员
 */
export function getUserMembership(userId) {
  return memberships.find(m => m.userId === userId && m.status === 'active');
}

/**
 * 退款
 */
export function refundOrder(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) throw new Error('Order not found');
  if (order.status !== 'paid') throw new Error('Order not paid');

  order.status = 'refunded';
  order.refundedAt = new Date().toISOString();

  // 取消关联的会员
  if (order.membershipId) {
    const m = memberships.find(m => m.id === order.membershipId);
    if (m) m.status = 'cancelled';
  }

  saveOrders();
  saveMemberships();
  return { order };
}

/**
 * 列出可用的支付方式
 */
export function getAvailablePaymentMethods() {
  const methods = [];
  if (PAYMENT_CONFIG.mock.enabled) {
    methods.push({ id: 'mock', name: 'Demo Payment', icon: '🧪', available: true });
  }
  if (PAYMENT_CONFIG.alipay.enabled) {
    methods.push({ id: 'alipay', name: 'Alipay', icon: '💙', available: true });
  } else {
    methods.push({ id: 'alipay', name: 'Alipay', icon: '💙', available: false, reason: 'Not configured' });
  }
  if (PAYMENT_CONFIG.stripe.enabled) {
    methods.push({ id: 'stripe', name: 'Stripe', icon: '💳', available: true });
  } else {
    methods.push({ id: 'stripe', name: 'Stripe', icon: '💳', available: false, reason: 'Not configured' });
  }
  return methods;
}

/**
 * 获取所有套餐
 */
export function getAllPlans() {
  return PRICING_PLANS;
}

export default {
  createOrder,
  markOrderPaid,
  getOrder,
  getUserOrders,
  getUserMembership,
  refundOrder,
  getAvailablePaymentMethods,
  getAllPlans,
  PRICING_PLANS
};
