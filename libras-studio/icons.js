(()=> {
  const wrap=(body,accent="#5b45e8",bg="#f3efff")=>`<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><rect x="2" y="2" width="44" height="44" rx="13" fill="${bg}"/>${body}</svg>`;
  const stroke='#18204b';
  const I={
    home:wrap(`<path d="M10 23.5 24 11l14 12.5v13A3.5 3.5 0 0 1 34.5 40h-21A3.5 3.5 0 0 1 10 36.5z" fill="#ff746e" stroke="${stroke}" stroke-width="2.2" stroke-linejoin="round"/><path d="M18 40V28h12v12" fill="#ffd36f" stroke="${stroke}" stroke-width="2.2"/><path d="M34 17v-5h5v10" fill="#ffb468" stroke="${stroke}" stroke-width="2.2" stroke-linejoin="round"/>`, '#ff746e','#fff0ee'),
    trail:wrap(`<path d="M9 35c6-14 10-14 15-6s8 6 15-9" fill="none" stroke="#5b45e8" stroke-width="3.5" stroke-linecap="round"/><circle cx="10" cy="35" r="4" fill="#63d39c" stroke="${stroke}" stroke-width="2"/><circle cx="24" cy="29" r="4" fill="#ffd36f" stroke="${stroke}" stroke-width="2"/><path d="M35 8v11M35 9h9l-3.5 4L44 17h-9" fill="#ff708f" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>`,'#5b45e8','#eef3ff'),
    explore:wrap(`<circle cx="21" cy="21" r="10" fill="#79c9ff" stroke="${stroke}" stroke-width="2.5"/><path d="m28.5 28.5 9 9" stroke="${stroke}" stroke-width="4" stroke-linecap="round"/><path d="m18 24 3-8 8-3-3 8z" fill="#ff718d" stroke="${stroke}" stroke-width="2"/>`,'#4b9df7','#eef7ff'),
    library:wrap(`<path d="M10 14h8v24h-8z" fill="#65d6a3" stroke="${stroke}" stroke-width="2"/><path d="M18 10h10v28H18z" fill="#7b65ef" stroke="${stroke}" stroke-width="2"/><path d="M28 16h10v22H28z" fill="#ff7d86" stroke="${stroke}" stroke-width="2"/><path d="M8 40h32" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>`,'#7b65ef','#f3efff'),
    review:wrap(`<path d="M24 10c-6-5-13 1-10 7-6 1-7 10-1 12-2 7 7 11 11 5 4 6 13 2 11-5 6-2 5-11-1-12 3-6-4-12-10-7z" fill="#ff8dad" stroke="#b8175a" stroke-width="2.3"/><path d="M24 14v20M18 18c4 0 6 2 6 5M30 18c-4 0-6 2-6 5M18 29c4 0 6-2 6-5M30 29c-4 0-6-2-6-5" fill="none" stroke="#b8175a" stroke-width="2" stroke-linecap="round"/>`,'#ff8dad','#fff0f5'),
    tracking:wrap(`<rect x="10" y="27" width="7" height="11" rx="3.5" fill="#ffb64f" stroke="${stroke}" stroke-width="2"/><rect x="20.5" y="20" width="7" height="18" rx="3.5" fill="#61d19a" stroke="${stroke}" stroke-width="2"/><rect x="31" y="12" width="7" height="26" rx="3.5" fill="#7a63ef" stroke="${stroke}" stroke-width="2"/><path d="M10 17c7 2 12-1 17-5 4-3 7-4 11-3" fill="none" stroke="#ff6e86" stroke-width="2.6" stroke-linecap="round"/><path d="m35 7 4 2-3 3" fill="none" stroke="#ff6e86" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`,'#7a63ef','#eff8f4'),
    settings:wrap(`<path d="M24 10 28 12l4-1 3 3-1 4 2 4-2 4 1 4-3 3-4-1-4 2-4-2-4 1-3-3 1-4-2-4 2-4-1-4 3-3 4 1z" fill="#8cc7ff" stroke="${stroke}" stroke-width="2"/><circle cx="24" cy="24" r="6" fill="#fff" stroke="${stroke}" stroke-width="2"/>`,'#58a7ef','#eef7ff'),
    people:wrap(`<circle cx="17" cy="18" r="6" fill="#ff9b87" stroke="${stroke}" stroke-width="2"/><circle cx="31" cy="18" r="6" fill="#78aaf6" stroke="${stroke}" stroke-width="2"/><path d="M8 36c1-7 5-10 9-10s8 3 9 10M22 36c1-7 5-10 9-10s8 3 9 10" fill="#ffd06a" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/><circle cx="15.2" cy="18" r="1" fill="${stroke}"/><circle cx="18.8" cy="18" r="1" fill="${stroke}"/><path d="M15 21c1.5 1 2.5 1 4 0" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round"/><circle cx="29.2" cy="18" r="1" fill="${stroke}"/><circle cx="32.8" cy="18" r="1" fill="${stroke}"/><path d="M29 21c1.5 1 2.5 1 4 0" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round"/>`,'#ff9b87','#fff1ee'),
    food:wrap(`<path d="M11 18h26l-2 17H13z" fill="#ffd365" stroke="${stroke}" stroke-width="2"/><path d="M15 18c1-5 4-8 8-8 3 0 6 2 8 7" fill="#ff786f" stroke="${stroke}" stroke-width="2"/><path d="M21 12c0-3 2-5 5-6" stroke="#3ea968" stroke-width="2.6" stroke-linecap="round"/><path d="M31 10c-4 0-6 1-8 4 4 1 7 0 8-4z" fill="#66c67a" stroke="#347652" stroke-width="1.5"/>`,'#ff9d56','#fff7e7'),
    animals:wrap(`<path d="M13 20 9 12l9 4c4-2 8-2 12 0l9-4-4 8c2 3 2 8 0 12-3 5-7 7-11 7s-8-2-11-7c-2-4-2-9 0-12z" fill="#e4a36e" stroke="${stroke}" stroke-width="2"/><circle cx="19" cy="25" r="1.5" fill="${stroke}"/><circle cx="29" cy="25" r="1.5" fill="${stroke}"/><path d="M22 29h4l-2 3z" fill="#ff7d86" stroke="${stroke}" stroke-width="1.4"/><path d="M19 34c2 2 8 2 10 0" fill="none" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round"/>`,'#d89667','#fff2ea'),
    work:wrap(`<rect x="9" y="16" width="30" height="21" rx="5" fill="#5da7f5" stroke="${stroke}" stroke-width="2.4"/><path d="M18 16v-4h12v4" fill="none" stroke="${stroke}" stroke-width="2.4"/><path d="M9 25c8 4 22 4 30 0" fill="none" stroke="${stroke}" stroke-width="2"/><rect x="21" y="23" width="6" height="7" rx="2" fill="#ffd25f" stroke="${stroke}" stroke-width="1.7"/>`,'#5da7f5','#edf6ff'),
    house:wrap(`<path d="M9 23 24 10l15 13v14H9z" fill="#fff2d8" stroke="${stroke}" stroke-width="2.3" stroke-linejoin="round"/><path d="m7 24 17-15 17 15" fill="none" stroke="#ff7474" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><rect x="20" y="27" width="8" height="10" rx="2" fill="#74b5ff" stroke="${stroke}" stroke-width="2"/>`,'#ff7474','#fff2ef'),
    feelings:wrap(`<path d="M24 39S8 30 8 19c0-6 7-10 12-5l4 4 4-4c5-5 12-1 12 5 0 11-16 20-16 20z" fill="#ff7894" stroke="${stroke}" stroke-width="2.3"/><path d="M13 12l-2-4M35 12l2-4M7 17l-4-1M41 17l4-1" stroke="#ffb548" stroke-width="2.2" stroke-linecap="round"/>`,'#ff7894','#fff0f4'),
    education:wrap(`<path d="m7 20 17-9 17 9-17 9z" fill="#647bd8" stroke="${stroke}" stroke-width="2.2" stroke-linejoin="round"/><path d="M13 24v9c7 4 15 4 22 0v-9" fill="#7f95ee" stroke="${stroke}" stroke-width="2"/><path d="M41 20v12" stroke="#f3b23e" stroke-width="2.5"/><circle cx="41" cy="34" r="2.5" fill="#f3b23e"/>`,'#647bd8','#f1f2ff'),
    nature:wrap(`<path d="M24 39V24" stroke="#347652" stroke-width="2.6" stroke-linecap="round"/><path d="M24 27C12 26 10 15 12 9c7 1 14 6 12 18z" fill="#77ca78" stroke="#347652" stroke-width="2"/><path d="M24 24c10 1 15-7 14-14-7 0-13 5-14 14z" fill="#55b86c" stroke="#347652" stroke-width="2"/>`,'#65bf71','#eef9ef'),
    more:wrap(`<circle cx="15" cy="24" r="3" fill="#735fe8"/><circle cx="24" cy="24" r="3" fill="#ff7f96"/><circle cx="33" cy="24" r="3" fill="#62c995"/>`,'#735fe8','#f3efff'),
    sequence:wrap(`<rect x="10" y="12" width="28" height="26" rx="6" fill="#fff" stroke="${stroke}" stroke-width="2.2"/><path d="M10 20h28" stroke="#ff6f8d" stroke-width="4"/><path d="M17 8v8M31 8v8" stroke="#5a45df" stroke-width="3" stroke-linecap="round"/><path d="m17 28 4 4 9-10" fill="none" stroke="#61c98f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,'#ff6f8d','#fff0f5'),
    streak:wrap(`<path d="M24 40c-8 0-13-5-13-12 0-7 5-10 8-15 1 5 4 6 5 10 2-5 3-9 1-15 8 5 12 12 12 20 0 7-5 12-13 12z" fill="#ff7a57" stroke="${stroke}" stroke-width="2.1"/><path d="M24 36c-4 0-7-2-7-6 0-4 3-6 5-9 1 4 4 5 4 9 1-2 2-4 1-7 3 2 5 5 5 8 0 3-3 5-8 5z" fill="#ffd257"/>`,'#ff7a57','#fff2e9'),
    learned:wrap(`<path d="M11 31c-2-4-1-8 2-11l3-3v-6c0-3 4-3 4 0v6-8c0-3 4-3 4 0v8-7c0-3 4-3 4 0v9l2-4c1-3 5-1 4 2l-3 9c-2 7-7 11-13 11-3 0-6-2-7-6z" fill="#ffc1a3" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/><path d="M37 18c2 3 2 7 0 10l-3 4c-2 3-5 5-9 6" fill="none" stroke="#6d55e8" stroke-width="2.5" stroke-linecap="round"/><path d="m34 28 3 1 1-3" fill="none" stroke="#6d55e8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,'#ff9f82','#fff2ed'),
    best:wrap(`<path d="m24 10 4 8 9 1-6.5 6 2 9-8.5-4.5-8.5 4.5 2-9L11 19l9-1z" fill="#ffd058" stroke="${stroke}" stroke-width="2"/><circle cx="24" cy="24" r="15" fill="none" stroke="#ff8367" stroke-width="2.2"/>`,'#ffd058','#fff7e7'),
    continue:wrap(`<path d="M17 12v24l19-12z" fill="#7257ee" stroke="${stroke}" stroke-width="2.2" stroke-linejoin="round"/>`,'#7257ee','#f3efff'),
    lesson:wrap(`<path d="M10 13h12c4 0 6 2 6 5v20H16c-4 0-6-2-6-5z" fill="#77b9ff" stroke="${stroke}" stroke-width="2"/><path d="M38 13H26c-4 0-6 2-6 5v20h12c4 0 6-2 6-5z" fill="#9b83ef" stroke="${stroke}" stroke-width="2"/>`,'#7b63e8','#f2efff'),
    reviewActivity:wrap(`<rect x="12" y="9" width="24" height="31" rx="5" fill="#fff6e9" stroke="${stroke}" stroke-width="2"/><rect x="18" y="7" width="12" height="5" rx="2.5" fill="#77caa0" stroke="${stroke}" stroke-width="1.8"/><path d="m17 20 3 3 5-6M17 30l3 3 5-6M28 20h5M28 30h5" fill="none" stroke="#49b57e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`,'#77caa0','#eff9f4'),
    search:wrap(`<circle cx="21" cy="21" r="10" fill="#d8ecff" stroke="${stroke}" stroke-width="2.3"/><path d="m29 29 9 9" stroke="${stroke}" stroke-width="3.7" stroke-linecap="round"/>`,'#6aaef5','#eef7ff'),
    download:wrap(`<rect x="10" y="31" width="28" height="7" rx="3.5" fill="#66ca95" stroke="${stroke}" stroke-width="2"/><path d="M24 9v20M17 22l7 7 7-7" fill="none" stroke="#5b45e8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,'#66ca95','#eff9f3'),
    variants:wrap(`<rect x="9" y="13" width="20" height="24" rx="5" fill="#8fbff7" stroke="${stroke}" stroke-width="2"/><rect x="19" y="9" width="20" height="24" rx="5" fill="#ff9aad" stroke="${stroke}" stroke-width="2"/><path d="M25 21h8M29 17l4 4-4 4" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,'#ff9aad','#fff0f4'),
    photo:wrap(`<rect x="9" y="15" width="30" height="22" rx="6" fill="#86c8ff" stroke="${stroke}" stroke-width="2.2"/><path d="M17 15l3-5h8l3 5" fill="#ff9aad" stroke="${stroke}" stroke-width="2.2" stroke-linejoin="round"/><circle cx="24" cy="26" r="6" fill="#fff" stroke="${stroke}" stroke-width="2.2"/><circle cx="24" cy="26" r="2.5" fill="#6d55e8"/><circle cx="34" cy="20" r="1.6" fill="#ffd25f"/>`,'#86c8ff','#eef7ff'),
    edit:wrap(`<path d="M12 34l2-8L30 10l8 8-16 16-8 2z" fill="#ffd25f" stroke="${stroke}" stroke-width="2.2" stroke-linejoin="round"/><path d="m27 13 8 8" stroke="#ff7895" stroke-width="3" stroke-linecap="round"/><path d="m14 27 7 7" stroke="${stroke}" stroke-width="2"/>`,'#ffd25f','#fff8e8'),
    close:wrap(`<circle cx="24" cy="24" r="14" fill="#ff9aad" stroke="${stroke}" stroke-width="2.2"/><path d="M18 18l12 12M30 18 18 30" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/>`,'#ff8fa7','#fff0f4')
  };
  const catRules=[
    [/famil|pessoa|pronome|sauda|relacion|acessib/i,'people'],
    [/aliment|bebida|comida/i,'food'],
    [/animais?/i,'animals'],
    [/trabalho|profiss/i,'work'],
    [/casa|objeto|lugar/i,'house'],
    [/sentimento|emoç|caracter/i,'feelings'],
    [/escola|estudo|educa|comunica|língua/i,'education'],
    [/natureza|clima|corpo|saúde/i,'nature']
  ];
  window.LSIcon=(name,cls='')=>`<span class="ls-icon ${cls}" data-ls-icon="${name}">${I[name]||I.more}</span>`;
  window.LSCategoryIcon=name=>{const hit=catRules.find(([r])=>r.test(String(name||'')));return window.LSIcon(hit?hit[1]:'more','category-icon')};
  window.LSHydrateIcons=(root=document)=>root.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=(I[el.dataset.icon]||I.more);el.classList.add('ls-icon')});
})();

