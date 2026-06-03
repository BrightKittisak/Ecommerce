import { Data, IProductInput, IUserInput } from '@/types'
import { toSlug } from './utils'
import bcrypt from 'bcryptjs'

const DEV_SEED_PASSWORD = 'LushDemo123!'
const PASSWORD_HASH_SALT_ROUNDS = 12

const hashSeedPassword = () =>
  bcrypt.hashSync(DEV_SEED_PASSWORD, PASSWORD_HASH_SALT_ROUNDS)

const users: IUserInput[] = [
  {
    name: 'John',
    email: 'admin@example.com',
    password: hashSeedPassword(),
    role: 'Admin',
    address: {
      fullName: 'John Doe',
      street: '111 Main St',
      city: 'New York',
      province: 'NY',
      postalCode: '10001',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'Stripe',
    emailVerified: false,
  },
  {
    name: 'Jane',
    email: 'jane@example.com',
    password: hashSeedPassword(),
    role: 'User',
    address: {
      fullName: 'Jane Harris',
      street: '222 Main St',
      city: 'New York',
      province: 'NY',
      postalCode: '1002',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'Cash On Delivery',
    emailVerified: false,
  },
  {
    name: 'Jack',
    email: 'jack@example.com',
    password: hashSeedPassword(),
    role: 'User',
    address: {
      fullName: 'Jack Ryan',
      street: '333 Main St',
      city: 'New York',
      province: 'NY',
      postalCode: '1003',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'PayPal',
    emailVerified: false,
  },
  {
    name: 'Sarah',
    email: 'sarah@example.com',
    password: hashSeedPassword(),
    role: 'User',
    address: {
      fullName: 'Sarah Smith',
      street: '444 Main St',
      city: 'New York',
      province: 'NY',
      postalCode: '1005',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'Cash On Delivery',
    emailVerified: false,
  },
  {
    name: 'Michael',
    email: 'michael@example.com',
    password: hashSeedPassword(),
    role: 'User',
    address: {
      fullName: 'John Alexander',
      street: '555 Main St',
      city: 'New York',
      province: 'NY',
      postalCode: '1006',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'PayPal',
    emailVerified: false,
  },
  {
    name: 'Emily',
    email: 'emily@example.com',
    password: hashSeedPassword(),
    role: 'User',
    address: {
      fullName: 'Emily Johnson',
      street: '666 Main St',
      city: 'New York',
      province: 'NY',
      postalCode: '10001',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'Stripe',
    emailVerified: false,
  },
  {
    name: 'Alice',
    email: 'alice@example.com',
    password: hashSeedPassword(),
    role: 'User',
    address: {
      fullName: 'Alice Cooper',
      street: '777 Main St',
      city: 'New York',
      province: 'NY',
      postalCode: '10007',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'Cash On Delivery',
    emailVerified: false,
  },
  {
    name: 'Tom',
    email: 'tom@example.com',
    password: hashSeedPassword(),
    role: 'User',
    address: {
      fullName: 'Tom Hanks',
      street: '888 Main St',
      city: 'New York',
      province: 'NY',
      postalCode: '10008',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'Stripe',
    emailVerified: false,
  },
  {
    name: 'Linda',
    email: 'linda@example.com',
    password: hashSeedPassword(),
    role: 'User',
    address: {
      fullName: 'Linda Holmes',
      street: '999 Main St',
      city: 'New York',
      province: 'NY',
      postalCode: '10009',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'PayPal',
    emailVerified: false,
  },
  {
    name: 'George',
    email: 'george@example.com',
    password: hashSeedPassword(),
    role: 'User',
    address: {
      fullName: 'George Smith',
      street: '101 First Ave',
      city: 'New York',
      province: 'NY',
      postalCode: '10010',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'Stripe',
    emailVerified: false,
  },
  {
    name: 'Jessica',
    email: 'jessica@example.com',
    password: hashSeedPassword(),
    role: 'User',
    address: {
      fullName: 'Jessica Brown',
      street: '102 First Ave',
      city: 'New York',
      province: 'NY',
      postalCode: '10011',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'Cash On Delivery',
    emailVerified: false,
  },
  {
    name: 'Chris',
    email: 'chris@example.com',
    password: hashSeedPassword(),
    role: 'User',
    address: {
      fullName: 'Chris Evans',
      street: '103 First Ave',
      city: 'New York',
      province: 'NY',
      postalCode: '10012',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'PayPal',
    emailVerified: false,
  },
  {
    name: 'Samantha',
    email: 'samantha@example.com',
    password: hashSeedPassword(),
    role: 'User',
    address: {
      fullName: 'Samantha Wilson',
      street: '104 First Ave',
      city: 'New York',
      province: 'NY',
      postalCode: '10013',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'Stripe',
    emailVerified: false,
  },
  {
    name: 'David',
    email: 'david@example.com',
    password: hashSeedPassword(),
    role: 'User',
    address: {
      fullName: 'David Lee',
      street: '105 First Ave',
      city: 'New York',
      province: 'NY',
      postalCode: '10014',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'Cash On Delivery',
    emailVerified: false,
  },
  {
    name: 'Anna',
    email: 'anna@example.com',
    password: hashSeedPassword(),
    role: 'User',
    address: {
      fullName: 'Anna Smith',
      street: '106 First Ave',
      city: 'New York',
      province: 'NY',
      postalCode: '10015',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'PayPal',
    emailVerified: false,
  },
]


const products: IProductInput[] = [
  // T-Shirts
  {
    name: 'เสื้อยืดแขนยาวทรงสลิม Nike สำหรับผู้ชาย',
    slug: toSlug('Nike Mens Slim-fit Long-Sleeve T-Shirt'),
    category: 'T-Shirts',
    images: ['/images/p11-1.jpg', '/images/p11-2.jpg'],
    tags: ['new-arrival'],
    isPublished: true,
    price: 699,
    listPrice: 0,
    brand: 'Nike',
    avgRating: 4.71,
    numReviews: 7,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 0 },
      { rating: 3, count: 0 },
      { rating: 4, count: 2 },
      { rating: 5, count: 5 },
    ],
    numSales: 9,
    countInStock: 11,
    description:
      'ผลิตจากวัสดุที่คัดสรรให้ปลอดภัยต่อผู้สวมใส่และเป็นมิตรต่อสิ่งแวดล้อมมากขึ้น',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Green', 'Red', 'Black'],

    reviews: [],
  },
  {
    name: 'เสื้อยืดแขนยาวผ้าหนา Jerzees รุ่นผ้าผสม',
    slug: toSlug('Jerzees Long-Sleeve Heavyweight Blend T-Shirt'),
    category: 'T-Shirts',
    images: [
      '/images/p12-1.jpg',
      '/images/p12-2.jpg',
      '/images/p12-3.jpg',
      '/images/p12-4.jpg',
    ],
    tags: ['featured'],
    isPublished: true,
    price: 769,
    listPrice: 0,
    brand: 'Jerzees',
    avgRating: 4.2,
    numReviews: 10,
    ratingDistribution: [
      { rating: 1, count: 1 },
      { rating: 2, count: 0 },
      { rating: 3, count: 0 },
      { rating: 4, count: 4 },
      { rating: 5, count: 5 },
    ],
    numSales: 29,
    countInStock: 12,
    description:
      'ผลิตจากผ้าคอตตอนที่มาจากแหล่งผลิตอย่างยั่งยืนในสหรัฐฯ มาพร้อมเทปเสริมไหล่ เย็บคอเสื้อสองชั้น แขนเสื้อเข้ารูป ปลายแขนจั๊ม และลำตัวไร้ตะเข็บเพื่อความสบายในการสวมใส่',

    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Yellow', 'Red', 'Black'],

    reviews: [],
  },
  {
    name: 'เสื้อยืดแขนยาว Jerzees สำหรับผู้ชาย',
    slug: toSlug('Jerzees Men Long-Sleeve T-Shirt'),
    category: 'T-Shirts',
    brand: 'Jerzees',
    images: ['/images/p13-1.jpg', '/images/p13-2.jpg'],
    tags: ['best-seller'],
    isPublished: true,
    price: 449,
    listPrice: 519,
    avgRating: 4,
    numReviews: 12,
    ratingDistribution: [
      { rating: 1, count: 1 },
      { rating: 2, count: 0 },
      { rating: 3, count: 2 },
      { rating: 4, count: 4 },
      { rating: 5, count: 5 },
    ],
    numSales: 55,
    countInStock: 13,
    description:
      'เสื้อยืดแขนยาวรุ่นนี้ใช้เทคโนโลยี Dri-Power ช่วยระบายความชื้น ให้ใส่สบายและแห้งไวตลอดวัน พร้อมคอและปลายแขนแบบจั๊มเพื่อเพิ่มความทนทาน เหมาะกับการใส่ได้หลายฤดูกาล',
    sizes: ['XL', 'XXL'],
    colors: ['Green', 'White'],

    reviews: [],
  },
  {
    name: 'เสื้อยืดแขนยาวคอวี Decrum เนื้อนุ่ม',
    slug: toSlug(
      'Decrum Mens Plain Long Sleeve T-Shirt - Comfortable Soft Fashion V Neck Full Sleeves Jersey Shirts'
    ),
    category: 'T-Shirts',
    brand: 'Jerzees',
    images: ['/images/p14-1.jpg', '/images/p14-2.jpg'],
    tags: ['todays-deal'],
    isPublished: true,
    price: 869,
    listPrice: 1490,
    avgRating: 3.85,
    numReviews: 14,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 2 },
      { rating: 3, count: 3 },
      { rating: 4, count: 4 },
      { rating: 5, count: 5 },
    ],
    numSales: 54,
    countInStock: 14,
    description:
      'ยกระดับลุคประจำวันด้วยเสื้อยืดแขนยาวคอวีเนื้อนุ่ม ใส่สบายกว่าเสื้อคอตตอนทั่วไป และแมตช์ได้ง่ายทั้งวันทำงานและวันสบาย ๆ',
    sizes: ['XL', 'XXL'],
    colors: ['Yellow', 'White'],

    reviews: [],
  },
  {
    name: 'เสื้อเฮนลีย์ทรงสลิม Muscle Cmdr สำหรับผู้ชาย',
    slug: toSlug(
      "Muscle Cmdr Men's Slim Fit Henley Shirt Long&Short Business Sleeve Casual 3 Metal Buton Placket Casual Stylish T-Shirt"
    ),
    category: 'T-Shirts',
    brand: ' Muscle Cmdr',
    images: ['/images/p15-1.jpg', '/images/p15-2.jpg'],
    tags: ['new-arrival', 'featured'],
    isPublished: true,
    price: 969,
    listPrice: 1190,
    avgRating: 3.66,
    numReviews: 15,
    ratingDistribution: [
      { rating: 1, count: 1 },
      { rating: 2, count: 2 },
      { rating: 3, count: 3 },
      { rating: 4, count: 4 },
      { rating: 5, count: 5 },
    ],
    numSales: 54,
    countInStock: 15,
    description:
      'ดีไซน์ทรงสลิมช่วยให้เสื้อแนบลำตัวอย่างพอดี ขับสัดส่วนให้ดูคมขึ้น พร้อมกระดุมด้านหน้าสไตล์ Henley ที่ใส่ได้ทั้งลุคแคชชวลและกึ่งทางการ',
    sizes: ['XL', 'XXL'],
    colors: ['Green', 'Yellow'],

    reviews: [],
  },
  {
    name: 'เสื้อเฮนลีย์แขนยาว Hanes รุ่นผ้าหนา',
    slug: toSlug('Hanes Mens Long Sleeve Beefy Henley Shirt'),
    category: 'T-Shirts',
    brand: 'Jerzees',
    images: ['/images/p16-1.jpg', '/images/p16-2.jpg'],
    tags: ['best-seller', 'todays-deal'],
    isPublished: true,
    price: 819,
    listPrice: 1090,
    avgRating: 3.46,
    numReviews: 13,
    ratingDistribution: [
      { rating: 1, count: 1 },
      { rating: 2, count: 2 },
      { rating: 3, count: 3 },
      { rating: 4, count: 4 },
      { rating: 5, count: 3 },
    ],
    countInStock: 16,
    numSales: 56,
    description:
      'เสื้อแขนยาวผ้าคอตตอนเนื้อหนา ให้สัมผัสแน่นและทนทาน รุ่นสีผสมบางเฉดใช้ผ้าคอตตอนผสมโพลีเอสเตอร์เพื่อเพิ่มความยืดหยุ่นและดูแลง่าย',
    sizes: ['XL', 'XXL'],
    colors: ['Grey', 'White'],

    reviews: [],
  },
  // Jeans
  {
    name: 'กางเกงยีนส์บูทคัตทรงสลิม Silver Jeans Co. Jace',
    slug: toSlug('Silver Jeans Co. Mens Jace Slim Fit Bootcut Jeans'),
    category: 'Jeans',
    brand: 'Silver Jeans Co',
    images: ['/images/p21-1.jpg', '/images/p21-2.jpg'],
    tags: ['new-arrival'],
    isPublished: true,
    price: 3090,
    listPrice: 0,
    avgRating: 4.71,
    numReviews: 7,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 0 },
      { rating: 3, count: 0 },
      { rating: 4, count: 2 },
      { rating: 5, count: 5 },
    ],
    countInStock: 54,
    numSales: 21,
    description:
      'กางเกงยีนส์ทรงคาวบอยสมัยใหม่ เอวอยู่ต่ำกว่าระดับปกติเล็กน้อย เข้ารูปช่วงสะโพกและต้นขา พร้อมปลายขาแบบบูทคัตที่ยังสวมทับรองเท้าบูทได้สบาย',
    sizes: ['30Wx30L', '34Wx30L', '36Wx30L'],
    colors: ['Blue', 'Grey'],

    reviews: [],
  },
  {
    name: "กางเกงยีนส์ Levi's 505 ทรงเรกูลาร์",
    slug: toSlug(
      "Levi's mens 505 Regular Fit Jeans (Also Available in Big & Tall)"
    ),
    category: 'Jeans',
    brand: "Levi's",
    images: ['/images/p22-1.jpg', '/images/p22-2.jpg'],
    tags: ['featured'],
    isPublished: true,
    price: 1890,
    listPrice: 2290,
    avgRating: 4.2,
    numReviews: 10,
    ratingDistribution: [
      { rating: 1, count: 1 },
      { rating: 2, count: 0 },
      { rating: 3, count: 0 },
      { rating: 4, count: 4 },
      { rating: 5, count: 5 },
    ],
    countInStock: 22,
    numSales: 54,
    description:
      'ยีนส์คลาสสิกทรงเรกูลาร์ที่ใส่สบายและดูดีได้ง่าย เหมาะกับการแต่งตัวประจำวันแบบไม่ต้องคิดเยอะ',
    sizes: ['30Wx30L', '34Wx30L', '36Wx30L'],
    colors: ['Blue', 'Grey'],

    reviews: [],
  },
  {
    name: 'กางเกงยีนส์ทรงตรงผ้ายืด Essentials',
    slug: toSlug('Essentials Mens Straight-Fit Stretch Jean'),
    category: 'Jeans',
    brand: 'Essentials',
    images: ['/images/p23-1.jpg', '/images/p23-2.jpg'],
    tags: ['best-seller'],
    isPublished: true,
    price: 1290,
    listPrice: 1490,
    avgRating: 4,
    numReviews: 12,
    ratingDistribution: [
      { rating: 1, count: 1 },
      { rating: 2, count: 0 },
      { rating: 3, count: 2 },
      { rating: 4, count: 4 },
      { rating: 5, count: 5 },
    ],
    countInStock: 23,
    numSales: 54,
    description:
      'กางเกงยีนส์ทรงตรงแบบ 5 กระเป๋าคลาสสิก เพิ่มผ้ายืดเล็กน้อยเพื่อให้ใส่สบายขึ้นและช่วยคงทรงได้ดีตลอดวัน',
    sizes: ['30Wx30L', '34Wx30L', '36Wx30L'],
    colors: ['Grey', 'Blue'],

    reviews: [],
  },
  {
    name: 'กางเกงยีนส์เดนิมทรงรีแล็กซ์ Buffalo David Bitton',
    slug: toSlug(
      "Buffalo David Bitton Mens Men's Driven Relaxed Denim JeansJeans"
    ),
    category: 'Jeans',
    brand: 'Buffalo David Bitton',
    images: ['/images/p24-1.jpg', '/images/p24-2.jpg'],
    tags: ['todays-deal'],
    isPublished: true,
    price: 2290,
    listPrice: 3190,
    avgRating: 3.85,
    numReviews: 14,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 2 },
      { rating: 3, count: 3 },
      { rating: 4, count: 4 },
      { rating: 5, count: 5 },
    ],
    countInStock: 24,
    numSales: 53,
    description:
      'กางเกงยีนส์เดนิมรีไซเคิลทรงรีแล็กซ์ สีฟอกสไตล์วินเทจ เอวต่ำเล็กน้อย ใส่สบายช่วงขา พร้อมดีเทลลุคเซอร์แบบผ่านการใช้งานที่ช่วยให้การแต่งตัวดูเท่ขึ้นทันที',
    sizes: ['30Wx30L', '34Wx30L', '36Wx30L'],
    colors: ['Blue', 'Grey'],

    reviews: [],
  },
  {
    name: 'กางเกงยีนส์ช่างทรงหลวม Dickies',
    slug: toSlug('Dickies Mens Relaxed Fit Carpenter Jean'),
    category: 'Jeans',
    brand: 'Dickies',
    images: ['/images/p25-1.jpg', '/images/p25-2.jpg'],
    tags: ['new-arrival', 'featured'],
    isPublished: true,
    price: 3090,
    listPrice: 0,
    avgRating: 3.66,
    numReviews: 15,
    ratingDistribution: [
      { rating: 1, count: 1 },
      { rating: 2, count: 2 },
      { rating: 3, count: 3 },
      { rating: 4, count: 4 },
      { rating: 5, count: 5 },
    ],
    countInStock: 25,
    numSales: 48,
    description:
      'กางเกงยีนส์ทรงทำงานแบบหลวม มาพร้อมกระเป๋าสไตล์ช่างดั้งเดิมและป้ายโลโก้ด้านหลังกระเป๋า ให้ลุคเวิร์กแวร์ชัดเจน',
    sizes: ['30Wx30L', '34Wx30L', '36Wx30L'],
    colors: ['Blue', 'Grey'],

    reviews: [],
  },
  {
    name: 'กางเกงยีนส์คาวบอยทรงสลิม Wrangler Premium Performance',
    slug: toSlug(
      'Wrangler mens Premium Performance Cowboy Cut Slim Fit Jean'
    ),
    category: 'Jeans',
    brand: 'Wrangler',
    images: ['/images/p26-1.jpg', '/images/p26-2.jpg'],
    tags: ['best-seller', 'todays-deal'],
    isPublished: true,
    price: 2590,
    listPrice: 4790,
    avgRating: 3.46,
    numReviews: 13,
    ratingDistribution: [
      { rating: 1, count: 1 },
      { rating: 2, count: 2 },
      { rating: 3, count: 3 },
      { rating: 4, count: 4 },
      { rating: 5, count: 3 },
    ],
    countInStock: 26,
    numSales: 48,
    description:
      'ออกแบบมาเพื่อใส่กับรองเท้าบูทได้พอดี ทรงสลิมช่วงเอว สะโพก และต้นขา ช่วยให้เคลื่อนไหวสะดวกและใส่สบายในวันใช้งานยาว ๆ',
    sizes: ['30Wx30L', '34Wx30L', '36Wx30L'],
    colors: ['Blue', 'Grey'],

    reviews: [],
  },
  // Watches
  {
    name: 'นาฬิกา Seiko หน้าปัดดำสไตล์อะนาล็อก',
    slug: toSlug("Seiko Men's Analogue Watch with Black Dial"),
    category: 'Wrist Watches',
    brand: 'Seiko',
    images: ['/images/p31-1.jpg', '/images/p31-2.jpg'],
    tags: ['new-arrival'],
    isPublished: true,
    price: 17090,
    listPrice: 0,
    avgRating: 4.71,
    numReviews: 7,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 0 },
      { rating: 3, count: 0 },
      { rating: 4, count: 2 },
      { rating: 5, count: 5 },
    ],
    countInStock: 31,
    numSales: 48,
    description:
      'ตัวเรือนสเตนเลสทรงกลมสีเงิน มาพร้อมกระจก Hardlex และตัวล็อกแบบพับพร้อมระบบนิรภัย ให้ลุคสุภาพและใช้งานได้ทุกวัน',
    sizes: [],
    colors: [],

    reviews: [],
  },
  {
    name: 'นาฬิกาอัตโนมัติ Seiko 5 Sport SRPJ83 หน้าปัดเบจ',
    slug: toSlug(
      'SEIKO 5 Sport SRPJ83 Beige Dial Nylon Automatic Watch, Beige, Automatic Watch'
    ),
    category: 'Wrist Watches',
    brand: 'Seiko',
    images: ['/images/p32-1.jpg', '/images/p32-2.jpg'],
    tags: ['featured'],
    isPublished: true,
    price: 12090,
    listPrice: 12890,
    avgRating: 4.2,
    numReviews: 10,
    ratingDistribution: [
      { rating: 1, count: 1 },
      { rating: 2, count: 0 },
      { rating: 3, count: 0 },
      { rating: 4, count: 4 },
      { rating: 5, count: 5 },
    ],
    countInStock: 32,
    numSales: 48,
    description:
      'นาฬิกาจากคอลเลกชัน Seiko 5 Sports ที่ได้แรงบันดาลใจจากนาฬิกาภาคสนามและนักบินแบบวินเทจ ระบบอัตโนมัติพร้อมไขลานด้วยมือได้',
    sizes: [],
    colors: [],

    reviews: [],
  },
  {
    name: 'นาฬิกา Casio สายสเตนเลสอะนาล็อกลุยงาน',
    slug: toSlug(
      "Casio Men's Heavy Duty Analog Quartz Stainless Steel Strap, Silver, 42 Casual Watch"
    ),
    category: 'Wrist Watches',
    brand: 'Casio',
    images: ['/images/p33-1.jpg', '/images/p33-2.jpg'],
    tags: ['best-seller'],
    isPublished: true,
    price: 1990,
    listPrice: 0,
    avgRating: 4,
    numReviews: 12,
    ratingDistribution: [
      { rating: 1, count: 1 },
      { rating: 2, count: 0 },
      { rating: 3, count: 2 },
      { rating: 4, count: 4 },
      { rating: 5, count: 5 },
    ],
    countInStock: 33,
    numSales: 48,
    description:
      'นาฬิกา Casio รุ่นลุยงานที่มาพร้อมตัวเรือนสเตนเลสผิวปัดด้าน แข็งแรง ทนทาน และเหมาะกับการใช้งานประจำวันแบบสมบุกสมบัน',
    sizes: [],
    colors: [],

    reviews: [],
  },
  {
    name: 'นาฬิกา Casio คลาสสิกสายสเตนเลสพร้อมช่องวันที่',
    slug: toSlug(
      'Casio Classic Silver-Tone Stainless Steel Band Date Indicator Watch'
    ),
    category: 'Wrist Watches',
    brand: 'Casio',
    images: ['/images/p34-1.jpg', '/images/p34-2.jpg'],
    tags: ['todays-deal'],
    isPublished: true,
    price: 1090,
    listPrice: 1790,
    avgRating: 3.85,
    numReviews: 14,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 2 },
      { rating: 3, count: 3 },
      { rating: 4, count: 4 },
      { rating: 5, count: 5 },
    ],
    countInStock: 34,
    numSales: 48,
    description:
      'นาฬิกาคลาสสิกกันน้ำลึก 50 เมตร พร้อมหน้าปัดสีขาวและช่องวันที่ ดีไซน์ 3 เข็มเรียบหรู เหมาะทั้งวันทำงานและโอกาสทางการ',
    sizes: [],
    colors: [],

    reviews: [],
  },
  {
    name: 'นาฬิกาโครโนกราฟ Fossil Grant สเตนเลส',
    slug: toSlug(
      "Fossil Men's Grant Stainless Steel Quartz Chronograph Watch"
    ),
    category: 'Wrist Watches',
    brand: 'Fossil',
    images: ['/images/p35-1.jpg', '/images/p35-2.jpg'],
    tags: ['new-arrival', 'featured'],
    isPublished: true,
    price: 5490,
    listPrice: 7290,
    avgRating: 3.66,
    numReviews: 15,
    ratingDistribution: [
      { rating: 1, count: 1 },
      { rating: 2, count: 2 },
      { rating: 3, count: 3 },
      { rating: 4, count: 4 },
      { rating: 5, count: 5 },
    ],
    countInStock: 35,
    numSales: 48,
    description:
      'นาฬิกาโครโนกราฟดีไซน์หรู ตัวเรือนโทนเงิน-น้ำเงิน หน้าปัดซันเรย์สีน้ำเงิน และเลขโรมันสีเงิน ช่วยยกระดับลุคได้ทันที',
    sizes: [],
    colors: ['Blue', 'Black', 'Sliver'],

    reviews: [],
  },
  {
    name: 'นาฬิกา Fossil Machine สเตนเลสสีดำ',
    slug: toSlug("Fossil Men's Machine Stainless Steel Quartz Watch"),
    category: 'Wrist Watches',
    brand: 'Fossil',
    images: ['/images/p36-1.jpg', '/images/p36-2.jpg'],
    tags: ['best-seller', 'todays-deal'],
    isPublished: true,
    price: 5090,
    listPrice: 7390,
    avgRating: 3.46,
    numReviews: 13,
    ratingDistribution: [
      { rating: 1, count: 1 },
      { rating: 2, count: 2 },
      { rating: 3, count: 3 },
      { rating: 4, count: 4 },
      { rating: 5, count: 3 },
    ],
    countInStock: 36,
    numSales: 49,
    description:
      'นาฬิกาสีดำล้วนสไตล์อินดัสเทรียล ให้ลุคเท่ทันสมัย เหมาะกับการแต่งตัวแคชชวล พร้อมสายสเตนเลสและระบบ 3 เข็มใช้งานง่าย',
    sizes: [],
    colors: ['Brown', 'Sliver', 'Black'],

    reviews: [],
  },
  // Sneakers
  {
    name: 'รองเท้าผ้าใบ adidas Grand Court 2.0',
    slug: toSlug(
      'adidas Mens Grand Court 2.0 Training Shoes Training Shoes'
    ),
    category: 'Shoes',
    brand: 'adidas',
    images: ['/images/p41-1.jpg', '/images/p41-2.jpg'],
    tags: ['new-arrival'],
    isPublished: true,
    price: 2590,
    listPrice: 0,
    avgRating: 4.71,
    numReviews: 7,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 0 },
      { rating: 3, count: 0 },
      { rating: 4, count: 2 },
      { rating: 5, count: 5 },
    ],
    countInStock: 41,
    numSales: 48,
    description:
      'พื้นรองเท้า Cloudfoam Comfort นุ่มเป็นพิเศษ พร้อมชั้นรองรับแรงกระแทกสองชั้นและวัสดุตาข่ายระบายอากาศ ใส่เดินทั้งวันได้สบาย',
    sizes: ['8', '9', '10'],
    colors: ['White', 'Black', 'Grey'],

    reviews: [],
  },
  {
    name: 'รองเท้าผ้าใบและลำลอง ziitop ระบายอากาศ',
    slug: toSlug(
      "ziitop Men's Running Walking Shoes Fashion Sneakers Mesh Dress Shoes Business Oxfords Shoes Lightweight Casual Breathable Work Formal Shoes"
    ),
    category: 'Shoes',
    brand: 'ziitop',
    images: ['/images/p42-1.jpg', '/images/p42-2.jpg'],
    tags: ['featured'],
    isPublished: true,
    price: 1290,
    listPrice: 1590,
    avgRating: 4.2,
    numReviews: 10,
    ratingDistribution: [
      { rating: 1, count: 1 },
      { rating: 2, count: 0 },
      { rating: 3, count: 0 },
      { rating: 4, count: 4 },
      { rating: 5, count: 5 },
    ],
    countInStock: 42,
    numSales: 50,
    description:
      'รองเท้าน้ำหนักเบาที่ใส่ได้หลายโอกาส ทั้งเดิน ทำงาน และลุคกึ่งทางการ มาพร้อมพื้นนุ่มและผ้าตาข่ายช่วยระบายอากาศ',
    sizes: ['8', '9', '10'],
    colors: ['Beige', 'Black', 'Grey'],

    reviews: [],
  },
  {
    name: 'รองเท้า Skechers Summits High Range Slip-ins',
    slug: toSlug(
      'Skechers mens Summits High Range Hands Free Slip-in Shoes Work shoe'
    ),
    category: 'Shoes',
    brand: 'Skechers',
    images: ['/images/p43-1.jpg', '/images/p43-2.jpg'],
    tags: ['best-seller'],
    isPublished: true,
    price: 3190,
    listPrice: 0,
    avgRating: 4,
    numReviews: 12,
    ratingDistribution: [
      { rating: 1, count: 1 },
      { rating: 2, count: 0 },
      { rating: 3, count: 2 },
      { rating: 4, count: 4 },
      { rating: 5, count: 5 },
    ],
    countInStock: 43,
    numSales: 72,
    description:
      'รองเท้า Slip-ins ที่ใส่ง่ายโดยไม่ต้องก้มผูกเชือก มาพร้อม Heel Pillow ช่วยล็อกส้นเท้าให้อยู่ทรง และหน้าผ้าตาข่ายที่ใส่สบายระหว่างวัน',
    sizes: ['8', '9', '10'],
    colors: ['Navy', 'Black', 'Grey'],

    reviews: [],
  },
  {
    name: 'รองเท้าวิ่งและเดิน DLWKIPV ระบายอากาศ',
    slug: toSlug(
      'DLWKIPV Mens Running Shoes Tennis Cross Training Sneakers Fashion Non Slip Outdoor Walking Jogging Shoes Mesh Light Flexible Comfortable Breathable Shoes'
    ),
    category: 'Shoes',
    brand: 'DLWKIPV',
    images: ['/images/p44-1.jpg', '/images/p44-2.jpg'],
    tags: ['todays-deal'],
    isPublished: true,
    price: 1190,
    listPrice: 1790,
    avgRating: 3.85,
    numReviews: 14,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 2 },
      { rating: 3, count: 3 },
      { rating: 4, count: 4 },
      { rating: 5, count: 5 },
    ],
    countInStock: 44,
    numSales: 72,
    description:
      'รองเท้าตาข่ายระบายอากาศดี พื้นออกแบบร่องกันลื่นและช่วยซับแรงกระแทก ด้านในกว้างและนุ่ม เหมาะกับการเดิน วิ่ง หรือใช้งานกลางแจ้ง',
    sizes: ['8', '9', '10', '11', '12'],
    colors: ['Brown', 'Black', 'Grey'],

    reviews: [],
  },
  {
    name: 'รองเท้าวิ่ง ASICS GT-2000 13',
    slug: toSlug("ASICS Men's GT-2000 13 Running Shoes"),
    category: 'Shoes',
    brand: 'ASICS',
    images: ['/images/p45-1.jpg', '/images/p45-2.jpg'],
    tags: ['new-arrival', 'featured'],
    isPublished: true,
    price: 5790,
    listPrice: 6490,
    avgRating: 3.66,
    numReviews: 15,
    ratingDistribution: [
      { rating: 1, count: 1 },
      { rating: 2, count: 2 },
      { rating: 3, count: 3 },
      { rating: 4, count: 4 },
      { rating: 5, count: 5 },
    ],
    countInStock: 45,
    numSales: 64,
    description:
      'รองเท้าวิ่งที่ใช้วัสดุรีไซเคิลอย่างน้อย 50% ในส่วนอัปเปอร์หลัก ช่วยลดของเสียและผลกระทบต่อสิ่งแวดล้อมโดยยังคงความสบายในการสวมใส่',
    sizes: ['8', '9', '10', '11'],
    colors: ['Blue', 'Black', 'Grey'],

    reviews: [],
  },
  {
    name: 'รองเท้าลำลอง Wearbreeze Urban สำหรับผู้ชาย',
    slug: toSlug(
      "Mens Wearbreeze Shoes, Urban - Ultra Comfortable Shoes, Breeze Shoes for Men, Men's Mesh Dress Sneakers Business Shoes"
    ),
    category: 'Shoes',
    brand: 'Generic',
    images: ['/images/p46-1.jpg', '/images/p46-2.jpg'],
    tags: ['best-seller', 'todays-deal'],
    isPublished: true,
    price: 1090,
    listPrice: 2590,
    avgRating: 3.46,
    numReviews: 13,
    ratingDistribution: [
      { rating: 1, count: 1 },
      { rating: 2, count: 2 },
      { rating: 3, count: 3 },
      { rating: 4, count: 4 },
      { rating: 5, count: 3 },
    ],
    countInStock: 46,
    numSales: 48,
    description:
      'รองเท้าลำลองแนวสมาร์ตแคชชวลที่เน้นความนุ่มสบาย พื้นรองรับแรงกระแทกดีและผ้าตาข่ายช่วยให้ใส่ได้สบายตลอดวัน',
    sizes: ['8', '9', '10', '11'],
    colors: ['Green', 'Black', 'Grey'],

    reviews: [],
  },
]

