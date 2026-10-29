/* INP PLAY V18: dado WebGL, solo presentación; el servidor decide el resultado. */
(async()=>{
 let THREE;
 try { THREE=await import('https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js'); }
 catch(e){console.warn('Dado 3D no disponible:',e);return;}
 const normals=[new THREE.Vector3(1,0,0),new THREE.Vector3(-1,0,0),new THREE.Vector3(0,1,0),new THREE.Vector3(0,-1,0),new THREE.Vector3(0,0,1),new THREE.Vector3(0,0,-1)];
 const points={1:[[.5,.5]],2:[[.28,.28],[.72,.72]],3:[[.28,.28],[.5,.5],[.72,.72]],4:[[.28,.28],[.72,.28],[.28,.72],[.72,.72]],5:[[.28,.28],[.72,.28],[.5,.5],[.28,.72],[.72,.72]],6:[[.28,.25],[.72,.25],[.28,.5],[.72,.5],[.28,.75],[.72,.75]]};
 const material=Array.from({length:6},(_,i)=>{const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');x.fillStyle='#faf8f2';x.fillRect(0,0,512,512);x.fillStyle='#e91e8f';for(const [px,py] of points[i+1]){x.beginPath();x.arc(px*512,py*512,37,0,Math.PI*2);x.fill();}const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;return new THREE.MeshStandardMaterial({map,roughness:.34,metalness:0});});
 function geometry(){const g=new THREE.BoxGeometry(1,1,1,12,12,12),p=g.attributes.position,r=.11,v=new THREE.Vector3(),inner=new THREE.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);inner.set(THREE.MathUtils.clamp(v.x,-.5+r,.5-r),THREE.MathUtils.clamp(v.y,-.5+r,.5-r),THREE.MathUtils.clamp(v.z,-.5+r,.5-r));v.sub(inner).normalize().multiplyScalar(r).add(inner);p.setXYZ(i,v.x,v.y,v.z);}g.computeVertexNormals();return g;}
 let active=null,seq=0;
 function cancel(){seq++;if(active){active.resize.disconnect();active.renderer.dispose();active.mesh.geometry.dispose();active.renderer.domElement.remove();active=null;}}
 function show(el,face,animate,done){cancel();if(!el||!Number.isInteger(face)||face<1||face>6)return;let renderer;try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});}catch(e){console.warn(e);done?.();return;}renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;el.replaceChildren(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.1,30);camera.position.set(2.4,3.2,5);camera.lookAt(0,.2,0);scene.add(new THREE.AmbientLight(0xffffff,1.5));const light=new THREE.DirectionalLight(0xffffff,2.2);light.position.set(-3,7,5);light.castShadow=true;light.shadow.mapSize.set(512,512);scene.add(light);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(5,5),new THREE.ShadowMaterial({opacity:.27}));ground.rotation.x=-Math.PI/2;ground.position.y=-.55;ground.receiveShadow=true;scene.add(ground);
 const mesh=new THREE.Mesh(geometry(),material);mesh.castShadow=true;scene.add(mesh);
 const resize=new ResizeObserver(()=>{const w=Math.max(1,el.clientWidth),h=Math.max(1,el.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);});resize.observe(el);
 // Alineación matemática: la normal de la cara elegida apunta a la cámara.
 const target=new THREE.Quaternion().setFromUnitVectors(normals[face-1],camera.position.clone().normalize());
 const initial=active?.mesh.quaternion.clone()||new THREE.Quaternion();const spinAxis=new THREE.Vector3(.7,1,.4).normalize();const spin=new THREE.Quaternion(),q=new THREE.Quaternion();const started=performance.now(),duration=animate?2500:0,id=++seq;active={renderer,resize,mesh};
 function frame(now){if(id!==seq||!el.isConnected)return;const t=duration?Math.min(1,(now-started)/duration):1;const ease=1-Math.pow(1-t,3);const turn=4*Math.PI*2*ease;spin.setFromAxisAngle(spinAxis,turn);q.copy(initial).multiply(spin);const settle=Math.pow(Math.max(0,(t-.72)/.28),2);mesh.quaternion.copy(q).slerp(target,settle);if(t===1)mesh.quaternion.copy(target);
 const y=t<.2?1.15*(t/.2):t<.76?1.15*(1-(t-.2)/.56)**2:t<.85?.12*Math.sin((t-.76)/.09*Math.PI):0;mesh.position.y=y;renderer.render(scene,camera);if(t<1)requestAnimationFrame(frame);else done?.();}requestAnimationFrame(frame);
 }
 window.INP_DICE_V18={show,cancel,check:(face)=>{if(!active)return false;const world=normals[face-1].clone().applyQuaternion(active.mesh.quaternion);return world.dot(new THREE.Vector3(2.4,3.2,5).normalize())>.999;}};
 window.dispatchEvent(new Event('inp-dice-ready'));
})();
