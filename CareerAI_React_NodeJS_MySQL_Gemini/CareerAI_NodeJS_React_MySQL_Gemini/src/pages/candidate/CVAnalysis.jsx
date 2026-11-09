import {useState} from "react";
import {FileUp,Sparkles,CheckCircle2,AlertCircle} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import api from "../../services/api";
function CVAnalysis(){
 const [file,setFile]=useState(null);const [loading,setLoading]=useState(false);const [error,setError]=useState("");const [result,setResult]=useState(null);
 async function analyze(e){e.preventDefault();if(!file)return;setLoading(true);setError("");setResult(null);
  const body=new FormData();body.append("cv",file);
  try{const {data}=await api.post("/ai/analyze-cv",body,{headers:{"Content-Type":"multipart/form-data"}});setResult(data.result);}
  catch(err){setError(err.response?.data?.message||"Phân tích thất bại.");}finally{setLoading(false);}}
 const list=(title,items)=>items?.length?<div className="result-section"><h3>{title}</h3><ul>{items.map((x,i)=><li key={i}>{x}</li>)}</ul></div>:null;
 return <><PageHeader title="Phân tích CV bằng AI" description="Tải CV PDF lên để Gemini phân tích nội dung và đề xuất cải thiện."/>
 <div className="content-panel upload-panel"><div className="upload-icon"><FileUp size={30}/></div><h2>Tải CV của bạn lên</h2><p>Chỉ nhận PDF, dung lượng tối đa 5MB. CV cần có văn bản có thể chọn/copy.</p>
 <form onSubmit={analyze} className="upload-form"><input type="file" accept="application/pdf,.pdf" onChange={e=>setFile(e.target.files?.[0]||null)}/>{file&&<span className="file-picked">{file.name}</span>}
 <button disabled={!file||loading}>{loading?"AI đang phân tích...":<><Sparkles size={17}/> Phân tích CV</>}</button></form>
 {error&&<div className="alert-error"><AlertCircle size={17}/>{error}</div>}</div>
 {result&&<section className="content-panel result-panel"><div className="score-circle"><strong>{result.score??"—"}</strong><span>/100</span></div><h2>Kết quả phân tích</h2><p>{result.summary}</p>
 {list("Điểm mạnh",result.strengths)}{list("Điểm cần cải thiện",result.weaknesses)}{list("Từ khóa còn thiếu",result.missingKeywords)}{list("Đề xuất cải thiện",result.suggestions)}{list("Vị trí phù hợp",result.recommendedRoles)}
 <small><CheckCircle2 size={14}/> Điểm số chỉ mang tính tham khảo, không đảm bảo kết quả tuyển dụng.</small></section>}
 </>;
}
export default CVAnalysis;
