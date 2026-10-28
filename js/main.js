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
// kalendarz wydarzeń r4b4n: daty zapisane w bazie (tabela r4b4n_events), administrator dodaje i usuwa je pod kalendarzem
// Zapasowa lista, używana gdy baza jest niedostępna: "RRRR-MM-DD":"Nazwa"
const EVENTS={"2026-11-14":"2Faces first edition"};
let EV={...EVENTS},EVID={};
const MNE=["Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec","Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"];
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
  if(EV[k]){const b=document.createElement("button");b.textContent=d;b.className="ev"+(k===picked?" sel":"");b.title=EV[k];
   b.onclick=()=>{picked=k;drawE()};cal.appendChild(b)}
  else{const c=document.createElement("div");c.textContent=d;c.className="plain";cal.appendChild(c)}}
 document.getElementById("einfo").textContent=picked&&EV[picked]?fmt(picked)+" · "+EV[picked]:"Brak zaplanowanych wydarzeń.";
 let isAdm=false;try{isAdm=!!adminTok&&DB_ON}catch(e){}
 document.getElementById("eadm").hidden=!isAdm;
 document.getElementById("edel").hidden=!(isAdm&&picked&&EVID[picked]);
}
document.getElementById("eprev").onclick=()=>{em--;if(em<0){em=11;ey--}drawE()};
document.getElementById("enext").onclick=()=>{em++;if(em>11){em=0;ey++}drawE()};
async function loadEvents(keep){
 if(DB_ON){try{const x=await fetch(SUPABASE_URL+"/rest/v1/r4b4n_events?select=id,event_date,title&order=event_date.asc",{headers:HDR});
  if(x.ok){const rows=await x.json();EV={};EVID={};rows.forEach(r=>{const k=String(r.event_date).slice(0,10);EV[k]=r.title;EVID[k]=r.id})}}catch(e){console.error("r4b4n_events:",e)}}
 if(!keep||!EV[picked])pickFirst();
 drawE()}
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
const EMAILJS={service:"service_eps05b4",template:"template_0ctif7a",key:"dQ49Nuh02xl2ElqT1"};
const MN=["Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec","Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"];
const iso=(a,b,c)=>a+"-"+String(b+1).padStart(2,"0")+"-"+String(c).padStart(2,"0");
const fmtD=k=>+String(k).slice(8,10)+"."+String(k).slice(5,7)+"."+String(k).slice(0,4);
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
  if(sel&&busy.has(sel)){sel=null}}
 catch(e){console.error("busy_dates:",e);$("msg").textContent="Nie udało się pobrać zajętych terminów ("+e.message+"). Odśwież stronę."}
 await loadAdmin();showSel();draw();list()}
function draw(){const cal=$("cal");cal.innerHTML="";
 $("mon").textContent=MN[m]+" "+y;
 ["Pn","Wt","Śr","Cz","Pt","So","Nd"].forEach(d=>{const e=document.createElement("div");e.className="dn";e.textContent=d;cal.appendChild(e)});
 const off=(new Date(y,m,1).getDay()+6)%7,n=new Date(y,m+1,0).getDate();
 for(let i=0;i<off;i++)cal.appendChild(document.createElement("div"));
 for(let d=1;d<=n;d++){const k=iso(y,m,d),b=document.createElement("button");b.textContent=d;
  const isBusy=busy.has(k);
  if(k<todayKey||isBusy)b.disabled=true;if(isBusy){b.classList.add("busy");b.title=busy.get(k)||"Zajęty"}
  if(k===todayKey)b.classList.add("today");if(k===sel)b.classList.add("sel");
  b.onclick=()=>{sel=k;showSel();draw()};cal.appendChild(b)}}
$("prev").onclick=()=>{m--;if(m<0){m=11;y--}draw()};
$("next").onclick=()=>{m++;if(m>11){m=0;y++}draw()};
// panel administratora: logowanie przez Supabase Auth; potwierdzanie, opis publiczny, usuwanie
let adminTok=null;try{adminTok=sessionStorage.getItem("pdp_adm")}catch(e){}
let adminRows=null;
const AH=()=>({"apikey":SUPABASE_KEY,"Content-Type":"application/json","Authorization":"Bearer "+adminTok});
function logoutAdmin(){adminTok=null;adminRows=null;try{sessionStorage.removeItem("pdp_adm")}catch(e){}list();drawE()}
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
 const adm=adminTok&&adminRows;
 $("admlink").hidden=!!adm;$("admout").hidden=!adm;
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
 const ds=[...busy.keys()].filter(k=>k>=todayKey).sort();
 if(!ds.length){l.textContent="Brak zajętych terminów.";return}
 ds.forEach(k=>{const d=document.createElement("div");const desc=busy.get(k);
  const b=document.createElement("b");b.textContent=fmtD(k);d.append(b,document.createTextNode(" · "+(desc||"zajęty")));
  if(desc)d.className="open";l.appendChild(d)})}
$("admlink").onclick=e=>{e.preventDefault();const a=$("adm");a.dataset.open="1";a.hidden=false}
$("admout").onclick=e=>{e.preventDefault();logoutAdmin()};
$("adm-login").onclick=async()=>{
 const msg=$("adm-msg"),btn=$("adm-login");
 const email=$("adm-mail").value.trim(),pass=$("adm-pass").value;
 if(!email||!pass){msg.textContent="Podaj e-mail i hasło.";return}
 btn.disabled=true;msg.textContent="Logowanie…";
 try{const x=await fetch(SUPABASE_URL+"/auth/v1/token?grant_type=password",{method:"POST",headers:{"apikey":SUPABASE_KEY,"Content-Type":"application/json"},body:JSON.stringify({email,password:pass})});
  if(!x.ok)throw new Error("login");
  adminTok=(await x.json()).access_token;try{sessionStorage.setItem("pdp_adm",adminTok)}catch(e){}
  $("adm-pass").value="";msg.textContent="";
  await loadAdmin();list();drawE()}
 catch(e){msg.textContent="Nie udało się zalogować. Sprawdź e-mail i hasło."}
 finally{btn.disabled=false}};
