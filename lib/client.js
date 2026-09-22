window.__ModuleLoader__.load({
	id: "dsh-prompt-lab",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperties(exports, {
			__esModule: { value: true },
			[Symbol.toStringTag]: { value: "Module" }
		});
		//#region \0rolldown/runtime.js
		var __create = Object.create;
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __getProtoOf = Object.getPrototypeOf;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __copyProps = (to, from, except, desc) => {
			if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
			return to;
		};
		var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
			value: mod,
			enumerable: true
		}) : target, mod));
		//#endregion
		let react = require("react");
		react = __toESM(react, 1);
		let react_dom = require("react-dom");
		//#region src/shared.js
		const LAYER_NAMES = {
			role: "角色",
			task: "任务",
			context: "上下文",
			constraint: "约束",
			format: "输出格式",
			process: "过程/自检"
		};
		/** Adopt guard: refuse write-back when the composer draft changed mid-flight. */
		function canAdoptResult(snapshot, current) {
			return String(snapshot ?? "") === String(current ?? "");
		}
		//#endregion
		//#region src/client/index.js
		/**
		* dsh-prompt-lab client
		* Input area: optimize → modal (可编辑原稿|结果|五层+分) → 继续优化 / 回填输入 / 采用
		* Settings.section: engine / mode / 云端 API / 推理行为 / about
		*/
		const MODE_OPTIONS = [
			{
				value: "normal",
				label: "普通优化"
			},
			{
				value: "slim",
				label: "精简"
			},
			{
				value: "expand",
				label: "扩写"
			}
		];
		const ENGINE_OPTIONS = [
			{
				value: "local",
				label: "仅本地",
				desc: "离线规则，结构化骨架，不出机"
			},
			{
				value: "hybrid",
				label: "hybrid",
				desc: "本地骨架 → 能解析 provider+model 才精修（默认）"
			},
			{
				value: "dsh",
				label: "仅DSH",
				desc: "用已配置模型精修，失败仍降级本地"
			},
			{
				value: "api",
				label: "云端 API",
				desc: "DeepSeek / OpenAI 兼容接口，失败仍降级本地"
			}
		];
		const FIVE_LAYERS = [
			"role",
			"task",
			"context",
			"constraint",
			"format"
		];
		const SETTINGS_KEY = "plab.settings.v2";
		function Icon() {
			return react.default.createElement("svg", {
				width: 14,
				height: 14,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 1.8,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true"
			}, react.default.createElement("path", { d: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" }), react.default.createElement("path", { d: "M19 15v4" }), react.default.createElement("path", { d: "M17 17h4" }));
		}
		function defaultSettings() {
			return {
				mode: "normal",
				engine: "hybrid",
				useLoop: false,
				useHotkey: true,
				api: {
					provider: "deepseek",
					baseUrl: "https://api.deepseek.com",
					apiKey: "",
					model: "deepseek-chat"
				}
			};
		}
		function loadSettings() {
			try {
				const raw = window.localStorage.getItem(SETTINGS_KEY);
				const old = window.localStorage.getItem("plab.settings.v1");
				const parsed = raw ? JSON.parse(raw) : old ? JSON.parse(old) : null;
				const d = defaultSettings();
				if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return d;
				let engine = d.engine;
				if (parsed.engine === "local" || parsed.engine === "hybrid" || parsed.engine === "dsh" || parsed.engine === "api") engine = parsed.engine;
				else if (parsed.engine === "small") engine = "hybrid";
				else if (parsed.useLlm === true) engine = "hybrid";
				else if (parsed.useLlm === false) engine = "local";
				return {
					mode: MODE_OPTIONS.some((m) => m.value === parsed.mode) ? parsed.mode : d.mode,
					engine,
					useLoop: !!parsed.useLoop,
					useHotkey: parsed.useHotkey !== false,
					api: {
						...d.api,
						...parsed.api && typeof parsed.api === "object" ? parsed.api : {}
					}
				};
			} catch (e) {
				return defaultSettings();
			}
		}
		const settingsListeners = /* @__PURE__ */ new Set();
		function subscribeSettings(fn) {
			settingsListeners.add(fn);
			return () => settingsListeners.delete(fn);
		}
		function saveSettings(patch) {
			const base = loadSettings();
			const next = {
				...base,
				...patch,
				api: {
					...base.api,
					...patch && patch.api ? patch.api : {}
				}
			};
			try {
				window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
			} catch (e) {}
			for (const fn of settingsListeners) try {
				fn(next);
			} catch (e) {}
			try {
				window.dispatchEvent(new CustomEvent("plab:settings-changed", { detail: next }));
			} catch (e) {}
			return next;
		}
		const css = `
.plab-root,.plab-overlay,.plab-sec{--pl-surface:var(--dsw-alias-bg-layer-2,var(--dsw-alias-bg-layer-1,#fff));
  --pl-raised:var(--dsw-alias-bg-layer-3,var(--dsw-alias-bg-layer-1,#fff));
  --pl-border:var(--dsw-alias-border-l1,#0000000a);
  --pl-border-strong:var(--dsw-alias-border-l2,#0000001a);
  --pl-text:var(--dsw-alias-label-primary,#0f1115);
  --pl-text-2:var(--dsw-alias-label-secondary,#61666b);
  --pl-text-3:var(--dsw-alias-label-tertiary,#81858c);
  --pl-accent:var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary,#0E8A7D));
  --pl-accent-soft:color-mix(in srgb,var(--pl-accent) 14%,transparent);
  --pl-warn:var(--dsw-alias-state-error-primary,#b42318);
  --pl-warn-bg:color-mix(in srgb,var(--pl-warn) 12%,var(--pl-surface));
  --pl-ok:var(--dsw-alias-state-success-primary,#15803d);
  --pl-menu:var(--dsw-specific-menu,var(--pl-raised));
  --pl-input:var(--dsw-alias-bg-input,transparent);
  color:var(--pl-text)}
.plab-root{display:inline-flex;align-items:center;gap:6px;position:relative;min-width:0}
.plab-btn{appearance:none;display:inline-flex;align-items:center;justify-content:center;gap:6px;
  height:28px;padding:0 12px;font-size:12px;font-weight:500;line-height:1;color:var(--pl-text-2);
  border:none;border-radius:999px;cursor:pointer;background:transparent}
.plab-btn:hover:not(:disabled){color:var(--pl-text);background:var(--dsw-alias-interactive-bg-hover,var(--pl-raised))}
.plab-btn:active:not(:disabled){transform:scale(.97)}
.plab-btn:disabled{opacity:.45;cursor:not-allowed}
.plab-btn.is-busy{color:var(--pl-accent);cursor:progress;background:var(--pl-accent-soft)}
.plab-btn svg{width:14px;height:14px;flex:none}
.plab-spin{width:12px;height:12px;flex:none;border-radius:50%;
  border:2px solid color-mix(in srgb,var(--pl-accent) 22%,transparent);
  border-top-color:var(--pl-accent);animation:plab-spin .7s linear infinite}
@keyframes plab-spin{to{transform:rotate(360deg)}}
@keyframes plab-pop{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
@keyframes plab-fade{from{opacity:0}to{opacity:1}}
.plab-toast{position:fixed;z-index:220;max-width:min(360px,calc(100vw - 24px));padding:6px 10px;
  font-size:11px;line-height:16px;color:var(--pl-text-2);background:var(--pl-menu);
  border:1px solid var(--pl-border-strong);border-radius:8px;box-shadow:0 6px 16px rgba(0,0,0,.16);
  animation:plab-pop .14s ease-out;pointer-events:none;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.plab-toast.is-err{color:var(--pl-warn)}
.plab-toast.is-ok{color:var(--pl-accent)}
/* Modal — portal to document.body, true viewport overlay */
.plab-overlay{position:fixed;inset:0;z-index:2147483000;background:rgba(15,17,21,.42);
  display:flex;align-items:center;justify-content:center;padding:32px 20px;
  animation:plab-fade .12s ease-out;box-sizing:border-box;
  transform:none!important;filter:none!important;contain:none!important}
.plab-modal{width:min(880px,calc(100vw - 40px));max-height:min(78vh,720px);
  display:flex;flex-direction:column;box-sizing:border-box;
  background:var(--pl-raised);color:var(--pl-text);border:1px solid var(--pl-border-strong);
  border-radius:14px;box-shadow:0 18px 48px rgba(0,0,0,.28);overflow:hidden}
.plab-modal-head{display:flex;align-items:center;justify-content:space-between;gap:12px;
  padding:12px 14px;border-bottom:1px solid var(--pl-border)}
.plab-head-actions{display:flex;align-items:center;gap:6px;flex:none}
.plab-modal-title{margin:0;font-size:14px;font-weight:600;line-height:20px}
.plab-modal-meta{font-size:11px;color:var(--pl-text-3);font-weight:400;margin-left:8px}
.plab-x{appearance:none;width:28px;height:28px;border:none;border-radius:8px;background:transparent;
  color:var(--pl-text-3);cursor:pointer;font-size:16px;line-height:1}
.plab-x:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--pl-text)}
.plab-banner{display:flex;align-items:flex-start;gap:8px;margin:0;padding:8px 14px;
  font-size:12px;line-height:18px;background:var(--pl-warn-bg);color:var(--pl-warn);
  border-bottom:1px solid color-mix(in srgb,var(--pl-warn) 25%,transparent)}
.plab-banner strong{font-weight:600}
.plab-chips{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:10px 14px 0}
.plab-score{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 10px;
  border-radius:999px;background:var(--pl-accent-soft);color:var(--pl-accent);
  font-size:12px;font-weight:600}
.plab-chip{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 8px;
  border-radius:999px;border:1px solid var(--pl-border-strong);font-size:11px;color:var(--pl-text-2);
  background:transparent}
.plab-chip.is-on{border-color:color-mix(in srgb,var(--pl-ok) 45%,transparent);
  color:var(--pl-ok);background:color-mix(in srgb,var(--pl-ok) 10%,transparent)}
.plab-chip.is-off{border-color:color-mix(in srgb,var(--pl-warn) 35%,transparent);
  color:var(--pl-warn);background:color-mix(in srgb,var(--pl-warn) 8%,transparent)}
.plab-panes{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:10px 14px;
  min-height:0;flex:1 1 auto;overflow:hidden}
.plab-pane{display:flex;flex-direction:column;min-height:0;min-width:0;height:100%;
  border:1px solid var(--pl-border);border-radius:10px;overflow:hidden;background:var(--pl-surface)}
.plab-pane-h{padding:6px 10px;font-size:11px;font-weight:600;color:var(--pl-text-3);
  border-bottom:1px solid var(--pl-border);background:color-mix(in srgb,var(--pl-raised) 70%,transparent)}
.plab-pane-b{margin:0;padding:10px;overflow:auto;flex:1 1 auto;min-height:0;
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  font-size:12px;line-height:1.55;white-space:pre-wrap;word-break:break-word;color:var(--pl-text)}
.plab-pane-edit{flex:1 1 auto;min-height:0;margin:0;padding:10px;resize:none;border:none;outline:none;
  width:100%;box-sizing:border-box;background:transparent;color:var(--pl-text);
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  font-size:12px;line-height:1.55;white-space:pre-wrap;word-break:break-word}
.plab-pane-edit:focus{background:color-mix(in srgb,var(--pl-accent) 4%,transparent)}
.plab-modal-foot{display:flex;align-items:center;justify-content:flex-end;gap:8px;
  padding:12px 14px;border-top:1px solid var(--pl-border)}
.plab-hint{margin-right:auto;font-size:11px;color:var(--pl-text-3)}
@media (max-width:640px){.plab-panes{grid-template-columns:1fr}}
/* 设置页 */
.plab-sec{width:100%;min-width:0;display:flex;flex-direction:column;gap:14px;color:var(--pl-text)}
.plab-sec-title{display:flex;align-items:baseline;gap:8px;margin:0;font-size:16px;font-weight:600;line-height:24px}
.plab-sec-desc{margin:0;font-size:12px;line-height:18px;color:var(--pl-text-3)}
.plab-tabs{display:flex;gap:6px;flex-wrap:wrap;padding:4px 0 2px;border-bottom:1px solid var(--pl-border)}
.plab-tab{height:30px;padding:0 12px;font-size:12.5px;border-radius:8px;cursor:pointer;
  border:1px solid transparent;background:transparent;color:var(--pl-text-2)}
.plab-tab.is-on{border-color:color-mix(in srgb,var(--pl-accent) 40%,transparent);
  color:var(--pl-accent);background:var(--pl-accent-soft);font-weight:600}
.plab-tab:hover:not(.is-on){background:var(--dsw-alias-interactive-bg-hover);color:var(--pl-text)}
.plab-block{display:flex;flex-direction:column;gap:10px;padding:6px 0 2px}
.plab-h{margin:0;font-size:13px;font-weight:600;line-height:20px}
.plab-n{margin:0;font-size:12px;line-height:17px;color:var(--pl-text-3)}
.plab-choices{display:flex;flex-direction:column;gap:8px}
.plab-choice{display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border-radius:10px;
  border:1px solid var(--pl-border);cursor:pointer;background:transparent;text-align:left;width:100%}
.plab-choice:hover{border-color:var(--pl-border-strong);background:var(--dsw-alias-interactive-bg-hover)}
.plab-choice.is-on{border-color:var(--pl-accent);background:var(--pl-accent-soft)}
.plab-choice-title{font-size:13px;font-weight:600;color:var(--pl-text);line-height:18px}
.plab-choice.is-on .plab-choice-title{color:var(--pl-accent)}
.plab-choice-desc{font-size:11.5px;color:var(--pl-text-3);line-height:16px;margin-top:2px}
.plab-modes{display:flex;gap:8px;flex-wrap:wrap}
.plab-mode{height:32px;padding:0 14px;font-size:12.5px;border-radius:8px;cursor:pointer;
  border:1px solid var(--pl-border-strong);background:transparent;color:var(--pl-text-2)}
.plab-mode.is-on{border-color:var(--pl-accent);color:var(--pl-accent);background:var(--pl-accent-soft);font-weight:600}
.plab-field{display:flex;flex-direction:column;gap:4px}
.plab-field-label{font-size:12px;font-weight:600;color:var(--pl-text-2)}
.plab-input{box-sizing:border-box;width:100%;height:36px;padding:0 10px;font-size:13px;font-family:inherit;
  color:var(--pl-text);background:var(--pl-input);border:1px solid var(--pl-border-strong);
  border-radius:8px;outline:none}
.plab-input:focus{border-color:var(--pl-accent)}
.plab-actions{display:flex;gap:8px;flex-wrap:wrap;padding-top:6px}
.plab-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:6px 0}
.plab-row-text{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}
.plab-switch{appearance:none;flex:0 0 auto;width:40px;height:22px;margin:0;
  border:1px solid var(--pl-border-strong);border-radius:999px;cursor:pointer;
  background:var(--pl-surface);position:relative}
.plab-switch::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;
  background:var(--pl-text-3);transition:transform .15s ease,background .15s ease}
.plab-switch:checked{background:var(--pl-accent);border-color:var(--pl-accent)}
.plab-switch:checked::after{transform:translateX(18px);background:#fff}
.plab-b{appearance:none;min-height:32px;height:32px;padding:0 14px;font-size:12px;font-weight:500;
  cursor:pointer;border-radius:8px;border:1px solid var(--pl-border-strong);
  background:var(--pl-surface);color:var(--pl-text)}
.plab-b:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.plab-b:disabled{opacity:.45;cursor:not-allowed}
.plab-b-primary{background:var(--pl-accent);border-color:var(--pl-accent);color:#fff;font-weight:600}
.plab-summary{margin:0;font-size:11.5px;line-height:16px;color:var(--pl-text-3);
  padding:8px 10px;border-radius:8px;background:color-mix(in srgb,var(--pl-surface) 80%,transparent);
  border:1px dashed var(--pl-border)}
.plab-btn:focus-visible,.plab-b:focus-visible,.plab-tab:focus-visible,.plab-input:focus-visible,
.plab-mode:focus-visible,.plab-choice:focus-visible,.plab-switch:focus-visible,.plab-x:focus-visible{
  outline:2px solid var(--pl-accent);outline-offset:2px}
@media (prefers-reduced-motion:reduce){.plab-root *,.plab-overlay *{transition:none!important;animation:none!important}}
`;
		const cssTagId = "dsh-prompt-lab/client.css";
		if (typeof document !== "undefined") {
			const existing = document.querySelector("style[data-plugin-css=" + JSON.stringify(cssTagId) + "]");
			if (existing) existing.textContent = css;
			else {
				const tag = document.createElement("style");
				tag.dataset.plugin = "dsh-prompt-lab";
				tag.dataset.pluginCss = cssTagId;
				tag.textContent = css;
				document.head.appendChild(tag);
			}
		}
		function looseParse(v) {
			return v;
		}
		const argsCodec = { parse: looseParse };
		const resultCodec = { parse: looseParse };
		const descriptor = (method) => ({
			id: "dsh-prompt-lab#promptLab/" + method,
			service: "promptLab",
			namespace: "promptLab",
			method,
			invocation: { kind: "direct" },
			parameters: [{
				name: "args",
				wire: "args",
				source: "json",
				codec: {
					mode: "strict",
					typeSymbol: "dsh-prompt-lab#Args",
					schema: argsCodec
				}
			}],
			result: {
				mode: "strict",
				typeSymbol: "dsh-prompt-lab#Result",
				schema: resultCodec
			}
		});
		const CONTRIBUTION = {
			package: "dsh-prompt-lab",
			descriptors: [
				descriptor("getSettings"),
				descriptor("setSettings"),
				descriptor("optimizePrompt"),
				descriptor("cancelOptimize"),
				descriptor("testConnection")
			]
		};
		const inject = ["remote", "slots"];
		async function apply(ctx) {
			console.log("[dsh-prompt-lab] client apply start");
			let remoteApi = null;
			try {
				const remote = ctx.get("remote");
				if (remote && typeof remote.$mount === "function") {
					const unmount = await remote.$mount(CONTRIBUTION);
					ctx.effect(() => () => {
						unmount();
					}, "dsh-prompt-lab: remote");
					remoteApi = ctx.get("remote.promptLab");
				}
			} catch (err) {
				console.warn("[dsh-prompt-lab] remote mount failed", err);
			}
			const host = { call: async (method, payload) => {
				if (!remoteApi) throw new Error("优化服务未连接");
				const result = await remoteApi[method](payload);
				if (!result || typeof result !== "object") throw new Error("优化服务无响应");
				const unwrapped = result.ok === true && result.value !== void 0 && result.value !== null && typeof result.value === "object" ? result.value : result;
				if (unwrapped.ok !== true) {
					const errVal = unwrapped.error !== void 0 && unwrapped.error !== null ? unwrapped.error : result.error;
					const detail = errVal !== void 0 && errVal !== null ? typeof errVal === "string" ? errVal : errVal.message : "失败";
					const err = new Error(detail || "失败");
					err.cancelled = unwrapped.cancelled === true || result.cancelled === true;
					throw err;
				}
				return unwrapped;
			} };
			function optionalService(key) {
				try {
					return ctx.get(key);
				} catch {
					return;
				}
			}
			const workspacesService = optionalService("workspaces");
			const sessionsService = optionalService("sessions");
			function currentSessionId() {
				try {
					if (sessionsService?.list && typeof sessionsService.list.getSnapshot === "function") {
						const s = sessionsService.list.getSnapshot();
						return typeof s.current === "string" ? s.current : void 0;
					}
				} catch (e) {}
			}
			function currentWorkspaceRoot() {
				try {
					const ws = workspacesService;
					if (!ws?.list || typeof ws.list.getSnapshot !== "function") return null;
					const snap = ws.list.getSnapshot();
					const items = Array.isArray(snap?.items) ? snap.items : [];
					const sid = currentSessionId();
					let item;
					if (typeof sid === "string") item = items.find((it) => it && Array.isArray(it.sessionIds) && it.sessionIds.includes(sid));
					if (item === void 0 && snap?.recentWorkspaceId !== void 0) item = items.find((it) => it && it.workspaceId === snap.recentWorkspaceId);
					if (item === void 0) item = items[0];
					return item && typeof item.path === "string" && item.path.length > 0 ? item.path : null;
				} catch (e) {
					return null;
				}
			}
			function pushHostSettings(view) {
				const root = currentWorkspaceRoot();
				if (!root || !remoteApi) return;
				host.call("setSettings", {
					root,
					sessionId: currentSessionId(),
					patch: {
						mode: view.mode,
						engine: view.engine,
						useLoop: view.useLoop,
						useHotkey: view.useHotkey,
						api: {
							provider: view.api?.provider,
							baseUrl: view.api?.baseUrl,
							model: view.api?.model
						}
					}
				}).then(() => {}).catch(() => {});
			}
			function engineLabel(s) {
				if (s.engine === "local") return "仅本地";
				if (s.engine === "dsh") return "仅DSH";
				if (s.engine === "api") return "云端 · " + (s.api?.model || "");
				return "hybrid";
			}
			function optimizePayload(s) {
				const engine = s.engine === "dsh" || s.engine === "hybrid" || s.engine === "local" || s.engine === "api" ? s.engine : "hybrid";
				return {
					mode: s.mode,
					engine,
					useLoop: s.useLoop,
					useLlm: engine !== "local",
					api: s.api
				};
			}
			function readDraft(props) {
				const input = props && props.input || {};
				const fromProps = typeof input.draft === "string" ? input.draft : "";
				if (fromProps.trim()) return fromProps;
				try {
					const sel = [
						"[data-composer-input]",
						"textarea[data-phase]",
						"[data-input-mirror]",
						"[data-input-scroll] textarea",
						"[data-composer-seat] textarea",
						"textarea"
					].join(",");
					const nodes = document.querySelectorAll(sel);
					for (const el of nodes) {
						if (!el) continue;
						if (typeof el.value === "string" && el.value.trim()) return el.value;
						if (el.isContentEditable || el.getAttribute("contenteditable") === "true") {
							const t = el.innerText || el.textContent || "";
							if (t.trim()) return t;
						}
						if (el.hasAttribute("data-input-mirror")) {
							const text = el.textContent || "";
							if (text.trim()) return text;
						}
					}
				} catch (e) {}
				return "";
			}
			function writeDraft(props, text) {
				const value = String(text ?? "");
				const input = props && props.input || {};
				const inputActions = input.actions || props && props.inputActions;
				let ok = false;
				if (inputActions && typeof inputActions.setDraft === "function") {
					inputActions.setDraft(value);
					ok = true;
				} else if (input && typeof input.setDraft === "function") {
					input.setDraft(value);
					ok = true;
				} else if (props && typeof props.onChangeDraft === "function") {
					props.onChangeDraft(value);
					ok = true;
				}
				try {
					const ta = document.querySelector("[data-composer-seat] textarea, [data-input-scroll] textarea, textarea[data-phase], textarea");
					if (ta) {
						const proto = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value");
						if (proto && proto.set) proto.set.call(ta, value);
						else ta.value = value;
						ta.dispatchEvent(new Event("input", { bubbles: true }));
						ta.dispatchEvent(new Event("change", { bubbles: true }));
						ok = true;
					}
					const ed = document.querySelector("[data-composer-input], [contenteditable=\"true\"]");
					if (ed && (ed.isContentEditable || ed.getAttribute("contenteditable") === "true")) {
						ed.focus();
						document.execCommand("selectAll", false, null);
						document.execCommand("insertText", false, value);
						ok = true;
					}
					const mirror = document.querySelector("[data-input-mirror]");
					if (mirror) {
						mirror.textContent = value;
						ok = true;
					}
				} catch (e) {}
				return ok;
			}
			function PromptLabSettingsSection() {
				const [settings, setSettings] = react.default.useState(() => loadSettings());
				const [testMsg, setTestMsg] = react.default.useState(null);
				const [testing, setTesting] = react.default.useState(false);
				react.default.useEffect(() => {
					const unsub = subscribeSettings(setSettings);
					const onEvt = (e) => setSettings(e.detail || loadSettings());
					window.addEventListener("plab:settings-changed", onEvt);
					return () => {
						unsub();
						window.removeEventListener("plab:settings-changed", onEvt);
					};
				}, []);
				function set(patch) {
					const view = saveSettings(patch);
					setSettings(view);
					pushHostSettings(view);
				}
				async function runApiTest() {
					setTesting(true);
					setTestMsg(null);
					try {
						const r = await host.call("testConnection", { api: settings.api });
						setTestMsg({
							ok: true,
							text: r.message || "连接成功"
						});
					} catch (err) {
						setTestMsg({
							ok: false,
							text: String(err && err.message || err)
						});
					} finally {
						setTesting(false);
					}
				}
				return react.default.createElement("div", { className: "plab-sec" }, react.default.createElement("h2", { className: "plab-sec-title" }, "提示词工坊"), react.default.createElement("p", { className: "plab-sec-desc" }, "弹窗内可编辑原稿并「继续优化」（同优化逻辑）；「回填输入」把结果填入原稿；「采用」写回输入框。"), react.default.createElement("div", { className: "plab-block" }, react.default.createElement("h3", { className: "plab-h" }, "引擎"), react.default.createElement("p", { className: "plab-n" }, "仅本地 | hybrid（默认）| 仅DSH | 云端 API。失败降级黄条，仍可采用。"), react.default.createElement("div", {
					className: "plab-choices",
					role: "radiogroup",
					"aria-label": "优化引擎"
				}, ENGINE_OPTIONS.map((e) => react.default.createElement("button", {
					key: e.value,
					type: "button",
					role: "radio",
					"aria-checked": settings.engine === e.value,
					className: "plab-choice" + (settings.engine === e.value ? " is-on" : ""),
					onClick: () => set({ engine: e.value })
				}, react.default.createElement("div", null, react.default.createElement("div", { className: "plab-choice-title" }, e.label), react.default.createElement("div", { className: "plab-choice-desc" }, e.desc)))))), react.default.createElement("div", { className: "plab-block" }, react.default.createElement("h3", { className: "plab-h" }, "模式"), react.default.createElement("div", {
					className: "plab-modes",
					role: "radiogroup",
					"aria-label": "优化模式"
				}, MODE_OPTIONS.map((o) => react.default.createElement("button", {
					key: o.value,
					type: "button",
					role: "radio",
					"aria-checked": settings.mode === o.value,
					className: "plab-mode" + (settings.mode === o.value ? " is-on" : ""),
					onClick: () => set({ mode: o.value })
				}, o.label)))), react.default.createElement("div", { className: "plab-block" }, react.default.createElement("h3", { className: "plab-h" }, "云端 API"), react.default.createElement("p", { className: "plab-n" }, "OpenAI 兼容接口。Key 仅存本机 localStorage，不会写入工作区文件。"), react.default.createElement("div", { className: "plab-modes" }, react.default.createElement("button", {
					type: "button",
					className: "plab-mode" + (settings.api?.provider === "deepseek" ? " is-on" : ""),
					onClick: () => set({
						engine: "api",
						api: {
							provider: "deepseek",
							baseUrl: "https://api.deepseek.com",
							model: settings.api?.model || "deepseek-chat"
						}
					})
				}, "DeepSeek（推荐）"), react.default.createElement("button", {
					type: "button",
					className: "plab-mode" + (settings.api?.provider === "custom" ? " is-on" : ""),
					onClick: () => set({ api: { provider: "custom" } })
				}, "自定义 OpenAI 兼容")), react.default.createElement("div", { className: "plab-field" }, react.default.createElement("span", { className: "plab-field-label" }, "Base URL"), react.default.createElement("input", {
					className: "plab-input",
					value: settings.api?.baseUrl || "",
					placeholder: "https://api.deepseek.com",
					onChange: (e) => set({ api: { baseUrl: e.target.value } })
				})), react.default.createElement("div", { className: "plab-field" }, react.default.createElement("span", { className: "plab-field-label" }, "API Key"), react.default.createElement("input", {
					className: "plab-input",
					type: "password",
					autoComplete: "off",
					value: settings.api?.apiKey || "",
					placeholder: "sk-...",
					onChange: (e) => set({ api: { apiKey: e.target.value } })
				})), react.default.createElement("div", { className: "plab-field" }, react.default.createElement("span", { className: "plab-field-label" }, "模型"), react.default.createElement("input", {
					className: "plab-input",
					value: settings.api?.model || "",
					placeholder: "deepseek-chat",
					onChange: (e) => set({ api: { model: e.target.value } })
				})), react.default.createElement("div", { className: "plab-actions" }, react.default.createElement("button", {
					type: "button",
					className: "plab-b",
					disabled: testing,
					onClick: runApiTest
				}, testing ? "测试中…" : "测试连接"), react.default.createElement("button", {
					type: "button",
					className: "plab-b plab-b-primary",
					onClick: () => set({ engine: "api" })
				}, "设为当前引擎")), testMsg ? react.default.createElement("p", {
					className: "plab-summary",
					style: { color: testMsg.ok ? "var(--pl-ok)" : "var(--pl-warn)" }
				}, testMsg.text) : null), react.default.createElement("div", { className: "plab-block" }, react.default.createElement("h3", { className: "plab-h" }, "推理行为"), react.default.createElement("div", { className: "plab-row" }, react.default.createElement("div", { className: "plab-row-text" }, react.default.createElement("span", { className: "plab-h" }, "自循环"), react.default.createElement("span", { className: "plab-n" }, "生成 → 批评 → 修订后再输出")), react.default.createElement("input", {
					type: "checkbox",
					className: "plab-switch",
					checked: settings.useLoop,
					onChange: (e) => set({ useLoop: e.target.checked })
				})), react.default.createElement("div", { className: "plab-row" }, react.default.createElement("div", { className: "plab-row-text" }, react.default.createElement("span", { className: "plab-h" }, "快捷键"), react.default.createElement("span", { className: "plab-n" }, "Ctrl/Cmd+Enter 触发优化（默认开）")), react.default.createElement("input", {
					type: "checkbox",
					className: "plab-switch",
					checked: settings.useHotkey,
					onChange: (e) => set({ useHotkey: e.target.checked })
				}))), react.default.createElement("div", { className: "plab-block" }, react.default.createElement("h3", { className: "plab-h" }, "关于"), react.default.createElement("p", { className: "plab-n" }, "xueccci · 提示词工坊 dsh 插件")));
			}
			function ResultModal({ data, onAdopt, onFillInput, onCopy, onCancel, onDraftChange, onContinue, busy }) {
				const layers = data && data.layers || {};
				const score = data && typeof data.score === "number" ? data.score : 0;
				const degraded = !!(data && data.degraded);
				const reason = data && (data.llmError || data.note) || "";
				const draftText = typeof data?.draft === "string" ? data.draft : data && data.snapshot || "";
				react.default.useEffect(() => {
					function onKey(e) {
						if (e.key === "Escape") {
							e.preventDefault();
							e.stopPropagation();
							onCancel();
						}
					}
					document.addEventListener("keydown", onKey, true);
					return () => document.removeEventListener("keydown", onKey, true);
				}, [onCancel]);
				return (0, react_dom.createPortal)(react.default.createElement("div", {
					className: "plab-overlay",
					role: "presentation",
					onMouseDown: (e) => {
						if (e.target === e.currentTarget) onCancel();
					}
				}, react.default.createElement("div", {
					className: "plab-modal",
					role: "dialog",
					"aria-modal": "true",
					"aria-label": "优化结果确认"
				}, react.default.createElement("div", { className: "plab-modal-head" }, react.default.createElement("h3", { className: "plab-modal-title" }, "优化结果", react.default.createElement("span", { className: "plab-modal-meta" }, "引擎 " + (data && data.engineTried || "-") + " · 来源 " + (data && data.source || "-") + (degraded ? " · 已降级" : "") + (data && data.note ? " · " + data.note : ""))), react.default.createElement("div", { className: "plab-head-actions" }, react.default.createElement("button", {
					type: "button",
					className: "plab-b",
					onClick: onCopy
				}, "复制"), react.default.createElement("button", {
					type: "button",
					className: "plab-x",
					"aria-label": "关闭",
					onClick: onCancel
				}, "×"))), degraded ? react.default.createElement("div", {
					className: "plab-banner",
					role: "status"
				}, react.default.createElement("span", null, react.default.createElement("strong", null, "已降级为本地骨架"), reason ? "：" + reason : "。仍可采用。")) : null, react.default.createElement("div", { className: "plab-chips" }, react.default.createElement("span", { className: "plab-score" }, "输出分 " + score), FIVE_LAYERS.map((id) => {
					const on = layers[id] === true;
					return react.default.createElement("span", {
						key: id,
						className: "plab-chip " + (on ? "is-on" : "is-off")
					}, (on ? "✓ " : "✗ ") + (LAYER_NAMES[id] || id));
				})), react.default.createElement("div", { className: "plab-panes" }, react.default.createElement("div", { className: "plab-pane" }, react.default.createElement("div", { className: "plab-pane-h" }, "原稿（可编辑）"), react.default.createElement("textarea", {
					className: "plab-pane-edit",
					value: draftText,
					spellCheck: false,
					disabled: !!busy,
					placeholder: "可在此编辑；点「回填输入」把右侧结果填进来继续改",
					onChange: (e) => onDraftChange && onDraftChange(e.target.value)
				})), react.default.createElement("div", { className: "plab-pane" }, react.default.createElement("div", { className: "plab-pane-h" }, "结果"), react.default.createElement("pre", { className: "plab-pane-b" }, data && data.text || ""))), react.default.createElement("div", { className: "plab-modal-foot" }, react.default.createElement("span", { className: "plab-hint" }, "继续优化＝对左侧原稿再跑一轮 · 回填输入＝结果填入原稿 · 采用＝原稿写回输入框"), react.default.createElement("button", {
					type: "button",
					className: "plab-b",
					onClick: onCancel,
					disabled: !!busy
				}, "取消"), react.default.createElement("button", {
					type: "button",
					className: "plab-b",
					onClick: onFillInput,
					disabled: !!busy
				}, "回填输入"), react.default.createElement("button", {
					type: "button",
					className: "plab-b",
					onClick: onContinue,
					disabled: !!busy
				}, busy ? "优化中…" : "继续优化"), react.default.createElement("button", {
					type: "button",
					className: "plab-b plab-b-primary",
					onClick: onAdopt,
					disabled: !!busy
				}, "采用")))), document.body);
			}
			function OptimizeInInput(props) {
				const [busy, setBusy] = react.default.useState(false);
				const [toast, setToast] = react.default.useState(null);
				const [settings, setSettings] = react.default.useState(() => loadSettings());
				const [modal, setModal] = react.default.useState(null);
				const btnRef = react.default.useRef(null);
				const activeRunRef = react.default.useRef(null);
				const runningRef = react.default.useRef(false);
				const toastTimer = react.default.useRef(null);
				const propsRef = react.default.useRef(props);
				propsRef.current = props;
				const modalRef = react.default.useRef(null);
				modalRef.current = modal;
				const settingsRef = react.default.useRef(settings);
				settingsRef.current = settings;
				react.default.useEffect(() => subscribeSettings(setSettings), []);
				react.default.useEffect(() => () => {
					if (toastTimer.current) window.clearTimeout(toastTimer.current);
				}, []);
				function showToast(text, kind) {
					setToast({
						text,
						kind: kind || "ok"
					});
					if (toastTimer.current) window.clearTimeout(toastTimer.current);
					toastTimer.current = window.setTimeout(() => setToast(null), 3500);
				}
				/** 取消/Esc：绝不改草稿（输入框与弹窗内编辑都不写回） */
				function cancelModal() {
					setModal(null);
					showToast("已取消，草稿未修改", "err");
				}
				/** 采用：把左侧「原稿」当前内容写回输入框（含回填后的二次编辑） */
				function adoptModal() {
					if (!modal) return;
					const current = readDraft(propsRef.current);
					if (!canAdoptResult(modal.snapshot, current) && !canAdoptResult(modal.draft, current)) {
						showToast("草稿已变更，未覆盖。请重新优化。", "err");
						setModal(null);
						return;
					}
					const text = typeof modal.draft === "string" ? modal.draft : modal.text;
					if (writeDraft(propsRef.current, text)) {
						showToast("已写入", "ok");
						setModal(null);
					} else showToast("无法写回输入框，请手动复制结果", "err");
				}
				/** 回填输入：把右侧「结果」填入左侧原稿窗，便于二次编辑/优化 */
				function fillInputModal() {
					if (!modal) return;
					setModal({
						...modal,
						draft: modal.text
					});
					showToast("已把优化结果回填到原稿窗口，可继续编辑", "ok");
				}
				function changeModalDraft(value) {
					if (!modal) return;
					setModal({
						...modal,
						draft: value
					});
				}
				/** 与「优化」同一套调用：draft → optimizePrompt → 结果/诊断/降级 */
				async function callOptimize(draftText) {
					const runId = String(Date.now()) + "-" + Math.random().toString(36).slice(2, 8);
					activeRunRef.current = runId;
					const res = await host.call("optimizePrompt", {
						draft: draftText,
						...optimizePayload(settingsRef.current),
						runId
					});
					console.log("[dsh-prompt-lab] optimize result", {
						engine: settingsRef.current.engine,
						source: res.source,
						engineTried: res.engineTried,
						degraded: res.degraded,
						note: res.note,
						llmError: res.llmError,
						score: res.score,
						textLen: (res.text || "").length,
						draftLen: draftText.length
					});
					return res;
				}
				function modalFromResult(prev, draftText, res) {
					const text = res.text;
					return {
						snapshot: prev && prev.snapshot != null ? prev.snapshot : draftText,
						draft: draftText,
						text,
						score: typeof res.score === "number" ? res.score : res.diagnostics && res.diagnostics.score || 0,
						layers: res.layers || res.diagnostics && res.diagnostics.layers || {},
						degraded: res.degraded === true,
						note: res.note || "",
						llmError: res.llmError || "",
						source: res.source,
						engineTried: res.engineTried
					};
				}
				/** 继续优化：对弹窗左侧当前原稿再跑一轮（与「优化」逻辑相同） */
				async function continueOptimize() {
					if (runningRef.current || !modal) return;
					const draftText = typeof modal.draft === "string" ? modal.draft : modal.text || "";
					if (!draftText.trim()) {
						showToast("请先输入提示词草稿", "err");
						return;
					}
					runningRef.current = true;
					setBusy(true);
					showToast("正在优化…", "ok");
					try {
						const res = await callOptimize(draftText);
						if (!res.text) {
							showToast("优化结果为空", "err");
							return;
						}
						setModal(modalFromResult(modal, draftText, res));
						showToast("继续优化完成。可「回填输入」或再点「继续优化」。", "ok");
					} catch (err) {
						console.error("[dsh-prompt-lab] continue optimize failed", err);
						if (err && err.cancelled) showToast("已取消，草稿未修改", "err");
						else showToast(String(err && err.message || err), "err");
					} finally {
						runningRef.current = false;
						activeRunRef.current = null;
						setBusy(false);
					}
				}
				async function copyResult() {
					if (!modal) return;
					const text = modal.text || "";
					if (!text.trim()) {
						showToast("输出为空，先运行优化。", "err");
						return;
					}
					try {
						await navigator.clipboard.writeText(text);
						showToast("已复制到剪贴板。", "ok");
					} catch (e) {
						showToast("复制失败，请手动选择结果文本", "err");
					}
				}
				async function runOptimize() {
					if (runningRef.current) return;
					const snapshot = readDraft(propsRef.current);
					if (!snapshot.trim()) {
						showToast("请先输入提示词草稿", "err");
						return;
					}
					runningRef.current = true;
					setBusy(true);
					showToast("正在优化…", "ok");
					try {
						const res = await callOptimize(snapshot);
						if (!res.text) {
							showToast("优化结果为空", "err");
							return;
						}
						setModal(modalFromResult(null, snapshot, res));
						showToast("优化完成。可编辑左侧原稿，或「继续优化」/「回填输入」。", "ok");
					} catch (err) {
						console.error("[dsh-prompt-lab] optimize failed", err);
						if (err && err.cancelled) showToast("已取消，草稿未修改", "err");
						else showToast(String(err && err.message || err), "err");
					} finally {
						runningRef.current = false;
						activeRunRef.current = null;
						setBusy(false);
					}
				}
				react.default.useEffect(() => {
					function onKey(e) {
						if (!(e.ctrlKey || e.metaKey) || e.key !== "Enter") return;
						if (modalRef.current) return;
						if (loadSettings().useHotkey === false) return;
						e.preventDefault();
						runOptimize();
					}
					document.addEventListener("keydown", onKey);
					return () => document.removeEventListener("keydown", onKey);
				}, [settings]);
				const toastStyle = toast ? (() => {
					const r = btnRef.current ? btnRef.current.getBoundingClientRect() : {
						top: 0,
						left: 0,
						right: 80
					};
					return {
						top: r.top > 48 ? r.top - 36 : r.bottom + 8,
						left: Math.max(8, Math.min(r.left, window.innerWidth - 360))
					};
				})() : {
					left: 0,
					top: -40
				};
				return react.default.createElement(react.default.Fragment, null, react.default.createElement("div", { className: "plab-root" }, react.default.createElement("button", {
					type: "button",
					ref: btnRef,
					className: "plab-btn" + (busy ? " is-busy" : ""),
					disabled: busy,
					onClick: runOptimize,
					title: busy ? "优化中…" : "优化（" + engineLabel(settings) + "）· Ctrl/⌘+Enter",
					"aria-label": busy ? "优化中" : "优化提示词（" + engineLabel(settings) + "）"
				}, busy ? react.default.createElement("span", { className: "plab-spin" }) : react.default.createElement(Icon), busy ? "优化中" : "优化"), toast ? react.default.createElement("div", {
					className: "plab-toast is-" + toast.kind,
					role: "status",
					style: toastStyle
				}, toast.text) : null), modal ? react.default.createElement(ResultModal, {
					data: modal,
					busy,
					onAdopt: adoptModal,
					onFillInput: fillInputModal,
					onCopy: copyResult,
					onCancel: cancelModal,
					onDraftChange: changeModalDraft,
					onContinue: continueOptimize
				}) : null);
			}
			ctx.slots.inject("conversation.input.left", () => {
				console.log("[dsh-prompt-lab] injecting conversation.input.left");
				return ctx.slots.register({
					name: "conversation.input.left",
					id: "dsh-prompt-lab",
					order: 50,
					label: "Prompt Lab 优化"
				}, OptimizeInInput);
			});
			ctx.slots.inject("settings.section", () => {
				console.log("[dsh-prompt-lab] injecting settings.section");
				try {
					return ctx.slots.register({
						name: "settings.section",
						id: "prompt-lab",
						order: 90,
						label: "提示词工坊",
						locale: "promptLab"
					}, PromptLabSettingsSection);
				} catch (err) {
					console.warn("[dsh-prompt-lab] settings.section failed", err);
					return () => {};
				}
			});
			console.log("[dsh-prompt-lab] client mounted");
		}
		var client_default = {
			name: "dsh-prompt-lab/client",
			inject,
			apply
		};
		//#endregion
		exports.apply = apply;
		exports.default = client_default;
		exports.inject = inject;
		return module.exports;
	}
});
