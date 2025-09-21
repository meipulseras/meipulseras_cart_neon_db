import { neon } from '@neondatabase/serverless';

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGSSLMODE, PGCHANNELBINDING} = process.env;

const sql = neon(
    `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=${PGSSLMODE}&channel_binding=${PGCHANNELBINDING}`
);

async function getProducts() {
    const result = await sql`SELECT * FROM products`;
    console.log(result);
};
        
export default getProducts;