# Productico Architecture Document

> **Purpose**: This document captures the complete UI, design, component architecture, state management, and data layer of the Productico project so that any LLM or developer can recreate the exact same application from scratch.

---

## 1. Technology Stack

| Layer             | Technology                              | Version |
| ----------------- | --------------------------------------- | ------- |
| Framework         | Next.js (App Router, Turbopack)         | 15.5.x  |
| Runtime           | Bun                                     | 1.1.43  |
| Language          | TypeScript                              | 5.9.x   |
| UI Library        | React                                   | 19.1.0  |
| Styling           | Tailwind CSS v4 + `tw-animate-css`      | 4.1.x   |
| Component Library | shadcn/ui (Radix UI primitives)         | —       |
| Icons             | `@tabler/icons-react` + `lucide-react`  | —       |
| State Management  | Zustand (with `persist` middleware)     | 5.0.x   |
| Data Fetching     | SWR                                     | 2.3.x   |
| Forms             | React Hook Form + `@hookform/resolvers` | 7.69.x  |
| Validation        | Zod                                     | 4.2.x   |
| Database          | MongoDB via Mongoose                    | 8.20.x  |
| Auth              | JWT (`jsonwebtoken`) + bcryptjs         | —       |
| Charts            | Recharts                                | 3.6.x   |
| DnD               | `@dnd-kit/core` + `@dnd-kit/sortable`   | —       |
| Toast             | Sonner                                  | 2.0.x   |
| Date utils        | date-fns                                | 4.1.x   |
| Slug generation   | slugify                                 | 1.6.x   |
| File Upload       | Cloudinary + Cloudflare R2 (S3 SDK)     | —       |
| Drawer            | vaul                                    | 1.1.x   |
| Theme             | next-themes                             | 0.4.x   |

---

## 2. Project Directory Structure

```
productico2/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (fonts, metadata)
│   ├── globals.css               # Tailwind v4 theme + design tokens
│   ├── (auth)/                   # Auth route group (no layout chrome)
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (storefront)/             # Public storefront route group
│   │   ├── layout.tsx            # StorefrontHeader + StorefrontFooter
│   │   ├── page.tsx              # Home (Hero + Featured + Policies)
│   │   ├── _components/          # Storefront-only components
│   │   ├── cart/                  # Cart page
│   │   ├── checkout/              # Checkout + success
│   │   ├── products/              # Product listing + [slug] detail
│   │   └── policy/               # Policy page
│   ├── app/                      # Admin panel route group
│   │   ├── layout.tsx            # AuthGuard + SidebarProvider + AppSidebar
│   │   ├── page.tsx              # Admin home (redirects/shows dashboard link)
│   │   ├── dashboard/            # Dashboard with stats + recent orders
│   │   ├── products/             # Products CRUD page
│   │   ├── categories/           # Categories CRUD page
│   │   ├── orders/               # Orders CRUD page
│   │   ├── customers/            # Customers page
│   │   ├── discounts/            # Discounts CRUD page
│   │   ├── stock/                # Stock management page
│   │   ├── warehouses/           # Warehouses CRUD page
│   │   ├── vendors/              # Vendors CRUD page
│   │   ├── purchase-orders/      # Purchase orders page
│   │   ├── expenses/             # Expense books + entries
│   │   ├── invoice/              # Invoice CRUD page
│   │   └── storefront/           # Storefront settings page
│   └── api/                      # API Route Handlers
│       ├── auth/                 # login, signup, me
│       ├── products/             # CRUD + by-ids, by-slug
│       ├── categories/           # CRUD
│       ├── orders/               # CRUD
│       ├── discounts/            # CRUD + validate
│       ├── stocks/               # CRUD + movements
│       ├── warehouses/           # CRUD
│       ├── vendors/              # CRUD
│       ├── purchase-orders/      # CRUD
│       ├── expense-books/        # CRUD
│       ├── expense-entries/      # CRUD
│       ├── invoice/              # CRUD
│       ├── dashboard/            # Stats endpoint
│       ├── storefront/           # Storefront config
│       ├── public/               # Public API (products, orders, etc.)
│       ├── upload/               # R2 file upload
│       └── upload-cloudinary/    # Cloudinary file upload
├── components/                   # Shared React components
│   ├── ui/                       # shadcn/ui primitives (34 components)
│   ├── products/                 # Product feature components
│   ├── orders/                   # Order feature components
│   ├── categories/               # Category feature components
│   ├── customers/                # Customer feature components
│   ├── discounts/                # Discount feature components
│   ├── stocks/                   # Stock feature components
│   ├── warehouses/               # Warehouse feature components
│   ├── vendors/                  # Vendor feature components
│   ├── purchase-orders/          # Purchase order feature components
│   ├── expenses/                 # Expense feature components
│   ├── invoice/                  # Invoice feature components
│   ├── storefront/               # Storefront config components
│   ├── dashboard/                # Dashboard components
│   ├── auth/                     # Auth-specific UI
│   ├── app-sidebar.tsx           # Admin sidebar navigation
│   ├── site-header.tsx           # Admin top header bar
│   ├── nav-main.tsx              # Main nav section
│   ├── nav-documents.tsx         # Documents nav section
│   ├── nav-user.tsx              # User profile nav
│   ├── auth-guard.tsx            # Route protection wrapper
│   ├── guest-guard.tsx           # Redirect authed users away
│   ├── login-form.tsx            # Login form
│   ├── signup-form.tsx           # Signup form
│   ├── data-table.tsx            # Advanced DataTable (DnD, charts)
│   ├── simple-table.tsx          # Lightweight reusable table
│   ├── server-pagination.tsx     # Server-side pagination controls
│   ├── image-uploader.tsx        # Image upload widget
│   ├── section-cards.tsx         # Dashboard stat cards
│   ├── chart-area-interactive.tsx # Area chart component
│   └── searchable-dropdown-with-custom.tsx
├── hooks/                        # Custom React hooks (data layer)
│   ├── products.ts
│   ├── orders.ts
│   ├── categories.ts
│   ├── customers.ts
│   ├── discounts.ts
│   ├── stocks.ts
│   ├── warehouses.ts
│   ├── vendors.ts
│   ├── purchase-orders.ts
│   ├── invoice.ts
│   ├── expense-books.ts
│   ├── expense-entries.ts
│   ├── use-image-upload.ts
│   └── use-mobile.ts
├── lib/                          # Shared utilities
│   ├── api.ts                    # SWR fetcher + apiCall helper
│   ├── auth.ts                   # Server-side auth middleware
│   ├── jwt.ts                    # JWT sign/verify helpers
│   ├── db.ts                     # Mongoose connection (cached)
│   ├── utils.ts                  # cn() utility (clsx + tailwind-merge)
│   ├── cart.ts                   # Cart helpers
│   ├── cloudinary.ts             # Cloudinary config
│   ├── r2.ts                     # R2 S3 config
│   ├── upload.ts                 # Upload helpers
│   ├── utils/                    # Extra utilities
│   │   ├── expense.ts
│   │   └── form-error.ts
│   └── validations/              # Zod schemas
│       ├── product.ts
│       ├── order.ts
│       ├── category.ts
│       ├── invoice.ts
│       ├── discount.ts
│       ├── stock.ts
│       ├── vendor.ts
│       ├── warehouse.ts
│       ├── purchase-order.ts
│       ├── purchaseOrder.ts
│       ├── expense.ts
│       ├── storefront.ts
│       └── publicOrder.ts
├── models/                       # Mongoose schemas/models
│   ├── User.ts
│   ├── Product.ts
│   ├── Category.ts
│   ├── Order.ts
│   ├── Invoice.ts
│   ├── Discount.ts
│   ├── Warehouse.ts
│   ├── Stock.ts
│   ├── StockMovement.ts
│   ├── Vendor.ts
│   ├── PurchaseOrder.ts
│   ├── ExpenseBook.ts
│   ├── ExpenseEntry.ts
│   ├── Storefront.ts
│   └── Test.ts
├── store/                        # Zustand stores
│   └── store.ts                  # Auth store (persisted)
├── types/                        # Shared TypeScript types
│   ├── index.ts                  # Re-exports
│   ├── payload.ts                # ApiSerializer class
│   ├── order.ts
│   └── invoice.ts
└── public/                       # Static assets
```

