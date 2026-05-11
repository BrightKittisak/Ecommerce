import { APP_NAME } from '@/lib/constants'
import Link from 'next/link'
import React from 'react'

export default function CheckoutFooter() {
  return (
    <div className='border-t-2 space-y-2 my-4 py-4'>
      <p>
        ต้องการความช่วยเหลือ? ดูได้ที่{' '}
        <Link href='/page/help'>ศูนย์ช่วยเหลือ</Link> หรือ{' '}
        <Link href='/page/contact-us'>ติดต่อเรา</Link>
      </p>
      <p>
        สำหรับสินค้าที่สั่งซื้อจาก {APP_NAME}: เมื่อคุณกดปุ่ม
        {' '}&apos;ยืนยันคำสั่งซื้อ&apos; ระบบจะส่งอีเมลยืนยันการรับคำสั่งซื้อให้คุณ
        และการสั่งซื้อจะสมบูรณ์เมื่อเราแจ้งว่าสินค้าถูกจัดส่งแล้ว
        โดยการสั่งซื้อถือว่าคุณยอมรับ{' '}
        <Link href='/page/privacy-policy'>นโยบายความเป็นส่วนตัว</Link> และ
        <Link href='/page/conditions-of-use'> เงื่อนไขการใช้งาน</Link>
        {' '}ของ {APP_NAME}
      </p>
      <p>
        ภายใน 30 วันหลังได้รับสินค้า คุณสามารถยื่นขอคืนสินค้าใหม่ที่ยังไม่เปิดใช้งานและอยู่ในสภาพเดิมได้
        ทั้งนี้อาจมีข้อยกเว้นและเงื่อนไขเพิ่มเติม{' '}
        <Link href='/page/returns-policy'>
          ดูนโยบายการคืนสินค้าของ {APP_NAME}
        </Link>
      </p>
    </div>
  )
}
