import 'dotenv/config';
import { connectDb } from './config/db.js';
import { clearDemoData } from './seed.js';

connectDb()
  .then(clearDemoData)
  .then(() => {
    console.log('Demo data cleared. Users (including head admin) were kept.');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
