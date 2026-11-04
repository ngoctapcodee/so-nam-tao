const TAU=Math.PI*2;
export const clamp=(v)=>Math.max(0,Math.min(v,1));
export function text(c,s,x,y,size=22,color='#ecd5aa'){c.fillStyle=color;c.font=`600 ${size}px "Be Vietnam Pro",sans-serif`;c.textAlign='center';c.fillText(s,x,y);}
function line(c,points,color,width=4){c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
export function figure(c,x,y,{robe='#ddd6c4',hat='',kind='',scale=1,t=0,action='idle',face='#d8b78a',flip=1}={}){
 c.save();c.translate(x,y);c.scale(scale,scale);
 c.fillStyle='#08081255';c.beginPath();c.ellipse(0,9,43,10,0,0,TAU);c.fill();
 c.scale(flip,1);
 const run=action==='run',fight=action==='fight',angry=action==='angry';
 const wave=Math.sin(t*(run?17:fight?9:2.4)),stride=run?wave*27:fight?wave*12:Math.sin(t*1.8)*3;
 c.translate(0,-Math.abs(wave)*(run?7:fight?10:2));c.rotate(run?-.12:fight?Math.sin(t*5)*.12:Math.sin(t*1.5)*.018);
 const limb=(a,b,d,color,width)=>{line(c,[a,b,d],'#191724',width+3);line(c,[a,b,d],color,width);c.fillStyle=color;c.beginPath();c.arc(b[0],b[1],width*.51,0,TAU);c.fill();};
 limb([-11,-27],[-20+stride*.4,-5],[-18+stride,7],'#4b4049',12);limb([12,-27],[20-stride*.4,-8],[18-stride,7],'#66535a',12);
 line(c,[[-18+stride,6],[-29+stride,9]],'#171723',10);line(c,[[18-stride,6],[29-stride,9]],'#171723',10);
 const cloth=c.createLinearGradient(-32,0,34,0);cloth.addColorStop(0,'#211d2d');cloth.addColorStop(.3,robe);cloth.addColorStop(.7,robe);cloth.addColorStop(1,'#332332');c.fillStyle=cloth;
 c.beginPath();c.moveTo(-22,-84);c.quadraticCurveTo(-32,-55,-35-wave*3,-17);c.quadraticCurveTo(0,-5,35+wave*3,-17);c.quadraticCurveTo(24,-55,22,-84);c.closePath();c.fill();
 line(c,[[-11,-78],[0,-55],[14,-80]],'#d8b679',3);line(c,[[-26,-41],[25,-41]],'#b48a53',6);line(c,[[-18,-35],[-23,-15]],'#16172555',2);line(c,[[12,-35],[23,-16]],'#fff0d52a',2);
 let l=[-43,-49+wave*4],r=[42,-51-wave*4];if(run){l=[-40,-68+stride];r=[39,-70-stride];}if(fight){l=[-46,-90+wave*15];r=[68,-97-wave*15];}if(action==='stir')r=[42+Math.cos(t*3)*13,-52+Math.sin(t*3)*10];if(action==='think')r=[19,-99];if(angry)r=[48,-55-Math.max(0,wave)*43];
 limb([-19,-76],[-33,(l[1]-76)/2],l,robe,13);limb([19,-76],[37,(r[1]-76)/2],r,robe,13);
 for(const hand of [l,r]){c.fillStyle=face;c.beginPath();c.ellipse(...hand,7,6,.2,0,TAU);c.fill();}
 c.fillStyle='#181722';c.beginPath();c.ellipse(0,-103,26,31,0,0,TAU);c.fill();
 const skin=c.createRadialGradient(-9,-112,2,0,-103,32);skin.addColorStop(0,angry?'#e5a18a':face);skin.addColorStop(1,angry?'#963b42':'#8f655d');c.fillStyle=skin;c.beginPath();c.ellipse(0,-101,23,27,0,0,TAU);c.fill();
 const blink=Math.sin(t*.8)> .994;
 line(c,[[-17,-111],[-6,-108+(angry?6:0)]],'#38202b',4);line(c,[[6,-108+(angry?6:0)],[17,-111]],'#38202b',4);
 c.fillStyle='#fff2d9';if(!blink){c.beginPath();c.ellipse(-10,-103,5,3,0,0,TAU);c.ellipse(10,-103,5,3,0,0,TAU);c.fill();}c.fillStyle='#211c28';c.beginPath();c.arc(-9,-102,2,0,TAU);c.arc(9,-102,2,0,TAU);c.fill();line(c,[[1,-101],[-2,-94],[4,-93]],'#8a514c',2);
 if(angry){c.fillStyle='#48222d';c.beginPath();c.ellipse(0,-84,10,7,0,0,TAU);c.fill();line(c,[[-7,-88],[7,-88]],'#f4ddc3',3);line(c,[[24,-123],[32,-130],[30,-120],[38,-125]],'#e84c4f',3);}
 else line(c,[[-6,-84],[0,-82],[7,-85]],'#64333e',2);
 if(kind==='ox'){for(const sign of [-1,1]){line(c,[[sign*15,-122],[sign*36,-145],[sign*30,-115]],'#352b2c',11);line(c,[[sign*15,-123],[sign*35,-143]],'#d8bc83',6);}c.fillStyle='#9c7956';c.beginPath();c.ellipse(0,-91,18,12,0,0,TAU);c.fill();line(c,[[-7,-94],[-6,-91]],'#403136',3);line(c,[[7,-94],[6,-91]],'#403136',3);}
 if(kind==='horse'){c.fillStyle='#a77e60';c.beginPath();c.ellipse(0,-90,16,25,0,0,TAU);c.fill();line(c,[[-13,-123],[-19,-146]],'#b99874',8);line(c,[[13,-123],[19,-146]],'#b99874',8);line(c,[[0,-135],[-9,-114]],'#33242b',10);}
 if(kind==='monkey'){c.fillStyle='#c88d45';c.beginPath();c.arc(-24,-101,8,0,TAU);c.arc(24,-101,8,0,TAU);c.fill();line(c,[[-23,-116],[22,-116]],'#f3c34c',5);for(const sign of [-1,1])line(c,[[sign*12,-129],[sign*28,-159],[sign*45,-150+Math.sin(t*4)*8]],'#e6ac45',3);line(c,[[-25,-20],[-53,-38],[-60+wave*5,-15],[-46,-4]],'#b7793d',5);}
 if(kind==='natra'){c.fillStyle='#211a2b';for(const sign of [-1,1]){c.beginPath();c.arc(sign*23,-124,11,0,TAU);c.fill();}line(c,[[-21,-120],[-17,-133]],'#ed6c88',4);line(c,[[21,-120],[17,-133]],'#ed6c88',4);for(const sign of [-1,1]){c.strokeStyle='#f25870';c.lineWidth=7;c.beginPath();c.moveTo(sign*12,-75);c.bezierCurveTo(sign*100,-130+wave*30,sign*60,-30,sign*115,-70+wave*20);c.stroke();}for(const sign of [-1,1]){c.strokeStyle='#f3b64c';c.lineWidth=4;c.beginPath();c.ellipse(sign*23,15,24,13,Math.sin(t*7),0,TAU);c.stroke();for(let i=0;i<6;i++)line(c,[[sign*23+Math.cos(t*9+i)*25,15+Math.sin(t*9+i)*13],[sign*23+Math.cos(t*9+i)*35,15+Math.sin(t*9+i)*22]],'#ec7441',3);}}
 if(kind==='king'){c.fillStyle='#301526';c.fillRect(-28,-142,56,29);c.fillStyle='#c59c43';c.fillRect(-36,-147,72,9);for(let i=-2;i<=2;i++){line(c,[[i*13,-146],[i*13+Math.sin(t*3+i)*3,-117]],'#caa85d',2);c.fillStyle='#eac981';c.beginPath();c.arc(i*13,-117,2,0,TAU);c.fill();}line(c,[[-19,-89],[-8,-92],[0,-88],[8,-92],[19,-89]],'#281a25',5);c.fillStyle='#241724';c.beginPath();c.moveTo(-14,-83);c.quadraticCurveTo(-18,-63,Math.sin(t*2)*7,-43);c.quadraticCurveTo(20,-64,15,-83);c.fill();text(c,'王',0,-51,17,'#eac06a');}
 if(kind==='monk'){c.fillStyle='#ce9d43';c.beginPath();c.moveTo(-23,-124);c.lineTo(-19,-154);c.lineTo(-8,-140);c.lineTo(0,-163);c.lineTo(9,-140);c.lineTo(20,-154);c.lineTo(25,-124);c.fill();for(let i=0;i<4;i++)line(c,[[-25,-72+i*13],[23,-61+i*13]],'#caaa66',3);}
 // Dáng riêng cho cư dân: không dùng chung một khuôn áo/mặt.
 if(kind==='civilian'){
  c.fillStyle='#30252e';c.beginPath();c.moveTo(-24,-111);c.quadraticCurveTo(-18,-145,12,-130);c.lineTo(26,-112);c.lineTo(7,-118);c.lineTo(-8,-112);c.fill();
  line(c,[[17,-55],[29,-24]],'#d7b077',5);c.fillStyle='#66483c';c.beginPath();c.roundRect(20,-36,24,28,5);c.fill();line(c,[[-18,-33],[-12,-18]],'#e4cdb13d',3);
 }
 if(kind==='scholar'){
  c.fillStyle='#39384c';c.fillRect(-24,-130,48,12);c.fillRect(-15,-145,30,18);line(c,[[-19,-103],[-3,-103]],'#524839',2);line(c,[[4,-103],[19,-103]],'#524839',2);c.strokeStyle='#b79f78';c.lineWidth=2;for(const x of [-10,11]){c.beginPath();c.ellipse(x,-102,9,7,0,0,TAU);c.stroke();}c.fillStyle='#d9c18d';c.fillRect(-45,-55,25,34);line(c,[[-41,-47],[-24,-47]],'#936e4c',2);
 }
 if(kind==='elder'){
  c.fillStyle='#bdc1b2';c.beginPath();c.arc(-16,-120,12,0,TAU);c.arc(12,-122,13,0,TAU);c.fill();line(c,[[-14,-95],[-5,-94]],'#8e6a60',1);line(c,[[7,-94],[15,-95]],'#8e6a60',1);line(c,[[38,-60],[45,11]],'#9d7855',5);
 }
 if(kind==='soldier'){
  c.fillStyle='#485e45';c.beginPath();c.ellipse(0,-125,30,12,0,Math.PI,TAU);c.fill();c.fillRect(-29,-126,58,7);c.fillStyle='#ccb77c';c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?3:7;const x=Math.cos(a)*r,y=-130+Math.sin(a)*r;i?c.lineTo(x,y):c.moveTo(x,y);}c.fill();
  c.fillStyle='#354b3c';c.fillRect(-27,-71,17,23);c.fillRect(10,-71,17,23);line(c,[[-19,-77],[24,-36]],'#b4a076',5);c.fillStyle='#76806a';c.fillRect(21,-53,17,30);text(c,'✦',0,-53,14,'#cab575');
 }
 if(kind==='longhair'){
  c.fillStyle='#131622';c.beginPath();c.moveTo(-25,-116);c.bezierCurveTo(-45,-88,-25+wave*4,-40,-40,-16);c.lineTo(-14,-26);c.lineTo(-8,-104);c.lineTo(11,-96);c.lineTo(14,-25);c.lineTo(39,-12);c.bezierCurveTo(24+wave*3,-72,38,-122,15,-131);c.quadraticCurveTo(-11,-140,-25,-116);c.fill();
  for(let i=0;i<8;i++)line(c,[[-25+i*7,-120],[-29+i*8+Math.sin(t*2+i)*5,-44]],'#353241',1);c.fillStyle='#c9ddd1';c.beginPath();c.ellipse(0,-94,5,7,0,0,TAU);c.fill();
 }
 if(kind==='hungry'){
  c.fillStyle='#7c9580';c.beginPath();c.ellipse(0,-24,22,18,0,0,TAU);c.fill();line(c,[[-16,-64],[-5,-61],[7,-64],[17,-60]],'#b9b899',2);line(c,[[-15,-54],[-4,-51],[7,-54],[16,-50]],'#b9b899',2);
  c.fillStyle='#9e8360';c.beginPath();c.ellipse(38,-44,19,10,0,0,Math.PI);c.fill();c.strokeStyle='#c6b48c';c.lineWidth=2;c.beginPath();c.ellipse(38,-44,19,5,0,0,TAU);c.stroke();c.fillStyle='#392d36';c.beginPath();c.ellipse(0,-83,9,6,0,0,TAU);c.fill();
 }
 if(kind==='ghost'){c.globalAlpha=.6;line(c,[[-7,-80],[-16,-65],[0,-53],[14,-65]],'#a4e9d5',3);}
 if(hat){c.fillStyle=cloth;c.beginPath();c.moveTo(-22,-122);c.lineTo(-17,-176);c.quadraticCurveTo(0,-188,18,-176);c.lineTo(23,-122);c.fill();line(c,[[-22,-126],[23,-126]],'#ad8f66',3);text(c,hat,0,-150,13,robe==='#eee7d6'?'#302630':'#f5e3b2');if(robe==='#eee7d6'){c.fillStyle='#ad3e51';c.beginPath();c.ellipse(0,-76,5,13,0,0,TAU);c.fill();}}
 if(action==='think'||angry){line(c,[[r[0],r[1]],[r[0]+24,r[1]-40]],'#42242b',5);line(c,[[r[0]+24,r[1]-40],[r[0]+29,r[1]-51]],'#ba3340',4);}
 if(kind==='monkey'||kind==='natra'){c.save();c.translate(r[0],r[1]);c.rotate(fight?Math.sin(t*7)*1.3:.1);line(c,[[0,-95],[0,100]],'#c69c4a',7);line(c,[[0,-65],[0,68]],kind==='monkey'?'#b53238':'#b4bbc7',5);if(kind==='natra'){c.fillStyle='#d8d4be';c.beginPath();c.moveTo(-9,-94);c.lineTo(0,-126);c.lineTo(9,-94);c.fill();}c.restore();}
 c.restore();
}
function palace(c,x,y,w,h,label,t){
 c.fillStyle='#292431';c.fillRect(x,y,w,h);c.fillStyle='#45343c';c.fillRect(x+12,y+12,w-24,h-12);
 for(let i=1;i<5;i++){c.fillStyle='#752f38';c.fillRect(x+i*w/5-8,y+20,16,h-20);c.fillStyle='#d0a454';c.fillRect(x+i*w/5-9,y+30,18,7);}
 for(let tier=0;tier<2;tier++){let yy=y-tier*54; c.fillStyle=tier?'#22212d':'#34303b';c.beginPath();c.moveTo(x-42,yy+12);c.quadraticCurveTo(x-12,yy+10,x-35,yy-32);c.quadraticCurveTo(x+w/2,yy-6-tier*50,x+w+35,yy-32);c.quadraticCurveTo(x+w+12,yy+10,x+w+42,yy+12);c.closePath();c.fill();line(c,[[x-40,yy+12],[x+w+40,yy+12]],'#aa8755',4);}
 c.fillStyle='#11131e';c.fillRect(x+w*.34,y+70,w*.32,h-70);c.fillStyle='#171320';c.fillRect(x+w*.2,y+15,w*.6,50);text(c,label,x+w/2,y+50,23,'#d5b777');
 [x+20,x+w-20].forEach((xx,i)=>{c.save();c.translate(xx,y+70);c.rotate(Math.sin(t*1.7+i)*.07);line(c,[[0,-30],[0,0]],'#a68b60',2);c.shadowColor='#ef683e';c.shadowBlur=16;c.fillStyle='#a63235';c.beginPath();c.ellipse(0,14,14,22,0,0,TAU);c.fill();c.shadowBlur=0;text(c,'冥',0,20,15,'#f2c272');c.restore();});
}
export function world(c,t){
 const sky=c.createLinearGradient(0,0,0,1080);sky.addColorStop(0,'#100f20');sky.addColorStop(.6,'#403140');sky.addColorStop(1,'#252332');c.fillStyle=sky;c.fillRect(0,0,1920,1080);
 c.fillStyle='#b9aba0';c.beginPath();c.arc(1570,130,64,0,TAU);c.fill();c.fillStyle='#252033';c.beginPath();c.arc(1543,117,65,0,TAU);c.fill();
 for(let i=0;i<7;i++){c.fillStyle=i%2?'#292435':'#211e2e';c.beginPath();c.moveTo(i*320-100,650);c.lineTo(i*320+120,150+i%3*50);c.lineTo(i*320+400,650);c.fill();}
 palace(c,80,410,400,270,'QUÁN MẠNH BÀ',t);palace(c,690,330,540,350,'ĐIỆN DIÊM VƯƠNG',t);palace(c,1450,420,370,250,'TY PHÁN QUAN',t);
 c.fillStyle='#272d37';c.fillRect(0,680,1920,400);
 for(let row=0;row<8;row++)for(let col=0;col<18;col++){c.strokeStyle='#42424a';c.lineWidth=2;c.strokeRect(col*125-(row%2)*60,690+row*50,120,46);}
 // Vong Xuyên, cầu đá và những cột lửa ma trơi.
 c.fillStyle='#275153';c.beginPath();c.moveTo(0,710);c.quadraticCurveTo(600,710,460,1080);c.lineTo(0,1080);c.fill();
 for(let i=0;i<15;i++){let x=(i*57+t*13)%470;line(c,[[x,770+i*19],[x+28,770+i*19]],'#658e83',2);}
 c.strokeStyle='#8c7f7a';c.lineWidth=25;c.beginPath();c.moveTo(0,900);c.quadraticCurveTo(260,640,530,880);c.stroke();c.lineWidth=7;c.beginPath();c.moveTo(0,830);c.quadraticCurveTo(260,570,530,810);c.stroke();for(let i=0;i<8;i++){const x=i*70;const y=830-220*Math.sin(i/7*Math.PI);line(c,[[x,y],[x,y+60]],'#8c7f7a',7);}c.fillStyle='#31242e';c.fillRect(65,827,300,48);c.strokeStyle='#bd9c65';c.lineWidth=3;c.strokeRect(65,827,300,48);text(c,'CẦU QUÊN BÀI CŨ',215,853,23,'#f1d699');
 for(let i=0;i<8;i++){const x=590+i*175,y=660+Math.sin(i)*20;c.fillStyle='#45404a';c.fillRect(x-13,y,26,65);c.shadowColor='#71e2c1';c.shadowBlur=22;c.fillStyle='#79d8be';c.beginPath();c.ellipse(x+Math.sin(t*3+i)*4,y-16,8,19+Math.sin(t*4+i)*5,0,0,TAU);c.fill();c.shadowBlur=0;}
 // Mạnh Bà khuấy nồi, hơi canh và củi cháy.
 figure(c,210,675,{robe:'#796376',face:'#c6b29b',t,action:'stir'});
 line(c,[[180,610],[270+Math.sin(t*3)*16,686]],'#b59568',6);
 hearth(c,290,778,t);
 c.fillStyle='#171925';c.beginPath();c.ellipse(290,719,68,47,0,0,Math.PI);c.fill();c.fillStyle='#6ba389';c.beginPath();c.ellipse(290,716,67,17,0,0,TAU);c.fill();
 for(let i=0;i<5;i++){const u=(t*.55+i/5)%1;c.globalAlpha=(1-u)*.5;c.fillStyle='#c6ddd0';c.beginPath();c.ellipse(270+Math.sin(t+i)*18,705-u*125,12+u*16,13+u*20,0,0,TAU);c.fill();}c.globalAlpha=1;

 figure(c,1500,735,{robe:'#7c4839',kind:'ox',t});figure(c,1730,735,{robe:'#536378',kind:'horse',t:t+2});text(c,'Đầu Trâu',1500,770,19);text(c,'Mặt Ngựa',1730,770,19);
 // Giao đấu theo nhịp: áp sát, chạm vũ khí, lùi đỡ rồi phản công.
 const cycle=(t%6)/6,attack=Math.sin(cycle*Math.PI),hit=Math.pow(Math.max(0,Math.cos(t*7)),10);
 const duelX=1430,duelY=510;
 figure(c,duelX-100+attack*42,duelY-Math.max(0,Math.sin(t*3))*35,{robe:'#c59536',kind:'monkey',t,action:'fight',scale:.88});
 figure(c,duelX+105-attack*42,duelY-Math.max(0,Math.cos(t*3))*30,{robe:'#b94c67',kind:'natra',t:t+.45,action:'fight',scale:.85,flip:-1});
 for(let i=0;i<9;i++){const angle=i*TAU/9+t*3;c.globalAlpha=hit;c.strokeStyle=i%2?'#f7d77b':'#e98060';c.lineWidth=3;c.beginPath();c.moveTo(duelX+Math.cos(angle)*12,duelY-90+Math.sin(angle)*12);c.lineTo(duelX+Math.cos(angle)*(30+hit*22),duelY-90+Math.sin(angle)*(30+hit*22));c.stroke();}c.globalAlpha=1;
 text(c,'NGỘ KHÔNG ⚔ NA TRA',1430,560,19,'#e5bb66');
 // Đường Tăng bị trói ở ngoài điện, tiểu quỷ canh giữ.
 c.fillStyle='#49343b';c.fillRect(1800,512,13,185);figure(c,1806,693,{robe:'#b86d3e',kind:'monk',t,scale:.85});
 for(let i=0;i<4;i++)line(c,[[1775,637+i*9],[1837,641+i*9]],'#c5a26a',4);
 figure(c,1880,704,{robe:'#58644e',face:'#849570',scale:.62,t,action:'idle'});
 c.save();c.translate(1780,510+Math.sin(t*4)*5);c.fillStyle='#fff0c7';c.beginPath();c.roundRect(-100,-45,200,48,12);c.fill();text(c,'SOS! Ngộ Không ơi!',0,-19,16,'#962d3d');c.restore();text(c,'Đường Tăng chờ cứu',1800,738,17);
 for(let i=0;i<6;i++){const x=(t*(i%2?-17:22)+i*377+2400)%2280-180;phantom(c,x,760+Math.sin(t*.8+i)*100,t+i,.65+i%3*.13);}
 residents(c,t);
 // Sương di chuyển, không phủ kín nhân vật.
 for(let i=0;i<5;i++){c.fillStyle='#a8bcbb08';c.beginPath();c.ellipse((i*450+t*18)%2300-200,950+i%2*70,330,30,0,0,TAU);c.fill();}
}
export function reapers(c,t,x,y,spread=65){figure(c,x-spread,y,{robe:'#26212e',hat:'THƯỞNG',t,action:'run',scale:1.05});figure(c,x+spread,y,{robe:'#eee7d6',hat:'PHẠT',t:t+.2,action:'run',scale:1.05});}

