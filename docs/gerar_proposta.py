"""Gera a proposta comercial do Hexavale no modelo TDesk Solutions."""

from pathlib import Path

import fitz

OUT = Path(__file__).resolve().parent / "Proposta_Comercial_Hexavale.pdf"
MARK = Path(__file__).resolve().parents[1] / "public" / "brand" / "hexavale-mark.png"

TEAL = (0.0, 0.584, 0.714)
TEAL_DARK = (0.0, 0.478, 0.588)
LIGHT = (0.902, 0.957, 0.969)
INK = (0.10, 0.14, 0.18)
MUTED = (0.35, 0.40, 0.45)
WHITE = (1, 1, 1)
LINE = (0.80, 0.80, 0.80)
ROW = (0.878, 0.878, 0.878)
GREEN = (0.20, 0.77, 0.51)

W, H = 595.28, 841.89
ML, MR = 42.52, 42.52
CONTENT_W = W - ML - MR


def tw(text: str, font: str, size: float) -> float:
    return fitz.get_text_length(text, fontname=font, fontsize=size)


def wrap(text: str, font: str, size: float, width: float) -> list[str]:
    words = text.split()
    lines: list[str] = []
    line = ""
    for word in words:
        trial = f"{line} {word}".strip()
        if tw(trial, font, size) <= width:
            line = trial
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines or [""]


class Doc:
    def __init__(self) -> None:
        self.doc = fitz.open()
        self.page: fitz.Page | None = None
        self.y = 0.0
        self.n = 0

    def new_page(self, cover: bool = False) -> None:
        self.page = self.doc.new_page(width=W, height=H)
        self.n += 1
        if cover:
            self.page.draw_rect(fitz.Rect(0, 0, W, 156), color=None, fill=TEAL)
            self.page.draw_rect(fitz.Rect(0, 156, W, 162), color=None, fill=TEAL_DARK)
            self.y = 178
        else:
            self.page.draw_rect(fitz.Rect(ML + 14, 48, W - MR - 14, 48.6), color=LIGHT, fill=LIGHT)
            self._text(ML, 28, "Proposta Comercial", "helv", 9, MUTED)
            self._text(W - MR - tw(f"Página {self.n}", "helv", 9), 28, f"Página {self.n}", "helv", 9, MUTED)
            self._text(
                ML,
                58,
                "tdesksolutions.com.br  |  comercial@tdesksolutions.com.br  |  Salvador/BA — Brasil",
                "helv",
                8,
                MUTED,
            )
            self.y = 80
        self._footer()

    def _footer(self) -> None:
        assert self.page
        self.page.draw_rect(fitz.Rect(0, H - 28, W, H), color=None, fill=TEAL)
        self._text(
            ML,
            H - 18,
            "TDesk Solutions  ·  Hexavale  ·  Confidencial",
            "helv",
            8,
            WHITE,
        )

    def _text(
        self,
        x: float,
        y: float,
        text: str,
        font: str,
        size: float,
        color: tuple[float, float, float],
    ) -> None:
        assert self.page
        self.page.insert_text((x, y), text, fontname=font, fontsize=size, color=color)

    def heading(self, text: str) -> None:
        self.y += 6
        self._text(ML, self.y, text, "hebo", 13, TEAL_DARK)
        self.y += 8
        self.page.draw_rect(fitz.Rect(ML, self.y, ML + 46, self.y + 2.2), color=None, fill=TEAL)
        self.y += 14

    def para(self, text: str, size: float = 9.5, leading: float = 13) -> None:
        for line in wrap(text, "helv", size, CONTENT_W):
            self._text(ML, self.y, line, "helv", size, INK)
            self.y += leading
        self.y += 4

    def bullet(self, text: str) -> None:
        indent = 12
        lines = wrap(text, "helv", 9.5, CONTENT_W - indent)
        self._text(ML, self.y, "•", "helv", 9.5, TEAL)
        self._text(ML + indent, self.y, lines[0], "helv", 9.5, INK)
        self.y += 13
        for line in lines[1:]:
            self._text(ML + indent, self.y, line, "helv", 9.5, INK)
            self.y += 13

    def kv_row(self, label: str, value: str, y: float, box: fitz.Rect) -> None:
        self._text(box.x0 + 10, y, label, "helv", 8.5, MUTED)
        self._text(box.x0 + 168, y, value, "hebo", 9, INK)

    def table(self, headers: list[str], rows: list[list[str]], col_w: list[float]) -> None:
        x = ML
        row_h = 28
        header_h = 30
        total_w = sum(col_w)
        top = self.y
        # header
        self.page.draw_rect(fitz.Rect(x, top, x + total_w, top + header_h), color=None, fill=TEAL)
        cx = x
        for h, w in zip(headers, col_w):
            self._text(cx + 8, top + 19, h, "hebo", 8.5, WHITE)
            cx += w
        y = top + header_h
        for i, row in enumerate(rows):
            bg = LIGHT if i % 2 == 0 else WHITE
            self.page.draw_rect(fitz.Rect(x, y, x + total_w, y + row_h), color=None, fill=bg)
            self.page.draw_line(fitz.Point(x, y), fitz.Point(x + total_w, y), color=ROW, width=0.4)
            cx = x
            for cell, w in zip(row, col_w):
                self._text(cx + 8, y + 18, cell, "helv", 8.5, INK)
                cx += w
            y += row_h
        self.page.draw_rect(
            fitz.Rect(x, top, x + total_w, y),
            color=LINE,
            fill=None,
            width=0.7,
        )
        self.y = y + 12

    def save(self) -> None:
        self.doc.save(OUT)
        self.doc.close()


