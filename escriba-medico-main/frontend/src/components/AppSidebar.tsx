import { User, Settings, BookOpen, Stethoscope, FileText, HelpCircle, Shield, Scale, File, Home } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
export function AppSidebar() {
  const {
    userProfile,
    user
  } = useAuth();
  const navigate = useNavigate();
  const menuItems = [{
    title: 'Inicio',
    icon: Home,
    onClick: () => navigate('/')
  }, {
    title: 'Mis Pacientes',
    icon: User,
    onClick: () => navigate('/profile')
  }, {
    title: 'Plantillas',
    icon: File,
    onClick: () => navigate('/templates')
  }, {
    title: 'Configuración',
    icon: Settings,
    onClick: () => console.log('Configuración clicked')
  }, {
    title: 'Tutoriales',
    icon: BookOpen,
    onClick: () => console.log('Tutoriales clicked')
  }];

  const resourcesItems = [{
    title: 'Documentación',
    icon: FileText,
    onClick: () => console.log('Documentación clicked')
  }, {
    title: 'Soporte Técnico',
    icon: HelpCircle,
    onClick: () => console.log('Soporte Técnico clicked')
  }];

  const legalItems = [{
    title: 'Política de Privacidad',
    icon: Shield,
    onClick: () => console.log('Política de Privacidad clicked')
  }, {
    title: 'Términos de Servicio',
    icon: Scale,
    onClick: () => console.log('Términos de Servicio clicked')
  }];
  return <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">AudioMedic</h2>
            {user && <p className="text-xs text-muted-foreground">
                {user.email}
              </p>}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menú Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton onClick={item.onClick} className="w-full justify-start">
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user && <SidebarGroup>
            <SidebarGroupLabel>Información</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-2 py-1 text-xs text-muted-foreground">
                <p>Email: {user.email}</p>
                {userProfile && <p>Especialidad: {userProfile.especialidad || 'No especificada'}</p>}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>}

        <SidebarGroup>
          <SidebarGroupLabel>Recursos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourcesItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton onClick={item.onClick} className="w-full justify-start">
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Legal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {legalItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton onClick={item.onClick} className="w-full justify-start">
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>;
}