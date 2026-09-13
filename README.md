# Steam Library Total

Aplikasi web yang menghitung total harga penuh (tanpa diskon) dari seluruh game di library Steam seorang user, cukup dengan input username/link profil Steam.

**Demo:** https://steam-spent.vercel.app

## Fitur

- Input fleksibel: username, SteamID64, link `/id/`, atau link `/profiles/`
- Menampilkan daftar game beserta cover, harga normal, dan harga setelah diskon (kalau ada)
- Total harga keseluruhan library
- Caching harga game di database (mengurangi beban ke Steam Store API)
- Loading state

## Tech Stack

| Bagian | Teknologi |
|---|---|
| Frontend | React + Vite |
| Backend | Express (lokal) / Vercel Serverless Functions (production) |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |

## Struktur Proyek

```
.
├── backend/
│   ├── api/              # Serverless functions (dipakai Vercel)
│   │   └── calculate.js
│   ├── lib/
│   │   └── prisma.js     # Prisma client (aman untuk serverless)
│   ├── src/
│   │   ├── app.js         # Express server untuk development lokal
│   │   ├── config/
│   │   └── services/      # Logic bisnis: fetch Steam, cache harga
│   ├── prisma/
│   │   └── schema.prisma
│   └── vercel.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── services/
    │   │   └── api.js     # Pemanggil API backend
    │   └── App.jsx
    └── vite.config.js
```

## Keterbatasan yang Diketahui

- Endpoint `GetOwnedGames` dari Steam Web API hanya melaporkan game yang **dimiliki** (owned license) — game yang bisa diakses lewat langganan pihak ketiga (misal : EA Play trial), maupun game trial dari Steam, tidak ikut terhitung.
- Resolve username hanya berfungsi untuk profil Steam yang **public**.
- Library dengan jumlah game sangat besar (1000+) berisiko timeout di serverless function.
