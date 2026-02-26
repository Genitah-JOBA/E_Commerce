import pool from "../config/db.js";

//AFFICHAGE
export const getProducts = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//AJOUT
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, stock } = req.body;

    const result = await pool.query(
      "INSERT INTO products (name, description, price, image, stock) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [name, description, price, image, stock]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//MODIFICATION
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, stock } = req.body;

    const result = await pool.query(
      "UPDATE products SET name=$1, description=$2, price=$3, image=$4, stock=$5 WHERE id=$6 RETURNING *",
      [name, description, price, image, stock, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//SUPPRESSION
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM products WHERE id=$1", [id]);

    res.json({ message: "Produit supprimé" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};