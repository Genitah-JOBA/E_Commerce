import pool from "../config/db.js";

// --- CRÉATION DE COMMANDE (Avec infos de livraison) ---
export const createOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    const { 
      items, 
      name, 
      phone, 
      email, 
      address, 
      delivery_date, 
      delivery_time 
    } = req.body;

    const userId = req.user.id;

    await client.query("BEGIN");

    let total = 0;
    const itemsWithPrice = [];

    for (let item of items) {
      const product = await client.query("SELECT * FROM products WHERE id = $1", [item.product_id]);
      if (product.rows.length === 0) throw new Error(`Produit ${item.product_id} introuvable`);
      
      const p = product.rows[0];

      if (p.stock < item.quantity) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: `Stock insuffisant pour "${p.name}"` });
      }

      total += p.price * item.quantity;
      itemsWithPrice.push({ ...item, price: p.price });

      await client.query("UPDATE products SET stock = stock - $1 WHERE id = $2", [item.quantity, item.product_id]);
    }

    // --- MODIFICATION ICI : INSERTION DANS LES COLONNES INDIVIDUELLES ---
    const orderResult = await client.query(
      `INSERT INTO orders 
       (user_id, total, name, phone, email, address, delivery_date, delivery_time) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id`,
      [userId, total, name, phone, email, address, delivery_date, delivery_time] 
    );
    
    const orderId = orderResult.rows[0].id;

    for (let item of itemsWithPrice) {
      await client.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ message: "Commande créée avec succès", orderId });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erreur createOrder:", error.message);
    res.status(500).json({ error: "Erreur lors du traitement de la commande" });
  } finally {
    client.release();
  }
};

// --- DÉTAILS DES ARTICLES D'UNE COMMANDE ---
export const getOrderItems = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT products.name, order_items.quantity, order_items.price 
       FROM order_items 
       JOIN products ON order_items.product_id = products.id 
       WHERE order_items.order_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Aucun article trouvé" });
    }
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- MISE À JOUR DU STATUT (Admin) ---
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

// --- MES COMMANDES (Client) ---
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
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
    const orders = result.rows.reduce((acc, row) => {
      let order = acc.find(o => o.id === row.id);
      if (!order) {
        order = { id: row.id, total: row.total, status: row.status, created_at: row.created_at, items: [] };
        acc.push(order);
      }
      if (row.product_name) {
        order.items.push({ name: row.product_name, quantity: row.quantity, price: row.price });
      }
      return acc;
    }, []);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
