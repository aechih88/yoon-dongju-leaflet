// --- Public image transform patch ---
const __pubClamp=(v,min,max)=>Math.max(min,Math.min(max,n(v,min)));
const __pubTransform=(s={},withLayout=true)=>{
  const z=__pubClamp(s.imageZoom??1,.25,5),sx=__pubClamp(s.imageScaleX??1,.2,4)*(s.flipX?-1:1),sy=__pubClamp(s.imageScaleY??1,.2,4)*(s.flipY?-1:1);
  const parts=[];
  if(withLayout&&s.freePosition)parts.push(`translate(${n(s.offsetX,0)}px,${n(s.offsetY,0)}px)`);
  parts.push(`translate(${n(s.imageOffsetX,0)}px,${n(s.imageOffsetY,0)}px)`,`rotate(${n(s.imageRotate,0)}deg)`,`scale(${z*sx},${z*sy})`);
  return parts.join(' ');
};
imageCss=function(s={}){
  const ratio=s.aspectRatio&&s.aspectRatio!=='auto'?`aspect-ratio:${safeCss(s.aspectRatio)}`:'';
  const layout=s.freePosition?`position:relative;z-index:${n(s.zIndex,3)};width:${max(10,min(180,n(s.widthPct,100)))}%;max-width:none`:'';
  return [ratio,`object-fit:${safeCss(s.objectFit||'cover')}`,`object-position:${n(s.objectPositionX,50)}% ${n(s.objectPositionY,50)}%`,`border-radius:${n(s.borderRadius,0)}px`,`opacity:${Math.max(0,Math.min(1,n(s.opacity,1)))}`,layout,'transform-origin:50% 50%',`transform:${__pubTransform(s,true)}`].filter(Boolean).join(';');
};
const __renderImageBase=render;
render=function(data){
  __renderImageBase(data);
  if(page==='main'){
    const p=data.pages?.main||{},intro=data.pages?.intro||{};
    const mainImg=document.querySelector('.main-frame>img.full');
    if(mainImg){const s=p.imageStyle||{};mainImg.style.objectFit=s.objectFit||'cover';mainImg.style.objectPosition=`${n(s.objectPositionX,50)}% ${n(s.objectPositionY,50)}%`;mainImg.style.transformOrigin='50% 50%';mainImg.style.transform=__pubTransform(s,false);mainImg.style.opacity=Math.max(0,Math.min(1,n(s.opacity,1)));}
    const introImg=document.querySelector('#intro .intro-frame>img.full');
    if(introImg){const s=intro.imageStyle||{};introImg.style.objectFit=s.objectFit||'cover';introImg.style.objectPosition=`${n(s.objectPositionX,50)}% ${n(s.objectPositionY,50)}%`;}
  }
};
window.YoonRenderPage=render;
// --- end public image transform patch ---
