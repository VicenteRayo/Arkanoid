window.addEventListener("load", iniciar, false);

var tiempoCambioDeNivel = 10000;	//Cada cuantos milisegundos baja una nueva fila de bloques
var PASO = 1000/60;		//Duración de un "frame" de referencia. Las velocidades están pensadas para 60 fps

var canvas;
var WIDTH = Math.round(Math.min(window.innerWidth/3, window.innerHeight*0.75));		//Ancho del canvas.
var HEIGHT = Math.round(window.innerHeight/100 *90);		//Alto del canvas.
if (WIDTH < 360) WIDTH = Math.min(360, window.innerWidth - 10);

var espacioPuntuaciones = HEIGHT/100*10;	//Espacio que dejo arriba para las puntuaciones y vidas

var bloques;
var bloquesNumeroFilas = 4;
var numeroBloques = 9;
var bloqueAncho = WIDTH / numeroBloques;
var bloqueAlto = (HEIGHT/100)*3;

var MiBarra;

var pelotas = new Array();		//Array donde almacenar las pelotas que se crean
var velocidadPelota = 7;		//Velocidad inicial a la que se mueven las pelotas
var velocidadMaxima = 10.5;		//Velocidad máxima que alcanzan las pelotas al subir de nivel

var laseres = new Array();
var barraDisparo = 0;

var VIDAS = 3;		//Número de vidas que tiene el jugador
var VIDAS_MAX = 5;
var puntosVidaExtra = 2000;		//Cada cuantos puntos se gana una vida
var siguienteVidaExtra = puntosVidaExtra;
var puntos = 0;
var nivel = 1;
var pausado = false;		//Variable para controlar el paused del juego.
var GAMEOVER = false;
var nuevoRecord = false;
var anchoGameOver = WIDTH/100*80;
var altoGameOver = anchoGameOver * 74/400;

var premios = new Array();		//Array para almacenar los premios

var tiempoDePremios = 15;	//Tiempo durante el que está activo el premio
var premioPelota = 0;		//Controlador de pelotas extra del jugador
var premioLaserTiempo = 0;	//Controla el tiempo durante el que se puede disfrutar del premio Laser activo
var premioBarraTiempo = 0;	//Controla el tiempo durante el que se puede disfrutar del premio Barra Máxima activo

var relojNivel = 0;		//Tiempo de juego acumulado para el siguiente nivel
var relojSegundo = 0;	//Tiempo de juego acumulado para descontar los premios

var dibujoBarra = new Image();
var GameOverImagen = new Image();
var imagenes = new Image();
var PowerUpImagenes = new Image();

var MaxPremios = 15;		//Variable que controla el nuemero maximo entre los que se dan los premios de forma aleatoria
var spritePremio = {1: 176, 2: 256, 3: 304};	//X de cada premio dentro de PowerUp.png
var coloresBloque = {1: "rgb(168,25,25)", 2: "rgb(27,170,27)", 3: "rgb(26,26,169)", 4: "rgb(121,43,145)"};	//Se recalculan a partir del sprite al cargar

//Efectos visuales
var particulas = new Array();
var textosFlotantes = new Array();
var temblor = 0;
var tiempoAnimacion = 0;
var FUENTE = "'Press Start 2P', monospace";

//Controles
var teclas = {};
var ultimoTiempo = 0;

var sonidoFondo = new Audio("./Sonidos/wind.mp3");
sonidoFondo.loop = true;
sonidoFondo.volume = 0.5;
var silencio = false;
var sonidos = [new Audio("./Sonidos/lose.wav"), new Audio("./Sonidos/choque.wav"), new Audio("./Sonidos/rompe1.wav"), new Audio("./Sonidos/rompe2.wav"), new Audio("./Sonidos/rompe3.wav"),
				new Audio("./Sonidos/rompe4.wav"), new Audio("./Sonidos/barra.wav"), new Audio("./Sonidos/laser.wav"), new Audio("./Sonidos/premio.wav"), new Audio("./Sonidos/gameover.wav") ];


function iniciar() {	//Primera función que se ejecuta al iniciar
	dibujoBarra.src="./Imagenes/Barra.png";	//Indicamos la ruta a la imagen.
	imagenes.src =	"./Imagenes/Imagenes.png";
	GameOverImagen.src = "./Imagenes/GameOver.png";
	PowerUpImagenes.src = "./Imagenes/PowerUp.png";
	imagenes.onload = leerColoresBloques;

	var lienzo = document.getElementById("lienzo");
	lienzo.width = WIDTH;
	lienzo.height = HEIGHT;
	canvas = lienzo.getContext("2d");

	nuevaPartida();

	document.addEventListener("keydown", teclaPulsada, false);
	document.addEventListener("keyup", function(e){ teclas[e.key] = false; }, false);
	document.addEventListener("visibilitychange", function(){	//Si se cambia de pestaña se pausa el juego
		if (document.hidden && !pausado && !GAMEOVER) pausar();
	});
	lienzo.addEventListener("touchmove", function(e){
		e.preventDefault();
		colocarBarra(e.touches[0].pageX);
	}, {passive: false});

	window.requestAnimationFrame(bucle);
}

