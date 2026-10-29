// zakładki strony (adres #nazwa); "prywatnosc" nie ma pozycji w menu, link jest w stopce i pod formularzem
const V=["start","rezerwacje","r4b4n","prywatnosc"];
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
// kalendarz wydarzeń r4b4n: daty zapisane w bazie (tabela r4b4n_events), administrator dodaje, edytuje i usuwa je pod kalendarzem
// Kliknięcie wydarzenia otwiera okno z plakatem i informacjami.
// Zapasowa lista, używana gdy baza jest niedostępna: "RRRR-MM-DD":"Nazwa"
const EVENTS={"2026-11-14":"2Faces vol. 1"};
const IG_R4="https://www.instagram.com/_r4b4n_/";
// Szczegóły wydarzeń zapisane w kodzie (uzupełniają dane z bazy; pola wpisane w panelu mają pierwszeństwo)
const EVENT_INFO={
 "2026-11-14":{title:"2Faces vol. 1",poster_url:"img/events/2faces-vol1.jpg",time_text:"20:00–02:00",
  lineup:"Stage 1 · od 20:00: ???, Frano, Grajek\nStage 2 · od 23:00: Kubaswat, Pusty, Rekrut",entry:"20/30 zł",
  description:"Pierwsza edycja cyklu 2FACES: najpierw luźniejszy 1st Face nastawiony na zabawę, potem 2nd Face, w którym jako selektorzy i diggerzy pokazujemy Wam coś nowego. Wpadaj!"}};
let EV={...EVENTS},EVID={},EVD={};
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
  if(EV[k]){const b=document.createElement("button");b.textContent=d;b.className="ev"+(k===picked?" sel":"");b.title=EV[k];
   b.onclick=()=>{picked=k;drawE();openEvent(k)};cal.appendChild(b)}
  else{const c=document.createElement("div");c.textContent=d;c.className="plain";cal.appendChild(c)}}
 const info=document.getElementById("einfo");info.innerHTML="";
 if(picked&&EV[picked]){info.append(fmt(picked)+" · "+EV[picked]+" ");
  const more=document.createElement("button");more.type="button";more.className="emore";more.textContent="Szczegóły ↗";more.onclick=()=>openEvent(picked);info.append(more)}
 else info.textContent="Brak zaplanowanych wydarzeń.";
 let isAdm=false;try{isAdm=!!adminTok&&DB_ON}catch(e){}
 document.getElementById("eadm").hidden=!isAdm;
 document.getElementById("edel").hidden=!(isAdm&&picked&&EVID[picked]);
 document.getElementById("eedit").hidden=!(isAdm&&picked&&EVID[picked]);
}
document.getElementById("eprev").onclick=()=>{em--;if(em<0){em=11;ey--}drawE()};
document.getElementById("enext").onclick=()=>{em++;if(em>11){em=0;ey++}drawE()};
// okno wydarzenia (pop-up)
const evm=document.getElementById("evm");let evmBack=null;
function openEvent(k){if(!EV[k])return;
 const r={...(EVENT_INFO[k]||{}),event_date:k,title:EV[k]};
 Object.entries(EVD[k]||{}).forEach(([a,b])=>{if(b!==null&&b!==""&&a!=="title")r[a]=b});
 const dt=new Date(+k.slice(0,4),+k.slice(5,7)-1,+k.slice(8,10));
 document.getElementById("evm-date").textContent=DNE[dt.getDay()]+", "+fmt(k);
 document.getElementById("evm-title").textContent=r.title;
 const img=document.getElementById("evm-img"),ph=document.getElementById("evm-ph");
 if(r.poster_url){img.src=r.poster_url;img.alt="Plakat: "+r.title;img.hidden=false;ph.hidden=true}else{img.removeAttribute("src");img.hidden=true;ph.hidden=false}
 const dl=document.getElementById("evm-facts");dl.innerHTML="";
 [["Godziny",r.time_text],["Line-up",r.lineup],["Tax",r.entry]].forEach(([a,b])=>{if(!b)return;
  const t=document.createElement("dt");t.textContent=a;const d=document.createElement("dd");d.textContent=b;dl.append(t,d)});
 const ds=document.getElementById("evm-desc");ds.textContent=r.description||"";ds.hidden=!r.description;
 if(!dl.children.length&&!r.description){ds.textContent="Szczegóły wkrótce. Śledź nas na Instagramie.";ds.hidden=false}
 const post=document.getElementById("evm-post");if(r.post_url){post.href=r.post_url;post.hidden=false}else post.hidden=true;
 evmBack=document.activeElement;evm.hidden=false;document.body.classList.add("modal-on");document.getElementById("evm-x").focus()}
