# FICHA DE DIREÇÃO DE ARTE — Paralelo Zero Imóveis (portfólio, cliente fictício)

**Conceito:** todo imóvel é apresentado como projeto de arquiteto — o compacto de 42 m² e a casa de 280 m² na mesma prancha, na mesma escala.
**Arquétipo:** objeto do ofício (prancha de arquitetura) / secundário: catálogo com filtros.
**Hero:** foto de um apartamento compacto e iluminado (não uma mansão) dentro de uma margem fina de prancha; título no "carimbo" (tabela de linhas finas) no canto inferior direito, com cidade e coordenada do Equador. Um botão. No celular a foto vem em cima e o carimbo encaixa logo abaixo, sobrepondo 32px.

## Referências
1. themodernhouse.com (aberta no Chrome em 02/11/2026) — da página do imóvel: foto em tela cheia com ficha flutuante no canto inferior esquerdo (nome, cidade, preço) e links Floorplan · EPC · Map. Aproveito a ficha sobre a foto; inverto o papel da planta (lá é um link escondido, aqui é protagonista). Descartado: painel creme e menu em caixa alta espaçada.
2. Objeto do ofício: carimbo de prancha de arquitetura (tabela no canto inferior direito com projeto, escala, folha) — vira o bloco do título do hero, o rodapé e a ficha técnica dos imóveis.
3. Objeto do ofício: planta de folheto de lançamento — vira a planta em linha, com cotas.
(quintoandar.com.br e teenage.engineering bloqueados na extensão do Chrome; não usados.)

## Tipografia
- Títulos e texto: **Schibsted Grotesk** (600 em títulos, 400 em texto, base 17px). Uma família só: a personalidade vem do desenho técnico, não de uma serifa display.
- Números (preço, área, cotas): mesma família com `tnum` (algarismos tabulares). Sem mono.

## Paleta
- Papel `#FFFFFF` ~65% — papel da prancha
- Nanquim `#1D2427` ~25% — traço e texto; secundário `#4F5A5E`
- Grade `#E4E7E6` / superfície `#F3F4F3` ~8% — quadriculado da prancha
- Piçarra `#A8432A` ~2% — terra laterítica das ruas do Amapá; só cotas, a linha do paralelo, foco e um detalhe por tela

## Grid e ritmo
Container 1240px, 12 colunas, gutter 24px. Hairlines de 1px como estrutura (tabelas, carimbo, busca) em vez de cards com sombra. Seções alternam: largura total (hero, faixa de plantas) / 8+4 assimétrico / tabela.

## Tratamento de imagem
Fotos com luz natural, recorte reto, sem arredondamento, sem filtro. Legenda curta abaixo quando há crédito.

## Elemento-assinatura
**Planta em escala:** SVG gerado dos dados (cômodos em metros), todos na mesma escala, sobre grade de 1 m, cotas em piçarra. A planta se desenha uma vez ao entrar na tela (único movimento autoral do site).

## Ordem das seções (home) + composição
1. Hero-prancha (foto + carimbo).
2. Busca como "legenda": uma linha de campos separados por hairlines, colada embaixo do hero.
3. Entradas por intenção: Comprar · Alugar · Comercial · Lançamentos · Anunciar — 5 colunas de tabela, cada uma com contagem e faixa de preço real ("de R$ 95 mil a R$ 2,1 mi").
4. "Mesma escala, mesmo cuidado": faixa com 4 plantas lado a lado na mesma escala (42 m² ao lado de 252 m²) e régua de 5 m.
5. Seleção: 6 imóveis em composição variada (1 grande + lista), todas as faixas misturadas.
6. Bairros: legenda em colunas com contagem por bairro.
7. Anunciar: 8+4, texto + passos curtos + botão.
8. Rodapé-carimbo.

## Assinaturas do molde proibido presentes
- Nº 8 (linhas finas): sim, justificado pela prancha/carimbo. Sem numeração 01/02.
- Total: 1.

## Diferenças em relação aos 3 últimos (automotia, estetica-automotiva, premiun.ntri)
Claro (os 3 são escuros) · arquétipo objeto do ofício (tríptico / diagonal / diário) · hero foto emoldurada + carimbo (tríptico / split diagonal / centralizado sobre paths) · Schibsted Grotesk sozinha (Michroma+Manrope / Barlow Condensed / Instrument Serif+Manrope) · branco + nanquim + piçarra (preto+cromo / preto+vermelho / verde-escuro+menta) · assinatura planta em escala.
