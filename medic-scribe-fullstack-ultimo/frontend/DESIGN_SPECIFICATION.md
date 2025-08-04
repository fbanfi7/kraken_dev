
# Dashboard Médico - Especificación de Diseño

## Paleta de Colores

### Colores Principales (Light Theme)
- **Background Principal**: `#FFFFFF` (--background: 0 0% 100%)
- **Foreground Principal**: `#020817` (--foreground: 222.2 84% 4.9%)
- **Primario**: `#1E293B` (--primary: 222.2 47.4% 11.2%)
- **Primario Foreground**: `#F8FAFC` (--primary-foreground: 210 40% 98%)

### Colores Secundarios (Light Theme)
- **Card Background**: `#FFFFFF` (--card: 0 0% 100%)
- **Card Foreground**: `#020817` (--card-foreground: 222.2 84% 4.9%)
- **Muted Background**: `#F1F5F9` (--muted: 210 40% 96.1%)
- **Muted Foreground**: `#64748B` (--muted-foreground: 215.4 16.3% 46.9%)
- **Border**: `#E2E8F0` (--border: 214.3 31.8% 91.4%)

### Colores Funcionales
- **Success (Firmado)**: `#16A34A` (Green 600)
- **Success Background**: `#F0FDF4` (Green 50)
- **Success Border**: `#BBF7D0` (Green 200)
- **Destructive**: `#DC2626` (--destructive: 0 84.2% 60.2%)

### Dark Theme
- **Background Principal**: `#020817` (--background: 222.2 84% 4.9%)
- **Foreground Principal**: `#F8FAFC` (--foreground: 210 40% 98%)
- **Card Background**: `#020817` (--card: 222.2 84% 4.9%)
- **Muted Background**: `#1E293B` (--muted: 217.2 32.6% 17.5%)
- **Muted Foreground**: `#94A3B8` (--muted-foreground: 215 20.2% 65.1%)

## Tipografía

### Jerarquía de Texto
- **H1 (Nombre Doctor)**: `text-3xl font-bold` (30px, 700 weight)
- **H2 (Especialidad)**: `text-xl` (20px, 400 weight)
- **H3 (Títulos de Cards)**: `text-lg font-semibold` (18px, 600 weight)
- **Body Large**: `text-base` (16px, 400 weight)
- **Body Medium**: `text-sm` (14px, 400 weight)
- **Body Small**: `text-xs` (12px, 400 weight)
- **Monospace (Tiempo)**: `font-mono font-medium` (Courier/Monaco)

### Colores de Texto
- **Texto Principal**: `text-foreground`
- **Texto Secundario**: `text-muted-foreground`
- **Texto Primario**: `text-primary`
- **Texto Success**: `text-green-700` (Light) / `text-green-300` (Dark)

## Layout Principal

### Container Principal
- **Clase**: `min-h-screen bg-background`
- **Dimensiones**: Full viewport height
- **Background**: Variable según tema
- **Padding**: `p-6` (24px en todos los lados)
- **Max Width**: `max-w-7xl` (1280px)
- **Margin**: `mx-auto` (centrado)

### Grid Layout
- **Clase**: `grid grid-cols-1 lg:grid-cols-3 gap-6`
- **Mobile**: 1 columna
- **Desktop**: 3 columnas (2 para editor, 1 para sidebar)
- **Gap**: `gap-6` (24px entre elementos)

## Header Section

### Container del Header
- **Clase**: `flex justify-between items-start mb-6`
- **Layout**: Flexbox con justificación entre elementos
- **Margin Bottom**: `mb-6` (24px)

### Información del Doctor
- **Container**: `space-y-2` (8px vertical spacing)
- **Nombre**: 
  - Tipografía: `text-3xl font-bold text-foreground`
  - Color: Variable según tema
- **Especialidad**:
  - Tipografía: `text-xl text-muted-foreground`
  - Color: Texto secundario
- **Fecha/Hora Container**: `flex items-center gap-4 text-sm text-muted-foreground`
  - Gap: `gap-4` (16px entre elementos)
  - Tamaño texto: `text-sm` (14px)

### Panel Derecho Header
- **Container**: `flex items-center gap-4`
- **Gap**: `gap-4` (16px entre elementos)

### Métrica de Procesamiento
- **Card Container**: `p-3 bg-primary/5 border-primary/20 px-[35px]`
- **Background**: Primary color con 5% opacidad
- **Border**: Primary color con 20% opacidad
- **Padding**: 12px vertical, 35px horizontal
- **Content Layout**: `flex items-center gap-2`

### Toggle de Tema
- **Button**: `w-9 h-9 p-0 variant-outline size-sm`
- **Dimensiones**: 36x36px
- **Variant**: Outline style
- **Icon Size**: `w-4 h-4` (16x16px)

## Editor de Transcripción

### Card Principal
- **Clase**: `h-fit rounded-lg border bg-card text-card-foreground shadow-sm`
- **Border Radius**: `rounded-lg` (8px)
- **Background**: Variable según tema
- **Shadow**: Sombra suave

