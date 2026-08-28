# Zayani portfolio

A unified Next.js portfolio with a PostgreSQL-backed content studio.

## Included

- Public server-rendered about, experience, education and training, selected work, expertise, languages, contact, and CV sections.
- English, Arabic, and Turkish routes with right-to-left Arabic presentation and editable translated content.
- Protected administrator studio for all portfolio content.
- PostgreSQL schema with UUID primary keys and relational skill references.
- Cookie-based administrator sessions with bcrypt password hashes.
- PostgreSQL-backed login and contact-form rate limiting.
- Contact email validation and escaped HTML.
- Persistent authenticated image and CV PDF uploads with obsolete-file cleanup.
- Editable SEO, navigation, section copy, CV headings, visibility, and ordering.

## PostgreSQL setup

Create a database, then copy `.env.example` to `.env.local` and configure:

```env
DATABASE_URL=postgresql://portfolio:password@127.0.0.1:5432/zayani_portfolio
MY_SECRET=replace-with-a-long-random-string
```

For a remote provider or a PostgreSQL server that requires TLS, include its
required `sslmode` option in `DATABASE_URL`.

Install dependencies and create/update the tables:

```bash
npm install
npm run db:migrate
```

Once the English records exist, import the supplied Arabic and Turkish translations:

```bash
npm run content:seed:ar
npm run content:seed:tr
```

The public site is available at `/en`, `/ar`, and `/tr`; `/` redirects to English.
Content editors can switch between English, Arabic, and Turkish inside each administrator
resource. New records are created in English first, then translated in Arabic.

Create the initial administrator. The same command resets the password when the
username already exists:

```bash
ADMIN_USERNAME=zayani ADMIN_PASSWORD='use-a-long-password' npm run admin:create
```

Then start the application:

```bash
npm run dev
```

The administrator login is available at <http://localhost:3000/login>.

## Rate limiting behind Nginx

Forward the visitor address so limits apply per client:

```nginx
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
```

Login is limited to 10 attempts per IP and 5 per username every 15 minutes.
The contact form is limited to 5 submissions per IP every hour. Counters are
stored in PostgreSQL and expired records are removed during normal limiter use.

## Verification

```bash
npm run typecheck
npm run lint
npm run build
```

## Persistent uploads on a VPS

Keep uploads outside the application checkout so releases cannot delete them:

```bash
sudo mkdir -p /var/lib/zayani-portfolio/uploads/images
sudo chown -R portfolio:portfolio /var/lib/zayani-portfolio/uploads
sudo chmod -R 750 /var/lib/zayani-portfolio/uploads
```

Configure the application process:

```env
UPLOAD_DIR=/var/lib/zayani-portfolio/uploads
```

The app serves those files through `/uploads/*`, while PostgreSQL stores paths
such as `uploads/images/example.jpg` and `uploads/documents/example.pdf`.
Replaced or deleted managed files are removed once no content record references
them. The CV PDF is uploaded from **Admin → Contact profile**.
