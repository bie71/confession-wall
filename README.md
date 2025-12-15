# Confession Wall

A full-stack anonymous confession wall application. This project uses a modern, decoupled architecture for better maintainability and scalability.

-   **Backend**: Bun + Hono + Drizzle ORM + PostgreSQL/pgvector
-   **Frontend**: Vite + Vue 3 + Pinia + Tailwind CSS

## Technical Details & Architecture

This project uses a modern, decoupled architecture for both the backend and frontend to ensure maintainability and scalability.

---

### **Backend**

The backend is built using **Clean Architecture** principles to separate concerns and create a system that is independent of frameworks, UI, and databases. It uses PostgreSQL with the `pgvector` extension to enable powerful near-duplicate detection.

#### **Arsitektur Backend (Clean Architecture)**

-   **`src/domain`**: Lapisan terdalam yang berisi logika bisnis inti. Ini termasuk *entities* (model data seperti `User`, `Confession`) dan *repository interfaces* (kontrak untuk akses data). Lapisan ini tidak bergantung pada lapisan lain.
-   **`src/application`**: Berisi *use cases* spesifik aplikasi (contoh: `RegisterUser`, `CreateConfession`). Lapisan ini mengorkestrasi alur data antara *presentation* dan *domain*.
-   **`src/infrastructure`**: Berisi implementasi detail teknis dan koneksi ke dunia luar. Termasuk di dalamnya adalah implementasi *repository* (menggunakan Drizzle ORM), koneksi database (PostgreSQL), dan logika untuk AI (model embedding).
-   **`src/presentation`**: Lapisan terluar yang berinteraksi dengan dunia luar (HTTP). Berisi *routes* (menggunakan Hono), *controllers*, dan *middleware* untuk otentikasi dan logging.

#### **Struktur Folder Backend**

```
/
├── src/
│   ├── application/
│   │   └── use-cases/      # Logika bisnis (misal: CreateConfession.ts)
│   ├── domain/
│   │   ├── entities/       # Model data inti (misal: Confession.ts)
│   │   └── repositories/   # Kontrak/interface untuk database
│   ├── infrastructure/
│   │   ├── ai/             # Logika model AI (embedding.ts)
│   │   ├── database/       # Koneksi, skema (schema.ts), dan implementasi repo
│   │   └── logger/         # Konfigurasi logging (pino)
│   └── presentation/
│       ├── middleware/     # Middleware Hono (auth.ts, logger.ts)
│       └── routes/         # Definisi endpoint API (index.ts)
├── drizzle/                # File migrasi database
├── scripts/
│   └── seed.ts             # Script untuk membuat data awal (admin)
└── index.ts                # Titik masuk utama aplikasi
```

#### **Library Utama Backend**