const reviews = [
  {
    rating: 1,
    title: 'คุณภาพไม่ดี',
    comment:
      'ผิดหวังพอสมควร ใช้งานได้ไม่นานสินค้าก็เริ่มมีปัญหา รู้สึกว่าไม่คุ้มกับราคาที่จ่ายไป',
  },
  {
    rating: 2,
    title: 'ยังไม่ประทับใจ',
    comment:
      'สินค้าจริงไม่ตรงกับที่คาดไว้ วัสดุดูธรรมดาและสวมใส่แล้วไม่ค่อยพอดี ไม่น่าจะสั่งซ้ำ',
  },
  {
    rating: 2,
    title: 'ควรปรับปรุง',
    comment:
      'หน้าตาดูดีแต่การใช้งานจริงยังไม่ตอบโจทย์ ถ้าปรับรายละเอียดอีกหน่อยจะน่าใช้กว่านี้มาก',
  },
  {
    rating: 3,
    title: 'ใช้ได้',
    comment:
      'โดยรวมถือว่าโอเค คุณภาพพอใช้ได้ แต่ยังมีรายละเอียดเล็ก ๆ ที่ควรเก็บให้เรียบร้อยขึ้น',
  },
  {
    rating: 3,
    title: 'พอใช้ แต่ยังไม่สุด',
    comment:
      'ใช้งานได้จริง แต่ยังไม่ดีเท่าที่หวังไว้ คุณภาพอยู่ในระดับกลางและงานเก็บรายละเอียดน้อยไปหน่อย',
  },
  {
    rating: 3,
    title: 'สินค้าโอเค',
    comment:
      'ตัวสินค้าน่าใช้ วัสดุค่อนข้างสบายและระบายอากาศดี เหมาะกับการใช้งานประจำวัน',
  },
  {
    rating: 4,
    title: 'ดีเกินคาด',
    comment:
      'เป็นสินค้าที่คุ้มราคา ใช้งานได้ดีจริง ยังมีจุดเล็กน้อยที่ปรับได้ แต่ภาพรวมถือว่าน่าพอใจมาก',
  },
  {
    rating: 4,
    title: 'พอใจมาก',
    comment:
      'คุณภาพดีสมราคา ใช้งานแล้วประทับใจ ถ้ามีสีหรือรุ่นที่ชอบเพิ่มก็มีโอกาสกลับมาซื้ออีก',
  },
  {
    rating: 4,
    title: 'ชอบมาก',
    comment:
      'ทั้งดีไซน์ คุณภาพ และความสบายทำออกมาได้ดีเกินที่คาดไว้ ใช้แล้วรู้สึกว่าตัดสินใจไม่ผิด',
  },
  {
    rating: 4,
    title: 'เกินความคาดหมาย',
    comment:
      'งานประกอบดี ดูทนทาน และใช้งานได้ตามที่หวังไว้ ถือเป็นตัวเลือกที่แนะนำได้สบาย ๆ',
  },
  {
    rating: 5,
    title: 'คุ้มมาก',
    comment:
      'ประทับใจตั้งแต่ครั้งแรกที่ใช้ คุณภาพดีมากและใช้งานได้ลื่นไหล ไม่มีจุดให้กังวลเลย',
  },
  {
    rating: 5,
    title: 'แนะนำเลย',
    comment:
      'คุ้มค่าทุกบาท ดีไซน์สวย ดูพรีเมียม และใช้งานจริงได้ดีมาก เป็นชิ้นที่อยากบอกต่อ',
  },
  {
    rating: 5,
    title: 'ตรงใจพอดี',
    comment:
      'สินค้าตรงตามรายละเอียดที่แจ้งไว้ คุณภาพดีกว่าที่คิดและเหมาะกับสิ่งที่กำลังมองหาอยู่พอดี',
  },
  {
    rating: 5,
    title: 'เลือกไม่ผิด',
    comment:
      'ทุกอย่างลงตัวตั้งแต่วัสดุไปจนถึงการใช้งานจริง รู้สึกได้เลยว่าเป็นสินค้าที่ใส่ใจรายละเอียด',
  },
  {
    rating: 5,
    title: 'ดีมากจนไม่อยากเปลี่ยน',
    comment:
      'ทั้งทน สวย และใช้งานดีมาก ใช้แล้วชอบจริง ถ้าต้องซื้อเพิ่มก็พร้อมตัดสินใจอีกครั้งแบบไม่ลังเล',
  },
]

