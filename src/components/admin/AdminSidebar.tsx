import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building, 
  Settings, 
  UserPlus
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import logoImage from '@/assets/logo-pdpi.png';

const menuItems = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: LayoutDashboard,
    roles: ['ADMIN_PUSAT', 'ADMIN_CABANG']
  },
  {
    title: 'Manajemen Anggota',
    url: '/admin/anggota',
    icon: Users,
    roles: ['ADMIN_PUSAT', 'ADMIN_CABANG']
  },
  {
    title: 'Tambah Anggota',
    url: '/admin/anggota/new',
    icon: UserPlus,
    roles: ['ADMIN_PUSAT', 'ADMIN_CABANG']
  },
  {
    title: 'Manajemen Cabang',
    url: '/admin/cabang',
    icon: Building,
    roles: ['ADMIN_PUSAT']
  },
  {
    title: 'Pengaturan',
    url: '/admin/settings',
    icon: Settings,
    roles: ['ADMIN_PUSAT', 'ADMIN_CABANG']
  },
];

export const AdminSidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const { hasRole } = useAuth();
  const currentPath = location.pathname;
  
  const isCollapsed = state === 'collapsed';

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary' : 'hover:bg-muted/50';

  const filteredMenuItems = menuItems.filter(item => 
    hasRole(item.roles)
  );

  return (
    <Sidebar className={isCollapsed ? 'w-14' : 'w-64'} collapsible="icon">
      <SidebarContent>
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full overflow-hidden bg-white shadow-sm border">
              <img 
                src={logoImage} 
                alt="PDPI Logo" 
                className="h-8 w-8 object-contain"
              />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-lg">Admin Panel</h2>
                <p className="text-sm text-muted-foreground">PDPI Directory</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? 'sr-only' : ''}>
            Menu Utama
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/admin'}
                      className={getNavCls}
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};