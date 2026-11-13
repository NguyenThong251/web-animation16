# web-animation16

**🔴 Live demo: <https://nguyenthong251.github.io/web-animation16/>**

Bản clone 1:1 của [why.zero.university](https://why.zero.university/) (Zero — "Human Infrastructure to Get Hired"), phục vụ mục đích học tập / nghiên cứu kỹ thuật. Toàn bộ thương hiệu, nội dung, model 3D, âm thanh và thiết kế thuộc về chủ sở hữu gốc.

## Stack (khớp site gốc)

- **Vite** build: 1 bundle `main-*.js` (~1.2 MB) + `main-*.css`, host tĩnh S3/CloudFront ở bản gốc
- **Three.js WebGL** full-screen canvas + EffectComposer (post-processing)
- **GLTFLoader + DRACOLoader** (model `.glb` nén Draco) + **KTX2Loader / Basis** (texture atlas `.ktx2`)
- **GSAP** (animation) + **Howler** (14 file ambient/FX)
- Video làm texture (stage 2, star animation, thẻ công ty)
- Font self-host: PP Supply Sans/Mono, STK Bureau Serif, Bethany Elingston + Google Fonts

## Cách clone

Giữ nguyên bản build gốc (tải byte-for-byte), không build lại:

- `public/` = 113 file / ~16 MB: bundle, CSS, font, 9 model, 9 atlas KTX2, decoder Draco/Basis, audio, video, logo, texture — gồm cả asset có tên ghép lúc chạy (10 origami ngẫu nhiên, logo công cụ/công ty, video thẻ, biến thể mobile).
- `server.mjs` — static server không phụ thuộc: MIME đúng (mp3/ktx2/glb/wasm), HTTP Range (206) cho video, CORS.

### Khác biệt so với bản gốc (cố ý)

Chỉ sửa `public/index.html`, bundle JS giữ nguyên:

- **Google Analytics bị gỡ** (`gtag` thành no-op) — không báo lượt xem về GA của Zero.
- **Supabase sandbox**: shim `fetch` chặn mọi request tới Supabase của Zero và trả về phản hồi giả lập cùng dạng (uuid giả, "1,234 people ahead", link `?ref=LOCALDEMO`). Form "Join Beta" vẫn chạy hết luồng (email → hồ sơ → origami chứng chỉ) nhưng **không gửi dữ liệu đi đâu**.

## Chạy local

```bash
npm run dev    # http://localhost:4500  (node server.mjs public 4500)
```

## Deploy

Build gốc compile cho `/`, nên GitHub Actions rebase một bản copy sang `/web-animation16/` bằng `scripts/subpath.mjs`: URL root-absolute trong HTML/CSS, literal `/assets/` + `/vendor/` trong JS, và biến/tham số base (`Sb`/`Sg`/`Lw`, `Dv`/`LO`). Mỗi lần thay đều kiểm tra đúng số chỗ khớp — bundle đổi là build fail ngay.

## Verify

Playwright headless với GPU thật (ANGLE D3D11), A/B với origin: cùng danh sách request, 0 lỗi console, 0 lỗi 404, đủ 5 font, cùng 349 phần tử UI, screenshot "TAP HOLD" giống hệt. Chạy hết luồng vẽ số 0 → các stage → thành phố 3D → form Join Beta trên cả bản local lẫn bản subpath: 0 lỗi, 0 request tới Supabase/GA.
