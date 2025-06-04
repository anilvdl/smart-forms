export async function runQuery(query: string, params: any[] = []) {
  try {
    const result = await import('../../index').then(mod => mod.default.query(query, params));
    return result.rows;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
}