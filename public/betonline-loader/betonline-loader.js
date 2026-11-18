/* BetOnline loader: latest B-first swoosh, masked wordmark fill, stars only. */
(()=>{
if(customElements.get('betonline-loader'))return;
function mount(root,host){


 const logoMarkup="\n<path d=\"M71.6603 10.0648C70.9023 9.31071 69.9887 8.73065 68.9392 8.30528C67.8896 7.87991 66.7234 7.66722 65.46 7.66722C64.2161 7.66722 63.0499 7.87991 61.9809 8.30528C60.9313 8.73065 60.0178 9.33004 59.2597 10.0648C58.5017 10.8188 57.9186 11.7083 57.491 12.7137C57.0634 13.7191 56.8496 14.8405 56.8496 16.02C56.8496 17.1994 57.0634 18.3015 57.491 19.3263C57.9186 20.3317 58.5212 21.2405 59.2597 21.9752C60.0178 22.7293 60.9313 23.3093 61.9809 23.7347C63.0304 24.1601 64.1966 24.3727 65.46 24.3727C66.704 24.3727 67.8701 24.1601 68.9392 23.7347C69.9887 23.3093 70.9023 22.7099 71.6603 21.9752C72.4183 21.2211 73.0014 20.3317 73.429 19.3263C73.8566 18.3209 74.0704 17.1994 74.0704 16.02C74.0704 14.8405 73.8566 13.7384 73.429 12.7137C73.0014 11.7083 72.4183 10.8188 71.6603 10.0648ZM71.4853 16.02C71.4853 16.8514 71.3493 17.6635 71.0577 18.3982C70.7662 19.1329 70.358 19.7903 69.8527 20.3317C69.3279 20.8731 68.6865 21.3178 67.9673 21.6465C67.2287 21.9752 66.4124 22.1299 65.4989 22.1299C64.5854 22.1299 63.7496 21.9752 63.0304 21.6465C62.2918 21.3178 61.6699 20.8731 61.1451 20.3317C60.6203 19.7903 60.2121 19.1329 59.94 18.3982C59.6485 17.6635 59.5124 16.8514 59.5124 16.02C59.5124 15.1886 59.6485 14.3765 59.94 13.6418C60.2316 12.907 60.6397 12.2496 61.1451 11.7083C61.6699 11.1669 62.3113 10.7222 63.0304 10.3935C63.769 10.0648 64.5854 9.91009 65.4989 9.91009C66.4124 9.91009 67.2482 10.0648 67.9673 10.3935C68.7059 10.7222 69.3279 11.1669 69.8527 11.7083C70.3775 12.2496 70.7856 12.907 71.0577 13.6418C71.3299 14.3765 71.4853 15.1886 71.4853 16.02Z\" fill=\"white\"/>\n<path d=\"M93.0988 7.64789H90.6109V24.2954H100.66V22.0719H93.0988V7.64789Z\" fill=\"white\"/>\n<path d=\"M104.625 7.64789H102.137V24.3147H104.625V7.64789Z\" fill=\"white\"/>\n<path d=\"M123.653 22.0719V17.0254H131.467V14.7825H123.653V9.89076H132.03V7.64789H121.165V24.2954H132.458V22.0719H123.653Z\" fill=\"white\"/>\n<path d=\"M86.7819 18.7076L75.567 7.64789V24.2954H77.8994V13.3711L89.1338 24.2954V7.64789H86.7819V18.7076Z\" fill=\"white\"/>\n<path d=\"M117.336 18.7849L106.102 7.64789V24.2954H108.454V13.4484L119.669 24.2181V7.64789H117.336V18.7849Z\" fill=\"white\"/>\n<path d=\"M29.9296 19.4804V19.5771C29.9296 19.6157 29.9296 19.6544 29.949 19.6737V19.7511C29.9296 20.6018 29.7158 21.3172 29.3076 21.8973C28.88 22.4773 28.3358 22.9607 27.6749 23.3087C27.0141 23.6761 26.256 23.9275 25.4203 24.0821C24.5845 24.2368 23.7487 24.3142 22.913 24.3142H15.1383V14.724H15.0995C15.0995 14.724 9.22961 14.3373 7.84961 14.3373C7.84961 14.3373 11.7758 14.0086 15.0995 13.9506H15.1383L15.1189 7.62799H22.1355C22.9518 7.62799 23.7682 7.686 24.5845 7.78267C25.4008 7.89868 26.1589 8.09203 26.8197 8.40139C27.4805 8.71076 28.0442 9.15546 28.4524 9.71618C28.88 10.2769 29.0938 11.0116 29.0938 11.9397C29.0938 12.8871 28.8022 13.6799 28.1997 14.2986L28.0442 14.4533C28.0442 14.4533 27.9859 14.5306 27.8498 14.6466C27.6943 14.7626 27.5389 14.8786 27.3056 15.014C27.2862 15.0237 27.2716 15.0333 27.257 15.043C27.2424 15.0527 27.2279 15.0623 27.2084 15.072C25.9839 14.5306 24.6039 14.2213 23.5932 14.0472C24.1958 13.7959 24.4484 13.5445 24.5262 13.4479C24.5546 13.4195 24.5727 13.3912 24.5956 13.3553C24.6039 13.3422 24.613 13.328 24.6234 13.3125C24.7594 13.0805 24.8372 12.8098 24.8372 12.5004C24.8372 12.1717 24.7594 11.9204 24.6039 11.7077C24.429 11.495 24.2346 11.3403 23.982 11.2243C23.7099 11.089 23.4183 11.0116 23.0879 10.9536C22.7575 10.8956 22.427 10.8763 22.1161 10.8763H19.3366L19.3561 14.0666H19.4921C24.0014 14.3373 27.0724 15.1493 28.6079 16.5221C28.7634 16.6381 29.5797 17.3342 29.8518 18.649L29.8907 18.7843V18.8423C29.8907 18.8713 29.8955 18.9003 29.9004 18.9293C29.9053 18.9584 29.9101 18.9874 29.9101 19.0164V19.0937C29.9101 19.1614 29.915 19.2242 29.9198 19.287C29.9247 19.3499 29.9296 19.4127 29.9296 19.4804ZM25.4786 20.0411L25.498 20.0024C25.6341 19.7511 25.9645 18.9197 25.1482 17.8949C24.6234 17.2955 23.3794 16.4448 20.6 15.7101L18.8701 15.304L19.1034 15.5747L19.1423 15.6134C19.1473 15.6234 19.1563 15.6361 19.1678 15.6523C19.2007 15.6987 19.2546 15.7746 19.2978 15.9034L19.3561 16.0774C19.3577 16.092 19.3593 16.1065 19.3609 16.1209C19.3786 16.2777 19.3949 16.4224 19.3949 16.5995C19.3755 17.1215 19.3561 19.6351 19.3561 20.7372V21.0852L19.5116 21.1045H22.9713C23.2822 21.1045 23.6127 21.0659 23.9431 21.0079C24.2735 20.9499 24.5651 20.8339 24.8177 20.6792C25.0704 20.5245 25.2842 20.3311 25.4591 20.0798C25.4591 20.0798 25.4786 20.0605 25.4786 20.0411Z\" fill-rule=\"evenodd\" clip-rule=\"evenodd\" fill=\"#EE3535\"/>\n<path d=\"M31.3484 24.3142V7.64732H42.5439V11.031H35.2163V14.1826H42.1552V17.4115H35.2357V20.8725H42.9715V24.3142H31.3484Z\" fill=\"#EE3535\"/>\n<path d=\"M58.0348 9.2908C58.7151 8.63341 59.4926 8.09203 60.3672 7.64732H44.0211V11.089H48.7247V24.3142H52.7481V11.089H56.5965C57.0047 10.4316 57.4906 9.83219 58.0348 9.2908Z\" fill=\"#EE3535\"/>\n";
 const base=root.querySelector('#full-logo-base'),colour=root.querySelector('#full-logo-colour');
 base.innerHTML=logoMarkup;colour.innerHTML=logoMarkup;
 base.querySelectorAll('path').forEach(p=>p.setAttribute('fill','#262626'));
 const NS='http://www.w3.org/2000/svg',a=root.querySelector('#full-inner-route'),b=root.querySelector('#full-outer-route');
 const split=a.getTotalLength(),total=split+b.getTotalLength(),boundary=split/total;
 const orbitProbe=document.createElementNS(NS,'path');
 orbitProbe.setAttribute('d','M8 14 C15 14 27 14 27 20 C27 25 16 26 16 20 L16 11 C16 5 27 6 27 11 C27 16 20 16 19 14');
 const orbitEnd=orbitProbe.getTotalLength()/total;
 const samples=[];
 for(let i=0;i<2400;i++){const l=i/2400*total,p=l<split?a.getPointAtLength(l):b.getPointAtLength(l-split);samples.push({x:p.x,y:p.y});}
 // Round the path joins while preserving the B silhouette and a closed loop.
 for(let pass=0;pass<4;pass++){
  const copy=samples.map(p=>({...p}));
  for(let i=0;i<samples.length;i++){
   const prev=copy[(i-5+copy.length)%copy.length],next=copy[(i+5)%copy.length];
   samples[i]={x:(prev.x+copy[i].x*6+next.x)/8,y:(prev.y+copy[i].y*6+next.y)/8};
  }
 }
 const point=t=>{const z=((t%1+1)%1)*samples.length,i=Math.floor(z),p=samples[i],q=samples[(i+1)%samples.length],f=z-i;return {x:p.x+(q.x-p.x)*f,y:p.y+(q.y-p.y)*f};};
 const smooth=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v)};
 const mask=root.querySelector('#liquid-reveal'),flight=root.querySelector('#full-logo-flight');
 const segments=Array.from({length:150},()=>[mask,flight].map(g=>{const p=document.createElementNS(NS,g===mask?'circle':'path');g.appendChild(p);p.setAttribute('stroke-linejoin','round');if(g===flight){p.setAttribute('stroke','#ee3535');p.setAttribute('stroke-width','.035');}return p}));
 const drops=Array.from({length:11},()=>{const e=document.createElementNS(NS,'path');flight.appendChild(e);return e});
 let phase=.025,last=0,raf=0,paused=false,duration=Number(host.getAttribute("duration"))||2400,visible=true;
 const media=matchMedia('(prefers-reduced-motion:reduce)');
 function draw(){
  if(media.matches){colour.removeAttribute('mask');flight.style.display='none';return;}
  colour.setAttribute('mask','url(#full-liquid-mask)');flight.style.display='';
  const tail=.42;
  segments.forEach((pair,j)=>{
   const u0=j/segments.length,u1=(j+1)/segments.length,ps=[];
   for(const u of [u0,u1]){const t=phase-tail*(1-u),p=point(t),lo=point(t-.002),hi=point(t+.002),dx=hi.x-lo.x,dy=hi.y-lo.y,len=Math.hypot(dx,dy)||1,q=(t%1+1)%1;
    const gate=smooth(q/.045)*smooth((boundary-q)/.055);
    const width=3.0+1.1*gate,r=width/2*Math.pow(Math.max(0,Math.sin(Math.PI*u)),1.05);
    ps.push({x:p.x,y:p.y,nx:-dy/len*r,ny:dx/len*r});
   }
   const [p,q]=ps,d=`M${p.x+p.nx} ${p.y+p.ny}L${q.x+q.nx} ${q.y+q.ny}L${q.x-q.nx} ${q.y-q.ny}L${p.x-p.nx} ${p.y-p.ny}Z`;
   const t=((phase-tail*(1-(u0+u1)/2))%1+1)%1;
   const intensity=smooth(u0/.68);
   const centre=point(t),u=(u0+u1)/2;
   // A continuous rounded liquid front reveals the actual letter geometry.
   // The fine external crescent has its own width, independent of the fill mask.
   const front=smooth((1-u)/.13);
   const opening=smooth((t-orbitEnd)/.055);
   const radius=(3.6+19.4*opening)*front;
   pair[0].setAttribute('cx',centre.x);pair[0].setAttribute('cy',centre.y);
   pair[0].setAttribute('r',radius);
   pair[0].setAttribute('opacity',String(intensity*smooth((boundary+.018-t)/.028)));
   pair[1].setAttribute('d',d);
   pair[1].setAttribute('opacity',String(intensity*smooth((t-boundary)/.025)*smooth((1-t)/.045)));

  });
  drops.forEach((el,j)=>{
   const birth=boundary-.13+j*.040,life=.20+(j%3)*.018,age=(phase-birth+1)%1;
   if(age>life){el.setAttribute('opacity','0');return;}
   const u=age/life,p=point(birth),q=point(birth+.002),len=Math.hypot(q.x-p.x,q.y-p.y)||1,dx=(q.x-p.x)/len,dy=(q.y-p.y)/len;
   const x=p.x+dx*u*(4+j%4),y=p.y+dy*u*(4+j%4)+(j%2?1:-1)*Math.sin(u*Math.PI/2)*(6+j%4*2)+u*u*2;
   const r=(1.25+(j%3)*.52)*Math.pow(Math.sin(Math.PI*u),.65);
   el.setAttribute('d','M0 -1 C.12 -.24 .24 -.12 1 0 C.24 .12 .12 .24 0 1 C-.12 .24 -.24 .12 -1 0 C-.24 -.12 -.12 -.24 0 -1Z');
   el.setAttribute('fill',j%3===0?'#fff':'#ee3535');
   el.setAttribute('transform',`translate(${x} ${y}) rotate(${j*17+u*18}) scale(${r})`);el.setAttribute('opacity',String(smooth(u/.10)*(1-smooth((u-.55)/.45))));

  });
 }
 function tick(t){if(!root.isConnected){cancelAnimationFrame(raf);return;}if(last)phase=(phase+Math.min(t-last,50)/duration)%1;last=t;draw();raf=requestAnimationFrame(tick);}
 function sync(){cancelAnimationFrame(raf);raf=0;last=0;draw();if(!paused&&visible&&!document.hidden&&!media.matches)raf=requestAnimationFrame(tick);}

 const visibility=()=>sync();
 media.addEventListener('change',sync);document.addEventListener('visibilitychange',visibility);
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync()});observer.observe(host);
 host.pause=()=>{paused=true;sync()};host.play=()=>{paused=false;sync()};
 sync();
 return ()=>{cancelAnimationFrame(raf);observer.disconnect();media.removeEventListener('change',sync);document.removeEventListener('visibilitychange',visibility);};
}
class BetOnlineLoader extends HTMLElement {
 connectedCallback(){
  if(this._cleanup)return;
  if(!this.shadowRoot)this.attachShadow({mode:'open'});
  this.shadowRoot.innerHTML="<style>:host{display:block;width:var(--loader-width,320px);max-width:100%;background:transparent}svg{display:block;width:100%;height:auto;overflow:visible}</style><div><svg viewBox=\"-14 -18 173 70\" role=\"img\" aria-label=\"BetOnline liquid loading animation\"><defs><mask id=\"full-liquid-mask\" maskUnits=\"userSpaceOnUse\" x=\"-10\" y=\"-8\" width=\"165\" height=\"54\"><rect x=\"-10\" y=\"-8\" width=\"165\" height=\"54\" fill=\"black\"/><g id=\"liquid-reveal\" fill=\"white\"></g></mask><path id=\"full-inner-route\" d=\"M8 14 C15 14 27 14 27 20 C27 25 16 26 16 20 L16 11 C16 5 27 6 27 11 C27 16 20 16 19 14 C26 11 33 12 40 16 C49 22 58 23 68 16 S90 7 101 16 S123 25 133 16\"/><path id=\"full-outer-route\" d=\"M133 16 C145 3 151 18 137 27 C114 42 38 39 12 29 C3 25 2 14 8 14\"/></defs><g id=\"full-logo-base\"></g><g id=\"full-logo-colour\" mask=\"url(#full-liquid-mask)\"></g><g id=\"full-logo-flight\" fill=\"#ee3535\"></g></svg></div>";
  this._cleanup=mount(this.shadowRoot.querySelector('div'),this);
 }
 disconnectedCallback(){if(this._cleanup)this._cleanup();this._cleanup=null;}
}
customElements.define('betonline-loader',BetOnlineLoader);
})();
