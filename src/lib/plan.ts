export type TaskTag = 'out' | 'skip' | 'ms' | 'fix' | 'opt'

export interface PlanTask {
  t: string
  tag?: TaskTag
}

export interface PlanPhase {
  id: string
  block: 'base' | 'theory' | 'core' | 'final'
  short: string
  name: string
  sub: string
  days: number
  why: string
  /** 当前章节目标（展示在仪表盘与学习路线卡片） */
  goals: string[]
  deep: string[]
  skim: string[]
  skip: string[]
  outputs: string[]
  /** 本阶段学习建议（嵌入仪表盘与路线卡片，无独立菜单） */
  advice: string[]
  anchor: string
  tasks: PlanTask[]
}

export interface PlanMilestone {
  pid: string
  label: string
  hard: boolean
}

export const COURSE_URL = 'https://ke.mjedu.vip/person/home/0/course'
export const OFFER_DATE = '2027-03-31'
export const ANCHOR_DATE = '2026-09-14'

/** 重点章节（short 中带 ⭐ 标记）：展示时去掉星星、标题标红 */
export const isKeyPhase = (p: PlanPhase) => p.short.includes('⭐')
export const phaseShort = (p: PlanPhase) => p.short.replace(/\s*⭐\s*/g, '').trim()

export const BLOCK_NAME: Record<PlanPhase['block'], string> = {
  base: '语言基础',
  theory: '理论篇',
  core: '核心章',
  final: '实战求职',
}

/** 黑白设计：四个 block 用灰阶明度阶梯区分（越靠后越浅），final 最浅需配深色文字（见 BLOCK_FG） */
export const BLOCK_COLOR: Record<PlanPhase['block'], string> = {
  base: '#262626',
  theory: '#4d4d4d',
  core: '#6f6f6f',
  final: '#9c9c9c',
}

export const BLOCK_FG: Record<PlanPhase['block'], string> = {
  base: '#ffffff',
  theory: '#ffffff',
  core: '#ffffff',
  final: '#262626',
}

export const TAG_LABEL: Record<TaskTag, string> = {
  out: '产出',
  skip: '略读/跳过',
  ms: '里程碑',
  fix: '自补',
  opt: '可选',
}

