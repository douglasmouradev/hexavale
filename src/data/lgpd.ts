/** Textos da Política de Privacidade (versão controlada; mudar POLITICA_VERSAO pede novo aceite). */
export const POLITICA_VERSAO = '1.0'

export const LGPD_CONTATO = {
  controlador: 'HexaVale',
  email: 'comercial@tdesksolutions.com.br',
  telefone: '(71) 99708-7082',
}

export const POLITICA_ATUALIZADA_EM = '17/09/2026'

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
      'No caderno (neste aparelho): cultura, área, datas da safra, calda, insumos, mão de obra e ciclo.',
      'Não pedimos CPF, e-mail do produtor nem localização GPS. O app não cria conta na nuvem para o produtor.',
    ],
  },
  {
    titulo: 'Para que usamos',
    paragrafos: [
      'Identificar a propriedade neste celular, calcular calda, insumos, diária e o ciclo de 42 semanas, e montar o PDF no próprio aparelho.',
      'Mostrar o anúncio do HexaVale ao entrar ou calcular. O pedido do vídeo não leva seu telefone, nome nem caderno.',
    ],
  },
  {
    titulo: 'Base legal',
    paragrafos: [
      'Telefone e nome: consentimento (art. 7º, I, da LGPD). Sem o aceite, o app não entra.',
      'Caderno de manejo: serviço que você pede ao usar o HexaVale (art. 7º, V).',
      'Entrega do anúncio e proteção do servidor: interesse legítimo (art. 7º, IX), só o necessário para o vídeo chegar.',
    ],
  },
  {
    titulo: 'Onde fica e por quanto tempo',
    paragrafos: [
      'Os dados do produtor ficam no armazenamento local deste aparelho (localStorage), não no MySQL do HexaVale.',
      'Ficam enquanto o app estiver neste celular, até você tocar em Apagar meus dados. Sair remove nome e telefone da sessão; o caderno permanece até a exclusão.',
      'No servidor entram só o login do administrador e os vídeos de propaganda. O pedido do anúncio pode registrar IP, data e horário do acesso, como qualquer visita a um site.',
    ],
  },
  {
    titulo: 'Compartilhamento',
    paragrafos: [
      'Não vendemos dados. Não enviamos telefone, nome da propriedade nem o caderno para o servidor nem para terceiros.',
      'O PDF é gerado no celular. Se você enviar o arquivo, a escolha é sua.',
      'Administradores acessam apenas a conta do painel e os vídeos. Não vêem o caderno do produtor.',
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
