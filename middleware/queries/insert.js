import { neon } from '@neondatabase/serverless';

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGSSLMODE, PGCHANNELBINDING} = process.env;

const sql = neon(
    `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=${PGSSLMODE}&channel_binding=${PGCHANNELBINDING}`
);

async function intoTable(tabla, columns, values) {
    const query = `INSERT INTO ${tabla} (${columns}) VALUES (${values})`;
    const result = await sql.query(query);
    return result;
};
        
export default intoTable;