export const PLAN = {
  phases: [
    {
      id: 'P0', block: 'base', short: 'NumPy / Pandas', name: 'NumPy / Pandas 数据处理',
      sub: '大模型语言基础 · 1 周', days: 7,
      why: '余弦相似度是 RAG 向量检索的心脏；Pandas 是知识库入库前的日常清洗工具。',
      goals: [
        '会算向量点积与余弦相似度，为 RAG 检索打地基',
        '能用 Pandas 完成知识库数据的清洗与导出',
      ],
      deep: [
        'Numpy 数组创建 / 属性 / 类型转换 / 常用函数',
        'Numpy 矩阵运算：点积、内积、范数',
        'Pandas Series / DataFrame 增删改查、逻辑过滤、apply',
        'Pandas csv / excel 读写',
      ],
      skim: ['Jupyter 环境半小时搞定', '统计函数过一遍即可'],
      skip: ['可视化图表（条形 / 线形 / 饼图）—— Agent 开发几乎不用'],
      outputs: ['用 Numpy 手写余弦相似度矩阵', '用 Pandas 清洗脏 CSV 并导出'],
      advice: ['可视化图表直接跳过，别恋战', '两个产出脚本当晚就写，别只看课'],
      anchor: '→ 直接服务于第 5 章 RAG 的向量化检索与数据预处理',
      tasks: [
        { t: 'Numpy：数组创建 / 属性 / 类型转换（2-2 · 03-05）' },
        { t: 'Numpy：常用函数、去重与排序（06-07）' },
        { t: 'Numpy：矩阵运算——点积 / 内积 / 范数（08）' },
        { t: 'Pandas：Series / DataFrame 创建与常用属性（14-16）' },
        { t: 'Pandas：DataFrame 行列增删改查（17-21）' },
        { t: 'Pandas：基础运算、逻辑过滤与 apply（22-26）' },
        { t: 'Pandas：csv / excel 文件读写（27）' },
        { t: '产出：Numpy 手写余弦相似度（向量相似度矩阵）', tag: 'out' },
        { t: '产出：Pandas 清洗一份脏 CSV 并导出', tag: 'out' },
        { t: '确认跳过：可视化图表课程', tag: 'skip' },
      ],
    },
    {
      id: 'P1', block: 'theory', short: 'AI 认知体系', name: '第1章 · AI 认知体系与行业趋势',
      sub: '大模型开发与应用 · 1 周', days: 7,
      why: '选型方法论（RAG vs 微调 vs 长上下文 / Workflow vs Agent）是项目一技术方案的骨架，也是面试表达的地基。',
      goals: [
        '对照真实 JD 说清 Agent 工程师能力模型',
        '用选型模板为项目一写出《立项决策单》',
      ],
      deep: [
        '1-3 行业格局与岗位画像（RAG / Agent / LLM 应用岗）',
        '1-5 选型方法论：方案对比、成本权衡、立项模板',
      ],
      skim: ['1-1 课程导学', '1-2 技术演进主线', '1-4 技术趋势（TTS / MoE / 多 Agent / 长上下文）'],
      skip: [],
      outputs: ['《岗位能力对照表》：5 份真实 JD 对照课程', '用 1-5 模板为项目一写《立项决策单》'],
      advice: ['2 倍速过概念章，精读 1-5 选型方法论', '对照 5 份真实 JD 输出能力对照表'],
      anchor: '→ 项目一技术方案骨架 + 面试表达框架',
      tasks: [
        { t: '1-1 ~ 1-2：课程导学与 AI 技术演进主线（2 倍速）' },
        { t: '精读 1-3：行业格局、企业应用分层、岗位画像' },
        { t: '精读 1-4：Test-Time Scaling / MoE / 多 Agent / 多模态 / 长上下文' },
        { t: '精读 1-5：选型方法论 + 项目立项决策模板' },
        { t: '产出：《岗位能力对照表》（5 份真实 JD）', tag: 'out' },
        { t: '产出：项目一《立项决策单》', tag: 'out' },
      ],
    },
    {
      id: 'P2', block: 'theory', short: '机器学习（压缩）', name: '第2章 · 机器学习与特征工程',
      sub: '限时压缩 · 2 周', days: 14,
      why: '只需留下数学直觉：SVD / Embedding / 偏差方差。表格建模与 SHAP 是算法岗内容，用「三问法」略读即可。',
      goals: [
        '建立向量 / SVD / Embedding 的数学直觉',
        '能讲清偏差—方差权衡，形成面试八股底子',
      ],
      deep: [
        '2-5 数学基础：向量空间 / 线性变换 / 特征值与 SVD / 低秩近似与 Embedding',
        '2-6 概率统计：贝叶斯 / 偏差—方差权衡 / 过拟合与正则化',
      ],
      skim: ['2-1 AutoML', '2-2 特征工程体系', '2-3 LightGBM / CatBoost / XGBoost', '2-4 SHAP / LIME 可解释性'],
      skip: ['项目 3~7（表格类实战）'],
      outputs: ['笔记《从 SVD 到 Embedding》', '八股自测：偏差方差权衡'],
      advice: ['全章用三问法过滤，只精学数学基础', '项目 3~7 全跳，严禁陷进特征工程'],
      anchor: '→ 数学是第 3 章 Attention 公式看懂的前提',
      tasks: [
        { t: '精学 2-5：向量空间 / 线性变换 / 内积与范数' },
        { t: '精学 2-5：特征值分解与 SVD' },
        { t: '精学 2-5：低秩近似与 Embedding 思想的关系' },
        { t: '精学 2-6：贝叶斯思想 / 先验后验' },
        { t: '精学 2-6：偏差—方差权衡 / 过拟合与正则化' },
        { t: '略读 2-1：AutoML（三问法）', tag: 'skip' },
        { t: '略读 2-2：特征工程体系（三问法）', tag: 'skip' },
        { t: '略读 2-3：表格模型三件套（三问法）', tag: 'skip' },
        { t: '略读 2-4：SHAP / LIME（三问法）', tag: 'skip' },
        { t: '确认跳过：项目 3~7 表格类实战', tag: 'skip' },
        { t: '产出：笔记《从 SVD 到 Embedding》', tag: 'out' },
        { t: '产出：八股自测——讲清偏差方差权衡', tag: 'out' },
      ],
    },
    {
      id: 'P3', block: 'theory', short: 'DL · Transformer', name: '第3章 · 深度学习与 Transformer',
      sub: '理论主菜 · 3 周', days: 21,
      why: '读懂模型黑盒：后面 5-1 的架构解析、显存与成本估算、KV Cache、量化部署全部建立在这一章。',
      goals: [
        '手推 Scaled Dot-Product Attention 全公式',
        '从零手写 Mini-GPT 并跑通训练与采样',
      ],
      deep: [
        '3-1 深度学习核心：前向/反向传播、Adam、学习率调度、PyTorch 规范',
        '3-2 Attention 起源 + Scaled Dot-Product + Multi-Head + RoPE',
        '3-3 手写 GPT：Block / 因果掩码 / 自回归目标',
        '项目 8：Mini-GPT 训练与采样',
      ],
      skim: ['3-4 ViT（懂 Patch Embedding 思想）', '3-5 量化 / 剪枝 / 蒸馏（FP16 / INT8 / GPTQ-AWQ 概念）'],
      skip: [],
      outputs: ['Mini-GPT 仓库跑通 + loss 曲线', '博客《手写 Mini-GPT 记录》'],
      advice: ['公式必须手推一遍，代码先自己写再对照', 'Mini-GPT 是本阶段唯一硬产出，务必跑通'],
      anchor: '→ 5-1 大模型架构解析的直接前置；面试最高频考题',
      tasks: [
        { t: 'W1：3-1 前向 / 反向传播、损失函数、梯度下降' },
        { t: 'W1：3-1 Adam 优化器 / 学习率调度 / PyTorch 开发规范' },
        { t: 'W1：3-2 Seq2Seq → Attention，Q/K/V 本质理解' },
        { t: 'W2：3-2 Scaled Dot-Product 公式逐项拆解' },
        { t: 'W2：3-2 Multi-Head Attention / Encoder-Decoder 结构' },
        { t: 'W2：3-2 位置编码：正弦余弦 → RoPE' },
        { t: 'W2：3-3 手写 Transformer Block + 因果掩码' },
        { t: 'W3：项目 8 Mini-GPT：Tokenizer + 训练循环', tag: 'out' },
        { t: 'W3：Mini-GPT：Top-k / Top-p 采样 + loss 曲线', tag: 'out' },
        { t: '略读 3-4 ViT / 3-5 量化蒸馏（概念级）', tag: 'skip' },
        { t: '产出：博客《手写 Mini-GPT 记录》', tag: 'out' },
        { t: '验收：白板画出 Transformer Block、讲清 Q/K/V', tag: 'ms' },
      ],
    },
    {
      id: 'P4', block: 'theory', short: '多模态（略读）', name: '第4章 · 多模态 AI 工程',
      sub: '略读周 · 1 周', days: 7,
      why: '只取对主线有用的部分：CLIP / LLaVA / 多模态 RAG，服务项目三与项目一的图文知识库。',
      goals: [
        '讲清 CLIP 双塔对齐与 LLaVA 三件套结构',
        '知道多模态 RAG 怎么进项目一的图文知识库',
      ],
      deep: [
        '4-3 CLIP：对比学习 / 双塔结构 / 零样本分类',
        '4-3 LLaVA：视觉编码器 + 投影层 + LLM',
        '4-4 多模态 RAG：OCR 联合检索 / 图文知识库融合',
      ],
      skim: ['4-1 YOLO / 4-2 SAM（知道是什么即可）', '4-5 视频理解与端侧部署'],
      skip: ['项目 9 工业缺陷检测', '项目 10 自动分割系统'],
      outputs: ['（可选）项目 11 图文检索系统简化版'],
      advice: ['只精学 CLIP / LLaVA / 多模态 RAG 三块', 'YOLO / SAM 知道是什么即可，2 倍速过'],
      anchor: '→ 项目三多模态平台 + 项目一图文知识库',
      tasks: [
        { t: '精学 4-3：CLIP 对比学习 / 图文对齐 / 零样本分类' },
        { t: '精学 4-3：LLaVA 架构与多模态指令微调思想' },
        { t: '精学 4-4：多模态 RAG（OCR 联合检索 / 图文知识库）' },
        { t: '略读 4-1 YOLO / 4-2 SAM / 4-5 视频理解', tag: 'skip' },
        { t: '确认跳过：项目 9 缺陷检测 / 项目 10 自动分割', tag: 'skip' },
        { t: '可选：项目 11 图文检索系统简化版', tag: 'opt' },
      ],
    },
    {
      id: 'P5', block: 'core', short: 'RAG 核心 ⭐', name: '第5章 · 大模型与 RAG 系统',
      sub: '核心主战场 · 5 周', days: 35,
      why: '项目一的骨架：企业知识库问答的完整链路——切分、检索、重排、生成、评估、权限，逐环动手。',
      goals: [
        '独立搭出企业知识库问答系统 v1',
        '拿出 Rerank + 混合检索 + 量化评估报告',
      ],
      deep: [
        '5-1 GPT vs LLaMA / Token 与上下文 / 显存与成本估算',
        '5-2 Prompt 工程：CoT / ReAct / 结构化输出 / JSON Schema',
        '5-3 切分策略 / 向量化 / 向量数据库 + 项目 12',
        '5-4 混合检索 / Rerank / HyDE / 多跳 / 问题诊断',
        '5-5 多路召回 / 权限隔离 / 增量更新 / 评估体系',
      ],
      skim: [],
      skip: [],
      outputs: ['企业知识库问答系统 v1（可演示 + 有评估指标）', 'Ragas 量化评估报告'],
      advice: ['W2 就动手搭项目 12，边学边升级', '评估指标要落进报告，别停留在概念'],
      anchor: '→ 项目一（智能客服）的主体；简历核心项目',
      tasks: [
        { t: 'W1：5-1 GPT vs LLaMA 架构 / Token 与上下文窗口' },
        { t: 'W1：5-1 显存计算与推理成本估算' },
        { t: 'W1：5-2 Prompt 工程：CoT / ReAct / 结构化输出 / JSON Schema' },
        { t: 'W1：5-2 Prompt 版本管理与 A/B 测试思维' },
        { t: 'W2：5-3 RAG 原理与文档切分策略' },
        { t: 'W2：5-3 Embedding 与向量数据库（FAISS / Milvus / Chroma）' },
        { t: '项目 12：基础 RAG 系统（导入→切分→检索→生成→问答页）', tag: 'out' },
        { t: 'W3：5-4 混合检索：BM25 + 向量 + 分数融合' },
        { t: 'W3：5-4 Cross-Encoder Rerank 重排序' },
        { t: 'W3：5-4 查询改写 / HyDE / 多跳检索' },
        { t: 'W3：5-4 五类问题诊断（检索不到 / 不准 / 幻觉 / 污染 / 稀释）' },
        { t: 'W4：5-5 多路召回 / 文档级权限隔离 / 增量索引更新' },
        { t: 'W4：5-5 评估体系：命中率 / MRR / NDCG / LLM-as-Judge' },
        { t: '升级项目 12：接 Rerank + 混合检索 + 评估脚本', tag: 'out' },
        { t: '自补：Ragas 评测集 + 量化评估报告', tag: 'fix' },
        { t: '用纯代码重写 Dify 企业知识库篇的成果' },
        { t: '里程碑：企业知识库问答系统 v1 可演示', tag: 'ms' },
      ],
    },
    {
      id: 'P6', block: 'core', short: 'Agent 核心 ⭐', name: '第6章 · Agent 系统与 AI 工程化',
      sub: '核心主战场 · 6 周', days: 42,
      why: '项目一的「大脑」：ReAct / 工具调用 / 记忆 / 多 Agent 协作，加上 LangGraph、MCP、FastAPI、Docker 的完整交付链。',
      goals: [
        '用 LangGraph 编排多 Agent 并接入 MCP',
        '四个 Agent 项目 + 全服务 Docker 化',
      ],
      deep: [
        '6-1 ReAct / Tool Calling / Memory（项目 13、14）',
        '6-2 Plan-and-Solve / Reflection / LATS（项目 15、16）',
        '6-3 多 Agent：AutoGen / CrewAI + 协作模式（项目 17）',
        '6-4 LangGraph 状态机 + 异常处理 / 成本 / 评估',
        '6-5 MCP 协议 + 项目 18 自定义 MCP Server',
        '6-6 FastAPI / Docker / K8s / 监控可观测',
      ],
      skim: [],
      skip: [],
      outputs: ['4 个 Agent 项目 + LangGraph 重写版', 'MCP Server（封装 RAG 知识库为工具）', '全部服务 Docker 化'],
      advice: ['LangGraph 课程只有 1 节，务必官方教程加餐', 'MCP Server 直接封装你的 RAG 知识库，打通第 5 章'],
      anchor: '→ 项目一的大脑 + 项目二多 Agent 的主体；求职硬门槛',
      tasks: [
        { t: 'W1：6-1 ReAct 模式 / Tool Calling / Memory 设计' },
        { t: '项目 13：工具调用型问答 Agent', tag: 'out' },
        { t: '项目 14：具备记忆的多轮对话 Agent', tag: 'out' },
        { t: 'W2：6-2 Plan-and-Solve / Reflection / LATS' },
        { t: '项目 15：任务规划 Agent + 项目 16：反思纠错 Agent', tag: 'out' },
        { t: '自补：OpenAI Agents SDK 或 Anthropic Agent SDK（任选其一）', tag: 'fix' },
        { t: 'W3：6-3 多 Agent 协作（AutoGen / CrewAI）+ 四种协作模式' },
        { t: '项目 17：AI 团队模拟系统', tag: 'out' },
        { t: 'W4：6-4 LangGraph：节点 / 边 / 状态流转（课程 + 官方教程加餐）', tag: 'fix' },
        { t: '用 LangGraph 重写项目 14 / 15', tag: 'out' },
        { t: 'W4：6-4 异常处理 / 成本优化 / Agent 评估体系' },
        { t: 'W5：6-5 MCP 协议 + 项目 18：自定义 MCP Server（封装 RAG 知识库）', tag: 'out' },
        { t: 'W6：6-6 FastAPI 服务化（重点 SSE 流式）+ Docker + K8s 基础' },
        { t: '里程碑：全部服务 Docker 化 + MCP Server 可对接', tag: 'ms' },
      ],
    },
    {
      id: 'P7', block: 'final', short: '综合项目 ⭐', name: '第7章 · 综合项目与商业落地',
      sub: '作品集冲刺 · 6 周', days: 42,
      why: '把前六章集成进作品集：项目一做到上线级并加入前端差异化亮点，项目二完整跑通多 Agent 协作。',
      goals: [
        '项目一做到上线级并融入前端差异化亮点',
        '产出两个上线作品 + 三版本简历',
      ],
      deep: [
        '项目一：企业级智能客服（RAG + Agent + 多轮记忆 + 分流转人工 + FastAPI）',
        '项目一前端亮点：SSE 流式 UI / 工具调用可视化 / 引用溯源',
        '项目二：AI 科研助手（四角色多 Agent，LangGraph 编排）',
        '7-6 面试表达：把项目翻译成业务价值语言',
      ],
      skim: ['项目三：多模态内容平台（精简版）', '7-4 企业级交付规范'],
      skip: [],
      outputs: ['上线级作品 ×2（GitHub + 架构图 + 部署手册）', '简历三版本：RAG 岗 / Agent 岗 / LLM 应用岗'],
      advice: ['前端亮点自研：SSE 流式 UI + 引用溯源', '时间不够就砍项目三，保项目一 / 二'],
      anchor: '→ 面试作品集 = 前 199 天所有积累的集成考试',
      tasks: [
        { t: '项目一：工单 Agent（工具调用查订单 / 建工单 / 查知识库）' },
        { t: '项目一：多轮记忆 + 会话状态 MySQL 落库' },
        { t: '项目一：意图识别分流（FAQ 直答 / Agent 接手 / 转人工）' },
        { t: '项目一：FastAPI 部署 + Docker 容器化' },
        { t: '项目一：前端亮点——SSE 流式 UI / 工具调用可视化 / 引用溯源面板', tag: 'out' },
        { t: '项目一：README + 架构图 + 部署手册（按 7-4 交付规范）', tag: 'out' },
        { t: '项目二：四角色多 Agent 科研助手（LangGraph 编排）', tag: 'out' },
        { t: '可选：项目三多模态平台精简版', tag: 'opt' },
        { t: '7-6：把项目翻译成业务价值语言 + 面试演练' },
        { t: '产出：简历三版本（RAG / Agent / LLM 应用岗）', tag: 'out' },
        { t: '里程碑：两个上线级作品 + 简历定稿', tag: 'ms' },
      ],
    },
    {
      id: 'P8', block: 'final', short: '求职冲刺', name: '求职冲刺',
      sub: '投递与面试 · 3.5 周', days: 24,
      why: '把能力换成 offer：八股、投递、复盘、迭代，每日定量推进。',
      goals: ['八股通关，面试把项目讲成业务价值', '拿到 Agent 开发 offer'],
      deep: [
        '八股：Transformer / RAG 全链路 / Agent 设计模式 / MCP / LangGraph / 成本优化',
        '投递与面试复盘',
        '简历迭代 + 作品 demo 录制',
      ],
      skim: [],
      skip: [],
      outputs: ['offer 🎯'],
      advice: ['每日定量投递，每场面试必复盘', '用业务价值语言重写项目描述'],
      anchor: '→ 目标 2027-03-31 前落地',
      tasks: [
        { t: '八股：Transformer / Attention / 训练原理' },
        { t: '八股：RAG 全链路与调优案例' },
        { t: '八股：Agent 设计模式 / MCP / LangGraph / 成本优化' },
        { t: '每日定量投递 + 每场面试复盘迭代简历' },
        { t: '目标：拿到 Agent 开发 offer 🎯', tag: 'ms' },
      ],
    },
  ] as PlanPhase[],

  milestones: [
    { pid: 'P3', label: 'Mini-GPT 跑通，能白板讲 Transformer', hard: false },
    { pid: 'P5', label: 'RAG 系统可演示 + 量化评估指标', hard: true },
    { pid: 'P6', label: 'LangGraph / MCP / FastAPI / Docker 工具链齐', hard: true },
    { pid: 'P7', label: '两个上线作品 + 简历定稿', hard: true },
    { pid: 'P8', label: '拿到 Agent 开发 offer 🎯', hard: true },
  ] as PlanMilestone[],
}

