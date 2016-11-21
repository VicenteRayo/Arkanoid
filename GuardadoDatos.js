window.addEventListener("load", inicio, false);

var jugador;
var jugadores = new Array();

function inicio(){		//Se carga al inicio del juego y pide el nombre del jugador
	//localStorage.clear();
	cargaDatosEnArray();
	jugador = prompt("Introduce el nombre del jugador").toUpperCase();
	while ( jugador == ""){
		jugador = prompt("Introduce el nombre del jugador").toUpperCase();
	}
}

function Jugador(constructor_Jugador){		//Clase Jugador con el nombre y la puntuación
	this.nombre = constructor_Jugador.nombre;
	this.puntos = constructor_Jugador.puntos;
}

function comparaRecord(puntos){	//Al finalizar el juego se manda la puntuación que se ha hecho para compararla con la que había.
	var puntosQueHabia = localStorage.getItem(jugador);
	if (localStorage.getItem(jugador) === null){
		localStorage.setItem(jugador,puntos);
	}
	else if (puntos>puntosQueHabia){
		localStorage.setItem(jugador,puntos);	
	}
	limpiaPuntos();
	cargaDatosEnArray();
}

function cargaDatosEnArray(){	//Cargamos los datos de localStorage en un array de jugadores
	for(i=0 ; i<localStorage.length; i++){
		jugadores[i] = new Jugador({
			nombre : localStorage.key(i),
			puntos : parseInt(localStorage.getItem(localStorage.key(i)))			
		});
	}
	ordenarDatos();
}

function ordenarDatos(){	//Ordenamos las puntuaciones dentro del array
	let temp;
	if(jugadores.length>=2){
		for (a=0; a<jugadores.length; a++){
			for (e=0 ;e<jugadores.length; e++){
				if (jugadores[a].puntos > jugadores[e].puntos){
					temp = jugadores[a];
					jugadores[a]= jugadores[e];
					jugadores[e] = temp; 
				}            
			}
		}
	}
	escribeRecord();
}

function escribeRecord(){	
	let cajadatos=document.getElementById('huecoRecord');

	for(i=0 ; i<jugadores.length; i++){		
		cajadatos.innerHTML+='<h3>'+(i+1)+'   '+jugadores[i].nombre+'  -  '+jugadores[i].puntos+'</h3>';
	}	
}

function limpiaPuntos(){
	let cajadatos=document.getElementById('huecoRecord');
	cajadatos.innerHTML= '';	
}