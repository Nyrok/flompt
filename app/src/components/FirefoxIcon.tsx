import { FaFirefoxBrowser } from 'react-icons/fa6'
import type { CSSProperties } from 'react'

const FirefoxIcon = ({ size = 16, className, style }: { size?: number; className?: string; style?: CSSProperties }) => (
  <FaFirefoxBrowser size={size} className={className} style={style} aria-hidden="true" />
)

export default FirefoxIcon
