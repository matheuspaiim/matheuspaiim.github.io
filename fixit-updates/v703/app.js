/* Fix It! rebuild: illustrated interactive world, real piece manipulation and city progression. */
(function(){
'use strict';
const E=window.FixEngine,$=id=>document.getElementById(id),SAVE='fixit-alpha-state-v1',SESSION='fixit-rebuild-v702';
let state;try{state=JSON.parse(localStorage.getItem(SAVE)||'null')||{};}catch(e){state={};}
state=Object.assign({level:1,completed:0,coins:70,hearts:5,stars:0,tool:0,bestStars:{},upgrades:{},sound:true,nextHeart:0},state);
state.bestStars=state.bestStars||{};state.upgrades=state.upgrades||{};state.upgrades.diagnostic=Math.max(state.tool||0,state.upgrades.diagnostic||0);
state.level=Math.max(1,Math.min(180,Number(state.level)||1));
let p,moves=0,hints=0,selection=null,selectedSlot=null,history=[],screen='play',district=0,modalAction=null,audio=null,wrongCells=[],ghost=null,drag=null,suppressClick=false,lastFailedLayout='';
const tools=[
{id:'diagnostic',icon:'🔍',name:'Multímetro',desc:'Desconto nas dicas.',price:70,max:5},
{id:'toolkit',icon:'🧰',name:'Caixa de ferramentas',desc:'Uma jogada extra por nível.',price:90,max:5},
{id:'scanner',icon:'📡',name:'Scanner',desc:'Revela onde falta ligação.',price:110,max:3},
{id:'battery',icon:'🔋',name:'Bateria reserva',desc:'Recupera um coração.',price:110,max:3}
];
function save(){try{localStorage.setItem(SAVE,JSON.stringify(state));}catch(e){}}
function refill(){if(state.hearts>=5){state.nextHeart=0;return;}if(!state.nextHeart)state.nextHeart=Date.now()+600000;while(state.hearts<5&&Date.now()>=state.nextHeart){state.hearts++;state.nextHeart+=600000;}if(state.hearts>=5)state.nextHeart=0;}
function levelOf(id){return state.upgrades[id]||0;}
function hintPrice(){return Math.max(5,15-2*levelOf('diagnostic'));}
function moveBudget(){return p.maxMoves+levelOf('toolkit');}
function sound(f){if(!state.sound)return;try{const C=window.AudioContext||window.webkitAudioContext;audio=audio||new C();const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=f;g.gain.value=.045;o.connect(g);g.connect(audio.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.09);o.stop(audio.currentTime+.10);}catch(e){}}
function lines(mask,x,y,size,klass){
let out='';for(let d=0;d<4;d++){if(!(mask&(1<<d)))continue;const dx=[0,1,0,-1][d],dy=[-1,0,1,0][d],xx=x+dx*size/2,yy=y+dy*size/2;
out+='<path class="wire-shadow" d="M'+x+' '+y+'L'+xx+' '+yy+'"/><path class="wire-core" d="M'+x+' '+y+'L'+xx+' '+yy+'"/>';}
return '<g class="'+klass+'">'+out+'<circle cx="'+x+'" cy="'+y+'" r="5" class="wire-joint"/></g>';
}
function pieceArt(mask){
let out='<svg viewBox="0 0 100 100" aria-hidden="true">';for(let d=0;d<4;d++){if(!(mask&(1<<d)))continue;const x=50+[0,48,0,-48][d],y=50+[-48,0,48,0][d];out+='<path class="piece-shadow" d="M50 50L'+x+' '+y+'"/><path class="piece-core" d="M50 50L'+x+' '+y+'"/>';}
return out+'<circle class="piece-center" cx="50" cy="50" r="8"/></svg>';
}
function roomArt(){
return '<svg class="room-illustration" viewBox="0 0 500 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>'+
'<linearGradient id="fixWall" x2="0" y2="1"><stop stop-color="#f8dfb6"/><stop offset="1" stop-color="#ac795a"/></linearGradient>'+
'<linearGradient id="fixFloor" x2="1" y2="1"><stop stop-color="#d3a273"/><stop offset="1" stop-color="#704732"/></linearGradient>'+
'<radialGradient id="fixGlow"><stop stop-color="#fff9c2" stop-opacity=".83"/><stop offset="1" stop-color="#fffbc2" stop-opacity="0"/></radialGradient></defs>'+
'<rect width="500" height="500" fill="#5b382c"/><rect width="500" height="346" fill="url(#fixWall)"/><path d="M0 342H500V500H0Z" fill="url(#fixFloor)"/>'+
'<path d="M0 345H500" stroke="#754630" stroke-width="14"/>'+
'<path d="M0 388H500M0 438H500M0 485H500" stroke="#8a6045" stroke-opacity=".4" stroke-width="5"/>'+
'<rect x="28" y="91" width="147" height="165" rx="7" fill="#78513a" stroke="#ffe4b2" stroke-width="9"/>'+
'<rect x="41" y="104" width="120" height="137" fill="#8ac6d4"/><path d="M41 196Q97 143 161 198V241H41Z" fill="#84b295"/>'+
'<path d="M103 102V246M43 174H166" stroke="#fff2ce" stroke-width="9"/>'+
'<path d="M19 88Q62 139 24 251M182 88Q141 139 179 251" fill="none" stroke="#bb7050" stroke-width="16"/>'+
'<rect x="300" y="73" width="171" height="18" rx="7" fill="#a76540" stroke="#78432d" stroke-width="5"/>'+
'<rect x="329" y="40" width="30" height="32" rx="4" fill="#bf864f"/><path d="M340 47Q300 10 346 14Q377-12 367 34" fill="#57916c"/>'+
'<rect x="387" y="44" width="14" height="29" fill="#699bb3"/><rect x="408" y="36" width="17" height="37" fill="#c2954a"/>'+
'<rect x="303" y="168" width="138" height="94" rx="7" fill="#6f4b37" stroke="#e2b888" stroke-width="9"/>'+
'<rect x="318" y="181" width="108" height="65" rx="3" fill="#365b70"/><path d="M345 270H400" stroke="#624333" stroke-width="8"/>'+
'<rect x="15" y="363" width="190" height="86" rx="20" fill="#744934" stroke="#54362c" stroke-width="9"/>'+
'<rect x="23" y="342" width="179" height="74" rx="20" fill="#ca8867" stroke="#8c5038" stroke-width="6"/>'+
'<rect x="36" y="350" width="69" height="58" rx="10" fill="#e9bc93"/><rect x="111" y="350" width="75" height="58" rx="10" fill="#dda780"/>'+
'<rect x="231" y="401" width="125" height="16" rx="6" fill="#a86e46" stroke="#64452e" stroke-width="5"/>'+
'<path d="M250 418V464M337 418V464" stroke="#664230" stroke-width="12"/>'+
'<rect x="426" y="307" width="63" height="138" rx="12" fill="#b1c5c3" stroke="#5b7377" stroke-width="8"/>'+
'<path d="M426 373H489" stroke="#688a93" stroke-width="7"/>'+
'<path d="M251 0V55" stroke="#66412b" stroke-width="7"/><path d="M200 55Q249 120 300 55Z" fill="#dba054" stroke="#f9d39a" stroke-width="7"/>'+
'<circle cx="251" cy="100" r="125" fill="url(#fixGlow)" class="ambient-glow"/>'+
'<rect x="475" y="274" width="16" height="38" fill="#b47c55"/><path d="M478 274Q432 233 444 209Q477 202 479 250Q493 207 516 221" fill="#6c9679"/></svg>';
}
function renderHeader(){
refill();
$('hearts').textContent='❤️ '+state.hearts+'/5';$('coins').textContent='🪙 '+state.coins;
const soundButton=$('sound');if(soundButton)soundButton.textContent=state.sound?'Ligado':'Desligado';
const banner=document.querySelector('.town-banner');if(banner)banner.classList.add('rebuild-banner');
const eyebrow=document.querySelector('.eyebrow');if(eyebrow)eyebrow.textContent='BRIGHTVALE · RECONSTRUÇÃO v702';
const title=document.querySelector('.town-banner h1');if(title)title.textContent=screen==='city'?'Reconstrua Brightvale':screen==='shop'?'Oficina do Vovô':'Hora de consertar!';
const subtitle=document.querySelector('.town-banner p');if(subtitle)subtitle.textContent='';
}
function saveBoard(){try{localStorage.setItem(SESSION,JSON.stringify({level:p.level,moves,hints,tray:p.tray,cells:p.cells.map(c=>({placed:c.placed||null,on:c.on??null}))}));}catch(e){}}
function clearBoard(){localStorage.removeItem(SESSION);}
function snapshot(){history.push({moves,tray:JSON.stringify(p.tray),cells:p.cells.map(c=>({placed:c.placed?{...c.placed}:null,on:c.on}))});if(history.length>35)history.shift();}
function loadLevel(level,useSave){
p=E.create(level);state.level=p.level;district=Math.floor((p.level-1)/12);moves=0;hints=0;selection=null;selectedSlot=null;history=[];wrongCells=[];lastFailedLayout='';
if(useSave){try{const s=JSON.parse(localStorage.getItem(SESSION)||'null');if(s&&s.level===p.level&&s.cells?.length===p.cells.length){p.tray=s.tray;p.cells.forEach((c,i)=>{if(c.kind==='socket')c.placed=s.cells[i].placed;if(c.kind==='switch')c.on=!!s.cells[i].on;});moves=s.moves||0;hints=s.hints||0;}}catch(e){}}
save();renderHeader();renderPlay();
}
function showModal(icon,title,message,label,cb){$('modal-icon').textContent=icon;$('modal-title').textContent=title;$('modal-message').textContent=message;$('modal-extra').innerHTML='';$('modal-ok').textContent=label||'Continuar';modalAction=cb;$('modal').classList.remove('hidden');}
function renderPlay(){
const solved=E.examine(p),limit=moveBudget();
$('play-screen').innerHTML='<section class="repair-heading"><div><small>'+p.place.icon+' '+p.place.name+'</small><strong>Nível '+p.level+': '+p.title+'</strong></div><div class="repair-meta"><span>'+(p.element==='water'?'💧 Água':'⚡ Energia')+'</span><b>'+moves+'/'+limit+' jogadas</b></div></section>'+
'<section class="repair-room '+p.element+(solved.complete?' restored':'')+'">'+roomArt()+
'<div class="room-shade"></div><svg id="wiring" class="wiring" viewBox="0 0 500 500" preserveAspectRatio="none" aria-hidden="true"></svg>'+
'<div id="repair-hotspots" class="repair-hotspots"></div><div class="repair-caption">'+p.intro+'</div>'+
'<div class="repair-feedback" id="repair-feedback"></div></section>'+
'<section class="parts-tray"><div class="parts-heading"><strong>🧰 Peças disponíveis</strong><small>Arraste ou toque para encaixar</small></div><div id="parts" class="parts" aria-label="Peças disponíveis"></div></section>'+
'<div class="repair-actions"><button class="repair-btn undo" id="btn-undo" '+(history.length?'':'disabled')+'>↶ Desfazer</button>'+
'<button class="repair-btn remove" id="btn-remove" '+(selectedSlot===null?'disabled':'')+'>✕ Retirar</button>'+
'<button class="repair-btn hint" id="btn-hint">💡 '+hintPrice()+'🪙</button>'+
'<button class="repair-btn test" id="btn-test">▶ TESTAR</button></div>'+
'<div class="repair-bottom"><span>'+(p.isBoss?'👑 Chefe · ':'')+p.difficulty+'</span><button id="btn-reset">Reiniciar</button></div>';
renderWires();renderParts();
$('repair-hotspots').addEventListener('click',onHotspot);
$('parts').addEventListener('click',onPartClick);
$('parts').addEventListener('pointerdown',onPartPointer);
$('btn-undo').addEventListener('click',undo);
$('btn-remove').addEventListener('click',removePart);
$('btn-hint').addEventListener('click',hint);
$('btn-test').addEventListener('click',test);
$('btn-reset').addEventListener('click',()=>showModal('↻','Reiniciar nível?','As peças colocadas nesta tentativa serão removidas.','Reiniciar',()=>{clearBoard();loadLevel(p.level,false);}));
}
function renderWires(){
if(!$('wiring'))return;
const data=E.examine(p),step=500/p.width;
let draw='',hotspots='';
p.cells.forEach((cell,i)=>{
const cx=(i%p.width+.5)*step,cy=(Math.floor(i/p.width)+.5)*step;
const mask=cell.kind==='socket'?(cell.placed?E.rotate(cell.placed.mask,cell.placed.rotation):0):cell.kind==='switch'&&!cell.on?0:cell.mask;
if(mask&&cell.kind!=='hazard')draw+=lines(mask,cx,cy,step,(data.connected.has(i)?'powered ':'')+p.element);
if(!['socket','source','sink','switch','hazard'].includes(cell.kind))return;
const sink=p.sinks.find(s=>s.index===i),icon=cell.kind==='source'?(p.element==='water'?'💧':'⚡'):sink?sink.icon:cell.kind==='switch'?(cell.on?'🔓':'🔒'):cell.kind==='hazard'?'⚠️':cell.placed?'↻':'+';
const x=cx/5,y=cy/5;
const classes='repair-node '+cell.kind+(cell.placed?' filled':'')+(selectedSlot===i?' selected':'')+(data.connected.has(i)?' lit':'')+(wrongCells.includes(i)?' wrong':'');
hotspots+='<button class="'+classes+'" style="left:'+x+'%;top:'+y+'%" data-cell="'+i+'" '+(['source','sink','hazard'].includes(cell.kind)?'disabled':'')+' aria-label="'+(cell.kind==='socket'?(cell.placed?'Girar ou remover':'Colocar peça'):cell.kind==='switch'?'Ligar interruptor':'Ponto do circuito')+'"><span>'+icon+'</span></button>';
});
$('wiring').innerHTML=draw;$('repair-hotspots').innerHTML=hotspots;
const fb=$('repair-feedback');fb.textContent=data.complete?'✨ Tudo conectado!':data.powered+'/'+data.total+' aparelhos funcionando';
}
function renderParts(){
const box=$('parts');if(!box)return;
box.innerHTML=p.tray.length?p.tray.map(t=>'<button class="part'+(selection===t.id?' selected':'')+'" data-piece="'+t.id+'" aria-label="Selecionar conexão">'+pieceArt(E.rotate(t.mask,t.rotation))+'</button>').join(''):'<span class="parts-empty">Peças posicionadas! Ajuste ou teste o circuito.</span>';
}
function repaint(){renderHeader();renderPlay();}
function place(index,id){
const cell=p.cells[index],piece=p.tray.find(t=>t.id===id);
if(!piece||!cell||cell.kind!=='socket')return false;
snapshot();if(cell.placed)p.tray.push(cell.placed);
cell.placed={...piece};p.tray=p.tray.filter(t=>t.id!==id);selection=null;selectedSlot=index;wrongCells=[];moves++;sound(550);saveBoard();repaint();return true;
}
function onHotspot(ev){const b=ev.target.closest('[data-cell]');if(!b)return;const idx=Number(b.dataset.cell),cell=p.cells[idx];
if(cell.kind==='switch'){snapshot();cell.on=!cell.on;moves++;sound(660);saveBoard();repaint();return;}
if(cell.kind!=='socket')return;selectedSlot=idx;
if(selection&&place(idx,selection))return;
if(cell.placed){snapshot();cell.placed.rotation=(cell.placed.rotation+1)%4;moves++;wrongCells=[];saveBoard();sound(460);}repaint();
}
function onPartClick(ev){if(suppressClick)return;const b=ev.target.closest('[data-piece]');if(!b)return;selection=selection===b.dataset.piece?null:b.dataset.piece;renderParts();}
function onPartPointer(ev){
const b=ev.target.closest('[data-piece]');if(!b||ev.button!==0)return;
const piece=p.tray.find(t=>t.id===b.dataset.piece);if(!piece)return;
drag={id:ev.pointerId,key:piece.id,x:ev.clientX,y:ev.clientY,moved:false};
b.setPointerCapture?.(ev.pointerId);
const moved=e=>{
 if(!drag||e.pointerId!==drag.id)return;
 if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>9){drag.moved=true;ghost=document.createElement('div');ghost.className='piece-ghost';ghost.innerHTML=pieceArt(E.rotate(piece.mask,piece.rotation));document.body.appendChild(ghost);}
 if(ghost){ghost.style.left=(e.clientX-30)+'px';ghost.style.top=(e.clientY-30)+'px';}
};
const clean=()=>{b.removeEventListener('pointermove',moved);b.removeEventListener('pointerup',up);b.removeEventListener('pointercancel',cancel);if(ghost){ghost.remove();ghost=null;}};
const cancel=()=>{clean();drag=null;};
const up=e=>{if(!drag||e.pointerId!==drag.id)return;const wasMoved=drag.moved,key=drag.key;clean();drag=null;
 if(wasMoved){const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-cell]');
  if(target){place(Number(target.dataset.cell),key);}else{selection=key;renderParts();}
  suppressClick=true;setTimeout(()=>suppressClick=false,10);}
};
b.addEventListener('pointermove',moved);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',cancel);
}
function undo(){const item=history.pop();if(!item)return;p.tray=JSON.parse(item.tray);p.cells.forEach((c,i)=>{if(c.kind==='socket')c.placed=item.cells[i].placed;if(c.kind==='switch')c.on=item.cells[i].on;});moves=item.moves;selection=null;selectedSlot=null;wrongCells=[];saveBoard();repaint();}
function removePart(){if(selectedSlot===null||!p.cells[selectedSlot]?.placed)return;snapshot();p.tray.push(p.cells[selectedSlot].placed);p.cells[selectedSlot].placed=null;selectedSlot=null;wrongCells=[];moves++;saveBoard();repaint();}
function hint(){
const price=hintPrice();if(state.coins<price)return showModal('🪙','Saldo insuficiente','Conclua níveis para receber moedas.','Entendi');
for(let j=0;j<p.holes.length;j++){
const index=p.holes[j],target=p.solution[j],cell=p.cells[index];
if(cell.placed&&E.rotate(cell.placed.mask,cell.placed.rotation)===target)continue;
snapshot();
if(cell.placed&&cell.placed.mask===target){
  cell.placed.rotation=0;
}else{
  let found=p.tray.find(t=>t.mask===target);
  if(found){
    if(cell.placed)p.tray.push(cell.placed);
    cell.placed={...found,rotation:0};p.tray=p.tray.filter(t=>t.id!==found.id);
  }else{
    const otherIndex=p.holes.find(i=>i!==index&&p.cells[i].placed?.mask===target);
    if(otherIndex===undefined){history.pop();continue;}
    const other=p.cells[otherIndex].placed;
    p.cells[otherIndex].placed=cell.placed||null;cell.placed={...other,rotation:0};
  }
}
state.coins-=price;hints++;selectedSlot=index;selection=null;wrongCells=[];save();saveBoard();sound(820);repaint();return;
}
const sw=p.switchIndices.find(i=>!p.cells[i].on);
if(sw!==undefined){snapshot();p.cells[sw].on=true;state.coins-=price;hints++;moves++;saveBoard();save();repaint();return;}
showModal('🔍','Diagnóstico','Tudo parece conectado. Faça o teste do circuito.','Entendi');
}
function test(){
refill();const result=E.examine(p);
if(!result.filled)return showModal('🧩','Ainda faltam conexões','Complete todos os encaixes primeiro. Este aviso não tira vidas.','Continuar');
if(!result.switchesOn)return showModal('🔒','Interruptor desligado','Toque no interruptor do cenário.','Entendi');
if(moves>moveBudget())return showModal('⏳','Jogadas excedidas','Use o Desfazer ou reinicie a fase para tentar com menos jogadas.','Continuar');
if(result.complete)return victory();
wrongCells=p.holes.filter(i=>!p.cells[i].placed||E.rotate(p.cells[i].placed.mask,p.cells[i].placed.rotation)!==E.solutionFor(p,i));
renderWires();
const message=result.leaks?'Há uma conexão aberta, verifique os encaixes marcados.':'Nem todos os aparelhos estão conectados.';
if(p.level<=2)return showModal('🔍','Tente ajustar as peças',message+' O tutorial não desconta corações.','Continuar');
if(state.hearts<=0)return showModal('❤️','Sem corações','Um coração será recuperado a cada 10 minutos.','Entendi');
const layout=JSON.stringify(p.cells.map(c=>[c.placed?.id,c.placed?.rotation,c.on]));
if(layout===lastFailedLayout)return showModal('🔧','Mesma montagem',message+' Ajuste uma peça antes de testar novamente. Nenhum coração foi descontado.','Corrigir');
lastFailedLayout=layout;
state.hearts=Math.max(0,state.hearts-1);if(!state.nextHeart)state.nextHeart=Date.now()+600000;save();renderHeader();sound(180);showModal('🔧','Teste falhou',message+' Perdeu um coração, mas pode corrigir sem reiniciar.','Corrigir');
}
function victory(){
const fresh=p.level>state.completed,stars=Math.max(1,Math.min(3,hints?2:moves<=p.holes.length+2?3:moves<=moveBudget()-2?2:1)),prior=Number(state.bestStars[p.level]||0),completed=p.level;
if(fresh){state.completed=p.level;state.coins+=45+15*stars;}
if(stars>prior){state.bestStars[p.level]=stars;state.stars+=stars-prior;}
clearBoard();save();sound(880);$('play-screen').querySelector('.repair-room')?.classList.add('restored');
showModal('🏆','Reparo concluído!',stars+' estrela(s)! '+(fresh?'Você ganhou '+(45+stars*15)+' moedas e ajudou Brightvale.':'Desafio repetido com sucesso.'),completed===180?'Ver cidade':'Próximo reparo',()=>{if(completed===180){switchScreen('city');return;}loadLevel(Math.max(state.completed+1,completed+1),false);switchScreen('play');});
}
function switchScreen(next){screen=next;document.querySelectorAll('.screen').forEach(el=>el.classList.toggle('active',el.id===next+'-screen'));document.querySelectorAll('.nav').forEach(el=>el.classList.toggle('active',el.dataset.screen===next));renderHeader();if(next==='city')renderCity();if(next==='shop')renderShop();window.scrollTo(0,0);}
const coords=[[19,14],[49,15],[81,14],[18,31],[50,32],[82,30],[18,48],[50,49],[82,47],[18,65],[50,66],[82,64],[19,83],[50,84],[81,82]];
function townIllustration(){
const trees=[[48,116],[72,206],[560,131],[601,230],[121,330],[624,392],[43,458],[561,524],[95,621],[594,720],[109,855],[617,894]];
const houses=[[80,145],[245,110],[470,160],[93,402],[257,357],[470,423],[82,615],[269,587],[481,647],[112,785],[320,793],[465,852]];
return '<svg class="town-map-svg" viewBox="0 0 700 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'+
'<defs><linearGradient id="townGrass" x2="0" y2="1"><stop stop-color="#aad99a"/><stop offset="1" stop-color="#68a57f"/></linearGradient>'+
'<linearGradient id="townSea" x2="1" y2="1"><stop stop-color="#75c8e6"/><stop offset="1" stop-color="#286b9e"/></linearGradient>'+
'<linearGradient id="townRoad"><stop stop-color="#f3d6aa"/><stop offset="1" stop-color="#c8a575"/></linearGradient></defs>'+
'<rect width="700" height="1000" fill="url(#townGrass)"/>'+
'<path d="M-40 170C130 45 207 65 364 138S614 204 752 105" stroke="#a9b884" stroke-width="86" fill="none"/>'+
'<path d="M-10 422C178 340 268 472 415 378S648 302 760 370" stroke="#a9bc84" stroke-width="120" fill="none"/>'+
'<path d="M-20 799C146 704 248 749 369 696S573 689 720 774" stroke="#96b67e" stroke-width="85" fill="none"/>'+
'<path d="M-30 121C189 217 266 45 425 141S567 247 730 179" fill="none" stroke="#916f4a" stroke-width="60"/>'+
'<path d="M-30 121C189 217 266 45 425 141S567 247 730 179" fill="none" stroke="url(#townRoad)" stroke-width="49"/>'+
'<path d="M-23 388C150 300 255 495 420 392S632 358 731 434" fill="none" stroke="#947b58" stroke-width="63"/>'+
'<path d="M-23 388C150 300 255 495 420 392S632 358 731 434" fill="none" stroke="url(#townRoad)" stroke-width="49"/>'+
'<path d="M-35 687C176 768 223 552 417 662S578 847 744 781" fill="none" stroke="#977453" stroke-width="64"/>'+
'<path d="M-35 687C176 768 223 552 417 662S578 847 744 781" fill="none" stroke="url(#townRoad)" stroke-width="51"/>'+
'<path d="M346-20Q330 137 328 248T389 481T326 708T345 1050" fill="none" stroke="#8b755c" stroke-width="58"/>'+
'<path d="M346-20Q330 137 328 248T389 481T326 708T345 1050" fill="none" stroke="#eed3a5" stroke-width="46"/>'+
'<path d="M-30 960Q138 887 271 935T548 911T750 884V1020H-30Z" fill="url(#townSea)" stroke="#e8f1cd" stroke-width="15"/>'+
houses.map(([x,y],i)=>'<g transform="translate('+x+' '+y+')"><ellipse cy="27" rx="49" ry="16" fill="#4f745e" opacity=".38"/><rect x="-34" y="-15" width="68" height="49" rx="5" fill="'+(i%3===0?'#e5b07e':i%3===1?'#f2ddab':'#b0c9ca')+'" stroke="#8a674d" stroke-width="4"/><path d="M-42-15L0-49L42-15Z" fill="'+(i%2?'#b67559':'#a45d47')+'" stroke="#81523c" stroke-width="4"/><rect x="-10" y="0" width="20" height="34" fill="#825438"/><rect x="-28" y="-4" width="12" height="14" fill="#8bcbe1"/><rect x="16" y="-4" width="12" height="14" fill="#8bcbe1"/></g>').join('')+
trees.map(([x,y])=>'<g transform="translate('+x+' '+y+')"><ellipse cy="12" rx="26" ry="10" fill="#406c4e" opacity=".25"/><path d="M0-16V17" stroke="#6f5836" stroke-width="10"/><circle cy="-25" r="29" fill="#478b59"/><circle cx="-12" cy="-31" r="19" fill="#6aad6c"/><circle cx="12" cy="-22" r="20" fill="#569c5c"/></g>').join('')+
'<circle cx="342" cy="477" r="52" fill="#8cbbd1" stroke="#f4eac9" stroke-width="10"/><circle cx="342" cy="477" r="25" fill="#b5ebec" stroke="#f3f4ca" stroke-width="6"/>'+
'</svg>';
}
function renderCity(){
$('city-screen').innerHTML='<div class="map-head"><strong>🏙️ Brightvale</strong><span>'+state.completed+'/180 reparos</span></div>'+
'<div class="town-map"><div class="town-map-art">'+townIllustration()+'</div><div id="town-markers"></div></div>'+
'<div id="town-district" class="town-district"></div><p class="map-note">Toque em um prédio para acessar seus serviços. Conclua os 12 reparos para restaurá-lo.</p>';
$('town-markers').innerHTML=E.PLACES.map((place,i)=>{
const progress=Math.max(0,Math.min(12,state.completed-i*12)),unlocked=i*12+1<=state.completed+1;
return '<button class="map-landmark '+(progress===12?'complete':progress?'partial':unlocked?'available':'locked')+(i===district?' focused':'')+'" style="left:'+coords[i][0]+'%;top:'+coords[i][1]+'%" data-district="'+i+'" '+(unlocked?'':'disabled')+'><span class="landmark-figure">'+place.icon+'</span><span class="landmark-text">'+place.name+'</span><small>'+(progress===12?'★★★':progress?progress+'/12':unlocked?'Reparar':'🔒')+'</small></button>';
}).join('');
$('town-markers').addEventListener('click',ev=>{const target=ev.target.closest('[data-district]');if(!target||target.disabled)return;district=Number(target.dataset.district);renderCity();$('town-district').scrollIntoView({behavior:'smooth',block:'nearest'});});
renderDistrict();
}
function renderDistrict(){
const place=E.PLACES[district],first=district*12+1,completed=Math.max(0,Math.min(12,state.completed-district*12));
$('town-district').innerHTML='<div class="district-heading"><span>'+place.icon+'</span><div><strong>'+place.name+'</strong><small>'+completed+'/12 reparos</small></div></div>'+
'<div class="district-levels">'+Array.from({length:12},(_,i)=>{const n=first+i,unlocked=n<=state.completed+1,stars=state.bestStars[n]||0;return '<button data-level="'+n+'" '+(unlocked?'':'disabled')+' class="district-button '+(stars?'won':'')+'"><strong>'+(i===11?'👑 ':'')+n+'</strong><small>'+(stars?'★'.repeat(stars):unlocked?'Jogar':'🔒')+'</small></button>';}).join('')+'</div>';
$('town-district').querySelector('.district-levels').addEventListener('click',ev=>{const b=ev.target.closest('[data-level]');if(!b||b.disabled)return;clearBoard();loadLevel(Number(b.dataset.level),false);switchScreen('play');});
}
function renderShop(){
$('shop-screen').innerHTML='<div class="shop-heading"><strong>🧰 Oficina do Vovô</strong><span>🪙 '+state.coins+'</span></div>'+
'<div class="shop-room"><div class="shop-window"></div><div class="shop-tools">🔧　🪛　🔨　⚙️</div><div class="shop-shelf">🧰　　 🔋　　 📡　　 🚁</div><div class="shop-table"></div><div class="shop-motto">Sempre existe um jeito de consertar!</div></div>'+
'<h3 class="shop-title">Ferramentas melhoráveis</h3><div class="upgrade-list">'+tools.map(t=>{const lvl=levelOf(t.id),price=t.price+lvl*60;return '<button class="upgrade-option" data-upgrade="'+t.id+'" '+(lvl>=t.max?'disabled':'')+'><span class="upgrade-icon">'+t.icon+'</span><span class="upgrade-label"><strong>'+t.name+'</strong><small>'+t.desc+'</small><em>Nível '+lvl+'/'+t.max+'</em></span><b>'+(lvl>=t.max?'MÁX.':'🪙 '+price)+'</b></button>';}).join('')+'</div>'+
'<h3 class="shop-title">📋 Serviços disponíveis</h3><div class="jobs">'+[Math.min(180,state.completed+1),Math.max(1,state.completed)].filter((n,i,a)=>a.indexOf(n)===i).map(n=>'<button data-job="'+n+'" class="job"><span>'+E.PLACES[Math.floor((n-1)/12)].icon+'</span><b>Reparo '+n+'</b><small>'+(n<=state.completed?'Revisitar':'Novo')+'</small></button>').join('')+'</div>'+
'<div class="shop-stat">⭐ '+state.stars+' estrelas　 ✅ '+state.completed+' reparos</div>';
$('shop-screen').querySelector('.upgrade-list').addEventListener('click',ev=>{const b=ev.target.closest('[data-upgrade]');if(b&&!b.disabled)buyUpgrade(b.dataset.upgrade);});
$('shop-screen').querySelector('.jobs').addEventListener('click',ev=>{const b=ev.target.closest('[data-job]');if(b){clearBoard();loadLevel(Number(b.dataset.job),false);switchScreen('play');}});
}
function buyUpgrade(id){
const t=tools.find(u=>u.id===id);if(!t)return;const lvl=levelOf(id),cost=t.price+lvl*60;if(lvl>=t.max)return;
if(state.coins<cost)return showModal('🪙','Saldo insuficiente','Ganhe moedas consertando os prédios da cidade.','Entendi');
state.coins-=cost;state.upgrades[id]=lvl+1;if(id==='diagnostic')state.tool=state.upgrades[id];
if(id==='battery')state.hearts=Math.min(5,state.hearts+1);
save();renderHeader();renderShop();sound(740);showModal(t.icon,'Melhoria adquirida!',t.name+' nível '+(lvl+1)+'. '+t.desc,'Continuar');
}
$('modal-ok').addEventListener('click',()=>{$('modal').classList.add('hidden');const fn=modalAction;modalAction=null;if(fn)fn();});
$('sound').addEventListener('click',()=>{state.sound=!state.sound;save();renderHeader();});
document.querySelectorAll('.nav').forEach(el=>el.addEventListener('click',()=>switchScreen(el.dataset.screen)));
loadLevel(state.level,true);switchScreen('play');
})();

