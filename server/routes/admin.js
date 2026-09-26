const express = require("express");
const bcrypt = require("bcryptjs");

const db = require("../config/db");
const {
  authenticateToken,
  requireOwner,
} = require("../middleware/auth");

const router = express.Router();

router.use(authenticateToken);
router.use(requireOwner);

router.get("/dashboard", async (req, res) => {
  try {
    const [[retailers]] = await db.query(`
      SELECT COUNT(*) AS total
      FROM retailers r
      INNER JOIN users u ON u.id = r.user_id
      WHERE u.is_active = TRUE
    `);

    const [[totalRetailers]] = await db.query(`
      SELECT COUNT(*) AS total
      FROM retailers
    `);

    const [recentRetailers] = await db.query(`
      SELECT
        r.id,
        r.business_name,
        u.name AS retailer_name,
        r.phone,
        u.is_active,
        u.created_at AS last_active
      FROM retailers r
      INNER JOIN users u ON u.id = r.user_id
      WHERE u.is_active = TRUE
      ORDER BY u.created_at DESC
      LIMIT 5
    `);

    const memory = process.memoryUsage();

    res.json({
      retailers: Number(totalRetailers.total),
      activeRetailers: Number(retailers.total),
      recentRetailers,
      memory: {
        rss: Number((memory.rss / 1024 / 1024).toFixed(2)),
        heapUsed: Number((memory.heapUsed / 1024 / 1024).toFixed(2)),
        heapTotal: Number((memory.heapTotal / 1024 / 1024).toFixed(2)),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
});

router.get("/system-info", async (req, res) => {
  try {
    const memory = process.memoryUsage();

    res.json({
      memory: {
        rss: Number((memory.rss / 1024 / 1024).toFixed(2)),
        heapUsed: Number((memory.heapUsed / 1024 / 1024).toFixed(2)),
        heapTotal: Number((memory.heapTotal / 1024 / 1024).toFixed(2)),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load system info" });
  }
});

router.put("/password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    const [users] = await db.execute(
      `SELECT password_hash FROM users WHERE id = ? LIMIT 1`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await db.execute(`UPDATE users SET password_hash = ? WHERE id = ?`, [
      passwordHash,
      req.user.id,
    ]);

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update password" });
  }
});

router.get("/retailers", async (req, res) => {
  try {
    const [retailers] = await db.query(`
      SELECT
        r.id,
        r.business_name,
        u.name AS retailer_name,
        r.phone,
        u.email,
        u.is_active,
        u.created_at
      FROM retailers r
      INNER JOIN users u ON u.id = r.user_id
      ORDER BY r.created_at DESC
    `);

    res.json(retailers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load retailers" });
  }
});

router.post("/retailers", async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { name, email, password, businessName, phone } = req.body;

    if (!name || !email || !password || !businessName) {
      return res.status(400).json({
        message: "Name, email, password and business name are required",
      });
    }

    const [existing] = await connection.execute(
      `SELECT id FROM users WHERE email = ? LIMIT 1`,
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }

    await connection.beginTransaction();

    const passwordHash = await bcrypt.hash(password, 10);

    const [userResult] = await connection.execute(
      `INSERT INTO users (name, email, password_hash, role, is_active)
       VALUES (?, ?, ?, 'RETAILER', 0)`,
      [name, email, passwordHash]
    );

    await connection.execute(
      `INSERT INTO retailers (user_id, business_name, phone) VALUES (?, ?, ?)`,
      [userResult.insertId, businessName, phone || null]
    );

    await connection.commit();

    res.status(201).json({ message: "Retailer created successfully" });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: "Failed to create retailer" });
  } finally {
    connection.release();
  }
});

router.get("/retailers/:id", async (req, res) => {
  try {
    const [retailers] = await db.execute(
      `
      SELECT
        r.id,
        r.business_name,
        r.phone,
        r.created_at,
        u.id AS user_id,
        u.name,
        u.email,
        u.is_active
      FROM retailers r
      INNER JOIN users u ON u.id = r.user_id
      WHERE r.id = ?
      LIMIT 1
      `,
      [req.params.id]
    );

    if (retailers.length === 0) {
      return res.status(404).json({ message: "Retailer not found" });
    }

    const retailer = retailers[0];

    const [farmers] = await db.execute(
      `
      SELECT id, name, phone, address, created_at
      FROM farmers
      WHERE retailer_id = ?
      ORDER BY created_at DESC
      `,
      [req.params.id]
    );

    const [[collectionSummary]] = await db.execute(
      `
      SELECT
        COUNT(*) AS collection_count,
        COALESCE(SUM(litres), 0) AS total_litres,
        COALESCE(SUM(total_amount), 0) AS total_amount
      FROM milk_collections
      WHERE retailer_id = ?
      `,
      [req.params.id]
    );

    res.json({
      retailer,
      farmers,
      summary: {
        collectionCount: Number(collectionSummary.collection_count),
        litres: Number(collectionSummary.total_litres),
        amount: Number(collectionSummary.total_amount),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load retailer" });
  }
});

router.put("/retailers/:id", async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { name, email, businessName, phone, password } = req.body;

    const [retailers] = await connection.execute(
      `SELECT user_id FROM retailers WHERE id = ? LIMIT 1`,
      [req.params.id]
    );

    if (retailers.length === 0) {
      return res.status(404).json({ message: "Retailer not found" });
    }

    const userId = retailers[0].user_id;

    await connection.beginTransaction();

    await connection.execute(
      `UPDATE users SET name = ?, email = ? WHERE id = ?`,
      [name, email, userId]
    );

    await connection.execute(
      `UPDATE retailers SET business_name = ?, phone = ? WHERE id = ?`,
      [businessName, phone || null, req.params.id]
    );

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      await connection.execute(
        `UPDATE users SET password_hash = ? WHERE id = ?`,
        [passwordHash, userId]
      );
    }

    await connection.commit();

    res.json({ message: "Retailer updated successfully" });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: "Failed to update retailer" });
  } finally {
    connection.release();
  }
});

router.patch("/retailers/:id/status", async (req, res) => {
  try {
    const { isActive } = req.body;

    const [result] = await db.execute(
      `
      UPDATE users u
      INNER JOIN retailers r ON r.user_id = u.id
      SET u.is_active = ?
      WHERE r.id = ?
      `,
      [isActive ? 1 : 0, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Retailer not found" });
    }

    res.json({
      message: isActive ? "Retailer activated" : "Retailer deactivated",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update retailer status" });
  }
});

router.get("/collections", async (req, res) => {
  try {
    const [collections] = await db.query(`
      SELECT
        mc.id,
        mc.collection_date,
        mc.litres,
        mc.price_per_litre,
        mc.total_amount,
        f.name AS farmer_name,
        r.business_name
      FROM milk_collections mc
      INNER JOIN farmers f ON f.id = mc.farmer_id
      INNER JOIN retailers r ON r.id = mc.retailer_id
      ORDER BY mc.collection_date DESC, mc.created_at DESC
    `);

    res.json(collections);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load collections" });
  }
});

router.get("/payments", async (req, res) => {
  try {
    const [payments] = await db.query(`
      SELECT
        p.id,
        p.amount,
        p.payment_method,
        p.payment_date,
        p.reference,
        f.name AS farmer_name,
        r.business_name
      FROM payments p
      INNER JOIN farmers f ON f.id = p.farmer_id
      INNER JOIN retailers r ON r.id = p.retailer_id
      ORDER BY p.payment_date DESC, p.created_at DESC
    `);

    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load payments" });
  }
});

module.exports = router;
