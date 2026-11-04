// zakładki strony (adres #nazwa); "prywatnosc" nie ma pozycji w menu, link jest w stopce i pod formularzem
const V=["start","rezerwacje","r4b4n","prywatnosc"];
function show(){let h=(location.hash||"#start").slice(1);if(h==="admin"){h="rezerwacje";setTimeout(()=>{try{openAdminLogin()}catch(e){}},300)}if(h.startsWith("wydarzenie/")){if(!document.querySelector("section.view.on"))h="start";else return}if(!V.includes(h))h="start";setTimeout(()=>trackView(h),0);
 V.forEach(v=>{document.getElementById("v-"+v).classList.toggle("on",v===h)});
 document.querySelectorAll("nav a").forEach(a=>a.classList.toggle("on",a.dataset.v===h));document.body.classList.toggle("g",h==="r4b4n");window.scrollTo(0,0)}
addEventListener("hashchange",show);show();
// galeria
function initGallery(root){
 const tr=root.querySelector(".track"),sl=[...tr.children],dots=root.querySelector(".dots");
 sl.forEach((s,i)=>{const d=document.createElement("i");d.onclick=()=>go(i);dots.appendChild(d)});
 const cur=()=>Math.round(tr.scrollLeft/tr.clientWidth);
 function go(i){i=(i+sl.length)%sl.length;tr.scrollTo({left:i*tr.clientWidth,behavior:"smooth"})}
 tr.addEventListener("scroll",()=>[...dots.children].forEach((d,i)=>d.classList.toggle("on",i===cur())));
 root.querySelector(".arrow.l").onclick=()=>go(cur()-1);root.querySelector(".arrow.r").onclick=()=>go(cur()+1);
 dots.children[0].classList.add("on");
}
document.querySelectorAll(".gal").forEach(initGallery);
// kalendarz wydarzeń r4b4n: daty zapisane w bazie (tabela r4b4n_events), administrator dodaje, edytuje i usuwa je pod kalendarzem
// Kliknięcie wydarzenia otwiera okno z plakatem i informacjami.
// Wszystkie wydarzenia (nazwa, godziny, line-up, tax, opis, plakat, link do posta) są w bazie; strona ich nie przechowuje.
let EV={},EVID={},EVD={};
const MNE=["Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec","Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"];
const DNE=["niedziela","poniedziałek","wtorek","środa","czwartek","piątek","sobota"];
const pad=n=>String(n).padStart(2,"0"),today=new Date();
const todayK=today.getFullYear()+"-"+pad(today.getMonth()+1)+"-"+pad(today.getDate());
let ey=today.getFullYear(),em=today.getMonth(),picked=null;
const fmt=k=>+k.slice(8)+"."+k.slice(5,7)+"."+k.slice(0,4);
function pickFirst(){const keys=Object.keys(EV).sort(),f=keys.find(k=>k>=todayK)||keys[keys.length-1]||null;
 picked=f;if(f){ey=+f.slice(0,4);em=+f.slice(5,7)-1}else{ey=today.getFullYear();em=today.getMonth()}}
function drawE(){
 const cal=document.getElementById("ecal");cal.innerHTML="";
 document.getElementById("emon").textContent=MNE[em]+" "+ey;
 ["Pn","Wt","Śr","Cz","Pt","So","Nd"].forEach(d=>{const e=document.createElement("div");e.className="dn";e.textContent=d;cal.appendChild(e)});
 const off=(new Date(ey,em,1).getDay()+6)%7,n=new Date(ey,em+1,0).getDate();
 for(let i=0;i<off;i++)cal.appendChild(document.createElement("div"));
 for(let d=1;d<=n;d++){const k=ey+"-"+pad(em+1)+"-"+pad(d);
  if(EV[k]){const b=document.createElement("button");b.textContent=d;b.className="ev"+(k<todayK?" past":"")+(k===picked?" sel":"");b.title=EV[k];
   b.onclick=()=>{picked=k;drawE();openEvent(k)};cal.appendChild(b)}
  else{const c=document.createElement("div");c.textContent=d;c.className="plain";cal.appendChild(c)}}
 const info=document.getElementById("einfo");info.innerHTML="";
 if(picked&&EV[picked]){info.append(fmt(picked)+" · "+EV[picked]+" ");
  const more=document.createElement("button");more.type="button";more.className="emore";more.textContent="Szczegóły ↗";more.onclick=()=>openEvent(picked);info.append(more)}
 else info.textContent="Brak zaplanowanych wydarzeń.";
 const isAdm=isAdmin();
 document.getElementById("eadm").hidden=!isAdm;
 document.getElementById("edel").hidden=!(isAdm&&picked&&EVID[picked]);
 document.getElementById("eedit").hidden=!(isAdm&&picked&&EVID[picked]);
}
document.getElementById("eprev").onclick=()=>{em--;if(em<0){em=11;ey--}drawE()};
document.getElementById("enext").onclick=()=>{em++;if(em>11){em=0;ey++}drawE()};
// okno wydarzenia (pop-up) – wydarzenia r4b4n i wydarzenia sali; link bezpośredni: #wydarzenie/RRRR-MM-DD
const evm=document.getElementById("evm");let evmBack=null,evmCur=null;
const VENUE_ADDR="Przystanek Duży Pokój, Rondo Kaponiera, 60-829 Poznań";
function eventByDate(k){
 if(EV[k])return {...(EVD[k]||{}),event_date:k,title:EV[k],_src:"r4"};
 const v=(typeof VROWS!=="undefined"?VROWS:[]).find(x=>String(x.event_date).slice(0,10)===k);
 return v?{...v,event_date:k,_src:"sala"}:null}
function eventUrl(k){return location.origin+location.pathname+"#wydarzenie/"+k}
function openEvent(k){const r=eventByDate(k);if(!r)return;evmCur=r;
 const dt=new Date(+k.slice(0,4),+k.slice(5,7)-1,+k.slice(8,10));
 document.getElementById("evm-date").textContent=(r._src==="r4"?"r4b4n · ":"")+DNE[dt.getDay()]+", "+fmt(k);
 document.getElementById("evm-title").textContent=r.title;
 evm.classList.toggle("sala",r._src==="sala");evm.classList.toggle("noposter",r._src==="sala"&&!r.poster_url);
 const img=document.getElementById("evm-img"),ph=document.getElementById("evm-ph");
 if(r.poster_url){img.src=r.poster_url;img.alt="Plakat: "+r.title;img.hidden=false;ph.hidden=true}else{img.removeAttribute("src");img.hidden=true;ph.hidden=false}
 const dl=document.getElementById("evm-facts");dl.innerHTML="";
 [["Otwarcie bramek",r.doors],["Godziny",r.time_text],["Line-up",r.lineup],["Tax",r.entry]].forEach(([a,b])=>{if(!b)return;
  const t=document.createElement("dt");t.textContent=a;const d=document.createElement("dd");d.textContent=b;dl.append(t,d)});
 const ds=document.getElementById("evm-desc");ds.textContent=r.description||"";ds.hidden=!r.description;
 if(!dl.children.length&&!r.description){ds.textContent="Szczegóły wkrótce.";ds.hidden=false}
 const post=document.getElementById("evm-post"),ig=document.getElementById("evm-ig");
 const link=r._src==="r4"?r.post_url:r.fb_url;
 if(link){post.href=link;post.textContent=r._src==="r4"?"Zobacz post na Instagramie ↗":"Wydarzenie na Facebooku ↗";post.hidden=false}else post.hidden=true;
 ig.hidden=r._src!=="r4"||!!r.post_url;   // profil r4b4n tylko, gdy wydarzenie r4b4n nie ma posta
 document.getElementById("evm-share").textContent="Udostępnij ↗";
 if(location.hash!=="#wydarzenie/"+k)history.replaceState(null,"","#wydarzenie/"+k);
 if(evm.hidden){evmBack=document.activeElement;evm.hidden=false;document.body.classList.add("modal-on");document.getElementById("evm-x").focus()}}
