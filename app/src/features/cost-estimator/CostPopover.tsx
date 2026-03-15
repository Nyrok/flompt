import { useState } from 'react'
import { useLocale } from '@/i18n/LocaleContext'
import { MODELS, estimateCost, formatCost, tokenBadgeColor } from './pricing'

interface Props {
  tokens: number
}

export default function CostPopover({ tokens }: Props) {
  const [open, setOpen] = useState(false)
  const { t } = useLocale()
  const tc = t.ide.cost

  return (
    <div className="cost-popover-wrapper">
      <button
        className="token-badge token-badge--clickable"
        style={{ color: tokenBadgeColor(tokens) }}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        title={tc.title}
      >
        ~{tokens.toLocaleString()} tokens
      </button>

      {open && (
        <>
          <div className="cost-popover-backdrop" onClick={() => setOpen(false)} />
          <div className="cost-popover">
            <div className="cost-popover-title">{tc.title}</div>
            <table className="cost-table">
              <tbody>
                {MODELS.map(m => (
                  <tr key={m.id}>
                    <td className="cost-table-model">{m.name}</td>
                    <td className="cost-table-price">{formatCost(estimateCost(tokens, m))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="cost-popover-note">{tc.note}</p>
          </div>
        </>
      )}
    </div>
  )
}
