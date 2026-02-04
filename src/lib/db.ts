import "server-only";
import mysql from "mysql2/promise";

const host = process.env.MYSQL_HOST ?? process.env.HOST;
const port = process.env.MYSQL_PORT;
const user = process.env.MYSQL_USER;
const password = process.env.MYSQL_PASSWORD;
const database = process.env.MYSQL_DATABASE;

if (!host || !port || !user || !password || !database) {
  throw new Error("Missing MySQL environment variables");
}

const pool = mysql.createPool({
  host,
  port: Number(port),
  user,
  password,
  database,
  waitForConnections: true,
  connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT ?? "10"),
  namedPlaceholders: true,
});

export async function dbQuery<T = unknown>(
  sql: string,
  params?: Record<string, unknown> | unknown[],
) {
  const [rows] = await pool.execute(sql, params ?? []);
  return rows as T;
}

export async function dbHealthcheck() {
  const [rows] = await pool.query("SELECT 1 AS ok");
  return rows as Array<{ ok: number }>;
}