function closeEvent(){evm.hidden=true;evmCur=null;document.body.classList.remove("modal-on");
 if(location.hash.startsWith("#wydarzenie/"))history.replaceState(null,"",location.pathname+location.search+(document.getElementById("v-r4b4n").classList.contains("on")?"#r4b4n":"#start"));
 if(evmBack&&evmBack.focus)evmBack.focus()}
document.getElementById("evm-x").onclick=closeEvent;
evm.addEventListener("click",e=>{if(e.target===evm)closeEvent()});
addEventListener("keydown",e=>{if(e.key==="Escape"&&!evm.hidden)closeEvent()});
// plik kalendarza (.ics): godziny brane z pola "Godziny" (np. 20:00–02:00), bez godzin – wydarzenie całodniowe
function icsFor(r){const k=String(r.event_date).slice(0,10),d=k.replace(/-/g,"");
 const esc=s=>String(s||"").replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/[,;]/g,m=>"\\"+m);
 const tm=String(r.time_text||"").match(/(\d{1,2})[:.](\d{2})(?:\s*[–-]\s*(\d{1,2})[:.](\d{2}))?/);
 let when;
 if(tm){const sh=+tm[1],sm=+tm[2],start=new Date(+k.slice(0,4),+k.slice(5,7)-1,+k.slice(8,10),sh,sm);
  let end=new Date(start.getTime()+5*3600e3);
  if(tm[3]){end=new Date(+k.slice(0,4),+k.slice(5,7)-1,+k.slice(8,10),+tm[3],+tm[4]);if(end<=start)end=new Date(end.getTime()+864e5)}
  const f=x=>x.getFullYear()+pad(x.getMonth()+1)+pad(x.getDate())+"T"+pad(x.getHours())+pad(x.getMinutes())+"00";
  when="DTSTART;TZID=Europe/Warsaw:"+f(start)+"\r\nDTEND;TZID=Europe/Warsaw:"+f(end)}
 else{const n=new Date(+k.slice(0,4),+k.slice(5,7)-1,+k.slice(8,10)+1);when="DTSTART;VALUE=DATE:"+d+"\r\nDTEND;VALUE=DATE:"+n.getFullYear()+pad(n.getMonth()+1)+pad(n.getDate())}
 const desc=[r.lineup?"Line-up: "+r.lineup:"",r.entry?"Tax: "+r.entry:"",r.description||"",eventUrl(k)].filter(Boolean).join("\n");
 return ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Przystanek Duzy Pokoj//PL","CALSCALE:GREGORIAN","METHOD:PUBLISH","BEGIN:VEVENT",
  "UID:"+k+"-"+(r.id||"x")+"-"+r._src+"@przystanekduzypokoj","DTSTAMP:"+new Date().toISOString().replace(/[-:]/g,"").slice(0,15)+"Z",when,
  "SUMMARY:"+esc(r.title),"LOCATION:"+esc(VENUE_ADDR),"DESCRIPTION:"+esc(desc),"URL:"+eventUrl(k),"END:VEVENT","END:VCALENDAR"].join("\r\n")}
document.getElementById("evm-cal").onclick=()=>{if(!evmCur)return;
 const blob=new Blob([icsFor(evmCur)],{type:"text/calendar;charset=utf-8"}),a=document.createElement("a");
 a.href=URL.createObjectURL(blob);a.download=evmCur.title.replace(/[^\p{L}\p{N}]+/gu,"-").replace(/^-|-$/g,"").toLowerCase()+".ics";
 document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000)};
document.getElementById("evm-share").onclick=async()=>{if(!evmCur)return;const b=document.getElementById("evm-share");
 const k=String(evmCur.event_date).slice(0,10),url=eventUrl(k),text=evmCur.title+" · "+fmt(k)+" · Przystanek Duży Pokój";
 try{if(navigator.share){await navigator.share({title:evmCur.title,text,url});return}
  await navigator.clipboard.writeText(url);b.textContent="Link skopiowany ✓"}
 catch(e){if(e&&e.name==="AbortError")return;prompt("Skopiuj link do wydarzenia:",url)}};
