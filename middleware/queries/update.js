import { neon } from '@neondatabase/serverless';

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGSSLMODE, PGCHANNELBINDING} = process.env;

const sql = neon(
    `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=${PGSSLMODE}&channel_binding=${PGCHANNELBINDING}`
);

async function updateTable(tabla, set, comp1, comp2) {
    const query = `UPDATE ${tabla} SET ${set} WHERE ${comp1} = '${comp2}'`;
    const result = await sql.query(query);
    return result;
};
        
export default updateTable;