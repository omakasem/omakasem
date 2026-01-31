import AppSidebar from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card } from "@/components/ui/card";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="p-2 pl-0">
        <Card className="flex flex-1 flex-col rounded-2xl border border-border overflow-hidden">
          <main className="flex flex-1 flex-col">{children}</main>
        </Card>
      </SidebarInset>
    </SidebarProvider>
  );
}
