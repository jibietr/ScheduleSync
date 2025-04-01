import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export const Header: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch the current user (in a real app, this would be based on authentication)
  const { data: user } = useQuery({
    queryKey: ["/api/user/1"],
  });

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="flex items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <span className="text-primary-600 text-xl font-bold">Schedulr</span>
          </div>
        </div>
        
        {/* User menu */}
        <div className="ml-4 flex items-center md:ml-6">
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0 flex items-center gap-x-2 text-sm rounded-full">
                <span className="hidden md:block text-sm text-gray-700">
                  {user ? `${user.firstName} ${user.lastName}` : 'Jane Smith'}
                </span>
                <Avatar className="h-8 w-8 rounded-full">
                  <AvatarImage 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                    alt="User profile" 
                  />
                  <AvatarFallback>
                    {user ? `${user.firstName[0]}${user.lastName[0]}` : 'JS'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-md py-1 bg-white ring-1 ring-black ring-opacity-5">
              <DropdownMenuItem className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100">
                Your Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100">
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100">
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
