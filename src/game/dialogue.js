// Mỗi nhóm chỉ nói một câu một lúc, có khoảng nghỉ giữa các câu.
export const DIALOGUE = {
  students: ['Em có học… nhưng kiến thức chưa tải xong!', 'Xin một gợi ý, không xin đáp án!', 'Hôm qua em thuộc, hôm nay em quên.', 'Đừng nhìn em, em đang nhìn sách!', 'Não em đang cập nhật, chờ chút ạ.', 'Em biết câu này… trong một vũ trụ khác.', 'Cho em gọi trợ giúp từ bàn bên!', 'Cầu mong sổ lật qua tên mình.', 'Em chuẩn bị tinh thần rồi, kiến thức thì chưa.', 'Đội em đang họp khẩn trong im lặng.'],
  caught: ['Em xin trình bày bằng sơ đồ tư duy!', 'Khoan! Để em nhớ lại trang số mấy!', 'Bắt đúng người rồi, nhưng em chưa sẵn sàng!', 'Cho em mang theo chút tự tin!', 'Lên bảng thì được, xuống bảng bằng cách nào?'],
  answering: ['Dạ… em xin đọc lại đề một lần ạ!', 'Em nhớ đáp án rồi, để em sắp xếp lại chút!', 'Câu này em có ôn, mà đang hồi hộp quá ạ.', 'Thầy cô cho em vài giây suy nghĩ nhé!', 'Dạ em xin trả lời phần em chắc trước ạ.', 'Em đứng đây tự nhiên quên sạch luôn…', 'Để em viết công thức ra trước ạ!', 'Dạ, đáp án đang ở đầu lưỡi em rồi!', 'Em xin thử giải theo cách của em ạ.', 'Nhóm em xin cử em trình bày, em cũng bất ngờ ạ!'],
  ghosts: ['Ta quên hết rồi… trừ ngày kiểm tra.', 'Oan hồn của một bài tập chưa nộp…', 'Đừng sợ ta. Hãy sợ câu hỏi phụ.', 'Ta vẫn đang tìm trang vở bị mất…', 'Kiến thức bay đâu hết rồi…', 'Ám ảnh nhất vẫn là: lấy giấy ra!', 'Ta đã chờ đáp án từ tiết trước…', 'Ai gọi tên ta trong sổ đầu bài?'],
  homework: [
    { x:445,y:635,lines:['Em tưởng nộp trên nhóm là xong rồi…', 'Bài em làm rồi, mà vở còn ở nhà!', 'Cho em nộp bù, đừng ghi sổ đầu bài!'] },
    { x:511,y:635,lines:['Em xin thêm một ngày… từ tuần trước.', 'Bài cũ chưa xong, bài mới đã rơi xuống!', 'Em đang làm tới phần… chép đề ạ.'] },
    { x:577,y:635,lines:['Đề cương dày thế, em ôn từ đâu đây?', 'Tưởng xuống âm phủ là thoát deadline!', 'Em nhận bài rồi, cho em xin gợi ý với!'] },
  ],
  npcs: [
    { x:210,y:500,lines:['Mạnh Bà: canh này không giúp nhớ bài đâu!', 'Uống canh quên muộn phiền, đừng quên bài cũ!', 'Nồi canh đang sôi, ai còn chưa ôn bài?'] },
    { x:1500,y:555,lines:['Đầu Trâu: xếp hàng, đừng chen đáp án!', 'Ta canh cổng, không canh bài hộ nhé!'] },
    { x:1760,y:570,lines:['Mặt Ngựa: chạy đâu cho khỏi kiểm tra miệng!', 'Mang vở theo, đừng mang lý do!'] },
    { x:1340,y:325,lines:['Ngộ Không: để ta phá trận đề cương này!', 'Bảy mươi hai phép, thiếu phép giải bài!'] },
    { x:1610,y:320,lines:['Na Tra: ba đầu vẫn phải tự học!', 'Sáu tay ghi bài, không tay nào chép hộ!'] },
    { x:1680,y:905,lines:['Chú bộ đội: giữ trật tự, đến lượt ai người đó lên!', 'Canh cổng nghiêm túc, ôn bài cũng vậy!'] },
    { x:1800,y:905,lines:['Ma đói: đói bụng chứ không đói kiến thức!', 'Học xong rồi mới đi ăn nhé!'] },
    { x:150,y:900,lines:['Tóc có thể rối, lời giải phải rõ!', 'Ta tìm lược, còn ngươi tìm đáp án đi…'] },
  ],
};

export function bubble(c, message, x, y, { spooky=false }={}) {
  c.save(); c.font='600 18px "Be Vietnam Pro",sans-serif'; c.textAlign='center'; c.textBaseline='middle';
  const words=message.split(' '), lines=[]; let line='';
  for(const word of words){const next=line?`${line} ${word}`:word;if(c.measureText(next).width>275&&line){lines.push(line);line=word;}else line=next;}
  if(line)lines.push(line);
  const width=Math.max(105,...lines.map(s=>c.measureText(s).width))+30,height=lines.length*25+22;
  const left=Math.max(12,Math.min(1920-width-12,x-width/2)),top=Math.max(155,Math.min(970-height,y-height));
  c.shadowColor='#08071188';c.shadowBlur=12;c.fillStyle=spooky?'#152b30ee':'#f1e3c8f5';c.strokeStyle=spooky?'#88b6a6':'#9c794e';c.lineWidth=2;
  c.beginPath();c.roundRect(left,top,width,height,12);c.fill();c.shadowBlur=0;c.stroke();
  const tip=Math.max(left+20,Math.min(left+width-20,x));c.beginPath();c.moveTo(tip-7,top+height);c.lineTo(tip+2,top+height+11);c.lineTo(tip+9,top+height);c.fill();
  c.fillStyle=spooky?'#c3e1cf':'#54343b';lines.forEach((s,i)=>c.fillText(s,left+width/2,top+23+i*25));c.restore();
}

export function ambientDialogue(c,t,motionTime=t){
  // NPC và ma dùng khung giờ riêng, không đồng loạt bật lời thoại.
  const slot=Math.floor(t/12),phase=t%12;
  if(phase<1||phase>10)return;
  // Khu nhận bài có lượt riêng từ đầu, không phải chờ hết vòng tất cả NPC.
  if(slot%2===0){
    const turn=Math.floor(slot/2),person=DIALOGUE.homework[turn%DIALOGUE.homework.length];
    bubble(c,person.lines[Math.floor(turn/DIALOGUE.homework.length)%person.lines.length],person.x,person.y);
  } else if(slot%4===1){
    const turn=Math.floor(slot/4),npc=DIALOGUE.npcs[turn%DIALOGUE.npcs.length];
    bubble(c,npc.lines[Math.floor(turn/DIALOGUE.npcs.length)%npc.lines.length],npc.x,npc.y);
  } else {
    const turn=Math.floor(slot/4),i=turn%6,x=(motionTime*(i%2?-17:22)+i*377+2400)%2280-180,y=760+Math.sin(motionTime*.8+i)*100;
    if(x>110&&x<1810)bubble(c,DIALOGUE.ghosts[turn%DIALOGUE.ghosts.length],x,y-135,{spooky:true});
  }
}
