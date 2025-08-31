"use client";

import { useState, useEffect } from "react";
import { Button } from "@/ui/button";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider, 
  SidebarInset, 
  SidebarTrigger,
  SidebarGroup 
} from "@/ui/sidebar";
import { Separator } from "@/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/ui/breadcrumb";
import { IndividualFundsView } from "./IndividualFundsView";
import { GroupAccountsView } from "./GroupAccountsView";
import { AccountOverview } from "./AccountOverview";
import { AccountSettings } from "./AccountSettings";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  Settings, 
  User, 
  Bell, 
  LogOut 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useWeb3Auth, useWeb3AuthDisconnect, useWeb3AuthUser } from "@web3auth/modal/react";

const navigationItems = [
  {
    title: "Resumen",
    icon: LayoutDashboard,
    id: "overview",
  },
  {
    title: "Fondos Individuales",
    icon: TrendingUp,
    id: "individual",
  },
  {
    title: "Cuentas Grupales", 
    icon: Users,
    id: "group",
  },
  {
    title: "Configuración",
    icon: Settings,
    id: "settings",
  },
];

export function Dashboard() {
  const { status } = useWeb3Auth();
  const { disconnect } = useWeb3AuthDisconnect();
  const router = useRouter();
  const [activeView, setActiveView] = useState("overview");
  const { getUserInfo } = useWeb3AuthUser();
  const [displayName, setDisplayName] = useState<string>("");
  const getCurrentPageTitle = () => {
    const currentItem = navigationItems.find(item => item.id === activeView);
    return currentItem?.title || "Resumen";
  };

  useEffect(() => {
  if (status === "disconnected") router.replace("/");
  }, [status, router]);

  const handleLogout = async () => {
    await disconnect();
    router.push("/");
  };
  const renderContent = () => {
    switch (activeView) {
      case "overview":
        return <AccountOverview />;
      case "individual":
        return <IndividualFundsView />;
      case "group":
        return <GroupAccountsView />;
      case "settings":
        return <AccountSettings />;
      default:
        return <AccountOverview />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border">
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <TrendingUp className="h-4 w-4" />
              </div>
              <span className="font-semibold">COPERACHA</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => setActiveView(item.id)}
                      isActive={activeView === item.id}
                      className="w-full"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>{getCurrentPageTitle()}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="ml-auto flex items-center gap-2 px-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <User className="h-4 w-4" />
                </div>
                <span className="text-sm">Juan Pérez</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} title="Salir">
                <LogOut className="h-4 w-4" />
              </Button>

            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}