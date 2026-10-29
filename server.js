'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const rooms=new Map();
for(let i=1;i<=8;i++){
 const code='PUBLICA'+i;
 rooms.set(code,{code,isPublic:true,isPermanent:true,status:'lobby',host:null,players:[],turn:0,direction:1,dice:null,question:null,answerer:null,pending:0,reverse:false,awaitNext:false,lastAnswer:null,deck:[],lastFace:null,rollSeq:0,message:'Sala pública '+i+' · esperando jugadores',version:1,updated:Date.now()});
}
const questions=[
 [
  "01 · Ctrl + C",
  "Ctrl + C sirve para copiar.",
  [
   "Verdadero",
   "Falso"
  ],
  0,
  "Respuesta: Verdadero."
 ],
 [
  "02 · F12",
  "¿Para qué sirve F12 en Word?",
  [
   "Guardar como",
   "Imprimir",
   "Cerrar Word"
  ],
  0,
  "Respuesta: Guardar como."
 ],
 [
  "03 · Ctrl + V",
  "Ctrl + V sirve para borrar.",
  [
   "Verdadero",
   "Falso"
  ],
  1,
  "Respuesta: Falso."
 ],
 [
  "04 · Ctrl + X",
  "¿Qué atajo sirve para cortar?",
  [
   "Ctrl + X",
   "Ctrl + C",
   "Ctrl + V"
  ],
  0,
  "Respuesta: Ctrl + X."
 ],
 [
  "05 · Alt + F4",
  "Alt + F4 apaga directamente el ordenador.",
  [
   "Verdadero",
   "Falso"
  ],
  1,
  "Respuesta: Falso."
 ],
 [
  "06 · Ctrl + Z",
  "¿Qué hace Ctrl + Z?",
  [
   "Deshacer",
   "Pegar",
   "Guardar"
  ],
  0,
  "Respuesta: Deshacer."
 ],
 [
  "07 · Ctrl + G",
  "Ctrl + G sirve para guardar en Word.",
  [
   "Verdadero",
   "Falso"
  ],
  0,
  "Respuesta: Verdadero."
 ],
 [
  "08 · Ctrl + C",
  "¿Qué atajo utilizamos para copiar?",
  [
   "Ctrl + C",
   "Ctrl + X",
   "Ctrl + G"
  ],
  0,
  "Respuesta: Ctrl + C."
 ],
 [
  "09 · Ctrl + N",
  "Ctrl + N pone el texto en negrita en Word.",
  [
   "Verdadero",
   "Falso"
  ],
  0,
  "Respuesta: Verdadero."
 ],
 [
  "10 · Ctrl + V",
  "¿Qué hace Ctrl + V?",
  [
   "Pegar",
   "Copiar",
   "Cortar"
  ],
  0,
  "Respuesta: Pegar."
 ],
 [
  "11 · F12",
  "F12 sirve para poner el texto en negrita.",
  [
   "Verdadero",
   "Falso"
  ],
  1,
  "Respuesta: Falso."
 ],
 [
  "12 · Ctrl + E",
  "¿Qué atajo utilizamos para seleccionar todo en Word?",
  [
   "Ctrl + E",
   "Ctrl + G",
   "Ctrl + N"
  ],
  0,
  "Respuesta: Ctrl + E."
 ],
 [
  "13 · Ctrl + X",
  "Ctrl + X sirve para cortar.",
  [
   "Verdadero",
   "Falso"
  ],
  0,
  "Respuesta: Verdadero."
 ],
 [
  "14 · Alt + F4",
  "¿Qué hace Alt + F4?",
  [
   "Cerrar la ventana activa",
   "Apagar directamente el ordenador",
   "Guardar el archivo"
  ],
  0,
  "Respuesta: Cerrar la ventana activa."
 ],
 [
  "15 · Ctrl + Z",
  "Ctrl + Z sirve para guardar.",
  [
   "Verdadero",
   "Falso"
  ],
  1,
  "Respuesta: Falso."
 ],
 [
  "16 · Ctrl + G",
  "¿Qué atajo utilizamos para guardar en Word?",
  [
   "Ctrl + G",
   "Ctrl + C",
   "Ctrl + E"
  ],
  0,
  "Respuesta: Ctrl + G."
 ],
 [
  "17 · Ctrl + E",
  "Ctrl + E sirve para seleccionar todo en Word.",
  [
   "Verdadero",
   "Falso"
  ],
  0,
  "Respuesta: Verdadero."
 ],
 [
  "18 · Ctrl + N",
  "¿Qué atajo pone el texto en negrita en Word?",
  [
   "Ctrl + N",
   "Ctrl + G",
   "Ctrl + E"
  ],
  0,
  "Respuesta: Ctrl + N."
 ],
 [
  "19 · Ctrl + C",
  "Ctrl + C borra el texto al copiarlo.",
  [
   "Verdadero",
   "Falso"
  ],
  1,
  "Respuesta: Falso."
 ],
 [
  "20 · Ctrl + V",
  "¿Qué atajo utilizamos para pegar?",
  [
   "Ctrl + V",
   "Ctrl + X",
   "Ctrl + C"
  ],
  0,
  "Respuesta: Ctrl + V."
 ],
 [
  "21 · Alt + F4",
  "Alt + F4 sirve para cerrar una ventana.",
  [
   "Verdadero",
   "Falso"
  ],
  0,
  "Respuesta: Verdadero."
 ],
 [
  "22 · F12",
  "¿Qué tecla abre «Guardar como» en Word?",
  [
   "F12",
   "F5",
   "Esc"
  ],
  0,
  "Respuesta: F12."
 ],
 [
  "23 · Ctrl + V",
  "Ctrl + V sirve para cortar.",
  [
   "Verdadero",
   "Falso"
  ],
  1,
  "Respuesta: Falso."
 ],
 [
  "24 · Ctrl + Z",
  "¿Qué atajo utilizamos para deshacer?",
  [
   "Ctrl + Z",
   "Ctrl + V",
   "Ctrl + G"
  ],
  0,
  "Respuesta: Ctrl + Z."
 ],
 [
  "25 · Ctrl + N",
  "Ctrl + N sirve para crear un documento nuevo en Word.",
  [
   "Verdadero",
   "Falso"
  ],
  1,
  "Respuesta: Falso."
 ],
 [
  "26 · Ctrl + X",
  "¿Qué hace Ctrl + X?",
  [
   "Cortar",
   "Copiar",
   "Pegar"
  ],
  0,
  "Respuesta: Cortar."
 ],
 [
  "27 · F12",
  "F12 permite guardar un archivo con otro nombre en Word.",
  [
   "Verdadero",
   "Falso"
  ],
  0,
  "Respuesta: Verdadero."
 ],
 [
  "28 · Ctrl + E",
  "¿Qué atajo sirve para seleccionar todo en Word?",
  [
   "Ctrl + E",
   "Ctrl + G",
   "Ctrl + N"
  ],
  0,
  "Respuesta: Ctrl + E."
 ],
 [
  "29 · Ctrl + G",
  "Ctrl + G sirve para copiar.",
  [
   "Verdadero",
   "Falso"
  ],
  1,
  "Respuesta: Falso."
 ],
 [
  "30 · Ctrl + N",
  "¿Qué atajo utilizamos para poner un texto en negrita en Word?",
  [
   "Ctrl + N",
   "Ctrl + G",
   "Ctrl + E"
  ],
  0,
  "Respuesta: Ctrl + N."
 ]
];
const json=(res,status,obj)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(obj));};
const random=n=>crypto.randomInt(n);
const newCode=()=>{let s;do{s=crypto.randomBytes(4).toString('hex').slice(0,6).toUpperCase()}while(rooms.has(s));return s};
// Normalizar a cuatro opciones, manteniendo la respuesta correcta.
function fourOptions(q){
 const opts=q[2].slice(); const correct=q[3];
 if(opts.length===2 && opts.includes('Verdadero') && opts.includes('Falso')){
   // Para verdadero/falso, dos botones grandes simétricos son más honestos que inventar opciones.
   return q;
 }
 if(opts.length===3){
   const prompt=q[1].toLowerCase();
   const pool=prompt.includes('f12')?['Seleccionar todo','Copiar el texto','Deshacer el último cambio']:
   prompt.includes('alt + f4')?['Abrir una nueva ventana','Seleccionar todo','Pegar el contenido']:
   prompt.includes('ctrl')?['Seleccionar todo','Abrir la ayuda','Pegar el contenido']:
   ['Seleccionar todo','Abrir un documento nuevo','Deshacer el último cambio'];
   const extra=pool.find(x=>!opts.some(o=>o.toLowerCase()===x.toLowerCase()));
   if(extra)opts.push(extra);
 }
 return [q[0],q[1],opts,correct,q[4]];
}
for(let i=0;i<questions.length;i++)questions[i]=fourOptions(questions[i]);
function publicRoom(r){return {round:r.status==='playing'?Math.min(3,1+Math.min(3,...r.players.map(p=>p.turns))):1,totalRounds:3,code:r.code,status:r.status,host:r.host,players:r.players.map(({id,name,score,turns})=>({id,name,score,turns})),turn:r.turn,direction:r.direction,dice:r.dice,lastFace:r.lastFace,isPublic:r.isPublic,rollSeq:r.rollSeq||0,question:r.question?{key:r.question.key,prompt:r.question.prompt,options:r.question.options}:null,answerer:r.answerer,pending:r.pending,awaitNext:r.awaitNext,lastAnswer:r.lastAnswer,message:r.message,version:r.version};}
function advance(r){r.players[r.turn].turns++;if(r.players.every(p=>p.turns>=3)){r.status='finished';r.message='¡Partida terminada!';r.dice=null;return;}for(let step=1;step<=r.players.length;step++){const idx=(r.turn+r.direction*step+r.players.length*4)%r.players.length;if(r.players[idx].turns<3){r.turn=idx;break;}}r.dice=null;r.answerer=null;r.pending=0;r.awaitNext=false;}
function question(r){if(!r.deck.length){r.status='finished';r.message='No quedan preguntas nuevas. Fin de la partida.';r.question=null;return;}const q=questions[r.deck.pop()];r.question={key:q[0],prompt:q[1],options:q[2],correct:q[3],explanation:q[4]};r.lastAnswer=null;}
function processAction(body){const op=String(body.op||'');let r;
if(op==='list'){return {rooms:[...rooms.values()].filter(x=>x.isPermanent).map(x=>({code:x.code,players:x.players.length,max:12,status:x.status}))};}
if(op==='create'){const name=String(body.name||'').trim().slice(0,24);if(!name)throw Error('Introduce tu nombre.');const isPublic=body.isPublic===true;const code=newCode(),token=crypto.randomBytes(24).toString('hex');r={code,isPublic,status:'lobby',host:token,players:[{id:token,name,score:0,turns:0,token}],turn:0,direction:1,dice:null,question:null,answerer:null,pending:0,reverse:false,awaitNext:false,lastAnswer:null,deck:[],lastFace:null,rollSeq:0,message:'Sala creada. Comparte el código.',version:1,updated:Date.now()};rooms.set(code,r);return {room:publicRoom(r),id:token,token};}
const code=String(body.code||'').trim().toUpperCase();r=rooms.get(code);if(!r)throw Error('Sala no encontrada o caducada.');r.updated=Date.now();
if(op==='join'){const name=String(body.name||'').trim().slice(0,24);if(!name)throw Error('Introduce tu nombre.');if(r.status==='finished')throw Error('La partida ha terminado.');if(r.players.length>=12)throw Error('Máximo 12 jugadores.');const id=crypto.randomUUID(),token=crypto.randomBytes(24).toString('hex');const joiningTurns=r.status==='playing'?Math.min(3,...r.players.map(p=>p.turns)):0;r.players.push({id,name,score:0,turns:joiningTurns,token});if(r.host===null)r.host=id;r.message=name+' se ha unido.';r.version++;return {room:publicRoom(r),id,token};}
const me=r.players.find(p=>p.token===body.token);if(!me)throw Error('Acceso no válido.');if(op==='leave'){
 const idx=r.players.findIndex(p=>p.id===me.id);
 r.players.splice(idx,1);
 if(r.players.length===0){
  if(r.isPermanent){r.status='lobby';r.host=null;r.turn=0;r.dice=null;r.question=null;r.pending=0;r.awaitNext=false;r.lastAnswer=null;r.message='Sala disponible';}
  else rooms.delete(code);
 }else{
  if(r.host===me.id)r.host=r.players[0].id;
  if(r.status==='playing'){
   if(idx<r.turn)r.turn--;
   else if(idx===r.turn){r.turn=Math.min(r.turn,r.players.length-1);r.question=null;r.pending=0;r.awaitNext=false;r.lastAnswer=null;r.dice=null;r.answerer=null;r.reverse=false;}
   if(r.answerer===me.id){r.question=null;r.pending=0;r.awaitNext=false;r.lastAnswer=null;r.answerer=null;r.dice=null;}
   if(r.players.length===1){r.status='lobby';r.players[0].turns=0;r.players[0].score=0;r.turn=0;r.message='Esperando otro jugador para empezar.';}
   else r.message=me.name+' ha salido. La partida continúa.';
  }
  else if(r.status==='finished'){r.status='lobby';r.message='Sala disponible para otra partida.';}
 }
 r.version++;return {left:true};
}
if(op==='state')return {room:publicRoom(r),id:me.id};
const active=r.players[r.turn];
if(op==='start'){if(me.id!==r.host||r.status!=='lobby'||r.players.length<2)throw Error('El anfitrión debe iniciar con al menos dos jugadores.');r.status='playing';r.deck=questions.map((_,i)=>i);for(let i=r.deck.length-1;i>0;i--){const j=random(i+1);[r.deck[i],r.deck[j]]=[r.deck[j],r.deck[i]];}r.message='¡Comienza la partida!';}
else if(op==='roll'){if(r.status!=='playing'||r.question||r.pending||r.awaitNext||me.id!==active.id)throw Error('No puedes lanzar ahora.');let face=random(6)+1;/* Evita el mismo resultado en dos lanzamientos consecutivos. */if(face===r.lastFace){face=random(5)+1;if(face>=r.lastFace)face++;}r.lastFace=face;r.dice=face;r.rollSeq=(r.rollSeq||0)+1;if(face===1){r.message=active.name+' saca 1: salta turno.';advance(r);}else if(face===6){r.message=active.name+' saca 6: ¡vuelve a tirar!';}else if(face===3){r.pending=3;r.message=active.name+' elige quién responde.';}else{r.pending=face===5?2:1;r.reverse=face===4;r.answerer=me.id;r.message=active.name+' saca '+face+'.';question(r);}}
else if(op==='choose'){if(me.id!==active.id||r.pending!==3||r.question)throw Error('No puedes elegir ahora.');const target=Number(body.target);if(target===me.id||!r.players.some(p=>p.id===target))throw Error('Elige otro jugador.');r.answerer=target;r.pending=1;r.message='Responde '+r.players.find(p=>p.id===target).name+'.';question(r);}
else if(op==='answer'){if(r.status!=='playing'||!r.question||r.answerer!==me.id||r.awaitNext||(r.dice!==3&&r.players[r.turn].id!==me.id))throw Error('No te toca responder.');const index=Number(body.answer);if(!Number.isInteger(index)||index<0||index>=r.question.options.length)throw Error('Respuesta no válida.');const ok=index===r.question.correct;if(ok)me.score++;r.lastAnswer={ok,correct:r.question.options[r.question.correct],explanation:r.question.explanation,player:me.name};r.message=me.name+(ok?' acierta: +1 punto.':' falla.');r.question=null;r.pending--;r.awaitNext=true;}
else if(op==='next'){if(me.id!==active.id||!r.awaitNext)throw Error('No puedes avanzar ahora.');r.awaitNext=false;r.lastAnswer=null;if(r.pending>0){question(r);}else{if(r.reverse){r.direction*=-1;r.reverse=false;}advance(r);}}
else throw Error('Acción desconocida.');r.version++;return {room:publicRoom(r),id:me.id};}
const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');if(req.method==='GET'&&url.pathname==='/health')return json(res,200,{ok:true});if(req.method==='POST'&&url.pathname==='/api'){let raw='';req.on('data',chunk=>{raw+=chunk;if(raw.length>10000)req.destroy();});req.on('end',()=>{try{json(res,200,{ok:true,...processAction(JSON.parse(raw))});}catch(e){json(res,400,{ok:false,error:e.message});}});return;}
if(req.method!=='GET')return json(res,405,{error:'Método no permitido'});const name=url.pathname==='/'?'index.html':url.pathname.slice(1);if(!['index.html','app.js','style.css'].includes(name)){res.writeHead(404);return res.end('No encontrado');}const file=path.join(__dirname,'public',name);fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end();}res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript; charset=utf-8':name.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8'});res.end(data);});});
setInterval(()=>{for(const [code,r] of rooms)if(!r.isPermanent&&Date.now()-r.updated>4*60*60*1000)rooms.delete(code);},600000).unref();
server.listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('INP Desafío de atajos listo en puerto',process.env.PORT||3000));
