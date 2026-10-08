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


/* FIXIT_PLAY_V707 — original cartoon art + independently interactive controls */
(function(){
'use strict';
const root=document.getElementById('play-screen');if(!root)return;
const KEY='fixit-ref704-session',PROGRESS='fixit-alpha-state-v1';
const HOLES=[1,2,5,6,10],GOAL={1:14,2:14,5:1,6:5,10:3};
const TYPES=[['cap-a',1,'Tampa'],['straight-b',5,'Reto'],['curve-a',3,'Curva'],['tee-a',11,'Três vias'],['tee-b',11,'Três vias'],['curve-b',3,'Curva']];
const BASE=TYPES.map(t=>({id:t[0],m:t[1],r:0,name:t[2]}));
const CX=[224,385,545,705],CY=[619,780,940],TX=[125,260,395,530,665,800];
const rot=(m,r)=>((m<<r)|(m>>>(4-r)))&15,at=(x,y)=>'left:'+(100*x/941)+'%;top:'+(100*y/1672)+'%';
let items=BASE.map(p=>({...p})),placed={},selected=null,undoStack=[],solved=false,errors=[],message='',ghost=null,drag=null,audio=null,longPress=null;
try{const s=JSON.parse(localStorage.getItem(KEY)||'null');
if(s&&Array.isArray(s.inventory)&&s.placed&&typeof s.placed==='object'){
let all=[...s.inventory,...Object.values(s.placed)];
if(all.length===6&&new Set(all.map(p=>p.id)).size===6&&all.every(p=>BASE.some(q=>q.id===p.id&&q.m===p.m))&&Object.keys(s.placed).every(k=>HOLES.includes(+k))){items=s.inventory.map(p=>({...p}));placed=s.placed;solved=!!s.won;}
}}catch(_){}
function save(){try{localStorage.setItem(KEY,JSON.stringify({inventory:items,placed,won:solved}));}catch(_){}}
function stack(){undoStack.push({items:items.map(p=>({...p})),placed:Object.fromEntries(Object.entries(placed).map(([k,p])=>[k,{...p}])),solved});if(undoStack.length>24)undoStack.shift();}
function beep(freq){try{const s=JSON.parse(localStorage.getItem(PROGRESS)||'{}');if(s.sound===false)return;const C=window.AudioContext||window.webkitAudioContext;if(!C)return;audio=audio||new C();let o=audio.createOscillator(),g=audio.createGain();o.frequency.value=freq;g.gain.setValueAtTime(.036,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.14);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.15);}catch(_){}}
function sprite(m){
const directions=[0,1,2,3].filter(d=>m&(1<<d)),end=[[50,5],[95,50],[50,95],[5,50]];
let path='';
const opposite=directions.length===2&&(directions[0]+2)%4===directions[1];
if(directions.length===2&&!opposite){
const a=end[directions[0]],b=end[directions[1]];
path='M'+a[0]+' '+a[1]+' L'+((a[0]+50)/2)+' '+((a[1]+50)/2)+' Q50 50 '+((b[0]+50)/2)+' '+((b[1]+50)/2)+' L'+b[0]+' '+b[1];
}else if(opposite){let a=end[directions[0]],b=end[directions[1]];path='M'+a[0]+' '+a[1]+' L'+b[0]+' '+b[1];}
else path=directions.map(d=>'M50 50L'+end[d][0]+' '+end[d][1]).join(' ');
let result='<svg viewBox="0 0 100 100" class="r707-pipe" aria-hidden="true"><defs><linearGradient id="steel707" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#182c42"/><stop offset=".38" stop-color="#45617c"/><stop offset=".67" stop-color="#283b56"/><stop offset="1" stop-color="#13253a"/></linearGradient><linearGradient id="joint707" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#dbfaff"/><stop offset=".35" stop-color="#8ee8fd"/><stop offset=".8" stop-color="#4ba5db"/><stop offset="1" stop-color="#215381"/></linearGradient></defs>';
result+='<path d="'+path+'" fill="none" stroke="#102338" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><path d="'+path+'" fill="none" stroke="url(#steel707)" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/><path d="'+path+'" fill="none" opacity=".6" stroke="#8ebdd4" stroke-linecap="round" stroke-width="4"/>';
for(let d of directions){let x=end[d][0],y=end[d][1],vertical=d%2===0;result+='<rect x="'+(x-(vertical?17:9))+'" y="'+(y-(vertical?9:17))+'" width="'+(vertical?34:18)+'" height="'+(vertical?18:34)+'" rx="3" fill="url(#joint707)" stroke="#25425d" stroke-width="3"/>';}
if(directions.length>=3)result+='<circle cx="50" cy="50" r="13" fill="#2e526d" stroke="#80cde9" stroke-width="5"/>';
return result+'</svg>';
}
function fan(){return '<span class="r707-rotor"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#b5ebff" stroke="#1f4879" stroke-width="7"/><g class="r707-fan-blades"><path d="M50 50Q6 7 39 7Q61 12 50 50 Q92 9 93 44Q88 65 50 50 Q90 92 58 94Q35 89 50 50 Q8 91 7 55Q13 33 50 50" fill="#44a7e9" stroke="#2d74bb" stroke-width="3"/></g><circle cx="50" cy="50" r="12" fill="#8ce4ff" stroke="#254d79" stroke-width="5"/></svg></span>';}
function evaluate(){
const mask={0:2,3:8,11:8};for(const [i,p] of Object.entries(placed))mask[+i]=rot(p.m,p.r);
const seen=new Set([0]),q=[0],bad=new Set(),directions=[[0,-1],[1,0],[0,1],[-1,0]];
while(q.length){const i=q.shift(),m=mask[i]||0;for(let d=0;d<4;d++)if(m&(1<<d)){const nx=i%4+directions[d][0],ny=Math.floor(i/4)+directions[d][1],j=ny*4+nx;if(nx<0||nx>3||ny<0||ny>2||!((mask[j]||0)&(1<<((d+2)%4)))){bad.add(i);continue;}if(!seen.has(j)){seen.add(j);q.push(j);}}}
return {complete:HOLES.every(i=>!!placed[i])&&seen.has(3)&&seen.has(11)&&bad.size===0,leaks:[...bad],powered:seen.has(3)&&seen.has(11)};
}
function draw(){
root.classList.add('r707-root');document.body.classList.add('r707-play');document.body.classList.remove('r704-play');
let s={};try{s=JSON.parse(localStorage.getItem(PROGRESS)||'{}')}catch(_){}
let html='<div class="r707-viewport"><div class="r707-info-top"><b>⚡ REPARO 01</b><span>Conecte a luminária e o ventilador</span></div><div class="r707-stage '+(solved?'won':'')+'"><div class="r707-background"></div>';
html+='<span class="r707-count r707-lives" style="'+at(416,62)+'">'+(s.hearts??5)+'/5</span><span class="r707-count r707-money" style="'+at(692,62)+'">'+(s.coins??70)+'</span>';
html+='<div class="r707-cells">';
for(let i=0;i<12;i++){let type=i===0?'source':i===3?'lamp':i===11?'fan':HOLES.includes(i)?'socket':'empty',p=placed[i],fixed=!HOLES.includes(i);html+='<button class="r707-cell '+type+(p?' filled':'')+(errors.includes(i)?' wrong':'')+'" style="'+at(CX[i%4],CY[Math.floor(i/4)])+'" '+(fixed?'disabled':'data-slot="'+i+'"')+' aria-label="'+(p?'Girar peça':fixed?type:'Encaixe vazio')+'">'+(p?sprite(rot(p.m,p.r)):i===11?fan():'')+'</button>';}
html+='</div><div class="r707-tray-surface"></div><div class="r707-inventory">';
for(let j=0;j<BASE.length;j++){const spec=BASE[j],p=items.find(v=>v.id===spec.id);html+='<button class="r707-piece '+(!p?'used':'')+(selected===spec.id?' selected':'')+'" style="'+at(TX[j],1197)+'" '+(p?'data-part="'+spec.id+'"':'disabled')+' aria-label="'+(p?'Selecionar '+spec.name:'Peça utilizada')+'">'+(p?sprite(rot(p.m,p.r)):'')+'</button>';}
html+='</div>';
html+='<button class="r707-hot r707-settings" data-action="settings" aria-label="Configurações" style="'+at(854,61)+'"></button>';
html+='<button class="r707-hot r707-hint" data-action="hint" aria-label="Dica" style="'+at(151,1370)+'"></button><button class="r707-hot r707-undo" data-action="undo" aria-label="Desfazer" style="'+at(419,1370)+'"></button><button class="r707-hot r707-test" data-action="test" aria-label="'+(solved?'Recomeçar':'Testar')+'" style="'+at(724,1370)+'"></button>';
html+='<button class="r707-hot r707-nav-play" data-nav="play" style="'+at(156,1550)+'" aria-label="Jogar"></button><button class="r707-hot r707-nav-city" data-nav="city" style="'+at(457,1550)+'" aria-label="Cidade"></button><button class="r707-hot r707-nav-shop" data-nav="shop" style="'+at(775,1550)+'" aria-label="Oficina"></button>';
html+='<div class="r707-glow"></div><div class="r707-character-reaction">✨ Conseguimos!</div><div class="r707-victory">✨ CONSERTADO! ✨</div></div><div class="r707-info-bottom" role="status">'+(message||'Toque para escolher ou arraste • Segure uma peça no painel para devolver')+'</div></div>';
root.innerHTML=html;
}
function place(id,i){if(solved||!HOLES.includes(+i))return;const item=items.find(p=>p.id===id);if(!item)return;stack();if(placed[i])items.push(placed[i]);placed[i]={...item};items=items.filter(p=>p.id!==id);selected=null;errors=[];message='Peça encaixada. Toque para girar.';save();beep(550);draw();}
function spin(i){if(solved||!placed[i])return;stack();placed[i].r=(placed[i].r+1)%4;errors=[];message='Peça girada.';save();beep(670);draw();}
function remove(i){if(solved||!placed[i])return;stack();items.push(placed[i]);delete placed[i];selected=null;message='Peça devolvida à bandeja.';save();draw();}
function undo(){let s=undoStack.pop();if(!s)return;items=s.items;placed=s.placed;solved=s.solved;selected=null;errors=[];message='Último movimento desfeito.';save();draw();}
function hint(){if(solved)return;const i=HOLES.find(j=>!placed[j]||rot(placed[j].m,placed[j].r)!==GOAL[j]);if(i===undefined){message='Pronto. Toque em Testar!';draw();return;}const p=[...items,placed[i]].filter(Boolean).find(v=>[0,1,2,3].some(r=>rot(v.m,r)===GOAL[i]));if(!p){message='Retire a peça errada e tente novamente.';draw();return;}stack();if(placed[i])items.push(placed[i]);items=items.filter(v=>v.id!==p.id);placed[i]={...p,r:[0,1,2,3].find(r=>rot(p.m,r)===GOAL[i])};selected=null;errors=[];message='Dica aplicada!';save();beep(820);draw();}
function reset(){items=BASE.map(p=>({...p}));placed={};selected=null;undoStack=[];solved=false;errors=[];message='Tente novamente!';save();draw();}
function test(){if(solved){reset();return;}const result=evaluate();if(result.complete){solved=true;errors=[];message='Casa restaurada! Lâmpada acesa e ventilador ligado.';try{const s=JSON.parse(localStorage.getItem(PROGRESS)||'{}');s.bestStars=s.bestStars||{};if(!s.bestStars[1]){s.bestStars[1]=3;s.completed=Math.max(1,s.completed||0);s.stars=(s.stars||0)+3;s.coins=(s.coins||0)+50;localStorage.setItem(PROGRESS,JSON.stringify(s));}}catch(_){}save();beep(960);draw();const conf=document.createElement('div');conf.className='r707-confetti';conf.innerHTML=Array.from({length:24},(_,i)=>'<i style="left:'+((i*43)%96)+'%;animation-delay:'+((i%6)*.1)+'s"></i>').join('');root.querySelector('.r707-stage').appendChild(conf);setTimeout(()=>conf.remove(),2200);return;}errors=result.leaks;message=HOLES.some(i=>!placed[i])?'Ainda existem encaixes vazios.':'Conexão incorreta. Gire ou troque as peças destacadas.';beep(230);draw();const s=root.querySelector('.r707-stage');s.classList.add('r707-shake');setTimeout(()=>s.classList.remove('r707-shake'),430);}
function nav(name){const btn=document.querySelector('.bottom-nav .nav[data-screen="'+name+'"]');if(btn)btn.click();document.body.classList.toggle('r707-play',name==='play');if(name==='play')draw();}
root.addEventListener('click',e=>{const item=e.target.closest('[data-part]');if(item){selected=selected===item.dataset.part?null:item.dataset.part;message=selected?'Toque em um encaixe vazio.':'';beep(440);draw();return;}const cell=e.target.closest('[data-slot]');if(cell){let i=+cell.dataset.slot;if(selected)place(selected,i);else spin(i);return;}const action=e.target.closest('[data-action]');if(action){switch(action.dataset.action){case 'settings':document.getElementById('settings-btn')?.click();break;case 'hint':hint();break;case 'undo':undo();break;case 'test':test();break;}return;}const tab=e.target.closest('[data-nav]');if(tab)nav(tab.dataset.nav);});
root.addEventListener('contextmenu',e=>{const cell=e.target.closest('[data-slot]');if(cell&&placed[+cell.dataset.slot]){e.preventDefault();remove(+cell.dataset.slot);}});
root.addEventListener('pointerdown',e=>{const p=e.target.closest('[data-part]');if(p){drag={id:p.dataset.part,x:e.clientX,y:e.clientY,active:false};return;}const cell=e.target.closest('[data-slot]');if(cell&&placed[+cell.dataset.slot]&&e.pointerType==='touch'){const i=+cell.dataset.slot;longPress=setTimeout(()=>{longPress=null;remove(i);},680);}});
root.addEventListener('pointermove',()=>{if(longPress){clearTimeout(longPress);longPress=null;}});
root.addEventListener('pointerup',()=>{if(longPress){clearTimeout(longPress);longPress=null;}});
document.addEventListener('pointermove',e=>{if(!drag)return;if(!drag.active&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>12){drag.active=true;const item=items.find(p=>p.id===drag.id);if(!item)return;ghost=document.createElement('div');ghost.className='r707-drag-ghost';ghost.innerHTML=sprite(rot(item.m,item.r));document.body.appendChild(ghost);}if(ghost){ghost.style.left=(e.clientX-28)+'px';ghost.style.top=(e.clientY-28)+'px';}});
document.addEventListener('pointerup',e=>{if(!drag)return;const d=drag;drag=null;ghost?.remove();ghost=null;if(!d.active)return;const cell=document.elementFromPoint?.(e.clientX,e.clientY)?.closest('[data-slot]');if(cell&&root.contains(cell))place(d.id,+cell.dataset.slot);else{selected=d.id;draw();}});
document.addEventListener('pointercancel',()=>{drag=null;ghost?.remove();ghost=null;});
document.querySelectorAll('.bottom-nav .nav').forEach(n=>n.addEventListener('click',()=>{const active=n.dataset.screen==='play';document.body.classList.toggle('r707-play',active);if(active)draw();}));
const brow=document.querySelector('.eyebrow');if(brow)brow.textContent='BRIGHTVALE · NOVA FASE 2D · V707';
draw();window.FixRepair707={evaluate,place,spin,remove,undo,hint,test,reset,getState:()=>({items,placed,solved}),draw};
})();