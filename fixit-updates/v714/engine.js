/* Fix It! 0.8 — game rules, curated opening levels and reproducible campaign. */
(function(root, factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.FixEngine=api;})(typeof globalThis==='object'?globalThis:this,()=>{
'use strict';
const D=[[0,-1],[1,0],[0,1],[-1,0]],MAX_LEVEL=180,LEVELS_PER_PLACE=12;
const names=['Casa da Dona Lia','Padaria do Nino','Praça das Fontes','Escola Aurora','Café da Marisa','Hospital Esperança','Hotel Aurora','Estação Velha','Fábrica do Porto','Mercado Municipal','Cinema Estrela','Oficina Ferro-Velho','Jardim Botânico','Usina do Vale','Farol de Brightvale'];
const icons=['🏠','🥐','⛲','🏫','☕','🏥','🏨','🚉','🏭','🛒','🎬','🔧','🌿','⚙️','🗼'];
const PLACES=names.map((name,i)=>({name,icon:icons[i],text:['Ligue as luzes da sala.','Ajude o bairro a funcionar.','Repare as instalações.'][i%3]}));
const rotate=(m,n)=>{const k=((n%4)+4)%4;return((m<<k)|(m>>>(4-k)))&15};
function rng(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
function shuffle(a,r){for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const xy=(x,y,w)=>y*w+x;
// Each opening level has its own hand-authored topology, objectives and hint budget.
const opening=[
{title:'Primeira luz',routes:[[[0,2],[1,2],[2,2],[3,2],[4,2]]],holes:[[2,2]],intro:'Arraste a peça reta e acenda a luz.'},
{title:'Caminho do corredor',routes:[[[0,2],[1,2],[1,1],[2,1],[3,1],[3,2],[4,2]]],holes:[[1,2],[1,1],[3,1]],intro:'Use curvas para mudar a direção do circuito.'},
{title:'Desvio pela cozinha',routes:[[[0,2],[1,2],[1,3],[2,3],[3,3],[3,2],[4,2]]],holes:[[1,2],[1,3],[2,3],[3,3]],intro:'Nem sempre o caminho mais curto é o correto.'},
{title:'Dois aparelhos',routes:[[[0,2],[1,2],[2,2],[3,2],[4,2]],[[0,2],[1,2],[2,2],[2,1],[3,1],[4,1]]],holes:[[1,2],[2,2],[2,1],[3,2]],intro:'Conecte os dois aparelhos usando a peça T.'},
{title:'O circuito bifurcado',routes:[[[0,2],[1,2],[2,2],[3,2],[4,2]],[[0,2],[1,2],[1,3],[2,3],[3,3],[4,3]]],holes:[[1,2],[1,3],[2,3],[3,3],[3,2]],intro:'Distribua o circuito por dois ramais.'},
{title:'Vazamento na lavanderia',water:true,routes:[[[0,2],[1,2],[1,1],[2,1],[3,1],[3,2],[4,2]]],holes:[[1,2],[1,1],[2,1],[3,1]],intro:'Uma ponta aberta faz o sistema vazar.'},
{title:'Interruptor da sala',switches:[[2,2]],routes:[[[0,2],[1,2],[2,2],[3,2],[4,2]]],holes:[[1,2],[3,2]],intro:'Monte a ligação e abra o interruptor.'},
{title:'Bomba de água',water:true,switches:[[2,2]],routes:[[[0,2],[1,2],[2,2],[3,2],[4,2]],[[0,2],[1,2],[1,3],[2,3],[3,3],[4,3]]],holes:[[1,2],[1,3],[2,3],[3,2],[3,3]],intro:'Acione a bomba para levar água aos dois pontos.'},
{title:'Circuito com risco',routes:[[[0,2],[1,2],[2,2],[3,2],[4,2]],[[0,2],[1,2],[2,2],[2,1],[3,1],[4,1]]],holes:[[1,2],[2,2],[2,1],[3,1],[3,2]],hazard:[[3,3]],intro:'Evite conectar peças aos pontos perigosos.'},
{title:'Reforma da casa',water:true,switches:[[2,2]],routes:[[[0,2],[1,2],[2,2],[3,2],[4,2]],[[0,2],[1,2],[2,2],[2,3],[3,3],[4,3]],[[0,2],[1,2],[2,2],[2,1],[3,1],[4,1]]],holes:[[1,2],[2,1],[2,3],[3,1],[3,2],[3,3]],intro:'Três destinos, uma válvula e peças limitadas.'}
];
function build(level, spec, w, random, curated){
const cells=Array.from({length:w*w},()=>({kind:'empty',mask:0}));
const connect=(a,b)=>{const ax=a%w,ay=Math.floor(a/w),bx=b%w,by=Math.floor(b/w),d=D.findIndex(([dx,dy])=>ax+dx===bx&&ay+dy===by);if(d<0)throw Error('Nonadjacent path');cells[a].mask|=1<<d;cells[b].mask|=1<<((d+2)%4);};
const routes=spec.routes.map(route=>route.map(([x,y])=>xy(x,y,w)));
for(const route of routes)for(let i=1;i<route.length;i++)connect(route[i-1],route[i]);
const source=routes[0][0];cells[source].kind='source';
const sinks=routes.map((route,i)=>({index:route[route.length-1],icon:(spec.water?['🚰','🚿','🧺','💦']:['💡','📺','🌀','🧊'])[i%4]}));
for(const s of sinks)cells[s.index].kind='sink';
for(const pt of spec.switches||[]){const i=xy(pt[0],pt[1],w);if(cells[i].kind!=='empty')throw Error('Switch collision');cells[i].kind='switch';cells[i].on=false;}
for(const pt of spec.hazard||[]){const i=xy(pt[0],pt[1],w);if(cells[i].mask)throw Error('Hazard collision');cells[i].kind='hazard';cells[i].mask=1;}
const holes=spec.holes.map(([x,y])=>xy(x,y,w));
const solution=holes.map(i=>{if(cells[i].kind!=='empty'||!cells[i].mask)throw Error('Invalid socket '+i);return cells[i].mask;});
for(const i of cells.keys())if(cells[i].kind==='empty'&&cells[i].mask)cells[i].kind='fixed';
holes.forEach(i=>{cells[i].kind='socket';cells[i].mask=0;});
const pieces=shuffle(solution.map((mask,i)=>({id:'piece-'+i,mask,rotation:Math.floor(random()*4)})),random);
const best=holes.length+(spec.switches||[]).length;
return {level,width:w,height:w,cells,source,sinks,holes,solution,tray:pieces,
 switchIndices:(spec.switches||[]).map(p=>xy(p[0],p[1],w)),
 hazards:(spec.hazard||[]).map(p=>xy(p[0],p[1],w)),
 title:spec.title,intro:spec.intro||'',difficulty:level<=3?'Tutorial':level<=10?'Aprendiz':level<=45?'Técnico':level<=100?'Experiente':'Especialista',
 element:spec.water?'water':'electric',maxMoves:best+Math.max(curated?4:3,Math.ceil(best*.6)),
 isBoss:level%12===0,curated,place:PLACES[Math.floor((level-1)/12)]};
}
function generated(level){
const r=rng(level*9871+71),w=level<=50?5:level<=125?6:7;
const startRow=1+Math.floor(r()*(w-2)),nSinks=Math.min(w-2,level<=24?1:level<=70?2:level<=130?3:4);
const rows=shuffle(Array.from({length:w-2},(_,i)=>i+1),r).slice(0,nSinks);
const routes=[];
for(const endRow of rows){let x=0,y=startRow;const route=[[x,y]];let safety=0;while((x!==w-1||y!==endRow)&&safety++<120){
 const horizontal=x<w-1&&(y===endRow||r()<.62);
 x+=horizontal?1:0;y+=horizontal?0:Math.sign(endRow-y);route.push([x,y]);}
 routes.push(route);}
const occupied=new Set(),used=new Set();for(const route of routes)for(const [x,y] of route)occupied.add(x+','+y);
for(const route of routes)for(const [x,y] of route)if(x>0&&x<w-1)used.add(x+','+y);
const candidates=shuffle([...used],r);
const number=Math.min(candidates.length,level<=24?3:level<=70?4:level<=125?6:8);
const holes=candidates.slice(0,number).map(p=>p.split(',').map(Number));
const isWater=Math.floor((level-1)/12)%2===1;
const switches=level>=30&&level%5===0?routes[0].filter(([x,y])=>x>0&&x<w-1).slice(0,1).filter(pt=>!holes.some(h=>h[0]===pt[0]&&h[1]===pt[1])):[];
const finalHoles=holes.filter(h=>!switches.some(p=>p[0]===h[0]&&p[1]===h[1]));
return build(level,{title:['Falha no circuito','Conexões do bairro','Reparo especializado'][level%3],routes,holes:finalHoles,switches,water:isWater},w,r,false);
}
function create(level){level=Math.max(1,Math.min(MAX_LEVEL,Math.floor(Number(level)||1)));if(level<=opening.length)return build(level,opening[level-1],5,rng(6100+level*903),true);return generated(level);}
function activeMask(p,index){const c=p.cells[index];if(c.kind==='socket')return c.placed?rotate(c.placed.mask,c.placed.rotation):0;if(c.kind==='switch'&&!c.on)return 0;return c.mask;}
function examine(p){
 const visited=new Set([p.source]),queue=[p.source],leaks=[],bad=[];
 while(queue.length){const at=queue.shift(),x=at%p.width,y=Math.floor(at/p.width),out=activeMask(p,at);
 for(let d=0;d<4;d++){if(!(out&(1<<d)))continue;
 const nx=x+D[d][0],ny=y+D[d][1];if(nx<0||ny<0||nx>=p.width||ny>=p.height){leaks.push(at);continue;}
 const next=ny*p.width+nx;
 if(!(activeMask(p,next)&(1<<((d+2)%4)))){leaks.push(at);continue;}
 if(!visited.has(next)){visited.add(next);queue.push(next);}
 }}
 const powered=p.sinks.filter(s=>visited.has(s.index)).length;
 const filled=p.holes.every(i=>!!p.cells[i].placed);
 const switchesOn=p.switchIndices.every(i=>p.cells[i].on);
 const unsafe=p.hazards.some(i=>visited.has(i));
 return {connected:visited,powered,total:p.sinks.length,filled,switchesOn,leaks:leaks.length,unsafe,overload:false,complete:filled&&switchesOn&&powered===p.sinks.length&&leaks.length===0&&!unsafe};
}
function autoSolve(p){p.holes.forEach((index,i)=>{p.cells[index].placed={id:'answer-'+i,mask:p.solution[i],rotation:0};});p.switchIndices.forEach(index=>p.cells[index].on=true);return examine(p);}
function solutionFor(p,index){const slot=p.holes.indexOf(index);return slot<0?null:p.solution[slot];}
return {MAX_LEVEL,LEVELS_PER_PLACE,PLACES,create,examine,autoSolve,rotate,solutionFor,opening};
});