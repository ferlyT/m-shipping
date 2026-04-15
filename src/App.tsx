import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import SuratJalan from "./pages/SuratJalan";
import Invoices from "./pages/Invoices";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/surat-jalan" element={<SuratJalan />} />
          <Route path="/invoices" element={<Invoices />} />
        </Routes>
      </Layout>
    </Router>
  );
}
