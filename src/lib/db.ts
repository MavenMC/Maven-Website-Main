import "server-only";
import mysql from "mysql2/promise";

const host = process.env.MYSQL_HOST ?? process.env.HOST;
const port = process.env.MYSQL_PORT;
const user = process.env.MYSQL_USER;
const password = process.env.MYSQL_PASSWORD;
const database = process.env.MYSQL_DATABASE;
const connectionLimit = Number(process.env.MYSQL_CONNECTION_LIMIT ?? "10");
const missingDbEnvVars = [
  !host ? "MYSQL_HOST" : null,
  !port ? "MYSQL_PORT" : null,
  !user ? "MYSQL_USER" : null,
  !password ? "MYSQL_PASSWORD" : null,
  !database ? "MYSQL_DATABASE" : null,
].filter((value): value is string => Boolean(value));

let pool: mysql.Pool | null = null;

export function isDbConfigured() {
  return missingDbEnvVars.length === 0;
}

export function getMissingDbEnvVars() {
  return [...missingDbEnvVars];
}

function getPool() {
  if (pool) return pool;

  if (!isDbConfigured()) {
    throw new Error(`Missing MySQL environment variables: ${missingDbEnvVars.join(", ")}`);
  }

  pool = mysql.createPool({
    host,
    port: Number(port),
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit,
    namedPlaceholders: true,
  });

  return pool;
}

export async function dbQuery<T = unknown>(
  sql: string,
  params?: Record<string, unknown> | unknown[],
) {
  const [rows] = await getPool().execute(sql, params ?? []);
  return rows as T;
}

export async function dbHealthcheck() {
  const [rows] = await getPool().query("SELECT 1 AS ok");
  return rows as Array<{ ok: number }>;
}
