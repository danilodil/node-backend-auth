/* eslint-disable no-console */
import { exec } from 'child-process-promise';
import { parseURL } from 'whatwg-url';

(async () => {
  const parts = parseURL('postgres://root@localhost:5432/local_auth');
  console.log('Schema import running');
  exec(`psql -U root -d ${parts.path[0]} -c "CREATE SCHEMA ${parts.path[0]}"`)
    .then(() => exec(`psql -U root -d ${parts.path[0]} -c "ALTER SCHEMA ${parts.path[0]} OWNER TO ${parts.username};"`))
    .then(() => exec(`psql -U root -d ${parts.path[0]} < ./migrations/schema/schema.sql`))
    .then(() => {
      console.log('*************************');
      console.log('Schema import successful');
      process.exit(0);
    })
    .catch((err) => {
      console.log('*************************');
      console.log('Schema import failed. Error:', err.message);
      process.exit(1);
    });
})();
