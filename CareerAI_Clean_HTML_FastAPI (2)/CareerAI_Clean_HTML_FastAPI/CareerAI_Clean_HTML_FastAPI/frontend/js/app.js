import {getToken,getUser} from "./common/api.js";
import {showMessage} from "./common/ui.js";
const page=document.body.dataset.page;
const publicPages=["login","register"];
if(!publicPages.includes(page)&&!getToken()){location.href="/pages/login.html";}
if(page==="admin"&&getUser()?.role!=="ADMIN"){location.href="/pages/dashboard.html";}
const user=getUser();const userLabel=document.querySelector("#currentUser");if(userLabel&&user)userLabel.textContent=user.name||user.email;
document.querySelector("#logoutButton")?.addEventListener("click",()=>{localStorage.removeItem("careerai_token");localStorage.removeItem("careerai_user");location.href="/pages/login.html";});
const pages={login:"./pages/login.js",register:"./pages/register.js",dashboard:"./pages/dashboard.js",profile:"./pages/profile.js","my-cvs":"./pages/my-cvs.js","cv-analysis":"./pages/cv-analysis.js","ai-chat":"./pages/ai-chat.js",jobs:"./pages/jobs.js","job-detail":"./pages/job-detail.js","saved-jobs":"./pages/saved-jobs.js",applications:"./pages/applications.js",notifications:"./pages/notifications.js",admin:"./pages/admin.js"};
if(pages[page]) import(pages[page]).catch(error=>showMessage(error.message));
