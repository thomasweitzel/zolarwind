# Artalk Integration

This document explains how to integrate Artalk with Zolarwind and how to run Artalk on the server.
It targets Artalk v2.9.1.
It is split into two parts.

---

## 1) Zolarwind Theme Integration

### 1.1 Enable comments per site

Artalk is disabled by default.
Enable it in your site `zola.toml`:

```toml
[extra.comments]
enabled = true
provider = "artalk"
```

### 1.2 Required Artalk settings in `zola.toml`

Uncomment and configure the Artalk block.
You must set at least `server` and `site`.

```toml
[extra.comments.artalk]
server = "https://example.org/comments"
site = "example"
```

- `server` is the public URL of your Artalk instance.
- `site` must exist in the Artalk admin UI.

### 1.3 Optional Artalk settings

All options are in `zola.toml` under `[extra.comments.artalk]`.
Each option has an inline comment that explains its purpose.
Start with defaults and only override what you need.

#### Consent gating (local storage)

If you need explicit consent before any local storage or network requests,
set `consent_required = true`. This delays loading Artalk until the user
checks the consent box. Consent is stored in `localStorage`. When disabled,
Artalk loads immediately as usual.

The consent text uses i18n keys:
- `comments_consent_label`
- `comments_consent_no_js`

#### Locale notes

Artalk’s default runtime includes only `en` and `zh-CN`.
See `/ui/artalk/src/i18n/index.ts` lines 11 to 15 in the Artalk repo.
Other locale files exist in the Artalk source tree but are not bundled unless you inject them
manually (like the `de` example in `artalk-init.js`) or build Artalk with additional locales.

### 1.4 Per‑page enable/disable

Comments are opt‑in per page.
Add this to front matter:

```toml
[extra]
comments = true
```

### 1.5 Privacy‑oriented defaults

This integration is designed to avoid unnecessary external requests by default:
- Avatars can be overridden with a data‑URI (local only).
- Optional features such as emoticons are disabled unless you enable them.
- You can hide the sidebar button for non‑admins.

If you change these, you are responsible for any additional external requests.

---

## 2) Server‑Side Prerequisites

### 2.1 Artalk service (systemd)

Install Artalk and run it as a service.
Create `/etc/systemd/system/artalk.service`:

```ini
[Unit]
Description=Artalk comment server
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/services/artalk
ExecStart=/opt/services/artalk/artalk server
Restart=on-failure
RestartSec=2
User=artalk
Group=artalk

NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ProtectHome=true
ReadWritePaths=/opt/services/artalk

[Install]
WantedBy=multi-user.target
```

Enable it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now artalk
```

### 2.2 Artalk config (`/opt/services/artalk/artalk.yml`)

Minimal base config:

```yaml
host: 127.0.0.1
port: 23366

trusted_domains:
  - https://example.org
  - https://test.org
```

Notes:
- Bind to loopback and expose Artalk only through a reverse proxy.
- Add every public site domain to `trusted_domains`. This allows a single Artalk
  backend to serve multiple sites while still limiting which origins may embed it.

### 2.3 Admin user and sites

Open the Artalk admin UI using the public URL (via reverse proxy):

- `https://example.org/comments`
- `https://test.org/artalk`

Create:
- One **site** per domain.
- Set each site’s **Site URL** to the public subpath (exact URL):
  - `https://example.org/comments`
  - `https://test.org/artalk`

The `site` in `zola.toml` must match the site name created here.

#### Admin user setup (global)

Admins are defined in `/opt/services/artalk/artalk.yml` under `admin_users` and apply to the whole Artalk instance.
Example:

```yaml
admin_users:
  - name: "Thomas"
    email: "admin@example.org"
    password: "(bcrypt)$2a$12$..."
    badge_name: "Admin"
    badge_color: "#0083FF"
```

Use the admin email + password to log in via the Artalk sidebar.

### 2.4 Apache reverse proxy with subpaths

Each domain gets its own subpath.
You must proxy both HTTP and WebSocket.
Apache is used here as an example. Apply the same rules to Nginx or other reverse proxies.
The example domains are placeholders. Use your own domains and subpaths.

#### `example.org` → `/comments`

```apache
ProxyPreserveHost On
ProxyRequests Off

RewriteEngine On
RewriteCond %{HTTP:Upgrade} =websocket [NC]
RewriteRule /comments/(.*) ws://127.0.0.1:23366/$1 [P,L]
RewriteCond %{HTTP:Upgrade} !=websocket [NC]
RewriteRule /comments/(.*) http://127.0.0.1:23366/$1 [P,L]

ProxyPass        /comments/ http://127.0.0.1:23366/
ProxyPassReverse /comments/ http://127.0.0.1:23366/

ProxyPassReverseCookiePath / /comments/
```

#### `test.org` → `/artalk`

```apache
ProxyPreserveHost On
ProxyRequests Off

RewriteEngine On
RewriteCond %{HTTP:Upgrade} =websocket [NC]
RewriteRule /artalk/(.*) ws://127.0.0.1:23366/$1 [P,L]
RewriteCond %{HTTP:Upgrade} !=websocket [NC]
RewriteRule /artalk/(.*) http://127.0.0.1:23366/$1 [P,L]

ProxyPass        /artalk/ http://127.0.0.1:23366/
ProxyPassReverse /artalk/ http://127.0.0.1:23366/

ProxyPassReverseCookiePath / /artalk/
```

### 2.5 Cookies and subpaths

Artalk uses cookies for admin sessions.
The `ProxyPassReverseCookiePath` rule ensures cookies work under a subpath.
Do not omit it.

### 2.6 Quick checklist

- Artalk service running on `127.0.0.1:23366`.
- Apache vhosts proxy both HTTP and WebSocket.
- `trusted_domains` includes all public sites.
- Sites created in Artalk admin.
- Each site’s URL matches the public subpath.
- `zola.toml` points to correct `server` + `site`.
- Per‑page `extra.comments = true`.
