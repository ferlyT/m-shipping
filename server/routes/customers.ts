import express from "express";
import { getPool, sql } from "../config/db";

const router = express.Router();

// List Customers (SEARCH + PAGINATION + SORT)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const search = (req.query.search as string) || "";
    const sortBy = (req.query.sortBy as string) || "fdCustName";
    const sortOrder = (req.query.sortOrder as string) === "desc" ? "DESC" : "ASC";

    const offset = (page - 1) * pageSize;

    const allowedSort = ["fdCustName", "fdContact", "fdHP", "fdAddr1", "status"];
    const safeSortBy = allowedSort.includes(sortBy) ? sortBy : "fdCustName";

    let orderByClause = "";
    if (safeSortBy === "status") {
      orderByClause = `CASE 
        WHEN sc.fdStatus = 'OK' THEN 1 
        WHEN sc.fdStatus = 'COD' THEN 2 
        WHEN sc.fdStatus IS NULL THEN 3
        ELSE 4 
      END ${sortOrder}, fdCustName ASC`;
    } else {
      orderByClause = `${safeSortBy} ${sortOrder}`;
    }

    const db = await getPool();
    const searchQuery = `%${search.trim()}%`;

    const result = await db.request()
      .input("search", sql.NVarChar, searchQuery)
      .input("offset", sql.Int, offset)
      .input("pageSize", sql.Int, pageSize)
      .query(`
        SELECT fdCustCode, fdCustName, fdHP, fdContact, fdAddr1, fdAddr2, fdAlamatPengiriman, 
               fdDiscontinued, sc.fdStatus as Status
        FROM tbCustomers c
        LEFT JOIN tbStatusCustomer sc ON c.fdBlocked = sc.fdBlocked
        WHERE fdCustName LIKE @search 
           OR fdContact LIKE @search 
           OR fdHP LIKE @search 
           OR CAST(fdAddr1 AS NVARCHAR(MAX)) LIKE @search
           OR CAST(fdAddr2 AS NVARCHAR(MAX)) LIKE @search
           OR CAST(fdAlamatPengiriman AS NVARCHAR(MAX)) LIKE @search
           OR sc.fdStatus LIKE @search
        ORDER BY ${orderByClause}
        OFFSET @offset ROWS
        FETCH NEXT @pageSize ROWS ONLY
      `);

    const count = await db.request()
      .input("search", sql.NVarChar, searchQuery)
      .query(`
        SELECT COUNT(*) as total
        FROM tbCustomers c
        LEFT JOIN tbStatusCustomer sc ON c.fdBlocked = sc.fdBlocked
        WHERE fdCustName LIKE @search 
           OR fdContact LIKE @search 
           OR fdHP LIKE @search 
           OR CAST(fdAddr1 AS NVARCHAR(MAX)) LIKE @search
           OR CAST(fdAddr2 AS NVARCHAR(MAX)) LIKE @search
           OR CAST(fdAlamatPengiriman AS NVARCHAR(MAX)) LIKE @search
           OR sc.fdStatus LIKE @search
      `);

    res.json({
      data: result.recordset,
      total: count.recordset[0].total,
      page,
      pageSize
    });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Single Customer Detail
router.get("/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const db = await getPool();
    const result = await db.request()
      .input("code", sql.NVarChar, code)
      .query(`
        SELECT * , sc.fdStatus as Status, s.fdSalesNM as Sales, fin.fdEmpName as Finance, cs.fdEmpName as Cs, c.fdLoad as TglUpdate
        FROM tbCustomers c
        LEFT JOIN tbSales s ON c.fdSalesID = s.fdSalesID
        LEFT JOIN tbStatusCustomer sc ON c.fdBlocked = sc.fdBlocked
        LEFT JOIN tbEmployees fin ON fin.fdEmpCode = c.fdFinCode
        LEFT JOIN tbEmployees cs ON cs.fdEmpCode = c.fdResID
        WHERE RTRIM(fdCustCode) = @code
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json(result.recordset[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