function closeEvent(){evm.hidden=true;document.body.classList.remove("modal-on");if(evmBack&&evmBack.focus)evmBack.focus()}
document.getElementById("evm-x").onclick=closeEvent;
evm.addEventListener("click",e=>{if(e.target===evm)closeEvent()});
addEventListener("keydown",e=>{if(e.key==="Escape"&&!evm.hidden)closeEvent()});
async function loadEvents(keep){
 if(DB_ON){try{const x=await fetch(SUPABASE_URL+"/rest/v1/r4b4n_events?select=*&order=event_date.asc",{headers:HDR});
  if(x.ok){const rows=await x.json();EV={};EVID={};EVD={};rows.forEach(r=>{const k=String(r.event_date).slice(0,10);EV[k]=(EVENT_INFO[k]&&EVENT_INFO[k].title)||r.title;EVID[k]=r.id;EVD[k]=r})}}catch(e){console.error("r4b4n_events:",e)}}
 if(!keep||!EV[picked])pickFirst();
 drawE();
 // wydarzenia r4b4n blokują też kalendarz rezerwacji
 try{if(sel&&EV[sel]){sel=null;showSel()}draw();list()}catch(e){}}
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
  if(sel&&(busy.has(sel)||EV[sel])){sel=null}}
 catch(e){console.error("busy_dates:",e);$("msg").textContent="Nie udało się pobrać zajętych terminów ("+e.message+"). Odśwież stronę."}
 await loadAdmin();showSel();draw();list()}
function draw(){const cal=$("cal");cal.innerHTML="";
 $("mon").textContent=MN[m]+" "+y;
 ["Pn","Wt","Śr","Cz","Pt","So","Nd"].forEach(d=>{const e=document.createElement("div");e.className="dn";e.textContent=d;cal.appendChild(e)});
 const off=(new Date(y,m,1).getDay()+6)%7,n=new Date(y,m+1,0).getDate();
 for(let i=0;i<off;i++)cal.appendChild(document.createElement("div"));
 for(let d=1;d<=n;d++){const k=iso(y,m,d),b=document.createElement("button");b.textContent=d;
  const isBusy=busy.has(k),isR4=!isBusy&&!!EV[k];
  if(k<todayKey||isBusy||isR4)b.disabled=true;if(isBusy){b.classList.add("busy");b.title=busy.get(k)||"Zajęty"}
  if(isR4){b.classList.add("r4");b.title="r4b4n: "+EV[k]}
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
 const ds=[...new Set([...busy.keys(),...Object.keys(EV)])].filter(k=>k>=todayKey).sort();
 if(!ds.length){l.textContent="Brak zajętych terminów.";return}
 ds.forEach(k=>{const d=document.createElement("div");const r4=!busy.has(k),desc=r4?"r4b4n: "+EV[k]:busy.get(k);
  const b=document.createElement("b");b.textContent=fmtD(k);d.append(b,document.createTextNode(" · "+(desc||"zajęty")));
  if(r4)d.className="r4";else if(desc)d.className="open";l.appendChild(d)})}
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
 if(EV[sel]||busy.has(sel)){msg.textContent="Ten termin jest zajęty. Wybierz inną datę.";sel=null;showSel();draw();return}
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
// r4b4n: dodawanie, edycja i usuwanie wydarzeń przez administratora (z plakatem w Supabase Storage)
let editId=null;
const EF={date:"edate",title:"etitle",time_text:"etime",lineup:"elineup",entry:"eentry",description:"edesc",post_url:"epost"};
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
 const body={event_date:d,title:t,time_text:v("etime")||null,lineup:v("elineup")||null,entry:v("eentry")||null,description:v("edesc")||null,post_url:post||null};
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
