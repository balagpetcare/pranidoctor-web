# Local development ports

| Service | Port | Start |
|---------|------|--------|
| **Backend API** (`pranidoctor-backend`) | **3000** | `npm run dev` (uses `PORT=3000` in `.env`) |
| **Admin / Web** (`pranidoctor-web`) | **3001** | `npm run dev` → `next dev -p 3001` |

## Environment

**Backend** (`pranidoctor-backend/.env`):

- `PORT=3000`
- `CORS_ORIGINS=http://localhost:3001,http://localhost:3000`

**Frontend** (`pranidoctor-web/.env`):

- `BACKEND_URL=http://localhost:3000`
- `NEXT_PUBLIC_API_URL=http://localhost:3000/api`
- `APP_URL=http://localhost:3001`
- `NEXT_PUBLIC_APP_URL=http://localhost:3001`

## Verify

```bash
curl http://localhost:3000/health
curl http://localhost:3001/api/admin/health
```
