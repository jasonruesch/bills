import { faker } from '@faker-js/faker';

export interface Bill {
  id: string;
  name: string;
  createdAt: number;
}

export function makeBill(partial?: Partial<Bill>): Bill {
  return {
    id: partial?.id ?? generateBillId(),
    name: partial?.name ?? '',
    createdAt: partial?.createdAt ?? Date.now(),
  } satisfies Bill;
}

export function generateBillId(): string {
  return faker.string.uuid();
}
