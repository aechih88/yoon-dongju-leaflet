// --- Image transform controls patch ---
const __imgClamp=(v,min,max)=>Math.max(min,Math.min(max,num(v,min)));
const __imgTransformCss=(s={})=>{
  const zoom=__imgClamp(s.imageZoom??1,.25,5);
  const sx=__imgClamp(s.imageScaleX??1,.2,4)*(s.flipX?-1:1);
  const sy=__imgClamp(s.imageScaleY??1,.2,4)*(s.flipY?-1:1);
  const tx=num(s.imageOffsetX,0),ty=num(s.imageOffsetY,0),rot=num(s.imageRotate,0);
  return `transform-origin:50% 50%;transform:translate(${tx}px,${ty}px) rotate(${rot}deg) scale(${zoom*sx},${zoom*sy});will-change:transform;`;
};
const __imageVisualCssBase=imageVisualCss;
imageVisualCss=function(s={}){return `${__imageVisualCssBase(s)};${__imgTransformCss(s)}`};

const __imgStyle=document.createElement('style');
__imgStyle.textContent=`
.image-node{overflow:hidden}
.resize-handle{right:5px!important;bottom:5px!important}
.img-transform-handle{position:absolute;z-index:1005;width:24px;height:24px;border-radius:8px;border:1px solid rgba(255,255,255,.9);background:#4f46e5;color:#fff;display:grid;place-items:center;font-size:12px;font-weight:900;box-shadow:0 2px 10px rgba(0,0,0,.28);user-select:none;touch-action:none}
.img-transform-handle.zoom{right:6px;top:6px;cursor:ew-resize}
.img-transform-handle.x{right:6px;top:50%;transform:translateY(-50%);cursor:ew-resize}
.img-transform-handle.y{left:50%;bottom:6px;transform:translateX(-50%);cursor:ns-resize}
.img-transform-badge{position:absolute;left:6px;top:6px;z-index:1004;padding:5px 7px;border-radius:7px;background:rgba(17,24,39,.82);color:#fff;font-size:9px;pointer-events:none}
.image-node>img{transform-origin:50% 50%}
.image-delete-btn{width:100%;height:36px;margin-top:9px;border:1px solid #efb1b1;border-radius:8px;background:#fff6f6;color:#b42318;font-size:11px;font-weight:800;cursor:pointer}
.image-delete-btn:hover{background:#fff0f0}
.image-node img[src=""]{display:none!important}
.hero-block>.image-node:has(>img[src=""]){position:absolute;inset:0;min-height:460px;background:#eee7dd}
.visual.image-node:has(>img[src=""]){min-height:170px;background:#f3eee8;border:1px dashed #ccbbaa;display:grid;place-items:center}
.hero-block>.image-node:has(>img[src=""])::before,.visual.image-node:has(>img[src=""])::before{content:'이미지 없음 · 클릭해서 새 이미지 업로드';position:absolute;inset:0;display:grid;place-items:center;color:#8a7565;font-size:11px;font-weight:700;z-index:2}
`;
document.head.appendChild(__imgStyle);

