interface Dim { name: string; score: number }

export default function RadarChart({ dimensions }: { dimensions: Dim[] }) {
  const cx = 110, cy = 110, r = 80
  const n = dimensions.length
  if (n === 0) return null

  const toPoint = (i: number, value: number) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2
    const dist = (value / 10) * r
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) }
  }

  const axisPoints = dimensions.map((_, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  })

  const dataPoints = dimensions.map((d, i) => toPoint(i, d.score))
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z'

  // Background grid (3 rings at 33%, 66%, 100%)
  const gridPaths = [0.33, 0.66, 1].map(fraction => {
    const pts = dimensions.map((_, i) => {
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2
      const dist = fraction * r
      return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) }
    })
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z'
  })

  return (
    <svg width={220} height={220} viewBox="0 0 220 220" className="radar-chart">
      {/* Grid rings */}
      {gridPaths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="var(--border, #333)" strokeWidth={1} opacity={0.5} />
      ))}
      {/* Axis lines */}
      {axisPoints.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--border, #333)" strokeWidth={1} opacity={0.4} />
      ))}
      {/* Data area */}
      <path d={dataPath} fill="rgba(255, 53, 112, 0.2)" stroke="#FF3570" strokeWidth={2} />
      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#FF3570" />
      ))}
      {/* Labels */}
      {dimensions.map((d, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2
        const labelR = r + 18
        const lx = cx + labelR * Math.cos(angle)
        const ly = cy + labelR * Math.sin(angle)
        const anchor = lx < cx - 5 ? 'end' : lx > cx + 5 ? 'start' : 'middle'
        return (
          <text key={i} x={lx} y={ly} textAnchor={anchor} dominantBaseline="middle"
            fontSize={9} fill="var(--text-dim, #888)" style={{ userSelect: 'none' }}>
            {d.name}
          </text>
        )
      })}
    </svg>
  )
}
