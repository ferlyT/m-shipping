export const translations = {
  en: {
    // Login
    access_identity: "Access Identity",
    secure_key: "Secure Key",
    login: "LOGIN",
    biometric_entry: "Biometric Entry",
    brand_subtitle: "Logistics & Finance Intelligence",

    // Dashboard
    portfolio_overview: "Portfolio Overview",
    total_active_customers: "Total Active Customers",
    active_deliveries: "Active Deliveries",
    total_revenue: "Total Revenue",
    recent_customers: "Recent Customers",
    view_all: "View All",
    hub: "HOME",
    deliveries: "DELIVERIES",
    customers: "CUSTOMERS",
    invoices: "INVOICES",
    settings: "SETTINGS",

    // Orders / Invoices
    ops_dashboard: "Operations Dashboard",
    logistics_freight: "LOGISTICS & FREIGHT",
    ops_subtitle: "Real-time oversight of your regional delivery pipeline.",
    active_shipments: "Active Shipments",
    billing: "Billing",
    in_transit: "In Transit",
    cleared: "Cleared",
    overdue: "Overdue",

    // Settings
    acc_integrity: "Account Integrity",
    trust_score: "Trust Score",
    active_streak: "Active Streak",
    acc_security: "Account Security",
    biometric_login: "Biometric Login",
    notifications: "Notifications",
    app_theme: "App Theme",
    language: "Primary Language",
    logout: "End Session (Logout)",
    danger_zone: "Danger Zone",

    // Profile
    active: "ACTIVE",
    membership: "MEMBER SINCE",
    customer_id: "CUSTOMER ID",
    shipments_delivered: "TOTAL SHIPMENTS DELIVERED",
    available_credits: "AVAILABLE CREDITS",
    on_limit: "OF LIMIT",
    active_contracts: "ACTIVE CONTRACTS",
    reliability: "ON-TIME RELIABILITY",
    shipping_zone: "SHIPPING ZONE",
    recent_activity: "Recent Activity",
    activity_subtitle: "Live tracking of recent transactions",

    // Delivery Order
    delivery_order_detail: "DELIVERY ORDER DETAIL",
    status_in_transit: "IN TRANSIT",
    journey_progression: "Journey Progression",
    real_time_sync: "REAL-TIME SYNC",
    technical_metrics: "TECHNICAL METRICS",
    gross_weight: "Gross Weight",
    pallet_count: "Pallet Count",
    temperature: "Temperature",
    dest_coordinates: "DESTINATION COORDINATES",
    courier_lead: "COURIER LEAD",
    cargo_manifest: "CARGO MANIFEST",

    // Invoice
    invoice_amount: "INVOICE AMOUNT",
    status_cleared: "CLEARED",
    bill_to: "BILL TO",
    due_date: "DUE DATE",
    payment_method: "PAYMENT METHOD",
    service_details: "SERVICE DETAILS",
    subtotal: "Subtotal",
    tax: "Tax",
    total_amount_due: "TOTAL AMOUNT DUE",
    download_pdf: "DOWNLOAD PDF",
    view_receipt: "VIEW RECEIPT",
  },
  id: {
    // Login
    access_identity: "Identitas Akses",
    secure_key: "Kunci Keamanan",
    login: "MASUK",
    biometric_entry: "Akses Biometrik",
    brand_subtitle: "Intelijen Logistik & Keuangan",

    // Dashboard
    portfolio_overview: "Portofolio",
    total_active_customers: "Total Pelanggan Aktif",
    active_deliveries: "Pengiriman Aktif",
    total_revenue: "Total Pendapatan",
    recent_customers: "Pelanggan Terbaru",
    view_all: "Lihat Semua",
    hub: "BERANDA",
    deliveries: "PENGIRIMAN",
    invoices: "TAGIHAN",
    customers: "PELANGGAN",
    settings: "PENGATURAN",

    // Orders / Invoices
    ops_dashboard: "Dashboard Operasional",
    logistics_freight: "LOGISTIK & KARGO",
    ops_subtitle: "Pengawasan real-time pipa pengiriman regional Anda.",
    active_shipments: "Pengiriman Aktif",
    billing: "Penagihan",
    in_transit: "Dalam Perjalanan",
    cleared: "Lunas",
    overdue: "Terlambat",

    // Settings
    acc_integrity: "Integritas Akun",
    trust_score: "Skor Kepercayaan",
    active_streak: "Hari Aktif",
    acc_security: "Keamanan Akun",
    biometric_login: "Login Biometrik",
    notifications: "Notifikasi",
    app_theme: "Tema Aplikasi",
    language: "Bahasa Utama",
    logout: "Akhiri Sesi (Keluar)",
    danger_zone: "Zona Berbahaya",

    // Profile
    active: "AKTIF",
    membership: "ANGGOTA SEJAK",
    customer_id: "ID PELANGGAN",
    shipments_delivered: "TOTAL PENGIRIMAN TERSELESAIKAN",
    available_credits: "KREDIT TERSEDIA",
    on_limit: "DARI LIMIT",
    active_contracts: "KONTRAK AKTIF",
    reliability: "RELIABILITAS TEPAT WAKTU",
    shipping_zone: "ZONA PENGIRIMAN",
    recent_activity: "Aktivitas Terbaru",
    activity_subtitle: "Pelacakan langsung transaksi terbaru",

    // Delivery Order
    delivery_order_detail: "DETAIL SURAT JALAN",
    status_in_transit: "DALAM PERJALANAN",
    journey_progression: "Progres Perjalanan",
    real_time_sync: "SINKRONISASI REAL-TIME",
    technical_metrics: "METRIK TEKNIS",
    gross_weight: "Berat Kotor",
    pallet_count: "Jumlah Palet",
    temperature: "Temperatur",
    dest_coordinates: "KOORDINAT TUJUAN",
    courier_lead: "KEPALA KURIR",
    cargo_manifest: "MANIFEST KARGO",

    // Invoice
    invoice_amount: "JUMLAH TAGIHAN",
    status_cleared: "LUNAS",
    bill_to: "TAGIHAN KEPADA",
    due_date: "JATUH TEMPO",
    payment_method: "METODE PEMBAYARAN",
    service_details: "DETAIL LAYANAN",
    subtotal: "Subtotal",
    tax: "Pajak",
    total_amount_due: "TOTAL TAGIHAN",
    download_pdf: "UNDUH PDF",
    view_receipt: "LIHAT KWITANSI",
  }
};

export type Language = 'en' | 'id';
export type TranslationKeys = typeof translations.en;
