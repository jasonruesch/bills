import { faker } from '@faker-js/faker';
import { Bill } from '../lib/+state';

// Generate 10 bills using faker
const bills: Bill[] = Array.from({ length: 10 }, () => ({
  id: faker.string.uuid(),
  name: faker.company.name(),
  createdAt: faker.date.past().getTime(),
}));

export default bills;
