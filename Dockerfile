# Static landing page served by nginx — no build step required.
FROM nginx:1.27-alpine

# site config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# static files
COPY index.html /usr/share/nginx/html/index.html
COPY assets /usr/share/nginx/html/assets
COPY fonts /usr/share/nginx/html/fonts

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1
