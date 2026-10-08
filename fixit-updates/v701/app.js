(()=>{'use strict';
const E=window.FixEngine,$=id=>document.getElementById(id),KEY='fixit-alpha-state-v1',SESSION='fixit-v2-board';
let state;try{state=JSON.parse(localStorage.getItem(KEY)||'null');}catch(_){}
state=Object.assign({level:1,completed:0,coins:70,hearts:5,stars:0,tool:0,sound:true,bestStars:{}},state||{});
state.bestStars=state.bestStars||{};state.level=Math.max(1,Math.min(E.MAX_LEVEL,Number(state.level)||1));
let p,moves=0,hints=0,selected=null,screen='play',nextModal=null,ctx=null,area=0;
const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
const saveBoard=()=>localStorage.setItem(SESSION,JSON.stringify({level:p.level,moves,hints,tray:p.tray,cells:p.cells.map(c=>c.placed||null)}));
const clearBoard=()=>localStorage.removeItem(SESSION);
function sound(f=420){if(!state.sound)return;try{let C=window.AudioContext||window.webkitAudioContext;ctx=ctx||new C;const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=f;g.gain.value=.04;o.connect(g);g.connect(ctx.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.09);o.stop(ctx.currentTime+.09);}catch(_){}}
function path(mask){const pts=[[50,1],[99,50],[50,99],[1,50]];let s='<svg viewBox="0 0 100 100" class="pipe-svg">';for(let d=0;d<4;d++)if(mask&(1<<d))s+='<path class="pipe-outline" d="M50 50 L'+pts[d][0]+' '+pts[d][1]+'"/><path class="pipe-inner" d="M50 50 L'+pts[d][0]+' '+pts[d][1]+'"/>';return s+'<circle cx="50" cy="50" r="8" class="pipe-center"/></svg>';}
function start(level){p=E.create(level);state.level=p.level;area=Math.floor((p.level-1)/12);moves=0;hints=0;selected=null;
try{const s=JSON.parse(localStorage.getItem(SESSION)||'null');if(s&&s.level===p.level&&s.cells?.length===p.cells.length){p.tray=s.tray;p.cells.forEach((c,i)=>{if(c.kind==='socket')c.placed=s.cells[i];});moves=s.moves||0;hints=s.hints||0;}}catch(_){}
save();render();}
function cellClick(i){const c=p.cells[i];if(c.kind!=='socket')return;
if(selected!==null){const piece=p.tray.find(x=>x.id===selected);if(!piece)return;
if(c.placed)p.tray.push(c.placed);c.placed={...piece};p.tray=p.tray.filter(x=>x.id!==selected);selected=null;moves++;sound(560);
}else if(c.placed){c.placed.rotation=(c.placed.rotation+1)%4;moves++;sound(380);}
saveBoard();renderBoard();renderTray();if(moves>p.maxMoves)failure('Você esgotou as jogadas disponíveis.');}
function renderBoard(){const result=E.examine(p);$('board').style.gridTemplateColumns='repeat('+p.width+',1fr)';
$('board').className=p.element;
$('board').innerHTML=p.cells.map((c,i)=>{const s=p.sinks.find(x=>x.index===i),active=result.connected.has(i);const mask=c.kind==='socket'?(c.placed?E.turn(c.placed.mask,c.placed.rotation):0):c.mask;
const icon=c.kind==='source'?(p.element==='water'?'💧':'⚡'):s?s.icon:c.kind==='socket'&&!c.placed?'＋':'';
return '<button class="game-cell '+c.kind+(active?' live':'')+(c.placed?' placed':'')+'" data-index="'+i+'" '+(c.kind!=='socket'?'disabled':'')+' aria-label="'+(c.kind==='socket'?'Encaixar ou girar peça':'Conexão fixa')+'">'+(mask?path(mask):'')+(icon?'<span class="cell-emoji">'+icon+'</span>':'')+'</button>';}).join('');
$('moves-tag').textContent=moves+'/'+p.maxMoves+' jogadas';
$('targets').innerHTML=p.sinks.map(s=>'<span class="target '+(result.connected.has(s.index)?'on':'')+'">'+s.icon+' '+(result.connected.has(s.index)?'Ligado':'Desligado')+'</span>').join('');
$('meterbar').style.width=(result.powered*100/result.total)+'%';$('status-hint').textContent=result.complete?'✅ Sistema pronto!':!result.filled?'Encaixe as peças faltantes':result.leaks?'⚠️ Conexão interrompida':'Ainda faltam aparelhos';
$('rating').textContent=moves<=p.holes.length*2?'★★★':moves<=p.maxMoves-2?'★★☆':'★☆☆';
}
function renderTray(){$('tray').innerHTML=p.tray.map((t,i)=>'<button class="piece '+(selected===t.id?'selected':'')+'" draggable="true" data-piece="'+t.id+'" aria-label="Peça '+(i+1)+'">'+path(E.turn(t.mask,t.rotation))+'</button>').join('')||'<span class="tray-empty">Todas as peças foram colocadas. Toque numa peça instalada para girar.</span>';}
function render(){document.querySelector('.scene').classList.toggle('water',p.element==='water');
$('hearts').textContent='❤️ '+state.hearts+'/5';$('coins').textContent='🪙 '+state.coins;$('sound').textContent=state.sound?'Ligado':'Desligado';
$('sector').textContent=p.place.name.toUpperCase()+' · '+p.difficulty.toUpperCase();
$('stage-label').textContent='Nível '+p.level+'/'+E.MAX_LEVEL+(p.isBoss?' 👑':'');
$('mode-tag').textContent=p.element==='water'?'💧 ENCANAMENTO':'⚡ ENERGIA';$('scene-icon').textContent=p.place.icon;$('scene-text').textContent=p.place.text;
$('source-hint').textContent=p.element==='water'?'💧 Fluxo de água':'⚡ Corrente elétrica';
$('objective-title').textContent='Conecte '+p.sinks.length+' aparelhos sem vazamentos';
$('objective-help').textContent='Arraste uma peça de baixo para um espaço vazio. Toque na peça colocada para girá-la. Depois aperte TESTAR.';
$('hint-price').textContent=Math.max(5,15-3*state.tool);renderBoard();renderTray();}
function show(s){screen=s;document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.id===s+'-screen'));document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x.dataset.screen===s));$('screen-title').textContent=s==='play'?'Faça Brightvale funcionar!':s==='city'?'Reconstrua a cidade!':'Sua oficina de reparos';$('screen-sub').textContent=s==='play'?'Arraste e encaixe peças para completar cada reparo.':s==='city'?'Cada conserto devolve vida às ruas.':'Melhore suas ferramentas e confira atualizações.';if(s==='city')renderCity();if(s==='shop')renderShop();window.scrollTo(0,0);}
function modal(icon,title,msg,label,fn){$('modal-icon').textContent=icon;$('modal-title').textContent=title;$('modal-message').textContent=msg;$('modal-extra').innerHTML='';$('modal-ok').textContent=label||'Continuar';nextModal=fn;$('modal').classList.remove('hidden');}
function failure(msg){clearBoard();state.hearts=Math.max(0,state.hearts-1);save();sound(160);modal('🔧','Tente de novo!',msg+' O reparo precisa ser refeito.','Recomeçar',()=>{clearBoard();start(state.level);});}
function test(){const v=E.examine(p);if(moves>p.maxMoves)return failure('Você gastou jogadas demais.');
if(!v.filled)return modal('🧩','Faltam peças!','Encaixe uma peça em cada espaço marcado com +.','Entendi');
if(v.leaks||v.powered!==v.total)return failure('Há tubos soltos ou aparelhos sem ligação. Revise as conexões.');
const earned=moves<=p.holes.length*2?3:moves<=p.maxMoves-2?2:1,old=state.bestStars[p.level]||0;
const fresh=p.level>state.completed;if(fresh){state.completed=p.level;state.coins+=40+earned*20;}
if(earned>old){state.bestStars[p.level]=earned;state.stars+=earned-old;}
clearBoard();save();sound(840);$('confetti').classList.remove('hidden');setTimeout(()=>$('confetti').classList.add('hidden'),900);
modal('🏆','Reparo concluído!','Você conquistou '+earned+' estrela(s)! '+(fresh?'A cidade ficou um pouco mais bonita.':'Novo recorde de eficiência.'),p.level>=E.MAX_LEVEL?'Voltar à cidade':'Próximo reparo',()=>{if(p.level>=E.MAX_LEVEL)show('city');else{start(Math.min(E.MAX_LEVEL,state.completed+1));show('play');}});}
function hint(){const cost=Math.max(5,15-state.tool*3);if(state.coins<cost)return modal('🪙','Poucas moedas','Conclua reparos para ganhar mais moedas.','Entendi');
let target=p.holes.findIndex(i=>!p.cells[i].placed||E.turn(p.cells[i].placed.mask,p.cells[i].placed.rotation)!==p.solution[p.holes.indexOf(i)]);
if(target<0)return modal('✅','Quase lá!','As peças estão nas posições corretas. Aperte TESTAR.','Entendi');
const hole=p.holes[target],cell=p.cells[hole],solution=p.solution[target];
if(cell.placed)p.tray.push(cell.placed);
const piece=p.tray.find(t=>t.mask===solution);
if(!piece)return modal('🔍','Observe os tubos','Remova a peça errada de um encaixe para conseguir outra.','Entendi');
cell.placed={...piece,rotation:0};p.tray=p.tray.filter(t=>t.id!==piece.id);state.coins-=cost;hints++;save();saveBoard();render();}
function renderCity(){$('city-progress').textContent=state.completed+' de '+E.MAX_LEVEL+' reparos concluídos';
$('town-mini').innerHTML=E.PLACES.slice(0,7).map((p,i)=>'<span class="'+(state.completed>=(i+1)*12?'restored':'')+'">'+p.icon+'</span>').join('');
$('city-list').innerHTML=E.PLACES.map((pl,i)=>{const done=Math.max(0,Math.min(12,state.completed-i*12)),unlocked=i*12+1<=state.completed+1;return '<button class="city-card '+(done===12?'restored ':'')+(area===i?'selected ':'')+'" data-area="'+i+'" '+(unlocked?'':'disabled')+'><span class="city-icon">'+pl.icon+'</span><span class="city-details"><strong>'+pl.name+'</strong><small>'+(unlocked?'Restaurar':'🔒 Bloqueado')+'</small><span class="city-mini"><span style="width:'+(done*100/12)+'%"></span></span></span><span class="city-count">'+done+'/12</span></button>';}).join('');
const pl=E.PLACES[area];$('level-picker').innerHTML='<h3>'+pl.icon+' '+pl.name+'</h3><div class="level-buttons">'+Array.from({length:12},(_,i)=>{const n=area*12+i+1;return '<button class="level-choice '+(n<=state.completed?'won ':'')+(n===state.level?'current ':'')+'" data-level="'+n+'" '+(n<=state.completed+1?'':'disabled')+'><b>'+(i===11?'👑 ':'')+n+'</b><small>'+(state.bestStars[n]?'★'.repeat(state.bestStars[n]):n<=state.completed+1?'Jogar':'🔒')+'</small></button>';}).join('')+'</div>';}
function renderShop(){$('upgrade-level').textContent='Nível '+state.tool;$('upgrade').textContent=state.tool>=5?'MÁXIMO':'🪙 '+(90+state.tool*60);$('upgrade').disabled=state.tool>=5;$('stats-level').textContent=state.level;$('stats-completed').textContent=state.completed;$('stats-stars').textContent=state.stars;}
$('board').addEventListener('click',e=>{const b=e.target.closest('[data-index]');if(b)cellClick(Number(b.dataset.index));});
$('board').addEventListener('dragover',e=>{if(e.target.closest('[data-index]'))e.preventDefault();});
$('board').addEventListener('drop',e=>{e.preventDefault();const b=e.target.closest('[data-index]');if(b){selected=e.dataTransfer.getData('text/plain')||selected;cellClick(Number(b.dataset.index));}});
$('tray').addEventListener('click',e=>{const b=e.target.closest('[data-piece]');if(b){selected=selected===b.dataset.piece?null:b.dataset.piece;renderTray();}});
$('tray').addEventListener('dragstart',e=>{const b=e.target.closest('[data-piece]');if(b){selected=b.dataset.piece;e.dataTransfer.setData('text/plain',selected);}});
let dragging=null,ghost=null,startTouch=null;
$('tray').addEventListener('touchstart',e=>{
 const b=e.target.closest('[data-piece]');if(!b)return;
 const point=e.touches[0];startTouch={x:point.clientX,y:point.clientY,id:b.dataset.piece};
},{passive:true});
$('tray').addEventListener('touchmove',e=>{
 if(!startTouch)return;
 const point=e.touches[0];
 if(!dragging&&Math.hypot(point.clientX-startTouch.x,point.clientY-startTouch.y)>12){
   dragging=startTouch.id;selected=dragging;
   const piece=p.tray.find(x=>x.id===dragging);if(!piece)return;
   ghost=document.createElement('div');ghost.className='drag-ghost';ghost.innerHTML=path(E.turn(piece.mask,piece.rotation));document.body.appendChild(ghost);
 }
 if(ghost){e.preventDefault();ghost.style.left=(point.clientX-32)+'px';ghost.style.top=(point.clientY-32)+'px';}
},{passive:false});
$('tray').addEventListener('touchend',e=>{
 if(dragging){
   const t=e.changedTouches[0],target=document.elementFromPoint(t.clientX,t.clientY)?.closest('[data-index]');
   if(ghost){ghost.remove();ghost=null;}
   if(target)cellClick(Number(target.dataset.index));
   else renderTray();
   e.preventDefault();
 }
 dragging=null;startTouch=null;
},{passive:false});

