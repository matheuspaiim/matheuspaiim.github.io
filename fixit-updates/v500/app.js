/* Fix It! - mobile gameplay & persistence. All content stays offline. */
(() => {
'use strict';
const E=window.FixEngine;
const $=id=>document.getElementById(id);
const KEY='fixit-alpha-state-v1';
const SESSION='fixit-active-level-v4';
let state;
try { state=JSON.parse(localStorage.getItem(KEY)||'null'); }catch(_){}
state=Object.assign({level:1,completed:0,coins:70,hearts:5,stars:0,tool:0,sound:true,refill:0},state||{});
state.level=Math.min(E.MAX_LEVEL,Math.max(1,Math.floor(state.level||1)));
state.completed=Math.max(0,Math.min(E.MAX_LEVEL,Math.floor(state.completed||0)));
state.hearts=Math.max(0,Math.min(5,Math.floor(state.hearts??5)));
state.coins=Math.max(0,Math.floor(state.coins||0));
state.tool=Math.max(0,Math.min(5,Math.floor(state.tool||0)));
state.bestStars=state.bestStars||{};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){console.warn('Save failed',e);}};
const saveSession=()=>{try{localStorage.setItem(SESSION,JSON.stringify({level:state.level,turns,hints,tiles:puzzle.tiles.map(t=>({turns:t.turns,open:t.open,repaired:t.repaired}))}));}catch(_){}};
const clearSession=()=>{try{localStorage.removeItem(SESSION)}catch(_){}};
let puzzle, turns=0, hints=0, currentScreen='play', ctx=null, modalAction=null;
let selectedDistrict=Math.floor((state.level-1)/E.LEVELS_PER_PLACE);
function beep(freq=440,length=.09,type='sine'){
  if(!state.sound)return;
  try{
    const A=window.AudioContext||window.webkitAudioContext;
    ctx=ctx||new A(); const oscillator=ctx.createOscillator(),gain=ctx.createGain();
    oscillator.type=type; oscillator.frequency.setValueAtTime(freq,ctx.currentTime);
    gain.gain.setValueAtTime(.045,ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+length);
    oscillator.connect(gain);gain.connect(ctx.destination);
    oscillator.start();oscillator.stop(ctx.currentTime+length);
  } catch(_){}
}
function refreshHearts(){
  if(state.hearts>=5){state.refill=0;return;}
  const now=Date.now();
  if(!state.refill)state.refill=now+10*60*1000;
  while(state.hearts<5 && now>=state.refill){state.hearts++;state.refill+=10*60*1000;}
  if(state.hearts>=5)state.refill=0;
}
function start(level) {
  state.level=Math.min(E.MAX_LEVEL,Math.max(1,Number(level)||state.level));
  selectedDistrict=Math.floor((state.level-1)/E.LEVELS_PER_PLACE);
  puzzle=E.create(state.level);turns=0;hints=0;
  try{
    const s=JSON.parse(localStorage.getItem(SESSION)||'null');
    if(s&&s.level===state.level&&s.tiles?.length===puzzle.tiles.length){
      puzzle.tiles.forEach((t,i)=>{
        const previous=s.tiles[i]||{};
        if(!t.fixed) t.turns=Math.max(0,Math.floor(Number(previous.turns)||0))%4;
        if(t.kind==='switch')t.open=previous.open===true;
        if(t.kind==='repair')t.repaired=previous.repaired===true;
      });
      turns=Math.min(puzzle.maxMoves,Math.max(0,Math.floor(Number(s.turns)||0)));
      hints=Math.max(0,Math.floor(Number(s.hints)||0));
    }
  }catch(_){}
  save();render();
}
function showScreen(name){
  currentScreen=name;
  document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id===name+'-screen'));
  document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.screen===name));
  $('screen-title').textContent={play:'Um conserto por vez!',city:'Reconstrua Brightvale',shop:'Sua oficina vai crescer!'}[name];
  $('screen-sub').textContent={play:'Encontre o caminho certo e ligue todos os aparelhos.',city:'Veja a cidade mudar a cada reparo realizado.',shop:'Use as moedas que ganhou para evoluir sua oficina.'}[name];
  if(name==='city')renderCity();if(name==='shop')renderShop();
  window.scrollTo(0,0);
}
function lineSvg(mask) {
  const pts=[[50,3],[97,50],[50,97],[3,50]];
  let s='<svg viewBox="0 0 100 100" class="circuit-svg" aria-hidden="true">';
  for(let d=0;d<4;d++)if(mask&(1<<d)){
    s+='<path class="pipe-back" d="M50 50 L'+pts[d][0]+' '+pts[d][1]+'"/>';
    s+='<path class="pipe-core" d="M50 50 L'+pts[d][0]+' '+pts[d][1]+'"/>';
  }
  return s+'<circle cx="50" cy="50" r="7.3" class="pipe-joint"/></svg>';
}
function renderBoard(){
  if(!puzzle)return;
  const data=E.examine(puzzle);
  $('board').style.gridTemplateColumns='repeat('+puzzle.width+',minmax(0,1fr))';
  $('board').className=puzzle.element;
  const sunk=new Map(puzzle.sinks.map(s=>[s.index,s]));
  let html='';
  puzzle.tiles.forEach((t,i)=>{
    const sink=sunk.get(i);
    const active=data.connected.has(i);
    let classes=['tile',t.kind,active?'powered':'',t.fixed?'fixed':'rotatable'].join(' ');
    let icon='',label='';
    if(t.kind==='source'){icon=puzzle.element==='electric'?'⚡':'💧';label='Fonte';}
    if(t.kind==='hazard'){icon=puzzle.element==='electric'?'⚠️':'💥';label='Perigo';}
    if(t.kind==='load'){icon='🔺';label='Carga excessiva';}
    if(t.kind==='switch'){icon=t.open?'🔓':'🔒';label=t.open?'Desligar chave':'Ligar chave';}
    if(t.kind==='repair'){icon=t.repaired?'✅':'🔧';label=t.repaired?'Girar peça reparada':'Reparar trecho';}
    if(sink){icon=sink.icon;label='Aparelho';}
    if(t.mask===0)classes+=' blank';
    if(t.kind==='switch'&&!t.open)classes+=' inactive';
    if(t.kind==='repair'&&!t.repaired)classes+=' inactive';
    html+='<button class="'+classes+'" data-i="'+i+'" '+((t.fixed&&t.kind!=='switch')||t.mask===0?'disabled':'')+
    ' aria-label="'+(label||'Girar peça '+(i+1))+'">';
    if(t.mask)html+=lineSvg(E.rotated(t.mask,t.turns));
    if(icon)html+='<span class="device '+(sink&&!active?'offline':'')+'">'+icon+'</span>';
    if(t.kind==='hazard')html+='<span class="hazard-dot"></span>';
    html+='</button>';
  });
  $('board').innerHTML=html;
  $('moves-tag').textContent=turns+'/'+puzzle.maxMoves+' jogadas';
  $('moves-tag').classList.toggle('warning',turns>puzzle.maxMoves-4);
  $('mode-tag').textContent=puzzle.element==='electric'?'⚡ ENERGIA':'💧 ENCANAMENTO';
  $('mode-tag').className=puzzle.element;
  $('source-hint').textContent=puzzle.element==='electric'?'⚡ Distribuição elétrica':'💧 Fluxo de água';
  $('status-hint').textContent=data.unsafe?'⚠️ Perigo detectado!':data.overload?'⚠️ Sobrecarga!':data.complete?'✅ Pronto para testar!':puzzle.tiles.some(t=>t.kind==='switch'&&!t.open)?'🔒 Abra as chaves do circuito':puzzle.tiles.some(t=>t.kind==='repair'&&!t.repaired)?'🔧 Conserte os trechos danificados':'Gire as peças para conectar';
  $('status-hint').className=data.unsafe?'unsafe':'';
  $('targets').innerHTML=puzzle.sinks.map(s=>
    '<span class="target '+(data.connected.has(s.index)?'on':'')+'">'+
    s.icon+' '+(data.connected.has(s.index)?'Ligado':'Desligado')+'</span>'
  ).join('');
  $('meterbar').style.width=Math.round(100*data.powered/data.total)+'%';
  $('rating').textContent=turns<=puzzle.best?'★★★':turns<=puzzle.best+3?'★★☆':'★☆☆';
  return data;
}
function render(){
  refreshHearts();$('hearts').textContent='❤️ '+state.hearts+'/5';
  $('coins').textContent='🪙 '+state.coins;
  $('sound').textContent=state.sound?'♫':'♪̸';
  $('sector').textContent=puzzle.place.name.toLocaleUpperCase('pt-BR')+' • '+puzzle.difficulty.toLocaleUpperCase('pt-BR');
  $('stage-label').textContent='Reparo '+puzzle.level+'/'+E.MAX_LEVEL+(puzzle.isBoss?' 👑 CHEFE':'');
  $('scene-icon').textContent=puzzle.place.icon;
  $('scene-text').textContent=puzzle.place.text;
  $('objective-title').textContent='Ligue '+puzzle.sinks.length+' aparelhos • '+puzzle.difficulty;
  $('hint-price').textContent=Math.max(5,15-state.tool*3);
  $('objective-help').textContent=(puzzle.switches.length?'🔒 Toque nas chaves para ativá-las. ':'')+(puzzle.repairs.length?'🔧 Toque nos trechos quebrados para repará-los. ':'')+'Gire os tubos com um toque e teste o sistema sem exceder o limite.';
  renderBoard();
  if(currentScreen==='shop')renderShop();
  if(currentScreen==='city')renderCity();
}
function modal(icon,title,message,button,action,extra=''){
  $('modal-icon').textContent=icon;$('modal-title').textContent=title;
  $('modal-message').textContent=message;$('modal-extra').innerHTML=extra;
  $('modal-ok').textContent=button||'Continuar';modalAction=action;
  $('modal').classList.remove('hidden');
}
function closeModal(){
  $('modal').classList.add('hidden');
  const action=modalAction;modalAction=null;
  if(action)action();
}
function failure(reason) {
  clearSession();
  if(state.hearts<=0)return modal('❤️','Sem corações','Recuperação: um coração a cada 10 minutos.','Entendi');
  state.hearts=Math.max(0,state.hearts-1);
  if(state.hearts<5 && !state.refill)state.refill=Date.now()+10*60*1000;
  save();beep(190,.25,'sawtooth');render();
  const extra=state.hearts===0?'<p class="fine-print">Você recupera um coração em 10 minutos.</p>':'';
  modal('🔧','Reparo falhou!',reason+' Você perdeu 1 coração, mas pode tentar novamente.','Tentar de novo',()=>{clearSession();start(state.level)},extra);
}
function victory(){
  const old=state.completed;
  clearSession();
  let earned=turns<=puzzle.best?3:turns<=puzzle.best+3?2:1;
  if(hints>0)earned=Math.min(2,earned);
  const reward=40+earned*20;
  const newLevel=state.level>old;
  const previous=Number(state.bestStars[state.level]||0);
  if(newLevel){state.completed=state.level;state.coins+=reward;}
  if(earned>previous){state.bestStars[state.level]=earned;state.stars+=earned-previous;}
  const finished=state.level;
  save();beep(780,.11);setTimeout(()=>beep(988,.16),120);
  $('confetti').classList.remove('hidden');setTimeout(()=>$('confetti').classList.add('hidden'),900);
  render();
  modal('🏆','Reparo concluído!',(newLevel?'Você ganhou '+reward+' moedas! ':'Reparo repetido, recompensa já obtida. ')+
   'Os moradores de Brightvale agradecem.',finished===E.MAX_LEVEL?'Concluir campanha':'Próximo reparo',()=>{if(finished===E.MAX_LEVEL){showScreen('city')}else{start(Math.min(E.MAX_LEVEL,Math.max(state.completed+1,finished+1)));showScreen('play');}},
   '<div class="victory-stars">'+('★'.repeat(earned)+'☆'.repeat(3-earned))+'</div>');
}
function test(){
  refreshHearts();if(state.hearts<=0){render();return modal('❤️','Sem corações','Você recupera um coração a cada 10 minutos.','Entendi');}
  const v=E.examine(puzzle);
  if(turns>puzzle.maxMoves) return failure('Você ultrapassou o limite de movimentos.');
  if(v.unsafe)return failure(puzzle.element==='electric'?'Curto-circuito! Você energizou um ponto perigoso.':'Vazamento! A água alcançou uma tubulação danificada.');
  if(v.overload)return failure('O circuito ficou sobrecarregado.');
  if(!v.complete)return failure('Ainda faltam '+(v.total-v.powered)+' aparelhos para conectar.');
  victory();
}
function hint(){
  const price=Math.max(5,15-state.tool*3);
  if(state.coins<price)return modal('🪙','Moedas insuficientes','Conclua mais reparos para comprar dicas.','Entendi');
  const wrong=puzzle.tiles.findIndex(t=>(t.kind==='switch'&&!t.open)||(t.kind==='repair'&&!t.repaired)||(t.mask&&!t.fixed&&t.kind!=='decoy'&&E.rotated(t.mask,t.turns)!==t.mask));
  if(wrong<0)return modal('✅','Tudo certo','Agora é só testar o sistema.','Entendi');
  state.coins-=price;hints++;
  const tile=puzzle.tiles[wrong];
  if(tile.kind==='switch')tile.open=true;
  else if(tile.kind==='repair'&&!tile.repaired)tile.repaired=true;
  else tile.turns=0;
  saveSession();
  beep(740,.1);save();render();
}
function renderCity(){
  $('city-progress').textContent=state.completed+'/'+E.MAX_LEVEL+' reparos • '+Math.floor(state.completed/E.LEVELS_PER_PLACE)+' locais restaurados';
  $('city-list').innerHTML=E.PLACES.map((p,i)=>{
    const first=i*E.LEVELS_PER_PLACE+1;
    const done=Math.max(0,Math.min(E.LEVELS_PER_PLACE,state.completed-i*E.LEVELS_PER_PLACE));
    const unlocked=first<=state.completed+1;
    return '<button class="city-card '+(done===E.LEVELS_PER_PLACE?'restored ':'')+
      (i===selectedDistrict?'selected ':'')+(!unlocked?'locked':'')+'" data-area="'+i+'" '+(unlocked?'':'disabled')+'>'+
      '<span class="city-icon">'+p.icon+'</span><span class="city-details"><strong>'+p.name+'</strong><small>'+
      (done===E.LEVELS_PER_PLACE?'Restaurado':unlocked?'Escolher desafio':'Bloqueado')+
      '</small><span class="city-mini"><span style="width:'+(done*100/E.LEVELS_PER_PLACE)+'%"></span></span></span>'+
      '<span class="city-count">'+done+'/'+E.LEVELS_PER_PLACE+'</span></button>';
  }).join('');
  const p=E.PLACES[selectedDistrict];
  const first=selectedDistrict*E.LEVELS_PER_PLACE+1;
  $('level-picker').innerHTML='<h3>'+p.icon+' '+p.name+'</h3><p>Escolha uma fase liberada. A última de cada local é o desafio-chefe.</p>'+
    '<div class="level-buttons">'+Array.from({length:E.LEVELS_PER_PLACE},(_,i)=>{
      const level=first+i,unlocked=level<=state.completed+1;
      const stars=Number(state.bestStars[level]||0);
      return '<button data-stage="'+level+'" '+(unlocked?'':'disabled')+
        ' class="level-choice '+(level===state.level?'current ':'')+(level<=state.completed?'won ':'')+
        (i===E.LEVELS_PER_PLACE-1?'boss ':'')+'"><b>'+(i===E.LEVELS_PER_PLACE-1?'👑 ':'')+level+
        '</b><small>'+(unlocked?(stars?'★'.repeat(stars):'Jogar'):'🔒')+'</small></button>';
    }).join('')+'</div>';
}
function renderShop(){
  $('upgrade-level').textContent='Nível '+state.tool;
  $('upgrade').textContent=state.tool>=5?'MÁX.':'🪙 '+(90+state.tool*60);
  $('upgrade').disabled=state.tool>=5;
  $('stats-level').textContent=state.level;
  $('stats-completed').textContent=state.completed;
  $('stats-stars').textContent=state.stars;
}
$('board').addEventListener('click',e=>{
  const btn=e.target.closest('button[data-i]');
  if(!btn||btn.disabled)return;
  const tile=puzzle.tiles[Number(btn.dataset.i)];
  if(!tile||!tile.mask||(tile.fixed&&tile.kind!=='switch'))return;
  if(tile.kind==='switch') tile.open=!tile.open;
  else if(tile.kind==='repair'&&!tile.repaired)tile.repaired=true;
  else tile.turns=(tile.turns+1)%4;
  turns++;saveSession();beep(320+(turns%4)*70,.06);
  renderBoard();
  if(turns>puzzle.maxMoves)failure('Você ultrapassou o limite de jogadas.');
});
$('test').addEventListener('click',test);
$('hint').addEventListener('click',hint);
$('restart').addEventListener('click',()=>modal('↻','Recomeçar reparo?','Seu tabuleiro voltará ao início. Você não perderá corações.','Recomeçar',()=>{clearSession();start(state.level)}));
$('modal-ok').addEventListener('click',closeModal);
$('sound').addEventListener('click',()=>{state.sound=!state.sound;save();render();});
$('upgrade').addEventListener('click',()=>{
  const price=90+state.tool*60;
  if(state.tool>=5)return;
  if(state.coins<price)return modal('🪙','Poucas moedas','Faça mais reparos para melhorar o seu equipamento.','Entendi');
  state.coins-=price;state.tool++;save();beep(660,.1);render();
  modal('🧰','Oficina melhorada!','Seu kit de diagnóstico agora dá dicas mais baratas.','Continuar');
});
document.querySelectorAll('.nav').forEach(n=>n.addEventListener('click',()=>showScreen(n.dataset.screen)));
$('city-list').addEventListener('click',e=>{
  const card=e.target.closest('[data-area]');if(!card||card.disabled)return;
  selectedDistrict=Number(card.dataset.area);renderCity();
  $('level-picker').scrollIntoView({behavior:'smooth',block:'nearest'});
});
$('level-picker').addEventListener('click',e=>{
  const button=e.target.closest('[data-stage]');if(!button||button.disabled)return;
  const chosen=Number(button.dataset.stage);
  if(chosen>state.completed+1||chosen<1||chosen>E.MAX_LEVEL)return;
  clearSession();start(chosen);showScreen('play');
});
try{const pending=JSON.parse(localStorage.getItem(SESSION)||'null'); if(pending&&pending.level===state.level){/* continue previous session */}else{clearSession();}}catch(_){clearSession();}
start(state.level);
showScreen('play');
})();
