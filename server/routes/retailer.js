const express = require("express");
const bcrypt = require("bcryptjs");

const db = require("../config/db");
const {
  authenticateToken,
  requireRetailer,
} = require("../middleware/auth");

const router = express.Router();

async function getRetailerIdFromUser(userId) {
  const [retailers] = await db.execute(
    `SELECT id FROM retailers WHERE user_id = ? LIMIT 1`,
    [userId]
  );

  if (retailers.length === 0) {
    return null;
  }

  return retailers[0].id;
}

router.use(authenticateToken);
router.use(requireRetailer);

router.get("/dashboard", async (req, res) => {
  try {
    const retailerId = await getRetailerIdFromUser(req.user.id);

    if (!retailerId) {
      return res.status(404).json({ message: "Retailer profile not found" });
    }

    const [farmersRows] = await db.execute(
      `SELECT COUNT(*) AS total FROM farmers WHERE retailer_id = ?`,
      [retailerId]
    );
    const farmersTotal = Number(farmersRows[0]?.total || 0);

    const [todayRows] = await db.execute(
      `SELECT COALESCE(SUM(litres), 0) AS litres,
              COALESCE(SUM(total_amount), 0) AS amount
       FROM milk_collections
       WHERE retailer_id = ? AND collection_date = CURDATE()`,
      [retailerId]
    );
    const today = {
      litres: Number(todayRows[0]?.litres || 0),
      amount: Number(todayRows[0]?.amount || 0),
    };

    const [weekRows] = await db.execute(
      `SELECT COALESCE(SUM(litres), 0) AS litres,
              COALESCE(SUM(total_amount), 0) AS amount
       FROM milk_collections
       WHERE retailer_id = ? AND YEARWEEK(collection_date, 1) = YEARWEEK(CURDATE(), 1)`,
      [retailerId]
    );
    const week = {
      litres: Number(weekRows[0]?.litres || 0),
      amount: Number(weekRows[0]?.amount || 0),
    };

    const [awaitingRows] = await db.execute(
      `SELECT COUNT(*) AS total
       FROM farmers f
       WHERE f.retailer_id = ?
         AND (
           SELECT COALESCE(SUM(mc.total_amount), 0)
           FROM milk_collections mc
           WHERE mc.farmer_id = f.id
             AND mc.retailer_id = ?
             AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
         ) > COALESCE(
           (
             SELECT SUM(p.amount)
             FROM payments p
             WHERE p.farmer_id = f.id AND p.retailer_id = ?
           ),
           0
         )`,
      [retailerId, retailerId, retailerId]
    );

    const [recentCollections] = await db.execute(
      `SELECT mc.id,
              mc.collection_date,
              mc.litres,
              mc.price_per_litre,
              mc.total_amount,
              f.name AS farmer_name
       FROM milk_collections mc
       INNER JOIN farmers f ON f.id = mc.farmer_id
       WHERE mc.retailer_id = ?
       ORDER BY mc.collection_date DESC, mc.created_at DESC
       LIMIT 10`,
      [retailerId]
    );

    res.json({
      farmers: farmersTotal,
      today,
      week,
      awaitingPayments: Number(awaitingRows[0]?.total || 0),
      recentCollections,
    });
  } catch (error) {
    console.error("RETAILER DASHBOARD ERROR:", error);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
});

router.get("/profile", async (req, res) => {
  try {
    const retailerId = await getRetailerIdFromUser(req.user.id);

    if (!retailerId) {
      return res.status(404).json({ message: "Retailer profile not found" });
    }

    const [retailerRows] = await db.execute(
      `SELECT r.id, r.business_name, r.phone, u.name, u.email, u.is_active
       FROM retailers r
       INNER JOIN users u ON u.id = r.user_id
       WHERE r.id = ?
       LIMIT 1`,
      [retailerId]
    );

    if (retailerRows.length === 0) {
      return res.status(404).json({ message: "Retailer profile not found" });
    }

    res.json(retailerRows[0]);
  } catch (error) {
    console.error("FETCH RETAILER PROFILE ERROR:", error);
    res.status(500).json({ message: "Failed to load retailer profile" });
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

    const isMatch = await bcrypt.compare(currentPassword, users[0].password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await db.execute(`UPDATE users SET password_hash = ? WHERE id = ?`, [
      passwordHash,
      req.user.id,
    ]);

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("RETAILER CHANGE PASSWORD ERROR:", error);
    res.status(500).json({ message: "Failed to update password" });
  }
});

router.get("/reports", async (req, res) => {
  try {
    const retailerId = await getRetailerIdFromUser(req.user.id);

    if (!retailerId) {
      return res.status(404).json({ message: "Retailer profile not found" });
    }

    const [profileRows] = await db.execute(
      `SELECT r.business_name, r.phone, u.name AS retailer_name, u.email
       FROM retailers r
       INNER JOIN users u ON u.id = r.user_id
       WHERE r.id = ?
       LIMIT 1`,
      [retailerId]
    );

    const [farmers] = await db.execute(
      `SELECT id, name, phone, address, created_at
       FROM farmers
       WHERE retailer_id = ?
       ORDER BY created_at DESC`,
      [retailerId]
    );

    const report = await Promise.all(
      farmers.map(async (farmer) => {
        const [records] = await db.execute(
          `SELECT mc.id,
                  mc.collection_date,
                  mc.litres,
                  mc.price_per_litre,
                  mc.total_amount,
                  DATE_FORMAT(mc.collection_date, '%Y-%m-%d') AS day_label
           FROM milk_collections mc
           WHERE mc.farmer_id = ? AND mc.retailer_id = ?
           ORDER BY mc.collection_date ASC`,
          [farmer.id, retailerId]
        );

        const weekTotal = records.reduce((sum, item) => sum + Number(item.total_amount || 0), 0);
        const weekLitres = records.reduce((sum, item) => sum + Number(item.litres || 0), 0);

        return {
          ...farmer,
          records,
          weekTotal,
          weekLitres,
          recordCount: records.length,
        };
      })
    );

    res.json({
      retailer: profileRows[0] || null,
      farmers: report,
    });
  } catch (error) {
    console.error("FETCH RETAILER REPORTS ERROR:", error);
    res.status(500).json({ message: "Failed to load reports" });
  }
});

router.get("/farmers", async (req, res) => {
  try {
    const retailerId = await getRetailerIdFromUser(req.user.id);

    if (!retailerId) {
      return res.status(404).json({ message: "Retailer profile not found" });
    }

    const [farmers] = await db.execute(
      `SELECT id, name, phone, address, created_at
       FROM farmers
       WHERE retailer_id = ?
       ORDER BY created_at DESC`,
      [retailerId]
    );

    res.json(farmers);
  } catch (error) {
    console.error("FETCH RETAILER FARMERS ERROR:", error);
    res.status(500).json({ message: "Failed to load farmers" });
  }
});

router.post("/farmers", async (req, res) => {
  try {
    const retailerId = await getRetailerIdFromUser(req.user.id);

    if (!retailerId) {
      return res.status(404).json({ message: "Retailer profile not found" });
    }

    const { name, phone, address } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Farmer name is required" });
    }

    const [result] = await db.execute(
      `INSERT INTO farmers (retailer_id, name, phone, address)
       VALUES (?, ?, ?, ?)`,
      [retailerId, name.trim(), phone || null, address || null]
    );

    res.status(201).json({
      message: "Farmer registered successfully",
      farmer: {
        id: result.insertId,
        name: name.trim(),
        phone: phone || null,
        address: address || null,
      },
    });
  } catch (error) {
    console.error("CREATE FARMER ERROR:", error);
    res.status(500).json({ message: "Failed to register farmer" });
  }
});

router.get("/collections", async (req, res) => {
  try {
    const retailerId = await getRetailerIdFromUser(req.user.id);

    if (!retailerId) {
      return res.status(404).json({ message: "Retailer profile not found" });
    }

    const [collections] = await db.execute(
      `SELECT mc.id,
              mc.collection_date,
              mc.litres,
              mc.price_per_litre,
              mc.total_amount,
              f.name AS farmer_name
       FROM milk_collections mc
       INNER JOIN farmers f ON f.id = mc.farmer_id
       WHERE mc.retailer_id = ?
       ORDER BY mc.collection_date DESC, mc.created_at DESC`,
      [retailerId]
    );

    res.json(collections);
  } catch (error) {
    console.error("FETCH RETAILER COLLECTIONS ERROR:", error);
    res.status(500).json({ message: "Failed to load collections" });
  }
});

router.post("/collections", async (req, res) => {
  try {
    const retailerId = await getRetailerIdFromUser(req.user.id);

    if (!retailerId) {
      return res.status(404).json({ message: "Retailer profile not found" });
    }

    const { farmerId, litres, pricePerLitre, collectionDate } = req.body;

    if (!farmerId || !litres || !pricePerLitre) {
      return res.status(400).json({
        message: "Farmer, litres and price per litre are required",
      });
    }

    const [farmerRows] = await db.execute(
      `SELECT id FROM farmers WHERE id = ? AND retailer_id = ? LIMIT 1`,
      [farmerId, retailerId]
    );

    if (farmerRows.length === 0) {
      return res.status(404).json({ message: "Farmer not found for this retailer" });
    }

    const numericLitres = Number(litres);
    const numericRate = Number(pricePerLitre);

    if (numericLitres <= 0 || numericRate <= 0) {
      return res.status(400).json({ message: "Litres and price per litre must be positive" });
    }

    const totalAmount = numericLitres * numericRate;
    const entryDate = collectionDate || new Date().toISOString().slice(0, 10);

    const [result] = await db.execute(
      `INSERT INTO milk_collections (retailer_id, farmer_id, collection_date, litres, price_per_litre, total_amount)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [retailerId, farmerId, entryDate, numericLitres, numericRate, totalAmount]
    );

    res.status(201).json({
      message: "Milk collection recorded successfully",
      collection: {
        id: result.insertId,
        retailer_id: retailerId,
        farmer_id: farmerId,
        collection_date: entryDate,
        litres: numericLitres,
        price_per_litre: numericRate,
        total_amount: totalAmount,
      },
    });
  } catch (error) {
    console.error("CREATE COLLECTION ERROR:", error);
    res.status(500).json({ message: "Failed to record milk collection" });
  }
});

router.get("/payments", async (req, res) => {
  try {
    const retailerId = await getRetailerIdFromUser(req.user.id);

    if (!retailerId) {
      return res.status(404).json({ message: "Retailer profile not found" });
    }

    const [rows] = await db.execute(
      `SELECT
         f.id AS farmer_id,
         f.name AS farmer_name,
         MIN(mc.collection_date) AS first_collection_date,
         MAX(mc.collection_date) AS last_collection_date,
         COALESCE(SUM(mc.total_amount), 0) AS total_collection_amount,
         COALESCE((
           SELECT SUM(p.amount)
           FROM payments p
           WHERE p.farmer_id = f.id AND p.retailer_id = ?
         ), 0) AS total_paid,
         COALESCE(SUM(mc.total_amount), 0) - COALESCE((
           SELECT SUM(p.amount)
           FROM payments p
           WHERE p.farmer_id = f.id AND p.retailer_id = ?
         ), 0) AS outstanding_amount,
         GREATEST(
           0,
           7 - DATEDIFF(CURDATE(), MIN(mc.collection_date))
         ) AS days_remaining
       FROM farmers f
       LEFT JOIN milk_collections mc
         ON mc.farmer_id = f.id AND mc.retailer_id = ?
       WHERE f.retailer_id = ?
       GROUP BY f.id, f.name
       HAVING COALESCE(SUM(mc.total_amount), 0) > 0
       ORDER BY MIN(mc.collection_date) ASC, f.name ASC`,
      [retailerId, retailerId, retailerId, retailerId]
    );

    const payments = rows.map((row) => ({
      farmer_id: row.farmer_id,
      farmer_name: row.farmer_name,
      first_collection_date: row.first_collection_date,
      last_collection_date: row.last_collection_date,
      total_collection_amount: Number(row.total_collection_amount || 0),
      total_paid: Number(row.total_paid || 0),
      outstanding_amount: Number(row.outstanding_amount || 0),
      days_remaining: Number(row.days_remaining || 0),
    }));

    res.json(payments);
  } catch (error) {
    console.error("FETCH RETAILER PAYMENTS ERROR:", error);
    res.status(500).json({ message: "Failed to load payments" });
  }
});

module.exports = router;
