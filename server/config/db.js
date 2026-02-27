import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "db.cewbdpdgfpnzuprcuezh.supabase.co",
  database: "postgres",
  password: "Genitah2026!",
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect()
  .then(() => console.log("🚀 Connecté à Supabase PostgreSQL"))
  .catch(err => console.error("❌ Erreur :", err.message));

export default pool;