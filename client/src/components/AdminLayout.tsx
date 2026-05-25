import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useSettings } from "@/contexts/SettingsContext";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Palette,
  LogOut,
  AlertCircle,
  Menu,
  X,
  Home,
  ChevronLeft,
  ExternalLink,
  Image,
  MessageSquare,
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const navItems = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, section: "GENERAL" },
  { href: "/admin/produits", label: "Produits", icon: Package, section: "GENERAL" },
  { href: "/admin/categories", label: "Categories", icon: FolderTree, section: "GENERAL" },
  { href: "/admin/commandes", label: "Commandes", icon: ShoppingCart, section: "GENERAL" },
  { href: "/admin/clients", label: "Clients", icon: Users, section: "GENERAL" },
  { href: "/admin/statistiques", label: "Statistiques", icon: BarChart3, section: "OUTILS" },
  { href: "/admin/marketing", label: "Marketing", icon: MessageSquare, section: "OUTILS" },
  { href: "/admin/liens-affilies", label: "Liens Affiliés", icon: ExternalLink, section: "MONÉTISATION" },
  { href: "/admin/bannieres-pub", label: "Bannières Pub", icon: Image, section: "MONÉTISATION" },
  { href: "/admin/apparence", label: "Apparence", icon: Palette, section: "OUTILS" },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings, section: "SUPPORT" },
];

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const settings = useSettings();
  const { user, loading, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const logout = trpc.auth.logout.useMutation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout.mutateAsync();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E5A8E]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-lg">Accès Administrateur</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-500">
              Vous devez être connecté pour accéder au dashboard administrateur.
            </p>
            <Button asChild className="w-full bg-[#1E5A8E] hover:bg-[#0D3B0D] text-white">
              <Link href="/yamanetech/login">Se connecter</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user?.role !== "admin") {
    const handleLogoutAndRedirect = async () => {
      await logout.mutateAsync();
      window.location.href = "/yamanetech/login";
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full border-red-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-red-600 flex items-center justify-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5" />
              Accès Refusé
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-500">
              Vous n'avez pas les permissions nécessaires.
            </p>
            <p className="text-xs text-gray-400">
              Connecté en tant que: <strong>{user?.email}</strong>
            </p>
            <div className="space-y-2">
              <Button onClick={handleLogoutAndRedirect} className="w-full bg-[#1E5A8E] hover:bg-[#0D3B0D] text-white">
                <LogOut className="h-4 w-4 mr-2" />
                Se déconnecter et se reconnecter
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Retour à l'accueil</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sections = Array.from(new Set(navItems.map((item) => item.section)));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-64 bg-white border-r flex flex-col transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar header */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <Link href="/admin">
            <div className="flex items-center gap-2 cursor-pointer">
              <img
                src={settings.logoUrl}
                alt={settings.shopName}
                className="h-8 w-auto"
              />
              <div>
                <p className="text-sm font-bold text-gray-800 leading-tight">Jappandal</p>
                <p className="text-[10px] text-gray-400 leading-tight">Admin Panel</p>
              </div>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {sections.map((section) => (
            <div key={section} className="mb-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">
                {section}
              </p>
              {navItems
                .filter((item) => item.section === section)
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 cursor-pointer ${
                          isActive
                            ? "bg-[#1E5A8E] text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        {item.label}
                      </div>
                    </Link>
                  );
                })}
            </div>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t p-3">
          <Link href="/">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 cursor-pointer mb-2">
              <Home className="h-4 w-4" />
              Voir la boutique
            </div>
          </Link>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-[#1E5A8E] flex items-center justify-center text-white text-xs font-bold">
              {user.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">{user.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              title="Déconnexion"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b flex items-center px-4 lg:px-6 gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-base lg:text-lg font-bold text-gray-800 truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs text-gray-400 truncate hidden sm:block">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="outline" size="sm" className="hidden sm:flex text-xs gap-1">
                <ChevronLeft className="h-3 w-3" />
                Boutique
              </Button>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
