/* Libras Studio · currículo mestre 0→100
   Arquitetura atual: 15 etapas, 60 unidades, 4 aulas de conteúdo novo + 1 missão por unidade,
   com revisão espaçada no fim de cada etapa e microteoria embutida na prática.
   Os vídeos de sinais são resolvidos sob demanda pelo catálogo do Libras Studio. */
(function(){
const CYCLES=[
[1,"Primeiro contato","0–10","Sobreviver à primeira conversa com autonomia básica."],
[2,"Eu e as pessoas","10–20","Apresentar pessoas, relações e características."],
[3,"Minha vida cotidiana","20–30","Falar de rotina, horas, datas e sequência diária."],
[4,"Casa e necessidades","30–40","Descrever casa, localização, alimentação e ações cotidianas."],
[5,"O mundo fora de casa","40–50","Circular pela cidade, pedir informação, comprar e resolver tarefas."],
[6,"Pessoas no espaço","50–60","Usar referentes, direção, apontação e coesão espacial."],
[7,"Planos e acontecimentos","60–68","Combinar eventos, falar de planos e lidar com mudanças."],
[8,"Saúde e segurança","68–75","Descrever corpo, sintomas, atendimento e emergências."],
[9,"Estudo, trabalho e tecnologia","75–80","Explicar atividades, funções, processos e problemas."],
[10,"Descrição visual","80–85","Construir descrições espaciais e introduzir classificadores."],
[11,"Narrativa e relato","85–90","Organizar sequência, referentes, perspectiva e relatos em Libras."],
[12,"Emoção e opinião","90–93","Expressar sentimentos, preferências, opinião e desacordo."],
[13,"Compreensão natural","93–95","Entender velocidade, estilos e sinalizantes diferentes."],
[14,"Discurso avançado","95–98","Narrar, explicar, hipotetizar e discutir temas abstratos."],
[15,"Autonomia e fluência","98–100","Interagir em grupos, ajustar registro e seguir aprendendo fora do curso."]
].map(x=>({id:x[0],title:x[1],range:x[2],goal:x[3]}));


const U=[
{n:1,c:1,t:"O primeiro encontro",m:"Cumprimentar, chamar atenção visualmente e encerrar uma interação.",th:["Libras é visual-espacial","A mensagem não está apenas nas mãos. Olhar, rosto, corpo e espaço participam da comunicação.","Observe o conjunto da sinalização antes de tentar traduzir palavra por palavra."],st:["Duas pessoas se encontram","Uma pessoa chega, estabelece contato visual, cumprimenta, troca uma informação curta e se despede.","Reconheça onde a interação começa, como a atenção é estabelecida e como termina."],p:[
["Chegar e cumprimentar","Primeiros sinais sociais.","oi","olá","bom dia","boa tarde","boa noite","tchau"],
["Cortesia","Recursos para uma interação respeitosa.","por favor","obrigado","obrigada","desculpa","licença","prazer"],
["Atenção e resposta","Sinais para iniciar contato e responder.","sim","não","tudo bem","bem","esperar","olhar"],
["Encerrar a conversa","Finalizar sem quebrar a interação.","depois","amanhã","até logo","ir","ficar","tchau"]]},
{n:2,c:1,t:"Quem é você?",m:"Apresentar-se, perguntar nome e lidar com nomes próprios.",th:["Primeira datilologia","O alfabeto manual entra cedo porque nomes próprios e palavras sem sinal conhecido aparecem em conversas reais.","Priorize fluidez e reconhecimento de blocos, não velocidade artificial letra por letra."],st:["A nova colega","Duas pessoas se apresentam. Uma usa datilologia para o nome e depois retoma a pessoa no diálogo.","Identifique nome, quem é surdo ou ouvinte e quais informações foram apresentadas."],p:[
["Eu e você","Identidade básica na conversa.","eu","você","ele","ela","nós","pessoa"],
["Meu nome","Apresentação e identificação.","nome","chamar","quem","qual","conhecer","prazer"],
["Pessoas","Vocabulário para reconhecer participantes.","homem","mulher","menino","menina","surdo","ouvinte"],
["De onde?","Primeiras informações pessoais.","cidade","bairro","morar","Brasil","Bahia","Salvador"]]},
{n:3,c:1,t:"Não entendi",m:"Pedir repetição, esclarecimento e ajuda quando a conversa falha.",th:["Reparação é parte da fluência","Fluência não é entender tudo. Bons interlocutores sabem sinalizar que não entenderam, pedir repetição e confirmar informação.","Aprenda a manter a conversa viva em vez de abandonar a interação."],st:["A conversa emperrou","Uma pessoa não entende um sinal, pede repetição, recebe uma explicação e confirma que agora compreendeu.","Localize o problema, a estratégia usada e a confirmação final."],p:[
["Entender ou não","Sinalizar compreensão.","entender","não entender","saber","não saber","certo","errado"],
["Peça de novo","Controlar ritmo e repetição.","repetir","novamente","devagar","rápido","parar","continuar"],
["Peça ajuda","Recursos de apoio.","ajudar","mostrar","explicar","como","o que","significado"],
["Confirme","Checar se a informação ficou clara.","sim","agora","entendi","certo","talvez","obrigado"]]},
{n:4,c:1,t:"Minha primeira conversa",m:"Combinar apresentação, perguntas, reparação e despedida em uma interação curta.",th:["Pergunta não é só uma palavra","Tipos de pergunta podem combinar sinais interrogativos com marcas de rosto, cabeça e corpo.","Observe a extensão da expressão não manual durante a pergunta."],st:["Primeiro dia","Uma pessoa conhece alguém, pergunta nome e cidade, não entende uma resposta, pede repetição e encerra a conversa.","Reconstrua a ordem inteira sem consultar a lista de sinais."],p:[
["Perguntas essenciais","Perguntar informações simples.","quem","onde","como","qual","quando","quanto"],
["Respostas curtas","Responder com segurança.","sim","não","talvez","aqui","ali","agora"],
["Miniapresentação","Combinar identidade e lugar.","nome","morar","cidade","surdo","ouvinte","conhecer"],
["Conversa completa","Reutilizar o ciclo inteiro.","olá","prazer","repetir","entender","obrigado","tchau"]]},

{n:5,c:2,t:"Minha família",m:"Apresentar parentes e relações familiares.",th:["Referência começa cedo","Quando várias pessoas entram na conversa, apontação e localização ajudam a manter claro de quem se fala.","Comece a observar onde cada pessoa é estabelecida no espaço."],st:["Conheça minha família","Uma personagem apresenta parentes próximos e depois responde quem mora com ela.","Acompanhe parentesco e quantidade de pessoas sem transformar a tarefa numa lista."],p:[
["Família próxima","Parentes de convívio frequente.","família","mãe","pai","irmão","irmã","pais"],
["Filhos e avós","Expandir gerações.","filho","filha","avô","avó","neto","neta"],
["Tios e primos","Relações ampliadas.","tio","tia","primo","prima","sobrinho","sobrinha"],
["Relacionamentos","Vínculos afetivos e civis.","marido","esposa","namorado","namorada","casamento","divórcio"]]},
{n:6,c:2,t:"Pessoas ao meu redor",m:"Descrever grupos, idades aproximadas e relações sociais.",th:["Apontação e contexto","Um apontamento pode retomar alguém já estabelecido. O significado depende do contexto espacial criado.","Evite repetir nomes quando o espaço já permite identificar o referente."],st:["Quem veio à festa?","Várias pessoas chegam e são apresentadas por relação e faixa etária.","Descubra quem é amigo, colega, vizinho e parente."],p:[
["Faixas da vida","Falar de idade social.","bebê","criança","jovem","adulto","idoso","idade"],
["Relações sociais","Pessoas do cotidiano.","amigo","amiga","colega","vizinho","vizinha","pessoa"],
["Grupos","Quantidade e coletividade.","todos","ninguém","alguém","grupo","muitos","poucos"],
["Relacionar pessoas","Dizer quem conhece quem.","conhecer","encontrar","junto","separado","mesmo","diferente"]]},
{n:7,c:2,t:"Aparência",m:"Descrever características visíveis sem depender de uma fotografia mental em português.",th:["Os parâmetros formam o sinal","Configuração de mão, localização, movimento, orientação e componentes não manuais distinguem produções.","Compare sinais parecidos observando qual parâmetro muda."],st:["Quem é a pessoa?","Uma descrição visual permite identificar alguém entre várias opções.","Use um conjunto de pistas, não uma única característica."],p:[
["Altura e tamanho","Características gerais.","alto","baixo","grande","pequeno","forte","fraco"],
["Rosto e cabelo","Partes visíveis.","rosto","cabelo","olho","nariz","boca","orelha"],
["Acessórios","Pistas de identificação.","óculos","chapéu","boné","relógio","bolsa","mochila"],
["Avaliação simples","Qualidades básicas.","bonito","feio","novo","velho","igual","diferente"]]},
{n:8,c:2,t:"Quem é quem?",m:"Manter duas ou mais pessoas identificáveis numa mesma conversa.",th:["Consistência espacial","Se uma pessoa é estabelecida à direita e outra à esquerda, preserve esses pontos enquanto a cena continuar.","A consistência reduz repetição e prepara o aluno para narrativas maiores."],st:["A fotografia da turma","Uma pessoa descreve quatro integrantes de um grupo usando relações, aparência e posição.","Associe cada descrição ao referente correto e mantenha os pontos espaciais."],p:[
["Dois referentes","Contrastar duas pessoas.","ele","ela","esse","outro","primeiro","segundo"],
["Relações","Conectar pessoas.","amigo","irmão","colega","professor","aluno","vizinho"],
["Comparar","Dizer semelhanças e diferenças.","igual","diferente","mais","menos","alto","baixo"],
["Retomar","Voltar a alguém já apresentado.","lembrar","conhecer","falar","perguntar","responder","olhar"]]},

{n:9,c:3,t:"Minha manhã",m:"Narrar uma rotina curta desde acordar até sair de casa.",th:["Sequência antes da gramática longa","Rotinas são um bom lugar para perceber ordem de eventos, marcação de tempo e repetição.","Organize primeiro o cenário temporal e depois as ações."],st:["Acordei atrasado","A personagem acorda tarde, acelera a rotina e sai de casa com pressa.","Coloque os acontecimentos na ordem e identifique o que foi pulado."],p:[
["Começar o dia","Ações da manhã.","acordar","levantar","dormir","banho","escovar","vestir"],
["Café da manhã","Necessidades e alimentação.","café","pão","leite","comer","beber","fome"],
["Preparar-se","Organização antes de sair.","arrumar","pegar","mochila","chave","celular","procurar"],
["Sair de casa","Transição para fora.","sair","ir","trabalho","escola","cedo","atrasado"]]},
{n:10,c:3,t:"Horas e rotina",m:"Combinar horários com ações cotidianas.",th:["Números mudam de função","Números aparecem em idade, hora, quantidade, preço e data. A forma de uso depende da função comunicativa.","Treine números dentro de situações, não como sequência decorada."],st:["Que horas começa?","Duas pessoas combinam horários e percebem que entenderam horas diferentes.","Identifique o horário original, o mal-entendido e a correção."],p:[
["Horas","Vocabulário temporal básico.","hora","minuto","manhã","tarde","noite","meio dia"],
["Números essenciais","Quantidades de alta frequência.","um","dois","três","quatro","cinco","dez"],
["Frequência","Organizar hábitos.","sempre","nunca","às vezes","todo dia","semana","rotina"],
["Pontualidade","Falar de começo e atraso.","cedo","tarde","começar","terminar","esperar","atrasado"]]},
{n:11,c:3,t:"Calendário",m:"Falar de dias, datas, meses e compromissos próximos.",th:["Ancoragem temporal","O tempo pode ser estabelecido no início de um trecho e permanecer válido até ser alterado.","Observe quando o sinalizador muda o marco temporal em vez de repetir a informação em toda frase."],st:["Qual é o dia?","Um compromisso é marcado, remarcado e finalmente confirmado.","Recupere dia, período e mudança de data."],p:[
["Dias próximos","Orientação imediata.","hoje","ontem","amanhã","antes","depois","agora"],
["Semana","Dias e planejamento.","segunda","terça","quarta","quinta","sexta","sábado"],
["Domingo e mês","Ampliar calendário.","domingo","semana","mês","ano","data","calendário"],
["Eventos","Marcar acontecimentos.","aniversário","feriado","encontro","consulta","prova","viagem"]]},
{n:12,c:3,t:"Meu dia inteiro",m:"Produzir um relato cotidiano com começo, meio e fim.",th:["Coesão simples","Uma sequência fica clara quando tempo, participantes e ações permanecem rastreáveis.","Evite transformar o relato em lista de verbos desconectados."],st:["Um dia fora do plano","Trânsito, atraso e uma mudança de compromisso alteram a rotina de uma personagem.","Conte novamente o dia preservando causa e ordem dos acontecimentos."],p:[
["Trabalho e estudo","Blocos do dia.","trabalhar","estudar","aula","almoço","descansar","voltar"],
["Deslocamento","Entre atividades.","ônibus","carro","andar","chegar","sair","esperar"],
["Fim do dia","Fechar rotina.","jantar","casa","banho","televisão","dormir","cansado"],
["Relatar","Conectores simples.","primeiro","depois","então","finalmente","acontecer","dia"]]},

{n:13,c:4,t:"Minha casa",m:"Apresentar cômodos e objetos relevantes da casa.",th:["Espaço pode virar planta mental","Ao descrever um ambiente, o espaço de sinalização pode representar relações entre partes da cena.","Mantenha uma organização coerente para que o interlocutor consiga reconstruir o lugar."],st:["Visita à casa","Uma personagem apresenta a casa e indica onde ficam objetos importantes.","Reconstrua a disposição geral sem memorizar frases."],p:[
["Cômodos","Estrutura da casa.","casa","sala","quarto","cozinha","banheiro","garagem"],
["Móveis","Objetos grandes.","mesa","cadeira","cama","sofá","armário","geladeira"],
["Partes da casa","Elementos fixos.","porta","janela","parede","chão","teto","escada"],
["Objetos úteis","Coisas do cotidiano.","chave","lâmpada","copo","prato","toalha","ventilador"]]},
{n:14,c:4,t:"Onde está?",m:"Localizar objetos e pessoas em relação a outros elementos.",th:["Relações espaciais","Em Libras, localização pode ser mostrada diretamente no espaço, não apenas nomeada por uma sequência de palavras.","Observe direção, altura, distância e relação entre referentes."],st:["Cadê a chave?","Uma pessoa procura um objeto e recebe pistas de localização cada vez mais específicas.","Siga as pistas visualmente e determine onde o objeto estava."],p:[
["Dentro e fora","Relações básicas.","dentro","fora","entrar","sair","abrir","fechar"],
["Perto e longe","Distância e posição.","perto","longe","aqui","ali","lado","entre"],
["Em cima e embaixo","Eixos verticais.","em cima","embaixo","alto","baixo","colocar","tirar"],
["Encontrar","Busca e localização.","procurar","encontrar","perder","achar","onde","mostrar"]]},
{n:15,c:4,t:"Comida e bebida",m:"Expressar fome, sede, preferência e pedidos simples.",th:["Preferência é interação","Vocabulário de comida ganha valor quando o aluno pergunta, escolhe, aceita, recusa e compara.","Use o tema para praticar turnos e respostas, não para decorar um cardápio."],st:["O que vamos comer?","Duas pessoas têm preferências diferentes e precisam escolher uma refeição.","Identifique preferências, recusas e decisão final."],p:[
["Necessidades","Fome e sede.","comida","comer","bebida","beber","fome","sede"],
["Básicos","Itens frequentes.","água","café","leite","suco","pão","queijo"],
["Refeição","Prato cotidiano.","arroz","feijão","carne","frango","peixe","ovo"],
["Preferências","Escolher alimentos.","gostar","não gostar","querer","preferir","mais","menos"]]},
{n:16,c:4,t:"Na cozinha",m:"Descrever ações e sequência de preparo.",th:["Verbos podem mostrar maneira","Movimento, duração e intensidade podem acrescentar informação à ação.","Comece a observar como a execução modifica o sentido sem criar regras artificiais."],st:["O jantar deu errado","Uma sequência de preparo é interrompida porque falta um ingrediente e algo passa do ponto.","Reconstrua a receita e identifique o momento do problema."],p:[
["Preparar","Ações iniciais.","lavar","cortar","pegar","colocar","abrir","fechar"],
["Cozinhar","Ações de preparo.","cozinhar","ferver","misturar","esperar","fogo","panela"],
["Ingredientes","Itens úteis.","sal","açúcar","óleo","água","carne","legume"],
["Servir e limpar","Finalizar a tarefa.","prato","copo","mesa","servir","limpar","guardar"]]},

{n:17,c:5,t:"Lugares da cidade",m:"Identificar destinos e dizer aonde precisa ir.",th:["Lugar vira referente","Um local estabelecido pode ser retomado espacialmente como qualquer outro referente.","Isso prepara direções, rotas e histórias de deslocamento."],st:["Um sábado na cidade","A personagem passa por vários lugares para resolver tarefas.","Coloque os destinos na ordem e associe cada lugar à atividade."],p:[
["Serviços","Destinos essenciais.","banco","farmácia","hospital","mercado","escola","trabalho"],
["Lazer","Locais sociais.","praça","parque","praia","cinema","restaurante","shopping"],
["Viagem urbana","Pontos de transporte.","aeroporto","rodoviária","estação","rua","avenida","bairro"],
["Destino","Perguntar e responder.","onde","aonde","ir","chegar","voltar","lugar"]]},
{n:18,c:5,t:"Como chegar?",m:"Pedir, compreender e produzir orientações simples de caminho.",th:["Direção é informação visual","Rotas ficam mais claras quando direção e trajetória são representadas consistentemente no espaço.","Não reduza o exercício a decorar DIREITA e ESQUERDA."],st:["Perdido no caminho","Uma pessoa pergunta como chegar, interpreta uma instrução errado e precisa corrigir a rota.","Identifique em que ponto ocorreu o erro."],p:[
["Direções","Orientação básica.","direita","esquerda","frente","atrás","reto","virar"],
["Movimento","Ações de deslocamento.","andar","correr","parar","continuar","subir","descer"],
["Referências","Pontos do caminho.","esquina","semáforo","rua","praça","perto","longe"],
["Perguntar rota","Interação funcional.","como","onde","chegar","mostrar","ajudar","obrigado"]]},
{n:19,c:5,t:"Compras",m:"Perguntar preço, comparar opções e efetuar pagamento.",th:["Quantidade em contexto","Preço combina números, moeda, comparação e decisão.","Treine leitura de valores dentro de uma negociação simples."],st:["Mais barato ou melhor?","Uma pessoa compara duas opções, pergunta preço e escolhe uma forma de pagamento.","Recupere os valores e a razão da escolha."],p:[
["Preço","Vocabulário central.","preço","valor","dinheiro","real","caro","barato"],
["Comprar","Ações comerciais.","comprar","vender","pagar","escolher","querer","precisar"],
["Pagamento","Formas comuns.","pix","cartão","crédito","débito","conta","troco"],
["Comparar","Tomar decisão.","mais","menos","melhor","pior","igual","diferente"]]},
{n:20,c:5,t:"Resolver tarefas",m:"Atender pequenas necessidades em lojas, serviços e filas.",th:["Pragmática básica","A mesma necessidade pode ser expressa de forma mais direta ou mais elaborada conforme contexto e interlocutor.","Observe como atenção, pedido e confirmação organizam o atendimento."],st:["Três coisas para resolver","A personagem vai a um serviço, enfrenta fila e precisa corrigir uma informação.","Identifique o objetivo em cada lugar e como o problema foi resolvido."],p:[
["Atendimento","Vocabulário funcional.","atender","fila","esperar","senha","documento","informação"],
["Pedido","Solicitar algo.","precisar","querer","ajudar","dar","mostrar","explicar"],
["Problema","Quando algo falha.","erro","problema","faltar","não ter","errado","corrigir"],
["Concluir","Finalizar tarefa.","pronto","certo","obrigado","pagar","receber","sair"]]},

{n:21,c:6,t:"Referentes no espaço",m:"Estabelecer pessoas e lugares e retomá-los sem repetição excessiva.",th:["Ancoragem de referente","Um referente pode ser associado a um ponto do espaço e recuperado por apontação, olhar ou direção corporal.","O ponto precisa permanecer estável durante o trecho."],st:["Três pessoas, dois lugares","Uma narrativa estabelece pessoas em posições diferentes e alterna entre elas.","Mantenha um mapa mental dos referentes enquanto acompanha."],p:[
["Estabelecer","Introduzir participantes.","pessoa","homem","mulher","amigo","colega","vizinho"],
["Retomar","Voltar ao referente.","ele","ela","esse","aquele","apontar","olhar"],
["Lugares","Ancorar cenários.","casa","trabalho","escola","mercado","hospital","praça"],
["Alternar","Mover atenção entre pontos.","falar","perguntar","responder","dar","receber","encontrar"]]},
{n:22,c:6,t:"Quem fez o quê?",m:"Acompanhar ações com vários participantes mantendo clareza de agente e alvo.",th:["Olhar e corpo ajudam a rastrear participantes","Mudanças de orientação podem sinalizar quem interage com quem.","O aluno deve acompanhar relações, não traduzir palavra por palavra."],st:["O pacote trocado","Um objeto passa por três pessoas e chega ao destinatário errado.","Reconstrua quem entregou, recebeu e devolveu."],p:[
["Dar e receber","Transferência entre pessoas.","dar","receber","emprestar","devolver","pegar","entregar"],
["Pergunta e resposta","Fluxo de informação.","perguntar","responder","explicar","contar","mostrar","avisar"],
["Ajudar","Ações interpessoais.","ajudar","chamar","esperar","acompanhar","encontrar","procurar"],
["Rastrear","Manter relações claras.","quem","qual","primeiro","segundo","outro","mesmo"]]},
{n:23,c:6,t:"Direcionalidade",m:"Perceber como movimento e orientação podem marcar relações entre participantes e destinos.",th:["Nem todo verbo é direcional","Alguns verbos permitem orientar o movimento de acordo com participantes ou destinos; outros não seguem o mesmo padrão.","Aprenda por exemplos reais e evite generalizar uma regra para todos os verbos."],st:["De onde para onde?","Pessoas e objetos mudam de posição e destino enquanto a relação entre origem e chegada precisa continuar clara.","Siga a direção do movimento e identifique origem, destino e participante."],p:[
["Origem e destino","Relações de deslocamento.","ir","vir","levar","trazer","enviar","buscar"],
["Orientar relações","Direção entre participantes.","oferecer","pedir","convidar","ensinar","perguntar","responder"],
["Pontos de referência","Participantes e localização.","eu","você","pessoa","grupo","aqui","ali"],
["Trajetos","Mudança de direção.","aproximar","afastar","seguir","voltar","cruzar","passar"]]},
{n:24,c:6,t:"Espaço conta histórias",m:"Combinar referentes, lugares e ações numa narrativa espacial curta.",th:["Coesão espacial","O espaço guarda informação ao longo de uma história. Mudá-lo sem motivo pode tornar a narrativa ambígua.","Planeje cenário e personagens antes de sinalizar."],st:["O celular desaparecido","Um celular passa por cômodos e pessoas até ser encontrado em um lugar inesperado.","Reconte a história mantendo os mesmos pontos espaciais."],p:[
["Montar cenário","Preparar ambiente.","casa","sala","quarto","mesa","sofá","porta"],
["Criar personagens","Definir participantes.","irmão","irmã","mãe","amigo","eu","ele"],
["Mover objetos","Ações espaciais.","pegar","colocar","levar","trazer","procurar","encontrar"],
["Fechar narrativa","Resolver o problema.","lembrar","perder","achar","explicar","rir","finalmente"]]},

{n:25,c:7,t:"Fazer planos",m:"Propor, aceitar, recusar e organizar atividades futuras.",th:["Futuro pode ser estabelecido pelo contexto","Depois de marcar um tempo futuro, uma sequência pode permanecer nesse quadro até outra mudança temporal.","Use contexto e não tente copiar flexões do português."],st:["O que vamos fazer amanhã?","Duas pessoas propõem opções, verificam disponibilidade e fecham um plano.","Identifique proposta inicial, alternativa e decisão."],p:[
["Planejar","Intenções básicas.","querer","poder","precisar","planejar","combinar","decidir"],
["Tempo futuro","Marcar quando.","amanhã","depois","semana","sábado","domingo","noite"],
["Convite","Propor encontro.","convidar","encontro","ir","vir","junto","aceitar"],
["Recusar e mudar","Negociar plano.","não poder","talvez","outro dia","mudar","cancelar","confirmar"]]},
{n:26,c:7,t:"Festa e encontro",m:"Combinar evento social, horário, lugar e participantes.",th:["Turnos e atenção","Conversas visuais dependem de olhar, pausas e postura para indicar continuidade ou passagem de turno.","Observe quando o interlocutor está pronto para responder."],st:["Aniversário surpresa","Um grupo organiza uma festa sem revelar o plano à pessoa homenageada.","Descubra quem sabe do plano, o horário e a tarefa de cada um."],p:[
["Eventos","Vocabulário social.","festa","aniversário","parabéns","encontro","casamento","convite"],
["Pessoas","Participantes.","amigo","família","colega","namorado","namorada","todos"],
["Atividades","O que acontece.","comer","beber","dançar","cantar","conversar","tirar foto"],
["Organizar","Preparação.","horário","lugar","comprar","preparar","chegar","esperar"]]},
{n:27,c:7,t:"Viagem",m:"Planejar deslocamento, hospedagem e atividades de viagem.",th:["Sequência de planejamento","Viagens combinam tempo, localização, quantidade e decisões. Use o tema para integrar habilidades já aprendidas.","O objetivo é sustentar uma situação longa, não memorizar turismo."],st:["Primeira viagem sozinho","Uma pessoa organiza passagem, mala e hospedagem e precisa confirmar informações.","Recupere destino, transporte, horário e o que faltou na mala."],p:[
["Planejar viagem","Elementos centrais.","viagem","viajar","destino","mapa","turismo","passeio"],
["Transporte","Deslocamento longo.","avião","ônibus","trem","carro","passagem","embarque"],
["Hospedagem","Permanência.","hotel","pousada","quarto","reserva","chegar","sair"],
["Bagagem","Preparação.","mala","bagagem","passaporte","documento","roupa","esquecer"]]},
{n:28,c:7,t:"O plano mudou",m:"Relatar imprevistos, cancelar e reorganizar um plano.",th:["Negação e contraste","Negação pode combinar elementos manuais e não manuais, e seu alcance precisa ficar claro.","Compare uma simples resposta negativa com uma mudança de plano mais longa."],st:["A viagem que quase não aconteceu","Um problema com horário força o grupo a mudar transporte e hospedagem.","Explique o que deu errado e qual solução foi escolhida."],p:[
["Imprevisto","Nomear mudanças.","problema","atraso","cancelar","mudar","perder","acontecer"],
["Negação","Recusar ou negar.","não","nunca","não poder","não ter","errado","impossível"],
["Alternativas","Replanejar.","outra opção","depois","amanhã","esperar","escolher","resolver"],
["Resultado","Fechar o episódio.","conseguir","finalmente","chegar","certo","alívio","contar"]]},

{n:29,c:8,t:"Corpo humano",m:"Identificar regiões do corpo dentro de descrições funcionais.",th:["Localização corporal importa","Muitos sinais usam o corpo como ponto de articulação. Atenção à localização melhora produção e percepção.","Treine com precisão, não apenas reconhecendo a palavra."],st:["Onde dói?","Uma pessoa aponta e descreve diferentes regiões do corpo durante um atendimento.","Identifique a localização antes de focar no nome do sintoma."],p:[
["Cabeça e rosto","Regiões superiores.","cabeça","rosto","olho","nariz","boca","orelha"],
["Tronco","Regiões centrais.","pescoço","ombro","peito","barriga","costas","coração"],
["Braços e mãos","Membros superiores.","braço","cotovelo","mão","dedo","pulso","unha"],
["Pernas e pés","Membros inferiores.","perna","joelho","pé","tornozelo","andar","correr"]]},
{n:30,c:8,t:"Sintomas",m:"Descrever sintomas simples, intensidade e duração.",th:["Intensidade também é visual","Expressão, movimento e repetição podem contribuir para intensidade e duração.","Evite adicionar força aleatória: observe modelos reais."],st:["Desde ontem","Uma pessoa descreve sintomas que começaram em momentos diferentes.","Identifique qual sintoma começou primeiro e qual piorou."],p:[
["Mal-estar","Estados gerais.","doente","dor","febre","gripe","tosse","cansado"],
["Tempo do sintoma","Duração.","hoje","ontem","dias","começar","continuar","melhorar"],
["Intensidade","Graduação.","muito","pouco","forte","fraco","pior","melhor"],
["Cuidados","Primeiras ações.","remédio","descansar","água","dormir","farmácia","médico"]]},
{n:31,c:8,t:"Consulta médica",m:"Participar de uma consulta básica descrevendo problema e respondendo perguntas.",th:["Perguntas em contexto clínico","O atendimento exige precisão de tempo, localização e intensidade, além de confirmação de compreensão.","Treine respostas completas sem inventar terminologia que não domina."],st:["Na consulta","Profissional pergunta quando começou, onde dói e o que a pessoa já fez.","Organize sintomas, duração e orientação recebida."],p:[
["Atendimento","Pessoas e lugares.","médico","enfermeiro","paciente","consulta","hospital","clínica"],
["Histórico","Perguntas comuns.","quando","onde","quanto tempo","antes","remédio","alergia"],
["Tratamento","Orientações básicas.","tratamento","receita","exame","vacina","cirurgia","descansar"],
["Confirmar","Checar entendimento.","entender","repetir","explicar","certo","dúvida","obrigado"]]},
{n:32,c:8,t:"Emergência",m:"Pedir ajuda, indicar perigo e relatar rapidamente o que aconteceu.",th:["Priorize informação crítica","Em emergência, clareza e ordem das informações importam mais que riqueza lexical.","Quem, onde, o que aconteceu e qual ajuda é necessária formam um bom núcleo."],st:["O que aconteceu?","Uma testemunha precisa explicar rapidamente um acidente e chamar ajuda.","Identifique local, pessoas envolvidas e sequência do ocorrido."],p:[
["Pedir socorro","Ações críticas.","socorro","ajuda","urgente","perigo","cuidado","chamar"],
["Serviços","Quem pode ajudar.","ambulância","bombeiro","polícia","hospital","médico","segurança"],
["Acidente","Descrever ocorrência.","acidente","cair","bater","machucar","sangue","dor"],
["Relatar","Informação rápida.","onde","quem","acontecer","agora","esperar","chegar"]]},

{n:33,c:9,t:"Aprender e ensinar",m:"Falar sobre estudo, aula, dúvida e aprendizagem.",th:["Metalinguagem ajuda a aprender","Quando o aluno sabe perguntar sobre a própria língua, ganha autonomia para aprender com outras pessoas.","Use Libras para falar de Libras progressivamente."],st:["Primeira aula nova","Um aluno chega a uma turma, perde uma explicação e pede ajuda a um colega.","Identifique a dúvida e como ela foi resolvida."],p:[
["Ambiente de estudo","Pessoas e lugares.","escola","faculdade","curso","aula","aluno","professor"],
["Materiais","Objetos acadêmicos.","livro","caderno","caneta","lápis","atividade","prova"],
["Aprender","Processos.","estudar","aprender","ensinar","explicar","perguntar","responder"],
["Dificuldade","Autorregulação.","fácil","difícil","entender","dúvida","repetir","praticar"]]},
{n:34,c:9,t:"Trabalho",m:"Descrever profissão, função, rotina e responsabilidades.",th:["Do rótulo à função","Saber o nome de uma profissão é menos útil do que conseguir explicar o que a pessoa faz.","Priorize verbos, rotina e relações de trabalho."],st:["Um novo emprego","Uma personagem começa num trabalho e recebe tarefas diferentes durante o dia.","Resuma a função sem apenas repetir o nome da profissão."],p:[
["Profissões","Áreas frequentes.","professor","médico","motorista","vendedor","advogado","engenheiro"],
["Ambiente","Vocabulário profissional.","trabalho","empresa","escritório","chefe","colega","salário"],
["Tarefas","Ações gerais.","atender","escrever","ler","organizar","reunião","ajudar"],
["Rotina profissional","Descrever jornada.","começar","terminar","horário","almoço","cansado","voltar"]]},
{n:35,c:9,t:"Tecnologia",m:"Falar de dispositivos, comunicação digital e ações básicas.",th:["Novos conceitos e datilologia","Tecnologia produz nomes próprios e termos novos com frequência. Datilologia e contexto ajudam quando não há um sinal lexical conhecido.","Não invente um sinal porque uma palavra é nova."],st:["Mensagem que não chegou","Duas pessoas tentam descobrir por que uma mensagem não apareceu no celular.","Siga o diagnóstico e a solução escolhida."],p:[
["Dispositivos","Objetos digitais.","computador","notebook","celular","telefone","teclado","mouse"],
["Internet","Conectividade.","internet","wifi","site","aplicativo","email","senha"],
["Mídia","Conteúdo digital.","vídeo","foto","câmera","mensagem","youtube","jogo"],
["Ações","Uso cotidiano.","ligar","desligar","abrir","fechar","enviar","receber"]]},
{n:36,c:9,t:"Resolver um problema",m:"Explicar falha, seguir instruções e confirmar solução.",th:["Explicação procedural","Processos ficam claros quando passos têm ordem, referentes estáveis e condição de sucesso.","Aprenda a dizer o que tentou, o que mudou e o que ainda falha."],st:["O computador parou","Uma pessoa descreve um problema, recebe três instruções e testa uma solução.","Coloque as ações na ordem e diga qual resolveu."],p:[
["Diagnóstico","Nomear estado.","problema","erro","funcionar","não funcionar","ligar","desligar"],
["Instruções","Executar passos.","primeiro","depois","clicar","abrir","fechar","esperar"],
["Testar","Verificar resultado.","tentar","ver","certo","errado","melhor","igual"],
["Explicar solução","Relatar processo.","resolver","conseguir","ajudar","mostrar","explicar","finalmente"]]},

{n:37,c:10,t:"Forma e dimensão",m:"Descrever forma, tamanho e propriedades visuais.",th:["Descrição não é lista de adjetivos","Libras pode representar visualmente dimensões e formas por recursos espaciais e classificadores.","Observe modelos antes de transformar qualquer gesto em descrição linguística."],st:["Qual objeto é?","Uma pessoa descreve objetos sem nomeá-los diretamente.","Identifique cada objeto a partir de forma, tamanho e uso."],p:[
["Tamanho","Dimensões básicas.","grande","pequeno","alto","baixo","largo","fino"],
["Forma","Propriedades visuais.","redondo","quadrado","comprido","curto","reto","curvo"],
["Estado","Condição do objeto.","aberto","fechado","cheio","vazio","limpo","sujo"],
["Comparação","Contrastar propriedades.","mais","menos","igual","diferente","pesado","leve"]]},
{n:38,c:10,t:"Objetos no espaço",m:"Representar relação espacial entre objetos de uma cena.",th:["Mapeamento espacial","Uma boa descrição permite ao interlocutor reconstruir a cena no espaço mental.","Escolha um ponto de vista e preserve-o."],st:["Arrumando o quarto","Objetos mudam de lugar enquanto uma pessoa reorganiza o ambiente.","Reconstrua posição inicial e final de cada objeto."],p:[
["Superfícies","Relações de apoio.","mesa","cadeira","cama","chão","parede","prateleira"],
["Posições","Organização relativa.","em cima","embaixo","lado","entre","perto","longe"],
["Mover","Alterar localização.","colocar","tirar","levar","trazer","mover","guardar"],
["Descrever cena","Consolidar espaço.","aqui","ali","frente","atrás","direita","esquerda"]]},
{n:39,c:10,t:"Movimento e trajetória",m:"Descrever deslocamentos de pessoas, veículos e objetos.",th:["Trajetória pode carregar informação","Direção, percurso, velocidade e maneira podem ser representados visualmente.","Separe o que é sinal lexical do que é construção produtiva."],st:["No cruzamento","Dois veículos e uma pessoa percorrem trajetórias diferentes.","Represente o movimento sem perder a posição inicial dos elementos."],p:[
["Veículos","Entidades móveis.","carro","moto","ônibus","bicicleta","avião","barco"],
["Trajetória","Movimentos gerais.","ir","voltar","subir","descer","virar","parar"],
["Velocidade","Maneira.","rápido","devagar","acelerar","frear","correr","andar"],
["Percurso","Organizar caminho.","estrada","rua","ponte","esquina","entrada","saída"]]},
{n:40,c:10,t:"Classificadores I",m:"Introduzir construções classificadoras para entidade, forma, localização e movimento.",th:["Classificadores não são gestos inventados","Configurações e movimentos participam de convenções linguísticas. O aluno precisa aprender por uso real e comparação.","Nunca trate qualquer representação improvisada como automaticamente correta."],st:["Um acidente na rua","A cena exige representar veículos, pessoas, localização e trajetória.","Conte o ocorrido usando espaço consistente e recursos visuais apropriados."],p:[
["Entidades","Classes gerais para observação.","pessoa","carro","animal","objeto","grupo","lugar"],
["Localização","Relações visuais.","parado","em pé","sentado","deitado","perto","longe"],
["Movimento","Trajetórias de entidades.","andar","correr","cair","virar","entrar","sair"],
["Manipulação","Interação com objetos.","pegar","segurar","abrir","fechar","colocar","tirar"]]},

{n:41,c:11,t:"Sequência narrativa",m:"Contar acontecimentos em ordem compreensível.",th:["Narrativa precisa de arquitetura","Antes de sinalizar, estabeleça tempo, cenário, participantes e cadeia principal de eventos.","Conectores ajudam, mas coerência não depende apenas deles."],st:["Um encontro inesperado","Uma sequência simples ganha um evento surpresa no meio.","Reconte preservando preparação, ruptura e conclusão."],p:[
["Ordem","Marcar sequência.","primeiro","depois","então","antes","durante","finalmente"],
["Eventos","Ações narrativas.","acontecer","chegar","encontrar","ver","falar","sair"],
["Mudança","Viradas simples.","de repente","mudar","problema","surpresa","esperar","resolver"],
["Encerrar","Fechar relato.","fim","conseguir","voltar","lembrar","contar","rir"]]},
{n:42,c:11,t:"Personagens e perspectiva",m:"Manter personagens distintos e alternar ponto de vista com clareza.",th:["Mudança de papel exige controle","Corpo, olhar e orientação podem ajudar a representar participantes e perspectivas diferentes.","A mudança deve ser reconhecível e consistente."],st:["Duas versões","Duas personagens contam o mesmo acontecimento com focos diferentes.","Compare o que cada uma sabe e como a perspectiva muda."],p:[
["Personagens","Funções narrativas.","pessoa","amigo","desconhecido","família","colega","vizinho"],
["Perspectiva","Marcar ponto de vista.","ver","pensar","saber","não saber","lembrar","perceber"],
["Fala relatada","Interações.","perguntar","responder","contar","avisar","explicar","chamar"],
["Contraste","Comparar versões.","mesmo","diferente","verdade","erro","antes","depois"]]},
{n:43,c:11,t:"Mostrar em vez de explicar",m:"Usar corpo, espaço e ação construída para tornar narrativa visual.",th:["Ação construída","Narrativas podem incorporar postura, olhar e ação dos personagens de modo estruturado.","O objetivo não é teatralizar tudo, mas escolher recursos que acrescentem informação."],st:["A porta que não abria","Uma situação cotidiana depende mais de ação visual do que de vocabulário abstrato.","Mostre tentativas, reação e solução sem narrar cada microação com palavras."],p:[
["Ações físicas","Verbos concretos.","abrir","fechar","empurrar","puxar","segurar","soltar"],
["Reações","Resposta corporal.","surpresa","medo","raiva","rir","cansado","alívio"],
["Tentativas","Progressão.","tentar","de novo","não conseguir","força","devagar","rápido"],
["Resultado","Fechar ação.","conseguir","quebrar","chamar","ajudar","resolver","fim"]]},
{n:44,c:11,t:"Narrativa em Libras I",m:"Produzir relatos de 1 a 2 minutos com cenário, referentes, acontecimentos e conclusão.",th:["Revisão narrativa","Fluência narrativa combina coesão, espaço, perspectiva, expressão e seleção lexical.","Grave, reveja e procure ambiguidades antes de buscar velocidade."],st:["A história completa","O aluno recebe um cenário, personagens e um problema, mas precisa construir a narrativa.","Mantenha referentes, tempo e conclusão claros durante toda a produção."],p:[
["Abrir história","Estabelecer contexto.","quando","onde","pessoa","dia","lugar","começar"],
["Criar problema","Introduzir conflito.","problema","perder","esquecer","atrasar","procurar","preocupar"],
["Desenvolver","Construir tentativa.","tentar","pedir ajuda","encontrar","explicar","esperar","mudar"],
["Concluir","Resolver e refletir.","resolver","finalmente","feliz","alívio","lembrar","contar"]]},

{n:45,c:12,t:"Como eu me sinto",m:"Expressar emoções e explicar o que as provoca.",th:["Expressão facial tem função linguística e afetiva","Nem toda expressão é apenas emoção; marcas não manuais também participam da gramática.","Aprenda a distinguir função linguística do conteúdo emocional da cena."],st:["Uma notícia inesperada","A mesma notícia provoca reações diferentes em três pessoas.","Identifique emoção e motivo sem depender de legenda."],p:[
["Emoções positivas","Estados agradáveis.","feliz","amor","orgulho","calmo","animado","alívio"],
["Emoções difíceis","Estados desconfortáveis.","triste","raiva","medo","vergonha","nervoso","preocupado"],
["Relação com causa","Explicar motivo.","porque","acontecer","pensar","lembrar","esperar","receber"],
["Mudança emocional","Transição.","antes","depois","melhor","pior","surpresa","tranquilo"]]},
{n:46,c:12,t:"Preferência e opinião",m:"Dizer o que prefere, comparar opções e justificar escolha.",th:["Opinião precisa de apoio","Uma opinião comunicativa não termina em GOSTAR ou NÃO GOSTAR. O próximo passo é explicar razão, condição ou experiência.","Use exemplos concretos antes de temas abstratos."],st:["Qual é melhor?","Duas pessoas defendem escolhas diferentes para um passeio.","Recupere argumento principal de cada pessoa."],p:[
["Preferência","Expressar gosto.","gostar","não gostar","preferir","querer","favorito","escolher"],
["Avaliar","Julgar opção.","bom","ruim","melhor","pior","fácil","difícil"],
["Comparar","Contrastar.","mais","menos","igual","diferente","caro","barato"],
["Justificar","Dar razão.","porque","por isso","experiência","pensar","achar","depender"]]},
{n:47,c:12,t:"Concordar e discordar",m:"Concordar, discordar e sustentar uma posição sem encerrar a conversa.",th:["Discordância é interação","Discordar inclui reconhecer o ponto anterior, marcar contraste e oferecer razão ou alternativa.","Pratique intensidade e registro para não reduzir tudo a SIM/NÃO."],st:["Dois planos para o mesmo problema","Duas pessoas propõem soluções e precisam chegar a acordo.","Identifique pontos de concordância e onde ainda existe divergência."],p:[
["Concordância","Apoiar ideia.","concordar","sim","certo","também","mesmo","boa ideia"],
["Discordância","Marcar contraste.","discordar","não","mas","diferente","não acho","problema"],
["Argumentar","Sustentar ponto.","porque","exemplo","resultado","melhor","pior","importante"],
["Negociar","Construir acordo.","talvez","depende","alternativa","combinar","decidir","aceitar"]]},
{n:48,c:12,t:"Conversas difíceis",m:"Lidar com mal-entendido, pedido de desculpas, correção e negociação.",th:["Pragmática e relação","A forma de corrigir ou recusar depende de relação, contexto e objetivo da interação.","Treine clareza sem transformar um único jeito de dizer em regra universal."],st:["Foi isso que você entendeu?","Um mal-entendido cresce porque duas pessoas interpretam uma informação de modos diferentes.","Localize a origem do problema e reformule a mensagem."],p:[
["Mal-entendido","Reconhecer falha.","entender errado","confusão","pensar","achar","dizer","ouvir"],
["Corrigir","Reformular.","não","quer dizer","explicar","repetir","corrigir","agora"],
["Reparar relação","Reduzir tensão.","desculpa","calma","respeito","entender","obrigado","tudo bem"],
["Negociar saída","Chegar a solução.","combinar","aceitar","mudar","resolver","depois","fim"]]},

{n:49,c:13,t:"Velocidade natural",m:"Aumentar compreensão sem exigir que todo sinal seja reconhecido isoladamente.",th:["Compreensão não é legenda mental","Sinalização natural envolve redução, coarticulação, antecipação e contexto. Tentar nomear cada sinal pode atrasar a compreensão.","Treine captar ideia, participantes e eventos antes dos detalhes."],st:["Uma conversa sem pausa didática","O conteúdo usa vocabulário conhecido em ritmo menos controlado.","Primeiro resuma o tema; só depois procure detalhes específicos."],p:[
["Ideia principal","Focar sentido global.","tema","assunto","pessoa","acontecer","lugar","tempo"],
["Pistas contextuais","Usar informação parcial.","quem","onde","quando","porque","depois","resultado"],
["Ritmo","Perceber fluxo.","rápido","devagar","pausa","continuar","repetir","entender"],
["Recuperação","Lidar com lacunas.","não entender","inferir","contexto","lembrar","confirmar","perguntar"]]},
{n:50,c:13,t:"Sinalizantes diferentes",m:"Adaptar compreensão a diferenças individuais e variação linguística.",th:["Variação faz parte da língua","Região, geração, grupo, estilo e contexto podem influenciar formas. Diferença não significa automaticamente erro.","O curso mantém um núcleo principal, mas o aluno avançado precisa reconhecer que a Libras real não é uniforme."],st:["Três pessoas, um assunto","Pessoas diferentes falam do mesmo tema com ritmo e escolhas distintas.","Compare estratégias de compreensão sem classificar automaticamente uma forma como errada."],p:[
["Diferença","Falar sobre variação.","igual","diferente","variação","região","pessoa","grupo"],
["Estilo","Características de produção.","rápido","devagar","formal","informal","claro","difícil"],
["Estratégias","Continuar entendendo.","contexto","perguntar","repetir","confirmar","comparar","aprender"],
["Comunidade","Situar língua.","surdo","comunidade","Libras","cultura","experiência","identidade"]]},
{n:51,c:13,t:"Conversa espontânea",m:"Entrar numa interação sem saber exatamente quais perguntas virão.",th:["Improviso com ferramentas conhecidas","Espontaneidade não é ausência de estrutura. O aluno usa reparação, contexto, inferência e repertório para manter a conversa.","Avalie continuidade e clareza, não perfeição."],st:["Descubra o objetivo","O aluno entra numa situação sem receber antecipadamente toda a informação.","Faça perguntas suficientes para entender o problema e encaminhar a conversa."],p:[
["Abrir tema","Descobrir contexto.","o que","quem","onde","quando","como","porque"],
["Explorar","Pedir detalhes.","mais","exemplo","explicar","mostrar","qual","quanto"],
["Reparar","Sobreviver à lacuna.","repetir","devagar","não entendi","quer dizer","confirmar","certo"],
["Encaminhar","Levar a conversa adiante.","então","depois","decidir","ajudar","resolver","combinar"]]},
{n:52,c:13,t:"Compreensão visual complexa",m:"Interpretar cenas com múltiplos referentes, movimento e informação simultânea.",th:["Informação pode ser simultânea","Mãos, rosto, corpo e espaço podem carregar camadas ao mesmo tempo. A análise linear do português nem sempre captura isso.","Treine observar relações antes de decompor em palavras."],st:["A cena movimentada","Várias pessoas e objetos se deslocam e interagem num mesmo espaço narrativo.","Desenhe mentalmente a cena e responda quem estava onde e o que mudou."],p:[
["Cenário","Elementos espaciais.","frente","atrás","lado","entre","perto","longe"],
["Participantes","Múltiplos referentes.","pessoa","grupo","criança","adulto","carro","animal"],
["Mudança","Movimento simultâneo.","entrar","sair","cruzar","cair","parar","continuar"],
["Resultado","Estado final.","ficar","chegar","mudar","posição","encontrar","resolver"]]},

{n:53,c:14,t:"Aspecto e intensidade",m:"Perceber e produzir diferenças de duração, frequência e maneira de uma ação.",th:["A forma da ação importa","Repetição, duração, amplitude e expressão podem contribuir para aspecto e intensidade conforme a construção.","Observe padrões de uso real e não aplique uma fórmula mecânica."],st:["A mesma ação, quatro maneiras","A narrativa contrasta ações rápidas, prolongadas, repetidas e intensas.","Explique a diferença de sentido sem depender de quatro advérbios em português."],p:[
["Frequência","Repetição temporal.","sempre","nunca","às vezes","muitas vezes","de novo","frequente"],
["Duração","Tempo da ação.","rápido","devagar","demorar","continuar","parar","tempo"],
["Intensidade","Grau.","muito","pouco","forte","fraco","mais","menos"],
["Maneira","Como ocorre.","calmo","nervoso","cuidado","pressa","fácil","difícil"]]},
{n:54,c:14,t:"Narrativa em Libras II",m:"Produzir relatos de 3 a 5 minutos com perspectiva, ação construída e coesão.",th:["Narrativa longa precisa de gerenciamento","Quanto maior a história, mais importante é reativar referentes, controlar tempo e sinalizar mudanças de cena.","Planeje blocos narrativos em vez de memorizar frases."],st:["Três cenas, um conflito","Uma história passa por três lugares e envolve versões diferentes do mesmo problema.","Produza uma narrativa com transições claras entre cenas."],p:[
["Cena 1","Estabelecer contexto.","lugar","tempo","pessoa","objetivo","começar","acontecer"],
["Cena 2","Desenvolver conflito.","problema","tentar","mudar","encontrar","perguntar","descobrir"],
["Cena 3","Resolver.","explicar","decidir","ajudar","resolver","voltar","finalmente"],
["Reflexão","Fechar narrativa.","pensar","aprender","lembrar","opinião","sentir","fim"]]},
{n:55,c:14,t:"Discurso abstrato",m:"Falar sobre conceitos que não estão presentes fisicamente no ambiente.",th:["Do concreto ao abstrato","Temas abstratos exigem definição, exemplo, comparação e retomada conceitual.","Estabeleça o conceito antes de desenvolver argumentos longos."],st:["Uma ideia em debate","Duas pessoas discutem um tema social de modo respeitoso e dão exemplos.","Resuma cada posição sem copiar frases."],p:[
["Conceitos","Vocabulário discursivo.","ideia","conceito","opinião","experiência","sociedade","cultura"],
["Avaliação","Analisar tema.","importante","necessário","possível","difícil","melhor","problema"],
["Exemplificar","Tornar concreto.","exemplo","situação","pessoa","acontecer","resultado","comparar"],
["Retomar","Manter tópico.","assunto","isso","mesmo","outro","então","conclusão"]]},
{n:56,c:14,t:"Causa, hipótese e argumento",m:"Explicar relações de causa, consequência, condição e possibilidade.",th:["Relações lógicas precisam ficar visíveis","Uma argumentação clara mostra como uma ideia leva à outra e quais partes são fato, possibilidade ou condição.","Use exemplos e contraste para verificar compreensão."],st:["E se acontecer?", "Uma decisão depende de duas condições e produz consequências diferentes.","Mapeie condição, consequência e alternativa."],p:[
["Causa","Explicar motivo.","porque","causa","motivo","acontecer","resultado","por isso"],
["Condição","Falar de hipótese.","se","talvez","possível","depende","caso","escolher"],
["Consequência","Projetar resultado.","então","depois","resultado","mudar","melhor","pior"],
["Argumento","Construir raciocínio.","opinião","exemplo","comparar","concordar","discordar","concluir"]]},

{n:57,c:15,t:"Explicar procedimentos",m:"Ensinar um processo complexo em etapas claras.",th:["Procedimento é uma narrativa orientada a objetivo","Uma explicação boa apresenta pré-requisitos, sequência, pontos de decisão e resultado esperado.","Teste a explicação pedindo que outra pessoa reconstrua o processo."],st:["Ensine sem demonstrar tudo","O aluno precisa explicar uma tarefa para alguém que não conhece o processo.","Organize etapas e critérios de sucesso."],p:[
["Preparar","Definir pré-requisitos.","precisar","material","antes","preparar","verificar","começar"],
["Sequenciar","Ordenar etapas.","primeiro","segundo","depois","então","enquanto","finalmente"],
["Condição","Lidar com exceção.","se","problema","parar","tentar","mudar","continuar"],
["Concluir","Checar resultado.","pronto","funcionar","certo","resultado","confirmar","explicar"]]},
{n:58,c:15,t:"Pragmática e registro",m:"Adaptar clareza, formalidade e estratégia ao contexto e ao interlocutor.",th:["Não existe uma única forma apropriada para toda situação","Relação entre pessoas, ambiente e objetivo influenciam escolhas de linguagem.","Aprenda a observar usos reais e justificar adequação pelo contexto."],st:["Mesma intenção, três contextos","Um pedido semelhante ocorre entre amigos, em atendimento e numa situação formal.","Compare como a interação muda sem transformar estilos em caricaturas."],p:[
["Contexto","Ler situação.","formal","informal","trabalho","amigo","atendimento","grupo"],
["Pedido","Regular abordagem.","pedir","por favor","precisar","poder","ajudar","obrigado"],
["Correção","Ajustar interação.","desculpa","corrigir","explicar","repetir","respeito","calma"],
["Adequação","Escolher estratégia.","contexto","depende","melhor","claro","direto","cuidado"]]},
{n:59,c:15,t:"Conversa em grupo",m:"Acompanhar turnos, mudanças de interlocutor e referências em interação com várias pessoas.",th:["Grupo muda a ecologia visual","Atenção, posicionamento, olhar e turnos ficam mais complexos com vários participantes.","Treine entrar, sair e retomar uma conversa sem perder o tópico."],st:["Quatro pessoas, uma decisão","Um grupo discute opções, interrompe, retoma e chega a uma decisão.","Rastreie quem propôs cada ideia e como o grupo convergiu."],p:[
["Turnos","Gerenciar participação.","falar","esperar","continuar","interromper","responder","perguntar"],
["Atenção","Direcionar foco.","olhar","chamar","grupo","todos","pessoa","atenção"],
["Retomada","Voltar ao tópico.","assunto","antes","você disse","lembrar","continuar","então"],
["Decisão coletiva","Fechar discussão.","concordar","discordar","votar","escolher","combinar","decidir"]]},
{n:60,c:15,t:"Capstone: autonomia em Libras",m:"Integrar compreensão, produção, narrativa, interação e estratégias para continuar aprendendo fora do curso.",th:["O curso termina, a língua não","Autonomia significa participar de interações reais, reconhecer limites, buscar modelos confiáveis e continuar aprendendo com a comunidade e com materiais autênticos.","O objetivo final não é perfeição, mas comunicação avançada, consciente e sustentável."],st:["Do zero à autonomia","O aluno revisita situações do início do curso agora em versões mais rápidas, longas e imprevisíveis.","Compare sua produção atual com uma gravação antiga e defina próximos objetivos."],p:[
["Autonomia","Gerenciar aprendizagem.","aprender","praticar","revisar","dúvida","pesquisar","comparar"],
["Interação real","Sustentar conversa.","conversar","perguntar","responder","reformular","explicar","entender"],
["Comunidade","Continuar conectado.","surdo","comunidade","cultura","Libras","respeito","participar"],
["Próximos passos","Planejar desenvolvimento.","objetivo","melhorar","continuar","experiência","fluência","futuro"]]}
];

const EXPANSION={
1:["saudação","cumprimento","bem-vindo","bem-vinda","até amanhã","até depois","desculpar","gentileza"],
2:["sobrenome","apelido","idade","nascimento","brasileiro","endereço","estado","país"],
3:["dúvida","atenção","lento","calma","compreender","exemplo","confirmar","informação"],
4:["conversa","pergunta","resposta","informação","confirmar","começar","terminar","comunicar"],
5:["mamãe","papai","cunhado","cunhada","sogro","sogra","padrasto","madrasta"],
6:["conhecido","desconhecido","parente","chefe","cliente","atendente","visitante","grupo"],
7:["barba","bigode","loiro","moreno","careca","magro","gordo","jovem"],
8:["terceiro","quarto","perto","longe","direita","esquerda","frente","atrás"],
9:["pente","escova","roupa","sapato","meia","pressa","relógio","atraso"],
10:["seis","sete","oito","nove","onze","doze","meia-noite","relógio"],
11:["janeiro","fevereiro","março","abril","maio","junho","julho","agosto"],
12:["metrô","trânsito","reunião","jantar","passeio","exercício","descanso","compromisso"],
13:["apartamento","varanda","quintal","corredor","lavanderia","escritório","televisão","microondas"],
14:["acima","abaixo","ao lado","centro","canto","esquerda","direita","distância"],
15:["banana","maçã","laranja","bolo","biscoito","macarrão","refrigerante","fruta"],
16:["colher","garfo","faca","forno","tempero","cebola","alho","legume"],
17:["igreja","teatro","museu","padaria","correio","delegacia","academia","biblioteca"],
18:["mapa","avenida","ponte","túnel","ponto","metrô","atravessar","seguir"],
19:["desconto","promoção","parcela","moeda","caixa","recibo","nota","troco"],
20:["cadastro","formulário","protocolo","assinatura","identidade","cpf","comprovante","carteira"],
21:["este","aquele","primeiro","segundo","terceiro","outro","mesmo","diferente"],
22:["mandar","buscar","trazer","levar","trocar","oferecer","aceitar","recusar"],
23:["agradecer","ensinar","indicar","oferecer","pedir","telefonar","enviar","convidar"],
24:["mochila","carteira","livro","copo","controle","carregador","fone","chave"],
25:["próxima semana","próximo mês","férias","horário","livre","ocupado","disponível","agenda"],
26:["presente","música","bolo","decoração","convidado","surpresa","salão","reunião"],
27:["turismo","turista","reserva","hospedagem","desembarque","fronteira","rodoviária","aeroporto"],
28:["voo","remarcar","atraso","cancelado","lotado","disponível","alternativa","solução"],
29:["garganta","dente","língua","ombro","cintura","quadril","tornozelo","pele"],
30:["enjoo","vômito","tontura","alergia","inflamação","dor de cabeça","pressão","fraqueza"],
31:["receita","exame","retorno","diagnóstico","cirurgia","emergência","especialista","saúde"],
32:["desmaiar","quebrar","ferimento","queimadura","fogo","fumaça","urgente","perigo"],
33:["disciplina","matéria","nota","pesquisa","grupo","apresentação","biblioteca","tarefa"],
34:["profissão","emprego","currículo","entrevista","salário","férias","reunião","cliente"],
35:["arquivo","pasta","baixar","instalar","atualizar","carregar","bateria","tela"],
36:["reiniciar","configurar","conexão","senha","atualização","suporte","teste","solução"],
37:["oval","triângulo","grosso","profundo","raso","longo","estreito","altura"],
38:["centro","canto","distância","fileira","coluna","pilha","posição","organizar"],
39:["aproximar","afastar","cruzar","ultrapassar","seguir","retornar","trajeto","curva"],
40:["entidade","instrumento","superfície","forma","tamanho","movimento","localização","trajetória"],
41:["início","meio","fim","enquanto","de repente","sequência","evento","conclusão"],
42:["personagem","perspectiva","imaginar","perceber","observar","versão","memória","narrador"],
43:["agir","reagir","empurrar","puxar","tentar","conseguir","reação","movimento"],
44:["introdução","desenvolvimento","conflito","solução","conclusão","narrador","cena","sequência"],
45:["alegria","tristeza","ansiedade","ciúme","saudade","vergonha","esperança","medo"],
46:["opinião","escolha","preferência","vantagem","desvantagem","motivo","razão","exemplo"],
47:["argumento","acordo","desacordo","sugestão","alternativa","negociar","decisão","respeito"],
48:["mal-entendido","engano","intenção","paciência","perdão","reformular","negociar","solução"],
49:["contexto","detalhe","ideia geral","assunto","tema","velocidade","ritmo","pausa"],
50:["região","geração","estilo","contexto","hábito","comunidade","identidade","variação"],
51:["espontâneo","surpresa","dúvida","confirmar","reformular","continuar","inferir","contexto"],
52:["simultâneo","posição","trajetória","referência","espaço","mudança","direção","relação"],
53:["frequência","duração","repetição","intensidade","contínuo","maneira","ritmo","intervalo"],
54:["narrador","personagem","cenário","conflito","clímax","conclusão","perspectiva","transição"],
55:["educação","tecnologia","acessibilidade","sociedade","direito","cultura","comunidade","inclusão"],
56:["causa","consequência","condição","hipótese","possibilidade","resultado","motivo","decisão"],
57:["etapa","instrução","material","ferramenta","procedimento","processo","resultado","verificar"],
58:["formal","informal","respeito","contexto","relação","atendimento","reunião","desconhecido"],
59:["grupo","turno","atenção","interrupção","opinião","votação","consenso","decisão"],
60:["autonomia","fluência","objetivo","prática","comunidade","cultura","experiência","progresso"]
};

const KINDS={
signals:["👐","Aprender"],
integration:["🎯","Aplicar"],
review:["🔁","Revisar"]
};
function slug(s){return String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
function uniq(a){return [...new Set((a||[]).filter(Boolean))]}
function cycleOf(id){return CYCLES.find(x=>x.id===id)}
function flatSigns(u){return uniq(u.p.flatMap(x=>x.slice(2)))}
function lesson(id,unit,kind,order,title,summary,extra={}){
  const k=KINDS[kind]||KINDS.signals;
  return {id,unit:unit.n,cycle:unit.c,module:unit.t,kind,icon:k[0],level:k[1],order,title,summary,...extra};
}
function spacedCycleReview(unit){
  const members=U.filter(x=>x.c===unit.c&&x.n<=unit.n),picked=[];
  for(const u of members){
    const blocks=u.p||[];
    const candidates=[
      blocks[0]?.[2],blocks[1]?.[3],blocks[2]?.[4],blocks[3]?.[2]
    ].filter(Boolean);
    for(const s of candidates)if(!picked.some(x=>slug(x)===slug(s)))picked.push(s);
  }
  return picked.slice(0,12);
}
const content=[];
for(const unit of U){
  const all=flatSigns(unit);
  unit.p.forEach((p,i)=>{
    const signs=uniq(p.slice(2)),micro=i===1?{
      title:unit.th[0],
      text:unit.th[1],
      observe:unit.th[2]
    }:null;
    content.push(lesson("u"+unit.n+"-p"+(i+1),unit,"signals",i+1,p[0],p[1],{
      signs,
      expansion:(EXPANSION[unit.n]||[]).slice(i*2,i*2+2),
      microtheory:micro,
      context:i===0?unit.st[1]:p[1],
      questions:i===0?[unit.st[2]]:[],
      practice:"Aprenda este conjunto e use pelo menos dois sinais numa situação curta ligada a "+unit.t+".",
      take:[
        "Observe o sinal inteiro antes de responder.",
        "Reconheça o significado pelo vídeo.",
        "Produza sem olhar o modelo e só depois confira."
      ]
    }));
  });

  const integrationSigns=uniq(unit.p.flatMap(p=>p.slice(2,4))).slice(0,8);
  content.push(lesson("u"+unit.n+"-integrate",unit,"integration",5,"Missão: "+unit.t,unit.m,{
    signs:integrationSigns,
    scene:unit.st[1],
    challenge:unit.m,
    questions:[unit.st[2]],
    practice:"Resolva a missão usando o que acabou de aprender. Não precisa repetir todos os sinais da unidade.",
    take:[
      "Priorize a intenção comunicativa.",
      "Use somente os sinais necessários.",
      "Se travar, reformule em vez de reiniciar tudo."
    ]
  }));

  const cycleUnits=U.filter(x=>x.c===unit.c);
  const isCycleEnd=unit.n===Math.max(...cycleUnits.map(x=>x.n));
  if(isCycleEnd){
    const reviewSigns=spacedCycleReview(unit);
    content.push(lesson("c"+unit.c+"-review",unit,"review",6,"Revisão da Etapa "+unit.c,"Recupere pontos importantes das unidades anteriores sem refazer as mesmas aulas.",{
      signs:reviewSigns,
      challenge:"Reconheça e produza uma amostra do conteúdo da Etapa "+unit.c+".",
      questions:["O que você ainda reconhece sem ajuda?","Quais sinais precisam voltar para a sua revisão?"],
      practice:"Faça uma rodada curta. O objetivo é recuperar memória, não reaprender tudo do zero.",
      take:[
        "A revisão mistura unidades diferentes.",
        "Errou? Salve o sinal na Biblioteca para revisar depois.",
        "Acertou com facilidade? Siga em frente."
      ]
    }));
  }
}
window.LIBRAS_STUDY_CYCLES=CYCLES;
window.LIBRAS_STUDY_UNITS=U.map(u=>({id:u.n,cycle:u.c,title:u.t,subtitle:u.m,mission:u.m,band:cycleOf(u.c).range,icon:"👐"}));
window.LIBRAS_STUDY_CONTENT=content.sort((a,b)=>a.unit-b.unit||a.order-b.order);
window.LIBRAS_STUDY_KIND_META=KINDS;
window.LIBRAS_STUDY_STATS={
  cycles:CYCLES.length,
  units:U.length,
  lessons:content.length,
  newContentLessons:content.filter(x=>x.kind==="signals").length,
  integrationLessons:content.filter(x=>x.kind==="integration").length,
  spacedReviews:content.filter(x=>x.kind==="review").length,
  microtheory:content.filter(x=>x.microtheory).length,
  signalSlots:content.reduce((n,x)=>n+(x.signs?.length||0),0),
  uniqueSigns:new Set(content.flatMap(x=>x.signs||[]).map(slug)).size,
  expansionSlots:content.reduce((n,x)=>n+(x.expansion?.length||0),0),
  uniqueExpansion:new Set(content.flatMap(x=>x.expansion||[]).map(slug)).size,
  totalSequencedUnique:new Set(content.flatMap(x=>[...(x.signs||[]),...(x.expansion||[])]).map(slug)).size
};
})();