---

## 3. Design System & Theming

### 3.1 Fonts

Four Google Fonts loaded in the root layout with CSS custom properties:

| Font                 | Variable                  | Usage                                    |
| -------------------- | ------------------------- | ---------------------------------------- |
| **Geist**            | `--font-geist-sans`       | Primary body/UI font                     |
| **Geist Mono**       | `--font-geist-mono`       | Code, tabular numbers                    |
| **Instrument Serif** | `--font-instrument-serif` | Section headings (dashboard, list pages) |
| **DM Sans**          | `--font-dm-sans`          | Storefront headings                      |

Root layout applies all four via class `${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${dmSans.variable} antialiased` on `<body>`.

### 3.2 Color System (oklch)

Uses oklch color space via CSS custom properties in `globals.css`. Light and dark themes defined with `:root` and `.dark` selectors.

**Light theme (monochrome):**

```css
:root {
	--background: oklch(0.99 0 0); /* near-white */
	--foreground: oklch(0 0 0); /* black */
	--card: oklch(1 0 0); /* white */
	--primary: oklch(0 0 0); /* black */
	--primary-foreground: oklch(1 0 0); /* white */
	--secondary: oklch(0.94 0 0); /* light gray */
	--muted: oklch(0.97 0 0); /* very light gray */
	--muted-foreground: oklch(0.44 0 0); /* medium gray */
	--accent: oklch(0.94 0 0);
	--destructive: oklch(0.63 0.19 23.03); /* red */
	--border: oklch(0.92 0 0);
	--input: oklch(0.94 0 0);
	--ring: oklch(0 0 0);
	--radius: 0.5rem;
	--spacing: 0.25rem;
}
```

**Dark theme:**

```css
.dark {
	--background: oklch(0 0 0); /* black */
	--foreground: oklch(1 0 0); /* white */
	--card: oklch(0.14 0 0); /* dark gray */
	--primary: oklch(1 0 0); /* white */
	--muted: oklch(0.23 0 0);
	--muted-foreground: oklch(0.72 0 0);
	--border: oklch(0.26 0 0);
	/* ... same structure, inverted */
}
```

