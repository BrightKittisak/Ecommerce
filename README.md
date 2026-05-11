# Lush

Lush คือเว็บ e-commerce ที่พัฒนาด้วย Next.js 15 สำหรับประสบการณ์ช้อปปิ้งที่ดูละมุนขึ้น ค้นหาง่ายขึ้น และช่วยให้ผู้ใช้ตัดสินใจซื้อได้มั่นใจขึ้น รองรับภาษาไทย, ราคาเงินบาท, dark mode / light mode, ระบบตะกร้า, checkout, การชำระเงิน, ประวัติคำสั่งซื้อ และหน้าแอดมินสำหรับดูภาพรวมระบบ

## ฟีเจอร์หลัก

- หน้าร้านโทนใหม่ภายใต้แบรนด์ `Lush`
- รองรับ `light mode` และ `dark mode`
- รองรับภาษาไทยใน storefront, cart, checkout, account และ static pages
- ใช้สกุลเงิน `THB` ทั้งการแสดงผลและ payment flow
- ระบบค้นหาและกรองสินค้า
- ระบบรีวิวสินค้าและสินค้าที่เกี่ยวข้อง
- ตะกร้าสินค้าและ checkout หลายขั้นตอน
- รองรับการชำระเงินผ่าน `PayPal`, `Stripe`, และ `Cash On Delivery`
- ระบบล็อกอินด้วย `Google` และ `Credentials`
- หน้าแอดมิน `overview` และ `orders`
- ป้องกันเส้นทาง `/admin/*` เฉพาะผู้ใช้ที่มี role `Admin`

## Tech Stack

- `Next.js 15` with App Router
- `React 19`
- `TypeScript`
- `Tailwind CSS`
- `next-auth` v5
- `MongoDB` + `Mongoose`
- `Zustand`
- `React Hook Form` + `Zod`
- `Stripe`
- `PayPal`
- `Resend`

## โครงสร้างสำคัญ

- [app](/C:/Users/kitti/Documents/Learning/Backend/Ecommerce/app)
  - routes หลักของเว็บ, checkout, account, admin, API routes
- [components](/C:/Users/kitti/Documents/Learning/Backend/Ecommerce/components)
  - UI components ของ storefront, product, cart, header, footer
- [lib](/C:/Users/kitti/Documents/Learning/Backend/Ecommerce/lib)
  - constants, actions, db, helpers, i18n, payment utilities
- [emails](/C:/Users/kitti/Documents/Learning/Backend/Ecommerce/emails)
  - email templates และ receipt flow

## การติดตั้ง

1. ติดตั้ง dependencies

```bash
npm install
```

2. สร้างไฟล์ `.env`

```env
MONGODB_URI=
MONGODB_DNS_SERVERS=1.1.1.1,8.8.8.8

AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

NEXT_PUBLIC_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_APP_SLOGAN=ช้อปง่าย ดูละมุน และมั่นใจทุกวัน
NEXT_PUBLIC_APP_DESCRIPTION=Lush คือหน้าร้านออนไลน์ที่ช่วยให้การค้นหา เปรียบเทียบ และตัดสินใจซื้อเป็นเรื่องง่ายขึ้น สวยขึ้น และมั่นใจขึ้น
NEXT_PUBLIC_APP_COPYRIGHT=(c) 2026 Lush. สงวนลิขสิทธิ์

STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

PAYPAL_CLIENT_ID=
PAYPAL_APP_SECRET=
PAYPAL_API_URL=https://api-m.sandbox.paypal.com

RESEND_API_KEY=
SENDER_EMAIL=onboarding@resend.dev
SENDER_NAME=Lush

PAGE_SIZE=9
FREE_SHIPPING_MIN_PRICE=300
DEFAULT_PAYMENT_METHOD=PayPal
```

3. รัน seed data ถ้าต้องการข้อมูลตั้งต้น

```bash
npm run seed
```

4. เปิด dev server

```bash
npm run dev
```

5. เปิด [http://localhost:3000](http://localhost:3000)

## บัญชีตัวอย่างหลัง seed

ถ้ารัน `npm run seed` แล้ว จะมีบัญชีตัวอย่างดังนี้:

- Admin
  - email: `admin@example.com`
  - password: `123456`
- User
  - email: `jane@example.com`
  - password: `123456`

## Scripts

- `npm run dev` รัน local development server
- `npm run build` สร้าง production build
- `npm run start` รัน production server
- `npm run lint` ตรวจ ESLint
- `npm run seed` seed ข้อมูลเริ่มต้นเข้า MongoDB
- `npm run sync:prices:thb` sync ราคาสินค้าเป็นเงินบาทเข้า MongoDB
- `npm run sync:orders:thb` migrate คำสั่งซื้อเดิมเป็นเงินบาท

## Payment และ Email

- `Stripe`
  - ใช้ใน checkout flow และ webhook ที่ [app/api/webhooks/stripe/route.tsx](/C:/Users/kitti/Documents/Learning/Backend/Ecommerce/app/api/webhooks/stripe/route.tsx)
- `PayPal`
  - ใช้ REST API ผ่าน [lib/paypal.ts](/C:/Users/kitti/Documents/Learning/Backend/Ecommerce/lib/paypal.ts)
- `Resend`
  - ใช้ส่งใบเสร็จหลังชำระเงินสำเร็จ

## Admin และ Security

- `/admin/*` เปิดให้เฉพาะผู้ใช้ role `Admin`
- role จะถูก sync จากฐานข้อมูลเข้าสู่ session เพื่อป้องกัน session เก่าค้าง role เดิม
- หน้า `/admin/overview` ใช้ดูภาพรวมระบบ
- หน้า `/admin/orders` ใช้ดูคำสั่งซื้อทั้งหมดของระบบ

## หมายเหตุเกี่ยวกับ MongoDB Atlas

ถ้าเจอปัญหา `querySrv ECONNREFUSED`:

- ตรวจ `Network Access` ใน MongoDB Atlas
- ตรวจว่า cluster ไม่ได้ paused
- ถ้าใช้ `mongodb+srv://` แล้ว DNS มีปัญหา ให้กำหนด `MONGODB_DNS_SERVERS=1.1.1.1,8.8.8.8`
- ถ้ายังมีปัญหา สามารถใช้ connection string แบบ `mongodb://host1,host2,host3/...` แทนได้

## Release Checklist

ก่อนส่งขึ้น `master` แนะนำเช็กอย่างน้อย:

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- ทดสอบ sign in ด้วย user ปกติและ admin
- ทดสอบ `/admin/overview` และ `/admin/orders`
- ทดสอบ flow `search -> cart -> checkout -> order details`

## Git Workflow ที่แนะนำ

- พัฒนางานบน branch ย่อยเสมอ
- merge feature branch เข้า `develop` ก่อน
- เมื่อผ่านการตรวจและทดสอบแล้ว ค่อยเปิด PR จาก `develop` ไป `master`
