import React, {useState} from 'react';
import {parseNames,guessGender} from './game/engine.js';
import Stage from './components/Stage.jsx';
import {insertPastedNames} from './game/pasteNames.js';
export default function App(){
 const [text,setText]=useState(''),[students,setStudents]=useState([]),[history,setHistory]=useState([]),[stage,setStage]=useState(false),[error,setError]=useState('');
 const [options,setOptions]=useState({count:2,duration:25,sound:true});
 const opt=patch=>setOptions(o=>({...o,...patch}));
 const present=students.filter(s=>!s.absent);
 function change(value){setText(value);setStudents(parseNames(value).map(n=>students.find(s=>s.name===n)||{name:n,gender:guessGender(n),absent:false}));}
 function paste(event){
  const pasted=event.clipboardData.getData('text/plain');
  if(!pasted.trim())return;
  event.preventDefault();
  const input=event.currentTarget;
  const updated=insertPastedNames(text,input.selectionStart,input.selectionEnd,pasted);
  change(updated.text);
  requestAnimationFrame(()=>input.setSelectionRange(updated.caret,updated.caret));
 }
 function removeNames(names){const removed=new Set(names);const remaining=students.filter(s=>!removed.has(s.name));setStudents(remaining);setText(remaining.map(s=>s.name).join('\n'));}
 function enter(){if(!present.length)return setError('Hãy nhập ít nhất một tên người hoặc tên nhóm tham gia.');if(present.length>60)return setError('Tối đa 60 người hoặc nhóm tham gia.');setError('');setStage(true);}
 const segment=(key,values)=><div className="seg">{values.map(([v,label])=><button key={v} aria-pressed={options[key]===v} onClick={()=>opt({[key]:v})}>{label}</button>)}</div>;
 if(stage)return <Stage students={present} className="Sổ Nam Tào" options={options} onRemove={removeNames} onSound={sound=>opt({sound})} onBack={()=>setStage(false)} onResult={names=>setHistory(h=>[{names,at:Date.now()},...h].slice(0,40))}/>;
 return <section id="setup"><header className="top"><div className="brand"><div><div className="eyebrow">Quay ngẫu nhiên · Khảo bài</div><h1>📜 Sổ Nam Tào</h1><p>Nhập danh sách tên người hoặc tên nhóm để bắt đầu.</p></div></div><button className="btn primary big" onClick={enter}>Vào địa phủ →</button></header><main className="grid">
 <section className="card"><h2>Danh sách tham gia</h2><label className="fld">Tên người hoặc tên nhóm — mỗi dòng một mục<textarea id="namesBox" value={text} placeholder="Dán danh sách, ví dụ: Nhóm 1, Nhóm 2, Đội A" onPaste={paste} onChange={e=>change(e.target.value)}/></label><p className="hint">Dán danh sách có dấu phẩy, chấm phẩy, tab, xuống dòng hoặc số thứ tự: ứng dụng tự chia mỗi tên thành một dòng. Tên chỉ cách nhau bằng dấu cách cần thêm dấu phân cách để tránh tách nhầm họ tên. Tải lại trang sẽ xóa dữ liệu của phiên.</p><button className="btn danger" onClick={()=>{change('');setHistory([]);}}>Xóa danh sách</button>{error&&<p role="alert">{error}</p>}</section>
 <section className="card"><h2>Người / nhóm tham gia</h2><div className="stats"><span className="pill">Tổng số {students.length}</span><span className="pill green">Tham gia {present.length}</span></div><p className="hint">Bấm tên để bật/tắt tham gia: tên bị gạch sẽ không được chọn.</p><div className="chips">{students.map((s,i)=><div key={s.name} className={`chip ${s.absent?'absent':''}`}><button className="n" aria-pressed={s.absent} onClick={()=>setStudents(a=>a.map((p,j)=>i===j?{...p,absent:!p.absent}:p))}>{s.name}</button></div>)}</div>{!students.length&&<div className="empty">Chưa có danh sách. Hãy nhập tên người hoặc tên nhóm.</div>}<div className="row"><button className="btn" onClick={()=>setStudents(a=>a.map(s=>({...s,absent:false})))}>Bỏ đánh dấu vắng</button></div><p className="hint">Mỗi lượt chọn ngẫu nhiên từ danh sách hiện tại. Sau khi có kết quả, bạn có thể xóa tên đã được gọi khỏi danh sách.</p></section>
 <section className="card options"><h2>Thiết lập gọi tên</h2><div className="opt">Số người / nhóm mỗi lượt{segment('count',[1,2,3,4,5].map(n=>[n,n]))}</div><div className="opt">Thời lượng hoạt cảnh{segment('duration',[15,20,25].map(n=>[n,`${n} giây`]))}</div><label className="switch opt">Âm thanh<input type="checkbox" checked={options.sound} onChange={e=>opt({sound:e.target.checked})}/></label><div className="opt"><h3>Lịch sử gần đây</h3>{history.length?<ol className="hist">{history.slice(0,8).map((h,i)=><li key={i}><time>{new Date(h.at).toLocaleTimeString('vi-VN')}</time><span>{h.names.join(', ')}</span></li>)}</ol>:<p className="hint">Chưa có lượt nào.</p>}</div></section></main><footer className="foot">Space: bắt đầu · →: tua nhanh · Enter: bỏ qua · M: âm thanh · F: toàn màn hình · Esc: cài đặt<span className="credit">Design by Le Van Ngoc</span></footer></section>;
}
