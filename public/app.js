'use strict';
const $=id=>document.getElementById(id);let diceRevealTimer=null;let diceGateKey=null;function clearDiceGate(){clearTimeout(diceRevealTimer);diceRevealTimer=null;diceGateKey=null;window.INP_DICE_V18?.cancel();}let lastDiceKey=null;let auth=JSON.parse(sessionStorage.getItem('inpAtajosSession')||'null'),room=null,busy=false,lastRenderedVersion=-1;
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function api(op,params={}){const response=await fetch('/api',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({op,...(auth||{}),...params})});const data=await response.json();if(!data.ok)throw Error(data.error||'Error de conexión');if(data.token){auth={code:data.room.code,token:data.token,id:data.id};sessionStorage.setItem('inpAtajosSession',JSON.stringify(auth));}room=data.room;if(data.left)return data;if(room.version!==lastRenderedVersion){lastRenderedVersion=room.version;render();}return data;}
async function action(op,params={}){if(busy)return;busy=true;try{$('error').textContent='';await api(op,params);}catch(e){$('error').textContent=e.message;if(op==='state'&&/no encontrada|caducada|no válido/i.test(e.message)){sessionStorage.removeItem('inpAtajosSession');auth=null;room=null;lastRenderedVersion=-1;clearDiceGate();$('game').hidden=true;$('login').hidden=false;}}finally{busy=false;}}
function button(label,op,params={},secondary=false){const b=document.createElement('button');b.textContent=label;if(secondary)b.className='secondary';b.addEventListener('click',()=>action(op,params));return b;}
function render(){if(!room)return;$('login').hidden=true;$('game').hidden=false;$('roomCode').textContent=room.code.startsWith('PUBLICA')?'PÚBLICA '+room.code.replace('PUBLICA',''):room.code;$('copy').hidden=room.code.startsWith('PUBLICA');$('message').textContent=room.message||'';const players=$('players');players.replaceChildren();room.players.forEach((p,i)=>{const el=document.createElement('div');el.className='player'+(room.turn===i&&room.status==='playing'?' active':'');el.innerHTML='<strong>'+escapeHtml(p.name)+(p.id===auth.id?' (tú)':'')+'</strong><span class="small">⭐ '+p.score+' puntos · '+p.turns+'/3 turnos</span>';players.append(el);});const info=$('turnInfo'),a=$('actions');info.replaceChildren();a.replaceChildren();if(diceGateKey)a.classList.add('dice-wait');if(room.status==='lobby'){clearDiceGate();info.innerHTML='<p class="notice">'+(room.isPublic?'Sala pública: esperando jugadores.':'Sala privada: comparte el código para invitar.')+'</p>';if(auth.id===room.host)a.append(button('¡EMPEZAR PARTIDA!','start'));return;}
if(room.status==='finished'){clearDiceGate();info.innerHTML='<h2>🏆 ¡Fin de la partida!</h2><p>Clasificación final:</p>'+[...room.players].sort((x,y)=>y.score-x.score).map((p,i)=>'<p>'+(i+1)+'. '+escapeHtml(p.name)+' — '+p.score+' puntos</p>').join('');return;}
const current=room.players[room.turn],mine=current.id===auth.id;const turn=document.createElement('div');turn.className='turn';turn.textContent='Ronda '+(room.round||1)+'/'+(room.totalRounds||3)+' · Turno de '+current.name+' · Sentido '+(room.direction===1?'→':'←');info.append(turn);if(room.dice || (room.rollSeq && room.lastFace)){
 const face=room.dice||room.lastFace;const diceKey=room.code+':'+(room.rollSeq||0);const animateDie=lastDiceKey!==diceKey;lastDiceKey=diceKey;
 const d=document.createElement('div');d.className='dice';d.innerHTML='<div class="dice-stage dice-stage-v18" aria-label="Dado: '+face+'"></div><span class="dice-label">'+(['','Salta turno','¡Te toca responder!','Elige quién responde','Responde y cambia el sentido','¡Doble reto!','Tira otra vez'][face])+'</span>';info.append(d);
 const stage=d.querySelector('.dice-stage');const start=()=>{if(window.INP_DICE_V18){window.INP_DICE_V18.show(stage,face,animateDie,()=>{if(diceGateKey===diceKey){diceGateKey=null;clearTimeout(diceRevealTimer);a.classList.remove('dice-wait');}});}else{stage.textContent='🎲 '+face;diceGateKey=null;a.classList.remove('dice-wait');}};
 if(animateDie){diceGateKey=diceKey;a.classList.add('dice-wait');clearTimeout(diceRevealTimer);diceRevealTimer=setTimeout(()=>{if(diceGateKey===diceKey){diceGateKey=null;a.classList.remove('dice-wait');}},2800);}
 if(window.INP_DICE_V18)start();else window.addEventListener('inp-dice-ready',()=>{if(stage.isConnected)start();},{once:true});
}

if(room.lastAnswer){const el=document.createElement('p');el.className='notice';el.textContent=(room.lastAnswer.ok?'✅ ¡Correcto!':'❌ Incorrecto.')+' Respuesta: '+room.lastAnswer.correct+'. '+room.lastAnswer.explanation;info.append(el);if(mine&&room.awaitNext)a.append(button('CONTINUAR','next'));return;}
if(room.question){const q=document.createElement('div');q.className='question';q.innerHTML='<h2>🎯 Pregunta</h2><p>'+escapeHtml(room.question.prompt)+'</p>';const canAnswer=room.answerer===auth.id;room.question.options.forEach((option,i)=>{const b=button(option,'answer',{answer:i});b.className='answer';b.disabled=!canAnswer;q.append(b);});if(!canAnswer){const p=document.createElement('p');p.textContent='Responde '+(room.players.find(p=>p.id===room.answerer)?.name||'otro jugador');q.append(p);}a.append(q);return;}
if(room.pending===3){if(mine){const p=document.createElement('p');p.textContent='Elige a otro jugador para que responda:';a.append(p);room.players.filter(p=>p.id!==auth.id).forEach(p=>a.append(button(p.name,'choose',{target:p.id})));}else{a.textContent='Esperando a que el jugador elija quién responde…';}return;}
if(mine)a.append(button('🎲 LANZAR DADO','roll'));else a.textContent='Esperando el lanzamiento del dado…';}
$('continueName').onclick=()=>{const name=$('name').value.trim();if(!name){$('error').textContent='Escribe primero tu nombre';$('name').focus();return;}$('error').textContent='';$('welcomeName').textContent=name;$('stepName').hidden=true;$('stepRooms').hidden=false;};$('backName').onclick=()=>{$('stepRooms').hidden=true;$('stepName').hidden=false;};$('name').addEventListener('keydown',e=>{if(e.key==='Enter')$('continueName').click()});$('code').addEventListener('keydown',e=>{if(e.key==='Enter')$('join').click()});$('create').onclick=()=>action('create',{name:$('name').value,isPublic:false});$('createPublic').onclick=()=>{$('stepRooms').hidden=true;$('stepPublic').hidden=false;refreshPublicRooms();};$('backRooms').onclick=()=>{$('stepPublic').hidden=true;$('stepRooms').hidden=false;};$('refreshRooms').onclick=refreshPublicRooms;$('join').onclick=()=>action('join',{name:$('name').value,code:$('code').value});$('copy').onclick=()=>{if(navigator.clipboard)navigator.clipboard.writeText(room.code).catch(()=>{});};$('exitGame').onclick=async()=>{if(!confirm('¿Salir de la partida y volver al inicio?'))return;try{await api('leave');}catch(e){}sessionStorage.removeItem('inpAtajosSession');auth=null;room=null;lastRenderedVersion=-1;busy=false;$('game').hidden=true;$('login').hidden=false;$('stepRooms').hidden=true;$('stepPublic').hidden=true;$('stepName').hidden=false;lastDiceKey=null;clearDiceGate();$('error').textContent='Has salido de la partida. Puedes crear o entrar en otra sala.';};if(auth)action('state').then(()=>{}).catch(()=>{});setInterval(()=>{if(auth&&!busy&&room&&room.status!=='finished')api('state').catch(()=>{});},1300);

