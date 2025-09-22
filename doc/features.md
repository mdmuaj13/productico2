# Productico - APIs & Modules Breakdown

## 🔌 Complete API List

### Authentication APIs
```typescript
POST   /api/auth/register           // Register new user
POST   /api/auth/login              // Login user
GET    /api/auth/me                 // Get current user
POST   /api/auth/logout             // Logout user
POST   /api/auth/refresh            // Refresh JWT token
```

### Product Management APIs
```typescript
GET    /api/products                // List products with pagination/search
POST   /api/products                // Create new product
GET    /api/products/[id]           // Get single product with variants
PUT    /api/products/[id]           // Update product
DELETE /api/products/[id]           // Soft delete product

POST   /api/products/[id]/variants  // Add variant to product
PUT    /api/products/[id]/variants/[index] // Update specific variant
DELETE /api/products/[id]/variants/[index] // Delete specific variant

GET    /api/categories              // Get all categories (auto-generated)
POST   /api/categories              // Create new category
```

### Order Management APIs
```typescript
GET    /api/orders                  // List orders with filters
POST   /api/orders                  // Create new order + auto-create customer
GET    /api/orders/[id]             // Get order details with items
PUT    /api/orders/[id]             // Update order details
DELETE /api/orders/[id]             // Cancel/soft delete order
PUT    /api/orders/[id]/status      // Update order status

GET    /api/orders/[id]/invoice     // Generate/get invoice data
GET    /api/orders/[id]/invoice/pdf // Generate PDF invoice
GET    /api/orders/[id]/qr          // Generate QR tracking code
GET    /api/orders/track/[code]     // Public order tracking
```

### Customer Management APIs
```typescript
GET    /api/customers               // List all auto-generated customers
GET    /api/customers/[id]          // Get customer details + order history
PUT    /api/customers/[id]          // Update customer info (optional)
GET    /api/customers/[id]/orders   // Get customer's order history
```

### Stock & Warehouse APIs
```typescript
GET    /api/warehouses              // List all warehouses
POST   /api/warehouses              // Create new warehouse
GET    /api/warehouses/[id]         // Get warehouse details
PUT    /api/warehouses/[id]         // Update warehouse
DELETE /api/warehouses/[id]         // Soft delete warehouse

GET    /api/stock                   // Get stock levels across all warehouses
GET    /api/stock/[productId]       // Get stock for specific product variants
PUT    /api/stock/adjust            // Manual stock adjustment
GET    /api/stock/low               // Get low stock alerts
GET    /api/stock/movements         // Stock movement history
```

### Vendor & Purchase Order APIs
```typescript
GET    /api/vendors                 // List all vendors
POST   /api/vendors                 // Create new vendor
GET    /api/vendors/[id]            // Get vendor details
PUT    /api/vendors/[id]            // Update vendor
DELETE /api/vendors/[id]            // Soft delete vendor
GET    /api/vendors/[id]/products   // Products supplied by vendor

GET    /api/purchase-orders         // List purchase orders
POST   /api/purchase-orders         // Create new purchase order
GET    /api/purchase-orders/[id]    // Get PO details
PUT    /api/purchase-orders/[id]    // Update PO
DELETE /api/purchase-orders/[id]    // Delete PO
```

### Analytics & Dashboard APIs
```typescript
GET    /api/analytics/dashboard     // Dashboard overview stats
GET    /api/analytics/revenue       // Revenue data for charts
GET    /api/analytics/orders        // Order trends data
GET    /api/analytics/customers     // Customer growth data
GET    /api/analytics/products      // Top selling products
GET    /api/analytics/inventory     // Inventory insights
```

### Settings & Business APIs
```typescript
GET    /api/settings                // Get business settings
PUT    /api/settings                // Update business settings
POST   /api/settings/upload         // Upload logo/banner to Cloudinary
GET    /api/settings/seo            // Get SEO settings
PUT    /api/settings/seo            // Update SEO settings
```

