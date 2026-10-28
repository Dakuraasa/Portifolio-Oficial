window.portfolioContent = {
  name: "Alexandre Wietchesly",
  tagline: "Estudante de TI, com experiência em fotografia e edição de imagens.",

  // Abertura: nome -> GIF da borboleta (toca uma vez só) -> site.
  // butter-intro.gif é uma cópia do butter.gif sem repetição.
  // gifDuration = duração exata do GIF (27 quadros x 100 ms = 2700 ms).
  intro: {
    gif: "images/butter-intro.gif",
    gifDuration: 2700,
  },

  // Texto de apresentação (aparece logo abaixo do início)
  presentation: {
    lead: "Vejo arte em tudo o que crio: numa fotografia bem tratada, num código bem escrito e no design de uma plataforma agradável de usar.",
    paragraphs: [
      "Sou estudante de Tecnologia da Informação, fotógrafo e editor de imagens. Comecei editando por curiosidade, ainda pequeno, e foi esse mesmo olhar que me levou à programação: entender como as coisas funcionam e deixá-las mais bonitas e mais simples para quem usa.",
      "Busco melhorar a vida das pessoas automatizando tarefas do dia a dia, principalmente de pessoas com deficiência, para que a tecnologia seja ponte e não barreira.",
    ],
    languages: ["python", "csharp", "html", "css", "javascript", "sql"],
  },

  // Os dois caminhos do portfólio
  paths: {
    edicao: {
      label: "Edição",
      marqueeText: "fotografia ✦ edição de imagens ✦ luz e cor ✦ arte",
      about: [
        "Sou apaixonado por fotografia e arte. Aprendi a editar desde pequeno, criando ícones, banners e outras artes para plataformas de interação como o Line, sempre por iniciativa própria e pela vontade de criar.",
        "Com o tempo, a brincadeira virou ofício: em 2025 meu trabalho foi reconhecido e fui contratado pela primeira vez como profissional. Hoje fotografo e aceito encomendas de edição de imagens, buscando luz, cor e sentimento em cada detalhe.",
      ],
      timeline: [
        { year: "2022", title: "Editor de imagens" },
        { year: "2025", title: "Fotógrafo" },
      ],
      // Obras e projetos: galeria de antes e depois
      projects: [{ type: "gallery" }],
      galleryNote:
        "Todas as fotos abaixo foram editadas por mim. As fotografias originais não são de minha autoria; o meu trabalho está no tratamento: luz, cor, pele e atmosfera.",
      // raw = foto crua | edit = versão leve para exibir | full = arquivo original em resolução máxima
      gallery: [
        { title: "Noiva", raw: "images/edit/noiva.jpg", edit: "images/edit/web/noivaedit.jpg", full: "images/edit/noivaedit.jpg" },
        { title: "Telefone", raw: "images/edit/telefone.jpg", edit: "images/edit/web/telefoneedit.jpg", full: "images/edit/telefoneedit.jpg" },
        { title: "Goth", raw: "images/edit/goth.jpeg", edit: "images/edit/web/gothedit.jpg", full: "images/edit/gothedit.jpg" },
        { title: "Flores", raw: "images/edit/flores.jpg", edit: "images/edit/web/floresedit.jpg", full: "images/edit/floresedit.jpg" },
        { title: "Soldado", raw: "images/edit/soldado.jpg", edit: "images/edit/web/soldadoedit.jpg", full: "images/edit/soldadoedit.jpg" },
        { title: "Ruiva", raw: "images/edit/ruiva.jpg", edit: "images/edit/web/ruivaedit.jpg", full: "images/edit/ruivaedit.jpg" },
        { title: "Costas", raw: "images/edit/costas.jpg", edit: "images/edit/web/costasedit.jpg", full: "images/edit/costasedit.jpg" },
      ],
      skillsTitle: "Aplicativos",
      skills: [
        { icon: "lightroom", name: "Lightroom", featured: true },
        { icon: "photoshop", name: "Photoshop" },
        { icon: "picsart", name: "Picsart" },
        { icon: "lightroom-classic", name: "Lightroom Classic" },
        { icon: "bridge", name: "Bridge" },
        { icon: "stock", name: "Adobe Stock" },
      ],
    },
    programacao: {
      label: "Programação",
      marqueeText: "código ✦ tecnologia ✦ automação ✦ design de plataformas",
      about: [
        "Sou estudante de Tecnologia da Informação e vejo arte na programação e no design de plataformas. Gosto de entender como os sistemas funcionam por dentro e de transformar ideias em ferramentas simples, bonitas e úteis.",
        "Meu objetivo é usar a tecnologia para melhorar a vida das pessoas, automatizando tarefas do dia a dia, principalmente de pessoas com deficiência. Hoje estudo desenvolvimento web, análise de sistemas e estrutura de dados.",
      ],
      timeline: [
        { year: "2026", title: "Formação técnica em Tecnologia da Informação" },
      ],
      projects: [{ type: "github" }],
      skillsTitle: "Linguagens",
      skills: [
        { icon: "python", name: "Python" },
        { icon: "java", name: "Java" },
        { icon: "csharp", name: "C#" },
        { icon: "html", name: "HTML" },
        { icon: "css", name: "CSS" },
        { icon: "javascript", name: "JavaScript" },
        { icon: "sql", name: "SQL" },
      ],
    },
  },

  iconNames: {
    python: "Python",
    csharp: "C#",
    html: "HTML",
    css: "CSS",
    javascript: "JavaScript",
    sql: "SQL",
  },

  marqueeText: "selected works ✦ graphic design ✦ illustration ✦ comics",
  github: "https://github.com/Dakuraasa",
  githubUser: "Dakuraasa",
  githubImage: "images/shinobu/model/github-header.jpg",
  email: "",
  links: [],
  contactText: "[ESCREVA UMA MENSAGEM CONVIDANDO AS PESSOAS A ENTRAR EM CONTATO.]",
};
