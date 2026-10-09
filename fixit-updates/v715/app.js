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


/* FIXIT_FOUNDATION_V715: four authored puzzles, no test button, automatic completion */
(function(){
'use strict';
const root=document.getElementById('play-screen');if(!root)return;
const PROGRESS='fixit-alpha-state-v1',SAVE='fixit-foundation715-progress',TOTAL=4;
const CX=[224,385,545,705],CY=[619,780,940],rot=(m,r)=>((m<<r)|(m>>>(4-r)))&15;
const at=(x,y)=>'left:'+(100*x/941)+'%;top:'+(100*y/1672)+'%';
const TITLES=['Primeira luz','Fio torto','Trecho fixo','Duas possibilidades'];
const LESSONS=['TOQUE NA CURVA AMARELA PARA ACENDER A LUZ.',
 'GIRE AS DUAS CURVAS E A RETA PARA LIGAR A LÂMPADA.',
 'OS FIOS PARAFUSADOS NÃO GIRAM. ENCONTRE O CAMINHO.',
 'ESCOLHA A ROTA QUE NÃO TERMINA EM PONTA SOLTA.'];
// Four manually designed layouts: [wire edges], fixed sockets, rotatable sockets,
// initial orientations and a visible non-energized dead-end branch (stage 4).
const DESIGNS=[
 {edges:[[0,4],[4,5],[5,1],[1,2],[2,3]],fixed:[4,5,2],turn:[1],offset:[3],decoy:{}},
 {edges:[[0,4],[4,5],[5,6],[6,2],[2,3]],fixed:[4],turn:[5,6,2],offset:[3,2,3],decoy:{}},
 {edges:[[0,4],[4,8],[8,9],[9,5],[5,6],[6,2],[2,3]],fixed:[4,8,9,5],turn:[6,2],offset:[2,3],decoy:{}},
 {edges:[[0,4],[4,5],[5,1],[1,2],[2,3]],fixed:[4,1,2],turn:[5],offset:[2],decoy:{9:3,10:8}}
];
const direction=(a,b)=>{if(b===a-4)return 1;if(b===a+1&&a%4<3)return 2;if(b===a+4)return 4;if(b===a-1&&a%4>0)return 8;throw Error('Not adjacent '+a+'/'+b)};
function createLevel(n){
 const d=DESIGNS[n-1];if(!d)throw Error('Only four Foundation stages');
 const masks=Array(12).fill(0);
 for(const [a,b] of d.edges){masks[a]|=direction(a,b);masks[b]|=direction(b,a);}
 if(masks[0]!==4||masks[3]!==8)throw Error('Invalid source or lamp '+n);
 const fixed={...d.decoy},start={},goal={};
 for(const i of d.fixed)fixed[i]=masks[i];
 d.turn.forEach((i,k)=>{goal[i]=masks[i];start[i]=rot(masks[i],d.offset[k]);if(start[i]===goal[i])throw Error('Initially solved '+n)});
 return {name:TITLES[n-1],sourceMask:masks[0],holes:[...d.turn],fixed,start,goal,decoy:Object.keys(d.decoy).map(Number)};
}
let currentLevel=1,unlocked=1,completed=[],picker=false;
try{
 const saved=JSON.parse(localStorage.getItem(SAVE)||'{}');
 if(saved.version===715){completed=(saved.completed||[]).filter(n=>Number.isInteger(n)&&n>=1&&n<=TOTAL);
 unlocked=Math.min(TOTAL,Math.max(1,Number(saved.unlocked)||1,...completed.map(n=>n+1)));
 currentLevel=Math.min(unlocked,Math.max(1,Number(saved.current)||1));}
 // Deliberately ignore old 20-stage progress: old data remains intact but inactive.
}catch(_){}
let SOURCE_MASK=4,HOLES=[],GOAL={},FIXED={},placed={},solved=false;
let moves=0,hints=0,history=[],errors=[],message='',autoTimer=null,audio=null,pointer=null,suppressUntil=0;
const levelKey=n=>'fixit-foundation715-level-'+n;
function saveProgress(){try{localStorage.setItem(SAVE,JSON.stringify({version:715,unlocked,current:currentLevel,completed}));}catch(_){}}
function save(){try{localStorage.setItem(levelKey(currentLevel),JSON.stringify({version:715,turns:Object.fromEntries(HOLES.map(i=>[i,placed[i].r])),moves,hints,won:solved}));}catch(_){}}
function loadLevel(n){
 if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}
 currentLevel=Math.min(unlocked,Math.max(1,Math.min(TOTAL,Number(n)||1)));
 const cfg=createLevel(currentLevel);
 SOURCE_MASK=cfg.sourceMask;HOLES=cfg.holes;GOAL=cfg.goal;FIXED=cfg.fixed;
 placed={};solved=false;moves=0;hints=0;history=[];errors=[];message='';picker=false;
 for(const [i,m] of Object.entries(FIXED))placed[i]={id:'fixed-'+i,m,r:0,fixed:true};
 for(const [i,m] of Object.entries(cfg.start))placed[i]={id:'wire-'+i,m,r:0,fixed:false};
 try{const saved=JSON.parse(localStorage.getItem(levelKey(currentLevel))||'null');
  if(saved?.version===715&&saved.turns){
   for(const i of HOLES){const t=Number(saved.turns[i]);if(Number.isInteger(t)&&t>=0&&t<=3)placed[i].r=t;}
   moves=Math.max(0,Number(saved.moves)||0);hints=Math.max(0,Number(saved.hints)||0);
   solved=!!saved.won&&completed.includes(currentLevel);
  }}catch(_){}
 saveProgress();return currentLevel;
}
function stack(){history.push({turns:Object.fromEntries(HOLES.map(i=>[i,placed[i].r])),moves,hints});if(history.length>40)history.shift();}
loadLevel(currentLevel);
function beep(freq){try{const s=JSON.parse(localStorage.getItem(PROGRESS)||'{}');if(s.sound===false)return;const C=window.AudioContext||window.webkitAudioContext;if(!C)return;audio=audio||new C();const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=freq;g.gain.setValueAtTime(.035,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.14);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.15);}catch(_){}}
function maskAt(i){if(i===0)return SOURCE_MASK;if(i===3)return 8;const p=placed[i];return p?rot(p.m,p.r):0;}
function neighborConnected(i,d){
 if(i==null)return false;const j=i+[-4,1,4,-1][d];
 if(j<0||j>=12||((d===1||d===3)&&Math.floor(j/4)!==Math.floor(i/4)))return false;
 return !!(maskAt(j)&(1<<((d+2)%4)));
}
function sprite(m,index){
const dirs=[0,1,2,3].filter(d=>m&(1<<d)),ends=[[50,0],[100,50],[50,100],[0,50]];
let path='',opposite=dirs.length===2&&(dirs[0]+2)%4===dirs[1];
if(dirs.length===2&&!opposite){
 const u=ends[dirs[0]],v=ends[dirs[1]];
 path='M'+u[0]+' '+u[1]+'L'+((u[0]+50)/2)+' '+((u[1]+50)/2)+'Q50 50 '+((v[0]+50)/2)+' '+((v[1]+50)/2)+'L'+v[0]+' '+v[1];
}else if(opposite){
 const u=ends[dirs[0]],v=ends[dirs[1]];path='M'+u[0]+' '+u[1]+'L'+v[0]+' '+v[1];
}else path=dirs.map(d=>'M50 50L'+ends[d][0]+' '+ends[d][1]).join('');
let svg='<svg viewBox="0 0 100 100" class="r710-cable" aria-hidden="true">';
svg+='<path d="'+path+'" fill="none" stroke="#53372f" stroke-width="18" stroke-linecap="butt" stroke-linejoin="round"/>';
svg+='<path d="'+path+'" fill="none" stroke="#b66b21" stroke-width="15" stroke-linecap="butt" stroke-linejoin="round"/>';
svg+='<path d="'+path+'" fill="none" stroke="#ffcd32" stroke-width="11" stroke-linecap="butt" stroke-linejoin="round"/>';
svg+='<path d="'+path+'" fill="none" stroke="#fff3ab" stroke-width="4" stroke-linecap="butt" opacity=".8"/>';
svg+='<path class="r709-current" d="'+path+'" fill="none" stroke="#ffffff" stroke-width="4" stroke-dasharray="7 11"/>';
for(const d of dirs){
 if(neighborConnected(index,d))continue;
 const [x,y]=ends[d],vertical=d%2===0;
 svg+='<rect x="'+(x-(vertical?13:6))+'" y="'+(y-(vertical?5:13))+'" width="'+(vertical?26:12)+'" height="'+(vertical?10:26)+'" rx="1" fill="#d5a044" stroke="#725134" stroke-width="2"/>';
 svg+='<rect x="'+(x-(vertical?8:4))+'" y="'+(y-(vertical?3:8))+'" width="'+(vertical?16:8)+'" height="'+(vertical?6:16)+'" rx="1" fill="#fff5b8"/>';
}
if(dirs.length>=3)svg+='<rect x="39" y="39" width="22" height="22" rx="4" fill="#ffe16a" stroke="#86582e" stroke-width="3"/><path d="M52 40L45 50H51L48 59L57 47H51Z" fill="#9d5c27"/>';
return svg+'</svg>';
}
function deviceSVG(kind){
if(kind==='source')return '<svg viewBox="0 0 100 100" class="r708-device source-symbol" aria-hidden="true"><defs><linearGradient id="src708" x2="1" y2="1"><stop stop-color="#b5c6de"/><stop offset="1" stop-color="#596e93"/></linearGradient></defs><rect x="14" y="8" width="72" height="85" rx="13" fill="#203d64" stroke="#4a3f66" stroke-width="5"/><rect x="19" y="13" width="62" height="72" rx="11" fill="url(#src708)" stroke="#d7e5f4" stroke-width="3"/><path d="M55 25L38 53H54L47 76L68 43H53Z" fill="#ffcf48" stroke="#ffe790" stroke-width="3"/><circle cx="70" cy="75" r="5" fill="#ffac43"/></svg>';
if(kind==='lamp')return '<svg viewBox="0 0 100 100" class="r708-device lamp-symbol" aria-hidden="true"><defs><linearGradient id="shade708" x1="0" x2="1"><stop stop-color="#ffeab0"/><stop offset=".5" stop-color="#fff4cf"/><stop offset="1" stop-color="#ffce73"/></linearGradient></defs><ellipse class="r708-lamp-light" cx="52" cy="58" rx="43" ry="43" fill="#fff4a0" opacity=".0"/><rect x="48" y="59" width="8" height="25" rx="3" fill="#b46a2f" stroke="#7e4b36" stroke-width="2"/><ellipse cx="53" cy="88" rx="23" ry="7" fill="#d58c43" stroke="#824b34" stroke-width="3"/><path d="M33 17Q52 10 73 19L85 61Q52 78 20 60Z" fill="url(#shade708)" stroke="#b56a2c" stroke-width="4"/><path d="M37 18Q54 22 71 19" stroke="#f4c15b" stroke-width="5" fill="none"/><path class="r708-lamp-rays" d="M8 33L1 25M91 36l8-9M11 72L2 79M93 71l7 8" stroke="#ffe369" stroke-width="5" stroke-linecap="round"/></svg>';
return '<svg viewBox="0 0 100 100" class="r708-device fan-symbol" aria-hidden="true"><circle cx="50" cy="48" r="44" fill="#a7e6fb" stroke="#284b76" stroke-width="7"/><circle cx="50" cy="48" r="37" fill="#6ac5ef" stroke="#367ba9" stroke-width="3"/><g class="r707-fan-blades" style="transform-origin:50px 48px"><path d="M50 48Q10 10 38 9Q56 12 50 48Q90 12 92 39Q89 59 50 48Q91 86 61 89Q40 83 50 48Q14 88 9 59Q13 39 50 48Z" fill="#318cdb" stroke="#236ca9" stroke-width="3"/><path d="M50 48Q20 16 38 13M50 48Q86 27 87 40" stroke="#d3f7ff" stroke-width="5" fill="none" opacity=".7"/></g><circle cx="50" cy="48" r="11" fill="#9ee4ff" stroke="#2b547d" stroke-width="4"/><path d="M48 92V99M34 99h32" stroke="#28669b" stroke-width="8" stroke-linecap="round"/></svg>';
}
function device(kind,powered){const side=kind==='source'?(SOURCE_MASK===4?'bottom':'right'):'left';return '<span class="r709-terminal '+side+(powered?' powered':'')+'" aria-hidden="true"><b>⚡</b></span>'+deviceSVG(kind);}

