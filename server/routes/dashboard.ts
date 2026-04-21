import express from "express";
import { getPool } from "../config/db";

const router = express.Router();

// Stats for dashboard cards
router.get("/stats", async (req, res) => {
  try {
    const db = await getPool();
    const customers = await db.request().query("SELECT COUNT(*) as total FROM tbCustomers");

    // Get new customers this month using fdLoad
    let customerDelta = 0;
    try {
      const deltaResult = await db.request().query(`
        SELECT COUNT(*) as new_count 
        FROM tbCustomers 
        WHERE fdLoad >= DATEADD(month, DATEDIFF(month, 0, GETDATE()), 0)
      `);
      customerDelta = deltaResult.recordset[0].new_count;
    } catch (e) {
      console.log("Error fetching customer delta:", e);
    }

    // Total surat jalan
    let suratJalanCount = 0;
    let suratJalanGrowth = 0;

    try {
      const result = await db.request().query(`
        SELECT COUNT(*) as total 
        FROM tbDelivery  WHERE fdPrintDate >= DATEADD(month, DATEDIFF(month, 0, GETDATE()), 0)
      `);

      suratJalanCount = result.recordset[0].total;

      const growth = await db.request().query(`
        WITH data AS (
          SELECT 
            SUM(CASE 
              WHEN fdPrintDate >= DATEADD(month, DATEDIFF(month, 0, GETDATE()), 0)
              THEN 1 ELSE 0 END) AS bulan_ini,

            SUM(CASE 
              WHEN fdPrintDate >= DATEADD(month, DATEDIFF(month, 0, GETDATE()) - 1, 0)
               AND fdPrintDate < DATEADD(month, DATEDIFF(month, 0, GETDATE()), 0)
              THEN 1 ELSE 0 END) AS bulan_lalu
          FROM tbDelivery
        )
        SELECT 
          CASE 
            WHEN bulan_lalu = 0 THEN 0
            ELSE ((bulan_ini - bulan_lalu) * 100.0 / bulan_lalu)
          END AS growth
        FROM data
      `);

      suratJalanGrowth = growth.recordset[0].growth || 0;
    } catch (e) { }

    // Total invoice
    let invoiceCount = 0;
    let invoiceGrowth = 0;

    try {
      const result = await db.request().query(`
        SELECT COUNT(*) as total 
        FROM tbBilling  WHERE fdGiveDate >= DATEADD(month, DATEDIFF(month, 0, GETDATE()), 0)
      `);

      invoiceCount = result.recordset[0].total;

      const growth = await db.request().query(`
        WITH data AS (
          SELECT 
            SUM(CASE 
              WHEN fdGiveDate >= DATEADD(month, DATEDIFF(month, 0, GETDATE()), 0)
              THEN 1 ELSE 0 END) AS bulan_ini,

            SUM(CASE 
              WHEN fdGiveDate >= DATEADD(month, DATEDIFF(month, 0, GETDATE()) - 1, 0)
               AND fdGiveDate < DATEADD(month, DATEDIFF(month, 0, GETDATE()), 0)
              THEN 1 ELSE 0 END) AS bulan_lalu
          FROM tbBilling
        )
        SELECT 
          CASE 
            WHEN bulan_lalu = 0 THEN 0
            ELSE ((bulan_ini - bulan_lalu) * 100.0 / bulan_lalu)
          END AS growth
        FROM data
      `);

      invoiceGrowth = growth.recordset[0].growth || 0;
    } catch (e) { }

    // Revenue (bulan ini vs bulan lalu)
    let revenue = 0;
    let revenueGrowth = 0;

    try {
      const rev = await db.request().query(`
        WITH data AS (
          SELECT 
            SUM(CASE 
              WHEN fdGiveDate >= DATEADD(month, DATEDIFF(month, 0, GETDATE()), 0)
              THEN fdJumlah1 ELSE 0 END) AS bulan_ini,

            SUM(CASE 
              WHEN fdGiveDate >= DATEADD(month, DATEDIFF(month, 0, GETDATE()) - 1, 0)
              AND fdGiveDate < DATEADD(month, DATEDIFF(month, 0, GETDATE()), 0)
              THEN fdJumlah1 ELSE 0 END) AS bulan_lalu
          FROM tbBilling
        )
        SELECT 
          ISNULL(bulan_ini, 0) as bulan_ini,
          ISNULL(bulan_lalu, 0) as bulan_lalu,
          CASE 
            WHEN bulan_lalu = 0 THEN 0
            ELSE ((bulan_ini - bulan_lalu) * 100.0 / bulan_lalu)
          END AS growth
        FROM data
      `);

      revenue = rev.recordset[0].bulan_ini || 0;
      revenueGrowth = rev.recordset[0].growth || 0;

    } catch (e) { }

    res.json({
      totalCustomers: customers.recordset[0].total,
      customerDelta,
      totalSuratJalan: suratJalanCount,
      suratJalanGrowth,
      totalInvoices: invoiceCount,
      invoiceGrowth,
      revenue,
      revenueGrowth
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Chart Data (Last 6 Months)
router.get("/dashboard/charts", async (req, res) => {
  try {
    const db = await getPool();

    // Sales Trend (Revenue dari tbBilling)
    const salesResult = await db.request().query(`
      SELECT 
        FORMAT(fdGiveDate, 'MMM') as name,
        SUM(fdJumlah1) as sales
      FROM tbBilling
      WHERE fdGiveDate >= DATEADD(month, -5, DATEADD(month, DATEDIFF(month, 0, GETDATE()), 0))
      GROUP BY FORMAT(fdGiveDate, 'MMM'), MONTH(fdGiveDate), YEAR(fdGiveDate)
      ORDER BY YEAR(fdGiveDate), MONTH(fdGiveDate)
    `);

    // Delivery Activity (Jumlah Surat Jalan dari tbDelivery)
    const deliveryResult = await db.request().query(`
      SELECT 
        FORMAT(fdPrintDate, 'MMM') as name,
        COUNT(*) as count
      FROM tbDelivery
      WHERE fdPrintDate >= DATEADD(month, -5, DATEADD(month, DATEDIFF(month, 0, GETDATE()), 0))
      GROUP BY FORMAT(fdPrintDate, 'MMM'), MONTH(fdPrintDate), YEAR(fdPrintDate)
      ORDER BY YEAR(fdPrintDate), MONTH(fdPrintDate)
    `);

    res.json({
      sales: salesResult.recordset,
      delivery: deliveryResult.recordset
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
