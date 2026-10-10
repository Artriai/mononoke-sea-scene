/* 海坊主 · 浮世之舟 v2 — shot-based architectural reconstruction */
(() => {
'use strict';
const $=id=>document.getElementById(id),T=window.THREE;
let renderer;
try{renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});}catch(e){$('error').hidden=false;return;}
renderer.setPixelRatio(Math.min(devicePixelRatio,matchMedia('(pointer:coarse)').matches?1.25:1.6));renderer.setSize(innerWidth,innerHeight);$('world').appendChild(renderer.domElement);
const scene=new T.Scene();scene.background=new T.Color('#87aec1');scene.fog=new T.Fog('#94a2b9',95,210);
const camera=new T.PerspectiveCamera(72,innerWidth/innerHeight,.07,280);camera.rotation.order='YXZ';
const ink='#333638',cream='#eee6c9',yellow='#d9d477',pink='#cd8292',cyan='#81bdc2';
let seed=25;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
function canvas(w=512,h=512){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function grain(ctx,w,h,a=.08){const d=ctx.getImageData(0,0,w,h);for(let i=0;i<d.data.length;i+=4){const q=(rand()-.5)*255*a;for(let j=0;j<3;j++)d.data[i+j]+=q;}ctx.putImageData(d,0,0);}
function tex(draw,w=512,h=512){const c=canvas(w,h),ctx=c.getContext('2d');draw(ctx,w,h);grain(ctx,w,h);const t=new T.CanvasTexture(c);t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;}
function flower(c,x,y,r,col,petals=5){c.save();c.translate(x,y);c.strokeStyle='#727560';c.lineWidth=.9;c.fillStyle=col;for(let i=0;i<petals;i++){c.save();c.rotate(i*Math.PI*2/petals);c.beginPath();c.ellipse(0,-r*.52,r*.4,r*.55,0,0,Math.PI*2);c.fill();c.stroke();c.strokeStyle='#aa8792';c.beginPath();c.moveTo(0,-r*.75);c.lineTo(0,-r*.36);c.stroke();c.restore();}c.fillStyle='#b4a4c4';c.beginPath();c.arc(0,0,r*.28,0,7);c.fill();c.strokeStyle='#707e8a';c.stroke();c.beginPath();c.arc(0,0,r*.14,0,7);c.stroke();c.restore();}
function spiral(c,x,y,r,col='#bcb06b',width=2){c.strokeStyle=col;c.lineWidth=width;c.beginPath();for(let i=0;i<96;i++){const a=i*.12,rr=r*i/96;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr*.65);}c.stroke();}
function fish(c,x,y,r,color){c.save();c.translate(x,y);c.fillStyle=color;c.strokeStyle='#426778';c.lineWidth=1.5;c.beginPath();c.moveTo(-r*.65,0);c.bezierCurveTo(-r*.3,-r*.7,r*.8,-r*.4,r*.85,0);c.bezierCurveTo(r*.6,r*.5,-r*.3,r*.65,-r*.65,0);c.fill();c.stroke();c.beginPath();c.moveTo(-r*.55,0);c.lineTo(-r*1.03,-r*.45);c.lineTo(-r*.94,r*.45);c.closePath();c.fill();c.stroke();c.fillStyle='#ebe4bd';c.beginPath();c.arc(r*.5,-r*.07,r*.105,0,7);c.fill();c.fillStyle='#345e71';c.beginPath();c.arc(r*.52,-r*.07,r*.046,0,7);c.fill();c.strokeStyle='#cadac4';c.lineWidth=.8;for(let i=-3;i<=2;i++)for(let j=-2;j<=2;j++){c.beginPath();c.arc(i*r*.13,j*r*.13,r*.11,-1,1.3);c.stroke();}c.restore();}
const maps={};
maps.floral=tex((c,w,h)=>{c.fillStyle=yellow;c.fillRect(0,0,w,h);c.strokeStyle='#598a72';c.lineWidth=4;for(let k=0;k<2;k++){const y=k*128+67;c.beginPath();c.moveTo(0,y);c.bezierCurveTo(160,y-30,330,y+30,512,y);c.stroke();for(let i=0;i<6;i++){const x=43+i*85;flower(c,x,y+Math.sin(i*3)*15,26,'#d08dac');c.fillStyle='#739875';c.beginPath();c.ellipse(x+28,y+28,15,7,-.7,0,7);c.fill();}}},512,256);
maps.column=tex((c,w,h)=>{c.fillStyle='#b2d5cc';c.fillRect(0,0,w,h);c.fillStyle='#9bc8c5';c.fillRect(20,0,w-40,h);for(let j=0;j<13;j++){const y=j*116+45;c.strokeStyle='#518b6d';c.lineWidth=7;c.beginPath();c.moveTo(25,y-45);c.bezierCurveTo(200,y-55,220,y+100,30,y+110);c.stroke();fish(c,126,y+25,54,j%2?'#547fba':'#d88059');c.fillStyle='#d1cb58';c.beginPath();c.ellipse(120,y+68,65,10,0,0,7);c.fill();flower(c,48,y-13,16,'#e8ded0');flower(c,208,y+70,14,'#e2d4c4');}c.strokeStyle='#faf0d3';c.lineWidth=9;c.strokeRect(6,0,w-12,h);c.strokeStyle='#6ca0b0';c.lineWidth=3;c.strokeRect(14,0,w-28,h);},256,1536);
function tileMap(bg){return tex((c,w,h)=>{c.fillStyle=ink;c.fillRect(0,0,w,h);for(let a=0;a<4;a++)for(let b=0;b<4;b++){const x=a*128+6,y=b*128+6;c.fillStyle=(a+b)%2?cream:bg;c.fillRect(x,y,116,116);c.fillStyle=(a+b)%2?'#add0ca':cream;c.beginPath();c.moveTo(x+4,y+4);c.lineTo(x+54,y+4);c.lineTo(x+4,y+54);c.fill();c.fillStyle='#bc6e79';c.beginPath();c.moveTo(x+58,y+19);c.lineTo(x+100,y+58);c.lineTo(x+58,y+97);c.lineTo(x+16,y+58);c.closePath();c.fill();c.strokeStyle='#e0cd76';c.lineWidth=4;c.beginPath();for(let k=0;k<8;k++)c.lineTo(x+58+26*Math.cos(k*Math.PI/4),y+58+26*Math.sin(k*Math.PI/4));c.closePath();c.fillStyle='#474147';c.fill();c.stroke();c.fillStyle='#dcca6d';for(let k=0;k<4;k++){c.save();c.translate(x+58,y+58);c.rotate(k*Math.PI/2);c.beginPath();c.ellipse(0,-11,3,7,0,0,7);c.fill();c.restore();}}});}
maps.tile=tileMap('#c37e8b');maps.tileBlue=tileMap('#79adb9');maps.tilePurple=tileMap('#ae8abb');
maps.tatami=tex((c,w,h)=>{c.fillStyle='#89bfa9';c.fillRect(0,0,w,h);for(let y=0;y<h;y+=3){c.strokeStyle=y%6?'#75aa94':'#a7c5a8';c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}c.strokeStyle='#48796b';c.lineWidth=5;c.strokeRect(0,0,w,h);c.strokeStyle='#d3d58a';c.lineWidth=2;c.strokeRect(9,9,w-18,h-18);});
maps.wood=tex((c,w,h)=>{c.fillStyle='#d4ccb1';c.fillRect(0,0,w,h);for(let x=0;x<w;x+=64){c.strokeStyle='#898671';c.lineWidth=1.2;c.strokeRect(x,0,64,h);for(let i=0;i<10;i++){let p=x+rand()*61;c.strokeStyle='#b9b199';c.beginPath();c.moveTo(p,0);c.bezierCurveTo(p+12,180,p-10,350,p,h);c.stroke();}}});
maps.cloud=tex((c,w,h)=>{c.fillStyle='#cc686d';c.fillRect(0,0,w,h);for(let y=-90;y<600;y+=135){c.fillStyle='#c6b486';c.beginPath();c.moveTo(0,y+80);c.bezierCurveTo(140,y-35,270,y+170,512,y+10);c.lineTo(512,y+90);c.bezierCurveTo(290,y+220,140,y+30,0,y+165);c.fill();c.strokeStyle='#f4edd1';c.lineWidth=22;c.beginPath();c.moveTo(-20,y+110);c.bezierCurveTo(110,y-20,340,y+210,500,y+45);c.stroke();c.lineWidth=8;for(let x=40;x<512;x+=165)spiral(c,x,y+70,45,'#f6efcf',8);}});
maps.bamboo=tex((c,w,h)=>{c.fillStyle='#7bac7a';c.fillRect(0,0,w,h);for(let x=0;x<w;x+=32){c.strokeStyle='#3b745d';c.lineWidth=2;c.strokeRect(x,0,31,h);for(let y=(x%3)*30;y<h;y+=110)c.strokeRect(x,y,31,1);}});
maps.stairBack=tex((c,w,h)=>{const cols=['#96cabb','#bd83b5','#d59670','#dfce83','#83b9c4','#b5c782'];for(let i=0;i<12;i++){c.fillStyle=cols[i%6];c.fillRect(i*w/12,0,w/12,h);c.strokeStyle='#617275';c.lineWidth=1.5;c.strokeRect(i*w/12,0,w/12,h);for(let j=0;j<6;j++)spiral(c,i*w/12+30,j*110+40,20,'#d8c17a',2);}for(let i=0;i<32;i++)flower(c,rand()*w,rand()*h,8+rand()*9,'#e5d8ba');},1024,768);
maps.waveBorder=tex((c,w,h)=>{c.fillStyle=yellow;c.fillRect(0,0,w,h);c.strokeStyle='#608cab';c.lineWidth=8;for(let i=0;i<8;i++){const x=i*64;spiral(c,x+32,68,24,'#628da9',7);c.beginPath();c.moveTo(x+5,83);c.quadraticCurveTo(x+40,120,x+64,79);c.stroke();}c.strokeStyle='#e8df99';c.lineWidth=5;c.strokeRect(3,3,w-6,h-6);},512,128);
maps.starBorder=tex((c,w,h)=>{c.fillStyle=pink;c.fillRect(0,0,w,h);for(let i=0;i<8;i++){let x=i*64+32;c.fillStyle=i%2?'#a6c3c2':yellow;c.beginPath();c.moveTo(x,8);c.lineTo(x+30,32);c.lineTo(x,56);c.lineTo(x-30,32);c.closePath();c.fill();if(i%2)flower(c,x,32,17,cream,8);else{c.fillStyle='#b76578';c.beginPath();c.arc(x,32,6,0,7);c.fill();}}},512,64);
maps.lattice=tex((c,w,h)=>{c.fillStyle='#dfddd0';c.fillRect(0,0,w,h);c.fillStyle='#383f3f';for(let x=0;x<w;x+=32)c.fillRect(x,0,4,h);for(let y=0;y<h;y+=64)c.fillRect(0,y,w,5);c.fillRect(0,0,w,7);c.fillRect(0,h-8,w,8);});
maps.shoji=tex((c,w,h)=>{c.fillStyle='#e5e2d1';c.fillRect(0,0,w,h);c.fillStyle='#444b48';for(let x=0;x<w;x+=85)c.fillRect(x,0,4,h);for(let y=0;y<h;y+=130)c.fillRect(0,y,w,5);c.fillRect(0,0,w,7);c.fillRect(0,h-8,w,8);});
maps.garden=tex((c,w,h)=>{c.fillStyle='#bed7bc';c.fillRect(0,0,w,h);for(let i=0;i<420;i++){let x=rand()*w,y=rand()*h;c.fillStyle=['#528268','#8aa96e','#d0da95','#bed5bd'][i%4];c.beginPath();c.ellipse(x,y,rand()*20+8,rand()*12+4,rand()*7,0,7);c.fill();if(i%3===0)flower(c,x,y,8+rand()*12,['#dce8d3','#b6c9dc','#d6b0cb'][i%3],8);}},1024,768);
maps.crane=tex((c,w,h)=>{c.fillStyle='#d4cc7d';c.fillRect(0,0,w,h);for(let i=0;i<22;i++){const y=rand()*h;spiral(c,rand()*w,y,70,'#aaa56f',1.3);}for(let i=0;i<8;i++){c.fillStyle=['#638b69','#97a76e','#b7b27d'][i%3];c.beginPath();c.ellipse(rand()*w,rand()*h,130,35,0,0,7);c.fill();}for(let i=0;i<12;i++){const x=rand()*w,y=rand()*h;c.strokeStyle='#535b59';c.lineWidth=2;c.beginPath();c.moveTo(x-18,y-8);c.lineTo(x,y+2);c.lineTo(x+25,y-8);c.stroke();c.strokeStyle=cream;c.lineWidth=5;c.beginPath();c.moveTo(x-23,y-15);c.quadraticCurveTo(x-5,y+20,x+25,y-10);c.stroke();}},1024,768);
const generatedTextures={},assetImages={};
const assetPromises=Object.entries(window.GENERATED||{}).map(([key,url])=>new Promise((resolve,reject)=>{const t=new T.Texture();t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());generatedTextures[key]=t;const im=new Image();im.onload=()=>{t.image=im;t.needsUpdate=true;assetImages[key]=im;resolve();};im.onerror=reject;im.src=url;}));
function mat(color,map){return new T.MeshBasicMaterial({color:color||'#ffffff',map:map||null,side:T.DoubleSide});}
const mats={};Object.entries(maps).forEach(([k,v])=>mats[k]=mat(null,v));
for(const key of ['mural-v2','ceiling-v2','floor-v2','fusuma-v3'])mats[key]=mat(null,generatedTextures[key]);
const solidCache={},repeatCache={};function solid(c){return solidCache[c]||(solidCache[c]=mat(c));}
function repeatMaterial(t,x,y){const key=t.id+'-'+x+'-'+y;if(repeatCache[key])return repeatCache[key];const a=t.clone();a.needsUpdate=true;a.wrapS=a.wrapT=T.RepeatWrapping;a.repeat.set(x,y);return repeatCache[key]=mat(null,a);}
const staticMeshes=[],outlined=[];let batching=true;
const unit=new T.BoxGeometry(1,1,1),unitEdges=new T.EdgesGeometry(unit),edgeMat=new T.LineBasicMaterial({color:ink,transparent:true,opacity:.48});
function mesh(geo,m){const o=new T.Mesh(geo,m instanceof T.Material?m:solid(m));if(batching)staticMeshes.push(o);else scene.add(o);return o;}
function box(x,y,z,w,h,d,m,outline=true){const o=mesh(unit,m);o.position.set(x,y,z);o.scale.set(w,h,d);if(outline)outlined.push(o);return o;}
function plane(x,y,z,w,h,m,rx=0,ry=0){const o=mesh(new T.PlaneGeometry(w,h),m);o.position.set(x,y,z);o.rotation.set(rx,ry,0);return o;}
function cylinder(x,y,z,r,h,m,segments=32){const o=mesh(new T.CylinderGeometry(r,r,h,segments),m);o.position.set(x,y,z);return o;}
function beam(a,b,width,m,depth=width){const va=new T.Vector3(...a),vb=new T.Vector3(...b),o=box(...va.clone().add(vb).multiplyScalar(.5).toArray(),width,va.distanceTo(vb),depth,m);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),vb.sub(va).normalize());return o;}
function flowerPost(x,z,y){box(x,y+.65,z,.22,1.3,.22,mats.floral);box(x,y+1.34,z,.32,.10,.32,yellow);box(x,y+.09,z,.28,.15,.28,yellow);}
function rail(x1,z1,x2,z2,y){const n=Math.ceil(Math.hypot(x2-x1,z2-z1)/1.9);for(let i=0;i<=n;i++)flowerPost(x1+(x2-x1)*i/n,z1+(z2-z1)*i/n,y);beam([x1,y+1.18,z1],[x2,y+1.18,z2],.10,pink);beam([x1,y+1.31,z1],[x2,y+1.31,z2],.10,yellow);beam([x1,y+.36,z1],[x2,y+.36,z2],.20,mats.waveBorder,.12);beam([x1,y+.71,z1],[x2,y+.71,z2],.10,yellow);}
// Four walkable tiers allow the three flights seen through multiple low-angle shots.
const tierHeight=4.6,tiers=[0,4.6,9.2,13.8],ceilingHeight=17.8;
const flights=[{x0:6.9,x1:-6.9,z:2.2,y0:0,y1:4.6},{x0:-6.9,x1:6.9,z:-2.2,y0:4.6,y1:9.2},{x0:6.9,x1:-6.9,z:2.2,y0:9.2,y1:13.8}];
box(0,-.4,-6,29.6,.7,41,'#695866');
box(0,-.06,-18.2,17.5,.14,14.2,repeatMaterial(maps.wood,4,4));
box(0,0,0,17.6,.12,22,mats['floor-v2']);for(const side of [-1,1])for(const z of [-4.5,4.5]){box(side*7.7,.26,z,1.7,.45,4.3,'#3e6659');box(side*7.7,.51,z,1.68,.08,4.25,repeatMaterial(maps.tatami,1,3));}
box(0,.03,-18.3,12,.02,9,mats.garden);for(const x of [-6.1,6.1])box(x,.05,-18.3,.16,.03,9.2,mats.starBorder);for(const z of [-22.85,-13.75])box(0,.05,z,12.3,.03,.16,mats.starBorder);
rail(-8.5,-25,8.5,-25,0);rail(-8.5,-25,-8.5,-11,0);rail(8.5,-25,8.5,-11,0);
for(let i=0;i<6;i++)for(const side of [-1,1]){const x=side*8.1,z=-23+i*1.85;box(x,3,z,.06,6,.06,'#596050');plane(x-side*.5,3.7,z,1,3,i%3===0?mats.starBorder:i%3===1?mats.floral:mats.tilePurple);box(x,6.1,z,.23,.18,.2,yellow);}
// The lower walls carry the aquatic mural, not the cloud panels of the rear cabin.
for(const side of [-1,1]){

 for(const z of [-11,0,11])box(side*8.67,8.9,z,.19,17.8,.19,pink);
 for(let k=1;k<tiers.length;k++){const y=tiers[k];}
 for(const y of tiers){box(side*8.5,y+4.28,0,.18,.34,22,mats.waveBorder);box(side*8.4,y+3.84,0,.12,.45,22,pink);}
}
// Front and rear wall panels leave a central path at the ground entrance.
for(const z of [-11,11])for(const y of tiers){for(const x of [-6.1,6.1]){plane(x,y+1.83,z,5.15,3.5,y===0?mats['mural-v2']:mats.cloud);box(x,y+.18,z,5.2,.34,.16,mats.bamboo);}for(let x=-8.8;x<=8.8;x+=2.93)if((y>0||Math.abs(x)>2.4)&&!(y>0&&z===11&&Math.abs(x)<1.5))box(x,y+2.3,z,.18,4.6,.18,pink);box(0,y+4.27,z,17.6,.35,.24,mats.waveBorder);}
// Continuous soaring columns, with collars at each tier and painted floral bands.
for(const x of [-5.45,5.45])for(const z of [-7.6,7.6]){box(x,8.9,z,.46,17.8,.46,mats.column);for(const y of tiers){box(x,y+.17,z,.61,.22,.61,yellow);box(x,y+4.3,z,.64,.15,.64,pink);}}
for(let k=1;k<tiers.length;k++){const y=tiers[k],tile=[maps.tileBlue,maps.tilePurple,maps.tile][k-1];
 for(const x of [-7.15,7.15]){box(x,y-.16,0,3.25,.30,22,solid('#ad737b'));plane(x,y-.325,0,3.25,22,repeatMaterial(tile,2,10),Math.PI/2);box(x,y-.35,-11,3.25,.22,.18,mats.waveBorder);}
 for(const z of [-9.35,9.35]){box(0,y-.16,z,11.0,.30,3.3,solid('#ad737b'));plane(0,y-.325,z,11,3.3,repeatMaterial(tile,5,2),Math.PI/2);}
 // Gaps on the side galleries correspond to the transverse staircase ends.
 for(const side of [-1,1]){const x=side*5.5,gaps=[];for(const f of flights)if((Math.abs(f.y0-y)<.01&&Math.sign(f.x0)===side)||(Math.abs(f.y1-y)<.01&&Math.sign(f.x1)===side))gaps.push([f.z-1.75,f.z+1.75]);gaps.sort((a,b)=>a[0]-b[0]);let a=-7.7;for(const g of gaps){if(g[0]>a)rail(x,a,x,g[0],y);a=Math.max(a,g[1]);}if(a<7.7)rail(x,a,x,7.7,y);}
 rail(-5.5,-7.7,5.5,-7.7,y);rail(-5.5,7.7,5.5,7.7,y);
 for(const x of [-5.7,5.7]){box(x,y-.43,0,.28,.52,22,mats.floral);box(x,y+4.25,0,.28,.30,22,mats.waveBorder);}
}
// Three physical flights, each with steps, painted undersides and two decorated balustrades.
for(const f of flights){const steps=28,run=Math.abs(f.x1-f.x0),step=run/steps,dir=Math.sign(f.x1-f.x0);
 for(let i=0;i<steps;i++){const x=f.x0+dir*(i+.5)*step,h=f.y0+(i+1)/steps*(f.y1-f.y0);box(x,h-.09,f.z,step+.025,.18,3.05,i%3===0?mats.stairBack:solid('#89bcb7'));}
 const a=new T.Vector3(f.x0,f.y0-.15,f.z),b=new T.Vector3(f.x1,f.y1-.15,f.z),under=box(...a.clone().add(b).multiplyScalar(.5).toArray(),.075,a.distanceTo(b),3.06,mats.stairBack);under.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.sub(a).normalize());
 for(const side of [-1,1]){const z=f.z+side*1.59;
  beam([f.x0,f.y0+1.18,z],[f.x1,f.y1+1.18,z],.12,pink);beam([f.x0,f.y0+1.31,z],[f.x1,f.y1+1.31,z],.14,yellow);
  beam([f.x0,f.y0+.21,z],[f.x1,f.y1+.21,z],.26,mats.floral,.15);beam([f.x0,f.y0+.67,z],[f.x1,f.y1+.67,z],.1,yellow);
  for(let j=0;j<=14;j++){const u=j/14;flowerPost(f.x0+(f.x1-f.x0)*u,z,f.y0+(f.y1-f.y0)*u);}
 }
}
// Nested roof coffers and yellow cornices frame the fish medallion far overhead.
for(const x of [-7.15,7.15])plane(x,ceilingHeight,0,3.3,22,repeatMaterial(maps.tile,2,10),Math.PI/2);
for(const z of [-9.35,9.35])plane(0,ceilingHeight,z,11,3.3,repeatMaterial(maps.tilePurple,5,2),Math.PI/2);
plane(0,ceilingHeight+.03,0,10.9,15.4,mats['ceiling-v2'],Math.PI/2);
for(let i=0;i<4;i++){const x=5.5+i*.55,z=7.7+i*.55,y=ceilingHeight-i*.22;for(const side of [-1,1]){box(side*x,y,0,.17,.15,z*2,yellow);box(0,y,side*z,x*2,.15,.17,yellow);}}
// Lantern friezes, narrow white ribbing and tiny lacquer caps are printed textures, batched.
const lanternMap=tex((c,w,h)=>{c.clearRect(0,0,w,h);for(let j=0;j<4;j++){const x=j*128+64;c.fillStyle=j%2?'#e8e4d2':'#c45b63';c.beginPath();c.ellipse(x,67,40,48,0,0,7);c.fill();c.strokeStyle='#4c5556';c.lineWidth=1.6;for(let y=28;y<109;y+=7){const r=40*Math.sqrt(Math.max(0,1-((y-67)/48)**2));c.beginPath();c.moveTo(x-r,y);c.quadraticCurveTo(x,y+4,x+r,y);c.stroke();}c.fillStyle='#394247';c.fillRect(x-12,14,24,11);c.fillRect(x-10,111,20,7);}},512,128);
const lanternEnd=repeatMaterial(lanternMap,7,1);lanternEnd.transparent=true;lanternEnd.alphaTest=.3;
const lanternMat=repeatMaterial(lanternMap,9,1);lanternMat.transparent=true;lanternMat.alphaTest=.3;
for(const side of [-1,1])for(const y of tiers)plane(side*8.36,y+3.68,0,21.5,.65,lanternMat,0,Math.PI/2);
for(const z of [-10.85,10.85])for(const y of tiers)plane(0,y+3.68,z,17.4,.65,lanternEnd);
// Enclosed cabins sit behind each gallery, with physical partitions and sliding doors.
const rooms=[],doors=[],roomWalls=[],roomFurniture=[];
const roomHeight=3.65,bodyHeight=4.32;
const doorInk=solid('#343b39');
maps.quilt=tex((c,w,h)=>{c.fillStyle='#c77985';c.fillRect(0,0,w,h);for(let x=-50;x<w+100;x+=200)for(let z=-50;z<h+100;z+=190){c.strokeStyle='#eed0bb';c.lineWidth=6;c.beginPath();c.arc(x,z,80,0,7);c.stroke();flower(c,x,z,59,'#a3aa58',4);}},512,512);
maps.roomBorder=tex((c,w,h)=>{c.fillStyle='#b78eae';c.fillRect(0,0,w,h);for(let x=0;x<w;x+=64){c.fillStyle=(x/64)%2?'#ece2be':'#c5cd91';c.fillRect(x,0,64,h);}c.strokeStyle='#556658';c.lineWidth=6;c.strokeRect(0,0,w,h);},512,128);
maps.blueCurtain=tex((c,w,h)=>{c.fillStyle='#739fb3';c.fillRect(0,0,w,h);c.strokeStyle='#e2e0cb';c.lineWidth=4;for(let x=64;x<w;x+=128){c.beginPath();c.arc(x,64,35,0,7);c.stroke();c.beginPath();c.arc(x,64,25,0,7);c.stroke();}c.strokeStyle='#3d535c';c.lineWidth=3;for(let x=0;x<w;x+=128){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}},512,128);
const roomMat={quilt:mat(null,maps.quilt),border:mat(null,maps.roomBorder),curtain:mat(null,maps.blueCurtain)};
function obstruction(x0,x1,z0,z1,y0,y1,list=roomWalls){list.push({x0:Math.min(x0,x1),x1:Math.max(x0,x1),z0:Math.min(z0,z1),z1:Math.max(z0,z1),y0,y1});}
function wall(axis,at,a,b,y,m=cream,h=bodyHeight){if(b-a<.01)return;if(axis==='x'){box(at,y+h/2,(a+b)/2,.18,h,b-a,m);obstruction(at-.09,at+.09,a,b,y,y+h);}else{box((a+b)/2,y+h/2,at,b-a,h,.18,m);obstruction(a,b,at-.09,at+.09,y,y+h);}}
function cropPanel(axis,at,a,b,y,h,m,fullA,fullB){const g=new T.PlaneGeometry(b-a,h),uv=g.attributes.uv,pos=g.attributes.position;for(let i=0;i<uv.count;i++){const s=(a+b)/2+(axis==='x'?-1:1)*pos.getX(i);uv.setX(i,(s-fullA)/(fullB-fullA));}const o=mesh(g,m);o.position.set(axis==='x'?at:(a+b)/2,y+h/2,axis==='x'?(a+b)/2:at);o.rotation.y=axis==='x'?Math.PI/2:0;return o;}
const paintedDoorMaterials={};
function frontMaterial(style,fraction,widthFraction){const key=style+'-'+fraction+'-'+widthFraction;if(paintedDoorMaterials[key])return paintedDoorMaterials[key];const c=canvas(1024,384),g=c.getContext('2d'),t=new T.CanvasTexture(c);t.anisotropy=8;const draw=()=>{const image=assetImages[style==='gold'?'fusuma-v3':'mural-v2'];if(style!=='shoji'&&image)g.drawImage(image,0,0,c.width,c.height);else{g.fillStyle='#e8e4d3';g.fillRect(0,0,c.width,c.height);g.strokeStyle='#3c4644';g.lineWidth=3;for(let x=0;x<=1024;x+=64){g.beginPath();g.moveTo(x,0);g.lineTo(x,384);g.stroke();}for(let y=0;y<=384;y+=96){g.beginPath();g.moveTo(0,y);g.lineTo(1024,y);g.stroke();}}
 g.strokeStyle='#333b39';g.lineWidth=6;for(const f of [fraction-widthFraction/2,fraction,fraction+widthFraction/2]){g.beginPath();g.moveTo(f*1024,0);g.lineTo(f*1024,384);g.stroke();}g.lineWidth=4;g.strokeRect(1,1,1022,382);for(const f of [fraction-.027,fraction+.027]){g.fillStyle='#2c3837';g.beginPath();g.arc(f*1024,229,10,0,7);g.fill();g.fillStyle='#b5b79b';g.beginPath();g.arc(f*1024,229,5,0,7);g.fill();}t.needsUpdate=true;};draw();if(style!=='shoji')Promise.all(assetPromises).then(draw);return paintedDoorMaterials[key]=mat(null,t);}
