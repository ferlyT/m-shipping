import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, FileText, Calendar, User, CheckCircle2, Clock } from "lucide-react";
import { SuratJalan } from "@/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function SuratJalanPage() {
  const [search, setSearch] = React.useState("");
  const [items, setItems] = React.useState<SuratJalan[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/surat-jalan")
      .then((res) => res.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredItems = items.filter((item) =>
    item.Number.toLowerCase().includes(search.toLowerCase()) ||
    item.CustomerName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Surat Jalan</h1>
          <p className="text-muted-foreground text-sm">Lihat data pengiriman barang Anda.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari nomor SJ atau customer..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Memuat data...</div>
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <Card key={item.Id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold leading-none">{item.Number}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <User className="h-3 w-3" />
                        <span>{item.CustomerName}</span>
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={item.Status === 'Completed' ? 'default' : 'secondary'}
                    className="text-[10px]"
                  >
                    {item.Status === 'Completed' ? (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    ) : (
                      <Clock className="h-3 w-3 mr-1" />
                    )}
                    {item.Status}
                  </Badge>
                </div>
                
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{format(new Date(item.Date), "dd MMM yyyy")}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 text-xs">Detail</Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-10 bg-white rounded-lg border border-dashed">
            <p className="text-muted-foreground">Tidak ada surat jalan ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
