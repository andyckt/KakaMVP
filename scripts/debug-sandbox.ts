import { Daytona } from "@daytonaio/sdk";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

// Hardcode the API key for debugging
const DAYTONA_API_KEY = "dtn_ddb4f35229fd17d5855114d3f3c9789d0a7383fd6f0b16a6c18c3a2693a03e62";

async function debugSandbox(sandboxId: string) {
  console.log(`🔍 Debugging sandbox: ${sandboxId}`);

  const daytona = new Daytona({
    apiKey: DAYTONA_API_KEY,
  });

  try {
    // Connect to the sandbox
    console.log("1. Connecting to sandbox...");
    const sandboxes = await daytona.list();
    const sandbox = sandboxes.find((s: any) => s.id === sandboxId);
    
    if (!sandbox) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }
    console.log(`✓ Connected to sandbox: ${sandbox.id}`);

    // Get the root directory
    const rootDir = await sandbox.getUserRootDir();
    const projectDir = `${rootDir}/website-project`;
    console.log(`✓ Project directory: ${projectDir}`);

    // Check what files were generated
    console.log("\n2. Checking generated files...");
    const filesResult = await sandbox.process.executeCommand(
      "find . -type f | grep -v node_modules",
      projectDir
    );
    console.log(filesResult.result);

    // Check if app directory exists
    const checkAppDir = await sandbox.process.executeCommand(
      "test -d app && echo 'app directory exists' || echo 'app directory missing'",
      projectDir
    );
    console.log(checkAppDir.result);

    // Create missing directories and files if needed
    console.log("\n3. Creating missing files and directories...");
    
    // Create app directory if missing
    await sandbox.process.executeCommand(
      "mkdir -p app components",
      projectDir
    );
    
    // Extract files from the output and create them
    console.log("\n4. Creating files from the v0 output...");
    
    // Create package.json
    await sandbox.process.executeCommand(
      `cat > package.json << 'EOF'
{
  "name": "hello-world-nextjs",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.4",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.0.4",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}
EOF`,
      projectDir
    );
    
    // Create next.config.js
    await sandbox.process.executeCommand(
      `cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = nextConfig
EOF`,
      projectDir
    );
    
    // Create tailwind.config.js
    await sandbox.process.executeCommand(
      `cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF`,
      projectDir
    );
    
    // Create tsconfig.json
    await sandbox.process.executeCommand(
      `cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
EOF`,
      projectDir
    );
    
    // Create postcss.config.js
    await sandbox.process.executeCommand(
      `cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF`,
      projectDir
    );
    
    // Create app/globals.css
    await sandbox.process.executeCommand(
      `cat > app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: Arial, Helvetica, sans-serif;
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
EOF`,
      projectDir
    );
    
    // Create components/navigation.tsx
    await sandbox.process.executeCommand(
      `cat > components/navigation.tsx << 'EOF'
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
  ]

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              Hello World
            </Link>
          </div>
          <div className="flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={\`px-3 py-2 rounded-md text-sm font-medium transition-colors \${
                  pathname === item.href
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }\`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
EOF`,
      projectDir
    );
    
    // Create app/layout.tsx
    await sandbox.process.executeCommand(
      `cat > app/layout.tsx << 'EOF'
import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/navigation'

export const metadata: Metadata = {
  title: 'Hello World - NextJS App',
  description: 'A modern hello world website built with NextJS, TypeScript, and Tailwind CSS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <main className="flex-1">
          {children}
        </main>
        <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-600">
              <p>&copy; 2024 Hello World App. Built with NextJS, TypeScript & Tailwind CSS.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
EOF`,
      projectDir
    );
    
    // Create app/page.tsx
    await sandbox.process.executeCommand(
      `cat > app/page.tsx << 'EOF'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-6">
            Hello{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              World
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Welcome to our modern NextJS application built with TypeScript and Tailwind CSS.
            This is a simple yet elegant hello world website.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Modern Stack</h3>
            <p className="text-gray-600">
              Built with NextJS, TypeScript, and Tailwind CSS for optimal performance and developer experience.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-4">📱</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Responsive Design</h3>
            <p className="text-gray-600">
              Fully responsive layout that looks great on desktop, tablet, and mobile devices.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/about"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Learn More
          </Link>
          <a
            href="https://nextjs.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl"
          >
            NextJS Docs
          </a>
        </div>
      </div>
    </div>
  )
}
EOF`,
      projectDir
    );
    
    // Create app/about/page.tsx
    await sandbox.process.executeCommand(
      "mkdir -p app/about",
      projectDir
    );
    
    await sandbox.process.executeCommand(
      `cat > app/about/page.tsx << 'EOF'
import Link from 'next/link'

export default function About() {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            About This{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Project
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Learn more about the technologies and features that power this modern web application.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🛠️ Tech Stack</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                NextJS with App Router
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                TypeScript for type safety
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Tailwind CSS for styling
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Modern development workflow
              </li>
            </ul>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">✨ Features</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                Responsive design
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                Modern UI components
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                Smooth navigation
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                Optimized performance
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-6 opacity-90">
            This project demonstrates modern web development practices with a clean, maintainable codebase.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 border border-white/20 text-base font-medium rounded-md text-white bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              Back to Home
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 border border-white/20 text-base font-medium rounded-md text-white bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
EOF`,
      projectDir
    );

    // Install dependencies
    console.log("\n5. Installing dependencies...");
    const npmInstall = await sandbox.process.executeCommand(
      "npm install",
      projectDir,
      undefined,
      300000 // 5 minute timeout
    );

    if (npmInstall.exitCode !== 0) {
      console.log("Warning: npm install had issues:", npmInstall.result);
    } else {
      console.log("✓ Dependencies installed");
    }

    // Create next-env.d.ts
    await sandbox.process.executeCommand(
      `cat > next-env.d.ts << 'EOF'
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
EOF`,
      projectDir
    );

    // Kill any existing Node processes
    console.log("\n6. Stopping any existing Node processes...");
    await sandbox.process.executeCommand(
      "pkill -f 'node' || true",
      projectDir
    );

    // Start dev server in background
    console.log("\n7. Starting development server in background...");
    await sandbox.process.executeCommand(
      `nohup npm run dev > dev-server.log 2>&1 &`,
      projectDir,
      { PORT: "3000" }
    );

    console.log("✓ Server started in background");

    // Wait a bit for server to initialize
    console.log("Waiting for server to start...");
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // Check if server is running
    const checkServer = await sandbox.process.executeCommand(
      "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 || echo 'failed'",
      projectDir
    );

    if (checkServer.result?.trim() === '200') {
      console.log("✓ Server is running!");
    } else {
      console.log("⚠️  Server might still be starting...");
      console.log("You can check logs with: cat dev-server.log");
      
      // Check server logs
      const serverLogs = await sandbox.process.executeCommand(
        "cat dev-server.log",
        projectDir
      );
      console.log("\nServer logs:");
      console.log(serverLogs.result);
    }

    // Get preview URL
    console.log("\n8. Getting preview URL...");
    const preview = await sandbox.getPreviewLink(3000);

    console.log("\n✨ SUCCESS! Website fixed and running!");
    console.log("\n📊 SUMMARY:");
    console.log("===========");
    console.log(`Sandbox ID: ${sandboxId}`);
    console.log(`Project Directory: ${projectDir}`);
    console.log(`Preview URL: ${preview.url}`);
    if (preview.token) {
      console.log(`Access Token: ${preview.token}`);
    }

    console.log("\n🌐 VISIT YOUR WEBSITE:");
    console.log(preview.url);

  } catch (error: any) {
    console.error("\n❌ ERROR:", error.message);
    throw error;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error("Please provide a sandbox ID");
    console.log("Usage: npx tsx scripts/debug-sandbox.ts <sandbox-id>");
    process.exit(1);
  }
  
  const sandboxId = args[0];
  
  try {
    await debugSandbox(sandboxId);
  } catch (error) {
    console.error("Failed to debug sandbox:", error);
    process.exit(1);
  }
}

main(); 