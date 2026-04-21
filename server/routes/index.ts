import express from "express";
import dashboardRouter from "./dashboard";
import customerRouter from "./customers";
import invoiceRouter from "./invoices";
import suratJalanRouter from "./surat-jalan";
import markingsRouter from "./markings";

const router = express.Router();

router.get("/stats", (req, res, next) => {
   // We could just move the stats handler here or keep it in dashboard.ts
   // But to match exactly /api/stats
   next();
});

// Mounting
router.use("/", dashboardRouter); // This has /stats and /charts (but we need /dashboard/charts)
router.use("/customers", customerRouter);
router.use("/invoices", invoiceRouter);
router.use("/surat-jalan", suratJalanRouter);
router.use("/markings", markingsRouter);

export default router;
