import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { NotificationBell } from '@/components/admin/NotificationBell';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const AdminHeader = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN_PUSAT':
        return 'Admin Pusat';
      case 'ADMIN_CABANG':
        return 'Admin Cabang';
      default:
        return role;
    }
  };

  return (
    <header className="h-14 md:h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-3 md:px-6 gap-2">
        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
          <SidebarTrigger className="h-7 w-7 md:h-8 md:w-8 flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-base md:text-lg font-semibold truncate">Panel Admin</h1>
            <p className="text-xs md:text-sm text-muted-foreground truncate hidden sm:block">
              {profile && getRoleDisplayName(profile.role)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
          <NotificationBell />
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 md:h-10 md:w-10 rounded-full">
                <Avatar className="h-8 w-8 md:h-10 md:w-10">
                  <AvatarFallback className="text-xs md:text-sm">
                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {profile && getRoleDisplayName(profile.role)}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Keluar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};