function portal(r,axis,at,a,b,center,style){const w=2.4,d={id:r.id,room:r,axis,at,center,width:w,y:r.y,open:false,amount:0,panels:[],marker:null};doors.push(d);r.door=d;const m=frontMaterial(style,+( (center-a)/(b-a)).toFixed(3),+(w/(b-a)).toFixed(3));
 for(const [p,q] of [[a,center-w/2],[center+w/2,b]]){wall(axis,at,p,q,r.y,cream);const face=at+(axis==='x'?(at>0?-.115:.115):-.115);cropPanel(axis,face,p,q,r.y+.10,3.16,m,a,b);}
 const y=r.y;wall(axis,at,center-w/2,center+w/2,y+3.26,pink,bodyHeight-3.26);
 for(const t of [center-w/2-.10,center+w/2+.10]){if(axis==='x')box(at,y+1.6,t,.24,3.2,.14,ink);else box(t,y+1.6,at,.14,3.2,.24,ink);}
 if(axis==='x'){box(at,y+.045,center,.40,.09,w+.3,'#7c765b');box(at,y+3.26,center,.32,.16,w+.42,ink);box(at,y+3.61,center,.35,.10,w+.42,ink);plane(at+(at>0?-.17:.17),y+3.40,center,w+.22,.29,roomMat.curtain,0,Math.PI/2);}else{box(center,y+.045,at,w+.3,.09,.40,'#7c765b');box(center,y+3.26,at,w+.42,.16,.32,ink);plane(center,y+3.4,at-.17,w+.22,.29,roomMat.curtain);}
 // Each leaf retains its painted section as it slides into the wall pocket.
 for(const side of [-1,1]){const p=center+side*w/4;const g=new T.PlaneGeometry(w/2,3.08),uv=g.attributes.uv,pos=g.attributes.position;for(let i=0;i<uv.count;i++){const s=p+(axis==='x'?-1:1)*pos.getX(i);uv.setX(i,style==='mural'?(s-center+w/2)/w:(s-a)/(b-a));}const o=new T.Mesh(g,style==='mural'?frontMaterial('shoji',.5,1):m);o.position.set(axis==='x'?at:p,y+1.64,axis==='x'?p:at);o.rotation.y=axis==='x'?Math.PI/2:0;scene.add(o);d.panels.push({o,side,base:p});}
 const sign=axis==='x'?(at>0?-1:1):-1;d.point=new T.Vector3(axis==='x'?at+sign*.10:center,y+1.60,axis==='x'?center:at-.10);
 const label=tex((c,w,h)=>{c.fillStyle='#e7d9b4';c.fillRect(0,0,w,h);c.strokeStyle='#72614b';c.lineWidth=5;c.strokeRect(8,8,w-16,h-16);c.fillStyle='#544b43';c.textAlign='center';c.font='38px Microsoft YaHei';c.fillText(r.short,w/2,68);c.font='25px Microsoft YaHei';c.fillText(r.level?'上层 '+r.level:'底层',w/2,111);},512,144);
 if(axis==='x')plane(at+sign*.16,y+2.66,center+1.75,1.10,.31,mat(null,label),0,Math.PI/2);else plane(center+1.75,y+2.66,at-.16,1.1,.31,mat(null,label));
 return d;
}
function roomContents(r){const side=r.side,xc=(r.x0+r.x1)/2,zc=(r.z0+r.z1)/2,y=r.y;
 box(xc,y+.035,zc,r.x1-r.x0-.16,.08,r.z1-r.z0-.16,repeatMaterial(maps.tatami,r.kind==='rear'?7:3,r.kind==='rear'?3:6));
 box(xc,y+roomHeight,zc,r.x1-r.x0,.16,r.z1-r.z0,repeatMaterial(r.level%2?maps.tilePurple:maps.tileBlue,r.kind==='rear'?7:3,r.kind==='rear'?3:5));
 for(const x of [r.x0+.18,r.x1-.18]){box(x,y+3.45,zc,.12,.21,r.z1-r.z0-.1,ink);box(x,y+.34,zc,.1,.56,r.z1-r.z0-.1,roomMat.border);}for(const z of [r.z0+.18,r.z1-.18]){box(xc,y+3.45,z,r.x1-r.x0-.1,.21,.12,ink);box(xc,y+.34,z,r.x1-r.x0-.1,.56,.10,roomMat.border);}
 if(r.kind==='side'){
  const bx=side*12.55,bz=zc+1.6;box(bx,y+.18,bz,1.85,.27,2.55,'#d7c8b8');box(bx,y+.34,bz+.22,1.78,.08,2.04,roomMat.quilt);box(bx,y+.44,bz-.79,.93,.19,.53,cream);obstruction(bx-.94,bx+.94,bz-1.27,bz+1.27,y,y+.55,roomFurniture);
  const tx=side*10.9,tz=zc-2.25;box(tx,y+.50,tz,1.60,.10,1.30,'#423b38');for(const dx of [-.60,.60])for(const dz of [-.45,.45])box(tx+dx,y+.25,tz+dz,.10,.48,.10,'#4e4740');obstruction(tx-.83,tx+.83,tz-.68,tz+.68,y,y+.62,roomFurniture);for(const dx of [-.35,.35]){cylinder(tx+dx,y+.60,tz,.13,.13,cream,12);cylinder(tx+dx,y+.674,tz,.10,.006,'#7c6b50',12);}box(tx,y+.14,tz-1.18,.9,.15,.72,['#9271aa','#b89c69','#8aa798'][r.level%3]);
  const sx=side*13.0,sz=zc-3.58;box(sx,y+.82,sz,2.05,1.57,.90,'#6a6455');plane(sx,y+.84,sz+.46,1.89,1.43,mats.shoji);box(sx,y+1.67,sz,2.12,.12,1.02,ink);obstruction(sx-1.08,sx+1.08,sz-.5,sz+.5,y,y+1.9,roomFurniture);
  const hangZ=r.z0+.25;plane(side*12.1,y+2.18,hangZ,1.5,1.55,mats.column);box(side*12.1,y+3.01,hangZ,1.6,.07,.08,ink);box(side*12.1,y+1.38,hangZ,1.6,.07,.08,ink);
  box(side*13.9,y+.48,zc+3.8,.63,.93,.86,'#754953');box(side*13.9,y+.97,zc+3.8,.7,.08,.95,yellow);
 }else{
  for(const x of [-5.1,5.1]){box(x,y+.22,14.4,3.1,.33,3.5,'#486951');box(x,y+.41,14.4,3.04,.05,3.4,repeatMaterial(maps.tatami,3,3));for(const dz of [-.9,.9])box(x,y+.53,14.4+dz,.92,.14,.78,x<0?'#a8759d':'#719698');}
  box(0,y+.5,15.7,2.9,.10,1.45,'#483c3d');for(const x of [-1.2,1.2])for(const z of [15.2,16.2])box(x,y+.24,z,.12,.48,.12,'#443b3a');obstruction(-1.5,1.5,14.95,16.45,y,y+.7,roomFurniture);plane(0,y+2.25,17.32,9.5,2.6,mats['fusuma-v3']);
 }
 // A small pendant and lacquer trim make the room ceiling legible from inside.
 cylinder(xc,y+2.98,zc,.22,.44,r.level%2?'#bd7782':'#e5dec1',12);cylinder(xc,y+3.23,zc,.12,.06,ink,12);box(xc,y+3.42,zc,.025,.32,.025,ink);
}
for(let k=0;k<tiers.length;k++)for(const side of [-1,1])for(const half of [-1,1]){
 const r={id:`side-${k}-${side}-${half}`,level:k,y:tiers[k],side,kind:'side',x0:side<0?-14.5:8.8,x1:side<0?-8.8:14.5,z0:half<0?-10.8:0,z1:half<0?0:10.8,short:(side<0?'左':'右')+' · '+(half<0?'前舱':'后舱'),name:(side<0?'左':'右')+(half<0?'前':'后')+(k?'金屏客舱':'障子客舱'),ref:half<0?19:98};rooms.push(r);
 const at=side*8.8,doorZ=half*(k?6.2:7.8);portal(r,'x',at,r.z0,r.z1,doorZ,k?'gold':'mural');wall('z',r.z0,r.x0,r.x1,r.y,cream);wall('z',r.z1,r.x0,r.x1,r.y,cream);
 // Window bays have opaque paper backing and an actual black timber grid.
 const outer=side*14.5;wall('x',outer,r.z0,r.z1,r.y,cream,1.1);wall('x',outer,r.z0,r.z1,r.y+2.85,cream,bodyHeight-2.85);for(const [a,b] of [[r.z0,r.z0+2.0],[r.z1-2,r.z1]])wall('x',outer,a,b,r.y+1.1,cream,1.75);wall('x',outer,r.z0+2,r.z1-2,r.y+1.1,mats.lattice,1.75);plane(outer-side*.16,r.y+1.98,(r.z0+r.z1)/2,r.z1-r.z0-4,1.66,mats.lattice,0,Math.PI/2);
 roomContents(r);
}
for(let k=1;k<tiers.length;k++){
 const r={id:'rear-'+k,level:k,y:tiers[k],side:0,kind:'rear',x0:-8.8,x1:8.8,z0:11,z1:17.5,short:'后 · 榻席舱',name:'后方榻席舱',ref:183};rooms.push(r);portal(r,'z',11,-8.8,8.8,0,'gold');wall('x',-8.8,11,17.5,r.y,mats.cloud);wall('x',8.8,11,17.5,r.y,mats.cloud);wall('z',17.5,-8.8,8.8,r.y,cream);roomContents(r);
 // The forward gallery is enclosed instead of opening into empty sky.
 wall('z',-11,-3.6,3.6,r.y,cream);plane(0,r.y+2.20,-10.88,6.6,2,mats.lattice);
}
// Continuous outer structural bands tie the cabins together rather than exposing floating slabs.
for(const side of [-1,1])for(const y of tiers){box(side*14.58,y+4.3,0,.24,.28,21.8,mats.waveBorder);for(const z of [-10.8,0,10.8])box(side*14.58,y+2.14,z,.24,4.28,.24,pink);}

