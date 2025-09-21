import { neon } from '@neondatabase/serverless';

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGSSLMODE, PGCHANNELBINDING} = process.env;

const sql = neon(
    `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=${PGSSLMODE}&channel_binding=${PGCHANNELBINDING}`
);

async function getFromTable(campo, tabla, comp1, comp2) {
    let where = '';
    if(comp1 != null && comp2 != null){
        where = `WHERE ${comp1} = '${comp2}'`;
    }
    const query = `SELECT ${campo} FROM ${tabla} ${where}`;
    const result = await sql.query(query);
    return result;
};
        
export default getFromTable;