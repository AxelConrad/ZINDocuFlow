
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { FileText, Upload, Home, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User as UserEntity } from "@/api/entities";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: Home,
  },
  {
    title: "Dokument hochladen", 
    url: createPageUrl("Upload"),
    icon: Upload,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await UserEntity.me();
      setUser(currentUser);
    } catch (error) {
      // User nicht eingeloggt
    }
  };

  const handleLogout = async () => {
    await UserEntity.logout();
  };

  return (
    <SidebarProvider>
      <style>
        {`
          :root {
            --primary-blue: #1e40af;
            --primary-blue-dark: #1e3a8a;
            --secondary-gray: #f8fafc;
            --text-primary: #0f172a;
            --text-secondary: #64748b;
            --border-color: #e2e8f0;
          }
        `}
      </style>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar className="border-r border-slate-200">
          <SidebarHeader className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">DocuFlow</h2>
                <p className="text-sm text-slate-500">Dokumenten-Management</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg mb-1 ${
                          location.pathname === item.url ? 'bg-blue-100 text-blue-800 font-semibold' : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-3">
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-2xl font-bold text-slate-900 hidden md:block">
                {currentPageName === "Dashboard" && "Dokumenten-Übersicht"}
                {currentPageName === "Upload" && "Dokument hochladen"}
              </h1>
            </div>
            
            {user && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg">
                  <User className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">{user.full_name}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                >
                  <LogOut className="w-4 h-4" />
                  Abmelden
                </Button>
              </div>
            )}
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
