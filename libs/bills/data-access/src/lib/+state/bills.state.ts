import { StoreState } from '@jasonruesch/bills-data-access';
import { Bill } from './bills.model';

// *******************************************************************
// Types and initializers
// *******************************************************************

/**
 * This state is serializable
 */
export interface BillsState extends StoreState {
  allBills: Bill[];
  searchQuery: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  selectedBillId?: string;
}

/**
 * Read-only values computed from existing/updated state
 */
export interface BillsComputedState {
  selectedBill?: Bill;
  errors: string[];
}

/**
 * This is a simple API meant for use within the
 * UI layer html templates
 */
export interface BillsAPI {
  // Bills RAVE (Remove, Add, View, Edit) - synonymous with CRUD
  loadAll: (
    query?: string,
    sortBy?: string,
    sortDirection?: 'asc' | 'desc',
  ) => Promise<Bill[]>; // View
  findById: (id: string) => Promise<Bill | null>; // View
  add: (partial: Omit<Bill, 'id' | 'createdAt'>) => Promise<Bill>; // Add
  edit: (bill: Bill, optimistic?: boolean) => Promise<Bill>; // Edit
  remove: (bill: Bill) => Promise<boolean>; // Remove
  select: (bill: Bill) => void;
}

export type BillsViewModel = BillsState & BillsComputedState & BillsAPI;