$("f-open").onchange=()=>{$("f-pub-wrap").hidden=!$("f-open").checked};
async function sendMail(p){
 const x=await fetch("https://api.emailjs.com/api/v1.0/email/send",{method:"POST",headers:{"Content-Type":"application/json"},
  body:JSON.stringify({service_id:EMAILJS.service,template_id:EMAILJS.template,user_id:EMAILJS.key,template_params:p})});
 if(!x.ok)throw new Error("EmailJS "+x.status+" "+(await x.text()).slice(0,120))}
$("send").onclick=async()=>{const g=id=>$(id).value.trim(),msg=$("msg");
 if(!sel){msg.textContent="Najpierw wybierz datę w kalendarzu.";return}
 const r={date:sel,title:g("f-title"),mail:g("f-mail"),phone:g("f-phone"),details:g("f-note"),open:$("f-open").checked,pub:g("f-pub")};
 if(!r.title||!r.mail||!r.phone){msg.textContent="Uzupełnij tytuł wydarzenia, e-mail i numer telefonu.";return}
 if(!/^\S+@\S+\.\S+$/.test(r.mail)){msg.textContent="Sprawdź adres e-mail.";return}
 if(r.open&&!r.pub){msg.textContent="Dopisz opis wydarzenia otwartego albo odznacz tę opcję.";return}
 const btn=$("send");btn.disabled=true;msg.textContent="Wysyłanie…";
 try{
  const x=await fetch(SUPABASE_URL+"/rest/v1/reservations",{method:"POST",headers:{...HDR,"Prefer":"return=minimal"},
   body:JSON.stringify({event_date:r.date,title:r.title,email:r.mail,phone:r.phone,note:r.details||null,is_public:r.open,public_desc:r.open?r.pub:null,status:"pending"})});
  if(!x.ok)throw new Error("HTTP "+x.status+" "+(await x.text()).slice(0,160));
  try{await sendMail({subject:"Rezerwacja – "+fmtD(r.date)+" – "+r.title,date:fmtD(r.date),title:r.title,email:r.mail,reply_to:r.mail,phone:r.phone,
   details:r.details||"-",event_type:r.open?"otwarte":"prywatne",public_desc:r.open?r.pub:"-"})}
  catch(e){console.error("powiadomienie e-mail:",e)}   // prośba i tak jest zapisana w panelu administratora
  msg.textContent="Dziękujemy! Prośba o rezerwację na "+fmtD(r.date)+" została wysłana. Termin zostanie potwierdzony przez właściciela, odpowiemy na podany e-mail.";
  sel=null;showSel();["f-title","f-mail","f-phone","f-note","f-pub"].forEach(i=>$(i).value="");$("f-open").checked=false;$("f-pub-wrap").hidden=true;
  await loadAdmin();draw();list();
 }catch(e){console.error("reservation:",e);msg.textContent="Nie udało się wysłać prośby ("+e.message+"). Spróbuj ponownie za chwilę albo zadzwoń: 607 415 412."}
 finally{btn.disabled=false}};
document.addEventListener("visibilitychange",()=>{if(!document.hidden)loadBusy()});
showSel();draw();
loadBusy();
// r4b4n: dodawanie i usuwanie wydarzeń przez administratora
document.getElementById("eadd").onclick=async()=>{
 const d=document.getElementById("edate").value,t=document.getElementById("etitle").value.trim(),m=document.getElementById("emsg");
 if(!d||!t){m.textContent="Podaj datę i nazwę wydarzenia.";return}
 try{const x=await fetch(SUPABASE_URL+"/rest/v1/r4b4n_events",{method:"POST",headers:{...AH(),"Prefer":"return=minimal"},body:JSON.stringify({event_date:d,title:t})});
  if(x.status===401||x.status===403){logoutAdmin();m.textContent="Sesja wygasła. Zaloguj się ponownie w Rezerwacjach.";drawE();return}
  if(x.status===409){m.textContent="Na ten dzień jest już wydarzenie.";return}
  if(!x.ok)throw new Error("HTTP "+x.status);
  m.textContent="Dodano.";document.getElementById("etitle").value="";picked=d;ey=+d.slice(0,4);em=+d.slice(5,7)-1;await loadEvents(true)}
 catch(e){m.textContent="Nie udało się dodać wydarzenia ("+e.message+")."}};
document.getElementById("edel").onclick=async()=>{
 const m=document.getElementById("emsg");if(!picked||!EVID[picked])return;
 if(!confirm("Usunąć wydarzenie "+fmt(picked)+" ("+EV[picked]+")?"))return;
 try{const x=await fetch(SUPABASE_URL+"/rest/v1/r4b4n_events?id=eq."+EVID[picked],{method:"DELETE",headers:{...AH(),"Prefer":"return=minimal"}});
  if(x.status===401||x.status===403){logoutAdmin();drawE();return}
  if(!x.ok)throw new Error("HTTP "+x.status);
  m.textContent="Usunięto.";await loadEvents(false)}
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
