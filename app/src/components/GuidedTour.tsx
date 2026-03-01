import { useState, useEffect, useCallback } from 'react'
import { ChevronRight, Check, Loader } from 'lucide-react'
import { useFlowStore } from '@/store/flowStore'
import { useLocale } from '@/i18n/LocaleContext'
import { analytics } from '@/lib/analytics'
import type { FlomptNode, FlomptEdge } from '@/types/blocks'

const TOUR_KEY = 'flompt-onboarded'
const TW = 280 // tooltip width
const TH = 220 // estimated tooltip height

type Placement = 'right' | 'left' | 'top' | 'bottom' | 'inside-top'

interface Rect { top: number; left: number; width: number; height: number }

const calcTooltipPos = (r: Rect, p: Placement): { top: number; left: number } => {
  const gap = 18
  switch (p) {
    case 'right':      return { top: r.top + r.height / 2 - TH / 2, left: r.left + r.width + gap }
    case 'left':       return { top: r.top + r.height / 2 - TH / 2, left: r.left - TW - gap }
    case 'top':        return { top: r.top - TH - gap,               left: r.left + r.width / 2 - TW / 2 }
    case 'bottom':     return { top: r.top + r.height + gap,         left: r.left + r.width / 2 - TW / 2 }
    case 'inside-top': return { top: r.top + 24,                     left: r.left + r.width / 2 - TW / 2 }
  }
}

// ── Hardcoded example — mirrors real API response format ─────────────────────

const EXAMPLE_NODES_EN: FlomptNode[] = [
  {
    id: 'role-2ef496', type: 'block', position: { x: 100, y: 50 },
    data: { type: 'role', label: 'Role', summary: 'Senior Python developer',
      description: "Defines the AI's persona / role",
      content: 'You are a senior Python developer with extensive experience in code review, debugging, performance optimization, and Python best practices. You have expertise in identifying critical issues, security vulnerabilities, and style violations.' },
  },
  {
    id: 'input-92f78b', type: 'block', position: { x: 100, y: 230 },
    data: { type: 'input', label: 'Input', summary: 'Python code review',
      description: 'Data provided to the AI',
      content: 'Python code that needs to be reviewed for bugs, performance issues, and style violations.' },
  },
  {
    id: 'objective-818108', type: 'block', position: { x: 100, y: 410 },
    data: { type: 'objective', label: 'Objective', summary: 'Code review analysis',
      description: 'What we want to accomplish',
      content: 'Review the provided Python code to identify and explain bugs, performance issues, and style violations. Prioritize critical issues that could cause runtime errors, security vulnerabilities, or significant performance degradation.' },
  },
  {
    id: 'constraints-a2557b', type: 'block', position: { x: 100, y: 590 },
    data: { type: 'constraints', label: 'Constraints', summary: 'Concise critical focus',
      description: 'Rules and limits to respect',
      content: 'Be concise in your explanations. Prioritize critical issues over minor style violations. Each finding must be explained in exactly one sentence. Focus on actionable feedback.' },
  },
  {
    id: 'output_format-66edf4', type: 'block', position: { x: 100, y: 770 },
    data: { type: 'output_format', label: 'Output Format', summary: 'Numbered list format',
      description: 'Expected format of the response',
      content: "Respond with a numbered list where each item contains: the issue type (bug/performance/style), the specific problem found, and a one-sentence explanation of why it's problematic and how to fix it." },
  },
  {
    id: 'language-4ac566', type: 'block', position: { x: 100, y: 950 },
    data: { type: 'language', label: 'Language', summary: 'English response',
      description: 'Language the AI should respond in',
      content: 'English' },
  },
]

