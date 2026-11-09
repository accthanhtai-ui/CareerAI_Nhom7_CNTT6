import {useState} from "react";
import {Bot,Send,Plus} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import api from "../../services/api";
function AIChat(){
 const [messages,setMessages]=useState([{role:"assistant",content:"Xin chào! Mình là CareerAI Assistant. Bạn có thể hỏi mình về CV, phỏng vấn, kỹ năng CNTT hoặc định hướng nghề nghiệp nhé."}]);
 const [input,setInput]=useState("");const [loading,setLoading]=useState(false);const [error,setError]=useState("");
 async function send(e){e?.preventDefault();if(!input.trim()||loading)return;const question=input.trim();const history=messages;setMessages([...messages,{role:"user",content:question}]);setInput("");setLoading(true);setError("");
  try{const {data}=await api.post("/ai/chat",{message:question,history});setMessages(old=>[...old,{role:"assistant",content:data.answer}]);}
  catch(err){setError(err.response?.data?.message||"Không gọi được AI. Kiểm tra Backend và API Key.");}
  finally{setLoading(false);}}
 return <><PageHeader title="Trò chuyện với AI" description="Hỏi đáp cùng CareerAI Assistant về CV, việc làm và học tập."/>
 <section className="chat-panel"><div className="chat-head"><div><Bot/><div><b>CareerAI Assistant</b><small>Trợ lý AI · Gemini</small></div></div><button className="secondary-btn" onClick={()=>{setMessages([{role:"assistant",content:"Cuộc trò chuyện mới bắt đầu. Bạn cần mình hỗ trợ điều gì?"}]);setError("");}}><Plus size={16}/> Cuộc trò chuyện mới</button></div>
 <div className="chat-messages">{messages.map((m,i)=><div key={i} className={`chat-message ${m.role}`}><span>{m.role==="assistant"?"AI":"Bạn"}</span><p>{m.content}</p></div>)}{loading&&<div className="chat-message assistant"><span>AI</span><p>Đang suy nghĩ...</p></div>}</div>
 {error&&<div className="alert-error">{error}</div>}
 <form className="chat-input" onSubmit={send}><input value={input} onChange={e=>setInput(e.target.value)} placeholder="Nhập câu hỏi của bạn..." disabled={loading}/><button disabled={!input.trim()||loading}><Send size={18}/></button></form>
 <div className="chat-suggestions">{["Làm sao cải thiện CV ngành IT?","Gợi ý câu hỏi phỏng vấn ReactJS","Sinh viên năm nhất nên học kỹ năng gì?"].map(x=><button key={x} onClick={()=>setInput(x)}>{x}</button>)}</div></section></>;
}
export default AIChat;
