# Bore & Barrel

A dummy gunshop storefront built as a Progressive Web App. It runs offline
with an app shell, a web app manifest, and a service worker, and uses React +
Vite + Tailwind CSS.

## Setup

```bash
npm install
npm run dev      # dev server with HMR
```

Other scripts:

```bash
npm run build    # production build to dist/
npm run preview  # serve the production build
npm run lint     # oxlint
```

## Structure

```
.
├── index.html              # HTML shell
├── vite.config.js          # Vite + vite-plugin-pwa (manifest + service worker)
├── public/                 # static assets served at /
│   ├── icon-192.png / icon-512.png / icon.svg
│   └── guns/               # product images
└── src/
    ├── main.jsx            # entry, mounts <App/>
    ├── App.jsx             # app shell: tab state, header/nav/content/footer
    ├── App.css             # app shell styles
    ├── index.css           # global styles
    ├── components/
    │   ├── Header.jsx      # brand + nav
    │   ├── GunCard.jsx     # single product card
    │   └── Footer.jsx
    ├── data/
    │   └── guns.js         # dummy product data
    └── pages/
        ├── Catalog.jsx     # product grid
        ├── About.jsx
        └── Contact.jsx
```

---

## Tugas Pengganti Modul 5 — fitur tambahan

| Ketentuan | Implementasi | File |
|---|---|---|
| Database & API sendiri | Supabase milik sendiri (`supabase/schema.sql`) + `.env` | `.env.example`, `supabase/schema.sql` |
| Paginasi | Server-side `limit` + `offset`, total dari header `Content-Range` | `services/gunService.js`, `components/common/Pagination.jsx`, `pages/Catalog.jsx` |
| Query caching | TanStack Query (`staleTime` 5 mnt, cache per `queryKey`, invalidate setelah CRUD) | `config/queryClient.js`, `hooks/useGuns.js`, `main.jsx` |
| Lazy load | `React.lazy` + `Suspense` per halaman, `loading="lazy"` pada gambar | `App.jsx`, `components/gun/GunCard.jsx` |
| Share link | Tombol Share per item -> `/?gun=<id>`; link dibuka lewat `SharedGun` | `components/common/ShareButton.jsx`, `App.jsx` |

### Setup
1. Buat project Supabase, jalankan `supabase/schema.sql` di SQL Editor.
2. `cp .env.example .env`, isi URL & publishable key milik sendiri.
3. `npm install && npm run dev`
4. Deploy ke Vercel, isi dua environment variable yang sama.
