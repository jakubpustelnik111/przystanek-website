// Adres, na który przychodzą zgłoszenia rezerwacji (przez formsubmit.co).
// Podmień na swój e-mail.
const MAIL_DO_REZERWACJI="jakubpustelnik2006@gmail.com";
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
const MN=["Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec","Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"];
let res=[];try{res=JSON.parse(localStorage.getItem("pdp_res")||"[]")}catch(e){}
function save(){try{localStorage.setItem("pdp_res",JSON.stringify(res))}catch(e){}}
let now=new Date(),y=now.getFullYear(),m=now.getMonth(),sel=null;
const iso=(a,b,c)=>a+"-"+String(b+1).padStart(2,"0")+"-"+String(c).padStart(2,"0");
function draw(){const cal=document.getElementById("cal");cal.innerHTML="";
 document.getElementById("mon").textContent=MN[m]+" "+y;
 ["Pn","Wt","Śr","Cz","Pt","So","Nd"].forEach(d=>{const e=document.createElement("div");e.className="dn";e.textContent=d;cal.appendChild(e)});
 const off=(new Date(y,m,1).getDay()+6)%7,n=new Date(y,m+1,0).getDate(),today=iso(now.getFullYear(),now.getMonth(),now.getDate());
 for(let i=0;i<off;i++)cal.appendChild(document.createElement("div"));
 for(let d=1;d<=n;d++){const k=iso(y,m,d),b=document.createElement("button");b.textContent=d;
  const busy=res.some(r=>r.date===k);
  if(k<today||busy)b.disabled=true;if(busy)b.classList.add("busy");if(k===sel)b.classList.add("sel");
  b.onclick=()=>{sel=k;document.getElementById("chosen").textContent="Wybrana data: "+d+" "+MN[m].toLowerCase()+" "+y;draw()};cal.appendChild(b)}}
document.getElementById("prev").onclick=()=>{m--;if(m<0){m=11;y--}draw()};
document.getElementById("next").onclick=()=>{m++;if(m>11){m=0;y++}draw()};
function list(){const l=document.getElementById("list");l.innerHTML="";
 if(!res.length){l.textContent="Brak rezerwacji.";return}
 [...res].sort((a,b)=>a.date<b.date?-1:1).forEach(r=>{const d=document.createElement("div");
  d.textContent=r.date+" · "+r.title+" · "+r.name;l.appendChild(d)})}
document.getElementById("send").onclick=()=>{const g=id=>document.getElementById(id).value.trim(),msg=document.getElementById("msg");
 if(!sel){msg.textContent="Najpierw wybierz datę w kalendarzu.";return}
 if(!g("f-title")||!g("f-name")||!g("f-mail")){msg.textContent="Uzupełnij tytuł, imię i nazwisko oraz e-mail.";return}
 if(!MAIL_DO_REZERWACJI||MAIL_DO_REZERWACJI.includes("TWOJ-ADRES")){msg.textContent="Formularz nie ma jeszcze ustawionego adresu e-mail do zgłoszeń.";return}
 const r={date:sel,title:g("f-title"),name:g("f-name"),mail:g("f-mail"),tel:g("f-tel"),note:g("f-note")};
 const btn=document.getElementById("send");btn.disabled=true;msg.textContent="Wysyłanie…";
 if(location.protocol==="file:"){msg.textContent="Wysyłka e-mail działa tylko na opublikowanej stronie (np. GitHub Pages), a nie z pliku otwartego z dysku.";btn.disabled=false;return}
 fetch("https://formsubmit.co/ajax/"+MAIL_DO_REZERWACJI,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},
  body:JSON.stringify({_subject:"Nowa rezerwacja: "+r.title+" ("+r.date+")",_template:"table",_replyto:r.mail,"Data":r.date,"Tytuł wydarzenia":r.title,"Imię i nazwisko":r.name,"E-mail":r.mail,"Telefon":r.tel||"-","Uwagi":r.note||"-"})})
 .then(x=>x.json()).then(x=>{if(x.success!=="true"&&x.success!==true)throw new Error(x.message||"fail");
  res.push(r);save();msg.textContent="Dziękujemy! Zgłoszenie na "+r.date+" zostało wysłane. Potwierdzimy termin mailowo.";sel=null;
  document.getElementById("chosen").textContent="Wybrana data: brak";["f-title","f-name","f-mail","f-tel","f-note"].forEach(i=>document.getElementById(i).value="");draw();list()})
 .catch(e=>{
  const sub="Rezerwacja: "+r.title+" ("+r.date+")",body="Data: "+r.date+"\nTytuł: "+r.title+"\nImię i nazwisko: "+r.name+"\nE-mail: "+r.mail+"\nTelefon: "+(r.tel||"-")+"\nUwagi: "+(r.note||"-");
  msg.textContent="Nie udało się wysłać zgłoszenia"+(e&&e.message&&e.message!=="fail"&&e.message!=="Failed to fetch"?" ("+e.message+")":"")+". ";
  const a=document.createElement("a");a.href="mailto:"+MAIL_DO_REZERWACJI+"?subject="+encodeURIComponent(sub)+"&body="+encodeURIComponent(body);a.textContent="Wyślij zgłoszenie z własnej poczty";a.style.textDecoration="underline";msg.appendChild(a)})
 .finally(()=>{btn.disabled=false})};
draw();list();
