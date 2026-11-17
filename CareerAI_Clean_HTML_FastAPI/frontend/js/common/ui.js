export function showMessage(message){const box=document.querySelector("#pageMessage");if(box){box.textContent=message;box.hidden=false;}}
export function toast(message){const box=document.querySelector("#toast");if(!box)return;box.textContent=message;box.classList.add("show");setTimeout(()=>box.classList.remove("show"),2500);}
export function setPage(title,description=""){const root=document.querySelector("#pageContent");root.innerHTML=`<div class="page-title"><h1>${title}</h1><p>${description}</p></div>`;return root;}
export function escapeHtml(value=""){return String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));}
