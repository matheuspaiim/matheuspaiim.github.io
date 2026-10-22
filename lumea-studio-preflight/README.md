# Lumea Studio · protótipo isolado (22/10/2026)

**Status:** preparado para avaliação, **NÃO está conectado à API do Pinterest**.

Esta pasta contém um protótipo estático e local para revisar propostas de Pins, registrar a aprovação **individual** de cada Pin e exportar os itens selecionados em JSON. Não captura senhas, tokens, cookies ou dados da API, e não publica ou agenda nada.

## Objetivo e controles

- Única conta configurada: `lumeaachados`. A segunda conta é hipótese pendente de avaliação dos termos de afiliados e titularidade.
- Campo obrigatório de imagem HTTPS, link de destino HTTPS, título, descrição, pasta e horário futuro.
- A descrição de cada Pin afiliado precisa identificar a relação comercial.
- Aprovação explícita de **cada Pin**; exportação inclui somente itens aprovados.
- Nenhum serviço agendado, GitHub Action, assinatura ou cobrança iniciados.
- Rascunhos em armazenamento do próprio navegador, somente dados digitados pelo usuário; não é banco de produção.

## Como testar

Abra o arquivo `index.html` desta pasta localmente em um navegador (ou via servidor estático). Crie um rascunho de exemplo, aprove separadamente e exporte o JSON. O JSON não é publicado no Pinterest.

## Próximos gates para um app verdadeiro

1. Trial aprovado pelo Pinterest para app público **1625731**.
2. Backend seguro e OAuth 2.0 com `state` anti-CSRF e `redirect_uri` exata; tokens separados por conta, renovados e armazenados **fora** do site público/Git.
3. Obter pastas atuais via API somente após autorização, sem cachear dados da API proibidos pelos termos.
4. Testar fluxo real com Pins Trial privados, obedecendo consentimento item a item.
5. Gravar vídeo real do fluxo OAuth + ação de API para pedir Standard; protótipo visual não basta.
6. Antes da produção, confirmar licença de imagens, regras dos programas de afiliados, transparência de publicidade, Política de Privacidade, conta(s) permitida(s), prevenção de duplicidade, limites e pausa geral.

## Fontes oficiais

- https://developers.pinterest.com/docs/key-concepts/access-tiers/
- https://developers.pinterest.com/docs/getting-started/set-up-authentication-and-authorization/
- https://policy.pinterest.com/pt-br/developer-guidelines
- https://policy.pinterest.com/pt-br/commercial-and-branded-content-guidelines
