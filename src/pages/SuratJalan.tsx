import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, Calendar, User, Plane, Ship, Eye, Hash, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingState";
import { format } from "date-fns";
import { useLanguage } from "../locales/LanguageContext";

interface SuratJalanItem {
  Number: string;
  Date: string;
  CustomerName: string;
  Type: number;
  fdMarkingCode: string;
}

export default function SuratJalanPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [search, setSearch] = React.useState("");
  const [items, setItems] = React.useState<SuratJalanItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  // Pagination & Sorting State
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [total, setTotal] = React.useState(0);
  const [sortBy, setSortBy] = React.useState("Date");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  const totalPages = Math.ceil(total / pageSize) || 1;

  React.useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      search,
      sortBy,
      sortOrder,
    });

    fetch(`/api/surat-jalan?${params}`)
      .then((res) => res.json())
      .then((res) => {
        setItems(res.data || []);
        setTotal(res.total || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching Surat Jalan:", err);
        setItems([]);
        setTotal(0);
        setLoading(false);
      });
  }, [page, pageSize, search, sortBy, sortOrder]);

  // Reset page when search changes
  React.useEffect(() => {
    setPage(1);
  }, [search]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortBy(field);
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <ChevronsUpDown className="ml-1 h-3 w-3 opacity-30 inline" />;
    return sortOrder === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4 text-primary inline" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4 text-primary inline" />
    );
  };

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div className="space-y-4 pb-6 px-1">
      <div className="flex flex-col gap-0.5">
        <h1 className="display-sm text-on-surface">{t("suratJalan.title")}</h1>
        <p className="body-sm text-on-surface-variant italic">{t("suratJalan.subtitle")}</p>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3 w-3 text-on-surface-variant/50 group-focus-within:text-primary transition-colors" />
        <Input
          placeholder={t("suratJalan.searchPlaceholder")}
          className="pl-11 h-9 text-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="border-none shadow-soft overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] font-bold tracking-[0.1em]">
                <th 
                  onClick={() => handleSort("Number")}
                  className="px-4 py-3 text-left cursor-pointer hover:text-primary transition-colors"
                >
                   {t("suratJalan.table.id")} <SortIcon field="Number" />
                </th>
                <th
                  onClick={() => handleSort("Date")}
                  className="px-4 py-3 text-left cursor-pointer hover:text-primary transition-colors"
                >
                   {t("suratJalan.table.date")} <SortIcon field="Date" />
                </th>
                <th
                  onClick={() => handleSort("Type")}
                  className="px-4 py-3 text-left cursor-pointer hover:text-primary transition-colors"
                >
                   {t("suratJalan.table.mode")} <SortIcon field="Type" />
                </th>
                <th
                  onClick={() => handleSort("CustomerName")}
                  className="px-4 py-3 text-left cursor-pointer hover:text-primary transition-colors"
                >
                   {t("suratJalan.table.account")} <SortIcon field="CustomerName" />
                </th>
                <th className="px-4 py-3 text-left">{t("suratJalan.table.marking")}</th>
                <th className="px-4 py-3 text-right">{t("common.actions")}</th>
              </tr>
            </thead>

            <tbody className="divide-y-0">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : items.length > 0 ? (
                items.map((item, i) => (
                  <tr key={item.Number || i} className="group transition-colors hover:bg-surface-container-low/40">
                    <td className="px-4 py-3">
                        <span className="font-mono text-[10px] font-bold text-on-surface-variant bg-surface-container-low px-2 py-1 rounded-md">
                            {item.Number?.trim()}
                        </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-on-surface-variant font-medium">
                         {item.Date ? format(new Date(item.Date), "dd MMM yyyy") : "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {item.Type === 1 ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container text-primary label-md font-bold uppercase tracking-tight">
                          <Plane className="h-3.5 w-3.5" /> AIR
                        </div>
                      ) : item.Type === 2 ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-container text-on-tertiary-container label-md font-bold uppercase tracking-tight">
                          <Ship className="h-3.5 w-3.5" /> SEA
                        </div>
                      ) : (
                        <span className="text-on-surface-variant/30">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                       <div className="flex flex-col">
                          <span className="font-bold text-on-surface">{item.CustomerName}</span>
                          <span className="text-[10px] text-on-surface-variant/70 uppercase tracking-tighter italic">Authorized Carrier</span>
                       </div>
                    </td>
                    <td className="px-4 py-3">
                       <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-primary">
                          {item.fdMarkingCode?.trim() || "-"}
                       </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="h-8 shadow-none"
                        onClick={() => navigate(`/surat-jalan/${item.Number?.toString().trim()}`)}
                      >
                        {t("common.detail")}
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-on-surface-variant/50 body-sm italic">
                    {t("common.noData")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>{t("common.showRows")} :</span>
          <select
            className="h-8 rounded-md border border-input bg-background/50 px-2 py-1 text-sm shadow-sm cursor-pointer hover:bg-muted transition-colors outline-none"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {[5, 10, 25, 50, 100].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-medium text-foreground">
            {startItem} - {endItem} {t("common.of")} {total}
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