export function portal(c,t,x,y,amount=1){
 c.save();c.translate(x,y);c.scale(amount,1);const g=c.createRadialGradient(0,-60,5,0,-60,135);g.addColorStop(0,'#0a0916');g.addColorStop(.65,'#162b31');g.addColorStop(.85,'#6eb89c');g.addColorStop(1,'#396a5a00');c.fillStyle=g;c.beginPath();c.ellipse(0,-60,80,140,0,0,TAU);c.fill();
 for(let i=0;i<18;i++){const a=i*TAU/18+t*.7;c.strokeStyle=i%2?'#add7b3':'#567b81';c.lineWidth=3;c.beginPath();c.ellipse(Math.cos(a)*71,-60+Math.sin(a)*125,5,11,-a,0,TAU);c.stroke();}
 for(let i=0;i<9;i++){const u=(t*.6+i/9)%1;c.globalAlpha=(1-u)*.45;c.fillStyle='#8ab8ac';c.beginPath();c.ellipse(Math.cos(i*2)*100*(1-u),30-u*130,12+u*20,15+u*30,0,0,TAU);c.fill();}c.restore();
}
export function chain(c,t,from,to,tension=0){
 const dx=to[0]-from[0],dy=to[1]-from[1],n=Math.max(3,Math.ceil(Math.hypot(dx,dy)/11));
 c.save();c.shadowColor='#86cdb6';c.shadowBlur=5;
 for(let i=0;i<=n;i++){const u=i/n,x=from[0]+dx*u,y=from[1]+dy*u+Math.sin(u*Math.PI)*(1-tension)*40+Math.sin(u*15-t*14)*(1-tension)*7;c.strokeStyle=i%2?'#d6d8bd':'#748c8a';c.lineWidth=2.5;c.beginPath();c.ellipse(x,y,7,i%2?3:6,Math.atan2(dy,dx),0,TAU);c.stroke();}c.restore();
}


