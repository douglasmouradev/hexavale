import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { STORAGE_KEYS } from '@/data/constants'
import { readStore, removeStore, writeStore } from '@/storage/localStore'
import { PRODUTOR_PADRAO, type ConfigProdutor, type Propriedade } from '@/types/models'

interface AppContextValue {
  propriedade: Propriedade | null
  produtor: ConfigProdutor
  ready: boolean
  login: (input: { telefone: string; nome: string }) => Propriedade
  logout: () => void
  salvarProdutor: (config: ConfigProdutor) => void
}

const AppContext = createContext<AppContextValue | null>(null)

function loadInitialState() {
  return {
    propriedade: readStore<Propriedade>(STORAGE_KEYS.propriedade),
    produtor: readStore<ConfigProdutor>(STORAGE_KEYS.produtor) ?? PRODUTOR_PADRAO,
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const initial = loadInitialState()
  const [propriedade, setPropriedade] = useState<Propriedade | null>(
    initial.propriedade,
  )
  const [produtor, setProdutor] = useState<ConfigProdutor>(initial.produtor)

  const value = useMemo<AppContextValue>(
    () => ({
      propriedade,
      produtor,
      ready: true,
      login: ({ telefone, nome }) => {
        const next: Propriedade = {
          telefone,
          nome: nome.trim(),
          loggedAt: new Date().toISOString(),
        }
        writeStore(STORAGE_KEYS.propriedade, next)
        setPropriedade(next)
        return next
      },
      logout: () => {
        removeStore(STORAGE_KEYS.propriedade)
        setPropriedade(null)
      },
      salvarProdutor: (config) => {
        writeStore(STORAGE_KEYS.produtor, config)
        setProdutor(config)
      },
    }),
    [propriedade, produtor],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp deve ser usado dentro de AppProvider')
  }
  return context
}
