import { neon } from '@neondatabase/serverless';

import { config } from "dotenv";

config();

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGSSLMODE, PGCHANNELBINDING} = process.env;

function connectionToDB() {
    const sql = neon(
    `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=${PGSSLMODE}&channel_binding=${PGCHANNELBINDING}`
);
    return sql;
};
        
export default connectionToDB;