**Chart colors:** Amber (`oklch(0.81 0.17 75.35)`) and Blue (`oklch(0.55 0.22 264.53)`) for chart-1 and chart-2.

### 3.3 Tailwind v4 Configuration

Uses Tailwind CSS v4 with `@theme inline` block that maps CSS custom properties to Tailwind utility classes:

- `--color-*` → `bg-background`, `text-foreground`, etc.
- `--radius-*` → `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`
- `--shadow-*` → `shadow-xs` through `shadow-2xl`
- Base layer: `border-border outline-ring/50` on `*`, `bg-background text-foreground` on `body`

### 3.4 Animations

Key animation used throughout:

```css
@keyframes fadeInUp {
	from {
		opacity: 0;
		transform: translateY(10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
```

Applied inline with staggered delays: `style={{ animation: 'fadeInUp 0.4s ease-out backwards', animationDelay: '${idx * 40}ms' }}` for list items.

---

## 4. Application Architecture

### 4.1 Route Groups

The app uses Next.js route groups to separate concerns:

| Route Group    | Path                                   | Purpose             | Layout                                                |
| -------------- | -------------------------------------- | ------------------- | ----------------------------------------------------- |
| `(auth)`       | `/login`, `/signup`                    | Auth pages          | Minimal (no sidebar)                                  |
| `(storefront)` | `/`, `/products`, `/cart`, `/checkout` | Public-facing store | StorefrontHeader + StorefrontFooter                   |
| `app`          | `/app/*`                               | Admin panel         | AuthGuard + SidebarProvider + AppSidebar + SiteHeader |

### 4.2 Admin Panel Layout

```
AuthGuard
└── SidebarProvider (--sidebar-width: calc(var(--spacing) * 72), --header-height: calc(var(--spacing) * 12))
    ├── AppSidebar (variant="inset", collapsible="offcanvas")
    │   ├── SidebarHeader → Logo link (/app)
    │   ├── SidebarContent
    │   │   ├── NavMain (13 items: Dashboard, Warehouses, Products, Discounts, Categories, Orders, Customers, Stock, Vendors, Purchase Orders, Expenses, Invoice)
    │   │   └── NavDocuments (Storefront, Order Tracking)
    │   └── SidebarFooter → NavUser (user avatar + logout)
    └── SidebarInset
        ├── SiteHeader
        └── <div>{children}</div>
```

**Sidebar navigation items** (in order):

1. Dashboard (`/app/dashboard`, IconDashboard)
2. Warehouses (`/app/warehouses`, IconBuilding)
3. Products (`/app/products`, IconPackage)
4. Discounts (`/app/discounts`, IconDiscount)
5. Categories (`/app/categories`, IconFolder)
6. Orders (`/app/orders`, IconShoppingCart)
7. Customers (`/app/customers`, IconUsers)
8. Stock (`/app/stock`, IconDatabase)
9. Vendors (`/app/vendors`, IconTruck)
10. Purchase Orders (`/app/purchase-orders`, IconFileInvoice)
11. Expenses (`/app/expenses`, IconReceipt)
12. Invoice (`/app/invoice`, IconFileInvoice)

**Documents section:**

- Storefront (`/app/storefront`, IconReport)
- Order Tracking (`/app/track`, IconListDetails)

### 4.3 Storefront Layout

The storefront is a server-rendered public layout:

- Fetches storefront config from `/api/storefront?type=all` in a server component
- Layout: `min-h-screen bg-gradient-to-b from-gray-50 via-white to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-900`
- Home page sections: `StorefrontHero` → `StorefrontFeatured` → `StorefrontPolicyPreview`
- Products are fetched by IDs from the featured config

---

## 5. Authentication System

### 5.1 Server-Side (API Routes)

1. **`lib/jwt.ts`**: JWT sign/verify with 7-day expiry using `jsonwebtoken`
2. **`lib/auth.ts`**: `authenticateToken(request)` middleware that:
   - Extracts Bearer token from `Authorization` header
   - Verifies the JWT
   - Looks up the user in MongoDB
   - Returns `{ error, user }` tuple

3. **API route pattern** (every protected endpoint):
   ```typescript
   const { error: authError } = await authenticateToken(request);
   if (authError) return authError;
   ```

### 5.2 Client-Side

1. **Zustand store** (`store/store.ts`):
   - State: `user`, `token`, `isAuthenticated`, `error`, `loading`
   - Actions: `login(user, token)`, `logout()`, `setError()`, `setLoading()`, `clearError()`
   - Persisted to `localStorage` via Zustand `persist` middleware, key: `auth-storage`

2. **`AuthGuard` component** (`components/auth-guard.tsx`):
   - Checks `isAuthenticated` from Zustand store
   - Waits 100ms for hydration from localStorage
   - Redirects to `/login` if not authenticated
   - Shows empty loading screen during hydration

3. **`GuestGuard` component**: Redirects authenticated users away from auth pages

4. **Login flow**:
   - `LoginForm` calls `apiCall('/api/auth/login', { method: 'POST', body })`
   - On success (`status_code === 200`): calls `login(data.data.user, data.data.token)` on the store, then `router.push('/app')`

