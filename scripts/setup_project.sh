#  Project Setup Script

# The setup_project.sh script:
# 	•	Initializes a Next.js project (smartforms) with TypeScript.
# 	•	Installs essential dependencies, including:
# 	•	Tailwind CSS (styling)
# 	•	Zustand (state management)
# 	•	DndKit (drag-and-drop)
# 	•	Material UI & Icons
# 	•	React Hook Form (form validation)
# 	•	NextAuth.js & AWS Amplify Auth (for authentication)
# 	•	Configures Tailwind CSS for styling.
# 	•	Creates a modular project structure, including:
# 	•	components/form-builder/ (Canvas, Sidebar, Properties, Preview)
# 	•	components/ui/ (Navbar, Button, Modal)
# 	•	hooks/ (useAuth.ts, useStorage.ts)
# 	•	store/ (formStore.ts)
# 	•	api/ (formApi.ts)
# 	•	config/ (appConfig.ts)
# 	•	utils/ (helpers.ts)
# 	•	README.md (project documentation)
# 	•	Instructions to start development (npm run dev).


#!/bin/bash

# Set up Next.js project
cd ..
echo "Initializing Next.js project..."
npx create-next-app@latest smartforms --typescript --use-npm
cd smartforms || exit

echo "Installing dependencies..."
npm install tailwindcss postcss autoprefixer zustand @dnd-kit/core @dnd-kit/sortable @mui/material @mui/icons-material react-icons react-hook-form axios next-auth @aws-amplify/auth aws-amplify

echo "Configuring Tailwind CSS..."
npx tailwindcss init -p

# Modify tailwind.config.js to enable JIT mode
cat > tailwind.config.js <<EOL
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
EOL

# Setup global styles
echo "Creating global styles..."
mkdir -p styles
cat > styles/globals.css <<EOL
@tailwind base;
@tailwind components;
@tailwind utilities;
EOL

# Create project structure
echo "Creating project directories..."
mkdir -p public pages components/form-builder components/ui hooks store api styles config utils

echo "Creating placeholder files..."
touch components/form-builder/{Canvas.tsx,Sidebar.tsx,Properties.tsx,Preview.tsx}
touch components/ui/{Navbar.tsx,Button.tsx,Modal.tsx}
touch hooks/{useAuth.ts,useStorage.ts}
touch store/formStore.ts
touch api/formApi.ts
touch styles/global.css
touch config/appConfig.ts
touch utils/helpers.ts
touch README.md

echo "Project setup complete!"
echo "Run the following commands to start development:"
echo "cd smartforms"
echo "npm run dev"
