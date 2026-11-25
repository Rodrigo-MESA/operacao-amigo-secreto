/* ==========================================================
   CONFIGURAÇÃO — edita tudo aqui. Não é preciso tocar noutros ficheiros.
   O código secreto da fase 2 está SÓ aqui (codigoFase2).
   ========================================================== */
const CONFIG = {
  pessoa: "Inês",
  empresa: "MESA Ceramics",
  processo: "MESA-2026/AS-0412",
  intro: "Agente {pessoa}, foi detetada uma identidade por revelar na {empresa}. Só tu podes resolver este caso. Analisa as provas com atenção.",

  // ----- ENTREGA -----
  entrega: { data: "15 de dezembro de 2026", hora: "15h30", local: "Showroom da MESA Ceramics" },
  codigoFase2: "ARQUIVO1512",        // código secreto (vem no cartão entregue no dia). Ignora maiúsculas, espaços e acentos.


  // ----- FIM DA FASE 1 → mensagem misteriosa -----
  mensagemMisteriosa: "O caso ainda não está encerrado. Faltam as últimas pistas e a identidade só será revelada na hora certa.",

  // ----- DESAFIOS (respostas ignoram maiúsculas, acentos e espaços) -----
  desafios: [
    { tipo: "cifra", titulo: "Prova 1 · Mensagem intercetada",
      intro: "Uma mensagem codificada foi intercetada no armazém. Cada letra foi deslocada 3 posições para a frente no alfabeto (Cifra de César).",
      mensagemCodificada: "GHVSRUWR",
      dica: "Dica: para decifrar, recua 3 letras. G → D.",
      respostas: ["DESPORTO"], sucesso: "Mensagem decifrada. Acesso à prova seguinte." },

    { tipo: "documento", titulo: "Prova 2 · Documento confidencial",
      intro: "Este relatório foi censurado. Dizem que contém tinta invisível. Liga a luz UV e encontra o número-chave.",
      linhas: ["RELATÓRIO INTERNO Nº 0412", "Assunto: movimentos suspeitos no atelier", "Local: ████████████ · Hora: ████", "Testemunhas: ████████████████"],
      textoOculto: "NÚMERO-CHAVE: 18",
      pergunta: "Qual é o número-chave?",
      teclado: "numeric",
      respostas: ["18", "DEZOITO"], sucesso: "Documento validado. Tinta revelada." },

    { tipo: "lanterna", titulo: "Prova 3 · O escritório às escuras",
      intro: "O embrulho foi deixado no escritório, no escuro. Quem lá esteve deixou seis marcas de giz escondidas, cada uma com um número. Apanha a lanterna e encontra-as todas.",
      ajuda: "Arrasta o dedo (ou o rato) para mover a lanterna. Toca quando uma marca aparecer para a apanhar.",
      // c = letra · n = ordem · x,y = posição no cenário (em %)
      letras: [
        { c: "H", n: 1, x: 14, y: 22 }, { c: "A", n: 2, x: 62, y: 14 }, { c: "C", n: 3, x: 38, y: 48 },
        { c: "K", n: 4, x: 86, y: 66 }, { c: "E", n: 5, x: 14, y: 88 }, { c: "R", n: 6, x: 60, y: 80 }
      ],
      pergunta: "Que palavra formam as marcas, pela ordem dos números?",
      respostas: ["HACKER"],
      sucesso: "Palavra correta. Foi mesmo no escritório que tudo começou. O arquivo do caso está agora desbloqueado." }
  ],

  // ----- ARQUIVO (fim da fase 1) -----
  arquivo: {
    suspeitos: [
      { id: "S-01", alcunha: "Henry", estado: "EM ANÁLISE" },
      { id: "S-02", alcunha: "Rodrigo", estado: "SOB VIGILÂNCIA" },
      { id: "S-03", alcunha: "Rita", estado: "EM ANÁLISE" },
      { id: "S-04", alcunha: "Marta", estado: "ARQUIVADO" }
    ],
    // Pistas 1, 2 e 3 (por esta ordem)
    documentos: [
      { titulo: "Relatório 0412-A", texto: "Há quem comece o dia com um café. Outros não dispensam que venha acompanhado." },
      { titulo: "Relatório 0412-B", texto: "Nem sempre sou o primeiro a falar, mas raramente sou o último a chegar." },
      { titulo: "Nota interna", texto: "Há quem trabalhe melhor em silêncio. Eu prefiro ter companhia nos ouvidos." }
    ],
    // Pista 4
    novaPista: "Ainda estou a aprender a controlar o caminho, mas um dia destes já ninguém me segura."
  },

  // ----- FASE 2 (depois do código) -----
  fase2: {
    titulo: "FASE 2 · ÚLTIMAS PISTAS",
    intro: "Código aceite. O arquivo foi desbloqueado. Restam duas pistas antes de encerrar o processo.",
    pistas: [
      { etiqueta: "PISTA 5 · DESPORTO", texto: "Dizem que para jogar é preciso marcar golos. Eu tenho outra opinião.",
        ligacao: "Recorda a palavra que decifraste na Prova 1.", visual: "baliza" },
      { etiqueta: "PISTA 6 · IDADE", texto: "Sou o mais novo daqui.",
        ligacao: "Recorda o número que encontraste na Prova 2.", visual: "foto" }
    ],
    // FOTO EM BEBÉ → coloca o ficheiro em assets/images/ com o nome  bebe.jpg
    // (também aceita bebe.jpeg, bebe.png ou bebe.webp). Se não existir, aparece um espaço reservado.
    foto: { base: "assets/images/bebe", extensoes: ["jpg", "jpeg", "png", "webp"], legenda: "Arquivo confidencial · há muitos anos" }
  },

  // ----- REVELAÇÃO FINAL -----
  final: {
    titulo: "IDENTIDADE REVELADA",
    texto: [
      "Inês, chegaste ao fim da investigação!",
      "Cifras decifradas, tinta invisível revelada, álibis desfeitos e pistas seguidas até ao fim. Nem o melhor detetive da MESA Ceramics faria melhor.",
      "Chegou o momento de encerrar o processo e dar um rosto à identidade que procuravas.",
      { texto: "O teu Amigo Secreto sou eu, o Rodrigo!", destaque: true },
      "Espero que tenhas gostado desta pequena aventura e, acima de tudo, que gostes do presente. E se não gostares... sou guarda-redes, por isso defendo qualquer reclamação!",
      "PROCESSO ENCERRADO."
    ],
    assinatura: "— O teu Amigo Secreto"
  }
};