---

## 6. Data Layer Architecture

### 6.1 Database Connection (`lib/db.ts`)

Cached Mongoose connection using global variable to prevent connection multiplication during hot-reload:

```typescript
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB(): Promise<Mongoose> {
	if (cached.conn) return cached.conn;
	if (!cached.promise)
		cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
	cached.conn = await cached.promise;
	return cached.conn;
}
```

### 6.2 API Client (`lib/api.ts`)

Two exports:

1. **`useApi(url)`** — SWR-based hook for GET requests:
   - Reads token from Zustand store
   - Passes to `fetcher(url, token)`
   - Auto-handles 401 → logout + redirect to `/login`

2. **`apiCall(url, options)`** — Imperative fetch for mutations (POST/PUT/DELETE):
   - Injects Bearer token from store
   - Handles `Content-Type` (skips for FormData)
   - Auto-handles 401

### 6.3 API Response Serializer (`types/payload.ts`)

Standardized response format via `ApiSerializer` class:

```typescript
class ApiSerializer {
	static success<T>(data: T, message: string, meta?: Record<string, unknown>);
	// → { status_code: 200, message, data, meta? }

	static created<T>(data: T, message: string);
	// → { status_code: 201, message, data }

	static error(message: string, statusCode: number);
	// → { status_code, message } with HTTP status

	static notFound(message: string);
	// → { status_code: 404, message }
}
```

### 6.4 Custom Hooks Pattern

Every feature module follows this exact pattern in `hooks/<module>.ts`:

```typescript
'use client';
import { useApi, apiCall } from '@/lib/api';

// 1. TypeScript interfaces for the response shape
interface Item {
	_id: string; /* fields */
}
interface ListResponse {
	data: Item[];
	meta: { total; page; limit; totalPages };
}

// 2. List hook with server-side pagination + filters
export const useItems = (params?: {
	page?: number;
	limit?: number;
	search?: string; /* module-specific filters */
}) => {
	const queryParams = new URLSearchParams();
	// build query string from params...
	return useApi(`/api/items?${queryParams.toString()}`);
};

// 3. Single item hook
export const useItem = (id: string) => useApi(`/api/items/${id}`);

// 4. Mutation functions (not hooks, called imperatively)
export const createItem = async (data: CreateData) =>
	apiCall('/api/items', { method: 'POST', body: JSON.stringify(data) });
export const updateItem = async (id: string, data: UpdateData) =>
	apiCall(`/api/items/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteItem = async (id: string) =>
	apiCall(`/api/items/${id}`, { method: 'DELETE' });
```

### 6.5 Validation Schemas (`lib/validations/`)

Each module has Zod schemas:

```typescript
// createXxxSchema — all required fields
// updateXxxSchema — all fields optional (partial update)
// Type exports: CreateXxxData, UpdateXxxData
```

Validated server-side in API routes:

```typescript
const validation = createProductSchema.safeParse(body);
if (!validation.success)
	return ApiSerializer.error(validation.error.issues[0].message, 400);
