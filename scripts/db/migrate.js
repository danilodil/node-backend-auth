/* eslint-disable no-console */
import path from 'path';
import { spawn } from 'child-process-promise';
import { parseURL } from 'whatwg-url';

const spawnOptions = { cwd: path.join(__dirname, '../..'), stdio: 'inherit' };
(async () => {
  const parts = parseURL('postgres://root@localhost:5432/local_auth');
  const url = `${parts.scheme}://${parts.username}:${parts.password}@${parts.host}:${parts.port || 5432}/${parts.path[0]}`;
  try {
    await spawn('./node_modules/.bin/sequelize', ['db:migrate', `--url=${url}`], spawnOptions);
    console.log('*************************');
    console.log('Migration successful');
  } catch (err) {
    console.log('*************************');
    console.log('Migration failed. Error:', err.message);
  }
  process.exit(0);
})();
