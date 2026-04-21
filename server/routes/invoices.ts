import express from "express";
import { getPool, sql } from "../config/db";

const router = express.Router();

// List Invoices (PAGINATION + SEARCH + SORT)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const search = (req.query.search as string) || "";
    const sortBy = (req.query.sortBy as string) || "fdInvDate";
    const sortOrder = (req.query.sortOrder as string) === "asc" ? "ASC" : "DESC";

    const offset = (page - 1) * pageSize;

    const allowedSort = ["fdInvNo", "fdInvDate", "fdCustName", "fdJumlah1", "status"];
    const safeSortBy = allowedSort.includes(sortBy) ? sortBy : "fdInvDate";

    let orderByClause = "";
    if (safeSortBy === "status") {
      orderByClause = `CASE 
        WHEN sc.fdStatus = 'OK' THEN 1 
        WHEN sc.fdStatus = 'COD' THEN 2 
        WHEN sc.fdStatus IS NULL THEN 3
        ELSE 4 
      END ${sortOrder}, i.fdInvDate DESC`;
    } else {
      orderByClause = `${safeSortBy === "fdCustName" ? "c.fdCustName" : "i." + safeSortBy} ${sortOrder}`;
    }

    const db = await getPool();
    const searchQuery = `%${search.trim()}%`;

    const result = await db.request()
      .input("search", sql.NVarChar, searchQuery)
      .input("offset", sql.Int, offset)
      .input("pageSize", sql.Int, pageSize)
      .query(`
        SELECT i.fdInvNo, i.fdInvDate, i.fdCustCode, i.fdJumlah1, i.fdListType, 
               c.fdCustName as CustomerName, sc.fdStatus as Status
        FROM tbBilling i
        JOIN tbCustomers c ON i.fdCustCode = c.fdCustCode
        LEFT JOIN tbStatusCustomer sc ON c.fdBlocked = sc.fdBlocked
        WHERE i.fdInvNo LIKE @search 
           OR c.fdCustName LIKE @search
        ORDER BY ${orderByClause}
        OFFSET @offset ROWS
        FETCH NEXT @pageSize ROWS ONLY
      `);

    const count = await db.request()
      .input("search", sql.NVarChar, searchQuery)
      .query(`
        SELECT COUNT(*) as total
        FROM tbBilling i
        JOIN tbCustomers c ON i.fdCustCode = c.fdCustCode
        LEFT JOIN tbStatusCustomer sc ON c.fdBlocked = sc.fdBlocked
        WHERE i.fdInvNo LIKE @search 
           OR c.fdCustName LIKE @search
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
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

// Single Invoice Detail (Header + Customer)
router.get("/:invNo", async (req, res) => {
  try {
    const { invNo } = req.params;
    const db = await getPool();
    const result = await db.request()
      .input("invNo", sql.NVarChar, invNo)
      .query(`
        SELECT i.*, 
               c.fdCustName as CustomerName, 
               c.fdAddr1, c.fdHP, c.fdTelp, c.fdCustCode, c.fdSalesNM,
               e.fdEmpName as fdCreatedBy, m.fdConsignee, tc.fdComodityName,
               sc.fdStatus as Status
        FROM tbBilling i
        LEFT JOIN tbCustomers c ON i.fdCustCode = c.fdCustCode
        LEFT JOIN tbEmployees e ON i.fdEmpCode = e.fdEmpCode
        LEFT JOIN tbMarking m ON i.fdMarkingCode = m.fdMarkingCode
        LEFT JOIN tbEntryList el ON i.fdListCode = el.fdListCode
        LEFT JOIN tbTypeComodity tc ON el.fdListType = tc.fdListType AND el.fdTypeComodity = tc.fdTypeComodity
        LEFT JOIN tbStatusCustomer sc ON c.fdBlocked = sc.fdBlocked
        WHERE RTRIM(CAST(i.fdInvNo AS NVARCHAR(MAX))) = @invNo
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.json(result.recordset[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Invoice Line Items
router.get("/:invNo/items", async (req, res) => {
  try {
    const { invNo } = req.params;
    const db = await getPool();
    const result = await db.request()
      .input("invNo", sql.NVarChar, invNo)
      .query(`
        SELECT * 
        FROM tbBillingDetail 
        WHERE RTRIM(fdInvNo) = @invNo
        ORDER BY fdID ASC
      `);
    res.json(result.recordset);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
