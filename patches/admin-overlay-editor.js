// --- JSON overlay editor for intro/main fixed 430x932 canvases ---
const __OVERLAY_W=430, __OVERLAY_H=932;
const __ovId=()=>`ov_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;
const __ovStyle=(extra={})=>({x:34,y:80,width:362,height:50,zIndex:10,opacity:1,rotate:0,fontFamily:'Pretendard, "Noto Sans KR", system-ui, sans-serif',fontSize:18,fontWeight:600,color:'#4b2f20',textAlign:'center',letterSpacing:-.02,lineHeight:1.35,backgroundColor:'transparent',borderColor:'transparent',borderWidth:0,borderRadius:0,padding:0,...extra});
function __legacyOverlays(key){
  const p=draft.pages[key]||{}, st=p.styles||{};
  if(key==='intro') return [
    {id:'intro_label',type:'text',name:'상단 문구',text:p.label||'',style:__ovStyle({...st.label,x:34,y:66,width:362,height:24,zIndex:20})},
    {id:'intro_title',type:'text',name:'대문 제목',text:p.title||'',style:__ovStyle({...st.title,x:34,y:102,width:362,height:96,zIndex:21})},
    {id:'intro_body',type:'text',name:'대문 설명',text:p.body||'',style:__ovStyle({...st.body,x:45,y:212,width:340,height:70,zIndex:21})}
  ];
  const hintY=872;
  return [
    {id:'main_label',type:'text',name:'상단 문구',text:p.label||'',style:__ovStyle({...st.label,x:35,y:36,width:360,height:22,zIndex:20})},
    {id:'main_title1',type:'text',name:'제목 1',text:p.title1||'',style:__ovStyle({...st.title1,x:35,y:61,width:360,height:44,zIndex:21})},
    {id:'main_title2',type:'text',name:'제목 2',text:p.title2||'',style:__ovStyle({...st.title2,x:35,y:103,width:360,height:44,zIndex:22})},
    {id:'main_hint_bg',type:'box',name:'하단 안내 배경',style:__ovStyle({x:57,y:hintY,width:316,height:38,zIndex:25,backgroundColor:'rgba(250,241,224,.86)',borderColor:'rgba(88,52,31,.16)',borderWidth:1,borderRadius:20})},
    {id:'main_hint_lead',type:'text',name:'하단 안내 번호',text:p.hintLead||'',style:__ovStyle({...st.hintLead,x:75,y:hintY+11,width:72,height:16,zIndex:26,textAlign:'left'})},
    {id:'main_hint_text',type:'text',name:'하단 안내 문구',text:p.hintText||'',style:__ovStyle({...st.hintText,x:142,y:hintY+11,width:222,height:16,zIndex:26,textAlign:'left'})},
    {id:'hotspot_1',type:'hotspot',name:'01 클릭 영역',href:'exhibition.html',style:__ovStyle({x:135,y:179,width:106,height:48,zIndex:40,backgroundColor:'transparent'})},
    {id:'hotspot_2',type:'hotspot',name:'02 클릭 영역',href:'media-awards.html',style:__ovStyle({x:291,y:230,width:127,height:48,zIndex:40,backgroundColor:'transparent'})},
    {id:'hotspot_3',type:'hotspot',name:'03 클릭 영역',href:'performance.html',style:__ovStyle({x:304,y:480,width:116,height:49,zIndex:40,backgroundColor:'transparent'})}
  ];
}
function __ensureOverlays(key){
  const p=draft.pages[key]; if(!p) return [];
  if(!Array.isArray(p.overlays)) p.overlays=(key==='intro'||key==='main')?__legacyOverlays(key):[];
  return p.overlays;
}
function __ovAt(i){return __ensureOverlays(current)[i];}
function __ovCss(o,editor=true){
  const s=o.style||{};
  const hidden=s.hidden&&!editor;
  return `position:absolute;left:${num(s.x,0)}px;top:${num(s.y,0)}px;width:${Math.max(8,num(s.width,120))}px;${o.type==='text'?'min-height':'height'}:${Math.max(8,num(s.height,40))}px;z-index:${num(s.zIndex,10)};opacity:${Math.max(0,Math.min(1,num(s.opacity,1)))};transform:rotate(${num(s.rotate,0)}deg);display:${hidden?'none':'block'};font-family:${s.fontFamily||'inherit'};font-size:${num(s.fontSize,14)}px;font-weight:${num(s.fontWeight,400)};color:${s.color||'#38271e'};text-align:${s.textAlign||'left'};letter-spacing:${num(s.letterSpacing,-.02)}em;line-height:${num(s.lineHeight,1.5)};background:${s.backgroundColor||'transparent'};border:${num(s.borderWidth,0)}px solid ${s.borderColor||'transparent'};border-radius:${num(s.borderRadius,0)}px;padding:${num(s.padding,0)}px;overflow:${o.type==='text'?'visible':'hidden'};`;
}
function __ovHtml(o,i){
  const cls=`json-overlay json-overlay-${o.type}${o.style?.hidden?' is-hidden':''}`;
  const common=`class="${cls}" data-overlay-index="${i}" data-overlay-id="${esc(o.id)}" style="${esc(__ovCss(o,true))}"`;
  const move='<button type="button" class="ov-move" title="드래그 이동">⋮⋮</button>';
  const resize='<button type="button" class="ov-resize" title="드래그 크기조절"></button>';
  const del='<button type="button" class="ov-delete" title="삭제">×</button>';
  if(o.type==='image') return `<div ${common}>${move}${del}<img src="${esc(assetUrl(o.src||''))}" alt="" style="width:100%;height:100%;object-fit:${esc(o.style?.objectFit||'cover')};object-position:${num(o.style?.objectPositionX,50)}% ${num(o.style?.objectPositionY,50)}%;display:block">${resize}</div>`;
  if(o.type==='box') return `<div ${common}>${move}${del}${resize}</div>`;
  if(o.type==='button') return `<div ${common}>${move}${del}<div class="ov-content" contenteditable="true" spellcheck="false">${esc(o.text||'버튼')}</div>${resize}</div>`;
  if(o.type==='hotspot') return `<div ${common}>${move}${del}<span class="ov-hotspot-label">${esc(o.name||'클릭 영역')}</span>${resize}</div>`;
  return `<div ${common}>${move}${del}<div class="ov-content" contenteditable="true" spellcheck="false">${esc(o.text||'텍스트')}</div>${resize}</div>`;
}
function __overlayLayerHtml(key){return `<div class="json-overlay-layer" data-overlay-page="${key}">${__ensureOverlays(key).map(__ovHtml).join('')}</div>`}

const __ovStyleTag=document.createElement('style');
__ovStyleTag.textContent=`
.overlay-page-canvas{position:relative;width:430px;height:932px;min-height:932px;overflow:hidden;background:#e9d6bc}
.overlay-main-fill{position:absolute;inset:-18px;width:466px;height:968px;object-fit:cover;object-position:50% 50%;filter:blur(16px) brightness(.96);transform:scale(1.03);z-index:0;pointer-events:none}
.overlay-page-bg{position:absolute;inset:0;width:430px;height:932px;overflow:hidden;z-index:1}
.overlay-page-bg>img{width:100%;height:100%;object-fit:cover;display:block}
.json-overlay-layer{position:absolute;inset:0;z-index:3;pointer-events:none}
.json-overlay{pointer-events:auto;box-sizing:border-box}
.json-overlay:hover{outline:1px dashed rgba(79,70,229,.65);outline-offset:1px}
.json-overlay.is-hidden{opacity:.32!important;outline:1px dashed #dc2626!important}
.json-overlay-text .ov-content,.json-overlay-button .ov-content{width:100%;min-height:100%;outline:none;white-space:pre-wrap;word-break:keep-all}
.json-overlay-button{display:flex!important;align-items:center;justify-content:center}
.json-overlay-hotspot{border:1px dashed rgba(37,99,235,.7)!important;background:rgba(37,99,235,.08)!important}
.ov-hotspot-label{font-size:9px;color:#1d4ed8;background:rgba(255,255,255,.86);padding:3px 5px;border-radius:5px;position:absolute;left:4px;top:4px}
.ov-move,.ov-delete{position:absolute;top:-12px;height:22px;border:1px solid #ddd;background:#fff;z-index:30;font-size:10px;display:none;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.12)}
.ov-move{left:-1px;width:28px;border-radius:7px;cursor:move}.ov-delete{right:-1px;width:24px;border-radius:7px;color:#dc2626;cursor:pointer}
.ov-resize{position:absolute;right:-6px;bottom:-6px;width:14px;height:14px;border-radius:4px;border:2px solid #fff;background:#4f46e5;box-shadow:0 1px 6px rgba(0,0,0,.25);cursor:nwse-resize;display:none;z-index:31}
.json-overlay.selected-node .ov-move,.json-overlay.selected-node .ov-delete,.json-overlay.selected-node .ov-resize{display:flex}
.overlay-prop-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.overlay-delete-btn{width:100%;height:36px;border:1px solid #efb1b1;border-radius:8px;background:#fff6f6;color:#b42318;font-weight:800;font-size:11px;cursor:pointer}
`;
document.head.appendChild(__ovStyleTag);

renderIntro=function(){
  const p=draft.pages.intro;
  canvas.innerHTML=`<div class="overlay-page-canvas"><div class="overlay-page-bg image-node" data-image-path="pages.intro.image" data-image-style="pages.intro.imageStyle"><img src="${esc(assetUrl(p.image))}" style="${esc(imageVisualCss(p.imageStyle||{}))}"></div>${__overlayLayerHtml('intro')}</div>`;
};
renderMain=function(){
  const p=draft.pages.main;
  canvas.innerHTML=`<div class="overlay-page-canvas"><img class="overlay-main-fill" src="${esc(assetUrl(p.image))}" alt=""><div class="overlay-page-bg image-node" data-image-path="pages.main.image" data-image-style="pages.main.imageStyle"><img src="${esc(assetUrl(p.image))}" style="${esc(imageVisualCss(p.imageStyle||{}))}"></div>${__overlayLayerHtml('main')}</div>`;
};

const __renderDetailBaseOv=renderDetail;
renderDetail=function(){__renderDetailBaseOv(); if(__ensureOverlays(current).length){canvas.insertAdjacentHTML('beforeend',__overlayLayerHtml(current));}};

const __collectLayersBaseOv=collectLayers;
collectLayers=function(){
  const ovs=__ensureOverlays(current);
  if(current==='intro'||current==='main'){
    const bgPath=`pages.${current}.imageStyle`;
    return [{type:'image',path:`pages.${current}.image`,stylePath:bgPath,sectionKey:'',label:current==='intro'?'대문 배경 이미지':'메인 배경 이미지',z:0},...ovs.map((o,i)=>({type:'overlay',path:`pages.${current}.overlays.${i}`,stylePath:`pages.${current}.overlays.${i}.style`,sectionKey:'',label:o.name||`${o.type} ${i+1}`,z:num(o.style?.zIndex,10),overlayIndex:i,hidden:!!o.style?.hidden}))];
  }
  const base=__collectLayersBaseOv();
  return base.concat(ovs.map((o,i)=>({type:'overlay',path:`pages.${current}.overlays.${i}`,stylePath:`pages.${current}.overlays.${i}.style`,sectionKey:'',label:o.name||`${o.type} ${i+1}`,z:num(o.style?.zIndex,10),overlayIndex:i,hidden:!!o.style?.hidden})));
};
renderLayers=function(){
  layerItems=collectLayers();
  if(!layerItems.length){layerList.innerHTML='<div class="layer-item"><span>—</span><span>레이어 없음</span></div>';return}
  layerList.innerHTML=layerItems.map((it,i)=>{const active=(selected?.type==='overlay'&&it.type==='overlay'&&selected.overlayIndex===it.overlayIndex)||(selected?.stylePath&&selected.stylePath===it.stylePath&&selected.path===it.path);const icon=it.type==='overlay'?(it.path&&__ovAt(it.overlayIndex)?.type==='image'?'▧':__ovAt(it.overlayIndex)?.type==='button'?'▭':__ovAt(it.overlayIndex)?.type==='box'?'□':'T'):it.type==='text'?'T':it.type==='image'?'▧':'▱';return `<div class="layer-item ${active?'active':''} ${it.hidden?'is-hidden':''}" data-stack-index="${i}" draggable="true"><span class="grip">⋮⋮</span><span class="stack-icon">${icon}</span><span>${esc(it.label)}</span><span class="stack-badge">${it.hidden?'숨김 · ':''}z${it.z}</span></div>`}).join('');
};

function __selectOverlay(i,el){
  $$('.resize-handle,.img-transform-handle,.img-transform-badge').forEach(x=>x.remove());
  $$('.selected-node').forEach(x=>x.classList.remove('selected-node'));
  if(el)el.classList.add('selected-node');
  selected={type:'overlay',el,overlayIndex:i,path:`pages.${current}.overlays.${i}`,stylePath:`pages.${current}.overlays.${i}.style`,sectionKey:''};
  renderLayers();renderProps();
}
const __selectByPathBaseOv=selectByPath;
selectByPath=function(type,path,stylePath,sectionKey){
  if(type==='overlay'){
    const m=String(path||'').match(/\.overlays\.(\d+)$/); const i=m?num(m[1],-1):-1;
    if(i>=0){const el=canvas.querySelector(`[data-overlay-index="${i}"]`);return __selectOverlay(i,el)}
  }
  return __selectByPathBaseOv(type,path,stylePath,sectionKey);
};

function __overlayProps(){
  const o=__ovAt(selected.overlayIndex); if(!o){selected=null;return renderProps()}
  const s=o.style||{}; propTitle.textContent=o.name||'오버레이 요소';
  const textControls=(o.type==='text'||o.type==='button')?`<div class="prop-group">${control('내용',`<textarea data-ov-field="text">${esc(o.text||'')}</textarea>`)}${control('글씨체',`<select data-ov-style="fontFamily">${fontOptions.map(([v,n])=>`<option value="${esc(v)}" ${s.fontFamily===v?'selected':''}>${n}</option>`).join('')}</select>`)}<div class="prop-row">${control('크기',`<input type="number" data-ov-style="fontSize" value="${num(s.fontSize,16)}">`)}${control('두께',`<select data-ov-style="fontWeight">${[300,400,500,600,700,800,900].map(v=>`<option value="${v}" ${num(s.fontWeight,400)===v?'selected':''}>${v}</option>`).join('')}</select>`)}</div>${control('색상',`<input type="color" data-ov-style="color" value="${/^#[0-9a-f]{6}$/i.test(s.color||'')?s.color:'#4b2f20'}">`)}</div>`:'';
  const imageControls=o.type==='image'?`<div class="prop-group"><label class="upload-box">오버레이 이미지 업로드<input id="overlayImageFile" type="file" accept="image/*" hidden></label>${control('맞춤',`<select data-ov-style="objectFit"><option value="cover">채우기</option><option value="contain" ${s.objectFit==='contain'?'selected':''}>전체 보기</option></select>`)}</div>`:'';
  const linkControls=(o.type==='button'||o.type==='hotspot')?`<div class="prop-group">${control('링크',`<input data-ov-field="href" value="${esc(o.href||'#')}">`)}</div>`:'';
  props.innerHTML=`${textControls}${imageControls}${linkControls}<div class="prop-group"><div class="prop-label">위치 / 크기</div><div class="overlay-prop-grid">${control('X',`<input type="number" data-ov-style="x" value="${num(s.x,0)}">`)}${control('Y',`<input type="number" data-ov-style="y" value="${num(s.y,0)}">`)}${control('너비',`<input type="number" min="8" data-ov-style="width" value="${num(s.width,120)}">`)}${control('높이',`<input type="number" min="8" data-ov-style="height" value="${num(s.height,40)}">`)}${control('레이어 z',`<input type="number" data-ov-style="zIndex" value="${num(s.zIndex,10)}">`)}${control('회전',`<input type="number" min="-180" max="180" data-ov-style="rotate" value="${num(s.rotate,0)}">`)}</div></div><div class="prop-group"><div class="prop-label">박스 스타일</div><div class="overlay-prop-grid">${control('배경색',`<input type="text" data-ov-style="backgroundColor" value="${esc(s.backgroundColor||'transparent')}">`)}${control('모서리',`<input type="number" data-ov-style="borderRadius" value="${num(s.borderRadius,0)}">`)}${control('투명도',`<input type="number" min="0" max="1" step="0.05" data-ov-style="opacity" value="${num(s.opacity,1)}">`)}${control('패딩',`<input type="number" min="0" data-ov-style="padding" value="${num(s.padding,0)}">`)}</div></div><div class="prop-group danger-zone"><button type="button" class="overlay-delete-btn" id="deleteOverlayBtn">요소 완전 삭제</button></div>`;
  props.querySelectorAll('[data-ov-style]').forEach(el=>el.addEventListener('input',()=>{const oo=__ovAt(selected.overlayIndex);if(!oo)return;let v=el.value;if(['x','y','width','height','zIndex','rotate','fontSize','fontWeight','borderRadius','opacity','padding'].includes(el.dataset.ovStyle))v=num(v);oo.style=oo.style||{};oo.style[el.dataset.ovStyle]=v;markDirty(false);__applyOverlayEl(oo,selected.el);renderLayers()}));
  props.querySelectorAll('[data-ov-field]').forEach(el=>el.addEventListener('input',()=>{const oo=__ovAt(selected.overlayIndex);if(!oo)return;oo[el.dataset.ovField]=el.value;if(el.dataset.ovField==='text'&&selected.el?.querySelector('.ov-content'))selected.el.querySelector('.ov-content').innerText=el.value;markDirty(false)}));
  $('#overlayImageFile')?.addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;const oo=__ovAt(selected.overlayIndex);oo.src=await YoonStore.fileToDataUrl(f);markDirty();const keep=selected.overlayIndex;renderAll();__selectOverlay(keep,canvas.querySelector(`[data-overlay-index="${keep}"]`));});
  $('#deleteOverlayBtn')?.addEventListener('click',()=>__deleteOverlay(selected.overlayIndex));
}
const __renderPropsBaseOv=renderProps;
renderProps=function(){if(selected?.type==='overlay')return __overlayProps();return __renderPropsBaseOv();};
function __applyOverlayEl(o,el){if(!o||!el)return;el.style.cssText=__ovCss(o,true);if(o.type==='image'){const img=el.querySelector('img');if(img){img.style.objectFit=o.style?.objectFit||'cover';}}}
const __renderSelectedStyleBaseOv=renderSelectedStyle;
renderSelectedStyle=function(){if(selected?.type==='overlay'){const o=__ovAt(selected.overlayIndex);return __applyOverlayEl(o,selected.el)}return __renderSelectedStyleBaseOv();};

function __deleteOverlay(i){const arr=__ensureOverlays(current);if(i<0||i>=arr.length)return;arr.splice(i,1);selected=null;markDirty();renderAll();toast('요소를 완전 삭제했어요.');}
function __addOverlay(type){
  const arr=__ensureOverlays(current),base={id:__ovId(),name:'새 요소',type,text:'새 텍스트',style:__ovStyle({x:55,y:120+arr.length*12,width:320,height:60,zIndex:60+arr.length})};
  if(type==='image'){base.name='새 이미지';base.src=draft.pages[current]?.image||draft.pages.main.image;base.style={...base.style,height:200,objectFit:'cover',fontSize:0};}
  if(type==='button'){base.name='새 버튼';base.text='버튼';base.href='#';base.style={...base.style,x:115,width:200,height:48,backgroundColor:'#4d3020',color:'#fff',borderRadius:24};}
  if(type==='spacer'){base.name='새 박스';base.type='box';base.text='';base.style={...base.style,height:100,backgroundColor:'rgba(255,255,255,.75)',borderRadius:12};}
  arr.push(base);markDirty();renderAll();const i=arr.length-1;__selectOverlay(i,canvas.querySelector(`[data-overlay-index="${i}"]`));
}
const __addBlockBaseOv=addBlock;
addBlock=function(type){if(current==='intro'||current==='main')return __addOverlay(type);return __addOverlay(type);};

function __wireOverlayCanvas(){
  canvas.querySelectorAll('.json-overlay').forEach(el=>{
    const i=num(el.dataset.overlayIndex,-1);if(i<0)return;
    el.addEventListener('click',e=>{e.stopPropagation();__selectOverlay(i,el)});
    el.querySelector('.ov-content')?.addEventListener('input',e=>{const o=__ovAt(i);if(o){o.text=e.currentTarget.innerText;markDirty(false);}});
    el.querySelector('.ov-delete')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();__deleteOverlay(i)});
    const move=el.querySelector('.ov-move');if(move){let st=null;move.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();__selectOverlay(i,el);const o=__ovAt(i);st={x:e.clientX,y:e.clientY,ox:num(o.style.x,0),oy:num(o.style.y,0)};try{move.setPointerCapture(e.pointerId)}catch{}});move.addEventListener('pointermove',e=>{if(!st)return;const o=__ovAt(i);o.style.x=Math.round((st.ox+(e.clientX-st.x)/zoom)*10)/10;o.style.y=Math.round((st.oy+(e.clientY-st.y)/zoom)*10)/10;__applyOverlayEl(o,el)});const end=()=>{if(!st)return;st=null;pushHistory();markDirty(false);renderProps();renderLayers()};move.addEventListener('pointerup',end);move.addEventListener('pointercancel',end)}
    const res=el.querySelector('.ov-resize');if(res){let st=null;res.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();__selectOverlay(i,el);const o=__ovAt(i);st={x:e.clientX,y:e.clientY,w:num(o.style.width,120),h:num(o.style.height,40)};try{res.setPointerCapture(e.pointerId)}catch{}});res.addEventListener('pointermove',e=>{if(!st)return;const o=__ovAt(i);o.style.width=Math.max(8,Math.round((st.w+(e.clientX-st.x)/zoom)*10)/10);o.style.height=Math.max(8,Math.round((st.h+(e.clientY-st.y)/zoom)*10)/10);__applyOverlayEl(o,el)});const end=()=>{if(!st)return;st=null;pushHistory();markDirty(false);renderProps();renderLayers()};res.addEventListener('pointerup',end);res.addEventListener('pointercancel',end)}
  });
}
const __renderAllBaseOv=renderAll;
renderAll=function(){__ensureOverlays(current);__renderAllBaseOv();__wireOverlayCanvas();};

document.addEventListener('keydown',e=>{
  if(selected?.type!=='overlay')return;
  const tag=(e.target?.tagName||'').toLowerCase();if(tag==='input'||tag==='textarea'||e.target?.isContentEditable)return;
  if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();e.stopImmediatePropagation();__deleteOverlay(selected.overlayIndex)}
},true);

// Update labels: on every page these create free JSON overlays.
document.querySelector('.add-section .panel-label')?.replaceChildren(document.createTextNode('요소 추가'));
const __addLabels={text:'텍스트',image:'이미지',button:'버튼',spacer:'박스'};
document.querySelectorAll('[data-add]').forEach(b=>{const sp=b.querySelector('span');if(sp)sp.textContent=__addLabels[b.dataset.add]||sp.textContent});
// --- end JSON overlay editor ---