function placard(c,label,x,y,w=220){c.fillStyle='#251e2d';c.beginPath();c.roundRect(x-w/2,y-20,w,40,5);c.fill();c.strokeStyle='#99794f';c.lineWidth=2;c.strokeRect(x-w/2+4,y-16,w-8,32);text(c,label,x,y+2,17,'#d8c395');}
function residents(c,t){
 // Nhà sàn và hành lang trên cao: chân cột, xà đỡ và lan can tạo chiều sâu.
 for(const x of [45,282]){c.fillStyle='#211d2b';c.fillRect(x,358,16,52);c.fillStyle='#78604a';c.fillRect(x,358,3,52);}
 c.fillStyle='#3e3038';c.fillRect(25,355,280,22);
 for(let i=0;i<4;i++){const y=545+i*33;c.fillStyle='#4d3c41';c.fillRect(20+i*11,y,85,12);}
 c.fillStyle='#342b38';c.fillRect(1505,385,345,18);line(c,[[1510,336],[1510,384],[1845,384],[1845,336]],'#987858',5);
 for(let i=0;i<8;i++)line(c,[[1520+i*45,349],[1520+i*45,386]],'#8c7157',3);
 line(c,[[1510,350],[1840,350]],'#a18760',4);
 for(const x of [1520,1820]){c.fillStyle='#332635';c.fillRect(x,403,12,28);}
 // Bài tập từ lớp học được chuyển xuống qua lửa âm, cư dân chờ nhận bài.
 c.fillStyle='#3c343d';c.fillRect(515,470,145,145);c.fillStyle='#171821';c.beginPath();c.roundRect(537,501,100,99,[22,22,0,0]);c.fill();
 for(let i=0;i<7;i++){c.fillStyle=i%2?'#cf6038':'#e7b75d';c.beginPath();c.ellipse(547+i*11,581,9,20+Math.sin(t*8+i)*13,0,0,TAU);c.fill();}
 placard(c,'TRẠM CHUYỂN BÀI TẬP XUỐNG ÂM PHỦ',575,380,370);
 for(let i=0;i<18;i++){
  const u=(t*.13+i/18)%1,x=535+(i*67%125)+Math.sin(u*9+i)*24,y=150+u*480;
  c.save();c.translate(x,y);c.rotate(Math.sin(t*2+i)*.8);c.scale(1,Math.cos(t*3+i)*.25+.75);
  c.fillStyle=i%3?'#ddcfab':'#b6c6b9';c.fillRect(-15,-21,30,42);c.strokeStyle='#7e7764';c.lineWidth=1;c.strokeRect(-12,-18,24,36);for(let j=0;j<4;j++){c.beginPath();c.moveTo(-9,-8+j*6);c.lineTo(9,-8+j*6);c.stroke();}c.fillStyle='#9e3a46';c.fillRect(-8,-15,16,3);c.restore();
 }
 for(let i=0;i<3;i++){
  const x=445+i*66;figure(c,x,735,{kind:['elder','civilian','scholar'][i],robe:['#8b726b','#6f8993','#8c8068'][i],t:t+i,scale:.66,action:'fight'});

 }
 placard(c,'KHU NHẬN BÀI TẬP CHƯA NỘP',540,779,315);
 // Ma tóc dài, chiến sĩ và ma đói có phụ kiện, hành vi riêng.
 figure(c,75+Math.sin(t*.3)*12,1030,{kind:'longhair',robe:'#d8d7c9',face:'#c5d7c8',scale:.9,t});
 figure(c,1670,1020,{kind:'soldier',robe:'#556b50',face:'#bcc2a2',scale:.8,t,action:'idle'});
 figure(c,1810,1025,{kind:'hungry',robe:'#7f8165',face:'#a9b59a',scale:.84,t,action:'stir'});
 // Quầy học cụ, bàn cờ và hành lang chờ kiểm tra.
 c.fillStyle='#623b3c';c.fillRect(25,220,280,16);c.fillStyle='#39303b';c.fillRect(40,235,12,119);c.fillRect(278,235,12,119);c.fillStyle='#9a6952';c.fillRect(35,319,260,40);
 for(let i=0;i<5;i++){c.fillStyle=['#b89c7e','#8d9e98','#a78b9a'][i%3];c.fillRect(55+i*46,294,29,24);c.strokeStyle='#e0cfaa';c.lineWidth=2;c.strokeRect(59+i*46,298,21,16);}placard(c,'QUẦY BÚT MỰC · VỞ ÂM PHỦ',165,202,300);
 figure(c,170,321,{kind:'elder',robe:'#7b6a86',t,scale:.55,action:'stir'});
 for(let i=0;i<4;i++){c.fillStyle='#b5484566';c.fillRect(60+i*18,286,2,28);c.fillStyle='#d99256';c.beginPath();c.arc(61+i*18,285,2,0,TAU);c.fill();}
 placard(c,'passwifi: diangucxinchao',1635,208,340);
 placard(c,'PHÒNG CHỜ KIỂM TRA MIỆNG',1690,300,345);
 for(let i=0;i<4;i++){figure(c,1560+i*77,365,{kind:['civilian','longhair','scholar','elder'][i],robe:['#6b8177','#b1b8aa','#8c8295','#9d805e'][i],scale:.42,t:t+i});text(c,`Lượt ${i+1}`,1560+i*77,388,13);}
 c.fillStyle='#554435';c.fillRect(1160,943,100,12);c.fillRect(1174,955,8,40);c.fillRect(1238,955,8,40);c.fillStyle='#d4b789';c.fillRect(1168,925,82,17);
 for(let i=0;i<5;i++){c.fillStyle=i%2?'#251d2b':'#a64b43';c.beginPath();c.arc(1180+i*13,933,3,0,TAU);c.fill();}
 figure(c,1120,1005,{kind:'elder',robe:'#8d7772',scale:.55,t,action:'think'});figure(c,1300,1005,{kind:'scholar',robe:'#677e8b',scale:.55,t:t+1,action:'think'});
}


