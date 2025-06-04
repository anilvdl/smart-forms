import { Pool } from 'pg';
import { dbConfig } from './config';
// import { json } from 'stream/consumers';

declare global {
  var pgPool: Pool | undefined;
}

let dbPool: Pool;

if (!global.pgPool) {
  global.pgPool = new Pool(dbConfig);
}

dbPool = global.pgPool;

// console.log("env ---> ", JSON.stringify(process.env));
// console.log("dbPool config ---> ", dbConfig);

export default dbPool;