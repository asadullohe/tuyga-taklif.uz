# Tuyga Taklif loyiha rejasi

Audit sanasi: 2026-06-25

## Qisqa holat

Loyiha Next.js App Router, TypeScript, TailwindCSS, Supabase va Telegram auth/reminder oqimlari bilan qurilgan to'y taklifnomasi MVP. Hozirgi kodda quyidagi asosiy oqimlar bor:

- Telegram Login Widget va Mini App orqali kirish.
- Dashboardda taklifnoma yaratish, tahrirlash, o'chirish va publish qilish.
- Admin panelda template studio, layer editor, asset upload va template status boshqaruvi.
- Public taklifnoma sahifasi, RSVP form, guest board, QR va share tugmasi.
- Telegram orqali yangi RSVP xabari va to'ydan 24 soat oldin reminder yuborish.
- Supabase schema, storage bucket SQL fayllari va Netlify scheduled function.

## Tekshiruv natijalari

- `./node_modules/.bin/tsc --noEmit` avval yiqilayotgan edi:
  - `src/app/api/admin/assets/route.ts:83:66`
  - Supabase `FileObject.created_at` tipi `string | null`, lokal `StorageFile.created_at` esa `string | undefined`.
- Tuzatildi: `StorageFile` tipi Supabase javobidagi `null` qiymatlarga moslandi va typecheck toza o'tdi.
- `./node_modules/.bin/eslint src --ext .ts,.tsx` error bermadi, lekin 6 ta warning bor:
  - `src/app/layout.tsx`: custom font warning.
  - `src/components/template-canvas.tsx`: bir nechta `react-hooks/exhaustive-deps` warning.
- `README.md` setup qatorida xato bor:
  - Hozir: `cp .env.local .env.local`
  - Kerak: `cp .env.example .env.local`
- Tuzatildi: README local setup, Supabase SQL tartibi, production env, Telegram webhook va scheduled reminder bo'limlari qo'shildi.
- Test skriptlari va test dependency'lari yo'q.
- Roadmap/TODO fayli yo'q edi; shu fayl loyiha uchun boshlang'ich reja sifatida qo'shildi.

## P0: ishga tushirishdan oldin bitishi shart

- [x] TypeScript xatosini tuzatish.
  - `src/app/api/admin/assets/route.ts` ichidagi `StorageFile` tipini Supabase javobiga moslash.
  - Typecheck toza o'tishini majburiy tekshiruvga aylantirish.
- [x] README local setup qismini tuzatish.
  - `.env.example` dan `.env.local` yaratish ko'rsatmasi.
  - Supabase SQL fayllarini qaysi tartibda qo'llash kerakligini yozish.
  - Telegram webhook, bot username va Netlify cron sozlashlarini aniq yozish.
- [x] Production secret guard qo'shish.
  - `APP_SESSION_SECRET` productionda default bo'lib qolmasin.
  - `CRON_SECRET` bo'lmasa reminder endpoint public ishlamasin yoki deployment checklistda majburiy bo'lsin.
- [x] Publish slug oqimini aniqlashtirish.
  - Hozir publish qayta bosilganda yangi slug yaratishi mumkin.
  - Published invitation qayta publish qilinganda mavjud slug saqlanishi kerakmi yoki explicit "republish/new link" kerakmi, qaror qilish.
- [x] Supabase migratsiya tartibini standartlashtirish.
  - `supabase/*.sql` fayllari timestamp migration formatiga o'tkazilsin yoki bitta aniq install guide yozilsin.
  - Storage bucket SQL fayllari schema bilan birga deploy qilinishi tekshirilsin.

## P1: MVP sifatini yopish

- [x] Momento Light premium public template qo'shish.
  - [x] `momento-light` template ro'yxatga qo'shildi.
  - [x] Public sahifa uchun coded multi-section layout qo'shildi.
  - [x] Optional media/map/gift/detail fieldlari schema va type'larga qo'shildi.
  - [x] Calendar/countdown/default fallback helperlari unit test bilan yopildi.
- [ ] Test infratuzilmasi qo'shish.
  - Unit: slug, Telegram payload verify, validation schema, reminder due logic.
  - API: invitation create/update/publish, RSVP create/list, reminder endpoint auth.
  - E2E: login/dev auth, invitation create, edit, publish, public RSVP.
