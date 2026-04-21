import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Receipt, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { formatRupiahShort } from "@/lib/format";
import { LoadingSpinner } from "@/components/LoadingState";
import { cn } from "@/lib/utils";
import { useLanguage } from "../locales/LanguageContext";

export default function Dashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    customerDelta: 0,
    totalSuratJalan: 0,
    suratJalanGrowth: 0,
    totalInvoices: 0,
    invoiceGrowth: 0,
    revenue: 0,
    revenueGrowth: 0,
  });
  const [charts, setCharts] = useState({
    sales: [] as { name: string; sales: number }[],
    delivery: [] as { name: string; count: number }[],
  });
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Fetch Stats
    fetch("/api/stats")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch stats");
        return res.json();
      })
      .then((data) => {
        setStats({
          totalCustomers: data.totalCustomers || 0,
          customerDelta: data.customerDelta || 0,
          totalSuratJalan: data.totalSuratJalan || 0,
          suratJalanGrowth: data.suratJalanGrowth || 0,
          totalInvoices: data.totalInvoices || 0,
          invoiceGrowth: data.invoiceGrowth || 0,
          revenue: data.revenue || 0,
          revenueGrowth: data.revenueGrowth || 0,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching stats:", err);
        setLoading(false);
      });

    // Fetch Chart Data
    fetch("/api/dashboard/charts")
      .then((res) => res.json())
      .then((data) => {
        setCharts({
          sales: data.sales || [],
          delivery: data.delivery || [],
        });
      })
      .catch((err) => console.error("Error fetching chart data:", err));
  }, []);

  const [chart1Ref, setChart1Ref] = useState<HTMLDivElement | null>(null);
  const [chart2Ref, setChart2Ref] = useState<HTMLDivElement | null>(null);
  const [size1, setSize1] = useState({ width: 0, height: 250 });
  const [size2, setSize2] = useState({ width: 0, height: 250 });

  useEffect(() => {
    if (!chart1Ref) return;
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0) setSize1({ width, height: height || 250 });
    });
    obs.observe(chart1Ref);
    return () => obs.disconnect();
  }, [chart1Ref]);

  useEffect(() => {
    if (!chart2Ref) return;
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0) setSize2({ width, height: height || 250 });
    });
    obs.observe(chart2Ref);
    return () => obs.disconnect();
  }, [chart2Ref]);

  if (!mounted) return null;
  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="display-sm text-on-surface">{t("dashboard.title")}</h1>
        <p className="body-sm text-on-surface-variant flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {t("dashboard.subtitle")}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t("dashboard.activeCustomers")} value={stats.totalCustomers} delta={stats.customerDelta} loading={loading} icon={<Users className="h-4 w-4 text-primary" />} isCurrency={false} />
        <StatCard title={t("dashboard.deliveryOrders")} value={stats.totalSuratJalan} growth={stats.suratJalanGrowth} loading={loading} icon={<FileText className="h-4 w-4 text-primary" />} isCurrency={false} />
        <StatCard title={t("dashboard.invoicesIssued")} value={stats.totalInvoices} growth={stats.invoiceGrowth} loading={loading} icon={<Receipt className="h-4 w-4 text-primary" />} isCurrency={false} />
        <StatCard title={t("dashboard.totalRevenue")} value={stats.revenue} growth={stats.revenueGrowth} loading={loading} icon={<TrendingUp className="h-4 w-4 text-primary" />} isCurrency={true} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-surface-container-lowest">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
                <CardTitle className="title-md text-on-surface">{t("dashboard.salesPerformance")}</CardTitle>
                <div className="bg-surface-container-low px-3 py-1 rounded-full label-md text-on-surface-variant">{t("dashboard.last6Months")}</div>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] w-full" ref={setChart1Ref}>
            {size1.width > 0 && charts.sales.length > 0 ? (
              <BarChart width={size1.width} height={size1.height} data={charts.sales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={1}/>
                    <stop offset="95%" stopColor="var(--primary-container)" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--on-surface)" opacity={0.05} />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} stroke="var(--on-surface-variant)" dy={10} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} stroke="var(--on-surface-variant)" tickFormatter={(value) => formatRupiahShort(value).replace("Rp ", "")} />
                <Tooltip 
                   cursor={{ fill: 'var(--primary)', opacity: 0.05 }}
                   contentStyle={{ backgroundColor: 'var(--surface-container-lowest)', border: 'none', borderRadius: '12px', boxShadow: 'var(--shadow-soft)', fontSize: '12px', color: 'var(--on-surface)' }} 
                   formatter={(value: number) => [formatRupiahShort(value), "Sales"]} 
                />
                <Bar dataKey="sales" fill="url(#colorSales)" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-on-surface-variant body-sm italic">
                {loading ? "Initializing..." : "No sales data found for the period"}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-surface-container-lowest">
          <CardHeader className="pb-6">
             <div className="flex items-center justify-between">
                <CardTitle className="title-md text-on-surface">{t("dashboard.logisticsTraffic")}</CardTitle>
                <div className="bg-surface-container-low px-3 py-1 rounded-full label-md text-on-surface-variant">{t("dashboard.realTimeActivity")}</div>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] w-full" ref={setChart2Ref}>
            {size2.width > 0 && charts.delivery.length > 0 ? (
              <LineChart width={size2.width} height={size2.height} data={charts.delivery} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                   <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="var(--primary)" />
                      <stop offset="100%" stopColor="#0ea5e9" />
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--on-surface)" opacity={0.05} />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} stroke="var(--on-surface-variant)" dy={10} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} stroke="var(--on-surface-variant)" />
                <Tooltip 
                   contentStyle={{ backgroundColor: 'var(--surface-container-lowest)', border: 'none', borderRadius: '12px', boxShadow: 'var(--shadow-soft)', fontSize: '12px', color: 'var(--on-surface)' }} 
                />
                <Line 
                   type="monotone" 
                   dataKey="count" 
                   name="Delivery Orders" 
                   stroke="url(#lineGradient)" 
                   strokeWidth={4} 
                   dot={{ r: 0 }} 
                   activeDot={{ r: 6, fill: 'var(--primary)', strokeWidth: 0 }}
                />
              </LineChart>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-on-surface-variant body-sm italic">
                {loading ? "Initializing..." : "No logistic activity found"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, delta, growth, loading, icon, isCurrency }: any) {
  const { t } = useLanguage();
  const isPositive = (delta !== undefined && delta >= 0) || (growth !== undefined && growth >= 0);
  
  return (
    <Card className="bg-surface-container-lowest border-none hover:translate-y-[-2px] transition-transform duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <span className="label-md font-semibold text-on-surface-variant uppercase tracking-wider">{title}</span>
        <div className="bg-surface-container-low p-2 rounded-lg">
            {icon}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="display-sm text-on-surface">
          {loading
            ? "..."
            : isCurrency
              ? formatRupiahShort(value)
              : value.toLocaleString()
          }
        </div>
        
        <div className="flex items-center gap-2">
            {growth !== undefined ? (
            <div className={cn(
                "px-2 py-1 rounded-full flex items-center gap-1",
                growth >= 0 ? "bg-success-container text-on-success-container" : "bg-error-container text-on-error-container"
            )}>
                <span className="label-md font-bold text-success-foreground">{growth >= 0 ? "+" : "-"}{Math.abs(growth).toFixed(1)}%</span>
            </div>
            ) : delta !== undefined ? (
            <div className={cn(
                "px-2 py-1 rounded-full flex items-center gap-1",
                delta >= 0 ? "bg-success-container text-on-success-container" : "bg-error-container text-on-error-container"
            )}>
                <span className="label-md font-bold text-success-foreground">{delta >= 0 ? "+" : ""}{delta.toLocaleString()}</span>
            </div>
            ) : null}
            <span className="label-md text-on-surface-variant">{t("dashboard.vsLastMonth")}</span>
        </div>
      </CardContent>
    </Card>
  );
}