// Hồn không có chân: thân khói rách, tóc dài, hốc mắt tối và vệt tan dần.
function phantom(c,x,y,t,scale=1){
 c.save();c.translate(x,y);c.scale(scale,scale);c.rotate(Math.sin(t*.7)*.13);
 for(let trail=5;trail>0;trail--){c.save();c.globalAlpha=.028*(6-trail);c.translate(-trail*13,Math.sin(t+trail*.3)*9);c.fillStyle='#a9c3b3';c.beginPath();c.ellipse(0,-44,37,78,.1,0,TAU);c.fill();c.restore();}
 const body=c.createLinearGradient(0,-130,0,65);body.addColorStop(0,'#dae0c5bb');body.addColorStop(.5,'#8aa69aa0');body.addColorStop(1,'#48635a00');c.fillStyle=body;c.beginPath();c.moveTo(-21,-111);c.bezierCurveTo(-52,-60,-34,4,-68+Math.sin(t*2)*16,57);c.quadraticCurveTo(-19,28,-25,67);c.quadraticCurveTo(1,29,6,58);c.quadraticCurveTo(25,25,39,60);c.bezierCurveTo(39,-10,57,-60,22,-112);c.closePath();c.fill();
 c.strokeStyle='#98b4a58c';c.lineWidth=7;c.beginPath();c.moveTo(-22,-70);c.quadraticCurveTo(-67,-74,-74,-20+Math.sin(t)*10);c.moveTo(22,-70);c.quadraticCurveTo(69,-91,75,-35+Math.cos(t)*10);c.stroke();
 for(const side of [-1,1])for(let i=0;i<4;i++){c.strokeStyle='#b5c8b17a';c.lineWidth=2;c.beginPath();c.moveTo(side*74,-29);c.lineTo(side*(80+i*3),-9+i*4+Math.sin(t)*6);c.stroke();}
 c.fillStyle='#cdd8bcbf';c.beginPath();c.ellipse(0,-111,24,33,0,0,TAU);c.fill();c.fillStyle='#18282b';for(const side of [-1,1]){c.beginPath();c.ellipse(side*10,-114,7,10,side*.25,0,TAU);c.fill();c.fillStyle='#c7eacb';c.beginPath();c.arc(side*10,-113,1.5,0,TAU);c.fill();c.fillStyle='#18282b';}c.beginPath();c.ellipse(0,-89,7,13,0,0,TAU);c.fill();
 c.strokeStyle='#111b26dd';c.lineWidth=5;for(let i=0;i<11;i++){const hx=-26+i*5;c.beginPath();c.moveTo(hx,-124-Math.sin(i)*12);c.bezierCurveTo(hx-17,-100,hx+Math.sin(t+i)*15,-75,hx+Math.sin(t*1.2+i)*17,-36-Math.abs(5-i)*5);c.stroke();}
 for(let i=0;i<6;i++){const u=(t*.35+i/6)%1;c.globalAlpha=(1-u)*.12;c.fillStyle='#a6c4ae';c.beginPath();c.ellipse(Math.sin(t+i)*45,30+u*90,15+u*23,7+u*18,0,0,TAU);c.fill();}c.restore();
}


