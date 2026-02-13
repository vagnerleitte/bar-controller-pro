
import { Product, Customer, Order } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Heineken 330ml',
    sku: 'BEER-001',
    price: 12.00,
    category: 'Cervejas',
    subgroup: 'Long Neck',
    status: 'active',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsOfY2Pasu6u0EkfhJYOfCvfL6sjjl_cwLL6DfTVjmrpvNkqLFij_zu1M7t-8xSDkozZRQI43cKAjyd5OkzrE4b25cUONnt70_5Y44XRV5R3jaWGiaCSNHbrNvcZwK4ZT2qX7becSZRDuxzX-3nj3oW588oHQktgQ8YVDtbQHNUULq30nV9EuerM5ydRi1B8fWFY1O7VZJUL3Bylsaa27wfXao2kO9y4VfUHgBe9k8iWzDl1m5NoR5GkZdE3z_v01sbcSdB9LUa9qh'
  },
  {
    id: 'p2',
    name: 'Negroni Classic',
    sku: 'DRK-022',
    price: 28.00,
    category: 'Drinks',
    subgroup: 'Clássicos',
    status: 'active',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4uq6mBcYPCBngaSwH_Mhul2TnHjN4yyqf4o08IMLqsj9E_iZ4HSwcU2H8TwyENK6LRV_QhAAiSJZbWYjmi8gwOAwwN5Zu5z3aV8_cLqp6FicMEyN1OQ4ZqIke06N9yoaB60MlDHIC8geD23-2oCRqprCyN1IlMGQOI99_H2CTYf0ItMp7dLRFjWGmiEm16F65R0t94rLnuEPspCYUJsoTrsdkbSVcM2sHDEeEoaQE-Cn80JSyLMrSAFVY-NtcL1qyl2CYGTxKf7_9'
  },
  {
    id: 'p3',
    name: 'Batata Frita G',
    sku: 'PTK-009',
    price: 22.00,
    category: 'Petiscos',
    subgroup: 'Fritos',
    status: 'active',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4Jet_9jDTKhHlcdFXpPTZAcg7aFo0ROLhJyqmeZ35JOVs7Z6WZszzy9mkBKDB3JdBZHILrW53ALSQOI1yx9G-52owHxpjZfRPgrS72Y2rSRxHyJFrwK-crpBWXioFVxzHzzO797FKoiFYfDZiHQ7iiyEY-8kqWapZN70CQemDT-WkQ9_hm0pFFPeR97V-FmWTI2fZCCvq1WYHDXENbkJ5R3-xnPVr0ftruZB2lkeE5FMXPgzoh7csIXBr-b8CZ0ST-kiDb6AWFlz2'
  },
  {
    id: 'p4',
    name: 'Gin Tônica Premium',
    sku: 'DRK-044',
    price: 32.00,
    category: 'Drinks',
    subgroup: 'Gins',
    status: 'active',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB420D8-cvDpVbl5ygrnQBJyYEauSqLTn7r0SeMxGYYLkCxSq3Dq3dOCEV86h5D3aTQ8Wq_IQa4W5K3-S0CW_1yY3Dib2e67ZmGkJQYls5_p-cYT-Yn4PLxY62lHsGPnpp8D8D8Qj6dbP0YIxRQ2NZQvl1Xz5rKDDlcTwP20sTqGH_-pX3Rp_b-yl2_gqtut789WFrqXmzODzTy0n7C9HlbtUte85VUyrnK_kMTDWvd5Y2j_byM2CQF3V5cZFGFTAxBM1rRSjfYL7Fe'
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
    createdAt: new Date()
  },
  {
    id: 'o2',
    customerId: 'c4',
    location: 'Mesa',
    table: '18',
    status: 'payment',
    items: [{ productId: 'p2', quantity: 2, priceAtSale: 28 }],
    payments: [{ id: 'py1', method: 'PIX', amount: 20, createdAt: new Date() }],
    createdAt: new Date()
  }
];
