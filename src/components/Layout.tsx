import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Users, FileText, Receipt, Menu, X, Layers } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSelector } from "./LanguageSelector";
import { useLanguage } from "../locales/LanguageContext";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { t } = useLanguage();
  const location = useLocation();
  const [open, setOpen] = React.useState(false);

  const navItems = [
    { name: t("common.dashboard"), path: "/", icon: Home },
    { name: t("common.customers"), path: "/customers", icon: Users },
    { name: t("common.suratJalan"), path: "/surat-jalan", icon: FileText },
    { name: t("common.invoices"), path: "/invoices", icon: Receipt },
    { name: t("common.shippingBatches"), path: "/shipping-batches", icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full glass">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
                <Receipt className="h-5 w-5 text-white" />
            </div>
            <span className="title-lg tracking-tight text-on-surface">M-Shipping</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "label-md transition-all hover:text-primary",
                  location.pathname === item.path ? "text-primary scale-105" : "text-on-surface-variant"
                )}
              >
                {item.name}
              </Link>
            ))}
            <div className="ml-4 pl-4 border-l border-on-surface/10 flex items-center gap-4">
                 <LanguageSelector />
                 <ThemeToggle />
            </div>
          </nav>

          {/* Mobile Nav Trigger */}
          <div className="flex items-center gap-3 md:hidden">
            <LanguageSelector />
            <ThemeToggle />
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
                <Menu className="h-6 w-6" />
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0 bg-surface-container-low">
                <div className="flex flex-col h-full">
                    <div className="p-8">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary p-2 rounded-lg">
                                <Receipt className="h-5 w-5 text-white" />
                            </div>
                            <span className="title-lg tracking-tight">M-Shipping</span>
                        </div>
                    </div>
                    <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setOpen(false)}
                        className={cn(
                            "flex items-center gap-4 px-5 py-4 rounded-[12px] label-md transition-all",
                            location.pathname === item.path
                            ? "bg-surface-container-lowest shadow-soft text-primary"
                            : "hover:bg-surface-container-lowest/50 text-on-surface-variant"
                        )}
                        >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                        </Link>
                    ))}
                    </nav>
                </div>
                </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-10 max-w-6xl">
        {children}
      </main>

      {/* Bottom Nav (Mobile Only) - Precision Architect Glass Style */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 z-40 h-16 rounded-[24px] glass shadow-soft flex justify-around items-center px-4 transition-all border border-white/20">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 flex-1 h-full transition-all rounded-xl",
              location.pathname === item.path ? "text-primary bg-primary/5" : "text-on-surface-variant opacity-70"
            )}
          >
            <item.icon className={cn("h-5 w-5", location.pathname === item.path && "stroke-[2.5px]")} />
            <span className="label-md scale-90">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
