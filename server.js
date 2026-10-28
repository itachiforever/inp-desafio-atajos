'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const rooms=new Map();
const questions=[
['F12','En Word, F12 abre «Guardar como».',['Verdadero','Falso'],0,'En Word, F12 abre Guardar como.'],
['Alt + F4','Alt + F4 apaga directamente el ordenador.',['Verdadero','Falso'],1,'Cierra la ventana activa; en el escritorio puede abrir el diálogo de apagado.'],
['Ctrl + C','¿Para qué sirve Ctrl + C?',['Copiar','Pegar','Cortar'],0,'Copia el contenido seleccionado.'],
['Ctrl + X','Ctrl + X corta el texto seleccionado.',['Verdadero','Falso'],0,'Corta el texto seleccionado.'],
['Ctrl + V','Ctrl + V sirve para copiar un texto.',['Verdadero','Falso'],1,'Ctrl + V pega el contenido copiado.'],
['Ctrl + Z','¿Para qué sirve Ctrl + Z?',['Deshacer','Guardar','Pegar'],0,'Deshace la última acción.'],
['Ctrl + N','En Word en español, Ctrl + N aplica negrita.',['Verdadero','Falso'],0,'En Word en español, Ctrl + N aplica negrita.'],
['Alt + Tab','Alt + Tab permite cambiar entre ventanas abiertas.',['Verdadero','Falso'],0,'Permite cambiar entre ventanas.'],
['Ctrl + G','En Word en español, ¿qué hace Ctrl + G?',['Guardar','Copiar','Cerrar'],0,'Guarda el documento.'],
['Ctrl + E','En Word en español, Ctrl + E selecciona todo.',['Verdadero','Falso'],0,'Selecciona todo el contenido.'],
['Supr','Supr borra el carácter a la izquierda del cursor.',['Verdadero','Falso'],1,'Supr borra a la derecha; Retroceso a la izquierda.'],
['Enter','¿Qué hace Enter al escribir?',['Nuevo párrafo o confirmar','Copiar','Deshacer'],0,'Crea un párrafo o confirma una acción.'],
['Ctrl + P','Ctrl + P suele abrir la impresión.',['Verdadero','Falso'],0,'Es un atajo habitual para imprimir.'],
['Ctrl + F','Ctrl + F suele abrir la búsqueda.',['Verdadero','Falso'],0,'Permite buscar texto en muchas aplicaciones.'],
['Retroceso','Retroceso elimina el carácter a la izquierda.',['Verdadero','Falso'],0,'Borra el carácter anterior al cursor.'],
['Esc','¿Para qué sirve normalmente Esc?',['Cancelar o salir','Pegar','Guardar'],0,'Cancela o sale de una operación.'],
['Inicio','Inicio suele llevar el cursor al principio de la línea.',['Verdadero','Falso'],0,'Desplaza el cursor al inicio de la línea.'],
['Fin','Fin suele llevar el cursor al final de la línea.',['Verdadero','Falso'],0,'Desplaza el cursor al final de la línea.'],
['Ctrl + B','Ctrl + B abre Buscar en Word en español.',['Verdadero','Falso'],0,'En Word en español suele abrir Buscar.'],
['Tab','Tab avanza al siguiente campo de un formulario.',['Verdadero','Falso'],0,'Permite pasar al siguiente campo.'],
['Mayús','Mayús permite escribir mayúsculas mientras se pulsa.',['Verdadero','Falso'],0,'Permite introducir letras mayúsculas.'],
['Ctrl + Y','Ctrl + Y puede rehacer una acción en muchas aplicaciones.',['Verdadero','Falso'],0,'En muchas aplicaciones permite rehacer.'],
['Ctrl + X','¿Qué acción realiza Ctrl + X?',['Cortar','Pegar','Deshacer'],0,'Corta el contenido seleccionado.'],
['Ctrl + V','¿Qué acción realiza Ctrl + V?',['Pegar','Copiar','Imprimir'],0,'Pega el contenido del portapapeles.']
];
const json=(res,status,obj)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(obj));};
const random=n=>crypto.randomInt(n);
const newCode=()=>{let s;do{s=crypto.randomBytes(4).toString('hex').slice(0,6).toUpperCase()}while(rooms.has(s));return s};
function publicRoom(r){return {code:r.code,status:r.status,host:r.host,players:r.players.map(({id,name,score,turns})=>({id,name,score,turns})),turn:r.turn,direction:r.direction,dice:r.dice,question:r.question?{key:r.question.key,prompt:r.question.prompt,options:r.question.options}:null,answerer:r.answerer,pending:r.pending,awaitNext:r.awaitNext,lastAnswer:r.lastAnswer,message:r.message,version:r.version};}
function advance(r){r.players[r.turn].turns++;if(r.players.every(p=>p.turns>=3)){r.status='finished';r.message='¡Partida terminada!';r.dice=null;return;}for(let step=1;step<=r.players.length;step++){const idx=(r.turn+r.direction*step+r.players.length*4)%r.players.length;if(r.players[idx].turns<3){r.turn=idx;break;}}r.dice=null;r.answerer=null;r.pending=0;r.awaitNext=false;}
function question(r){if(!r.deck.length){r.deck=questions.map((_,i)=>i);for(let i=r.deck.length-1;i>0;i--){let j=random(i+1);[r.deck[i],r.deck[j]]=[r.deck[j],r.deck[i]];}}const q=questions[r.deck.pop()];r.question={key:q[0],prompt:q[1],options:q[2],correct:q[3],explanation:q[4]};r.lastAnswer=null;}
function processAction(body){const op=String(body.op||'');let r;
if(op==='create'){const name=String(body.name||'').trim().slice(0,24);if(!name)throw Error('Introduce tu nombre.');const code=newCode(),token=crypto.randomBytes(24).toString('hex');r={code,status:'lobby',host:1,players:[{id:1,name,score:0,turns:0,token}],turn:0,direction:1,dice:null,question:null,answerer:null,pending:0,reverse:false,awaitNext:false,lastAnswer:null,deck:[],message:'Sala creada. Comparte el código.',version:1,updated:Date.now()};rooms.set(code,r);return {room:publicRoom(r),id:1,token};}
const code=String(body.code||'').trim().toUpperCase();r=rooms.get(code);if(!r)throw Error('Sala no encontrada o caducada.');r.updated=Date.now();
if(op==='join'){const name=String(body.name||'').trim().slice(0,24);if(!name)throw Error('Introduce tu nombre.');if(r.status!=='lobby')throw Error('La partida ya ha empezado.');if(r.players.length>=12)throw Error('Máximo 12 jugadores.');const id=Math.max(...r.players.map(p=>p.id))+1,token=crypto.randomBytes(24).toString('hex');r.players.push({id,name,score:0,turns:0,token});r.message=name+' se ha unido.';r.version++;return {room:publicRoom(r),id,token};}
const me=r.players.find(p=>p.token===body.token);if(!me)throw Error('Acceso no válido.');if(op==='state')return {room:publicRoom(r),id:me.id};
const active=r.players[r.turn];
if(op==='start'){if(me.id!==r.host||r.status!=='lobby'||r.players.length<2)throw Error('El anfitrión debe iniciar con al menos dos jugadores.');r.status='playing';r.message='¡Comienza la partida!';}
else if(op==='roll'){if(r.status!=='playing'||r.question||r.pending||r.awaitNext||me.id!==active.id)throw Error('No puedes lanzar ahora.');const face=random(6)+1;r.dice=face;if(face===1){r.message=active.name+' saca 1: salta turno.';advance(r);}else if(face===6){r.message=active.name+' saca 6: ¡vuelve a tirar!';}else if(face===3){r.pending=3;r.message=active.name+' elige quién responde.';}else{r.pending=face===5?2:1;r.reverse=face===4;r.answerer=me.id;r.message=active.name+' saca '+face+'.';question(r);}}
else if(op==='choose'){if(me.id!==active.id||r.pending!==3||r.question)throw Error('No puedes elegir ahora.');const target=Number(body.target);if(target===me.id||!r.players.some(p=>p.id===target))throw Error('Elige otro jugador.');r.answerer=target;r.pending=1;r.message='Responde '+r.players.find(p=>p.id===target).name+'.';question(r);}
else if(op==='answer'){if(!r.question||r.answerer!==me.id||r.awaitNext)throw Error('No te toca responder.');const index=Number(body.answer);if(!Number.isInteger(index)||index<0||index>=r.question.options.length)throw Error('Respuesta no válida.');const ok=index===r.question.correct;if(ok)me.score++;r.lastAnswer={ok,correct:r.question.options[r.question.correct],explanation:r.question.explanation,player:me.name};r.message=me.name+(ok?' acierta: +1 punto.':' falla.')+' '+r.question.explanation;r.question=null;r.pending--;r.awaitNext=true;}
else if(op==='next'){if(me.id!==active.id||!r.awaitNext)throw Error('No puedes avanzar ahora.');r.awaitNext=false;r.lastAnswer=null;if(r.pending>0){question(r);}else{if(r.reverse){r.direction*=-1;r.reverse=false;}advance(r);}}
else throw Error('Acción desconocida.');r.version++;return {room:publicRoom(r),id:me.id};}
const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');if(req.method==='GET'&&url.pathname==='/health')return json(res,200,{ok:true});if(req.method==='POST'&&url.pathname==='/api'){let raw='';req.on('data',chunk=>{raw+=chunk;if(raw.length>10000)req.destroy();});req.on('end',()=>{try{json(res,200,{ok:true,...processAction(JSON.parse(raw))});}catch(e){json(res,400,{ok:false,error:e.message});}});return;}
if(req.method!=='GET')return json(res,405,{error:'Método no permitido'});const name=url.pathname==='/'?'index.html':url.pathname.slice(1);if(!['index.html','app.js','style.css'].includes(name)){res.writeHead(404);return res.end('No encontrado');}const file=path.join(__dirname,'public',name);fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end();}res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript; charset=utf-8':name.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8'});res.end(data);});});
setInterval(()=>{for(const [code,r] of rooms)if(Date.now()-r.updated>4*60*60*1000)rooms.delete(code);},600000).unref();
server.listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('INP Desafío de atajos listo en puerto',process.env.PORT||3000));
