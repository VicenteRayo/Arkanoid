window.addEventListener("load", iniciar, false);

var tiempoIntervalo = 10;
var tiempoCambioDeNivel = 10000;

var pantallaAncho = screen.width;
var pantallaAlto = screen.height;
var canvas;
var WIDTH = pantallaAncho/3;		//Ancho del canvas. 
var HEIGHT = pantallaAlto/100 *80;		//Alto del canvas.
var canvasMinX = 0;		//Posición X donde comienza el canvas en la página.
var canvasMaxX = 0;		//Posición X donde termina el canvas en la página.

var espacioPuntuaciones = HEIGHT/100*10;	//Espacio que dejo arriba para las puntuaciones y vidas

var bloques;
var bloquesNumeroFilas = 4;
var numeroBloques = 9;
var bloqueAncho = WIDTH / numeroBloques;
var bloqueAlto = (HEIGHT/100)*3;

var MiBarra;

var pelotas = new Array();		//Array donde almacenar las pelotas que se crean
var velocidadPelota = 7;		//Velocidad a la que se mueven las pelotas

var laseres = new Array();
var barraDisparo = 0; 
 
var VIDAS = 3;		//Número de vidas que tiene el jugador
var puntos = 0;
var pausado = false;		//Variable para controlar el paused del juego.
var GAMEOVER = false;
var anchoGameOver = WIDTH/100*80;
var altoGameOver = HEIGHT/100*10;

var premios = new Array();		//Array para almacenar los premios

var tiempoDePremios = 15;	//Tiempo durante el que está activo el premio
var premioPelota = 1;		//Controlador de pelotas del jugador
var premioLaserTiempo = 0;	//Controla el tiempo durante el que se puede disfrutar del premio Laser activo
var premioBarraTiempo = 0;	//Controla el tiempo durante el que se puede disfrutar del premio Barra Máxima activo

var dibujoBarra = new Image();
var GameOverImagen = new Image();	
var imagenes = new Image();
var PowerUpImagenes = new Image();

var MaxPremios = 10;		//Variable que controla el nuemero maximo entre los que se dan los premios de forma aleatoria
var posXPremio; 	//Posición X donde aparece el premio
var posYPremio;		//Posición Y donde aparece el premio
var posXDibujoDisparo = 255;	//X del dibujo Premio disparo
var posYDibujoDisparo = 0;

var sonidoFondo = new Audio("./Sonidos/wind.mp3");
var sonidos = [new Audio("./Sonidos/lose.wav"), new Audio("./Sonidos/choque.wav"), new Audio("./Sonidos/rompe1.wav"), new Audio("./Sonidos/rompe2.wav"), new Audio("./Sonidos/rompe3.wav"),
				new Audio("./Sonidos/rompe4.wav"), new Audio("./Sonidos/barra.wav"), new Audio("./Sonidos/laser.wav"), new Audio("./Sonidos/premio.wav"), new Audio("./Sonidos/gameover.wav") ];


function iniciar() {	//Primera función que se ejecuta al iniciar
	dibujoBarra.src="./Imagenes/Barra.png";	//Indicamos la ruta a la imagen.
	imagenes.src =	"./Imagenes/Imagenes.png";
	GameOverImagen.src = "./Imagenes/GameOver.png";
	PowerUpImagenes.src = "./Imagenes/PowerUp.png"
		
	canvas = document.getElementById("lienzo").getContext("2d");
	document.getElementById("lienzo").width = WIDTH;
	document.getElementById("lienzo").height = HEIGHT;
	
	canvasMinX = $("#lienzo").offset().left;
	canvasMaxX = canvasMinX + WIDTH;

	crearBloques();
	MiBarra = new Barra();
	crearPelota();
	
	sonidoFondo.play();
	
	window.requestAnimationFrame(dibujarPantalla);
	
	setInterval(function(){
	nuevoNivel();
	},tiempoCambioDeNivel);	
	
	setInterval(function(){
		if(premioLaserTiempo>0){
			premioLaserTiempo--;
		}
		if(premioBarraTiempo>0){
			premioBarraTiempo--;
		}
	},1000);	
}

