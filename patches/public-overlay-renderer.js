// --- JSON overlay public renderer ---
const __POW=430,__POH=932;
const __legacyPublicOverlays=(data,key)=>{
  const p=data.pages?.[key]||{},st=p.styles||{};
  const mk=(id,type,name,text,style,extra={})=>({id,type,name,text,style:{x:0,y:0,width:120,height:40,zIndex:10,opacity:1,rotate:0,fontFamily:'Pretendard, "Noto Sans KR", system-ui, sans-serif',fontSize:14,fontWeight:400,color:'#4b2f20',textAlign:'left',letterSpacing:-.02,lineHeight:1.4,backgroundColor:'transparent',borderColor:'transparent',borderWidth:0,borderRadius:0,padding:0,...style},...extra});
  if(key==='intro')return [
    mk('intro_label','text','상단 문구',p.label||'',{...st.label,x:34,y:66,width:362,height:24,zIndex:20}),
    mk('intro_title','text','대문 제목',p.title||'',{...st.title,x:34,y:102,width:362,height:96,zIndex:21}),
    mk('intro_body','text','대문 설명',p.body||'',{...st.body,x:45,y:212,width:340,height:70,zIndex:21})
  ];
  const y=872;
  return [
    mk('main_label','text','상단 문구',p.label||'',{...st.label,x:35,y:36,width:360,height:22,zIndex:20}),
    mk('main_title1','text','제목 1',p.title1||'',{...st.title1,x:35,y:61,width:360,height:44,zIndex:21}),
    mk('main_title2','text','제목 2',p.title2||'',{...st.title2,x:35,y:103,width:360,height:44,zIndex:22}),
    mk('main_hint_bg','box','하단 안내 배경','',{x:57,y,width:316,height:38,zIndex:25,backgroundColor:'rgba(250,241,224,.86)',borderColor:'rgba(88,52,31,.16)',borderWidth:1,borderRadius:20}),
    mk('main_hint_lead','text','하단 안내 번호',p.hintLead||'',{...st.hintLead,x:75,y:y+11,width:72,height:16,zIndex:26,textAlign:'left'}),
    mk('main_hint_text','text','하단 안내 문구',p.hintText||'',{...st.hintText,x:142,y:y+11,width:222,height:16,zIndex:26,textAlign:'left'}),
    mk('hotspot_1','hotspot','01 클릭 영역','',{x:135,y:179,width:106,height:48,zIndex:40},{href:'exhibition.html'}),
    mk('hotspot_2','hotspot','02 클릭 영역','',{x:291,y:230,width:127,height:48,zIndex:40},{href:'media-awards.html'}),
    mk('hotspot_3','hotspot','03 클릭 영역','',{x:304,y:480,width:116,height:49,zIndex:40},{href:'performance.html'})
  ];
};
function __pubOverlays(data,key){const p=data.pages?.[key]||{};return Array.isArray(p.overlays)?p.overlays:__legacyPublicOverlays(data,key)}
function __pubOvCss(o){
  const s=o.style||{};
  if(s.hidden)return 'display:none';
  return `position:absolute;left:${n(s.x,0)}px;top:${n(s.y,0)}px;width:${Math.max(8,n(s.width,120))}px;${o.type==='text'?'min-height':'height'}:${Math.max(8,n(s.height,40))}px;z-index:${n(s.zIndex,10)};opacity:${Math.max(0,Math.min(1,n(s.opacity,1)))};transform:rotate(${n(s.rotate,0)}deg);font-family:${safeCss(s.fontFamily||'inherit')};font-size:${n(s.fontSize,14)}px;font-weight:${n(s.fontWeight,400)};color:${safeCss(s.color||'#38271e')};text-align:${safeCss(s.textAlign||'left')};letter-spacing:${n(s.letterSpacing,-.02)}em;line-height:${n(s.lineHeight,1.4)};background:${safeCss(s.backgroundColor||'transparent')};border:${n(s.borderWidth,0)}px solid ${safeCss(s.borderColor||'transparent')};border-radius:${n(s.borderRadius,0)}px;padding:${n(s.padding,0)}px;box-sizing:border-box;overflow:${o.type==='text'?'visible':'hidden'};`;
}
function __pubOvHtml(o){
  const style=styleAttr(__pubOvCss(o));
  if(o.type==='image')return `<div class="public-json-overlay image"${style}><img src="${esc(o.src||'')}" alt="" style="width:100%;height:100%;object-fit:${safeCss(o.style?.objectFit||'cover')};object-position:${n(o.style?.objectPositionX,50)}% ${n(o.style?.objectPositionY,50)}%;display:block"></div>`;
  if(o.type==='box')return `<div class="public-json-overlay box"${style}></div>`;
  if(o.type==='button')return `<a class="public-json-overlay button" href="${esc(o.href||'#')}"${style}>${esc(o.text||'')}</a>`;
  if(o.type==='hotspot')return `<a class="public-json-overlay hotspot-json" href="${esc(o.href||'#')}"${style} aria-label="${esc(o.name||'이동')}"></a>`;
  return `<div class="public-json-overlay text"${style}>${br(o.text||'')}</div>`;
}
function __pubOvLayer(data,key,klass=''){return `<div class="public-json-overlay-layer ${klass}">${__pubOverlays(data,key).map(__pubOvHtml).join('')}</div>`}

