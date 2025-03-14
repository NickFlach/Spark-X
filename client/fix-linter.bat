@echo off
echo Installing dependencies...
npm install

echo Installing type definitions...
npm install --save-dev @types/react @types/react-dom @types/node

echo Installing UI libraries...
npm install lucide-react wouter @tanstack/react-query

echo Creating necessary directories if they don't exist...
if not exist src\types mkdir src\types
if not exist src\contexts mkdir src\contexts
if not exist src\components\ui mkdir src\components\ui
if not exist src\components\layout mkdir src\components\layout
if not exist src\pages\auth mkdir src\pages\auth
if not exist src\pages\ideas mkdir src\pages\ideas
if not exist src\hooks mkdir src\hooks
if not exist src\lib mkdir src\lib

echo Setup complete! You can now run 'npm run dev' to start the development server. 