function currentRoom(x,z,y){return rooms.find(r=>Math.abs(r.y-y)<.55&&x>r.x0+.12&&x<r.x1-.12&&z>r.z0+.12&&z<r.z1-.12)||null;}
function roomBlocked(x,z,y){const radius=.23;
 for(const a of roomWalls)if(y+1.5>a.y0&&y+.1<a.y1&&x>a.x0-radius&&x<a.x1+radius&&z>a.z0-radius&&z<a.z1+radius)return true;
 for(const d of doors){if(Math.abs(y-d.y)>.65||d.amount>.91)continue;const cross=d.axis==='x'?x:z,along=d.axis==='x'?z:x;if(Math.abs(cross-d.at)<.23&&Math.abs(along-d.center)<d.width/2+.23)return true;}
 for(const a of roomFurniture)if(Math.abs(y-a.y0)<.6&&x>a.x0-.17&&x<a.x1+.17&&z>a.z0-.17&&z<a.z1+.17)return true;
 return false;
}
function roomFloors(x,z,candidates){for(const r of rooms){if(x>r.x0+.1&&x<r.x1-.1&&z>r.z0+.1&&z<r.z1-.1)candidates.push(r.y+(r.kind==='rear'&&Math.abs(Math.abs(x)-5.1)<1.55&&z>12.65&&z<16.15?.43:0));const d=r.door,cross=d.axis==='x'?x:z,along=d.axis==='x'?z:x;if(Math.abs(cross-d.at)<.75&&Math.abs(along-d.center)<d.width/2-.22)candidates.push(r.y);}}
function toggleDoor(d){if(!d)return;const cross=d.axis==='x'?camera.position.x:camera.position.z,along=d.axis==='x'?camera.position.z:camera.position.x;if(d.open&&Math.abs(cross-d.at)<.6&&Math.abs(along-d.center)<1.4){toast('先离开门槛，再关门');return;}d.open=!d.open;toast((d.open?'推开':'合上')+' · '+d.room.name);}
function animateDoors(dt){for(const d of doors){const t=d.open?1:0;d.amount+=(t-d.amount)*Math.min(1,dt*8);for(const p of d.panels)p.o.position[d.axis==='x'?'z':'x']=p.base+p.side*1.22*d.amount;}}