function dibujarPantalla() {	//Función que se repite continuamente.
	if (pausado == false){
		if (GAMEOVER == false){			//Comprueba el GAME OVER
			clear();
			
			for(e=0; e<bloques.length;e++){		
				for(j=0;j<bloques[e].length;j++){
					bloques[e][j].dibujarBloque();	
				}
			
			}	
			MiBarra.dibujaBarra();
			
			for (p=0;p<pelotas.length;p++){
				pelotas[p].pintar();
				pelotas[p].rebotePelota();
			}
			borrarPelota();
			
			for(m=0;m<laseres.length;m++){
				laseres[m].dibujaLaser();
				laseres[m].moverLaser();
				laseres[m].colisionLaser();
			}
			eliminarLaser();
			disparoEnabled();
			barraGrande();
			puntosVidas();
			
			for(a=0;a<premios.length;a++){
				premios[a].dibujar();
				premios[a].mover();
				premios[a].colision();
			}
			eliminarPremio();
		}
		window.requestAnimationFrame(dibujarPantalla);		
	}	
}

function Bloque(constructor_bloque) {	//Clase Bloque con su función dibujarBloque()
	this.x = constructor_bloque.x;
	this.y = constructor_bloque.y;
	this.vida = constructor_bloque.vida;
	this.premio = constructor_bloque.premio;
	this.anchoBloque = bloqueAncho;
	this.altoBloque = bloqueAlto;
	
	this.dibujarBloque = function(){
		if(this.vida == 1){
			canvas.drawImage(imagenes, 16, 47, 16, 8, this.x, this.y, this.anchoBloque, this.altoBloque);
		}else if(this.vida == 2){
			canvas.drawImage(imagenes, 16, 55, 16, 8, this.x, this.y, this.anchoBloque, this.altoBloque);
		}else if(this.vida == 3){
			canvas.drawImage(imagenes, 16, 63, 16, 8, this.x, this.y, this.anchoBloque, this.altoBloque);
		}else if(this.vida == 4){
			canvas.drawImage(imagenes, 16, 71, 16, 8, this.x, this.y, this.anchoBloque, this.altoBloque);	
		}
	}
}

function crearBloques(){
	bloques = new Array(bloquesNumeroFilas);	//Se crea el array de 2Dimensiones
	for(i=0;i<bloquesNumeroFilas;i++){
		bloques[i]=new Array(numeroBloques);
	}
	for(e=0; e<bloques.length;e++){		//Se añade a cada objeto sus atributos.
		for(j=0;j<bloques[e].length;j++){
			bloques[e][j] =  new Bloque({
			x : j*bloqueAncho,
			y : espacioPuntuaciones+(e*bloqueAlto),
			vida : 4-e,
			premio : Math.floor((Math.random() * MaxPremios) + 1),
			anchoBloque : bloqueAncho,
			altoBloque : bloqueAlto});			
		}
	}	
}

