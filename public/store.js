(function(){
  const LOCAL_KEY = 'yoon_leaflet_content_v3';
  const cfg = window.YOON_SUPABASE || {};
  const configured = Boolean(cfg.url && cfg.anonKey);

  function deepMerge(base, override){
    if(Array.isArray(base)) return Array.isArray(override) ? override : base;
    if(base && typeof base==='object'){
      const out={...base};
      if(override && typeof override==='object' && !Array.isArray(override)){
        Object.keys(override).forEach(k=>{out[k]=k in base?deepMerge(base[k],override[k]):override[k];});
      }
      return out;
    }
    return override===undefined ? base : override;
  }
  function normalize(data){ return deepMerge(window.YOON_CLONE(window.YOON_DEFAULT_DATA), data||{}); }
  function localLoad(){
    try { return normalize(JSON.parse(localStorage.getItem(LOCAL_KEY))); }
    catch { return normalize(null); }
  }
  function localSave(data){ localStorage.setItem(LOCAL_KEY, JSON.stringify(data)); }
  function api(path){ return cfg.url.replace(/\/$/,'') + path; }

  async function remoteLoad(){
    const url = api(`/rest/v1/${encodeURIComponent(cfg.table||'leaflet_content')}?id=eq.${encodeURIComponent(cfg.rowId||'main')}&select=content,updated_at&limit=1`);
    const res = await fetch(url,{headers:{apikey:cfg.anonKey,Authorization:`Bearer ${cfg.anonKey}`},cache:'no-store'});
    if(!res.ok) throw new Error(`Supabase read ${res.status}`);
    const rows = await res.json();
    return normalize(rows?.[0]?.content);
  }

  async function authRequest(path,body){
    if(!configured) throw new Error('Supabase가 아직 연결되지 않았습니다.');
    const res=await fetch(api(path),{method:'POST',headers:{apikey:cfg.anonKey,'Content-Type':'application/json'},body:JSON.stringify(body)});
    const json=await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(json?.error_description || json?.msg || json?.message || '인증 요청에 실패했습니다.');
    return json;
  }
  function rememberSession(json){
    if(json?.access_token) sessionStorage.setItem('yoon_admin_access_token',json.access_token);
    if(json?.refresh_token) sessionStorage.setItem('yoon_admin_refresh_token',json.refresh_token);
    if(json?.user?.email) sessionStorage.setItem('yoon_admin_email',json.user.email);
  }
  async function signIn(email,password){
    const json=await authRequest('/auth/v1/token?grant_type=password',{email,password});
    rememberSession(json); return json;
  }
  async function signUp(email,password){
    if(cfg.adminEmail && String(email).toLowerCase()!==String(cfg.adminEmail).toLowerCase()) throw new Error('등록된 관리자 이메일만 가입할 수 있습니다.');
    const json=await authRequest('/auth/v1/signup',{email,password});
    rememberSession(json); return json;
  }
  async function getCurrentUser(){
    const token=getToken(); if(!token) return null;
    const res=await fetch(api('/auth/v1/user'),{headers:{apikey:cfg.anonKey,Authorization:`Bearer ${token}`}});
    if(!res.ok) return null;
    return await res.json();
  }
  function getToken(){ return sessionStorage.getItem('yoon_admin_access_token') || ''; }
  function getEmail(){ return sessionStorage.getItem('yoon_admin_email') || ''; }
  function signOut(){ sessionStorage.removeItem('yoon_admin_access_token');sessionStorage.removeItem('yoon_admin_refresh_token');sessionStorage.removeItem('yoon_admin_email'); }

  async function remoteSave(data,token){
    if(!token) throw new Error('관리자 로그인이 필요합니다.');
    const res = await fetch(api(`/rest/v1/${encodeURIComponent(cfg.table||'leaflet_content')}?on_conflict=id`),{
      method:'POST',
      headers:{apikey:cfg.anonKey,Authorization:`Bearer ${token}`,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},
      body:JSON.stringify([{id:cfg.rowId||'main',content:data,updated_at:new Date().toISOString()}])
    });
    if(!res.ok) throw new Error(`Supabase save ${res.status}: ${await res.text()}`);
  }

  async function uploadImage(file){
    if(!configured) throw new Error('Supabase 미연결');
    const token=getToken(); if(!token) throw new Error('관리자 로그인이 필요합니다.');
    const ext=(file.name?.split('.').pop()||'webp').toLowerCase().replace(/[^a-z0-9]/g,'')||'webp';
    const safe=(file.name||'image').replace(/\.[^.]+$/,'').replace(/[^a-zA-Z0-9_-]+/g,'-').slice(0,40)||'image';
    const path=`uploads/${Date.now()}-${Math.random().toString(36).slice(2,8)}-${safe}.${ext}`;
    const bucket=cfg.bucket||'leaflet-assets';
    const res=await fetch(api(`/storage/v1/object/${encodeURIComponent(bucket)}/${path.split('/').map(encodeURIComponent).join('/')}`),{
      method:'POST',headers:{apikey:cfg.anonKey,Authorization:`Bearer ${token}`,'Content-Type':file.type||'application/octet-stream','x-upsert':'false'},body:file
    });
    if(!res.ok) throw new Error(`이미지 업로드 실패 ${res.status}: ${await res.text()}`);
    return api(`/storage/v1/object/public/${encodeURIComponent(bucket)}/${path.split('/').map(encodeURIComponent).join('/')}`);
  }

  window.YoonStore = {
    isSupabaseConfigured: configured,
    getToken,getEmail,getCurrentUser,signIn,signUp,signOut,uploadImage,normalize,
    async load(){
      if(configured){
        try { const data=await remoteLoad(); localSave(data); return data; }
        catch(err){ console.warn(err); return localLoad(); }
      }
      return localLoad();
    },
    async save(data){
      data.updatedAt = new Date().toISOString();
      if(configured){ await remoteSave(data,getToken()); }
      localSave(data); return data;
    },
    saveLocalDraft(data){localSave(data);},
    resetLocal(){localStorage.removeItem(LOCAL_KEY);},
    async loadRemoteOnly(){return remoteLoad();}
  };
})();