```

---

## 7. API Route Pattern

Every API route handler in `app/api/<module>/route.ts` follows this structure:

### GET (List with pagination):

```typescript
export async function GET(request: NextRequest) {
	await connectDB();

	// 1. Parse query params
	const { searchParams } = request.nextUrl;
	const page = parseInt(searchParams.get('page') || '1');
	const limit = parseInt(searchParams.get('limit') || '10');
	const search = searchParams.get('search') || '';

	// 2. Build query (always filter deletedAt: null for soft-delete)
	const query: Record<string, unknown> = { deletedAt: null };
	if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }];

	// 3. Execute with populate, sort, skip, limit
	const items = await Model.find(query)
		.populate('refField', 'selectedFields')
		.sort({ createdAt: -1 })
		.skip((page - 1) * limit)
		.limit(limit)
		.lean();

	const total = await Model.countDocuments(query);
	const meta = { total, page, limit, totalPages: Math.ceil(total / limit) };

	return ApiSerializer.success(items, 'Retrieved successfully', meta);
}
```

### POST (Create):

```typescript
export async function POST(request: NextRequest) {
	const { error: authError } = await authenticateToken(request);
	if (authError) return authError;

	await connectDB();
	const body = await request.json();

	const validation = createSchema.safeParse(body);
	if (!validation.success)
		return ApiSerializer.error(validation.error.issues[0].message, 400);

	const item = await Model.create(validation.data);
	return ApiSerializer.created(item, 'Created successfully');
}
```

### Dynamic routes `[id]/route.ts`:

- **GET**: Find by ID + populate
- **PUT**: Authenticate + validate + findByIdAndUpdate
- **DELETE**: Authenticate + soft-delete (set `deletedAt: new Date()`)

---

## 8. Mongoose Model Patterns

### 8.1 Common Conventions

Every model follows:

1. **TypeScript interface** (`IModelName`) defining the shape
2. **Mongoose Schema** with validation messages and defaults
3. **`timestamps: true`** for `createdAt`/`updatedAt`
4. **Soft delete** via `deletedAt: { type: Date, default: null }`
5. **Indexes** for performance
6. **Model export**: `models.ModelName || model<IModelName>('ModelName', schema)`

### 8.2 All Models

#### User

```
name: String (required)
email: String (required, unique)
password: String (required, auto-hashed via bcrypt)
role: String (default: 'admin')
image: String (nullable)
deletedAt: Date
```

Pre-save: Hash password. Method: `comparePassword()`.

#### Product

```
title: String (required)
slug: String (unique, auto-generated from title)
thumbnail: String
images: [String]
description: String
shortDetail: String
price: Number (required)
salePrice: Number
unit: String (default: 'piece')
tags: [String]
categoryId: ObjectId → Category (required)
variants: [{ name: String, price: Number, salePrice: Number }]
deletedAt: Date
```

Indexes: categoryId, tags, deletedAt.

#### Category

```
title: String (required, unique, trim)
slug: String (unique, auto-generated)
description: String
image: String
serialNo: Number (default: 0)
isActive: Boolean (default: true)
deletedAt: Date
```

Indexes: serialNo, deletedAt, isActive.

#### Order

```
customerName/Mobile/Email/Address/District: Customer info
products: [OrderProduct] — embedded subdoc with _id, slug, title, thumbnail, basePrice, price, quantity, variantName/Price/SalePrice, warehouseId, lineTotal
code: String (unique)
trackingCode: String (unique/sparse)
subTotal/total/discount/deliveryCost/tax: Number (pricing)
paid/due: Number (payment tracking)
paymentStatus: 'unpaid' | 'partial' | 'paid'
paymentType: 'cash' | 'card' | 'bkash' | 'nagad' | 'rocket' | 'bank'
status: 'pending' | 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
remark: String
eol: Boolean (end of life flag)
createdById: ObjectId → User
deletedAt: Date
```

Virtual: `user` (populated from createdById). Pre-save: Calculate line totals + due.

#### Invoice

Similar structure to Order but for invoicing:

```
clientName/Mobile/Email/Address/District
invoiceNo: String (unique)
referenceNo: String (unique/sparse)
invoiceDate/dueDate: Date
items: [InvoiceItem] — same structure as OrderProduct
subTotal/discount/tax/total/paid/due: Financial fields
paymentStatus: 'unpaid' | 'partial' | 'paid'
paymentType: 'cash' | 'bank' | 'bkash' | 'nagad' | 'card'
status: 'draft' | 'sent' | 'paid' | 'overdue'
notes/terms: String
isDeleted: Boolean
createdById: ObjectId → User
deletedAt: Date
```

Pre-save: Calculate line totals, due amount, auto-mark overdue.

#### Discount

```
code: String (required, unique, uppercase)
type: 'percentage' | 'fixed'
value: Number (required)
minOrderAmount: Number (default: 0)
maxUses: Number (nullable)
usedCount: Number (default: 0)
startDate/endDate: Date
isActive: Boolean (default: true)
deletedAt: Date
```

#### Warehouse

```
title: String (required)
slug: String (unique, auto-generated)
description: String
address: String
deletedAt: Date
```

#### Stock

```
productId: ObjectId → Product (required)
variantName: String (null = base product)
warehouseId: ObjectId → Warehouse (required)
quantity: Number (default: 0)
reorderPoint: Number (default: 10)
deletedAt: Date
```

Unique compound index: `{ productId, variantName, warehouseId }`.

#### StockMovement

```
productId: ObjectId → Product
variantName: String
warehouseId: ObjectId → Warehouse
type: 'purchase' | 'sale' | 'adjustment' | 'transfer' | 'return' | 'damage'
quantity: Number (positive = incoming, negative = outgoing)
referenceId/referenceType: For linking to orders/POs
previousQuantity/newQuantity: Number
notes: String
createdBy: ObjectId → User
deletedAt: Date
```

Timestamps: only `createdAt`.

#### Vendor

```
name: String (required)
contact_number: String (required)
email/address/remarks: String
deletedAt: Date
```

#### PurchaseOrder

```
po_date: Date (required)
vendor_id: ObjectId → Vendor
title: String (required)
order_info: String
price: Number (required)
status: 'pending' | 'approved' | 'received' | 'cancelled'
deletedAt: Date
```

#### ExpenseBook

```
name: String (required, max 100)
description: String (max 500)
creditTotal/debitTotal/netBalance: Number
userId: ObjectId → User
deletedAt: Date
```

Virtual: `entries` → ExpenseEntry collection.

#### ExpenseEntry

```
bookId: ObjectId → ExpenseBook (required)
type: 'credit' | 'debit' (required)
amount: Number (required, min 0.01)
date: Date (required)
time: String
remark: String (max 500)
category: String (max 100)
userId: ObjectId → User
deletedAt: Date
```

#### Storefront

```
type: String (unique) — 'info' | 'contact' | 'featured' | 'terms' | 'privacy' | 'refund'
value: Mixed (flexible JSON for each type)
```

Key-value store pattern for storefront configuration.

---

## 9. UI Component Architecture

### 9.1 shadcn/ui Base Components (`components/ui/`)

34 primitives, all following shadcn/ui conventions:

| Component           | Source                       | Notes                                                                                     |
| ------------------- | ---------------------------- | ----------------------------------------------------------------------------------------- |
| avatar              | Radix Avatar                 |                                                                                           |
| badge               | CVA variants                 | `default`, `secondary`, `destructive`, `outline`                                          |
| breadcrumb          | Custom                       |                                                                                           |
| button              | CVA + Radix Slot             | Variants: `default/destructive/outline/secondary/ghost/link`, Sizes: `default/sm/lg/icon` |
| card                | Custom                       | Card/CardHeader/CardTitle/CardDescription/CardContent/CardFooter                          |
| chart               | Recharts wrapper             | ChartContainer/ChartTooltip/ChartTooltipContent                                           |
| checkbox            | Radix Checkbox               |                                                                                           |
| command             | cmdk                         | Command palette                                                                           |
| confirmation-dialog | Custom                       | Reusable delete/confirm dialog                                                            |
| date-picker         | Custom                       | Date selection                                                                            |
| dialog              | Radix Dialog                 |                                                                                           |
| drawer              | vaul                         | Responsive, bottom on mobile                                                              |
| dropdown-menu       | Radix DropdownMenu           |                                                                                           |
| entity-view         | Custom                       | Generic entity detail viewer                                                              |
| form                | React Hook Form + Radix      | Form/FormField/FormItem/FormLabel/FormControl/FormMessage                                 |
| image-upload        | Custom                       | Drag-and-drop image upload                                                                |
| input               | Native input styled          |                                                                                           |
| label               | Radix Label                  |                                                                                           |
| popover             | Radix Popover                |                                                                                           |
| select              | Radix Select                 |                                                                                           |
| separator           | Radix Separator              |                                                                                           |
| sheet               | Radix Dialog (sheet variant) | Side panel, responsive: `bottom` on mobile, `right` on desktop                            |
| sidebar             | Custom complex               | Sidebar/SidebarContent/SidebarHeader/SidebarFooter/SidebarMenu/etc.                       |
| skeleton            | Custom                       | Loading placeholder                                                                       |
| sonner              | Sonner wrapper               | Toast notifications                                                                       |
| stat-card           | Custom                       | Dashboard statistic card                                                                  |
| table               | Native table styled          | Table/TableHeader/TableBody/TableRow/TableHead/TableCell                                  |
| tabs                | Radix Tabs                   |                                                                                           |
| textarea            | Native textarea styled       |                                                                                           |
| toggle-group        | Radix ToggleGroup            |                                                                                           |
| toggle              | Radix Toggle                 |                                                                                           |
| tooltip             | Radix Tooltip                |                                                                                           |
| view-field          | Custom                       | Label + value display for detail views                                                    |

### 9.2 Reusable Shared Components

#### SimpleTable (`components/simple-table.tsx`)

Generic table built on `@tanstack/react-table`:

```typescript
interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => ReactNode;
  mobileMaxChars?: number;
}