$('test').addEventListener('click',test);$('hint').addEventListener('click',hint);
$('restart').addEventListener('click',()=>modal('↻','Reiniciar fase?','Os encaixes desta tentativa serão desfeitos.','Reiniciar',()=>{clearBoard();start(state.level);}));
$('modal-ok').addEventListener('click',()=>{$('modal').classList.add('hidden');const a=nextModal;nextModal=null;if(a)a();});
$('sound').addEventListener('click',()=>{state.sound=!state.sound;save();render();});
$('upgrade').addEventListener('click',()=>{const cost=90+state.tool*60;if(state.tool>=5)return;if(state.coins<cost)return modal('🪙','Moedas insuficientes','Conclua mais fases para melhorar sua oficina.','Entendi');state.coins-=cost;state.tool++;save();renderShop();$('coins').textContent='🪙 '+state.coins;});
document.querySelectorAll('.nav').forEach(b=>b.addEventListener('click',()=>show(b.dataset.screen)));
$('city-list').addEventListener('click',e=>{const b=e.target.closest('[data-area]');if(!b||b.disabled)return;area=Number(b.dataset.area);renderCity();$('level-picker').scrollIntoView({behavior:'smooth',block:'nearest'});});
$('level-picker').addEventListener('click',e=>{const b=e.target.closest('[data-level]');if(!b||b.disabled)return;clearBoard();start(Number(b.dataset.level));show('play');});
start(state.level);show('play');
const versionBanner=document.querySelector('.eyebrow');if(versionBanner)versionBanner.textContent='BRIGHTVALE • ARRASTAR E ENCAIXAR v701';
})();