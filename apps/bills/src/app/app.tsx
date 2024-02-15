import { formatDate, useBills } from '@jasonruesch/bills-data-access-bills';

export function App() {
  const { allBills, showSkeleton } = useBills(true);

  return (
    <div className="min-h-dvh grid place-content-center text-center">
      <h1 className="text-4xl font-bold">Bills</h1>

      <div className="ring-8 ring-test p-8 my-8 bg-test/5">
        <p className="text-xl font-semibold text-test">Test</p>
      </div>

      {showSkeleton ? (
        <div>Loading...</div>
      ) : allBills.length === 0 ? (
        <div>No bills found</div>
      ) : (
        <div className="gap-2 grid grid-cols-12">
          {allBills.map((bill) => (
            <div
              key={bill.id}
              className="p-4 border border-test/70 rounded-md col-span-4"
            >
              <p className="font-semibold">{bill.name}</p>
              <p>{formatDate(bill.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
