import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { FlomptNode, FlomptEdge } from '@/types/blocks'

export interface MemoryBlock {
  id: string
  name: string
  category: 'company' | 'persona' | 'style' | 'tone' | 'domain' | 'custom'
  blockType: string
  content: string
  tags: string[]
  usageCount: number
  lastUsedAt: string | null
  createdAt: string
  isFavorite: boolean
}

export interface PromptVersion {
  id: string
  projectId: string
  version: number
  label: string
  message: string
  prompt: string
  output?: string
  nodes: FlomptNode[]
  edges: FlomptEdge[]
  tokenCount: number
  createdAt: string
  tags: string[]
}

export interface UserTemplate {
  id: string
  source: 'user'
  category: string
  name: string
  description: string
  blocks: Array<{ type: string; content: string }>
  createdAt: string
  updatedAt: string
  starred: boolean
  usageCount: number
}

interface FlomptDB extends DBSchema {
  memory_blocks: { key: string; value: MemoryBlock }
  versions: { key: string; value: PromptVersion; indexes: { 'by-project': string } }
  user_templates: { key: string; value: UserTemplate }
}

let _db: IDBPDatabase<FlomptDB> | null = null

export async function getDB(): Promise<IDBPDatabase<FlomptDB>> {
  if (_db) return _db
  _db = await openDB<FlomptDB>('flompt-ide', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('memory_blocks')) {
        db.createObjectStore('memory_blocks', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('versions')) {
        const vs = db.createObjectStore('versions', { keyPath: 'id' })
        vs.createIndex('by-project', 'projectId')
      }
      if (!db.objectStoreNames.contains('user_templates')) {
        db.createObjectStore('user_templates', { keyPath: 'id' })
      }
    },
  })
  return _db
}
