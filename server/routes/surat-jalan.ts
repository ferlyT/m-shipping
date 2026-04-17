import express from "express";
import { getPool, sql } from "../config/db";

const router = express.Router();

// List Surat Jalan (PAGINATION + SEARCH + SORT)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const search = (req.query.search as string) || "";
    const sortBy = (req.query.sortBy as string) || "Date";
    const sortOrder = (req.query.sortOrder as string) === "asc" ? "ASC" : "DESC";

    const offset = (page - 1) * pageSize;
    const dbPool = await getPool();

    // Map frontend sort fields to SQL columns
    const sortMap: Record<string, string> = {
      Number: "sj.fdSJNo",
      Date: "sj.fdSJDate",
      CustomerName: "c.fdCustName",
      Type: "el.fdListType"
    };

    const orderBy = sortMap[sortBy] || "sj.fdSJDate";

    const whereClause = search
      ? `WHERE sj.fdSJNo LIKE @search 
         OR c.fdCustName LIKE @search 
         OR el.fdMarkingCode LIKE @search`
      : "";

    const requestCount = dbPool.request();
    requestCount.input("search", `%${search}%`);
    const countQuery = `
      SELECT COUNT(*) as total
      FROM tbDelivery sj WITH (NOLOCK)
      LEFT JOIN tbCustomers c WITH (NOLOCK) ON sj.fdCustCode = c.fdCustCode 
      LEFT JOIN tbEntryList el WITH (NOLOCK) ON sj.fdListCode = el.fdListCode
      ${whereClause}
    `;
    const countResult = await requestCount.query(countQuery);
    const total = countResult.recordset[0].total;

    const requestData = dbPool.request();
    requestData.input("search", `%${search}%`);
    requestData.input("offset", offset);
    requestData.input("pageSize", pageSize);

    const query = `
      SELECT 
        sj.fdSJNo as Number, 
        sj.fdSJDate as Date, 
        c.fdCustName as CustomerName, 
        el.fdListType as Type, 
        el.fdMarkingCode,
        sj.fdJmlPackSJ as fdQTY,
        sj.fdJmlBeratSJ as fdWeight
      FROM tbDelivery sj WITH (NOLOCK)
      LEFT JOIN tbCustomers c WITH (NOLOCK) ON sj.fdCustCode = c.fdCustCode 
      LEFT JOIN tbEntryList el WITH (NOLOCK) ON sj.fdListCode = el.fdListCode
      ${whereClause}
      ORDER BY ${orderBy} ${sortOrder}
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `;

    const result = await requestData.query(query);

    res.json({
      data: result.recordset,
      total,
      page,
      pageSize
    });
  } catch (err) {
    console.error("API Error Surat Jalan:", err);
    res.status(500).json({ error: "Failed to fetch surat jalan" });
  }
});

// Single Surat Jalan Detail (Header)
router.get("/:sjNo", async (req, res) => {
  try {
    const { sjNo } = req.params;
    const db = await getPool();
    const result = await db.request()
      .input("sjNo", sql.NVarChar, sjNo)
      .query(`
        SELECT sj.fdSJNo as Number, sj.fdSJDate as Date, 
               c.fdCustName as CustomerName, sj.fdAddr as Address, c.fdHP, c.fdTelp, c.fdCustCode, c.fdSalesNM,
               el.fdListType as Type, el.fdMarkingCode,
               m.fdConsignee
        FROM tbDelivery sj
        LEFT JOIN tbCustomers c ON sj.fdCustCode = c.fdCustCode
        LEFT JOIN tbEntryList el ON sj.fdListCode = el.fdListCode
        LEFT JOIN tbMarking m ON el.fdMarkingCode = m.fdMarkingCode
        WHERE RTRIM(CAST(sj.fdSJNo AS NVARCHAR(MAX))) = @sjNo
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Surat Jalan not found" });
    }
    res.json(result.recordset[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Surat Jalan Items
router.get("/:sjNo/items", async (req, res) => {
  try {
    const { sjNo } = req.params;
    const db = await getPool();
    const result = await db.request()
      .input("sjNo", sql.NVarChar, sjNo)
      .query(`
        SELECT fdJmlPackSJ as fdQTY, fdJmlBeratSJ as fdWeight , fdSatuan as fdUnit
        FROM tbDelivery 
        WHERE RTRIM(fdSJNo) = @sjNo
      `);
    res.json(result.recordset);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
