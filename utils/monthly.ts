import { MonthlyAccount } from '../types';

const DAY_MS = 24 * 60 * 60 * 1000;

export function getMonthlyBalance(account: MonthlyAccount): number {
  const totalItems = account.items.reduce((acc, i) => acc + i.priceAtSale * i.quantity, 0);
  const totalPayments = account.payments.reduce((acc, p) => acc + p.amount, 0);
  return Number((totalItems - totalPayments).toFixed(2));
}

export function getDaysSinceCycleStart(account: MonthlyAccount): number {
  const start = new Date(account.cycleStart).getTime();
  return Math.floor((Date.now() - start) / DAY_MS);
}

export function isMonthlyOverdue(account: MonthlyAccount): boolean {
  return getDaysSinceCycleStart(account) > 28;
}

export function isMonthlyBlocked(account: MonthlyAccount): boolean {
  const balance = getMonthlyBalance(account);
  if (balance <= 0) return false;
  return isMonthlyOverdue(account) && !account.overdueUnlocked;
}

export function getMonthlyAvailableLimit(account: MonthlyAccount): number {
  const balance = getMonthlyBalance(account);
  const baseAvailable = Math.max(0, account.limit - balance);
  if (balance <= 0) return account.limit;
  return Number((baseAvailable * 0.9).toFixed(2));
}
