"use client";

import { useState } from "react";
import { Anchor, ArrowRight, Eye, EyeOff, Languages, LockKeyhole, UserRound, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { readStored, validFavorites, validTrips, type Trip } from "@/lib/user-storage";
import { ports, type Language } from "@/lib/ports";

export type AccountState = {
  favorites:string[];
  trips:Trip[];
  preferences:{ language:Language; lastPort:string };
};
export type AccountUser = { id:string; username:string };

function readInitialState(language:Language):AccountState {
  const fallback:AccountState = { favorites:["keelung","wushi","donggang"], trips:[], preferences:{ language, lastPort:"keelung" } };
  try {
    const ids = ports.map((port)=>port.id);
    const activityIds = ["fishing","whale","yacht","ferry","dive","speedboat"];
    const favorites = readStored(localStorage,"seasick-favorites",fallback.favorites,(value):value is string[]=>validFavorites(value,ids)).value;
    const trips = readStored(localStorage,"seasick-trips",fallback.trips,(value):value is Trip[]=>validTrips(value,ids,activityIds)).value;
    const lastPort = localStorage.getItem("seasick-last-port");
    return { favorites:[...new Set(favorites)], trips, preferences:{ language, lastPort:lastPort&&ids.includes(lastPort)?lastPort:fallback.preferences.lastPort } };
  } catch {
    return fallback;
  }
}

export function AuthScreen({ language,onLanguageChange,onAuthenticated }:{
  language:Language;
  onLanguageChange:(language:Language)=>void;
  onAuthenticated:(user:AccountUser,state:AccountState)=>void;
}) {
  const [mode,setMode]=useState<"login"|"register">("login");
  const [username,setUsername]=useState("");
  const [password,setPassword]=useState("");
  const [showPassword,setShowPassword]=useState(false);
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const zh=language==="zh";

  async function submit(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault();setError("");setBusy(true);
    try {
      const response=await fetch(`/api/auth/${mode}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username,password,...(mode==="register"?{initialState:readInitialState(language)}:{})})});
      const payload=await response.json() as {user?:AccountUser;state?:AccountState;error?:string};
      if(!response.ok||!payload.user||!payload.state){setError(payload.error??(zh?"目前無法完成操作":"Unable to continue right now"));return;}
      onAuthenticated(payload.user,payload.state);
    } catch {setError(zh?"無法連線到登入服務，請稍後再試":"Unable to reach the sign-in service");}
    finally {setBusy(false);}
  }
  function switchMode(next:"login"|"register"){setMode(next);setPassword("");setError("");}

  return <main className="auth-shell" lang={zh?"zh-Hant":"en"}>
    <div className="auth-ocean" aria-hidden="true"><i/><i/><i/></div>
    <header className="auth-header"><div className="auth-brand"><span><Waves/></span><strong>SeaSick <b>Taiwan</b></strong></div><button type="button" onClick={()=>onLanguageChange(zh?"en":"zh")}><Languages/>{zh?"EN":"中文"}</button></header>
    <section className="auth-layout"><div className="auth-story"><p className="eyebrow">PERSONAL SEA LOG</p><h1>{zh?<><span>每一次出海，</span><br/>都留下自己的海況記憶。</>:<>Every voyage,<br/>remembered.</>}</h1><p>{zh?"登入後，收藏港口、個人風險分析與航海紀錄會安全連結到你的帳號。":"Sign in to keep harbor saves, risk checks and voyage history connected to your account."}</p><div className="auth-points"><span><Anchor/>{zh?"跨裝置保留航海紀錄":"Voyage history across devices"}</span><span><LockKeyhole/>{zh?"密碼只保存安全雜湊":"Passwords stored as secure hashes"}</span></div></div>
      <div className="auth-card"><div className="auth-card-head"><span>{mode==="login"?"01":"02"}</span><div><p>{mode==="login"?(zh?"歡迎回來":"Welcome back"):(zh?"建立航海帳號":"Create your sea account")}</p><h2>{mode==="login"?(zh?"登入 SeaSick":"Sign in"):(zh?"註冊":"Register")}</h2></div></div>
        <form onSubmit={submit}><label><span>{zh?"姓名／帳號名稱":"Name / username"}</span><div className="auth-input"><UserRound/><Input autoComplete="username" value={username} onChange={(event)=>setUsername(event.target.value)} minLength={2} maxLength={30} required placeholder={zh?"輸入你的唯一名稱":"Enter your unique name"}/></div><small>{mode==="register"?(zh?"名稱不可與其他人重複":"This name must be unique"):(zh?"使用註冊時的名稱":"Use your registered name")}</small></label><label><span>{zh?"密碼":"Password"}</span><div className="auth-input"><LockKeyhole/><Input type={showPassword?"text":"password"} autoComplete={mode==="login"?"current-password":"new-password"} value={password} onChange={(event)=>setPassword(event.target.value)} minLength={8} maxLength={72} required placeholder={zh?"至少 8 個字元":"At least 8 characters"}/><button type="button" className="password-toggle" onClick={()=>setShowPassword(!showPassword)} aria-label={showPassword?(zh?"隱藏密碼":"Hide password"):(zh?"顯示密碼":"Show password")}>{showPassword?<EyeOff/>:<Eye/>}</button></div></label>{error&&<p className="auth-error" role="alert">{error}</p>}<Button type="submit" className="auth-submit" disabled={busy}>{busy?(zh?"處理中…":"Please wait…"):mode==="login"?(zh?"登入並繼續":"Sign in"):(zh?"建立帳號":"Create account")}<ArrowRight/></Button></form>
        <div className="auth-switch"><span>{mode==="login"?(zh?"第一次使用？":"New here?"):(zh?"已經有帳號？":"Already registered?")}</span><button type="button" onClick={()=>switchMode(mode==="login"?"register":"login")}>{mode==="login"?(zh?"先註冊":"Create an account"):(zh?"回到登入":"Back to sign in")}</button></div><p className="auth-privacy">{zh?"密碼不會以明文保存；登入狀態使用安全 Cookie。":"Passwords are never stored as plain text; sessions use a secure cookie."}</p>
      </div></section>
  </main>;
}

export function AuthLoading({language}:{language:Language}) {
  return <main className="auth-shell auth-loading" lang={language==="zh"?"zh-Hant":"en"}><div className="auth-ocean" aria-hidden="true"><i/><i/><i/></div><div><Waves/><p>{language==="zh"?"正在確認航海帳號…":"Checking your sea account…"}</p></div></main>;
}