### Public Storefront APIs
```typescript
GET    /api/public/storefront       // Get public store data
GET    /api/public/products         // Get public product list
GET    /api/public/products/[id]    // Get public product details
```

### File Upload APIs
```typescript
POST   /api/upload/product-image    // Upload product image
POST   /api/upload/business-logo    // Upload business logo
POST   /api/upload/business-banner  // Upload business banner
DELETE /api/upload/[publicId]       // Delete uploaded image
```

---

## 🏗️ Frontend Modules/Pages

### Authentication Module
```
app/login/
├── page.tsx                        // Login form page
├── components/
│   └── login-form.tsx             // Login form component
└── loading.tsx                    // Login loading state
```

### Dashboard Module
```
app/(dashboard)/
├── layout.tsx                     // Dashboard layout with sidebar
├── dashboard/
│   ├── page.tsx                   // Dashboard home page
│   └── components/
│       ├── revenue-chart.tsx      // Revenue line chart
│       ├── orders-chart.tsx       // Orders bar chart
│       ├── stats-cards.tsx        // Quick stats cards
│       ├── recent-orders.tsx      // Recent orders widget
│       └── top-products.tsx       // Top products widget
```

### Product Management Module
```
app/(dashboard)/products/
├── page.tsx                       // Products list page
├── add/
│   └── page.tsx                   // Add new product page
├── [id]/
│   ├── page.tsx                   // Product details page
│   └── edit/
│       └── page.tsx               // Edit product page
└── components/
    ├── product-table.tsx          // Products data table
    ├── product-form.tsx           // Create/edit product form
    ├── variant-manager.tsx        // Manage product variants
    ├── category-selector.tsx      // Category selection/creation
    └── product-card.tsx           // Mobile product card
```

### Order Management Module
```
app/(dashboard)/orders/
├── page.tsx                       // Orders list page
├── create/
│   └── page.tsx                   // Create new order page
├── [id]/
│   ├── page.tsx                   // Order details page
│   ├── edit/
│   │   └── page.tsx               // Edit order page
│   └── invoice/
│       └── page.tsx               // Invoice view/print page
└── components/
    ├── order-table.tsx            // Orders data table
    ├── order-form.tsx             // Create/edit order form
    ├── customer-form.tsx          // Auto-create customer form
    ├── order-items.tsx            // Order items selector
    ├── order-status.tsx           // Status update component
    ├── invoice-generator.tsx      // Invoice generation
    └── qr-tracker.tsx             // QR code generator
```

### Customer Management Module
```
app/(dashboard)/customers/
├── page.tsx                       // Customers list page (read-only)
├── [id]/
│   └── page.tsx                   // Customer details + order history
└── components/
    ├── customer-table.tsx         // Customers data table
    ├── customer-card.tsx          // Mobile customer card
    └── order-history.tsx          // Customer order history
```

### Stock & Warehouse Module
```
app/(dashboard)/stock/
├── page.tsx                       // Stock overview page
└── components/
    ├── stock-table.tsx            // Stock levels table
    ├── stock-adjustment.tsx       // Manual stock adjustment
    ├── low-stock-alerts.tsx       // Low stock warnings
    └── stock-movement.tsx         // Stock movement history

app/(dashboard)/warehouses/
├── page.tsx                       // Warehouses list page
├── add/
│   └── page.tsx                   // Add new warehouse
├── [id]/
│   └── edit/
│       └── page.tsx               // Edit warehouse
└── components/
    ├── warehouse-table.tsx        // Warehouses data table
    └── warehouse-form.tsx         // Create/edit warehouse form
```

### Vendor & Purchase Order Module
```
app/(dashboard)/vendors/
├── page.tsx                       // Vendors list page
├── add/
│   └── page.tsx                   // Add new vendor
├── [id]/
│   └── edit/
│       └── page.tsx               // Edit vendor
└── components/
    ├── vendor-table.tsx           // Vendors data table
    └── vendor-form.tsx            // Create/edit vendor form

app/(dashboard)/purchase-orders/
├── page.tsx                       // Purchase orders list
├── create/
│   └── page.tsx                   // Create new PO
├── [id]/
│   └── page.tsx                   // PO details page
└── components/
    ├── po-table.tsx               // Purchase orders table
    └── po-form.tsx                // Create/edit PO form
```

