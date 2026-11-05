import { createNameDraw, nameDrawCursor } from './nameDraw.js';
import { DIALOGUE, bubble, ambientDialogue } from './dialogue.js';
import { VERDICTS } from './verdicts.js';
import { Scene, Sfx, cryptoSample } from './engine.js';
import { world, figure, reapers, text, clamp, chain, portal } from './underworld.js';

export class BookScene extends Scene {
 constructor(canvas){super(canvas);this.bookTime=0;this.dialogueTime=0;this.duration=20;this.lastBeat=-1;this.chosen=[];}
 startRun(picks){Sfx.stopScreams();this.captureVoiced=false;this.chosen=picks;this.verdicts=cryptoSample(VERDICTS,picks.length);this.nameDraw=createNameDraw(this.people.map(p=>p.st.name),picks[0]?.st.name);this.lastNameStep=-1;this.lastNameTick=0;this.bookTime=0;this.lastBeat=-1;this.mode='run';this.run=null;}
 newLobby(){Sfx.stopScreams();this.mode='lobby';this.chosen=[];this.bookTime=0;this.timeScale=1;this.run=null;}
 inviteToBoard(){if(this.mode!=='done')return;this.mode='presenting';this.presentationTime=0;this.boardLines=cryptoSample(DIALOGUE.answering,this.chosen.length);this.timeScale=1;Sfx.drum?.();}
 completePresentation(){if(this.mode!=='presenting')return;this.presentationTime=6;this.mode='answering';this.answeringStarted=this.dialogueTime;this.onPresentationDone?.();}
 update(dt){this.time+=dt;if(this.mode==='presenting'){this.presentationTime+=dt;if(this.presentationTime>=6)this.completePresentation();return;}if(this.mode!=='run')return;this.bookTime+=dt;const p=this.bookTime/this.duration;if(p>=.20&&p<.78){const cursor=nameDrawCursor(this.nameDraw,(p-.20)/.58);if(cursor.step!==this.lastNameStep){this.lastNameStep=cursor.step;if(!this.lastNameTick||this.time-this.lastNameTick>.055){Sfx.penTick();this.lastNameTick=this.time;}}}if(p>=.905&&!this.captureVoiced){this.captureVoiced=true;Sfx.scream(this.chosen.length);}const beat=Math.floor(this.bookTime*(p>.72?6:2));if(beat!==this.lastBeat&&p<.85){this.lastBeat=beat;Sfx.drum?.();}if(this.bookTime>=this.duration)this.finish();}
 finish(){if(this.mode!=='run')return;this.bookTime=this.duration;this.mode='done';Sfx.stamp?.();this.onResult?.(this.chosen.map((p,i)=>({...p.st,verdict:this.verdicts[i]})));}
 skipToEnd(){if(this.mode==='presenting')this.completePresentation();else this.finish();}
 render(){
 const c=this.ctx;c.save();c.setTransform(this.cv.width/1920,0,0,this.cv.height/1080,0,0);c.textBaseline='middle';world(c,this.time);
 const presenting=this.mode==='presenting'||this.mode==='answering';
 const p=this.mode==='lobby'||presenting?0:clamp(this.bookTime/this.duration),active=this.mode==='run'||this.mode==='done';
 // Diêm Vương luôn ở trong cảnh; khi mở sổ mới cầm bút suy nghĩ.
 figure(c,690,625,{robe:'#8c3037',kind:'king',scale:1.3,t:this.time,action:active&&p<.78?'think':'angry'});
 c.fillStyle='#542e30';c.fillRect(610,615,700,65);c.fillStyle='#b38a50';c.fillRect(605,610,710,10);c.fillStyle='#39252b';c.fillRect(640,680,24,40);c.fillRect(1260,680,24,40);
 text(c,active?(p<.78?'Diêm Vương đang suy nghĩ…':p<.87?'Lồng đèn đã chọn tên!':'Hắc Bạch Vô Thường, dẫn lên bảng!'):'Diêm Vương chờ mở sổ',970,710,23);
 if(!(active&&p<.89)){c.fillStyle='#682b32';c.fillRect(925,580,170,27);text(c,'SỔ NAM TÀO',1010,593,16,'#eac17a');}
 if(active&&p>.86)portal(c,this.time,1750,870,clamp((p-.86)/.035));
 const count=this.people.length,cols=Math.min(12,count),rows=Math.ceil(count/cols),spacing=Math.min(115,1320/cols);
 this.people.forEach((person,i)=>{
  const row=Math.floor(i/cols),col=i%cols,rowCount=Math.min(cols,count-row*cols);
  const x=960+(col-(rowCount-1)/2)*spacing,y=850+row*Math.min(64,190/Math.max(rows,1));
  const chosenIndex=this.chosen.indexOf(person),selected=chosenIndex>=0;
  if(presenting&&selected)return;
  const phase=clamp((p-.86)/.14),approach=clamp(phase/.32),bind=clamp((phase-.30)/.25),depart=clamp((phase-.60)/.40);
  const travel=selected ? depart*depart*(3-2*depart) : 0;
  const targetX=x+(1750-x)*travel,targetY=y+(800-y)*travel-Math.sin(travel*Math.PI)*80;
  if(selected&&active&&p>.86){
   const leftX=1200+(targetX-65-1200)*approach,rightX=1420+(targetX+65-1420)*approach;
   figure(c,leftX,targetY,{robe:'#26212e',hat:'天下太平',t:this.time,action:depart>0?'run':'fight',scale:.82});
   figure(c,rightX,targetY,{robe:'#eee7d6',hat:'一见生财',t:this.time+.3,action:depart>0?'run':'fight',scale:.82,flip:-1});
   if(bind>0){
    chain(c,this.time,[leftX+25,targetY-55],[leftX+25+(targetX-leftX-25)*bind,targetY-40],depart);
    chain(c,this.time,[rightX-25,targetY-55],[rightX-25+(targetX-rightX+25)*bind,targetY-40],depart);
    c.strokeStyle='#b3d1bf';c.lineWidth=3;c.beginPath();c.ellipse(targetX,targetY-38,23,9,0,0,Math.PI*2*bind);c.stroke();
   }
   for(let k=0;k<5;k++){const u=(this.time*1.5+k/5)%1;c.fillStyle=`rgba(130,177,157,${(1-u)*.22})`;c.beginPath();c.ellipse(targetX+Math.sin(k*3+this.time)*25,targetY-u*85,15+u*15,10+u*20,0,0,Math.PI*2);c.fill();}
   if(bind>.5&&depart===0)text(c,'？！',targetX,targetY-115,23,'#f0c47b');
  }
  c.save();
  if(selected&&depart>.75){c.globalAlpha=1-clamp((depart-.75)/.25);}
  figure(c,targetX,targetY,{robe:['#698d88','#9278a1','#b58c62','#627b9b','#b2767d','#8d9263'][i%6],kind:['civilian','longhair','scholar','soldier','hungry','elder'][i%6],face:['#d9b78e','#b7c7be','#c5ad90','#afbeb0'][i%4],scale:Math.min(.65,cols>10?.48:.6),t:this.time+i,action:selected&&p>.9?'run':'idle'});
  const name=person.st.name;c.font='600 17px "Be Vietnam Pro",sans-serif';const width=Math.min(190,c.measureText(name).width+18);c.fillStyle=selected&&p>.8?'#852e3a':'#191c2be6';c.fillRect(targetX-width/2,targetY+12,width,28);text(c,name,targetX,targetY+27,16);c.restore();
 });
 if(!active&&!presenting){reapers(c,this.time,1120+Math.sin(this.time*.4)*90,750,60);text(c,'Hắc Bạch Vô Thường · chờ lệnh',1120,790,18);}
 if(active){const label=p<.08?'Mở bìa sổ':p<.20?'Lật sổ sinh tử':p<.78?'Tra sổ · ai chưa học bài?':p<.86?'Lồng đèn sáng tên được gọi':'Áp giải người được gọi';text(c,label,960,105,27,'#f1d4a0');c.fillStyle='#221d2c';c.fillRect(660,130,600,6);c.fillStyle='#ba5960';c.fillRect(660,130,600*p,6);}
 // Lời người tham gia: một người nói mỗi lượt, giữ nguyên bảng tên bên dưới.
 const slot=Math.floor(this.dialogueTime/12),phase=this.dialogueTime%12;
 if(!presenting&&this.people.length&&phase>1&&phase<10){
  const talking=this.mode==='run'&&p>.86 ? this.people.indexOf(this.chosen[0]) : slot%this.people.length;
  if(talking>=0){
   const row=Math.floor(talking/cols),col=talking%cols,rowCount=Math.min(cols,count-row*cols);
   const x=960+(col-(rowCount-1)/2)*spacing,y=850+row*Math.min(64,190/Math.max(rows,1));
   const caught=this.mode==='run'&&p>.86;
   const lines=caught?DIALOGUE.caught:DIALOGUE.students;
   if(!caught||p<.94)bubble(c,lines[slot%lines.length],x,y-105);
  }
 }
 if(this.mode!=='done'&&!presenting)ambientDialogue(c,this.dialogueTime,this.time);
 // Le sổ được vẽ sau toàn bộ thoại nền để luôn che thoại, giữ tên và tội danh rõ.
 if(active&&p<.89)this.drawBook(c,p);
 if(presenting)this.drawPresentation(c);
 c.restore();
 }
 drawPresentation(c){
  c.save();c.translate(200,0);
  const progress=clamp(this.presentationTime/6),walk=clamp(progress/.62),ease=walk*walk*(3-2*walk);
  // Bảng hạ xuống, ánh đèn tập trung vào người vừa được gọi.
  const drop=clamp(progress/.20),boardY=230-(1-drop)*340;
  const columns=this.chosen.length>2?2:1,rows=Math.ceil(this.chosen.length/columns),boardHeight=Math.max(285,115+rows*96);
  c.save();c.shadowColor='#0009';c.shadowBlur=24;c.fillStyle='#5c4034';c.fillRect(575,boardY,820,boardHeight);c.shadowBlur=0;c.fillStyle='#193e36';c.fillRect(588,boardY+13,794,boardHeight-26);c.strokeStyle='#b19762';c.lineWidth=3;c.strokeRect(594,boardY+19,782,boardHeight-38);
  text(c,'KIỂM TRA BÀI CŨ',985,boardY+55,32,'#e1e8cb');
  c.strokeStyle='#b9d2b36b';c.lineWidth=2;c.beginPath();c.moveTo(630,boardY+84);c.lineTo(1340,boardY+84);c.stroke();
  this.chosen.forEach((person,i)=>{
   const row=Math.floor(i/columns),col=i%columns,x=columns===2?790+col*390:985,y=boardY+115+row*96,maxWidth=columns===2?345:700;
   c.font='600 24px "Be Vietnam Pro",sans-serif';c.fillStyle='#e8e5c7';c.textAlign='center';c.fillText(person.st.name,x,y,maxWidth);
   c.font='17px "Be Vietnam Pro",sans-serif';c.fillStyle='#edc18e';const words=`Tội danh: ${this.verdicts[i]}`.split(' '),lines=[];let line='';
   for(const word of words){const next=line?line+' '+word:word;if(c.measureText(next).width>maxWidth&&line){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);
   lines.forEach((value,j)=>c.fillText(value,x,y+29+j*23,maxWidth));
  });
  const beam=c.createLinearGradient(980,550,980,870);beam.addColorStop(0,'#f4d78800');beam.addColorStop(1,'#f4d78830');c.fillStyle=beam;c.beginPath();c.moveTo(780,520);c.lineTo(1190,520);c.lineTo(1410,870);c.lineTo(560,870);c.fill();
  this.chosen.forEach((person,i)=>{const target=985+(i-(this.chosen.length-1)/2)*125;const x=1770+(target-1770)*ease,y=835-Math.sin(walk*Math.PI)*45;
   c.save();c.globalAlpha=clamp(progress/.10);figure(c,x,y,{robe:['#698d88','#9278a1','#b58c62','#627b9b','#b2767d'][i%5],kind:['civilian','longhair','scholar','soldier','hungry'][i%5],scale:.9,t:this.time+i,action:walk<1?'run':'think'});text(c,person.st.name,x,y+33,20,'#f3e6c2');c.restore();
  });
  if(progress>.65&&this.chosen.length){
   // Mỗi người có câu riêng; lần lượt nói 10 giây thay vì tất cả nói chồng nhau.
   const elapsed=this.mode==='answering'?this.dialogueTime-this.answeringStarted:0;
   const speaker=Math.floor(Math.max(0,elapsed)/10)%this.chosen.length;
   const x=985+(speaker-(this.chosen.length-1)/2)*125;
   c.fillStyle='#d7e5c5';c.fillRect(1330,boardY+boardHeight-25,25,5);
   bubble(c,`${this.chosen[speaker].st.name}: ${this.boardLines[speaker]}`,x,755);
  }
  text(c,this.mode==='answering'?'Đang trả bài · Nhấn “Gọi lượt tiếp” khi hoàn tất':'Người được gọi đang bước lên bảng…',985,110,26,'#f1d4a0');
  c.restore();c.restore();
 }
 drawBook(c,p){
  const opening=clamp(p/.08),scale=this.people.length>14?1.04:.94,centerX=this.people.length>14?1270:1240,centerY=475;
  c.save();c.translate(centerX,centerY);c.scale(scale,scale*.82);
  const bw=980,left=-490,top=-250;
  c.shadowColor='#090710';c.shadowBlur=22;c.fillStyle='#682d33';c.beginPath();c.roundRect(left-13,top-13,bw+26,526,12);c.fill();c.shadowBlur=0;
  // Tranches du papier, fermoirs et bord brûlé du grimoire.
  for(let i=7;i>0;i--){c.fillStyle=i%2?'#9b8058':'#baa479';c.fillRect(left-i,top+i*3,bw+i*2,500);}
  const paper=c.createRadialGradient(0,0,30,0,0,560);paper.addColorStop(0,'#efdfb1');paper.addColorStop(.7,'#c7aa78');paper.addColorStop(1,'#664c3c');c.fillStyle=paper;c.fillRect(left,top,bw,500);
  c.save();c.beginPath();c.rect(left,top,bw,500);c.clip();
  for(let i=0;i<32;i++){const x=left+(i*173%Math.max(1,bw));const y=top+(i*97%500);c.fillStyle='#5c382519';c.beginPath();c.ellipse(x,y,8+i%5*3,3+i%3*4,i,0,Math.PI*2);c.fill();}
  c.strokeStyle='#842d3d66';c.lineWidth=2;c.strokeRect(left+18,top+17,bw-36,465);
  for(let i=0;i<12;i++){const x=left+28+(i/11)*(bw-56);text(c,['冥','魂','令','敕'][i%4],x,top+35,18,'#8d344375');}
  c.restore();
  // Halo et âmes au-dessus des pages, sans masquer le décor.
  c.save();c.globalCompositeOperation='screen';
  for(let i=0;i<7;i++){const u=(this.time*.3+i/7)%1;c.globalAlpha=(1-u)*.3;c.fillStyle='#7ab5aa';c.beginPath();c.ellipse(Math.sin(i*7+this.time*.5)*bw*.43,190-u*420,9+u*14,18+u*28,.2,0,Math.PI*2);c.fill();}c.restore();
  if(p>.77&&p<.87){c.save();c.shadowColor='#bd263c';c.shadowBlur=35;c.strokeStyle='#a92843';c.lineWidth=4;c.strokeRect(left,top,bw,500);c.restore();}

  // Bìa gập quanh gáy ở giữa: cạnh phải quét sang trái theo góc 0 → π.
  if(p<.08){
   c.fillStyle='#241820';c.fillRect(left,top,490,500);
   c.save();c.scale(Math.cos(opening*Math.PI)||.001,1);
   const leather=c.createLinearGradient(0,0,490,0);leather.addColorStop(0,'#341820');leather.addColorStop(.5,'#71333b');leather.addColorStop(1,'#351c27');c.fillStyle=leather;c.fillRect(0,top,490,500);c.strokeStyle='#bb9354';c.lineWidth=6;c.strokeRect(20,top+20,450,460);
   if(opening<.49){text(c,'SỔ NAM TÀO',245,-65,45,'#d6b46c');text(c,'Có tên là có chuyện',245,20,24,'#c59864');text(c,'冥',245,120,74,'#c09753');}
   c.restore();c.restore();return;
  }
  // Lật liên tiếp tám trang, mỗi trang chạy từ phải sang trái, chưa lộ nội dung.
  if(p<.20){
   const flip=(p-.08)/.12*8,u=flip%1,angle=u*Math.PI,page=Math.floor(flip);
   text(c,'ĐANG LẬT SỔ…',-245,-180,26,'#704333');
   for(let i=0;i<10;i++){c.fillStyle='#8b725b44';c.fillRect(-430,-115+i*27,310-i%3*38,3);c.fillRect(65,-115+i*27,310-i%3*38,3);}
   c.save();c.scale(Math.cos(angle)||.001,1);const pg=c.createLinearGradient(0,0,480,0);pg.addColorStop(0,'#a38658');pg.addColorStop(.3,'#efdfb3');pg.addColorStop(1,'#cbb17e');c.fillStyle=pg;c.beginPath();c.moveTo(0,-250);c.quadraticCurveTo(250,-285-Math.sin(angle)*80,480,-250);c.lineTo(480,250);c.quadraticCurveTo(240,220-Math.sin(angle)*60,0,250);c.fill();c.restore();
   c.fillStyle='#4a33294d';c.fillRect(-8,-250,16+Math.sin(angle)*30,500);text(c,`Trang ${page+1}`,245,215,20,'#73503b');c.restore();return;
  }
  const names=this.people.map(person=>person.st.name),cursor=nameDrawCursor(this.nameDraw,clamp((p-.20)/.58));
  const pageSize=14,page=Math.floor(cursor.index/pageSize),first=page*pageSize;
  text(c,'SỔ ĐIỂM DANH',0,-210,30,'#653d31');
  const visible=Math.min(pageSize,names.length-first),columns=visible>7?2:1,rows=Math.ceil(visible/columns);
  const halfWidth=columns===1?345:195;
  const slotOf=index=>{const slot=index-first,row=Math.floor(slot/columns),col=slot%columns;return {x:columns===1?0:(col-.5)*460,y:-15+(row-(rows-1)/2)*44};};
  for(let i=first;i<Math.min(first+pageSize,names.length);i++){
   const pos=slotOf(i);
   const revealed=p>=.78;
   const chosen=revealed&&this.chosen.some(person=>person.st.name===names[i]);
   const lit=revealed ? chosen : i===cursor.index;
   if(lit){
    c.fillStyle='#eaa53644';
    c.beginPath();
    c.roundRect(pos.x-halfWidth,pos.y-19,halfWidth*2,38,7);
    c.fill();
   }
   c.save();
   c.translate(pos.x-halfWidth+19,pos.y);
   if(lit){
    c.shadowColor='#ffad33';
    c.shadowBlur=chosen && Math.sin((p-.78)*220)>0 ? 30 : 15;
   }
   c.fillStyle=lit?'#ffc754':'#846d60';
   c.beginPath();
   c.ellipse(0,0,11,13,0,0,Math.PI*2);
   c.fill();
   c.shadowBlur=0;
   c.fillStyle='#674035';
   c.fillRect(-6,-15,12,4);
   c.fillRect(-6,11,12,4);
   c.restore();

   c.font=`${lit?'800':'500'} 24px "Be Vietnam Pro",sans-serif`;
   c.fillStyle=lit?'#902237':revealed?'#806e60':'#4b352b';
   c.textAlign='center';
   c.fillText(names[i],pos.x+12,pos.y,halfWidth*2-62);
  }
  text(c,`Trang ${page+1}/${Math.max(1,Math.ceil(names.length/pageSize))} · ${names.length} tên`,0,169,19,'#76513e');
  if(p<.78){
   text(c,p>.60?'CHẬM LẠI… SẮP DỪNG!':'Ánh đèn đang chạy qua từng tên…',0,202,20,'#8f2c3b');
   if(names.length>1){const previous=(cursor.index-1+names.length)%names.length;c.font='16px "Be Vietnam Pro",sans-serif';c.fillStyle='#735747';c.fillText(`Vừa lướt qua: ${names[previous]}`,0,233,800);}
  }else{
   if(p>.84){c.save();c.translate(0,232);c.rotate(-.025);c.strokeStyle='#a52333';c.lineWidth=3;c.strokeRect(-190,-22,380,44);text(c,'ĐẾN LƯỢT CON',0,0,28,'#a52333');c.restore();}
  }
  c.restore();
 }
}