const EXAMPLE_NODES_FR: FlomptNode[] = [
  {
    id: 'role-2ef496', type: 'block', position: { x: 100, y: 50 },
    data: { type: 'role', label: 'Rôle', summary: 'Développeur Python senior',
      description: "Définit la persona / le rôle de l'IA",
      content: "Tu es un développeur Python senior avec une vaste expérience en revue de code, débogage, optimisation des performances et bonnes pratiques Python. Tu excelles dans l'identification des problèmes critiques, des failles de sécurité et des violations de style." },
  },
  {
    id: 'input-92f78b', type: 'block', position: { x: 100, y: 230 },
    data: { type: 'input', label: 'Entrée', summary: 'Code Python à revoir',
      description: "Données fournies à l'IA",
      content: 'Code Python à analyser pour détecter bugs, problèmes de performance et violations de style.' },
  },
  {
    id: 'objective-818108', type: 'block', position: { x: 100, y: 410 },
    data: { type: 'objective', label: 'Objectif', summary: 'Analyse de code',
      description: "Ce qu'on veut accomplir",
      content: "Faire une revue du code Python fourni pour identifier et expliquer les bugs, les problèmes de performance et les violations de style. Prioriser les problèmes critiques pouvant causer des erreurs, des failles de sécurité ou une dégradation significative des performances." },
  },
  {
    id: 'constraints-a2557b', type: 'block', position: { x: 100, y: 590 },
    data: { type: 'constraints', label: 'Contraintes', summary: 'Concis et critique',
      description: 'Règles et limites à respecter',
      content: "Sois concis. Priorise les problèmes critiques sur les violations de style mineures. Chaque point doit être expliqué en exactement une phrase. Concentre-toi sur des retours actionnables." },
  },
  {
    id: 'output_format-66edf4', type: 'block', position: { x: 100, y: 770 },
    data: { type: 'output_format', label: 'Sortie', summary: 'Liste numérotée',
      description: 'Format attendu de la réponse',
      content: "Réponds avec une liste numérotée où chaque point contient : le type de problème (bug/performance/style), le problème spécifique trouvé, et une explication en une phrase de pourquoi c'est problématique et comment le corriger." },
  },
  {
    id: 'language-4ac566', type: 'block', position: { x: 100, y: 950 },
    data: { type: 'language', label: 'Langue', summary: 'Réponse en français',
      description: "Langue de réponse de l'IA",
      content: 'Français' },
  },
]

const EXAMPLE_EDGES: FlomptEdge[] = [
  { id: 'e0-1', source: 'role-2ef496',         target: 'input-92f78b',         animated: true },
  { id: 'e1-2', source: 'input-92f78b',         target: 'objective-818108',     animated: true },
  { id: 'e2-3', source: 'objective-818108',     target: 'constraints-a2557b',   animated: true },
  { id: 'e3-4', source: 'constraints-a2557b',   target: 'output_format-66edf4', animated: true },
  { id: 'e4-5', source: 'output_format-66edf4', target: 'language-4ac566',      animated: true },
]

// ── Component ────────────────────────────────────────────────────────────────