const __wirePropsBase=wireProps;
wireProps=function(){
  __wirePropsBase();
  props.querySelectorAll('[data-img-prop]').forEach(el=>el.addEventListener('input',()=>{
    if(!selected?.stylePath)return;
    const p=el.dataset.imgProp;
    let v=num(el.value);
    if(p==='imageZoom')v=__imgClamp(v,.25,5);
    if(p==='imageScaleX'||p==='imageScaleY')v=__imgClamp(v,.2,4);
    if(p==='imageRotate')v=Math.max(-180,Math.min(180,v));
    if(p==='imageOffsetX'||p==='imageOffsetY')v=Math.max(-800,Math.min(800,v));
    const st=get(selected.stylePath)||{};st[p]=v;set(selected.stylePath,st);renderSelectedStyle();
    const out=props.querySelector(`[data-img-out="${p}"]`);if(out)out.textContent=(p==='imageZoom'||p==='imageScaleX'||p==='imageScaleY')?`${Math.round(v*100)}%`:`${Math.round(v)}${p==='imageRotate'?'°':'px'}`;
  }));
  props.querySelectorAll('[data-img-action]').forEach(btn=>btn.addEventListener('click',()=>{
    if(!selected?.stylePath)return;
    const a=btn.dataset.imgAction,st=get(selected.stylePath)||{};
    if(a==='flipX')st.flipX=!st.flipX;
    if(a==='flipY')st.flipY=!st.flipY;
    if(a==='resetTransform')Object.assign(st,{imageZoom:1,imageScaleX:1,imageScaleY:1,imageOffsetX:0,imageOffsetY:0,imageRotate:0,flipX:false,flipY:false,objectPositionX:50,objectPositionY:50});
    set(selected.stylePath,st);renderSelectedStyle();renderProps();
  }));
};

imageProps=function(){
  const s=selected.stylePath?get(selected.stylePath)||{}:{};
  const hasImage=!!(selected?.path&&get(selected.path));
  const canDeleteImage=current!=='intro'&&current!=='main';
  propTitle.textContent='이미지';
  const zoom=__imgClamp(s.imageZoom??1,.25,5),sx=__imgClamp(s.imageScaleX??1,.2,4),sy=__imgClamp(s.imageScaleY??1,.2,4),ix=num(s.imageOffsetX,0),iy=num(s.imageOffsetY,0),rot=num(s.imageRotate,0);
  props.innerHTML=`<div class="prop-group"><label class="upload-box">새 이미지 업로드<input id="imageFile" type="file" accept="image/*" hidden></label>${hasImage&&canDeleteImage?'<button type="button" class="image-delete-btn" id="deleteImageBtn">이미지 삭제</button>':''}</div>${selected.stylePath?`
  <div class="prop-group"><div class="prop-label">이미지 내부 변형</div>
    <div class="free-tip">이미지 드래그 = 초점 이동 · Alt+휠 = 확대/축소 · 보라색 ↔/↕ 핸들 = 가로/세로 늘리기 · ⤢ 핸들 = 확대/축소</div>
    ${control('확대 / 축소',`<div style="display:grid;grid-template-columns:1fr 54px;gap:8px;align-items:center"><input type="range" min="0.25" max="5" step="0.01" data-img-prop="imageZoom" value="${zoom}"><span data-img-out="imageZoom" style="font-size:10px;text-align:right">${Math.round(zoom*100)}%</span></div>`)}
    <div class="prop-row">${control('가로 늘리기',`<input type="number" min="0.2" max="4" step="0.01" data-img-prop="imageScaleX" value="${sx}">`)}${control('세로 늘리기',`<input type="number" min="0.2" max="4" step="0.01" data-img-prop="imageScaleY" value="${sy}">`)}</div>
    <div class="prop-row">${control('내부 X',`<input type="number" min="-800" max="800" step="1" data-img-prop="imageOffsetX" value="${ix}">`)}${control('내부 Y',`<input type="number" min="-800" max="800" step="1" data-img-prop="imageOffsetY" value="${iy}">`)}</div>
    ${control('회전',`<div style="display:grid;grid-template-columns:1fr 54px;gap:8px;align-items:center"><input type="range" min="-180" max="180" step="1" data-img-prop="imageRotate" value="${rot}"><span data-img-out="imageRotate" style="font-size:10px;text-align:right">${Math.round(rot)}°</span></div>`)}
    <div class="stack-actions"><button data-img-action="flipX" class="${s.flipX?'active':''}">좌우 반전</button><button data-img-action="flipY" class="${s.flipY?'active':''}">상하 반전</button><button data-img-action="resetTransform" style="grid-column:1/-1">이미지 변형 초기화</button></div>
  </div>
  <div class="prop-group"><div class="prop-label">크롭 / 표시</div>
    ${control('비율',`<select data-prop="aspectRatio">${['auto','16/9','16/10','4/3','1/1','3/4','9/16'].map(v=>`<option value="${v}" ${s.aspectRatio===v?'selected':''}>${v==='auto'?'자동':v}</option>`).join('')}</select>`)}
    ${control('맞춤',`<select data-prop="objectFit"><option value="cover" ${s.objectFit==='cover'?'selected':''}>채우기(크롭)</option><option value="contain" ${s.objectFit==='contain'?'selected':''}>전체 보기(여백)</option><option value="fill" ${s.objectFit==='fill'?'selected':''}>전체 맞춤(잘림 없음)</option></select>`)}
    <button class="tiny-btn" id="resetImageFocus" type="button">초점 가운데로</button>
    <div class="prop-row">${control('가로 초점',`<input type="range" min="0" max="100" data-prop="objectPositionX" value="${num(s.objectPositionX,50)}">`)}${control('세로 초점',`<input type="range" min="0" max="100" data-prop="objectPositionY" value="${num(s.objectPositionY,50)}">`)}</div>
    <div class="prop-row">${control('모서리',`<input type="number" data-prop="borderRadius" value="${num(s.borderRadius,0)}">`)}${control('투명도',`<input type="number" min="0" max="1" step="0.05" data-prop="opacity" value="${num(s.opacity,1)}">`)}</div>
  </div>${layoutControls(s,selected.el?.classList.contains('main-canvas'))}`:''}`;
  wireProps();
  $('#imageFile')?.addEventListener('change',async e=>{const f=e.target.files?.[0];if(f)await uploadFor(selected.el,f)});
  $('#deleteImageBtn')?.addEventListener('click',()=>{
    if(!selected?.path||current==='intro'||current==='main')return;
    if(!confirm('이 이미지를 삭제할까요? 저장하면 공개 페이지에서도 사라집니다.'))return;
    pushHistory();
    const keepStyle=selected.stylePath;
    set(selected.path,'');
    selected=null;
    renderAll();
    const emptySlot=canvas.querySelector('[data-image-style="'+CSS.escape(keepStyle)+'"]');
    if(emptySlot) selectNode('image',emptySlot,emptySlot.dataset.imagePath||'',keepStyle,emptySlot.closest('[data-section]')?.dataset.section||'');
    toast('이미지를 삭제했어요. 저장하면 공개 페이지에도 반영됩니다.');
  });
  $('#resetImageFocus')?.addEventListener('click',()=>{const st=get(selected.stylePath)||{};st.objectPositionX=50;st.objectPositionY=50;set(selected.stylePath,st);renderSelectedStyle();renderProps();});
};

