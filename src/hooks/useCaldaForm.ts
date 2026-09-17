import { useEffect, useState } from 'react'
import { STORAGE_KEYS } from '@/data/constants'
import { createId } from '@/lib/id'
import { readStore, writeStore } from '@/storage/localStore'
import type { ResultadoCalda } from '@/lib/calda'
import type { UnidadeDose } from '@/types/models'

export interface InsumoForm {
  id: string
  nome: string
  dose: string
  unidade: UnidadeDose
}

export interface CaldaFormState {
  tanqueLitros: string
  areaHectares: string
  litrosPorHectare: string
  tanqueParcial: boolean
  insumos: InsumoForm[]
  resultado: ResultadoCalda | null
}

function emptyInsumo(): InsumoForm {
  return { id: createId(), nome: '', dose: '', unidade: 'ml/L' }
}

const INITIAL: CaldaFormState = {
  tanqueLitros: '',
  areaHectares: '',
  litrosPorHectare: '',
  tanqueParcial: true,
  insumos: [emptyInsumo()],
  resultado: null,
}

export function useCaldaForm() {
  const [form, setForm] = useState<CaldaFormState>(() => {
    const saved = readStore<Partial<CaldaFormState>>(STORAGE_KEYS.calda)
    if (!saved) return INITIAL
    return {
      ...INITIAL,
      ...saved,
      tanqueParcial: saved.tanqueParcial ?? true,
      insumos: saved.insumos?.length ? saved.insumos : INITIAL.insumos,
      resultado: saved.resultado ?? null,
    }
  })

  useEffect(() => {
    writeStore(STORAGE_KEYS.calda, form)
  }, [form])

  return {
    form,
    setForm,
    addInsumo: () => {
      setForm((current) => ({
        ...current,
        insumos: [...current.insumos, emptyInsumo()],
      }))
    },
    removeInsumo: (id: string) => {
      setForm((current) => ({
        ...current,
        insumos:
          current.insumos.length > 1
            ? current.insumos.filter((item) => item.id !== id)
            : [emptyInsumo()],
      }))
    },
    updateInsumo: (id: string, patch: Partial<InsumoForm>) => {
      setForm((current) => ({
        ...current,
        insumos: current.insumos.map((item) =>
          item.id === id ? { ...item, ...patch } : item,
        ),
      }))
    },
  }
}