interface Action<T> {
  label: ReactElement | string;
  onClick: (row: T) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: (row: T) => boolean;
}

<SimpleTable data={items} columns={columns} actions={actions} showPagination={false} />
```

- Auto-truncates text on mobile via `mobileDefaultMaxChars`
- Supports separate `mobileColumns` for responsive column sets
- Built-in client-side pagination (hidden when `showPagination={false}`)
- Row hover: `hover:bg-muted/30`
- Header: `text-xs font-medium uppercase tracking-wider text-muted-foreground p-3`

#### ServerPagination (`components/server-pagination.tsx`)

Server-side pagination controls:

```typescript
<ServerPagination
  page={page}           // 1-based
  totalPages={totalPages}
  total={total}
  limit={limit}
  showingCount={items.length}
  onPageChange={(nextPage) => setPage(nextPage)}
  onLimitChange={(nextLimit) => { setLimit(nextLimit); setPage(1); }}
/>
```

- Shows: "Showing X of Y results" (desktop) / "X / Y" (mobile)
- Page size selector: [10, 20, 30, 40, 50]
- Navigation: First/Prev/Next/Last buttons (First/Last hidden on mobile)

#### ConfirmationDialog (`components/ui/confirmation-dialog.tsx`)

Reusable confirmation modal:

```typescript
<ConfirmationDialog
  open={open}
  onOpenChange={setOpen}
  onConfirm={handleConfirm}
  title="Delete Product"
  description={`Are you sure you want to delete "${name}"?`}
  confirmText="Delete"
  cancelText="Cancel"
  variant="destructive"
  isLoading={isDeleting}
