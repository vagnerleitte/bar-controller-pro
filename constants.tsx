
import { Product, Customer, Order } from './types';
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Heineken 330ml',
    sku: 'BEER-001',
    price: 12.00,
    cost: 7.2,
    category: 'Cervejas',
    subcategory: 'Long Neck',
    subgroup: 'Long Neck',
    unit: 'lata',
    location: 'Geladeira 1',
    stock: 36,
    minStock: 12,
    idealStock: 48,
    status: 'active',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsOfY2Pasu6u0EkfhJYOfCvfL6sjjl_cwLL6DfTVjmrpvNkqLFij_zu1M7t-8xSDkozZRQI43cKAjyd5OkzrE4b25cUONnt70_5Y44XRV5R3jaWGiaCSNHbrNvcZwK4ZT2qX7becSZRDuxzX-3nj3oW588oHQktgQ8YVDtbQHNUULq30nV9EuerM5ydRi1B8fWFY1O7VZJUL3Bylsaa27wfXao2kO9y4VfUHgBe9k8iWzDl1m5NoR5GkZdE3z_v01sbcSdB9LUa9qh'
  },
  {
    id: 'p2',
    name: 'Negroni Classic',
    sku: 'DRK-022',
    price: 28.00,
    cost: 11.5,
    category: 'Drinks',
    subcategory: 'Clássicos',
    subgroup: 'Clássicos',
    unit: 'un',
    location: 'Bar interno',
    stock: 18,
    minStock: 8,
    idealStock: 24,
    status: 'active',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4uq6mBcYPCBngaSwH_Mhul2TnHjN4yyqf4o08IMLqsj9E_iZ4HSwcU2H8TwyENK6LRV_QhAAiSJZbWYjmi8gwOAwwN5Zu5z3aV8_cLqp6FicMEyN1OQ4ZqIke06N9yoaB60MlDHIC8geD23-2oCRqprCyN1IlMGQOI99_H2CTYf0ItMp7dLRFjWGmiEm16F65R0t94rLnuEPspCYUJsoTrsdkbSVcM2sHDEeEoaQE-Cn80JSyLMrSAFVY-NtcL1qyl2CYGTxKf7_9'
  },
  {
    id: 'p3',
    name: 'Batata Frita G',
    sku: 'PTK-009',
    price: 22.00,
    cost: 8.9,
    category: 'Petiscos',
    subcategory: 'Fritos',
    subgroup: 'Fritos',
    unit: 'un',
    location: 'Cozinha',
    stock: 9,
    minStock: 10,
    idealStock: 20,
    status: 'active',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4Jet_9jDTKhHlcdFXpPTZAcg7aFo0ROLhJyqmeZ35JOVs7Z6WZszzy9mkBKDB3JdBZHILrW53ALSQOI1yx9G-52owHxpjZfRPgrS72Y2rSRxHyJFrwK-crpBWXioFVxzHzzO797FKoiFYfDZiHQ7iiyEY-8kqWapZN70CQemDT-WkQ9_hm0pFFPeR97V-FmWTI2fZCCvq1WYHDXENbkJ5R3-xnPVr0ftruZB2lkeE5FMXPgzoh7csIXBr-b8CZ0ST-kiDb6AWFlz2'
  },
  {
    id: 'p4',
    name: 'Gin Tônica Premium',
    sku: 'DRK-044',
    price: 32.00,
    cost: 12.5,
    category: 'Drinks',
    subcategory: 'Gins',
    subgroup: 'Gins',
    unit: 'un',
    location: 'Bar interno',
    stock: 14,
    minStock: 8,
    idealStock: 20,
    status: 'active',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB420D8-cvDpVbl5ygrnQBJyYEauSqLTn7r0SeMxGYYLkCxSq3Dq3dOCEV86h5D3aTQ8Wq_IQa4W5K3-S0CW_1yY3Dib2e67ZmGkJQYls5_p-cYT-Yn4PLxY62lHsGPnpp8D8D8Qj6dbP0YIxRQ2NZQvl1Xz5rKDDlcTwP20sTqGH_-pX3Rp_b-yl2_gqtut789WFrqXmzODzTy0n7C9HlbtUte85VUyrnK_kMTDWvd5Y2j_byM2CQF3V5cZFGFTAxBM1rRSjfYL7Fe'
  },
  {
    id: 'p5',
    name: 'Budweiser 350ml',
    sku: 'BEER-002',
    price: 10.00,
    cost: 6.1,
    category: 'Cervejas',
    subcategory: 'Lata',
    subgroup: 'Lata',
    unit: 'lata',
    location: 'Geladeira 1',
    stock: 48,
    minStock: 14,
    idealStock: 60,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'p6',
    name: 'Corona Extra 330ml',
    sku: 'BEER-003',
    price: 14.00,
    cost: 8.3,
    category: 'Cervejas',
    subcategory: 'Long Neck',
    subgroup: 'Long Neck',
    unit: 'garrafa',
    location: 'Geladeira 2',
    stock: 28,
    minStock: 10,
    idealStock: 40,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'p7',
    name: 'Caipirinha Limão',
    sku: 'DRK-010',
    price: 18.00,
    cost: 6.8,
    category: 'Drinks',
    subcategory: 'Caipirinhas',
    subgroup: 'Caipirinhas',
    unit: 'un',
    location: 'Bar interno',
    stock: 34,
    minStock: 8,
    idealStock: 40,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6cf7?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'p8',
    name: 'Whisky Dose',
    sku: 'DRK-071',
    price: 22.00,
    cost: 9.4,
    category: 'Destilados',
    subcategory: 'Whisky',
    subgroup: 'Whisky',
    unit: 'ml',
    location: 'Prateleira A',
    stock: 1200,
    minStock: 300,
    idealStock: 2000,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1514361892635-eae31ec0d9d8?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'p9',
    name: 'Refrigerante Lata',
    sku: 'SOFT-011',
    price: 7.00,
    cost: 3.2,
    category: 'Não Alcoólico',
    subcategory: 'Refrigerante',
    subgroup: 'Refrigerante',
    unit: 'lata',
    location: 'Geladeira 3',
    stock: 60,
    minStock: 20,
    idealStock: 80,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'p10',
    name: 'Água sem gás 500ml',
    sku: 'WTR-001',
    price: 4.00,
    cost: 1.4,
    category: 'Não Alcoólico',
    subcategory: 'Água',
    subgroup: 'Água',
    unit: 'garrafa',
    location: 'Geladeira 3',
    stock: 72,
    minStock: 24,
    idealStock: 96,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1564419431639-6f6430f0f2e8?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'p11',
    name: 'Porção Calabresa',
    sku: 'PTK-014',
    price: 27.00,
    cost: 10.8,
    category: 'Petiscos',
    subcategory: 'Chaparia',
    subgroup: 'Chaparia',
    unit: 'un',
    location: 'Cozinha',
    stock: 16,
    minStock: 6,
    idealStock: 24,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'p12',
    name: 'Espetinho Bovino',
    sku: 'PTK-018',
    price: 12.00,
    cost: 4.7,
    category: 'Petiscos',
    subcategory: 'Espetos',
    subgroup: 'Espetos',
    unit: 'un',
    location: 'Freezer 1',
    stock: 44,
    minStock: 12,
    idealStock: 64,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1529563021893-cc83c992d75d?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'p13',
    name: 'Amendoim Torrado',
    sku: 'SNK-003',
    price: 8.00,
    cost: 2.9,
    category: 'Snacks',
    subcategory: 'Pacotes',
    subgroup: 'Pacotes',
    unit: 'pct',
    location: 'Expositor',
    stock: 38,
    minStock: 10,
    idealStock: 50,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1608032364895-0da67af36cd2?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'p14',
    name: 'Energético 250ml',
    sku: 'SOFT-019',
    price: 13.00,
    cost: 6.2,
    category: 'Não Alcoólico',
    subcategory: 'Energético',
    subgroup: 'Energético',
    unit: 'lata',
    location: 'Geladeira 2',
    stock: 26,
    minStock: 8,
    idealStock: 36,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?auto=format&fit=crop&w=900&q=80'
  }
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Thiago Martins',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVszlZncxvjVAbz59MMfQPS1ujxF8aoL9GMmc0IuSnjtAD2xO891qhtPDhhparviKXCmVqkhWajBwGqZZI_7cUW4IlED4msssxAbK4p-SZ_C0gcrHNuujwKy9-GKUhS48ch8vcd_8R05hThAo6NxhQYIICC4jTlIyAsMGrctxRNQvPHsQT1MykOqmOfvhdP-f40iKzdnj1I3WYNAngdYoF3ygOTNaBqOwmz_2pn6jW_ydTbBcThhPOChQwY6TjtJOFYAlqESyrf-co',
    isFavorite: true,
    phone: '+55 11 98877-6655',
    monthlyLimit: 1200
  },
  {
    id: 'c2',
    name: 'Mariana Costa',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFWKWBWCSi4MqdA57vKpfjcndaC8wnAaZqAUhgWBEj3IhAotoRM-Sa-m0UxjQ7-9uqcYwb3LJ1W7aURTT8tShRAVc3bQ3aqECKYU20jqsQxkApYvEs0fcSzG4-n-LjZcxfcFQxSrwIl55YalMLoCtSHED71dlA6DtJKrErc6kPphkLvHLHEQLexORiuUv7w9GZQfFjMdbWSWaxvW3rYfHreN1NK1w2uTvqqDwDa8p_-TNCV1jYfvsvCx5kqYqt5c5hN1DH6X_mWr0D',
    isFavorite: true,
    phone: '+55 11 97766-5544',
    monthlyLimit: 800
  },
  {
    id: 'c3',
    name: 'Carlos Eduardo',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwAxGoxwMYcPm7RYv2bCYqXed2eYTuiQ6OBh944d5fFcyP2pFNBViN_BJsuHeabAnv3zS32HUS95A3Z0oP4BN1ASIotJgSr6rXPWj8-40mNTwH8tFOG76ubMpaRBphBZNYEn0a3V5voNWHXkyRJH8X9n8xhdSpt25tBL6aMf0HyYZCVnNnKJmg-WfCxZyOaOVh2mQgp1U4w3GviAPgpNGaYtgPWQ1W5jvZpnkf7y-Jo77ejqp_HSPSFzDkHRGP6wv9jJK4KKasS1v-',
    isFavorite: true,
    phone: '+55 11 96655-4433'
  },
  {
    id: 'c4',
    name: 'Beatriz Silva',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdHKwDwZ_kYjzBgKjsqtCrfJMoZXOgs_AA3xq5GW2yOMB2DVYfPQTL-rOTZ_x9YEsHR9wiXpE73EOyNJ76wcnYmYHGeF6O09Bji5OrbicDdyfvL6zOm1Hf54JfXGolti2h2OrZu2sR4emorvHUYSz2aMKem_462nGfGdmtQ_mzSeD4mHUlpty818PW-gwoGyVel3iwlIfHuSatId49NGayw2rJ8dC4yH7ebPqJ8KwUZDgxPSZ23uIEd4vLYgxQcvGkYEAG_O9MN2EQ',
    isFavorite: false,
    phone: '+55 11 95544-3322',
    monthlyLimit: 1500
  },
  {
    id: 'c5',
    name: 'Fernanda Lima',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFWKWBWCSi4MqdA57vKpfjcndaC8wnAaZqAUhgWBEj3IhAotoRM-Sa-m0UxjQ7-9uqcYwb3LJ1W7aURTT8tShRAVc3bQ3aqECKYU20jqsQxkApYvEs0fcSzG4-n-LjZcxfcFQxSrwIl55YalMLoCtSHED71dlA6DtJKrErc6kPphkLvHLHEQLexORiuUv7w9GZQfFjMdbWSWaxvW3rYfHreN1NK1w2uTvqqDwDa8p_-TNCV1jYfvsvCx5kqYqt5c5hN1DH6X_mWr0D',
    isFavorite: false,
    phone: '+55 11 94433-2211'
  },
  {
    id: 'c6',
    name: 'Lucas Ferreira',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwAxGoxwMYcPm7RYv2bCYqXed2eYTuiQ6OBh944d5fFcyP2pFNBViN_BJsuHeabAnv3zS32HUS95A3Z0oP4BN1ASIotJgSr6rXPWj8-40mNTwH8tFOG76ubMpaRBphBZNYEn0a3V5voNWHXkyRJH8X9n8xhdSpt25tBL6aMf0HyYZCVnNnKJmg-WfCxZyOaOVh2mQgp1U4w3GviAPgpNGaYtgPWQ1W5jvZpnkf7y-Jo77ejqp_HSPSFzDkHRGP6wv9jJK4KKasS1v-',
    isFavorite: false,
    phone: '+55 21 93322-1188'
  },
  {
    id: 'c7',
    name: 'Aline Rocha',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVszlZncxvjVAbz59MMfQPS1ujxF8aoL9GMmc0IuSnjtAD2xO891qhtPDhhparviKXCmVqkhWajBwGqZZI_7cUW4IlED4msssxAbK4p-SZ_C0gcrHNuujwKy9-GKUhS48ch8vcd_8R05hThAo6NxhQYIICC4jTlIyAsMGrctxRNQvPHsQT1MykOqmOfvhdP-f40iKzdnj1I3WYNAngdYoF3ygOTNaBqOwmz_2pn6jW_ydTbBcThhPOChQwY6TjtJOFYAlqESyrf-co',
    isFavorite: false,
    phone: '+55 31 92211-7733',
    monthlyLimit: 600
  },
  {
    id: 'c8',
    name: 'Rafael Pinto',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdHKwDwZ_kYjzBgKjsqtCrfJMoZXOgs_AA3xq5GW2yOMB2DVYfPQTL-rOTZ_x9YEsHR9wiXpE73EOyNJ76wcnYmYHGeF6O09Bji5OrbicDdyfvL6zOm1Hf54JfXGolti2h2OrZu2sR4emorvHUYSz2aMKem_462nGfGdmtQ_mzSeD4mHUlpty818PW-gwoGyVel3iwlIfHuSatId49NGayw2rJ8dC4yH7ebPqJ8KwUZDgxPSZ23uIEd4vLYgxQcvGkYEAG_O9MN2EQ',
    isFavorite: false,
    phone: '+55 51 94455-8899'
  },
  {
    id: 'c9',
    name: 'Juliana Prado',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFWKWBWCSi4MqdA57vKpfjcndaC8wnAaZqAUhgWBEj3IhAotoRM-Sa-m0UxjQ7-9uqcYwb3LJ1W7aURTT8tShRAVc3bQ3aqECKYU20jqsQxkApYvEs0fcSzG4-n-LjZcxfcFQxSrwIl55YalMLoCtSHED71dlA6DtJKrErc6kPphkLvHLHEQLexORiuUv7w9GZQfFjMdbWSWaxvW3rYfHreN1NK1w2uTvqqDwDa8p_-TNCV1jYfvsvCx5kqYqt5c5hN1DH6X_mWr0D',
    isFavorite: false,
    phone: '+55 61 96677-2211'
  },
  {
    id: 'c10',
    name: 'Bruno Almeida',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVszlZncxvjVAbz59MMfQPS1ujxF8aoL9GMmc0IuSnjtAD2xO891qhtPDhhparviKXCmVqkhWajBwGqZZI_7cUW4IlED4msssxAbK4p-SZ_C0gcrHNuujwKy9-GKUhS48ch8vcd_8R05hThAo6NxhQYIICC4jTlIyAsMGrctxRNQvPHsQT1MykOqmOfvhdP-f40iKzdnj1I3WYNAngdYoF3ygOTNaBqOwmz_2pn6jW_ydTbBcThhPOChQwY6TjtJOFYAlqESyrf-co',
    isFavorite: false,
    phone: '+55 81 93311-0044'
  },
  {
    id: 'c11',
    name: 'Camila Souza',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdHKwDwZ_kYjzBgKjsqtCrfJMoZXOgs_AA3xq5GW2yOMB2DVYfPQTL-rOTZ_x9YEsHR9wiXpE73EOyNJ76wcnYmYHGeF6O09Bji5OrbicDdyfvL6zOm1Hf54JfXGolti2h2OrZu2sR4emorvHUYSz2aMKem_462nGfGdmtQ_mzSeD4mHUlpty818PW-gwoGyVel3iwlIfHuSatId49NGayw2rJ8dC4yH7ebPqJ8KwUZDgxPSZ23uIEd4vLYgxQcvGkYEAG_O9MN2EQ',
    isFavorite: false,
    phone: '+55 91 97766-8899'
  },
  {
    id: 'c12',
    name: 'Pedro Henrique',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwAxGoxwMYcPm7RYv2bCYqXed2eYTuiQ6OBh944d5fFcyP2pFNBViN_BJsuHeabAnv3zS32HUS95A3Z0oP4BN1ASIotJgSr6rXPWj8-40mNTwH8tFOG76ubMpaRBphBZNYEn0a3V5voNWHXkyRJH8X9n8xhdSpt25tBL6aMf0HyYZCVnNnKJmg-WfCxZyOaOVh2mQgp1U4w3GviAPgpNGaYtgPWQ1W5jvZpnkf7y-Jo77ejqp_HSPSFzDkHRGP6wv9jJK4KKasS1v-',
    isFavorite: false,
    phone: '+55 71 98800-7766'
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'o1',
    customerId: 'c3',
    location: 'Mesa',
    table: '04',
    status: 'open',
    items: [{ productId: 'p1', quantity: 3, priceAtSale: 12 }],
    payments: [],
    createdAt: daysAgo(0)
  },
  {
    id: 'o2',
    customerId: 'c4',
    location: 'Mesa',
    table: '18',
    status: 'payment',
    items: [{ productId: 'p2', quantity: 2, priceAtSale: 28 }],
    payments: [{ id: 'py1', method: 'PIX', amount: 20, createdAt: daysAgo(0) }],
    createdAt: daysAgo(0)
  },
  {
    id: 'o3',
    customerId: 'c1',
    location: 'Mesa',
    table: '07',
    status: 'closed',
    items: [
      { productId: 'p1', quantity: 2, priceAtSale: 12 },
      { productId: 'p3', quantity: 1, priceAtSale: 22 }
    ],
    payments: [{ id: 'py3', method: 'Cartão', amount: 46, createdAt: daysAgo(1) }],
    createdAt: daysAgo(1)
  },
  {
    id: 'o4',
    customerId: 'c2',
    location: 'Balcão',
    table: '11',
    status: 'closed',
    isQuickSale: true,
    items: [
      { productId: 'p7', quantity: 1, priceAtSale: 18 },
      { productId: 'p9', quantity: 2, priceAtSale: 7 }
    ],
    payments: [
      { id: 'py4a', method: 'Dinheiro', amount: 10, createdAt: daysAgo(2) },
      { id: 'py4b', method: 'PIX', amount: 22, createdAt: daysAgo(2) }
    ],
    createdAt: daysAgo(2)
  },
  {
    id: 'o5',
    customerId: 'walkin',
    location: 'Balcão',
    table: '03',
    status: 'closed',
    isQuickSale: true,
    items: [
      { productId: 'p10', quantity: 2, priceAtSale: 4 },
      { productId: 'p13', quantity: 1, priceAtSale: 8 }
    ],
    payments: [{ id: 'py5', method: 'Dinheiro', amount: 16, createdAt: daysAgo(3) }],
    createdAt: daysAgo(3)
  },
  {
    id: 'o6',
    customerId: 'c6',
    location: 'Mesa',
    table: '15',
    status: 'closed',
    items: [
      { productId: 'p6', quantity: 3, priceAtSale: 14 },
      { productId: 'p11', quantity: 1, priceAtSale: 27 }
    ],
    payments: [{ id: 'py6', method: 'Cartão', amount: 69, createdAt: daysAgo(5) }],
    createdAt: daysAgo(5)
  },
  {
    id: 'o7',
    customerId: 'c7',
    location: 'Mesa',
    table: '22',
    status: 'closed',
    items: [
      { productId: 'p4', quantity: 2, priceAtSale: 32 },
      { productId: 'p12', quantity: 2, priceAtSale: 12 }
    ],
    payments: [
      { id: 'py7a', method: 'Cartão', amount: 40, createdAt: daysAgo(8) },
      { id: 'py7b', method: 'PIX', amount: 48, createdAt: daysAgo(8) }
    ],
    createdAt: daysAgo(8)
  },
  {
    id: 'o8',
    customerId: 'c8',
    location: 'Balcão',
    table: '09',
    status: 'closed',
    isQuickSale: true,
    items: [
      { productId: 'p14', quantity: 2, priceAtSale: 13 },
      { productId: 'p9', quantity: 1, priceAtSale: 7 }
    ],
    payments: [{ id: 'py8', method: 'PIX', amount: 33, createdAt: daysAgo(12) }],
    createdAt: daysAgo(12)
  },
  {
    id: 'o9',
    customerId: 'c9',
    location: 'Mesa',
    table: '02',
    status: 'closed',
    items: [
      { productId: 'p5', quantity: 4, priceAtSale: 10 },
      { productId: 'p3', quantity: 1, priceAtSale: 22 }
    ],
    payments: [{ id: 'py9', method: 'Dinheiro', amount: 62, createdAt: daysAgo(16) }],
    createdAt: daysAgo(16)
  },
  {
    id: 'o10',
    customerId: 'c10',
    location: 'Mesa',
    table: '19',
    status: 'closed',
    items: [
      { productId: 'p8', quantity: 3, priceAtSale: 22 },
      { productId: 'p11', quantity: 1, priceAtSale: 27 }
    ],
    payments: [{ id: 'py10', method: 'Cartão', amount: 93, createdAt: daysAgo(21) }],
    createdAt: daysAgo(21)
  },
  {
    id: 'o11',
    customerId: 'c11',
    location: 'Balcão',
    table: '26',
    status: 'closed',
    isQuickSale: true,
    items: [
      { productId: 'p1', quantity: 1, priceAtSale: 12 },
      { productId: 'p13', quantity: 2, priceAtSale: 8 }
    ],
    payments: [{ id: 'py11', method: 'PIX', amount: 28, createdAt: daysAgo(27) }],
    createdAt: daysAgo(27)
  },
  {
    id: 'o12',
    customerId: 'c12',
    location: 'Mesa',
    table: '30',
    status: 'closed',
    items: [
      { productId: 'p6', quantity: 2, priceAtSale: 14 },
      { productId: 'p4', quantity: 1, priceAtSale: 32 },
      { productId: 'p12', quantity: 3, priceAtSale: 12 }
    ],
    payments: [
      { id: 'py12a', method: 'Dinheiro', amount: 20, createdAt: daysAgo(34) },
      { id: 'py12b', method: 'Cartão', amount: 40, createdAt: daysAgo(34) },
      { id: 'py12c', method: 'PIX', amount: 36, createdAt: daysAgo(34) }
    ],
    createdAt: daysAgo(34)
  },
  {
    id: 'o13',
    customerId: 'c5',
    location: 'Mesa',
    table: '13',
    status: 'open',
    items: [
      { productId: 'p9', quantity: 2, priceAtSale: 7 },
      { productId: 'p12', quantity: 1, priceAtSale: 12 }
    ],
    payments: [],
    createdAt: daysAgo(0)
  }
];
