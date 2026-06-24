# Cardomancer — Pre-register Landing

Static landing page. No framework, no build step, no runtime dependencies.

## Structure

```
.
├── index.html              # semantic markup, one responsive layout
├── assets/
│   ├── css/styles.css      # all styling (design tokens + components)
│   ├── js/app.js           # chroma-key video compositing + hero modal
│   ├── suits/*.svg         # suit icons
│   └── *.png|jpg|webm      # art, portraits, gameplay
├── fonts/NDOT47.otf        # display font
├── Dockerfile              # nginx static serve
├── nginx.conf              # gzip + cache headers
└── .dockerignore
```

Every call-to-action (nav, hero, modal, store badges) links to **https://cardomancer.app**.

> **Note:** This replaced an earlier no-code export that pulled React + ReactDOM + Babel
> from a CDN at runtime to render one static page. That `support.js` runtime was removed —
> the page is now plain HTML/CSS/JS and loads with zero third-party JS.

## Run locally

Any static server works, e.g.:

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Docker

```bash
docker build -t cardomancer-landing .
docker run --rm -p 8080:80 cardomancer-landing
# open http://localhost:8080
```

## Deploy on Coolify

The repo ships a `Dockerfile`, so Coolify needs no Nixpacks guessing.

1. **New Resource → Application → Public/Private Git repository**, pick this repo.
2. **Build Pack:** select **Dockerfile** (Coolify auto-detects it).
3. **Port:** set the exposed port to **80**.
4. **Domain:** set it to `cardomancer.app` (or a subdomain). Coolify provisions
   HTTPS via its built-in proxy automatically.
5. **Deploy.** Health check (`/`) is built into the image.

On every git push, redeploy (enable auto-deploy / webhook in Coolify to do this
automatically).

### Alternative: no Dockerfile

If you prefer, delete the `Dockerfile` and choose **Static** build pack in Coolify
with publish directory `/` — it will serve the files with its own nginx. The
included `Dockerfile` is recommended because it pins the nginx config (gzip + cache).
