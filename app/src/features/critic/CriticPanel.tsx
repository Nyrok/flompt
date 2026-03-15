import { X, Star, Loader, TrendingUp, TrendingDown, Lightbulb } from 'lucide-react'
import { useCriticStore } from './useCriticStore'
import { useLocale } from '@/i18n/LocaleContext'
import RadarChart from './RadarChart'

function gradeColor(grade: string) {
  if (grade === 'A') return '#22c55e'
  if (grade === 'B') return '#84cc16'
  if (grade === 'C') return '#f59e0b'
  if (grade === 'D') return '#f97316'
  return '#ef4444'
}

export default function CriticPanel() {
  const { isOpen, isLoading, result, error, setOpen } = useCriticStore()
  const { t } = useLocale()
  const tc = t.ide.critic

  if (!isOpen) return null

  return (
    <>
      <div className="debugger-backdrop" onClick={() => setOpen(false)} />
      <aside className="critic-panel" role="dialog" aria-label={tc.title} aria-modal="true">
        <div className="debugger-header">
          <div className="debugger-brand">
            <Star size={15} />
            <span className="debugger-title">{tc.title}</span>
          </div>
          <button className="ide-close-btn" onClick={() => setOpen(false)} aria-label={t.ide.close}>
            <X size={15} />
          </button>
        </div>

        <div className="debugger-body">
          {isLoading && (
            <div className="debugger-loading">
              <Loader size={20} className="spin" />
              <span>{tc.loading}</span>
            </div>
          )}

          {error && !isLoading && (
            <div className="debugger-error">{error}</div>
          )}

          {result && !isLoading && (
            <>
              <div className="critic-score-row">
                <div className="critic-grade" style={{ color: gradeColor(result.grade) }}>
                  {result.grade}
                </div>
                <div>
                  <div className="critic-overall-score" style={{ color: gradeColor(result.grade) }}>
                    {result.overallScore.toFixed(1)} / 10
                  </div>
                  <div className="debugger-section-label">{tc.overallScore}</div>
                </div>
                <RadarChart dimensions={result.dimensions} />
              </div>

              {result.topRecommendation && (
                <div className="critic-recommendation">
                  <Lightbulb size={13} style={{ flexShrink: 0, color: '#f59e0b' }} />
                  <span>{result.topRecommendation}</span>
                </div>
              )}

              <div className="critic-feedback-grid">
                {result.dimensions.map(d => (
                  <div key={d.name} className="critic-dim">
                    <div className="critic-dim-header">
                      <span className="critic-dim-name">{tc.dimensions[d.name] ?? d.name}</span>
                      <span className="critic-dim-score" style={{ color: d.score >= 7 ? '#22c55e' : d.score >= 4 ? '#f59e0b' : '#ef4444' }}>
                        {d.score}/10
                      </span>
                    </div>
                    <p className="critic-dim-feedback">{d.feedback}</p>
                  </div>
                ))}
              </div>

              {result.strengths.length > 0 && (
                <div className="critic-section">
                  <div className="debugger-brand" style={{ marginBottom: 6 }}>
                    <TrendingUp size={12} style={{ color: '#22c55e' }} />
                    <span className="debugger-section-label">{tc.strengths}</span>
                  </div>
                  <ul className="critic-list critic-list--strengths">
                    {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}

              {result.weaknesses.length > 0 && (
                <div className="critic-section">
                  <div className="debugger-brand" style={{ marginBottom: 6 }}>
                    <TrendingDown size={12} style={{ color: '#ef4444' }} />
                    <span className="debugger-section-label">{tc.weaknesses}</span>
                  </div>
                  <ul className="critic-list critic-list--weaknesses">
                    {result.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}
            </>
          )}

          {!isLoading && !result && !error && (
            <div className="debugger-empty">{tc.empty}</div>
          )}
        </div>
      </aside>
    </>
  )
}
