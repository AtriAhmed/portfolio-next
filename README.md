# Ahmed Atri portfolio

Unified Next.js application migrated from `portfolio-mern-front` and
`portfolio-mern-backend`. The two source projects remain in this repository as
read-only migration references for now.

## What is included

- Public server-rendered portfolio: about, experience, work, skills, contact,
  and CV sections.
- Protected admin studio for every existing MongoDB content type.
- Cookie-based administrator sessions compatible with existing bcrypt password
  hashes.
- MongoDB models using the existing collection names and document shapes.
- Contact email endpoint with validation and escaped HTML.
- MongoDB-backed rate limits for administrator login attempts and contact-form spam.
- Authenticated image upload support for project and experience images.
- Admin-managed site settings for SEO text, navigation labels, section copy,
  contact-form copy, CV headings, footer text, and section visibility.
- Admin-managed portrait, content visibility, and display ordering.

## Local development

The original backend environment was copied to `.env.local` during migration.
Compare it with `.env.example`, then add `MAIL_TO` if messages should be sent to
an address different from `MAIL_USER`.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The admin login is at
<http://localhost:3000/login> and uses the existing user stored in MongoDB.

Open **Site settings** in the admin sidebar to create the default settings
document and edit global portfolio copy. Existing content without an explicit
visibility value remains visible; lower display-order numbers appear first.

If Nginx proxies the app, forward the visitor address so rate limits are applied
per client:

```nginx
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
```

Login is limited to 10 attempts per IP and 5 per username every 15 minutes.
The contact form is limited to 5 submissions per IP every hour. Limit state is
stored in MongoDB and expired automatically.

## Verification

```bash
npm run typecheck
npm run lint
npm run build
```

## Persistent uploads on a VPS

Keep uploaded files outside the application checkout so releases and rebuilds
cannot delete them. The app serves files from this directory through
`/uploads/*`, while MongoDB continues to store paths such as
`uploads/images/example.jpg`.

Create the directory once on the VPS (replace `portfolio` with the Linux user
that runs the Node process):

```bash
sudo mkdir -p /var/lib/portfolio/uploads/images
sudo chown -R portfolio:portfolio /var/lib/portfolio/uploads
sudo chmod -R 750 /var/lib/portfolio/uploads
```

Set this in the production environment used by systemd or PM2:

```env
UPLOAD_DIR=/var/lib/portfolio/uploads
```

Seed the images inherited from the Express application once:

```bash
sudo rsync -a public/uploads/ /var/lib/portfolio/uploads/
sudo chown -R portfolio:portfolio /var/lib/portfolio/uploads
```

The Node process must have read/write permission on that directory. Nginx may
optionally serve `/uploads/` directly for better throughput; the built-in route
works without that optimization.

When an administrator replaces an image or deletes its project/experience, the
old managed file is removed after the database update succeeds. Shared image
paths are retained until no MongoDB record references them. External image URLs
and files outside `UPLOAD_DIR` are never deleted.

After production has been verified, the two `portfolio-mern-*` folders can be
archived or removed in a separate cleanup change.