-   **Runtime**: [Bun](https://bun.sh/)
-   **Web Framework**: [Hono](https://hono.dev/)
-   **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
-   **Database Driver**: [postgres](https://github.com/porsager/postgres)
-   **Authentication**: [hono/jwt](https://hono.dev/middlewares/jwt)
-   **Logging**: [pino](https://getpino.io/)
-   **AI Embeddings**: [@xenova/transformers](https://github.com/xenova/transformers.js)

---

### **Frontend**

The frontend combines **Clean Architecture** for data flow with the **Atomic Design** methodology for UI components. This creates a clear separation between UI, state management, and API communication.

#### **Arsitektur Frontend (Clean Architecture + Atomic Design)**

-   **`web/src/domain`**: Berisi definisi tipe data atau model yang digunakan di seluruh aplikasi frontend (contoh: `Confession`).
-   **`web/src/data`**: Mengelola semua logika terkait data.
    -   `repositories`: Abstraksi untuk berkomunikasi dengan backend API.
    -   `stores`: *State management* terpusat menggunakan Pinia (`authStore`, `wallStore`).
-   **`web/src/ui`**: Berisi semua komponen Vue, diorganisir dengan metodologi **Atomic Design**.
    -   `atoms`: Komponen terkecil yang tidak bisa dipecah lagi (misal: `BaseButton.vue`).
    -   `molecules`: Kumpulan dari beberapa atom (misal: form input dengan labelnya).
    -   `organisms`: Komponen kompleks yang tersusun dari atom dan molekul (misal: `ConfessionCard.vue`, `LoginForm.vue`).
    -   `templates`: Tata letak atau kerangka halaman (misal: `AuthTemplate.vue`).
    -   `pages`: Halaman final yang dilihat pengguna, yang menggunakan *template* dengan data nyata.
-   **`web/src/composables`**: Berisi *logic* yang dapat digunakan kembali dalam format Vue Composition API (misal: `useTheme.ts`).

#### **Struktur Folder Frontend**

```
/web
└── src/
    ├── domain/
    │   └── models/           # Definisi tipe data (misal: Confession.ts)
    ├── data/
    │   ├── repositories/     # Logika pemanggilan API
    │   └── stores/           # State management (Pinia)
    ├── ui/
    │   ├── atoms/            # Komponen UI terkecil (BaseButton.vue)
    │   ├── molecules/
    │   ├── organisms/        # Komponen UI kompleks (LoginForm.vue)
    │   ├── templates/        # Kerangka halaman (AuthTemplate.vue)
    │   └── pages/            # Halaman final (LoginPage.vue)
    ├── composables/          # Reusable logic (useTheme.ts)
    ├── router.ts             # Konfigurasi routing (vue-router)
    └── main.ts               # Titik masuk utama aplikasi Vue
```

#### **Library Utama Frontend**

-   **Framework**: [Vue.js](https://vuejs.org/) 3
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **State Management**: [Pinia](https://pinia.vuejs.org/)
-   **Routing**: [Vue Router](https://router.vuejs.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)

---
### **Daftar Perintah (Commands)**

Perintah-perintah ini dijalankan dari direktori root proyek.

-   `bun run dev`: Menjalankan server backend di mode pengembangan.
-   `bun run web:dev`: Menjalankan server frontend di mode pengembangan.
-   `bun run db:generate`: Membuat file migrasi database baru berdasarkan perubahan skema.
-   `bun run db:migrate`: Menjalankan migrasi database yang tertunda.
-   `bun run db:seed`: Membuat user admin default (data dari `.env`).
-   `bun test`: Menjalankan unit test untuk backend.
-   `bun run web:build`: Mem-build aplikasi frontend untuk produksi.

## Quick Start

You can run this project in two ways:

### Option 1: With Docker (Recommended)

This is the easiest way to get started, as it automatically sets up the PostgreSQL database with the required `pgvector` extension.

1.  **Prerequisite**: Docker must be installed and running.

2.  **Copy Environment File**: Create a `.env` file from the example.
    ```bash
    cp .env.example .env
    ```
    *(The default `DATABASE_URL` is configured for Docker Compose and does not need to be changed.)*

3.  **Build and Run**: Use Docker Compose to build and run the entire stack (API, Frontend, and Database). The first run may take a few minutes to download the embedding model.
    ```bash
    docker compose up --build
    ```

4.  **Seed Database**: Create a default admin user.
    ```bash
    bun run db:seed
    ```
    *(Default admin credentials are in `.env.example`)*

5.  **Access the App**:
    -   Frontend: `http://localhost:5173`
    -   Backend API: `http://localhost:8080`

### Option 2: Locally (Advanced)

This method requires you to manually install and configure the database.

1.  **Prerequisites**:
    -   **Bun**: Make sure [Bun](https://bun.sh/docs/installation) is installed.
    -   **PostgreSQL**: A local PostgreSQL server must be installed and running.
    -   **pgvector**: The `pgvector` extension must be installed on your PostgreSQL instance. You can follow the instructions [here](https://github.com/pgvector/pgvector).

2.  **Install Dependencies**:
    ```bash
    bun install
    cd web
    bun install
    cd ..
    ```

3.  **Setup Database & Environment**:
    -   Create a new database in PostgreSQL (e.g., `confessiondb`).
    -   In your new database, enable the `pgvector` extension by running the SQL command: `CREATE EXTENSION vector;`.
    -   Copy the environment file: `cp .env.example .env`.
    -   **Edit `.env`** and update `DATABASE_URL` to point to your local database (e.g., `postgres://YOUR_USER:YOUR_PASSWORD@localhost:5432/confessiondb`).

4.  **Run Database Migrations**: Apply the latest database schema.
    ```bash
    bun run db:migrate
    ```

5.  **Seed Database**: Create a default admin user.
    ```bash
    bun run db:seed
    ```
    *(Default admin credentials are in `.env.example`)*

6.  **Run the Application**:
    -   In one terminal, start the backend API. The first run may take a few minutes to download the embedding model.
        ```bash
        bun run dev
        ```
    -   In a second terminal, start the frontend:
        ```bash
        cd web
        bun run dev
        ```

## Database Migrations

The project uses Drizzle Kit to manage database schema changes.

1.  **Generate a Migration**: After making changes to the schema in `src/infrastructure/database/schema.ts`, run the following command to generate a new migration file.
    *(Requires the database to be running via `docker compose up`)*
    ```bash
    bun run db:generate
    ```

2.  **Apply Migrations**: To apply all pending migrations to the database, run:
    ```bash
    bun run db:migrate
    ```
    *(The `docker compose up` command runs this for you automatically on startup.)*


## Testing

```bash
# Run backend tests
bun test

# Run frontend tests
cd web && bun test && cd ..
```

## Features
- User Authentication (Register/Login)
- JWT-based Admin Access
- AI-powered near-duplicate detection to prevent spammy, similar posts.
- WebSocket live update (`/ws`) for create/vote/approve/reject/delete.
- Moderation queue (`status` = APPROVED | PENDING | REJECTED).
- CSV export: `/api/confessions/export.csv`.
- Honeypot anti-spam + simple bad-words filter.
- Pagination with infinite scroll.
- Glassmorphism UI with dark/light mode.
- Fully containerized with Docker and Docker Compose.

---

## Tentang Runtime Bun

Proyek ini menggunakan [Bun](https://bun.sh/) sebagai runtime JavaScript utama untuk proses pengembangan backend dan frontend. Bun adalah toolkit JavaScript modern yang serba ada, dirancang untuk kecepatan dan pengalaman pengembang.

### Kelebihan Bun vs. Node.js

1.  **Kecepatan**: Bun dibangun di atas mesin JavaScriptCore (mesin yang digunakan oleh Safari), yang umumnya memulai dan berkinerja lebih cepat daripada mesin V8 milik Node.js untuk banyak tugas.
2.  **Toolkit Serba Ada**: Bun menggantikan berbagai alat. Ia memiliki manajer paket bawaan (`bun install`), bundler (`bun build`), dan test runner (`bun test`), mengurangi kebutuhan akan dependensi terpisah seperti `npm`/`yarn`, `webpack`/`esbuild`, dan `jest`.
3.  **Dukungan TypeScript & JSX**: Bun dapat mengeksekusi file `.ts` dan `.tsx` secara langsung tanpa konfigurasi tambahan atau langkah *transpilasi*.
4.  **Kompatibilitas Node.js**: Bun bertujuan untuk menjadi pengganti langsung (drop-in replacement) untuk Node.js. Ia mengimplementasikan algoritma resolusi modul Node.js dan mendukung banyak API bawaan Node.js.

### Kekurangan & Pertimbangan

1.  **Kematangan**: Bun jauh lebih baru daripada Node.js. Meskipun telah mencapai versi stabil v1.0, ekosistemnya kurang matang, dan beberapa API Node.js yang khusus mungkin belum sepenuhnya diimplementasikan.
2.  **Masalah Kompatibilitas**: Sebagai alat yang lebih baru, kadang-kadang mungkin ada masalah kompatibilitas dengan *library* lain yang dibangun dan diuji terutama untuk lingkungan Node.js. Misalnya, dalam proyek ini, kami mengalami masalah saat menjalankan tes komponen Vue dengan `bun test`, yang mengharuskan pengalihan strategi pengujian.
3.  **Komunitas Lebih Kecil**: Meskipun berkembang pesat, komunitasnya lebih kecil daripada Node.js, yang terkadang membuat lebih sulit untuk menemukan solusi untuk masalah yang sangat spesifik.

### Bisakah Bun menjalankan framework lain seperti Next.js?

Ya. Bun dirancang agar kompatibel dengan ekosistem Node.js. Ia dapat menginstal paket `npm` dan menjalankan proyek yang dibangun dengan *framework* populer seperti Next.js, Remix, dan Nuxt. Dokumentasi resmi Bun menyediakan panduan dan contoh untuk menggunakan *framework-framework* ini. Untuk banyak proyek, Anda dapat mengganti `npm install && npm run dev` dengan `bun install && bun run dev` yang jauh lebih cepat.