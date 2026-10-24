/* 化猫 · 纸上地下铁 — 61-shot spatial reconstruction, chapter 2 */
(() => {
'use strict';
const T=window.THREE,$=id=>document.getElementById(id),refs=window.BAKENEKO_REFS||[];
let renderer;try{renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});}catch(e){$('error').hidden=false;return;}
const coarse=()=>matchMedia('(pointer:coarse)').matches;
renderer.setPixelRatio(Math.min(devicePixelRatio,coarse()?1.25:1.6));renderer.setSize(innerWidth,innerHeight);$('world').appendChild(renderer.domElement);
renderer.domElement.tabIndex=0;
const scene=new T.Scene();scene.background=new T.Color('#444247');scene.fog=new T.Fog('#343236',48,130);
const camera=new T.PerspectiveCamera(70,innerWidth/innerHeight,.055,220);camera.rotation.order='YXZ';
const ink='#262c2a',cream='#cfc6ae',gold='#aa975d',red='#944654',sage='#778473';
let seed=410;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
const materials={},meshes=[],lines=[];let batching=true;
function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function texture(draw,w=512,h=512,grain=.075){const c=canvas(w,h),g=c.getContext('2d');draw(g,w,h);if(grain){const d=g.getImageData(0,0,w,h);for(let i=0;i<d.data.length;i+=4){const a=(rand()-.5)*255*grain;d.data[i]+=a;d.data[i+1]+=a;d.data[i+2]+=a;}g.putImageData(d,0,0);}const t=new T.CanvasTexture(c);t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;}
function mat(color,map,front=false){return new T.MeshBasicMaterial({color:color||'#ffffff',map:map||null,side:front?T.FrontSide:T.DoubleSide});}
function color(c){return materials[c]||(materials[c]=mat(c));}
const paper=texture((g,w,h)=>{g.fillStyle=cream;g.fillRect(0,0,w,h);for(let i=0;i<70;i++){g.strokeStyle='rgba(90,75,53,.035)';g.beginPath();g.moveTo(rand()*w,0);g.lineTo(rand()*w,h);g.stroke();}});
const wood=texture((g,w,h)=>{g.fillStyle='#a79c83';g.fillRect(0,0,w,h);for(let x=0;x<w;x+=64){g.strokeStyle='#5e6053';g.lineWidth=2;g.strokeRect(x,0,64,h);for(let i=0;i<8;i++){const a=x+8+rand()*50;g.strokeStyle='#8d8872';g.lineWidth=.7;g.beginPath();g.moveTo(a,0);g.bezierCurveTo(a+8,180,a-6,320,a,h);g.stroke();}}});
const leather=texture((g,w,h)=>{g.fillStyle=red;g.fillRect(0,0,w,h);for(let i=0;i<120;i++){g.strokeStyle='rgba(224,173,152,.10)';g.lineWidth=rand()*4+1;g.beginPath();const x=rand()*w,y=rand()*h;g.moveTo(x,y);g.bezierCurveTo(x+30,y+50,x-20,y+60,x+10,y+130);g.stroke();}g.strokeStyle='#713b46';g.lineWidth=8;g.strokeRect(7,7,w-14,h-14);},512,512,.12);
const marble=texture((g,w,h)=>{g.fillStyle='#383533';g.fillRect(0,0,w,h);for(let i=0;i<36;i++){let x=rand()*w,y=rand()*h;g.strokeStyle=i%2?'rgba(187,171,142,.18)':'rgba(17,26,25,.16)';g.lineWidth=rand()*2.5+.3;g.beginPath();g.moveTo(x,y);for(let j=0;j<15;j++){x+=(rand()-.5)*55;y+=rand()*23;g.lineTo(x,y);}g.stroke();}},512,512,.16);
const tile=texture((g,w,h)=>{g.fillStyle='#adb2a1';g.fillRect(0,0,w,h);g.strokeStyle='#56645b';g.lineWidth=4;for(let y=0;y<=h;y+=64)for(let x=(y/64%2)*-48;x<w;x+=96)g.strokeRect(x,y,96,64);},512,512,.12);
const glass=texture((g,w,h)=>{g.fillStyle='#1e2927';g.fillRect(0,0,w,h);for(let i=0;i<28;i++){g.strokeStyle='rgba(173,172,142,.065)';g.beginPath();let x=rand()*w,y=rand()*h;g.moveTo(x,y);for(let j=0;j<9;j++){x+=(rand()-.5)*35;y+=rand()*20;g.lineTo(x,y);}g.stroke();}g.strokeStyle='#a28e4f';g.lineWidth=2;g.strokeRect(13,13,w-26,h-26);g.strokeRect(18,18,w-36,h-36);for(const x of [22,w-22])for(const y of [22,h-22]){g.save();g.translate(x,y);g.scale(x<w/2?1:-1,y<h/2?1:-1);g.beginPath();g.moveTo(0,33);g.lineTo(0,0);g.lineTo(33,0);g.moveTo(0,12);g.bezierCurveTo(30,30,30,-3,10,9);g.stroke();g.restore();}},512,512,.085);
const brass=texture((g,w,h)=>{g.fillStyle='#b2a35b';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=100){g.strokeStyle='#8b864b';g.lineWidth=2;g.strokeRect(0,y,w,100);}for(let y=20;y<h;y+=100)for(let x=15;x<w;x+=120){g.strokeStyle='#687047';g.lineWidth=2;g.beginPath();g.arc(x,y,5,0,7);g.stroke();}},512,512,.14);
const floorTex=texture((g,w,h)=>{g.fillStyle='#c8c4ae';g.fillRect(0,0,w,h);g.strokeStyle='#4e5950';g.lineWidth=5;g.strokeRect(8,8,w-16,h-16);g.strokeStyle='#a2a28b';g.lineWidth=2;g.strokeRect(15,15,w-30,h-30);},512,512,.10);
const wallMat=mat(null,paper),woodMat=mat(null,wood),leatherMat=mat(null,leather),glassMat=mat(null,glass),brassMat=mat(null,brass),marbleMat=mat(null,marble),tileMat=mat(null,tile);
const repeatCache={};function repeat(t,x,y){const key=t.uuid+','+x+','+y;if(repeatCache[key])return repeatCache[key];const a=t.clone();a.wrapS=a.wrapT=T.RepeatWrapping;a.repeat.set(x,y);a.needsUpdate=true;return repeatCache[key]=mat(null,a);}
const unit=new T.BoxGeometry(1,1,1),edgeGeo=new T.EdgesGeometry(unit),edgeMat=new T.LineBasicMaterial({color:ink,transparent:true,opacity:.65});
function mesh(g,m){const o=new T.Mesh(g,m instanceof T.Material?m:color(m));if(batching)meshes.push(o);else scene.add(o);return o;}
function box(x,y,z,w,h,d,m,outline=true){const o=mesh(unit,m);o.position.set(x,y,z);o.scale.set(w,h,d);if(outline)lines.push(o);return o;}
function plane(x,y,z,w,h,m,rx=0,ry=0){const o=mesh(new T.PlaneGeometry(w,h),m);o.position.set(x,y,z);o.rotation.set(rx,ry,0);return o;}
function cyl(x,y,z,r,h,m,n=16){const o=mesh(new T.CylinderGeometry(r,r,h,n),m);o.position.set(x,y,z);return o;}
function ball(x,y,z,r,m){const o=mesh(new T.SphereGeometry(r,10,8),m);o.position.set(x,y,z);return o;}
function beam(a,b,w,m,d=w){const av=new T.Vector3(...a),bv=new T.Vector3(...b),o=box(...av.clone().add(bv).multiplyScalar(.5).toArray(),w,av.distanceTo(bv),d,m,false);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),bv.sub(av).normalize());return o;}
function line(points,m=ink){const g=new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p))),o=new T.Line(g,new T.LineBasicMaterial({color:m}));scene.add(o);return o;}
function sign(text,x,y,z,w,h,ry=0,sub=''){const tx=texture((g,W,H)=>{g.fillStyle='#dbd2b8';g.fillRect(0,0,W,H);g.strokeStyle='#3e4c41';g.lineWidth=8;g.strokeRect(8,8,W-16,H-16);g.strokeStyle='#a7935d';g.lineWidth=3;g.strokeRect(19,19,W-38,H-38);g.fillStyle='#343b31';g.textAlign='center';g.font=(sub?'56':'70')+'px Microsoft YaHei';g.fillText(text,W/2,sub?H*.49:H*.63);if(sub){g.font='19px Georgia';g.fillText(sub,W/2,H*.78);}},1024,256);return plane(x,y,z,w,h,mat(null,tx,true),0,ry);}
function arch(cx,base,rx,ry,z0,z1,m,segments=28){const pos=[],uv=[];for(let j=0;j<segments;j++){const a=j/segments*Math.PI,b=(j+1)/segments*Math.PI,p=[[cx+Math.cos(a)*rx,base+Math.sin(a)*ry,z0],[cx+Math.cos(a)*rx,base+Math.sin(a)*ry,z1],[cx+Math.cos(b)*rx,base+Math.sin(b)*ry,z0],[cx+Math.cos(b)*rx,base+Math.sin(b)*ry,z1]];for(const i of [0,1,2,2,1,3]){pos.push(...p[i]);uv.push((i<2?j:j+1)/segments,i%2);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();return mesh(g,m);}
function archRib(cx,base,rx,ry,z,w,m,segments=24){for(let i=0;i<segments;i++){const a=i/segments*Math.PI,b=(i+1)/segments*Math.PI;beam([cx+Math.cos(a)*rx,base+Math.sin(a)*ry,z],[cx+Math.cos(b)*rx,base+Math.sin(b)*ry,z],w,m);}}
function mergeParts(parts){let n=0;for(const g of parts)n+=g.attributes.position.count;const positions=new Float32Array(n*3);let o=0;const hasUV=parts.every(g=>g.attributes.uv),uvs=hasUV?new Float32Array(n*2):null;let u=0;for(const g of parts){positions.set(g.attributes.position.array,o);o+=g.attributes.position.array.length;if(uvs){uvs.set(g.attributes.uv.array,u);u+=g.attributes.uv.array.length;}}const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(positions,3));if(uvs)g.setAttribute('uv',new T.BufferAttribute(uvs,2));g.computeVertexNormals();return g;}
function finishBatch(){const groups=new Map();for(const o of meshes){o.updateMatrix();const g=(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone()).applyMatrix4(o.matrix);let a=groups.get(o.material);if(!a)groups.set(o.material,a=[]);a.push(g);}const batch=[];for(const [m,g]of groups){const o=new T.Mesh(mergeParts(g),m);scene.add(o);batch.push(o);}const eg=[];for(const o of lines){o.updateMatrix();eg.push(edgeGeo.clone().applyMatrix4(o.matrix));}const merged=mergeParts(eg);const outline=new T.LineSegments(merged,edgeMat);scene.add(outline);batch.push(outline);meshes.length=0;lines.length=0;batching=false;return batch;}
// All floor elevations and obstructing furniture are shared by movement and the map.
const obstacles=[],doors=[],stationObjects=[],trainObjects=[],tunnelObjects=[],people=[],crowds=[],scales=[],pinwheels=[];
let bucket=trainObjects;
function obstacle(x0,x1,z0,z1,y0=-.1,y1=2){obstacles.push({x0,x1,z0,z1,y0,y1});}
function wallX(x,z0,z1,y,h,m){box(x,y+h/2,(z0+z1)/2,.12,h,z1-z0,m);obstacle(x-.08,x+.08,z0,z1,y,y+h);}
function wallZ(z,x0,x1,y,h,m){box((x0+x1)/2,y+h/2,z,x1-x0,h,.12,m);obstacle(x0,x1,z-.08,z+.08,y,y+h);}
function dynamicMesh(g,m,group=trainObjects){const o=new T.Mesh(g,m instanceof T.Material?m:color(m));scene.add(o);group.push(o);return o;}
function door(axis,at,center,w,y,h,style,id,label){const d={axis,at,center,w,y,h,id,label,open:false,t:0,panels:[]};doors.push(d);for(const s of [-1,1]){const group=new T.Group();scene.add(group);trainObjects.push(group);const leaf=new T.Mesh(new T.BoxGeometry(axis==='x'?.085:w/2,h,axis==='x'?w/2:.085),style==='brass'?brassMat:woodMat);leaf.position.y=h/2;group.add(leaf);const window=new T.Mesh(new T.PlaneGeometry(axis==='x'?w/2-.13:w/2-.13,h*.47),glassMat);window.position.set(axis==='x'?(at>0?.052:-.052):0,h*.65,axis==='x'?0:.052);window.rotation.y=axis==='x'?Math.PI/2:0;group.add(window);const handle=new T.Mesh(new T.BoxGeometry(.06,.19,.05),color('#c0ac61'));handle.position.set(axis==='x'?(at>0?-.07:.07):-s*w*.18,h*.45,axis==='x'?-s*w*.18:-.07);group.add(handle);group.position.set(axis==='x'?at:center+s*w/4,y,axis==='x'?center+s*w/4:at);d.panels.push({group,s,base:center+s*w/4});}d.point=new T.Vector3(axis==='x'?at:center,y+1.22,axis==='x'?center:at);return d;}
box(0,-.19,0,4.03,.35,29.8,ink);box(0,-.005,0,3.90,.08,29.4,repeat(floorTex,2,15));
for(const s of [-1,1]){
 const x=s*1.98;
 for(const [a,b]of [[-14.7,-8],[-6,6],[8,14.7]]){wallX(x,a,b,0,2.37,woodMat);plane(x+s*.068,1.185,(a+b)/2,b-a,2.37,brassMat,0,Math.PI/2);}
 for(const z of [-7,7]){box(x,2.72,z,.19,.62,2.1,woodMat);door('x',x,z,1.88,0,2.40,'brass','side-'+s+'-'+z,(s>0?'站台侧':'轨道侧')+'车门');sign(s>0?'福寿站':'请勿下车',x-s*.13,2.58,z,1.18,.29,s>0?-Math.PI/2:Math.PI/2);}
 for(const z of [-13.45,-11.6,-9.7,-4.7,-2.35,0,2.35,4.7,9.7,11.6,13.45]){
  const width=Math.abs(z)>10?1.40:1.86;
  for(const y of [1.12,2.08]){const height=y<1.5?.86:.76;plane(x-s*.073,y,z,width,height,glassMat,0,Math.PI/2);box(x-s*.08,y,z-width/2,.065,height+.1,.06,gold);box(x-s*.08,y,z+width/2,.065,height+.1,.06,gold);box(x-s*.08,y-height/2,z,.065,.05,width,gold);box(x-s*.08,y+height/2,z,.065,.05,width,gold);}
  box(x-s*.10,1.60,z,.09,.08,width+.12,ink);
  plane(x+s*.075,1.63,z,width,1.5,glassMat,0,Math.PI/2);
 }
 for(const [a,b]of [[-10.85,-8.15],[-5.87,5.87],[8.15,10.85]]){
  const len=b-a,zc=(a+b)/2;box(s*1.50,.43,zc,.72,.20,len,leatherMat);box(s*1.80,.88,zc,.15,.90,len,leatherMat);box(s*1.50,.20,zc,.62,.40,len-.12,ink);for(const z of [a+.06,b-.06]){box(s*1.50,.64,z,.75,.10,.075,gold);beam([s*1.15,.45,z],[s*1.15,.9,z],.045,ink);}obstacle(s>0?1.12:-1.95,s>0?1.95:-1.12,a,b,0,.95);
 }
 for(let z=-10.9;z<11;z+=.59){
  cyl(s*1.40,2.47,z,.055,.30,gold,10);
  box(s*1.40,2.40,z,.11,.33,.07,'#9b8c70',false);
  const ring=mesh(new T.TorusGeometry(.103,.018,5,16),color('#d6d2b8'));ring.position.set(s*1.40,2.17,z);ring.rotation.y=Math.PI/2;
  box(s*1.66,2.36,z,.44,.035,.035,ink,false);
 }
 beam([s*1.4,2.56,-11.3],[s*1.4,2.56,11.3],.065,ink);beam([s*1.85,2.38,-11.3],[s*1.85,2.38,11.3],.05,ink);
 for(let z=-10;z<=10;z+=2){beam([s*1.95,2.12,z],[s*1.45,2.48,z],.035,ink);beam([s*1.45,2.48,z],[s*1.43,2.76,z],.035,ink);}
}
// Low curved carriage roof and densely repeated metal ribs.
arch(0,2.40,1.98,.75,-14.7,14.7,wallMat);for(let z=-14;z<15;z+=2){archRib(0,2.39,1.96,.74,z,.035,ink,14);}for(const x of [-.7,.7])beam([x,3.10,-14.3],[x,3.10,14.3],.035,ink);
for(const z of [-10,0,10]){cyl(0,1.48,z,.032,2.96,'#c8b97c',10);cyl(0,.035,z,.14,.07,gold,12);cyl(0,2.96,z,.08,.06,gold,12);}
for(const z of [-11.6,11.6]){
 wallZ(z,-1.98,-.58,0,2.40,woodMat);wallZ(z,.58,1.98,0,2.40,woodMat);box(0,2.7,z,3.95,.60,.13,woodMat);
 door('z',z,0,1.10,0,2.35,'wood',z<0?'cab':'rear',z<0?'驾驶室门':'后端门');
 for(const x of [-1.25,1.25])plane(x,1.65,z+(z<0?.08:-.08),.92,.95,glassMat);
 sign(z<0?'驾驶室':'后端间',.97,2.52,z+(z<0?.085:-.085),.76,.19,z<0?0:Math.PI);
}
for(const z of [-14.7,14.7]){
 wallZ(z,-1.98,-.64,0,2.4,brassMat);wallZ(z,.64,1.98,0,2.4,brassMat);box(0,2.78,z,3.96,.75,.15,brassMat);
 door('z',z,0,1.20,0,2.42,'brass',z<0?'front-end':'back-end',z<0?'前方检修门':'后方检修门');
}
// Exterior wheels and rivets remain visible from the station platform.
for(const s of [-1,1])for(const z of [-10.5,-8.8,8.8,10.5]){const w=mesh(new T.CylinderGeometry(.43,.43,.18,20),color('#222a29'));w.rotation.z=Math.PI/2;w.position.set(s*1.42,-.49,z);ball(s*1.53,-.49,z,.12,'#605f51');}
for(const s of [-1,1])for(let z=-14.5;z<15;z+=.7){ball(s*2.055,.12,z,.022,'#595b40');ball(s*2.055,2.94,z,.022,'#595b40');}
const trainBatch=finishBatch();trainObjects.push(...trainBatch);
// Controls: a real cabinet, white-faced gauges, two brass hand wheels and signal stack.
batching=true;
box(.15,.57,-13.95,2.52,1.10,.54,woodMat);obstacle(-1.15,1.43,-14.26,-13.65,0,1.18);
box(.15,1.15,-13.92,2.60,.12,.67,'#77795b');
const dialTexture=(label,needle)=>texture((g,w,h)=>{g.fillStyle='#dcd8c1';g.fillRect(0,0,w,h);g.strokeStyle='#2c3c35';g.lineWidth=9;g.beginPath();g.arc(w/2,h/2,w*.43,0,7);g.stroke();for(let k=0;k<12;k++){const a=k/12*Math.PI*2;g.lineWidth=4;g.beginPath();g.moveTo(w/2+Math.sin(a)*w*.35,h/2-Math.cos(a)*h*.35);g.lineTo(w/2+Math.sin(a)*w*.40,h/2-Math.cos(a)*h*.40);g.stroke();}g.lineWidth=7;g.beginPath();g.moveTo(w/2,h/2);g.lineTo(w/2+Math.sin(needle)*w*.30,h/2-Math.cos(needle)*h*.30);g.stroke();g.fillStyle='#3a493c';g.font='21px serif';g.textAlign='center';g.fillText(label,w/2,h*.75);},256,256);
for(const [x,r,n]of [[-.53,.25,-1.05],[.12,.17,.5],[.63,.22,1.15]]){const g=mesh(new T.CylinderGeometry(r,r,.07,30),color(ink));g.rotation.x=Math.PI/2;g.position.set(x,1.55,-14.23);plane(x,1.55,-14.18,r*1.85,r*1.85,mat(null,dialTexture('圧 力',n),true));}
for(const [x,z]of [[-.70,-13.76],[.78,-13.73]]){cyl(x,1.30,z,.20,.25,brassMat);cyl(x,1.51,z,.08,.17,ink);const ring=mesh(new T.TorusGeometry(.22,.03,7,22),color('#464b36'));ring.rotation.x=Math.PI/2;ring.position.set(x,1.60,z);for(let i=0;i<3;i++){const a=i*Math.PI*2/3;beam([x,1.60,z],[x+Math.sin(a)*.20,1.60,z+Math.cos(a)*.20],.025,ink);}}
for(let y=.65;y<2.2;y+=.35){cyl(-1.57,y,-13.4,.12,.07,y>1.7?'#b55850':ink);}
// Signal is modeled on the tall stack next to the cab door in the episode.
box(-1.58,1.42,-11.95,.36,1.37,.10,woodMat);for(let i=0;i<3;i++){const ring=mesh(new T.CylinderGeometry(.12,.12,.05,18),color(i===0?'#9f4b50':ink));ring.rotation.x=Math.PI/2;ring.position.set(-1.58,1.12+i*.34,-11.86);}
sign('運 転',0,2.64,-14.54,.88,.23,0);
const driverBatch=finishBatch();trainObjects.push(...driverBatch);
batching=true;
box(-2.2,-1.03,0,8.4,.23,115,repeat(marble,4,30),false);
for(const x of [-.79,.79,-5.8,-4.2]){box(x,-.63,0,.105,.19,115,'#81877b');box(x,-.76,0,.22,.08,115,'#484e47');}
for(let z=-55;z<=55;z+=.65){box(0,-.83,z,2.72,.18,.20,'#736a54',false);box(-5,-.83,z,2.72,.18,.20,'#736a54',false);}
trainObjects.push(...finishBatch());
// The station is built separately so the tunnel state can remove the opening-day crowd.
batching=true;
box(5.5,-.29,0,7.0,.55,41,repeat(tile,7,28));box(2.20,.005,0,.27,.035,41,'#d3c7a3');
for(let z=-20;z<20;z+=.55)box(2.19,.035,z,.29,.06,.05,ink,false);
for(const z of [-17,-9,-1,7,15]){box(8.75,1.85,z,.82,3.7,.92,marbleMat);box(8.75,.16,z,1.07,.32,1.14,'#84877a');box(8.75,3.63,z,1.16,.24,1.23,'#7c857a');cyl(8.20,3.17,z,.18,.15,gold);ball(8.20,3.23,z,.27,'#d9ceb0');}
wallX(9.38,-20.5,21,0,4.0,marbleMat);
arch(3.33,3.5,6.05,4.45,-21,22,repeat(marble,7,12),36);
for(let z=-20;z<=20;z+=4){archRib(3.33,3.48,6.02,4.43,z,.17,'#a5a89b',30);for(const side of [-1,1])box(3.33+side*6.02,2,z,.17,3,.20,'#a5a89b');}
for(let z=-17;z<20;z+=6){sign('福 寿 駅',9.25,2.1,z,2.3,.60,-Math.PI/2,'FUKUJU · 地下鉄');sign('地下铁开通纪念',9.25,3.0,z,2.3,.32,-Math.PI/2);}
// Clock with the double bird and floral crest seen over the platform arch.
const birdClock=texture((g,w,h)=>{g.fillStyle='#d4d2b9';g.fillRect(0,0,w,h);g.fillStyle='#57665d';for(const s of [-1,1]){g.save();g.translate(w/2+s*210,h/2+14);g.scale(s,1);g.beginPath();g.ellipse(0,0,50,22,-.2,0,7);g.fill();g.beginPath();g.arc(-35,-27,17,0,7);g.fill();g.beginPath();g.moveTo(-48,-28);g.lineTo(-71,-27);g.lineTo(-46,-18);g.fill();g.beginPath();g.moveTo(35,-4);g.lineTo(94,-42);g.lineTo(69,10);g.fill();g.restore();for(let i=0;i<60;i++){const x=w/2+s*(105+rand()*200),y=h*.57+rand()*h*.30;g.strokeStyle='#819081';g.lineWidth=1.4;g.beginPath();for(let k=0;k<6;k++){const a=k/6*Math.PI*2;g.ellipse(x+Math.cos(a)*10,y+Math.sin(a)*10,9,4,a,0,7);}g.stroke();}}},1024,512);
for(const z of [-19.9,19.9]){plane(3.4,4.56,z,4.2,2.10,mat(null,birdClock),0,z>0?0:Math.PI);const o=mesh(new T.CylinderGeometry(.49,.49,.10,8),color('#373c32'));o.rotation.x=Math.PI/2;o.position.set(3.4,4.84,z+(z>0?-.08:.08));plane(3.4,4.84,z+(z>0?-.14:.14),.83,.83,mat(null,dialTexture('福 寿',-.3)),0,z>0?Math.PI:0);}
// Repeated red/yellow/blue pinwheels mark the opening-day platform.
for(let z=-17;z<=16;z+=1.55){const x=2.77+(Math.floor(z*2)%2)*.03;cyl(x,.48,z,.022,.96,'#75755a',6);const g=new T.Group();g.position.set(x,1.03,z);g.rotation.y=Math.PI/2;scene.add(g);stationObjects.push(g);pinwheels.push(g);const colors=['#9d4e61','#b7a45f','#a1b7ab','#4e5672'];for(let k=0;k<4;k++){const geo=new T.BufferGeometry();const a=k*Math.PI/2;geo.setAttribute('position',new T.Float32BufferAttribute([0,0,0,Math.cos(a)*.36,Math.sin(a)*.36,0,Math.cos(a+Math.PI/2)*.18,Math.sin(a+Math.PI/2)*.18,.045],3));const p=new T.Mesh(geo,color(colors[k]));g.add(p);}const hub=new T.Mesh(new T.SphereGeometry(.06,10,8),color('#252d2b'));g.add(hub);}
for(const z of [-7,7]){box(2.43,.09,z,.67,.17,1.75,'#787c65');}
// Stairs lead to the ticket hall; continuous elevation is an explicit exploration completion.
for(let i=0;i<22;i++){const z=13+i*.36,y=(i+1)*3.2/22;box(6.85,y/2,z,2.72,y,.36,repeat(tile,2,1));}
for(const x of [5.43,8.27]){beam([x,.85,12.9],[x,4.05,20.9],.065,ink);for(let z=13;z<21;z+=1.6){const y=(z-13)/8*3.2;beam([x,y,z],[x,y+.87,z],.05,gold);}}
box(6.85,3.04,24.1,7.1,.32,6.4,repeat(tile,7,6));
wallX(10.35,20.9,27.4,3.2,3.4,marbleMat);wallZ(27.4,3.3,10.4,3.2,3.4,marbleMat);
box(6.8,6.75,24.1,7.4,.24,6.8,repeat(paper,4,4));
box(8.35,4.25,25.1,2.45,2.1,2.45,woodMat);obstacle(7.1,9.65,23.8,26.4,3.1,5.5);
for(const x of [7.25,9.45])box(x,5.1,25.1,.12,2.2,2.55,gold);
box(8.35,6.12,25.1,2.8,.19,2.8,ink);box(8.35,5.05,23.83,2.1,1.05,.06,glassMat);sign('切 符',8.35,5.89,23.75,1.2,.28,Math.PI,'TICKETS');
for(const x of [4.1,5.2,6.3]){box(x,3.70,25,.40,1.0,1.2,woodMat);beam([x-.4,4.15,25],[x+.4,4.15,25],.065,gold);obstacle(x-.23,x+.23,24.3,25.7,3.1,4.5);}
sign('福 寿 駅',6.4,5.63,27.28,3.4,.90,Math.PI,'开通之日 · 地下鉄');
sign('祝 · 地下铁开通',6.2,6.05,21.02,3.5,.51,Math.PI);
// Period-style hand-drawn railway posters, created as code-native print compositions.
const poster=texture((g,w,h)=>{g.fillStyle='#d2c088';g.fillRect(0,0,w,h);g.save();g.translate(w*.5,h*.55);for(let i=0;i<18;i++){g.fillStyle=i%2?'#cbb369':'#4b7169';g.beginPath();g.moveTo(0,0);const a=i/18*Math.PI*2;g.arc(0,0,w*2,a,a+Math.PI*2/18);g.closePath();g.fill();}g.restore();g.fillStyle='#465f52';g.fillRect(w*.28,h*.37,w*.44,h*.39);g.fillStyle='#d9d1ad';for(let i=0;i<3;i++)g.fillRect(w*(.32+.13*i),h*.43,w*.095,h*.13);g.fillStyle=ink;g.fillRect(w*.30,h*.76,w*.07,h*.07);g.fillRect(w*.62,h*.76,w*.07,h*.07);g.fillStyle='#954757';g.fillRect(0,h*.02,w,h*.16);g.fillStyle='#eee2bd';g.font='48px Microsoft YaHei';g.textAlign='center';g.fillText('地下鉄',w/2,h*.14);g.fillStyle='#e5d3a7';g.fillRect(0,h*.85,w,h*.15);g.fillStyle='#394c3d';g.font='28px Microsoft YaHei';g.fillText('福寿駅 · 開通記念',w/2,h*.945);},512,768);
for(const z of [-14,-8,-2,4,10,16])plane(9.24,2.0,z,1.3,1.96,mat(null,poster,true),0,-Math.PI/2);
const stationBatch=finishBatch();stationObjects.push(...stationBatch);
// Black marble tunnel with receding ribs and track lamps beyond either end.
batching=true;
for(const [a,b]of [[-65,-20],[20,65]]){arch(0,-.8,2.55,4.3,a,b,repeat(marble,6,16),24);for(let z=a;z<=b;z+=3.4){archRib(0,-.80,2.53,4.27,z,.08,'#424c43',18);ball(0,3.42,z,.13,'#b5ad86');}box(-2.43,-.79,(a+b)/2,.74,.15,b-a,'#777c6b');}
const tunnelBatch=finishBatch();tunnelObjects.push(...tunnelBatch);
// Rear maintenance steps allow a bounded walk beside the tracks.
batching=true;
for(let i=0;i<5;i++)box(0,-.16*i-.11,14.96+i*.32,1.25,.16,.32,'#8d8d75');
box(-1.20,-.77,16.70,3.65,.16,1.25,'#8e8c74');
for(let z=16;z<35;z+=2)beam([-2.83,-.77,z],[-2.83,.12,z],.035,gold);
beam([-2.83,.12,16],[-2.83,.12,36],.045,gold);
tunnelObjects.push(...finishBatch());
// Medicine chest, abandoned spectacles, notebook and small ritual scales are independent geometry.
obstacle(-.96,-.28,4.53,4.97,0,.95);
batching=true;
box(-.62,.43,4.75,.66,.86,.38,'#4c362c');box(-.62,.88,4.75,.74,.08,.45,gold);
const eyeTexture=texture((g,w,h)=>{g.fillStyle='#4b362b';g.fillRect(0,0,w,h);g.strokeStyle='#c9ac5f';g.lineWidth=14;g.strokeRect(12,12,w-24,h-24);g.beginPath();g.moveTo(65,220);g.bezierCurveTo(200,60,310,60,447,220);g.bezierCurveTo(315,385,190,385,65,220);g.stroke();g.beginPath();g.arc(256,220,68,0,7);g.stroke();g.fillStyle='#c9ac5f';g.beginPath();g.arc(256,220,25,0,7);g.fill();for(let i=0;i<7;i++){const a=i/7*Math.PI*2;g.beginPath();g.moveTo(256+Math.cos(a)*130,220+Math.sin(a)*130);g.lineTo(256+Math.cos(a)*165,220+Math.sin(a)*165);g.stroke();}},512,512);
plane(-.62,.49,4.955,.58,.65,mat(null,eyeTexture,true),0,0);
for(const x of [-.12,.12]){const o=mesh(new T.TorusGeometry(.10,.011,5,18),color('#aa8a51'));o.rotation.x=-Math.PI/2;o.position.set(x,.063,10.3);}
beam([-.05,.065,10.30],[.05,.065,10.30],.012,gold);beam([-.20,.065,10.3],[-.22,.065,10.55],.012,gold);beam([.20,.065,10.3],[.22,.065,10.55],.012,gold);
box(-1.16,.63,-4.17,.28,.018,.22,'#725045');plane(-1.16,.644,-4.17,.25,.20,wallMat,-Math.PI/2);
const propsBatch=finishBatch();trainObjects.push(...propsBatch);
function makeScale(z){const g=new T.Group();g.position.set(.10,.08,z);scene.add(g);trainObjects.push(g);scales.push(g);const add=(geo,m,x,y,z,rz=0)=>{const o=new T.Mesh(geo,color(m));o.position.set(x,y,z);o.rotation.z=rz;g.add(o);return o;};add(new T.CylinderGeometry(.12,.17,.08,12),'#9a8e60',0,.04,0);add(new T.CylinderGeometry(.018,.018,1.30,8),'#cbb879',0,.71,0);add(new T.BoxGeometry(1.05,.025,.025),'#bdae68',0,1.28,0);for(const s of [-1,1]){add(new T.SphereGeometry(.06,10,7),'#98536b',s*.42,1.28,0);add(new T.CylinderGeometry(.008,.008,.32,6),'#cabb82',s*.42,1.09,0);const pan=add(new T.ConeGeometry(.17,.13,14),'#cfbd84',s*.42,.86,0,Math.PI);add(new T.TorusGeometry(.16,.014,5,18),'#ad8e59',s*.42,.93,0,Math.PI/2);}add(new T.SphereGeometry(.09,10,8),'#a65f7c',0,1.34,0);add(new T.SphereGeometry(.025,8,6),'#c3b15f',0,1.48,0);}
for(let z=-9;z<=9;z+=1.38)makeScale(z);
// Red eyes are flat paper shapes inside the dark tunnel; they appear only in the abnormal state.
const eyeMat=mat('#9e383e'),eyes=[];for(const s of [-1,1]){const o=new T.Mesh(new T.SphereGeometry(1,20,12),eyeMat);o.position.set(s*.66,1.76,-31);o.scale.set(.51,.13,.045);scene.add(o);eyes.push(o);const pupil=new T.Mesh(new T.PlaneGeometry(.024,.18),color('#211c20'));pupil.position.set(s*.66,1.76,-30.94);scene.add(pupil);eyes.push(pupil);}
// Opening-day crowd uses intentional abstract paper silhouettes, not blurred video cutouts.
const shadowTexture=texture((g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#dedbc3';g.beginPath();g.ellipse(w*.5,h*.16,w*.14,h*.11,0,0,7);g.fill();g.beginPath();g.moveTo(w*.36,h*.29);g.lineTo(w*.64,h*.29);g.lineTo(w*.74,h*.66);g.lineTo(w*.58,h*.67);g.lineTo(w*.57,h*.97);g.lineTo(w*.46,h*.97);g.lineTo(w*.44,h*.69);g.lineTo(w*.40,h*.97);g.lineTo(w*.29,h*.97);g.lineTo(w*.34,h*.62);g.lineTo(w*.25,h*.55);g.closePath();g.fill();g.fillStyle='#a7868b';g.beginPath();g.ellipse(w*.57,h*.17,w*.07,h*.085,0,0,7);g.fill();g.fillRect(w*.52,h*.32,w*.12,h*.28);},256,512,0);
for(let i=0;i<26;i++){const o=new T.Mesh(new T.PlaneGeometry(.68,1.70),new T.MeshBasicMaterial({map:shadowTexture,transparent:true,alphaTest:.25,side:T.DoubleSide,color:i%4===0?'#c1c7b3':'#ffffff'}));o.position.set(3.65+(i%4)*1.02,.85,-17+Math.floor(i/4)*5.05);scene.add(o);crowds.push(o);}
// Standing cards stay clear of benches at every yaw; maxWidth also sets body collision.
// Each major character loads independently; entering never waits on the full set.
const characters=[
{key:'medicine',name:'卖药郎',x:-.52,z:3.55,h:1.90,y:.045,maxWidth:1.0,pose:'standing'},
{key:'girl',asset:'girl-standing',name:'黄衣少女',x:.55,z:1.65,h:1.68,y:.045,maxWidth:.90,pose:'standing'},
{key:'kimono',asset:'kimono-standing',name:'和服女子',x:.55,z:-.55,h:1.76,y:.045,maxWidth:.90,pose:'standing'},
{key:'boy',asset:'boy-standing',name:'蓝衣乘客',x:.55,z:-3.10,h:1.24,y:.045,maxWidth:.74,pose:'standing'},
{key:'writer',asset:'writer-standing',name:'记事本乘客',x:-.55,z:-5.25,h:1.77,y:.045,maxWidth:.90,pose:'standing'},
{key:'elder',asset:'elder-standing',name:'橙衣乘客',x:-.55,z:-1.85,h:1.62,y:.045,maxWidth:.94,pose:'standing'},
{key:'gentleman',asset:'gentleman-standing',name:'粉衣绅士',x:-.55,z:-9.15,h:1.83,y:.045,maxWidth:.94,pose:'standing'},
{key:'driver',name:'驾驶员',x:-.9,z:-12.67,h:1.76,y:.045,maxWidth:.84,pose:'standing'}
];
let assetsLoaded=0,assetFailures=[];const actorLoads=[];
for(const a of characters){const promise=new Promise(resolve=>{const im=new Image();im.onload=()=>{const c=canvas(im.width,im.height),ctx=c.getContext('2d');ctx.drawImage(im,0,0);const data=ctx.getImageData(0,0,c.width,c.height).data;let x0=c.width,y0=c.height,x1=0,y1=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(data[(y*c.width+x)*4+3]>128){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}const W=x1-x0+1,H=y1-y0+1;const crop=canvas(W,H);crop.getContext('2d').drawImage(im,x0,y0,W,H,0,0,W,H);const t=new T.CanvasTexture(crop);t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());const o=new T.Mesh(new T.PlaneGeometry(Math.min(a.h*W/H,a.maxWidth),a.h),new T.MeshBasicMaterial({map:t,transparent:true,alphaTest:.5,side:T.DoubleSide}));o.position.set(a.x,a.y+a.h/2,a.z);o.userData.actor=a;scene.add(o);people.push(o);assetsLoaded++;$('loading').textContent='空间已展开 · 纸影 '+assetsLoaded+' / 8';resolve();};im.onerror=()=>{assetFailures.push(a.key);$('loading').textContent='部分纸影尚未载入 · 空间仍可探索';resolve();};im.src='assets/'+(a.asset||a.key)+'.webp';});actorLoads.push(promise);}

let active=false,panelOpen=false,mode='day',yaw=0,pitch=0,walkY=0,target=null,targetDoor=null,toastTimer,elapsed=0,fps=0,frames=0,fpsTime=0;
const keys=new Set(),joy={x:0,y:0},direction=new T.Vector3(),delta=new T.Vector3();
const places=[
{id:'station',name:'福寿站台',sub:'拱券、风车与开通标语',x:5.5,y:0,z:-11,yaw:1.12,pitch:.12},
{id:'hall',name:'售票站厅',sub:'可沿站台尽头楼梯步行抵达',x:5.15,y:3.2,z:22.3,yaw:Math.PI,pitch:.06},
{id:'door',name:'站台侧车门',sub:'按 E 推开双门，再步行上车',x:3.1,y:0,z:7,yaw:Math.PI/2,pitch:0},
{id:'car',name:'红椅车厢',sub:'纵向长椅、窗格、扶手与吊环',x:.20,y:0,z:8.8,yaw:0,pitch:.06},
{id:'cabdoor',name:'驾驶室门前',sub:'开门后可进入独立驾驶室',x:0,y:0,z:-10.30,yaw:0,pitch:0},
{id:'cab',name:'驾驶室',sub:'黄铜手柄、三面仪表与信号',x:.35,y:0,z:-12.76,yaw:0,pitch:-.1,open:'cab'},
{id:'rear',name:'后端间',sub:'端门、遗落眼镜与轨道透视',x:.1,y:0,z:10.6,yaw:Math.PI,pitch:-.1},
{id:'tunnel',name:'隧道检修走道',sub:'在护栏内看轨道与拱肋',x:-2.41,y:-.8,z:24,yaw:Math.PI,pitch:0,open:'back-end'},
{id:'scales',name:'结界秤阵',sub:'切换到异变，近看车厢中的秤列',x:.63,y:0,z:9.0,yaw:0,pitch:.03,mode:'veil'}
];
const notes=[
{id:'clock',title:'双鸟与花的站钟',shot:74,pos:[3.4,4.7,19.6],text:'站钟位于拱顶之下，钟盘两侧是黑色鸟影与灰绿花团。这里依据02:49、05:05等镜头，把八角钟框、鸟、花和拱券分开建模。',hint:'抬头看站台尽头的钟面'},
{id:'wind',title:'开通日的彩色风车',shot:51,pos:[2.8,1.05,-10.7],text:'开通日的站台围栏以红、黄、青、蓝四色风车组成。细立杆与折纸叶片沿站台重复，在大理石色空间中形成跳跃的颜色。',hint:'沿站台边缘寻找彩色风车'},
{id:'body',title:'黄铜色的首发列车',shot:97,pos:[2.9,1.6,14.15],text:'列车端面呈暗黄铜色，窗洞、铆钉、车门和深红色弧顶带构成清楚的层次。轨道、底架与轮对也独立建模，避免把列车做成一面画。',hint:'从站台观察列车端面'},
{id:'rings',title:'长椅上方的吊环',shot:350,pos:[0,2.35,-5.1],text:'07:55与20:45等镜头可确认低矮弧顶、密集吊环、支架和行李架。米白吊环悬在黑色长杆下，斜撑把内墙连接到顶棚。',hint:'走入车厢，抬头看两侧'},
{id:'seat',title:'红色长椅与纸影乘客',shot:315,pos:[.5,1.15,.5],text:'车厢两侧是连续的红色长椅，侧门把座椅分成数段。八位主要人物根据本篇选出的画面重新生成插画。为减少纸片转动时与座椅相交，乘客统一采用站姿，并与长椅留出间距；站台人群使用有意抽象的纸影。',hint:'靠近中段的红色长椅'},
{id:'notebook',title:'记事本与平顶帽',shot:317,pos:[-.55,1.15,-5.25],text:'窄脸、八字眉、小胡子与棕色平顶帽，是记事本乘客的辨识点。手中的小本、铅笔与灰褐和服一起，补足车厢里细小的人物线索。',hint:'看左侧握着记事本的乘客'},
{id:'chest',title:'金色眼纹的药箱',shot:280,pos:[-.62,.68,4.75],text:'药箱的正面有巨大的金色眼纹、短放射线与金属包边。它不是背景贴图中的一块颜色，而是可以绕看的独立小物件。',hint:'卖药郎旁边的深色药箱'},
{id:'gauges',title:'驾驶室的黄铜仪表',shot:195,pos:[.2,1.45,-13.85],text:'依据04:31、05:15、10:47和12:09的近景，重建两只手轮、三面压力表、操纵柜和驾驶门旁的信号按钮。驾驶室与客舱之间有能开合的门。',hint:'推开车厢前端的驾驶室门'},
{id:'glasses',title:'遗落在端门前的眼镜',shot:198,pos:[0,.10,10.3],text:'10:50至10:51的连续镜头，把敞开的端门、后方轨道与地上的眼镜联系在一起。细框眼镜放在浅色分板地面上，须低头才能看清。',hint:'在后端门附近低头观察'},
{id:'balance',title:'沿中轴展开的结界秤',shot:345,pos:[.1,1.25,5.6],text:'15:13至20:27的多个镜头呈现秤阵的纵向节奏。紫红轴心、黄铜细杆与两侧小盘是独立立体结构；切换「隧道异变」可看见。',hint:'切换到隧道异变，观察秤阵',veil:true},
{id:'dark',title:'隧道尽处的赤眼',shot:125,pos:[-.1,1.75,-28],text:'影片用近乎黑色的隧道、双轨透视与赤色眼睛构成未知的边界。网页以场景状态呈现这组画面，不把它扩写成原片没有说明的新房间或剧情。',hint:'在驾驶室前方看向黑暗',veil:true}
];
let visited;try{visited=new Set(JSON.parse(localStorage.getItem('mononoke-bakeneko-notes')||'[]').filter(x=>notes.some(n=>n.id===x)));}catch(e){visited=new Set();}
function stamp(t){return String(Math.floor(t/60)).padStart(2,'0')+':'+String(Math.floor(t%60)).padStart(2,'0');}
function ref(id){return refs.find(r=>r.shot===id)||refs[0];}
function toast(s){clearTimeout(toastTimer);$('toast').textContent=s;$('toast').classList.add('show');toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3200);}
function saveNotes(){try{localStorage.setItem('mononoke-bakeneko-notes',JSON.stringify([...visited]));}catch(e){}$('count').textContent=visited.size+' / '+notes.length;}saveNotes();
let returnFocus=null;
function showPanel(html,kicker){keys.clear();joy.x=joy.y=0;returnFocus=document.activeElement;panelOpen=true;$('panelContent').innerHTML=html;$('panelKicker').textContent=kicker||'地下铁异闻';$('panel').hidden=false;$('shade').hidden=false;$('panel').scrollTop=0;$('closePanel').focus();}
function closePanel(){panelOpen=false;$('panel').hidden=true;$('shade').hidden=true;if(returnFocus&&returnFocus.isConnected)returnFocus.focus();}
$('closePanel').onclick=closePanel;$('shade').onclick=closePanel;
function teleport(id){const p=places.find(x=>x.id===id)||places[0];if(p.mode)changeMode(p.mode,false);else if((p.id==='station'||p.id==='hall'||p.id==='door')&&mode==='veil')changeMode('day',false);camera.position.set(p.x,p.y+1.60,p.z);walkY=p.y;yaw=p.yaw;pitch=p.pitch||0;if(p.open){const d=doors.find(d=>d.id===p.open);d.open=true;d.t=1;animateDoors(1);}lastZone='';}
function visit(id){teleport(id);closePanel();toast(id==='door'||id==='cabdoor'?'面对房门 · 按 E 或点击提示推开':'拖动环顾 · 可以继续步行探索');}
function changeMode(m,announce=true){mode=m;for(const o of stationObjects)o.visible=m!=='veil';for(const o of crowds)o.visible=m==='day';for(const o of people)o.visible=m!=='empty';for(const o of scales)o.visible=m==='veil';for(const o of eyes)o.visible=m==='veil';scene.background.set(m==='veil'?'#181f23':'#444247');scene.fog.color.set(m==='veil'?'#1c2327':'#343236');$('modeBtn').textContent='◐ '+({day:'开通日',veil:'隧道异变',empty:'空车厢'}[m]);if(m==='veil'&&active&&(camera.position.x>1.85||walkY>1))teleport('car');if(m!=='empty')clearActorOverlap();lastZone='';if(announce)toast({day:'福寿站 · 回到开通之日',veil:'列车入暗 · 结界秤阵显现',empty:'纸影退去 · 观察空车厢的结构'}[m]);}
function mapPanel(){showPanel('<h2 id="panelTitle">车站舆图</h2><p>站厅、站台、车厢和驾驶室可以步行连接。选择位置可直接前往；到门前按 E，或点击画面提示开门。</p><svg class="map-plan" viewBox="0 0 500 265" role="img" aria-label="福寿站台、列车与售票站厅平面图"><rect x="32" y="28" width="330" height="56" fill="#b1b898"/><rect x="363" y="24" width="110" height="70" fill="#b1b898"/><rect x="370" y="95" width="45" height="45" fill="#a4ab8c"/><path d="M370 99h45M370 107h45M370 115h45M370 123h45M370 131h45" stroke="#596b55"/><text x="162" y="62">福 寿 站 台</text><text x="388" y="62">售票站厅</text><path d="M20 169h460M20 192h460" stroke="#5a6757" stroke-width="4"/><rect x="66" y="144" width="335" height="76" fill="#bb9a65" stroke="#4f5e4b" stroke-width="3"/><path d="M98 144v76M368 144v76" stroke="#465847" stroke-width="2"/><rect x="141" y="151" width="173" height="12" fill="#9a5864"/><rect x="141" y="201" width="173" height="12" fill="#9a5864"/><text x="180" y="186">红 椅 车 厢</text><text x="74" y="185" font-size="10">驾驶室</text><text x="370" y="185" font-size="10">端间</text><path d="M138 144v-31M322 144v-31" stroke="#9b4c51" stroke-width="6"/><text x="32" y="249" font-size="10">红线：站台侧车门　　站厅与连续进深为探索补全</text></svg><div class="places">'+places.map(p=>'<button data-place="'+p.id+'">'+p.name+'<span>'+p.sub+'</span></button>').join('')+'</div><small>依据61张按镜头内容精选的参考重建；尺寸、站厅连接和检修走道含推测性补全。</small>','探索 · 站台与车厢');document.querySelectorAll('[data-place]').forEach(b=>b.onclick=()=>visit(b.dataset.place));}
function evidence(category='all'){const categories={all:'全部',station:'站台与外观',car:'车厢结构',people:'人物与物件'},stationIds=[27,28,32,35,36,37,38,49,51,52,54,63,74,97,125,189,338],carIds=[69,75,98,99,145,147,148,151,163,164,168,178,190,197,213,217,238,245,284,290,304,344,350];const list=refs.filter(r=>category==='all'||(category==='station'?stationIds.includes(r.shot):category==='car'?carIds.includes(r.shot):!stationIds.includes(r.shot)&&!carIds.includes(r.shot)));showPanel('<h2 id="panelTitle">镜头对照</h2><p>对视频做镜头切换检测后，逐页查看363个候选画面，按空间、人物和陈设筛选61张参考。空车厢、俯视与反打共同校准布局。</p><div class="mode-options">'+Object.entries(categories).map(([k,v])=>'<button data-category="'+k+'" aria-pressed="'+(category===k)+'">'+v+'</button>').join('')+'</div><div class="ref-grid">'+list.map(r=>'<button data-shot="'+r.shot+'"><img src="'+r.file+'" alt="'+r.label+'" loading="lazy"><span>'+stamp(r.time)+' · '+r.label+'</span></button>').join('')+'</div>','原片 · 61帧空间考据');document.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>evidence(b.dataset.category));document.querySelectorAll('[data-shot]').forEach(b=>b.onclick=()=>referenceDetail(+b.dataset.shot));}
function referenceDetail(id){const r=ref(id);showPanel('<small>镜头 '+r.shot+' · 精确取帧 '+r.time.toFixed(3)+' 秒</small><h2 id="panelTitle">'+r.label+'</h2><img src="'+r.file+'" alt="'+r.label+'"><p>此画面在检测到镜头变化后选取，完整原始分辨率为1280 × 720。</p><button id="backRefs">返回镜头目录</button>','原片 · '+stamp(r.time));$('backRefs').onclick=()=>evidence();}
function observe(n){if(!n)return;visited.add(n.id);saveNotes();const r=ref(n.shot);showPanel('<small>异闻 '+String(notes.indexOf(n)+1).padStart(2,'0')+' · '+stamp(r.time)+'</small><h2 id="panelTitle">'+n.title+'</h2><p>'+n.text+'</p><img src="'+r.file+'" alt="'+r.label+'"><small>原片对应画面：'+r.label+'</small><p><button id="backJournal">查看异闻录</button></p>','观察 · 留下一页见闻');$('backJournal').onclick=journal;}
function journal(){showPanel('<h2 id="panelTitle">地下铁异闻录</h2><p>已记录 '+visited.size+' / '+notes.length+'。靠近物件、对准画面中央，按 E 或点击提示观察。</p><div class="notes">'+notes.map(n=>'<button data-note="'+n.id+'"><b>'+(visited.has(n.id)?'● ':'○ ')+n.title+'</b><span>'+n.hint+'</span></button>').join('')+'</div>','见闻 · 福寿站');document.querySelectorAll('[data-note]').forEach(b=>b.onclick=()=>{const n=notes.find(n=>n.id===b.dataset.note);observe(n);});}
function modePanel(){showPanel('<h2 id="panelTitle">一辆列车，三重画面</h2><p>开通日保留站台纸影与车厢乘客；空车厢便于查看结构；隧道异变显现秤阵和黑暗中的赤眼。它们依据不同镜头组织，不是完整剧情复现。</p><div class="mode-options">'+[['day','开通日'],['empty','空车厢'],['veil','隧道异变']].map(([m,n])=>'<button data-mode="'+m+'" aria-pressed="'+(m===mode)+'">'+n+'</button>').join('')+'</div>','画面 · 状态切换');document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{changeMode(b.dataset.mode);closePanel();});}
function chapterPanel(){showPanel('<h2 id="panelTitle">异境篇章</h2><a class="chapter-link" href="../?v=32">壱 · 海坊主<small>金云奇舟 · 交错回廊与层层客舱</small></a><a class="chapter-link current" href="./">弐 · 化猫<small>纸上地下铁 · 福寿站与首发列车</small></a>','同一画卷 · 两重异境');}
function help(){showPanel('<h2 id="panelTitle">如何探索地下铁</h2><p><b>电脑：</b>W A S D 或方向键步行，按住画面拖动环顾；Shift加快步伐。靠近车门或物件，按 E 开门、关门或观察。</p><p><b>手机：</b>左下摇杆移动，右侧画面拖动环顾；点击中央附近出现的提示开门或观察。</p><p>站台侧有两组双门，可开门后步行上车。车厢前端通向独立驾驶室；后端间通向短检修阶梯和护栏走道。站台尽头的楼梯通向售票站厅。</p><p>在舆图中可以快速前往各位置。「画面」可切换开通日、空车厢和隧道异变。「章节」返回海坊主篇。Esc关闭面板。</p><p>门窗、顶棚、吊环、红椅、仪表与细物以本视频为依据；连续长度、站厅连接和检修走道是探索所需的补全。主要人物使用高清重绘纸片，站台人群使用抽象纸影。</p>','探索须知');}
function toggleDoor(d){if(!d)return;const cross=d.axis==='x'?camera.position.x:camera.position.z,along=d.axis==='x'?camera.position.z:camera.position.x;if(d.open&&Math.abs(cross-d.at)<.48&&Math.abs(along-d.center)<d.w/2+.16){toast('先离开门槛，再关门');return;}d.open=!d.open;toast((d.open?'推开 · ':'合上 · ')+d.label);}
function animateDoors(dt){for(const d of doors){d.t+=(Number(d.open)-d.t)*Math.min(1,dt*9);for(const p of d.panels)p.group.position[d.axis==='x'?'z':'x']=p.base+p.s*(d.w*.50+.04)*d.t;}}
function interact(){if(targetDoor)toggleDoor(targetDoor);else if(target)observe(target);}
function clearActorOverlap(){
 if(!active||mode==='empty'||!characters.some(a=>Math.abs(walkY-a.y)<.25&&Math.hypot(camera.position.x-a.x,camera.position.z-a.z)<a.maxWidth/2+.17))return;
 const x=camera.position.x,z=camera.position.z;
 for(const r of [.25,.5,.75,1,1.25])for(let i=0;i<12;i++){
  const a=i*Math.PI/6,nx=x+Math.cos(a)*r,nz=z+Math.sin(a)*r,y=floorAt(nx,nz);
  if(y!==null){camera.position.set(nx,y+1.6,nz);walkY=y;return;}
 }
}
function floorAt(x,z){
 const candidates=[];
 if(Math.abs(x)<1.84&&z> -14.70&&z<14.70)candidates.push(0);
 if(mode!=='veil'){
  if(x>2.04&&x<9.20&&z> -20.3&&z<20.92&&!(x>5.46&&x<8.24&&z>12.86))candidates.push(0);
  if(x>5.46&&x<8.24&&z>=12.86&&z<20.96)candidates.push(Math.max(0,Math.min(3.2,(z-12.86)/8.06*3.2)));
  if(x>3.35&&x<10.24&&z>=20.88&&z<27.25)candidates.push(3.2);
  if(x>1.72&&x<2.30&&Math.abs(Math.abs(z)-7)<.78)candidates.push(0);
 }
 if(Math.abs(x)<.59&&z>=14.64&&z<16.58)candidates.push(-Math.min(.8,Math.max(0,z-14.72)/1.6*.8));
 if(x> -2.80&&x<.66&&z>16.13&&z<17.30)candidates.push(-.8);
 if(x> -2.78&&x< -2.09&&z>=17.2&&z<36)candidates.push(-.8);
 const y=candidates.sort((a,b)=>Math.abs(a-walkY)-Math.abs(b-walkY))[0];
 if(y===undefined||Math.abs(y-walkY)>.32)return null;
 const r=.17;for(const o of obstacles)if(y+1.4>o.y0&&y+.1<o.y1&&x>o.x0-r&&x<o.x1+r&&z>o.z0-r&&z<o.z1+r)return null;
 for(const d of doors){if(Math.abs(y-d.y)>.7||d.t>.92)continue;const cross=d.axis==='x'?x:z,along=d.axis==='x'?z:x;if(Math.abs(cross-d.at)<.20&&Math.abs(along-d.center)<d.w/2+.1)return null;}
 if(Math.abs(x)<.13&&Math.min(...[-10,0,10].map(v=>Math.abs(v-z)))<.13&&Math.abs(y)<.1)return null;
 if(mode!=='empty')for(const a of characters)if(Math.hypot(x-a.x,z-a.z)<a.maxWidth/2+.17&&Math.abs(y-a.y)<.25)return null;
 return y;
}
function move(dx,dz){const x=camera.position.x,z=camera.position.z;let nx=x+dx,nz=z+dz,y=floorAt(nx,nz);if(y===null){y=floorAt(nx,z);if(y!==null)nz=z;else{y=floorAt(x,nz);if(y===null)return;nx=x;}}camera.position.x=nx;camera.position.z=nz;walkY=y;camera.position.y+=(y+1.60-camera.position.y)*.55;}
$('enter').onclick=()=>{active=true;$('intro').hidden=true;$('hud').hidden=false;teleport('station');toast('沿站台走近黄铜车门 · 按 E 推开');};
$('mapBtn').onclick=mapPanel;$('refsBtn').onclick=()=>evidence();$('introRefs').onclick=()=>evidence();$('journalBtn').onclick=journal;$('modeBtn').onclick=modePanel;$('chapters').onclick=chapterPanel;$('help').onclick=help;$('inspect').onclick=interact;$('reset').onclick=()=>{teleport('car');toast('已回到车厢中轴');};
addEventListener('keydown',e=>{if(e.code==='Escape'){closePanel();return;}if(panelOpen){if(e.code==='Tab'){const focusables=[...$('panel').querySelectorAll('a,button')];if(e.shiftKey&&document.activeElement===focusables[0]){e.preventDefault();focusables.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===focusables.at(-1)){e.preventDefault();focusables[0].focus();}}return;}if(!active)return;if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight'].includes(e.code)){e.preventDefault();keys.add(e.code);if(!e.repeat&&!e.code.startsWith('Shift')){const a=['KeyD','ArrowRight'].includes(e.code)?1:['KeyA','ArrowLeft'].includes(e.code)?-1:0,b=['KeyW','ArrowUp'].includes(e.code)?1:['KeyS','ArrowDown'].includes(e.code)?-1:0;move((Math.cos(yaw)*a-Math.sin(yaw)*b)*.12,(-Math.sin(yaw)*a-Math.cos(yaw)*b)*.12);}}if(e.code==='KeyE'&&!e.repeat)interact();});
addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',()=>{keys.clear();joy.x=joy.y=0;});
let drag=null;renderer.domElement.addEventListener('pointerdown',e=>{if(!active||panelOpen)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId);});
renderer.domElement.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id||panelOpen)return;yaw-=(e.clientX-drag.x)*.004;pitch-=(e.clientY-drag.y)*.003;pitch=Math.max(-1.30,Math.min(1.30,pitch));drag.x=e.clientX;drag.y=e.clientY;});for(const k of ['pointerup','pointercancel','lostpointercapture'])renderer.domElement.addEventListener(k,()=>drag=null);
const joystick=$('joystick');let joyId=null;function updateJoy(e){const r=joystick.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)/36,y=(e.clientY-r.top-r.height/2)/36,l=Math.max(1,Math.hypot(x,y));joy.x=x/l;joy.y=y/l;$('stick').style.transform='translate('+joy.x*31+'px,'+joy.y*31+'px)';}joystick.onpointerdown=e=>{joyId=e.pointerId;joystick.setPointerCapture(e.pointerId);updateJoy(e);};joystick.onpointermove=e=>{if(e.pointerId===joyId)updateJoy(e);};for(const k of ['pointerup','pointercancel','lostpointercapture'])joystick.addEventListener(k,()=>{joyId=null;joy.x=joy.y=0;$('stick').style.transform='';});
let sound=null,soundOn=false;function toggleSound(){try{if(!sound){const A=window.AudioContext||window.webkitAudioContext;sound=new A();const buffer=sound.createBuffer(1,sound.sampleRate*4,sound.sampleRate),d=buffer.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(.35+.65*Math.pow(Math.sin(i/sound.sampleRate*Math.PI*4),12));const src=sound.createBufferSource();src.buffer=buffer;src.loop=true;const filter=sound.createBiquadFilter();filter.type='lowpass';filter.frequency.value=300;const gain=sound.createGain();gain.gain.value=.06;src.connect(filter).connect(gain).connect(sound.destination);src.start();}soundOn=!soundOn;sound[soundOn?'resume':'suspend']();$('sound').textContent='声 · '+(soundOn?'开':'关');$('sound').setAttribute('aria-label',soundOn?'关闭列车环境音':'开启列车环境音');}catch(e){toast('当前浏览器无法开启环境音');}}$('sound').onclick=toggleSound;
let lastZone='';const clock=new T.Clock();
changeMode('day',false);
function frame(){requestAnimationFrame(frame);const dt=Math.min(.05,clock.getDelta());elapsed+=dt;frames++;if(elapsed-fpsTime>1){fps=Math.round(frames/(elapsed-fpsTime));frames=0;fpsTime=elapsed;}
 if(!active){camera.position.set(7.15+Math.sin(elapsed*.10)*.28,1.88,-13.15);camera.lookAt(-.2,2.2,-1.5);}
 else if(!panelOpen){
  animateDoors(dt);const a=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+joy.x,b=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-joy.y,l=Math.max(1,Math.hypot(a,b)),speed=dt*(keys.has('ShiftLeft')||keys.has('ShiftRight')?4.2:2.65);
  move((Math.cos(yaw)*a-Math.sin(yaw)*b)/l*speed,(-Math.sin(yaw)*a-Math.cos(yaw)*b)/l*speed);camera.rotation.set(pitch,yaw,0,'YXZ');camera.getWorldDirection(direction);
  targetDoor=null;let score=.48;for(const d of doors){delta.copy(d.point).sub(camera.position);const distance=delta.length(),dot=delta.normalize().dot(direction);if(distance<2.30&&Math.abs(walkY-d.y)<.6&&dot>score){score=dot;targetDoor=d;}}
  target=null;score=.62;for(const n of notes){if(n.veil&&mode!=='veil')continue;if(n.id==='dark'&&!doors.find(d=>d.id==='front-end').open)continue;delta.set(...n.pos).sub(camera.position);const distance=delta.length(),dot=delta.normalize().dot(direction),limit=n.id==='clock'?5.3:n.id==='dark'?24:2.7;if(distance<limit&&dot>score){score=dot;target=n;}}
  $('inspect').hidden=!targetDoor&&!target;if(targetDoor)$('inspect').innerHTML=(targetDoor.open?'合上':'推开')+' · '+targetDoor.label+' <span>E</span>';else if(target)$('inspect').innerHTML='观察 · '+target.title+' <span>E</span>';
  const x=camera.position.x,z=camera.position.z,zone=walkY>2?'售票站厅':walkY<-.3?'隧道检修走道':x>2.05?'福寿站台':z< -11.65?'驾驶室':z>11.65?'后端间':mode==='veil'?'结界车厢':'红椅车厢';
  if(zone!==lastZone){lastZone=zone;$('locTitle').textContent=zone;$('locNo').textContent=zone==='福寿站台'?'01':zone==='售票站厅'?'02':zone==='驾驶室'?'04':zone==='后端间'?'05':zone==='隧道检修走道'?'06':'03';$('zone').textContent=(mode==='veil'?'隧道异变':'福寿站')+' · '+zone;}
 }
 for(const o of people){o.rotation.y=Math.atan2(camera.position.x-o.position.x,camera.position.z-o.position.z);o.visible=mode!=='empty';}
 for(const o of crowds)o.rotation.y=Math.atan2(camera.position.x-o.position.x,camera.position.z-o.position.z);
 for(let i=0;i<pinwheels.length;i++)pinwheels[i].rotation.z=elapsed*(.14+i%3*.03)+i;
 for(let i=0;i<scales.length;i++)scales[i].rotation.z=Math.sin(elapsed*1.3+i*.6)*.018;
 renderer.render(scene,camera);
}
frame();
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,coarse()?1.25:1.6));camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();});
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();$('error').hidden=false;});
window.BAKENEKO={get state(){return{chapter:'bakeneko',version:2,actorPose:'standing',active,mode,position:camera.position.toArray(),footHeight:walkY,yaw,pitch,zone:lastZone,characters:people.length,assetFailures:[...assetFailures],referenceCount:refs.length,visited:[...visited],doors:doors.map(d=>({id:d.id,open:d.open,amount:d.t})),targetDoor:targetDoor?.id||null,target:target?.id||null,fps,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles};}};
})();
