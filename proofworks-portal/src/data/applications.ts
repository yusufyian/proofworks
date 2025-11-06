export interface Application {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  description: string;
  tagline: string;
  painPoints: string[];
  coreValue: string[];
  industries: string[];
  keyMetrics: {
    label: string;
    value: string;
  }[];
  color: string;
  gradient: string;
  demoUrl?: string;
}

export const applications: Application[] = [
  {
    id: 'supply-chain-finance',
    name: '供应链金融与数字凭证',
    shortName: '供应链金融',
    icon: '💳',
    description: '实现应收账款、预付账款、票据、仓单等凭证的可信数字化流转，支持凭证的转让、质押、融资等全生命周期管理。',
    tagline: '穿透式风控，融资提速90%',
    painPoints: [
      '中小企业融资难、融资贵',
      '凭证真伪核验耗时，重复融资风险高',
      '多级供应商穿透式管理困难',
      '融资审批流程冗长，放款周期长'
    ],
    coreValue: [
      '凭证真伪核验耗时 ↓90%',
      '融资放款时效 ≤4小时',
      '中小企业融资成功率 ↑50%',
      '防重复融资、反质押循环检测'
    ],
    industries: ['制造业', '汽车', '电子', '化工', '零售'],
    keyMetrics: [
      { label: '凭证核验效率', value: '↓90%' },
      { label: '融资放款时效', value: '≤4小时' },
      { label: '融资成功率', value: '↑50%' }
    ],
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500',
    demoUrl: '/supply-chain-finance-platform/frontend'
  },
  {
    id: 'food-traceability',
    name: '食品农产品全链路追溯',
    shortName: '食品追溯',
    icon: '🌾',
    description: '实现从产地到餐桌的全链路可追溯体系，建立一物一码的数字身份管理机制，实现食品安全事件快速召回与追责。',
    tagline: '从田间到餐桌，全程透明可追溯',
    painPoints: [
      '食品安全事件难以快速定位问题批次',
      '召回响应速度慢，影响范围扩大',
      '消费者信任度低，品牌价值受损',
      '监管追溯要求难以满足'
    ],
    coreValue: [
      '批次定位时效 ≤5分钟',
      '召回响应速度提升95%',
      '消费者信任度提升，复购率 ↑30%',
      '一物一码全程透明'
    ],
    industries: ['食品', '农产品', '生鲜', '母婴用品'],
    keyMetrics: [
      { label: '批次定位时效', value: '≤5分钟' },
      { label: '召回响应速度', value: '↑95%' },
      { label: '复购率提升', value: '↑30%' }
    ],
    color: 'green',
    gradient: 'from-green-500 to-emerald-500',
    demoUrl: '/food-traceability-platform/frontend'
  },
  {
    id: 'cold-chain-medical',
    name: '冷链医药流通',
    shortName: '冷链医药',
    icon: '💉',
    description: '实现疫苗、生物制剂、冷藏药品的全程温控监管，符合GSP规范要求，实现温湿度数据的可信采集与异常预警。',
    tagline: '温控合规率≥99.5%，GSP认证一次通过',
    painPoints: [
      '温控数据难以保证真实性和完整性',
      'GSP认证/GMP审核频繁不通过',
      '超温导致整批报废，损失巨大',
      '缺乏实时监控和异常预警'
    ],
    coreValue: [
      '温控合规率 ≥99.5%',
      '报废率下降 40-60%',
      'GSP认证/飞检一次通过',
      '异常实时告警，责任明确'
    ],
    industries: ['医药流通', '疫苗配送', '生物制剂', '冷链食品'],
    keyMetrics: [
      { label: '温控合规率', value: '≥99.5%' },
      { label: '报废率下降', value: '40-60%' },
      { label: 'GSP通过率', value: '100%' }
    ],
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-500',
    demoUrl: '/cold-chain-medical-platform/frontend'
  },
  {
    id: 'reconciliation',
    name: '结算对账自动化',
    shortName: '结算对账',
    icon: '💰',
    description: '实现多门店、多平台、多支付渠道的自动对账，支持数字人民币（e-CNY）对公支付与清分，实现T+0/T+1差异自动处理。',
    tagline: '对账自动化率≥95%，时间从3天降至30分钟',
    painPoints: [
      '多平台多支付渠道对账繁琐，人工成本高',
      '对账周期长，资金回笼慢',
      '差错率高，对账结果不可信',
      '数字人民币对账缺乏工具支持'
    ],
    coreValue: [
      '对账自动化率 ≥95%',
      '对账时间从3天 → 30分钟',
      '人工成本下降 80%',
      '差错率 <0.01%'
    ],
    industries: ['零售', '餐饮', '电商', 'O2O平台', '购物中心'],
    keyMetrics: [
      { label: '自动化率', value: '≥95%' },
      { label: '时间缩短', value: '3天→30分钟' },
      { label: '成本下降', value: '↓80%' }
    ],
    color: 'yellow',
    gradient: 'from-yellow-500 to-orange-500',
    demoUrl: '/reconciliation-platform/frontend'
  },
  {
    id: 'data-privacy-compliance',
    name: '数据要素合规流通',
    shortName: '数据合规',
    icon: '🔐',
    description: '实现"数据不出域"的联合计算与分析，满足《个人信息保护法》《数据安全法》要求，支持多方安全协作与隐私计算。',
    tagline: '数据不出域，合规变现价值千万',
    painPoints: [
      '数据合规要求严格，违规成本高',
      '数据孤岛，无法联合使用发挥价值',
      '隐私计算技术门槛高',
      '数据变现缺乏合规路径'
    ],
    coreValue: [
      '100%合规（个保法/数据安全法）',
      '数据不出域的联合计算',
      '数据变现收益 500-2000万元/年',
      'MPC/TEE/联邦学习多技术融合'
    ],
    industries: ['金融', '医疗', '政务', '互联网平台'],
    keyMetrics: [
      { label: '合规率', value: '100%' },
      { label: '数据变现', value: '500-2000万/年' },
      { label: '技术融合', value: 'MPC/TEE/FL' }
    ],
    color: 'purple',
    gradient: 'from-purple-500 to-pink-500',
    demoUrl: '/data-privacy-compliance-platform/frontend'
  },
  {
    id: 'invoice-tax',
    name: '发票单据防伪与税务协同',
    shortName: '发票防伪',
    icon: '📄',
    description: '实现采购到付款、订单到收款全流程票据管理，防范虚开发票、重复报销、虚假交易等风险，支持增值税发票验证与流转。',
    tagline: '假发票拦截率≥99.9%，报销审批≤24小时',
    painPoints: [
      '假发票、虚开发票难以识别',
      '重复报销难以发现',
      '报销审批流程冗长',
      '税务稽查风险高'
    ],
    coreValue: [
      '假发票拦截率 ≥99.9%',
      '重复报销拦截率 100%',
      '报销审批时效 ≤24小时',
      '三单匹配自动完成'
    ],
    industries: ['全行业（特别是建筑、制造、贸易、服务业）'],
    keyMetrics: [
      { label: '假发票拦截', value: '≥99.9%' },
      { label: '重复报销拦截', value: '100%' },
      { label: '审批时效', value: '≤24小时' }
    ],
    color: 'red',
    gradient: 'from-red-500 to-pink-500',
    demoUrl: '/invoice-tax-platform/frontend'
  },
  {
    id: 'carbon-esg',
    name: '碳足迹ESG数据确权与核证',
    shortName: '碳足迹ESG',
    icon: '🌱',
    description: '实现产品/企业/园区级碳足迹全生命周期核算，支持减排量与绿色权益的确权与交易，满足ESG信息披露要求。',
    tagline: '双碳合规，ESG评级提升，吸引绿色投资',
    painPoints: [
      '双碳目标要求严格，缺乏核算工具',
      'ESG信息披露不完整，评级低',
      '碳资产无法有效确权和交易',
      '供应链碳中和要求难以满足'
    ],
    coreValue: [
      '碳资产交易收益 60-80万元/年',
      'ESG评级提升，吸引绿色投资',
      '满足供应链碳中和要求',
      '第三方可验证核证'
    ],
    industries: ['制造', '能源', '建筑', '交通', '消费品'],
    keyMetrics: [
      { label: '碳资产收益', value: '60-80万/年' },
      { label: 'ESG评级', value: '显著提升' },
      { label: '碳中和', value: '供应链协同' }
    ],
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-500',
    demoUrl: '/carbon-esg-platform/frontend'
  },
  {
    id: 'intellectual-property',
    name: '知识产权数实资产凭证与维权',
    shortName: '知识产权',
    icon: '⚖️',
    description: '实现设计图纸、创意素材、技术文档、检测报告等数字资产的确权存证，支持版权、专利、商标等知识产权的全生命周期管理。',
    tagline: '维权成功率≥80%，周期≤6个月',
    painPoints: [
      '数字资产确权困难，权属模糊',
      '侵权取证困难，维权周期长',
      '知识产权价值无法有效变现',
      '实物资产与数字凭证难以绑定'
    ],
    coreValue: [
      '维权成功率 ≥80%',
      '维权周期 ≤6个月',
      '年维权挽回损失 ≥500万元',
      '区块链时间戳，法律效力强'
    ],
    industries: ['设计', '创意', '软件', '制造', '文化传媒'],
    keyMetrics: [
      { label: '维权成功率', value: '≥80%' },
      { label: '维权周期', value: '≤6个月' },
      { label: '挽回损失', value: '≥500万/年' }
    ],
    color: 'indigo',
    gradient: 'from-indigo-500 to-purple-500',
    demoUrl: '/intellectual-property-platform/frontend'
  },
  {
    id: 'equipment-maintenance',
    name: '设备全生命周期与维保记录',
    shortName: '设备维保',
    icon: '⚙️',
    description: '实现设备从采购、安装、使用、维保到报废的全生命周期数字化管理，建立设备维护保养的可追溯体系，提高设备OEE。',
    tagline: 'OEE≥85%，非计划停机损失下降50%',
    painPoints: [
      '设备档案不完整，无法追溯',
      '非计划停机频繁，生产效率低',
      '维保记录不真实，责任不清',
      '设备寿命短，维保成本高'
    ],
    coreValue: [
      'OEE（综合设备效率）≥85%',
      '非计划停机损失下降 50%',
      '投资回收期 3-6个月',
      '预防性维护，延长设备寿命'
    ],
    industries: ['制造', '化工', '医疗', '物业', '电梯维保', '能源'],
    keyMetrics: [
      { label: 'OEE提升', value: '≥85%' },
      { label: '停机损失下降', value: '↓50%' },
      { label: '回收期', value: '3-6个月' }
    ],
    color: 'orange',
    gradient: 'from-orange-500 to-red-500',
    demoUrl: '/equipment-maintenance-platform/frontend'
  },
  {
    id: 'cross-border-compliance',
    name: '跨境合规协作',
    shortName: '跨境合规',
    icon: '🌐',
    description: '支持有境外业务的集团企业合规开展跨境数据协作，满足《数据出境安全评估办法》等监管要求，实现境内外系统合规隔离与有限互通。',
    tagline: '100%合规，避免千万级罚款风险',
    painPoints: [
      '数据出境合规要求复杂',
      '跨境业务协作效率低',
      '监管审计难以满足',
      '违规风险高，罚款可达千万'
    ],
    coreValue: [
      '100%合规（个保法/数据安全法/GDPR）',
      '支持跨境业务拓展',
      '避免数据出境违规（罚款可达千万）',
      '全流程操作留痕，满足监管审计'
    ],
    industries: ['跨国集团', '跨境电商', '出海企业', '外资企业'],
    keyMetrics: [
      { label: '合规率', value: '100%' },
      { label: '避免罚款', value: '千万级' },
      { label: '跨境协作', value: '高效安全' }
    ],
    color: 'violet',
    gradient: 'from-violet-500 to-purple-500',
    demoUrl: '/cross-border-compliance-platform/frontend'
  }
];

