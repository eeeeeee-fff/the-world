// particle-type-data.js
// Deterministic mock data generator for particle detail panels.
// The same particle.id always returns the same data via seeded RNG.

// ---------------------------------------------------------------------------
// Seeded pseudo-random number generator (Mulberry32)
// ---------------------------------------------------------------------------
function seededRng(seed) {
  let s = seed >>> 0;
  return function () {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Hash a string to a 32-bit unsigned integer
// ---------------------------------------------------------------------------
function hashStr(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (Math.imul(hash, 0x01000193)) >>> 0;
  }
  return hash;
}

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------
function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

function randInt(min, max, rng) {
  return min + Math.floor(rng() * (max - min + 1));
}

function randFloat(min, max, rng, decimals = 1) {
  const v = min + rng() * (max - min);
  return parseFloat(v.toFixed(decimals));
}

function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sample(arr, n, rng) {
  return shuffle(arr, rng).slice(0, n);
}

// Generate a date string within a year range (deterministic)
function randDate(startYear, endYear, rng) {
  const year = randInt(startYear, endYear, rng);
  const month = String(randInt(1, 12, rng)).padStart(2, '0');
  const day = String(randInt(1, 28, rng)).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ---------------------------------------------------------------------------
// Domain keyword pools
// ---------------------------------------------------------------------------
const RESEARCH_DIRECTIONS = {
  robot: ['运动控制', '机构设计', '路径规划', '力觉感知', '人机协作', '仿生学习'],
  bio: ['基因编辑', '蛋白质组学', '药物筛选', '细胞治疗', '神经影像', '生物信息'],
  energy: ['储能材料', '电化学', '光伏转换', '氢能技术', '电网调度', '热管理'],
  ai: ['深度学习', '强化学习', '大语言模型', '计算机视觉', '知识图谱', '联邦学习'],
  default: ['系统优化', '数据分析', '智能算法', '模型压缩', '迁移学习', '鲁棒控制'],
};

function resolveDirections(tags) {
  if (!tags) return RESEARCH_DIRECTIONS.default;
  const t = Array.isArray(tags) ? tags.join(' ') : String(tags);
  if (/机器人|机械|控制/.test(t)) return RESEARCH_DIRECTIONS.robot;
  if (/生物|医|药|基因/.test(t)) return RESEARCH_DIRECTIONS.bio;
  if (/能源|电池|储能|光伏|氢/.test(t)) return RESEARCH_DIRECTIONS.energy;
  if (/智能|AI|算法|学习|视觉/.test(t)) return RESEARCH_DIRECTIONS.ai;
  return RESEARCH_DIRECTIONS.default;
}

const CHINESE_SURNAMES = ['张', '王', '李', '刘', '陈', '杨', '赵', '黄', '吴', '周', '徐', '孙', '马', '胡', '林', '郭', '何', '高', '罗', '郑'];
const CHINESE_GIVEN = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀兰', '霞', '平', '刚', '桂英', '华', '博'];

function randName(rng) {
  return pick(CHINESE_SURNAMES, rng) + pick(CHINESE_GIVEN, rng);
}

const UNIVERSITIES = [
  '清华大学', '北京大学', '浙江大学', '上海交通大学', '复旦大学',
  '南京大学', '中国科学技术大学', '哈尔滨工业大学', '武汉大学', '同济大学',
  '华中科技大学', '西安交通大学', '天津大学', '东南大学', '北京航空航天大学',
];

const ENTERPRISES = [
  '华为技术', '腾讯科技', '阿里巴巴', '百度', '字节跳动',
  '大疆创新', '商汤科技', '旷视科技', '海康威视', '科大讯飞',
  '宁德时代', '比亚迪', '中芯国际', '联想集团', '小米科技',
];

const INSTITUTES = [
  '中国科学院自动化所', '中科院计算所', '中科院软件所', '国防科技大学',
  '航天科工集团', '电子科技集团', '中国信通院', '中科院深圳先进院',
];

const COLLAB_LABELS = ['合著', '同门', '师承', '项目合作'];

const TECH_TAG_POOL = [
  '深度学习', '强化学习', '计算机视觉', '自然语言处理', '知识图谱',
  '机器人控制', '边缘计算', '联邦学习', '目标检测', '语义分割',
  '点云处理', '具身智能', '大模型微调', '多模态融合', '仿真平台',
  '电机驱动', '伺服控制', '传感融合', '路径规划', '运动规划',
  '储能系统', '功率半导体', '氢燃料电池', '光伏逆变', '电池管理',
  '基因测序', '蛋白质预测', '药物合成', '临床数据挖掘', '医学影像分析',
  '工业互联网', '数字孪生', '智能制造', '供应链优化', '质量检测',
  '芯片设计', 'RISC-V', 'EDA工具', '存算一体', '光子计算',
];

const IPC_CODES = [
  { name: 'G06N 人工智能', base: 20 },
  { name: 'G06F 信息处理', base: 15 },
  { name: 'B25J 机器人', base: 18 },
  { name: 'H04L 数字通信', base: 12 },
  { name: 'G06T 图像处理', base: 10 },
  { name: 'A61B 医疗设备', base: 8 },
  { name: 'H01M 电化学', base: 14 },
  { name: 'G06Q 商业方法', base: 9 },
];

const PAPER_DOMAINS = [
  '机器学习', '计算机视觉', '自然语言处理', '机器人学', '控制理论', '优化方法',
  '生物信息', '材料科学', '能源存储', '信号处理', '网络安全', '量子计算',
];

const PAPER_KEYWORD_POOL = [
  '神经网络', '注意力机制', '迁移学习', '对比学习', '图神经网络',
  '变分推断', '元学习', '目标检测', '语义分割', '点云配准',
  '运动规划', '模型压缩', '知识蒸馏', '自监督学习', '多任务学习',
  '鲁棒优化', '在线学习', '贝叶斯推断', '强化学习', '生成对抗',
];

const JOURNAL_POOL = [
  'Nature', 'Science', 'IEEE TPAMI', 'NeurIPS', 'CVPR', 'ICML',
  'ICLR', 'ACM CHI', 'IJCAI', 'AAAI', 'IEEE TRO', 'Automatica',
];

// ---------------------------------------------------------------------------
// Talent generator
// ---------------------------------------------------------------------------
function generateTalentDetail(particle, rng) {
  const name = particle.name || particle.title || '未知人才';

  // --- Knowledge graph ---
  const nodeCount = randInt(7, 9, rng);
  const graphNodes = [{ id: 'self', label: name, type: 'self', weight: 3 }];
  const collabNames = [];
  for (let i = 1; i < nodeCount; i++) {
    const isCollab = i <= Math.ceil((nodeCount - 1) * 0.6);
    const type = isCollab ? 'collab' : 'institution';
    const label = isCollab
      ? randName(rng)
      : pick([...UNIVERSITIES, ...INSTITUTES], rng);
    const weight = randInt(1, 3, rng);
    const id = `n${i}`;
    graphNodes.push({ id, label, type, weight });
    if (isCollab) collabNames.push(id);
  }
  const graphLinks = [];
  graphNodes.slice(1).forEach((node) => {
    if (node.type === 'collab') {
      graphLinks.push({ from: 'self', to: node.id, label: pick(COLLAB_LABELS, rng) });
    } else {
      graphLinks.push({ from: 'self', to: node.id, label: '所属机构' });
    }
  });
  // Add a few collab-to-collab links
  if (collabNames.length >= 2) {
    const extraCount = randInt(1, Math.min(3, collabNames.length - 1), rng);
    for (let i = 0; i < extraCount; i++) {
      const a = collabNames[i];
      const b = collabNames[i + 1];
      graphLinks.push({ from: a, to: b, label: pick(COLLAB_LABELS, rng) });
    }
  }

  // --- Radar: research directions ---
  const dirPool = resolveDirections(particle.tags);
  const directions = dirPool.map((name) => ({
    name,
    value: randInt(40, 100, rng),
  }));

  // --- Publication trend ---
  const years = ['2020', '2021', '2022', '2023', '2024'];
  const papers = years.map(() => randInt(2, 18, rng));
  const patents = years.map(() => randInt(0, 8, rng));
  const pubTrend = { years, papers, patents };

  // --- Activities ---
  const actTypes = ['paper', 'patent', 'award', 'project'];
  const actTitles = {
    paper: ['发表顶会论文', '期刊收录', 'Nature子刊发文', '综述论文被引', 'SCI论文录用'],
    patent: ['发明专利授权', '实用新型授权', 'PCT申请公开', '专利转让完成', '核心专利授权'],
    award: ['获国家自然科学奖', '获省科技进步奖', '获最佳论文奖', '入选杰青计划', '荣获青年科学家奖'],
    project: ['重点研发计划立项', '国家自然科学基金获批', '横向课题签约', '国际合作项目启动', '重大专项参与'],
  };
  const activities = [];
  for (let i = 0; i < 5; i++) {
    const type = pick(actTypes, rng);
    activities.push({
      date: randDate(2022, 2025, rng),
      type,
      title: pick(actTitles[type], rng),
      tag: pick(['顶会', '一区', 'SCI', 'EI', '国家级', '省级'], rng),
      impact: rng() > 0.3 ? '利好' : '中性',
    });
  }
  activities.sort((a, b) => b.date.localeCompare(a.date));

  // --- KPI metrics ---
  const totalPapers = papers.reduce((a, b) => a + b, 0);
  const totalPatents = patents.reduce((a, b) => a + b, 0);
  const metrics = [
    { label: '发表论文', value: totalPapers },
    { label: '授权专利', value: totalPatents },
    { label: 'H指数', value: randInt(8, 35, rng) },
    { label: '合作机构', value: randInt(5, 20, rng) },
  ];

  return { graphNodes, graphLinks, directions, pubTrend, activities, metrics };
}

// ---------------------------------------------------------------------------
// Enterprise generator
// ---------------------------------------------------------------------------
function generateEnterpriseDetail(particle, rng) {
  // --- Tech tag cloud ---
  const tagCount = randInt(14, 18, rng);
  const poolCopy = shuffle(TECH_TAG_POOL, rng);
  const techTags = poolCopy.slice(0, tagCount).map((label) => ({
    label,
    weight: randInt(1, 5, rng),
  }));

  // --- Talent types donut ---
  const talentTypeNames = ['算法工程师', '硬件工程师', '研究员', '产品经理', '软件工程师', '测试工程师'];
  const selectedTypes = sample(talentTypeNames, randInt(5, 6, rng), rng);
  const talentTypes = selectedTypes.map((name) => ({
    name,
    value: randInt(20, 200, rng),
  }));

  // --- Output trend stacked bar ---
  const years = ['2020', '2021', '2022', '2023', '2024'];
  const base = randInt(10, 40, rng);
  const outPatents = years.map((_, i) => base + randInt(i * 2, i * 6 + 5, rng));
  const outPapers = years.map((_, i) => Math.floor(base * 0.4) + randInt(i, i * 3 + 3, rng));
  const outputTrend = { years, patents: outPatents, papers: outPapers };

  // --- Partners ---
  const partnerCount = randInt(6, 8, rng);
  const partners = [];
  const partnerLinks = [];
  const partnerTypes = ['university', 'enterprise', 'institute'];
  for (let i = 0; i < partnerCount; i++) {
    const type = pick(partnerTypes, rng);
    const namePool =
      type === 'university' ? UNIVERSITIES
      : type === 'enterprise' ? ENTERPRISES
      : INSTITUTES;
    const id = `p${i}`;
    partners.push({
      id,
      name: pick(namePool, rng),
      type,
      strength: randInt(1, 3, rng),
    });
    partnerLinks.push({ from: 'self', to: id, weight: randInt(1, 3, rng) });
  }

  // --- KPI ---
  const metrics = [
    { label: '核心专利', value: randInt(50, 800, rng) },
    { label: '研发人员', value: randInt(100, 5000, rng) },
    { label: '合作机构', value: randInt(10, 80, rng) },
    { label: '技术方向', value: randInt(5, 20, rng) },
  ];

  // --- Activities ---
  const actTypes = ['patent', 'paper', 'cooperation', 'product'];
  const actTitleMap = {
    patent: ['核心专利群授权', '发明专利授权', 'PCT专利获批', '战略专利布局完成'],
    paper: ['联合发表顶会论文', '白皮书发布', '技术报告公开', '研究成果发表'],
    cooperation: ['与高校联合实验室成立', '产学研合作签约', '战略合作协议签署', '联合研发项目启动'],
    product: ['新产品发布', '解决方案推出', '技术平台上线', '产品版本迭代'],
  };
  const activities = [];
  for (let i = 0; i < randInt(4, 5, rng); i++) {
    const type = pick(actTypes, rng);
    activities.push({
      date: randDate(2022, 2025, rng),
      type,
      title: pick(actTitleMap[type], rng),
      tag: pick(['专利', '论文', '合作', '产品', '战略'], rng),
      impact: rng() > 0.25 ? '利好' : '中性',
    });
  }
  activities.sort((a, b) => b.date.localeCompare(a.date));

  return { techTags, talentTypes, outputTrend, partners, partnerLinks, metrics, activities };
}

// ---------------------------------------------------------------------------
// Paper generator
// ---------------------------------------------------------------------------
function generatePaperDetail(particle, rng) {
  const paperTitle = particle.title || particle.name || '未知论文';

  // --- Citation network ---
  const nodeCount = randInt(8, 10, rng);
  const selfNode = {
    id: 'self',
    label: paperTitle.length > 16 ? paperTitle.slice(0, 16) + '…' : paperTitle,
    year: randInt(2020, 2024, rng),
    citations: randInt(20, 300, rng),
    type: 'self',
  };
  const citationNodes = [selfNode];
  for (let i = 1; i < nodeCount; i++) {
    const isCited = i <= Math.floor((nodeCount - 1) * 0.55);
    const domainShort = pick(PAPER_DOMAINS, rng);
    const journal = pick(JOURNAL_POOL, rng);
    const shortLabel = `${domainShort}(${journal})`;
    citationNodes.push({
      id: `c${i}`,
      label: shortLabel,
      year: randInt(2018, 2024, rng),
      citations: randInt(10, 500, rng),
      type: isCited ? 'cited' : 'citing',
    });
  }
  const citationLinks = citationNodes.slice(1).map((node) => ({
    from: node.type === 'cited' ? 'self' : node.id,
    to: node.type === 'cited' ? node.id : 'self',
  }));

  // --- Radar: domain strength ---
  const domainPool = sample(PAPER_DOMAINS, 6, rng);
  const domains = domainPool.map((name) => ({ name, value: randInt(30, 95, rng) }));

  // --- Keyword horizontal bar ---
  const kwCount = randInt(8, 10, rng);
  const kwPool = shuffle(PAPER_KEYWORD_POOL, rng).slice(0, kwCount);
  const keywords = kwPool.map((word) => ({ word, weight: randInt(40, 100, rng) }));
  keywords.sort((a, b) => b.weight - a.weight);

  // --- Related papers scatter ---
  const rpCount = randInt(10, 14, rng);
  const relatedPapers = [];
  for (let i = 0; i < rpCount; i++) {
    relatedPapers.push({
      name: pick(JOURNAL_POOL, rng) + ' ' + randInt(2018, 2024, rng),
      year: randInt(2018, 2024, rng),
      citations: randInt(10, 500, rng),
      domain: pick(PAPER_DOMAINS, rng),
    });
  }

  // --- KPI ---
  const metrics = [
    { label: '引用次数', value: selfNode.citations },
    { label: 'IF影响因子', value: randFloat(2, 25, rng, 2) },
    { label: '作者数', value: randInt(2, 12, rng) },
    { label: '相关论文', value: rpCount },
  ];

  // --- Authors ---
  const authorCount = randInt(3, 5, rng);
  const orgPool = [...UNIVERSITIES, ...INSTITUTES];
  const authors = [];
  for (let i = 0; i < authorCount; i++) {
    authors.push({
      name: randName(rng),
      org: pick(orgPool, rng),
      isMain: i === 0,
    });
  }

  return { citationNodes, citationLinks, domains, keywords, relatedPapers, metrics, authors };
}

// ---------------------------------------------------------------------------
// Patent generator
// ---------------------------------------------------------------------------
function generatePatentDetail(particle, rng) {
  // --- Tech tree (treemap) ---
  const topCategories = [
    { name: '核心算法', subs: ['推理加速', '训练优化', '模型压缩', '联邦学习'] },
    { name: '系统架构', subs: ['分布式调度', '存储管理', '通信协议', '安全隔离'] },
    { name: '应用场景', subs: ['工业检测', '自动驾驶', '医疗影像', '智能交互'] },
    { name: '硬件平台', subs: ['芯片设计', '传感器', '执行器', '嵌入式系统'] },
  ];
  const topCount = randInt(3, 4, rng);
  const techTree = sample(topCategories, topCount, rng).map((cat) => {
    const childCount = randInt(2, 3, rng);
    const children = sample(cat.subs, childCount, rng).map((name) => ({
      name,
      value: randInt(5, 40, rng),
    }));
    return { name: cat.name, value: children.reduce((s, c) => s + c.value, 0), children };
  });

  // --- Filing trend ---
  const years = ['2020', '2021', '2022', '2023', '2024'];
  const baseCount = randInt(5, 25, rng);
  const counts = years.map((_, i) => baseCount + randInt(i * 2, i * 5 + 8, rng));
  const filingTrend = { years, counts };

  // --- Co-applicants ---
  const claimantCount = randInt(5, 7, rng);
  const claimants = [];
  const claimantLinks = [];
  const cTypes = ['enterprise', 'university', 'person'];
  for (let i = 0; i < claimantCount; i++) {
    const type = pick(cTypes, rng);
    const namePool =
      type === 'enterprise' ? ENTERPRISES
      : type === 'university' ? UNIVERSITIES
      : null;
    const name = namePool ? pick(namePool, rng) : randName(rng);
    const id = `cl${i}`;
    claimants.push({ id, name, type, patents: randInt(10, 200, rng) });
    claimantLinks.push({ from: 'self', to: id, weight: randInt(1, 3, rng) });
  }

  // --- IPC distribution ---
  const ipcCount = randInt(4, 6, rng);
  const ipcPool = shuffle(IPC_CODES, rng).slice(0, ipcCount);
  const ipcDist = ipcPool.map((item) => ({
    name: item.name,
    value: item.base + randInt(0, 20, rng),
  }));

  // --- KPI ---
  const metrics = [
    { label: '权利要求数', value: randInt(5, 30, rng) },
    { label: '引用专利', value: randInt(5, 50, rng) },
    { label: '被引次数', value: randInt(0, 80, rng) },
    { label: '有效年限', value: randInt(1, 20, rng) },
  ];

  // --- Activities ---
  const patActTypes = ['grant', 'transfer', 'citation', 'litigation'];
  const patActTitles = {
    grant: ['发明专利授权', '实用新型授权', '外观设计授权', '发明专利公开'],
    transfer: ['专利技术转让', '独占许可签署', '普通许可协议', '专利质押融资'],
    citation: ['被重要专利引用', '被多方引用', '进入专利族', '国际同族公开'],
    litigation: ['专利无效宣告', '侵权诉讼立案', '无效宣告撤回', '专利确权完成'],
  };
  const activities = [];
  for (let i = 0; i < randInt(4, 5, rng); i++) {
    const type = pick(patActTypes, rng);
    activities.push({
      date: randDate(2020, 2025, rng),
      type,
      title: pick(patActTitles[type], rng),
      tag: pick(['授权', '转让', '引用', '诉讼', 'PCT', '有效'], rng),
      impact: rng() > 0.3 ? '利好' : '中性',
    });
  }
  activities.sort((a, b) => b.date.localeCompare(a.date));

  return { techTree, filingTrend, claimants, claimantLinks, ipcDist, metrics, activities };
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------
export function generateParticleDetail(particle) {
  const seed = hashStr(String(particle.id));
  const rng = seededRng(seed);

  switch (particle.category) {
    case 'Talent':
      return generateTalentDetail(particle, rng);
    case 'Enterprise':
      return generateEnterpriseDetail(particle, rng);
    case 'Paper':
      return generatePaperDetail(particle, rng);
    case 'Patent':
      return generatePatentDetail(particle, rng);
    default:
      return generateTalentDetail(particle, rng);
  }
}
