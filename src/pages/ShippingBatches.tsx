import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Plane,
  Ship,
  User,
  Hash,
  Package,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Activity,
  TrendingUp
} from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingState";
import { cn } from "@/lib/utils";
import { useLanguage } from "../locales/LanguageContext";
import { format } from "date-fns";

function StatsCard({ label, value, icon: Icon, trend, variant = "default" }: { label: string; value: any; icon: any; trend: string; variant?: "default" | "primary" | "success" | "tertiary" }) {
  const colorClass = 
    variant === "primary" ? "text-primary bg-primary/10" :
    variant === "success" ? "text-success bg-success/10" :
    variant === "tertiary" ? "text-tertiary bg-tertiary/10" :
    "text-on-surface-variant bg-surface-container-high/60";

  return (
    <Card className="border-none shadow-soft overflow-hidden bg-surface-container-lowest transition-all hover:scale-[1.02]">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-on-surface-variant/50 tracking-widest">{label}</p>
            <h3 className="text-3xl font-black text-on-surface tracking-tighter">{value}</h3>
          </div>
          <div className={cn("p-3 rounded-2xl", colorClass)}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-surface-container-low flex items-center gap-2">
          <TrendingUp className="h-3 w-3 text-success opacity-40" />
          <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest leading-none">
            {trend}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function SpecItem({ label, value, variant = "default" }: { label: string; value: any; variant?: "default" | "primary" }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold uppercase text-on-surface-variant/50 tracking-widest">{label}</p>
      <p className={cn(
        "label-md font-bold truncate",
        variant === "primary" ? "text-primary" : "text-on-surface"
      )}>
        {value || "-"}
      </p>
    </div>
  );
}

function MarkingRow({ item }: { item: any }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = React.useState(false);
  const [details, setDetails] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (expanded && details.length === 0) {
      setLoading(true);
      fetch(`/api/markings/${item.marking}/items`)
        .then(res => res.json())
        .then(data => {
          setDetails(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [expanded, item.marking]);

  return (
    <>
      <tr className={cn(
        "group transition-all duration-300",
        expanded 
            ? "bg-primary/[0.03] shadow-[inset_4px_0_0_0_#0061A4]" 
            : "hover:bg-surface-container-low/60 border-b border-surface-container-low"
      )}>
        <td className="px-4 py-3">
           <div className="flex items-center gap-4 font-bold text-on-surface">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                    "h-8 w-8 rounded-full transition-all duration-300",
                    expanded ? "bg-primary text-white hover:bg-primary/90 rotate-0" : "hover:bg-primary/10 hover:text-primary"
                )}
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </Button>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <Hash className="h-3.5 w-3.5 text-primary opacity-40" />
                    <span className="text-base tracking-tight">{item.marking || "-"}</span>
                </div>
                {expanded && <span className="text-[10px] text-primary/60 font-black uppercase tracking-widest mt-0.5">Active Session</span>}
              </div>
           </div>
        </td>
        <td className="px-4 py-3">
           {item.transitmode === 1 ? (
             <div className="flex items-center gap-2.5 px-3 py-1 bg-primary/5 rounded-full w-fit">
                <Plane className="h-4 w-4 text-primary" />
                <span className="text-primary font-bold label-md uppercase tracking-tight">AIR</span>
             </div>
           ) : item.transitmode === 2 ? (
             <div className="flex items-center gap-2.5 px-3 py-1 bg-tertiary/5 rounded-full w-fit">
                <Ship className="h-4 w-4 text-tertiary" />
                <span className="text-tertiary font-bold label-md uppercase tracking-tight">SEA</span>
             </div>
           ) : (
             <div className="flex items-center gap-2.5 px-3 py-1 bg-on-surface-variant/5 rounded-full w-fit">
                <Clock className="h-4 w-4 text-on-surface-variant/40" />
                <span className="text-on-surface-variant/60 font-bold label-md uppercase tracking-tight">PENDING</span>
             </div>
           )}
        </td>
        <td className="px-4 py-3">
           <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                {item.consignee ? item.consignee.trim().slice(-2) : "??"}
              </div>
              <div className="flex flex-col">
                <span className="text-on-surface font-black label-md truncate max-w-[180px]">{item.consignee || "-"}</span>
                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest leading-none">Receiver</span>
              </div>
           </div>
        </td>
        <td className="px-4 py-3">
          {(() => {
            let status = "PLANNED";
            let colorClass = "text-on-surface-variant/60 bg-surface-container-high/40 border-on-surface-variant/10";
            let dotClass = "bg-on-surface-variant/40";
            let Icon = Clock;

            if (item.fdExitDate) {
              status = "RELEASED";
              colorClass = "text-success bg-success/5 border-success/20 py-1";
              dotClass = "bg-success";
              Icon = CheckCircle2;
            } else if (item.fdLoadDate) {
              status = "IN TRANSIT";
              colorClass = "text-primary bg-primary/5 border-primary/20 py-1";
              dotClass = "bg-primary animate-pulse";
              Icon = item.transitmode === 1 ? Plane : Ship;
            } else if (item.fdETD) {
              status = "READY";
              colorClass = "text-warning bg-warning/5 border-warning/20 py-1";
              dotClass = "bg-warning";
              Icon = Package;
            }

            return (
              <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border label-md font-black uppercase tracking-wider", colorClass)}>
                <Icon className="h-3.5 w-3.5" />
                <span className={cn("inline-block w-1 h-1 rounded-full", dotClass)} />
                {status}
              </div>
            );
          })()}
        </td>
      </tr>
      
      {/* Nested Data Grid */}
      {expanded && (
        <tr className="animate-in slide-in-from-top-4 duration-500 ease-out fill-mode-both">
          <td colSpan={4} className="px-10 pb-12 pt-2 bg-gradient-to-b from-primary/[0.03] to-background">
            <div className="space-y-8 pl-12 relative">
              {/* Connector Line */}
              <div className="absolute left-4 top-0 bottom-12 w-0.5 bg-gradient-to-b from-primary to-transparent opacity-20" />

              {/* Batch Specification Matrix */}
              <div className="space-y-4">
                 <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/50 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Batch Configuration Parameters
                 </h4>
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 bg-surface-container-lowest p-8 rounded-[32px] border border-surface-container-high shadow-soft">
                    <SpecItem label={t("shippingBatches.specs.container")} value={item.fdContNo} />
                    <SpecItem label={t("shippingBatches.specs.size")} value={item.fdContSize} />
                    <SpecItem label={t("shippingBatches.specs.bl")} value={item.fdBLNo} />
                    <SpecItem label={t("shippingBatches.specs.awb")} value={item.fdAWB} />
                    <SpecItem label={t("shippingBatches.specs.region")} value={item.fdWilayah} />
                    <SpecItem label={t("shippingBatches.specs.warehouse")} value={item.fdGudang} />
                    
                    <SpecItem label={t("shippingBatches.specs.totalPack")} value={item.fdJmlPack ? `${item.fdJmlPack} ${item.fdSatuan || ""}` : "-"} />
                    <SpecItem label={t("suratJalan.detail.netWeight")} value={item.fdJmlBerat ? `${item.fdJmlBerat} KG` : "-"} />
                    <SpecItem label={t("shippingBatches.specs.volume")} value={item.fdM3} />

                    <SpecItem label={t("shippingBatches.specs.loadDate")} value={item.fdLoadDate ? format(new Date(item.fdLoadDate), "dd MMM yyyy") : "-"} />
                    <SpecItem label={t("shippingBatches.specs.eta")} value={item.fdETA ? format(new Date(item.fdETA), "dd MMM yyyy") : "-"} variant="primary" />
                    <SpecItem label={t("shippingBatches.specs.exit")} value={item.fdExitDate ? format(new Date(item.fdExitDate), "dd MMM yyyy") : "-"} />
                    
                    <div className="col-span-full pt-6 mt-2 border-t border-dashed border-surface-container-high flex flex-col gap-1.5">
                       <p className="text-[10px] font-black uppercase text-on-surface-variant/40 tracking-widest">{t("shippingBatches.specs.remarks")}</p>
                       <p className="body-md text-on-surface font-medium italic border-l-4 border-primary/20 pl-4 py-2 bg-surface-container-low/30 rounded-r-xl">
                          {item.fdKet || "No supplementary logistical caveats documented for this session."}
                       </p>
                    </div>
                 </div>
              </div>

              {/* Manifests Table */}
              <div className="space-y-4">
                 <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/50 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Cargo Manifest Registry
                 </h4>
                 <div className="rounded-[32px] border border-surface-container-high bg-surface-container-lowest overflow-hidden shadow-soft">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-primary-container/20 text-[10px] font-black uppercase text-primary tracking-widest border-b border-surface-container-high">
                          <th className="px-8 py-5 text-left">{t("invoices.table.account")}</th>
                          <th className="px-8 py-5 text-left">{t("invoices.detail.commodity")}</th>
                          <th className="px-8 py-5 text-right">{t("suratJalan.detail.unitCount")}</th>
                          <th className="px-8 py-5 text-right">{t("suratJalan.detail.netWeight")}</th>
                          <th className="px-8 py-5 text-right">{t("shippingBatches.specs.volume")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container-low">
                        {loading ? (
                          <tr>
                            <td colSpan={5} className="py-16">
                              <div className="flex flex-col items-center gap-4">
                                <LoadingSpinner />
                                <span className="text-[10px] font-bold text-primary animate-pulse uppercase tracking-[0.3em]">Synching Manifest...</span>
                              </div>
                            </td>
                          </tr>
                        ) : details.length > 0 ? (
                          details.map((d, idx) => (
                            <tr key={idx} className="hover:bg-primary/[0.02] transition-colors group/row">
                              <td className="px-8 py-5">
                                 <div className="flex items-center gap-3">
                                    <div className="h-6 w-6 rounded-md bg-surface-container-high flex items-center justify-center text-[10px] font-black text-on-surface-variant group-hover/row:bg-primary group-hover/row:text-primary-foreground transition-all">
                                        {idx + 1}
                                    </div>
                                    <span className="font-bold text-on-surface text-sm">{d.Customer || "-"}</span>
                                 </div>
                              </td>
                              <td className="px-8 py-5 text-on-surface-variant italic font-medium body-sm">
                                {d.Comodity || "Undisclosed Cargo"}
                              </td>
                              <td className="px-8 py-5 text-right">
                                <span className="bg-surface-container-high/60 group-hover/row:bg-primary/10 px-4 py-1.5 rounded-full label-md font-black text-on-surface transition-all">
                                  {d.Qty} <span className="text-[10px] opacity-40 lowercase font-bold">{d.Unit}</span>
                                </span>
                              </td>
                              <td className="px-8 py-5 text-right font-mono font-black text-on-surface text-base">
                                {d.Weight} <span className="text-[10px] opacity-40 italic font-normal">KG</span>
                              </td>
                              <td className="px-8 py-5 text-right font-mono font-black text-primary text-base">
                                {d.M3 || "0.00"} <span className="text-[10px] opacity-40 italic font-normal">M3</span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-20 text-center flex flex-col items-center gap-4">
                              <Package className="h-10 w-10 text-on-surface-variant/10" />
                              <p className="body-md text-on-surface-variant/40 italic font-medium">
                                No verified manifest entries detected for this batch group.
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                 </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function ShippingBatches() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = React.useState<"ALL" | "AIR" | "SEA">("ALL");
  const [search, setSearch] = React.useState("");
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [total, setTotal] = React.useState(0);

  const [sortBy, setSortBy] = React.useState("status");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");

  const [stats, setStats] = React.useState<any>(null);

  React.useEffect(() => {
    fetch("/api/markings/stats")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);

  const totalPages = Math.ceil(total / pageSize) || 1;

  // Header Sort Toggle
  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  function SortHeader({ field, label, align = "left" }: { field: string; label: string; align?: "left" | "right" }) {
    const isActive = sortBy === field;
    return (
        <th 
            className={cn(
                "px-4 py-2.5 transition-colors cursor-pointer group",
                align === "right" ? "text-right" : "text-left",
                isActive ? "text-primary" : "hover:text-primary/70"
            )}
            onClick={() => toggleSort(field)}
        >
            <div className={cn("flex items-center gap-2", align === "right" ? "justify-end" : "justify-start")}>
                <span>{label}</span>
                <div className="flex flex-col">
                    {isActive ? (
                        sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-20 group-hover:opacity-100 transition-opacity" />
                    )}
                </div>
            </div>
        </th>
    );
  }

  // Fetch data
  React.useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      search,
      sortBy,
      sortOrder,
    });

    if (activeTab === "AIR") params.append("transitMode", "1");
    if (activeTab === "SEA") params.append("transitMode", "2");

    fetch(`/api/markings?${params}`)
      .then((res) => res.json())
      .then((res) => {
        setData(res.data || []);
        setTotal(res.total || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setData([]);
        setTotal(0);
        setLoading(false);
      });
  }, [page, pageSize, search, activeTab, sortBy, sortOrder]);

  const startItem = total > 0 ? (page - 1) * pageSize + 1 : 0;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div className="space-y-4 pb-6 px-1">
      <div className="flex flex-col gap-0.5">
        <h1 className="display-sm text-on-surface">{t("shippingBatches.title")}</h1>
        <p className="body-sm text-on-surface-variant italic">{t("shippingBatches.subtitle")}</p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatsCard 
            label="Air Logistics" 
            value={stats?.air || 0} 
            icon={Plane} 
            trend="Active Markings"
            variant="primary"
         />
         <StatsCard 
            label="Sea Freight" 
            value={stats?.sea || 0} 
            icon={Ship} 
            trend="Active Markings"
            variant="tertiary"
         />
         <StatsCard 
            label="Current Pipeline" 
            value={(stats?.planned || 0) + (stats?.ready || 0)} 
            icon={Activity} 
            trend={`${stats?.planned || 0} Planned / ${stats?.ready || 0} In Transit`}
            variant="success"
         />
         <StatsCard 
            label="Total Accounts" 
            value={stats?.consignees || 0} 
            icon={User} 
            trend="Unique Customers"
            variant="default"
         />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        {/* Custom Tabs */}
        <div className="bg-surface-container-low p-1.5 rounded-[16px] flex items-center gap-1 shadow-inner border border-surface-container-high/50">
            {[
                { id: "ALL", label: "Registry Hub", icon: Hash },
                { id: "AIR", label: "Air Cargo", icon: Plane },
                { id: "SEA", label: "Sea Freight", icon: Ship },
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => {
                        setActiveTab(tab.id as any);
                        setPage(1);
                    }}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-[12px] label-md font-bold transition-all uppercase tracking-wider",
                        activeTab === tab.id
                            ? "bg-white shadow-soft text-primary scale-105"
                            : "text-on-surface-variant/60 hover:text-on-surface hover:bg-white/50"
                    )}
                >
                    <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-primary text-opacity-100" : "text-opacity-40")} />
                    {tab.label}
                </button>
            ))}
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3 w-3 text-on-surface-variant/50 group-focus-within:text-primary transition-colors" />
        <Input
          placeholder={t("invoices.searchPlaceholder")}
          className="pl-11 h-9 text-xs"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <Card className="border-none shadow-soft overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] font-bold tracking-[0.1em] border-b border-surface-container-high">
                <SortHeader field="marking" label={t("shippingBatches.table.marking")} />
                <SortHeader field="transitmode" label={t("shippingBatches.table.transitMode")} />
                <SortHeader field="consignee" label={t("shippingBatches.table.consignee")} />
                <SortHeader field="status" label={t("common.status")} />
              </tr>
            </thead>

            <tbody className="divide-y-0 text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-20">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((item, i) => (
                  <MarkingRow key={i} item={item} />
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-20 text-on-surface-variant/50 body-sm italic">
                    {t("common.noData")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-4 text-sm text-muted-foreground pt-2">
        <div className="flex items-center gap-2">
          <span>{t("common.showRows")} :</span>
          <select
            className="h-8 rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm cursor-pointer hover:bg-muted transition-colors outline-none"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {[5, 10, 25, 50, 100].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-medium text-foreground">
            {startItem} - {endItem} {t("common.of")} {total}
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost" size="icon" className="h-8 w-8"
              onClick={() => setPage(1)} disabled={page === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost" size="icon" className="h-8 w-8"
              onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost" size="icon" className="h-8 w-8"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost" size="icon" className="h-8 w-8"
              onClick={() => setPage(totalPages)} disabled={page >= totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