export function hearth(c,x,y,t){
 c.save();c.translate(x,y);const flicker=.85+Math.sin(t*12)*.07+Math.sin(t*21)*.05;
 const glow=c.createRadialGradient(0,-22,2,0,-22,120);glow.addColorStop(0,`rgba(255,164,53,${.38*flicker})`);glow.addColorStop(.5,'#e9672822');glow.addColorStop(1,'#e9672800');c.fillStyle=glow;c.fillRect(-125,-145,250,220);
 c.lineCap='round';for(const sign of [-1,1]){line(c,[[-52,sign*8],[52,-sign*8]],'#251d22',17);line(c,[[-48,sign*8],[48,-sign*8]],'#654237',10);}
 c.save();c.globalCompositeOperation='lighter';
 for(let layer=0;layer<3;layer++)for(let i=0;i<7;i++){
  const phase=t*(6+layer)+i*2.7,h=(38+Math.sin(phase)*14+Math.sin(phase*1.7)*8)*(1-layer*.22),base=(i-3)*14,width=16-layer*3,bend=Math.sin(t*5+i)*13;
  const g=c.createLinearGradient(base,4,base,-h);g.addColorStop(0,layer===2?'#fff3b8dd':'#ef6a20bb');g.addColorStop(.45,layer===2?'#ffe9a0dd':'#fcb83cbb');g.addColorStop(1,'#c9401800');c.fillStyle=g;
  c.beginPath();c.moveTo(base-width,3);c.bezierCurveTo(base-width*1.7,-h*.35,base+bend-width*.3,-h*.6,base+bend,-h);c.bezierCurveTo(base+bend+width*.4,-h*.45,base+width*1.4,-h*.3,base+width,3);c.closePath();c.fill();
 }
 for(let i=0;i<19;i++){const u=(t*(.45+i%3*.1)+i/19)%1;c.globalAlpha=(1-u)*.85;c.fillStyle=i%3?'#fcb655':'#ffe5a0';c.beginPath();c.ellipse(Math.sin(i*7+t*2+u*4)*(20+u*40),-u*145,1.2+i%2,2.4,Math.sin(t+i),0,TAU);c.fill();}
 c.restore();
 for(let i=0;i<7;i++){c.fillStyle=`rgba(246,119,45,${.5+Math.sin(t*4+i)*.2})`;c.beginPath();c.ellipse((i-3)*14,5,4,2,0,0,TAU);c.fill();}
 c.restore();
}