function __syncImgControl(prop,val){
  const el=props.querySelector(`[data-img-prop="${prop}"]`);if(el)el.value=val;
  const out=props.querySelector(`[data-img-out="${prop}"]`);if(out)out.textContent=(prop==='imageZoom'||prop==='imageScaleX'||prop==='imageScaleY')?`${Math.round(val*100)}%`:`${Math.round(val)}${prop==='imageRotate'?'°':'px'}`;
}
function __updateImgStyle(stylePath,prop,val){const st=get(stylePath)||{};st[prop]=val;set(stylePath,st,false);renderSelectedStyle();__syncImgControl(prop,val);}
function __attachInternalHandles(el,stylePath){
  el.querySelectorAll('.img-transform-handle,.img-transform-badge').forEach(x=>x.remove());
  const st=get(stylePath)||{};
  const badge=document.createElement('div');badge.className='img-transform-badge';badge.textContent=`${Math.round(__imgClamp(st.imageZoom??1,.25,5)*100)}%`;el.appendChild(badge);
  const make=(cls,label,title,onMove)=>{const h=document.createElement('div');h.className=`img-transform-handle ${cls}`;h.textContent=label;h.title=title;el.appendChild(h);let state=null;h.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();const s=get(stylePath)||{};state={x:e.clientX,y:e.clientY,zoom:__imgClamp(s.imageZoom??1,.25,5),sx:__imgClamp(s.imageScaleX??1,.2,4),sy:__imgClamp(s.imageScaleY??1,.2,4)};try{h.setPointerCapture(e.pointerId)}catch{}});h.addEventListener('pointermove',e=>{if(!state)return;e.preventDefault();e.stopPropagation();onMove(e,state,badge)});const end=()=>{if(!state)return;state=null;pushHistory();markDirty(false);renderProps()};h.addEventListener('pointerup',end);h.addEventListener('pointercancel',end)};
  make('zoom','⤢','좌우로 드래그해서 내부 이미지 확대/축소',(e,s,b)=>{const v=__imgClamp(s.zoom+(e.clientX-s.x)/180,.25,5);__updateImgStyle(stylePath,'imageZoom',Math.round(v*100)/100);b.textContent=`${Math.round(v*100)}%`});
  make('x','↔','좌우로 드래그해서 이미지 가로 비율 변경',(e,s)=>{const v=__imgClamp(s.sx+(e.clientX-s.x)/140,.2,4);__updateImgStyle(stylePath,'imageScaleX',Math.round(v*100)/100)});
  make('y','↕','위아래로 드래그해서 이미지 세로 비율 변경',(e,s)=>{const v=__imgClamp(s.sy+(e.clientY-s.y)/140,.2,4);__updateImgStyle(stylePath,'imageScaleY',Math.round(v*100)/100)});
}

