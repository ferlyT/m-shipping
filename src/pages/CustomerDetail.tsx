import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, User, Phone, MapPin, Mail, Building, Briefcase, Hash, StickyNote, Users, ShieldCheck, Truck } from "lucide-react";
import { Customer } from "@/types";
import { LoadingSpinner } from "@/components/LoadingState";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function DataRow({ label, value, icon: Icon, span = 1 }: { label: string; value?: React.ReactNode; icon?: any; span?: number }) {
  return (
    <div className={`space-y-1 ${span === 2 ? 'sm:col-span-2' : ''}`}>
      <p className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </p>
      <div className="text-sm font-medium pt-1.5 flex items-center break-words text-foreground">
        {value === null || value === undefined || value === "" ? <span className="text-muted-foreground/40">-</span> : value}
      </div>
    </div>
  );
}

export default function CustomerDetail() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/customers/${code}`)
      .then((res) => res.json())
      .then((data) => {
        setCustomer(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching customer:", err);
        setLoading(false);
      });
  }, [code]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!customer) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-muted-foreground">Pelanggan tidak ditemukan.</p>
        <Button onClick={() => navigate("/customers")}>Kembali ke Daftar</Button>
      </div>
    );
  }

  // Notif translation
  const getNotifType = (val?: number) => {
    if (val === 1) return "HP";
    if (val === 2) return "Email";
    if (val === 3) return "Kolektor";
    return "";
  }

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20">
      {/* Precision Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 glass p-6 rounded-[24px] shadow-soft sticky top-20 z-10 border border-white/20">
        <div className="flex items-center gap-5">
            <Button variant="outline" size="icon" onClick={() => navigate("/customers")} className="rounded-[12px] bg-white border-none shadow-soft">
                <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="space-y-1">
                <h1 className="display-sm text-on-surface tracking-tight leading-tight">{customer.fdCustName?.trim()}</h1>
                <p className="label-md text-on-surface-variant flex items-center gap-2">
                    <span className="font-mono bg-surface-container-high px-2 py-0.5 rounded text-[10px] font-bold tracking-widest">{customer.fdCustCode?.trim()}</span>
                    <span className="opacity-30">|</span>
                    <span className="italic">Verified Client Account</span>
                </p>
            </div>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="text-right">
                <p className="text-[10px] font-bold uppercase text-on-surface-variant/50 tracking-widest">Last Activity</p>
                <p className="label-md font-bold text-on-surface">
                    {(() => {
                    if (!customer.TglUpdate) return "N/A";
                    const d = new Date(customer.TglUpdate);
                    return isNaN(d.getTime()) ? "N/A" : format(d, "dd MMM yyyy");
                    })()}
                </p>
            </div>
            <div className="w-px h-8 bg-on-surface/10" />
            {customer.fdDiscontinued ? (
                <div className="flex items-center gap-2 label-md font-bold uppercase tracking-widest text-on-surface">
                    <span className="w-2 h-2 rounded-full bg-error" />
                    DISCONTINUED
                </div>
            ) : (
                <div className="flex items-center gap-2 label-md font-bold uppercase tracking-widest text-on-surface">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    ACTIVE ACCOUNT
                </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Essential Registry Data */}
        <div className="lg:col-span-8 space-y-10">
          <Card className="border-none shadow-soft bg-surface-container-lowest overflow-hidden">
            <CardHeader className="bg-surface-container-low/50 pt-8 pb-8 px-10">
              <div className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded-lg">
                    <Building className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="title-md text-on-surface">Organization Identity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-10 px-10 pb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                <DataRow label="Affiliated Group" value={customer.fdGroupName} span={2} />
                <div className="space-y-2">
                    <p className="label-md font-bold uppercase tracking-widest text-on-surface-variant/60">Risk Profile</p>
                    {(() => {
                        const status = customer.Status?.toString().trim().toUpperCase();
                        let colorClass = "text-on-surface-variant"; 
                        let dotClass = "bg-on-surface-variant/40";
                        
                        if (status === "OK") {
                            colorClass = "text-success";
                            dotClass = "bg-success";
                        } else if (status === "COD") {
                            colorClass = "text-primary";
                            dotClass = "bg-primary";
                        } else if (status === "WARNING" || status === "URGENT") {
                            colorClass = "text-warning";
                            dotClass = "bg-warning";
                        } else if (status === "BLOCKED") {
                            colorClass = "text-error";
                            dotClass = "bg-error";
                        }

                        return (
                            <div className={cn("inline-flex items-center gap-2 label-md font-bold uppercase tracking-tight", colorClass)}>
                                <span className={cn("w-2 h-2 rounded-full", dotClass)} />
                                {customer.Status || "NO STATUS"}
                            </div>
                        );
                    })()}
                </div>
                <DataRow 
                  label="Intermediary Status" 
                  value={customer.fdBroker === 1 ? "Registered Broker" : "Standard Direct Account"}
                />
                
                <div className="col-span-2 h-px bg-surface-container-low" />

                <DataRow label="Executive Liaison" value={customer.fdContact} icon={User} />
                <div className="space-y-2">
                    <p className="label-md font-bold uppercase tracking-widest text-on-surface-variant/60">Communication</p>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 label-md font-bold text-on-surface">
                            <Phone className="h-3.5 w-3.5 text-primary" /> {customer.fdHP || "-"}
                        </div>
                        <div className="flex items-center gap-1.5 label-md font-bold text-on-surface">
                            <Mail className="h-3.5 w-3.5 text-primary" /> {customer.fdEmail || "-"}
                        </div>
                    </div>
                </div>

                <DataRow label="Primary Registry Address" value={customer.fdAddr1} icon={MapPin} span={2} />
                
                <div className="col-span-2 p-6 bg-surface-container-low/30 rounded-[16px] border border-surface-container-low">
                    <DataRow label="Internal Strategic Notes" value={customer.fdKeterangan || customer.fdNote} icon={StickyNote} span={2} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logistics & Delivery Profile */}
          <Card className="border-none shadow-soft bg-surface-container-lowest overflow-hidden">
            <CardHeader className="bg-surface-container-low/50 pt-8 pb-8 px-10">
              <div className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded-lg text-white">
                    <Truck className="h-5 w-5" />
                </div>
                <CardTitle className="title-md text-on-surface">Logistics Architecture</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-10 px-10 pb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                <DataRow label="Consignee Name" value={customer.fdNamaPengiriman || customer.fdCustName} />
                <DataRow label="Terminal Contact" value={customer.fdHpPengiriman} />
                <DataRow label="Default Logaddress" value={customer.fdAlamatPengiriman || "Primary Address Baseline"} span={2} />
                <DataRow label="External Carrier" value={customer.fdEks || "N/A"} span={2} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Account Stewardship */}
        <div className="lg:col-span-4 space-y-10">
          <Card className="border-none shadow-soft bg-surface-container-lowest overflow-hidden">
            <CardHeader className="bg-surface-container-low/50 pt-6 pb-6 px-8">
              <CardTitle className="label-md font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" /> Financial Registry
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 px-8 pb-10 space-y-10">
              <div className="space-y-6">
                 <DataRow label="Billing Entity" value={customer.fdBillTo || customer.fdCustName} />
                 <DataRow label="Authorized PIC" value={customer.fdPic} />
                 <DataRow label="Financial Lead" value={customer.Finance || "Strategic Finance Team"} />
                 <DataRow label="Account Executive" value={customer.Sales || "Sales Desk Overseer"} />
              </div>
              
              <div className="pt-8 border-t border-surface-container-low space-y-6">
                <div className="space-y-2">
                    <p className="label-md font-bold uppercase tracking-widest text-on-surface-variant/60">Notification Protocol</p>
                    <div className="bg-surface-container-low px-4 py-2 rounded-xl text-sm font-bold text-on-surface">
                        {getNotifType(customer.fdNotifPenagihan) || "Email Notification Standard"}
                    </div>
                </div>
                <DataRow label="Collector Code" value={customer.fdKodePenagih} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-soft bg-primary text-white p-8">
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 opacity-80" />
                    <p className="label-md font-bold uppercase tracking-widest opacity-80">Security Audit</p>
                </div>
                <p className="body-sm leading-relaxed">Account verified and cleared for logistical operations. Risk assessment remains within acceptable enterprise parameters. Last full synchronization completed within the hour.</p>
                <Button variant="ghost" className="w-full text-white border border-white/20 hover:bg-white/10 rounded-xl font-bold py-6">Authorize Transaction</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