- [ ] RSVP oqimini mustahkamlash.
  - [x] Duplicate RSVP siyosati: bir invitation ichida bir xil ism qayta yuborilsa mavjud RSVP update bo'ladi.
  - [x] Public guest board privacy sozlamasi: public tomonda mehmon ismlari anonim ko'rsatiladi.
  - [x] RSVP helperlari uchun unit testlar qo'shildi.
  - [x] RSVP POST endpoint uchun basic in-memory rate limit va unit testlar qo'shildi.
- [ ] Telegram reminder oqimini yakunlash.
  - Timezone `+05:00` hard-code qilingan; invitation yoki loyiha sozlamasiga chiqarish.
  - Webhook setup guide va secret header tekshiruvini deploy hujjatiga kiritish.
  - Reminder yuborilgan/yuborilmagan loglarini admin panelda ko'rsatish.
- [ ] Admin asset managementni polish qilish.
  - Asset metadata uchun `template_assets_storage.sql` qo'llanmagan holatda fallback bor, lekin deploy checklistda majburiy qilish kerak.
  - Asset search/filter/tag UI qo'shish.
  - User invitation assets uchun eski ishlatilmayotgan fayllarni tozalash strategiyasi kerak.
- [ ] Template revision oqimini ko'rinadigan qilish.
  - Revision save bor, lekin rollback/list UI yo'q.
  - Concurrent edit conflict xabari bor, ammo userga "reload/merge" tajribasi kerak.
- [ ] Analytics dashboard qo'shish.
  - `opened`, `rsvp_submitted`, `share_clicked` eventlari yozilyapti.
  - Admin yoki owner dashboardda views, RSVP conversion, share count ko'rinishi kerak.

## P2: product va UX yaxshilash

- [ ] Public invitation SEO/OG image.
  - Dynamic preview image yoki template preview image OpenGraphga qo'shish.
  - Published link uchun title/description yaxshi, lekin image yo'q.
- [ ] Invitation editor UX.
  - Autosave xatolarini batafsil ko'rsatish.
  - Unsaved changes guard qo'shish.
  - Mobile editorda layer tanlash va inspector tajribasini tekshirish.
- [ ] Template selection UX.
  - Template cards real preview image ishlatsin.
  - "Premium" badge hozir hamma template uchun chiqadi; pricing/status model bilan bog'lash.
- [ ] Venue/Yandex map oqimini tugallash.
  - `YANDEX_MAPS_API_KEY` env bor va venue API bor, lekin product flowda xarita/venue tanlash to'liq tekshirilishi kerak.
- [ ] Media va musiqa.
  - `musicUrl` schema bor, lekin public previewda playback UX va browser autoplay siyosati alohida sinovdan o'tkazilishi kerak.

## P3: scaling va maintenance

- [ ] CI qo'shish.
  - Pull requestda `typecheck`, `lint`, test va `next build`.
  - Node versiyasini `.nvmrc` yoki `engines` orqali pin qilish.
- [ ] Observability.
  - API route error logging standartini tanlash.
  - Telegram send failures va Supabase failures uchun minimal monitoring.
- [ ] Data lifecycle.
  - Invitation delete bo'lganda storage asset cleanup.
  - RSVP retention/privacy policy.
  - Analytics retention policy.
- [ ] Role management.
  - Admin role hozir DBdagi `users.role` orqali ishlaydi.
  - Admin tayinlash, olib tashlash va audit log kerak.

## Tavsiya qilingan bajarish tartibi

1. P0 texnik bloklarni yopish: typecheck, README, secrets, publish slug, migration guide.
2. Test infratuzilmasini qo'shib, asosiy API oqimlarini qamrab olish.
3. RSVP va Telegram reminder oqimini productionga tayyorlash.
4. Admin studio va asset/revision tajribasini polish qilish.
5. Analytics, SEO va product UX yaxshilashlarini qo'shish.
6. CI, monitoring va data lifecycle ishlarini yakunlash.

## Definition of Done

- `tsc --noEmit`, `eslint`, testlar va `next build` lokal va CI muhitda o'tadi.
- Supabase schema va storage bucket setupi takrorlanadigan migratsiya sifatida ishlaydi.
- Production env checklist to'liq va default secret bilan deploy qilib bo'lmaydi.
- User invitation yaratib, tahrirlab, publish qilib, RSVP qabul qilib, Telegram reminder ulay oladi.
- Admin template yaratib, asset yuklab, template update qilib, revisionni boshqara oladi.
