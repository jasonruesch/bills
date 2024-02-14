import localforage from 'localforage';
import { matchSorter } from 'match-sorter';
import sortBy from 'sort-by';
import bills from '../../data/bills';
import { Bill, makeBill } from './bills.model';

/**
 * Publish async API methods for CRUD (Create, Read, Update, Delete) operations
 * Note: use localforage offline storage for all stored bills
 */

const allBills = async (): Promise<Bill[]> => {
  let storedBills = await localforage.getItem<Bill[]>('bills');
  if (!storedBills) {
    storedBills = await set(bills);
  }

  return storedBills;
};

// Read
export async function getBills(
  query = '',
  sortKey = 'name',
  sortDirection = 'asc',
): Promise<Bill[]> {
  // await fakeNetwork(`getBills:${query}`);
  await fakeNetwork(`getBills:${query}`);

  let bills = await allBills();
  if (query) {
    bills = matchSorter(bills, query, { keys: ['name'] });
  }

  return bills.sort(
    sortBy(sortDirection === 'asc' ? `${sortKey}` : `-${sortKey}`),
  );
}

// Read
export async function getBill(id: string): Promise<Bill | null> {
  await fakeNetwork(`bill:${id}`);

  const bills = await allBills();
  const bill = bills.find((bill) => bill.id === id);

  return bill ?? null;
}

// Create
export async function createBill(
  partial: Omit<Bill, 'id' | 'createdAt'>,
): Promise<Bill> {
  await fakeNetwork();

  const bills = await allBills();
  const newBill = makeBill(partial);
  await set([newBill, ...bills]);

  return newBill;
}

// Update
export async function updateBill(updated: Bill): Promise<Bill> {
  await fakeNetwork();

  const bills = await allBills();
  const existing = bills.find((bill) => bill.id === updated.id);
  if (!existing) throw new Error(`No bill found for ${updated.id}`);

  updated = { ...existing, ...updated };
  await set(bills.map((it) => (it.id === updated.id ? updated : it)));

  return updated;
}

// Delete
export async function deleteBill(id: string): Promise<boolean> {
  await fakeNetwork();

  const bills = await allBills();
  const index = bills.findIndex((bill) => bill.id === id);
  if (index > -1) {
    bills.splice(index, 1);
    await set(bills);

    return true;
  }

  return false;
}

function set(bills: Bill[]) {
  return localforage.setItem('bills', bills);
}

// Fake a cache so we don't slow down stuff we've already seen
let fakeCache: Record<string, Promise<boolean>> = {};

async function fakeNetwork(key = '') {
  if (!key) fakeCache = {};

  if (!fakeCache[key]) {
    fakeCache[key] = new Promise((resolve) => {
      const timeout = Math.random() * 800;

      console.debug('fakeNetwork', { key, timeout });

      setTimeout(resolve, timeout);
    });
  }

  return fakeCache[key];
}
