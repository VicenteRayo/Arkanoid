window.addEventListener("load", inicio, false);

var jugador;
var jugadores = new Array();
var maxRecords = 10;	//Número de records que se muestran

function inicio(){		//Se carga al inicio del juego y pide el nombre del jugador
	//localStorage.clear();
	cargaDatosEnArray();
	jugador = "";
	while (jugador == ""){
		var nombre = prompt("Introduce el nombre del jugador");
		if (nombre === null){		//Si se cancela se juega como invitado
			nombre = "JUGADOR";
		}
		jugador = nombre.trim().toUpperCase().substring(0, 12);
	}
	cargaDatosEnArray();
}

function Jugador(constructor_Jugador){		//Clase Jugador con el nombre y la puntuación
	this.nombre = constructor_Jugador.nombre;
	this.puntos = constructor_Jugador.puntos;
}

function comparaRecord(puntos){	//Al finalizar el juego se manda la puntuación que se ha hecho para compararla con la que había. Devuelve true si es un record nuevo
	var esRecord = false;
	try{
		var puntosQueHabia = parseInt(localStorage.getItem(jugador));
		if (isNaN(puntosQueHabia) || puntos > puntosQueHabia){
			localStorage.setItem(jugador,puntos);
			esRecord = puntos > 0;
		}
	}catch(e){
		//Sin localStorage (modo privado) no se guardan los records
	}
	cargaDatosEnArray();
	return esRecord;
}

function cargaDatosEnArray(){	//Cargamos los datos de localStorage en un array de jugadores
	jugadores = new Array();
	try{
		for(var i=0 ; i<localStorage.length; i++){
			var puntos = parseInt(localStorage.getItem(localStorage.key(i)));
			if (!isNaN(puntos)){		//Solo nos interesan las claves que son puntuaciones
				jugadores.push(new Jugador({
					nombre : localStorage.key(i),
					puntos : puntos
				}));
			}
		}
	}catch(e){}
	ordenarDatos();
}

function ordenarDatos(){	//Ordenamos las puntuaciones dentro del array, de mayor a menor
	jugadores.sort(function(a, b){ return b.puntos - a.puntos; });
	limpiaPuntos();
	escribeRecord();
}

function escribeRecord(){
	let cajadatos=document.getElementById('huecoRecord');
	let html = '';

	for(var i=0 ; i<jugadores.length && i<maxRecords; i++){
		let clase = jugadores[i].nombre == jugador ? ' class="actual"' : '';
		html += '<h3'+clase+'><span class="pos">'+(i+1)+'</span><span class="nombre">'+escaparTexto(jugadores[i].nombre)+'</span><span class="pts">'+jugadores[i].puntos+'</span></h3>';
	}
	if (jugadores.length == 0){
		html = '<p class="vacio">TODAVIA NO HAY RECORDS</p>';
	}
	cajadatos.innerHTML = html;
}

function escaparTexto(texto){	//Evita que un nombre con < o > rompa la página
	return String(texto).replace(/[&<>"']/g, function(c){
		return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
	});
}

function limpiaPuntos(){
	let cajadatos=document.getElementById('huecoRecord');
	cajadatos.innerHTML= '';
}
