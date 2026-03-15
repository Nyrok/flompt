import { create } from 'zustand'
import { nanoid } from 'nanoid'
import { getDB, type MemoryBlock } from '@/lib/db'
import { useFlowStore } from '@/store/flowStore'
import { BLOCK_META } from '@/types/blocks'
import type { BlockType } from '@/types/blocks'

interface MemoryState {
  blocks: MemoryBlock[]
  isOpen: boolean
  isLoaded: boolean
  searchQuery: string
  setOpen: (open: boolean) => void
  setSearch: (q: string) => void
  load: () => Promise<void>
  create: (data: Omit<MemoryBlock, 'id' | 'createdAt' | 'usageCount' | 'lastUsedAt'>) => Promise<void>
  remove: (id: string) => Promise<void>
  inject: (block: MemoryBlock) => void
  toggleFavorite: (id: string) => Promise<void>
}

export const useMemoryStore = create<MemoryState>((set, get) => ({
  blocks: [],
  isOpen: false,
  isLoaded: false,
  searchQuery: '',

  setOpen: (isOpen) => {
    set({ isOpen })
    if (isOpen && !get().isLoaded) get().load()
  },

  setSearch: (searchQuery) => set({ searchQuery }),

  load: async () => {
    const db = await getDB()
    const blocks = await db.getAll('memory_blocks')
    set({ blocks, isLoaded: true })
  },

  create: async (data) => {
    const block: MemoryBlock = {
      ...data,
      id: nanoid(),
      createdAt: new Date().toISOString(),
      usageCount: 0,
      lastUsedAt: null,
    }
    const db = await getDB()
    await db.put('memory_blocks', block)
    set(state => ({ blocks: [...state.blocks, block] }))
  },

  remove: async (id) => {
    const db = await getDB()
    await db.delete('memory_blocks', id)
    set(state => ({ blocks: state.blocks.filter(b => b.id !== id) }))
  },

  inject: (block) => {
    const meta = BLOCK_META[block.blockType as BlockType]
    if (!meta) return
    const node = {
      id: nanoid(),
      type: 'block' as const,
      position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: {
        type: block.blockType as BlockType,
        label: meta.label,
        content: block.content,
        description: meta.description,
        summary: block.name,
      },
    }
    useFlowStore.getState().addNode(node)
    // Update usage count
    const db_update = async () => {
      const db = await getDB()
      const updated = { ...block, usageCount: block.usageCount + 1, lastUsedAt: new Date().toISOString() }
      await db.put('memory_blocks', updated)
      set(state => ({ blocks: state.blocks.map(b => b.id === block.id ? updated : b) }))
    }
    db_update()
  },

  toggleFavorite: async (id) => {
    const block = get().blocks.find(b => b.id === id)
    if (!block) return
    const updated = { ...block, isFavorite: !block.isFavorite }
    const db = await getDB()
    await db.put('memory_blocks', updated)
    set(state => ({ blocks: state.blocks.map(b => b.id === id ? updated : b) }))
  },
}))
