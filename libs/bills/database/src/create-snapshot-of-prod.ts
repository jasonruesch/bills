createSnapshotOfProd();

async function createSnapshotOfProd() {
  // eslint-disable-next-line
  const { execSync } = require('child_process');

  console.log('========== Create Snapshot ==========');

  const now = new Date();
  const inquirer = await import('inquirer').then((m) => m.default);
  const { name } =
    (await inquirer.prompt({
      message: 'enter a name for the snapshot',
      name: 'name',
    })) || now.toISOString();

  execSync(
    `PGPASSWORD=$BILLS_DB_POSTGRES_PASSWORD pg_dump -h $BILLS_DB_POSTGRES_HOST -p 5432 -U postgres -a --inserts -f libs/bills/database/supabase/snapshots/${name}.prod.sql -t public.bills`
  );
}