function nuevaPartida(){	//Deja todas las variables como al empezar
	bloquesNumeroFilas = 4;
	VIDAS = 3;
	puntos = 0;
	nivel = 1;
	siguienteVidaExtra = puntosVidaExtra;
	premioPelota = 0;
	premioLaserTiempo = 0;
	premioBarraTiempo = 0;
	relojNivel = 0;
	relojSegundo = 0;
	barraDisparo = 0;
	GAMEOVER = false;
	nuevoRecord = false;
	pelotas = [];
	laseres = [];
	premios = [];
	particulas = [];
	textosFlotantes = [];

	crearBloques();
	MiBarra = new Barra();
	pelotaEnBarra();
}

function bucle(tiempo) {	//Función que se repite continuamente.
	if (!ultimoTiempo) ultimoTiempo = tiempo;
	var k = Math.min((tiempo - ultimoTiempo) / PASO, 3);	//Factor para que el juego vaya igual de rápido a 60, 120 o 144 Hz
	ultimoTiempo = tiempo;

	if (!pausado && !GAMEOVER){
		actualizar(k);
	}
	if (!pausado){
		actualizarEfectos(k);
	}
	dibujarPantalla();
	window.requestAnimationFrame(bucle);
}

function actualizar(k){
	tiempoAnimacion += k;
	moverBarraTeclado(k);
	MiBarra.actualizar(k);

	var jugando = !hayPelotaPegada();
	if (jugando){		//Los relojes solo corren cuando la pelota está en juego
		relojNivel += k*PASO;
		if (relojNivel >= tiempoCambioDeNivel){
			relojNivel -= tiempoCambioDeNivel;
			nuevoNivel();
		}
		relojSegundo += k*PASO;
		if (relojSegundo >= 1000){
			relojSegundo -= 1000;
			if(premioLaserTiempo>0) premioLaserTiempo--;
			if(premioBarraTiempo>0) premioBarraTiempo--;
		}
	}

	for (var p=0;p<pelotas.length;p++){
		pelotas[p].rebotePelota(k);
	}
	borrarPelota();

	for(var m=0;m<laseres.length;m++){
		laseres[m].moverLaser(k);
		laseres[m].colisionLaser();
	}
	eliminarLaser();
	disparoEnabled(k);
	if (teclas[" "]) disparar();	//Mantener pulsado el espacio dispara en cuanto se recarga

	for(var a=0;a<premios.length;a++){
		premios[a].mover(k);
		premios[a].colision();
	}
	eliminarPremio();
	comprobarVidaExtra();
}

function dibujarPantalla() {
	canvas.save();
	if (temblor > 0.5){
		canvas.translate((Math.random()-0.5)*temblor, (Math.random()-0.5)*temblor);
	}
	clear();
	canvas.imageSmoothingEnabled = false;

	for(var e=0; e<bloques.length;e++){
		for(var j=0;j<bloques[e].length;j++){
			bloques[e][j].dibujarBloque();
		}
	}
	dibujarPeligro();
	for(var a=0;a<premios.length;a++){
		premios[a].dibujar();
	}
	for(var m=0;m<laseres.length;m++){
		laseres[m].dibujaLaser();
	}
	MiBarra.dibujaBarra();
	for (var p=0;p<pelotas.length;p++){
		pelotas[p].pintar();
	}
	dibujarEfectos();
	puntosVidas();
	canvas.restore();

	if (GAMEOVER){
		pantallaGameOver();
	}else if (pausado){
		pantallaPausa();
	}else if (hayPelotaPegada()){
		mensajeCentro("CLICK PARA LANZAR", HEIGHT*0.62, true);
	}
}

function Bloque(constructor_bloque) {	//Clase Bloque con su función dibujarBloque()
	this.x = constructor_bloque.x;
	this.y = constructor_bloque.y;
	this.vida = constructor_bloque.vida;
	this.premio = constructor_bloque.premio;
	this.anchoBloque = bloqueAncho;
	this.altoBloque = bloqueAlto;
	this.brillo = 0;		//Destello blanco al recibir un golpe

	this.dibujarBloque = function(){
		if(this.vida < 1 || this.vida > 4) return;
		canvas.drawImage(imagenes, 16, 47 + (this.vida-1)*8, 16, 8, this.x, this.y, this.anchoBloque, this.altoBloque);
		if (this.brillo > 0){
			canvas.fillStyle = "rgba(255,255,255," + (this.brillo/8) + ")";
			canvas.fillRect(this.x, this.y, this.anchoBloque, this.altoBloque);
		}
	}
}

function crearBloques(){
	bloques = new Array(bloquesNumeroFilas);	//Se crea el array de 2Dimensiones
	for(var e=0; e<bloquesNumeroFilas;e++){		//Se añade a cada objeto sus atributos.
		bloques[e] = new Array(numeroBloques);
		for(var j=0;j<numeroBloques;j++){
			bloques[e][j] =  new Bloque({
			x : j*bloqueAncho,
			y : espacioPuntuaciones+(e*bloqueAlto),
			vida : 4-e,
			premio : Math.floor((Math.random() * MaxPremios) + 1)});
		}
	}
}

