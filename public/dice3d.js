/* INP PLAY V18.2 — dado cúbico 3D CSS, autónomo y sin librerías externas.
   Resultado y acciones siguen determinados exclusivamente por el servidor. */
(()=>{'use strict';
let active=null,serial=0;
const orientations={1:[-16,-18],2:[-16,-108],3:[74,-18],4:[-106,-18],5:[-16,72],6:[-16,162]};
function cancel(){serial++;if(active){cancelAnimationFrame(active.raf);active=null;}}
function build(face){const cube=document.createElement('div');cube.className='die-cube';cube.dataset.value=String(face);for(let n=1;n<=6;n++){const side=document.createElement('div');side.className='cube-face cube-face-'+n;for(let k=0;k<n;k++)side.append(document.createElement('i'));cube.append(side);}return cube;}
function show(stage,face,animate,done){cancel();face=Number(face);if(!stage||!Number.isInteger(face)||face<1||face>6){done?.();return;}
 const cube=build(face);stage.replaceChildren(cube);const [rx,ry]=orientations[face];const id=++serial;
 function pose(x,y,z=0,up=0,scale=1){cube.style.setProperty('transform',`translateY(${-up}px) rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg) scale(${scale})`,'important');}
 if(!animate){pose(rx,ry);done?.();return;}
 const started=performance.now(),duration=2500;
 function frame(now){if(serial!==id||!cube.isConnected)return;const t=Math.min(1,(now-started)/duration),ease=1-Math.pow(1-t,2.5);
 // Tres vueltas enteras que terminan exactamente en la cara indicada.
 const angle=1080*(1-ease),x=rx+angle,y=ry+720*(1-ease),z=180*(1-ease);
 const up=t<.23?32*(t/.23):t<.76?32*(1-(t-.23)/.53)**2:t<.90?5*Math.sin((t-.76)/.14*Math.PI):0;
 pose(x,y,z,up,1+0.06*Math.sin(Math.PI*t));
 if(t<1){active.raf=requestAnimationFrame(frame);}else{pose(rx,ry);active=null;done?.();}}
 active={cube,raf:requestAnimationFrame(frame)};
}
window.INP_DICE_V18={show,cancel,check:(face)=>!!active&&Number(active.cube.dataset.value)===Number(face)};
window.dispatchEvent(new Event('inp-dice-ready'));
})();