// Rear cabin repeats the distinct red-and-white cloud panels, at the lower ceiling height.
box(0,.05,14.25,17.6,.12,6.5,repeatMaterial(maps.wood,6,3));plane(0,4.15,14.2,17.6,6.4,repeatMaterial(maps.tilePurple,8,3),Math.PI/2);box(0,.23,15.6,8,.42,3.8,'#37574c');box(0,.46,15.6,7.9,.04,3.7,repeatMaterial(maps.tatami,6,3));
for(const side of [-1,1]){box(side*8.75,2.1,14.2,.16,4.2,6.5,mats.cloud);box(side*8.6,.57,14.2,.12,1.1,6.5,mats.bamboo);for(let z=11;z<=17.5;z+=1.6)box(side*8.6,2.08,z,.15,4.15,.15,pink);}box(0,2.1,17.5,17.6,4.2,.15,repeatMaterial(maps.crane,3,1));for(let x=-8.7;x<=8.8;x+=2.2)box(x,2.1,17.4,.16,4.2,.16,ink);plane(0,3.65,17.3,17.4,.65,lanternEnd);
for(const x of [-6.4,6.4]){box(x,.23,14.3,3.5,.4,4.5,'#394e42');box(x,.45,14.3,3.4,.04,4.4,repeatMaterial(maps.tatami,3,3));}
// Shoes and stacked cushions, seen near the entrances, are independent small objects.
for(let j=0;j<3;j++)for(const side of [-1,1]){let x=5.8+j*.43,z=-11.2+side*.12;box(x,.16,z,.31,.17,.58,'#e2ddc7');box(x,.255,z,.28,.03,.55,['#a180b8','#679ea4','#cd7898'][j]);beam([x-.1,.28,z-.16],[x+.1,.28,z+.02],.035,yellow);beam([x+.1,.28,z-.16],[x-.1,.28,z+.02],.035,yellow);}

