(()=>{
'use strict';
const slides=window.ALAB_SLIDES,root=document.getElementById('slide'),dialog=document.getElementById('index-dialog');
let current=0,lastFocus=null;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lines=s=>esc(s).replace(/\n/g,'<br>');
const prompt=s=>s?`<div class="prompt"><b>Discuss</b>${esc(s)}</div>`:'';
const noteButton=window.ALAB_NOTES?'<button id="speaker-notes">Speaker notes</button>':'';
if(noteButton){document.querySelector('.deck-header nav').insertAdjacentHTML('afterbegin',noteButton);document.body.insertAdjacentHTML('beforeend','<dialog id="notes-dialog" class="notes-dialog"><div class="dialog-heading"><h2>Professor speaker notes</h2><button id="close-notes" aria-label="Close speaker notes">✕</button></div><div id="notes"></div></dialog>');document.getElementById('speaker-notes').onclick=()=>{document.getElementById('notes').innerHTML=window.ALAB_NOTES[current].paragraphs.map(p=>'<p>'+esc(p)+'</p>').join('');document.getElementById('notes-dialog').showModal();};document.getElementById('close-notes').onclick=()=>document.getElementById('notes-dialog').close();}
function render(){
const s=slides[current];let inner='';
const head=`<div class="slide-top"><span class="number">${String(s.n).padStart(2,'0')} / 45</span><span class="rule"></span><span class="eyebrow" style="margin:0">ALAB · CRITICAL THINKING</span></div><h1>${lines(s.title)}</h1><p class="subtitle">${esc(s.sub)}</p>`;
if(s.kind==='title'){inner=`<div class="hero"><div class="orb" aria-hidden="true"></div><div class="eyebrow">ALAB · LEADERSHIP ACCELERATION BOOTCAMP</div><h1>Think clearly.<br><em>Lead thoughtfully.</em></h1><p class="subtitle">Building Critical Thinking Skills</p><a class="follow" href="cases.html"><span>FOLLOW ALONG</span><strong>inchliit.github.io/alab-critical-thinking</strong></a><p class="hero-meta">Eight skills &nbsp; / &nbsp; Seven steps &nbsp; / &nbsp; Five cases<br>Use ← → to navigate · O opens the slide index</p></div>`;}
else if(s.kind==='visual'){inner=`<div class="visual-layout"><div class="visual-copy">${head}${prompt(s.prompt)}<p class="source-caption">Source PDF page ${s.n}. Historical source visual; clipped labels and missing animation are not reconstructed. <a href="assets/source-${String(s.image).padStart(2,'0')}.jpg" target="_blank" rel="noopener">Open full-size visual ↗</a></p></div><div class="visual-frame"><img src="assets/source-${String(s.image).padStart(2,'0')}.jpg" alt="Original source slide ${s.n}: ${esc(s.sub)}"></div></div>`;}
else{inner=head;
if(s.kind==='skills'){inner+='<div class="skill-grid">'+s.items.map(([a,b],i)=>`<div class="card"><span class="skill-label">${String(i+1).padStart(2,'0')}</span><h2>${esc(a)}</h2><p>${esc(b)}</p></div>`).join('')+'</div>';}
else if(s.kind==='steps'){inner+='<div class="steps">'+s.items.map(([a,b])=>`<div class="step"><b>${esc(a)}</b><span>${esc(b)}</span></div>`).join('')+'</div>';}
else{inner+=`<div class="cards ${s.items.length===4?'four':''}">`+s.items.map(([a,b])=>`<div class="card"><h2>${esc(a)}</h2><p>${esc(b)}</p></div>`).join('')+'</div>';}
if(s.kind==='video')inner+='<a class="video-link" href="https://www.youtube.com/watch?v=vNDYUlxNIAA" target="_blank" rel="noopener">▶ Open the source TED-Ed video</a>';
if(s.kind==='case')inner+=`<a class="case-link" href="cases.html#${s.n===44?'united':'ux'}">Open the student case →</a>`;
inner+=prompt(s.prompt);
}
root.dataset.kind=s.kind;root.innerHTML=inner;root.scrollTop=0;document.getElementById('count').textContent=`${s.n} / 45`;document.getElementById('source-label').textContent=s.source+' · Teaching adaptation';document.getElementById('prev').disabled=current===0;document.getElementById('next').disabled=current===44;document.getElementById('progress').style.width=((current+1)/45*100)+'%';document.title=`ALAB · ${s.n}/45 · ${s.title.replace(/\n/g,' ')}`;
document.querySelectorAll('#slide-index a').forEach((a,i)=>{if(i===current)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
}
function route(){let id=decodeURIComponent(location.hash.replace(/^#\//,''));const i=slides.findIndex(s=>s.id===id);current=i<0?0:i;render();}
function go(i){if(i<0||i>=slides.length)return;location.hash='/'+slides[i].id;}
function openIndex(){lastFocus=document.activeElement;dialog.showModal();dialog.querySelector('[aria-current]')?.scrollIntoView({block:'center'});}
document.getElementById('slide-index').innerHTML=slides.map(s=>`<a href="#/${s.id}"><b>${String(s.n).padStart(2,'0')}</b><span>${esc(s.title.replace(/\n/g,' '))}</span></a>`).join('');
document.querySelectorAll('#slide-index a').forEach(a=>a.addEventListener('click',()=>{dialog.close();root.focus({preventScroll:true});}));
document.getElementById('overview').onclick=openIndex;document.getElementById('close-index').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{if(lastFocus)lastFocus.focus({preventScroll:true});});
document.getElementById('prev').onclick=()=>go(current-1);document.getElementById('next').onclick=()=>go(current+1);
async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch(e){document.getElementById('fullscreen').title='Fullscreen is unavailable in this browser';}}
document.getElementById('fullscreen').onclick=fullscreen;
document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(['ArrowRight','PageDown'].includes(e.key)){e.preventDefault();go(current+1);}else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(current-1);}else if(e.key==='Home'){e.preventDefault();go(0);}else if(e.key==='End'){e.preventDefault();go(44);}else if(e.key.toLowerCase()==='o'&&!e.ctrlKey&&!e.metaKey){e.preventDefault();openIndex();}else if(e.key.toLowerCase()==='f'&&!e.ctrlKey&&!e.metaKey){e.preventDefault();fullscreen();}});
window.addEventListener('hashchange',route);if(!location.hash)history.replaceState(null,'','#/title');route();
})();