/* Sistema C selecionado: ícones 2D, arredondados, coloridos e sem rostos em objetos inanimados. */
(()=> {
  const ink="#18204b";
  const tile=(body,bg="#f3efff")=>'<span class="ls-icon category-icon ls-category-selected"><svg viewBox="0 0 48 48" aria-hidden="true"><rect x="2" y="2" width="44" height="44" rx="13" fill="'+bg+'"/>'+body+'</svg></span>';
  const p=(d,fill,sw=2)=>'<path d="'+d+'" fill="'+fill+'" stroke="'+ink+'" stroke-width="'+sw+'" stroke-linecap="round" stroke-linejoin="round"/>';
  const line=(d,c=ink,sw=2)=>'<path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="'+sw+'" stroke-linecap="round" stroke-linejoin="round"/>';
  const circle=(x,y,r,fill)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+fill+'" stroke="'+ink+'" stroke-width="2"/>';
  const rect=(x,y,w,h,rx,fill)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rx+'" fill="'+fill+'" stroke="'+ink+'" stroke-width="2"/>';
  const N=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
  const C={
    "familia":()=>tile(circle(15,18,5,"#ffad91")+circle(33,18,5,"#83b8f7")+circle(24,14,4.5,"#ffd36f")+line("M8 37c1-8 4-12 8-12s7 4 8 12M24 37c1-8 4-12 8-12s7 4 8 12M17 36c1-7 3-10 7-10s6 3 7 10"),"#fff1ed"),
    "cores":()=>tile(circle(17,17,6,"#ff718d")+circle(31,17,6,"#6f9df6")+circle(17,31,6,"#ffd05d")+circle(31,31,6,"#67ca91"),"#fff8ed"),
    "numeros e quantidades":()=>tile(rect(9,9,30,30,8,"#fff")+line("M17 15l-2 18M28 15l-2 18M12 22h22M11 30h22","#7258e9",2.7),"#f2efff"),
    "perguntas":()=>tile(p("M17 17c1-6 14-7 14 1 0 5-7 5-7 10","#ffd15f")+circle(24,35,2.2,"#ff7892"),"#fff7e7"),
    "pessoas e pronomes":()=>tile(circle(18,17,6,"#ffad91")+circle(31,18,5,"#7eb4f6")+p("M9 37c1-8 5-12 9-12s8 4 9 12","#ffd066")+p("M25 37c1-7 3-10 7-10s6 3 7 10","#7fd1a2"),"#fff2ee"),
    "saudacoes e cortesia":()=>tile(p("M14 35c-3-7-3-14-1-20 1-3 4-2 4 1l1 8V11c0-4 5-4 5 0v11V9c0-4 5-4 5 0v14l3-7c2-3 6-1 5 3-2 9-6 16-12 19-4 2-8 1-10-3z","#ffc19f")+line("M9 11 6 8M12 7V4M7 16H3","#ffd05c",2.4),"#fff2ec"),
    "tempo e calendario":()=>tile(rect(9,11,30,28,7,"#fff")+p("M9 18h30v-3a4 4 0 0 0-4-4H13a4 4 0 0 0-4 4z","#ff7893")+line("M16 8v7M32 8v7","#7258e9",2.5)+circle(18,27,2.5,"#ffd05d")+circle(29,27,2.5,"#6ecb96"),"#fff0f5"),
    "casa e objetos":()=>tile(p("M8 23 24 9l16 14v16H8z","#fff1d6")+p("M6 24 24 8l18 16","#ff7774",4)+rect(20,28,8,11,2,"#79b8f8"),"#fff2ef"),
    "alimentos e bebidas":()=>tile(p("M11 19h22l-2 17H13z","#ffd05f")+p("M16 19c1-6 5-9 9-9 4 0 7 3 8 8","#ff7a72")+line("M25 11c0-3 2-5 5-6","#4cab6b",2.4),"#fff7e8"),
    "animais":()=>tile(p("M12 21 9 13l8 4c4-2 10-2 14 0l8-4-3 8c2 3 2 8 0 12-3 5-7 7-12 7s-9-2-12-7c-2-4-2-9 0-12z","#dda06d")+circle(19,26,1.5,ink)+circle(29,26,1.5,ink)+p("M21 30h6l-3 3z","#ff7b8e"),"#fff2ea"),
    "corpo humano":()=>tile(circle(24,12,5,"#ffb092")+p("M18 19h12l3 11-5 1v9h-8v-9l-5-1z","#7fb6f7")+line("M18 22 11 29M30 22l7 7","#ffb092",3),"#eef7ff"),
    "saude e cuidados":()=>tile(rect(10,13,28,24,7,"#fff")+p("M21 18h6v6h6v6h-6v6h-6v-6h-6v-6h6z","#ff7584"),"#eff9f4"),
    "roupas e acessorios":()=>tile(p("M16 11 8 17l5 8 5-3v16h12V22l5 3 5-8-8-6-4 5h-8z","#7f9df4"),"#f1f3ff"),
    "escola e estudo":()=>tile(p("M7 19 24 10l17 9-17 9z","#687fda")+p("M13 23v10c7 4 15 4 22 0V23","#8da0ef")+line("M41 19v13","#f0ae3e",2.5),"#f1f2ff"),
    "trabalho e profissoes":()=>tile(rect(9,16,30,21,5,"#62aaf5")+line("M18 16v-4h12v4M9 25c8 4 22 4 30 0")+rect(21,23,6,7,2,"#ffd05c"),"#eef7ff"),
    "lugares":()=>tile(p("M24 41S12 30 12 20c0-8 5-13 12-13s12 5 12 13c0 10-12 21-12 21z","#ff7891")+circle(24,20,5,"#fff0d7"),"#fff0f4"),
    "transporte e transito":()=>tile(p("M10 27l3-10h22l3 10v9H10z","#71b6f7")+circle(16,35,3,"#ffd05c")+circle(32,35,3,"#ffd05c")+line("M15 22h18"),"#eef7ff"),
    "natureza e clima":()=>tile(line("M24 39V24","#347652",2.6)+p("M24 27C12 26 10 15 12 9c7 1 14 6 12 18z","#77ca78")+p("M24 24c10 1 15-7 14-14-7 0-13 5-14 14z","#55b86c"),"#eff9ef"),
    "sentimentos e emocoes":()=>tile(p("M24 39S8 30 8 19c0-6 7-10 12-5l4 4 4-4c5-5 12-1 12 5 0 11-16 20-16 20z","#ff7894"),"#fff0f4"),
    "caracteristicas e estados":()=>tile(p("M24 8l4 10 11 1-8 7 3 11-10-6-10 6 3-11-8-7 11-1z","#ffd05d")+circle(38,11,3,"#ff7b93"),"#fff7e7"),
    "acoes e verbos":()=>tile(circle(26,11,4,"#ffad91")+line("M24 16l-5 9 7 5-4 9M20 23l-8 3M24 18l8 5","#6855e7",3),"#f2efff"),
    "comunicacao e lingua":()=>tile(p("M8 12h27a7 7 0 0 1 7 7v11a7 7 0 0 1-7 7H22l-9 7v-7H8a7 7 0 0 1-7-7V19a7 7 0 0 1 7-7z","#76b9f7")+line("M13 22h18M13 28h12","#fff",2.5),"#eef7ff"),
    "tecnologia e midia":()=>tile(rect(8,10,32,23,4,"#79b6f7")+rect(18,36,12,3,1.5,"#ffd05c")+line("M16 39h16"),"#eef7ff"),
    "lazer e esportes":()=>tile(circle(24,24,14,"#fff")+p("M24 16l5 4-2 6h-6l-2-6z","#7258e9")+line("M12 22l7-2M29 20l7 2M21 26l-4 8M27 26l4 8"),"#f2efff"),
    "dinheiro e compras":()=>tile(p("M12 17h24l-2 20H14z","#ff8aa0")+line("M17 17c0-6 14-6 14 0")+circle(24,27,5,"#ffd05d"),"#fff0f4"),
    "rotina diaria":()=>tile(circle(24,24,15,"#fff")+line("M24 14v11l7 4","#7258e9",2.8)+circle(24,24,2,"#ff7b91"),"#f2efff"),
    "viagens e turismo":()=>tile(p("M8 25l31-12-10 13 9 7-4 3-10-5-8 8-3-2 4-10z","#78b8f6"),"#eef7ff"),
    "emergencia e seguranca":()=>tile(p("M16 33h16l-2-16c-1-7-11-7-12 0z","#ff6f79")+rect(12,33,24,5,2,"#6e7b9d")+line("M24 9V5M12 14 8 11M36 14l4-3","#ffd05d",2.4),"#fff0f1"),
    "acessibilidade e inclusao":()=>tile(circle(19,12,4,"#75b7f7")+circle(26,30,9,"#fff")+line("M20 17l3 11h12l5 9M23 22h10","#7258e9",2.7),"#eef7ff"),
    "relacionamentos":()=>tile(p("M18 36S8 30 8 21c0-5 6-8 10-4l6 6 6-6c4-4 10-1 10 4 0 9-10 15-16 20z","#ff7894")+circle(14,13,3,"#ffd05d")+circle(34,13,3,"#78b8f6"),"#fff0f4"),
    "frases":()=>tile(p("M13 15h22a5 5 0 0 1 5 5v9a5 5 0 0 1-5 5H24l-7 5v-5h-4a5 5 0 0 1-5-5v-9a5 5 0 0 1 5-5z","#78b8f6")+line("M16 22h16M16 27h11","#fff",2),"#eef7ff"),
    "outros":()=>tile(circle(15,24,3,"#7258e9")+circle(24,24,3,"#ff7f96")+circle(33,24,3,"#62c995"),"#f3efff")
  };
  window.LSCategoryIcon=name=>(C[N(name)]||C.outros)();
})();