function Pelota(constructor_pelota) {
	this.pelotaAncho = WIDTH/100*2;		//Tamaño de la pelota.
	this.pelotaX = constructor_pelota.pelotaX;					//Posición X de la pelota.
	this.pelotaY = constructor_pelota.pelotaY;					//Posición Y de la pelota.
	this.colorPelota ='rgb(35, 175, 63)';
	this.dx = velocidadPelota;			//Dirección-Velocidad en la X de la pelota.
	this.dy = -velocidadPelota;			//Dirección-Velocidad en la Y de la pelota.
	this.existe = true;
	
	this.pintar = function(){
		canvas.beginPath();
		canvas.fillStyle = this.colorPelota;
		canvas.strokeStyle="black";
		canvas.arc(this.pelotaX,this.pelotaY,this.pelotaAncho,0,Math.PI*2,true);
		canvas.fill();
		canvas.stroke();
		canvas.closePath();	
	}
	
	this.rebotePelota = function(){		//Calcula los rebotes de la pelota
		if ((this.pelotaX + this.pelotaAncho) > WIDTH || (this.pelotaX - this.pelotaAncho) < 0){
			this.dx = -this.dx;
			sonidos[1].play();
		}	
		if ((this.pelotaY + this.pelotaAncho) > HEIGHT || (this.pelotaY - this.pelotaAncho) < espacioPuntuaciones){
			this.dy = -this.dy;
			sonidos[1].play();
		}
			this.pelotaX += this.dx;
			this.pelotaY += this.dy;
		
		if ((this.pelotaY+this.pelotaAncho) > MiBarra.barraY && (this.pelotaY+this.pelotaAncho)<MiBarra.barraY+MiBarra.barraAlto){	//Calcula el rebote de la pelota en la barra
			if ((this.pelotaX+this.pelotaAncho) > MiBarra.barraX && (this.pelotaX-this.pelotaAncho) < (MiBarra.barraX+MiBarra.barraAncho)){	
				sonidos[6].play();
				this.dx = 8 * ((this.pelotaX-(MiBarra.barraX+MiBarra.barraAncho/2))/MiBarra.barraAncho);		//diferentes rebotes segun donde toque la pelota en la barra.
				this.pelotaY = this.pelotaY-5;
				this.dy = -this.dy;
			}
		}	
	
		for (j=0;j<bloques.length;j++){	//Calcula el rebote de la pelota con los bloques
			for (i=0;i<bloques[j].length;i++){	
				if(bloques[j][i].vida > 0){
					if(this.pelotaY - this.pelotaAncho < bloques[j][i].y + bloques[j][i].altoBloque && this.pelotaY - this.pelotaAncho > (bloques[j][i].y)){
						if(this.pelotaX + this.pelotaAncho > bloques[j][i].x && this.pelotaX - this.pelotaAncho < bloques[j][i].x + bloques[j][i].anchoBloque){
							if(bloques[j][i].vida == 4){
								sonidos[2].play();
							}else if(bloques[j][i].vida == 3){
								sonidos[3].play();
							}else if(bloques[j][i].vida == 2){
								sonidos[4].play();
							}else if(bloques[j][i].vida == 1){
								sonidos[5].play();
							}
							this.pelotaY = this.pelotaY + 5;
							this.dy = -this.dy;
							bloques[j][i].vida = bloques[j][i].vida-1;
							puntos = puntos + 10;							
							//bloques[j].splice(i, 1);
							if(bloques[j][i].vida == 0 && bloques[j][i].premio == 1){
								//premioPelota++
								premios.splice(premios.length,0,new Premio({
									x: bloques[j][i].x,
									y: bloques[j][i].y,
									premio: 1}));
							}else if(bloques[j][i].vida == 0 && bloques[j][i].premio == 2){
								//if (premioLaserTiempo<tiempoDePremios){
									//premioLaserTiempo = tiempoDePremios;
									premios.splice(premios.length,0,new Premio({
									x: bloques[j][i].x,
									y: bloques[j][i].y,
									premio: 2}));
								//}
							}else if(bloques[j][i].vida == 0 && bloques[j][i].premio == 3){
								//if (premioBarraTiempo<tiempoDePremios){
									//premioBarraTiempo = tiempoDePremios;
									premios.splice(premios.length,0,new Premio({
									x: bloques[j][i].x,
									y: bloques[j][i].y,
									premio: 3}));
								//}	
							}	
						}	
					}
				}		
			}
		}
		
		if (this.pelotaY+this.pelotaAncho>HEIGHT && pelotas.length>1){
			this.existe = false;
			sonidos[0].play();
		}else if(this.pelotaY+this.pelotaAncho>HEIGHT && pelotas.length==1){
			sonidos[0].play();
			VIDAS = VIDAS -1;
			premioPelota = 0;
			premioBarraTiempo = 0;
			premioLaserTiempo = 0;
			resetPantalla();
		}
		
		if (VIDAS == 0){
			sonidos[9].play();
			sonidoFondo.pause();
			GAMEOVER = true;
			clear();
			canvas.drawImage(GameOverImagen, (WIDTH/2)-(anchoGameOver/2), (HEIGHT/2)-(altoGameOver/2), anchoGameOver, altoGameOver);
			canvas.font = "bold 30px sans-serif";
			canvas.fillStyle = "white";
			canvas.fillText ("Puntuación: " +puntos, (WIDTH/2)-(anchoGameOver/2), HEIGHT*0.65);
			comparaRecord (puntos);
		}
	}
}

