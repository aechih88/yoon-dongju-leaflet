(function(){
  const page = document.body.dataset.page;
  const previewMode = new URLSearchParams(location.search).has('preview');
  const esc = v => String(v ?? '').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const br = v => esc(v).replace(/\n/g,'<br>');
  const n=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
  const safeCss=v=>String(v??'').replace(/[;{}<>]/g,'');
  const styleAttr=css=>css?` style="${esc(css)}"`:'';

  function textCss(s={}){
    return [
      s.fontFamily&&`font-family:${safeCss(s.fontFamily)}`,
      `font-size:${n(s.fontSize,13)}px`,
      `font-weight:${Math.min(900,Math.max(100,n(s.fontWeight,400)))}`,
      s.color&&`color:${safeCss(s.color)}`,
      s.textAlign&&`text-align:${safeCss(s.textAlign)}`,
      `letter-spacing:${n(s.letterSpacing,-0.02)}em`,
      `line-height:${n(s.lineHeight,1.6)}`,
      s.fontStyle&&`font-style:${safeCss(s.fontStyle)}`,
      s.textDecoration&&`text-decoration:${safeCss(s.textDecoration)}`
    ].filter(Boolean).join(';');
  }
  function sectionCss(s={}){
    const shadow={none:'none',soft:'0 10px 30px rgba(60,40,25,.08)',medium:'0 16px 40px rgba(60,40,25,.14)',strong:'0 22px 58px rgba(45,28,17,.22)'}[s.shadow]||'none';
    return [
      s.backgroundColor&&`background:${safeCss(s.backgroundColor)}`,
      `padding-top:${n(s.paddingTop,0)}px`,
      `padding-bottom:${n(s.paddingBottom,34)}px`,
      `padding-left:${n(s.paddingX,0)}px`,
      `padding-right:${n(s.paddingX,0)}px`,
      `margin-top:${n(s.marginTop,0)}px`,
      `margin-bottom:${n(s.marginBottom,34)}px`,
      `border-radius:${n(s.borderRadius,0)}px`,
      `border:${n(s.borderWidth,0)}px solid ${safeCss(s.borderColor||'#d7c4b2')}`,
      `box-shadow:${shadow}`
    ].filter(Boolean).join(';');
  }
  function imageCss(s={}){
    const ratio=s.aspectRatio&&s.aspectRatio!=='auto'?`aspect-ratio:${safeCss(s.aspectRatio)}`:'';
    return [
      ratio,
      `object-fit:${safeCss(s.objectFit||'cover')}`,
      `object-position:${n(s.objectPositionX,50)}% ${n(s.objectPositionY,50)}%`,
      `border-radius:${n(s.borderRadius,0)}px`,
      `opacity:${Math.max(0,Math.min(1,n(s.opacity,1)))}`
    ].filter(Boolean).join(';');
  }
  function factCss(){return '';}

  function mainHtml(data){
    const p=data.pages.main, st=p.styles||{}, intro=data.pages.intro||{}, ist=intro.styles||{};
    return `<div id="intro" ${previewMode?'style="display:none"':''}><div class="leaflet-frame intro-frame" id="introFrame">
      <img class="full" src="${esc(intro.image||p.gateImage)}" alt=""><div class="opening" style="background-image:url('${esc(p.image)}')"></div>
      <img class="door-slice door-left" src="${esc(intro.image||p.gateImage)}" alt=""><img class="door-slice door-right" src="${esc(intro.image||p.gateImage)}" alt=""><div class="intro-vignette"></div>
      <div class="intro-copy"><span${styleAttr(textCss(ist.label))}>${esc(intro.label||'')}</span><h2${styleAttr(textCss(ist.title))}>${br(intro.title||'')}</h2><p${styleAttr(textCss(ist.body))}>${esc(intro.body||'')}</p></div></div></div>
      <main class="viewport"><div class="leaflet-frame main-frame"><img class="full" src="${esc(p.image)}" alt="무계원 전시 안내도">
      <header class="main-heading"><span${styleAttr(textCss(st.label))}>${esc(p.label)}</span><h1><span${styleAttr(textCss(st.title1))}>${esc(p.title1)}</span><b${styleAttr(textCss(st.title2))}>${esc(p.title2)}</b></h1></header>
      <a class="hotspot hotspot-1" href="exhibition.html"></a><a class="hotspot hotspot-2" href="media-awards.html"></a><a class="hotspot hotspot-3" href="performance.html"></a>
      <div class="tap-hint"><span${styleAttr(textCss(st.hintLead))}>${esc(p.hintLead)}</span><em${styleAttr(textCss(st.hintText))}>${esc(p.hintText)}</em></div></div></main>`;
  }

  function factsHtml(items){ return `<div class="fact-grid">${(items||[]).map(x=>`<div class="fact"><small>${esc(x.label)}</small><strong>${esc(x.value)}</strong></div>`).join('')}</div>`; }

  function heroHtml(d){
    const st=d.styles||{};
    const image=d.image?`<img class="detail-hero-image" src="${esc(d.image)}"${styleAttr(imageCss(d.imageStyle))} alt="">`:'';
    return `<section class="detail-hero"${styleAttr(sectionCss(d.style))}>${image}<div class="detail-hero-copy"><div class="num"${styleAttr(textCss(st.kicker))}>${esc(d.kicker)}</div><h1${styleAttr(textCss(st.title))}>${br(d.title)}</h1><p${styleAttr(textCss(st.body))}>${esc(d.body)}</p></div></section>`;
  }
  function textSection(d,extra=''){
    const st=d.styles||{};
    return `<section class="detail-section"${styleAttr(sectionCss(d.style))}><div class="detail-kicker"${styleAttr(textCss(st.kicker))}>${esc(d.kicker)}</div><h2${styleAttr(textCss(st.title))}>${br(d.title)}</h2><p${styleAttr(textCss(st.body))}>${esc(d.body)}</p>${extra}</section>`;
  }
  function galleryHtml(d){
    const st=d.styles||{};
    const visual=d.image?`<figure class="visual-card"><img src="${esc(d.image)}"${styleAttr(imageCss(d.imageStyle))} alt=""><figcaption${styleAttr(textCss(st.caption))}>${esc(d.caption)}</figcaption></figure>`:'';
    return `<section class="detail-section"${styleAttr(sectionCss(d.style))}><div class="detail-kicker"${styleAttr(textCss(st.kicker))}>${esc(d.kicker)}</div><h2${styleAttr(textCss(st.title))}>${br(d.title)}</h2><p${styleAttr(textCss(st.body))}>${esc(d.body)}</p>${visual}</section>`;
  }
  function awardsHtml(d){
    const st=d.styles||{};
    return `<section class="detail-section"${styleAttr(sectionCss(d.style))}><div class="detail-kicker"${styleAttr(textCss(st.kicker))}>${esc(d.kicker)}</div><h2${styleAttr(textCss(st.title))}>${br(d.title)}</h2><div class="award-list">${(d.items||[]).map(x=>`<div class="award-row"><b${styleAttr(textCss(st.prize))}>${esc(x.prize)}</b><div><strong${styleAttr(textCss(st.itemTitle))}>${esc(x.title)}</strong><span${styleAttr(textCss(st.author))}>${esc(x.author)}</span></div></div>`).join('')}</div></section>`;
  }
  function stepsHtml(d){
    const st=d.styles||{};
    return `<section class="detail-section"${styleAttr(sectionCss(d.style))}><div class="detail-kicker"${styleAttr(textCss(st.kicker))}>${esc(d.kicker)}</div><h2${styleAttr(textCss(st.title))}>${br(d.title)}</h2><div class="step-list">${(d.items||[]).map(x=>`<div class="step-row"><b${styleAttr(textCss(st.num))}>${esc(x.num)}</b><div><strong${styleAttr(textCss(st.itemTitle))}>${esc(x.title)}</strong><span${styleAttr(textCss(st.desc))}>${esc(x.desc)}</span></div></div>`).join('')}</div><p class="detail-note"${styleAttr(textCss(st.note))}>${esc(d.note)}</p></section>`;
  }
  function customHtml(d){
    if(!d)return '';
    const st=d.styles||{};
    if(d.type==='text') return textSection(d);
    if(d.type==='image') return `<section class="detail-section custom-image"${styleAttr(sectionCss(d.style))}>${d.kicker?`<div class="detail-kicker"${styleAttr(textCss(st.kicker))}>${esc(d.kicker)}</div>`:''}${d.title?`<h2${styleAttr(textCss(st.title))}>${br(d.title)}</h2>`:''}${d.image?`<figure class="visual-card"><img src="${esc(d.image)}"${styleAttr(imageCss(d.imageStyle))} alt=""><figcaption${styleAttr(textCss(st.caption))}>${esc(d.caption||'')}</figcaption></figure>`:''}</section>`;
    if(d.type==='button') return `<section class="detail-section custom-button"${styleAttr(sectionCss(d.style))}>${d.kicker?`<div class="detail-kicker"${styleAttr(textCss(st.kicker))}>${esc(d.kicker)}</div>`:''}${d.title?`<h2${styleAttr(textCss(st.title))}>${br(d.title)}</h2>`:''}${d.body?`<p${styleAttr(textCss(st.body))}>${esc(d.body)}</p>`:''}<a class="landing-btn" href="${esc(d.url||'#')}"${styleAttr(textCss(st.button))}>${esc(d.label||'자세히 보기')}</a></section>`;
    if(d.type==='spacer') return `<div class="custom-spacer" style="height:${n(d.height,40)}px"></div>`;
    return '';
  }

  const sectionTemplates = {
    hero: heroHtml,
    about: d => textSection(d,factsHtml(d.facts)),
    screening: d => textSection(d,factsHtml(d.facts)),
    experience: d => textSection(d),
    gallery: galleryHtml,
    viewing: d => textSection(d),
    awards: awardsHtml,
    steps: stepsHtml
  };

  function detailHtml(data,key){
    const p=data.pages[key];
    const num=key==='exhibition'?'01':key==='media'?'02':'03';
    const title=key==='exhibition'?'전시공간':key==='media'?'미디어공모전':'공연마루 체험';
    const order=p.order||[];
    let hero=''; const content=[];
    order.forEach(k=>{
      let html='';
      if(k.startsWith('custom_')) html=customHtml(p.customBlocks?.[k]);
      else html=sectionTemplates[k]?.(p[k]||{})||'';
      if(k==='hero') hero=html; else if(html) content.push(html);
    });
    const fs=data.common.styles||{};
    return `<div class="detail-shell"><header class="detail-topbar"><a class="back-link" href="index.html">← 메인</a><strong>${num} · ${title}</strong><a class="home-link" href="index.html">안내도</a></header><main>${hero}<div class="detail-content">${content.join('')}<nav class="detail-bottom-nav"><a href="exhibition.html" ${key==='exhibition'?'aria-current="page"':''}>01 전시</a><a href="media-awards.html" ${key==='media'?'aria-current="page"':''}>02 미디어</a><a href="performance.html" ${key==='performance'?'aria-current="page"':''}>03 체험</a></nav><footer class="visit-footer"><span${styleAttr(textCss(fs.line1))}>${esc(data.common.footerLine1)}</span><br><span${styleAttr(textCss(fs.line2))}>${esc(data.common.footerLine2)}</span></footer></div></main></div>`;
  }

  function render(data){
    const root=document.getElementById('app');
    if(!root) return;
    root.innerHTML = page==='main' ? mainHtml(data) : detailHtml(data,page);
    if(page==='main'&&!previewMode){
      requestAnimationFrame(()=>requestAnimationFrame(()=>{const f=document.getElementById('introFrame'),i=document.getElementById('intro'); if(!f||!i)return; f.classList.add('is-opening');setTimeout(()=>i.classList.add('is-done'),2450);setTimeout(()=>i.remove(),3200);}));
    }
  }
  window.YoonRenderPage=render;
  window.addEventListener('message',e=>{if(e.data?.type==='YOON_PREVIEW'&&e.data.data) render(e.data.data);});
  Promise.resolve(window.YoonAssetReady).catch(()=>null).then(()=>window.YoonStore.load()).then(data=>{render(data); if(window.YoonStore.isSupabaseConfigured&&!previewMode){let last=JSON.stringify(data);setInterval(async()=>{try{const n=await window.YoonStore.loadRemoteOnly();const s=JSON.stringify(n);if(s!==last){last=s;render(n);}}catch{}},5000);}}).catch(err=>{console.error(err);render(window.YOON_CLONE(window.YOON_DEFAULT_DATA));});
})();