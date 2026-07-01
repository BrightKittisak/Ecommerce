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

## Engineering Docs

- [CONTRIBUTING.md](/C:/Users/kitti/Documents/Learning/Backend/Ecommerce/CONTRIBUTING.md)
  - Git workflow, branch policy, PR rules, merge strategy, release gates
- [docs/ENGINEERING_STANDARDS.md](/C:/Users/kitti/Documents/Learning/Backend/Ecommerce/docs/ENGINEERING_STANDARDS.md)
  - clean code expectations, architecture boundaries, security and performance rules
- [docs/HIGH_SCALE_PRODUCTION_ROADMAP.md](/C:/Users/kitti/Documents/Learning/Backend/Ecommerce/docs/HIGH_SCALE_PRODUCTION_ROADMAP.md)
  - phased roadmap for production hardening, scale, security, and refactor work
- [docs/PHASE_1_EXECUTION_PLAN.md](/C:/Users/kitti/Documents/Learning/Backend/Ecommerce/docs/PHASE_1_EXECUTION_PLAN.md)
  - first implementation slices, branch names, dependencies, and acceptance criteria
- [docs/INCIDENT_RESPONSE.md](/C:/Users/kitti/Documents/Learning/Backend/Ecommerce/docs/INCIDENT_RESPONSE.md)
  - production alerts, incident roles, payment and database runbooks, rollback, and evidence requirements

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

2. สร้าง `.env` จากไฟล์ตัวอย่าง แล้วแทนที่ค่าตัวอย่างด้วยค่าของ environment

```powershell
Copy-Item .env.example .env
```

3. ตรวจสอบว่า environment variables ครบและมีรูปแบบถูกต้อง

```bash
npm run env:check
```

คำสั่งนี้รายงานเฉพาะชื่อตัวแปรและกฎที่ไม่ผ่าน โดยไม่แสดงค่า secret

4. รัน seed data ถ้าต้องการข้อมูลตั้งต้น

```bash
npm run seed
```

5. เปิด dev server

```bash
npm run dev
```

5. เปิด [http://localhost:3000](http://localhost:3000)

## บัญชีตัวอย่างหลัง seed

ถ้ารัน `npm run seed` แล้ว จะมีบัญชีตัวอย่างดังนี้:

- Admin
  - email: `admin@example.com`
  - password: `LushDemo123!`
- User
  - email: `jane@example.com`
  - password: `LushDemo123!`

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

ก่อนส่งขึ้น `main` แนะนำเช็กอย่างน้อย:

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- ทดสอบ sign in ด้วย user ปกติและ admin
- ทดสอบ `/admin/overview` และ `/admin/orders`
- ทดสอบ flow `search -> cart -> checkout -> order details`

## Engineering Direction

The project is now being treated as a structured refactor and hardening program
instead of a demo that only needs small finishing touches.

Current engineering goals:

- production-grade order and payment safety
- cleaner architecture and code ownership
- faster browse performance
- stronger scale characteristics
- stricter Git and review discipline

Use these documents as the current source of truth:

- [CONTRIBUTING.md](/C:/Users/kitti/Documents/Learning/Backend/Ecommerce/CONTRIBUTING.md)
- [docs/ENGINEERING_STANDARDS.md](/C:/Users/kitti/Documents/Learning/Backend/Ecommerce/docs/ENGINEERING_STANDARDS.md)
- [docs/HIGH_SCALE_PRODUCTION_ROADMAP.md](/C:/Users/kitti/Documents/Learning/Backend/Ecommerce/docs/HIGH_SCALE_PRODUCTION_ROADMAP.md)