/>
```

### 9.3 Feature Module UI Pattern

Every feature module in `components/<module>/` follows this structure with 4 files:

#### 1. List Component (`<module>-list.tsx`)

The canonical list page pattern:

```
┌─────────────────────────────────────────────┐
│ Header                                       │
│ ┌─────────────────────┐ ┌────────────────┐  │
│ │ Title               │ │ + Add Button   │  │
│ │ X items total       │ │ (opens Sheet)  │  │
│ └─────────────────────┘ └────────────────┘  │
├─────────────────────────────────────────────┤
│ Filters Bar (rounded-lg border bg-card p-4) │
│ ┌──────────────┐ ┌─────────────┐ ┌───────┐ │
│ │ 🔍 Search    │ │ Filter      │ │ Clear │ │
│ │ (form+Enter) │ │ (Select)    │ │       │ │
│ └──────────────┘ └─────────────┘ └───────┘ │
├─────────────────────────────────────────────┤
│ Mobile: Stacked Cards (sm:hidden)           │
│  ┌─────────────────────────────────────┐    │
│  │ ▸ Card with fadeInUp animation      │    │
│  │   Title          Price              │    │
│  │   Category        Unit              │    │
│  │   ──────────────────────           │    │
│  │   Variants • Unit        →         │    │
│  └─────────────────────────────────────┘    │
│ + ServerPagination                          │
├─────────────────────────────────────────────┤
│ Desktop: SimpleTable (hidden sm:block)      │
│ ┌─────────────────────────────────────────┐ │
│ │ Table with columns + action buttons     │ │
│ │ Eye(view) | Pencil(edit) | Trash(delete)│ │
│ └─────────────────────────────────────────┘ │
│ + ServerPagination (inside border-t p-4)    │
└─────────────────────────────────────────────┘

Sheet Panels:
- Create Sheet (side: bottom on mobile, right on desktop, sm:max-w-4xl)
- View Sheet (side: bottom on mobile, right on desktop, sm:max-w-[600px])
- Edit Sheet (side: bottom on mobile, right on desktop, sm:max-w-4xl)

ConfirmationDialog for delete
```

**Key UI patterns in list components:**

- **Responsive sheet direction**: `sheetSide = isMobile || isMidSize ? 'bottom' : 'right'`
- **Mobile card animation**: `style={{ animation: 'fadeInUp 0.4s ease-out backwards', animationDelay: '${idx * 40}ms' }}`
- **Search**: Form-based (submit on Enter), debounced to `search` state
- **Filter reset**: Resets all filters + pagination to defaults
- **SWR mutation**: `mutateProducts()` after create/edit/delete to refetch

#### State management in list components:

```typescript
const [page, setPage] = useState(1);
const [limit, setLimit] = useState(10);
const [searchInput, setSearchInput] = useState('');
const [search, setSearch] = useState('');
const [filterX, setFilterX] = useState('all');
const [createSheetOpen, setCreateSheetOpen] = useState(false);
const [editSheetOpen, setEditSheetOpen] = useState(false);
const [viewSheetOpen, setViewSheetOpen] = useState(false);
const [editingItem, setEditingItem] = useState<Item | null>(null);
const [viewingItem, setViewingItem] = useState<Item | null>(null);
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [deletingItem, setDeletingItem] = useState<Item | null>(null);
const [isDeleting, setIsDeleting] = useState(false);

// Reset page on filter change
useEffect(() => {
	setPage(1);
}, [search, filterX, limit]);
```

#### 2. Create Form (`create.tsx`)

- Uses React Hook Form or controlled state
- Calls `createItem()` from hooks
- Shows `toast.success()` on success
- Calls `onSuccess()` callback to close sheet + refresh list

#### 3. Edit Form (`edit-form.tsx`)

- Pre-populated with existing data
- Similar structure to create form
- Calls `updateItem(id, data)` from hooks

#### 4. View Component (`view.tsx`)

- Read-only display of item details
- Uses `ViewField` component for label-value pairs
- "Edit" button to transition from view → edit sheet
- Uses `EntityView` UI component for structured layout

### 9.4 Dashboard Page

```
┌──────────────────────────────────────────────┐
│ SectionCards (4 stat cards in grid)          │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ... │
│ │ Stat Card│ │ Stat Card│ │ Stat Card│     │
│ └──────────┘ └──────────┘ └──────────┘     │
├──────────────────────────────────────────────┤
│ Recent Orders (rounded-lg border bg-card)   │
│ ┌─────────────────────────────────────────┐ │
│ │ "Recent Orders" (Instrument Serif)      │ │
│ │ "Latest customer transactions"           │ │
│ │                          [View all →]   │ │
│ ├─────────────────────────────────────────┤ │
│ │ Order Code | Customer | District | Total│ │
│ │ | Paid | Due | Status | Payment | Date  │ │
│ │ (table rows with fadeInUp animation)    │ │
│ └─────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

- Uses ৳ (Taka) currency symbol
- Status badges with semantic variants (pending=secondary, cancelled=destructive, delivered=outline)
- Payment badges (unpaid=destructive, partial=secondary, paid=default)
- `tabular-nums` class for number alignment

---

## 10. Storefront Architecture

### 10.1 Server Components

The storefront uses Next.js Server Components for initial data fetching:

```typescript
// layout.tsx (server component)
export const dynamic = 'force-dynamic';

async function fetchStorefrontShell() {
  const res = await fetch(`${baseUrl()}/api/storefront?type=all`, { next: { revalidate: 60 } });
  // Returns { info, contact }
}

export default async function StorefrontLayout({ children }) {
  const { info, contact } = await fetchStorefrontShell();
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
      <StorefrontHeader info={info} />
      <main>{children}</main>
      <StorefrontFooter info={info} contact={contact} />
    </div>
  );
}
```

### 10.2 Storefront Pages