const __selectNodeBase=selectNode;
selectNode=function(type,el,path='',stylePath='',sectionKey=''){
  __selectNodeBase(type,el,path,stylePath,sectionKey);
  if(type==='image'&&el&&stylePath)__attachInternalHandles(el,stylePath);
};

const __enableImagePanBase=enableImagePan;
enableImagePan=function(el,stylePath){
  __enableImagePanBase(el,stylePath);
  if(!stylePath)return;const img=el.querySelector('img');if(!img)return;
  img.addEventListener('wheel',e=>{
    if(!e.altKey)return;
    e.preventDefault();e.stopPropagation();
    const st=get(stylePath)||{};const cur=__imgClamp(st.imageZoom??1,.25,5);const next=__imgClamp(cur+(e.deltaY<0?.08:-.08),.25,5);st.imageZoom=Math.round(next*100)/100;set(stylePath,st,false);if(selected?.stylePath===stylePath){renderSelectedStyle();__syncImgControl('imageZoom',st.imageZoom);const badge=el.querySelector('.img-transform-badge');if(badge)badge.textContent=`${Math.round(st.imageZoom*100)}%`;}pushHistory();markDirty(false);
  },{passive:false});
};
// --- end image transform controls patch ---


/* --- remote sync: DB -> builder when there are no unsaved local edits --- */
let __yoonRemoteSyncSig = null;
let __yoonRemoteSyncBusy = false;
async function __yoonSyncFromRemote(){
  if(__yoonRemoteSyncBusy || dirty || document.hidden || !YoonStore?.isSupabaseConfigured) return;
  __yoonRemoteSyncBusy = true;
  try{
    const remote = await YoonStore.loadRemoteOnly();
    const sig = JSON.stringify(remote);
    if(__yoonRemoteSyncSig===null){ __yoonRemoteSyncSig=sig; return; }
    if(sig!==__yoonRemoteSyncSig){
      draft = YoonStore.normalize(remote);
      __yoonRemoteSyncSig = sig;
      selected = null;
      history = [];
      historyIndex = -1;
      pushHistory();
      renderAll();
      saveState.textContent='Supabase 최신 상태';
      saveState.className='save-state ok';
      toast('공개 데이터 변경사항을 불러왔어요.');
    }
  }catch(e){
    console.warn('remote sync failed',e);
  }finally{
    __yoonRemoteSyncBusy=false;
  }
}
setTimeout(__yoonSyncFromRemote,1800);
setInterval(__yoonSyncFromRemote,5000);
window.addEventListener('focus',()=>setTimeout(__yoonSyncFromRemote,120));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(__yoonSyncFromRemote,120)});


