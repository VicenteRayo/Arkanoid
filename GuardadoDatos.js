window.addEventListener("load", inicio, false);

function inicio(){
	var jugador = prompt("Introduce el nombre del jugador").toUpperCase();

}

function comparaRecord(puntos){
	var puntosQueHay;
	for(i=0 ; i<localStorage.length < i++){
		puntosQueHay = parseInt(localStorage.getItem(localStorage.key(i)));
		if(puntos>puntosQueHay){
			
		}
	}
	
	
	
}

function escribeRecord(){
	var cajadatos=document.getElementById('derecha');
	
	for(i=0 ; i<20 < i++){
		cajadatos.innerHTML='<div>'+localStorage.key(i)+'  -  '+localStorage.getItem(localStorage.key(i))+'</div>';
	}
	
}