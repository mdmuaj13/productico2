# Storefront GitHub Issues

## Issue #1: Create Public Storefront Home Page

**Title:** Create Public Storefront Home Page

**Labels:** `enhancement`, `frontend`, `storefront`

**Description:**
Create a public-facing home page that showcases the company and its products.

**Requirements:**
- Display business name, logo, and banner from settings
- Hero section with company tagline/description
- Featured products section (3-6 products)
- Call-to-action button linking to product list
- Responsive design (mobile-first)
- SEO optimization (meta tags, Open Graph)

**Route:** `/store/[storeName]`

**Acceptance Criteria:**
- [ ] Page loads business info from `/api/storefront` endpoint
- [ ] Featured products display with images and prices
- [ ] Mobile responsive layout
- [ ] Page title and meta description set correctly

---

## Issue #2: Implement Product List Page

**Title:** Implement Product List Page for Storefront

**Labels:** `enhancement`, `frontend`, `storefront`

**Description:**
Build a product catalog page displaying all available products with filtering and search capabilities.

**Requirements:**
- Grid layout showing all products with images, names, and prices
- Category filter dropdown
- Search functionality by product name
- Pagination (12-24 products per page)
- Product card click navigates to product details
- Empty state when no products found

**Route:** `/store/[storeName]/products`

**Acceptance Criteria:**
- [ ] Products fetched from `/api/products` endpoint
- [ ] Category filtering works correctly
- [ ] Search returns relevant results
- [ ] Pagination controls function properly
- [ ] Responsive grid layout (1-2-3-4 columns based on screen size)

---

## Issue #3: Build Product Details and Checkout Page

**Title:** Build Product Details and Checkout Page

**Labels:** `enhancement`, `frontend`, `storefront`

**Description:**
Create a detailed product view with variant selection and checkout functionality.

**Requirements:**
- Product image gallery
- Product name, description, and price display
- Variant selector (size, color) with price updates
- Quantity selector
- Add to cart / Buy now button
- Customer information form (name, email, phone, address)
- Order summary section
- Place order button

**Route:** `/store/[storeName]/products/[productId]`

**Acceptance Criteria:**
- [ ] Product details loaded from `/api/products/:id`
- [ ] Variant selection updates price dynamically
- [ ] Customer form validates required fields
- [ ] Order submission creates order via `/api/orders` endpoint
- [ ] Customer auto-created with order
- [ ] Redirects to confirmation page on success

---

## Issue #4: Create Order Confirmation Page

**Title:** Create Order Confirmation Page

**Labels:** `enhancement`, `frontend`, `storefront`

**Description:**
Build an order confirmation page displaying order details and tracking information.

**Requirements:**
- Order confirmation message
- Order ID and tracking QR code
- Order summary (items, quantities, prices, total)
- Customer information display
- Estimated delivery/fulfillment timeline
- Print invoice button
- Return to home button

**Route:** `/store/[storeName]/orders/[orderId]/confirmation`

**Acceptance Criteria:**
- [ ] Order details fetched from `/api/orders/:id`
- [ ] QR code displayed from `/api/orders/:id/qr`
- [ ] Order summary shows all items correctly
- [ ] Print functionality works for invoice
- [ ] Success message clearly visible

---

## Issue #5: Implement Storefront API Endpoints

**Title:** Implement Backend API Endpoints for Storefront

**Labels:** `enhancement`, `backend`, `api`, `storefront`

**Description:**
Create necessary API endpoints to support the public storefront functionality.

**Requirements:**
- `GET /api/storefront` - Return public business info and settings
- `GET /api/products` - List products with optional category filter (public access)
- `GET /api/products/:id` - Get product details with variants (public access)
- `POST /api/orders` - Create order with customer auto-creation (public access)
- `GET /api/orders/:id` - Get order details (public access with order ID)
- `GET /api/orders/:id/qr` - Generate QR tracking code
- `GET /api/orders/:id/invoice` - Generate invoice PDF (optional for MVP)

**Acceptance Criteria:**
- [ ] All endpoints return proper JSON responses
- [ ] Public endpoints don't require authentication
- [ ] Customer auto-creation works on order submission
- [ ] QR code generation functional
- [ ] Proper error handling and validation
- [ ] CORS configured for public access if needed