function evaluate(){
 const seen=new Set([0]),q=[0],bad=new Set();
 for(let k=0;k<q.length;k++){
  const i=q[k],m=maskAt(i);
  for(let d=0;d<4;d++)if(m&(1<<d)){
   if(!neighborConnected(i,d)){bad.add(i);continue;}
   const j=i+[-4,1,4,-1][d];if(!seen.has(j)){seen.add(j);q.push(j);}
  }
 }
 const remaining=HOLES.filter(i=>rot(placed[i].m,placed[i].r)!==GOAL[i]).length;
 return {complete:seen.has(3)&&bad.size===0&&remaining===0,powered:seen.has(3),
   lamp:seen.has(3),fan:false,devices:Number(seen.has(3)),leaks:[...bad],energized:[...seen],remaining};
}
const styles='.r715-fixed .r710-cable{filter:saturate(.7) brightness(.87)}'
 +'.r715-bolts{position:absolute;left:12%;right:12%;top:6%;display:flex;justify-content:space-between;pointer-events:none;color:#fff0bb;text-shadow:0 1px #593922;font-weight:bold}'
 +'.r715-turn{cursor:pointer!important;box-shadow:0 0 0 3px #ffe59b99,0 0 17px #fff6b55e}'
 +'.r715-turn:focus-visible{outline:4px solid #fff5ac}'
 +'.r715-auto{z-index:10!important;width:39%!important;height:10.6%!important;background:linear-gradient(#f9e5bb,#e9c18e)!important;border:3px solid #a77040!important;border-radius:17px!important;color:#5c4330!important;display:flex;align-items:center;justify-content:center;text-align:center;padding:5px!important;font-size:clamp(11px,3.1vw,17px);font-weight:950;line-height:1.15;pointer-events:none;box-shadow:0 3px 0 #7c4d34}'
 +'.r715-lesson{position:absolute;z-index:5;top:72%;left:16%;right:16%;background:#70452edf;border:2px solid #edbf74;border-radius:12px;color:#fff7e3;text-align:center;font-weight:850;font-size:clamp(10px,2.5vw,16px);padding:7px;pointer-events:none}';
