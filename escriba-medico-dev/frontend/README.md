# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/869f4034-792d-419e-b879-7a9dc0c75f8b

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/869f4034-792d-419e-b879-7a9dc0c75f8b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- **Vite** - Build tool and development server
- **TypeScript** - Type-safe JavaScript
- **React** - UI framework
- **shadcn-ui** - UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Backend as a Service (database, auth, real-time)
- **PWA** - Progressive Web App capabilities

## PWA Features

The application is configured as a Progressive Web App (PWA) with automatic updates using vite-plugin-pwa:

### Auto-Update Configuration
- Uses `vite-plugin-pwa` with `registerType: 'autoUpdate'`
- Automatically checks for updates when the app is opened
- Shows confirmation dialog when new version is available
- Updates happen seamlessly without user intervention after confirmation

### Installation
Users can install the app on their devices through:
- Browser install prompts
- Manual installation via browser menu
- "Add to Home Screen" on mobile devices

### Configuration Files
- `vite.config.ts` - PWA configuration with manifest and service worker settings
- `src/main.tsx` - Service worker registration with update handling
- `src/hooks/usePWA.ts` - Custom hook for PWA installation management (legacy)
- `src/components/PWAInstallPrompt.tsx` - Install prompt component (legacy)

### Metadata
The PWA is configured with:
- App name: "Scribe Dash Review - Medical Notes Management"
- Short name: "ScribeDash" 
- Theme color: #2563eb (blue)
- Background color: #ffffff (white)
- Display mode: standalone
- Orientation: portrait

### Installation Instructions
1. **Desktop**: Visit the app in Chrome/Edge and look for the install button in the address bar
2. **Mobile**: Use "Add to Home Screen" from the browser menu
3. **Progressive Enhancement**: The app works in browsers even without installation

### Update Process
1. When a new version is deployed, the service worker detects the change
2. User gets a confirmation dialog: "Nueva versión disponible. ¿Recargar para actualizar?"
3. If confirmed, the app automatically updates and reloads
4. Updates are applied immediately without manual intervention

### Development Notes
- Service worker registration includes update management
- PWA features work in both development and production
- Uses modern PWA standards with Workbox integration

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/869f4034-792d-419e-b879-7a9dc0c75f8b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