function golpearBloque(bloque){		//Se llama cuando una pelota o un laser golpean un bloque
	var colorBloque = coloresBloque[bloque.vida];
	reproducir(2 + (4 - bloque.vida));		//rompe1 para los de 4 vidas ... rompe4 para los de 1 vida
	bloque.vida--;
	bloque.brillo = 8;
	puntos = puntos + 10;
	textosFlotantes.push({x: bloque.x + bloque.anchoBloque/2, y: bloque.y, texto: "+10", vida: 40});

	if (bloque.vida == 0){
		explosion(bloque.x + bloque.anchoBloque/2, bloque.y + bloque.altoBloque/2, colorBloque, 14);
		if (bloque.premio >= 1 && bloque.premio <= 3){
			premios.push(new Premio({
				x: bloque.x,
				y: bloque.y,
				premio: bloque.premio}));
		}
	}else{
		explosion(bloque.x + bloque.anchoBloque/2, bloque.y + bloque.altoBloque/2, colorBloque, 4);
	}
}

function velocidadActual(){		//La pelota va más rápida según se sube de nivel
	return Math.min(velocidadPelota * (1 + (nivel-1)*0.04), velocidadMaxima);
}

function Pelota(constructor_pelota) {
	this.pelotaAncho = WIDTH/100*2;		//Tamaño de la pelota.
	this.pelotaX = constructor_pelota.pelotaX;					//Posición X de la pelota.
	this.pelotaY = constructor_pelota.pelotaY;					//Posición Y de la pelota.
	this.colorPelota ='rgb(35, 175, 63)';
	this.dx = velocidadPelota;			//Dirección-Velocidad en la X de la pelota.
	this.dy = -velocidadPelota;			//Dirección-Velocidad en la Y de la pelota.
	this.existe = true;
	this.pegada = constructor_pelota.pegada || false;		//Pelota esperando en la barra a que se lance
	this.desplazamiento = 0;		//Posición relativa sobre la barra mientras está pegada
	this.estela = [];

	this.pintar = function(){
		var r = this.pelotaAncho;
		for (var i=0;i<this.estela.length;i++){		//Estela
			var alfa = (i+1)/(this.estela.length+1)*0.35;
			canvas.beginPath();
			canvas.fillStyle = "rgba(35, 175, 63," + alfa + ")";
			canvas.arc(this.estela[i].x, this.estela[i].y, r*(0.5 + 0.5*(i+1)/this.estela.length), 0, Math.PI*2, true);
			canvas.fill();
		}
		var degradado = canvas.createRadialGradient(this.pelotaX - r*0.35, this.pelotaY - r*0.35, r*0.1, this.pelotaX, this.pelotaY, r);
		degradado.addColorStop(0, "rgb(190, 255, 190)");
		degradado.addColorStop(0.45, this.colorPelota);
		degradado.addColorStop(1, "rgb(15, 90, 30)");
		canvas.beginPath();
		canvas.fillStyle = degradado;
		canvas.strokeStyle="black";
		canvas.lineWidth = 1.5;
		canvas.arc(this.pelotaX,this.pelotaY,r,0,Math.PI*2,true);
		canvas.fill();
		canvas.stroke();
		canvas.closePath();
	}

	this.lanzar = function(){
		var angulo = (this.desplazamiento >= 0 ? 1 : -1) * Math.PI/5;
		var v = velocidadActual();
		this.dx = v * Math.sin(angulo);
		this.dy = -v * Math.cos(angulo);
		this.pegada = false;
	}

	this.rebotePelota = function(k){		//Mueve la pelota y calcula los rebotes
		var r = this.pelotaAncho;
		if (this.pegada){
			this.pelotaX = MiBarra.barraX + MiBarra.barraAncho/2 + this.desplazamiento;
			this.pelotaY = MiBarra.barraY - r;
			return;
		}

		this.estela.push({x: this.pelotaX, y: this.pelotaY});
		if (this.estela.length > 6) this.estela.shift();

		this.normalizarVelocidad();
		//Se divide el movimiento en pasos pequeños para que la pelota no atraviese los bloques
		var distancia = Math.sqrt(this.dx*this.dx + this.dy*this.dy) * k;
		var pasos = Math.max(1, Math.ceil(distancia / (r*0.5)));
		for (var s=0; s<pasos && this.existe; s++){
			this.pelotaX += this.dx * k / pasos;
			this.pelotaY += this.dy * k / pasos;
			this.reboteParedes();
			this.reboteBarra();
			this.reboteBloques();
		}

		if (this.pelotaY - r > HEIGHT){		//Se ha caido la pelota
			this.existe = false;
			reproducir(0);
		}
	}

	this.normalizarVelocidad = function(){		//Mantiene la velocidad constante y evita trayectorias casi horizontales
		var v = velocidadActual();
		var actual = Math.sqrt(this.dx*this.dx + this.dy*this.dy) || 1;
		this.dx = this.dx / actual * v;
		this.dy = this.dy / actual * v;
		if (Math.abs(this.dy) < v*0.3){
			this.dy = (this.dy < 0 ? -1 : 1) * v*0.3;
			this.dx = (this.dx < 0 ? -1 : 1) * Math.sqrt(v*v - this.dy*this.dy);
		}
	}

	this.reboteParedes = function(){
		var r = this.pelotaAncho;
		if (this.pelotaX - r < 0){
			this.pelotaX = r;
			this.dx = Math.abs(this.dx);
			reproducir(1);
		}else if (this.pelotaX + r > WIDTH){
			this.pelotaX = WIDTH - r;
			this.dx = -Math.abs(this.dx);
			reproducir(1);
		}
		if (this.pelotaY - r < espacioPuntuaciones){
			this.pelotaY = espacioPuntuaciones + r;
			this.dy = Math.abs(this.dy);
			reproducir(1);
		}
	}

	this.reboteBarra = function(){	//Calcula el rebote de la pelota en la barra
		var r = this.pelotaAncho;
		if (this.dy > 0 && this.pelotaY + r >= MiBarra.barraY && this.pelotaY < MiBarra.barraY + MiBarra.barraAlto){
			if (this.pelotaX + r > MiBarra.barraX && this.pelotaX - r < MiBarra.barraX + MiBarra.barraAncho){
				reproducir(6);
				//Diferentes rebotes segun donde toque la pelota en la barra: del centro sale recta, de los extremos hasta 60º
				var desplazamiento = (this.pelotaX - (MiBarra.barraX + MiBarra.barraAncho/2)) / (MiBarra.barraAncho/2);
				desplazamiento = Math.max(-1, Math.min(1, desplazamiento));
				var angulo = desplazamiento * Math.PI/3;
				var v = velocidadActual();
				this.dx = v * Math.sin(angulo);
				this.dy = -v * Math.cos(angulo);
				this.pelotaY = MiBarra.barraY - r;
				MiBarra.golpe = 6;
			}
		}
	}

	this.reboteBloques = function(){	//Calcula el rebote de la pelota con los bloques (como mucho un bloque por paso)
		var r = this.pelotaAncho;
		for (var j=0;j<bloques.length;j++){
			for (var i=0;i<bloques[j].length;i++){
				var b = bloques[j][i];
				if (b.vida <= 0) continue;
				//Punto del bloque más cercano al centro de la pelota
				var cx = Math.max(b.x, Math.min(this.pelotaX, b.x + b.anchoBloque));
				var cy = Math.max(b.y, Math.min(this.pelotaY, b.y + b.altoBloque));
				var ddx = this.pelotaX - cx;
				var ddy = this.pelotaY - cy;
				if (ddx*ddx + ddy*ddy < r*r){
					//Se rebota por el lado en el que la pelota ha entrado menos
					var entradaX = this.dx > 0 ? (this.pelotaX + r - b.x) : (b.x + b.anchoBloque - (this.pelotaX - r));
					var entradaY = this.dy > 0 ? (this.pelotaY + r - b.y) : (b.y + b.altoBloque - (this.pelotaY - r));
					if (entradaX < entradaY){
						this.dx = -this.dx;
						this.pelotaX += this.dx > 0 ? entradaX : -entradaX;
					}else{
						this.dy = -this.dy;
						this.pelotaY += this.dy > 0 ? entradaY : -entradaY;
					}
					golpearBloque(b);
					return;
				}
			}
		}
	}
}

