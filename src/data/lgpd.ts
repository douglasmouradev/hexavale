/** Textos da Política de Privacidade (versão controlada; mudar POLITICA_VERSAO pede novo aceite). */
export const POLITICA_VERSAO = '1.1'

export const LGPD_CONTATO = {
  controlador: 'HexaVale',
  email: 'comercial@tdesksolutions.com.br',
  telefone: '(71) 99708-7082',
}

export const POLITICA_ATUALIZADA_EM = '27/09/2026'

export interface SecaoPolitica {
  titulo: string
  paragrafos: string[]
}

export const POLITICA_SECOES: SecaoPolitica[] = [
  {
    titulo: 'Quem cuida dos dados',
    paragrafos: [
      `O controlador é a ${LGPD_CONTATO.controlador}. Pedidos sobre privacidade: ${LGPD_CONTATO.email} ou ${LGPD_CONTATO.telefone}.`,
      'Esta política segue a Lei nº 13.709/2018 (LGPD).',
    ],
  },
  {
    titulo: 'Que dados usamos',
    paragrafos: [
      'No login: telefone e nome da propriedade. Guardamos também a data de entrada e o registro do seu aceite.',
      'No caderno (neste aparelho): cultura, área, datas da safra, calda, insumos, mão de obra, ciclo, catálogo de produtos e safras já fechadas.',
      'Não pedimos CPF, e-mail do produtor nem localização GPS. O app não cria conta na nuvem para o produtor.',
    ],
  },
  {
    titulo: 'Para que usamos',
    paragrafos: [
      'Identificar a propriedade neste celular, calcular calda, insumos, diária e o ciclo de 42 semanas, e montar o PDF no próprio aparelho.',
      'Manter um histórico de acessos: a cada login, o servidor registra telefone, nome da propriedade, dia e horário, para o HexaVale acompanhar o uso do app.',
      'Mostrar o anúncio do HexaVale ao entrar ou calcular. O pedido do vídeo não leva seu telefone, nome nem caderno.',
    ],
  },
  {
    titulo: 'Base legal',
    paragrafos: [
      'Telefone e nome, inclusive no histórico de acessos: consentimento (art. 7º, I, da LGPD). Sem o aceite, o app não entra.',
      'Caderno de manejo: serviço que você pede ao usar o HexaVale (art. 7º, V).',
      'Entrega do anúncio e proteção do servidor: interesse legítimo (art. 7º, IX), só o necessário para o vídeo chegar.',
    ],
  },
  {
    titulo: 'Onde fica e por quanto tempo',
    paragrafos: [
      'O caderno do produtor fica no armazenamento local deste aparelho (localStorage), não no MySQL do HexaVale.',
      'Ficam enquanto o app estiver neste celular, até você tocar em Apagar meus dados. Sair remove nome e telefone da sessão; o caderno permanece até a exclusão.',
      'No servidor entram o login do administrador, os vídeos de propaganda e o histórico de acessos (telefone, propriedade, dia e horário de cada login). O histórico é apagado automaticamente após 12 meses. Apagar meus dados limpa o aparelho; para excluir o histórico do servidor, peça pelo contato acima.',
      'O pedido do anúncio pode registrar IP, data e horário do acesso, como qualquer visita a um site.',
    ],
  },
  {
    titulo: 'Compartilhamento',
    paragrafos: [
      'Não vendemos dados nem os passamos a terceiros. O caderno nunca sai do aparelho; ao servidor vão só telefone, propriedade, dia e horário de cada login.',
      'O PDF é gerado no celular. Se você enviar o arquivo, a escolha é sua.',
      'Administradores veem os vídeos e o histórico de acessos. Não veem o caderno do produtor.',
    ],
  },
  {
    titulo: 'Seus direitos',
    paragrafos: [
      'Você pode confirmar se tratamos dados, acessá-los, corrigir (em Produtor e no caderno), exportar uma cópia (portabilidade), apagar tudo neste aparelho, saber se houve compartilhamento e revogar o consentimento.',
      'Isso está em Meus dados, no app. Também pode falar pelo e-mail ou telefone acima. A ANPD (autoridade nacional) recebe petição se você quiser.',
    ],
  },
  {
    titulo: 'Segurança e menores',
    paragrafos: [
      'Quem tiver este celular pode abrir o app e ver o caderno. Use aparelho de confiança. Não há senha de produtor de propósito: o uso é no campo, neste dispositivo.',
      'O HexaVale é para produtores rurais, não para crianças. Não coletamos dados de menores de 12 anos de forma intencional.',
    ],
  },
  {
    titulo: 'Mudanças',
    paragrafos: [
      `Versão ${POLITICA_VERSAO}, atualizada em ${POLITICA_ATUALIZADA_EM}. Se a política mudar, o app pede um novo aceite antes de continuar.`,
    ],
  },
]
