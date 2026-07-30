<div align="center">

# DC Habitat — Furniture Order Management System

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql)

**A comprehensive web-based system designed to manage DC Habitat's furniture business operations, from tracking orders and managing suppliers to invoicing and finance.**

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Database Schema](#-database-schema) · [System Architecture](#-system-architecture)

</div>

---

## 🌟 Features

### 📊 Dashboard & Analytics
- **Dashboard Overview** — Key metrics summary: Monthly revenue, pending supplier payments, and upcoming order deadlines.
- **Interactive Charts** — Visualizing monthly revenue trends using Recharts.
- **Recent Activity** — Real-time activity log tracking status changes, invoice generation, and payments.

### 📦 Order Management
- **Order Tracking** — Manage orders from start to finish (Waiting Supplier → In Production → Ready to Ship → Delivered).
- **Multi-Item Orders** — A single order can contain multiple customized furniture items.
- **Auto-Status Transitions** — Order statuses automatically update when supplier items arrive.

### 🏭 Supplier & Fabric Management
- **Supplier Orders** — Break down a customer's order into partial orders distributed across multiple suppliers/craftsmen.
- **Fabric Tracking** — Manage specific fabric requirements (brand, color code, required length) for custom products.
- **Media Upload** — Upload reference photos and fabric materials via Supabase Storage.

### 🧾 Invoicing & Finance
- **Dynamic Invoice Builder** — Generate invoices with automated calculations for taxes, discounts, and down payments (DP).
- **PDF Generation** — Render server-side PDF invoices using React PDF.
- **Payment Tracking** — Monitor cash flow: incoming (customer payments) and outgoing (supplier payments).
- **Edit Protection** — Invoices are locked and can only be modified while in the `DRAFT` status.

### 🛡️ Security & Role Guard
- **Single-Admin Architecture** — The system is strictly hardcoded to allow access exclusively to the primary administrator email (`olyviaudydj@gmail.com`).
- **Supabase Auth** — Supports secure login via Email/Password or Google OAuth.
- **Auto-Sync DB** — Automatically synchronizes the administrator's Supabase Auth account into the public Prisma database upon login.

---

## 💻 Tech Stack

| Category | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) & [Base UI](https://base-ui.com/) |
| **Charts** | [Recharts](https://recharts.org/) |
| **ORM** | [Prisma 7](https://www.prisma.io/) |
| **Database & Auth**| [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage) |
| **PDF Generation** | [@react-pdf/renderer](https://react-pdf.org/) |
| **Linting** | [ESLint 9](https://eslint.org/) |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** >= 20.x ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

### 1. Clone the Repository

```bash
git clone <repo-url>
cd furniture-order-management
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory and populate it with your Supabase credentials:

```env
# === Supabase Client Keys (For Auth & Storage) ===
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR..."

# === Prisma Database Connection ===
# Use port 6543 and pgbouncer=true for the main connection (Pooling)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Use port 5432 for migrations (Direct)
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

#### How to Get These Keys:
| Key | Where to Get It |
|---|---|
| `NEXT_PUBLIC_...` | [Supabase Dashboard](https://supabase.com/) → Settings → API → Project URL & anon public key. |
| `DATABASE_URL` | [Supabase Dashboard](https://supabase.com/) → Settings → Database → Connection String (Select Node.js / Transaction Pooler). |

### 4. Push Schema to Database

Synchronize your local Prisma schema with your Supabase database:

```bash
npx prisma db push
npx prisma generate
```

### 5. Run the Local Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database Schema

The system is designed using a robust relational schema to ensure data integrity across orders, invoices, and finances.

```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : "has"
    CUSTOMER ||--o{ INVOICE : "receives"
    ORDER ||--o{ ORDER_ITEM : "contains"
    ORDER ||--o{ SUPPLIER_ORDER : "requires"
    ORDER ||--o{ FABRIC : "requires"
    ORDER ||--o{ INVOICE : "billed on"
    SUPPLIER ||--o{ SUPPLIER_ORDER : "receives order"
    SUPPLIER ||--o{ FABRIC : "supplies"
    INVOICE ||--o{ INVOICE_ITEM : "details"
    INVOICE ||--o{ PAYMENT : "paid via"
    SUPPLIER_ORDER ||--o{ PAYMENT : "paid via"

    USER {
        string id PK
        string email
        string name
        string role
        string provider
    }

    CUSTOMER {
        string id PK
        string name
        string phone
        string email
    }

    ORDER {
        string id PK
        string orderNumber
        string projectName
        enum status
        datetime deadline
    }

    SUPPLIER_ORDER {
        string id PK
        decimal supplierPrice
        enum status
        enum paymentStatus
    }

    FABRIC {
        string id PK
        string brand
        string colorCode
        decimal metersNeeded
        enum status
    }

    INVOICE {
        string id PK
        string invoiceNumber
        decimal total
        decimal remainingBalance
        enum status
    }

    PAYMENT {
        string id PK
        enum type
        decimal amount
        datetime paymentDate
    }
```

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph Client["Client Layer"]
        Browser["Browser - Next.js App Router\n(React + Tailwind + shadcn/ui)"]
    end

    subgraph Vercel["Vercel - Hosting & Edge"]
        NextApp["Next.js Server Components\n(UI Render & Logic)"]
        APIRoutes["Next.js Server Actions\n(Data Mutation)"]
        PDFGen["PDF Generator\n(React PDF)"]
    end

    subgraph Supabase["Supabase Platform"]
        Auth["Supabase Auth\n(Google OAuth & Email)"]
        DB[("PostgreSQL Database\nvia Prisma ORM")]
        Storage["Supabase Storage\n(Images & Files)"]
    end

    Browser -->|HTTPS| NextApp
    NextApp --> APIRoutes
    APIRoutes -->|Prisma Client| DB
    APIRoutes --> Storage
    APIRoutes --> Auth
    APIRoutes --> PDFGen
    PDFGen -->|Stream PDF| Browser
    NextApp -->|Auto Sync User| Auth

    style Client fill:#F4F3EE,stroke:#CFBB99
    style Vercel fill:#E5D7C4,stroke:#CFBB99
    style Supabase fill:#E5D7C4,stroke:#CFBB99
    style DB fill:#889063,stroke:#354024,color:#fff
```

---

## ☁️ Deployment (Vercel)

This project is configured for a seamless deployment to **Vercel**:
1. Connect this GitHub repository to your Vercel dashboard.
2. Add all 4 Supabase credentials to the **Environment Variables** settings in Vercel.
3. Vercel will automatically detect the Next.js build command. The `"postinstall": "prisma generate"` script has been added to `package.json` to guarantee the Prisma client is generated during the build process.
