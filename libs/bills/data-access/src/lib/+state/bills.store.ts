import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { StoreApi, createStore } from 'zustand/vanilla';

import {
  computeWith,
  getErrorMessages,
  initStoreState,
  trackStatusWith,
  upsert,
  waitFor,
} from '@jasonruesch/bills-data-access';
import {
  createBill,
  deleteBill,
  getBill,
  getBills,
  updateBill,
} from './bills.api';
import { Bill } from './bills.model';
import {
  BillsAPI,
  BillsComputedState,
  BillsState,
  BillsViewModel,
} from './bills.state';

// *******************************************************************
// initializers
// *******************************************************************

/**
 * These ACTIONS enable waitFor() to look up existing, async request (if any)
 */
const ACTIONS = {
  loadAll: () => 'bills:loadAll',
  findById: (id: string) => `bills:findById:${id}`,
  add: () => `bills:add`,
  edit: (id: string) => `bills:edit:${id}`,
  remove: (id: string) => `bills:remove:${id}`,
};

const initState = (): BillsState => ({
  ...initStoreState(),
  allBills: [],
  searchQuery: '',
  sortBy: 'name',
  sortDirection: 'asc',
});

// *******************************************************************
// BillsStore Factory
// *******************************************************************

/**
 * Create an instance of the Zustand store engine for Bills
 */
export function buildBillsStore(): StoreApi<BillsViewModel> {
  // Calculate our computed properties
  const buildComputedFn = (state: BillsState): BillsComputedState => {
    const selectedBill = state.allBills.find(
      (it) => it.id === state.selectedBillId,
    );
    const errors = getErrorMessages(state);

    return {
      selectedBill,
      errors,
    };
  };

  /**
   * Factory to create a Zustand Reactive BillsStore; which emits a BillsViewModel
   */
  const configureStore = (
    set: (
      state: Partial<BillsState> | ((state: BillsState) => Partial<BillsState>),
    ) => void,
    get: () => BillsState,
    store: StoreApi<BillsViewModel>,
  ): BillsViewModel => {
    set = computeWith(buildComputedFn, store);

    const trackStatus = trackStatusWith(set, get);

    const state: BillsState = initState();
    const computed: BillsComputedState = buildComputedFn(state);

    const api: BillsAPI = {
      loadAll: async (
        query?: string,
        sortBy = 'name',
        sortDirection?: 'asc' | 'desc',
      ): Promise<Bill[]> => {
        const { allBills } = await trackStatus(async () => {
          const sortKey = sortBy ?? get().sortBy;
          sortDirection =
            sortDirection ??
            (sortBy
              ? sortBy === get().sortBy && get().sortDirection === 'asc'
                ? 'desc'
                : 'asc'
              : get().sortDirection);
          const allBills = await getBills(query, sortKey, sortDirection);

          return {
            allBills,
            searchQuery: query || '',
            sortBy: sortKey,
            sortDirection,
          };
        }, ACTIONS.loadAll());

        return allBills;
      },
      findById: async (id: string): Promise<Bill | null> => {
        const bill = await waitFor<Bill | null>(
          () => getBill(id),
          ACTIONS.findById(id),
        );

        return bill;
      },
      add: async (partial: Omit<Bill, 'id' | 'createdAt'>): Promise<Bill> => {
        let created = partial as Bill;

        await trackStatus(async () => {
          created = await createBill(partial);
          // const allBills = await get().allBills;
          const { searchQuery, sortBy, sortDirection } = get();
          const allBills = await api.loadAll(
            searchQuery,
            sortBy,
            sortDirection,
          ); // reload all bills with existing search query and sorting

          return {
            // allBills: upsert(created, allBills),
            allBills,
            searchQuery: '',
            selectedBillId: created.id,
          };
        }, ACTIONS.add());

        return created;
      },
      edit: async (bill: Bill, optimistic = false): Promise<Bill> => {
        let updated = bill;

        await trackStatus(async () => {
          if (optimistic) {
            set((state: BillsState) => ({
              allBills: upsert(bill, state.allBills),
            }));
          }

          updated = await updateBill(bill);
          // const allBills = await get().allBills;
          const { searchQuery, sortBy, sortDirection } = get();
          const allBills = await api.loadAll(
            searchQuery,
            sortBy,
            sortDirection,
          ); // reload all bills with existing search query and sorting

          return {
            // allBills: upsert(updated, allBills),
            allBills,
            searchQuery: '',
            selectedBillId: updated.id,
          };
        }, ACTIONS.edit(bill.id));

        return updated;
      },
      remove: async (bill: Bill): Promise<boolean> => {
        let deleted = false;

        await trackStatus(async () => {
          deleted = await deleteBill(bill.id);
          // const allBills = await get().allBills;
          const { searchQuery, sortBy, sortDirection } = get();
          const allBills = await api.loadAll(
            searchQuery,
            sortBy,
            sortDirection,
          ); // reload all bills with existing search query and sorting

          return {
            // allBills: deleted
            //   ? allBills.filter((it) => it.id !== bill.id)
            //   : allBills,
            allBills,
            selectedBillId: '',
          };
        }, ACTIONS.remove(bill.id));

        return deleted;
      },
      select: (bill: Bill) => {
        set({ selectedBillId: bill.id });
      },
    };

    // Initial Store view model
    return {
      ...state,
      ...computed,
      ...api,
    };
  };

  /**
   * Enable the ReactiveStore for Redux DevTools, and persistence to localStorage,
   * and ensure the ViewModel is immutable using Immer
   */
  const store = createStore<BillsViewModel>()(
    // prettier-ignore
    devtools(
      immer(
        configureStore
      ), 
      { name: 'store:bills' }
    ),
  );

  return store;
}

