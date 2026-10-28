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
['Ctrl + V','¿Qué acción realiza Ctrl + V?',['Pegar','Copiar','Imprimir'],0,'Pega el contenido del portapapeles.'],
["Ctrl + A","En muchos programas, ¿qué hace Ctrl + A?",["Seleccionar todo", "Cerrar ventana", "Pegar"],0,"Respuesta correcta: Seleccionar todo."],
["Ctrl + S","En muchos programas, ¿qué hace Ctrl + S?",["Guardar", "Buscar", "Cortar"],0,"Respuesta correcta: Guardar."],
["Ctrl + O","En muchos programas, ¿qué hace Ctrl + O?",["Abrir archivo", "Imprimir", "Deshacer"],0,"Respuesta correcta: Abrir archivo."],
["Ctrl + W","¿Qué suele hacer Ctrl + W?",["Cerrar pestaña o documento", "Copiar", "Guardar"],0,"Respuesta correcta: Cerrar pestaña o documento."],
["Ctrl + T","En un navegador, ¿qué hace Ctrl + T?",["Nueva pestaña", "Actualizar", "Imprimir"],0,"Respuesta correcta: Nueva pestaña."],
["Ctrl + L","En un navegador, ¿qué hace Ctrl + L?",["Seleccionar barra de direcciones", "Cerrar pestaña", "Pegar"],0,"Respuesta correcta: Seleccionar barra de direcciones."],
["Ctrl + R","En un navegador, ¿qué hace Ctrl + R?",["Recargar página", "Cambiar ventana", "Copiar"],0,"Respuesta correcta: Recargar página."],
["Ctrl + D","En un navegador, ¿qué hace Ctrl + D?",["Guardar marcador", "Cerrar ventana", "Abrir descargas"],0,"Respuesta correcta: Guardar marcador."],
["Ctrl + J","En un navegador, ¿qué hace Ctrl + J?",["Abrir descargas", "Guardar página", "Pegar"],0,"Respuesta correcta: Abrir descargas."],
["Ctrl + H","En un navegador, ¿qué hace Ctrl + H?",["Abrir historial", "Abrir ayuda", "Seleccionar todo"],0,"Respuesta correcta: Abrir historial."],
["Ctrl + Shift + T","En un navegador, ¿qué hace Ctrl + Mayús + T?",["Reabrir pestaña cerrada", "Cerrar navegador", "Abrir nueva ventana"],0,"Respuesta correcta: Reabrir pestaña cerrada."],
["F5","En un navegador, ¿qué hace normalmente F5?",["Actualizar página", "Guardar archivo", "Copiar texto"],0,"Respuesta correcta: Actualizar página."],
["F11","En muchos navegadores, ¿qué hace F11?",["Pantalla completa", "Imprimir", "Buscar"],0,"Respuesta correcta: Pantalla completa."],
["Alt + Flecha izquierda","En un navegador, ¿qué hace Alt + flecha izquierda?",["Volver a la página anterior", "Abrir pestaña", "Borrar texto"],0,"Respuesta correcta: Volver a la página anterior."],
["Ctrl + +","En un navegador, ¿qué hace Ctrl y +?",["Aumentar zoom", "Cerrar pestaña", "Imprimir"],0,"Respuesta correcta: Aumentar zoom."],
["Ctrl + -","En un navegador, ¿qué hace Ctrl y -?",["Reducir zoom", "Guardar página", "Copiar"],0,"Respuesta correcta: Reducir zoom."],
["Ctrl + 0","En un navegador, ¿qué hace Ctrl + 0?",["Restablecer zoom", "Cerrar navegador", "Cambiar idioma"],0,"Respuesta correcta: Restablecer zoom."],
["Ctrl + Tab","¿Qué hace Ctrl + Tab en muchos navegadores?",["Pasar a la siguiente pestaña", "Copiar enlace", "Buscar"],0,"Respuesta correcta: Pasar a la siguiente pestaña."],
["Shift + Tab","En un formulario, ¿qué hace Mayús + Tab?",["Volver al campo anterior", "Enviar formulario", "Guardar"],0,"Respuesta correcta: Volver al campo anterior."],
["Barra espaciadora","¿Qué tecla introduce un espacio entre palabras?",["Barra espaciadora", "Supr", "Bloq Mayús"],0,"Respuesta correcta: Barra espaciadora."],
["Bloq Mayús","¿Para qué sirve Bloq Mayús?",["Activar mayúsculas", "Borrar texto", "Guardar"],0,"Respuesta correcta: Activar mayúsculas."],
["Flechas","¿Para qué sirven las teclas de dirección?",["Mover el cursor o selección", "Imprimir", "Cerrar"],0,"Respuesta correcta: Mover el cursor o selección."],
["Ctrl + Inicio","¿Qué suele hacer Ctrl + Inicio en un documento?",["Ir al comienzo", "Copiar", "Pegar"],0,"Respuesta correcta: Ir al comienzo."],
["Ctrl + Fin","¿Qué suele hacer Ctrl + Fin en un documento?",["Ir al final", "Guardar", "Buscar"],0,"Respuesta correcta: Ir al final."],
["Ctrl + Shift + Flecha","¿Qué permite Ctrl + Mayús + flecha en muchos editores?",["Seleccionar por palabras", "Abrir archivo", "Cerrar ventana"],0,"Respuesta correcta: Seleccionar por palabras."],
["Ctrl + Z","¿Qué combinación deshace el último cambio?",["Ctrl + Z", "Ctrl + V", "Alt + Tab"],0,"Respuesta correcta: Ctrl + Z."],
["Ctrl + C","¿Qué combinación copia una selección?",["Ctrl + C", "Ctrl + X", "Ctrl + P"],0,"Respuesta correcta: Ctrl + C."],
["Ctrl + X","¿Qué combinación corta una selección?",["Ctrl + X", "Ctrl + V", "Ctrl + F"],0,"Respuesta correcta: Ctrl + X."],
["Ctrl + V","¿Qué combinación pega un contenido copiado?",["Ctrl + V", "Ctrl + Z", "Ctrl + F"],0,"Respuesta correcta: Ctrl + V."],
["Alt + Tab","¿Qué combinación cambia entre ventanas abiertas?",["Alt + Tab", "Ctrl + P", "F12"],0,"Respuesta correcta: Alt + Tab."],
["Supr","¿Qué tecla borra a la derecha del cursor?",["Supr", "Retroceso", "Enter"],0,"Respuesta correcta: Supr."],
["Retroceso","¿Qué tecla borra a la izquierda del cursor?",["Retroceso", "Supr", "Tab"],0,"Respuesta correcta: Retroceso."],
["Ctrl + P","¿Qué combinación abre normalmente la impresión?",["Ctrl + P", "Ctrl + V", "Ctrl + X"],0,"Respuesta correcta: Ctrl + P."],
["Ctrl + F","¿Qué combinación permite buscar texto?",["Ctrl + F", "Ctrl + N", "Alt + F4"],0,"Respuesta correcta: Ctrl + F."],
["Enter","¿Qué tecla suele confirmar una opción?",["Enter", "Mayús", "Bloq Mayús"],0,"Respuesta correcta: Enter."],
["Esc","¿Qué tecla suele cancelar un cuadro de diálogo?",["Esc", "Tab", "F12"],0,"Respuesta correcta: Esc."],
["Ctrl + N (Word ES)","En Word en español, ¿qué aplica negrita?",["Ctrl + N", "Ctrl + E", "Ctrl + G"],0,"Respuesta correcta: Ctrl + N."],
["Ctrl + G (Word ES)","En Word en español, ¿qué guarda el documento?",["Ctrl + G", "Ctrl + B", "Ctrl + E"],0,"Respuesta correcta: Ctrl + G."],
["Ctrl + E (Word ES)","En Word en español, ¿qué selecciona todo?",["Ctrl + E", "Ctrl + X", "Ctrl + V"],0,"Respuesta correcta: Ctrl + E."],
["Ctrl + B (Word ES)","En Word en español, ¿qué abre la búsqueda?",["Ctrl + B", "Ctrl + N", "Ctrl + P"],0,"Respuesta correcta: Ctrl + B."],
["F12 (Word)","En Word, ¿qué tecla abre Guardar como?",["F12", "F5", "Esc"],0,"Respuesta correcta: F12."],
["Ctrl + U (navegador)","En muchos navegadores, ¿qué muestra Ctrl + U?",["Código fuente de página", "Descargas", "Nueva pestaña"],0,"Respuesta correcta: Código fuente de página."],
["Ctrl + Shift + N (navegador)","En Chrome o Edge, ¿qué abre Ctrl + Mayús + N?",["Ventana de incógnito", "Historial", "Impresión"],0,"Respuesta correcta: Ventana de incógnito."],
["Ctrl + Shift + P (Firefox)","En Firefox, ¿qué abre Ctrl + Mayús + P?",["Ventana privada", "Impresión", "Descargas"],0,"Respuesta correcta: Ventana privada."],
["Ctrl + PageDown","En muchas aplicaciones con pestañas, ¿qué hace Ctrl + Av Pág?",["Pestaña siguiente", "Cerrar aplicación", "Imprimir"],0,"Respuesta correcta: Pestaña siguiente."],
["Ctrl + PageUp","En muchas aplicaciones con pestañas, ¿qué hace Ctrl + Re Pág?",["Pestaña anterior", "Guardar", "Pegar"],0,"Respuesta correcta: Pestaña anterior."],
["Alt + F4","¿Qué combinación cierra la ventana activa?",["Alt + F4", "Ctrl + C", "F12"],0,"Respuesta correcta: Alt + F4."],
["Ctrl + Mayús + Esc","En Windows, ¿qué abre Ctrl + Mayús + Esc?",["Administrador de tareas", "Explorador", "Imprimir"],0,"Respuesta correcta: Administrador de tareas."]
,
// 30 preguntas adicionales aportadas por el docente
["Ctrl + C", "Ctrl + C sirve para copiar.", ["Verdadero", "Falso"], 0, "Ctrl + C copia la selección."],
["F12", "¿Para qué sirve F12 en Word?", ["Guardar como", "Imprimir", "Cerrar Word"], 0, "F12 abre Guardar como en Word."],
["Ctrl + V", "Ctrl + V sirve para borrar.", ["Verdadero", "Falso"], 1, "Ctrl + V pega el contenido."],
["Ctrl + X", "¿Qué atajo sirve para cortar?", ["Ctrl + X", "Ctrl + V", "Ctrl + C"], 0, "Ctrl + X corta la selección."],
["Alt + F4", "Alt + F4 apaga directamente el ordenador.", ["Verdadero", "Falso"], 1, "Alt + F4 cierra la ventana activa."],
["Ctrl + Z", "¿Qué hace Ctrl + Z?", ["Deshacer", "Guardar", "Pegar"], 0, "Ctrl + Z deshace la última acción."],
["Ctrl + G", "Ctrl + G sirve para guardar en Word en español.", ["Verdadero", "Falso"], 0, "En Word en español, Ctrl + G guarda."],
["Ctrl + C", "¿Qué atajo utilizamos para copiar?", ["Ctrl + C", "Ctrl + X", "Ctrl + V"], 0, "Ctrl + C copia la selección."],
["Ctrl + N", "Ctrl + N pone el texto en negrita en Word en español.", ["Verdadero", "Falso"], 0, "En Word en español, Ctrl + N aplica negrita."],
["Ctrl + V", "¿Qué hace Ctrl + V?", ["Pegar", "Copiar", "Cortar"], 0, "Ctrl + V pega el contenido."],
["F12", "F12 sirve para poner el texto en negrita.", ["Verdadero", "Falso"], 1, "F12 abre Guardar como en Word."],
["Ctrl + E", "¿Qué atajo utilizamos para seleccionar todo en Word en español?", ["Ctrl + E", "Ctrl + G", "Ctrl + N"], 0, "En Word en español, Ctrl + E selecciona todo."],
["Ctrl + X", "Ctrl + X sirve para cortar.", ["Verdadero", "Falso"], 0, "Ctrl + X corta la selección."],
["Alt + F4", "¿Qué hace Alt + F4?", ["Cerrar la ventana activa", "Apagar directamente el ordenador", "Copiar"], 0, "Alt + F4 cierra la ventana activa."],
["Ctrl + Z", "Ctrl + Z sirve para guardar.", ["Verdadero", "Falso"], 1, "Ctrl + Z deshace la última acción."],
["Ctrl + G", "¿Qué atajo utilizamos para guardar en Word en español?", ["Ctrl + G", "Ctrl + C", "Ctrl + E"], 0, "En Word en español, Ctrl + G guarda."],
["Ctrl + E", "Ctrl + E sirve para seleccionar todo en Word en español.", ["Verdadero", "Falso"], 0, "En Word en español, Ctrl + E selecciona todo."],
["Ctrl + N", "¿Qué atajo pone el texto en negrita en Word en español?", ["Ctrl + N", "Ctrl + G", "Ctrl + X"], 0, "En Word en español, Ctrl + N aplica negrita."],
["Ctrl + C", "Ctrl + C borra el texto al copiarlo.", ["Verdadero", "Falso"], 1, "Ctrl + C copia la selección."],
["Ctrl + V", "¿Qué atajo utilizamos para pegar?", ["Ctrl + V", "Ctrl + X", "Ctrl + Z"], 0, "Ctrl + V pega el contenido."],
["Alt + F4", "Alt + F4 sirve para cerrar una ventana.", ["Verdadero", "Falso"], 0, "Alt + F4 cierra la ventana activa."],
["F12", "¿Qué tecla abre «Guardar como» en Word?", ["F12", "F5", "Alt + F4"], 0, "F12 abre Guardar como en Word."],
["Ctrl + V", "Ctrl + V sirve para cortar.", ["Verdadero", "Falso"], 1, "Ctrl + V pega el contenido."],
["Ctrl + Z", "¿Qué atajo utilizamos para deshacer?", ["Ctrl + Z", "Ctrl + G", "Ctrl + N"], 0, "Ctrl + Z deshace la última acción."],
["Ctrl + N", "Ctrl + N sirve para crear un documento nuevo en Word en español.", ["Verdadero", "Falso"], 1, "En Word en español, Ctrl + N aplica negrita."],
["Ctrl + X", "¿Qué hace Ctrl + X?", ["Cortar", "Copiar", "Pegar"], 0, "Ctrl + X corta la selección."],
["F12", "F12 permite guardar un archivo con otro nombre en Word.", ["Verdadero", "Falso"], 0, "F12 abre Guardar como en Word."],
["Ctrl + E", "¿Qué atajo sirve para seleccionar todo en Word en español?", ["Ctrl + E", "Ctrl + G", "Ctrl + N"], 0, "En Word en español, Ctrl + E selecciona todo."],
["Ctrl + G", "Ctrl + G sirve para copiar en Word en español.", ["Verdadero", "Falso"], 1, "En Word en español, Ctrl + G guarda."],
["Ctrl + N", "¿Qué atajo utilizamos para poner un texto en negrita en Word en español?", ["Ctrl + N", "Ctrl + G", "Ctrl + X"], 0, "En Word en español, Ctrl + N aplica negrita."]];
const json=(res,status,obj)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(obj));};
const random=n=>crypto.randomInt(n);
const newCode=()=>{let s;do{s=crypto.randomBytes(4).toString('hex').slice(0,6).toUpperCase()}while(rooms.has(s));return s};
function publicRoom(r){return {code:r.code,status:r.status,host:r.host,players:r.players.map(({id,name,score,turns})=>({id,name,score,turns})),turn:r.turn,direction:r.direction,dice:r.dice,question:r.question?{key:r.question.key,prompt:r.question.prompt,options:r.question.options}:null,answerer:r.answerer,pending:r.pending,awaitNext:r.awaitNext,lastAnswer:r.lastAnswer,message:r.message,version:r.version};}
function advance(r){r.players[r.turn].turns++;if(r.players.every(p=>p.turns>=3)){r.status='finished';r.message='¡Partida terminada!';r.dice=null;return;}for(let step=1;step<=r.players.length;step++){const idx=(r.turn+r.direction*step+r.players.length*4)%r.players.length;if(r.players[idx].turns<3){r.turn=idx;break;}}r.dice=null;r.answerer=null;r.pending=0;r.awaitNext=false;}
function question(r){if(!r.deck.length){r.status='finished';r.message='No quedan preguntas nuevas. Fin de la partida.';r.question=null;return;}const q=questions[r.deck.pop()];r.question={key:q[0],prompt:q[1],options:q[2],correct:q[3],explanation:q[4]};r.lastAnswer=null;}
function processAction(body){const op=String(body.op||'');let r;
if(op==='create'){const name=String(body.name||'').trim().slice(0,24);if(!name)throw Error('Introduce tu nombre.');const code=newCode(),token=crypto.randomBytes(24).toString('hex');r={code,status:'lobby',host:1,players:[{id:1,name,score:0,turns:0,token}],turn:0,direction:1,dice:null,question:null,answerer:null,pending:0,reverse:false,awaitNext:false,lastAnswer:null,deck:[],lastFace:null,message:'Sala creada. Comparte el código.',version:1,updated:Date.now()};rooms.set(code,r);return {room:publicRoom(r),id:1,token};}
const code=String(body.code||'').trim().toUpperCase();r=rooms.get(code);if(!r)throw Error('Sala no encontrada o caducada.');r.updated=Date.now();
if(op==='join'){const name=String(body.name||'').trim().slice(0,24);if(!name)throw Error('Introduce tu nombre.');if(r.status!=='lobby')throw Error('La partida ya ha empezado.');if(r.players.length>=12)throw Error('Máximo 12 jugadores.');const id=Math.max(...r.players.map(p=>p.id))+1,token=crypto.randomBytes(24).toString('hex');r.players.push({id,name,score:0,turns:0,token});r.message=name+' se ha unido.';r.version++;return {room:publicRoom(r),id,token};}
const me=r.players.find(p=>p.token===body.token);if(!me)throw Error('Acceso no válido.');if(op==='state')return {room:publicRoom(r),id:me.id};
const active=r.players[r.turn];
if(op==='start'){if(me.id!==r.host||r.status!=='lobby'||r.players.length<2)throw Error('El anfitrión debe iniciar con al menos dos jugadores.');r.status='playing';const groups=new Map();questions.forEach((q,i)=>{const key=q[0].replace(/ \(.*?\)/g,'').trim().toLowerCase();if(!groups.has(key))groups.set(key,[]);groups.get(key).push(i);});r.deck=[...groups.values()].map(ids=>ids[random(ids.length)]);for(let i=r.deck.length-1;i>0;i--){const j=random(i+1);[r.deck[i],r.deck[j]]=[r.deck[j],r.deck[i]];}r.message='¡Comienza la partida!';}
else if(op==='roll'){if(r.status!=='playing'||r.question||r.pending||r.awaitNext||me.id!==active.id)throw Error('No puedes lanzar ahora.');let face=random(6)+1;/* Evita el mismo resultado en dos lanzamientos consecutivos. */if(face===r.lastFace){face=random(5)+1;if(face>=r.lastFace)face++;}r.lastFace=face;r.dice=face;if(face===1){r.message=active.name+' saca 1: salta turno.';advance(r);}else if(face===6){r.message=active.name+' saca 6: ¡vuelve a tirar!';}else if(face===3){r.pending=3;r.message=active.name+' elige quién responde.';}else{r.pending=face===5?2:1;r.reverse=face===4;r.answerer=me.id;r.message=active.name+' saca '+face+'.';question(r);}}
else if(op==='choose'){if(me.id!==active.id||r.pending!==3||r.question)throw Error('No puedes elegir ahora.');const target=Number(body.target);if(target===me.id||!r.players.some(p=>p.id===target))throw Error('Elige otro jugador.');r.answerer=target;r.pending=1;r.message='Responde '+r.players.find(p=>p.id===target).name+'.';question(r);}
else if(op==='answer'){if(!r.question||r.answerer!==me.id||r.awaitNext)throw Error('No te toca responder.');const index=Number(body.answer);if(!Number.isInteger(index)||index<0||index>=r.question.options.length)throw Error('Respuesta no válida.');const ok=index===r.question.correct;if(ok)me.score++;r.lastAnswer={ok,correct:r.question.options[r.question.correct],explanation:r.question.explanation,player:me.name};r.message=me.name+(ok?' acierta: +1 punto.':' falla.')+' '+r.question.explanation;r.question=null;r.pending--;r.awaitNext=true;}
else if(op==='next'){if(me.id!==active.id||!r.awaitNext)throw Error('No puedes avanzar ahora.');r.awaitNext=false;r.lastAnswer=null;if(r.pending>0){question(r);}else{if(r.reverse){r.direction*=-1;r.reverse=false;}advance(r);}}
else throw Error('Acción desconocida.');r.version++;return {room:publicRoom(r),id:me.id};}
const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');if(req.method==='GET'&&url.pathname==='/health')return json(res,200,{ok:true});if(req.method==='POST'&&url.pathname==='/api'){let raw='';req.on('data',chunk=>{raw+=chunk;if(raw.length>10000)req.destroy();});req.on('end',()=>{try{json(res,200,{ok:true,...processAction(JSON.parse(raw))});}catch(e){json(res,400,{ok:false,error:e.message});}});return;}
if(req.method!=='GET')return json(res,405,{error:'Método no permitido'});const name=url.pathname==='/'?'index.html':url.pathname.slice(1);if(!['index.html','app.js','style.css'].includes(name)){res.writeHead(404);return res.end('No encontrado');}const file=path.join(__dirname,'public',name);fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end();}res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript; charset=utf-8':name.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8'});res.end(data);});});
setInterval(()=>{for(const [code,r] of rooms)if(Date.now()-r.updated>4*60*60*1000)rooms.delete(code);},600000).unref();
server.listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('INP Desafío de atajos listo en puerto',process.env.PORT||3000));
