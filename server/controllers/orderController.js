import pool from "../config/db.js";

export const createOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    const { items } = req.body;
    const userId = req.user.id;

    await client.query("BEGIN");

    let total = 0;
    const itemsWithPrice = [];

    // 1. On vérifie les stocks et on calcule le total d'abord
    for (let item of items) {
      const product = await client.query("SELECT * FROM products WHERE id = $1", [item.product_id]);

      if (product.rows.length === 0) throw new Error(`Produit ${item.product_id} introuvable`);
      
      const p = product.rows[0];
      if (p.stock < item.quantity) throw new Error(`Stock insuffisant pour ${p.name}`);

      const itemPrice = p.price;
      total += itemPrice * item.quantity;
      
      // On garde le prix en mémoire pour plus tard
      itemsWithPrice.push({ ...item, price: itemPrice });

      // Mise à jour du stock
      await client.query("UPDATE products SET stock = stock - $1 WHERE id = $2", [item.quantity, item.product_id]);
    }

    // 2. On crée LA commande (une seule fois)
    const orderResult = await client.query(
      "INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING *",
      [userId, total]
    );
    const orderId = orderResult.rows[0].id;

    // 3. On insère TOUS les articles dans order_items avec le prix
    for (let item of itemsWithPrice) {
      await client.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
        [orderId, item.product_id, item.quantity, item.price] // <-- Le prix est ajouté ici !
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ message: "Commande créée avec succès", order: orderResult.rows[0] });

  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

//AFFICHAGE
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    // On récupère les commandes AVEC les détails des produits en une seule requête
    const query = `
      SELECT 
        o.id, o.total, o.status, o.created_at,
        oi.quantity, oi.price as item_price,
        p.name as product_name
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = $1
      ORDER BY o.id DESC
    `;

    const result = await pool.query(query, [userId]);

    // On reformate pour grouper les items dans leurs commandes respectives
    const orders = result.rows.reduce((acc, row) => {
      let order = acc.find(o => o.id === row.id);
      if (!order) {
        order = {
          id: row.id,
          total: row.total,
          status: row.status,
          created_at: row.created_at,
          items: []
        };
        acc.push(order);
      }
      if (row.product_name) {
        order.items.push({
          name: row.product_name,
          quantity: row.quantity,
          price: row.item_price
        });
      }
      return acc;
    }, []);

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      "UPDATE orders SET status=$1 WHERE id=$2 RETURNING *",
      [status, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT 
        orders.id,
        users.name,
        users.email,
        orders.total,
        orders.status,
        orders.created_at
      FROM orders
      JOIN users ON orders.user_id = users.id
    `;

    const values = [];

    if (status) {
      query += " WHERE orders.status = $1";
      values.push(status);
    }

    query += " ORDER BY orders.id DESC";

    const result = await pool.query(query, values);
    res.json(result.rows);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add this at the end of orderController.js
export const getOrderItems = async (req, res) => {
  try {
    const { id } = req.params;

    // Join order_items with products to get names and prices
    const result = await pool.query(
      `SELECT products.name, order_items.quantity, order_items.price 
       FROM order_items 
       JOIN products ON order_items.product_id = products.id 
       WHERE order_items.order_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No items found for this order" });
    }

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