### Header del Editor
- **Container**: `pb-4 p-6`
- **Layout**: `flex justify-between items-center`
- **Título**: `text-xl font-semibold` (20px, 600 weight)

### Toolbar de Edición
- **Container**: `flex gap-1 p-2 bg-muted rounded-lg`
- **Background**: Color muted
- **Padding**: `p-2` (8px)
- **Border Radius**: `rounded-lg` (8px)
- **Buttons**: `h-8 w-8 p-0 variant-ghost`
  - Dimensiones: 32x32px cada botón
  - Icons: 16x16px

### Secciones de Transcripción
- **Card Container**: `border-l-4 border-l-primary/30`
- **Border Left**: 4px primary con 30% opacidad
- **Header**: `pb-2 p-6`
- **Título Sección**: `text-base font-semibold text-primary`
- **Content**: `p-3 rounded-md min-h-[60px]`
- **Content Hover**: `hover:bg-muted/50 transition-colors`

### Botones de Acción
- **Container**: `flex gap-2`
- **Guardar**: `variant-outline size-sm`
- **Firmar**: `bg-green-600 hover:bg-green-700 size-sm`
- **Gap**: `gap-2` (8px entre botones)

## Sidebar Components

### Card Base para Sidebar
- **Container**: `rounded-lg border bg-card text-card-foreground shadow-sm`
- **Header**: `pb-3 p-6`
- **Content**: `space-y-3 p-6 pt-0`

### Próximos Pacientes
- **Título**: `text-lg font-semibold flex items-center gap-2`
- **Icon**: `w-5 h-5 text-primary` (20x20px)
- **Item Container**: `flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50`
- **Avatar Circle**: `w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center`
- **Avatar Icon**: `w-4 h-4 text-primary`

### Historial de Pacientes
- **Similar structure to Próximos Pacientes**
- **Status Indicator**: `flex items-center gap-1`
- **Success Icon**: `w-3 h-3 text-green-600`
- **Background**: `bg-muted/20` para items completados

## Responsive Breakpoints

### Mobile (< 1024px)
- **Grid**: `grid-cols-1` (columna única)
- **Header**: Stack vertical en móvil
- **Sidebar**: Aparece debajo del editor

### Desktop (≥ 1024px)
- **Grid**: `lg:grid-cols-3` (3 columnas)
- **Editor**: `lg:col-span-2` (ocupa 2 columnas)
- **Sidebar**: Ocupa 1 columna

## Estados Interactivos

### Hover States
- **Buttons**: `hover:bg-accent hover:text-accent-foreground`
- **Cards**: `hover:bg-muted/50 transition-colors`
- **Links**: Transición suave de colores

### Focus States
- **Inputs**: `focus-visible:ring-2 focus-visible:ring-ring`
- **Buttons**: Ring de enfoque visible

### Disabled States
- **Opacity**: `disabled:opacity-50`
- **Pointer**: `disabled:pointer-events-none`

## Animaciones y Transiciones

### Transiciones Base
- **Colors**: `transition-colors duration-300`
- **Transform**: `transition-transform duration-200`
- **Hover Scale**: `hover:scale-105`

### Estados de Carga
- **Skeleton**: Background con animación pulse
- **Loading States**: Indicadores de progreso

## Spacing System

### Padding/Margin Scale
- **xs**: `1` (4px)
- **sm**: `2` (8px)
- **md**: `3` (12px)
- **lg**: `4` (16px)
- **xl**: `6` (24px)
- **2xl**: `8` (32px)

### Gap System
- **Small**: `gap-1` (4px)
- **Medium**: `gap-2` (8px)
- **Large**: `gap-4` (16px)
- **XLarge**: `gap-6` (24px)

## Implementación en Figma

### Componentes a Crear
1. **Color Styles**: Definir todos los colores de la paleta
2. **Text Styles**: Crear estilos para cada nivel de tipografía
3. **Component Library**: 
   - Button variants
   - Card components
   - Input fields
   - Icons set
4. **Layout Grids**: 
   - Mobile grid (1 column)
   - Desktop grid (3 columns)
5. **Auto Layout**: Usar para containers flexibles

### Naming Convention
- **Colors**: `Light/Primary`, `Dark/Primary`, etc.
- **Text**: `H1/Bold`, `Body/Regular`, `Caption/Medium`
- **Components**: `Button/Primary`, `Card/Default`, `Input/Default`

### Mobile Considerations
- **Touch Targets**: Mínimo 44px para elementos interactivos
- **Viewport**: Diseñar para 375px (iPhone SE) como base
- **Safe Areas**: Considerar notch y áreas seguras
- **Navigation**: Optimizar para navegación con pulgar

Esta especificación te permitirá recrear exactamente el dashboard en Figma y posteriormente implementarlo como app Android manteniendo la consistencia visual y la usabilidad.
