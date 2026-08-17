# Dhruv Portfolio — Backend setup (Netlify)

This version is no longer a demo-only local admin panel.

## Architecture

- Static portfolio: HTML/CSS/JS
- Backend: Netlify Functions
- Persistent data: Netlify Blobs
- Authentication: server-side password verification + HttpOnly signed session cookie
- Password storage: scrypt password hash in a private Netlify Blobs store
- Projects/content: stored server-side in Netlify Blobs
- File vault: Netlify Blobs (5 MB per uploaded file in this implementation)

## First deployment

1. Upload the **contents of this folder** to a new Netlify site, or connect the repository.
2. Netlify should detect `netlify.toml` and deploy `netlify/functions/api.mjs` as a Function. Netlify's default Functions directory is `netlify/functions`, and this project explicitly configures it there.
3. In Netlify, open:
   **Project configuration → Environment variables**
4. Create these variables:

   - `ADMIN_USERNAME` = `admin` (or another username you choose)
   - `ADMIN_INITIAL_PASSWORD` = choose a strong password of at least 10 characters
   - `ADMIN_SESSION_SECRET` = a long random secret (at least 32 random characters)
   - `ADMIN_RESET_TOKEN` = another long random secret, kept private

5. Redeploy after adding/changing environment variables.
6. Open `https://YOUR-SITE.netlify.app/admin/`.
7. Log in using the username/password you configured.

## Password behavior

### Where is the password saved?

The initial password is **not stored in the frontend** and is not written into HTML/JS.

On first login, the Function reads `ADMIN_INITIAL_PASSWORD` from Netlify's server environment. After you change the password from the Admin → Settings panel, the backend stores only a **scrypt password hash** in the private Netlify Blobs `portfolio-data` store.

The plaintext password is never written to the project files.

### How to change it

Admin → Settings → Change password.

You enter:
- current password
- new password
- confirmation

The backend verifies the current password and saves the new scrypt hash.

### If you forget it

Use the private `ADMIN_RESET_TOKEN` configured in Netlify. The reset endpoint is available to the project owner; the token is never placed in frontend code.

## Adding/editing projects

Admin → Projects lets you edit the project registry. The public portfolio now reads the project list from `/api/projects`, so future changes can be made without editing `index.html`.

Each project has:
- title
- category/type
- URL
- button label
- status
- description

The first deployment starts with the five projects already included.

## Editing basic portfolio details

Admin → Content lets you change:
- name
- eyebrow
- headline
- description
- availability

The values are persisted server-side in Netlify Blobs.

## File system

Admin → File system is now a real server-side asset vault backed by Netlify Blobs, not browser localStorage.

Uploads are private until served through the authenticated/controlled API route. This version limits an individual upload to 5 MB.

The core project source files are still deployed with the site. The asset vault is for managed uploaded assets.

## Security model

This is appropriate for a personal portfolio admin, but it is not a replacement for a full enterprise CMS.

Included:
- password never exposed to browser
- scrypt password hashing
- HttpOnly + Secure + SameSite session cookie
- signed session tokens
- same-origin check for state-changing requests
- server-side authorization for write operations
- server-side persistent storage
- environment secrets
- no hard-coded admin password

Still your responsibility:
- keep Netlify account access secure
- use a strong unique admin password
- keep `ADMIN_SESSION_SECRET` and `ADMIN_RESET_TOKEN` secret
- do not paste secrets into GitHub
- periodically rotate secrets

## Important Netlify detail

Do not put secrets in `netlify.toml` or committed `.env` files.

Set them in Netlify's Environment Variables UI. Netlify Functions can read server-side environment variables at runtime.

## Local development

If you later want to develop locally, install Node.js and Netlify CLI, then:

```bash
npm install
netlify dev
```

For local development, create a local `.env` file with the four variables. Never commit that file.

## What you do NOT need to learn first

You do not need to learn databases, Express, Docker, or a full backend framework for this portfolio.

The backend is intentionally serverless:
browser → Netlify Function → Netlify Blobs.

When you eventually want more advanced features (multiple admin users, roles, analytics, comments, relational data, etc.), then a dedicated database/authentication platform would make sense.