function hayPelotaPegada(){
	for (var p=0;p<pelotas.length;p++){
		if (pelotas[p].pegada) return true;
	}
	return false;
}

function pelotaEnBarra(){	//Coloca una pelota nueva encima de la barra, esperando el click
	var pelota = new Pelota({pelotaX: 0, pelotaY: 0, pegada: true});
	pelota.desplazamiento = MiBarra.barraAncho * 0.15;
	pelotas.push(pelota);
	pelota.rebotePelota(0);
}

function clickRaton(){		//Click: lanza la pelota de la barra o suelta una pelota extra
	iniciarMusica();
	if (pausado) return;
	if (GAMEOVER){
		nuevaPartida();
		return;
	}
	if (hayPelotaPegada()){
		for (var p=0;p<pelotas.length;p++){
			if (pelotas[p].pegada) pelotas[p].lanzar();
		}
	}else{
		crearPelota();
	}
}

function crearPelota(){		//Función donde se crea el objeto pelota extra
	if(premioPelota>=1){
		premioPelota--;
		var pelota = new Pelota({
			pelotaX: MiBarra.barraX + MiBarra.barraAncho/2,
			pelotaY: MiBarra.barraY - WIDTH/100*2});
		pelota.dx = (Math.random() < 0.5 ? -1 : 1) * velocidadPelota;
		pelotas.push(pelota);
	}
}

function borrarPelota(){	//Comprueba si hay pelotas que se han caido para eliminarlas del array
	for(var p=pelotas.length-1;p>=0;p--){
		if(pelotas[p].existe == false){
			pelotas.splice(p,1);
		}
	}
	if (pelotas.length == 0 && !GAMEOVER){
		perderVida();
	}
}

function perderVida(){
	VIDAS = VIDAS -1;
	temblor = 12;
	premioPelota = 0;
	premioBarraTiempo = 0;
	premioLaserTiempo = 0;
	if (VIDAS <= 0){
		finDelJuego();
	}else{
		resetPantalla();
	}
}

