import BottomNav from "./BottomNav";

interface Props {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function AdminLayout({ children, title, subtitle, action }: Props) {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-primary px-5 pt-10 pb-5 shadow-card-lg">
        <div className="flex items-start justify-between">
          <div>
            {title && <h1 className="text-2xl font-black text-white tracking-tight">{title}</h1>}
            {subtitle && <p className="text-sm text-white/60 mt-1">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      </div>
      <div className="px-4 pt-5">{children}</div>
      <BottomNav />
    </div>
  );
}
