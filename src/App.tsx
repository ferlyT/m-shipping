import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import SuratJalan from "./pages/SuratJalan";
import SuratJalanDetail from "./pages/SuratJalanDetail";
import Invoices from "./pages/Invoices";
import InvoiceDetail from "./pages/InvoiceDetail";
import ShippingBatches from "./pages/ShippingBatches";

import { ThemeProvider } from "./components/ThemeProvider";
import { LanguageProvider } from "./locales/LanguageContext";

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:code" element={<CustomerDetail />} />
          <Route path="/surat-jalan" element={<SuratJalan />} />
          <Route path="/surat-jalan/:id" element={<SuratJalanDetail />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/:id" element={<InvoiceDetail />} />
          <Route path="/shipping-batches" element={<ShippingBatches />} />
        </Routes>
      </Layout>
    </Router>
      </ThemeProvider>
    </LanguageProvider>
  );
}