### Settings Module
```
app/(dashboard)/settings/
├── page.tsx                       // Settings main page
├── business/
│   └── page.tsx                   // Business info settings
├── seo/
│   └── page.tsx                   // SEO settings
└── components/
    ├── business-form.tsx          // Business info form
    ├── logo-upload.tsx            // Logo upload component
    ├── seo-form.tsx               // SEO settings form
    └── image-uploader.tsx         // Generic image uploader
```

### Public Storefront Module
```
app/(store)
├── page.tsx                       // Public storefront page
├── products/
│   ├── page.tsx                   // Public products list
│   └── [id]/
│       └── page.tsx               // Public product details
└── components/
    ├── public-header.tsx          // Public site header
    ├── public-footer.tsx          // Public site footer
    ├── product-showcase.tsx       // Product display component
    └── business-info.tsx          // Business contact info
```

### Order Tracking Module
```
app/track/
├── [trackingCode]/
│   └── page.tsx                   // Public order tracking page
└── components/
    └── tracking-status.tsx        // Order tracking display
```

---

## 🧩 Shared Components Library

### UI Components (`components/ui/`)
```
components/ui/
├── data-table.tsx                 // Generic data table
├── form-components.tsx            // Reusable form elements
├── modal-dialog.tsx               // Generic modal
├── loading-spinner.tsx            // Loading states
├── error-boundary.tsx             // Error handling
├── mobile-nav.tsx                 // Mobile navigation
├── search-filter.tsx              // Search and filter component
└── chart-wrapper.tsx              // Chart container component
```

### Business Components (`components/shared/`)
```
components/shared/
├── sidebar-navigation.tsx         // Dashboard sidebar
├── header-bar.tsx                 // Dashboard header
├── stats-card.tsx                 // Reusable stats card
├── action-buttons.tsx             // CRUD action buttons
├── pagination.tsx                 // Table pagination
├── date-picker.tsx                // Date range picker
├── currency-input.tsx             // Currency formatted input
└── status-badge.tsx               // Order status badges
```

---

## 🔧 Utility Modules

### Core Utilities (`lib/`)
```
lib/
├── mongodb.ts                     // Database connection
├── auth.ts                        // Authentication utilities
├── api-helpers.ts                 // Generic API helpers
├── validation.ts                  // Input validation schemas
├── constants.ts                   // App constants
├── utils.ts                       // General utilities
├── cloudinary.ts                  // File upload utilities
├── pdf-generator.ts               // PDF generation
├── qr-generator.ts                // QR code generation
└── email-templates.ts             // Email templates (future)
```

### Business Logic (`lib/services/`)
```
lib/services/
├── product-service.ts             // Product business logic
├── order-service.ts               // Order processing logic
├── stock-service.ts               // Stock management logic
├── customer-service.ts            // Customer management
├── analytics-service.ts           // Analytics calculations
└── notification-service.ts        // Notifications (future)
```

---

## 📊 Development Priority

### Phase 1 APIs (Hours 1-6)
- Authentication APIs ✅
- Product CRUD APIs ✅
- Basic dashboard APIs ✅

### Phase 2 APIs (Hours 7-12)
- Order management APIs ✅
- Customer auto-creation APIs ✅
- Stock adjustment APIs ✅

### Phase 3 APIs (Hours 13-18)
- Analytics APIs ✅
- Vendor & PO APIs ✅
- Settings APIs ✅

### Phase 4 APIs (Hours 19-24)
- File upload APIs ✅
- Public storefront APIs ✅
- QR/Invoice generation APIs ✅

**Total: 65+ API endpoints across 8 modules**  
**Perfect for rapid development with maximum reusability!**