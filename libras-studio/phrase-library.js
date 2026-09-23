(()=>{"use strict";
const TOTAL=50000,PER_CATEGORY=5000;
const contexts=["agora","hoje","amanhã","pela manhã","à tarde","à noite","esta semana","no fim de semana","aqui","aqui perto","mais tarde","daqui a pouco","quando puder","se possível","por favor","com calma","antes de sair","depois do almoço","quando chegar","quando tiver tempo"];
const groups=[
{name:"Cotidiano",stems:["Eu quero {x}","Eu preciso de {x}","Você tem {x}","Onde encontro {x}","Pode me mostrar {x}","Estou procurando {x}","Quero saber sobre {x}","Preciso encontrar {x}","Você sabe onde está {x}","Podemos falar sobre {x}"],items:["uma informação","ajuda","um lugar tranquilo","um telefone","um carregador","uma tomada","internet","um banheiro","um copo de água","um documento","uma caneta","uma bolsa","uma mochila","uma chave","um endereço","uma resposta","um contato","um aplicativo","uma foto","um vídeo","um mapa","uma explicação","um exemplo","uma opção","uma solução"]},
{name:"Família e pessoas",stems:["Quero falar com {x}","Preciso encontrar {x}","Você conhece {x}","Onde está {x}","Pode chamar {x}","Estou esperando {x}","Quero apresentar {x}","Preciso avisar {x}","Você viu {x}","Podemos conversar com {x}"],items:["minha mãe","meu pai","minha irmã","meu irmão","minha avó","meu avô","minha tia","meu tio","minha prima","meu primo","minha filha","meu filho","minha esposa","meu marido","minha amiga","meu amigo","a professora","o professor","a médica","o médico","a atendente","o atendente","a intérprete","o motorista","a pessoa responsável"]},
{name:"Casa",stems:["Preciso arrumar {x}","Quero limpar {x}","Você pode abrir {x}","Você pode fechar {x}","Onde fica {x}","Preciso usar {x}","Quero trocar {x}","Pode verificar {x}","Vamos organizar {x}","Tem algum problema com {x}"],items:["a porta","a janela","a cozinha","o quarto","a sala","o banheiro","a varanda","a geladeira","o fogão","o micro-ondas","a televisão","a mesa","a cadeira","o sofá","a cama","o armário","a torneira","o chuveiro","a lâmpada","a tomada","a chave","a fechadura","a máquina de lavar","o ventilador","o ar-condicionado"]},
{name:"Alimentação",stems:["Eu quero {x}","Eu gosto de {x}","Eu não quero {x}","Tem {x}","Onde posso comprar {x}","Pode trazer {x}","Quero pedir {x}","Quero experimentar {x}","Você quer {x}","Vamos pedir {x}"],items:["água","café","chá","suco","leite","pão","arroz","feijão","carne","frango","peixe","salada","sopa","macarrão","pizza","sanduíche","bolo","fruta","banana","maçã","laranja","açúcar","sal","sobremesa","o almoço"]},
{name:"Estudo e trabalho",stems:["Preciso de {x}","Quero revisar {x}","Pode me mostrar {x}","Onde está {x}","Quero usar {x}","Preciso conferir {x}","Quero organizar {x}","Pode enviar {x}","Vamos conversar sobre {x}","Quero saber mais sobre {x}"],items:["a atividade","a aula","o exercício","o caderno","o livro","a prova","o trabalho","o relatório","o arquivo","o documento","a planilha","a apresentação","o computador","o teclado","o mouse","a impressora","o projeto","a reunião","o prazo","o horário","a tarefa","a resposta","a pesquisa","o conteúdo","o material"]},
{name:"Cidade e transporte",stems:["Quero ir para {x}","Como chego até {x}","Onde fica {x}","Preciso encontrar {x}","Você sabe onde é {x}","Pode me levar até {x}","Qual caminho vai para {x}","Estou indo para {x}","Vamos até {x}","Quanto tempo leva até {x}"],items:["o centro","a rodoviária","o aeroporto","a estação","o ponto de ônibus","o metrô","a praça","o shopping","o mercado","a farmácia","o hospital","a escola","a universidade","o banco","a prefeitura","o restaurante","o hotel","a praia","o parque","o museu","a biblioteca","a igreja","o trabalho","minha casa","a avenida principal"]},
{name:"Saúde e bem-estar",stems:["Preciso de ajuda com {x}","Quero falar sobre {x}","Estou preocupado com {x}","Pode me orientar sobre {x}","Preciso verificar {x}","Quero entender melhor {x}","Tenho uma dúvida sobre {x}","Preciso cuidar de {x}","Quero uma orientação sobre {x}","Podemos conversar sobre {x}"],items:["uma dor de cabeça","uma dor nas costas","uma dor no braço","uma dor na perna","uma dor de garganta","uma consulta","um exame","um remédio","uma receita","minha pressão","minha alimentação","meu sono","meu cansaço","meu estresse","minha respiração","uma alergia","uma febre","uma tontura","um machucado","uma vacina","meu tratamento","minha recuperação","uma emergência","minha saúde","meu bem-estar"]},
{name:"Compras e serviços",stems:["Quero saber mais sobre {x}","Quero comprar {x}","Preciso de ajuda com {x}","Onde encontro {x}","Tem desconto em {x}","Quero verificar {x}","Quero comparar {x}","Pode me mostrar {x}","Preciso de informação sobre {x}","Tenho uma dúvida sobre {x}"],items:["este produto","esta roupa","este sapato","esta bolsa","este celular","este computador","este livro","este presente","este pedido","esta compra","a entrega","a garantia","a nota fiscal","o pagamento","o cartão","o dinheiro","o desconto","o tamanho","a cor","o modelo","o atendimento","o orçamento","o serviço","a assinatura","a encomenda"]},
{name:"Tempo e agenda",stems:["Quero confirmar {x}","Preciso mudar {x}","Qual é {x}","Pode verificar {x}","Quero marcar {x}","Preciso cancelar {x}","Vamos combinar {x}","Quero lembrar {x}","Pode anotar {x}","Preciso organizar {x}"],items:["o horário","a data","a reunião","a consulta","a aula","o compromisso","a viagem","a entrega","o prazo","o evento","o aniversário","a entrevista","a prova","a visita","o encontro","a reserva","o atendimento","a chamada","a apresentação","a tarefa","o treino","o almoço","o jantar","a saída","o retorno"]},
{name:"Conversação",stems:["Quero falar sobre {x}","O que você acha sobre {x}","Você entende {x}","Pode explicar {x}","Quero saber mais sobre {x}","Vamos conversar sobre {x}","Eu penso em {x}","Tenho uma dúvida sobre {x}","Você lembra de {x}","Quero contar sobre {x}"],items:["essa ideia","essa notícia","essa história","esse assunto","esse problema","essa situação","essa pergunta","essa resposta","essa decisão","essa mudança","esse plano","esse projeto","essa experiência","essa viagem","essa pessoa","esse lugar","esse trabalho","essa aula","essa conversa","essa opinião","esse exemplo","esse vídeo","essa foto","esse livro","esse acontecimento"]}
];
const nq=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
function compose(base,ctx,question){
  let text=base+" "+ctx;
  return text.replace(/\s+/g," ").trim()+(question?"?":".")
}
function get(index){
  index=Math.max(0,Math.min(TOTAL-1,Number(index)||0));
  const gi=Math.floor(index/PER_CATEGORY),r=index%PER_CATEGORY,g=groups[gi];
  const si=Math.floor(r/(25*20)),r2=r%(25*20),ii=Math.floor(r2/20),ci=r2%20;
  const stem=g.stems[si],item=g.items[ii],question=/^(Você|Onde|Como|Qual|Pode|Tem|Posso|Quanto|O que)/.test(stem);
  return{index,text:compose(stem.replace("{x}",item),contexts[ci],question),category:g.name,source:"VLibras automático",kind:"generated"}
}
function page(offset=0,limit=60,category=""){
  offset=Math.max(0,Number(offset)||0);limit=Math.max(1,Math.min(120,Number(limit)||60));
  const out=[];for(let i=offset;i<TOTAL&&out.length<limit;i++){let p=get(i);if(!category||p.category===category)out.push(p)}return out
}
function search(query,limit=40){
  const q=nq(query);if(!q)return page(0,limit);
  const tokens=q.split(" ").filter(Boolean),out=[];
  for(let i=0;i<TOTAL&&out.length<limit;i++){let p=get(i),hay=nq(p.text+" "+p.category);if(tokens.every(t=>hay.includes(t)))out.push(p)}
  return out
}
function exact(query){let q=nq(query);if(!q)return null;for(let i=0;i<TOTAL;i++){let p=get(i);if(nq(p.text)===q)return p}return null}
window.LIBRAS_PHRASE_LIBRARY={total:TOTAL,categories:groups.map(g=>g.name),get,page,search,exact};
})();