const APP_VERSION="0.5.62";
const cfg=window.LIBRAS_STUDIO_CONFIG||{},$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const nativeParams=new URLSearchParams(location.search);
const IS_NATIVE_ANDROID=nativeParams.get("native")==="android";
const NATIVE_APK_BUILD=nativeParams.get("apk")||"";
if(IS_NATIVE_ANDROID)document.documentElement.classList.add("native-app");
function importNativeStagedStorage(){if(!IS_NATIVE_ANDROID||location.protocol==="file:"||!window.LibrasUpdater||typeof window.LibrasUpdater.consumeStagedLocalStorage!=="function")return;try{let raw=window.LibrasUpdater.consumeStagedLocalStorage();if(!raw)return;let data=JSON.parse(raw);for(let[k,v]of Object.entries(data||{}))if(typeof v==="string"&&localStorage.getItem(k)===null)localStorage.setItem(k,v)}catch(e){console.warn("migração de dados para atualização",e)}}
function nativeStorageSnapshot(){let out={};try{for(let i=0;i<localStorage.length;i++){let k=localStorage.key(i);if(k!=null){let v=localStorage.getItem(k);if(v!=null)out[k]=v}}}catch(e){console.warn("snapshot local",e)}return JSON.stringify(out)}
importNativeStagedStorage();
let sb,S={session:null,signs:[],cats:[],reviews:[],study:[],catalog:null,catalogStats:null,phraseResults:[],queue:[],i:0,explore:null,librasLabCandidates:[],librasLabUnmatched:[]};
let trackingYear=new Date().getFullYear(),trackingMonth=new Date().getMonth();
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const title=s=>{s=String(s||"").trim().replace(/\s+/g," ");return s?s[0].toLocaleUpperCase("pt-BR")+s.slice(1).toLocaleLowerCase("pt-BR"):s};
function toast(t){let x=$("#toast");x.textContent=t;x.classList.add("show");clearTimeout(x._t);x._t=setTimeout(()=>x.classList.remove("show"),2500)}
function go(v){$$(".view").forEach(x=>x.classList.remove("active"));$("#"+v)?.classList.add("active");$$("nav [data-view]").forEach(x=>x.classList.toggle("active",x.dataset.view===v));$$(".side-nav [data-view]").forEach(x=>x.classList.toggle("active",x.dataset.view===v));$("#more")?.classList.add("hidden");window.scrollTo(0,0);if(v==="progress")renderProgressPage();if(v==="library")library();if(v==="explore")exploreCats();if(v==="libraslab")refreshLibrasLab()}
const REMEMBERED_USER_KEY="ls-remembered-user-v1",PENDING_PREFIX="ls-pending-v1:",CACHE_PREFIX="ls-full-v2:",PROFILE_PREFIX="ls-profile-v1:";
function rememberedUser(){try{return JSON.parse(localStorage.getItem(REMEMBERED_USER_KEY)||"null")}catch{return null}}
function rememberSession(session){let u=session?.user;if(!u?.id)return;localStorage.setItem(REMEMBERED_USER_KEY,JSON.stringify({id:u.id,email:u.email||""}))}
function forgetRememberedUser(){localStorage.removeItem(REMEMBERED_USER_KEY);localStorage.removeItem("ls-full")}
function offlineSession(user){return user?.id?{user:{id:user.id,email:user.email||""},offline:true}:null}
function activeUserId(){return S.session?.user?.id||rememberedUser()?.id||""}
function userCacheKey(id=activeUserId()){return id?CACHE_PREFIX+id:""}
function pendingKey(id=activeUserId()){return id?PENDING_PREFIX+id:""}
function profileKey(id=activeUserId()){return id?PROFILE_PREFIX+id:""}
function profilePrefs(){try{let k=profileKey();return k?JSON.parse(localStorage.getItem(k)||"{}"):{} }catch{return{}}}
function saveProfilePrefs(patch){let k=profileKey();if(!k)return;let next={...profilePrefs(),...patch};try{localStorage.setItem(k,JSON.stringify(next))}catch(e){console.warn("perfil local",e)}renderProfileIdentity()}
function defaultProfileName(){let email=S.session?.user?.email||rememberedUser()?.email||"",base=(email.split("@")[0]||"estudante").split(/[._-]/)[0];return base?base[0].toUpperCase()+base.slice(1):"Estudante"}
function profileDisplayName(){let custom=String(profilePrefs().name||"").trim();return custom||defaultProfileName()}
function setAvatarElement(el,photo,initials){if(!el)return;if(photo){el.textContent="";el.style.backgroundImage='url("'+photo.replace(/"/g,"%22")+'")';el.classList.add("has-photo")}else{el.style.backgroundImage="";el.classList.remove("has-photo");el.textContent=initials}}
function renderProfileIdentity(){if(!S.session)return;let p=profilePrefs(),name=profileDisplayName(),email=S.session.user?.email||rememberedUser()?.email||"",initials=(name.replace(/\s+/g," ").split(" ").filter(Boolean).slice(0,2).map(x=>x[0]).join("")||"LS").toUpperCase();let hn=$("#home-user-name"),pn=$("#profile-name"),mn=$("#profile-menu-name"),me=$("#profile-menu-email");if(hn)hn.textContent=name;if(pn)pn.textContent="Olá, "+name+"!";if(mn)mn.textContent=name;if(me)me.textContent=email;setAvatarElement($("#profile-avatar"),p.photo,initials);setAvatarElement($("#profile-menu-avatar"),p.photo,initials);$("#profile-remove-photo")?.classList.toggle("hidden",!p.photo)}
function closeProfileMenu(){let m=$("#profile-menu"),t=$("#profile-menu-toggle");if(m)m.classList.add("hidden");if(t)t.setAttribute("aria-expanded","false")}
function toggleProfileMenu(){let m=$("#profile-menu"),t=$("#profile-menu-toggle");if(!m||!t)return;let open=m.classList.contains("hidden");$("#more")?.classList.add("hidden");m.classList.toggle("hidden",!open);t.setAttribute("aria-expanded",open?"true":"false");if(open)renderProfileIdentity()}
async function logoutUser(){closeProfileMenu();try{await sb.auth.signOut({scope:"local"})}finally{forgetRememberedUser();S.session=null;S.signs=[];S.cats=[];S.reviews=[];S.study=[];authUI()}}
function optimizeProfilePhoto(file){return new Promise((resolve,reject)=>{if(!file?.type?.startsWith("image/"))return reject(new Error("invalid-image"));if(file.size>12*1024*1024)return reject(new Error("image-too-large"));let reader=new FileReader;reader.onerror=()=>reject(reader.error||new Error("read-error"));reader.onload=()=>{let img=new Image;img.onerror=()=>reject(new Error("image-error"));img.onload=()=>{let size=Math.min(img.naturalWidth,img.naturalHeight),sx=Math.max(0,(img.naturalWidth-size)/2),sy=Math.max(0,(img.naturalHeight-size)/2),canvas=document.createElement("canvas");canvas.width=256;canvas.height=256;canvas.getContext("2d").drawImage(img,sx,sy,size,size,0,0,256,256);resolve(canvas.toDataURL("image/jpeg",.82))};img.src=reader.result};reader.readAsDataURL(file)})}
async function changeProfilePhoto(file){if(!file)return;try{let photo=await optimizeProfilePhoto(file);saveProfilePrefs({photo});toast("Foto do perfil atualizada 📷")}catch(e){console.warn(e);toast(e.message==="image-too-large"?"Escolha uma imagem de até 12 MB.":"Não consegui usar essa imagem.")}finally{let input=$("#profile-photo-input");if(input)input.value=""}}
function openProfileNameEditor(){
  closeProfileMenu();
  let current=profileDisplayName();
  modal('<div class="profile-edit-modal"><div class="profile-edit-kicker">SEU PERFIL</div><h2>Como você quer aparecer?</h2><p>Escolha o nome que será mostrado no Libras Studio.</p><form id="profile-name-form"><label class="profile-name-label" for="profile-name-input">Nome de exibição</label><div class="profile-name-input-wrap"><input id="profile-name-input" maxlength="40" autocomplete="name" value="'+esc(current)+'" placeholder="Seu nome"><span id="profile-name-count">'+current.length+'/40</span></div><small class="profile-name-help">Você pode alterar novamente quando quiser.</small><div class="profile-edit-actions"><button id="profile-name-cancel" class="soft" type="button">Cancelar</button><button class="primary" type="submit">Salvar nome</button></div></form></div>');
  let input=$("#profile-name-input"),count=$("#profile-name-count"),form=$("#profile-name-form");
  input.oninput=()=>{count.textContent=input.value.length+"/40"};
  $("#profile-name-cancel").onclick=()=>$("#modal").classList.add("hidden");
  form.onsubmit=e=>{
    e.preventDefault();
    let name=input.value.trim().replace(/\s+/g," ");
    if(name.length>40)return toast("Use um nome de até 40 caracteres.");
    saveProfilePrefs({name});
    home();
    $("#modal").classList.add("hidden");
    toast(name?"Nome atualizado.":"Nome restaurado.");
  };
  requestAnimationFrame(()=>{input.focus();input.select()});
}
function authUI(){let on=!!S.session;$("#auth").classList.toggle("hidden",on);$("#app").classList.toggle("hidden",!on);if(on){$("#account").textContent="☁️ "+(S.session.user.email||"Conta");renderProfileIdentity()}else closeProfileMenu()}
function cache(){let key=userCacheKey();if(!key)return;try{localStorage.setItem(key,JSON.stringify({signs:S.signs,cats:S.cats,reviews:S.reviews,study:S.study,updated_at:new Date().toISOString()}))}catch(e){console.warn("cache local",e)}}
function signNormKey(x){return String(x?.norm||norm(x?.name||"")).trim()}
function stableVariantIdentity(x){
  let n=signNormKey(x),vk=String(x?.variant_key||"").trim(),path=String(x?.media_path||"").trim(),url=String(x?.source_url||"").trim().replace(/^http:/,"https:");
  if(vk)return n+"|variant|"+vk;
  if(path)return n+"|path|"+path;
  if(url)return n+"|url|"+url;
  return n+"|id|"+String(x?.studio_id||"")
}
function compactExactDuplicateVariants(){
  let seen=new Map,out=[],removed=[];
  for(let item of(S.signs||[])){
    let key=stableVariantIdentity(item),kept=seen.get(key);
    if(!kept){seen.set(key,item);out.push(item);continue}
    for(let field of["media_url","media_path","media_sha1","source_url","source_id","source_name","source_label","category_name","category_source","category_tags"]){
      if(!kept[field]&&item[field])kept[field]=item[field]
    }
    removed.push(item)
  }
  if(removed.length)S.signs=out;
  return removed
}
function cached(userId=activeUserId()){try{let key=userCacheKey(userId),raw=key?localStorage.getItem(key):null;if(!raw&&userId){raw=localStorage.getItem("ls-full");if(raw){localStorage.setItem(key,raw);localStorage.removeItem("ls-full")}}let x=JSON.parse(raw||"{}");S.signs=x.signs||[];S.cats=x.cats||[];S.reviews=x.reviews||[];S.study=x.study||[];let removed=compactExactDuplicateVariants();if(removed.length&&key)localStorage.setItem(key,JSON.stringify({signs:S.signs,cats:S.cats,reviews:S.reviews,study:S.study,updated_at:new Date().toISOString()}));return !!raw}catch{return false}}
function pendingOps(){let key=pendingKey();if(!key)return[];try{return JSON.parse(localStorage.getItem(key)||"[]")}catch{return[]}}
function setPendingOps(ops){let key=pendingKey();if(!key)return;try{if(ops.length)localStorage.setItem(key,JSON.stringify(ops));else localStorage.removeItem(key)}catch(e){console.warn("fila offline",e)}}
function queuePending(type,key,row){let ops=pendingOps(),id=type+":"+key,next={type,key,row,queued_at:new Date().toISOString()},i=ops.findIndex(x=>x.type+":"+x.key===id);if(i>=0)ops[i]=next;else ops.push(next);setPendingOps(ops)}
async function flushPending(){let ops=pendingOps();if(!ops.length)return 0;let remain=[],done=0;for(let op of ops){try{let res;if(op.type==="study")res=await sb.from("study_progress").upsert(op.row,{onConflict:"user_id,lesson_id"});else if(op.type==="review")res=await sb.from("review_state").upsert(op.row,{onConflict:"user_id,norm"});else if(op.type==="sign_update")res=await sb.from("signs").update(op.row).eq("studio_id",op.key);else if(op.type==="sign_delete")res=await sb.from("signs").update(op.row).eq("studio_id",op.key);else continue;if(res.error)throw res.error;done++}catch(e){console.warn("sincronização pendente",op,e);remain.push(op)}}setPendingOps(remain);if(remain.length)throw new Error("pending-sync-failed");return done}
function localStatus(text){let el=$("#sync-status");if(el)el.textContent=text}
async function cloudSnapshot({includeDeleted=false}={}){
  const catQ=sb.from("categories").select("*"),signQ=sb.from("signs").select("*"),reviewQ=sb.from("review_state").select("*"),studyQ=sb.from("study_progress").select("*");
  let[c,s,r,p]=await Promise.all([
    includeDeleted?catQ:catQ.is("deleted_at",null).order("sort_order"),
    includeDeleted?signQ:signQ.is("deleted_at",null).order("name"),
    includeDeleted?reviewQ:reviewQ.is("deleted_at",null),
    studyQ
  ]);
  for(let x of[c,s,r,p])if(x.error)throw x.error;
  return{cats:c.data||[],signs:s.data||[],reviews:r.data||[],study:p.data||[]}
}
async function upsertChunks(table,rows,onConflict){for(let i=0;i<rows.length;i+=150){let{error}=await sb.from(table).upsert(rows.slice(i,i+150),{onConflict});if(error)throw error}}
function phoneCategoryRow(x,now){return{user_id:S.session.user.id,name:x.name||"Outros",emoji:x.emoji||"🧩",description:x.description||"",sort_order:Number(x.sort_order||999),is_custom:!!x.is_custom,is_hidden:!!x.is_hidden,updated_at:now,deleted_at:null}}
function phoneSignRow(x,now){return{user_id:S.session.user.id,studio_id:x.studio_id||uuid(),name:x.name||"",norm:x.norm||norm(x.name),variant_no:Number(x.variant_no||1),variant_key:x.variant_key||("mobile|"+norm(x.name)+"|"+norm(x.source_url||x.media_url||x.studio_id||"")),category_name:x.category_name||"Outros",category_source:x.category_source||"auto",category_tags:typeof x.category_tags==="string"?x.category_tags:JSON.stringify(x.category_tags||[]),source_id:x.source_id||null,source_name:x.source_name||null,source_url:x.source_url||null,source_label:x.source_label||null,origin:x.origin||"catalog",lesson_url:x.lesson_url||null,lesson_start:x.lesson_start??null,lesson_end:x.lesson_end??null,media_path:x.media_path||null,media_sha1:x.media_sha1||null,created_at:x.created_at||now,updated_at:now,deleted_at:null}}
function phoneReviewRow(x,now){return{user_id:S.session.user.id,norm:x.norm,due_at:x.due_at||null,interval_days:Number(x.interval_days||0),ease:Number(x.ease||2.5),reps:Number(x.reps||0),lapses:Number(x.lapses||0),last_rating:x.last_rating||null,last_reviewed_at:x.last_reviewed_at||null,created_at:x.created_at||now,updated_at:now,deleted_at:null}}
function phoneStudyRows(remote,now){let local=new Map((S.study||[]).map(x=>[x.lesson_id,x])),ids=new Set([...(window.LIBRAS_STUDY_CONTENT||[]).map(x=>x.id),...(remote||[]).map(x=>x.lesson_id),...local.keys()]);return[...ids].filter(Boolean).map(id=>{let x=local.get(id);return{user_id:S.session.user.id,lesson_id:id,completed:!!x?.completed,completed_at:x?.completed?x.completed_at||now:null,updated_at:now}})}
async function pushPhoneSnapshot(){
  if(!S.session||S.session.offline)throw new Error("Entre na conta antes de sincronizar.");
  if(!navigator.onLine)throw new Error("Conecte-se à internet para sincronizar.");
  localStatus("📱 Enviando o celular para a nuvem…");
  compactExactDuplicateVariants();cache();
  const remote=await cloudSnapshot({includeDeleted:true}),now=new Date().toISOString();
  const cats=(S.cats||[]).map(x=>phoneCategoryRow(x,now)),signs=(S.signs||[]).map(x=>phoneSignRow(x,now)),reviews=(S.reviews||[]).filter(x=>x.norm).map(x=>phoneReviewRow(x,now)),study=phoneStudyRows(remote.study,now);
  const catNames=new Set(cats.map(x=>x.name)),signIds=new Set(signs.map(x=>x.studio_id)),reviewNorms=new Set(reviews.map(x=>x.norm));
  const catTombs=remote.cats.filter(x=>x.name&&!catNames.has(x.name)&&!x.deleted_at).map(x=>({...x,user_id:S.session.user.id,updated_at:now,deleted_at:now}));
  const signTombs=remote.signs.filter(x=>x.studio_id&&!signIds.has(x.studio_id)&&!x.deleted_at).map(x=>({...x,user_id:S.session.user.id,updated_at:now,deleted_at:now}));
  const reviewTombs=remote.reviews.filter(x=>x.norm&&!reviewNorms.has(x.norm)&&!x.deleted_at).map(x=>({...x,user_id:S.session.user.id,updated_at:now,deleted_at:now}));
  await upsertChunks("categories",[...cats,...catTombs],"user_id,name");
  await upsertChunks("signs",[...signs,...signTombs],"user_id,studio_id");
  await upsertChunks("review_state",[...reviews,...reviewTombs],"user_id,norm");
  await upsertChunks("study_progress",study,"user_id,lesson_id");
  setPendingOps([]);cache();localStatus("☁️ nuvem atualizada pelo celular");
  return{categories:cats.length,signs:signs.length,reviews:reviews.length,study:study.filter(x=>x.completed).length}
}
async function pullDesktopSnapshot(){
  if(!S.session||S.session.offline)throw new Error("Entre na conta antes de sincronizar.");
  if(!navigator.onLine)throw new Error("Conecte-se à internet para sincronizar.");
  localStatus("🖥️ Baixando a versão do Desktop…");
  const remote=await cloudSnapshot();
  S.cats=remote.cats;S.signs=remote.signs;S.reviews=remote.reviews;S.study=remote.study;
  compactExactDuplicateVariants();setPendingOps([]);cache();render();await signMedia();cache();render();localStatus("☁️ versão do Desktop aplicada");
  return{categories:S.cats.length,signs:S.signs.length,reviews:S.reviews.length,study:S.study.filter(x=>x.completed).length}
}
function closeSyncChoice(){$("#modal").classList.add("hidden")}
async function runDirectionalSync(side){
  if(window.__lsSyncing)return;
  const keepingPhone=side==="phone";
  const warning=keepingPhone?"Isso vai fazer o estado deste celular substituir a versão atualmente salva na nuvem. Continuar?":"Isso vai substituir os dados locais deste celular pela versão que está na nuvem (a versão sincronizada pelo Desktop). Continuar?";
  if(!confirm(warning))return;
  window.__lsSyncing=true;closeSyncChoice();
  try{const out=keepingPhone?await pushPhoneSnapshot():await pullDesktopSnapshot();toast((keepingPhone?"Celular":"Desktop")+" mantido como fonte da sincronização. ☁️");return out}
  catch(e){console.error("sincronização direcional",e);toast(e.message||"Falha na sincronização.");localStatus("⚠️ sincronização não concluída")}
  finally{window.__lsSyncing=false}
}
function openSyncChoice(){
  if(!S.session)return toast("Entre na sua conta primeiro.");
  modal('<div class="sync-choice"><h2>Qual versão você quer manter?</h2><p>Escolha o dispositivo que deve ser a fonte de verdade desta sincronização.</p><button id="sync-keep-phone" class="sync-choice-btn phone"><b>📱 Manter celular</b><small>Envia os dados deste celular para a nuvem e substitui a versão do Desktop.</small></button><button id="sync-keep-desktop" class="sync-choice-btn desktop"><b>🖥️ Manter Desktop</b><small>Baixa a versão da nuvem/desktop e substitui os dados deste celular.</small></button><p class="sync-choice-note">Não há mistura automática por data: o lado escolhido vence por completo, como numa sincronização completa do Anki.</p></div>');
  $("#sync-keep-phone").onclick=()=>runDirectionalSync("phone");$("#sync-keep-desktop").onclick=()=>runDirectionalSync("desktop")
}
async function sync(){openSyncChoice()}
async function signMedia(){for(let s of S.signs){if(s.media_path&&!s.media_url){let z=await sb.storage.from("sign-videos").createSignedUrl(s.media_path,86400);if(z.data?.signedUrl)s.media_url=z.data.signedUrl}}}
const LIBRARY_MEDIA_CACHE="libras-studio-library-v1",MEDIA_CACHE_PENDING=new Set;
function nativeMediaAvailable(){return !!(IS_NATIVE_ANDROID&&window.LibrasMedia&&typeof window.LibrasMedia.getCachedVideoUrl==="function")}
function nativeCachedVideoUrl(studioId){if(!nativeMediaAvailable()||!studioId)return"";try{return window.LibrasMedia.getCachedVideoUrl(String(studioId))||""}catch{return""}}
function libraryVideoUrl(item){return nativeCachedVideoUrl(item?.studio_id)||vurl(item)}
let PREVIEW_OBSERVER=null;
function previewMediaUrl(url){
  let raw=String(url||"");if(!raw)return"";
  return raw.split("#")[0]+"#t=0.22";
}
function loadPreviewVideo(video){
  if(!video||video.dataset.previewLoaded==="1")return;
  const raw=video.dataset.previewSrc||video.getAttribute("src")||"";
  if(!raw)return;
  video.dataset.previewLoaded="1";
  video.preload="metadata";video.muted=true;video.playsInline=true;
  const ready=()=>{
    try{
      const d=Number.isFinite(video.duration)?video.duration:0;
      const target=d?Math.min(.7,Math.max(.18,d*.10)):.22;
      if(video.readyState>=1&&Math.abs((video.currentTime||0)-target)>.03)video.currentTime=target;
    }catch{}
    video.classList.add("preview-ready");
  };
  video.addEventListener("loadeddata",ready,{once:true});
  video.addEventListener("canplay",ready,{once:true});
  video.addEventListener("seeked",()=>video.classList.add("preview-ready"),{once:true});
  try{video.src=previewMediaUrl(raw);video.load()}catch{}
}
function primePreviewVideo(video){
  if(!video||video.dataset.previewObserved==="1")return;
  video.dataset.previewObserved="1";
  if(!("IntersectionObserver"in window)){loadPreviewVideo(video);return}
  if(!PREVIEW_OBSERVER)PREVIEW_OBSERVER=new IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.isIntersecting){
      PREVIEW_OBSERVER.unobserve(entry.target);
      loadPreviewVideo(entry.target);
    }
  },{root:null,rootMargin:"320px 0px",threshold:.01});
  PREVIEW_OBSERVER.observe(video);
}
function primePreviewVideos(root=document){
  root?.querySelectorAll?.(".explore-video-frame video").forEach(primePreviewVideo);
}
function primeLibraryPreview(video){
  loadPreviewVideo(video);
}
function primeLibraryPreviews(root=document){
  let videos=[...(root?.querySelectorAll?.("[data-library-preview]")||[])];
  videos.slice(0,8).forEach(primeLibraryPreview);
  if(videos.length>8&&"IntersectionObserver"in window){
    let ob=new IntersectionObserver(entries=>{for(let e of entries)if(e.isIntersecting){ob.unobserve(e.target);primeLibraryPreview(e.target)}},{rootMargin:"220px 0px",threshold:.01});
    videos.slice(8).forEach(v=>ob.observe(v));
  }else videos.slice(8).forEach(primeLibraryPreview);
}
async function cacheWebLibraryVideo(url){if(!url||!("caches"in window))return false;try{let cache=await caches.open(LIBRARY_MEDIA_CACHE),req=new Request(url,{mode:"no-cors",cache:"no-store"});if(await cache.match(req,{ignoreVary:true}))return true;let res=await fetch(req);if(!res||(res.type!=="opaque"&&!res.ok))return false;await cache.put(req,res.clone());return true}catch(e){console.warn("cache web de vídeo",e);return false}}
async function cacheLibraryVideo(item,{replace=false}={}){if(true)return false;let id=item?.studio_id,url=vurl(item);if(!id||!url||!navigator.onLine)return false;if(nativeMediaAvailable()){if(!replace&&nativeCachedVideoUrl(id))return true;if(MEDIA_CACHE_PENDING.has(id))return true;MEDIA_CACHE_PENDING.add(id);try{if(replace&&typeof window.LibrasMedia.replaceCachedVideo==="function")window.LibrasMedia.replaceCachedVideo(String(id),url);else window.LibrasMedia.cacheVideo(String(id),url);return true}catch(e){MEDIA_CACHE_PENDING.delete(id);console.warn("cache nativo de vídeo",e);return false}}if(MEDIA_CACHE_PENDING.has(id))return true;MEDIA_CACHE_PENDING.add(id);try{return await cacheWebLibraryVideo(url)}finally{MEDIA_CACHE_PENDING.delete(id)}}
function cacheLibraryVideos(){return /* cache em massa desativado: prioriza reprodução e previews */}
function deleteCachedLibraryVideo(item){let id=item?.studio_id,url=vurl(item);MEDIA_CACHE_PENDING.delete(id);if(nativeMediaAvailable()&&id&&typeof window.LibrasMedia.deleteCachedVideo==="function"){try{window.LibrasMedia.deleteCachedVideo(String(id))}catch{}}if(url&&"caches"in window)caches.open(LIBRARY_MEDIA_CACHE).then(c=>c.delete(url,{ignoreVary:true})).catch(()=>{})}
window.addEventListener("librasstudio-media-cache",e=>{let d=e.detail||{};if(d.studioId)MEDIA_CACHE_PENDING.delete(String(d.studioId))});
function render(){const steps=[["home",home],["libraryCats",libraryCats],["library",library],["reviewCats",reviewCats],["study",study],["exploreCats",exploreCats],["progress",renderProgressPage]];let errors=[];for(const [name,fn] of steps){try{fn()}catch(e){errors.push({name,error:e});console.error("render:"+name,e)}}try{if(window.LSHydrateIcons)LSHydrateIcons(document)}catch(e){errors.push({name:"icons",error:e});console.error("render:icons",e)}return errors}
function unique(){let m=new Map;S.signs.forEach(s=>{if(!m.has(s.norm))m.set(s.norm,s)});return[...m.values()]}
function rmap(){return Object.fromEntries(S.reviews.map(x=>[x.norm,x]))}

