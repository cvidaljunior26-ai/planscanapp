import { Link, useLocation } from "react-router-dom";
import { Home, Store, Settings, Clock, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/stores", icon: Store, label: "Lojas" },
  { to: "/config", icon: Settings, label: "Config" },
  { to: "/history", icon: Clock, label: "Historico" },
  { to: "/reports", icon: BarChart2, label: "Relatorios" },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 px-4 py-2">
      <div className="flex justify-around max-w-lg mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = pathname === to || (to !== "/" && pathname.startsWith(to));
          return (
            <Link key={to} to={to} className={cn("flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all", active ? "bg-white shadow-card" : "text-muted-foreground")}>
              <Icon className={cn("w-5 h-5", active ? "text-primary" : "text-sub")} />
              <span className={cn("text-[10px] font-bold", active ? "text-primary" : "text-sub")}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
