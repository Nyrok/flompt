import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  /** Extra class on the root wrapper */
  className?: string
  /** Extra class on the trigger button */
  triggerClassName?: string
  id?: string
  disabled?: boolean
  /** When true: adds nodrag nopan + stops event propagation (for ReactFlow nodes) */
  noReactFlow?: boolean
  /** Open dropdown upward instead of downward */
  dropUp?: boolean
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = '—',
  className = '',
  triggerClassName = '',
  id,
  disabled = false,
  noReactFlow = false,
  dropUp = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find(o => o.value === value)

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen])

  const stopProp = (e: React.SyntheticEvent) => { if (noReactFlow) e.stopPropagation() }

  const handleSelect = (opt: SelectOption) => {
    if (!opt.disabled) { onChange(opt.value); setIsOpen(false) }
  }

  return (
    <div
      ref={ref}
      className={`csel${noReactFlow ? ' nodrag nopan' : ''}${className ? ' ' + className : ''}`}
      onMouseDown={stopProp}
      onTouchStart={stopProp}
      onClick={stopProp}
    >
      <button
        id={id}
        type="button"
        className={`csel-trigger${triggerClassName ? ' ' + triggerClassName : ''}`}
        onClick={(e) => { if (noReactFlow) e.stopPropagation(); if (!disabled) setIsOpen(o => !o) }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
      >
        <span className="csel-value">{selected ? selected.label : placeholder}</span>
        <ChevronDown size={11} className={`csel-chevron${isOpen ? ' csel-chevron--open' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`csel-dropdown${dropUp ? ' csel-dropdown--up' : ''}`}
          role="listbox"
        >
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={opt.value === value}
              className={`csel-option${opt.value === value ? ' csel-option--active' : ''}${opt.disabled ? ' csel-option--disabled' : ''}`}
              onClick={() => handleSelect(opt)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default CustomSelect
