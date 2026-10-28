# Direção visual

## Referência e composição

O modelo HTML escuro fornecido pelo usuário é a base da página. A estrutura editorial foi mantida: hero em tela cheia com título sobreposto à arte, navegação que aparece após a rolagem, faixas em movimento, seção Sobre, trajetória, caminhos de atuação, habilidades e contato em preto puro. A imagem principal mantém uma moldura preta de cantos retos.

As imagens foram externalizadas em `images/shinobu/model/`, em vez de permanecerem embutidas em base64 no HTML. A ilustração de Shinobu sentada na seção Sobre aparece sobre preto puro, sem a textura pontilhada. Os elementos decorativos restantes usam CSS e SVG. Confirme os direitos e as condições de uso dos arquivos de imagem antes de publicar o site.

## Sistema visual

- **Paleta:** preto puro `#000`, superfícies quase pretas e contrastes claros, seguindo o modelo.
- **Tipografia:** Playfair Display para títulos, Montserrat para interface e Pinyon Script na chamada de contato.
- **Composição:** título do hero em duas partes com ilustração central, headings-fantasma nas seções, grid editorial e seção de contato.
- **Trajetória e atuação:** trajetória cronológica de 2022 a 2026; áreas de programação e edição de fotografia em retângulos pretos empilhados.
- **Imagens:** artes de mangá em `images/shinobu/model/`, com contraste reforçado no hero; a imagem central mantém uma moldura preta quadrada. A categoria GitHub apresenta uma imagem clicável com inversão de cores.
- **Borboletas:** 24 borboletas brancas em traço de mangá ocupam o documento inteiro, distribuídas como um jardim e livres para voar independentemente da posição de rolagem. Elas percorrem trajetórias curvas, evitam o cursor e respeitam `prefers-reduced-motion`.
- **Hero:** o título recebe perspectiva 3D, profundidade tipográfica e movimento parallax sutil em resposta ao cursor; a arte central também participa da composição em camadas.
- **Interações e acessibilidade:** navegação e progresso de leitura, paralaxe, conteúdo revelado ao rolar, links externos seguros, foco de teclado, link para pular ao conteúdo e respeito a `prefers-reduced-motion`.

## Personalização

Os dados atuais de apresentação, trajetória, habilidades e GitHub estão em `content.js`. O contato por e-mail permanece desativado até que um endereço real seja configurado.
