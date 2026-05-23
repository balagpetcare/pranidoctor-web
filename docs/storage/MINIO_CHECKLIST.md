# MinIO Upload Verification Checklist

Use this checklist when validating MinIO storage end-to-end on a local WiFi setup.

## Prerequisites

- [ ] MinIO running (`docker compose up minio minio-init` in `pranidoctor-backend`)
- [ ] Backend running (`npm run dev`, port 3000)
- [ ] `.env` has `STORAGE_DRIVER=minio`, `S3_ENDPOINT=http://127.0.0.1:9000`, credentials match MinIO
- [ ] Flutter `.env` has `API_BASE_URL=http://<PC_WIFI_IP>:3000`
- [ ] Phone and PC on same WiFi; Windows Firewall allows TCP 3000 (Private)
- [ ] Android debug build (cleartext HTTP allowed)

## Functional checks

| Check | How to verify | Pass |
|-------|---------------|------|
| Upload (profile) | Profile edit → pick gallery image | [ ] |
| Upload (farm cover) | Farm form → camera/gallery | [ ] |
| Upload (pet photo) | Animal form → image picker | [ ] |
| Upload (support) | Support ticket → add image/PDF | [ ] |
| Delete | `DELETE /api/mobile/upload/:id` with Bearer token | [ ] |
| Preview | Uploaded image renders via `/api/mobile/uploads/:id` redirect | [ ] |
| Refresh | Kill app → reopen → cached URL still loads | [ ] |
| Large file | Upload near limit (e.g. 7 MB PDF support attachment) | [ ] |
| Offline | Airplane mode → queue support ticket → sync when online | [ ] |
| Retry | Briefly stop backend mid-upload → retry succeeds | [ ] |
| Release build | `flutter build apk --release` with HTTPS `API_BASE_URL` | [ ] |

## API smoke tests (curl)

Replace `TOKEN` and `PC_IP`.

```bash
# Single upload
curl -X POST "http://PC_IP:3000/api/mobile/upload" \
  -H "Authorization: Bearer TOKEN" \
  -F "purpose=SUPPORT_ATTACHMENT" \
  -F "file=@test.jpg"

# Presigned PUT
curl "http://PC_IP:3000/api/mobile/upload/presigned?purpose=SUPPORT_ATTACHMENT&fileName=test.jpg&method=PUT" \
  -H "Authorization: Bearer TOKEN"

# Delete
curl -X DELETE "http://PC_IP:3000/api/mobile/upload/FILE_ID" \
  -H "Authorization: Bearer TOKEN"

# Storage health
curl "http://PC_IP:3000/health/storage"
```

## Flutter device run

```powershell
cd pranidoctor_user
.\scripts\detect_lan_ip.ps1   # update .env API_BASE_URL
flutter run -d 192.168.10.107:5555
```

## Known limitations

- Prescription, lab report, and AI chat attachments: UI not wired (no backend attachment fields on those entities yet).
- Direct presigned PUT from mobile is available via API but not used by default upload flow (multipart via backend is canonical).
- Release builds require HTTPS; local HTTP is debug-only.

## Final report template

| Area | Result | Notes |
|------|--------|-------|
| Backend routes | | |
| MinIO connectivity | | |
| Flutter profile upload | | |
| Flutter support upload | | |
| Offline sync upload | | |
| Release readiness | | |

**Verified by:** _____________  
**Date:** _____________  
**PC IP / device:** _____________
