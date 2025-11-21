import sql from "mssql";
import dotenv from "dotenv";
dotenv.config();

console.log(process.env.DB_USER)
console.log(process.env.DB_SERVER)
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  //port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

export async function getConnection() {
  try {
    const pool = await sql.connect(dbConfig);
    return pool;
  } catch (err) {
    console.error("❌ Error de conexión SQL:", err);
    throw err;
  }
}

export { sql };
