# 🧠 Medic Scribe - Asistente de Documentación Clínica con IA

Medic Scribe es una aplicación fullstack diseñada para asistir a médicos en la redacción automática de notas clínicas mediante inteligencia artificial. Su objetivo es reducir la carga administrativa y mejorar la calidad de la documentación clínica.

## 🧱 Estructura del Proyecto
   ```bash
medic-scribe-fullstack/
├── backend/
│   └── (código backend: FastAPI, Django, etc.)
├── frontend/
│   └── (código frontend: React, Vite, etc.)
└── README.md
   ```

## ⚙️ Tecnologías Principales

- **Frontend**: React + Vite + TailwindCSS + shadcn-ui (UI component library) + PWA capabilities
- **Backend**: FastAPI + Deepgram API + Python 3.12 + OpenAI API
- **Infraestructura**: Docker, Docker Compose, Nginx
- **Base de datos**: PostgreSQL (Supabase)
- **Autenticación**: En desarrollo (actualmente Supabase Auth, posible cambio a Auth0)

## 👨‍💻 Buenas Prácticas de Trabajo
- Las ramas deben nombrarse usando el formato: feature/nombre, bugfix/nombre, hotfix/nombre.
- Se debe crear un pull request (PR) para todo cambio en main.
- Los commits deben seguir Convencional Commits:
```bash
feat: agrega nueva funcionalidad | fix: corrige bug en login | docs: actualiza README
   ```
- Agregar documentación a nuevos endpoints o módulos implementados.

## 🛠️ Trabajo en Entorno Local
Esta sección describe cómo colaborar correctamente con este repositorio utilizando Git, siguiendo una estrategia básica de ramificación (branching) para mantener el main limpio y estable.

1. Clonar el repositorio
```bash
git clone https://github.com/KrakenMEDs/medic-scribe-fullstack.git
cd medic-scribe-fullstack
```

3. Crear una rama para tu feature o fix

Antes de comenzar a trabajar, creá una rama nueva basada en main. El nombre de la rama debe describir brevemente el objetivo:
```bash
git checkout main
git pull origin main  # Asegurate de tener la última versión
git checkout -b feat/nombre-de-tu-feature
```
Usar git status regularmente para ver los archivos modificados.

4. Guardar cambios (commits)

Una vez que termines un bloque de trabajo coherente, hacé commit con un mensaje claro y conciso:
```bash
git add .
git commit -m "feat: agrega componente de chat con reconocimiento de voz"
```

6. Mantener tu rama sincronizada
   
Antes de subir tu rama, asegurate de que esté actualizada con main:
```bash
git pull origin main --rebase
```
Resolvé los conflictos si aparecen, luego:
```bash
git push origin feat/nombre-de-tu-feature
```

8. Crear un Pull Request
   
Desde GitHub, abrí un Pull Request (PR) hacia la rama main.

En el PR:
- Explicá qué hiciste y por qué.
- Enlazá issues relacionados (si los hay).
- Solicitá revisión si es necesario.
- Una vez aprobado, el PR será mergeado a main.