def cover_header(d: Doc) -> None:
    assert d.page
    d._text(ML, 28, "Help desk e sistemas web para TI e operações", "helv", 9, WHITE)
    d._text(ML, 58, "PROPOSTA COMERCIAL", "hebo", 22, WHITE)
    d._text(ML, 80, "Nº PROP-20260917-001", "hebo", 11, WHITE)
    d._text(ML, 98, "Data: 17/09/2026", "helv", 10, WHITE)
    d._text(
        ML,
        132,
        "tdesksolutions.com.br  |  comercial@tdesksolutions.com.br  |  Salvador/BA — Brasil",
        "helv",
        8.5,
        WHITE,
    )
    if MARK.exists():
        rect = fitz.Rect(W - MR - 52, 28, W - MR, 80)
        d.page.insert_image(rect, filename=str(MARK))


def parties(d: Doc) -> None:
    box = fitz.Rect(ML, d.y, W - MR, d.y + 168)
    d.page.draw_rect(box, color=LINE, fill=None, width=0.8)
    mid = (box.x0 + box.x1) / 2
    d.page.draw_rect(fitz.Rect(box.x0, box.y0, box.x1, box.y0 + 28), color=None, fill=LIGHT)
    d.page.draw_line(fitz.Point(mid, box.y0), fitz.Point(mid, box.y1), color=LINE, width=0.6)
    d._text(box.x0 + 12, box.y0 + 18, "CLIENTE", "hebo", 9, TEAL_DARK)
    d._text(mid + 12, box.y0 + 18, "FORNECEDOR", "hebo", 9, TEAL_DARK)

    left = [
        "HexaVale",
        "CNPJ: [00.000.000/0001-00]",
        "Contato: [Nome do Responsável] — [Cargo]",
        "E-mail: [email@empresa.com.br]",
        "Tel.: [(00) 00000-0000]",
    ]
    right = [
        "TDesk Solutions",
        "Empresa de serviços em tecnologia",
        "Help desk e sistemas web sob medida",
        "E-mail: comercial@tdesksolutions.com.br",
        "Site: tdesksolutions.com.br",
        "Salvador/BA — Atendimento em todo o Brasil",
    ]
    y = box.y0 + 48
    for line in left:
        d._text(box.x0 + 12, y, line, "helv", 8.5, INK)
        y += 14
    y = box.y0 + 48
    for line in right:
        d._text(mid + 12, y, line, "helv", 8.5, INK)
        y += 14
    d.y = box.y1 + 16

    meta = fitz.Rect(ML, d.y, W - MR, d.y + 58)
    d.page.draw_rect(meta, color=None, fill=LIGHT)
    d.kv_row("Validade da proposta", "17/10/2026", meta.y0 + 16, meta)
    d.kv_row("Prazo de implantação estimado", "15 dias úteis", meta.y0 + 32, meta)
    d.kv_row("Projeto proposto", "Hexavale — aplicativo de campo", meta.y0 + 48, meta)
    d.y = meta.y1 + 18