if(document.head&&!document.getElementById('r715-css')){
 const node=document.createElement('style');node.id='r715-css';node.textContent=styles;document.head.appendChild(node);
}
function draw(){
 root.classList.add('r707-root');document.body.classList.add('r707-play');document.body.classList.remove('r704-play');
 let profile={};try{profile=JSON.parse(localStorage.getItem(PROGRESS)||'{}')}catch(_){}
 const live=evaluate();
 let html='<div class="r707-viewport"><div class="r707-stage '+(solved?'won':'')+'"><div class="r707-background"></div>';
 html+='<div class="r710-header-mask"><div class="r710-header-pills"><div class="r710-life-pill"><span class="r710-heart">♥</span><b>'+(profile.hearts??5)+'/5</b></div><div class="r710-money-pill"><span class="r710-coin">★</span><b>'+(profile.coins??70)+'</b></div></div></div>';
 html+='<div class="r707-cells">';
 for(let i=0;i<12;i++){
  const source=i===0,lamp=i===3,p=placed[i],fixed=Object.hasOwn(FIXED,i),turn=HOLES.includes(i);
  const kind=source?'source':lamp?'lamp':p?'socket':'empty';
  const classes='r707-cell '+kind+(p?' filled':'')+(fixed?' r715-fixed':'')+(turn&&!solved?' r715-turn':'')+(live.energized.includes(i)?' energized':'')+(errors.includes(i)?' wrong':'');
  html+='<button class="'+classes+'" style="'+at(CX[i%4],CY[Math.floor(i/4)])+'" '+(turn&&!solved?'data-slot="'+i+'"':'disabled')+' aria-label="'+(turn?'Girar cabo':fixed?'Cabo parafusado, não gira':source?'Fonte':lamp?'Abajur':'Espaço vazio')+'">'
    +(p?sprite(rot(p.m,p.r),i)+(fixed?'<span class="r715-bolts" aria-hidden="true"><i>✦</i><i>✦</i></span>':''):source?device('source',true):lamp?device('lamp',live.lamp):'')+'</button>';
 }
 html+='</div><div class="r707-tray-surface"></div><div class="r707-inventory"></div>';
 html+='<div class="r715-lesson">'+LESSONS[currentLevel-1]+'</div>';
 html+='<button class="r707-hot r707-settings" data-action="settings" aria-label="Configurações" style="'+at(854,61)+'"></button>';
 html+='<button class="r707-hot r707-hint" data-action="hint" aria-label="Dica" style="'+at(151,1370)+'"></button>';
 html+='<button class="r707-hot r707-undo" data-action="undo" aria-label="Desfazer" style="'+at(419,1370)+'"></button>';
 // Hide the "Testar" graphic baked into the original background behind an
 // opaque, NON-INTERACTIVE status plaque. The player never needs to press it.
 html+='<div class="r707-hot r707-test r715-auto" style="'+at(724,1370)+'" aria-label="Vitória automática">⚡ Vitória<br>automática</div>';
 // The Testar button has been deleted. Rotations immediately evaluate victory.
 html+='<button class="r707-hot r707-nav-play" data-nav="play" style="'+at(156,1550)+'" aria-label="Jogar"></button><button class="r707-hot r707-nav-city" data-nav="city" style="'+at(457,1550)+'" aria-label="Cidade"></button><button class="r707-hot r707-nav-shop" data-nav="shop" style="'+at(775,1550)+'" aria-label="Oficina"></button>';
 html+='<div class="r707-glow"></div><div class="r707-character-reaction">✨ Conseguimos!</div><div class="r707-victory">✨ CONSERTADO! ✨</div>';
 if(solved)html+='<button class="r710-next-level" data-action="next">'+(currentLevel<TOTAL?'▶ Próxima fase':'🏆 Fundação concluída')+'</button>';
 html+='</div><div class="r707-info-bottom" role="status"><div class="r708-hud r709-hud"><div class="r708-hud-progress">';
 html+='<button class="r710-level-open" data-action="levels">⚡ FASE '+String(currentLevel).padStart(2,'0')+'/04 ▾</button>';
 html+='<span class="r708-goal">Giros <b>'+moves+'</b></span><span class="r709-powered-label">Ligados <b>'+live.devices+'/1</b></span><span class="r708-device-status '+(live.lamp?'on':'')+'">💡</span></div>';
 html+='<div class="r708-track"><div style="width:'+(100*(HOLES.length-live.remaining)/HOLES.length)+'%"></div></div>';
 html+='<div class="r708-feedback">'+(message||(solved?'🎉 '+TITLES[currentLevel-1]+' concluída!':TITLES[currentLevel-1]+': '+(live.leaks.length?'ajuste as conexões.':'gire os cabos iluminados.')))+'</div>';
 html+='<div class="r710-city-progress"><span>🏘️ Casa da Lila • Fundação</span><b>'+completed.length+'/4 reparos</b></div>';
 html+='<div class="r710-campaign-pips">'+Array.from({length:TOTAL},(_,i)=>'<i class="'+(completed.includes(i+1)?'done':i+1===currentLevel?'current':'')+'"></i>').join('')+'</div></div></div></div>';
 if(picker){
  const choices=Array.from({length:TOTAL},(_,k)=>{const n=k+1,open=n<=unlocked,done=completed.includes(n);
   return '<button class="r710-level-choice '+(done?'done ':open?'open ':'locked ')+(n===currentLevel?'current':'')+'" data-level="'+n+'" '+(open?'':'disabled')+' aria-label="Fase '+n+'">'+(done?'★':open?'⚡':'🔒')+'<small>'+String(n).padStart(2,'0')+'</small></button>';}).join('');
  const overlay='<div class="r710-level-overlay" role="dialog" aria-label="Selecionar as quatro fases"><div class="r710-level-card"><div class="r710-level-title"><strong>🏠 Casa da Lila</strong><button class="r710-level-close" data-action="close-levels">✕</button></div><p>Fundação · quatro puzzles novos</p><div class="r710-level-grid">'+choices+'</div><div class="r710-level-note">★ Concluída · ⚡ Disponível · 🔒 Bloqueada</div></div></div>';
  html=html.replace('</div><div class="r707-info-bottom"',overlay+'</div><div class="r707-info-bottom"');
 }
 root.innerHTML=html;
}
function finish(){
 if(solved||!evaluate().complete)return false;
 solved=true;errors=[];message='🎉 Circuito completo! A luz acendeu!';
 if(!completed.includes(currentLevel)){
  completed.push(currentLevel);unlocked=Math.min(TOTAL,Math.max(unlocked,currentLevel+1));
  try{const p=JSON.parse(localStorage.getItem(PROGRESS)||'{}');p.coins=(Number(p.coins)||0)+25;p.stars=(Number(p.stars)||0)+(hints?1:moves<=HOLES.length+1?3:2);localStorage.setItem(PROGRESS,JSON.stringify(p));}catch(_){}
 }
 save();saveProgress();beep(960);draw();
 const scene=root.querySelector('.r707-stage');
 if(scene){const conf=document.createElement('div');conf.className='r707-confetti';conf.innerHTML=Array.from({length:24},(_,i)=>'<i style="left:'+((i*41)%98)+'%;animation-delay:'+((i%6)*.1)+'s"></i>').join('');scene.appendChild(conf);setTimeout(()=>conf.remove(),2000);}
 if(currentLevel<TOTAL)autoTimer=setTimeout(()=>{autoTimer=null;loadLevel(currentLevel+1);draw();},1750);
 return true;
}
function validate(){
 const s=evaluate();errors=s.leaks;
 if(s.complete)return finish();
 message=s.leaks.length?'Confira a ponta desconectada.':'Continue girando os cabos.';
 save();draw();return false;
}
function spin(i){
 if(solved||!HOLES.includes(+i))return false;
 stack();moves++;placed[i].r=(placed[i].r+1)%4;beep(660);return validate();
}
function undo(){
 if(solved||!history.length)return false;
 const s=history.pop();for(const [i,r] of Object.entries(s.turns))placed[i].r=r;
 moves=s.moves;hints=s.hints;errors=[];message='Giro desfeito.';save();draw();return true;
}
function hint(){
 if(solved)return false;const i=HOLES.find(k=>rot(placed[k].m,placed[k].r)!==GOAL[k]);if(i===undefined)return false;
 stack();hints++;moves++;placed[i].r=[0,1,2,3].find(r=>rot(placed[i].m,r)===GOAL[i]);beep(820);return validate();
}
function reset(){
 if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}
 const cfg=createLevel(currentLevel);
 for(const [i,m] of Object.entries(cfg.start))placed[i]={id:'wire-'+i,m,r:0,fixed:false};
 solved=false;moves=0;hints=0;errors=[];history=[];message='Recomece girando as curvas.';save();draw();
}
function nav(name){
 if(name==='city'){picker=true;draw();return;}
 if(name==='play'){picker=false;draw();return;}
 const btn=document.querySelector('.bottom-nav .nav[data-screen="'+name+'"]');if(btn)btn.click();
 if(name==='play'){picker=false;draw();}
}
root.addEventListener('click',e=>{
 if(Date.now()<suppressUntil)return;
 const choice=e.target.closest('[data-level]');
 if(choice){const n=Number(choice.dataset.level);if(n<=unlocked){loadLevel(n);draw();}return;}
 const slot=e.target.closest('[data-slot]');if(slot){spin(Number(slot.dataset.slot));return;}
 const action=e.target.closest('[data-action]');if(action){
  switch(action.dataset.action){
  case 'settings':document.getElementById('settings-btn')?.click();break;
  case 'hint':hint();break;case 'undo':undo();break;
  case 'next':if(currentLevel<TOTAL&&currentLevel+1<=unlocked){loadLevel(currentLevel+1);draw();}else{picker=true;draw();}break;
  case 'levels':picker=true;draw();break;case 'close-levels':picker=false;draw();break;
  }return;
 }
 const n=e.target.closest('[data-nav]');if(n)nav(n.dataset.nav);
});
root.addEventListener('pointerdown',e=>{const slot=e.target.closest('[data-slot]');if(slot&&!solved)pointer={id:+slot.dataset.slot,x:e.clientX,y:e.clientY};});
document.addEventListener('pointerup',e=>{
 if(!pointer)return;const p=pointer;pointer=null;
 if(Math.hypot(e.clientX-p.x,e.clientY-p.y)>32){suppressUntil=Date.now()+240;spin(p.id);}
});
// Native <button> click already supports Enter/Space; avoid double rotation.
const brow=document.querySelector('.eyebrow');if(brow)brow.textContent='BRIGHTVALE · CASA DA LILA · FUNDAÇÃO';
draw();
window.FixCampaign710={evaluate,spin,undo,hint,reset,loadLevel,draw,createLevel,
 getState:()=>({currentLevel,unlocked,completed:[...completed],holes:[...HOLES],goal:{...GOAL},placed:JSON.parse(JSON.stringify(placed)),items:[],solved,picker,moves,sourceMask:SOURCE_MASK,fixed:{...FIXED}}),
 getLevels:()=>DESIGNS.map((_,i)=>createLevel(i+1)),TITLES};
})();