function finDelJuego(){
	VIDAS = 0;
	reproducir(9);
	sonidoFondo.pause();
	GAMEOVER = true;
	nuevoRecord = comparaRecord(puntos);
}

function Barra(){	//Clase Barra()
	this.anchoNormal = WIDTH/100*20;
	this.barraAncho = this.anchoNormal;				//Tamaño en ancho de la barra.
	this.barraAlto = (HEIGHT/100*1.5)+15;		//Tamaño en alto de la barra.
	this.barraX = (WIDTH/2) - (this.barraAncho/2);
	this.barraY = HEIGHT - (this.barraAlto)-5;
	this.golpe = 0;		//Pequeño hundimiento al golpear la pelota

	this.actualizar = function(k){	//Agranda o encoge la barra poco a poco con el premio Barra Máxima
		var objetivo = premioBarraTiempo > 0 ? this.anchoNormal*2 : this.anchoNormal;
		var centro = this.barraX + this.barraAncho/2;
		this.barraAncho += (objetivo - this.barraAncho) * Math.min(1, 0.2*k);
		this.barraX = Math.max(0, Math.min(WIDTH - this.barraAncho, centro - this.barraAncho/2));
		if (this.golpe > 0) this.golpe = Math.max(0, this.golpe - k);
	}

	this.dibujaBarra = function(){	//Dibuja la barra
		var hundido = this.golpe > 0 ? 2 : 0;
		if (premioLaserTiempo > 0){		//Cañones del laser
			canvas.fillStyle = "#7a0000";
			canvas.fillRect(this.barraX + 1, this.barraY - 6 + hundido, 6, 8);
			canvas.fillRect(this.barraX + this.barraAncho - 7, this.barraY - 6 + hundido, 6, 8);
			canvas.fillStyle = barraDisparo >= WIDTH ? "#ff4040" : "#c00000";
			canvas.fillRect(this.barraX + 2, this.barraY - 8 + hundido, 4, 4);
			canvas.fillRect(this.barraX + this.barraAncho - 6, this.barraY - 8 + hundido, 4, 4);
		}
		canvas.drawImage(dibujoBarra, this.barraX, this.barraY + hundido, this.barraAncho, this.barraAlto);
	}
}

function Laser(constructor_Laser){	//Clase Laser
	this.x = constructor_Laser.x;
	this.y = MiBarra.barraY - 10;
	this.existe = true;

	this.dibujaLaser = function(){
		canvas.fillStyle = "rgba(255, 0, 0, 0.35)";
		canvas.fillRect(this.x - 2, this.y - 12, 7, 24);
		canvas.fillStyle = "#FF0000";
		canvas.fillRect(this.x, this.y-10,3,20);
		canvas.fillStyle = "#FFC0C0";
		canvas.fillRect(this.x + 1, this.y-8,1,16);
	}

	this.moverLaser = function(k){
		this.y = this.y-10*k;
	}

	this.colisionLaser = function(){
		for (var j=0;j<bloques.length && this.existe;j++){
			for (var i=0;i<bloques[j].length;i++){
				var b = bloques[j][i];
				if(b.vida > 0 && this.y - 10 < b.y + b.altoBloque && this.y + 10 > b.y && this.x + 3 > b.x && this.x < b.x + b.anchoBloque){
					this.existe = false;
					golpearBloque(b);
					break;
				}
			}
		}
		if(this.y < espacioPuntuaciones){
			this.existe = false;
		}
	}
}