function crearPelota(){		//Función donde se crea el objeto pelota
	if(premioPelota>=1){
		premioPelota--;
		pelotas.splice(pelotas.length,0,new Pelota({
		pelotaX: WIDTH/2,
		pelotaY: HEIGHT/100*80}));
	}	
}

function borrarPelota(){	//Comprueba si  hay pelotas sin usar para eliminarlas del array
	for(p=0;p<pelotas.length;p++){
		if(pelotas[p].existe == false){
			pelotas.splice(p,1);
		}
	}
}

function Barra(){	//Clase Barra()
	this.barraAncho = WIDTH/100*20;				//Tamaño en ancho de la barra.
	this.barraAlto = (HEIGHT/100*1.5)+15;		//Tamaño en alto de la barra.
	this.barraX = (WIDTH/2) - (this.barraAncho/2);
	this.barraY = HEIGHT - (this.barraAlto)-5;

	this.dibujaBarra = function(){	//Dibuja la barra
		canvas.drawImage(dibujoBarra, this.barraX, this.barraY, MiBarra.barraAncho, MiBarra.barraAlto);
	} 				
}

function Laser(constructor_Laser){	//Clase Laser
	this.x = constructor_Laser.x;	
	this.y = MiBarra.barraY - 30;		
	this.existe = true;

	this.dibujaLaser = function(){	//Dibuja la barra
		canvas.beginPath();
		canvas.fillStyle = "#FF0000";
		canvas.fillRect(this.x, this.y-10,3,20);
		canvas.closePath();
	}
	
	this.moverLaser = function(){
		this.y = this.y-10;
	}
	
	this.colisionLaser = function(){
		for (j=0;j<bloques.length;j++){	//Calcula el rebote de la pelota con los bloques
			for (i=0;i<bloques[j].length;i++){	
				if(bloques[j][i].vida > 0){
					if(this.y < (bloques[j][i].y + bloques[j][i].altoBloque) && this.y > (bloques[j][i].y)){
						if(this.x > bloques[j][i].x && this.x < bloques[j][i].x + bloques[j][i].anchoBloque){
							this.existe = false;
							bloques[j][i].vida --;
						}
						if(bloques[j][i].vida == 0 && bloques[j][i].premio == 1){
							premioPelota++
						}else if(bloques[j][i].vida == 0 && bloques[j][i].premio == 2){
							premioLaserTiempo =premioLaserTiempo+tiempoDePremios;
						}else if(bloques[j][i].vida == 0 && bloques[j][i].premio == 3){
							premioBarraTiempo = premioBarraTiempo+tiempoDePremios;
						}
					}
				}
			}		
		}
		if(this.y<    espacioPuntuaciones){
			this.existe = false;
		}
	}
	
}

function eliminarLaser(){
	for(p=0;p<laseres.length;p++){
		if(laseres[p].existe == false){
			laseres.splice(p,1);
		}
	}
}