// The compass belongs to a large circular painted table and an animal-shaped support.
cylinder(0,1.0,-1,1.78,.15,'#303b3a',48);for(const x of [-1.1,1.1])for(const z of [-2.1,.1])box(x,.46,z,.19,.95,.19,'#283332');
const tabletop=tex((c,w,h)=>{c.fillStyle='#ba7179';c.fillRect(0,0,w,h);for(let i=0;i<25;i++)spiral(c,rand()*w,rand()*h,90,'#cbbb65',8);for(let i=0;i<12;i++)fish(c,rand()*w,rand()*h,60,'#58778c');c.strokeStyle=yellow;c.lineWidth=12;c.beginPath();c.arc(512,512,490,0,7);c.stroke();},1024,1024);
const top=mesh(new T.CircleGeometry(1.73,48),mat(null,tabletop));top.rotation.x=-Math.PI/2;top.position.set(0,1.079,-1);
const compass=tex((c,w,h)=>{c.fillStyle='#242e33';c.fillRect(0,0,w,h);c.fillStyle='#efe9d0';c.beginPath();c.arc(w/2,h/2,w*.445,0,7);c.fill();for(let i=0;i<12;i++){c.save();c.translate(w/2,h/2);c.rotate(i*Math.PI/6);c.fillStyle=i%2?'#8ba871':'#789fb5';c.beginPath();c.moveTo(0,-w*.42);c.lineTo(-w*.06,-w*.27);c.lineTo(w*.06,-w*.27);c.closePath();c.fill();c.strokeStyle='#455861';c.lineWidth=1.3;c.stroke();c.restore();}c.strokeStyle='#777b67';c.lineWidth=1;c.beginPath();c.arc(w/2,h/2,w*.29,0,7);c.stroke();c.fillStyle='#aa4c52';c.beginPath();c.moveTo(w*.49,h*.48);c.lineTo(w*.55,h*.12);c.lineTo(w*.54,h*.51);c.closePath();c.fill();c.fillStyle='#363b41';c.beginPath();c.arc(w/2,h/2,8,0,7);c.fill();},1024,1024);
plane(0,1.088,-1,1.4,1.4,mat(null,compass),-Math.PI/2);
// Dark square stand with open legs and a brightly painted fish surrounding the vertical dial.
for(const x of [2.55,3.85])for(const z of [-1.4,-.15])box(x,1.13,z,.17,2.25,.17,'#282d32');box(3.2,2.23,-.77,1.5,.20,1.5,'#2c3135');
const beastMap=tex((c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='#c86a79';c.beginPath();c.ellipse(482,275,224,243,0,0,7);c.fill();c.strokeStyle='#753c58';c.lineWidth=2;for(let y=100;y<440;y+=32)for(let x=340;x<650;x+=34){c.beginPath();c.arc(x+(y%64?16:0),y,28,0,Math.PI);c.stroke();}c.fillStyle='#789eba';c.beginPath();c.moveTo(220,410);c.bezierCurveTo(-30,150,160,50,400,50);c.lineTo(700,500);c.lineTo(770,80);c.lineTo(870,210);c.bezierCurveTo(980,90,1010,460,800,520);c.lineTo(230,535);c.fill();c.strokeStyle='#36414c';c.lineWidth=5;c.stroke();c.fillStyle=cream;c.beginPath();c.arc(193,219,45,0,7);c.fill();c.fillStyle='#b1616c';c.beginPath();c.arc(193,219,27,0,7);c.fill();c.fillStyle='#363443';c.beginPath();c.arc(193,219,13,0,7);c.fill();c.strokeStyle=cream;c.lineWidth=18;for(let i=0;i<6;i++){c.beginPath();c.moveTo(273+i*52,92);c.quadraticCurveTo(318+i*52,154,292+i*52,245);c.stroke();}for(let i=0;i<35;i++){let x=rand()*w,y=rand()*h;if(x>740&&y>250)flower(c,x,y,12,'#d1cdaa');}},1024,576);
const beastMat=mat(null,beastMap);beastMat.transparent=true;beastMat.alphaTest=.5;plane(3.2,3.22,-.77,3.2,1.8,beastMat);plane(3.2,3.07,-.67,1.22,1.22,mat(null,compass));
// Printed golden navigation chart alongside the dial.
const chart=tex((c,w,h)=>{c.fillStyle='#314340';c.fillRect(0,0,w,h);c.strokeStyle='#d6c45d';c.lineWidth=7;c.strokeRect(9,9,w-18,h-18);c.fillStyle='#a798c4';c.beginPath();c.moveTo(50,250);for(let i=0;i<25;i++)c.lineTo(50+i*26,160+Math.sin(i*.6)*40+rand()*55);c.lineTo(710,320);c.lineTo(360,310);c.lineTo(240,470);c.lineTo(100,430);c.fill();c.strokeStyle='#d9c373';c.lineWidth=3;c.stroke();c.fillStyle='#ba6966';c.beginPath();c.arc(565,250,28,0,7);c.fill();for(let i=0;i<8;i++)spiral(c,rand()*w,rand()*h,18,'#aaa24f',1);},768,512);
plane(1.0,1.10,-1.6,.7,.48,mat(null,chart),-Math.PI/2);
// Distant indigo waves are flat layers, preserving the painted stage feeling.
plane(0,-1.8,0,450,450,solid('#313961'),-Math.PI/2);
const waves=[];for(let j=0;j<26;j++){const shape=new T.Shape();shape.moveTo(-180,-5);for(let x=-180;x<=180;x+=2)shape.lineTo(x,Math.sin(x*.065+j)*1.7+Math.sin(x*.17+j)*.4);shape.lineTo(180,-5);shape.closePath();const o=new T.Mesh(new T.ShapeGeometry(shape),solid(j%2?'#343858':'#43517a'));o.position.set(0,-1.8,-104+j*8);scene.add(o);const pts=[];for(let x=-180;x<=180;x+=2)pts.push(new T.Vector3(x,Math.sin(x*.065+j)*1.7+Math.sin(x*.17+j)*.4,0));o.add(new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:'#b7a963'})));waves.push(o);}
const cloudMap=tex((c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='#dacf67';for(let i=0;i<20;i++){c.beginPath();c.ellipse(50+i*24,130+Math.sin(i*.6)*28,64,37,0,0,7);c.fill();}},512,256);
for(let i=0;i<32;i++){const a=i*Math.PI/16,r=110+rand()*20,o=new T.Sprite(new T.SpriteMaterial({map:cloudMap,depthWrite:false}));o.position.set(Math.cos(a)*r,6+rand()*33,Math.sin(a)*r);o.scale.set(30+rand()*30,13+rand()*10,1);scene.add(o);}
// Merge static architecture by material: rich geometry without thousands of draw calls on mobile.
function finalizeStatic(){const groups=new Map(),v=new T.Vector3(),n=new T.Vector3();for(const o of staticMeshes){o.updateMatrix();let g=o.geometry.index?o.geometry.toNonIndexed():o.geometry;const p=g.getAttribute('position'),norm=g.getAttribute('normal'),uv=g.getAttribute('uv'),key=o.material.id;let a=groups.get(key);if(!a){a={material:o.material,p:[],n:[],u:[]};groups.set(key,a);}const nm=new T.Matrix3().getNormalMatrix(o.matrix);for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(o.matrix);a.p.push(v.x,v.y,v.z);if(norm){n.fromBufferAttribute(norm,i).applyMatrix3(nm).normalize();a.n.push(n.x,n.y,n.z);}else a.n.push(0,1,0);a.u.push(uv?uv.getX(i):0,uv?uv.getY(i):0);}}
 for(const a of groups.values()){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(a.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(a.n,3));g.setAttribute('uv',new T.Float32BufferAttribute(a.u,2));g.computeBoundingSphere();scene.add(new T.Mesh(g,a.material));}
 const ep=[],p=unitEdges.getAttribute('position');for(const o of outlined){o.updateMatrix();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(o.matrix);ep.push(v.x,v.y,v.z);}}const eg=new T.BufferGeometry();eg.setAttribute('position',new T.Float32BufferAttribute(ep,3));scene.add(new T.LineSegments(eg,edgeMat));batching=false;}