function eliminarLaser(){
	for(var p=laseres.length-1;p>=0;p--){
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
	this.entra = 0;

	this.dibujar = function() {
		canvas.fillStyle = "rgba(0,0,0,0.35)";		//Sombra
		canvas.fillRect(this.x + 4, this.y + 4, this.ancho, this.alto);
		canvas.drawImage(PowerUpImagenes, spritePremio[this.premio], this.posImag, 16, 8, this.x, this.y, this.ancho, this.alto);
	}

	this.colision = function(){
		if(this.y + this.alto > MiBarra.barraY && this.y < MiBarra.barraY + MiBarra.barraAlto){
			if((this.x + this.ancho) > MiBarra.barraX && this.x < (MiBarra.barraX + MiBarra.barraAncho)){
				reproducir(8);
				this.visible = false;
				puntos += 50;
				if (this.premio == 1){
					premioPelota++;
					textosFlotantes.push({x: this.x + this.ancho/2, y: this.y, texto: "PELOTA EXTRA", vida: 60});
				}else if (this.premio == 2){
					premioLaserTiempo = Math.max(premioLaserTiempo, tiempoDePremios);
					barraDisparo = WIDTH;
					textosFlotantes.push({x: this.x + this.ancho/2, y: this.y, texto: "LASER", vida: 60});
				}else if (this.premio == 3){
					premioBarraTiempo = Math.max(premioBarraTiempo, tiempoDePremios);
					textosFlotantes.push({x: this.x + this.ancho/2, y: this.y, texto: "BARRA MAX", vida: 60});
				}
			}
		}
	}

	this.mover = function(k){
		this.y += 2*k;
		this.entra += k;		//Animación de giro del premio
		if (this.entra >= 6){
			this.entra = 0;
			this.posImag = (this.posImag + 8) % 56;
		}
	}
}

function eliminarPremio(){
	for(var a=premios.length-1;a>=0;a--){
		if(premios[a].y > HEIGHT || premios[a].visible == false){
			premios.splice(a,1);
		}
	}
}

function clear() {		//Pinta pantalla.
	canvas.clearRect(-20, -20, WIDTH+40, HEIGHT+40);
	canvas.fillStyle = "rgba(0,0,0,0.55)";		//Fondo oscuro para el marcador
	canvas.fillRect(0, 0, WIDTH, espacioPuntuaciones-3);
	canvas.fillStyle = "#FFFFFF";
	canvas.fillRect(0,espacioPuntuaciones-3,WIDTH,3);
}

function colocarBarra(pageX){	//Coloca el centro de la barra en la X indicada
	var canvasMinX = $("#lienzo").offset().left + 3;	//Se calcula cada vez por si cambia el tamaño de la ventana
	MiBarra.barraX = Math.max(pageX - canvasMinX - (MiBarra.barraAncho/2), 0);
	MiBarra.barraX = Math.min(WIDTH - MiBarra.barraAncho, MiBarra.barraX);
}

function moverBarra(evt){	//Coge la posición X del raton para dibujar la barra
	if (!pausado && !GAMEOVER && MiBarra) colocarBarra(evt.pageX);
}
$(document).mousemove(moverBarra);

function moverBarraTeclado(k){	//También se puede mover la barra con las flechas o A / D
	var direccion = 0;
	if (teclas["ArrowLeft"] || teclas["a"] || teclas["A"]) direccion--;
	if (teclas["ArrowRight"] || teclas["d"] || teclas["D"]) direccion++;
	if (direccion != 0){
		MiBarra.barraX = Math.max(0, Math.min(WIDTH - MiBarra.barraAncho, MiBarra.barraX + direccion * WIDTH/55 * k));
	}
}

function puntosVidas(){		//Dibuja las vidas y los puntos en la parte superior del canvas
	var margen = WIDTH/100*2;
	var fuentePequena = Math.max(7, Math.round(WIDTH/70));
	var fuenteGrande = Math.max(10, Math.round(WIDTH/34));

	for(var i=0;i<VIDAS;i++ ){
		canvas.drawImage(dibujoBarra, margen + i*(WIDTH/100*12), espacioPuntuaciones/100*15 , WIDTH/100*10, espacioPuntuaciones/100*25);
	}

	canvas.textBaseline = "alphabetic";
	canvas.textAlign = "right";
	canvas.font = fuenteGrande + "px " + FUENTE;
	canvas.fillStyle = "white";
	canvas.fillText (puntos, WIDTH - margen, espacioPuntuaciones*0.4);
	canvas.font = fuentePequena + "px " + FUENTE;
	canvas.fillStyle = "#9ad0ff";
	canvas.fillText ("NIVEL " + nivel, WIDTH - margen, espacioPuntuaciones*0.62);

	canvas.textAlign = "left";
	var lineaY = espacioPuntuaciones*0.62;
	canvas.fillStyle = "white";
	canvas.fillText ("PELOTAS EXTRA: "+premioPelota, margen, lineaY);

	var lineaY2 = espacioPuntuaciones*0.82;
	if(premioLaserTiempo>0){
		canvas.fillStyle = (premioLaserTiempo <= 3 && Math.floor(tiempoAnimacion/8)%2) ? "#600" : "#ff4040";
		canvas.fillText ("LASER: "+premioLaserTiempo, margen, lineaY2);
	}
	if(premioBarraTiempo>0 ){
		canvas.fillStyle = (premioBarraTiempo <= 3 && Math.floor(tiempoAnimacion/8)%2) ? "#444" : "#c8c8c8";
		canvas.fillText ("BARRA MAX: "+premioBarraTiempo, WIDTH*0.4, lineaY2);
	}

	if ( premioLaserTiempo > 0){		//Barra de recarga del laser
		canvas.fillStyle = "#400000";
		canvas.fillRect(0,espacioPuntuaciones-9,WIDTH,5);
		canvas.fillStyle = barraDisparo >= WIDTH ? "#FF4040" : "#B00000";
		canvas.fillRect(0,espacioPuntuaciones-9,Math.min(barraDisparo, WIDTH),5);
	}
}

function teclaPulsada(event){
	var tecla = event.key;
	if (tecla == " " || tecla == "ArrowLeft" || tecla == "ArrowRight" || tecla == "ArrowUp" || tecla == "ArrowDown"){
		event.preventDefault();		//Evita que la página haga scroll
	}
	if (event.repeat && (tecla == "p" || tecla == "P" || tecla == "Pause" || tecla == "Escape")) return;
	teclas[tecla] = true;
	iniciarMusica();

	if (tecla == "Pause" || tecla == "p" || tecla == "P" || tecla == "Escape"){
		paused();
	}else if (tecla == "m" || tecla == "M"){
		silencio = !silencio;
		sonidoFondo.muted = silencio;
	}else if (tecla == "Enter" || tecla == "ArrowUp"){
		clickRaton();
	}else if (tecla == " "){
		if (hayPelotaPegada() && !pausado && !GAMEOVER){
			clickRaton();
		}else{
			disparar();
		}
	}
}

function paused(){		//Función que crea el paused del juego
	if (GAMEOVER) return;
	if (pausado == false){
		pausar();
	}else{
		pausado = false;
		if (!silencio) sonidoFondo.play().catch(function(){});
	}
}

function pausar(){
	pausado = true;
	teclas = {};
	sonidoFondo.pause();
}

function disparar(){	//Crea objetos nuevos de la clase Laser
	if (pausado || GAMEOVER || hayPelotaPegada()) return;
	if (barraDisparo >= WIDTH && premioLaserTiempo>0){
		reproducir(7);
		laseres.push(new Laser({x: MiBarra.barraX + 3}));
		laseres.push(new Laser({x: MiBarra.barraX + MiBarra.barraAncho - 6}));
		barraDisparo = 0;
	}
}

function disparoEnabled(k){		//Controla que solo se pueda disparar cuando la barra de recarga esté llena
	if(barraDisparo < WIDTH){
		barraDisparo = Math.min(WIDTH, barraDisparo + WIDTH/70*k);
	}
}

function resetPantalla(){
	premios = [];
	laseres = [];
	pelotas = [];
	pelotaEnBarra();
}

function nuevoNivel(){ //Esta función añade una nueva fila de bloques por encima de las que ya existian
	nivel++;
	for(var e=0; e<bloques.length;e++){		//Se baja una fila todos los bloques que ya existian
		for(var j=0;j<bloques[e].length;j++){
			bloques[e][j].y = bloques[e][j].y + bloqueAlto;
		}
	}
	var fila = new Array(numeroBloques);
	for (var i=0;i<numeroBloques;i++){					//Crea una nueva fila de bloques
		fila[i] =  new Bloque({
		x : i*bloqueAncho,
		y : espacioPuntuaciones,
		vida : Math.floor((Math.random() * 4) + 1),
		premio : Math.floor((Math.random() * MaxPremios) + 1)});
	}
	bloques.unshift(fila);

	while (bloques.length > 0 && filaVacia(bloques[bloques.length-1])){		//Se quitan las filas de abajo que ya están rotas
		bloques.pop();
	}
	bloquesNumeroFilas = bloques.length;

	if (bloquesNumeroFilas > 0 && limiteBloques() >= MiBarra.barraY - bloqueAlto*2){		//Los bloques han llegado a la barra
		temblor = 14;
		reproducir(0);
		bloques.splice(Math.max(0, bloques.length - 4), 4);
		bloquesNumeroFilas = bloques.length;
		textosFlotantes.push({x: WIDTH/2, y: HEIGHT*0.55, texto: "¡LOS BLOQUES TE ALCANZAN!", vida: 90});
		perderVida();
	}
}

function filaVacia(fila){
	for (var i=0;i<fila.length;i++){
		if (fila[i].vida > 0) return false;
	}
	return true;
}

function limiteBloques(){	//Y donde termina el bloque vivo más bajo
	for (var e=bloques.length-1;e>=0;e--){
		if (!filaVacia(bloques[e])) return bloques[e][0].y + bloqueAlto;
	}
	return 0;
}

function dibujarPeligro(){	//Aviso cuando los bloques se acercan a la barra
	var limite = MiBarra.barraY - bloqueAlto*2;
	if (limiteBloques() >= limite - bloqueAlto*4){
		var alfa = 0.35 + 0.35*Math.sin(tiempoAnimacion/6);
		canvas.fillStyle = "rgba(255, 40, 40," + alfa + ")";
		canvas.fillRect(0, limite, WIDTH, 2);
	}
}

function comprobarVidaExtra(){		//Cada puntosVidaExtra puntos se gana una vida
	if (puntos >= siguienteVidaExtra){
		siguienteVidaExtra += puntosVidaExtra;
		if (VIDAS < VIDAS_MAX){
			VIDAS++;
			reproducir(8);
			textosFlotantes.push({x: WIDTH/2, y: HEIGHT*0.5, texto: "¡VIDA EXTRA!", vida: 90});
		}
	}
}

/* ---------- Efectos ---------- */

function explosion(x, y, color, cantidad){
	for (var i=0;i<cantidad;i++){
		var angulo = Math.random()*Math.PI*2;
		var fuerza = 1 + Math.random()*3;
		particulas.push({
			x: x + (Math.random()-0.5)*bloqueAncho*0.8,
			y: y + (Math.random()-0.5)*bloqueAlto*0.6,
			vx: Math.cos(angulo)*fuerza,
			vy: Math.sin(angulo)*fuerza - 1,
			vida: 30 + Math.random()*20,
			tam: 2 + Math.random()*3,
			color: color});
	}
}

function actualizarEfectos(k){
	for (var i=particulas.length-1;i>=0;i--){
		var p = particulas[i];
		p.x += p.vx*k;
		p.y += p.vy*k;
		p.vy += 0.15*k;
		p.vida -= k;
		if (p.vida <= 0) particulas.splice(i,1);
	}
	for (var t=textosFlotantes.length-1;t>=0;t--){
		textosFlotantes[t].y -= 0.6*k;
		textosFlotantes[t].vida -= k;
		if (textosFlotantes[t].vida <= 0) textosFlotantes.splice(t,1);
	}
	for(var e=0; e<bloques.length;e++){
		for(var j=0;j<bloques[e].length;j++){
			if (bloques[e][j].brillo > 0) bloques[e][j].brillo = Math.max(0, bloques[e][j].brillo - k);
		}
	}
	if (temblor > 0) temblor *= Math.pow(0.85, k);
}

function dibujarEfectos(){
	for (var i=0;i<particulas.length;i++){
		var p = particulas[i];
		canvas.globalAlpha = Math.min(1, p.vida/20);
		canvas.fillStyle = p.color;
		canvas.fillRect(p.x, p.y, p.tam, p.tam);
	}
	canvas.globalAlpha = 1;
	canvas.textAlign = "center";
	canvas.font = Math.max(7, Math.round(WIDTH/60)) + "px " + FUENTE;
	for (var t=0;t<textosFlotantes.length;t++){
		var texto = textosFlotantes[t];
		canvas.globalAlpha = Math.min(1, texto.vida/20);
		canvas.fillStyle = "black";
		canvas.fillText(texto.texto, texto.x + 1, texto.y + 1);
		canvas.fillStyle = "#ffe95a";
		canvas.fillText(texto.texto, texto.x, texto.y);
	}
	canvas.globalAlpha = 1;
}

function leerColoresBloques(){	//Coge el color de cada bloque del sprite para las partículas
	try{
		var auxiliar = document.createElement("canvas");
		auxiliar.width = imagenes.width;
		auxiliar.height = imagenes.height;
		var ctx = auxiliar.getContext("2d");
		ctx.drawImage(imagenes, 0, 0);
		for (var v=1; v<=4; v++){
			var d = ctx.getImageData(24, 47 + (v-1)*8 + 4, 1, 1).data;
			coloresBloque[v] = "rgb(" + d[0] + "," + d[1] + "," + d[2] + ")";
		}
	}catch(e){
		//Abriendo el html directamente (file://) el navegador no deja leer los píxeles: se usan los colores por defecto
	}
}

function mensajeCentro(texto, y, parpadeo){
	if (parpadeo && Math.floor(performance.now()/500)%2) return;
	canvas.textAlign = "center";
	canvas.font = Math.max(9, Math.round(WIDTH/40)) + "px " + FUENTE;
	canvas.fillStyle = "black";
	canvas.fillText(texto, WIDTH/2 + 2, y + 2);
	canvas.fillStyle = "white";
	canvas.fillText(texto, WIDTH/2, y);
}

function pantallaPausa(){
	canvas.fillStyle = "rgba(0, 0, 40, 0.6)";
	canvas.fillRect(0, espacioPuntuaciones, WIDTH, HEIGHT - espacioPuntuaciones);
	canvas.textAlign = "center";
	canvas.font = Math.round(WIDTH/14) + "px " + FUENTE;
	canvas.fillStyle = "white";
	canvas.fillText("PAUSA", WIDTH/2, HEIGHT*0.48);
	mensajeCentro("PULSA P PARA SEGUIR", HEIGHT*0.56, true);
}

function pantallaGameOver(){
	canvas.fillStyle = "rgba(0, 0, 0, 0.7)";
	canvas.fillRect(0, 0, WIDTH, HEIGHT);
	canvas.drawImage(GameOverImagen, (WIDTH/2)-(anchoGameOver/2), (HEIGHT*0.4)-(altoGameOver/2), anchoGameOver, altoGameOver);
	canvas.textAlign = "center";
	canvas.font = Math.round(WIDTH/30) + "px " + FUENTE;
	canvas.fillStyle = "white";
	canvas.fillText ("PUNTUACION: " +puntos, WIDTH/2, HEIGHT*0.52);
	canvas.fillStyle = "#9ad0ff";
	canvas.fillText ("NIVEL: " +nivel, WIDTH/2, HEIGHT*0.57);
	if (nuevoRecord){
		canvas.fillStyle = Math.floor(performance.now()/250)%2 ? "#ffe95a" : "#ff7400";
		canvas.fillText ("¡NUEVO RECORD!", WIDTH/2, HEIGHT*0.63);
	}
	mensajeCentro("CLICK PARA JUGAR", HEIGHT*0.72, true);
}

/* ---------- Sonido ---------- */

function reproducir(numero){	//Clona el sonido para que se puedan oir varios a la vez
	if (silencio) return;
	var s = sonidos[numero].cloneNode();
	s.volume = 0.6;
	var promesa = s.play();
	if (promesa) promesa.catch(function(){});
}

function iniciarMusica(){	//Los navegadores no dejan reproducir audio hasta que el usuario interactúa
	if (!silencio && !GAMEOVER && !pausado && sonidoFondo.paused){
		var promesa = sonidoFondo.play();
		if (promesa) promesa.catch(function(){});
	}
}