// otwarcie wydarzenia z linku (#wydarzenie/RRRR-MM-DD), gdy dane są już wczytane
function openFromHash(){const m=location.hash.match(/^#wydarzenie\/(\d{4}-\d{2}-\d{2})$/);if(m&&eventByDate(m[1]))openEvent(m[1])}
addEventListener("hashchange",openFromHash);
async function loadEvents(keep){
 if(DB_ON){try{const x=await fetch(SUPABASE_URL+"/rest/v1/r4b4n_events?select=*&order=event_date.asc",{headers:HDR});
  if(x.ok){const rows=await x.json();EV={};EVID={};EVD={};rows.forEach(r=>{const k=String(r.event_date).slice(0,10);EV[k]=r.title;EVID[k]=r.id;EVD[k]=r})}}catch(e){console.error("r4b4n_events:",e)}}
 if(!keep||!EV[picked])pickFirst();
 drawE();
 // wydarzenia r4b4n blokują też kalendarz rezerwacji
 try{if(sel&&EV[sel]){sel=null;showSel()}draw();list();drawV()}catch(e){}
 try{openFromHash()}catch(e){}}
pickFirst();drawE();
// rezerwacje
// Odwiedzający wysyła PROŚBĘ o rezerwację: trafia ona do bazy jako "oczekuje" i e-mailem (EmailJS) na skrzynkę sali.
// Termin staje się zajęty dopiero po potwierdzeniu przez administratora w panelu na dole zakładki.
const SUPABASE_URL="https://pdexenoprsleniazvxic.supabase.co";
const SUPABASE_KEY="sb_publishable_6B-_YhuJh7PJSIOEyr06Nw_CmaHKmQc";  // klucz publiczny, przeznaczony do użycia w kodzie strony
const DB_ON=!!(SUPABASE_URL&&SUPABASE_KEY);
const HDR={"apikey":SUPABASE_KEY,"Content-Type":"application/json"};
if(SUPABASE_KEY.startsWith("eyJ"))HDR.Authorization="Bearer "+SUPABASE_KEY;
// EmailJS: powiadomienie o nowej prośbie (szablon: To = skrzynka sali, Reply-To = {{email}}, Subject = {{subject}})
const EMAILJS={service:"service_o0s3pj2",template:"template_n1rdne8",key:"N_8Z4bL6aFTH875RU"};
const MN=["Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec","Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"];
const iso=(a,b,c)=>a+"-"+String(b+1).padStart(2,"0")+"-"+String(c).padStart(2,"0");
const fmtD=k=>+String(k).slice(8,10)+"."+String(k).slice(5,7)+"."+String(k).slice(0,4);
let VEV={};          // wydarzenia w sali: data -> nazwa (zajmują termin)
let busy=new Map();   // data -> publiczny opis (pusty = wydarzenie prywatne)
let now=new Date(),y=now.getFullYear(),m=now.getMonth();
const todayKey=iso(now.getFullYear(),now.getMonth(),now.getDate());
let sel=todayKey;
const $=id=>document.getElementById(id);
function showSel(){
 $("chosen").textContent="Wybrana data: "+(sel?fmtD(sel)+(sel===todayKey?" (dziś)":""):"brak");
 $("subj").textContent=sel?"Temat: Rezerwacja – "+fmtD(sel):""}
async function loadBusy(){
 try{const x=await fetch(SUPABASE_URL+"/rest/v1/rpc/busy_dates",{method:"POST",headers:HDR,body:"{}"});
  if(!x.ok)throw new Error("HTTP "+x.status+" "+(await x.text()).slice(0,160));
  busy=new Map((await x.json()).map(r=>[String(r.event_date).slice(0,10),r.public_desc||""]));
  if(sel&&(busy.has(sel)||EV[sel]||VEV[sel])){sel=null}}
 catch(e){console.error("busy_dates:",e);$("msg").textContent="Nie udało się pobrać zajętych terminów ("+e.message+"). Odśwież stronę."}
 await loadAdmin();showSel();draw();list()}
function draw(){const cal=$("cal");cal.innerHTML="";
 $("mon").textContent=MN[m]+" "+y;
 ["Pn","Wt","Śr","Cz","Pt","So","Nd"].forEach(d=>{const e=document.createElement("div");e.className="dn";e.textContent=d;cal.appendChild(e)});
 const off=(new Date(y,m,1).getDay()+6)%7,n=new Date(y,m+1,0).getDate();
 for(let i=0;i<off;i++)cal.appendChild(document.createElement("div"));
 for(let d=1;d<=n;d++){const k=iso(y,m,d),b=document.createElement("button");b.textContent=d;
  const isBusy=busy.has(k)||!!VEV[k],isR4=!isBusy&&!!EV[k];
  if(k<todayKey||isBusy||isR4)b.disabled=true;if(isBusy){b.classList.add("busy");b.title=VEV[k]||busy.get(k)||"Zajęty"}
  if(isR4){b.classList.add(k>=todayKey?"r4":"r4past");b.title="r4b4n: "+EV[k]}
  if(k===todayKey)b.classList.add("today");if(k===sel)b.classList.add("sel");
  b.onclick=()=>{sel=k;showSel();draw()};cal.appendChild(b)}}
$("prev").onclick=()=>{m--;if(m<0){m=11;y--}draw()};
$("next").onclick=()=>{m++;if(m>11){m=0;y++}draw()};
// panel administratora: logowanie przez Supabase Auth; potwierdzanie, opis publiczny, usuwanie
let adminTok=null;try{adminTok=sessionStorage.getItem("pdp_adm")}catch(e){}
let adminRows=null;
const AH=()=>({"apikey":SUPABASE_KEY,"Content-Type":"application/json","Authorization":"Bearer "+adminTok});
function logoutAdmin(){adminTok=null;adminRows=null;try{sessionStorage.removeItem("pdp_adm")}catch(e){}list();drawE();try{drawV()}catch(e){}}
async function loadAdmin(){
 if(!adminTok){adminRows=null;return}
 try{const x=await fetch(SUPABASE_URL+"/rest/v1/reservations?select=id,event_date,title,email,phone,note,status,is_public,public_desc&order=event_date.asc",{headers:AH()});
  if(x.status===401||x.status===403){logoutAdmin();return}
  if(!x.ok)throw new Error("HTTP "+x.status);
  adminRows=await x.json()}
 catch(e){adminRows=null}}
async function adminCall(path,method,body){
 const x=await fetch(SUPABASE_URL+"/rest/v1/reservations?"+path,{method,headers:{...AH(),"Prefer":"return=minimal"},body:body?JSON.stringify(body):undefined});
 if(x.status===401||x.status===403){logoutAdmin();alert("Sesja wygasła. Zaloguj się ponownie.");return false}
 if(x.status===409){alert("Ten termin jest już potwierdzony dla innej rezerwacji.");return false}
 if(!x.ok){alert("Operacja nie powiodła się (HTTP "+x.status+"). Spróbuj ponownie.");return false}
 return true}
async function removeRes(r){
 if(!confirm("Usunąć "+(r.status==="confirmed"?"termin":"prośbę")+" "+fmtD(r.event_date)+" ("+r.title+")?"))return;
 if(await adminCall("id=eq."+r.id,"DELETE"))await loadBusy()}
async function confirmRes(r){
 if(!confirm("Potwierdzić rezerwację "+fmtD(r.event_date)+" ("+r.title+")? Termin pojawi się na stronie jako zajęty."))return;
 if(await adminCall("id=eq."+r.id,"PATCH",{status:"confirmed"}))await loadBusy()}
async function editDesc(r){
 const v=prompt("Opis widoczny na stronie obok daty (zostaw puste, jeśli wydarzenie jest prywatne):",r.public_desc||"");
 if(v===null)return;const t=v.trim().slice(0,200);
 if(await adminCall("id=eq."+r.id,"PATCH",{is_public:!!t,public_desc:t||null}))await loadBusy()}
function mkBtn(txt,fn){const b=document.createElement("button");b.className="btn";b.textContent=txt;b.style.padding="6px 10px";b.onclick=fn;return b}
function list(){const l=$("list");l.innerHTML="";
 const adm=isAdmin()&&adminRows;
 $("admout").hidden=!adm;
 $("adm").hidden=!!adm||$("adm").dataset.open!=="1";
 $("list-h").textContent=adm?"Rezerwacje (panel administratora)":"Zajęte terminy";
 if(adm){
  if(!adminRows.length){l.textContent="Brak rezerwacji.";return}
  const ord=r=>(r.status==="pending"?"0":"1")+r.event_date;
  [...adminRows].sort((a,b)=>ord(a)<ord(b)?-1:1).forEach(r=>{
   const d=document.createElement("div");d.className="row"+(r.status==="pending"?" pend":"");
   const t=document.createElement("div");
   const h=document.createElement("b");h.textContent=fmtD(r.event_date)+" · "+r.title;
   const st=document.createElement("span");st.className="st";st.textContent=r.status==="pending"?"oczekuje":(r.is_public?"potwierdzona · otwarte":"potwierdzona · prywatne");
   const info=document.createElement("small");
   info.textContent=[r.email,r.phone,r.note,r.public_desc?"Opis publiczny: "+r.public_desc:""].filter(Boolean).join(" · ");
   t.append(h,st,info);
   const a=document.createElement("div");a.className="acts";
   if(r.status==="pending")a.append(mkBtn("Potwierdź",()=>confirmRes(r)));
   a.append(mkBtn("Opis",()=>editDesc(r)),mkBtn("Usuń",()=>removeRes(r)));
   d.append(t,a);l.appendChild(d)});return}
 const ds=[...new Set([...busy.keys(),...Object.keys(EV),...Object.keys(VEV)])].filter(k=>k>=todayKey).sort();
 if(!ds.length){l.textContent="Brak zajętych terminów.";return}
 ds.forEach(k=>{const d=document.createElement("div");const r4=!busy.has(k)&&!VEV[k]&&!!EV[k],desc=VEV[k]?"Wydarzenie: "+VEV[k]:r4?"r4b4n: "+EV[k]:busy.get(k);
  const b=document.createElement("b");b.textContent=fmtD(k);d.append(b,document.createTextNode(" · "+(desc||"zajęty")));
  if(r4)d.className="r4";else if(desc)d.className="open";l.appendChild(d)})}
// Logowanie administratora: formularz nie jest częścią strony – pojawia się tylko pod adresem …/#admin
// (strona bez pól hasła nie wygląda dla filtrów operatorów jak strona wyłudzająca dane).
function openAdminLogin(){const a=$("adm");
 if(!a.dataset.built){a.dataset.built="1";
  a.innerHTML='<h3 style="font-size:14px;margin:18px 0 0">Panel administratora</h3><label for="adm-mail">E-mail administratora</label><input id="adm-mail" type="email" autocomplete="username"><label for="adm-pass">Hasło</label><input id="adm-pass" type="password" autocomplete="current-password"><label class="chk"><input type="checkbox" id="adm-remember" checked> Zapamiętaj ten komputer (nie zaznaczaj na cudzym urządzeniu)</label><p><button class="btn" id="adm-login">Zaloguj ↗</button></p><div class="msg" id="adm-msg"></div>';
  $("adm-login").onclick=adminLogin}
 a.dataset.open="1";a.hidden=!!adminTok;if(!adminTok){a.scrollIntoView({block:"center"});$("adm-mail").focus()}}
$("admout").onclick=e=>{e.preventDefault();try{localStorage.removeItem("pdp_adm_rt")}catch(x){}clearTimeout(rtTimer);logoutAdmin()};
async function adminLogin(){
 const msg=$("adm-msg"),btn=$("adm-login");
 const email=$("adm-mail").value.trim(),pass=$("adm-pass").value;
 if(!email||!pass){msg.textContent="Podaj e-mail i hasło.";return}
 btn.disabled=true;msg.textContent="Logowanie…";
 try{const x=await fetch(SUPABASE_URL+"/auth/v1/token?grant_type=password",{method:"POST",headers:{"apikey":SUPABASE_KEY,"Content-Type":"application/json"},body:JSON.stringify({email,password:pass})});
  if(!x.ok)throw new Error("login");
  const j=await x.json();adminTok=j.access_token;try{sessionStorage.setItem("pdp_adm",adminTok)}catch(e){}rememberAfterLogin(j);
  $("adm-pass").value="";msg.textContent="";
  await loadAdmin();list();drawE();drawV()}
 catch(e){msg.textContent="Nie udało się zalogować. Sprawdź e-mail i hasło."}
 finally{btn.disabled=false}}
$("f-open").onchange=()=>{$("f-pub-wrap").hidden=!$("f-open").checked};
async function sendMail(p){
 const x=await fetch("https://api.emailjs.com/api/v1.0/email/send",{method:"POST",headers:{"Content-Type":"application/json"},
  body:JSON.stringify({service_id:EMAILJS.service,template_id:EMAILJS.template,user_id:EMAILJS.key,template_params:p})});
 if(!x.ok)throw new Error("EmailJS "+x.status+" "+(await x.text()).slice(0,120))}
const FORM_T0=Date.now();
// komunikaty dla błędów zgłaszanych przez bazę (funkcja reservations_guard)
const GUARD_MSG={BAD_EMAIL:"Sprawdź adres e-mail.",BAD_PHONE:"Podaj poprawny numer telefonu.",
 DATE_TAKEN:"Ten termin jest już zajęty. Wybierz inną datę.",DUPLICATE:"Prośba na ten dzień z tego adresu e-mail już do nas dotarła. Odpowiemy wkrótce.",
 LIMIT_EMAIL:"Z tego adresu e-mail wysłano dziś już kilka próśb. Spróbuj jutro albo zadzwoń: 607 415 412.",
 LIMIT_GLOBAL:"Dostajemy teraz dużo zgłoszeń. Spróbuj za kilka minut albo zadzwoń: 607 415 412.",
 LIMIT_PENDING:"Mamy teraz dużo próśb do rozpatrzenia. Zadzwoń: 607 415 412 albo napisz na przystanekduzypokoj@gmail.com."};
$("send").onclick=async()=>{const g=id=>$(id).value.trim(),msg=$("msg");
 // pułapka na boty: niewidoczne pole wypełniają tylko automaty; ludzie potrzebują też kilku sekund na formularz
 if($("f-www").value||Date.now()-FORM_T0<4000){msg.textContent="Dziękujemy! Prośba o rezerwację została wysłana.";return}
 if(!sel){msg.textContent="Najpierw wybierz datę w kalendarzu.";return}
 if(EV[sel]||busy.has(sel)||VEV[sel]){msg.textContent="Ten termin jest zajęty. Wybierz inną datę.";sel=null;showSel();draw();return}
 const r={date:sel,title:g("f-title"),mail:g("f-mail"),phone:g("f-phone"),details:g("f-note"),open:$("f-open").checked,pub:g("f-pub")};
 if(!r.title||!r.mail||!r.phone){msg.textContent="Uzupełnij tytuł wydarzenia, e-mail i numer telefonu.";return}
 if(!/^\S+@\S+\.\S+$/.test(r.mail)){msg.textContent="Sprawdź adres e-mail.";return}
 if(r.phone.replace(/\D/g,"").length<6){msg.textContent="Podaj poprawny numer telefonu.";return}
 if(r.open&&!r.pub){msg.textContent="Dopisz opis wydarzenia otwartego albo odznacz tę opcję.";return}
 const btn=$("send");btn.disabled=true;msg.textContent="Wysyłanie…";
 try{
  const x=await fetch(SUPABASE_URL+"/rest/v1/reservations",{method:"POST",headers:{...HDR,"Prefer":"return=minimal"},
   body:JSON.stringify({event_date:r.date,title:r.title,email:r.mail,phone:r.phone,note:r.details||null,is_public:r.open,public_desc:r.open?r.pub:null,status:"pending"})});
  if(!x.ok){const t=await x.text();const code=(t.match(/BAD_EMAIL|BAD_PHONE|DATE_TAKEN|DUPLICATE|LIMIT_EMAIL|LIMIT_GLOBAL|LIMIT_PENDING/)||[])[0];
   if(code){msg.textContent=GUARD_MSG[code];if(code==="DATE_TAKEN"){sel=null;showSel();await loadBusy()}return}
   throw new Error("HTTP "+x.status+" "+t.slice(0,160))}
  try{await sendMail({subject:"Rezerwacja – "+fmtD(r.date)+" – "+r.title,date:fmtD(r.date),title:r.title,email:r.mail,reply_to:r.mail,phone:r.phone,
   details:r.details||"-",event_type:r.open?"otwarte":"prywatne",public_desc:r.open?r.pub:"-"})}
  catch(e){console.error("powiadomienie e-mail:",e)}   // prośba i tak jest zapisana w panelu administratora
  msg.textContent="Dziękujemy! Prośba o rezerwację na "+fmtD(r.date)+" została wysłana. Termin zostanie potwierdzony przez właściciela – odpowiemy na podany e-mail zwykle w ciągu 24 h.";
  sel=null;showSel();["f-title","f-mail","f-phone","f-note","f-pub"].forEach(i=>$(i).value="");$("f-open").checked=false;$("f-pub-wrap").hidden=true;
  await loadAdmin();draw();list();
 }catch(e){console.error("reservation:",e);msg.textContent="Nie udało się wysłać prośby ("+e.message+"). Spróbuj ponownie za chwilę albo zadzwoń: 607 415 412."}
 finally{btn.disabled=false}};
document.addEventListener("visibilitychange",()=>{if(!document.hidden)loadBusy()});
showSel();draw();
loadBusy();
// r4b4n: dodawanie, edycja i usuwanie wydarzeń przez administratora (z plakatem w Supabase Storage)
let editId=null;
const EF={date:"edate",title:"etitle",doors:"edoors",time_text:"etime",lineup:"elineup",entry:"eentry",description:"edesc",post_url:"epost"};
function resetEventForm(){editId=null;Object.values(EF).forEach(i=>document.getElementById(i).value="");document.getElementById("eposter").value="";
 document.getElementById("eadd").textContent="Dodaj ↗";document.getElementById("ecancel").hidden=true;document.getElementById("eform-h").textContent="Dodaj wydarzenie (panel administratora)"}
document.getElementById("eedit").onclick=()=>{const r=EVD[picked];if(!r)return;editId=r.id;
 Object.entries(EF).forEach(([k,i])=>document.getElementById(i).value=(k==="date"?r.event_date:r[k])||"");
 document.getElementById("eadd").textContent="Zapisz zmiany ↗";document.getElementById("ecancel").hidden=false;
 document.getElementById("eform-h").textContent="Edytujesz: "+fmt(picked)+" · "+r.title;document.getElementById("etitle").focus()};
document.getElementById("ecancel").onclick=()=>{resetEventForm();document.getElementById("emsg").textContent=""};
// zmniejsza plakat do maks. 1400 px (JPEG), żeby szybko ładował się na telefonach
function shrink(file){return new Promise((ok,no)=>{const u=URL.createObjectURL(file),im=new Image();
 im.onload=()=>{const s=Math.min(1,1400/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);
  c.getContext("2d").drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);c.toBlob(b=>b?ok(b):no(new Error("plakat")),"image/jpeg",.85)};
 im.onerror=()=>no(new Error("Nie można odczytać pliku plakatu"));im.src=u})}
async function uploadPoster(file,date){
 const blob=await shrink(file),path=date+"-"+Date.now()+".jpg";
 const x=await fetch(SUPABASE_URL+"/storage/v1/object/posters/"+path,{method:"POST",headers:{"apikey":SUPABASE_KEY,"Authorization":"Bearer "+adminTok,"Content-Type":"image/jpeg"},body:blob});
 if(!x.ok)throw new Error("plakat: HTTP "+x.status+" "+(await x.text()).slice(0,120));
 return SUPABASE_URL+"/storage/v1/object/public/posters/"+path}
document.getElementById("eadd").onclick=async()=>{
 const v=i=>document.getElementById(i).value.trim(),m=document.getElementById("emsg"),btn=document.getElementById("eadd");
 const d=v("edate"),t=v("etitle");
 if(!d||!t){m.textContent="Podaj datę i nazwę wydarzenia.";return}
 const post=v("epost");if(post&&!/^https?:\/\//.test(post)){m.textContent="Link do posta musi zaczynać się od https://";return}
 const body={event_date:d,title:t,doors:v("edoors")||null,time_text:v("etime")||null,lineup:v("elineup")||null,entry:v("eentry")||null,description:v("edesc")||null,post_url:post||null};
 btn.disabled=true;m.textContent="Zapisywanie…";
 try{const f=document.getElementById("eposter").files[0];if(f){m.textContent="Wysyłanie plakatu…";body.poster_url=await uploadPoster(f,d)}
  const x=await fetch(SUPABASE_URL+"/rest/v1/r4b4n_events"+(editId?"?id=eq."+editId:""),{method:editId?"PATCH":"POST",headers:{...AH(),"Prefer":"return=minimal"},body:JSON.stringify(body)});
  if(x.status===401||x.status===403){logoutAdmin();m.textContent="Sesja wygasła. Zaloguj się ponownie w Rezerwacjach.";drawE();return}
  if(x.status===409){m.textContent="Na ten dzień jest już wydarzenie.";return}
  if(!x.ok)throw new Error("HTTP "+x.status+" "+(await x.text()).slice(0,120));
  m.textContent=editId?"Zapisano zmiany.":"Dodano.";resetEventForm();picked=d;ey=+d.slice(0,4);em=+d.slice(5,7)-1;await loadEvents(true)}
 catch(e){m.textContent="Nie udało się zapisać wydarzenia ("+e.message+")."}
 finally{btn.disabled=false}};
document.getElementById("edel").onclick=async()=>{
 const m=document.getElementById("emsg");if(!picked||!EVID[picked])return;
 if(!confirm("Usunąć wydarzenie "+fmt(picked)+" ("+EV[picked]+")?"))return;
 try{const x=await fetch(SUPABASE_URL+"/rest/v1/r4b4n_events?id=eq."+EVID[picked],{method:"DELETE",headers:{...AH(),"Prefer":"return=minimal"}});
  if(x.status===401||x.status===403){logoutAdmin();drawE();return}
  if(!x.ok)throw new Error("HTTP "+x.status);
  m.textContent="Usunięto.";resetEventForm();await loadEvents(false)}
 catch(e){m.textContent="Nie udało się usunąć ("+e.message+")."}};
loadEvents();

// efekt kursora (tylko komputery z myszą, wyłączony przy "ogranicz ruch"): plama podąża za kursorem i rozświetla siatkę
(function(){
 if(!window.matchMedia||!matchMedia("(hover:hover) and (pointer:fine)").matches||matchMedia("(prefers-reduced-motion:reduce)").matches)return;
 const blob=document.createElement("div"),grid=document.createElement("div");
 blob.className="cur-blob";grid.className="cur-grid";blob.setAttribute("aria-hidden","true");grid.setAttribute("aria-hidden","true");
 document.body.appendChild(blob);document.body.appendChild(grid);
 let tx=innerWidth/2,ty=innerHeight/2,x=tx,y=ty,on=false;
 addEventListener("mousemove",e=>{tx=e.clientX;ty=e.clientY;if(!on){on=true;x=tx;y=ty;document.body.classList.add("cur-on")}},{passive:true});
 document.addEventListener("mouseleave",()=>{on=false;document.body.classList.remove("cur-on")});
 (function loop(){
  x+=(tx-x)*.12;y+=(ty-y)*.12;
  blob.style.transform="translate("+(x-110)+"px,"+(y-110)+"px)";
  grid.style.setProperty("--mx",tx+"px");grid.style.setProperty("--my",ty+"px");
  requestAnimationFrame(loop)})();
})();

// przełącznik motywu: zapamiętuje wybór w przeglądarce; bez wyboru działa motyw systemowy
(function(){
 const btn=document.getElementById("theme"),lab=document.getElementById("theme-l"),root=document.documentElement;
 const sys=()=>window.matchMedia&&matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light";
 const cur=()=>root.dataset.theme||sys();
 const paint=()=>{const d=cur()==="dark";lab.textContent=d?"Jasny":"Ciemny";btn.setAttribute("aria-label",d?"Włącz jasny motyw":"Włącz ciemny motyw");btn.setAttribute("aria-pressed",d)};
 btn.onclick=()=>{const n=cur()==="dark"?"light":"dark";root.classList.add("theme-anim");root.dataset.theme=n;
  try{localStorage.setItem("pdp_theme",n)}catch(e){}paint();setTimeout(()=>root.classList.remove("theme-anim"),400)};
 if(window.matchMedia)matchMedia("(prefers-color-scheme:dark)").addEventListener?.("change",paint);
 paint();
})();

// ===== Wydarzenia w sali (sekcja "Wydarzenia" na stronie głównej; tabela venue_events) =====
// Administrator dodaje je w panelu pod listą; daty wydarzeń są też zajęte w kalendarzu rezerwacji.
const FB_PAGE="https://www.facebook.com/Bodycamfan";
let VROWS=[],vEditId=null;
const VF={date:"vdate",title:"vtitle",time_text:"vtime",description:"vdesc",fb_url:"vfb"};
function drawV(){
 const box=$("vlist");box.innerHTML="";
 const isAdm=isAdmin();
 // wydarzenia sali + wydarzenia r4b4n (z kalendarza r4b4n), posortowane po dacie
 const r4rows=Object.keys(EV).map(k=>({...(EVD[k]||{}),event_date:k,title:EV[k],_r4:true}));
 const rows=[...VROWS,...r4rows].filter(r=>(isAdm&&!r._r4)||String(r.event_date).slice(0,10)>=todayKey)
  .sort((a,b)=>String(a.event_date)<String(b.event_date)?-1:1);
 if(!rows.length){const p=document.createElement("p");p.className="vempty";p.append("Brak zaplanowanych wydarzeń. Zajrzyj na ");
  const a=document.createElement("a");a.href=FB_PAGE;a.target="_blank";a.rel="noopener";a.textContent="nasz Facebook ↗";p.append(a);box.append(p)}
 rows.forEach(r=>{const k=String(r.event_date).slice(0,10);
  const c=document.createElement("article");c.className="vcard"+(k<todayKey?" past":"")+(r._r4?" r4":"");
  const ph=document.createElement("div");ph.className="vposter";
  if(r.poster_url){const im=document.createElement("img");im.src=r.poster_url;im.alt="Plakat: "+r.title;im.loading="lazy";ph.append(im)}
  else{ph.classList.add("noimg");const s=document.createElement("span");s.textContent=+k.slice(8,10)+"."+k.slice(5,7);ph.append(s)}
  const body=document.createElement("div");body.className="vbody";
  const dt=new Date(+k.slice(0,4),+k.slice(5,7)-1,+k.slice(8,10));
  const d=document.createElement("p");d.className="vdate";d.textContent=DNE[dt.getDay()]+", "+fmt(k)+(r.time_text?" · "+r.time_text:"");
  const h=document.createElement("h3");h.textContent=r.title;
  body.append(d,h);
  if(r.description){const t=document.createElement("p");t.className="vdesc";t.textContent=r.description;body.append(t)}
  if(r._r4){const t=document.createElement("p");t.className="vtag";t.textContent="r4b4n";body.insertBefore(t,body.firstChild)}
  const lk=document.createElement("p");lk.className="vlinks";
  const a=document.createElement("button");a.type="button";a.className="btn";a.textContent="Szczegóły ↗";a.onclick=()=>openEvent(k);lk.append(a);
  ph.classList.add("click");ph.onclick=()=>openEvent(k);
  body.append(lk);
  if(r.fb_url){const f=document.createElement("a");f.className="btn";f.href=r.fb_url;f.target="_blank";f.rel="noopener";f.textContent="Facebook ↗";lk.append(f)}
  if(isAdm&&!r._r4){const act=document.createElement("p");act.className="vadm";
   const e=document.createElement("button");e.className="btn";e.textContent="Edytuj";e.onclick=()=>editVenue(r);
   const x=document.createElement("button");x.className="btn";x.textContent="Usuń";x.onclick=()=>delVenue(r);act.append(e,x);
   if(r.poster_url){const z=document.createElement("button");z.className="btn";z.textContent="Usuń plakat";z.onclick=()=>delVenuePoster(r);act.append(z)}
   body.append(act)}
  c.append(ph,body);box.append(c)});
 $("vadm").hidden=!isAdm;updAdminBar()}
async function loadVenue(){
 try{const x=await fetch(SUPABASE_URL+"/rest/v1/venue_events?select=*&order=event_date.asc",{headers:HDR});
  if(x.ok){VROWS=await x.json();VEV={};VROWS.forEach(r=>{VEV[String(r.event_date).slice(0,10)]=r.title})}}
 catch(e){console.error("venue_events:",e)}
 drawV();try{if(sel&&VEV[sel]){sel=null;showSel()}draw();list()}catch(e){}
 try{openFromHash()}catch(e){}}
function resetVenueForm(){vEditId=null;Object.values(VF).forEach(i=>$(i).value="");$("vposter").value="";
 $("vadd").textContent="Dodaj wydarzenie ↗";$("vcancel").hidden=true;$("vform-h").textContent="Dodaj wydarzenie (panel administratora)"}
function editVenue(r){vEditId=r.id;Object.entries(VF).forEach(([k,i])=>$(i).value=(k==="date"?r.event_date:r[k])||"");
 $("vadd").textContent="Zapisz zmiany ↗";$("vcancel").hidden=false;$("vform-h").textContent="Edytujesz: "+fmt(String(r.event_date))+" · "+r.title;
 $("vadm").scrollIntoView({behavior:"smooth",block:"center"});$("vtitle").focus()}
$("vcancel").onclick=()=>{resetVenueForm();$("vmsg").textContent=""};
// usuwa plakat wydarzenia sali (zostaje data i nazwa); plik z folderu posters jest kasowany, jeśli tam leży
async function delVenuePoster(r){if(!confirm("Usunąć plakat wydarzenia "+fmt(String(r.event_date))+" ("+r.title+")?"))return;
 const x=await fetch(SUPABASE_URL+"/rest/v1/venue_events?id=eq."+r.id,{method:"PATCH",headers:{...AH(),"Prefer":"return=minimal"},body:JSON.stringify({poster_url:null})});
 if(!x.ok){alert("Nie udało się usunąć plakatu (HTTP "+x.status+").");return}
 const pre=SUPABASE_URL+"/storage/v1/object/public/posters/";
 if(r.poster_url&&r.poster_url.startsWith(pre)){try{await fetch(SUPABASE_URL+"/storage/v1/object/posters/"+r.poster_url.slice(pre.length),{method:"DELETE",headers:{"apikey":SUPABASE_KEY,"Authorization":"Bearer "+adminTok}})}catch(e){}}
 await loadVenue()}
async function delVenue(r){if(!confirm("Usunąć wydarzenie "+fmt(String(r.event_date))+" ("+r.title+")?"))return;
 const x=await fetch(SUPABASE_URL+"/rest/v1/venue_events?id=eq."+r.id,{method:"DELETE",headers:{...AH(),"Prefer":"return=minimal"}});
 if(!x.ok){alert("Nie udało się usunąć (HTTP "+x.status+").");return}
 resetVenueForm();await loadVenue()}
$("vadd").onclick=async()=>{
 const v=i=>$(i).value.trim(),m=$("vmsg"),btn=$("vadd");
 const d=v("vdate"),t=v("vtitle"),fb=v("vfb");
 if(!d||!t){m.textContent="Podaj datę i nazwę wydarzenia.";return}
 if(fb&&!/^https?:\/\//.test(fb)){m.textContent="Link do Facebooka musi zaczynać się od https://";return}
 const body={event_date:d,title:t,time_text:v("vtime")||null,description:v("vdesc")||null,fb_url:fb||null};
 btn.disabled=true;m.textContent="Zapisywanie…";
 try{const f=$("vposter").files[0];if(f){m.textContent="Wysyłanie plakatu…";body.poster_url=await uploadPoster(f,"sala-"+d)}
  const x=await fetch(SUPABASE_URL+"/rest/v1/venue_events"+(vEditId?"?id=eq."+vEditId:""),{method:vEditId?"PATCH":"POST",headers:{...AH(),"Prefer":"return=minimal"},body:JSON.stringify(body)});
  if(x.status===401||x.status===403){m.textContent="Sesja wygasła. Odśwież stronę albo zaloguj się ponownie.";return}
  if(!x.ok)throw new Error("HTTP "+x.status+" "+(await x.text()).slice(0,120));
  m.textContent=vEditId?"Zapisano zmiany.":"Dodano.";resetVenueForm();await loadVenue()}
 catch(e){m.textContent="Nie udało się zapisać ("+e.message+")."}
 finally{btn.disabled=false}};

// ===== Zapamiętanie komputera administratora =====
// Po zaznaczeniu "Zapamiętaj ten komputer" przeglądarka trzyma token odświeżania (localStorage) i sama odnawia sesję;
// na innych urządzeniach nadal trzeba się zalogować. "Wyloguj" usuwa zapamiętanie.
const RT_KEY="pdp_adm_rt";let rtTimer=null;
async function refreshAdmin(){
 let rt=null;try{rt=localStorage.getItem(RT_KEY)}catch(e){}
 if(!rt)return false;
 try{const x=await fetch(SUPABASE_URL+"/auth/v1/token?grant_type=refresh_token",{method:"POST",headers:{"apikey":SUPABASE_KEY,"Content-Type":"application/json"},body:JSON.stringify({refresh_token:rt})});
  if(!x.ok){if(x.status===400||x.status===401){try{localStorage.removeItem(RT_KEY)}catch(e){}}return false}
  const j=await x.json();adminTok=j.access_token;
  try{sessionStorage.setItem("pdp_adm",adminTok);localStorage.setItem(RT_KEY,j.refresh_token)}catch(e){}
  clearTimeout(rtTimer);rtTimer=setTimeout(refreshAdmin,Math.max(60,(j.expires_in||3600)-300)*1000);
  return true}
 catch(e){return false}}
function rememberAfterLogin(j){
 if(!$("adm-remember")||!$("adm-remember").checked)return;
 try{localStorage.setItem(RT_KEY,j.refresh_token)}catch(e){}
 clearTimeout(rtTimer);rtTimer=setTimeout(refreshAdmin,Math.max(60,(j.expires_in||3600)-300)*1000)}
document.addEventListener("visibilitychange",async()=>{if(document.hidden)return;let rt=null;try{rt=localStorage.getItem(RT_KEY)}catch(e){}
 if(rt&&adminTok){try{const exp=JSON.parse(atob(adminTok.split(".")[1].replace(/-/g,"+").replace(/_/g,"/"))).exp*1000;if(exp-Date.now()<300000){await refreshAdmin();await loadAdmin();list();drawE();drawV()}}catch(e){}}});
(async()=>{if(await refreshAdmin()){await loadAdmin();list();drawE();drawV()}})();
loadVenue();

// ===== Podgląd jako gość =====
// Zalogowany administrator może ukryć wszystkie elementy panelu i zobaczyć stronę tak jak odwiedzający (bez wylogowania).
let guestPreview=false;try{guestPreview=sessionStorage.getItem("pdp_preview")==="1"}catch(e){}
function isAdmin(){try{return !!adminTok&&!guestPreview}catch(e){return false}}
const abar=document.createElement("div");abar.className="abar";abar.hidden=true;
abar.innerHTML='<span class="abar-t"></span><button type="button" class="btn abar-tog"></button>';
document.body.appendChild(abar);
function updAdminBar(){let on=false;try{on=!!adminTok}catch(e){}
 abar.hidden=!on;document.body.classList.toggle("preview",on&&guestPreview);
 abar.querySelector(".abar-t").textContent=guestPreview?"Podgląd jako gość":"Tryb administratora";
 abar.querySelector(".abar-tog").textContent=guestPreview?"Wróć do panelu":"Podgląd jako gość"}
abar.querySelector(".abar-tog").onclick=()=>{guestPreview=!guestPreview;try{sessionStorage.setItem("pdp_preview",guestPreview?"1":"0")}catch(e){}
 list();drawE();drawV()};
updAdminBar();

// ===== Strona główna: ściana zdjęć z podglądem na pełnym ekranie =====
(function(){
 const wall=document.getElementById("wall");if(!wall)return;
 const tiles=[...wall.querySelectorAll(".wtile")],thumbs=tiles.map(t=>t.querySelector("img").getAttribute("src")),srcs=thumbs.map(u=>u.replace("/sm/","/"));   // podgląd: pełna rozdzielczość, miniatury: małe pliki
 const lb=document.getElementById("lb"),img=document.getElementById("lb-img"),num=document.getElementById("lb-n"),th=document.getElementById("lb-th");
 let cur=0,back=null;
 // "+N" na ostatnim widocznym kafelku (liczba widocznych zależy od szerokości ekranu)
 function markMore(){tiles.forEach(t=>t.removeAttribute("data-more"));
  const vis=tiles.filter(t=>getComputedStyle(t).display!=="none");const rest=tiles.length-vis.length;
  if(rest>0)vis[vis.length-1].setAttribute("data-more","+"+(rest+1))}
 markMore();addEventListener("resize",markMore);
 srcs.forEach((s,i)=>{const b=document.createElement("button");b.type="button";b.setAttribute("aria-label","Zdjęcie "+(i+1));
  const m=document.createElement("img");m.src=thumbs[i];m.alt="";m.loading="lazy";b.append(m);b.onclick=()=>show(i);th.append(b)});
 function show(i){cur=(i+srcs.length)%srcs.length;img.src=srcs[cur];img.alt=tiles[cur].querySelector("img").alt;
  num.textContent=(cur+1)+" / "+srcs.length+" · Przystanek Duży Pokój";
  [...th.children].forEach((b,j)=>b.classList.toggle("on",j===cur));th.children[cur].scrollIntoView({block:"nearest",inline:"center"});
  new Image().src=srcs[(cur+1)%srcs.length]}
 function open(i){back=document.activeElement;lb.hidden=false;document.body.classList.add("modal-on");show(i);document.getElementById("lb-x").focus()}
 function close(){lb.hidden=true;document.body.classList.remove("modal-on");if(back&&back.focus)back.focus()}
 tiles.forEach((t,i)=>t.onclick=()=>open(i));
 document.getElementById("lb-x").onclick=close;
 document.getElementById("lb-prev").onclick=()=>show(cur-1);
 document.getElementById("lb-next").onclick=()=>show(cur+1);
 lb.addEventListener("click",e=>{if(e.target===lb||e.target.id==="lb-main")close()});
 addEventListener("keydown",e=>{if(lb.hidden)return;if(e.key==="Escape")close();else if(e.key==="ArrowRight")show(cur+1);else if(e.key==="ArrowLeft")show(cur-1)});
 // przesuwanie palcem
 let x0=null;const main=document.getElementById("lb-main");
 main.addEventListener("touchstart",e=>{x0=e.touches[0].clientX},{passive:true});
 main.addEventListener("touchend",e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>45)show(cur+(dx<0?1:-1));x0=null},{passive:true});
})();

// ===== Licznik odwiedzin (anonimowy, bez cookies) – widoczny tylko w pasku administratora =====
// Każda zakładka liczy się raz na sesję przeglądarki; wizyty z komputera administratora (zapamiętanego) nie są liczone.
function trackView(v){
 try{if(localStorage.getItem("pdp_adm_rt")||sessionStorage.getItem("pdp_adm"))return;
  const key="pdp_seen_"+v;if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,"1")}catch(e){}
 if(/^(localhost|127\.)/.test(location.hostname))return;
 fetch(SUPABASE_URL+"/rest/v1/rpc/track_visit",{method:"POST",headers:HDR,body:JSON.stringify({p_view:v}),keepalive:true}).catch(()=>{})}
