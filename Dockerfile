FROM nginx:1.17.9-alpine

COPY assets /usr/share/nginx/html/assets
COPY contents /usr/share/nginx/html/contents
COPY index.html /usr/share/nginx/html
