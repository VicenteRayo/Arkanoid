# Arkanoid

El juego se maneja con el ratón (o las flechas / A-D) para la posición de la barra.
Al empezar y tras perder una vida la pelota espera sobre la barra: con un click se lanza.
Durante la partida, haciendo click soltamos las pelotas extra en caso de tener alguna, y con la
barra espaciadora hacemos el disparo laser siempre que tengamos el powerup activo y esté su barra llena
(manteniendo pulsado dispara en cuanto se recarga).

- P, Escape o Pause: pausa (también se pausa sola al cambiar de pestaña).
- M: quitar / poner el sonido.

Cada 10 segundos baja una nueva fila de bloques y la pelota va un poco más rápida.
Si los bloques llegan a la barra se pierde una vida. Cada 2000 puntos se gana una vida extra (máximo 5).

## Docker

```
docker compose up -d --build
```

El juego queda en http://localhost:2001