mainHtml=function(data){
  const p=data.pages.main,intro=data.pages.intro||{};
  return `<div id="intro" ${previewMode?'style="display:none"':''}><div class="leaflet-frame intro-frame" id="introFrame">
    <img class="full" src="${esc(intro.image||p.gateImage)}" alt=""><div class="opening" style="background-image:url('${esc(p.image)}')"></div>
    <img class="door-slice door-left" src="${esc(intro.image||p.gateImage)}" alt=""><img class="door-slice door-right" src="${esc(intro.image||p.gateImage)}" alt="">${__pubOvLayer(data,'intro','intro-overlays')}</div></div>
    <main class="viewport"><div class="leaflet-frame main-frame"><img class="main-fill-bg" src="${esc(p.image)}" alt="" aria-hidden="true"><img class="full main-fit-foreground" src="${esc(p.image)}" alt="무계원 전시 안내도">${__pubOvLayer(data,'main','main-overlays')}</div></main>`;
};

const __detailHtmlBaseOv=detailHtml;
detailHtml=function(data,key){
  const html=__detailHtmlBaseOv(data,key), ovs=__pubOverlays(data,key);
  if(!ovs.length)return html;
  return html.replace('<div class="detail-shell">',`<div class="detail-shell"><div class="public-json-overlay-layer detail-overlays">${ovs.map(__pubOvHtml).join('')}</div>`);
};

const __pubOverlayStyle=document.createElement('style');
__pubOverlayStyle.textContent=`
.main-frame>.main-fill-bg{position:absolute;inset:-18px;width:calc(100% + 36px);height:calc(100% + 36px);object-fit:cover!important;object-position:50% 50%;filter:blur(16px) brightness(.96);transform:scale(1.03);z-index:0;pointer-events:none}
.main-frame>.main-fit-foreground{position:absolute;inset:0;z-index:1;object-fit:contain!important;object-position:50% 50%!important}
.public-json-overlay-layer{position:absolute;inset:0;width:430px;height:932px;z-index:6;pointer-events:none}
.public-json-overlay{pointer-events:none;text-decoration:none;white-space:pre-wrap;word-break:keep-all}
.public-json-overlay.button,.public-json-overlay.hotspot-json{pointer-events:auto}
.public-json-overlay.button{display:flex!important;align-items:center;justify-content:center}
.detail-shell{position:relative}.detail-overlays{height:100%;min-height:932px;z-index:20}
`;
document.head.appendChild(__pubOverlayStyle);

render=function(data){
  const root=document.getElementById('app');if(!root)return;
  root.innerHTML=page==='main'?mainHtml(data):detailHtml(data,page);
  if(page==='main'&&!previewMode){
    const f=document.getElementById('introFrame'),i=document.getElementById('intro');if(!f||!i)return;
    const imgs=[...f.querySelectorAll('img')];
    Promise.all(imgs.map(img=>img.decode?img.decode().catch(()=>null):Promise.resolve())).then(()=>{
      requestAnimationFrame(()=>requestAnimationFrame(()=>f.classList.add('is-opening')));
      setTimeout(()=>i.classList.add('is-done'),2450);
      setTimeout(()=>i.remove(),3200);
    });
  }
};
window.YoonRenderPage=render;
// --- end JSON overlay public renderer ---
