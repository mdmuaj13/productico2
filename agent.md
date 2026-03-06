# Productico — Comprehensive Project Documentation

> **Purpose**: This document provides a complete reference for the entire Productico project. It is intended for developers and AI agents to quickly understand the codebase, its APIs, data models, features, and architecture.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Data Models](#4-data-models)
5. [API Endpoints Reference](#5-api-endpoints-reference)
6. [Features](#6-features)
7. [Architecture & Patterns](#7-architecture--patterns)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [Frontend Architecture](#9-frontend-architecture)
10. [Environment Variables](#10-environment-variables)

---

## 1. Project Overview

**Productico** is a full-stack e-commerce management platform built with **Next.js 15** (App Router). It provides:

- An **admin dashboard** for managing products, orders, invoices, stock, expenses, vendors, warehouses, purchase orders, discounts, categories, and storefront configuration.
- A **public storefront** for customers to browse products, add to cart, and checkout.
- A **REST API** layer that powers both the admin UI and public storefront.

The application uses **MongoDB** (via Mongoose) as its database and implements JWT-based authentication with bcrypt password hashing.

---

## 2. Tech Stack

| Layer                | Technology                                       |
| -------------------- | ------------------------------------------------ |
| **Framework**        | Next.js 15 (App Router, Turbopack)               |
| **Language**         | TypeScript                                       |
| **Runtime**          | Bun (package manager)                            |
| **Database**         | MongoDB (Mongoose ODM)                           |
| **Auth**             | JWT (jsonwebtoken) + bcrypt password hashing     |
| **Validation**       | Zod                                              |
| **File Storage**     | Cloudflare R2 (primary) + Cloudinary (secondary) |
| **State Management** | Zustand (client), SWR (server data fetching)     |
| **UI Components**    | Radix UI Primitives + shadcn/ui pattern          |
| **Styling**          | TailwindCSS v4                                   |
| **Forms**            | React Hook Form + @hookform/resolvers            |
| **Charts**           | Recharts                                         |
| **Tables**           | @tanstack/react-table                            |
| **Drag & Drop**      | @dnd-kit                                         |
| **Icons**            | Lucide React, Tabler Icons                       |
| **Notifications**    | Sonner (toast)                                   |
| **Theming**          | next-themes (dark/light mode)                    |

---

## 3. Project Structure

```
productico2/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (login, signup) — guest-only
│   ├── (storefront)/             # Public storefront pages
│   │   ├── _components/          # Storefront UI components
│   │   ├── cart/                  # Shopping cart page
│   │   ├── checkout/             # Checkout flow
│   │   ├── policy/               # Policy pages
│   │   ├── products/             # Product listing & detail pages
│   │   ├── layout.tsx            # Storefront layout
│   │   └── page.tsx              # Storefront homepage
│   ├── api/                      # REST API routes (38 route files)
│   │   ├── auth/                 # Authentication (login, signup, whoami)
│   │   ├── categories/           # Category CRUD
│   │   ├── dashboard/stats/      # Dashboard statistics
│   │   ├── discounts/            # Discount CRUD
│   │   ├── expense-books/        # Expense book CRUD + stats
│   │   ├── expense-entries/      # Expense entry CRUD
│   │   ├── invoice/              # Invoice CRUD
│   │   ├── orders/               # Order CRUD
│   │   ├── products/             # Product CRUD + by-ids + by-slug
│   │   ├── public/               # Public API endpoints (no auth)
│   │   ├── purchase-orders/      # Purchase order CRUD
│   │   ├── stocks/               # Stock CRUD + bulk + adjust
│   │   ├── storefront/           # Storefront config CRUD
│   │   ├── tests/                # Test/debug CRUD
│   │   ├── upload/               # File upload (R2)
│   │   ├── upload-cloudinary/    # File upload (Cloudinary)
│   │   ├── vendors/              # Vendor CRUD
│   │   └── warehouses/           # Warehouse CRUD
│   ├── app/                      # Admin dashboard pages
│   │   ├── dashboard/            # Dashboard with stats & charts
│   │   ├── categories/           # Category management UI
│   │   ├── customers/            # Customer listing UI
│   │   ├── discounts/            # Discount management UI
│   │   ├── expenses/             # Expense tracking UI
│   │   ├── invoice/              # Invoice management UI
│   │   ├── orders/               # Order management UI
│   │   ├── products/             # Product management UI
│   │   ├── purchase-orders/      # Purchase order management UI
│   │   ├── stock/                # Stock management UI
│   │   ├── storefront/           # Storefront CMS UI
│   │   ├── vendors/              # Vendor management UI
│   │   ├── warehouses/           # Warehouse management UI
│   │   ├── layout.tsx            # Admin layout (sidebar + header)
│   │   └── page.tsx              # Admin dashboard home (redirects)
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── favicon.ico
├── components/                   # Shared React components
│   ├── ui/                       # 34 shadcn/ui base components
│   ├── auth/                     # Auth-related components
│   ├── categories/               # Category form & columns
│   ├── customers/                # Customer components
│   ├── discounts/                # Discount form & columns
│   ├── expenses/                 # Expense components
│   ├── invoice/                  # Invoice form & columns
│   ├── orders/                   # Order form & columns
│   ├── products/                 # Product form & columns
│   ├── purchase-orders/          # PO form & columns
│   ├── stocks/                   # Stock form & columns
│   ├── storefront/               # Storefront CMS components
│   ├── vendors/                  # Vendor form & columns
│   ├── warehouses/               # Warehouse form & columns
│   ├── data-table.tsx            # Reusable data table component
│   ├── simple-table.tsx          # Simple table component
│   ├── server-pagination.tsx     # Server-side pagination
│   ├── image-uploader.tsx        # Image upload component
│   ├── app-sidebar.tsx           # Admin sidebar navigation
│   ├── auth-guard.tsx            # Auth route protection
│   ├── guest-guard.tsx           # Guest route protection
│   ├── login-form.tsx            # Login form
│   ├── signup-form.tsx           # Signup form
│   └── ...                       # Other shared components
├── hooks/                        # Custom React hooks (SWR-based)
│   ├── categories.ts             # useCategories, useCategory
│   ├── customers.ts              # useCustomers
│   ├── discounts.ts              # useDiscounts
│   ├── expense-books.ts          # useExpenseBooks
│   ├── expense-entries.ts        # useExpenseEntries
│   ├── invoice.ts                # useInvoices
│   ├── orders.ts                 # useOrders
│   ├── products.ts               # useProducts
│   ├── purchase-orders.ts        # usePurchaseOrders
│   ├── stocks.ts                 # useStocks
│   ├── vendors.ts                # useVendors
│   ├── warehouses.ts             # useWarehouses
│   ├── use-image-upload.ts       # Image upload hook
│   └── use-mobile.ts             # Mobile detection hook
├── lib/                          # Utility libraries
│   ├── api.ts                    # API client helper (fetch wrapper)
│   ├── auth.ts                   # authenticateToken middleware
│   ├── cart.ts                   # Cart utilities (localStorage)
│   ├── cloudinary.ts             # Cloudinary client config
│   ├── db.ts                     # MongoDB connection (cached)
│   ├── jwt.ts                    # JWT generate/verify/extract
│   ├── r2.ts                     # Cloudflare R2 client config
│   ├── upload.ts                 # Upload utilities
│   ├── utils.ts                  # General utilities (cn)
│   ├── utils/                    # Extended utilities
│   │   └── expense.ts            # Expense calculation helpers
│   └── validations/              # Zod validation schemas
│       ├── category.ts
│       ├── discount.ts
│       ├── expense.ts
│       ├── invoice.ts
│       ├── order.ts
│       ├── product.ts
│       ├── publicOrder.ts
│       ├── purchase-order.ts
│       ├── purchaseOrder.ts
│       ├── stock.ts
│       ├── storefront.ts
│       ├── vendor.ts
│       └── warehouse.ts
├── models/                       # Mongoose schemas & models
│   ├── Category.ts
│   ├── Discount.ts
│   ├── ExpenseBook.ts
│   ├── ExpenseEntry.ts
│   ├── Invoice.ts
│   ├── Order.ts
│   ├── Product.ts
│   ├── PurchaseOrder.ts
│   ├── Stock.ts
│   ├── StockMovement.ts
│   ├── Storefront.ts
│   ├── Test.ts
│   ├── User.ts
│   ├── Vendor.ts
│   └── Warehouse.ts
├── store/                        # Zustand stores
│   └── store.ts                  # Auth store (user, token)
├── types/                        # TypeScript types
│   ├── index.ts                  # Re-exports
│   ├── invoice.ts                # Invoice-specific types
│   ├── order.ts                  # Order-specific types
│   └── payload.ts                # ApiSerializer class
└── package.json
```

---

## 4. Data Models

### 4.1 User

| Field       | Type   | Notes                                    |
| ----------- | ------ | ---------------------------------------- |
| `name`      | String | Required                                 |
| `email`     | String | Required, unique                         |
| `password`  | String | Required, hashed with bcrypt (12 rounds) |
| `role`      | String | Default: `'admin'`                       |
| `image`     | String | Nullable                                 |
| `deletedAt` | Date   | Soft delete field                        |
| `createdAt` | Date   | Auto                                     |
| `updatedAt` | Date   | Auto                                     |

**Hooks**: Pre-save bcrypt hashing. Instance method `comparePassword()`.

---

### 4.2 Category

| Field         | Type    | Notes                             |
| ------------- | ------- | --------------------------------- |
| `title`       | String  | Required, unique, trimmed         |
| `slug`        | String  | Unique, auto-generated from title |
| `description` | String  | Optional                          |
| `image`       | String  | Default: `''`                     |
| `serialNo`    | Number  | Default: `0`, for ordering        |
| `isActive`    | Boolean | Default: `true`                   |
| `deletedAt`   | Date    | Soft delete                       |

**Hooks**: Pre-save slug generation from title. **Indexes**: `serialNo`, `deletedAt`, `isActive`.

---

### 4.3 Product

| Field         | Type      | Notes                                   |
| ------------- | --------- | --------------------------------------- |
| `title`       | String    | Required                                |
| `slug`        | String    | Unique, auto-generated                  |
| `thumbnail`   | String    | Optional                                |
| `images`      | String[]  | Array of image URLs                     |
| `description` | String    | Optional                                |
| `shortDetail` | String    | Optional                                |
| `price`       | Number    | Required                                |
| `salePrice`   | Number    | Optional                                |
| `unit`        | String    | Required, default: `'piece'`            |
| `tags`        | String[]  | Array of tags                           |
| `categoryId`  | ObjectId  | Ref → `Category`, required              |
| `variants`    | Variant[] | Embedded: `{ name, price, salePrice? }` |
| `deletedAt`   | Date      | Soft delete                             |

**Indexes**: `categoryId`, `tags`, `deletedAt`.

---

### 4.4 Order

| Field              | Type           | Notes                                      |
| ------------------ | -------------- | ------------------------------------------ |
| `customerName`     | String         | Required                                   |
| `customerMobile`   | String         | Required                                   |
| `customerEmail`    | String         | Optional                                   |
| `customerAddress`  | String         | Required                                   |
| `customerDistrict` | String         | Optional                                   |
| `products`         | OrderProduct[] | Embedded subdocuments                      |
| `code`             | String         | Required, unique (order code)              |
| `trackingCode`     | String         | Unique, sparse                             |
| `subTotal`         | Number         | Sum of line totals                         |
| `total`            | Number         | `subTotal - discount + deliveryCost + tax` |
| `discount`         | Number         | Default: `0`                               |
| `deliveryCost`     | Number         | Default: `0`                               |
| `tax`              | Number         | Default: `0`                               |
| `paid`             | Number         | Default: `0`                               |
| `due`              | Number         | `total - paid`                             |
| `paymentStatus`    | String         | `'unpaid'` / `'partial'` / `'paid'`        |
| `paymentType`      | String         | Default: `'cash'`                          |
| `status`           | String         | Default: `'pending'`                       |
| `remark`           | String         | Optional                                   |
| `eol`              | Boolean        | End of life flag, default: `false`         |
| `createdById`      | ObjectId       | Ref → `User`                               |
| `deletedAt`        | Date           | Soft delete                                |

**OrderProduct** (embedded):
`_id, slug, title, description, shortDetail, thumbnail, basePrice, price, quantity, variantName, variantPrice, variantSalePrice, warehouseId, lineTotal`

**Indexes**: `customerMobile`, `status`, `paymentStatus`, `createdAt`, `deletedAt`.

---

### 4.5 Invoice

| Field            | Type          | Notes                                                  |
| ---------------- | ------------- | ------------------------------------------------------ |
| `clientName`     | String        | Required                                               |
| `clientMobile`   | String        | Required                                               |
| `clientEmail`    | String        | Optional                                               |
| `clientAddress`  | String        | Required                                               |
| `clientDistrict` | String        | Optional                                               |
| `invoiceNo`      | String        | Required, unique                                       |
| `referenceNo`    | String        | Unique, sparse                                         |
| `invoiceDate`    | Date          | Required                                               |
| `dueDate`        | Date          | Required                                               |
| `items`          | InvoiceItem[] | Embedded, min 1 item                                   |
| `subTotal`       | Number        | Calculated                                             |
| `discount`       | Number        | Default: `0`                                           |
| `tax`            | Number        | Default: `0`                                           |
| `total`          | Number        | Calculated                                             |
| `paid`           | Number        | Default: `0`                                           |
| `due`            | Number        | Calculated                                             |
| `paymentStatus`  | String        | `'unpaid'` / `'partial'` / `'paid'`                    |
| `paymentType`    | String        | `'cash'` / `'bank'` / `'bkash'` / `'nagad'` / `'card'` |
| `status`         | String        | `'draft'` / `'sent'` / `'paid'` / `'overdue'`          |
| `notes`          | String        | Optional                                               |
| `terms`          | String        | Optional                                               |
| `isDeleted`      | Boolean       | Default: `false`                                       |
| `createdById`    | ObjectId      | Ref → `User`                                           |
| `deletedAt`      | Date          | Soft delete                                            |

**Hooks**: Pre-save auto-calculates line totals, due amounts, and overdue status.

---

### 4.6 Stock

| Field          | Type     | Notes                          |
| -------------- | -------- | ------------------------------ |
| `productId`    | ObjectId | Ref → `Product`, required      |
| `variantName`  | String   | Nullable (null = base product) |
| `warehouseId`  | ObjectId | Ref → `Warehouse`, required    |
| `quantity`     | Number   | Required, default: `0`         |
| `reorderPoint` | Number   | Default: `10`                  |
| `deletedAt`    | Date     | Soft delete                    |

**Unique Constraint**: `(productId, variantName, warehouseId)` — One stock entry per product-variant-warehouse combination.

---

### 4.7 Discount

| Field            | Type    | Notes                                |
| ---------------- | ------- | ------------------------------------ |
| `code`           | String  | Required, unique, uppercase, trimmed |
| `type`           | String  | `'percentage'` / `'fixed'`           |
| `value`          | Number  | Required, min 0                      |
| `minOrderAmount` | Number  | Default: `0`                         |
| `maxUses`        | Number  | Nullable                             |
| `usedCount`      | Number  | Default: `0`                         |
| `startDate`      | Date    | Nullable                             |
| `endDate`        | Date    | Nullable                             |
| `isActive`       | Boolean | Default: `true`                      |
| `deletedAt`      | Date    | Soft delete                          |

---

### 4.8 Vendor

| Field            | Type   | Notes       |
| ---------------- | ------ | ----------- |
| `name`           | String | Required    |
| `contact_number` | String | Required    |
| `email`          | String | Optional    |
| `address`        | String | Optional    |
| `remarks`        | String | Optional    |
| `deletedAt`      | Date   | Soft delete |

---

### 4.9 Warehouse

| Field         | Type   | Notes                  |
| ------------- | ------ | ---------------------- |
| `title`       | String | Required               |
| `slug`        | String | Unique, auto-generated |
| `description` | String | Optional               |
| `address`     | String | Optional               |
| `deletedAt`   | Date   | Soft delete            |

---

### 4.10 PurchaseOrder

| Field        | Type     | Notes                                                     |
| ------------ | -------- | --------------------------------------------------------- |
| `po_date`    | Date     | Required                                                  |
| `vendor_id`  | ObjectId | Ref → `Vendor`, optional                                  |
| `title`      | String   | Required                                                  |
| `order_info` | String   | Optional                                                  |
| `price`      | Number   | Required, min 0                                           |
| `status`     | String   | `'pending'` / `'approved'` / `'received'` / `'cancelled'` |
| `deletedAt`  | Date     | Soft delete                                               |

---

### 4.11 ExpenseBook

| Field         | Type     | Notes                   |
| ------------- | -------- | ----------------------- |
| `name`        | String   | Required, max 100 chars |
| `description` | String   | Optional, max 500 chars |
| `creditTotal` | Number   | Default: `0`            |
| `debitTotal`  | Number   | Default: `0`            |
| `netBalance`  | Number   | Default: `0`            |
| `userId`      | ObjectId | Ref → `User`            |
| `deletedAt`   | Date     | Soft delete             |

**Virtual**: `entries` → `ExpenseEntry` (via `bookId`).

---

### 4.12 ExpenseEntry

Located at `models/ExpenseEntry.ts`. Fields include:

- `bookId` (ObjectId → ExpenseBook)
- `type` (`'credit'` / `'debit'`)
- `amount` (Number)
- `category` (String)
- `remark` (String)
- `date` (Date)
- `deletedAt` (Date)

---

### 4.13 Storefront

| Field   | Type   | Notes                                                                                           |
| ------- | ------ | ----------------------------------------------------------------------------------------------- |
| `type`  | String | Unique (e.g. `'info'`, `'assets'`, `'social'`, `'contact'`, `'privacy'`, `'terms'`, `'refund'`) |
| `value` | Mixed  | JSON object with arbitrary configuration                                                        |

---

## 5. API Endpoints Reference

### Response Format

All API responses follow a consistent format via `ApiSerializer`:

```json
// Success (200)
{ "status_code": 200, "message": "Success message", "data": {...}, "meta": {...} }

// Created (201)
{ "status_code": 201, "message": "Created successfully", "data": {...} }

// Error (4xx/5xx)
{ "status_code": 400, "message": "Error description" }
```

> **Note**: Some older routes (orders, invoices, expense-books, expense-entries) use raw `NextResponse.json()` instead of `ApiSerializer`.

### Pagination Meta (when applicable)

```json
{ "total": 100, "page": 1, "limit": 10, "totalPages": 10 }
```

---

### 5.1 Authentication

| Method | Endpoint           | Auth | Description                                                           |
| ------ | ------------------ | ---- | --------------------------------------------------------------------- |
| `POST` | `/api/auth/signup` | ❌   | Register a new user. Body: `{ name, email, password, role?, image? }` |
| `POST` | `/api/auth/login`  | ❌   | Login. Body: `{ email, password }`. Returns `{ user, token }`         |
| `GET`  | `/api/auth/whoami` | ✅   | Get current authenticated user data                                   |

---

### 5.2 Categories

| Method   | Endpoint               | Auth | Description                                                                           |
| -------- | ---------------------- | ---- | ------------------------------------------------------------------------------------- |
| `GET`    | `/api/categories`      | ❌   | List categories. Query: `page, limit, search, isActive`                               |
| `POST`   | `/api/categories`      | ✅   | Create category. Body: `{ title, slug?, description?, image?, serialNo?, isActive? }` |
| `GET`    | `/api/categories/[id]` | ❌   | Get single category                                                                   |
| `PUT`    | `/api/categories/[id]` | ✅   | Update category                                                                       |
| `DELETE` | `/api/categories/[id]` | ✅   | Soft delete category                                                                  |

---

### 5.3 Products

| Method   | Endpoint                       | Auth | Description                                                                                                                                     |
| -------- | ------------------------------ | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/api/products`                | ❌   | List products. Query: `page, limit, search, categoryId`. Populates `categoryId`                                                                 |
| `POST`   | `/api/products`                | ✅   | Create product. Body: `{ title, slug, thumbnail?, images?, description?, shortDetail?, price, salePrice?, unit, tags?, categoryId, variants? }` |
| `GET`    | `/api/products/[id]`           | ❌   | Get single product (populates category)                                                                                                         |
| `PUT`    | `/api/products/[id]`           | ✅   | Update product (partial update)                                                                                                                 |
| `DELETE` | `/api/products/[id]`           | ✅   | Soft delete product                                                                                                                             |
| `GET`    | `/api/products/by-ids`         | ❌   | Get products by IDs. Query: `ids=id1,id2,id3`. Preserves order                                                                                  |
| `GET`    | `/api/products/by-slug/[slug]` | ❌   | Get product by slug (populates category)                                                                                                        |

---

### 5.4 Orders

| Method   | Endpoint           | Auth | Description                                                                                                  |
| -------- | ------------------ | ---- | ------------------------------------------------------------------------------------------------------------ |
| `GET`    | `/api/orders`      | ❌   | List orders. Query: `page, limit, search, status, paymentStatus, sortBy, sortOrder`. Populates `createdById` |
| `POST`   | `/api/orders`      | ❌   | Create order. Auto-calculates `subTotal`, `total`, `due`. Validates unique `code`                            |
| `GET`    | `/api/orders/[id]` | ❌   | Get single order (populates creator)                                                                         |
| `PUT`    | `/api/orders/[id]` | ❌   | Update order (partial, recalculates totals if products provided)                                             |
| `DELETE` | `/api/orders/[id]` | ❌   | Soft delete order                                                                                            |

**Order Body Fields**: `customerName, customerMobile, customerEmail?, customerAddress, customerDistrict?, code, trackingCode?, products[], discount, deliveryCost, tax, paid, paymentStatus, paymentType, status, remark?, createdById?`

---

### 5.5 Invoices

| Method   | Endpoint            | Auth | Description                                                                                                                                                     |
| -------- | ------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/api/invoice`      | ❌   | List invoices. Query: `page, limit, search, status, paymentStatus, includeDeleted, sortBy, sortOrder`. Whitelisted sort fields: `invoiceDate, createdAt, total` |
| `POST`   | `/api/invoice`      | ❌   | Create invoice. Auto-calculates totals, derives payment/invoice status                                                                                          |
| `GET`    | `/api/invoice/[id]` | ❌   | Get single invoice                                                                                                                                              |
| `PUT`    | `/api/invoice/[id]` | ❌   | Update invoice (partial, recalculates totals). Protects deletion fields                                                                                         |
| `DELETE` | `/api/invoice/[id]` | ❌   | Soft delete invoice (`isDeleted + deletedAt`)                                                                                                                   |

---

### 5.6 Stocks

| Method   | Endpoint                  | Auth | Description                                                                                                                                                                                                                                   |
| -------- | ------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/api/stocks`             | ❌   | List stocks. Query: `page, limit, productId, warehouseId`. Populates product & warehouse                                                                                                                                                      |
| `POST`   | `/api/stocks`             | ✅   | Create stock (single or bulk). **Single**: `{ productId, variantName?, warehouseId, quantity, reorderPoint? }`. **Bulk**: `{ productId, warehouseId, variants: [{ variantName, quantity, reorderPoint? }] }`. Upserts if stock already exists |
| `GET`    | `/api/stocks/[id]`        | ❌   | Get single stock                                                                                                                                                                                                                              |
| `PATCH`  | `/api/stocks/[id]`        | ✅   | Update stock fields                                                                                                                                                                                                                           |
| `DELETE` | `/api/stocks/[id]`        | ✅   | Soft delete stock                                                                                                                                                                                                                             |
| `PATCH`  | `/api/stocks/[id]/adjust` | ✅   | Deduct stock. Body: `{ quantity, reason }`. Validates sufficient quantity. Logs adjustment                                                                                                                                                    |

---

### 5.7 Vendors

| Method   | Endpoint            | Auth | Description                                                                                  |
| -------- | ------------------- | ---- | -------------------------------------------------------------------------------------------- |
| `GET`    | `/api/vendors`      | ❌   | List vendors. Query: `page, limit, search` (searches name, email, contact, address, remarks) |
| `POST`   | `/api/vendors`      | ✅   | Create vendor. Body: `{ name, contact_number, email?, address?, remarks? }`                  |
| `GET`    | `/api/vendors/[id]` | ❌   | Get single vendor                                                                            |
| `PUT`    | `/api/vendors/[id]` | ✅   | Update vendor                                                                                |
| `DELETE` | `/api/vendors/[id]` | ✅   | Soft delete vendor                                                                           |

---

### 5.8 Warehouses

| Method   | Endpoint               | Auth | Description                                                                      |
| -------- | ---------------------- | ---- | -------------------------------------------------------------------------------- |
| `GET`    | `/api/warehouses`      | ❌   | List warehouses. Query: `page, limit, search`                                    |
| `POST`   | `/api/warehouses`      | ✅   | Create warehouse. Body: `{ title, description?, address? }`. Auto-generates slug |
| `GET`    | `/api/warehouses/[id]` | ❌   | Get single warehouse                                                             |
| `PUT`    | `/api/warehouses/[id]` | ✅   | Update warehouse. Checks slug uniqueness                                         |
| `DELETE` | `/api/warehouses/[id]` | ✅   | Soft delete warehouse                                                            |

---

### 5.9 Purchase Orders

| Method   | Endpoint                    | Auth | Description                                                                                               |
| -------- | --------------------------- | ---- | --------------------------------------------------------------------------------------------------------- |
| `GET`    | `/api/purchase-orders`      | ❌   | List POs. Query: `page, limit, search, status`. Populates vendor                                          |
| `POST`   | `/api/purchase-orders`      | ✅   | Create PO. Can auto-create vendor if `vendor_name` + `vendor_contact_number` provided without `vendor_id` |
| `GET`    | `/api/purchase-orders/[id]` | ❌   | Get single PO (populates vendor)                                                                          |
| `PUT`    | `/api/purchase-orders/[id]` | ✅   | Update PO                                                                                                 |
| `DELETE` | `/api/purchase-orders/[id]` | ✅   | Soft delete PO                                                                                            |

---

### 5.10 Discounts

| Method | Endpoint         | Auth | Description                                                                                                |
| ------ | ---------------- | ---- | ---------------------------------------------------------------------------------------------------------- |
| `GET`  | `/api/discounts` | ❌   | List discounts. Query: `page, limit, search, isActive`                                                     |
| `POST` | `/api/discounts` | ✅   | Create discount. Body: `{ code, type, value, minOrderAmount?, maxUses?, startDate?, endDate?, isActive? }` |

> **Note**: Update and delete endpoints for discounts are not yet implemented in the route file listed. Check for `[id]/route.ts` if needed.

---

### 5.11 Expense Books

| Method   | Endpoint                        | Auth | Description                                                                         |
| -------- | ------------------------------- | ---- | ----------------------------------------------------------------------------------- |
| `GET`    | `/api/expense-books`            | ❌   | List expense books. Query: `page, limit, search`                                    |
| `POST`   | `/api/expense-books`            | ❌   | Create expense book. Body: `{ name, description? }`                                 |
| `GET`    | `/api/expense-books/[id]`       | ❌   | Get single expense book                                                             |
| `PUT`    | `/api/expense-books/[id]`       | ❌   | Update expense book                                                                 |
| `DELETE` | `/api/expense-books/[id]`       | ❌   | Soft delete expense book                                                            |
| `GET`    | `/api/expense-books/[id]/stats` | ❌   | Get book stats: `{ creditTotal, debitTotal, netBalance }` (aggregated from entries) |

---

### 5.12 Expense Entries

| Method   | Endpoint                    | Auth | Description                                                        |
| -------- | --------------------------- | ---- | ------------------------------------------------------------------ |
| `GET`    | `/api/expense-entries`      | ❌   | List entries. Query: `page, limit, bookId, type, category, search` |
| `POST`   | `/api/expense-entries`      | ❌   | Create entry. Recalculates parent book totals                      |
| `GET`    | `/api/expense-entries/[id]` | ❌   | Get single entry (populates book)                                  |
| `PUT`    | `/api/expense-entries/[id]` | ❌   | Update entry. Recalculates book totals                             |
| `DELETE` | `/api/expense-entries/[id]` | ❌   | Soft delete entry. Recalculates book totals                        |

---

### 5.13 Storefront Configuration

| Method | Endpoint          | Auth | Description                                                                                  |
| ------ | ----------------- | ---- | -------------------------------------------------------------------------------------------- |
| `GET`  | `/api/storefront` | ❌   | Get storefront data. Query: `type` (specific type) or `type=all` (returns map keyed by type) |
| `POST` | `/api/storefront` | ✅   | Upsert storefront config. Body: `{ type, value }`                                            |
| `PUT`  | `/api/storefront` | ✅   | Update storefront config. Body: `{ type, value }`                                            |

---

### 5.14 Public APIs (No Auth Required)

| Method | Endpoint                    | Description                                                            |
| ------ | --------------------------- | ---------------------------------------------------------------------- |
| `GET`  | `/api/public`               | Health check — returns `{ message: 'Public API endpoint' }`            |
| `GET`  | `/api/public/products`      | List products for storefront. Query: `page, limit, search, categoryId` |
| `GET`  | `/api/public/products/[id]` | Get single product for storefront                                      |
| `GET`  | `/api/public/storefront`    | Get all storefront configuration data                                  |

---

### 5.15 Dashboard

| Method | Endpoint               | Auth | Description                                                                                                                                                                   |
| ------ | ---------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/api/dashboard/stats` | ❌   | Returns: `totalProducts, totalCategories, totalOrders, lastOrderDate, totalCustomers (unique by mobile), totalVendors, totalWarehouses, pendingPurchaseOrders, lowStockItems` |

---

### 5.16 File Upload

| Method | Endpoint                 | Auth | Description                                                                                                                                          |
| ------ | ------------------------ | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST` | `/api/upload`            | ✅   | Upload to **Cloudflare R2**. FormData: `files` (multi-file), `folder?`. Max 10MB per file. Returns array of file keys. Allowed: JPEG, PNG, WebP, GIF |
| `POST` | `/api/upload-cloudinary` | ✅   | Upload to **Cloudinary**. FormData: `file` (single), `folder?`. Max 10MB. Returns `{ url, public_id, folder }`                                       |

---

### 5.17 Tests (Debug)

| Method   | Endpoint          | Auth | Description                                 |
| -------- | ----------------- | ---- | ------------------------------------------- |
| `GET`    | `/api/tests`      | ❌   | List test records. Query: `page, limit`     |
| `POST`   | `/api/tests`      | ❌   | Create test record. Body: `{ name, value }` |
| `GET`    | `/api/tests/[id]` | ❌   | Get single test record                      |
| `PUT`    | `/api/tests/[id]` | ❌   | Update test record                          |
| `DELETE` | `/api/tests/[id]` | ❌   | **Hard delete** (not soft delete)           |

---

## 6. Features

### 6.1 Admin Dashboard Features

1. **Dashboard Analytics** — Summary cards showing total products, categories, orders, customers, vendors, warehouses, pending POs, and low stock alerts.
2. **Product Management** — Full CRUD with variants (name/price/salePrice), category assignment, image uploads, tags, slug generation.
3. **Category Management** — Full CRUD with slug auto-generation, serial ordering, active/inactive toggle.
4. **Order Management** — Full CRUD with multi-product support, variant selection, warehouse assignment, payment tracking (paid/due/status), delivery cost, tax, and discount calculation.
5. **Invoice Management** — Full CRUD with auto-calculated totals, payment status derivation, due date tracking, overdue auto-detection.
6. **Stock Management** — Single/bulk stock creation, stock adjustment (deduction with reason logging), reorder point alerts, per-variant per-warehouse tracking.
7. **Vendor Management** — Full CRUD for supplier contacts.
8. **Warehouse Management** — Full CRUD for storage locations.
9. **Purchase Order Management** — Full CRUD with vendor linking (auto-creates vendor if not existing), status tracking (pending → approved → received / cancelled).
10. **Discount Management** — Discount code creation with percentage/fixed types, usage limits, date ranges, min order amounts.
11. **Expense Tracking** — Double-entry expense books with credit/debit entries, auto-calculated book balances, per-book statistics.
12. **Storefront CMS** — Configure storefront sections (info, assets, social links, contact, policies) via a flexible type/value system.
13. **Customer Listing** — View customer data aggregated from orders.
14. **Image Upload** — Dual support for Cloudflare R2 and Cloudinary with file type/size validation.

### 6.2 Public Storefront Features

1. **Product Browsing** — Browse products with search, category filtering, and pagination.
2. **Product Detail** — View product details with variants, images, and descriptions.
3. **Shopping Cart** — Client-side cart managed via localStorage utilities.
4. **Checkout Flow** — Multi-step checkout with customer info collection.
5. **Policy Pages** — Dynamic policy pages driven by storefront CMS data.

---

## 7. Architecture & Patterns

### 7.1 API Pattern

Every API route file follows this consistent structure:

```typescript
// 1. Import dependencies
import connectDB from '@/lib/db';
import Model from '@/models/Model';
import { ApiSerializer } from '@/types';
import { authenticateToken } from '@/lib/auth';
import { validationSchema } from '@/lib/validations/model';

// 2. GET: List with pagination, search, filtering
export async function GET(request: NextRequest) {
	await connectDB();
	// Parse query params → build MongoDB query → paginate → return
}

// 3. POST: Create with auth + validation
export async function POST(request: NextRequest) {
	const { error: authError } = await authenticateToken(request);
	if (authError) return authError;
	await connectDB();
	// Validate body → check duplicates → create → return
}
```

### 7.2 Soft Delete Pattern

All resources use a `deletedAt: Date | null` field instead of hard deletion:

- **Create**: `deletedAt` defaults to `null`
- **Query**: Always includes `{ deletedAt: null }` filter
- **Delete**: Sets `deletedAt: new Date()`

### 7.3 Validation Pattern

- All input validation uses **Zod** schemas (in `lib/validations/`)
- Create schemas are strict; update schemas use `.partial()`
- Validation errors return the first issue message with status 400

### 7.4 Authentication Flow

1. Client sends `Authorization: Bearer <token>` header
2. `authenticateToken()` extracts token → verifies JWT → fetches user from DB
3. Returns `{ error, user }` — route checks `if (error) return error`
4. Tokens expire in **7 days**

### 7.5 Database Connection

- Uses a **cached global connection** pattern to prevent connection explosion during hot reloads
- Connection string from `MONGODB_URI` environment variable

### 7.6 Frontend Data Fetching

- **SWR** hooks for all data fetching (auto-revalidation, caching, mutation)
- Each module has a dedicated hook file (e.g., `hooks/products.ts`)
- API calls go through `lib/api.ts` fetch wrapper
- Auth token stored in **Zustand** store (`store/store.ts`)

### 7.7 Component Pattern

Each admin module has a consistent set of components:

- `columns.tsx` — Table column definitions (@tanstack/react-table)
- `form.tsx` — Create/edit form (react-hook-form + zod resolver)
- `dialog.tsx` — Modal dialog wrapper
- `page.tsx` — Page wrapper with data table

---

## 8. Authentication & Authorization

| Aspect               | Details                                                             |
| -------------------- | ------------------------------------------------------------------- |
| **Strategy**         | JWT Bearer tokens                                                   |
| **Password Hashing** | bcrypt with 12 salt rounds                                          |
| **Token Expiry**     | 7 days                                                              |
| **Token Payload**    | `{ userId, email, role }`                                           |
| **Auth Middleware**  | `lib/auth.ts` → `authenticateToken()`                               |
| **Route Protection** | Admin routes require `Authorization: Bearer <token>` header         |
| **Client Guards**    | `AuthGuard` (for protected pages) and `GuestGuard` (for auth pages) |

> **Note**: Most CRUD write operations (POST, PUT, DELETE) require authentication. GET (read) operations are generally public.

---

## 9. Frontend Architecture

### 9.1 Route Groups

| Route Group    | Purpose                        | Layout                                   |
| -------------- | ------------------------------ | ---------------------------------------- |
| `(auth)`       | Login/Signup pages             | Guest guard (redirects if authenticated) |
| `(storefront)` | Public-facing e-commerce pages | Storefront layout with header/footer     |
| `app`          | Admin dashboard                | Auth guard + sidebar + header            |

### 9.2 State Management

- **Server State**: SWR (cache, revalidation, optimistic updates)
- **Client State**: Zustand store for auth (user info, token, login/logout methods)
- **Cart State**: LocalStorage via `lib/cart.ts` utilities

### 9.3 UI Component Library

Built on **shadcn/ui** pattern (34 base components in `components/ui/`):

- Form controls: Button, Input, Label, Select, Checkbox, Textarea, etc.
- Layout: Dialog, Sheet, Popover, Tabs, Separator, Sidebar, etc.
- Data display: Table, Avatar, Badge, Tooltip, etc.
- Theme: next-themes for dark/light mode support

### 9.4 Reusable Components

- **`DataTable`** — Feature-rich table with sorting, filtering, column visibility, pagination, row selection, and bulk actions
- **`SimpleTable`** — Lighter table variant
- **`ServerPagination`** — Server-side pagination controls
- **`ImageUploader`** — Drag-and-drop image upload with preview
- **`SearchableDropdownWithCustom`** — Searchable select with add-new option

---

## 10. Environment Variables

```env
# Database
MONGODB_URI=mongodb+srv://...

# Authentication
JWT_SECRET=your-secret-key

# Cloudflare R2 (primary file storage)
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_PUBLIC_URL=...

# Cloudinary (secondary file storage)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_PATH=...
```

---

## Quick Reference: API Endpoint Count

| Module            | Endpoints | Auth Required (Write)             |
| ----------------- | --------- | --------------------------------- |
| Auth              | 3         | No (signup/login are public)      |
| Categories        | 5         | Yes (POST, PUT, DELETE)           |
| Products          | 7         | Yes (POST, PUT, DELETE)           |
| Orders            | 5         | No                                |
| Invoices          | 5         | No                                |
| Stocks            | 6         | Yes (POST, PATCH, DELETE, adjust) |
| Vendors           | 5         | Yes (POST, PUT, DELETE)           |
| Warehouses        | 5         | Yes (POST, PUT, DELETE)           |
| Purchase Orders   | 5         | Yes (POST, PUT, DELETE)           |
| Discounts         | 2         | Yes (POST)                        |
| Expense Books     | 6         | No                                |
| Expense Entries   | 5         | No                                |
| Storefront Config | 3         | Yes (POST, PUT)                   |
| Public            | 4         | No                                |
| Dashboard         | 1         | No                                |
| Upload            | 2         | Yes                               |
| Tests (Debug)     | 5         | No                                |
| **Total**         | **~74**   |                                   |
