// App configuration - all values configurable via environment variables
export const config = {
  BTC_ADDRESS: process.env.BTC_ADDRESS || '13zakr89PWX3ek6N5D2ZLRX25V3ghWxfwY',
  CASHTAG: process.env.CASHTAG || 'cute_girl',
  MIN_AMOUNT: parseInt(process.env.MIN_AMOUNT || '10'),
  MAX_AMOUNT: parseInt(process.env.MAX_AMOUNT || '2000'),
  QUICK_AMOUNTS: [10, 15, 20, 25],
  MORE_AMOUNTS: [50, 75, 100, 150, 200],
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
  SITE_NAME: process.env.SITE_NAME || 'CashPay',
};
