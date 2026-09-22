//#region src/shared.js
/**
* Shared pure local optimizer for dsh-prompt-lab.
* No DOM, no localStorage — safe for Host and unit tests.
*/
/** @typedef {'normal'|'slim'|'expand'} OptimizeMode */
const MODES = [
	"normal",
	"slim",
	"expand"
];
const MODE_LABELS = {
	normal: "普通优化",
	slim: "精简",
	expand: "扩写"
};
const LAYER_IDS = [
	"role",
	"task",
	"context",
	"constraint",
	"format",
	"process"
];
const LAYER_NAMES = {
	role: "角色",
	task: "任务",
	context: "上下文",
	constraint: "约束",
	format: "输出格式",
	process: "过程/自检"
};
const ROLE_HINTS = /作为|请你?以|你的角色|扮演|身份是|专家|顾问|工程师|设计师|编辑|老师|\*\*角色\*\*|【角色】|角色】|角色：/;
const TASK_HINTS = /写|做|生成|创作|撰写|起草|分析|设计|解释|翻译|总结|列出|给出|制定|规划|优化|润色|修改|比较|评估|实现|修复|处理|帮我|请/;
const CONTEXT_HINTS = /场景|背景|对象|受众|面向|渠道|小红书|公众号|邮件|代码|产品|项目|用户|客户/;
const CONSTRAINT_HINTS = /不要|不能|禁止|必须|至少|不超过|字以内|字左右|限制|避免|要求|约束/;
const FORMAT_HINTS = /格式|markdown|表格|列表|分点|json|大纲|结构|标题|分几段|输出为/;
const PROCESS_HINTS = /步骤|流程|先.*再|自检|检查|校验|分步|迭代/;
const VAGUE_WORDS = [
	"好看",
	"漂亮",
	"精美",
	"吸引",
	"生动",
	"丰富",
	"专业",
	"正式",
	"严谨",
	"简洁",
	"精简",
	"优化一下",
	"改进",
	"更好",
	"差不多",
	"随便",
	"一些",
	"一点",
	"若干",
	"适当",
	"等等",
	"之类的"
];
const NOISE_RE = /帮我|请你|麻烦|劳驾|求|想要|我想|谢谢|拜托|你好|真的是|太感谢|不知道怎么说|大概|反正|之类|什么的|看着办|尽量|最好能|希望|觉得|感觉|好像|差不多|随便/;
const VERB_RE = /(写|做|生成|创作|撰写|起草|分析|设计|解释|翻译|总结|列出|给出|制定|规划|优化|润色|修改|比较|评估|实现|修复|处理)/;
const CHANNEL_KB = {
	xhs: {
		label: "小红书",
		constraints: [
			"标题 ≤ 20 字，有钩子",
			"正文短段落 + 表情适量",
			"结尾引导互动"
		]
	},
	official: {
		label: "公众号",
		constraints: [
			"标题清晰有信息量",
			"结构分节，重点前置",
			"适合手机阅读"
		]
	},
	email: {
		label: "邮件",
		constraints: [
			"主题行一句话说清",
			"正文先结论后细节",
			"行动号召明确"
		]
	},
	code: {
		label: "开发场景",
		constraints: [
			"给出可运行示例",
			"说明边界与错误处理",
			"不臆造 API"
		]
	},
	docs: {
		label: "文档",
		constraints: [
			"定义先于示例",
			"术语前后一致",
			"可检索的小标题"
		]
	}
};
const TASK_TYPES = [
	{
		id: "copy",
		name: "文案创作",
		role: "资深文案与内容策划",
		re: /文案|标题|海报|推文|种草|广告语|slogan/
	},
	{
		id: "code",
		name: "代码开发",
		role: "资深软件工程师",
		re: /代码|函数|脚本|bug|接口|重构|实现.*功能/
	},
	{
		id: "analyze",
		name: "分析研究",
		role: "严谨的分析师与研究者",
		re: /分析|对比|评估|调研|报告|数据/
	},
	{
		id: "plan",
		name: "规划方案",
		role: "经验丰富的规划与顾问",
		re: /计划|方案|规划|策略|路线图|步骤/
	},
	{
		id: "general",
		name: "通用任务",
		role: "该任务领域的资深专家与执行写作者",
		re: /.*/
	}
];
/** @param {string} text */
function diagnosePrompt(text) {
	const t = String(text || "");
	const vague = [];
	for (const w of VAGUE_WORDS) if (t.includes(w)) vague.push({ word: w });
	const layers = {
		role: ROLE_HINTS.test(t),
		task: TASK_HINTS.test(t),
		context: CONTEXT_HINTS.test(t),
		constraint: CONSTRAINT_HINTS.test(t),
		format: FORMAT_HINTS.test(t),
		process: PROCESS_HINTS.test(t) || t.length <= 60
	};
	const hits = LAYER_IDS.filter((id) => layers[id] && id !== "process").length;
	const score = Math.round(hits / 5 * 70 + (vague.length === 0 ? 20 : 10) + (layers.process ? 10 : 0));
	const issues = [];
	if (!layers.role) issues.push({
		layer: "role",
		msg: "缺少角色先验，输出易偏向「平均网友」"
	});
	if (!layers.task) issues.push({
		layer: "task",
		msg: "任务缺少明确动词，目标熵偏高"
	});
	if (!layers.context) issues.push({
		layer: "context",
		msg: "无场景/对象/渠道，条件概率空泛"
	});
	if (!layers.constraint) issues.push({
		layer: "constraint",
		msg: "无长度/风格/禁止项约束，输出易冗长跑题"
	});
	if (!layers.format) issues.push({
		layer: "format",
		msg: "未约定交付形态，难解析难验收"
	});
	if (!layers.process && t.length > 60) issues.push({
		layer: "process",
		msg: "较长任务未给步骤/自检"
	});
	return {
		layers,
		issues,
		vague,
		score: Math.max(0, Math.min(100, score))
	};
}
/** @param {string} text */
function detectTaskType(text) {
	const t = String(text || "");
	for (const type of TASK_TYPES) if (type.id !== "general" && type.re.test(t)) return type;
	return TASK_TYPES[TASK_TYPES.length - 1];
}
/** @param {string} text */
function extractIntent(text) {
	const original = String(text || "").trim();
	const lower = original.toLowerCase();
	const channels = [];
	if (/小红书|种草|笔记/.test(original)) channels.push("xhs");
	if (/公众号|微信文章|推文/.test(original)) channels.push("official");
	if (/邮件|email|商务信/.test(lower)) channels.push("email");
	if (/代码|函数|脚本|api|typescript|javascript|python/.test(lower)) channels.push("code");
	if (/文档|文档化|说明|readme/.test(lower)) channels.push("docs");
	const audiences = [];
	if (/面向|受众|针对|用户是|客户是/.test(original)) {
		const m = original.match(/(?:面向|受众|针对)\s*([^，,。；;\n]{2,20})/);
		if (m) audiences.push(m[1].trim());
	}
	const product = (original.match(/(?:关于|为|给)\s*([^，,。；;\n]{2,24}?)(?:写|做|生成|设计|制作)/) || [])[1] || (original.match(/(?:写|做|生成|设计|制作)\s*([^，,。；;\n]{2,24}?)(?:的|文案|方案|介绍)/) || [])[1] || "";
	const lengths = [];
	const lenMatch = original.match(/(\d{2,5})\s*字/g);
	if (lenMatch) lengths.push(...lenMatch);
	const roleMatch = original.match(/(?:作为|扮演|以)\s*([^，,。；;\n]{2,20})/);
	const explicitRole = roleMatch ? roleMatch[1].trim() : "";
	return {
		original,
		channels,
		audiences: audiences.filter(Boolean),
		product: String(product || "").trim(),
		lengths,
		explicitRole
	};
}
/** Vague quality → concrete executable standard. */
function concretizeQualities(intent) {
	const map = [
		{
			from: "好看/精美",
			re: /好看|漂亮|精美/,
			to: "视觉层级清晰：主标题突出、留白充足、无装饰堆砌"
		},
		{
			from: "专业",
			re: /专业/,
			to: "术语准确、结构严谨、结论有依据，避免口语化空话"
		},
		{
			from: "吸引/生动",
			re: /吸引|生动/,
			to: "首句给出具体钩子或利益点，避免空泛形容词"
		},
		{
			from: "丰富/详细",
			re: /丰富|详细|完整/,
			to: "覆盖用户点名的要点，每点有可执行细节"
		},
		{
			from: "简洁",
			re: /简洁|简短|精简/,
			to: "只保留完成任务必需信息，删除客套与重复"
		},
		{
			from: "正式",
			re: /正式/,
			to: "书面语、无人称口语，结构分节清晰"
		}
	];
	const text = intent.original || "";
	return map.filter((q) => q.re.test(text)).map((q) => ({
		from: q.from,
		to: q.to,
		re: q.re
	}));
}
function detectChannels(intent) {
	return intent.channels.map((id) => CHANNEL_KB[id]).filter(Boolean);
}
function channelFormat(intent) {
	if (!CHANNEL_KB[intent.channels[0]]) return "结构清晰、可直接使用的成品";
	if (intent.channels[0] === "code") return "可运行代码 + 简要说明";
	if (intent.channels[0] === "xhs") return "标题 + 正文 + 话题标签";
	if (intent.channels[0] === "official") return "标题 + 导语 + 分节正文";
	if (intent.channels[0] === "email") return "主题行 + 正文 + 行动号召";
	return "结构清晰、可直接使用的成品";
}
function rewriteTaskSentence(intent, type) {
	let s = intent.original.replace(/^(帮我|请你?|麻烦|拜托)\s*/, "").trim();
	if (!s) s = intent.original;
	if (s.length > 120) s = s.slice(0, 117) + "…";
	if (!/[。.]$/.test(s)) s += "。";
	return s;
}
function extractCoreTrunk(intent, type, qualityMap, constraints) {
	const text = intent.original || "";
	const clauses = text.split(/[，,。；;！!？?\n]+/).map((s) => s.trim()).filter((s) => s.length >= 2);
	const coreClauses = clauses.filter((c) => {
		if (NOISE_RE.test(c) && !VERB_RE.test(c)) return false;
		return true;
	});
	const verbClause = coreClauses.find((c) => VERB_RE.test(c)) || coreClauses[0] || text.slice(0, 30);
	const lines = [];
	const trunk = verbClause.replace(/^(帮我|请你?|麻烦|拜托)/, "").replace(/^(写一个|写个|做一个)/, "撰写").trim();
	lines.push("【主干】" + trunk + (/[。.]$/.test(trunk) ? "" : "。"));
	if (intent.product && !trunk.includes(intent.product)) lines.push("【对象】" + intent.product);
	if (intent.channels.length) {
		const labels = intent.channels.map((id) => CHANNEL_KB[id] && CHANNEL_KB[id].label).filter(Boolean);
		if (labels.length) lines.push("【场景】" + labels.join("、"));
	}
	const hard = [];
	for (const c of clauses) if (/(不要|不能|禁止|必须|至少|不超过|字以内|字左右)/.test(c)) hard.push(c.replace(/^要/, "").replace(/另外/, "").trim().slice(0, 28));
	if (qualityMap[0]) {
		const shortTo = qualityMap[0].to.length > 24 ? qualityMap[0].to.slice(0, 24) + "…" : qualityMap[0].to;
		hard.push(qualityMap[0].from + "→" + shortTo);
	}
	if (!hard.length && constraints.length) hard.push(String(constraints[0]).replace(/^-\s*/, "").slice(0, 24));
	if (hard.length) lines.push("【硬约束】" + hard.slice(0, 2).join("；"));
	lines.push("【交付】" + channelFormat(intent).split(/[；;]/)[0].slice(0, 28));
	return lines.join("\n");
}
function expandUserNeeds(intent, type, qualityMap, constraints, taskSentence) {
	const needs = [];
	if (intent.product) needs.push({
		title: "对象：" + intent.product,
		items: [
			"明确产品是什么、解决什么问题、和替代方案的差异",
			"必须出现的信息点（缺则标注待补充）",
			"不得编造参数、销量、奖项"
		]
	});
	for (const ch of detectChannels(intent)) needs.push({
		title: "渠道/场景：" + ch.label,
		items: (ch.constraints || []).slice(0, 4)
	});
	if (intent.audiences.length) needs.push({
		title: "受众：" + intent.audiences.join("、"),
		items: ["语气与词汇匹配该人群", "优先满足其决策信息，再考虑润色"]
	});
	for (const q of qualityMap) needs.push({
		title: "需求细化：「" + q.from + "」",
		items: [q.to]
	});
	if (!needs.length) needs.push({
		title: "原文需求细化",
		items: ["把口语表述拆成：做什么 + 产出物 + 验收标准", "缺信息时写明假设，禁止编造"]
	});
	const lines = [];
	lines.push("你将扮演：" + (intent.explicitRole || type && type.role || "该任务领域专家") + "。");
	lines.push("");
	lines.push("## 原始需求");
	lines.push(taskSentence || intent.original);
	lines.push("");
	lines.push("## 需求细化（只扩写用户点名的内容）");
	for (const n of needs) {
		lines.push("### " + n.title);
		for (const it of n.items.filter(Boolean)) lines.push("- " + String(it).replace(/^-\s*/, ""));
		lines.push("");
	}
	if (constraints.length) {
		lines.push("## 全局约束（服务上述细化项）");
		for (const c of constraints.slice(0, 5)) lines.push(c);
		lines.push("");
	}
	lines.push("## 交付");
	lines.push("- " + channelFormat(intent));
	lines.push("- 按「需求细化」逐项落地，不要另起无关栏目");
	lines.push("");
	lines.push("## 自检");
	lines.push("1. 每条细化项在成品中是否有对应内容");
	lines.push("2. 是否混入原文未点名的无关扩写");
	lines.push("3. 模糊词是否已变成可验收标准");
	return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
function composeNormal(intent, type, qualityMap, constraints) {
	const taskSentence = rewriteTaskSentence(intent, type);
	const role = intent.explicitRole || type.role;
	const paras = [];
	paras.push("【Agent 结构化提示词】");
	paras.push("");
	paras.push("**角色**：" + role + "。请直接按下列指令执行，不要复述指令本身。");
	paras.push("");
	paras.push("**任务**：" + taskSentence);
	if (intent.channels.length || intent.audiences.length || intent.product) {
		const bits = [];
		if (intent.product) bits.push("对象 " + intent.product);
		if (intent.channels.length) {
			const labels = intent.channels.map((id) => CHANNEL_KB[id] && CHANNEL_KB[id].label).filter(Boolean);
			bits.push((intent.channels[0] === "code" ? "开发场景 " : "渠道 ") + labels.join("/"));
		}
		if (intent.audiences.length) bits.push("受众 " + intent.audiences.join("/"));
		if (bits.length) paras.push("**上下文**：" + bits.join("；") + "。输出的语气、详略与形态必须匹配这些锚点。");
	}
	if (qualityMap.length) {
		paras.push("**质量标准**（由原文模糊表述具体化）：");
		for (const q of qualityMap) paras.push("- 原「" + q.from + "」→ 执行标准：" + q.to);
	}
	paras.push("**执行约束**：");
	if (constraints.length) for (const c of constraints) paras.push(c);
	else {
		paras.push("- 不虚构数据、奖项与用户证言，缺信息标注「待补充」");
		paras.push("- 给出可直接使用的成品，而不是大纲");
		paras.push("- 禁止空话套话，语言具体可执行");
	}
	paras.push("**输出格式**：" + channelFormat(intent) + "。成品在前，说明在后（若有）。");
	paras.push("");
	paras.push("**过程/自检**：交付前检查角色是否匹配任务、约束是否可验收、格式是否完整。");
	return paras.join("\n");
}
function inferConstraints(intent, type, diag) {
	const list = [];
	const push = (s) => {
		const t = String(s || "").replace(/^[-•]\s*/, "").trim();
		if (!t || t.length < 6) return;
		if (!list.includes(t)) list.push(t);
	};
	const qualityMap = concretizeQualities(intent);
	for (const q of qualityMap.slice(0, 3)) push(q.to);
	push("不虚构数据、奖项与用户证言，缺信息标注「待补充」");
	push("给出可直接使用的成品，而不是大纲");
	push("禁止空话套话，语言具体可执行");
	if (intent.lengths.length) push("严格满足长度要求：" + intent.lengths.join("、"));
	push("结构清晰，重点前置");
	for (const ch of detectChannels(intent)) for (const c of (ch.constraints || []).slice(0, 3)) push(c);
	if (diag && diag.vague && diag.vague.length) push("将模糊词「" + diag.vague.slice(0, 3).map((v) => v.word).join("、") + "」改写为可验收标准");
	return list.slice(0, 8).map((c) => "- " + c);
}
function pipelineNotes(mode, intent, qualityMap) {
	const notes = [];
	if (mode === "normal") notes.push("普通：按 Agent 流水线改写（角色/任务/上下文/约束/格式）");
	if (mode === "slim") notes.push("精简：从原文提取主干（核心任务+硬约束+交付），砍客套/重复");
	if (mode === "expand") notes.push("扩写：对用户点名的需求逐项细化，而不是堆通用过程栏目");
	if (qualityMap.length) notes.push("P2 将 " + qualityMap.length + " 处模糊表述替换为可判断标准（降目标熵）");
	if (intent.channels.length) notes.push("P3 命中渠道知识库（" + intent.channels.map((id) => CHANNEL_KB[id].label).join("、") + "）");
	notes.push("P5 自检：检查可执行动词、空话与结构完整性");
	return notes;
}
/**
* Local structured optimize — no LLM.
* @param {string} draft
* @param {OptimizeMode} mode
* @returns {{ ok: true, text: string, diagnostics: object, notes: string[], source: 'local' }
*   | { ok: false, error: string }}
*/
function optimizeLocal(draft, mode = "normal") {
	const text = String(draft || "").trim();
	if (!text) return {
		ok: false,
		error: "输入为空"
	};
	if (text.length > 2e4) return {
		ok: false,
		error: "提示词过长（上限 20000 字）"
	};
	const m = MODES.includes(mode) ? mode : "normal";
	const intent = extractIntent(text);
	const type = detectTaskType(text);
	const diag = diagnosePrompt(text);
	const qualityMap = concretizeQualities(intent);
	const constraints = inferConstraints(intent, type, diag);
	const taskSentence = rewriteTaskSentence(intent, type);
	let result;
	if (m === "slim") result = extractCoreTrunk(intent, type, qualityMap, constraints);
	else if (m === "expand") result = expandUserNeeds(intent, type, qualityMap, constraints, taskSentence);
	else result = composeNormal(intent, type, qualityMap, constraints);
	result = String(result || "").replace(/\n{3,}/g, "\n\n").trim();
	if (!result) return {
		ok: false,
		error: "本地优化失败：结果为空"
	};
	const outDiag = diagnosePrompt(result);
	return {
		ok: true,
		text: result,
		diagnostics: {
			input: diag,
			output: outDiag,
			score: outDiag.score,
			layers: outDiag.layers,
			vague: diag.vague,
			taskType: type.name,
			mode: m
		},
		notes: pipelineNotes(m, intent, qualityMap),
		source: "local"
	};
}
/** System prompt for optional LLM polish (hybrid). */
function modeSystemPrompt(mode, useLoop = false) {
	const modeMap = {
		normal: "你是提示词工程师。把口语提示改写成可被 Agent 执行的结构化提示词。\n必须包含：角色、任务、上下文/场景、约束、输出格式。\n只输出终稿，中文，可用 # 分节。不要解释。",
		slim: "你是信息压缩器。从原文中提取主干，不是补 Agent 模板。\n输出结构：\n【主干】一句话核心任务\n【对象】（若有）\n【场景】（若有）\n【硬约束】原文明确的要求（无则省略）\n【交付】产出形态\n要求：删除客套、重复、装饰性形容；保留可执行信息。只输出主干，不要解释。",
		expand: "你是需求细化器。只扩写用户点名的需求，禁止无关堆料。\n步骤：1) 列出原文点名的需求点 2) 对每一条写成可执行细化 3) 给出交付与自检。\n用「## 原始需求 / ## 需求细化（每条 ### 小节）/ ## 交付 / ## 自检」组织。\n只输出终稿，中文。不要解释。"
	};
	return (modeMap[mode] || modeMap.normal) + (useLoop ? "\n\n自循环：输出前默做一遍自检，删重复与无关内容。" : "");
}
/** Strip accidental code fences around the whole answer. */
function stripOuterFence(text) {
	const result = String(text || "").trim();
	const fenced = result.match(/^```[^\n]*\n([\s\S]*?)\n?```$/);
	return fenced ? fenced[1].trim() : result;
}
/**
* Write-back body: drop workshop banners and process/self-check sections.
* Keep the executable prompt only (role/task/context/constraints/format).
*/
function toPureBody(text) {
	let t = String(text || "").trim();
	t = t.replace(/^【Agent 结构化提示词】[ \t]*\r?\n+/u, "");
	t = t.replace(/\r?\n\*\*过程\/自检\*\*[\s\S]*$/u, "\n");
	t = t.replace(/^\*\*过程\/自检\*\*[\s\S]*$/u, "");
	t = t.replace(/\r?\n#{1,3}[ \t]*过程\/自检[ \t]*\r?\n[\s\S]*$/u, "\n");
	t = t.replace(/\r?\n#{1,3}[ \t]*自检[ \t]*\r?\n[\s\S]*$/u, "\n");
	return t.replace(/\n{3,}/g, "\n\n").trim();
}
/** Adopt guard: refuse write-back when the composer draft changed mid-flight. */
function canAdoptResult(snapshot, current) {
	return String(snapshot ?? "") === String(current ?? "");
}
//#endregion
export { LAYER_IDS, LAYER_NAMES, MODES, MODE_LABELS, canAdoptResult, concretizeQualities, detectTaskType, diagnosePrompt, extractIntent, modeSystemPrompt, optimizeLocal, stripOuterFence, toPureBody };