const data: Data = {
  users,
  products,
  reviews,
  headerMenus: [
    {
      name: 'ดีลวันนี้',
      href: '/search?tag=todays-deal',
    },
    {
      name: 'ของเข้าใหม่',
      href: '/search?tag=new-arrival',
    },
    {
      name: 'สินค้าแนะนำ',
      href: '/search?tag=featured',
    },
    {
      name: 'ขายดี',
      href: '/search?tag=best-seller',
    },
    {
      name: 'ประวัติการเข้าชม',
      href: '/#browsing-history',
    },
    {
      name: 'บริการลูกค้า',
      href: '/page/customer-service',
    },
    {
      name: 'เกี่ยวกับเรา',
      href: '/page/about-us',
    },
    {
      name: 'ช่วยเหลือ',
      href: '/page/help',
    },
  ],
  carousels: [
    {
      title: 'รองเท้ายอดนิยมที่ลูกค้าหยิบใส่ตะกร้ามากที่สุดในช่วงนี้',
      buttonCaption: 'เลือกซื้อเลย',
      image: '/images/banner3.jpg',
      url: '/search?category=Shoes',
      isPublished: true,
    },
    {
      title: 'เสื้อยืดขายดีที่แต่งง่าย ใส่สบาย และหยิบใช้ได้ทุกวัน',
      buttonCaption: 'เลือกซื้อเลย',
      image: '/images/banner1.jpg',
      url: '/search?category=T-Shirts',
      isPublished: true,
    },
    {
      title: 'ดีลนาฬิกาข้อมือสุดคุ้มที่ช่วยยกระดับลุคได้ในทุกโอกาส',
      buttonCaption: 'ดูเพิ่มเติม',
      image: '/images/banner2.jpg',
      url: '/search?category=Wrist Watches',
      isPublished: true,
    },
  ],
}

export default data
