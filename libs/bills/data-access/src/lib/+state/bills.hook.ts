// *******************************************************************
// React HOOKS
// *******************************************************************

import { useEffect } from 'react';
import { useStoreWithEqualityFn } from 'zustand/traditional';

import { Bill } from './bills.model';
import { BillsViewModel } from './bills.state';
import { store, syncUrlWithStore } from './bills.store';
import { formatDate } from './bills.utils';

interface BillsEventHandlers {
  handleSort: (key: string) => void;
  handleAdd: () => boolean;
  handleEdit: (bill: Bill, e: React.MouseEvent<unknown>) => boolean;
  handleRemove: (bill: Bill, e: React.MouseEvent<unknown>) => boolean;
  handleSelect: (bill: Bill, e: React.MouseEvent<unknown>) => void;
  isSelected: (bill: Bill) => boolean;
}

/**
 * Hook to build and use Bills store
 */
// selector: (state: BillsViewModel) => Partial<BillsViewModel> = (state) => state,
export function useBills(syncUrl = false): BillsViewModel & BillsEventHandlers {
  const vm = useStoreWithEqualityFn(store());
  const {
    showSkeleton,
    searchQuery,
    selectedBillId,
    loadAll,
    add,
    edit,
    remove,
    select,
  } = vm;

  // Event handlers
  const handleSort = (key: string) => {
    loadAll(searchQuery, key);
  };

  const handleAdd = () => {
    const name = prompt('Enter a name for the bill');
    if (name) {
      add({ name });

      return true;
    }

    return false;
  };

  const handleEdit = (bill: Bill, e: React.MouseEvent<unknown>) => {
    e.stopPropagation();

    const name = prompt('Enter a new name for the bill', bill.name);
    if (name) {
      edit({ ...bill, name });

      return true;
    }

    return false;
  };

  const handleRemove = (bill: Bill, e: React.MouseEvent<unknown>) => {
    e.stopPropagation();

    // eslint-disable-next-line no-restricted-globals
    const confirmed = confirm('Are you sure you want to remove this bill?');
    if (confirmed) {
      remove(bill);

      return true;
    }

    return false;
  };

  const handleSelect = (bill: Bill, e: React.MouseEvent<unknown>) => {
    e.stopPropagation();

    select(bill);

    alert(`You selected the following bill:
${'' /* Intential blank line */}
ID: ${bill.id}
Name: ${bill.name}
Created: ${formatDate(bill.createdAt)}
    `);
  };
  const isSelected = (bill: Bill) => bill.id === selectedBillId;

  useEffect(() => {
    // Whenever the state changes, update the URL
    if (syncUrl) syncUrlWithStore();
  }, [vm]);

  useEffect(() => {
    if (showSkeleton) loadAll();
  }, [showSkeleton, loadAll]);

  return {
    ...vm,
    handleSort,
    handleAdd,
    handleEdit,
    handleRemove,
    handleSelect,
    isSelected,
  };
}

/**
 * Hook to load specific bill by ID
 */
export type BillByIdResults = [Bill | undefined, BillsViewModel];

export function useBillById(id: string): BillByIdResults {
  const vm = useBills();
  const bill = vm.allBills.find((it) => it.id === id);

  return [bill, vm];
}
