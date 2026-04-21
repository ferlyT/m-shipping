import express from "express";
import { getPool, sql } from "../config/db";

const router = express.Router();

// Stats for Dashboard
router.get("/stats", async (req, res) => {
  try {
    const dbPool = await getPool();
    const result = await dbPool.request().query(`
      SELECT 
        SUM(CASE WHEN fdListType = 1 THEN 1 ELSE 0 END) as air,
        SUM(CASE WHEN fdListType = 2 THEN 1 ELSE 0 END) as sea,
        SUM(CASE WHEN fdExitDate IS NULL AND fdLoadDate IS NULL THEN 1 ELSE 0 END) as planned,
        SUM(CASE WHEN fdExitDate IS NULL AND fdLoadDate IS NOT NULL THEN 1 ELSE 0 END) as ready,
        SUM(CASE WHEN fdExitDate IS NOT NULL THEN 1 ELSE 0 END) as released,
        COUNT(DISTINCT fdConsignee) as consignees
      FROM tbMarking WITH (NOLOCK)
    `);
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// List Markings for Shipping Batches
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const search = (req.query.search as string) || "";
    const transitMode = req.query.transitMode ? parseInt(req.query.transitMode as string) : null;

    const offset = (page - 1) * pageSize;
    const sortBy = (req.query.sortBy as string) || "fdSysDate";
    const sortOrder = (req.query.sortOrder as string) === "asc" ? "ASC" : "DESC";

    const dbPool = await getPool();

    // Whitelist for sorting
    const sortMap: Record<string, string> = {
      marking: "fdMarkingCode",
      transitmode: "fdListType",
      consignee: "fdConsignee",
      status: `CASE 
        WHEN fdExitDate IS NOT NULL THEN 3 
        WHEN fdLoadDate IS NOT NULL THEN 2 
        ELSE 1 
      END`
    };

    const orderBy = sortMap[sortBy] || "fdSysDate";

    const request = dbPool.request();
    request.input("search", `%${search}%`);
    request.input("offset", offset);
    request.input("pageSize", pageSize);

    let whereClause = search
      ? `WHERE (fdMarkingCode LIKE @search OR fdConsignee LIKE @search)`
      : "WHERE 1=1";

    if (transitMode !== null) {
      whereClause += ` AND fdListType = @transitMode`;
      request.input("transitMode", transitMode);
    }

    // We assume tbMarking has these columns based on the image provided
    const query = `
      SELECT 
        fdMarkingCode as marking,
        fdListType as transitmode,
        fdConsignee as consignee,
        fdContNo,
        fdContSize,
        fdBLNo,
        fdAWB,
        fdWilayah,
        fdJmlPack,
        fdSatuan,
        fdJmlBerat,
        fdM3,
        fdLoadDate,
        fdETA,
        fdETD,
        fdExitDate,
        fdGudang,
        fdKet,
        COUNT(*) OVER() as TotalCount
      FROM tbMarking
      ${whereClause}
      ORDER BY ${orderBy} ${sortOrder}
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `;

    const result = await request.query(query);
    const total = result.recordset.length > 0 ? result.recordset[0].TotalCount : 0;

    res.json({
      data: result.recordset,
      total,
      page,
      pageSize
    });
  } catch (err) {
    console.error("API Error Markings:", err);
    res.status(500).json({ error: "Failed to fetch markings" });
  }
});

// Get Detail Items (Delivery Orders) for a specific Marking
router.get("/:markingCode/items", async (req, res) => {
  try {
    const { markingCode } = req.params;
    const dbPool = await getPool();
    const result = await dbPool.request()
      .input("marking", sql.NVarChar, markingCode)
      .query(`
        SELECT 
          c.fdCustName as Customer,
          el.fdJmlPack as Qty, 
          el.fdJmlBerat as Weight,
          el.fdSatuan as Unit,
          el.fdM3 as M3,
          el.fdComodity as Comodity
        FROM tbEntryList el
        LEFT JOIN tbCustomers c ON c.fdCustCode = el.fdCustCode
        WHERE el.fdMarkingCode = @marking
        ORDER BY el.fdListCode ASC
      `);
    res.json(result.recordset);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