export const ABILITIES = [
  'Python 工程能力（函数 / OOP / 异常 / 文件）',
  'SQL 与数据落库（会话 / 工单持久化）',
  '数学直觉：向量 / SVD / Embedding',
  '能讲清 Attention 与 Transformer Block',
  '从零手写 Mini-GPT 并跑通训练',
  'Prompt 工程：CoT / ReAct / 结构化输出',
  'RAG 全链路：切分 / 混合检索 / Rerank / 评估',
  'Agent 四件套：ReAct / 记忆 / 规划 / 反思',
  '多 Agent 编排（AutoGen / CrewAI）',
  'LangGraph 状态机工作流',
  '自定义 MCP Server',
  'FastAPI + Docker 服务化部署',
  '前端差异化：SSE 流式 AI 界面 / 可视化',
  '简历三版本 + 面试业务表达',
]

export const PORTFOLIO = [
  {
    n: '① 企业级智能客服系统',
    tag: '旗舰 · 上线级',
    d: 'RAG + Agent 融合：知识检索问答、工单智能体、意图分流转人工、SSE 流式前端与引用溯源——简历主打项目',
  },
  {
    n: '② AI 科研助手',
    tag: '多 Agent',
    d: '文献检索 / 摘要总结 / 写作润色 / 引用组织四角色协作，LangGraph 编排，学术工具调用',
  },
  {
    n: '③ Mini-GPT + 技术博客',
    tag: '原理证明',
    d: '从零手写 GPT 并训练出文本生成能力，配博客讲清 Transformer，证明不是只会调 API',
  },
]

