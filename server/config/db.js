import pkg from "pg";
const { Pool } = pkg;
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000, // Attendre 10s max pour la connexion
  idleTimeoutMillis: 30000,      // Fermer les connexions inactives après 30s
});

// Utilisation d'une fonction asynchrone pour tester la connexion sans bloquer
const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Connecté à Supabase (PostgreSQL)");
    client.release(); // Libère le client immédiatement
  } catch (err) {
    console.error("❌ Erreur de connexion à Supabase :", err.message);
  }
};

connectDB();

export default pool;
