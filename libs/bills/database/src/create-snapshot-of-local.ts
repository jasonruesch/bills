createSnapshotOfLocal();

async function createSnapshotOfLocal() {
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
    `PGPASSWORD=postgres pg_dump -h localhost -p 54322 -U postgres -a --inserts -f libs/bills/database/supabase/snapshots/${name}.sql -t public.bills`
  );
}
