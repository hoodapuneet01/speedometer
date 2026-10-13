const $=i=>document.getElementById(i),cv=$('cv'),g=cv.getContext('2d');
let U='km',mps=0,shown=0,mx=0,dist=0,mov=0,trip=0,lim=100,wid=null,lastP=null,lastT=performance.now();
const f=()=>U==='km'?3.6:2.23694,cap=()=>U==='km'?240:150;
function css(n){return getComputedStyle(document.documentElement).getPropertyValue(n).trim()}
function size(){const r=cv.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);cv.width=r.width*d;cv.height=r.height*d;g.setTransform(d,0,0,d,0,0)}
addEventListener('resize',size);size();
function gauge(v){
const w=cv.clientWidth,h=cv.clientHeight,cx=w/2,cy=h*.55,R=Math.min(w*.46,h*.5),a0=Math.PI*.75,a1=Math.PI*2.25,C=cap();
g.clearRect(0,0,w,h);const over=v>lim;const col=over?css('--bad'):css('--acc');
g.lineWidth=R*.1;g.lineCap='round';g.strokeStyle=css('--card');g.beginPath();g.arc(cx,cy,R,a0,a1);g.stroke();
const fr=Math.min(1,v/C);if(fr>0){g.strokeStyle=col;g.beginPath();g.arc(cx,cy,R,a0,a0+(a1-a0)*fr);g.stroke()}
const li=lim/C;if(li<=1){const a=a0+(a1-a0)*li;g.strokeStyle=css('--bad');g.lineWidth=3;g.beginPath();g.moveTo(cx+Math.cos(a)*(R*.82),cy+Math.sin(a)*(R*.82));g.lineTo(cx+Math.cos(a)*(R*.7),cy+Math.sin(a)*(R*.7));g.stroke()}
g.fillStyle=css('--dim');g.font=Math.round(R*.1)+'px system-ui';g.textAlign='center';g.textBaseline='middle';g.strokeStyle=css('--dim');
const step=U==='km'?20:10;
for(let s=0;s<=C;s+=step){const a=a0+(a1-a0)*s/C,major=s%(step*2)===0;g.lineWidth=major?2:1;
g.beginPath();g.moveTo(cx+Math.cos(a)*(R*.84),cy+Math.sin(a)*(R*.84));g.lineTo(cx+Math.cos(a)*(R*(major?.76:.79)),cy+Math.sin(a)*(R*(major?.76:.79)));g.stroke();
if(major)g.fillText(s,cx+Math.cos(a)*R*.64,cy+Math.sin(a)*R*.64)}
const a=a0+(a1-a0)*fr;g.strokeStyle=col;g.lineWidth=4;g.lineCap='round';g.beginPath();g.moveTo(cx-Math.cos(a)*R*.1,cy-Math.sin(a)*R*.1);g.lineTo(cx+Math.cos(a)*R*.72,cy+Math.sin(a)*R*.72);g.stroke();
g.fillStyle=col;g.beginPath();g.arc(cx,cy,R*.045,0,7);g.fill()}
function hav(a,b){const r=Math.PI/180,dl=(b.lat-a.lat)*r,dn=(b.lon-a.lon)*r,x=Math.sin(dl/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dn/2)**2;return 12742000*Math.asin(Math.sqrt(x))}
function onPos(p){const c=p.coords,now={lat:c.latitude,lon:c.longitude,t:p.timestamp};let s=c.speed;
if(lastP){const d=hav(lastP,now),dt=(now.t-lastP.t)/1000;if(dt>0&&(c.accuracy||0)<50){if(s==null)s=d/dt;if(d>1.5)dist+=d}}
lastP=now;hd=c.heading;al=c.altitude;mps=s==null?0:Math.max(0,s);$('st').textContent='GPS active (accuracy '+Math.round(c.accuracy||0)+' m)'}
function startGPS(){if(!navigator.geolocation){$('st').textContent='GPS not available here.';return}
if(wid!=null)return;$('st').textContent='Waiting for location permission...';
wid=navigator.geolocation.watchPosition(onPos,e=>{$('st').textContent='Location blocked ('+e.message+').';stopGPS()},{enableHighAccuracy:true,maximumAge:0,timeout:15000});$('go').textContent='Stop GPS'}
function stopGPS(){if(wid!=null)navigator.geolocation.clearWatch(wid);wid=null;$('go').textContent='Start GPS';mps=0}
$('go').onclick=()=>{wid!=null?(stopGPS(),$('st').textContent='Stopped.'):startGPS()};
$('rs').onclick=()=>{mx=0;dist=0;mov=0;trip=0};
function hist(){let a=[];try{a=JSON.parse(localStorage.getItem('spd-hist')||'[]')}catch(e){}
$('hist').innerHTML=a.length?'<div class="grid" style="grid-template-columns:1fr;margin-top:12px">'+a.slice().reverse().map(x=>'<div><small>'+x.d+'</small><b style="font-size:17px">'+x.di+' · '+x.tt+' · top '+x.mx+' · avg '+x.av+' '+x.u+'</b></div>').join('')+'</div><div class="row2"><button id="clr" style="background:transparent;border:1px solid var(--dim);color:var(--ink)">Clear history</button></div>':'';
const c=$('clr');if(c)c.onclick=()=>{try{localStorage.removeItem('spd-hist')}catch(e){}hist()}}
$('sv').onclick=()=>{if(trip<5){$('st').textContent='Drive a little first, then save the trip.';return}let a=[];try{a=JSON.parse(localStorage.getItem('spd-hist')||'[]')}catch(e){}
a.push({d:new Date().toLocaleString([], {dateStyle:'medium',timeStyle:'short'}),di:$('di').textContent,tt:$('tt').textContent,mx:$('mx').textContent,av:$('av').textContent,u:U==='km'?'km/h':'mph'});
try{localStorage.setItem('spd-hist',JSON.stringify(a.slice(-20)))}catch(e){}
mx=0;dist=0;mov=0;trip=0;$('st').textContent='Trip saved.';hist()};
let AC=null,snd=true,lastAl=0;
function ac(){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();AC.resume()}catch(e){}}
function beep(){ac();try{const o=AC.createOscillator(),gn=AC.createGain();o.frequency.value=880;gn.gain.value=.15;o.connect(gn);gn.connect(AC.destination);o.start();o.stop(AC.currentTime+.25)}catch(e){}try{navigator.vibrate&&navigator.vibrate([200,100,200])}catch(e){}}
document.addEventListener('pointerdown',ac);
$('snd').onclick=()=>{snd=!snd;$('snd').textContent='Alert: '+(snd?'On':'Off');if(snd)beep()};
const TH=[['Cyan','#25d0ff'],['Amber','#ffb300'],['Green','#27ff7d'],['Pink','#ff5ca8']];let ti=0;
$('thm').onclick=()=>{ti=(ti+1)%TH.length;document.documentElement.style.setProperty('--acc',TH[ti][1]);$('thm').textContent='Theme: '+TH[ti][0]};
let hd=null,al=null,az=false,t0=0,res=null,fin=false;
function extra(v,dt,t){
$('hd').textContent=(hd==null||isNaN(hd)||mps<1)?'--':['N','NE','E','SE','S','SW','W','NW'][Math.round(hd/45)%8]+' '+Math.round(hd)+'°';
$('al').textContent=al==null||isNaN(al)?'--':(U==='km'?Math.round(al)+' m':Math.round(al*3.281)+' ft');
const tg=U==='km'?100:60;$('azl').textContent='0-'+tg+(U==='km'?' km/h':' mph')+' (stop, then floor it)';
if(v<2){fin=false;az=true;t0=0}else if(az&&!t0&&!fin){t0=t;res=null}
if(t0&&v>=tg){res=(t-t0)/1000;t0=0;fin=true;az=false}
$('az').textContent=t0?((t-t0)/1000).toFixed(1)+' s...':res!=null?res.toFixed(2)+' s':'--'}
let wl=null;
$('hudb').onclick=async e=>{e.stopPropagation();document.body.classList.add('hud');try{wl=await navigator.wakeLock.request('screen')}catch(x){}};
document.addEventListener('click',()=>{if(document.body.classList.contains('hud')){document.body.classList.remove('hud');try{wl&&wl.release()}catch(x){}wl=null;setTimeout(size,50)}});
hist();
function unit(u){U=u;$('ukm').classList.toggle('on',u==='km');$('umi').classList.toggle('on',u==='mi');$('unit').textContent=u==='km'?'km/h':'mph';lim=Math.round(lim*(u==='km'?1.609:1/1.609)/5)*5;$('lv').textContent=lim}
$('ukm').onclick=()=>unit('km');$('umi').onclick=()=>unit('mi');
$('lm').onclick=()=>{lim=Math.max(5,lim-5);$('lv').textContent=lim};$('lp').onclick=()=>{lim=Math.min(cap(),lim+5);$('lv').textContent=lim};
function loop(t){requestAnimationFrame(loop);const dt=Math.min(.1,(t-lastT)/1000);lastT=t;
if(mps>.5){mov+=dt}trip+=wid!=null?dt:0;
const v=mps*f();if(v>mx)mx=v;shown+=(v-shown)*Math.min(1,dt*6);
extra(v,dt,t);gauge(shown);if(snd&&shown>lim&&t-lastAl>3000){lastAl=t;beep()}$('val').textContent=Math.round(shown);$('val').style.color=shown>lim?css('--bad'):css('--ink');
$('mx').textContent=Math.round(mx);$('av').textContent=mov>1?Math.round(dist/mov*f()):0;
$('di').textContent=(U==='km'?dist/1000:dist/1609.34).toFixed(2)+(U==='km'?' km':' mi');
const s=Math.floor(trip),hh=Math.floor(s/3600),mm=String(Math.floor(s%3600/60)).padStart(2,'0'),ss=String(s%60).padStart(2,'0');$('tt').textContent=(hh?hh+':':'')+mm+':'+ss}
requestAnimationFrame(loop);
  