def build() -> None:
    d = Doc()

    # --- página 1 ---
    d.new_page(cover=True)
    cover_header(d)
    parties(d)

    d.heading("1. Resumo Executivo")
    d.para(
        "A TDesk Solutions apresenta esta proposta comercial para desenvolvimento e entrega do Hexavale — "
        "aplicativo web (PWA) para produtores de manga e uva, com uso no celular, dados no aparelho e "
        "cálculos de campo prontos para a operação no Vale do São Francisco."
    )
    d.para(
        "O Hexavale reúne cinco ferramentas do dia a dia da propriedade: cadastro do produtor e da safra, "
        "calda (tanque, área e receita), levantamento de insumos por porte da planta, mão de obra (diária e "
        "horas) e o ciclo de 42 semanas até a colheita, com exportação em PDF. O administrador envia os "
        "vídeos das propagandas pelo painel; o anúncio aparece no login e nos cálculos."
    )
    d.para(
        "O escopo, entregáveis e condições comerciais descritos neste documento foram elaborados com base "
        "nas necessidades do projeto Hexavale e podem ser ajustados mediante alinhamento prévio entre as "
        "partes, formalizado em aditivo contratual quando necessário."
    )

    d.heading("2. Sobre a TDesk Solutions")
    d.para(
        "A TDesk Solutions é uma empresa brasileira especializada em serviços de tecnologia, com foco em "
        "help desk e desenvolvimento de sistemas web. Atuamos com a solução proprietária TDesk e com "
        "projetos sob medida — sites institucionais, landings e sistemas com escopo fechado em proposta comercial."
    )
    d.para("Diferenciais da nossa operação:")
    d.bullet("Primeira resposta comercial em até 1 dia útil (horário Brasil, Salvador/BA).")
    d.bullet("Escopo formalizado por escrito antes de qualquer cobrança.")
    d.bullet("Interface responsiva, instalável no celular (PWA) e uso em campo sem depender de mesa.")
    d.bullet("Dados do produtor no aparelho; painel administrativo com autenticação para os vídeos.")
    d.bullet("Atendimento a operações em todo o território nacional.")

    # --- página 2 ---
    d.new_page()
    d.heading("3. Escopo da Solução Proposta")
    d.para("Produto: Hexavale — calculadora agrícola para manga e uva (escopo fechado).")
    d._text(ML, d.y, "3.1 Funcionalidades incluídas", "hebo", 11, INK)
    d.y += 16
    d.bullet("Login do produtor por telefone e nome da propriedade, sem senha, com dados neste celular.")
    d.bullet("Produtor: escolha da cultura (manga ou uva) e datas de manejo ou colheita.")
    d.bullet("Calda: tanque (L), área (ha), L/ha, insumos com dose e unidade, último tanque parcial, resultado e PDF.")
    d.bullet("Insumos: plantas por porte (P/M/G), produtos com preço e dose, total e PDF.")
    d.bullet("Mão de obra: serviços com pessoas, diária ou hora, tempo, total e PDF.")
    d.bullet("Ciclo: 42 semanas a partir da data informada, trabalho sugerido por fase, custos por semana e PDF.")
    d.bullet("Início com resumo da semana atual, progresso do ciclo e atalho para as ferramentas.")
    d.bullet("PWA com identidade Hexavale, uso em retrato no celular.")
    d.bullet("Painel admin para envio, ativação e exclusão dos vídeos de propaganda (MySQL).")
    d.bullet("Anúncio em tela cheia no login e após calcular, com o vídeo ativo do painel.")

    d.y += 4
    d._text(ML, d.y, "3.2 Implantação", "hebo", 11, INK)
    d.y += 16
    d.para("A implantação estimada em 15 dias úteis compreende:")
    d.bullet("Reunião de kick-off e alinhamento da operação no campo.")
    d.bullet("Aplicação da marca Hexavale e conferência das cinco ferramentas.")
    d.bullet("Configuração do painel de vídeos e do anúncio no aplicativo.")
    d.bullet("Treinamento remoto da equipe (sessão de até 2 horas).")
    d.bullet("Homologação assistida e entrega em produção.")

    d.y += 4
    d._text(ML, d.y, "3.3 Não incluído nesta proposta", "hebo", 11, INK)
    d.y += 16
    d.bullet("Hospedagem em nuvem, domínio e certificado HTTPS (sob consulta).")
    d.bullet("Publicação nas lojas Apple App Store e Google Play (app nativo).")
    d.bullet("Login com SMS, cadastro em nuvem ou sincronização entre aparelhos.")
    d.bullet("Integração com ERP, contabilidade ou sistemas de irrigação (mediante aditivo).")
    d.bullet("Laudo agronômico ou receituário certificado; as sugestões de ciclo são operacionais.")
    d.bullet("Migração de planilhas ou sistemas legados (sob consulta separada).")

    d.heading("4. Entregáveis")
    d.table(
        ["Entregável", "Descrição"],
        [
            ["Aplicativo Hexavale", "PWA operacional no celular, com as 5 ferramentas e PDF"],
            ["Painel de propaganda", "Login admin, envio e veiculação de vídeos"],
            ["Identidade visual", "Logo Hexavale aplicada no app, ícones e PDF"],
            ["Documentação", "Manual de uso do produtor e do administrador"],
            ["Treinamento", "Sessão remota de capacitação (até 2h)"],
            ["Suporte pós-entrega", "30 dias de acompanhamento após a homologação"],
        ],
        [150, CONTENT_W - 150],
    )

    # --- página 3 ---
    d.new_page()
    d.heading("5. Investimento")
    d.para(
        "Os valores abaixo são expressos em reais (BRL) e referem-se à atividade de desenvolvimento e "
        "entrega do Hexavale, em escopo fechado. Condições de pagamento serão formalizadas em contrato."
    )
    d.table(
        ["Item", "Valor", "Periodicidade"],
        [
            ["Hexavale — desenvolvimento e entrega", "R$ 600,00", "Única"],
            ["Implantação, marca e homologação", "Incluso", "Única"],
            ["Treinamento remoto (até 2h)", "Incluso", "Única"],
            ["Suporte por 30 dias após a entrega", "Incluso", "Única"],
            ["Hospedagem e evoluções posteriores", "Sob consulta", "—"],
        ],
        [270, 110, CONTENT_W - 380],
    )

    highlight = fitz.Rect(ML, d.y, W - MR, d.y + 36)
    d.page.draw_rect(highlight, color=None, fill=TEAL)
    d._text(ML + 12, d.y + 22, "Investimento da atividade: R$ 600,00", "hebo", 12, WHITE)
    d.y = highlight.y1 + 14

    d.para("Condições de pagamento sugeridas:")
    d.bullet("Atividade de escopo fechado, valor único de R$ 600,00, sem mensalidade nesta proposta.")
    d.bullet("Pagamento via PIX ou boleto: 50% na assinatura e 50% na homologação, ou 100% na assinatura.")
    d.bullet("Vencimento em até 10 dias após a emissão do faturamento.")
    d.bullet("Itens fora do escopo (hospedagem, lojas de aplicativo, integrações) somente com aditivo.")

    d.heading("6. Cronograma de Implantação")
    d.para(
        "O cronograma abaixo é estimativo e depende da disponibilidade do cliente para validações e "
        "aprovações em cada etapa. Atrasos por parte do cliente podem impactar os prazos acordados."
    )
    d.table(
        ["Fase", "Atividade", "Prazo"],
        [
            ["1", "Assinatura do contrato e kick-off", "D+0"],
            ["2", "Ajustes de marca e conferência das ferramentas", "D+1 a D+5"],
            ["3", "Painel de vídeos, anúncio e testes no celular", "D+6 a D+10"],
            ["4", "Treinamento e homologação", "D+11 a D+13"],
            ["5", "Entrega e acompanhamento inicial", "D+14 a D+15"],
        ],
        [50, 320, CONTENT_W - 370],
    )

    d.heading("7. Termos e Condições")
    d.para(
        "7.1 Validade. Esta proposta é válida por 30 dias a contar da data de emissão. Após esse período, "
        "valores e condições poderão ser revistos pela TDesk Solutions."
    )
    d.para(
        "7.2 Confidencialidade. As informações trocadas entre as partes no âmbito desta proposta e da "
        "eventual contratação serão tratadas como confidenciais, em conformidade com a legislação aplicável, "
        "incluindo a LGPD (Lei nº 13.709/2018). Os dados lançados pelo produtor permanecem no aparelho."
    )

    # --- página 4 ---
    d.new_page()
    d.para(
        "7.3 Propriedade intelectual. O aplicativo Hexavale, na versão entregue ao cliente neste escopo, "
        "destina-se ao uso da operação contratante. Componentes, métodos e bibliotecas reutilizáveis da "
        "TDesk Solutions permanecem de sua titularidade. A marca Hexavale fornecida pelo cliente é de "
        "titularidade do cliente."
    )
    d.para(
        "7.4 Disponibilidade. O Hexavale opera como PWA no celular do produtor, com os cálculos e cadastros "
        "locais. A disponibilidade do painel de vídeos e do anúncio depende da infraestrutura combinada na "
        "entrega. Manutenções programadas serão comunicadas com antecedência mínima de 48 horas."
    )
    d.para(
        "7.5 Rescisão. Qualquer das partes poderá rescindir o contrato mediante aviso prévio de 15 dias, "
        "respeitadas as obrigações financeiras do período já faturado e o pagamento da atividade eventualmente "
        "já executada."
    )
    d.para(
        "7.6 Foro. Fica eleito o foro da comarca de Salvador/BA para dirimir quaisquer controvérsias "
        "decorrentes desta proposta e do contrato dela decorrente."
    )

    d.heading("8. Aceite da Proposta")
    d.para(
        "A assinatura deste documento pelas partes representa concordância com os termos, escopo e valores "
        "aqui descritos, servindo como base para formalização do contrato de prestação de serviços para o "
        "projeto Hexavale, no valor de R$ 600,00 pela atividade."
    )

    box = fitz.Rect(ML, d.y, W - MR, d.y + 168)
    d.page.draw_rect(box, color=LINE, fill=None, width=0.8)
    mid = (box.x0 + box.x1) / 2
    d.page.draw_line(fitz.Point(mid, box.y0), fitz.Point(mid, box.y1), color=LINE, width=0.6)
    d.page.draw_line(
        fitz.Point(box.x0, box.y0 + 36),
        fitz.Point(box.x1, box.y0 + 36),
        color=ROW,
        width=0.5,
    )
    d._text(box.x0 + 12, box.y0 + 22, "TDesk Solutions", "hebo", 10, INK)
    d._text(mid + 12, box.y0 + 22, "HexaVale", "hebo", 10, INK)

    d.page.draw_line(
        fitz.Point(box.x0 + 16, box.y0 + 88),
        fitz.Point(mid - 16, box.y0 + 88),
        color=INK,
        width=0.6,
    )
    d.page.draw_line(
        fitz.Point(mid + 16, box.y0 + 88),
        fitz.Point(box.x1 - 16, box.y0 + 88),
        color=INK,
        width=0.6,
    )
    d._text(box.x0 + 16, box.y0 + 104, "Assinatura do representante legal", "helv", 8, MUTED)
    d._text(mid + 16, box.y0 + 104, "Assinatura do representante legal", "helv", 8, MUTED)
    d._text(box.x0 + 16, box.y0 + 120, "Nome e cargo", "helv", 8, MUTED)
    d._text(mid + 16, box.y0 + 120, "Nome e cargo", "helv", 8, MUTED)
    d._text(box.x0 + 16, box.y0 + 148, "Data: ___/___/______", "helv", 9, INK)
    d._text(mid + 16, box.y0 + 148, "Data: ___/___/______", "helv", 9, INK)

    d.y = box.y1 + 24
    d.para(
        "Dúvidas? Entre em contato: comercial@tdesksolutions.com.br  |  tdesksolutions.com.br — "
        "Resposta em até 1 dia útil."
    )

    d.save()
    print(OUT)


if __name__ == "__main__":
    build()
