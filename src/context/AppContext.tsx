/**
 * Estado do produtor neste aparelho (localStorage).
 * Identidade, safra e consentimento LGPD. O caderno de calda/insumos/ciclo
 * fica em outras chaves e só entra aqui no backup/restauração.
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { STORAGE_KEYS } from '@/data/constants'
import { amostraJaLancada, lancarItensDeTeste, marcarAmostraLancada } from '@/lib/amostra'
import { totalSemana } from '@/lib/ciclo'
import {
  apagarDadosTitular,
  consentimentoValido as consentimentoDaVersao,
  lerConsentimento,
  registrarConsentimento,
  restaurarDadosTitular,
  type ConsentimentoLgpd,
  type PacoteTitular,
} from '@/lib/lgpd'
import { readStore, removeStore, writeStore } from '@/storage/localStore'
import { PRODUTOR_PADRAO, type CicloCultura, type ConfigProdutor, type Propriedade } from '@/types/models'

interface AppContextValue {
  propriedade: Propriedade | null
  produtor: ConfigProdutor
  consentimento: ConsentimentoLgpd | null
  consentimentoValido: boolean
  login: (input: { telefone: string; nome: string }) => Propriedade
  logout: () => void
  salvarProdutor: (config: ConfigProdutor) => void
  aceitarPrivacidade: () => void
  apagarMeusDados: () => void
  restaurarBackup: (pacote: PacoteTitular) => void
}

const AppContext = createContext<AppContextValue | null>(null)

/** Completa cadastros antigos que ainda não tinham área (ha). */
function loadProdutor(): ConfigProdutor {
  const salvo = readStore<Partial<ConfigProdutor>>(STORAGE_KEYS.produtor)
  if (!salvo) return PRODUTOR_PADRAO
  return {
    cultura: salvo.cultura ?? null,
    dataReferencia: salvo.dataReferencia ?? null,
    dataColheita: salvo.dataColheita ?? null,
    areaHectares: salvo.areaHectares ?? null,
  }
}

function cicloTemCusto() {
  const ciclo = readStore<CicloCultura>(STORAGE_KEYS.ciclo)
  return Boolean(ciclo?.semanas?.some((semana) => totalSemana(semana) > 0))
}

function aplicarAmostraSeVazio(produtor: ConfigProdutor) {
  if (!import.meta.env.DEV) return produtor
  if (amostraJaLancada()) return produtor
  if (cicloTemCusto()) {
    marcarAmostraLancada()
    return produtor
  }
  return lancarItensDeTeste(produtor)
}

function loadInitialState() {
  const propriedade = readStore<Propriedade>(STORAGE_KEYS.propriedade)
  let produtor = loadProdutor()
  if (propriedade && import.meta.env.DEV) {
    produtor = aplicarAmostraSeVazio(produtor)
  }
  return {
    propriedade,
    produtor,
    consentimento: lerConsentimento(),
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const initial = loadInitialState()
  const [propriedade, setPropriedade] = useState<Propriedade | null>(
    initial.propriedade,
  )
  const [produtor, setProdutor] = useState<ConfigProdutor>(initial.produtor)
  const [consentimento, setConsentimento] = useState<ConsentimentoLgpd | null>(
    initial.consentimento,
  )

  const value = useMemo<AppContextValue>(
    () => ({
      propriedade,
      produtor,
      consentimento,
      consentimentoValido: consentimentoDaVersao(consentimento),
      login: ({ telefone, nome }) => {
        const next: Propriedade = {
          telefone,
          nome: nome.trim(),
          loggedAt: new Date().toISOString(),
        }
        writeStore(STORAGE_KEYS.propriedade, next)
        setPropriedade(next)
        setConsentimento(registrarConsentimento())
        setProdutor(
          import.meta.env.DEV ? aplicarAmostraSeVazio(loadProdutor()) : loadProdutor(),
        )
        return next
      },
      /** Sair tira só nome e telefone; o caderno permanece no aparelho. */
      logout: () => {
        removeStore(STORAGE_KEYS.propriedade)
        setPropriedade(null)
      },
      salvarProdutor: (config) => {
        writeStore(STORAGE_KEYS.produtor, config)
        setProdutor(config)
      },
      aceitarPrivacidade: () => {
        setConsentimento(registrarConsentimento())
      },
      /** Exclusão LGPD: apaga identidade, caderno e o aceite. */
      apagarMeusDados: () => {
        apagarDadosTitular()
        setPropriedade(null)
        setProdutor(PRODUTOR_PADRAO)
        setConsentimento(null)
      },
      restaurarBackup: (pacote) => {
        restaurarDadosTitular(pacote)
        setPropriedade(readStore<Propriedade>(STORAGE_KEYS.propriedade))
        setProdutor(loadProdutor())
        setConsentimento(lerConsentimento())
      },
    }),
    [propriedade, produtor, consentimento],
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
