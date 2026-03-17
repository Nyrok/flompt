import { useState } from 'react'
import { X, Brain, Plus, Trash2, Star, Search, LogIn } from 'lucide-react'
import CustomSelect from '@/components/CustomSelect'
import { useMemoryStore } from './useMemoryStore'
import { useLocale } from '@/i18n/LocaleContext'
import type { BlockType } from '@/types/blocks'
import type { MemoryBlock } from '@/lib/db'
import { Tooltip } from '@/components/ui/tooltip'

const CATEGORIES = ['company', 'persona', 'style', 'tone', 'domain', 'custom'] as const
const BLOCK_TYPES: BlockType[] = ['role', 'context', 'objective', 'constraints', 'audience', 'goal']

interface CreateFormState {
  name: string
  category: typeof CATEGORIES[number]
  blockType: BlockType
  content: string
  tags: string
}

const emptyForm = (): CreateFormState => ({
  name: '', category: 'custom', blockType: 'context', content: '', tags: ''
})

export default function MemoryPanel() {
  const { blocks, isOpen, searchQuery, setOpen, setSearch, create, remove, inject, toggleFavorite } = useMemoryStore()
  const { t } = useLocale()
  const tm = t.ide.memory
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState<CreateFormState>(emptyForm())

  if (!isOpen) return null

  const filtered = blocks.filter(b => {
    const q = searchQuery.toLowerCase()
    return !q || b.name.toLowerCase().includes(q) || b.content.toLowerCase().includes(q) || b.tags.some(tag => tag.toLowerCase().includes(q))
  }).sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0))

  const handleCreate = async () => {
    if (!form.name.trim() || !form.content.trim()) return
    await create({
      name: form.name.trim(),
      category: form.category,
      blockType: form.blockType,
      content: form.content.trim(),
      tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      isFavorite: false,
    })
    setForm(emptyForm())
    setShowCreate(false)
  }

  return (
    <>
      <div className="debugger-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />
      <aside className="memory-panel" role="dialog" aria-label={tm.title} aria-modal="true" onKeyDown={e => { if (e.key === 'Escape') setOpen(false) }}>
        <div className="debugger-header">
          <div className="debugger-brand">
            <Brain size={15} aria-hidden="true" />
            <span className="debugger-title">{tm.title}</span>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button className="ide-action-btn" onClick={() => setShowCreate(s => !s)} aria-label={tm.new}>
              <Plus size={11} aria-hidden="true" /> {tm.new}
            </button>
            <Tooltip content={t.ide.close} side="bottom">
              <button className="ide-close-btn" onClick={() => setOpen(false)} aria-label={t.ide.close}>
                <X size={15} aria-hidden="true" />
              </button>
            </Tooltip>
          </div>
        </div>

        {showCreate && (
          <div className="memory-create-form">
            <input className="make-webhook-input" placeholder={tm.namePlaceholder} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} aria-label={tm.namePlaceholder} />
            <div style={{ display: 'flex', gap: 6 }}>
              <CustomSelect
                value={form.category}
                onChange={v => setForm(f => ({ ...f, category: v as typeof CATEGORIES[number] }))}
                options={CATEGORIES.map(c => ({ value: c, label: c }))}
                triggerClassName="csel-trigger--full"
                className="csel--flex"
              />
              <CustomSelect
                value={form.blockType}
                onChange={v => setForm(f => ({ ...f, blockType: v as BlockType }))}
                options={BLOCK_TYPES.map(bt => ({ value: bt, label: bt }))}
                triggerClassName="csel-trigger--full"
                className="csel--flex"
              />
            </div>
            <textarea className="make-webhook-input" style={{ minHeight: 80, resize: 'vertical', fontFamily: 'inherit' }} placeholder={tm.contentPlaceholder} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} aria-label={tm.contentPlaceholder} />
            <input className="make-webhook-input" placeholder={tm.tagsPlaceholder} value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} aria-label={tm.tagsPlaceholder} />
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="debugger-apply-btn" style={{ flex: 1, margin: 0 }} onClick={handleCreate}>{tm.save}</button>
              <button className="ide-action-btn" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setShowCreate(false); setForm(emptyForm()) }}>{tm.cancel}</button>
            </div>
          </div>
        )}

        <div className="memory-search">
          <Search size={12} className="memory-search-icon" aria-hidden="true" />
          <input className="memory-search-input" placeholder={tm.searchPlaceholder} value={searchQuery} onChange={e => setSearch(e.target.value)} aria-label={tm.searchPlaceholder} />
        </div>

        <div className="memory-list">
          {filtered.length === 0 && (
            <div className="debugger-empty">
              {blocks.length === 0 ? tm.noBlocks : tm.noResults}
            </div>
          )}
          {filtered.map((block: MemoryBlock) => (
            <div key={block.id} className="memory-item">
              <div className="memory-item-header">
                <div>
                  <span className="memory-item-name">{block.name}</span>
                  <span className="memory-item-category">{block.category}</span>
                </div>
                <div className="memory-item-actions">
                  <Tooltip content="Inject to canvas" side="top">
                    <button className="ide-close-btn" style={{ width: 26, height: 26 }} aria-label="Inject to canvas" onClick={() => inject(block)}>
                      <LogIn size={12} aria-hidden="true" />
                    </button>
                  </Tooltip>
                  <Tooltip content={block.isFavorite ? 'Unfavorite' : 'Favorite'} side="top">
                    <button className="ide-close-btn" style={{ width: 26, height: 26 }} aria-label={block.isFavorite ? 'Unfavorite' : 'Favorite'} onClick={() => toggleFavorite(block.id)}>
                      <Star size={12} aria-hidden="true" style={{ fill: block.isFavorite ? '#f59e0b' : 'none', color: '#f59e0b' }} />
                    </button>
                  </Tooltip>
                  <Tooltip content="Delete" side="top">
                    <button className="ide-close-btn ide-close-btn--danger" style={{ width: 26, height: 26 }} aria-label="Delete" onClick={() => remove(block.id)}>
                      <Trash2 size={12} aria-hidden="true" />
                    </button>
                  </Tooltip>
                </div>
              </div>
              <p className="memory-item-preview">{block.content.slice(0, 120)}{block.content.length > 120 ? '…' : ''}</p>
              {block.tags.length > 0 && (
                <div className="memory-item-tags">
                  {block.tags.map(tag => <span key={tag} className="memory-item-tag">{tag}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>
    </>
  )
}
