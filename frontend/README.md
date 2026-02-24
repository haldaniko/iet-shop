## Frontend `iet-shop` (Next.js)

The frontend is a **Next.js 16 / React 19** application located in the `frontend` folder.  
It is fully decoupled from Medusa and works with any HTTP backend over REST.

---

### Requirements

- **Node.js** `>= 20`
- **npm** `>= 10` (or a compatible package manager)

---

### Environment variables

All public frontend settings are configured via `.env.local` (for local development)  
or via environment variables in your deployment environment.

- **`NEXT_PUBLIC_API_URL`** – base URL of the backend  
  - example for local development:  
    `NEXT_PUBLIC_API_URL=http://localhost:9000`
- **`NEXT_PUBLIC_API_PUBLISHABLE_KEY`** – optional public key; if present it will be sent as `x-publishable-api-key`
- **`NEXT_PUBLIC_PRODUCTS_ENDPOINT`** – endpoint used to fetch the product list  
  - default: `/store/products`
- **`NEXT_PUBLIC_IMAGE_HOSTNAMES`** – (optional) comma‑separated list of allowed remote image hostnames  
  - example: `cdn.myshop.com,images.myshop.io`

Example `.env.local` file in the `frontend` root:

```env
NEXT_PUBLIC_API_URL=http://localhost:9000
NEXT_PUBLIC_PRODUCTS_ENDPOINT=/store/products
# NEXT_PUBLIC_API_PUBLISHABLE_KEY=public-key-if-needed
# NEXT_PUBLIC_IMAGE_HOSTNAMES=cdn.myshop.com
```

---

### Running the frontend locally (for repo owner)

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open in the browser:

- `http://localhost:3000` – main page (catalog)

The dev server hot‑reloads on code changes.

---

### Build and production run

1. Build:

```bash
cd frontend
npm run build
```

2. Start the production server:

```bash
npm run start
```

By default the app will be available at `http://localhost:3000`.

---

### Docker

The `frontend` folder already contains a `Dockerfile`.  
Example build and run:

```bash
cd frontend
docker build -t iet-frontend .

docker run --rm -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://host.docker.internal:9000 \
  iet-frontend
```

You can add more environment variables if needed (`NEXT_PUBLIC_PRODUCTS_ENDPOINT`, etc.).

---