/* --- detail image selection/deletion hardening --- */
canvas.addEventListener('click',e=>{
  const node=e.target.closest?.('[data-image-path]');
  if(!node||!canvas.contains(node))return;
  if(current==='intro'||current==='main')return;
  e.stopPropagation();
  const path=node.dataset.imagePath||'';
  const stylePath=node.dataset.imageStyle||'';
  const sectionKey=node.closest('[data-section]')?.dataset.section||'';
  selectNode('image',node,path,stylePath,sectionKey);
},true);

const __detailImageDeleteCss=document.createElement('style');
__detailImageDeleteCss.textContent=`
.image-node[data-image-path] img[src=""]{display:none!important}
.image-node[data-image-path]:has(img[src=""]){min-height:150px!important;background:#f5efe8!important;border:1px dashed #cdb9a6!important;position:relative!important}
.image-node[data-image-path]:has(img[src=""])::before{
  content:'이미지 없음 · 클릭해서 새 이미지 업로드';
  position:absolute;inset:0;display:grid;place-items:center;
  color:#866f5d;font-size:11px;font-weight:700;z-index:4;pointer-events:none
}
`;
document.head.appendChild(__detailImageDeleteCss);

/* --- direct detail image delete controls --- */
const __detailDeleteStyle=document.createElement('style');
__detailDeleteStyle.textContent=`
.detail-image-delete-x{
  position:absolute;right:8px;top:8px;z-index:1100;
  width:28px;height:28px;border-radius:8px;border:1px solid #efb1b1;
  background:#fff6f6;color:#b42318;font-size:18px;font-weight:800;
  display:none;align-items:center;justify-content:center;
  box-shadow:0 2px 10px rgba(0,0,0,.12);cursor:pointer
}
.image-node.selected-node>.detail-image-delete-x{display:flex}
`;
document.head.appendChild(__detailDeleteStyle);

function __deleteCurrentDetailImage(){
  if(!selected?.path||selected.type!=='image'||current==='intro'||current==='main')return;
  if(!get(selected.path)){toast('이미지가 이미 비어 있어요.');return}
  if(!confirm('이 이미지를 삭제할까요? 저장하면 공개 페이지에서도 사라집니다.'))return;
  const path=selected.path,stylePath=selected.stylePath,sectionKey=selected.sectionKey||'';
  pushHistory();
  set(path,'');
  selected=null;
  renderAll();
  const slot=canvas.querySelector(`[data-image-path="${CSS.escape(path)}"]`);
  if(slot) selectNode('image',slot,path,stylePath,sectionKey);
  toast('이미지를 삭제했어요. 저장하면 공개 페이지에서도 사라집니다.');
}
function __attachDetailDeleteX(el){
  if(!el||current==='intro'||current==='main')return;
  el.querySelector('.detail-image-delete-x')?.remove();
  const b=document.createElement('button');
  b.type='button';b.className='detail-image-delete-x';b.textContent='×';b.title='이미지 삭제';
  b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();__deleteCurrentDetailImage()});
  el.appendChild(b);
}
const __selectNodeDeleteBase=selectNode;
selectNode=function(type,el,path='',stylePath='',sectionKey=''){
  __selectNodeDeleteBase(type,el,path,stylePath,sectionKey);
  if(type==='image'&&el&&current!=='intro'&&current!=='main')__attachDetailDeleteX(el);
};
document.addEventListener('keydown',e=>{
  if(selected?.type!=='image'||current==='intro'||current==='main')return;
  const tag=(e.target?.tagName||'').toLowerCase();
  if(tag==='input'||tag==='textarea'||e.target?.isContentEditable)return;
  if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();e.stopImmediatePropagation();__deleteCurrentDetailImage()}
},true);
/* --- end direct detail image delete controls --- */

/* --- end detail image selection/deletion hardening --- */