const HOME_CATS=[
  ["Pessoas","Pessoas e pronomes"],["Alimentação","Alimentos e bebidas"],["Animais","Animais"],
  ["Trabalho","Trabalho e profissões"],["Casa","Casa e objetos"],["Sentimentos","Sentimentos e emoções"],["Natureza","Natureza e clima"]
];
function localDateKey(v){let d=v instanceof Date?v:new Date(v);if(!v||Number.isNaN(d.getTime()))return"";let p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())}
function addDays(d,n){let x=new Date(d);x.setHours(12,0,0,0);x.setDate(x.getDate()+n);return x}
function activityDateSet(){
  let set=new Set;
  S.study.forEach(x=>{if(x.completed)addActivity(x.completed_at||x.updated_at)});
  S.reviews.forEach(x=>addActivity(x.last_reviewed_at));
  S.signs.forEach(x=>addActivity(x.created_at));
  return set;
  function addActivity(v){let k=localDateKey(v);if(k)set.add(k)}
}
function streakInfo(){
  let set=activityDateSet(),keys=[...set].sort(),best=0,run=0,prev=null;
  for(let k of keys){let d=new Date(k+"T12:00:00");if(prev&&Math.round((d-prev)/86400000)===1)run++;else run=1;best=Math.max(best,run);prev=d}
  let today=new Date();today.setHours(12,0,0,0);let cursor=set.has(localDateKey(today))?today:addDays(today,-1),current=0;
  while(set.has(localDateKey(cursor))){current++;cursor=addDays(cursor,-1)}
  return{set,best,current};
}
function studySnapshot(){
  let L=window.LIBRAS_STUDY_CONTENT||[],m=smap(),done=L.filter(x=>m[x.id]?.completed),mods=[...new Set(L.map(x=>x.module))];
  let moduleRows=mods.map(name=>{let lessons=L.filter(x=>x.module===name),n=lessons.filter(x=>m[x.id]?.completed).length;return{name,total:lessons.length,done:n,complete:n===lessons.length}});
  let completedModules=moduleRows.filter(x=>x.complete).length,lastId=localStorage.getItem("ls-last-lesson")||"",current=L.find(x=>x.id===lastId&&!m[x.id]?.completed)||L.find(x=>!m[x.id]?.completed)||null;
  let currentIndex=current?L.findIndex(x=>x.id===current.id):-1,next=currentIndex>=0?L[currentIndex+1]||null:null,currentModule=current?moduleRows.find(x=>x.name===current.module):null;
  let pct=Math.round(done.length/Math.max(1,L.length)*100),modulePct=currentModule?Math.round(currentModule.done/Math.max(1,currentModule.total)*100):pct;
  return{L,m,done,moduleRows,completedModules,current,next,pct,modulePct};
}
function moduleLabel(name){return({"Fundamentos":"Fundamentos da Libras","Expressão e gramática":"Expressão e gramática","Espaço e fluidez":"Espaço e fluidez","Conversa e texto":"Conversa e fluência"})[name]||name}
function openStudyLesson(id){
  if(id)localStorage.setItem("ls-last-lesson",id);
  let snap=studySnapshot(),lesson=snap.L.find(x=>x.id===id);
  if(lesson){let mods=$("#study-modules");if(mods)mods.dataset.active=lesson.module}
  go("study");study();
  requestAnimationFrame(()=>document.getElementById("lesson-"+id)?.scrollIntoView({behavior:"smooth",block:"start"}));
}
function openHomeCategory(cat){go("explore");S.explore=cat;exploreCats();setTimeout(()=>openCat(cat),0)}
function home(){
  if(!$("#home-sign-count"))return;
  let m=rmap(),now=Date.now(),u=unique(),due=0,fresh=0,reviewed=0;
  u.forEach(x=>{let r=m[x.norm];if(!r)fresh++;else{if(r.last_reviewed_at)reviewed++;if(r.due_at&&new Date(r.due_at).getTime()<=now)due++}});
  let snap=studySnapshot(),streak=streakInfo(),cats=new Set(u.map(x=>x.category_name).filter(Boolean)),withVideo=u.filter(vurl).length;
  renderProfileIdentity();
  $("#home-sign-count").textContent=u.length;$("#home-cat-count").textContent=cats.size;$("#home-library-health").textContent=(u.length?Math.round(withVideo/u.length*100):0)+"%";
  $("#home-due-count").textContent=due;$("#home-new-count").textContent=fresh;$("#home-reviewed-count").textContent=reviewed;
  $("#home-learned").textContent=u.length+" sinais";$("#home-best-streak").textContent=streak.best+" "+(streak.best===1?"dia":"dias");
  $("#home-lessons-done").textContent=snap.done.length;$("#home-review-activity").textContent=reviewed;
  $("#home-overall-pct").textContent=snap.pct+"%";$("#home-overall-ring").style.setProperty("--pct",snap.pct);
  $("#home-module-count").textContent=snap.completedModules+" de "+snap.moduleRows.length;let mp=Math.round(snap.completedModules/Math.max(1,snap.moduleRows.length)*100);$("#home-module-pct").textContent=mp+"%";$("#home-module-ring").style.setProperty("--pct",mp);
  $("#home-sequence-list").innerHTML=snap.moduleRows.map((x,i)=>'<div class="sequence-item '+(x.complete?"done":(!x.complete&&snap.moduleRows.findIndex(y=>!y.complete)===i?"current":""))+'"><span class="dot">'+(x.complete?"✓":i+1)+'</span><span>'+(x.complete?"":snap.moduleRows.findIndex(y=>!y.complete)===i?"Próximo: ":"")+esc(moduleLabel(x.name))+'</span></div>').join("");
  $("#home-study-days").innerHTML=[-6,-5,-4,-3,-2,-1,0].map(n=>{let d=addDays(new Date(),n),on=streak.set.has(localDateKey(d)),lab=d.toLocaleDateString("pt-BR",{weekday:"short"}).replace(".","");return '<div class="study-day '+(on?"active":"")+'"><div class="day-dot">'+(on?LSIcon("streak","icon-sm"):"")+'</div><small>'+lab+'</small></div>'}).join("");
  $("#home-explore-cats").innerHTML=HOME_CATS.map(([label,cat])=>'<button class="shortcut-cat" data-home-cat="'+esc(cat)+'">'+LSCategoryIcon(cat)+'<b>'+esc(label)+'</b><small>'+((window.LIBRAS_EXPLORE_DATA||{})[cat]?.terms?.length||0)+' sinais-base</small></button>').join("");
  document.querySelectorAll("[data-home-cat]").forEach(b=>b.onclick=()=>openHomeCategory(b.dataset.homeCat));
  let cur=snap.current;
  $("#home-current-module").textContent=cur?moduleLabel(cur.module):"Trilha concluída";
  $("#home-current-title").textContent=cur?cur.title:"Você concluiu todas as aulas";
  $("#home-current-summary").textContent=cur?cur.summary:"Continue revisando e explorando novos sinais.";
  $("#home-current-progress").style.width=snap.modulePct+"%";$("#home-current-progress-label").textContent=snap.modulePct+"% do módulo";
  $("#home-next-title").textContent=snap.next?snap.next.title:"Nenhuma aula pendente";$("#home-next-meta").textContent=snap.next?moduleLabel(snap.next.module):"Trilha atual concluída";
  $("#home-continue").disabled=!cur;$("#home-continue").onclick=()=>cur&&openStudyLesson(cur.id);
  if(window.LSHydrateIcons)LSHydrateIcons($("#home"));
}
function activityHistory(){
  let days=new Map;
  const add=(value,type)=>{let key=localDateKey(value);if(!key)return;let row=days.get(key)||{signs:0,reviews:0,lessons:0,total:0};row[type]++;row.total++;days.set(key,row)};
  S.signs.forEach(x=>add(x.created_at,"signs"));
  S.reviews.forEach(x=>add(x.last_reviewed_at,"reviews"));
  S.study.forEach(x=>{if(x.completed)add(x.completed_at||x.updated_at,"lessons")});
  return days;
}
function renderActivityCalendar(){
  let grid=$("#tracking-calendar-grid"),summary=$("#tracking-month-summary"),label=$("#tracking-calendar-label");if(!grid||!summary)return;
  let history=activityHistory(),first=new Date(trackingYear,trackingMonth,1),last=new Date(trackingYear,trackingMonth+1,0),cells=[];
  for(let i=0;i<first.getDay();i++)cells.push('<div class="calendar-cell blank"></div>');
  let active=0,signs=0,reviews=0,lessons=0;
  for(let day=1;day<=last.getDate();day++){
    let d=new Date(trackingYear,trackingMonth,day,12),key=localDateKey(d),x=history.get(key)||{signs:0,reviews:0,lessons:0,total:0};
    if(x.total)active++;signs+=x.signs;reviews+=x.reviews;lessons+=x.lessons;
    let level=x.total===0?0:x.total===1?1:x.total<=3?2:3;
    cells.push('<div class="calendar-cell level-'+level+'" title="'+day+' · '+x.total+' atividade(s)"><b>'+day+'</b>'+(x.total?'<small>'+x.total+'</small>':'')+'</div>');
  }
  grid.innerHTML=cells.join("");
  summary.innerHTML='<div><b>'+active+'</b><small>dias ativos</small></div><div><b>'+signs+'</b><small>sinais adicionados</small></div><div><b>'+reviews+'</b><small>revisões</small></div><div><b>'+lessons+'</b><small>aulas concluídas</small></div>';
  if(label)label.textContent=new Date(trackingYear,trackingMonth,1).toLocaleDateString("pt-BR",{month:"long",year:"numeric"});
}
function shiftTrackingMonth(delta){
  let d=new Date(trackingYear,trackingMonth+delta,1);trackingYear=d.getFullYear();trackingMonth=d.getMonth();
  let m=$("#tracking-month"),y=$("#tracking-year");if(m)m.value=String(trackingMonth);if(y)y.value=String(trackingYear);renderActivityCalendar();
}
function renderProgressPage(){
  let root=$("#tracking-page");if(!root)return;
  let snap=studySnapshot(),streak=streakInfo(),u=unique(),todayKey=localDateKey(new Date()),reviewedToday=S.reviews.filter(x=>localDateKey(x.last_reviewed_at)===todayKey).length,reviewed=S.reviews.filter(x=>x.last_reviewed_at).length;
  let days=[-6,-5,-4,-3,-2,-1,0].map(n=>{let d=addDays(new Date(),n),on=streak.set.has(localDateKey(d)),label=d.toLocaleDateString("pt-BR",{weekday:"short"}).replace(".","");return '<div class="progress-week-day '+(on?"active":"")+'"><div class="progress-day-icon">'+(on?LSIcon("streak","icon-sm"):"<span>•</span>")+'</div><b>'+label+'</b><small>'+d.toLocaleDateString("pt-BR",{day:"2-digit"})+'</small></div>'}).join("");
  let moduleIcons=["education","explore","trail","people"];
  let modules=snap.moduleRows.map((x,i)=>{let pct=Math.round((x.done/Math.max(1,x.total))*100);return '<div class="module-progress-row tone-'+(i%4)+'"><div class="module-progress-icon">'+LSIcon(moduleIcons[i%moduleIcons.length],"icon-sm")+'</div><div class="module-progress-copy"><div class="module-progress-head"><b>'+esc(moduleLabel(x.name))+'</b><strong>'+pct+'%</strong></div><small>'+x.done+' de '+x.total+' aulas concluídas</small><div class="module-progress-track"><span style="width:'+pct+'%"></span></div></div></div>'}).join("");
  let history=activityHistory(),years=[...new Set([...history.keys()].map(k=>+k.slice(0,4)).concat([new Date().getFullYear()]))].sort((x,y)=>y-x),months=Array.from({length:12},(_,i)=>new Date(2026,i,1).toLocaleDateString("pt-BR",{month:"long"}));
  root.innerHTML=
  '<div class="surface progress-overview tracking-wide"><div class="progress-section-head"><div>'+LSIcon("tracking")+'<div><h3>Progresso da trilha</h3><p>Percentual de aulas concluídas em toda a sua trilha de aprendizagem.</p></div></div><span class="progress-overview-badge">'+snap.pct+'% concluído</span></div><div class="progress-kpi-grid">'+
    '<div class="progress-kpi tone-purple">'+LSIcon("lesson")+'<div><small>Aulas concluídas</small><b>'+snap.done.length+' <em>de '+snap.L.length+'</em></b></div></div>'+
    '<div class="progress-kpi tone-green">'+LSIcon("learned")+'<div><small>Sinais aprendidos</small><b>'+u.length+'</b></div></div>'+
    '<div class="progress-kpi tone-pink">'+LSIcon("reviewActivity")+'<div><small>Revisões hoje</small><b>'+reviewedToday+'</b></div></div>'+
    '<div class="progress-kpi tone-orange">'+LSIcon("streak")+'<div><small>Sequência atual</small><b>'+streak.current+' <em>dias</em></b></div></div>'+
    '<div class="progress-kpi tone-yellow">'+LSIcon("best")+'<div><small>Melhor sequência</small><b>'+streak.best+' <em>dias</em></b></div></div>'+
    '<div class="progress-kpi tone-blue">'+LSIcon("sequence")+'<div><small>Dias ativos</small><b>'+streak.set.size+'</b></div></div>'+
  '</div></div>'+
  '<div class="surface progress-week-card"><div class="progress-section-head compact"><div>'+LSIcon("streak")+'<div><h3>Seu progresso</h3><p>Atividade dos últimos 7 dias</p></div></div><div class="streak-mini"><b>'+streak.current+'</b><small>dias seguidos</small></div></div><div class="progress-week">'+days+'</div></div>'+
  '<div class="surface progress-ring-card"><div class="progress-section-head compact"><div>'+LSIcon("reviewActivity")+'<div><h3>Prática acumulada</h3><p>Sinais que já passaram pela revisão</p></div></div></div><div class="progress-ring-body"><div class="ring progress-big-ring" style="--pct:'+Math.min(100,Math.round(reviewed/Math.max(1,u.length)*100))+'"><span>'+reviewed+'</span></div><div><b>'+reviewed+' sinais revisados</b><p>Esse número cresce quando você avalia um cartão durante uma sessão de revisão.</p></div></div></div>'+
  '<div class="surface module-progress-card tracking-wide"><div class="progress-section-head compact"><div>'+LSIcon("sequence")+'<div><h3>Progresso por módulo</h3><p>Veja quanto falta em cada etapa da sua trilha.</p></div></div></div><div class="module-progress-list">'+modules+'</div></div>'+
  '<div class="surface tracking-calendar-card tracking-wide"><div class="calendar-toolbar"><div><span class="calendar-icon">'+LSIcon("sequence","icon-sm")+'</span><div><h3>Frequência de estudos</h3><p>Um mês por vez, com intensidade baseada nas suas atividades.</p></div></div><div class="calendar-controls"><button id="tracking-month-prev" class="soft" aria-label="Mês anterior">‹</button><select id="tracking-month">'+months.map((m,i)=>'<option value="'+i+'" '+(i===trackingMonth?"selected":"")+'>'+m+'</option>').join("")+'</select><select id="tracking-year">'+years.map(y=>'<option value="'+y+'" '+(y===trackingYear?"selected":"")+'>'+y+'</option>').join("")+'</select><button id="tracking-month-next" class="soft" aria-label="Próximo mês">›</button></div></div><div class="calendar-title-row"><b id="tracking-calendar-label"></b><div class="calendar-legend"><span><i class="level-0"></i>Sem atividade</span><span><i class="level-1"></i>Leve</span><span><i class="level-2"></i>Média</span><span><i class="level-3"></i>Intensa</span></div></div><div class="calendar-weekdays"><span>Dom</span><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span></div><div id="tracking-calendar-grid" class="tracking-calendar-grid"></div><div id="tracking-month-summary" class="tracking-month-summary"></div></div>';
  $("#tracking-month").onchange=e=>{trackingMonth=+e.target.value;renderActivityCalendar()};
  $("#tracking-year").onchange=e=>{trackingYear=+e.target.value;renderActivityCalendar()};
  $("#tracking-month-prev").onclick=()=>shiftTrackingMonth(-1);$("#tracking-month-next").onclick=()=>shiftTrackingMonth(1);
  renderActivityCalendar();
  if(window.LSHydrateIcons)LSHydrateIcons(root);
}
const SRC=[["signbank","SignBank / UFSC","https://raw.githubusercontent.com/Malta-Lab/ISLR_LIBRAS/main/video_downloads/links_videos_ufsc_signbank.csv"],["vlibrasil","V-LIBRASIL / UFPE","https://raw.githubusercontent.com/Malta-Lab/ISLR_LIBRAS/main/video_downloads/links_videos_vlibrasil.csv"],["goiasnacional","GoiásLibras · base nacional","./data/goias_nacional.csv"],["ines","INES / Acessibilidade Brasil","https://raw.githubusercontent.com/Malta-Lab/ISLR_LIBRAS/main/video_downloads/links_videos_acessibilidade_brasil.csv"],["ufv","UFV","https://raw.githubusercontent.com/Malta-Lab/ISLR_LIBRAS/main/video_downloads/links_videos_ufv.csv"],["usp","USP","https://raw.githubusercontent.com/Malta-Lab/ISLR_LIBRAS/main/video_downloads/links_videos_usp.csv"],["spread","Spread the Sign","https://raw.githubusercontent.com/Malta-Lab/ISLR_LIBRAS/main/video_downloads/links_videos_spreadthesign.csv"]];
const SOURCE_RANK={signbank:0,ufv:1,usp:2,spread:3,vlibrasil:4,goiasnacional:5,ines:6};
const CURATED_SIGN_MEDIA={
  obrigado:[
    {label:"Obrigado",url:"https://libras.cin.ufpe.br/storage/videos/20210127054726_6011d15eafba7.mp4",source_id:"vlibrasil",source_name:"V-LIBRASIL / UFPE"},
    {label:"Obrigado",url:"https://libras.cin.ufpe.br/storage/videos/20210505103828_60929fd499aaa.mp4",source_id:"vlibrasil",source_name:"V-LIBRASIL / UFPE"},
    {label:"Obrigado",url:"https://libras.cin.ufpe.br/storage/videos/20210619023531_60ce2ae3ef11a.mp4",source_id:"vlibrasil",source_name:"V-LIBRASIL / UFPE"}
  ]
};
function csvLine(l){let a=[],x="",q=false;for(let i=0;i<l.length;i++){let c=l[i];if(c=='"'){if(q&&l[i+1]=='"'){x+='"';i++}else q=!q}else if(c===","&&!q){a.push(x);x=""}else x+=c}a.push(x);return a}
function catalogKeys(label){let raw=String(label||"").trim(),base=raw.replace(/\d+$/,"").trim(),keys=new Set;const add=x=>{let k=norm(String(x||"").replace(/\d+$/,""));if(k)keys.add(k)};add(base);add(base.replace(/\([^)]*\)/g," "));base.split(/\s+ou\s+|\/|:/i).forEach(add);return[...keys]}async function sourceText(url){try{if("caches"in window){let c=await caches.open("libras-studio-catalog-v2"),hit=await c.match(url);if(hit)return hit.text();let r=await fetch(url,{cache:"no-store"});if(!r.ok)throw new Error("HTTP "+r.status);await c.put(url,r.clone());return r.text()}}catch(e){console.warn("cache catálogo",e)}let r=await fetch(url);if(!r.ok)throw new Error("HTTP "+r.status);return r.text()}async function catalog(){if(S.catalog)return S.catalog;let map={},rows=0;const all=await Promise.all(SRC.map(async([id,name,url])=>{try{return{id,name,text:await sourceText(url)}}catch(e){console.warn(name,e);return{id,name,text:""}}}));for(let src of all){let ls=src.text.split(/\r?\n/);for(let i=1;i<ls.length;i++){if(!ls[i])continue;let a=csvLine(ls[i]),label=a[0]?.trim(),u=a[1]?.trim();if(!label||!u)continue;rows++;let opt={label,url:u.replace(/^http:/,"https:"),source_id:src.id,source_name:src.name},options=[opt];if(src.id==="ines"){let m=opt.url.match(/\/palavras\/videos\/([^?#]+)/i);if(m)options.unshift({label,url:"https://goiaslibras.educacao.go.gov.br/api/media/ines/palavras/videos/"+m[1],source_id:"goiasnacional",source_name:"GoiásLibras · base nacional"})}for(let k of catalogKeys(label)){let arr=map[k]??=[];for(let candidate of options)if(!arr.some(x=>x.url===candidate.url))arr.push(candidate);map[k]=arr}}}for(let k in map)map[k].sort((a,b)=>(SOURCE_RANK[a.source_id]??99)-(SOURCE_RANK[b.source_id]??99));S.catalog=map;S.catalogStats={rows,labels:Object.keys(map).length,multiword:Object.keys(map).filter(k=>k.includes(" ")).length,sources:all.filter(x=>x.text).length};return map}
const opts=n=>{let k=norm(n),arr=[...((S.catalog||{})[k]||[]),...(CURATED_SIGN_MEDIA[k]||[])],seen=new Set;return arr.filter(x=>x.url&&!seen.has(x.url)&&seen.add(x.url)).sort((a,b)=>(SOURCE_RANK[a.source_id]??99)-(SOURCE_RANK[b.source_id]??99))};
const MEDIA_HEALTH_KEY="ls-media-health-v1",MEDIA_OK_TTL=12*60*60*1000,MEDIA_FAIL_TTL=20*60*1000;
function mediaHealth(){try{return JSON.parse(localStorage.getItem(MEDIA_HEALTH_KEY)||"{}")}catch{return{}}}
function setMediaHealth(url,ok){if(!url)return;let h=mediaHealth();h[url]={ok:!!ok,at:Date.now()};let entries=Object.entries(h).sort((a,b)=>(b[1]?.at||0)-(a[1]?.at||0)).slice(0,600);try{localStorage.setItem(MEDIA_HEALTH_KEY,JSON.stringify(Object.fromEntries(entries)))}catch{}}
function knownMediaHealth(url){let x=mediaHealth()[url];if(!x)return null;let ttl=x.ok?MEDIA_OK_TTL:MEDIA_FAIL_TTL;if(Date.now()-(x.at||0)>ttl)return null;return!!x.ok}
function probeVideo(url,timeout=4500){if(!url)return Promise.resolve(false);let known=knownMediaHealth(url);if(known!==null)return Promise.resolve(known);return new Promise(resolve=>{let v=document.createElement("video"),done=false,timer;const finish=ok=>{if(done)return;done=true;clearTimeout(timer);v.onloadedmetadata=v.oncanplay=v.onerror=null;try{v.pause();v.removeAttribute("src");v.load()}catch{}setMediaHealth(url,ok);resolve(ok)};v.preload="metadata";v.muted=true;v.playsInline=true;v.onloadedmetadata=()=>finish(true);v.oncanplay=()=>finish(true);v.onerror=()=>finish(false);timer=setTimeout(()=>finish(false),timeout);try{v.src=url;v.load()}catch{finish(false)}})}
function mediaCandidateKey(x){if(x?.youtube)return"yt:"+x.youtube;let u=String(x?.url||"");if(!u)return"";if(x?.source_id==="ines"||x?.source_id==="goiasnacional"){let m=u.match(/\/palavras\/videos\/([^?#]+)/i);if(m)return"ines:"+m[1].toLowerCase()}return u}
function canonicalMediaUrl(url){try{let u=new URL(String(url||""),location.href);u.hash="";["utm_source","utm_medium","utm_campaign","token","expires","signature","sig"].forEach(k=>u.searchParams.delete(k));u.searchParams.sort();return u.toString().replace(/^http:/,"https:")}catch{return String(url||"").split("#")[0].replace(/^http:/,"https:")}}
function mediaBasename(url){try{let u=new URL(String(url||""),location.href),name=decodeURIComponent(u.pathname.split("/").pop()||"").toLowerCase();return name}catch{return""}}
function usefulMediaBasename(name){let b=String(name||"").replace(/\.(mp4|webm|mov|m4v)$/i,"");return b.length>=6&&!/^(video|download|file|media|clip|movie|index|\d+)$/i.test(b)}
const VARIANT_META_CACHE=new Map,VARIANT_SIZE_CACHE=new Map;
function mediaMetadataSignature(url,timeout=2600){
  let key=canonicalMediaUrl(url);if(VARIANT_META_CACHE.has(key))return VARIANT_META_CACHE.get(key);
  let p=new Promise(resolve=>{let v=document.createElement("video"),done=false,timer;const finish=value=>{if(done)return;done=true;clearTimeout(timer);v.onloadedmetadata=v.onerror=null;try{v.pause();v.removeAttribute("src");v.load()}catch{}resolve(value)};v.preload="metadata";v.muted=true;v.playsInline=true;v.onloadedmetadata=()=>{let d=Number.isFinite(v.duration)?Math.round(v.duration*20)/20:0,w=v.videoWidth||0,h=v.videoHeight||0;finish(d&&w&&h?{duration:d,width:w,height:h}:null)};v.onerror=()=>finish(null);timer=setTimeout(()=>finish(null),timeout);try{v.src=url;v.load()}catch{finish(null)}});VARIANT_META_CACHE.set(key,p);return p
}
async function mediaRemoteSize(url,timeout=1800){
  let key=canonicalMediaUrl(url);if(VARIANT_SIZE_CACHE.has(key))return VARIANT_SIZE_CACHE.get(key);
  let p=(async()=>{let ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),timeout);try{let r=await fetch(url,{method:"HEAD",cache:"force-cache",signal:ctl.signal});if(!r.ok)return 0;let n=Number(r.headers.get("content-length")||0);return Number.isFinite(n)&&n>0?n:0}catch{return 0}finally{clearTimeout(timer)}})();
  VARIANT_SIZE_CACHE.set(key,p);return p
}
async function mediaVariantSignature(candidate){
  if(candidate?.youtube)return"yt:"+candidate.youtube;
  let url=String(candidate?.url||"");if(!url)return"";
  let canonical=canonicalMediaUrl(url),meta=await mediaMetadataSignature(url),size=await mediaRemoteSize(url),base=mediaBasename(url);
  if(size&&meta)return"strong:"+size+"|"+meta.duration+"|"+meta.width+"x"+meta.height;
  if(meta&&usefulMediaBasename(base))return"filemeta:"+base+"|"+meta.duration+"|"+meta.width+"x"+meta.height;
  return"url:"+canonical
}
async function dedupeVariantCandidates(list){
  let input=dedupeCandidates(list),rows=await Promise.all(input.map(async x=>({x,sig:await mediaVariantSignature(x)}))),seen=new Set,out=[];
  for(let row of rows){let k=row.sig||mediaCandidateKey(row.x);if(!k||seen.has(k))continue;seen.add(k);out.push(row.x)}
  return out
}
function dedupeCandidates(list){let seen=new Set;return(list||[]).filter(x=>{let k=mediaCandidateKey(x);if(!k||seen.has(k))return false;seen.add(k);return true})}
async function validateCandidates(list,{timeout=4000,max=12,keep=8}={}){let items=dedupeCandidates(list).slice(0,max);let checks=await Promise.all(items.map(async x=>x.youtube?true:probeVideo(x.url,timeout)));let playable=items.filter((x,i)=>checks[i]);return(await dedupeVariantCandidates(playable)).slice(0,keep)}
async function firstPlayable(list,{timeout=4000,max=12}={}){let items=dedupeCandidates(list).slice(0,max),knownGood=items.find(x=>x.youtube||knownMediaHealth(x.url)===true);if(knownGood)return knownGood;for(let x of items){if(x.youtube)return x;if(await probeVideo(x.url,timeout))return x}return null}
function allMediaCandidates(name){let list=[];try{list.push(...phraseCuratedExact(name))}catch{}list.push(...opts(name));return dedupeCandidates(list)}
async function preferredSignMedia(name,fallbackStudioId=""){let saved=fallbackStudioId?S.signs.find(x=>x.studio_id===fallbackStudioId):null,local=saved?nativeCachedVideoUrl(saved.studio_id):"";if(local)return{url:local,source_id:saved.source_id||"saved",source_name:(saved.source_name||"Biblioteca")+" · offline"};if(!navigator.onLine){if(saved&&!IS_NATIVE_ANDROID&&vurl(saved))return{url:vurl(saved),source_id:saved.source_id||"saved",source_name:saved.source_name||"Biblioteca"};return null}try{let list=await signOptions(name),picked=await firstPlayable(list,{timeout:2400,max:8});if(!picked){list=await signOptions(name,{refresh:true});picked=await firstPlayable(list,{timeout:2400,max:8})}if(picked)return picked}catch(e){console.warn("mídia principal",e)}if(saved){let url=vurl(saved);if(url&&await probeVideo(url,2200))return{url,source_id:saved.source_id||"saved",source_name:saved.source_name||"Biblioteca"}}return null}
async function playPreferredSign(name,fallbackStudioId=""){modal('<h2>'+esc(title(name))+'</h2><p>🔎 Abrindo o sinal principal…</p>');let picked=await preferredSignMedia(name,fallbackStudioId);if(!picked)return modal('<h2>'+esc(title(name))+'</h2><p>Nenhum vídeo disponível foi encontrado agora.</p>');let id="preferred-"+Date.now(),sid=fallbackStudioId||"";modal('<h2>'+esc(title(name))+'</h2><video data-video-id="'+id+'" '+(sid?'data-studio-id="'+esc(sid)+'" ':'')+'controls autoplay loop playsinline preload="metadata" src="'+esc(picked.url)+'"></video>'+speedTools(id));bindSpeeds($("#modal-body"));bindVideoFallbacks($("#modal-body"),name)}

async function repairMedia(studioId,candidate){if(!studioId||!candidate?.url||!S.session)return;let patch={source_id:candidate.source_id||"fallback",source_name:candidate.source_name||"Fonte alternativa",source_url:candidate.url,media_url:candidate.url,updated_at:new Date().toISOString()},item=S.signs.find(x=>x.studio_id===studioId);if(item){deleteCachedLibraryVideo(item);Object.assign(item,patch);cache();render()}}
function catFor(n){let k=norm(n);for(let[c,d]of Object.entries(window.LIBRAS_EXPLORE_DATA||{}))if(d.terms.some(x=>norm(x)===k))return c;return"Outros"}
function uuid(){return crypto.randomUUID?crypto.randomUUID():Date.now()+"-"+Math.random()}
async function save(name,o,cat=null,origin="catalog"){
  let n=norm(name),url=String(o?.url||"").replace(/^http:/,"https:"),variantKey="mobile|"+n+"|"+norm(url);
  let sameNorm=S.signs.filter(x=>signNormKey(x)===n),existing=sameNorm.find(x=>String(x.variant_key||"")===variantKey||(url&&String(x.source_url||"").replace(/^http:/,"https:")===url));
  if(existing)return existing;
  if(url&&sameNorm.length){
    let incomingSig=await mediaVariantSignature({...o,url});
    if(incomingSig){
      for(let item of sameNorm){
        let oldUrl=vurl(item)||item.source_url||"";
        if(!oldUrl)continue;
        let oldSig=await mediaVariantSignature({url:oldUrl,source_id:item.source_id});
        if(oldSig&&oldSig===incomingSig)return item
      }
    }
  }
  let now=new Date().toISOString(),row={user_id:S.session.user.id,studio_id:uuid(),name:title(name),norm:n,variant_no:sameNorm.length+1,variant_key:variantKey,category_name:cat||catFor(name),category_source:cat?"explore":"auto",category_tags:"[]",source_id:o.source_id,source_name:o.source_name,source_url:o.url,source_label:o.label,origin,media_url:o.url,created_at:now,updated_at:now,deleted_at:null};
  S.signs.push(row);cache();render();localStatus("📱 alterações locais · sincronize quando quiser");return row
}
async function createSign(){let names=$("#create-name").value.split(/\n/).map(x=>x.trim()).filter(Boolean);if(!names.length)return toast("Digite o nome do sinal.");$("#create-name").value="";if(names.length===1){let n=names[0];$("#create-result").innerHTML='<div class="result">🔎 Buscando e verificando os vídeos…</div>';await catalog();let options=opts(n);if(!options.length)return $("#create-result").innerHTML='<div class="result">🔎 Não encontrei correspondência exata.</div>';let picked=await firstPlayable(options,{timeout:3800,max:10});if(!picked)return $("#create-result").innerHTML='<div class="result"><b>⚠️ Encontrei '+options.length+' gravação(ões), mas nenhuma carregou agora.</b><p>O Studio não vai salvar um vídeo quebrado. Tente novamente mais tarde ou veja as variações.</p></div>';try{let r=await save(n,picked);$("#create-result").innerHTML='<div class="result phrase-ok"><b>✅ '+esc(r.name)+'</b><video controls loop playsinline src="'+esc(r.media_url)+'"></video></div>';toast("Salvo com vídeo verificado ☁️")}catch(e){console.error(e);toast("Não consegui salvar.")}return}$("#create-result").innerHTML='<div class="result">🔎 Processando '+names.length+' sinais…</div>';await catalog();let ok=[],fail=[];for(let n of names){try{let options=opts(n),picked=options.length?await firstPlayable(options,{timeout:3200,max:10}):null;if(!picked){fail.push(n);continue}await save(n,picked,null,"batch");ok.push(n)}catch(e){console.error("lote",n,e);fail.push(n)}}$("#create-result").innerHTML='<div class="result"><b>✅ '+ok.length+' de '+names.length+' sinais salvos</b>'+(fail.length?'<p>Não encontrados: '+esc(fail.join(", "))+'</p>':'')+'</div>';toast(ok.length+" sinal(is) adicionado(s) ☁️")}
async function variants(){let names=$("#create-name").value.split(/\n/).map(x=>x.trim()).filter(Boolean);if(!names.length)return toast("Digite um sinal primeiro.");if(names.length>1)return toast("Para ver variações, deixe apenas um sinal no campo.");let n=names[0];await openAvailableVariants(n,catFor(n))}
async function uploadVideo(f){if(!f)return;let names=$("#create-name").value.split(/\n/).map(x=>x.trim()).filter(Boolean);if(!names.length)return toast("Digite o nome antes.");if(names.length>1)return toast("Para enviar um vídeo, deixe apenas um sinal no campo.");let n=names[0],path=S.session.user.id+"/"+Date.now()+"_"+f.name.replace(/[^a-zA-Z0-9._-]/g,"_"),up=await sb.storage.from("sign-videos").upload(path,f);if(up.error)return toast("Falha no upload.");let now=new Date().toISOString(),row={user_id:S.session.user.id,studio_id:uuid(),name:title(n),norm:norm(n),variant_no:S.signs.filter(x=>x.norm===norm(n)).length+1,variant_key:"upload|"+path,category_name:catFor(n),category_source:"auto",category_tags:"[]",source_id:"mobile_upload",source_name:"Vídeo meu",origin:"mobile_upload",media_path:path,created_at:now,updated_at:now,deleted_at:null};let z=await sb.storage.from("sign-videos").createSignedUrl(path,86400);row.media_url=z.data?.signedUrl||"";S.signs.push(row);cache();render();localStatus("📱 alterações locais · sincronize quando quiser");toast("Vídeo salvo no celular. Sincronize quando quiser.")}
const STOP=new Set(["a","o","as","os","de","da","do","das","dos","em","no","na","nos","nas","para","pra","por","com","e","um","uma","ao","aos","à","às","eu","voce"]);
function words(x){return norm(x).split(" ").filter(w=>w&&!STOP.has(w))}
function similarity(a,b){let A=new Set(words(a)),B=new Set(words(b));if(!A.size||!B.size)return 0;let inter=[...A].filter(x=>B.has(x)).length;if(!inter)return 0;let score=inter/Math.max(A.size,B.size),na=norm(a),nb=norm(b);if(na===nb)score+=2;else if(na.includes(nb)||nb.includes(na))score+=.55;return score}
function phraseCuratedExact(q){let k=norm(q);return(window.LIBRAS_PHRASE_DATA||[]).filter(p=>norm(p.text)===k||(p.aliases||[]).some(a=>norm(a)===k)).map(p=>({name:p.text,label:p.text,url:p.url||"",youtube:p.youtube||"",source_id:p.source_id||"singlibras_phrase",source_name:p.source||"Sing Libras",page:p.page||"",kind:"real"}))}
function phraseCatalogExact(q){return opts(q).map(o=>({name:o.label.replace(/\d+$/,"").trim(),label:o.label,url:o.url,source_id:o.source_id,source_name:o.source_name,kind:"real"}))}
function phraseSimilar(q){let pool=[];for(let p of(window.LIBRAS_PHRASE_DATA||[])){let sc=Math.max(similarity(q,p.text),...(p.aliases||[]).map(a=>similarity(q,a)),0);if(sc>.2)pool.push({name:p.text,label:p.text,url:p.url||"",youtube:p.youtube||"",source_id:p.source_id||"singlibras_phrase",source_name:p.source||"Sing Libras",page:p.page||"",kind:"real",score:sc})}for(let k of Object.keys(S.catalog||{})){if(!k.includes(" "))continue;let sc=similarity(q,k);if(sc>.2){let o=opts(k)[0];if(o)pool.push({name:o.label.replace(/\d+$/,"").trim(),label:o.label,url:o.url,source_id:o.source_id,source_name:o.source_name,kind:"real",score:sc})}}let seen=new Set;return pool.sort((a,b)=>b.score-a.score).filter(x=>{let k=norm(x.name)+"|"+x.url+"|"+x.youtube;if(seen.has(k))return false;seen.add(k);return true}).slice(0,8)}
async function translateGloss(text){try{let ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),8000),r=await fetch("https://traducao2.vlibras.gov.br/translate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text}),signal:ctl.signal});clearTimeout(t);if(!r.ok)return"";let raw=await r.text();try{let j=JSON.parse(raw);return j.traducao||raw}catch{return raw}}catch{return""}}
function phraseRow(x,i,similar=false){let canSave=!!x.url;return '<div class="phrase-row"><div><b>'+esc(x.name)+'</b><small>'+esc(x.source_name)+(similar?' · semelhante':' · gravação real')+' · ✓ vídeo verificado</small></div><div class="phrase-actions"><button class="soft" data-phrase-view="'+i+'">▶ Ver</button>'+(canSave?'<button class="primary" data-phrase-save="'+i+'">＋ Salvar</button>':"")+'</div></div>'}
function bindPhraseResults(){document.querySelectorAll("[data-phrase-view]").forEach(b=>b.onclick=()=>previewPhrase(+b.dataset.phraseView));document.querySelectorAll("[data-phrase-save]").forEach(b=>b.onclick=()=>savePhraseResult(+b.dataset.phraseSave));let v=$("#vlibras-phrase");if(v)v.onclick=()=>previewVLibras($("#phrase-name").value.trim())}
function previewPhrase(i){let x=S.phraseResults[i];if(!x)return;if(x.youtube){modal('<h2>'+esc(x.name)+'</h2><div class="yt-wrap"><iframe src="https://www.youtube.com/embed/'+encodeURIComponent(x.youtube)+'?playsinline=1" title="'+esc(x.name)+'" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div><p>'+esc(x.source_name)+' · vídeo verificado pela fonte</p>');return}let id="phrase-"+i;modal('<h2>'+esc(x.name)+'</h2><video data-video-id="'+id+'" controls autoplay loop playsinline preload="metadata" src="'+esc(x.url)+'"></video>'+speedTools(id)+'<p>'+esc(x.source_name)+' · ✓ vídeo verificado</p>');bindSpeeds($("#modal-body"));bindVideoFallbacks($("#modal-body"),x.name)}
async function savePhraseResult(i){let x=S.phraseResults[i];if(!x?.url)return;try{await save(x.name,{url:x.url,label:x.label||x.name,source_id:x.source_id,source_name:x.source_name},"Frases","phrase_complete");toast("Frase salva e sincronizada ☁️")}catch(e){console.error(e);toast("Não consegui salvar a frase.")}}
async function ensureVLibras(){if(window.vlibras?.translateAndPlay)return true;if(!window.VLibras?.Widget){await new Promise((resolve,reject)=>{let old=document.querySelector('script[data-vlibras]');if(old){old.addEventListener("load",resolve,{once:true});setTimeout(resolve,1200);return}let sc=document.createElement("script");sc.src="https://vlibras.gov.br/app/vlibras-plugin.js";sc.dataset.vlibras="1";sc.onload=resolve;sc.onerror=reject;document.body.appendChild(sc)});if(window.VLibras?.Widget)new window.VLibras.Widget({rootPath:"https://vlibras.gov.br/app",showButton:false,position:"R"})}window.VLibrasWidget?.open?.();for(let i=0;i<60;i++){if(window.vlibras?.translateAndPlay)return true;await new Promise(r=>setTimeout(r,250))}return false}
async function previewVLibras(text){if(!text)return;toast("Abrindo tradução automática do VLibras…");try{if(await ensureVLibras())await window.vlibras.translateAndPlay(text);else toast("VLibras não carregou agora.")}catch(e){console.error(e);toast("Não consegui abrir o VLibras.")}}
async function phrase(){let n=$("#phrase-name").value.trim();if(!n)return toast("Digite uma frase.");$("#phrase-result").innerHTML='<div class="result">🔎 Procurando e testando gravações reais…</div>';await catalog();let rawExact=[...phraseCuratedExact(n),...phraseCatalogExact(n)],seen=new Set;rawExact=rawExact.filter(x=>{let k=(x.url||x.youtube||"")+"|"+norm(x.name);if(seen.has(k))return false;seen.add(k);return true});let exact=await validateCandidates(rawExact,{timeout:3800,max:14,keep:8}),similar=[];if(!exact.length){$("#phrase-result").innerHTML='<div class="result">🔎 A frase exata não carregou. Testando produções próximas…</div>';similar=await validateCandidates(phraseSimilar(n),{timeout:3300,max:8,keep:5})}let gloss=await translateGloss(n);S.phraseResults=[...exact,...similar];let html='<div class="phrase-meta">🩺 O Studio testou os arquivos antes de mostrá-los · '+(S.catalogStats?.sources||6)+' bases conectadas</div>';if(exact.length){html+='<div class="result phrase-ok"><b>✅ '+exact.length+' gravação(ões) funcionando</b><p>São produções contínuas reais. Links que falharam foram descartados automaticamente.</p></div>'+exact.map((x,i)=>phraseRow(x,i,false)).join("")}else{html+='<div class="result"><b>🔎 Nenhuma gravação exata funcional apareceu agora.</b><p>Links quebrados ou servidores fora do ar foram escondidos. O Studio não monta sinais isolados para fingir uma frase.</p></div>';if(similar.length)html+=similar.map((x,i)=>phraseRow(x,i,true)).join("");else html+='<p class="empty-note">Também não encontrei uma produção semelhante com vídeo funcionando neste momento.</p>'}html+='<div class="auto-translation"><b>🤖 Tradução automática oficial do VLibras</b><p>É um fallback com avatar, separado das gravações humanas.'+(gloss?' Glosa sugerida: <code>'+esc(gloss)+'</code>.':'')+'</p><button id="vlibras-phrase" class="soft wide">▶ Ver esta frase no VLibras</button></div>';$("#phrase-result").innerHTML=html;bindPhraseResults()}
let PHRASE_LIBRARY_STATE={offset:0,category:"",query:""};
function phraseLibraryGeneratedRows(items){
  return(items||[]).map(p=>'<button type="button" class="phrase-generated-card" data-phrase-generated="'+p.index+'"><b>'+esc(p.text)+'</b><small>'+esc(p.category)+' · VLibras automático</small></button>').join("")
}
function renderExpandedPhraseLibrary(reset=false){
  let lib=window.LIBRAS_PHRASE_LIBRARY;if(!lib)return;
  if(reset)PHRASE_LIBRARY_STATE.offset=0;
  let q=String($("#phrase-library-filter")?.value||PHRASE_LIBRARY_STATE.query||"").trim(),cat=$("#phrase-library-category")?.value||PHRASE_LIBRARY_STATE.category||"";
  PHRASE_LIBRARY_STATE.query=q;PHRASE_LIBRARY_STATE.category=cat;
  let items;
  if(q){
    items=lib.search(q,120).filter(x=>!cat||x.category===cat).slice(0,60);
  }else{
    items=lib.page(PHRASE_LIBRARY_STATE.offset,60,cat);
  }
  let grid=$("#phrase-generated-grid");if(grid)grid.innerHTML=phraseLibraryGeneratedRows(items)||'<div class="empty-note">Nenhuma frase encontrada neste filtro.</div>';
  let more=$("#phrase-load-more");if(more){more.classList.toggle("hidden",!!q||!items.length);more.textContent="Carregar mais frases"}
  $("[data-phrase-generated]").forEach(b=>b.onclick=()=>{let p=lib.get(+b.dataset.phraseGenerated);if(!p)return;$("#phrase-name").value=p.text;previewVLibras(p.text)});
}
function showAvailablePhrases(){
  let real=window.LIBRAS_PHRASE_DATA||[],lib=window.LIBRAS_PHRASE_LIBRARY,badge=$("#phrase-count-badge"),total=lib?.total||real.length;
  if(badge)badge.textContent=total.toLocaleString("pt-BR")+" frases";
  let cats=(lib?.categories||[]).map(c=>'<option value="'+esc(c)+'">'+esc(c)+'</option>').join("");
  $("#phrase-result").innerHTML=
    '<div class="phrase-library-summary"><div><b>'+total.toLocaleString("pt-BR")+' frases pesquisáveis</b><small>'+real.length+' gravações humanas priorizadas · demais frases via VLibras</small></div><span>Biblioteca experimental</span></div>'+
    '<div class="phrase-library-toolbar"><input id="phrase-library-filter" placeholder="Filtrar entre 50 mil frases"><select id="phrase-library-category"><option value="">Todos os temas</option>'+cats+'</select></div>'+
    '<div class="phrase-human-section"><div class="phrase-section-title"><b>Gravações humanas</b><small>'+real.length+' disponíveis</small></div><div class="phrase-library-grid">'+real.map((p,i)=>'<button type="button" data-phrase-pick="'+i+'"><b>'+esc(p.text)+'</b><small>Gravação real · buscar</small></button>').join("")+'</div></div>'+
    '<div class="phrase-generated-section"><div class="phrase-section-title"><b>Biblioteca ampliada</b><small>Tradução automática do VLibras</small></div><div id="phrase-generated-grid" class="phrase-library-grid"></div><button id="phrase-load-more" class="soft wide" style="margin-top:10px">Carregar mais frases</button></div>';
  PHRASE_LIBRARY_STATE={offset:0,category:"",query:""};renderExpandedPhraseLibrary(true);
  $("[data-phrase-pick]").forEach(b=>b.onclick=()=>{let p=real[+b.dataset.phrasePick];if(!p)return;$("#phrase-name").value=p.text;phrase()});
  $("#phrase-library-filter").oninput=()=>renderExpandedPhraseLibrary(true);
  $("#phrase-library-category").onchange=()=>renderExpandedPhraseLibrary(true);
  $("#phrase-load-more").onclick=()=>{PHRASE_LIBRARY_STATE.offset+=60;let lib=window.LIBRAS_PHRASE_LIBRARY,cat=PHRASE_LIBRARY_STATE.category||"";let items=lib.page(PHRASE_LIBRARY_STATE.offset,60,cat),grid=$("#phrase-generated-grid");if(grid)grid.insertAdjacentHTML("beforeend",phraseLibraryGeneratedRows(items));$("[data-phrase-generated]").forEach(b=>b.onclick=()=>{let p=lib.get(+b.dataset.phraseGenerated);if(!p)return;$("#phrase-name").value=p.text;previewVLibras(p.text)});if(!items.length)$("#phrase-load-more").classList.add("hidden")}
}
async function batch(){let ns=$("#batch-text").value.split(/\n|,/).map(x=>x.trim()).filter(Boolean),ok=0,fail=[];await catalog();for(let n of ns){let o=opts(n);if(!o.length){fail.push(n);continue}try{await save(n,o[0],null,"batch");ok++}catch{fail.push(n)}}$("#batch-result").innerHTML='<div class="result"><b>✅ '+ok+' salvos</b>'+(fail.length?'<p>Não encontrados: '+esc(fail.join(", "))+'</p>':"")+"</div>"}
function exploreCats(){let q=norm($("#explore-search")?.value),D=window.LIBRAS_EXPLORE_DATA||{};$("#explore-cats").innerHTML=Object.entries(D).filter(([c,d])=>!q||norm(c+" "+d.description).includes(q)).map(([c,d])=>'<button data-cat="'+esc(c)+'" class="'+(S.explore===c?"active":"")+'">'+LSCategoryIcon(c)+" "+esc(c)+"</button>").join("");$$("[data-cat]").forEach(b=>b.onclick=()=>openCat(b.dataset.cat))}
async function signOptions(name,{refresh=false}={}){if(refresh)S.catalog=null;await catalog();return opts(name)}
async function openCat(c){
  S.explore=c;exploreCats();
  let panel=$("#explore-panel"),d=(window.LIBRAS_EXPLORE_DATA||{})[c];if(!d)return;
  let optionMap=new Map,playableMap=new Map;
  const renderCards=()=>{
    let owned=new Set(S.signs.map(x=>x.norm));
    let visible=d.terms.map((t,i)=>({t,i})).filter(x=>playableMap.has(norm(x.t)));
    let cards=visible.map(({t,i})=>{
      let has=owned.has(norm(t)),picked=playableMap.get(norm(t)),video=picked?.url||"";
      return '<article class="explore-signal-card" data-explore-card="'+i+'">'+
        '<div class="explore-video-frame">'+(video?'<video data-explore-preview="'+i+'" data-preview-src="'+esc(video)+'" muted playsinline preload="none"></video>':'')+'<button class="explore-card-play" data-explore-play="'+i+'">▶</button></div>'+
        '<div class="explore-card-copy"><b>'+esc(title(t))+'</b>'+(has?'<small>✓ na biblioteca</small>':'<small>' + esc(picked?.source_name||"vídeo disponível") + '</small>')+'</div>'+
        '<div class="explore-card-actions">'+(has?'<span class="explore-owned-mark">✓ Salvo</span>':'<button data-add="'+i+'" aria-label="Adicionar '+esc(title(t))+'">＋ Adicionar</button><button class="soft" data-explore-variants="'+i+'">Variações</button>')+'</div></article>';
    }).join("");
    panel.innerHTML='<div class="card explore-category-head"><h3>'+LSCategoryIcon(c)+' <span>'+esc(c)+'</span></h3><p>'+esc(d.description)+'</p></div><div class="explore-video-grid">'+cards+'</div>'+(cards?'':'<div class="surface center"><p>Nenhum sinal com vídeo cadastrado nesta categoria.</p></div>');
    primePreviewVideos(panel);
    $$("[data-explore-preview]").forEach(v=>{
      v.onerror=async()=>{
        if(v.dataset.fallbackBusy==="1")return;
        v.dataset.fallbackBusy="1";
        let i=+v.dataset.explorePreview,t=d.terms[i],bad=(playableMap.get(norm(t))||{}).url||"";
        let candidates=(optionMap.get(norm(t))||[]).filter(x=>x.url&&x.url!==bad&&knownMediaHealth(x.url)!==false);
        try{
          let picked=await firstPlayable(candidates,{timeout:1800,max:4});
          if(picked){
            playableMap.set(norm(t),picked);
            v.dataset.previewLoaded="0";v.dataset.previewObserved="0";v.dataset.previewSrc=picked.url;
            v.removeAttribute("src");v.classList.remove("preview-ready");primePreviewVideo(v);
          }else{
            playableMap.delete(norm(t));
            v.closest("[data-explore-card]")?.remove();
          }
        }catch{playableMap.delete(norm(t));v.closest("[data-explore-card]")?.remove()}
        finally{v.dataset.fallbackBusy="0"}
      };
    });
    $$("[data-add]").forEach(b=>b.onclick=async()=>{
      let i=+b.dataset.add,t=d.terms[i],list=optionMap.get(norm(t))||[],picked=playableMap.get(norm(t));
      b.disabled=true;
      try{
        if(!picked||knownMediaHealth(picked.url)!==true)picked=await firstPlayable(list,{timeout:2200,max:5});
        if(!picked){playableMap.delete(norm(t));b.closest("[data-explore-card]")?.remove();return toast("Não encontrei um vídeo funcionando para este sinal.")}
        playableMap.set(norm(t),picked);await save(t,picked,c,"category_explorer");renderCards();
      }catch(e){console.error(e);toast("Falha ao adicionar")}finally{b.disabled=false}
    });
    $$("[data-explore-variants]").forEach(b=>b.onclick=()=>openAvailableVariants(d.terms[+b.dataset.exploreVariants],c));
    $$("[data-explore-play]").forEach(b=>b.onclick=async()=>{
      let t=d.terms[+b.dataset.explorePlay],picked=playableMap.get(norm(t));
      if(!picked||knownMediaHealth(picked.url)===false)picked=await preferredSignMedia(t);
      if(!picked){playableMap.delete(norm(t));b.closest("[data-explore-card]")?.remove();return toast("Vídeo indisponível.")}
      let id="explore-"+Date.now();modal('<h2>'+esc(title(t))+'</h2><video data-video-id="'+id+'" controls autoplay loop playsinline preload="metadata" src="'+esc(picked.url)+'"></video>'+speedTools(id));bindSpeeds($("#modal-body"));bindVideoFallbacks($("#modal-body"),t);
    });
  };
  panel.innerHTML='<div class="card explore-category-head"><h3>'+LSCategoryIcon(c)+' <span>'+esc(c)+'</span></h3><p>'+esc(d.description)+'</p></div><div class="explore-preview-loading">Preparando as prévias…</div>';
  requestAnimationFrame(()=>panel.scrollIntoView({behavior:"smooth",block:"start"}));
  try{
    await catalog();
    d.terms.forEach(t=>{
      let list=dedupeCandidates(opts(t)).filter(x=>x.url&&knownMediaHealth(x.url)!==false);
      optionMap.set(norm(t),list);
      let first=list.find(x=>knownMediaHealth(x.url)===true)||list[0];
      if(first)playableMap.set(norm(t),first);
    });
    renderCards();
  }catch(e){
    console.error(e);
    panel.innerHTML='<div class="card explore-category-head"><h3>'+LSCategoryIcon(c)+' <span>'+esc(c)+'</span></h3><p>'+esc(d.description)+'</p></div><div class="surface center"><p>Não consegui carregar o catálogo agora.</p></div>';
  }
}
function smap(){return Object.fromEntries(S.study.map(x=>[x.lesson_id,x]))}
function study(){let L=window.LIBRAS_STUDY_CONTENT||[],m=smap(),done=L.filter(x=>m[x.id]?.completed).length;$("#study-count").textContent=done+" de "+L.length+" aulas";$("#study-pct").textContent=Math.round(done/Math.max(1,L.length)*100)+"%";let mods=[...new Set(L.map(x=>x.module))],a=$("#study-modules").dataset.active||"";$("#study-modules").innerHTML='<button data-mod="" class="'+(!a?"active":"")+'">Todas</button>'+mods.map(x=>'<button data-mod="'+esc(x)+'" class="'+(a===x?"active":"")+'">'+esc(moduleLabel(x))+"</button>").join("");$$("[data-mod]").forEach(b=>b.onclick=()=>{$("#study-modules").dataset.active=b.dataset.mod;study()});let q=norm($("#study-search").value),F=L.filter(x=>(!a||x.module===a)&&(!q||norm(x.title+" "+x.summary).includes(q)));$("#study-list").innerHTML=F.map(x=>'<article class="lesson" id="lesson-'+x.id+'"><small>'+LSIcon("lesson","icon-sm")+" "+esc(moduleLabel(x.module))+" · "+esc(x.level)+'</small><h3>'+esc(x.title)+'</h3><p>'+esc(x.summary)+'</p>'+x.sections.map(sec=>'<h4>'+esc(sec[0])+'</h4><p>'+esc(sec[1])+"</p>").join("")+'<div class="practice"><b>Prática</b><p>'+esc(x.practice)+'</p></div><ul>'+x.take.map(t=>"<li>"+esc(t)+"</li>").join("")+"</ul>"+(x.resources||[]).map(r=>'<a class="resource" href="'+esc(r[1])+'" target="_blank">↗ '+esc(r[0])+"</a>").join("")+'<div class="continue-actions"><button class="soft" data-focus-lesson="'+x.id+'">Continuar desta aula</button><label class="complete"><input type="checkbox" data-lesson="'+x.id+'" '+(m[x.id]?.completed?"checked":"")+'> Aula concluída</label></div></article>').join("");$$("[data-focus-lesson]").forEach(b=>b.onclick=()=>{localStorage.setItem("ls-last-lesson",b.dataset.focusLesson);toast("Aula marcada para continuar depois.")});$$("[data-lesson]").forEach(c=>c.onchange=()=>saveLesson(c.dataset.lesson,c.checked));if(window.LSHydrateIcons)LSHydrateIcons($("#study"))}
async function saveLesson(id,v){let now=new Date().toISOString(),row={user_id:S.session.user.id,lesson_id:id,completed:v,completed_at:v?now:null,updated_at:now},i=S.study.findIndex(x=>x.lesson_id===id);if(i>=0)S.study[i]=row;else S.study.push(row);let L=window.LIBRAS_STUDY_CONTENT||[],idx=L.findIndex(x=>x.id===id);if(v){let nx=L.slice(idx+1).find(x=>!smap()[x.id]?.completed);if(nx)localStorage.setItem("ls-last-lesson",nx.id)}else localStorage.setItem("ls-last-lesson",id);cache();render();localStatus("📱 alterações locais · sincronize quando quiser")}
function vurl(s){return s.media_url||(s.source_url&&/\.mp4($|\?)/i.test(s.source_url)?s.source_url.replace(/^http:/,"https:"):"")}
function libraryCats(){let sel=$("#library-cat");if(!sel)return;let previous=sel.value,cs=[...new Set([...S.cats.map(x=>x.name),...S.signs.map(x=>x.category_name)].filter(Boolean))].sort((a,b)=>a.localeCompare(b,"pt-BR"));sel.replaceChildren(new Option("Todas as categorias",""));for(let c of cs){let meta=S.cats.find(x=>x.name===c),label=(meta?.emoji?meta.emoji+" ":"")+c;sel.add(new Option(label,c))}sel.value=cs.includes(previous)?previous:""}
function speedTools(id){return '<div class="video-tools"><span>Velocidade</span>'+[.25,.5,.75,1,1.25].map(x=>'<button type="button" class="speed-btn '+(x===1?"active":"")+'" data-speed="'+x+'" data-video="'+id+'">'+x+'x</button>').join("")+'</div>'}
function bindSpeeds(root=document){root.querySelectorAll(".speed-btn").forEach(b=>b.onclick=()=>{let v=root.querySelector('[data-video-id="'+b.dataset.video+'"]')||document.querySelector('[data-video-id="'+b.dataset.video+'"]');if(!v)return;v.playbackRate=+b.dataset.speed;root.querySelectorAll('.speed-btn[data-video="'+b.dataset.video+'"]').forEach(x=>x.classList.toggle("active",x===b))})}
function fmtInterval(d){d=Number(d||0);let min=Math.round(d*1440);if(min<60)return min+" min";let h=d*24;if(h<24)return (Math.round(h*10)/10).toString().replace(".0","")+" h";if(d<30)return (Math.round(d*10)/10).toString().replace(".0","")+" "+(Math.abs(d-1)<.01?"dia":"dias");let mo=d/30;if(mo<12)return (Math.round(mo*10)/10)+" meses";let y=d/365;return (Math.round(y*10)/10)+" anos"}
async function bindVideoFallbacks(root,name){let videos=[...root.querySelectorAll("video")];for(let v of videos){let current=()=>v.currentSrc||v.src;v.onloadedmetadata=()=>setMediaHealth(current(),true);v.onerror=async()=>{if(v.dataset.fallbackBusy==="1")return;v.dataset.fallbackBusy="1";let bad=current();setMediaHealth(bad,false);if(!navigator.onLine){let note=document.createElement("small");note.className="video-fallback-note";note.textContent="📴 Este vídeo não está disponível offline neste aparelho.";v.after(note);v.dataset.fallbackBusy="0";return}try{await catalog();let tried=new Set((v.dataset.tried||"").split("|").filter(Boolean));tried.add(bad);let candidates=allMediaCandidates(name).filter(x=>x.url&&!tried.has(x.url)),next=await firstPlayable(candidates,{timeout:3500,max:10});if(next){tried.add(next.url);v.dataset.tried=[...tried].join("|");v.src=next.url;v.load();let old=v.parentElement?.querySelector(".source-switch");if(old)old.remove();let note=document.createElement("small");note.className="video-fallback-note source-switch";note.textContent="🔄 Fonte alternativa: "+(next.source_name||"outra base");v.after(note);await repairMedia(v.dataset.studioId,next);v.dataset.fallbackBusy="0";return}let note=document.createElement("small");note.className="video-fallback-note";note.textContent="⚠️ As fontes disponíveis para este vídeo estão fora do ar agora.";v.after(note)}finally{v.dataset.fallbackBusy="0"}}}}


const LIBRARY_OPEN_KEY="ls-library-open-v1";
function libraryOpenSet(){try{return new Set(JSON.parse(localStorage.getItem(LIBRARY_OPEN_KEY)||"[]"))}catch{return new Set}}
function saveLibraryOpenSet(set){try{localStorage.setItem(LIBRARY_OPEN_KEY,JSON.stringify([...set]))}catch{}}
function bindLibraryCategories(){document.querySelectorAll("[data-cat-toggle]").forEach(btn=>btn.onclick=()=>{let name=btn.dataset.catToggle;if(!name)return;let next=btn.getAttribute("aria-expanded")!=="true",open=new Set;if(next)open.add(name);saveLibraryOpenSet(open);library();if(next)requestAnimationFrame(()=>document.querySelector('[data-drop-category="'+CSS.escape(name)+'"]')?.scrollIntoView({behavior:"smooth",block:"start"}))})}
function libraryRepresentative(items){
  let list=[...(items||[])].sort((a,b)=>Number(a.variant_no||999)-Number(b.variant_no||999));
  return list.find(x=>nativeCachedVideoUrl(x.studio_id))||list.find(x=>libraryVideoUrl(x))||list[0]
}
function libraryGroupCategory(items){
  let counts=new Map;
  for(let x of items||[]){let c=x.category_name||"Outros";counts.set(c,(counts.get(c)||0)+1)}
  return[...counts.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]||"Outros"
}
function library(){
  compactExactDuplicateVariants();
  let q=norm($("#library-search")?.value||""),cat=$("#library-cat")?.value||"",open=libraryOpenSet(),byNorm=new Map;
  for(let item of S.signs){
    if(!libraryVideoUrl(item))continue;
    let key=signNormKey(item);
    if(!key||q&&!norm((item.name||"")+" "+(item.category_name||"")).includes(q))continue;
    if(!byNorm.has(key))byNorm.set(key,[]);
    byNorm.get(key).push(item)
  }
  let grouped=[...byNorm.entries()].map(([key,variants])=>({key,variants,rep:libraryRepresentative(variants),category:libraryGroupCategory(variants)})).filter(x=>!cat||x.category===cat);
  let g={};for(let row of grouped)(g[row.category]??=[]).push(row);
  let total=$("#library-total-signs"),cats=$("#library-total-cats");
  if(total)total.textContent=new Set(S.signs.map(signNormKey).filter(Boolean)).size;
  if(cats)cats.textContent=new Set(S.signs.map(x=>x.category_name).filter(Boolean)).size;
  let categories=[...new Set([...S.cats.map(x=>x.name),...S.signs.map(x=>x.category_name)].filter(Boolean))].sort((a,b)=>a.localeCompare(b,"pt-BR"));
  let groups=Object.entries(g).sort((a,b)=>a[0].localeCompare(b[0],"pt-BR"));
  $("#library-list").innerHTML=groups.map(([c,it],groupIndex)=>{
    let expanded=!!q||!!cat||open.has(c),count=it.length,rows="";
    if(expanded){
      rows=it.map((entry,i)=>{
        let x=entry.rep,media=libraryVideoUrl(x),tone=(groupIndex+i)%5,moveOptions=categories.filter(z=>z!==c).map(z=>'<option value="'+esc(z)+'">'+esc(z)+'</option>').join("");
        return '<article class="library-sign-card tone-'+tone+'" draggable="true" data-library-card="'+esc(entry.key)+'" data-current-category="'+esc(c)+'">'+
          '<div class="library-media">'+(media?'<video data-library-preview="'+esc(x.studio_id)+'" data-preview-src="'+esc(media)+'" muted playsinline preload="none"></video>':'')+'<button class="library-media-play" data-library-play="'+esc(x.studio_id)+'" aria-label="Reproduzir '+esc(x.name)+'">▶</button></div>'+
          '<div class="library-card-copy"><b>'+esc(x.name)+'</b><small>'+esc(c)+'</small></div>'+
          '<div class="library-card-actions"><select data-library-move="'+esc(entry.key)+'" aria-label="Mover '+esc(x.name)+'"><option value="">Mover…</option>'+moveOptions+'</select><button class="soft" data-library-variants="'+esc(entry.key)+'">Variações</button><button class="danger" data-library-delete="'+esc(entry.key)+'">Excluir</button></div>'+
        '</article>';
      }).join("");
    }
    return '<section class="lib-category '+(expanded?"open":"")+'" data-drop-category="'+esc(c)+'"><button type="button" class="cat-head cat-toggle" data-cat-toggle="'+esc(c)+'" aria-expanded="'+String(expanded)+'"><span class="cat-head-main"><span>'+LSCategoryIcon(c)+esc(c)+'</span></span><span class="cat-head-right"><span class="cat-count">'+count+'</span></span></button><div class="cat-collapse '+(expanded?"open":"")+'">'+(expanded?'<div class="cat-items library-card-grid">'+rows+'</div>':'')+'</div></section>';
  }).join("")||'<div class="card center"><p>Nenhum sinal nesta categoria.</p></div>';
  bindLibraryCategories();bindLibraryRows();primeLibraryPreviews($("#library-list"));
  if(window.LSHydrateIcons)LSHydrateIcons($("#library"));
}
async function openAvailableVariants(name,categoryName){
  modal('<h2>Variações de '+esc(title(name))+'</h2><p>🔎 Verificando e removendo vídeos repetidos…</p>');
  try{
    let candidates=await signOptions(name),all=await validateCandidates(candidates,{timeout:4200,max:30,keep:20});
    if(!all.length){candidates=await signOptions(name,{refresh:true});all=await validateCandidates(candidates,{timeout:4200,max:30,keep:20})}
    if(!all.length)return modal('<h2>Variações de '+esc(title(name))+'</h2><p>Nenhum vídeo disponível foi encontrado agora.</p>');
    all=await dedupeVariantCandidates(all);
    let saved=S.signs.filter(x=>signNormKey(x)===norm(name)),savedUrls=new Set(saved.map(vurl).filter(Boolean)),savedSigs=new Set;
    for(let item of saved){let u=vurl(item)||item.source_url||"";if(u){let sig=await mediaVariantSignature({url:u,source_id:item.source_id});if(sig)savedSigs.add(sig)}}
    let rows=[];
    for(let x of all){let sig=await mediaVariantSignature(x);rows.push({x,sig,saved:savedUrls.has(x.url)||(sig&&savedSigs.has(sig))})}
    modal('<h2>Variações de '+esc(title(name))+'</h2><div class="library-variants">'+rows.map((r,i)=>'<div class="library-variant"><video controls loop playsinline preload="metadata" src="'+esc(r.x.url)+'"></video><button type="button" class="soft wide" data-save-available-variant="'+i+'" '+(r.saved?'disabled':'')+'>'+(r.saved?'✓ Já salva':'＋ Salvar esta variação')+'</button></div>').join("")+'</div>');
    $("[data-save-available-variant]").forEach(b=>b.onclick=async()=>{let row=rows[+b.dataset.saveAvailableVariant],candidate=row?.x;if(!candidate)return;b.disabled=true;try{let before=S.signs.length;await save(name,candidate,categoryName||catFor(name),"catalog");b.textContent=S.signs.length===before?"✓ Já existia":"✓ Salva";toast(S.signs.length===before?"Essa gravação já estava salva.":"Variação adicionada à biblioteca")}catch(e){console.error(e);b.disabled=false;toast("Não consegui salvar esta variação.")}})
  }catch(e){console.error(e);modal('<h2>Variações de '+esc(title(name))+'</h2><p>Não consegui consultar as variações agora.</p>')}
}
async function openLibraryVariants(signNorm){let first=S.signs.find(x=>(x.norm||norm(x.name))===signNorm);if(first)await openAvailableVariants(first.name,first.category_name)}
async function openOrRepairLibrarySign(studioId){
  let item=S.signs.find(x=>x.studio_id===studioId);if(!item)return;
  let local=nativeCachedVideoUrl(item.studio_id),url=local||vurl(item);
  if(IS_NATIVE_ANDROID&&!navigator.onLine&&!local)return toast("Este vídeo ainda não foi baixado neste aparelho. Conecte-se uma vez para o Studio salvá-lo offline.");
  if(!url){
    toast("Procurando um vídeo para "+item.name+"…");
    try{await catalog();let picked=await firstPlayable(allMediaCandidates(item.name),{timeout:2200,max:6});if(picked){await repairMedia(item.studio_id,picked);url=picked.url;library()}else return toast("Ainda não encontrei um vídeo funcionando para "+item.name+".")}catch(e){console.error(e);return toast("Não consegui consultar as fontes agora.")}
  }
  let id="lib-"+item.studio_id;modal("<h2>"+esc(item.name)+'</h2><video data-video-id="'+id+'" data-studio-id="'+esc(item.studio_id)+'" controls autoplay loop playsinline preload="metadata" src="'+esc(url)+'"></video>'+speedTools(id)+'<p>'+esc(item.source_name||"Libras Studio")+"</p>");bindSpeeds($("#modal-body"));bindVideoFallbacks($("#modal-body"),item.name);
}
function bindLibraryRows(){
  let dragging="";
  document.querySelectorAll("[data-library-card]").forEach(card=>{
    card.ondragstart=e=>{dragging=card.dataset.libraryCard;card.classList.add("dragging");try{e.dataTransfer.setData("text/plain",dragging);e.dataTransfer.effectAllowed="move"}catch{}};
    card.ondragend=()=>{card.classList.remove("dragging");document.querySelectorAll("[data-drop-category]").forEach(x=>x.classList.remove("drop-target"));dragging=""};
  });
  document.querySelectorAll("[data-drop-category]").forEach(section=>{
    section.ondragover=e=>{e.preventDefault();section.classList.add("drop-target");if(e.dataTransfer)e.dataTransfer.dropEffect="move"};
    section.ondragleave=e=>{if(!section.contains(e.relatedTarget))section.classList.remove("drop-target")};
    section.ondrop=e=>{e.preventDefault();section.classList.remove("drop-target");let id="";try{id=e.dataTransfer.getData("text/plain")}catch{};id=id||dragging;if(id)moveLibraryItem(id,section.dataset.dropCategory)};
  });
  document.querySelectorAll("[data-library-move]").forEach(sel=>sel.onchange=()=>{let c=sel.value;if(c)moveLibraryItem(sel.dataset.libraryMove,c)});
  document.querySelectorAll("[data-library-delete]").forEach(b=>b.onclick=()=>deleteLibraryItem(b.dataset.libraryDelete));
  document.querySelectorAll("[data-library-play]").forEach(b=>b.onclick=()=>openOrRepairLibrarySign(b.dataset.libraryPlay));document.querySelectorAll("[data-library-preview]").forEach(v=>{v.onerror=async()=>{if(v.dataset.fallbackBusy==="1")return;v.dataset.fallbackBusy="1";let id=v.dataset.libraryPreview,item=S.signs.find(x=>x.studio_id===id),bad=v.dataset.previewSrc||"";if(!item){v.closest("[data-library-card]")?.remove();return}try{await catalog();let candidates=allMediaCandidates(item.name).filter(x=>x.url&&x.url!==bad&&knownMediaHealth(x.url)!==false),picked=await firstPlayable(candidates,{timeout:1800,max:5});if(!picked){v.closest("[data-library-card]")?.remove();return}await repairMedia(id,picked);v.dataset.previewLoaded="0";v.dataset.previewObserved="0";v.dataset.previewSrc=picked.url;v.removeAttribute("src");v.classList.remove("preview-ready");primeLibraryPreview(v)}catch(e){console.warn("prévia biblioteca",e);v.closest("[data-library-card]")?.remove()}finally{v.dataset.fallbackBusy="0"}}});
  document.querySelectorAll("[data-library-variants]").forEach(b=>b.onclick=()=>openLibraryVariants(b.dataset.libraryVariants));
}
async function moveLibraryItem(signNorm,category){
  let variants=S.signs.filter(x=>signNormKey(x)===signNorm),first=variants[0];
  if(!first||!category||variants.every(x=>x.category_name===category))return;
  let now=new Date().toISOString();
  variants.forEach(x=>Object.assign(x,{category_name:category,category_source:"manual",updated_at:now}));
  cache();library();localStatus("📱 alterações locais · sincronize quando quiser");toast("Movido para "+category)
}
async function deleteLibraryItem(signNorm){
  let variants=S.signs.filter(x=>signNormKey(x)===signNorm),first=variants[0];
  if(!first||!confirm("Excluir "+first.name+" da biblioteca?"))return;
  variants.forEach(deleteCachedLibraryVideo);
  S.signs=S.signs.filter(x=>signNormKey(x)!==signNorm);
  cache();render();localStatus("📱 alterações locais · sincronize quando quiser");toast("Sinal removido do celular.")
}
async function newCat(){let n=prompt("Nome da categoria:");if(!n)return;let e=prompt("Emoji:","🧩")||"🧩",now=new Date().toISOString(),row={user_id:S.session.user.id,name:title(n),emoji:e,description:"",sort_order:999,is_custom:true,is_hidden:false,created_at:now,updated_at:now,deleted_at:null};S.cats.push(row);cache();render();localStatus("📱 alterações locais · sincronize quando quiser")}
function reviewCats(){let s=$("#review-cat");if(!s)return;let v=s.value,cs=[...new Set(S.signs.map(x=>x.category_name).filter(Boolean))].sort();s.innerHTML='<option value="">Todas</option>'+cs.map(x=>'<option>'+esc(x)+"</option>").join("");s.value=v;let m=rmap(),now=Date.now(),u=unique(),due=0,fresh=0,reviewed=0;u.forEach(x=>{let r=m[x.norm];if(!r)fresh++;else{if(r.last_reviewed_at)reviewed++;if(r.due_at&&new Date(r.due_at).getTime()<=now)due++}});let d=$("#review-due-metric"),n=$("#review-new-metric"),rv=$("#review-reviewed-metric");if(d)d.textContent=due;if(n)n.textContent=fresh;if(rv)rv.textContent=reviewed}
function next(rate,c){let reps=c?.reps||0,e=c?.ease||2.5,iv=+c?.interval_days||0,d=0,l=c?.lapses||0,n=reps;if(rate==="again"){d=10/1440;e=Math.max(1.3,e-.2);l++}if(rate==="hard"){d=reps?Math.max(1,iv*1.2):.25;e=Math.max(1.3,e-.15);n++}if(rate==="good"){d=reps===0?1:reps===1?3:Math.max(1,iv*e);n++}if(rate==="easy"){e=Math.min(3.5,e+.15);d=reps?Math.max(2,iv*(e+.3)):4;n++}return{interval_days:d,ease:e,reps:n,lapses:l,due_at:new Date(Date.now()+d*864e5).toISOString()}}
function queue(){let c=$("#review-cat").value,mode=$("#review-mode").value,m=rmap(),now=Date.now(),due=[],fresh=[];unique().filter(s=>!c||s.category_name===c).forEach(s=>{let r=m[s.norm];if(!r)fresh.push(s);else if(r.due_at&&new Date(r.due_at).getTime()<=now)due.push(s)});let out=mode==="due"?due:mode==="new"?fresh:[...due,...fresh],lim=$("#review-limit").value;return lim==="all"?out:out.slice(0,+lim)}
function card(){let s=S.queue[S.i];if(!s){$("#review-card").classList.add("hidden");$("#review-done").classList.remove("hidden");return}$("#review-card").classList.remove("hidden");$("#review-done").classList.add("hidden");$("#review-name").textContent=s.name;$("#review-media").classList.add("hidden");$("#ratings").classList.add("hidden");$("#reveal").classList.remove("hidden");let current=rmap()[s.norm];["again","hard","good","easy"].forEach(k=>{let el=document.querySelector('[data-time="'+k+'"]');if(el)el.textContent=fmtInterval(next(k,current).interval_days)});let vs=S.signs.filter(x=>x.norm===s.norm&&libraryVideoUrl(x));$("#review-media").innerHTML=vs.length?vs.map((v,i)=>{let id="rev-"+S.i+"-"+i;return '<video data-video-id="'+id+'" data-studio-id="'+esc(v.studio_id)+'" controls loop playsinline preload="metadata" src="'+esc(libraryVideoUrl(v))+'"></video>'+speedTools(id)+'<small>'+(vs.length>1?"Variação "+(i+1)+" · ":"")+esc(v.source_name||"")+"</small>"}).join(""):"<p>Vídeo indisponível.</p>";bindSpeeds($("#review-media"));bindVideoFallbacks($("#review-media"),s.name)}
async function rate(r){let item=S.queue[S.i],now=new Date().toISOString(),old=rmap()[item.norm],row={user_id:S.session.user.id,norm:item.norm,...next(r,old),last_rating:r,last_reviewed_at:now,created_at:old?.created_at||now,updated_at:now,deleted_at:null},i=S.reviews.findIndex(x=>x.norm===item.norm);if(i>=0)S.reviews[i]=row;else S.reviews.push(row);S.i++;cache();render();card();localStatus("📱 alterações locais · sincronize quando quiser")}
function modal(h){$("#modal-body").innerHTML=h;$("#modal").classList.remove("hidden")}
async function clearStudioRuntime(){if("caches"in window){let ks=await caches.keys();await Promise.all(ks.filter(k=>k.startsWith("libras-studio-mobile-")||k.startsWith("libras-studio-catalog-")).map(k=>caches.delete(k)))}if("serviceWorker"in navigator){let regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.filter(r=>r.scope.includes("/libras-studio/")).map(r=>r.unregister()))}}
function nativeUpdaterAvailable(){return !!(IS_NATIVE_ANDROID&&window.LibrasUpdater&&typeof window.LibrasUpdater.loadLatestWeb==="function")}
function nativeFullUpdaterAvailable(){return !!(nativeUpdaterAvailable()&&(typeof window.LibrasUpdater.stageLocalStorageAndUpdateEverything==="function"||typeof window.LibrasUpdater.updateEverything==="function"))}
window.addEventListener("librasstudio-native-update",e=>{let d=e.detail||{},s=d.status||"";if(s==="checking")toast("Verificando atualizações…");else if(s==="downloading")toast(d.message||"Baixando atualização…");else if(s==="ready")toast("Atualização baixada e verificada.");else if(s==="permission_required")toast("Autorize a instalação e volte ao Libras Studio.");else if(s==="up_to_date")toast("APK atualizado. Atualizando a interface…");else if(s==="error")toast(d.message||"Não consegui atualizar agora.")});
async function forceAppUpdate(){try{localStorage.removeItem(MEDIA_HEALTH_KEY)}catch{}if(nativeUpdaterAvailable()){if(!navigator.onLine)return toast("Conecte-se à internet para atualizar o aplicativo.");toast("Buscando atualizações do Studio…");try{if(nativeFullUpdaterAvailable()){if(typeof window.LibrasUpdater.stageLocalStorageAndUpdateEverything==="function")window.LibrasUpdater.stageLocalStorageAndUpdateEverything(nativeStorageSnapshot());else window.LibrasUpdater.updateEverything();}else if(typeof window.LibrasUpdater.stageLocalStorageAndLoad==="function")window.LibrasUpdater.stageLocalStorageAndLoad(nativeStorageSnapshot());else window.LibrasUpdater.loadLatestWeb();return}catch(e){console.error("atualização nativa",e);return toast("Não consegui abrir a atualização agora.")}}toast("Buscando atualização…");try{let remote=APP_VERSION;try{let r=await fetch("./version.json?t="+Date.now(),{cache:"no-store"});if(r.ok){let v=await r.json();remote=v.version||remote}}catch{}await clearStudioRuntime();location.replace("./?updated="+encodeURIComponent(remote)+"&t="+Date.now())}catch(e){console.error(e);toast("Não consegui atualizar agora.")}}
async function checkAppUpdate(){if(IS_NATIVE_ANDROID)return false;try{let r=await fetch("./version.json?t="+Date.now(),{cache:"no-store"});if(!r.ok)return false;let v=await r.json();if(v.version&&v.version!==APP_VERSION){await clearStudioRuntime();location.replace("./?updated="+encodeURIComponent(v.version)+"&t="+Date.now());return true}return false}catch(e){return false}}
async function setupServiceWorker(){if(IS_NATIVE_ANDROID&&location.protocol==="file:")return;if(!("serviceWorker"in navigator))return;try{let reg=await navigator.serviceWorker.register("./sw.js?v="+APP_VERSION,{updateViaCache:"none"});await reg.update();navigator.serviceWorker.addEventListener("controllerchange",()=>{if(!window.__lsReloading){window.__lsReloading=true;location.reload()}})}catch(e){console.warn("SW",e)}}

const LL_UI_WORDS=new Set(["continuar","voltar","proximo","pular","sair","menu","inicio","configuracoes","configuracao","concluir","finalizar","tentar novamente","ver resposta","responder","avancar","fechar"]);
const LL_MATCH_STOP=new Set(["a","o","as","os","de","da","do","das","dos","e","em","no","na","nos","nas","um","uma","uns","umas","para","por","com","sem","que","se","ao","aos","meu","minha","meus","minhas","seu","sua","seus","suas","este","esta","esse","essa","isso","isto"]);
function nativeBridgeAvailable(){return !!(window.LibrasNative&&typeof window.LibrasNative.getState==="function")}
function getNativeState(){if(!nativeBridgeAvailable())return null;try{let raw=window.LibrasNative.getState(),st=JSON.parse(raw||"{}");try{st.detections=JSON.parse(st.detections||"[]")}catch{st.detections=[]}return st}catch(e){console.warn("bridge",e);return null}}
function personalEditionAvailable(){return false}
function applyEditionUI(){let personal=personalEditionAvailable(),section=$("#libraslab"),quick=$("#libraslab-quick"),more=$("#libraslab-more");if(section)section.classList.toggle("hidden",!personal);if(quick)quick.classList.toggle("hidden",!personal);if(more)more.classList.toggle("hidden",!personal);if(!personal&&section?.classList.contains("active"))go("home")}
function llAddVariant(set,value){let v=String(value||"").trim().replace(/\s+/g," ");if(v)set.add(v)}
function llTextVariants(text){
  let raw=String(text||"").trim().replace(/\s+/g," "),out=new Set;
  llAddVariant(out,raw);
  llAddVariant(out,raw.replace(/^(?:sinal|palavra|resposta)\s*(?:de|da|do)?\s*[:\-]?\s*/i,""));
  llAddVariant(out,raw.replace(/^(?:aprenda|pratique|faça|faca|execute|mostre)\s+(?:o\s+)?(?:sinal\s+)?(?:de\s+)?/i,""));
  llAddVariant(out,raw.replace(/^(?:como\s+(?:se\s+)?(?:faz|diz)|qual\s+(?:e|é)?\s*(?:o\s+)?sinal)\s*(?:de\s+)?/i,""));
  if(raw.includes(":"))llAddVariant(out,raw.split(":").slice(1).join(":"));
  raw.split(/\s*[•·|]\s*|\s+[—–]\s+|\s+-\s+/).forEach(x=>llAddVariant(out,x));
  for(let v of [...out]){
    llAddVariant(out,v.replace(/\([^)]*\)|\[[^\]]*\]/g," "));
    llAddVariant(out,v.replace(/^\d+\s*(?:[.)\-:]\s*)?/,""));
    llAddVariant(out,v.replace(/\s+(?:em\s+)?libras\s*[?.!]*$/i,""));
    llAddVariant(out,v.replace(/\s+\d+\s*(?:x|vez(?:es)?|ocorr[eê]ncia(?:s)?)\s*$/i,""));
  }
  return[...out].filter(Boolean)
}
function llMeaningfulContainedKey(key){
  let tokens=String(key||"").split(" ").filter(Boolean);
  if(!tokens.length)return false;
  if(tokens.length===1){
    let t=tokens[0];
    if(t.length<2||LL_MATCH_STOP.has(t)||LL_UI_WORDS.has(t))return false
  }
  return !tokens.every(t=>LL_MATCH_STOP.has(t)||LL_UI_WORDS.has(t))
}
function llContainedMatch(variant){
  let tokens=norm(variant).split(" ").filter(Boolean);
  if(tokens.length<2)return null;
  for(let size=Math.min(5,tokens.length);size>=1;size--){
    let found=new Map;
    for(let i=0;i+size<=tokens.length;i++){
      let key=tokens.slice(i,i+size).join(" ");
      if(!llMeaningfulContainedKey(key))continue;
      let options=opts(key);
      if(options.length&&!found.has(key))found.set(key,{variant:key,options,matchType:"trecho"})
    }
    if(found.size===1)return[...found.values()][0];
    if(found.size>1)return null
  }
  return null
}
function llMatchText(text){
  let variants=llTextVariants(text);
  for(let variant of variants){let options=opts(variant);if(options.length)return{variant,options,matchType:"exato"}}
  for(let variant of variants){let matched=llContainedMatch(variant);if(matched)return matched}
  return null
}
async function buildLibrasLabCandidates(raw){
  await catalog();
  let map=new Map,unmatched=new Map,owned=new Set(S.signs.map(x=>x.norm));
  for(let d of(raw||[])){
    let matched=llMatchText(d.text),count=Math.max(1,+d.count||1);
    if(!matched){
      let rawText=String(d.text||"").trim(),k=norm(rawText)||rawText.toLowerCase(),cur=unmatched.get(k);
      if(!cur){cur={text:rawText||"(texto vazio)",count:0};unmatched.set(k,cur)}
      cur.count+=count;
      continue
    }
    let canonical=matched.options[0].label.replace(/\d+$/,"").trim()||matched.variant,k=norm(canonical),cur=map.get(k);
    if(!cur){cur={name:title(canonical),norm:k,count:0,existing:owned.has(k),uiLikely:LL_UI_WORDS.has(k),options:matched.options,raw:[],matchType:matched.matchType};map.set(k,cur)}
    cur.count+=count;
    if(d.text&&!cur.raw.includes(d.text))cur.raw.push(d.text)
  }
  S.librasLabUnmatched=[...unmatched.values()].sort((a,b)=>b.count-a.count||a.text.localeCompare(b.text,"pt-BR"));
  return[...map.values()].sort((a,b)=>(a.uiLikely-b.uiLikely)||(b.count-a.count)||a.name.localeCompare(b.name,"pt-BR"))
}
async function llFirstPlayable(list,{timeout=4500,max=24,batch=6}={}){
  let items=dedupeCandidates(list).slice(0,max),known=items.find(x=>x.youtube||knownMediaHealth(x.url)===true);
  if(known)return known;
  for(let i=0;i<items.length;i+=batch){
    let chunk=items.slice(i,i+batch),checks=await Promise.all(chunk.map(async x=>x.youtube?true:probeVideo(x.url,timeout))),hit=chunk.find((x,j)=>checks[j]);
    if(hit)return hit
  }
  return null
}
function elapsedText(ts){if(!ts)return"";let sec=Math.max(0,Math.floor((Date.now()-ts)/1000));if(sec<60)return sec+" s";let min=Math.floor(sec/60);if(min<60)return min+" min";let h=Math.floor(min/60),m=min%60;return h+" h"+(m?" "+m+" min":"")}
async function refreshLibrasLab(){applyEditionUI();let warn=$("#ll-not-native"),statusCard=$("#ll-status-card"),sessionCard=$("#ll-session-card"),detCard=$("#ll-detected-card");if(!warn||!statusCard)return;let native=personalEditionAvailable();warn.classList.toggle("hidden",native);statusCard.classList.toggle("hidden",!native);sessionCard.classList.toggle("hidden",!native);if(!native){detCard.classList.add("hidden");return}let st=getNativeState()||{},enabled=!!st.accessibilityEnabled,live=!!st.captureEnabled;$("#ll-accessibility-status").textContent=enabled?"Conectado ao LibrasLab":"Permissão ainda não ativada";$("#ll-accessibility-dot").className="status-dot "+(live?"live":enabled?"ok":"");$("#ll-enable").classList.toggle("hidden",enabled);$("#ll-start").classList.toggle("hidden",live);$("#ll-start").disabled=!enabled;$("#ll-open").classList.toggle("hidden",!live);$("#ll-stop").classList.toggle("hidden",!live);let raw=Array.isArray(st.detections)?st.detections:[];$("#ll-session-info").textContent=live?"🟣 Captura ativa · "+raw.length+" sinais identificados · "+elapsedText(st.sessionStartedAt):raw.length?"Aula finalizada. Revise os sinais detectados abaixo.":"Inicie a captura antes de abrir o LibrasLab.";if(!raw.length){detCard.classList.add("hidden");S.librasLabCandidates=[];S.librasLabUnmatched=[];return}detCard.classList.remove("hidden");$("#ll-detected-list").innerHTML='<div class="ll-progress">🔎 Conferindo '+raw.length+' candidatos capturados com o catálogo do Studio…</div>';let candidates=await buildLibrasLabCandidates(raw),unmatched=S.librasLabUnmatched||[];S.librasLabCandidates=candidates;$("#ll-detected-title").textContent=candidates.length+" "+(candidates.length===1?"sinal":"sinais");$("#ll-detected-meta").textContent=raw.length+" candidatos capturados · "+candidates.length+" sinais reconhecidos"+(unmatched.length?" · "+unmatched.length+" pendente(s) de identificação":"")+".";let recognized=candidates.map((c,i)=>'<label class="ll-candidate '+(c.existing?"existing":"")+'"><input type="checkbox" data-ll-index="'+i+'" '+(c.uiLikely?"":"checked")+'><div><b>'+esc(c.name)+'</b><small>'+c.count+' ocorrência(s) · '+(c.existing?"já está na biblioteca":"novo sinal")+(c.matchType==="trecho"?" · reconhecido dentro do texto capturado":"")+(c.uiLikely?" · pode ser botão da interface":"")+'</small></div>'+(c.existing?'<span class="ll-badge">já salvo</span>':"")+'</label>').join(""),pending=unmatched.length?'<div class="ll-unmatched-wrap"><div class="ll-unmatched-title"><b>Pendentes de identificação</b><small>Estes textos não foram descartados. Confira o que o LibrasLab capturou.</small></div>'+unmatched.map(x=>'<div class="ll-unmatched"><b>'+esc(x.text)+'</b><small>'+x.count+' ocorrência(s) · ainda sem correspondência segura</small></div>').join("")+'</div>':"";$("#ll-detected-list").innerHTML=recognized+pending||('<div class="ll-empty">Ainda não reconheci nomes de sinais nesta sessão. Continue a aula e toque em ↻ Atualizar.</div>')}
function llOpenAccessibility(){if(nativeBridgeAvailable())window.LibrasNative.openAccessibilitySettings()}
function llStart(){if(!nativeBridgeAvailable())return;if(!(getNativeState()?.accessibilityEnabled))return llOpenAccessibility();window.LibrasNative.startLibrasLabCapture();refreshLibrasLab();setTimeout(()=>window.LibrasNative.openLibrasLab(),180)}
function llOpen(){if(nativeBridgeAvailable())window.LibrasNative.openLibrasLab()}
function llStop(){if(!nativeBridgeAvailable())return;window.LibrasNative.stopLibrasLabCapture();setTimeout(refreshLibrasLab,120)}
function llClear(){if(!nativeBridgeAvailable())return;window.LibrasNative.stopLibrasLabCapture();window.LibrasNative.clearLibrasLabDetections();S.librasLabCandidates=[];S.librasLabUnmatched=[];refreshLibrasLab()}
async function llImport(){
  if(!S.session)return toast("Entre na sua conta primeiro.");
  let selected=$$("[data-ll-index]:checked").map(x=>S.librasLabCandidates[+x.dataset.llIndex]).filter(Boolean);
  if(!selected.length)return toast("Selecione pelo menos um sinal.");
  $("#ll-import").disabled=true;
  let added=0,due=0,failed=[],refreshedCatalog=false;
  try{
    for(let c of selected){
      let existing=S.signs.find(x=>x.norm===c.norm);
      if(existing){
        let r=S.reviews.find(x=>x.norm===c.norm);
        if(r){let now=new Date().toISOString(),patch={due_at:now,updated_at:now};let{error}=await sb.from("review_state").update(patch).eq("user_id",S.session.user.id).eq("norm",c.norm);if(error)throw error;Object.assign(r,patch);due++}
        continue
      }
      let options=dedupeCandidates(c.options||[]),picked=await llFirstPlayable(options,{timeout:4500,max:24,batch:6});
      if(!picked){
        if(!refreshedCatalog){S.catalog=null;await catalog();refreshedCatalog=true}
        options=dedupeCandidates([...options,...opts(c.name),...allMediaCandidates(c.name)]);
        picked=await llFirstPlayable(options,{timeout:5000,max:30,batch:6})
      }
      if(!picked){failed.push(c.name);continue}
      await save(c.name,picked,null,"libraslab_bridge");added++
    }
    if(nativeBridgeAvailable()){
      window.LibrasNative.stopLibrasLabCapture();
      if(!failed.length)window.LibrasNative.clearLibrasLabDetections()
    }
    cache();render();
    let msg="✅ "+added+" novo(s) sinal(is) adicionado(s)";
    if(due)msg+=" · "+due+" revisão(ões) trazidas para agora";
    if(failed.length)msg+=" · sem vídeo: "+failed.slice(0,3).join(", ")+(failed.length>3?"…":"");
    toast(msg);
    S.librasLabCandidates=[];
    if(!failed.length)S.librasLabUnmatched=[];
    refreshLibrasLab()
  }catch(e){console.error(e);toast("Não consegui concluir toda a importação. Os itens da sessão foram preservados.")}
  finally{$("#ll-import").disabled=false}
}
window.addEventListener("librasstudio-native-resume",()=>refreshLibrasLab());
window.addEventListener("focus",()=>{if($("#libraslab")?.classList.contains("active"))refreshLibrasLab()});
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&$("#libraslab")?.classList.contains("active"))refreshLibrasLab()});
function installNativeTouchNavigation(){
  if(!IS_NATIVE_ANDROID||window.__lsNativeTouchNav)return;
  window.__lsNativeTouchNav=true;
  document.addEventListener("pointerup",e=>{
    if(e.pointerType&&e.pointerType!=="touch")return;
    const nav=e.target.closest("nav [data-view]");
    if(nav){
      e.preventDefault();
      const v=nav.dataset.view;
      nav.dataset.nativeTapAt=String(Date.now());
      if(v==="more"){
        closeProfileMenu();
        const sheet=$("#more");
        if(sheet)sheet.classList.remove("hidden");
      }else go(v);
      return;
    }
    const quick=e.target.closest("[data-go]");
    if(quick){
      e.preventDefault();
      go(quick.dataset.go);
    }
  },{passive:false});
}
function installDelegatedNavigation(){
  if(window.__lsDelegatedNav)return;window.__lsDelegatedNav=true;
  document.addEventListener("click",e=>{
    const cat=e.target.closest("[data-home-cat],[data-cat]");
    if(cat){e.preventDefault();let name=cat.dataset.homeCat||cat.dataset.cat;if(cat.dataset.homeCat){go("explore");setTimeout(()=>openCat(name),0)}else openCat(name);return}
    const nav=e.target.closest("[data-go]");
    if(nav){e.preventDefault();go(nav.dataset.go)}
  });
}
function wire(){$("#auth-form").onsubmit=async e=>{e.preventDefault();let{error}=await sb.auth.signInWithPassword({email:$("#email").value,password:$("#password").value});$("#auth-status").textContent=error?error.message:""};$("#signup").onclick=async()=>{let{error}=await sb.auth.signUp({email:$("#email").value,password:$("#password").value});$("#auth-status").textContent=error?error.message:"Conta criada. Confira seu e-mail."};$("#logout").onclick=logoutUser;$("#profile-logout").onclick=logoutUser;$("#profile-menu-toggle").onclick=e=>{e.stopPropagation();toggleProfileMenu()};$("#profile-change-photo").onclick=()=>$("#profile-photo-input").click();$("#profile-photo-input").onchange=e=>changeProfilePhoto(e.target.files?.[0]);$("#profile-remove-photo").onclick=()=>{saveProfilePrefs({photo:""});toast("Foto removida.")};$("#profile-edit-name").onclick=openProfileNameEditor;$$("[data-profile-go]").forEach(b=>b.onclick=()=>{closeProfileMenu();go(b.dataset.profileGo)});document.addEventListener("click",e=>{let menu=$("#profile-menu"),toggle=$("#profile-menu-toggle");if(menu&&!menu.classList.contains("hidden")&&!menu.contains(e.target)&&!toggle?.contains(e.target))closeProfileMenu()});document.addEventListener("keydown",e=>{if(e.key==="Escape")closeProfileMenu()});$("#sync").onclick=$("#sync-now").onclick=openSyncChoice;let ms=$("#mobile-sync-now");if(ms)ms.onclick=()=>{$("#more")?.classList.add("hidden");openSyncChoice()};$("#app-update").onclick=$("#update-now").onclick=forceAppUpdate;let mu=$("#mobile-update-now");if(mu)mu.onclick=forceAppUpdate;$("#ll-enable").onclick=llOpenAccessibility;$("#ll-start").onclick=llStart;$("#ll-open").onclick=llOpen;$("#ll-stop").onclick=llStop;$("#ll-refresh").onclick=refreshLibrasLab;$("#ll-import").onclick=llImport;$("#ll-clear").onclick=llClear;$$("nav [data-view]").forEach(b=>b.onclick=()=>{if(IS_NATIVE_ANDROID&&Date.now()-Number(b.dataset.nativeTapAt||0)<700)return;if(b.dataset.view==="more"){closeProfileMenu();let s=$("#more");if(s)s.classList.toggle("hidden")}else go(b.dataset.view)});$$(".side-nav [data-view]").forEach(b=>b.onclick=()=>go(b.dataset.view));$$("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));$$("[data-mode]").forEach(b=>b.onclick=()=>{$$("[data-mode]").forEach(x=>x.classList.toggle("active",x===b));$("#sign-box").classList.toggle("hidden",b.dataset.mode!=="sign");$("#phrase-box").classList.toggle("hidden",b.dataset.mode!=="phrase")});$("#create-search").onclick=createSign;$("#variants").onclick=variants;$("#video-file").onchange=e=>uploadVideo(e.target.files[0]);$("#phrase-search")&&($("#phrase-search").onclick=phrase);$("#phrase-available")&&($("#phrase-available").onclick=showAvailablePhrases);$("#explore-search").oninput=exploreCats;$("#global-search").onkeydown=e=>{if(e.key==="Enter"){let q=e.currentTarget.value.trim();go("explore");$("#create-name").value=q;$("#create-name").focus()}};$("#study-search").oninput=study;$("#library-search").oninput=library;$("#library-cat").onchange=library;$("#new-cat")&&($("#new-cat").onclick=newCat);$("#library-refresh")&&($("#library-refresh").onclick=openSyncChoice);$("#review-start").onclick=()=>{S.queue=queue();S.i=0;$("#review-setup").classList.add("hidden");card()};$("#reveal").onclick=()=>{let media=$("#review-media");media.classList.remove("hidden");$("#ratings").classList.remove("hidden");$("#reveal").classList.add("hidden");let first=media.querySelector("video");if(first){try{first.currentTime=0}catch{}let p=first.play();if(p?.catch)p.catch(e=>console.warn("autoplay revisão",e))}};$$("[data-rate]").forEach(b=>b.onclick=()=>rate(b.dataset.rate));$("#again-session").onclick=()=>{$("#review-setup").classList.remove("hidden");$("#review-done").classList.add("hidden")};$("#close-modal").onclick=()=>$("#modal").classList.add("hidden");$("#modal").onclick=e=>{if(e.target===$("#modal"))$("#modal").classList.add("hidden")}}
async function revalidateSessionAndSync(){if(!navigator.onLine){localStatus("📴 offline · dados locais");return}try{let{data:{session},error}=await sb.auth.getSession();if(error)throw error;if(session){S.session=session;rememberSession(session);cached(session.user.id);authUI();render();localStatus("☁️ online · sincronização manual")}else if(S.session?.offline){forgetRememberedUser();S.session=null;authUI()}}catch(e){console.warn("revalidar sessão",e);if(S.session)localStatus("📴 dados locais")}}
async function init(){
  let remembered=rememberedUser();
  if(remembered){
    S.session=offlineSession(remembered);
    cached(remembered.id);
    authUI();render();
    localStatus(navigator.onLine?"☁️ dados locais":"📴 offline · dados locais");
  }
  sb=supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:!IS_NATIVE_ANDROID,storage:window.localStorage}});
  wire();let phraseBadge=$("#phrase-count-badge"),phraseTotal=window.LIBRAS_PHRASE_LIBRARY?.total||((window.LIBRAS_PHRASE_DATA||[]).length||0);if(phraseBadge)phraseBadge.textContent=phraseTotal.toLocaleString("pt-BR")+" frases";installDelegatedNavigation();if(window.LSHydrateIcons)LSHydrateIcons(document);installNativeTouchNavigation();applyEditionUI();
  sb.auth.onAuthStateChange((event,session)=>{
    if(session){
      S.session=session;rememberSession(session);cached(session.user.id);authUI();
      if(navigator.onLine)localStatus("☁️ online · sincronização manual");
    }else if(event==="SIGNED_OUT"){
      forgetRememberedUser();S.session=null;S.signs=[];S.cats=[];S.reviews=[];S.study=[];authUI();
    }
  });
  try{
    let{data:{session},error}=await sb.auth.getSession();
    if(error)throw error;
    if(session){S.session=session;rememberSession(session);cached(session.user.id);authUI();render();if(navigator.onLine)localStatus("☁️ online · sincronização manual");else localStatus("📴 offline · dados locais")}
    else if(!remembered){S.session=null;authUI()}
    else if(navigator.onLine){forgetRememberedUser();S.session=null;authUI()}
  }catch(e){console.warn("sessão inicial",e);if(S.session){cached();render();localStatus("📴 dados locais")}else authUI()}
  window.addEventListener("online",()=>{localStatus("☁️ online · sincronização manual");revalidateSessionAndSync()});
  window.addEventListener("offline",()=>{if(S.session){cached();render();localStatus("📴 offline · dados locais")}});
  setupServiceWorker();
  checkAppUpdate();
}init();