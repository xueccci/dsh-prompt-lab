import { readFileSync, writeFileSync } from 'node:fs'

const path = 'G:/提示词优化器/dsh-prompt-lab/src/client/index.js'
let src = readFileSync(path, 'utf8')

const newCss = `const css = \`
  .plab-root{display:inline-flex;align-items:center;gap:2px;position:relative;
    --pl-surface:var(--dsw-alias-bg-layer-2,var(--dsw-alias-bg-layer-1,#fff));
    --pl-raised:var(--dsw-alias-bg-layer-3,var(--dsw-alias-bg-layer-1,#fff));
    --pl-border:var(--dsw-alias-border-l1,#0000000a);
    --pl-border-strong:var(--dsw-alias-border-l2,#0000001a);
    --pl-text:var(--dsw-alias-label-primary,#0f1115);
    --pl-text-2:var(--dsw-alias-label-secondary,#61666b);
    --pl-text-3:var(--dsw-alias-label-tertiary,#81858c);
    --pl-accent:var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary,#0E8A7D));
    --pl-accent-soft:color-mix(in srgb,var(--pl-accent) 14%,transparent);
    --pl-primary:var(--dsw-alias-button-primary-fill,var(--pl-accent));
    --pl-primary-hover:var(--dsw-alias-button-primary-hover,var(--pl-accent));
    --pl-primary-fg:var(--dsw-alias-button-primary-foreground,#fff);
    --pl-warn:var(--dsw-alias-state-error-primary,#b42318);
    --pl-menu:var(--dsw-specific-menu,var(--pl-raised));
    color:var(--pl-text);min-width:0}
  .plab-btn{appearance:none;display:inline-flex;align-items:center;justify-content:center;gap:6px;
    height:28px;padding:0 12px;font-size:12px;font-weight:500;line-height:1;
    color:var(--pl-text-3);border:none;border-radius:999px;cursor:pointer;
    background:transparent;opacity:.72;
    transition:background .15s ease,color .15s ease,opacity .15s ease,transform .12s ease}
  .plab-btn:hover:not(:disabled){color:var(--pl-text);opacity:1;
    background:var(--dsw-alias-interactive-bg-hover,var(--pl-raised))}
  .plab-btn:active:not(:disabled){transform:scale(.97)}
  .plab-btn:disabled{opacity:.35;cursor:not-allowed}
  .plab-btn.is-on{color:var(--pl-accent);opacity:1;font-weight:600;
    background:var(--pl-accent-soft);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--pl-accent) 35%,transparent)}
  .plab-btn.is-on:hover:not(:disabled){background:color-mix(in srgb,var(--pl-accent) 20%,transparent)}
  .plab-btn.is-busy{color:var(--pl-accent);opacity:1;cursor:progress}
  .plab-btn svg{width:14px;height:14px;flex:none}
  .plab-chip{position:fixed;z-index:180;max-width:min(280px,calc(100vw - 24px));
    padding:6px 10px;font-size:11px;line-height:16px;color:var(--pl-text-2);
    background:var(--pl-menu);border:1px solid var(--pl-border-strong);border-radius:8px;
    box-shadow:var(--dsw-shadow-lv2,0 6px 16px rgba(0,0,0,.16));
    animation:plab-pop .14s ease-out;pointer-events:none}
  @keyframes plab-spin{to{transform:rotate(360deg)}}
  @keyframes plab-pop{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
  .plab-spin{width:12px;height:12px;flex:none;border-radius:50%;
    border:2px solid color-mix(in srgb,var(--pl-accent) 22%,transparent);
    border-top-color:var(--pl-accent);animation:plab-spin .7s linear infinite}
  .plab-panel{position:fixed;z-index:170;box-sizing:border-box;display:flex;flex-direction:column;
    width:min(300px,calc(100vw - 20px));max-height:min(400px,calc(100vh - 24px));
    background:var(--pl-menu);border:1px solid var(--pl-border-strong);border-radius:12px;
    box-shadow:0 10px 28px rgba(0,0,0,.2);
    color:var(--pl-text);font-size:12px;line-height:18px;cursor:default;
    overflow:hidden;animation:plab-pop .14s ease-out}
  .plab-panel-head{display:flex;align-items:center;justify-content:space-between;gap:8px;
    padding:10px 12px;border-bottom:1px solid var(--pl-border);background:var(--pl-raised);flex:none}
  .plab-panel-title{display:flex;align-items:center;gap:7px;font-weight:600;font-size:12.5px;margin:0;min-width:0}
  .plab-panel-title svg{width:14px;height:14px;color:var(--pl-accent);flex:none}
  .plab-x{width:24px;height:24px;padding:0;border:none;border-radius:6px;background:transparent;
    color:var(--pl-text-3);cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
  .plab-x:hover{color:var(--pl-text);background:var(--dsw-alias-interactive-bg-hover)}
  .plab-panel-body{overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px;min-width:0}
  .plab-sec-label{margin:0 0 6px;font-size:11px;font-weight:600;color:var(--pl-text-3)}
  .plab-mode-row{display:flex;gap:6px;flex-wrap:wrap}
  .plab-mode{height:28px;padding:0 10px;font-size:12px;border-radius:8px;cursor:pointer;
    border:1px solid var(--pl-border);background:transparent;color:var(--pl-text-2);
    transition:background .12s ease,color .12s ease,border-color .12s ease}
  .plab-mode:hover:not(.is-on){background:var(--dsw-alias-interactive-bg-hover);color:var(--pl-text)}
  .plab-mode.is-on{border-color:color-mix(in srgb,var(--pl-accent) 50%,transparent);
    color:var(--pl-accent);background:var(--pl-accent-soft);font-weight:600}
  .plab-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:6px 2px}
  .plab-row-label{font-size:12.5px;color:var(--pl-text-2);flex:1;min-width:0}
  .plab-switch{appearance:none;flex:0 0 auto;width:34px;height:20px;margin:0;
    border:1px solid var(--pl-border-strong);border-radius:999px;cursor:pointer;
    background:var(--pl-surface);position:relative;transition:background .15s ease,border-color .15s ease}
  .plab-switch::after{content:'';position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:var(--pl-text-3);transition:transform .15s ease,background .15s ease}
  .plab-switch:checked{background:var(--pl-accent);border-color:var(--pl-accent)}
  .plab-switch:checked::after{transform:translateX(14px);background:#fff}
  .plab-hint{margin:0;font-size:11px;line-height:15px;color:var(--pl-text-3)}
  .plab-diag{display:flex;flex-wrap:wrap;gap:4px}
  .plab-tag{display:inline-flex;align-items:center;gap:2px;padding:2px 7px;font-size:11px;line-height:16px;
    border-radius:999px;border:1px solid var(--pl-border);color:var(--pl-text-3);background:transparent}
  .plab-tag.hit{border-color:color-mix(in srgb,var(--pl-accent) 45%,transparent);color:var(--pl-accent);
    background:var(--pl-accent-soft)}
  .plab-score{font-weight:600;font-size:12px;color:var(--pl-text-2);margin-left:auto}
  .plab-orig{max-height:56px;overflow:hidden;padding:8px 10px;font-size:11.5px;color:var(--pl-text-3);
    white-space:pre-wrap;word-break:break-word;cursor:pointer;border:1px dashed var(--pl-border);
    border-radius:8px;background:var(--dsw-alias-bg-input,transparent);
    display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical}
  .plab-orig.is-open{max-height:100px;overflow-y:auto;display:block}
  .plab-orig-label{font-size:10px;font-weight:600;color:var(--pl-text-3);margin:0 0 4px}
  .plab-body{max-height:200px;overflow-y:auto;padding:10px 12px;font-size:12.5px;line-height:19px;
    color:var(--pl-text);white-space:pre-wrap;word-break:break-word;
    background:color-mix(in srgb,var(--pl-accent) 8%,var(--dsw-alias-bg-input,transparent));
    border-radius:8px}
  .plab-body.is-open{max-height:300px}
  .plab-notes{display:flex;flex-direction:column;gap:3px;font-size:11px;color:var(--pl-text-3)}
  .plab-notes.is-hidden{display:none}
  .plab-expand{align-self:flex-start;padding:2px 0;border:none;background:transparent;color:var(--pl-accent);
    font-size:11px;cursor:pointer;font-weight:500}
  .plab-expand:hover{text-decoration:underline}
  .plab-actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;
    padding-top:8px;border-top:1px solid var(--pl-border)}
  .plab-b{appearance:none;display:inline-flex;align-items:center;justify-content:center;
    min-height:30px;height:30px;padding:0 12px;font-size:12px;font-weight:500;cursor:pointer;
    border:1px solid var(--pl-border);border-radius:8px;background:var(--pl-surface);color:var(--pl-text);
    transition:background .15s ease,opacity .15s ease}
  .plab-b:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,var(--pl-raised))}
  .plab-b:disabled{opacity:.4;cursor:not-allowed}
  .plab-b-primary{background:var(--pl-primary);border-color:var(--pl-primary);color:var(--pl-primary-fg);font-weight:600}
  .plab-b-primary:hover:not(:disabled){background:var(--pl-primary-hover);border-color:var(--pl-primary-hover)}
  .plab-err{padding:10px 12px;font-size:12px;color:var(--pl-warn);border-radius:8px;
    background:color-mix(in srgb,var(--pl-warn) 10%,transparent);word-break:break-word}
  .plab-src{font-size:11px;color:var(--pl-text-3)}
  .plab-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .plab-btn:focus-visible,.plab-b:focus-visible,.plab-mode:focus-visible,
  .plab-x:focus-visible,.plab-switch:focus-visible,.plab-expand:focus-visible{
    outline:2px solid var(--pl-accent);outline-offset:2px}
  @media (prefers-reduced-motion:reduce){.plab-root *{transition:none!important;animation:none!important}}
  @media (max-width:560px){.plab-actions .plab-b{flex:1 1 110px}}
\``