/* FIXIT_PILOT_2D_703 - one original hand-authored animated 2D level. */
(function(){
'use strict';
const ROOT=document.getElementById('play-screen');if(!ROOT)return;
const SAVE='fixit-cartoon-pilot-v1';
const ORIGINAL=[{id:'curve-1',mask:6,rotation:2},{id:'line',mask:10,rotation:1},{id:'cap',mask:1,rotation:0},{id:'tee',mask:11,rotation:2},{id:'curve-2',mask:3,rotation:1},{id:'curve-3',mask:12,rotation:3}];
const HOLES=[5,1,2,6,10],SOLUTION=[11,6,10,12,3],DIR=[[0,-1],[1,0],[0,1],[-1,0]];
const turn=(mask,r)=>((mask<<r)|(mask>>>(4-r)))&15;
const CENTER=i=>({x:90+(i%4)*56,y:185+Math.floor(i/4)*56});
let parts=ORIGINAL.map(x=>({...x})),placed={},selected=null,moves=0,solved=false,history=[],failed=[],hintText='',pointer=null,ghost=null,ac=null;
const $=id=>document.getElementById(id);
const save=()=>{try{localStorage.setItem(SAVE,JSON.stringify({version:1,parts,placed,moves,solved}));}catch(e){}};
try{const s=JSON.parse(localStorage.getItem(SAVE)||'null');
if(s&&s.version===1&&Array.isArray(s.parts)&&s.placed&&Object.keys(s.placed).every(i=>HOLES.includes(Number(i)))){
const all=[...s.parts,...Object.values(s.placed)];if(all.length===6&&new Set(all.map(x=>x.id)).size===6&&all.every(x=>ORIGINAL.some(o=>o.id===x.id&&o.mask===x.mask))){parts=s.parts;placed=s.placed;moves=s.moves||0;solved=!!s.solved;}}
}catch(e){}
function note(text){hintText=text;render();}
function play(f=510){try{const p=JSON.parse(localStorage.getItem('fixit-alpha-state-v1')||'{}');if(p.sound===false)return;
const A=window.AudioContext||window.webkitAudioContext;if(!A)return;ac=ac||new A();const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;g.gain.value=.045;o.connect(g);g.connect(ac.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+.14);o.stop(ac.currentTime+.14);}catch(e){}}
function art(mask){let s='<svg viewBox="0 0 100 100" class="fi-piece-svg" aria-hidden="true"><circle cx="50" cy="50" r="43" fill="#fff" opacity=".1"/>';
for(let d=0;d<4;d++)if(mask&(1<<d)){const x=50+[0,49,0,-49][d],y=50+[-49,0,49,0][d];const p='M50 50L'+x+' '+y;
s+='<path d="'+p+'" stroke="#203b59" stroke-width="32" stroke-linecap="round"/><path d="'+p+'" stroke="#34acc8" stroke-width="23" stroke-linecap="round"/><path d="'+p+'" stroke="#90f1f7" stroke-width="12" stroke-linecap="round"/><path d="'+p+'" stroke="#eaffff" opacity=".58" stroke-width="3" stroke-linecap="round"/>';}
return s+'<circle cx="50" cy="50" r="13" fill="#ffe47a" stroke="#304c64" stroke-width="6"/><circle cx="46" cy="46" r="4" fill="#fff8ce"/></svg>';}
function worldArt(){return [
'<svg class="fi-illustration" viewBox="0 0 360 420" preserveAspectRatio="none" aria-hidden="true"><defs>',
'<linearGradient id="fiWall" x2="0" y2="1"><stop stop-color="#fff0b4"/><stop offset="1" stop-color="#ffd192"/></linearGradient>',
'<linearGradient id="fiCab" x2="1" y2="1"><stop stop-color="#7ad8d9"/><stop offset="1" stop-color="#35899e"/></linearGradient>',
'<pattern id="fiDots" width="29" height="29" patternUnits="userSpaceOnUse"><circle cx="5" cy="8" r="2" fill="#e39c76" opacity=".3"/></pattern>',
'</defs><rect width="360" height="420" fill="url(#fiWall)"/><path d="M0 326H360V420H0Z" fill="#e7a679"/><path d="M0 327H360" stroke="#b9786a" stroke-width="10"/><rect width="360" height="326" fill="url(#fiDots)"/>',
'<rect x="12" y="58" width="106" height="117" rx="13" fill="#f39a8c" stroke="#754967" stroke-width="5"/>',
'<rect x="22" y="68" width="86" height="97" rx="9" fill="#9cdded" stroke="#fff5d9" stroke-width="5"/><circle cx="85" cy="103" r="22" fill="#ffea88"/><path d="M23 153Q66 110 106 152V166H23Z" fill="#78c99b"/><path d="M64 68v99M23 117h83" stroke="#fff7d9" stroke-width="6"/>',
'<path d="M13 58q-12 40 0 113M117 59q13 46 0 114" stroke="#f5b5a4" stroke-width="12" fill="none"/>',
'<rect x="264" y="62" width="82" height="10" rx="5" fill="#6e4d6c"/><rect x="275" y="33" width="19" height="28" rx="3" fill="#ff987e" stroke="#72506c" stroke-width="4"/>',
'<path d="M284 41q-16-23-13-29q17 4 15 23q4-25 21-24q-1 22-23 30" fill="#74c896" stroke="#509769" stroke-width="3"/>',
'<rect x="313" y="41" width="20" height="19" rx="3" fill="#ffe48d" stroke="#72506c" stroke-width="4"/>',
'<rect x="131" y="68" width="63" height="60" rx="8" fill="#ffdf9d" stroke="#774d70" stroke-width="5"/><circle cx="162" cy="96" r="17" fill="#f0a976"/><circle cx="158" cy="91" r="2.5" fill="#49395b"/><circle cx="169" cy="91" r="2.5" fill="#49395b"/><path d="M156 102q8 7 16 0" stroke="#ad5f76" stroke-width="3" fill="none"/>',
'<ellipse cx="172" cy="365" rx="160" ry="35" fill="#f4bf9a" stroke="#bd7d82" stroke-width="6"/>',
'<rect x="18" y="305" width="57" height="62" rx="9" fill="#ef96a9" stroke="#6d4672" stroke-width="5"/><rect x="13" y="290" width="67" height="31" rx="12" fill="#ffbbc0" stroke="#6d4672" stroke-width="5"/>',
'<path d="M27 363v10M68 363v10" stroke="#6d4672" stroke-width="7"/>',
'<path d="M320 304h23v59h-23Z" fill="#ef9678" stroke="#724a69" stroke-width="5"/><path d="M330 305v-35" stroke="#619967" stroke-width="7"/><path d="M328 284q-20-30-28-29q-2 24 28 29q13-28 30-28q-2 25-30 28" fill="#6ac27e" stroke="#4a9663" stroke-width="4"/>',
'<path d="M258 185h29v-39h17M258 297h29v28h17" fill="none" stroke="#604a70" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>',
'<path class="fi-live-cables" d="M258 185h29v-39h17M258 297h29v28h17" fill="none" stroke="#fff6a8" stroke-width="5" stroke-linecap="round" stroke-dasharray="8 11"/>',
'<path d="M306 105v20" stroke="#75506c" stroke-width="7"/><path d="M280 130q5-31 27-31q24 0 29 31Z" fill="#fb9a76" stroke="#73506d" stroke-width="5"/>',
'<ellipse cx="307" cy="156" rx="40" ry="32" fill="#fff2a0" class="fi-light-glow"/><circle cx="307" cy="146" r="12" fill="#ffe6b0" stroke="#77506d" stroke-width="5"/>',
'<path class="fi-light-rays" d="M307 166v15M283 160l-10 9M331 160l10 9" stroke="#ffe572" stroke-width="6" fill="none" stroke-linecap="round"/>',
'<g transform="translate(307 326)"><circle r="27" fill="#b3ebed" stroke="#77506d" stroke-width="6"/>',
'<g class="fi-fan-blades"><path d="M0 0Q-27-38-36-12Q-35 2 0 0Q25 32 34 7Q29-13 0 0Q15-36-5-37Q-21-34 0 0" fill="#61bdd2" stroke="#4e7f9d" stroke-width="3"/></g><circle r="7" fill="#fff1a4" stroke="#70536c" stroke-width="3"/></g>',
'<rect x="61" y="154" width="233" height="176" rx="18" fill="#795172" opacity=".28"/>',
'<rect x="61" y="147" width="233" height="178" rx="18" fill="#293d65" stroke="#765078" stroke-width="7"/>',
'<rect x="68" y="154" width="219" height="163" rx="12" fill="url(#fiCab)" stroke="#ddfff0" stroke-width="3"/>',
'<path d="M73 171h209" stroke="#d3fff1" stroke-opacity=".54" stroke-width="4"/>',
'<g fill="#ffeca6" stroke="#615071" stroke-width="2"><circle cx="76" cy="165" r="4"/><circle cx="278" cy="165" r="4"/><circle cx="76" cy="306" r="4"/><circle cx="278" cy="306" r="4"/></g>',
'<g opacity=".38" stroke="#dbfff4" stroke-width="3" stroke-dasharray="3 7"><path d="M90 185H258M90 241H258M90 297H258M90 185V297M146 185V297M202 185V297M258 185V297"/></g>',
'<path d="M28 241H90" stroke="#644b75" stroke-width="13"/><path class="fi-input-cable" d="M30 241H90" stroke="#ffe78e" stroke-width="5" stroke-dasharray="9 10"/>',
'<rect x="13" y="218" width="39" height="46" rx="10" fill="#ffdb87" stroke="#705173" stroke-width="5"/><path d="M29 227l-7 17h9l-6 13 17-22h-10l5-8Z" fill="#fff7c5" stroke="#ecac58" stroke-width="2"/>',
'<g class="fi-mascot" transform="translate(34 150)"><path d="M-14-2q-13-8-9-23q10-13 26-5q17-9 24 6q2 14-10 22l-3 15h-23Z" fill="#ffe78b" stroke="#705174" stroke-width="5"/><circle cx="-4" cy="-16" r="3" fill="#473958"/><circle cx="13" cy="-16" r="3" fill="#473958"/><path d="M0-6q7 6 13 0" stroke="#b7627a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M-10 12l-6 9M15 12l6 9" stroke="#705174" stroke-width="4" stroke-linecap="round"/></g>',
'<path d="M0 391H360M91 333V420M263 333V420" stroke="#ce865f" stroke-width="4" opacity=".38"/>',
'<circle class="fi-spark" cx="132" cy="93" r="3" fill="white"/><circle class="fi-spark fi-spark2" cx="235" cy="89" r="4" fill="#fff9bc"/>',
'</svg>'].join('');}
function label(mask){const b=mask.toString(2).replace(/0/g,'').length;return b===1?'Tampa':b===3?'Três vias':b===2?(mask===5||mask===10?'Reto':'Curva'):'Peça';}
function snapshot(){history.push({parts:parts.map(x=>({...x})),placed:Object.fromEntries(Object.entries(placed).map(([i,x])=>[i,{...x}])),moves,solved});if(history.length>24)history.shift();}
function evaluate(){
const masks={4:2,3:8,11:8};for(const [k,t] of Object.entries(placed))masks[k]=turn(t.mask,t.rotation);
const seen=new Set([4]),queue=[4],faults=new Set();
while(queue.length){const i=queue.shift(),m=masks[i]||0;for(let d=0;d<4;d++)if(m&(1<<d)){const x=(i%4)+DIR[d][0],y=Math.floor(i/4)+DIR[d][1],j=y*4+x;
if(x<0||x>3||y<0||y>2||!((masks[j]||0)&(1<<((d+2)%4)))){faults.add(i);continue;}
if(!seen.has(j)){seen.add(j);queue.push(j);}}}
return {complete:HOLES.every(i=>!!placed[i])&&seen.has(3)&&seen.has(11)&&faults.size===0,filled:HOLES.every(i=>!!placed[i]),powered:Number(seen.has(3))+Number(seen.has(11)),leaks:faults.size,faults:[...faults]};
}
function render(){
ROOT.classList.add('fi-pilot');
let html='<section class="fi-head"><div><small>CAPÍTULO 01 · CASA DA LILA</small><strong>Uma casa sem energia!</strong></div><span class="fi-pill">FASE PILOTO <b>01</b></span></section>';
html+='<section class="fi-scene"><div class="fi-world '+(solved?'fi-powered':'')+'">'+worldArt()+'<div class="fi-world-header"><span>⚡ PAINEL DE REPAROS</span><span>💡 + 🌀</span></div><div class="fi-nodes">';
for(let i=0;i<12;i++){const c=CENTER(i),type=i===4?'source':i===3?'lamp':i===11?'fan':HOLES.includes(i)?'socket':'empty';if(type==='empty')continue;
const part=placed[i],mask=part?turn(part.mask,part.rotation):type==='source'?2:type==='lamp'||type==='fan'?8:0;
html+='<button data-slot="'+i+'" class="fi-node '+type+(part?' filled':'')+(failed.includes(i)?' wrong':'')+'" style="left:'+(100*c.x/360)+'%;top:'+(100*c.y/420)+'%" aria-label="'+(type==='socket'?(part?'Girar peça':'Encaixe vazio'):type)+'" '+(type==='socket'?'':'disabled')+'>'+(mask?art(mask):'<span class="fi-plus">+</span>')+(type==='source'?'<span class="fi-badge">IN</span>':type==='lamp'?'<span class="fi-badge">💡</span>':type==='fan'?'<span class="fi-badge">🌀</span>':'')+'</button>';
}
html+='</div><div class="fi-scene-caption">'+(solved?'✓ Agora a casa está funcionando!':'Toque ou arraste cada peça até um encaixe.')+'</div>'+(solved?'<div class="fi-done-stamp">✨ CONSERTADO! ✨</div>':'')+'</div></section>';
html+='<section class="fi-tray"><div class="fi-tray-label"><span>🧰 <b>SEU ESTOJO</b></span><small>'+parts.length+' peças disponíveis</small></div><div class="fi-part-list" id="fi-part-list">';
html+=parts.map(p=>'<button class="fi-part'+(selected===p.id?' selected':'')+'" data-part="'+p.id+'" aria-label="'+label(p.mask)+' para encaixar">'+art(turn(p.mask,p.rotation))+'<span>'+label(p.mask)+'</span></button>').join('')||'<p>Todas as peças estão na placa.</p>';
html+='</div></section><div class="fi-actions"><button id="fi-hint" class="fi-secondary" '+(solved?'disabled':'')+'>💡 Dica</button><button id="fi-undo" class="fi-secondary" '+(!history.length?'disabled':'')+'>↶ Desfazer</button><button id="fi-test" class="fi-primary">'+(solved?'↻ RECOMEÇAR':'⚡ TESTAR')+'</button></div><p class="fi-feedback" aria-live="polite">'+(hintText||'Conecte a fonte aos dois aparelhos. Cuidado com os curtos!')+'</p>';
ROOT.innerHTML=html;
}
function actionPlace(id,index){if(solved||!HOLES.includes(index))return;const item=parts.find(p=>p.id===id);if(!item)return;snapshot();if(placed[index])parts.push(placed[index]);placed[index]={...item};parts=parts.filter(p=>p.id!==id);selected=null;moves++;failed=[];hintText='Peça encaixada! Toque nela para girar.';save();play();render();}
function spin(index){if(solved||!placed[index])return;snapshot();placed[index].rotation=(placed[index].rotation+1)%4;moves++;failed=[];hintText='Peça girada. Agora teste o circuito.';save();play(610);render();}
function remove(index){if(solved||!placed[index])return;snapshot();parts.push(placed[index]);delete placed[index];moves++;save();hintText='Peça devolvida ao estojo.';render();}
function undo(){const s=history.pop();if(!s)return;parts=s.parts;placed=s.placed;moves=s.moves;solved=s.solved;selected=null;failed=[];hintText='Última ação desfeita.';save();render();}
function hint(){if(solved)return;
const index=HOLES.find((i,k)=>!placed[i]||turn(placed[i].mask,placed[i].rotation)!==SOLUTION[k]);
if(index===undefined){hintText='As peças parecem corretas. Aperte TESTAR!';render();return;}
const mask=SOLUTION[HOLES.indexOf(index)];
const t=[...parts,placed[index]].filter(Boolean).find(p=>[0,1,2,3].some(r=>turn(p.mask,r)===mask));
if(!t){hintText='Retire uma peça errada: toque e segure para removê-la.';render();return;}
snapshot();if(placed[index])parts.push(placed[index]);parts=parts.filter(p=>p.id!==t.id);
placed[index]={...t,rotation:[0,1,2,3].find(r=>turn(t.mask,r)===mask)};
selected=null;moves++;save();play(840);hintText='Dica aplicada! Continue encaixando.';render();}
function reset(){parts=ORIGINAL.map(p=>({...p}));placed={};selected=null;moves=0;solved=false;history=[];failed=[];hintText='Uma nova tentativa. Você consegue!';save();render();}
function test(){
if(solved){reset();return;}const r=evaluate();if(r.complete){solved=true;hintText='Tudo ligado! Você restaurou a Casa da Lila.';save();play(970);render();
try{const state=JSON.parse(localStorage.getItem('fixit-alpha-state-v1')||'{}');if(!(state.bestStars&&state.bestStars['1'])){state.bestStars={...(state.bestStars||{}),1:3};state.completed=Math.max(1,state.completed||0);state.stars=(state.stars||0)+3;state.coins=(state.coins||0)+50;localStorage.setItem('fixit-alpha-state-v1',JSON.stringify(state));const coin=$('coins');if(coin)coin.textContent='🪙 '+state.coins;}}catch(e){}
const conf=document.createElement('div');conf.className='fi-confetti';conf.innerHTML=Array.from({length:22},(_,i)=>'<i style="--pos:'+((i*37)%100)+'%;--delay:'+((i%7)*.1)+'s;--r:'+((i*31)%360)+'deg"></i>').join('');ROOT.appendChild(conf);setTimeout(()=>conf.remove(),2200);return;}
play(170);failed=r.faults;
hintText=!r.filled?'Faltam '+HOLES.filter(i=>!placed[i]).length+' peças na placa.':r.leaks?'Curto! Gire ou troque a peça destacada.':'Os dois aparelhos precisam receber energia.';
render();const scene=ROOT.querySelector('.fi-world');if(scene){scene.classList.add('fi-shake');setTimeout(()=>scene.classList.remove('fi-shake'),450);}
}
ROOT.addEventListener('click',ev=>{
const part=ev.target.closest('[data-part]');if(part){selected=selected===part.dataset.part?null:part.dataset.part;play(450);hintText=selected?'Agora toque em um círculo com +.':'';render();return;}
const slot=ev.target.closest('[data-slot]');if(slot){const i=Number(slot.dataset.slot);if(selected)actionPlace(selected,i);else spin(i);return;}
if(ev.target.closest('#fi-hint'))hint();else if(ev.target.closest('#fi-undo'))undo();else if(ev.target.closest('#fi-test'))test();
});
ROOT.addEventListener('contextmenu',ev=>{const s=ev.target.closest('.fi-node.filled');if(s){ev.preventDefault();remove(Number(s.dataset.slot));}});
let hold=null;
ROOT.addEventListener('pointerdown',ev=>{const p=ev.target.closest('[data-part]');if(p&&!solved){pointer={id:p.dataset.part,x:ev.clientX,y:ev.clientY,dragging:false};return;}
const slot=ev.target.closest('.fi-node.filled');if(slot&&!solved&&ev.pointerType==='touch'){
hold=setTimeout(()=>{remove(Number(slot.dataset.slot));hold=null;},650);
}});
ROOT.addEventListener('pointermove',()=>{if(hold){clearTimeout(hold);hold=null;}});
ROOT.addEventListener('pointerup',()=>{if(hold){clearTimeout(hold);hold=null;}});
document.addEventListener('pointermove',ev=>{if(!pointer)return;if(!pointer.dragging&&Math.hypot(ev.clientX-pointer.x,ev.clientY-pointer.y)>12){pointer.dragging=true;const t=parts.find(p=>p.id===pointer.id);if(t){ghost=document.createElement('div');ghost.className='fi-drag-ghost';ghost.innerHTML=art(turn(t.mask,t.rotation));document.body.appendChild(ghost);}}
if(ghost){ghost.style.left=(ev.clientX-28)+'px';ghost.style.top=(ev.clientY-28)+'px';}});
document.addEventListener('pointerup',ev=>{if(!pointer)return;if(pointer.dragging){const el=document.elementFromPoint&&document.elementFromPoint(ev.clientX,ev.clientY);const target=el&&el.closest('[data-slot]');if(target&&ROOT.contains(target))actionPlace(pointer.id,Number(target.dataset.slot));else{selected=pointer.id;render();}}
if(ghost)ghost.remove();ghost=null;pointer=null;});
document.addEventListener('pointercancel',()=>{if(ghost)ghost.remove();ghost=null;pointer=null;});
document.querySelectorAll('.nav').forEach(n=>n.addEventListener('click',()=>{if(n.dataset.screen==='play')render();}));
const brow=document.querySelector('.eyebrow');if(brow)brow.textContent='BRIGHTVALE · CARTOON 2D · v703';
render();
window.FixPilot703={evaluate,place:actionPlace,spin,undo,test,reset,getState:()=>({parts,placed,solved,moves})};
})();