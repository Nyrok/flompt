import { useState } from 'react'
import { X, Brain, Plus, Trash2, Star, Search, LogIn } from 'lucide-react'
import { useMemoryStore } from './useMemoryStore'
import type { BlockType } from '@/types/blocks'
import type { MemoryBlock } from '@/lib/db'

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
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState<CreateFormState>(emptyForm())

  if (!isOpen) return null

  const filtered = blocks.filter(b => {
    const q = searchQuery.toLowerCase()
    return !q || b.name.toLowerCase().includes(q) || b.content.toLowerCase().includes(q) || b.tags.some(t => t.toLowerCase().includes(q))
  }).sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0))

  const handleCreate = async () => {
    if (!form.name.trim() || !form.content.trim()) return
    await create({
      name: form.name.trim(),
      category: form.category,
      blockType: form.blockType,
      content: form.content.trim(),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      isFavorite: false,
    })
    setForm(emptyForm())
    setShowCreate(false)
  }

  return (
    <>
      <div className="debugger-backdrop" onClick={() => setOpen(false)} />
      <aside className="memory-panel" role="dialog" aria-label="Context Memory" aria-modal="true">
        <div className="debugger-header">
          <div className="debugger-brand">
            <Brain size={15} />
            <span className="debugger-title">Context Memory</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-secondary export-btn" style={{ fontSize: 11, padding: '3px 8px' }} onClick={() => setShowCreate(s => !s)}>
              <Plus size={11} /> New
            </button>
            <button className="make-close-btn" onClick={() => setOpen(false)} aria-label="Close">
              <X size={14} />
            </button>
          </div>
        </div>

        {showCreate && (
          <div className="memory-create-form">
            <input className="make-webhook-input" placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <div style={{ display: 'flex', gap: 6 }}>
              <select className="make-webhook-input" style={{ flex: 1 }} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as typeof CATEGORIES[number] }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="make-webhook-input" style={{ flex: 1 }} value={form.blockType} onChange={e => setForm(f => ({ ...f, blockType: e.target.value as BlockType }))}>
                {BLOCK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <textarea className="make-webhook-input" style={{ minHeight: 80, resize: 'vertical', fontFamily: 'inherit' }} placeholder="Content…" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
            <input className="make-webhook-input" placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="debugger-apply-btn" style={{ flex: 1, margin: 0 }} onClick={handleCreate}>Save</button>
              <button className="btn btn-secondary export-btn" style={{ flex: 1 }} onClick={() => { setShowCreate(false); setForm(emptyForm()) }}>Cancel</button>
            </div>
          </div>
        )}

        <div className="memory-search">
          <Search size={12} className="memory-search-icon" />
          <input className="memory-search-input" placeholder="Search memory…" value={searchQuery} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="memory-list">
          {filtered.length === 0 && (
            <div className="debugger-empty">
              {blocks.length === 0 ? 'No memory blocks yet. Click "+ New" to add one.' : 'No results.'}
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
                  <button className="make-close-btn" title="Inject to canvas" onClick={() => inject(block)}>
                    <LogIn size={12} />
                  </button>
                  <button className="make-close-btn" title={block.isFavorite ? 'Unfavorite' : 'Favorite'} onClick={() => toggleFavorite(block.id)}>
                    <Star size={12} style={{ fill: block.isFavorite ? '#f59e0b' : 'none', color: '#f59e0b' }} />
                  </button>
                  <button className="make-close-btn" title="Delete" onClick={() => remove(block.id)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <p className="memory-item-preview">{block.content.slice(0, 120)}{block.content.length > 120 ? '…' : ''}</p>
              {block.tags.length > 0 && (
                <div className="memory-item-tags">
                  {block.tags.map(t => <span key={t} className="memory-item-tag">{t}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>
    </>
  )
}
