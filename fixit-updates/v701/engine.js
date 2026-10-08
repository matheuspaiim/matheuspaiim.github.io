(function(root,factory){const E=factory();if(typeof module!=='undefined'&&module.exports)module.exports=E;root.FixEngine=E;})(typeof globalThis==='object'?globalThis:this,()=>{
const PLACES=['Casa da Dona Lia','Padaria do Nino','Praça das Fontes','Escola Aurora','Café da Marisa','Hospital Esperança','Hotel Aurora','Estação Velha','Fábrica do Porto','Mercado Municipal','Cinema Estrela','Oficina Ferro-Velho','Jardim Botânico','Usina do Vale','Farol de Brightvale'].map((name,i)=>({name,icon:['🏠','🥐','⛲','🏫','☕','🏥','🏨','🚉','🏭','🛒','🎬','🔧','🌿','⚙️','🗼'][i],text:'Restaure este local de Brightvale.'}));
const MAX_LEVEL=180,LEVELS_PER_PLACE=12,D=[[0,-1],[1,0],[0,1],[-1,0]];
const turn=(m,n)=>((m<<((n%4+4)%4))|(m>>>(4-((n%4+4)%4))))&15;
function rng(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
function create(input){
const level=Math.max(1,Math.min(180,Math.floor(Number(input)||1))),r=rng(level*11231+77),w=level<=18?5:level<=65?6:level<=130?7:8,h=w;
const cells=Array.from({length:w*w},()=>({mask:0,kind:'empty'})),id=(x,y)=>y*w+x;
const start=1+Math.floor(r()*(w-2)),source=id(0,start);cells[source].kind='source';
let ends=level<=5?1:level<=45?2:level<=125?3:4;
ends=Math.min(ends,w-2);
const rows=Array.from({length:w-2},(_,i)=>i+1).sort((a,b)=>Math.sin(a*level)-Math.sin(b*level)).slice(0,ends);
const sinks=rows.map((y,i)=>({index:id(w-1,y),icon:['💡','📺','🌀','🚿'][i]}));
function edge(a,b){const x=a%w,y=Math.floor(a/w),xx=b%w,yy=Math.floor(b/w),d=D.findIndex(([dx,dy])=>x+dx===xx&&y+dy===yy);if(d<0)throw Error('bad edge');cells[a].mask|=1<<d;cells[b].mask|=1<<((d+2)%4);}
for(const sink of sinks){let x=0,y=start,target=Math.floor(sink.index/w);for(let k=0;k<80&&(x!==w-1||y!==target);k++){const hor=x<w-1&&(y===target||r()<.65),nx=x+(hor?1:0),ny=y+(hor?0:Math.sign(target-y));edge(id(x,y),id(nx,ny));x=nx;y=ny;}cells[sink.index].kind='sink';}
const candidates=cells.map((c,i)=>c.mask&&c.kind==='empty'?i:-1).filter(i=>i>=0);
for(let i=candidates.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]];}
const holes=candidates.slice(0,Math.min(candidates.length,level<=3?2:level<=25?3:level<=65?4:level<=115?6:9));
const solution=holes.map(i=>cells[i].mask);
for(let i=0;i<cells.length;i++){if(cells[i].mask&&cells[i].kind==='empty')cells[i].kind='fixed';}
holes.forEach(i=>{cells[i].kind='socket';cells[i].mask=0;});
const tray=solution.map((mask,i)=>({id:'piece'+i,mask,rotation:Math.floor(r()*4)})).sort((a,b)=>r()-.5);
const maxMoves=holes.length*3+(level<=12?7:level<=65?5:3);
const element=Math.floor((level-1)/12)%2===0?'electric':'water';
return {level,width:w,height:h,cells,source,sinks,holes,solution,tray,maxMoves,element,place:PLACES[Math.floor((level-1)/12)],isBoss:level%12===0,difficulty:level<=12?'Aprendiz':level<=45?'Técnico':level<=95?'Experiente':level<=145?'Mestre':'Lenda'};
}
function examine(p){
const open=new Set([p.source]),q=[p.source],leaks=[];
const mask=i=>{const c=p.cells[i];return c.kind==='socket'?c.placed?turn(c.placed.mask,c.placed.rotation):0:c.mask;};
while(q.length){const i=q.shift(),x=i%p.width,y=Math.floor(i/p.width),m=mask(i);
for(let d=0;d<4;d++){if(!(m&(1<<d)))continue;const nx=x+D[d][0],ny=y+D[d][1];if(nx<0||ny<0||nx>=p.width||ny>=p.height){leaks.push(i);continue;}
const j=ny*p.width+nx;if(!(mask(j)&(1<<((d+2)%4)))){leaks.push(i);continue;}if(!open.has(j)){open.add(j);q.push(j);}}}
const powered=p.sinks.filter(s=>open.has(s.index)).length,filled=p.holes.every(i=>p.cells[i].placed);
return {connected:open,powered,total:p.sinks.length,filled,leaks:leaks.length,unsafe:leaks.length>0,overload:false,complete:filled&&powered===p.sinks.length&&leaks.length===0};
}
function autoSolve(p){p.holes.forEach((i,k)=>p.cells[i].placed={mask:p.solution[k],rotation:0,id:'sol'+k});return examine(p);}
return {PLACES,LEVELS_PER_PLACE,MAX_LEVEL,create,examine,autoSolve,turn};
});