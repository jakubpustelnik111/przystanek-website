// Wysyłka rezerwacji na e-mail jest na razie wyłączona (do dopracowania).
// Rezerwacje zapisują się tylko w przeglądarce użytkownika (localStorage).
const V=["start","rezerwacje","r4b4n"];
function show(){let h=(location.hash||"#start").slice(1);if(!V.includes(h))h="start";
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
// kalendarz wydarzeń r4b4n (tylko podgląd, bez rezerwacji)
// Dodawaj kolejne wydarzenia w formacie "RRRR-MM-DD":"Nazwa"
const EVENTS={"2026-11-14":"2Faces first edition"};
(function(){
 const MNE=["Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec","Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"];
 const pad=n=>String(n).padStart(2,"0"),today=new Date();
 const todayK=today.getFullYear()+"-"+pad(today.getMonth()+1)+"-"+pad(today.getDate());
 const keys=Object.keys(EVENTS).sort(),first=keys.find(k=>k>=todayK)||keys[0];
 let ey=first?+first.slice(0,4):today.getFullYear(),em=first?+first.slice(5,7)-1:today.getMonth(),picked=first||null;
 const fmt=k=>+k.slice(8)+"."+k.slice(5,7)+"."+k.slice(0,4);
 function drawE(){
  const cal=document.getElementById("ecal");cal.innerHTML="";
  document.getElementById("emon").textContent=MNE[em]+" "+ey;
  ["Pn","Wt","Śr","Cz","Pt","So","Nd"].forEach(d=>{const e=document.createElement("div");e.className="dn";e.textContent=d;cal.appendChild(e)});
  const off=(new Date(ey,em,1).getDay()+6)%7,n=new Date(ey,em+1,0).getDate();
  for(let i=0;i<off;i++)cal.appendChild(document.createElement("div"));
  for(let d=1;d<=n;d++){const k=ey+"-"+pad(em+1)+"-"+pad(d);
   if(EVENTS[k]){const b=document.createElement("button");b.textContent=d;b.className="ev"+(k===picked?" sel":"");b.title=EVENTS[k];
    b.onclick=()=>{picked=k;drawE()};cal.appendChild(b)}
   else{const c=document.createElement("div");c.textContent=d;c.className="plain";cal.appendChild(c)}}
  document.getElementById("einfo").textContent=picked?fmt(picked)+" · "+EVENTS[picked]:"Brak zaplanowanych wydarzeń.";
 }
 document.getElementById("eprev").onclick=()=>{em--;if(em<0){em=11;ey--}drawE()};
 document.getElementById("enext").onclick=()=>{em++;if(em>11){em=0;ey++}drawE()};
 drawE();
})();
// rezerwacje
// Wspólna baza zajętych terminów (Supabase). Uzupełnij dwie wartości po założeniu projektu
// (instrukcja w README.md, SQL w supabase-setup.sql). Bez nich rezerwacje zapisują się tylko lokalnie.
const SUPABASE_URL="https://pdexenoprsleniazvxic.supabase.co";
const SUPABASE_KEY="sb_publishable_6B-_YhuJh7PJSIOEyr06Nw_CmaHKmQc";  // klucz publiczny, przeznaczony do użycia w kodzie strony
const DB_ON=!!(SUPABASE_URL&&SUPABASE_KEY);
const HDR={"apikey":SUPABASE_KEY,"Content-Type":"application/json"};
if(SUPABASE_KEY.startsWith("eyJ"))HDR.Authorization="Bearer "+SUPABASE_KEY;
const MN=["Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec","Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"];
let res=[];try{res=JSON.parse(localStorage.getItem("pdp_res")||"[]")}catch(e){}
function save(){try{localStorage.setItem("pdp_res",JSON.stringify(res))}catch(e){}}
let busy=new Set(res.map(r=>r.date));
let now=new Date(),y=now.getFullYear(),m=now.getMonth(),sel=null;
const iso=(a,b,c)=>a+"-"+String(b+1).padStart(2,"0")+"-"+String(c).padStart(2,"0");
async function loadBusy(){
 if(!DB_ON){busy=new Set(res.map(r=>r.date));draw();list();return}
 try{const x=await fetch(SUPABASE_URL+"/rest/v1/rpc/busy_dates",{method:"POST",headers:HDR,body:"{}"});
  if(!x.ok)throw new Error("HTTP "+x.status);
  busy=new Set((await x.json()).map(r=>String(r.event_date).slice(0,10)))}
 catch(e){document.getElementById("msg").textContent="Nie udało się pobrać zajętych terminów. Odśwież stronę."}
 await loadAdmin();draw();list()}
function draw(){const cal=document.getElementById("cal");cal.innerHTML="";
 document.getElementById("mon").textContent=MN[m]+" "+y;
 ["Pn","Wt","Śr","Cz","Pt","So","Nd"].forEach(d=>{const e=document.createElement("div");e.className="dn";e.textContent=d;cal.appendChild(e)});
 const off=(new Date(y,m,1).getDay()+6)%7,n=new Date(y,m+1,0).getDate(),today=iso(now.getFullYear(),now.getMonth(),now.getDate());
 for(let i=0;i<off;i++)cal.appendChild(document.createElement("div"));
 for(let d=1;d<=n;d++){const k=iso(y,m,d),b=document.createElement("button");b.textContent=d;
  const isBusy=busy.has(k);
  if(k<today||isBusy)b.disabled=true;if(isBusy)b.classList.add("busy");if(k===sel)b.classList.add("sel");
  b.onclick=()=>{sel=k;document.getElementById("chosen").textContent="Wybrana data: "+d+" "+MN[m].toLowerCase()+" "+y;draw()};cal.appendChild(b)}}
document.getElementById("prev").onclick=()=>{m--;if(m<0){m=11;y--}draw()};
document.getElementById("next").onclick=()=>{m++;if(m>11){m=0;y++}draw()};
// panel administratora: logowanie przez Supabase Auth, podgląd danych i usuwanie terminów
let adminTok=null;try{adminTok=sessionStorage.getItem("pdp_adm")}catch(e){}
let adminRows=null;
const AH=()=>({"apikey":SUPABASE_KEY,"Content-Type":"application/json","Authorization":"Bearer "+adminTok});
function logoutAdmin(){adminTok=null;adminRows=null;try{sessionStorage.removeItem("pdp_adm")}catch(e){}list()}
async function loadAdmin(){
 if(!DB_ON||!adminTok){adminRows=null;return}
 try{const x=await fetch(SUPABASE_URL+"/rest/v1/reservations?select=id,event_date,title,name,email,phone,note&order=event_date.asc",{headers:AH()});
  if(x.status===401||x.status===403){logoutAdmin();return}
  if(!x.ok)throw new Error("HTTP "+x.status);
  adminRows=await x.json()}
 catch(e){adminRows=null}}
async function removeRes(row){
 const msg=document.getElementById("adm-msg");
 if(!confirm("Usunąć termin "+fmtD(row.event_date||row.date)+" ("+row.title+")?"))return;
 if(!DB_ON){res=res.filter(r=>r!==row);save();busy=new Set(res.map(r=>r.date));draw();list();return}
 try{const x=await fetch(SUPABASE_URL+"/rest/v1/reservations?id=eq."+row.id,{method:"DELETE",headers:{...AH(),"Prefer":"return=minimal"}});
  if(x.status===401||x.status===403){logoutAdmin();alert("Sesja wygasła. Zaloguj się ponownie.");return}
  if(!x.ok)throw new Error("HTTP "+x.status)}
 catch(e){alert("Nie udało się usunąć terminu. Spróbuj ponownie.");return}
 await loadAdmin();await loadBusy()}
const fmtD=k=>+String(k).slice(8,10)+"."+String(k).slice(5,7)+"."+String(k).slice(0,4);
function list(){const l=document.getElementById("list");l.innerHTML="";
 const today=iso(now.getFullYear(),now.getMonth(),now.getDate());
 const adm=DB_ON&&adminTok&&adminRows;
 document.getElementById("admlink").hidden=!!adm||!DB_ON;document.getElementById("admout").hidden=!adm;
 document.getElementById("adm").hidden=!!adm||!DB_ON||document.getElementById("adm").dataset.open!=="1";
 // wiersze do wyświetlenia: administrator (baza) widzi szczegóły, w trybie lokalnym użytkownik zarządza swoimi wpisami
 const rows=adm?adminRows:(!DB_ON?res.map(r=>({...r,event_date:r.date,_loc:r})):null);
 if(rows){
  if(!rows.length){l.textContent="Brak zajętych terminów.";return}
  [...rows].sort((a,b)=>a.event_date<b.event_date?-1:1).forEach(r=>{
   const d=document.createElement("div");d.style.cssText="display:flex;justify-content:space-between;gap:12px;align-items:flex-start";
   const t=document.createElement("span");
   t.textContent=fmtD(r.event_date)+" · "+r.title+" · "+r.name+(adm?" · "+r.email+(r.phone&&r.phone!=="-"?" · "+r.phone:"")+(r.note&&r.note!=="-"?" · "+r.note:""):"");
   const b=document.createElement("button");b.className="btn";b.textContent="Usuń";b.style.padding="6px 10px";b.onclick=()=>removeRes(adm?r:r._loc);
   d.appendChild(t);d.appendChild(b);l.appendChild(d)});return}
 const ds=[...busy].filter(k=>k>=today).sort();
 if(!ds.length){l.textContent="Brak zajętych terminów.";return}
 ds.forEach(k=>{const d=document.createElement("div");d.textContent=fmtD(k)+" · zajęty";l.appendChild(d)})}
document.getElementById("admlink").onclick=e=>{e.preventDefault();const a=document.getElementById("adm");a.dataset.open="1";a.hidden=false}
document.getElementById("admout").onclick=e=>{e.preventDefault();logoutAdmin()};
document.getElementById("adm-login").onclick=async()=>{
 const msg=document.getElementById("adm-msg"),btn=document.getElementById("adm-login");
 const email=document.getElementById("adm-mail").value.trim(),pass=document.getElementById("adm-pass").value;
 if(!email||!pass){msg.textContent="Podaj e-mail i hasło.";return}
 btn.disabled=true;msg.textContent="Logowanie…";
 try{const x=await fetch(SUPABASE_URL+"/auth/v1/token?grant_type=password",{method:"POST",headers:{"apikey":SUPABASE_KEY,"Content-Type":"application/json"},body:JSON.stringify({email,password:pass})});
  if(!x.ok)throw new Error("login");
  adminTok=(await x.json()).access_token;try{sessionStorage.setItem("pdp_adm",adminTok)}catch(e){}
  document.getElementById("adm-pass").value="";msg.textContent="";
  await loadAdmin();list()}
 catch(e){msg.textContent="Nie udało się zalogować. Sprawdź e-mail i hasło."}
 finally{btn.disabled=false}};
document.getElementById("send").onclick=async()=>{const g=id=>document.getElementById(id).value.trim(),msg=document.getElementById("msg");
 if(!sel){msg.textContent="Najpierw wybierz datę w kalendarzu.";return}
 if(!g("f-title")||!g("f-name")||!g("f-mail")){msg.textContent="Uzupełnij tytuł, imię i nazwisko oraz e-mail.";return}
 const r={date:sel,title:g("f-title"),name:g("f-name"),mail:g("f-mail"),tel:g("f-tel"),note:g("f-note")};
 const btn=document.getElementById("send");btn.disabled=true;
 try{
  if(DB_ON){
   msg.textContent="Zapisywanie…";
   const x=await fetch(SUPABASE_URL+"/rest/v1/reservations",{method:"POST",headers:{...HDR,"Prefer":"return=minimal"},
    body:JSON.stringify({event_date:r.date,title:r.title,name:r.name,email:r.mail,phone:r.tel||null,note:r.note||null})});
   if(x.status===409){sel=null;document.getElementById("chosen").textContent="Wybrana data: brak";await loadBusy();msg.textContent="Ten termin został przed chwilą zajęty. Wybierz inną datę.";return}
   if(!x.ok)throw new Error("HTTP "+x.status);
  }else{res.push(r);save()}
  busy.add(r.date);
  msg.textContent="Dziękujemy! Rezerwacja na "+r.date+" została zapisana.";sel=null;
  document.getElementById("chosen").textContent="Wybrana data: brak";["f-title","f-name","f-mail","f-tel","f-note"].forEach(i=>document.getElementById(i).value="");draw();list();
 }catch(e){msg.textContent="Nie udało się zapisać rezerwacji. Spróbuj ponownie za chwilę."}
 finally{btn.disabled=false}};
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&DB_ON)loadBusy()});
loadBusy();