const GuidedTour = () => {
  const { t, locale } = useLocale()
  const { setRawPrompt, setNodes, setEdges } = useFlowStore()

  const [active, setActive] = useState(() =>
    typeof window !== 'undefined' &&
    window.innerWidth >= 900 &&
    !localStorage.getItem(TOUR_KEY)
  )

  const [step, setStep]     = useState(0)
  const [rect, setRect]     = useState<Rect | null>(null)
  const [acting, setActing] = useState(false)

  // Step definitions
  const steps = [
    { target: '.prompt-textarea',            placement: 'right' as Placement,      title: t.tour.step1title,       desc: t.tour.step1desc,       nextLabel: t.tour.next },
    { target: '.block-list',                 placement: 'right' as Placement,      title: t.tour.stepBlocksTitle,  desc: t.tour.stepBlocksDesc,  nextLabel: t.tour.next },
    { target: '[data-tour="decompose-btn"]', placement: 'right' as Placement,      title: t.tour.step2title,       desc: t.tour.step2desc,       nextLabel: t.tour.step2action, action: 'decompose' as const },
    { target: '.flow-canvas',                placement: 'inside-top' as Placement, title: t.tour.step3title,       desc: t.tour.step3desc,       nextLabel: t.tour.next },
    { target: '[data-tour="compile-btn"]',   placement: 'left' as Placement,       title: t.tour.step4title,       desc: t.tour.step4desc,       nextLabel: t.tour.finish, action: 'finish' as const },
  ]

  const cur = steps[step]

  /* ── Sync spotlight rect ─────────────────────────────────────────────────── */
  const updateRect = useCallback(() => {
    const el = document.querySelector(cur.target)
    if (el) {
      const r = el.getBoundingClientRect()
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
    }
  }, [cur.target])

  useEffect(() => {
    if (!active) return
    if (step === 0) {
      setRawPrompt(t.tour.samplePrompt)
      analytics.tourStarted()
    }
    analytics.tourStep(step + 1, steps[step]?.title ?? '')
    const id = setTimeout(updateRect, 50)
    window.addEventListener('resize', updateRect)
    return () => { clearTimeout(id); window.removeEventListener('resize', updateRect) }
  }, [step, active, updateRect, setRawPrompt, t.tour.samplePrompt])

  /* ── Dismiss ─────────────────────────────────────────────────────────────── */
  const dismiss = useCallback((completed = false) => {
    if (!completed) analytics.tourSkipped(step)
    localStorage.setItem(TOUR_KEY, '1')
    setActive(false)
  }, [step])

  /* ── Next / Action ───────────────────────────────────────────────────────── */
  const handleNext = useCallback(() => {
    if (!cur.action) { setStep(s => s + 1); return }
    if (cur.action === 'finish') { analytics.tourCompleted(); dismiss(true); return }

    if (cur.action === 'decompose') {
      setActing(true)
      // Short fake loading — makes it feel real without an API call
      setTimeout(() => {
        const isFr  = locale === 'fr'
        setNodes(isFr ? EXAMPLE_NODES_FR : EXAMPLE_NODES_EN)
        setEdges(EXAMPLE_EDGES)
        setActing(false)
        setStep(s => s + 1) // advance to canvas step
      }, 900)
    }
  }, [cur, dismiss, locale, setNodes, setEdges])

  /* ── Render ──────────────────────────────────────────────────────────────── */
  if (!active || !rect) return null

  const raw   = calcTooltipPos(rect, cur.placement)
  const ttTop  = Math.max(60, raw.top)
  const ttLeft = Math.max(8, Math.min(window.innerWidth - TW - 8, raw.left))
  const isLast = step === steps.length - 1

  const titleId = 'tour-dialog-title'

  return (
    <>
      {/* Backdrop + spotlight — purely visual, hidden from AT */}
      <div className="tour-backdrop" aria-hidden="true" />
      <div
        className="tour-spotlight"
        aria-hidden="true"
        style={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12 }}
      />

      <div
        className="tour-tooltip"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{ top: ttTop, left: ttLeft }}
      >

        <div
          className="tour-progress"
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-label={t.tour.stepOf.replace('{n}', String(step + 1)).replace('{total}', String(steps.length))}
        >
          {steps.map((_, i) => (
            <div key={i} className={`tour-dot${i === step ? ' active' : i < step ? ' done' : ''}`} aria-hidden="true" />
          ))}
        </div>

        <p className="tour-step-num" aria-hidden="true">
          {t.tour.stepOf.replace('{n}', String(step + 1)).replace('{total}', String(steps.length))}
        </p>

        <h3 id={titleId} className="tour-title">{cur.title}</h3>
        <p className="tour-desc">{cur.desc}</p>

        <div className="tour-actions">
          <button className="tour-skip" onClick={() => dismiss()}>{t.tour.skip}</button>
          <button className="tour-next" onClick={handleNext} disabled={acting} aria-busy={acting}>
            {acting
              ? <><Loader size={13} className="icon-spin" aria-hidden="true" />{t.tour.acting}</>
              : isLast
                ? <>{cur.nextLabel}<Check size={12} aria-hidden="true" /></>
                : <>{cur.nextLabel}<ChevronRight size={13} aria-hidden="true" /></>
            }
          </button>
        </div>

      </div>
    </>
  )
}

export default GuidedTour
