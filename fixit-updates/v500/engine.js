/* Fix It! engine v0.4 - deterministic levels, no external dependencies. */
(function(root, factory) {
  const api=factory();
  if(typeof module==='object' && module.exports) module.exports=api;
  root.FixEngine=api;
})(typeof globalThis==='object'?globalThis:this,function(){
  'use strict';
  const D=[[0,-1],[1,0],[0,1],[-1,0]];
  const PLACES=[
    {name:'Casa da Dona Lia',icon:'🏠',text:'A primeira casa precisa de reparos.'},
    {name:'Padaria do Nino',icon:'🥐',text:'Devolva o calor à padaria.'},
    {name:'Praça Central',icon:'⛲',text:'Faça a praça brilhar novamente.'},
    {name:'Escola Aurora',icon:'🏫',text:'A escola precisa funcionar.'},
    {name:'Café da Marisa',icon:'☕',text:'Reabra o café do bairro.'},
    {name:'Hospital Esperança',icon:'🏥',text:'Proteja os equipamentos do hospital.'},
    {name:'Hotel Aurora',icon:'🏨',text:'Muitos sistemas, um grande desafio.'},
    {name:'Estação Velha',icon:'🚉',text:'Restaure os serviços da estação.'},
    {name:'Fábrica do Porto',icon:'🏭',text:'A fábrica precisa voltar a produzir.'},
    {name:'Mercado Municipal',icon:'🛒',text:'Ligue as máquinas do mercado.'},
    {name:'Cinema Estrela',icon:'🎬',text:'As luzes estão apagadas no cinema.'},
    {name:'Oficina Ferro-Velho',icon:'🔩',text:'Engrenagens e sistemas de manutenção.'},
    {name:'Jardim Botânico',icon:'🌿',text:'Cuide da irrigação do jardim.'},
    {name:'Usina do Vale',icon:'🏗️',text:'Circuitos de alta complexidade.'},
    {name:'Farol de Brightvale',icon:'🗼',text:'O último reparo da cidade!'}
  ];
  const LEVELS_PER_PLACE=12;
  const MAX_LEVEL=PLACES.length*LEVELS_PER_PLACE;
  const clampLevel=level=>Math.max(1,Math.min(MAX_LEVEL,Math.floor(Number(level)||1)));
  const placeFor=level=>PLACES[Math.min(PLACES.length-1,Math.floor((clampLevel(level)-1)/LEVELS_PER_PLACE))];
  function rng(seed) {
    let s=seed>>>0;
    return ()=>{s+=0x6D2B79F5;let x=s;x=Math.imul(x^(x>>>15),x|1);x^=x+Math.imul(x^(x>>>7),x|61);return ((x^(x>>>14))>>>0)/4294967296};
  }
  function rotated(mask,turns){
    turns=((turns%4)+4)%4;
    return ((mask<<turns)|(mask>>>(4-turns)))&15;
  }
  function stage(level){
    if(level<=12)return {size:5,sinks:1,hazards:0,loads:0,switches:0,repairs:0,decoys:level<=3?1:2,margin:8,name:'Aprendiz'};
    if(level<=35)return {size:5,sinks:2,hazards:1,loads:0,switches:0,repairs:0,decoys:2,margin:6,name:'Iniciante'};
    if(level<=60)return {size:6,sinks:2,hazards:1,loads:1,switches:1,repairs:0,decoys:3,margin:6,name:'Técnico'};
    if(level<=95)return {size:6,sinks:3,hazards:2,loads:1,switches:1,repairs:1,decoys:4,margin:5,name:'Especialista'};
    if(level<=130)return {size:7,sinks:3,hazards:2,loads:2,switches:2,repairs:1,decoys:6,margin:5,name:'Engenheiro'};
    if(level<=160)return {size:7,sinks:4,hazards:3,loads:2,switches:2,repairs:2,decoys:7,margin:4,name:'Mestre'};
    return {size:8,sinks:4,hazards:3,loads:3,switches:3,repairs:2,decoys:9,margin:4,name:'Lenda'};
  }
  function create(value){
    const level=clampLevel(value),cfg={...stage(level)},isBoss=level%LEVELS_PER_PLACE===0;
    if(isBoss){
      cfg.sinks=Math.min(4,cfg.sinks+1);
      cfg.hazards+=1;cfg.decoys+=2;
      cfg.margin=Math.max(2,cfg.margin-3);
    }
    const w=cfg.size,h=w,total=w*h;
    const r=rng(0xBADF00D+level*1987);
    const masks=Array(total).fill(0),kinds=Array(total).fill('empty');
    const idx=(x,y)=>y*w+x, inside=(x,y)=>x>=0&&x<w&&y>=0&&y<h;
    const startRow=1+Math.floor(r()*(h-2)),source=idx(0,startRow);
    kinds[source]='source';
    const rowCandidates=[1,h-2,Math.floor((h-1)/2),2,h-3,3,4].filter((y,i,a)=>y>0&&y<h-1&&a.indexOf(y)===i);
    const sinks=rowCandidates.slice(0,cfg.sinks).map((y,i)=>({
      index:idx(w-1,y),demand:i===3?2:1,
      icon:((Math.floor((level-1)/12)%2)===0?['💡','📺','🌀','❄️']:['🚿','🚰','🧺','💦'])[i]
    }));
    function connect(a,b){
      const ax=a%w,ay=Math.floor(a/w),bx=b%w,by=Math.floor(b/w);
      const d=D.findIndex(([dx,dy])=>ax+dx===bx&&ay+dy===by);
      if(d<0)throw Error('Invalid non-adjacent connection');
      masks[a]|=1<<d;masks[b]|=1<<((d+2)%4);
    }
    for(const sink of sinks){
      let x=0,y=startRow;
      const ty=Math.floor(sink.index/w);
      for(let guard=0;guard<96&&(x!==w-1||y!==ty);guard++){
        const canX=x<w-1,canY=y!==ty;
        const horizontal=canX&&(!canY||r()<(level<=12?.82:.58));
        const nx=x+(horizontal?1:0),ny=y+(horizontal?0:Math.sign(ty-y));
        if(!inside(nx,ny))throw Error('Path outside board');
        connect(idx(x,y),idx(nx,ny));x=nx;y=ny;
      }
      if(x!==w-1||y!==ty)throw Error('Path generation incomplete');
      kinds[sink.index]='sink';
    }
    const circuit=masks.map((m,i)=>i).filter(i=>masks[i]&&i!==source&&!sinks.some(s=>s.index===i));
    function shuffled(items){for(let i=items.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[items[i],items[j]]=[items[j],items[i]]}return items}
    const switches=[],repairs=[];
    const special=shuffled(circuit.slice().filter(i=>masks[i]!==15));
    for(let i=0;i<cfg.switches&&special.length;i++){const at=special.shift();kinds[at]='switch';switches.push(at)}
    for(let i=0;i<cfg.repairs&&special.length;i++){const at=special.shift();kinds[at]='repair';repairs.push(at)}
    function candidates(){
      const arr=[];
      for(const at of circuit){
        const x=at%w,y=Math.floor(at/w);
        for(let d=0;d<4;d++){
          const nx=x+D[d][0],ny=y+D[d][1];if(!inside(nx,ny))continue;
          const j=idx(nx,ny);
          if(masks[j]===0&&kinds[j]==='empty'&&!(masks[at]&(1<<d)))
            arr.push({index:j,mask:1<<((d+2)%4)});
        }
      }
      return shuffled(arr);
    }
    function addTraps(kind,amount,list){
      for(let i=0;i<amount;i++){
        const arr=candidates();
        if(!arr.length)break;
        const p=arr[0];kinds[p.index]=kind;masks[p.index]=p.mask;list.push(p.index);
      }
    }
    const hazards=[],overloads=[];
    addTraps('hazard',cfg.hazards,hazards);
    addTraps('load',cfg.loads,overloads);
    const decoyOptions=shuffled(Array.from({length:total},(_,i)=>i).filter(i=>masks[i]===0));
    for(let i=0;i<cfg.decoys&&i<decoyOptions.length;i++){
      const pos=decoyOptions[i];
      kinds[pos]='decoy';masks[pos]=[3,5,6,7,9,10,11,12,13,14][Math.floor(r()*10)];
    }
    let best=0;
    const tiles=masks.map((mask,index)=>{
      const kind=kinds[index];
      const fixed=['source','sink','hazard','load','switch'].includes(kind);
      const t={mask,kind,turns:0,fixed};
      if(kind==='switch'){t.open=false;best++}
      if(kind==='repair'){t.repaired=false;best++}
      if(mask&&!fixed&&kind!=='decoy'){
        const orientations=[1,2,3].filter(a=>rotated(mask,a)!==mask);
        if(orientations.length){
          t.turns=orientations[Math.floor(r()*orientations.length)];
          for(let clockwise=0;clockwise<=3;clockwise++)
            if(rotated(mask,t.turns+clockwise)===mask){best+=clockwise;break}
        }
      }
      if(kind==='decoy')t.turns=Math.floor(r()*4);
      return t;
    });
    if(best===0&&circuit.length){
      const at=circuit.find(i=>!tiles[i].fixed&&masks[i]!==15);
      if(at!==undefined){tiles[at].turns=1;best++}
    }
    const element=((Math.floor((level-1)/12)%2)===0)?'electric':'water';
    const capacity=sinks.reduce((sum,s)=>sum+s.demand,0);
    return {level,width:w,height:h,source,sinks,hazards,overloads,switches,repairs,tiles,
      best,maxMoves:best+cfg.margin,element,place:placeFor(level),capacity,
      difficulty:cfg.name,chapter:Math.ceil(level/LEVELS_PER_PLACE),isBoss:level%LEVELS_PER_PLACE===0};
  }
  function examine(puzzle){
    const {tiles,width:w,height:h,source,sinks,hazards,overloads=[]}=puzzle;
    const visited=new Set(),queue=[source];
    const available=i=>{
      const t=tiles[i];
      if(t.kind==='switch'&&t.open===false)return false;
      if(t.kind==='repair'&&t.repaired===false)return false;
      return true;
    };
    while(queue.length){
      const at=queue.shift();if(visited.has(at)||!available(at))continue;
      visited.add(at);
      const x=at%w,y=Math.floor(at/w),out=rotated(tiles[at].mask,tiles[at].turns);
      for(let d=0;d<4;d++){
        if(!(out&(1<<d)))continue;
        const nx=x+D[d][0],ny=y+D[d][1];
        if(nx<0||ny<0||nx>=w||ny>=h)continue;
        const next=ny*w+nx,back=(d+2)%4;
        if(available(next)&&(rotated(tiles[next].mask,tiles[next].turns)&(1<<back)))
          queue.push(next);
      }
    }
    const powered=sinks.filter(s=>visited.has(s.index));
    const unsafe=hazards.some(i=>visited.has(i));
    const demand=powered.reduce((s,v)=>s+v.demand,0)+overloads.filter(i=>visited.has(i)).length*2;
    const overload=demand>puzzle.capacity;
    return {connected:visited,powered:powered.length,total:sinks.length,unsafe,overload,demand,
      complete:powered.length===sinks.length&&!unsafe&&!overload};
  }
  return {create,examine,rotated,placeFor,stage,PLACES,LEVELS_PER_PLACE,MAX_LEVEL};
});