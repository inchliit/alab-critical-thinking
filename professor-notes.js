(()=>{
 'use strict';
 if(!window.ALAB_ENCRYPTED_NOTES&&!window.ALAB_NOTES)return;
 const encrypted=!!window.ALAB_ENCRYPTED_NOTES&&!window.ALAB_NOTES;
 let notes=window.ALAB_NOTES||null;
 let attempt=0;
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 document.querySelector('.deck-header nav').insertAdjacentHTML('afterbegin','<button id="speaker-notes" aria-haspopup="dialog" title="Professor notes (N)">Professor notes <span class="key">N</span></button>');
 document.body.insertAdjacentHTML('beforeend',`
 <dialog id="professor-unlock" class="unlock-dialog" aria-labelledby="unlock-title">
  <form id="unlock-form">
   <div class="dialog-heading"><h2 id="unlock-title">Professor access</h2><button type="button" id="cancel-unlock" aria-label="Close password prompt">✕</button></div>
   <p>Enter the professor password to view the speaker notes.</p>
   <label for="professor-password">Password</label>
   <input id="professor-password" type="password" autocomplete="off" required autofocus>
   <p id="unlock-error" class="unlock-error" role="alert"></p>
   <button id="unlock-submit" type="submit">Unlock notes</button>
  </form>
 </dialog>
 <dialog id="notes-dialog" class="notes-dialog" aria-labelledby="notes-title">
  <div class="dialog-heading"><h2 id="notes-title">Professor speaker notes</h2><button id="close-notes" aria-label="Close speaker notes">✕</button></div>
  <p id="notes-slide-label"></p><div id="notes"></div>
  <div class="notes-actions"><button id="notes-prev">← Previous slide</button><button id="lock-notes" ${encrypted?'':'hidden'}>Lock notes</button><button id="notes-next">Next slide →</button></div>
 </dialog>`);
 const trigger=document.getElementById('speaker-notes');
 const gate=document.getElementById('professor-unlock');
 const view=document.getElementById('notes-dialog');
 const input=document.getElementById('professor-password');
 const submit=document.getElementById('unlock-submit');
 const error=document.getElementById('unlock-error');
 const current=()=>{const id=location.hash.replace(/^#\//,'');const i=window.ALAB_SLIDES.findIndex(s=>s.id===id);return i<0?0:i;};
 function renderNotes(){
  if(!notes)return;
  const i=current(),s=window.ALAB_SLIDES[i];
  document.getElementById('notes-slide-label').textContent=`Slide ${i+1} of 45 · ${s.title.replace(/\n/g,' ')}`;
  document.getElementById('notes').innerHTML=notes[i].paragraphs.map(p=>'<p>'+escape(p)+'</p>').join('');
  document.getElementById('notes').scrollTop=0;
  document.getElementById('notes-prev').disabled=i===0;
  document.getElementById('notes-next').disabled=i===44;
 }
 function open(){
  if(notes){renderNotes();view.showModal();}
  else{error.textContent='';input.value='';gate.showModal();input.focus();}
 }
 trigger.addEventListener('click',open);
 document.getElementById('cancel-unlock').onclick=()=>gate.close();
 gate.addEventListener('close',()=>{attempt++;input.value='';submit.disabled=false;submit.textContent='Unlock notes';trigger.focus();});
 document.getElementById('close-notes').onclick=()=>view.close();
 view.addEventListener('close',()=>trigger.focus());
 document.getElementById('lock-notes').onclick=()=>{notes=null;document.getElementById('notes').replaceChildren();document.getElementById('notes-slide-label').textContent='';view.close();};
 document.getElementById('notes-prev').onclick=()=>{if(current()>0)location.hash='/'+window.ALAB_SLIDES[current()-1].id;};
 document.getElementById('notes-next').onclick=()=>{if(current()<44)location.hash='/'+window.ALAB_SLIDES[current()+1].id;};
 window.addEventListener('hashchange',()=>{if(view.open)renderNotes();});
 document.getElementById('unlock-form').addEventListener('submit',async e=>{
  e.preventDefault();
  if(submit.disabled)return;
  if(!window.crypto?.subtle){error.textContent='Open the HTTPS presentation link in a modern browser to unlock notes.';return;}
  const request=++attempt;
  submit.disabled=true;submit.textContent='Unlocking…';error.textContent='';
  const password=input.value;input.value='';
  const bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  try{
   const data=window.ALAB_ENCRYPTED_NOTES;
   const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);
   const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:bytes(data.salt),iterations:data.iterations,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['decrypt']);
   const clear=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(data.iv)},key,bytes(data.ciphertext));
   const result=JSON.parse(new TextDecoder().decode(clear));
   if(!Array.isArray(result)||result.length!==45||!result.every(s=>Array.isArray(s.paragraphs)&&s.paragraphs.length===2))throw new Error('Invalid notes');
   if(request!==attempt||!gate.open)return;
   notes=result;gate.close();renderNotes();view.showModal();
  }catch{
   if(request===attempt&&gate.open){error.textContent='Incorrect password. Please try again.';input.focus();}
  }finally{
   if(request===attempt){submit.disabled=false;submit.textContent='Unlock notes';}
  }
 });
 document.addEventListener('keydown',e=>{
  if(e.key.toLowerCase()==='n'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!document.querySelector('dialog[open]')&&!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)){e.preventDefault();open();}
 });
})();
