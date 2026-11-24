# Operação Amigo Secreto

Aplicação 100% estática (HTML + CSS + JS), pronta para GitHub Pages. Sem backend, sem cookies, sem dados recolhidos.

## Como funciona

**Fase 1 (antes da entrega)** — a Inês abre o QR Code e resolve:
1. Prova 1 · Cifra de César → `FUTSAL`
2. Prova 2 · Documento confidencial (luz UV) → `18`
3. Prova 3 · O escritório às escuras: move uma lanterna (dedo ou rato) por um escritório escuro, encontra 12 marcas de giz com letras numeradas e escreve a palavra que formam → `COMPUTADORES`

Depois vê as pistas 1 a 4 no arquivo (já abertas, a pista 4 por descodificar) e só então chega a um ecrã com uma mensagem misteriosa e o campo do código. A identidade **não** é revelada.

**Fase 2 (15 de dezembro de 2026, 15h30, Showroom da MESA Ceramics)** — com o código do cartão (`ARQUIVO1512`):
animação de desbloqueio → Pista 5 (futsal) → Pista 6 (foto em bebé + «Sou o mais novo daqui.») → revelação final.

## Progresso guardado

Tudo é guardado em `localStorage` (chave `oas_state_v2`): prova em que está, marcas encontradas na prova 3, pista 4 descodificada, ecrã do código, pistas da fase 2 e revelação.
Ao fechar e voltar a abrir **o mesmo endereço, no mesmo telemóvel e navegador**, continua exatamente onde ficou, sem repetir provas. Se o armazenamento estiver bloqueado, a app funciona na mesma, mas sem memória.

Limitações a conhecer:
- O progresso é por navegador. Abrir o QR dentro de outra app (ex.: pré-visualização da câmara) e depois no Safari/Chrome conta como dispositivos diferentes. Convém dizer à Inês para abrir sempre no mesmo navegador.
- O Safari do iPhone pode apagar dados de sites não usados durante cerca de 7 dias. Para reduzir o risco, ela pode usar "Adicionar ao ecrã principal" (o progresso fica protegido).

## Som

Os efeitos sonoros (cliques, acertos, erros, marcas apanhadas, desbloqueio, revelação) são gerados no próprio browser: não há ficheiros de áudio. Só tocam depois do primeiro toque no ecrã (regra dos telemóveis). O botão **SOM ON/OFF** no topo liga e desliga, e a escolha fica guardada. Para tirar o som por completo basta apagar o bloco `SFX` em `js/app.js` ou pôr o botão em OFF por omissão.

## Código secreto

Define-se **num único sítio**: `codigoFase2` em `js/config.js` (agora `ARQUIVO1512`). Ignora maiúsculas, espaços e acentos. Não existe em mais nenhum ficheiro de código.
Nota: sendo um site estático, o código faz parte do jogo e não é segurança real (quem ler o código-fonte pode vê-lo).

## Personalizar

Tudo está em `js/config.js`: nomes, desafios, as marcas (letras e posições) da prova 3, pistas, data/local, código, textos da fase 2 e mensagem final (`final.texto`).

## Fotografia em bebé (Pista 6)

Coloca o ficheiro em **`assets/images/bebe.jpg`** (também aceita `bebe.jpeg`, `bebe.png` ou `bebe.webp`). Formato vertical 4:5, idealmente com menos de 500 KB. Não é preciso alterar mais nada.
Enquanto o ficheiro não existir, aparece um espaço reservado «FOTOGRAFIA CLASSIFICADA» (em localhost vês também uma nota de teste com o caminho). Depois de publicar, confirma no site que a foto aparece.

## Testar localmente

Abre `index.html` no browser (duplo clique) ou, na pasta do projeto: `python3 -m http.server 8000` e visita http://localhost:8000.

Atalhos de teste (acrescentar ao endereço):
- `?reset` — apaga todo o progresso e recomeça.
- `?skip` — salta para o fim da fase 1 (ecrã do código), para testar a fase 2 sem refazer as provas.
- `?teste` — mostra notas de programador (ex.: caminho da foto em falta).

Para testar as duas fases: (1) abre com `?reset` e resolve as provas (respostas: `FUTSAL`, `18`, `COMPUTADORES`); (2) fecha e reabre para confirmar que continua onde ficou; (3) no ecrã do código escreve `ARQUIVO1512`; (4) confirma pistas 5 e 6 e a revelação; (5) fecha e reabre: a revelação continua disponível. Antes de entregar o QR, faz `?reset` no telemóvel que vais usar para testar, ou usa outro navegador.

## Publicar no GitHub Pages (grátis)

1. Cria conta em github.com e um repositório **público** chamado `operacao-amigo-secreto`.
2. No repositório: **Add file → Upload files**. Arrasta o **conteúdo** da pasta (`index.html`, `css/`, `js/`, `assets/`, `README.md`) para que o `index.html` fique na raiz. Clica em **Commit changes**.
3. **Settings → Pages → Build and deployment → Source: "Deploy from a branch"** → Branch `main`, pasta `/ (root)` → **Save**.
4. Passados 1–2 minutos, o site fica em `https://UTILIZADOR.github.io/operacao-amigo-secreto/` (o endereço aparece no topo da página Pages).
5. Para atualizar (ex.: acrescentar a foto): **Add file → Upload files** (para a foto, dentro de `assets/images/`) e faz commit. Demora cerca de 1 minuto; se vires a versão antiga, atualiza com Ctrl+F5 ou abre em separador privado.

Com Git: `git init`, `git add .`, `git commit -m "Operação Amigo Secreto"`, `git branch -M main`, `git remote add origin URL_DO_REPOSITORIO`, `git push -u origin main`, e depois o passo 3.

O projeto usa só caminhos relativos e o ficheiro `.nojekyll` está incluído, por isso funciona no subendereço do GitHub Pages sem configuração extra. O `index.html` inclui `noindex` para o site não aparecer em motores de busca.

## QR Code

Usa um gerador gratuito (ex.: qr-code-generator.com ou qrcode-monkey.com), cola o endereço publicado e descarrega em PNG/SVG. Testa com o telemóvel antes de imprimir.

## Dia da entrega

Entrega o presente com um cartão com o código `ARQUIVO1512`. A Inês abre a mesma aplicação, escreve o código no ecrã final e vê a animação, as duas últimas pistas e a revelação.
