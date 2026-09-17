import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type {
  CaldaOrganica,
  CicloCultura,
  LevantamentoInsumos,
  LevantamentoMaoDeObra,
} from '@/types/models'

interface HexaMangaDB extends DBSchema {
  caldas: { key: string; value: CaldaOrganica }
  insumos: { key: string; value: LevantamentoInsumos }
  maoDeObra: { key: string; value: LevantamentoMaoDeObra }
  ciclos: { key: string; value: CicloCultura }
}

let dbPromise: Promise<IDBPDatabase<HexaMangaDB>> | null = null

export function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<HexaMangaDB>('hexa-manga', 1, {
      upgrade(db) {
        db.createObjectStore('caldas', { keyPath: 'id' })
        db.createObjectStore('insumos', { keyPath: 'id' })
        db.createObjectStore('maoDeObra', { keyPath: 'id' })
        db.createObjectStore('ciclos', { keyPath: 'id' })
      },
    })
  }

  return dbPromise
}
