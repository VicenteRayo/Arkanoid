FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY ARKANOID.html ARKANOID.js GuardadoDatos.js jquery-1.2.6.js /usr/share/nginx/html/
COPY Imagenes /usr/share/nginx/html/Imagenes
COPY Sonidos /usr/share/nginx/html/Sonidos

EXPOSE 80