function Premio(constructor_Premio){
	this.x = constructor_Premio.x;
	this.y = constructor_Premio.y;
	this.ancho = bloqueAncho;
	this.alto = bloqueAlto;
	this.premio = constructor_Premio.premio;
	this.posImag = 0;
	this.visible = true;
	
	this.dibujar = function() {	
		if(this.premio == 1){
			canvas.drawImage(PowerUpImagenes, 176, this.posImag, 16, 8, this.x, this.y, this.ancho, this.alto);
			this.posImag = this.posImag + 8;
			if (this.posImag >= 56){
				this.posImag =0;
			}
		}else if(this.premio == 2){
			canvas.drawImage(PowerUpImagenes, 256, this.posImag, 16, 8, this.x, this.y, this.ancho, this.alto);
			this.posImag = this.posImag + 8;
			if (this.posImag >= 56){
				this.posImag =0;
			}
		}else if(this.premio == 3){
			canvas.drawImage(PowerUpImagenes, 304, this.posImag, 16, 8, this.x, this.y, this.ancho, this.alto);
			this.posImag = this.posImag + 8;
			if (this.posImag >= 56){
				this.posImag =0;
			}
		}
	}
	
	this.colision = function(){	
		if((this.y + this.alto) > MiBarra.barraY && (this.y + this.alto) < (MiBarra.barraY + MiBarra.barraAlto)){
			if((this.x + this.ancho) > MiBarra.barraX && this.x < (MiBarra.barraX + MiBarra.barraAncho)){
				if (this.premio == 1){
					sonidos[8].play();
					premioPelota++;
					this.visible = false;
				}else if (this.premio == 2){
					if (premioLaserTiempo <= tiempoDePremios){
						sonidos[8].play();
						premioLaserTiempo = tiempoDePremios;
					}
					this.visible = false;
				}else if (this.premio == 3){
					if (premioBarraTiempo <= tiempoDePremios){
						sonidos[8].play();
						premioBarraTiempo = tiempoDePremios;
					}
					this.visible = false;
				}
			}
		}
	}
	
	this.mover = function(){
		this.y++;
	}
}

function eliminarPremio(){
	for(a=0;a<premios.length;a++){
		if(premios[a].y > HEIGHT){
			premios.splice(a,1);	
		}
	}	
	for(a=0;a<premios.length;a++){
		if(premios[a].visible == false){	
			premios.splice(a,1);
		}
	}	
}

function clear() {		//Pinta pantalla.
	canvas.clearRect(0, 0, WIDTH, HEIGHT);
	canvas.fillStyle = "#FFFFFF";
	canvas.fillRect(0,espacioPuntuaciones-3,WIDTH,3);
}

function moverBarra(evt){	//Coge la posición X del raton para dibujar la barra
	if (evt.pageX > canvasMinX && evt.pageX < canvasMaxX) {
		MiBarra.barraX = Math.max(evt.pageX - canvasMinX - (MiBarra.barraAncho/2), 0);
		MiBarra.barraX = Math.min(WIDTH - MiBarra.barraAncho, MiBarra.barraX);
	}
}
$(document).mousemove(moverBarra);

function puntosVidas(){		//Dibuja las vidas y los puntos en la parte superior del canvas
	for(i=0;i<VIDAS;i++ ){	
		canvas.drawImage(dibujoBarra, (WIDTH/100*2)+ i*(WIDTH/100*12), espacioPuntuaciones/100*20 , WIDTH/100*10, espacioPuntuaciones/100*25    );
	}
	canvas.font = "bold 10px sans-serif";
	canvas.fillStyle = "white";
	canvas.fillText ("PELOTAS EXTRA: "+premioPelota, WIDTH/100*2, (espacioPuntuaciones/100*65)+(MiBarra.barraAlto/2));

	canvas.font = "bold 22px sans-serif";
	canvas.fillStyle = "white";
	canvas.fillText ("PUNTOS: "+puntos, WIDTH - 180, espacioPuntuaciones/2+7);
	
	if(premioLaserTiempo>0){
		canvas.font = "bold 10px sans-serif";
		canvas.fillStyle = "red";
		canvas.fillText ("LASER: "+premioLaserTiempo, WIDTH/100*26, (espacioPuntuaciones/100*65)+(MiBarra.barraAlto/2));
	}
	
	if(premioBarraTiempo>0 ){
		canvas.font = "bold 10px sans-serif";
		canvas.fillStyle = "grey";
		canvas.fillText ("BARRA MAX: "+premioBarraTiempo, WIDTH/100*40, (espacioPuntuaciones/100*65)+(MiBarra.barraAlto/2));
	}
}

function paused(event){		//Función que crea el paused del juego
	console.log(event.keyCode);
	
	if (event.keyCode==19 && pausado==false){		
		pausado = true;
		sonidoFondo.pause();
	}else if (event.keyCode==19 && pausado==true){
		pausado = false;
		sonidoFondo.play();
		window.requestAnimationFrame(dibujarPantalla);
	}
}