let roomsRefreshInFlight=false;
async function refreshPublicRooms(){
 if(roomsRefreshInFlight||$('stepPublic').hidden||auth)return;
 roomsRefreshInFlight=true;
 const list=$('publicRooms');
 try{
  const response=await fetch('/api',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({op:'list'})});
  const data=await response.json();
  if(!response.ok||!data.ok)throw Error(data.error||'Error de conexión');
  const rooms=data.rooms||[];
  if(!rooms.length){list.textContent='No se han podido cargar las salas.';return;}
  const existing=new Map([...list.querySelectorAll('[data-room]')].map(b=>[b.dataset.room,b]));
  for(const r of rooms){
   let b=existing.get(r.code);
   if(!b){b=document.createElement('button');b.className='public-room';b.dataset.room=r.code;b.type='button';list.append(b);}
   const state=r.status==='lobby'?'Esperando jugadores':r.status==='playing'?'Partida iniciada · entrar':'Partida finalizada';
   const label='🎮 Sala '+r.code.replace('PUBLICA','')+' · '+r.players+'/12 jugadores · '+state;
   if(b.textContent!==label)b.textContent=label;
   b.disabled=r.status==='finished'||r.players>=12;
   b.onclick=()=>action('join',{name:$('name').value,code:r.code});
   existing.delete(r.code);
  }
  for(const b of existing.values())b.remove();
 }catch(e){if(!list.children.length)list.textContent='No se pudieron consultar las salas.';}
 finally{roomsRefreshInFlight=false;}
}
setInterval(()=>{if(!auth&&!$('stepPublic').hidden)refreshPublicRooms();},7000);
