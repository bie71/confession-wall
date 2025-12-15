# Confession Wall

A full-stack anonymous confession wall application. This project uses a modern, decoupled architecture for better maintainability and scalability.

-   **Backend**: Bun + Hono + Drizzle ORM + SQLite
-   **Frontend**: Vite + Vue 3 + Pinia + Tailwind CSS

## Architecture

The project has been refactored to use modern architectural patterns.

### Backend: Clean Architecture

The backend is built using **Clean Architecture**. This separates the code into distinct layers, ensuring a clear separation of concerns.

-   **`src/domain`**: Contains the core business logic, including entities (`Confession`, `Vote`) and repository interfaces. This layer is the heart of the application and has no external dependencies.
-   **`src/application`**: Contains the application-specific use cases (e.g., `CreateConfession`, `ListConfessions`). It orchestrates the flow of data between the presentation layer and the domain repositories.
-   **`src/infrastructure`**: Contains all the external concerns and technical details. This includes the database implementation (Drizzle ORM), the web server entrypoint, and WebSocket handling.
-   **`src/presentation`**: The outermost layer, responsible for handling HTTP requests and responses. It includes the Hono web framework routes and controllers.

### Frontend: Clean Architecture + Atomic Design

The frontend is built using a combination of **Clean Architecture** principles and the **Atomic Design** methodology.

-   **`web/src/domain`**: Contains the data models (TypeScript types) shared across the frontend.
-   **`web/src/data`**: Manages all data-related concerns.
    -   `repositories`: Abstracts the communication with the backend API.
    -   `stores`: Contains the application's state management, built with Pinia.
-   **`web/src/ui`**: Contains all UI components, structured using Atomic Design.
    -   `atoms`: The smallest reusable UI elements (e.g., `BaseButton`, `BaseCard`).
    -   `molecules`: Combinations of atoms to form simple components.
    -   `organisms`: More complex components built from atoms and molecules (e.g., `ConfessionCard`, `ConfessionForm`).
    -   `templates`: Page layouts that arrange organisms.
    -   `pages`: The final pages that users see, composed from templates.
-   **`web/src/composables`**: Reusable Vue Composition API functions (e.g., for theme management).

## Quick Start

```bash
# Install dependencies for both backend and frontend
bun install
cd web
bun install
cd ..

# Prepare and start backend
cp .env.example .env
bun run db:seed
bun run dev   # API running at http://localhost:8080
```

```bash
# In a separate terminal, start the frontend
cd web
bun run dev   # Web app running at http://localhost:5173
```

## Testing

This project includes unit tests for both the backend and frontend.

```bash
# Run backend tests (from root directory)
bun test

# Run frontend tests (from root directory)
cd web
bun test
cd ..
```

## Features
- WebSocket live update (`/ws`) for create/vote/approve/reject/delete
- Moderation queue (`status` = APPROVED | PENDING | REJECTED)
- CSV export: `/api/confessions/export.csv`
- Honeypot anti-spam + simple bad-words filter
- Pagination with infinite scroll
- Glassmorphism UI with dark/light mode
- Dockerfiles + docker-compose included

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