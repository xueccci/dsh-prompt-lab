import { readFileSync, writeFileSync } from 'node:fs'

const path = 'G:/提示词优化器/dsh-prompt-lab/src/client/index.js'
let src = readFileSync(path, 'utf8')

const startMarker = '  function OptimizeControl(props) {'
const endMarker = '\n  // conversation.input.left is a session-scoped LIST slot'
const start = src.indexOf(startMarker)
const end = src.indexOf(endMarker)
if (start < 0) throw new Error('start not found')
if (end < 0) throw new Error('end not found')

const replacement = `  function OptimizeControl(props) {
    const [busy, setBusy] = React.useState(false)
    const [info, setInfo] = React.useState(null)
    const [gearOpen, setGearOpen] = React.useState(false)
    const [settings, setSettings] = React.useState(() => normalizeSettings(loadSettings()))
    const [pending, setPending] = React.useState(null)
    const [origOpen, setOrigOpen] = React.useState(false)
    const [bodyOpen, setBodyOpen] = React.useState(false)
    const [notesOpen, setNotesOpen] = React.useState(false)
    const [anchor, setAnchor] = React.useState(null)
    const rootRef = React.useRef(null)
    const gearRef = React.useRef(null)
    const panelRef = React.useRef(null)
    const mirror = React.useRef({ draft: '' })
    const activeRunRef = React.useRef(null)
    const cancelledRef = React.useRef(false)

    const input = props.input || {}
    const session = props.session || {}
    const draft = typeof input.draft === 'string' ? input.draft : ''
    mirror.current.draft = draft
    const hasOccurrences = Array.isArray(input.occurrences) && input.occurrences.length > 0
    const disabled = session.removed === true || !draft.trim() || hasOccurrences
    const panelOpen = gearOpen || !!pending

    React.useEffect(() => { maybePull() }, [])

    function placePanel() {
      const el = gearRef.current || rootRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const w = Math.min(300, window.innerWidth - 20)
      const left = Math.max(10, Math.min(r.left, window.innerWidth - w - 10))
      const preferUp = r.top > 260
      const h = panelRef.current ? panelRef.current.offsetHeight : 300
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
      const t = window.setTimeout(onMove, 50)
      return () => {
        window.removeEventListener('resize', onMove)
        window.removeEventListener('scroll', onMove, true)
        window.clearTimeout(t)
      }
    }, [panelOpen, gearOpen, pending])

    React.useEffect(() => {
      if (!panelOpen) return
      function onDoc(e) {
        if (rootRef.current && rootRef.current.contains(e.target)) return
        if (panelRef.current && panelRef.current.contains(e.target)) return
        setGearOpen(false)
      }
      document.addEventListener('mousedown', onDoc)
      return () => document.removeEventListener('mousedown', onDoc)
    }, [panelOpen])

    React.useEffect(() => {
      function onKey(e) {
        if (e.key === 'Escape') {
          setGearOpen(false)
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

    function closePanels() {
      setGearOpen(false)
      setPending(null)
    }

    function toggleGear() {
      setPending(null)
      setGearOpen((v) => !v)
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
      setGearOpen(false)
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
    if (gearOpen) {
      body = React.createElement(
        React.Fragment,
        null,
        React.createElement(
          'div',
          { className: 'plab-sec' },
          React.createElement('p', { className: 'plab-sec-label' }, '优化模式'),
          React.createElement(
            'div',
            { className: 'plab-seg', role: 'radiogroup', 'aria-label': '优化模式' },
            MODE_OPTIONS.map((o) =>
              React.createElement(
                'button',
                {
                  key: o.value,
                  type: 'button',
                  role: 'radio',
                  'aria-checked': settings.mode === o.value,
                  className: 'plab-seg-item' + (settings.mode === o.value ? ' is-on' : ''),
                  onClick: () => updateSettings({ mode: o.value }),
                },
                o.label,
              ),
            ),
          ),
        ),
        React.createElement(
          'div',
          { className: 'plab-tog', role: 'switch', tabIndex: 0, 'aria-checked': settings.useLlm,
            onClick: () => updateSettings({ useLlm: !settings.useLlm }),
            onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); updateSettings({ useLlm: !settings.useLlm }) } } },
          React.createElement(
            'div',
            { className: 'plab-tog-text' },
            React.createElement('span', { className: 'plab-tog-title' }, 'LLM 精修'),
            React.createElement('span', { className: 'plab-tog-desc' }, '本地骨架 + 模型润色；关闭则纯本地'),
          ),
          React.createElement('input', {
            type: 'checkbox',
            className: 'plab-switch',
            checked: settings.useLlm,
            readOnly: true,
            tabIndex: -1,
            'aria-hidden': 'true',
          }),
        ),
        React.createElement(
          'div',
          { className: 'plab-tog', role: 'switch', tabIndex: 0, 'aria-checked': settings.useLoop,
            onClick: () => updateSettings({ useLoop: !settings.useLoop }),
            onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); updateSettings({ useLoop: !settings.useLoop }) } } },
          React.createElement(
            'div',
            { className: 'plab-tog-text' },
            React.createElement('span', { className: 'plab-tog-title' }, '输出前自检'),
            React.createElement('span', { className: 'plab-tog-desc' }, '删重复与无关内容后再返回'),
          ),
          React.createElement('input', {
            type: 'checkbox',
            className: 'plab-switch',
            checked: settings.useLoop,
            readOnly: true,
            tabIndex: -1,
            'aria-hidden': 'true',
          }),
        ),
        React.createElement(
          'p',
          { className: 'plab-hint' },
          settings.useLlm ? '已配 DSH 模型时自动精修；失败回退本地。' : '纯本地模式，草稿不出本机。',
        ),
      )
    } else if (pending && pending.error) {
      body = React.createElement(
        React.Fragment,
        null,
        React.createElement('div', { className: 'plab-err' }, pending.error),
        React.createElement(
          'div',
          { className: 'plab-actions' },
          React.createElement('button', { type: 'button', className: 'plab-b', onClick: closePanels }, '关闭'),
          React.createElement(
            'button',
            { type: 'button', className: 'plab-b plab-b-primary',
              onClick: () => { setPending(null); runOptimize() } },
            '重试',
          ),
        ),
      )
    } else if (pending) {
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
          ? React.createElement('p', { className: 'plab-hint', style: { color: 'var(--pl-warn)' } }, '结果可能被截断，请检查是否完整。')
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
          React.createElement('button', { type: 'button', className: 'plab-b', onClick: closePanels }, '保留原稿'),
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

    const title = gearOpen
      ? '提示词工坊'
      : pending && pending.error
        ? '优化失败'
        : '优化结果 · ' + ((MODE_OPTIONS.find((m) => m.value === settings.mode) || {}).label || '')

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
                top: gearRef.current ? gearRef.current.getBoundingClientRect().top - 40 : 0,
              },
            },
            info,
          )
        : null,
      React.createElement(
        'button',
        {
          type: 'button',
          className: 'plab-btn',
          disabled: disabled && !busy,
          onClick: runOptimize,
          title: busy ? '停止优化' : 'Agent 结构化优化当前草稿',
          'aria-label': busy ? '停止优化' : '优化提示词',
        },
        busy
          ? React.createElement('span', { className: 'plab-spin' })
          : React.createElement(Icon, { name: 'optimize' }),
        busy ? '停止' : '优化',
      ),
      React.createElement(
        'button',
        {
          type: 'button',
          ref: gearRef,
          className: 'plab-gear' + (gearOpen ? ' is-open' : ''),
          onClick: toggleGear,
          title: '优化设置',
          'aria-label': '优化设置',
          'aria-expanded': gearOpen,
        },
        React.createElement(Icon, { name: 'gear' }),
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
                React.createElement(Icon, { name: gearOpen ? 'gear' : 'optimize' }),
                title,
              ),
              React.createElement(
                'button',
                { type: 'button', className: 'plab-x', onClick: closePanels, 'aria-label': '关闭' },
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
console.log('replaced OptimizeControl, length', src.length)
console.log('has plab-panel', src.includes('plab-panel'))
console.log('has placePanel', src.includes('placePanel'))
console.log('old plab-pop class in component', /className: 'plab-pop/.test(src))
