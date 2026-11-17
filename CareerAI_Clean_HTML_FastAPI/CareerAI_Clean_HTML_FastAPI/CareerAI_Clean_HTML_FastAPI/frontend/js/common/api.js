const API_BASE = "/api";
export function getToken(){return localStorage.getItem("careerai_token");}
export function getUser(){try{return JSON.parse(localStorage.getItem("careerai_user")||"null");}catch{return null;}}
export async function api(path, options={}){
 const headers={...(options.headers||{})};
 if(!(options.body instanceof FormData)) headers["Content-Type"]="application/json";
 if(getToken()) headers.Authorization=`Bearer ${getToken()}`;
 const response=await fetch(API_BASE+path,{...options,headers});
 const data=await response.json().catch(()=>({message:"Máy chủ trả về dữ liệu không hợp lệ."}));
 if(!response.ok) throw new Error(data.detail||data.message||"Có lỗi xảy ra.");
 return data;
}
export function json(method,data){return {method,body:JSON.stringify(data)};}