| Page             | Path                | Description                               |
| ---------------- | ------------------- | ----------------------------------------- |
| Home             | `/`                 | Hero + Featured products + Policy preview |
| Products         | `/products`         | Product grid with sidebar filtering       |
| Product Detail   | `/products/[slug]`  | Single product with variants              |
| Cart             | `/cart`             | Cart page (client component)              |
| Checkout         | `/checkout`         | Multi-step checkout                       |
| Checkout Success | `/checkout/success` | Order confirmation                        |
| Policy           | `/policy`           | Terms/Privacy/Refund policies             |

### 10.3 Storefront Components

Located in `app/(storefront)/_components/`:

- `storefront-header.tsx` — Site header with logo + nav
- `storefront-footer.tsx` — Footer with contact info + social links
- `storefront-cart-badge.tsx` — Cart icon with item count
- `storefront/StorefrontHero.tsx` — Hero section
- `storefront/StorefrontFeatured.tsx` — Featured products grid
- `storefront/StorefrontPolicyPreview.tsx` — Policy summaries
- `storefront/ProductCard.tsx` — Product card for featured grid
- `products/ProductCard.tsx` — Product card for catalog
- `products/ProductsGrid.tsx` — Product grid layout
- `products/ProductsHeader.tsx` — Products page header
- `products/ProductsSidebar.tsx` — Category filter sidebar
- `products/Pagination.tsx` — Products pagination
- `checkout/CheckoutHeader.tsx` — Checkout header
- `checkout/DeliveryFormCard.tsx` — Delivery info form
- `checkout/OrderSummaryCard.tsx` — Cart summary
- `checkout/PaymentMethodCard.tsx` — Payment selection
- `checkout/MobileStickyBar.tsx` — Mobile checkout CTA bar

---

## 11. Important UI Design Conventions

### 11.1 Typography

- **Section headings**: `text-2xl font-bold font-serif tracking-tight` with `fontFamily: "'Instrument Serif', serif"` style
- **Subtitles**: `text-sm text-muted-foreground mt-1`
- **Table headers**: `text-xs font-medium uppercase tracking-wider text-muted-foreground`
- **Money values**: `tabular-nums` class for monospaced number alignment
- **Code/identifiers**: `code` tag with `bg-muted px-1.5 py-0.5 rounded`

### 11.2 Spacing & Layout

- Page container: `flex-1 space-y-4 p-4 pt-6 lg:p-6`
- List page: `space-y-6`
- Card padding: `p-4` or `p-6`
- Filter bar: `rounded-lg border bg-card p-4`
- Table container: `rounded-lg border bg-card overflow-hidden`
- Responsive grid: `grid grid-cols-1 gap-3 sm:grid-cols-6 sm:items-center`

### 11.3 Interactive States

- Row hover: `hover:bg-muted/30`
- Mobile card hover: `hover:bg-muted/30 hover:shadow-md`
- Active press: `active:scale-[0.98]`
- Button group hover: `group-hover:translate-x-1` for arrow icons
- Transitions: `transition-all`, `transition-colors`, `transition-transform`

### 11.4 Loading States

- Full page: `<Spinner variant="pinwheel" />` centered with `flex items-center justify-center py-20`
- Empty state: Icon in `w-16 h-16 rounded-full bg-muted` + text message
- Error state: Icon in `bg-destructive/10` + error text
- Button loading: disabled + text change ("Submit" → "Submitting..." / "Login" → "Logging in...")

### 11.5 Toast Notifications

- Success: `toast.success('Product created successfully')`
- Error: `toast.error('Failed to create product')`
- Uses Sonner library

### 11.6 Responsive Breakpoints

- Mobile: `max-width: 639px` → Card layout, bottom sheets
- Tablet: `640px–1023px` → Bottom sheets, table layout
- Desktop: `1024px+` → Right side sheets, full table
- Sheet sides: `isMobile || isMidSize ? 'bottom' : 'right'`
- Sheet heights: Mobile `h-[85vh]` or `h-[90vh]`, desktop full width

---

## 12. Environment Variables

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# R2 (Cloudflare)
R2_ENDPOINT=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 13. Key Implementation Notes

### 13.1 Soft Delete

All entities use `deletedAt: Date (default: null)` pattern. Queries filter with `{ deletedAt: null }` to hide deleted records. Delete operations set `deletedAt: new Date()` instead of removing the document.

### 13.2 Slug Generation

Products, Categories, and Warehouses auto-generate slugs from title using `slugify` in Mongoose `pre('save')` hooks.

### 13.3 Currency

The dashboard uses ৳ (Bangladeshi Taka) symbol. Other views use `$` format: `${Number(n || 0).toFixed(2)}`.

### 13.4 Form Architecture

Create/Edit forms use a combination of:

- Controlled `useState` for simple forms
- React Hook Form + Zod resolver for complex forms
- Image upload via separate `ImageUploader` component
- Variant management as dynamic array fields

### 13.5 Module Independence

Each feature module is self-contained:

- `models/<Model>.ts` — Schema + DB logic
- `lib/validations/<module>.ts` — Zod validation
- `hooks/<module>.ts` — Data fetching + mutations
- `components/<module>/` — UI components (list, create, edit, view)
- `app/api/<module>/` — API route handlers
- `app/app/<module>/page.tsx` — Page entry point

This means adding a new module requires creating files in each of these 6 locations following the established patterns.
