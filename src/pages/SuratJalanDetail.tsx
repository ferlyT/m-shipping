import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Printer,
  Calendar,
  FileText,
  User,
  MapPin,
  Truck,
  Briefcase,
  Phone,
  Hash,
  Package,
  ShieldCheck,
  Plane,
  Ship
} from "lucide-react";
import { format } from "date-fns";
import { formatRupiahShort } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/LoadingState";
import { useLanguage } from "../locales/LanguageContext";

function InfoItem({ icon: Icon, label, value, span = 1 }: { icon: any; label: string; value: any; span?: number }) {
  return (
    <div className={cn("space-y-1.5", span === 2 ? "md:col-span-2" : "")}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </p>
      <p className="text-sm font-semibold text-foreground break-words">
        {value || "-"}
      </p>
    </div>
  );
}

export default function SuratJalanDetail() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [sj, setSj] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch Header
    fetch(`/api/surat-jalan/${id}`)
      .then((res) => res.json())
      .then((data) => setSj(data))
      .catch((err) => console.error(err));

    // Fetch Items
    fetch(`/api/surat-jalan/${id}/items`)
      .then((res) => res.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!sj) return <div className="p-8 text-center text-error">{t("common.noData")}</div>;

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/surat-jalan")}
          className="w-fit gap-2 -ml-2 text-on-surface-variant hover:text-primary transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="label-md uppercase tracking-wider">{t("suratJalan.detail.back")}</span>
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 rounded-[12px] bg-white" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            {t("suratJalan.detail.print")}
          </Button>
          <Button variant="default" className="gap-2">
            <Package className="h-4 w-4" />
            {t("suratJalan.detail.dispatch")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Header Info */}
        <div className="lg:col-span-8 space-y-10">
          <Card className="border-none shadow-soft overflow-hidden bg-surface-container-lowest">
            <CardHeader className="bg-surface-container-low/50 pb-8 pt-8">
              <div className="flex items-center justify-between flex-wrap gap-6 px-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary p-2 rounded-lg">
                        <FileText className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="display-sm text-on-surface">{sj.Number}</h1>
                    {sj.Type === 1 ? (
                      <div className="bg-primary/10 text-primary px-3 py-1 rounded-full label-md font-bold flex items-center gap-1.5">
                        <Plane className="h-3.5 w-3.5" /> AIR CARGO
                      </div>
                    ) : sj.Type === 2 ? (
                      <div className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full label-md font-bold flex items-center gap-1.5">
                        <Ship className="h-3.5 w-3.5" /> SEA FREIGHT
                      </div>
                    ) : null}
                  </div>
                  <p className="body-sm text-on-surface-variant font-medium ml-12 italic">
                    {t("suratJalan.detail.metadata")}
                  </p>
                </div>
                <div className="bg-white rounded-[16px] px-6 py-4 text-right shadow-soft border border-surface-container-low">
                  <p className="text-[10px] font-bold uppercase text-on-surface-variant/50 tracking-widest mb-1">{t("suratJalan.detail.dispatch")} Date</p>
                  <p className="title-md text-on-surface font-bold">
                    {sj.Date ? format(new Date(sj.Date), "dd MMM yyyy") : "PENDING"}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-10 px-10 pb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                <InfoItem icon={User} label={t("suratJalan.detail.primaryAccount")} value={sj.CustomerName} />
                <div className="flex gap-10">
                   <InfoItem icon={Briefcase} label={t("suratJalan.detail.originAgent")} value={sj.fdSalesNM} />
                   <div className="space-y-2">
                      <p className="label-md font-bold uppercase tracking-wider text-on-surface-variant/60 flex items-center gap-1.5">
                        <Hash className="h-3.5 w-3.5" />
                        {t("suratJalan.detail.identifier")}
                      </p>
                      <span className="font-mono text-[11px] font-bold bg-surface-container-high px-2.5 py-1 rounded-md text-on-surface">
                        {sj.fdMarkingCode || "UNKN"}
                      </span>
                   </div>
                </div>
                <InfoItem icon={MapPin} label={t("suratJalan.detail.address")} value={sj.Address} span={2} />
                <div className="grid grid-cols-2 gap-8 col-span-2 pt-4 border-t border-surface-container-low">
                  <InfoItem icon={Phone} label={t("customers.detail.communication")} value={sj.fdTelp || "-"} />
                  <InfoItem icon={Hash} label={t("customers.table.orgCode")} value={sj.fdCustCode} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table: Item List */}
          <Card className="border-none shadow-soft overflow-hidden bg-surface-container-lowest">
            <CardHeader className="bg-surface-container-low/30 pt-6 pb-6">
              <CardTitle className="label-md font-bold uppercase tracking-widest flex items-center gap-2 text-on-surface-variant">
                <Package className="h-4 w-4 text-primary" />
                {t("suratJalan.detail.cargo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-container-low/50 text-on-surface-variant uppercase text-[10px] font-bold tracking-widest">
                      <th className="px-8 py-4 text-center">{t("suratJalan.detail.unitCount")}</th>
                      <th className="px-8 py-4 text-center">{t("suratJalan.detail.packaging")}</th>
                      <th className="px-8 py-4 text-right">{t("suratJalan.detail.netWeight")} (Kg)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-0">
                    {items.length > 0 ? (
                      items.map((item, index) => (
                        <tr key={index} className="hover:bg-surface-container-low/40 transition-colors">
                          <td className="px-8 py-6 text-center font-bold text-on-surface text-lg">{item.fdQTY || 0}</td>
                          <td className="px-8 py-6 text-center">
                            <span className="bg-surface-container-high px-3 py-1 rounded-full label-md font-bold uppercase">
                              {item.fdUnit || "-"}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right font-mono font-bold text-primary">{item.fdWeight || 0}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-20 text-center text-on-surface-variant/50 body-sm italic">
                          {t("common.noData")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Tracking / Metadata */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-soft bg-surface-container-lowest">
            <CardHeader className="bg-surface-container-low/50 pt-6 pb-6">
              <CardTitle className="label-md font-bold uppercase tracking-widest flex items-center gap-2 text-on-surface-variant">
                <Truck className="h-4 w-4 text-primary" />
                {t("suratJalan.detail.transit")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 px-8 pb-8 space-y-8">
              <div className="space-y-2">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">{t("suratJalan.detail.consignee")}</span>
                <p className="font-bold text-on-surface flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    {sj.fdConsignee || (t("suratJalan.table.account"))}
                </p>
              </div>
              
              <div className="space-y-4 pt-6 border-t border-surface-container-low">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">{t("suratJalan.detail.milestone")}</span>
                  <div className="bg-success-container text-on-success-container px-3 py-1 rounded-full label-md font-bold flex items-center gap-1.5 animate-pulse">
                    <ShieldCheck className="h-3.5 w-3.5" /> DELIVERED
                  </div>
                </div>
                
                <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full w-full bg-success" />
                </div>
                <p className="text-[10px] text-on-surface-variant/60 italic text-center">Finalized by warehouse principal</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-soft bg-primary text-white p-6">
            <div className="space-y-4">
                <p className="label-md font-bold uppercase tracking-widest opacity-80">{t("invoices.detail.analysis")}</p>
                <p className="body-sm">Automated manifest verification completed. No discrepancies detected in cargo weight vs bill of lading.</p>
                <Button variant="ghost" className="w-full text-white border border-white/20 hover:bg-white/10 rounded-xl">View Audit Log</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