// *******************************************************************
// Singleton instance of the Zustand store engine for Bills
// *******************************************************************

let _store: StoreApi<BillsViewModel>;

export const store = () => {
  if (!_store) {
    _store = buildBillsStore();
    // On app startup, determine if we have search params in the URL
    syncStoreWithUrl(_store);
  }

  return _store;
};

export const api = (): BillsAPI => {
  return store().getState();
};

// *******************************************************************
// Bookmark URL Synchronizer
// *******************************************************************

export interface BillsUrlParams {
  q?: string;
  sort?: string;
  direction?: 'asc' | 'desc';
  id?: string;
  forceSkeleton?: boolean;
}

export const syncUrlWithStore = (state?: BillsViewModel) => {
  const defaultState: BillsState = initState();

  state = state ?? store().getState();
  const { searchQuery, sortBy, sortDirection, selectedBillId } = state;
  const { pathname } = window.location;
  const searchParams = new URLSearchParams({
    ...(searchQuery ? { q: searchQuery } : {}),
    ...(sortBy && sortBy !== defaultState.sortBy ? { sort: sortBy } : {}),
    ...(sortDirection && sortDirection !== defaultState.sortDirection
      ? { direction: sortDirection }
      : {}),
    // Only include the selectedBillId if it is not already in the URL as a path param
    ...(selectedBillId && !pathname.includes(`/${selectedBillId}`)
      ? { id: selectedBillId }
      : {}),
  });

  const url = `${pathname}${searchParams.toString() ? `?${searchParams}` : ''}`;

  if (window.location.href !== url) {
    window.history.replaceState({}, '', url);
  }
};

const syncStoreWithUrl = async (_store: StoreApi<BillsViewModel>) => {
  const { search } = window.location;
  const searchParams = new URLSearchParams(search);
  const searchQuery = searchParams.get('q') ?? undefined;
  const sortBy = searchParams.get('sort') ?? undefined;
  const sortDirection = searchParams.get('direction') ?? undefined;
  const selectedBillId = searchParams.get('id') ?? undefined;
  const forceSkeleton = searchParams.get('forceSkeleton') ?? false;

  const { getState: get, setState: set } = _store;
  set({ selectedBillId, forceSkeleton: Boolean(forceSkeleton) });

  if (searchQuery || sortBy || sortDirection) {
    get().loadAll(
      searchQuery,
      sortBy,
      sortDirection as 'asc' | 'desc' | undefined,
    );
  }
};