// Replace CSS
const cs = src.indexOf('const css = `')
const ce = src.indexOf('`\n', cs + 13)
if (cs < 0 || ce < 0) throw new Error('css markers not found')
src = src.slice(0, cs) + newCss + src.slice(ce + 2)

// Force overwrite style tag
src = src.replace(
  /const tag = document\.createElement\('style'\)[\s\S]*?document\.head\.appendChild\(tag\)/,
  `const existing = document.querySelector('style[data-plugin-css=' + JSON.stringify(cssTagId) + ']')
  if (existing) {
    existing.textContent = css
  } else {
    const tag = document.createElement('style')
    tag.dataset.plugin = 'dsh-prompt-lab'
    tag.dataset.pluginCss = cssTagId
    tag.textContent = css
    document.head.appendChild(tag)
  }`,
)

const startMarker = '  function OptimizeControl(props) {'
const endMarker = '\n  // conversation.input.left is a session-scoped LIST slot'
const start = src.indexOf(startMarker)
const end = src.indexOf(endMarker)
if (start < 0 || end < 0) throw new Error('control markers not found')

const replacement = `  function OptimizeControl(props) {
    const [busy, setBusy] = React.useState(false)
    const [info, setInfo] = React.useState(null)
    const [open, setOpen] = React.useState(false)
    const [settings, setSettings] = React.useState(() => normalizeSettings(loadSettings()))
    const [pending, setPending] = React.useState(null)
    const [origOpen, setOrigOpen] = React.useState(false)
    const [bodyOpen, setBodyOpen] = React.useState(false)
    const [notesOpen, setNotesOpen] = React.useState(false)
    const [anchor, setAnchor] = React.useState(null)
    const rootRef = React.useRef(null)
    const btnRef = React.useRef(null)
    const panelRef = React.useRef(null)
    const mirror = React.useRef({ draft: '' })
    const activeRunRef = React.useRef(null)
    const cancelledRef = React.useRef(false)

    const input = props.input || {}
    const session = props.session || {}
    const draft = typeof input.draft === 'string' ? input.draft : ''
    mirror.current.draft = draft
    const hasOccurrences = Array.isArray(input.occurrences) && input.occurrences.length > 0
    const noDraft = session.removed === true || !draft.trim() || hasOccurrences
    const panelOpen = open || !!pending

    React.useEffect(() => { maybePull() }, [])

    function placePanel() {
      const el = btnRef.current || rootRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const w = Math.min(300, window.innerWidth - 20)
      let left = r.right - w
      if (left < 10) left = 10
      if (left + w > window.innerWidth - 10) left = Math.max(10, window.innerWidth - w - 10)
      const preferUp = r.top > 260
      const h = panelRef.current ? panelRef.current.offsetHeight : 280
      let top = preferUp ? r.top - h - 8 : r.bottom + 8
      if (top < 8) top = Math.min(r.bottom + 8, Math.max(8, window.innerHeight - h - 8))
      if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 8)
      setAnchor({ left, top, width: w })
    }

    React.useEffect(() => {
      if (!panelOpen) {
        setAnchor(null)
        return
      }
      placePanel()
      const onMove = () => placePanel()
      window.addEventListener('resize', onMove)
      window.addEventListener('scroll', onMove, true)
      const t = window.setTimeout(onMove, 40)
      return () => {
        window.removeEventListener('resize', onMove)
        window.removeEventListener('scroll', onMove, true)
        window.clearTimeout(t)
      }
    }, [panelOpen, open, pending])

    React.useEffect(() => {
      if (!panelOpen) return
      function onDoc(e) {
        if (rootRef.current && rootRef.current.contains(e.target)) return
        if (panelRef.current && panelRef.current.contains(e.target)) return
        setOpen(false)
      }
      document.addEventListener('mousedown', onDoc)
      return () => document.removeEventListener('mousedown', onDoc)
    }, [panelOpen])

    React.useEffect(() => {
      function onKey(e) {
        if (e.key === 'Escape') {
          setOpen(false)
          setPending(null)
        }
      }
      if (panelOpen) document.addEventListener('keydown', onKey)
      return () => document.removeEventListener('keydown', onKey)
    }, [panelOpen])

    function updateSettings(patch) {
      const view = saveSettings(patch)
      setSettings(view)
      pushHostSettings(view)
      return view
    }

    function closeAll() {
      setOpen(false)
      setPending(null)
    }

    function toggleOpen() {
      if (pending) setPending(null)
      setOpen((v) => !v)
    }

    async function runOptimize() {
      if (busy) {
        if (activeRunRef.current) {
          cancelledRef.current = true
          try { await host.call('cancelOptimize', { runId: activeRunRef.current }) } catch (e) {}
        }
        return
      }
      const snapshot = draft
      if (!snapshot.trim()) return
      setPending(null)
      setBusy(true)
      setInfo(null)
      cancelledRef.current = false
      const runId = String(Date.now()) + '-' + Math.random().toString(36).slice(2, 8)
      activeRunRef.current = runId
      try {
        const res = await host.call('optimizePrompt', {
          draft: snapshot,
          mode: settings.mode,
          useLlm: settings.useLlm,
          useLoop: settings.useLoop,
          runId,
        })
        if (cancelledRef.current) {
          setInfo('已取消')
          return
        }
        setPending({
          original: snapshot,
          result: res.text,
          diagnostics: res.diagnostics || null,
          notes: res.notes || [],
          source: res.source || 'local',
          truncated: !!res.truncated,
          llmError: res.llmError || null,
        })
        setOrigOpen(false)
        setBodyOpen(false)
        setNotesOpen(false)
      } catch (err) {
        if (err && err.cancelled) setInfo('已取消')
        else setPending({ original: snapshot, error: String((err && err.message) || err) })
      } finally {
        activeRunRef.current = null
        cancelledRef.current = false
        setBusy(false)
      }
    }

    function adopt() {
      if (!pending || pending.error || !pending.result) return
      if (mirror.current.draft !== pending.original) {
        setInfo('草稿已变化，无法采用')
        return
      }
      const inputActions = input.actions || props.inputActions
      if (inputActions && typeof inputActions.setDraft === 'function') inputActions.setDraft(pending.result)
      else if (input && typeof input.setDraft === 'function') input.setDraft(pending.result)
      else if (typeof props.onChangeDraft === 'function') props.onChangeDraft(pending.result)
      else {
        setInfo('当前会话不支持写回草稿')
        return
      }
      setPending(null)
      setInfo('已采用优化结果')
    }

    const layers = pending && pending.diagnostics && pending.diagnostics.layers ? pending.diagnostics.layers : null
    const score = pending && pending.diagnostics ? pending.diagnostics.score : null
    const canAdopt = pending && !pending.error && pending.result && mirror.current.draft === pending.original
    const panelStyle = anchor
      ? { left: anchor.left, top: anchor.top, width: anchor.width }
      : { left: -9999, top: -9999, width: 300, visibility: 'hidden' }

    let body = null
    if (pending) {
      if (pending.error) {
        body = React.createElement(
          React.Fragment,
          null,
          React.createElement('div', { className: 'plab-err' }, pending.error),
          React.createElement(
            'div',
            { className: 'plab-actions' },
            React.createElement('button', { type: 'button', className: 'plab-b', onClick: closeAll }, '关闭'),
            React.createElement(
              'button',
              { type: 'button', className: 'plab-b plab-b-primary',
                onClick: () => { setPending(null); runOptimize() } },
              '重试',
            ),
          ),
        )
      } else {
        body = React.createElement(
          React.Fragment,
          null,
          layers
            ? React.createElement(
                'div',
                { className: 'plab-meta' },
                React.createElement(
                  'div',
                  { className: 'plab-diag' },
                  LAYER_TAGS.map((t) =>
                    React.createElement(
                      'span',
                      { key: t.key, className: 'plab-tag' + (layers[t.key] ? ' hit' : '') },
                      layers[t.key] ? '✓ ' : '✗ ',
                      t.label,
                    ),
                  ),
                ),
                score != null ? React.createElement('span', { className: 'plab-score' }, score + ' 分') : null,
              )
            : null,
          React.createElement(
            'div',
            null,
            React.createElement('p', { className: 'plab-orig-label' }, '原稿（点击展开）'),
            React.createElement(
              'div',
              { className: 'plab-orig' + (origOpen ? ' is-open' : ''), onClick: () => setOrigOpen((v) => !v) },
              pending.original,
            ),
          ),
          React.createElement(
            'div',
            null,
            React.createElement('p', { className: 'plab-orig-label' }, '优化结果'),
            React.createElement('div', { className: 'plab-body' + (bodyOpen ? ' is-open' : '') }, pending.result),
            React.createElement(
              'button',
              { type: 'button', className: 'plab-expand', onClick: () => setBodyOpen((v) => !v) },
              bodyOpen ? '收起' : '展开全文',
            ),
          ),
          pending.truncated
            ? React.createElement('p', { className: 'plab-hint', style: { color: 'var(--pl-warn)' } }, '结果可能被截断。')
            : null,
          pending.llmError
            ? React.createElement('p', { className: 'plab-hint' }, 'LLM 未采用：' + pending.llmError)
            : null,
          React.createElement(
            'div',
            { className: 'plab-meta' },
            React.createElement(
              'span',
              { className: 'plab-src' },
              '来源：' + (pending.source === 'hybrid' ? '本地结构 + LLM 精修' : '本地规则'),
            ),
          ),
          pending.notes && pending.notes.length
            ? React.createElement(
                React.Fragment,
                null,
                React.createElement(
                  'button',
                  { type: 'button', className: 'plab-expand', onClick: () => setNotesOpen((v) => !v) },
                  notesOpen ? '收起流水线' : '流水线说明',
                ),
                React.createElement(
                  'div',
                  { className: 'plab-notes' + (notesOpen ? '' : ' is-hidden') },
                  pending.notes.map((n, i) => React.createElement('span', { key: i }, '· ' + n)),
                ),
              )
            : null,
          React.createElement(
            'div',
            { className: 'plab-actions' },
            React.createElement('button', { type: 'button', className: 'plab-b', onClick: closeAll }, '保留原稿'),
            React.createElement(
              'button',
              {
                type: 'button',
                className: 'plab-b plab-b-primary',
                disabled: !canAdopt,
                onClick: adopt,
                title: canAdopt ? '写回输入框' : '草稿已变化或结果不可用',
              },
              '采用',
            ),
          ),
        )
      }
    } else {
      body = React.createElement(
        React.Fragment,
        null,
        React.createElement(
          'div',
          null,
          React.createElement('p', { className: 'plab-sec-label' }, '优化模式'),
          React.createElement(
            'div',
            { className: 'plab-mode-row', role: 'radiogroup', 'aria-label': '优化模式' },
            MODE_OPTIONS.map((o) =>
              React.createElement(
                'button',
                {
                  key: o.value,
                  type: 'button',
                  role: 'radio',
                  'aria-checked': settings.mode === o.value,
                  className: 'plab-mode' + (settings.mode === o.value ? ' is-on' : ''),
                  onClick: () => updateSettings({ mode: o.value }),
                },
                o.label,
              ),
            ),
          ),
        ),
        React.createElement(
          'div',
          { className: 'plab-row' },
          React.createElement('span', { className: 'plab-row-label' }, 'LLM 精修'),
          React.createElement('input', {
            type: 'checkbox',
            className: 'plab-switch',
            checked: settings.useLlm,
            onChange: (e) => updateSettings({ useLlm: e.target.checked }),
          }),
        ),
        React.createElement(
          'div',
          { className: 'plab-row' },
          React.createElement('span', { className: 'plab-row-label' }, '输出前自检'),
          React.createElement('input', {
            type: 'checkbox',
            className: 'plab-switch',
            checked: settings.useLoop,
            onChange: (e) => updateSettings({ useLoop: e.target.checked }),
          }),
        ),
        React.createElement(
          'p',
          { className: 'plab-hint' },
          settings.useLlm ? '本地骨架 + 模型精修，失败回退本地。' : '纯本地模式，草稿不出本机。',
        ),
        React.createElement(
          'div',
          { className: 'plab-actions' },
          React.createElement(
            'button',
            {
              type: 'button',
              className: 'plab-b plab-b-primary',
              disabled: noDraft && !busy,
              onClick: runOptimize,
              title: noDraft ? '先输入草稿' : '开始优化',
            },
            busy ? '停止' : '开始优化',
          ),
        ),
      )
    }

    const title = pending
      ? pending.error
        ? '优化失败'
        : '优化结果 · ' + ((MODE_OPTIONS.find((m) => m.value === settings.mode) || {}).label || '')
      : '提示词工坊'

    return React.createElement(
      'div',
      { className: 'plab-root', ref: rootRef },
      info
        ? React.createElement(
            'div',
            {
              className: 'plab-chip',
              role: 'status',
              style: {
                left: anchor ? anchor.left : 0,
                top: btnRef.current ? btnRef.current.getBoundingClientRect().top - 40 : 0,
              },
            },
            info,
          )
        : null,
      React.createElement(
        'button',
        {
          type: 'button',
          ref: btnRef,
          className: 'plab-btn' + (panelOpen ? ' is-on' : '') + (busy ? ' is-busy' : ''),
          onClick: toggleOpen,
          title: panelOpen ? '关闭提示词工坊' : '打开提示词工坊',
          'aria-label': panelOpen ? '关闭提示词工坊' : '打开提示词工坊',
          'aria-expanded': panelOpen,
        },
        busy
          ? React.createElement('span', { className: 'plab-spin' })
          : React.createElement(Icon, { name: 'optimize' }),
        busy ? '停止' : '优化',
      ),
      panelOpen
        ? React.createElement(
            'div',
            {
              className: 'plab-panel',
              ref: panelRef,
              role: 'dialog',
              'aria-label': title,
              style: panelStyle,
            },
            React.createElement(
              'div',
              { className: 'plab-panel-head' },
              React.createElement(
                'p',
                { className: 'plab-panel-title' },
                React.createElement(Icon, { name: 'optimize' }),
                title,
              ),
              React.createElement(
                'button',
                { type: 'button', className: 'plab-x', onClick: closeAll, 'aria-label': '关闭' },
                React.createElement(Icon, { name: 'x' }),
              ),
            ),
            React.createElement('div', { className: 'plab-panel-body' }, body),
          )
        : null,
    )
  }
`

src = src.slice(0, start) + replacement + src.slice(end)
writeFileSync(path, src, 'utf8')

const check = readFileSync(path, 'utf8')
console.log('length', check.length)
console.log('gear ref left', check.includes('gearRef'))
console.log('toggleOpen', check.includes('toggleOpen'))
console.log('is-on class', check.includes("panelOpen ? ' is-on'"))
console.log('mode-row', check.includes('plab-mode-row'))
console.log('style overwrite', check.includes('existing.textContent = css'))
console.log('no plab-tog', !check.includes('plab-tog'))
console.log('no plab-seg', !check.includes('plab-seg'))