export const GLOBAL_ADVICE = {
  irons: [
    { n: '01', t: '核心与略读分层', items: ['逐字吃透：第 5 章 RAG、第 6 章 Agent、第 7 章项目', '限时略读：第 2 章机器学习（2 周）、第 4 章多模态（1 周）', '核心内容永不砍，略读内容优先砍'] },
    { n: '02', t: '产出导向', items: ['每个阶段绑定一个可演示产出', '视频只看一遍，代码先自己写再对照', '从第一天用 Git，作品集逐阶段长出来'] },
    { n: '03', t: '发挥前端主场', items: ['课程弱项恰是你的强项：SSE 流式聊天 UI', '工具调用可视化、RAG 引用溯源面板', '把前端能力揉进项目一，形成差异化作品'] },
  ],
  rules: [
    { t: '略读「三问法」', items: ['对 AutoML / 特征工程 / YOLO / SAM 等略读章节，只回答三个问题', '解决什么问题？什么场景用？和 Agent 有什么关系？', '答得出就过，别陷进算法岗的知识树'] },
    { t: '每周节奏', items: ['工作日晚 1.5h × 5：看课 + 跟练代码', '周末 4h × 2：项目实操 + 阶段产出', '每周日晚 30 分钟：复盘 + 来看板打卡'] },
    { t: '风险预案', items: ['某阶段超时 50%：砍略读和可选项目，保里程碑', '连续 3 天没碰代码：打开项目仓库写 30 分钟重启', '硬里程碑（12/13、1/24、3/7）不可动摇'] },
  ],
  supplements: [
    { n: '🔗 LangGraph 官方教程', d: '课程仅 1 节课，JD 高频，必须加餐', when: 'P6 · 第 4 周' },
    { n: '📏 Ragas 评测框架', d: '给 RAG 系统补上量化评估报告', when: 'P5 · 第 5 周' },
    { n: '🤖 OpenAI / Anthropic Agent SDK', d: '任选其一，体会官方编排思路', when: 'P6 · 第 2 周' },
    { n: '🌐 Vercel AI SDK', d: '流式 AI 界面，前端差异化武器', when: 'P7 · 项目一期' },
  ],
}