const VIEW_PL={start:"Start",rezerwacje:"Rezerwacje",r4b4n:"r4b4n",prywatnosc:"Prywatność",inne:"inne"};
async function loadStats(){const box=document.getElementById("abar-stats");if(!box)return;
 try{const x=await fetch(SUPABASE_URL+"/rest/v1/rpc/visit_stats",{method:"POST",headers:AH(),body:"{}"});
  if(!x.ok)throw new Error(x.status);const s=(await x.json())[0]||{};
  box.querySelector(".st-sum").textContent="Odwiedziny: dziś "+s.today+" · 7 dni "+s.last7+" · 30 dni "+s.last30;
  const det=box.querySelector(".st-det");det.innerHTML="";
  const days=s.per_day||[],max=Math.max(1,...days.map(d=>d.views));
  const ch=document.createElement("div");ch.className="st-chart";ch.title="Ostatnie 14 dni";
  for(let i=13;i>=0;i--){const dd=new Date(Date.now()-i*864e5),k=dd.getFullYear()+"-"+pad(dd.getMonth()+1)+"-"+pad(dd.getDate());
   const v=(days.find(d=>d.day===k)||{}).views||0,b=document.createElement("i");b.style.height=Math.round(4+40*v/max)+"px";b.title=fmt(k)+": "+v;ch.append(b)}
  const pv=document.createElement("p");pv.textContent="30 dni wg zakładek: "+Object.entries(s.per_view||{}).sort((a,b)=>b[1]-a[1]).map(([k,v])=>(VIEW_PL[k]||k)+" "+v).join(" · ")+" · łącznie "+s.total;
  det.append(ch,pv)}
 catch(e){box.querySelector(".st-sum").textContent="Odwiedziny: brak danych"}}
(function(){const box=document.createElement("button");box.type="button";box.id="abar-stats";box.className="abar-stats";
 box.innerHTML='<span class="st-sum">Odwiedziny…</span><span class="st-det"></span>';box.onclick=()=>box.classList.toggle("open");
 abar.insertBefore(box,abar.firstChild);
 const upd=updAdminBar;updAdminBar=function(){upd();if(!abar.hidden&&!box.dataset.loaded){box.dataset.loaded="1";loadStats()}if(abar.hidden)delete box.dataset.loaded};
 updAdminBar()})();

