import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, FolderKanban, Users, Settings } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "Home", icon: null },
    { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { path: "/projects", label: "Projects", icon: <FolderKanban className="w-4 h-4" /> },
    { path: "/teams", label: "Teams", icon: <Users className="w-4 h-4" /> },
    { path: "/settings", label: "Settings", icon: <Settings className="w-4 h-4" /> }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-cosmic rounded-lg" />
            <span className="text-xl font-bold bg-gradient-cosmic bg-clip-text text-transparent">
              CollabSpace
            </span>
          </Link>

          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  className={
                    isActive(item.path)
                      ? "bg-primary shadow-glow-primary"
                      : "hover:bg-muted"
                  }
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          <Link to="/signin">
            <Button size="sm" className="bg-primary shadow-glow-primary">
              Login
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