function disparo(event){	//Crea objetos nuevos de la clase Laser
	if (event.charCode == 32 && barraDisparo > WIDTH){
		if(premioLaserTiempo>0){
			sonidos[7].play();
			laseres.splice(laseres.length,0,new Laser({
			x: MiBarra.barraX + 2}));
		
			laseres.splice(laseres.length,0,new Laser({
			x: MiBarra.barraX + MiBarra.barraAncho - 2}));
			
			barraDisparo = 0;
		}
	}
}

function disparoEnabled(){		//Mediante el dibujo de una barra, controla que solo se pueda disparar cuando la barra esté llena
	if ( premioLaserTiempo > 0){
		canvas.beginPath();
		canvas.fillStyle = "#FF0000";
		canvas.fillRect(0,espacioPuntuaciones-10,barraDisparo,5);
		canvas.closePath();
	}
	if(barraDisparo<=WIDTH){
		barraDisparo = barraDisparo+3;
	}
}
$(document).keypress(disparo);

function sleep(milliseconds) {	//Función sleep para parar la ejecución del juego
	pausado=true;
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds){
			break;
		}
	}
	pausado=false;
}

function resetPantalla(){
	sonidoFondo.pause();
	if (pelotas.length>1){
		for(i=0; i<pelotas.length-1;i++){
			pelotas.splice(i,1);
		}
	}
	pelotas[0].pelotaX = WIDTH/2;
	pelotas[0].pelotaY = HEIGHT-(MiBarra.barraAlto*3);
	pelotas[0].dx = velocidadPelota;
	pelotas[0].dy = -velocidadPelota;
	//sleep (3000);	
	
	for(a=0;a<premios.length;a++){
		premios.splice(a,1);	
	}	
	
	for(p=0;p<laseres.length;p++){
		laseres.splice(p,1);
	}
	sonidoFondo.play();
}

function nuevoNivel(){ //Esta función añade una nueva fila de bloques por encima de las que ya existian
	if (pausado==false){
		bloquesNumeroFilas ++;	
		var bloquesProvisional = new Array(bloquesNumeroFilas);
		
		for(i=0;i<bloquesNumeroFilas;i++){		//Se crean dos arrays de 2 dimensiones de forma provisional
			bloquesProvisional[i]=new Array(numeroBloques);
		}
		for(e=1; e<bloques.length+1;e++){		//Se carga en los arrays provisionales los valores que teniamos en los otros bloques
			for(j=0;j<bloques[e-1].length;j++){
				bloquesProvisional[e][j] = bloques[e-1][j];
			}
		}
		
		for(e=1; e<bloquesProvisional.length;e++){				//Se suma el alto de bloque en el eje Y de los bloques que ya existian para desplazarlos
			for(j=0;j<bloquesProvisional[e].length;j++){
				bloquesProvisional[e][j].y = bloquesProvisional[e][j].y + bloqueAlto;
				
			}
		}
		
		for (i=0;i<numeroBloques;i++){					//Crea una nueva fila de bloques
			bloquesProvisional[0][i] =  new Bloque({
			x : i*bloqueAncho,
			y : espacioPuntuaciones,
			vida : Math.floor((Math.random() * 4) + 1),
			premio : Math.floor((Math.random() * MaxPremios) + 1),
			anchoBloque : bloqueAncho,
			altoBloque : bloqueAlto});			
		}

		for (j=0;j<bloquesNumeroFilas-1;j++){		 //Borra todo lo anterior que había en el array bloques
			delete bloques[j];
		}		
		bloques = new Array(bloquesNumeroFilas);
		
		for(i=0;i<bloquesNumeroFilas;i++){		//Se crean de nuevo dos arrays de 2 dimensiones 
			bloques[i]=new Array(numeroBloques);
		}	
		for (j=0;j<bloquesNumeroFilas;j++){			//Carga todos los valores que habia de forma provisional al definitivo
			for (i=0;i<bloques[j].length;i++){
				bloques[j][i]= bloquesProvisional[j][i];
			}
		}	
	}
}

function barraGrande(){
	if (premioBarraTiempo>0){
		MiBarra.barraAncho = (WIDTH/100*20)*2;
	}else{
		MiBarra.barraAncho = WIDTH/100*20;
	}	
}
 