finalizeStatic();

// Evidence is curated from cuts, reverse angles and close-ups, rather than interval samples.
const refShots=window.SHOT_REFERENCE||[];const shotTime=id=>refShots.find(s=>s.shot===id)?.time||360;
const entries=[
 {id:'sea',n:'01',title:'金云与靛海',time:375,pos:[0,1.5,-24],body:'海浪与金云是层叠的平面。原片用叠色和线条表达距离，网页也保持这种像版画舞台一样的海面。',detail:'依据海上远景重绘。'},
 {id:'deck',n:'02',title:'花毯甲板与旗幡',time:shotTime(13),pos:[6.3,1.4,-18],body:'木步道环绕花毯式甲板，粉红舷栏和多面图案旗幡在两侧排列。新的花纹密度与区域比例参考甲板全景，而不是人物近景。',detail:'甲板范围与舱门的连续连接含推测性补全。'},
 {id:'stairs',n:'03',title:'仰望交错楼梯',time:360,pos:[-4.8,1.5,8.8],body:'这次以 05:56、06:00、07:24、09:30 和 13:15 的多角度镜头共同校准。三段折返楼梯在中庭上方交错，通柱直达高处的鱼纹天井，梯背是彩色分板。',detail:'可沿右侧中央的第一段楼梯上楼，再从左侧中央进入第二段；第三段继续折返。连续高度与四个可行走平台是为探索做的空间补全。'},
 {id:'medicine',n:'04',title:'卖药郎 · 清晰纸片',time:325,pos:[-6.2,1.7,-.4],body:'紫头巾、尖耳、红色眼纹、青色衣装与药箱，是多个近景共同确认的形象细节。',detail:'人物已替换为依据近景生成的高分辨率完整插画，贴图有真正透明通道。生成重绘保留主要轮廓和衣装，细节存在绘制差异。',asset:'medicine-v2'},
 {id:'compass',n:'05',title:'罗盘与怪鱼支架',time:shotTime(96),pos:[3.2,2.5,-.7],body:'原片的罗盘并不只是摆在小桌上的白圆：它与蓝色怪鱼、红色鳞纹和方形黑色支架共同构成一组装饰物。圆桌上还有彩绘桌面与海图。',detail:'根据罗盘特写、07:54全景、08:12支架镜头补建；指针用于观赏。'},
 {id:'ceiling',n:'06',title:'高处的鱼纹天井',time:shotTime(151),pos:[0,15.3,-9.5],body:'黄色底上的红鱼、密集花点和青色圆环，位于多重格顶与黄边内框的中心。现在可以沿楼梯走到最高回廊近看。',detail:'鱼纹根据仰视特写生成，周围格顶与层层边框独立建模；高度为镜头比例推测。',asset:'ceiling-v2'},
 {id:'people',n:'07',title:'同舟人物与衣纹',time:1050,pos:[6.3,1.7,5.2],body:'花衣人物的奶白底、赭色花样、蓝紫腰带与青色发饰，在纸片插画中清晰保留。红帽旅人、深色羽织老人和长发持刀者也已重绘。',detail:'场景中的五个人物均使用新生成的完整插画，摆放位置为自由探索重新安排。',asset:'kayo-v2'},
 {id:'strange',n:'08',title:'后舱与异境',time:shotTime(208),pos:[0,1.8,16],body:'后舱有低顶、榻台、黑格窗和红白卷云屏风。它与中庭的鱼花墙面属于不同的视觉区域。窗外蔓状线条与暗色海面取自后段意象。',detail:'舱门、后舱和侧舱的连接含推测性补全，可切换昼海 / 异境。'},
 {id:'mural',n:'09',title:'鱼、花与黑色卷须',time:shotTime(62),pos:[-8,1.6,-2],body:'青底细条纹上有红色小鱼；下方密布紫蓝眼纹生物、红紫花瓣和黑色卷须。上版把这些省成了简单旋涡，这次依据近景重新绘成整幅壁画。',detail:'新生成的高分辨率壁画遵循镜头里的配色与纹样组合。',asset:'mural-v2'},
 {id:'underside',n:'10',title:'彩绘楼梯的背面',time:shotTime(163),pos:[5.8,6.2,0],body:'梯背不是普通木板，而是青、紫、黄、橙相间的长条拼板，上面继续绘着金色卷曲纹。花栏、粉红扶手与蓝色踏步分别构成斜向层次。',detail:'每一段都有踏步、实体彩绘底板与栏杆；不是悬空的装饰横梁。'},
 {id:'cabin',n:'11',title:'障子与侧舱榻台',time:shotTime(98),pos:[-10.9,1.5,2],body:'侧舱镜头有白色障子、黑格窗、彩绘顶棚和绿色榻台，空间比中庭低。门边的鞋履、叠放坐垫与带边席面也补入了场景。',detail:'靠近回廊上的房门，按 E 推开后进入客舱。舆图可前往门口；四层舱室数量和进深属于推测补全。'},
 {id:'chart',n:'12',title:'黑底海图',time:shotTime(69),pos:[1.2,1.3,-1.6],body:'桌上的海图使用黑绿底、黄色边框、紫蓝轮廓和红色标记。它和罗盘一起，把船上的航行信息也转成装饰图形。',detail:'根据05:45的物件特写重绘。'}
];
// Decimal times address exact curated frames; old integer images remain for comparison.
const refUrl=t=>window.REFERENCES[String(t)]||window.REFERENCES[360];
let visited=new Set();try{visited=new Set(JSON.parse(localStorage.getItem('mononoke-v2-notes')||'[]'));}catch(e){}
let active=false,panelOpen=false,night=false,yaw=0,pitch=0,level=0,target=null,targetDoor=null,walkHeight=0;
const markerMap=tex((c,w,h)=>{c.clearRect(0,0,w,h);c.strokeStyle='#f8e9b4';c.lineWidth=5;c.beginPath();c.arc(w/2,h/2,w*.29,0,7);c.stroke();c.fillStyle='#a94d4b';c.beginPath();c.arc(w/2,h/2,w*.12,0,7);c.fill();},128,128);
entries.forEach(e=>{const o=new T.Sprite(new T.SpriteMaterial({map:markerMap,transparent:true,depthTest:true}));o.position.set(...e.pos);o.position.y+=.25;o.scale.set(.29,.29,1);scene.add(o);e.marker=o;});
const tendrils=new T.Group();scene.add(tendrils);tendrils.visible=false;
for(const side of [-1,1])for(let i=0;i<12;i++){const pts=[];for(let j=0;j<90;j++)pts.push(new T.Vector3(side*(14.8+Math.sin(j*.075+i)*1.1),j*.17,-10+i*2.3));tendrils.add(new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:'#e5dfbf'})));for(let j=0;j<5;j++){const o=new T.Mesh(new T.SphereGeometry(.13,6,5),solid('#af72a5'));o.position.copy(pts[j*18]);tendrils.add(o);}}
const people=[];
const characterDefs=[{key:'medicine-v2',height:2.4,x:-6.2,z:-.4,name:'卖药郎'},{key:'kayo-v2',height:2.05,x:6.3,z:5.2,name:'加世'},{key:'merchant-v2',height:1.8,x:1.9,z:1.5,name:'同舟老人'},{key:'samurai-v2',height:2.3,x:-6.2,z:6.3,name:'长发持刀者'},{key:'traveller-v2',height:2.25,x:.3,z:-4.2,name:'红帽旅人'}];
function trimBounds(im){const c=canvas(im.width,im.height),g=c.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(0,0,c.width,c.height).data;let x0=c.width,y0=c.height,x1=0,y1=0;for(let y=0;y<c.height;y+=2)for(let x=0;x<c.width;x+=2)if(d[(y*c.width+x)*4+3]>185){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}return{x0:Math.max(0,x0-3),y0:Math.max(0,y0-3),w:Math.min(c.width,x1-x0+7),h:Math.min(c.height,y1-y0+7)};}
Promise.all(assetPromises).then(()=>{for(const a of characterDefs){const im=assetImages[a.key];if(!im)continue;const b=trimBounds(im),c=canvas(b.w,b.h);c.getContext('2d').drawImage(im,b.x0,b.y0,b.w,b.h,0,0,b.w,b.h);const t=new T.CanvasTexture(c);t.anisotropy=8;const m=new T.MeshBasicMaterial({map:t,side:T.DoubleSide,transparent:true,alphaTest:.72});const o=plane(a.x,a.height/2,a.z,a.height*b.w/b.h,a.height,m);o.userData={paper:true,name:a.name};people.push(o);} $('enter').disabled=false;$('enter').textContent='登 舟 探 索 →';}).catch(err=>{$('enter').disabled=false;$('enter').textContent='登 舟 探 索 →';console.error('Asset load failed',err);toast('部分插画未载入，请重新打开网页。');});
function toast(t){$('toast').textContent=t;$('toast').style.opacity=1;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').style.opacity=0,2600);}
function updateCount(){$('count').textContent=visited.size+' / '+entries.length;}updateCount();
function showPanel(html,kicker='船上见闻录'){$('shade').classList.remove('comparison');$('panelKicker').textContent=kicker;$('panelContent').innerHTML=html;$('panel').hidden=$('shade').hidden=false;panelOpen=true;keys.clear();joy.x=joy.y=0;$('stick').style.transform='';$('closePanel').focus();}
function closePanel(){$('panel').hidden=$('shade').hidden=true;panelOpen=false;renderer.domElement.focus();}
$('closePanel').onclick=$('shade').onclick=closePanel;
function stamp(t){return Math.floor(t/60).toString().padStart(2,'0')+':'+Math.floor(t%60).toString().padStart(2,'0');}
function observe(e){if(!e)return;visited.add(e.id);try{localStorage.setItem('mononoke-v2-notes',JSON.stringify([...visited]));}catch(err){}updateCount();showPanel(`<small>见闻 ${e.n} / 原片 ${stamp(e.time)}</small><h2 id="panelTitle">${e.title}</h2><p>${e.body}</p><img src="${refUrl(e.time)}" alt="${e.title}对应原视频截图"><small>按镜头内容筛选的原视频画面</small><p>${e.detail}</p>${e.asset?`<div class="generated-preview"><img src="${GENERATED[e.asset]}" alt="${e.title}新绘素材"><small>依据原片生成的重绘素材</small></div>`:''}${e.id==='strange'?'<button id="toggleNight" class="primary">切换昼海 / 异境</button>':''}<button class="primary" id="continue">继续探索 →</button>`);$('continue').onclick=closePanel;if($('toggleNight'))$('toggleNight').onclick=toggleNight;}
function toggleNight(){night=!night;scene.background.set(night?'#253141':'#87aec1');scene.fog.color.set(night?'#333844':'#94a2b9');tendrils.visible=night;toast(night?'异境 · 窗外蔓影浮现':'昼海 · 金云重现');}
function journal(){showPanel('<h2 id="panelTitle">船上见闻录</h2><p>十二处见闻，分别对应空间、人物与物件的原片证据。朱色圆印附近可直接观察。</p>'+entries.map(e=>`<div class="entry" role="button" tabindex="0" data-entry="${e.id}"><span class="num">${e.n}</span><div><h3>${e.title}</h3><small>${visited.has(e.id)?'已观察':'尚未观察'} · 原片 ${stamp(e.time)}</small></div><span>↗</span></div>`).join(''));document.querySelectorAll('[data-entry]').forEach(el=>{el.onclick=()=>observe(entries.find(e=>e.id===el.dataset.entry));el.onkeydown=e=>{if(e.key==='Enter')el.click();};});}
const places=[
 {name:'金云甲板',sub:'花毯、鞋履与旗幡',x:0,z:-21,y:0,yaw:Math.PI,pitch:0},
 {name:'彩绘中庭',sub:'06:00 低机位仰视',x:0,z:8.4,y:0,yaw:0,pitch:.67},
 {name:'第一回廊',sub:'第一段楼梯的左侧平台',x:-6.9,z:2.2,y:4.6,yaw:-Math.PI/2,pitch:.24},
 {name:'第二回廊',sub:'折返与彩绘梯背',x:6.9,z:-2.2,y:9.2,yaw:Math.PI/2,pitch:.18},
 {name:'天井回廊',sub:'近看鱼纹与重重格顶',x:-6.9,z:2.2,y:13.8,yaw:-Math.PI/2,pitch:.2},
 {name:'障子客舱门前',sub:'按 E 推开房门进入',x:-7.3,z:-7.8,y:0,yaw:Math.PI/2,pitch:0},
 {name:'后舱画屏',sub:'卷云屏风与金底画门',x:0,z:12,y:0,yaw:Math.PI,pitch:0},
 {name:'同舟人物',sub:'近看清晰人物插画',x:-6.2,z:-3.3,y:0,yaw:Math.PI,pitch:0},
 {name:'楼梯入口',sub:'开始沿三段折返楼梯上行',x:6.85,z:2.2,y:0,yaw:Math.PI/2,pitch:.1}
];
function teleport(i){const p=places[i];camera.position.set(p.x,p.y+1.65,p.z);walkHeight=p.y;level=Math.round(p.y/tierHeight);yaw=p.yaw;pitch=p.pitch||0;lastZone='';}
function interact(){if(targetDoor)toggleDoor(targetDoor);else observe(target);}
function doorVisit(id){const r=rooms.find(r=>r.id===id),d=r.door;camera.position.set(d.axis==='x'?d.at+(d.at>0?-1.45:1.45):d.center,d.y+1.65,d.axis==='x'?d.center:d.at-1.45);walkHeight=d.y;level=r.level;yaw=d.axis==='x'?(d.at>0?-Math.PI/2:Math.PI/2):Math.PI;pitch=0;lastZone='';closePanel();toast('面对房门 · 按 E 或点击提示推开');}
function roomPlan(k){const X=x=>(x+15.5)*10,Z=z=>(z+12)*10;return `<svg class="room-plan" viewBox="0 0 310 310" role="img" aria-label="${k?'上层'+k:'底层'}客舱与回廊平面图"><rect x="0" y="0" width="310" height="310" fill="#dedbc0"/><rect x="67" y="12" width="176" height="216" fill="#b98482"/><rect x="100" y="45" width="110" height="154" fill="#e7debc"/><text x="155" y="103" text-anchor="middle">彩绘中庭</text><path d="M 85 143 L 225 98 M 85 98 L 225 143" stroke="#657f78" stroke-width="9" fill="none"/><text x="155" y="173" text-anchor="middle">折返楼梯</text>${rooms.filter(r=>r.level===k).map(r=>`<g><rect x="${X(r.x0)}" y="${Z(r.z0)}" width="${(r.x1-r.x0)*10}" height="${(r.z1-r.z0)*10}" fill="${r.kind==='rear'?'#9eac87':'#b5c9ab'}" stroke="#4f6156" stroke-width="1.6"/><text x="${X((r.x0+r.x1)/2)}" y="${Z((r.z0+r.z1)/2)}" text-anchor="middle" ${r.kind==='side'?'writing-mode="vertical-rl"':''}>${r.short}</text><circle cx="${X(r.door.axis==='x'?r.door.at:r.door.center)}" cy="${Z(r.door.axis==='x'?r.door.center:r.door.at)}" r="4" fill="#a24f49"/></g>`).join('')}<text x="155" y="25" text-anchor="middle" font-size="9">前方 · 甲板</text><text x="155" y="301" text-anchor="middle" font-size="9">朱点为可开房门</text></svg>`;}
function mapPanel(k=level){if(typeof k!=='number')k=level;const labels=['底层','第一回廊','第二回廊','天井回廊'];showPanel(`<h2 id="panelTitle">船内舆图</h2><p>楼梯连接各层回廊。朱点后是有隔墙与顶棚的客舱；在门前按 E 或点击提示，滑开障子或金屏门后进入。</p><div class="floor-tabs">${labels.map((s,i)=>`<button data-floor="${i}" ${i===k?'aria-pressed="true"':''}>${s}</button>`).join('')}</div>${roomPlan(k)}<small>门窗、榻席与隔断依据原片；房间数量和连续进深为探索补全。</small><div class="map-locations">${rooms.filter(r=>r.level===k).map(r=>`<button data-room="${r.id}">${r.short}<span>${r.kind==='rear'?'卷云屏风与榻席':r.level?'金屏推拉门 · 榻席客舱':'白障子 · 被褥与坐榻'} · 前往门口</span></button>`).join('')}</div><h3 class="evidence-heading">其他位置</h3><div class="map-locations">${places.map((p,i)=>`<button data-place="${i}">${p.name}<span>${p.sub}</span></button>`).join('')}</div><button id="atmosphere">切换昼海 / 异境</button>`,'探索 · 舱室与回廊');document.querySelectorAll('[data-floor]').forEach(el=>el.onclick=()=>mapPanel(+el.dataset.floor));document.querySelectorAll('[data-room]').forEach(el=>el.onclick=()=>doorVisit(el.dataset.room));document.querySelectorAll('[data-place]').forEach(el=>el.onclick=()=>{teleport(+el.dataset.place);closePanel();});$('atmosphere').onclick=toggleNight;}

function evidence(){showPanel(`<small>按镜头切换与内容筛选 · 45 张补充参考</small><h2 id="panelTitle">镜头对照</h2><p>你指出的 06:00 仰视镜头，与反打、俯视和近景一起用于重建。点击「对照机位」，在画面左侧查看场景同方向的构图。</p><button id="matchView" class="primary">前往 06:00 对照机位</button><img src="${refUrl(360)}" alt="06:00中庭仰视参考"><small>重点：高通柱、交错楼梯、彩绘梯背、鱼花壁画、逐层内收的格顶。</small><h3 class="evidence-heading">按内容选出的镜头</h3><div class="shot-grid">${refShots.map(e=>`<button data-shot="${e.shot}"><img loading="lazy" src="${refUrl(e.time)}" alt="${e.label}"><span>${stamp(e.time)} · ${e.label}</span></button>`).join('')}</div>`,'原片 · 空间与细节');$('shade').classList.add('comparison');$('matchView').onclick=()=>{active=true;$('intro').hidden=true;$('hud').hidden=false;teleport(1);};document.querySelectorAll('[data-shot]').forEach(el=>el.onclick=()=>{const e=refShots.find(s=>s.shot===+el.dataset.shot);showPanel(`<small>镜头 ${e.shot} · ${stamp(e.time)} · 精确取帧 ${e.time.toFixed(3)} 秒</small><h2 id="panelTitle">${e.label}</h2><img src="${refUrl(e.time)}" alt="${e.label}"><p>此帧在镜头切换后选择，避免把切换瞬间或人物遮挡当作完整空间依据。</p><button id="backEvidence" class="primary">返回镜头目录</button>`,'原片 · 参考画面');$('backEvidence').onclick=evidence;});}
function help(){showPanel('<h2 id="panelTitle">如何游船</h2><p><span class="key">W A S D</span> 或方向键步行，按住画面拖动环顾。<span class="key">Shift</span> 加快步伐，<span class="key">E</span> 观察。</p><p>手机：左下摇杆移动，右侧拖动环顾。画面中央附近的圆印可以打开对应原片和说明。</p><p>中庭有三段连续折返楼梯。各层回廊两侧都有独立客舱；靠近房门，按 E 或点击画面提示推开，再步行进入。回头也可以合上房门。舆图按楼层显示房间与门口。</p><p>「镜头对照」包含按内容选出的45张补充参考，可切换到06:00仰视机位。「声」开启合成海浪；舆图中可切换异境。Esc关闭面板。</p><p>人物、鱼花壁画和鱼纹天井依据视频生成重绘；格顶、梯背、栏杆和建筑分别建模。尺寸与连续布局包含推测性补全。</p>','探索须知');}
$('help').onclick=help;$('introRefs').onclick=evidence;$('journalBtn').onclick=journal;$('mapBtn').onclick=mapPanel;$('referenceBtn').onclick=evidence;$('inspect').onclick=interact;
$('reset').onclick=()=>{teleport(1);toast('已回到中庭仰视机位');};
$('enter').onclick=()=>{active=true;$('intro').hidden=true;$('hud').hidden=false;teleport(1);toast('拖动环顾 · 右侧中央楼梯可上行');};
$('home').onclick=e=>{e.preventDefault();active=false;$('intro').hidden=false;$('hud').hidden=true;closePanel();};
const keys=new Set(),joy={x:0,y:0};let drag=null;renderer.domElement.tabIndex=0;
addEventListener('keydown',e=>{if(e.code==='Escape'){closePanel();return;}if(panelOpen)return;if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)){e.preventDefault();keys.add(e.code);}if(e.code==='ShiftLeft'||e.code==='ShiftRight')keys.add(e.code);if(e.code==='KeyE'&&active&&!e.repeat)interact();});
addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',()=>{keys.clear();joy.x=joy.y=0;drag=null;});
renderer.domElement.addEventListener('pointerdown',e=>{if(!active||panelOpen)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId);});
renderer.domElement.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId||panelOpen)return;yaw-=(e.clientX-drag.x)*.004;pitch-=(e.clientY-drag.y)*.003;pitch=Math.max(-1.35,Math.min(1.35,pitch));drag.x=e.clientX;drag.y=e.clientY;});
for(const k of ['pointerup','pointercancel','lostpointercapture'])renderer.domElement.addEventListener(k,()=>drag=null);
const stick=$('joystick');let joyId=null;function updateJoy(e){const r=stick.getBoundingClientRect(),dx=(e.clientX-r.left-r.width/2)/38,dy=(e.clientY-r.top-r.height/2)/38,l=Math.max(1,Math.hypot(dx,dy));joy.x=dx/l;joy.y=dy/l;$('stick').style.transform=`translate(${joy.x*32}px,${joy.y*32}px)`;}
stick.onpointerdown=e=>{joyId=e.pointerId;stick.setPointerCapture(e.pointerId);updateJoy(e);};stick.onpointermove=e=>{if(joyId===e.pointerId)updateJoy(e);};for(const k of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(k,()=>{joyId=null;joy.x=joy.y=0;$('stick').style.transform='';});
// Candidate floor heights are selected near the current foot height, not by a guessed floor index.
function floorAt(x,z){const candidates=[],ramps=[];
 if(z< -10.9&&z>=-24.7&&Math.abs(x)<8.2){if(z> -11.4&&Math.abs(x)>2.35)return null;candidates.push(0);}
 if(Math.abs(x)<8.4&&z>=-10.9&&z<=10.95)candidates.push(0);
 if(Math.abs(x)<8.4&&z>=10.95&&z<=17.15)candidates.push(Math.abs(x)<4&&z>13.6?.46:0);
 roomFloors(x,z,candidates);

 if(Math.abs(x)<8.4&&Math.abs(z)<10.7&&(Math.abs(x)>5.67||Math.abs(z)>7.48))for(const y of tiers.slice(1))candidates.push(y);
 for(const f of flights)if(Math.abs(z-f.z)<1.43&&x>=-7.05&&x<=7.05){const u=(x-f.x0)/(f.x1-f.x0);if(u>=-.025&&u<=1.025){const h=f.y0+Math.max(0,Math.min(1,u))*(f.y1-f.y0);if(Math.abs(h-walkHeight)<.5)ramps.push(h);}}
 const y=(ramps.length?ramps:candidates).sort((a,b)=>Math.abs(a-walkHeight)-Math.abs(b-walkHeight))[0];if(y===undefined||Math.abs(y-walkHeight)>.50)return null;
 if(roomBlocked(x,z,y))return null;
 for(const px of [-5.45,5.45])for(const pz of [-7.6,7.6])if(Math.hypot(x-px,z-pz)<.42)return null;
 if(y<.5){if(Math.abs(x)>6.7&&Math.abs(x)<8.6&&Math.abs(z)>2.3&&Math.abs(z)<6.7)return null;if(Math.hypot(x,z+1)<1.95)return null;if(x>2.3&&x<4.1&&z> -1.6&&z<.15)return null;for(const a of characterDefs)if(Math.hypot(x-a.x,z-a.z)<.48)return null;}
 return y;
}
function move(dx,dz){const x=camera.position.x,z=camera.position.z;let nx=x+dx,nz=z+dz,y=floorAt(nx,nz);if(y===null){y=floorAt(nx,z);if(y!==null)nz=z;else{y=floorAt(x,nz);if(y===null)return;nx=x;}}camera.position.x=nx;camera.position.z=nz;walkHeight=y;camera.position.y+=(y+1.65-camera.position.y)*.5;level=Math.max(0,Math.min(3,Math.round(y/tierHeight)));}
let audio=null,soundOn=false;function audioToggle(){try{if(!audio){const A=window.AudioContext||window.webkitAudioContext;audio=new A();const b=audio.createBuffer(1,audio.sampleRate*5,audio.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(.65+.35*Math.sin(i/d.length*Math.PI*2));const src=audio.createBufferSource();src.buffer=b;src.loop=true;const filter=audio.createBiquadFilter();filter.type='lowpass';filter.frequency.value=650;const gain=audio.createGain();gain.gain.value=.075;src.connect(filter).connect(gain).connect(audio.destination);src.start();}soundOn=!soundOn;audio[soundOn?'resume':'suspend']();$('sound').textContent='声 · '+(soundOn?'开':'关');$('sound').setAttribute('aria-label',soundOn?'关闭环境音':'开启环境音');}catch(e){toast('当前浏览器无法开启环境音');}}$('sound').onclick=audioToggle;
const clock=new T.Clock(),fwd=new T.Vector3(),to=new T.Vector3();let lastZone='',elapsed=0,frames=0,displayFps=0,fpsStamp=0;
function frame(){requestAnimationFrame(frame);const dt=Math.min(clock.getDelta(),.05);elapsed+=dt;frames++;if(elapsed-fpsStamp>1){displayFps=Math.round(frames/(elapsed-fpsStamp));frames=0;fpsStamp=elapsed;}
 if(!active){camera.position.set(Math.sin(elapsed*.08)*.55,1.7,8.8);camera.lookAt(0,9.6,0);}
 else if(!panelOpen){animateDoors(dt);const a=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+joy.x,b=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-joy.y,l=Math.max(1,Math.hypot(a,b)),speed=dt*(keys.has('ShiftLeft')||keys.has('ShiftRight')?5.5:3.3);move((Math.cos(yaw)*a-Math.sin(yaw)*b)/l*speed,(-Math.sin(yaw)*a-Math.cos(yaw)*b)/l*speed);camera.rotation.set(pitch,yaw,0,'YXZ');
  camera.getWorldDirection(fwd);target=null;let best=.35;for(const e of entries){to.copy(e.marker.position).sub(camera.position);const dist=to.length(),dot=to.normalize().dot(fwd);if(dist<3.4&&dot>best&&Math.abs(e.marker.position.y-camera.position.y)<2){best=dot;target=e;}}
  targetDoor=null;let doorScore=.48;for(const d of doors){to.copy(d.point).sub(camera.position);const dist=to.length(),dot=to.normalize().dot(fwd);if(Math.abs(walkHeight-d.y)<.6&&dist<2.9&&dot>doorScore){targetDoor=d;doorScore=dot;}}
  $('inspect').hidden=!target&&!targetDoor;if(targetDoor)$('inspect').innerHTML=(targetDoor.open?'合上':'推开')+'房门 · '+targetDoor.room.short+' <span>E</span>';else if(target)$('inspect').innerHTML='观察 · '+target.title+' <span>E</span>';
  const x=camera.position.x,z=camera.position.z,r=currentRoom(x,z,walkHeight),zone=r?r.name:level?places[level+1].name:z< -11?'金云甲板':z>11?'后舱画屏':'彩绘中庭';
  if(lastZone!==zone){lastZone=zone;$('locTitle').textContent=zone;$('locNumber').textContent=level?'0'+(level+2):zone==='金云甲板'?'01':'02';$('zone').textContent=(level?'上层 '+level:'舟中')+' · '+zone;}
 }
 if(active)camera.rotation.set(pitch,yaw,0,'YXZ');
 people.forEach(o=>{o.rotation.y=Math.atan2(camera.position.x-o.position.x,camera.position.z-o.position.z);});
 entries.forEach(e=>{e.marker.scale.setScalar(.25+Math.sin(elapsed*1.8+Number(e.n))*.025);e.marker.visible=active;});waves.forEach((o,i)=>{o.position.y=-2+Math.sin(elapsed*.4+i)*.11;});renderer.render(scene,camera);
}frame();
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();});renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();$('error').hidden=false;});
window.MONONOKE={get state(){return{version:3,active,level,room:currentRoom(camera.position.x,camera.position.z,walkHeight)?.id||null,roomCount:rooms.length,doors:doors.map(d=>({id:d.id,open:d.open,amount:d.amount})),targetDoor:targetDoor?.id||null,footHeight:walkHeight,position:camera.position.toArray(),yaw,pitch,visited:[...visited],night,characters:people.length,objects:scene.children.length,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,fps:displayFps,tiers,ceilingHeight,flights,referenceCount:refShots.length};}};
})();
