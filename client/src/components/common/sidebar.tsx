import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, UserCog, FileText, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Sidebar: React.FC = () => {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const routes = [
    {
      name: "Dashboard",
      path: "/",
      icon: <LayoutDashboard className="mr-3 text-xl" />
    },
    {
      name: "My Profile",
      path: "/profile",
      icon: <UserCog className="mr-3 text-xl" />
    },
    {
      name: "Meeting Templates",
      path: "/templates",
      icon: <FileText className="mr-3 text-xl" />
    },
    {
      name: "Create Meeting",
      path: "/create-template",
      icon: <PlusCircle className="mr-3 text-xl" />
    }
  ];

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 pt-16 left-0 transform transition duration-200 ease-in-out z-10 w-64 bg-white border-r border-gray-200 overflow-y-auto md:static",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="py-4 flex flex-col h-full">
          <nav className="mt-5 px-2 space-y-1">
            {routes.map((route) => (
              <Link key={route.path} href={route.path}>
                <a
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    isActive(route.path)
                      ? "bg-primary-50 text-primary-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  onClick={() => setIsMobileOpen(false)}
                >
                  {route.icon}
                  {route.name}
                </a>
              </Link>
            ))}
          </nav>
          
          <div className="mt-auto px-4 py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-1 rounded-full">
                <div className="bg-green-400 h-2 w-2 rounded-full"></div>
              </div>
              <span className="text-xs text-gray-500">All systems operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button - This is part of the Header component, included here for reference */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-3 left-3 z-30"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <span className="text-xl">✕</span>
        ) : (
          <span className="text-xl">☰</span>
        )}
      </Button>
    </>
  );
};
