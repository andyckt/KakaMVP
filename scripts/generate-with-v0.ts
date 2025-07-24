import { Daytona } from "@daytonaio/sdk";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

async function generateWebsiteWithV0(
  sandboxIdArg?: string,
  prompt?: string
) {
  console.log("🚀 Starting website generation with v0 in Daytona sandbox...\n");

  if (!process.env.DAYTONA_API_KEY || !process.env.V0_API_KEY) {
    console.error("ERROR: DAYTONA_API_KEY and V0_API_KEY must be set");
    process.exit(1);
  }

  const daytona = new Daytona({
    apiKey: process.env.DAYTONA_API_KEY,
  });

  let sandbox;
  let sandboxId = sandboxIdArg;

  try {
    // Step 1: Create or get sandbox
    if (sandboxId) {
      console.log(`1. Using existing sandbox: ${sandboxId}`);
      // Get existing sandbox
      const sandboxes = await daytona.list();
      sandbox = sandboxes.find((s: any) => s.id === sandboxId);
      if (!sandbox) {
        throw new Error(`Sandbox ${sandboxId} not found`);
      }
      console.log(`✓ Connected to sandbox: ${sandbox.id}`);
    } else {
      console.log("1. Creating new Daytona sandbox...");
      sandbox = await daytona.create({
        public: true,
        image: "node:20",
      });
      sandboxId = sandbox.id;
      console.log(`✓ Sandbox created: ${sandboxId}`);
    }

    // Get the root directory
    const rootDir = await sandbox.getUserRootDir();
    console.log(`✓ Working directory: ${rootDir}`);

    // Step 2: Create project directory
    console.log("\n2. Setting up project directory...");
    const projectDir = `${rootDir}/website-project`;
    await sandbox.process.executeCommand(`mkdir -p ${projectDir}`, rootDir);
    console.log(`✓ Created project directory: ${projectDir}`);

    // Step 3: Initialize npm project
    console.log("\n3. Initializing npm project...");
    await sandbox.process.executeCommand("npm init -y", projectDir);
    console.log("✓ Package.json created");

    // Step 4: Create v0 API script
    console.log("\n4. Creating v0 API script...");
    
    const v0Script = `
const fs = require('fs');
const https = require('https');

async function generateWebsite() {
  const prompt = \`${
    prompt ||
    "Create a modern blog website with markdown support and a dark theme"
  }
  
  Important requirements:
  - Create a NextJS app with TypeScript and Tailwind CSS
  - Use the app directory structure
  - Create all files in the current directory
  - Include a package.json with all necessary dependencies
  - Make the design modern and responsive
  - Add at least a home page and one other page
  - Include proper navigation between pages
  \`;

  console.log('Starting website generation with v0...');
  console.log('Working directory:', process.cwd());
  
  // Function to make a streaming request to v0 API
  function streamRequest() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.v0.dev',
        port: 443,
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${process.env.V0_API_KEY}'
        }
      };
      
      const req = https.request(options, (res) => {
        if (res.statusCode !== 200) {
          return reject(new Error(\`API request failed with status \${res.statusCode}\`));
        }
        
        let data = '';
        
        res.on('data', (chunk) => {
          const chunkStr = chunk.toString();
          data += chunkStr;
          
          // Try to parse each line as JSON
          const lines = chunkStr.split('\\n');
          for (const line of lines) {
            if (line.startsWith('data: ') && line.length > 6) {
              const jsonStr = line.slice(6);
              if (jsonStr === '[DONE]') continue;
              
              try {
                const json = JSON.parse(jsonStr);
                const content = json.choices?.[0]?.delta?.content;
                
                if (content) {
                  console.log('__V0_MESSAGE__', JSON.stringify({ content }));
                  
                  // Extract code blocks
                  const codeBlockRegex = /\`\`\`([a-zA-Z0-9]+)\\n([\\s\\S]*?)\\n\`\`\`/g;
                  let match;
                  
                  while ((match = codeBlockRegex.exec(content)) !== null) {
                    const language = match[1];
                    const code = match[2];
                    
                    // Determine file type and name
                    let fileName;
                    if (language === 'tsx' || language === 'jsx') {
                      if (code.includes('export default function Home')) {
                        fileName = 'app/page.tsx';
                      } else if (code.includes('export default function Layout')) {
                        fileName = 'app/layout.tsx';
                      } else if (code.includes('import { AppProps }')) {
                        fileName = '_app.tsx';
                      } else {
                        // Try to extract component name
                        const compMatch = code.match(/export\\s+(?:default\\s+)?function\\s+([A-Z][a-zA-Z0-9]*)/);
                        if (compMatch) {
                          fileName = \`components/\${compMatch[1]}.tsx\`;
                        } else {
                          fileName = \`component-\${Math.random().toString(36).substring(7)}.tsx\`;
                        }
                      }
                    } else if (language === 'ts') {
                      fileName = \`lib/\${Math.random().toString(36).substring(7)}.ts\`;
                    } else if (language === 'css') {
                      fileName = 'app/globals.css';
                    } else if (language === 'json' && code.includes('"dependencies"')) {
                      fileName = 'package.json';
                    } else {
                      fileName = \`\${language}-\${Math.random().toString(36).substring(7)}.\${language}\`;
                    }
                    
                    // Write file
                    try {
                      // Ensure directory exists
                      const dir = fileName.includes('/') ? fileName.substring(0, fileName.lastIndexOf('/')) : '';
                      if (dir) {
                        if (!fs.existsSync(dir)) {
                          fs.mkdirSync(dir, { recursive: true });
                        }
                      }
                      
                      fs.writeFileSync(fileName, code);
                      console.log('__TOOL_USE__', JSON.stringify({ 
                        name: 'Write', 
                        input: { file_path: fileName, content: code.substring(0, 100) + '...' } 
                      }));
                    } catch (err) {
                      console.error('Error writing file:', err);
                    }
                  }
                }
              } catch (e) {
                // Ignore JSON parse errors for partial chunks
              }
            }
          }
        });
        
        res.on('end', () => {
          resolve(data);
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      // Send the request
      const requestBody = JSON.stringify({
        model: 'v0-1.5-md',
        messages: [{ role: 'user', content: prompt }],
        stream: true
      });
      
      req.write(requestBody);
      req.end();
    });
  }
  
  try {
    await streamRequest();
    
    console.log('\\nGeneration complete!');
    
    // List generated files
    const files = fs.readdirSync('.');
    console.log('\\nGenerated files:', files.join(', '));
    
    // Create a chat to get a demo URL
    console.log('\\nCreating v0 chat for demo...');
    
    const createChatOptions = {
      hostname: 'api.v0.dev',
      port: 443,
      path: '/v1/chats',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${process.env.V0_API_KEY}\`
      }
    };
    
    const chatPromise = new Promise((resolve, reject) => {
      const req = https.request(createChatOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const chatData = JSON.parse(data);
              console.log('Chat created with ID:', chatData.id);
              resolve(chatData);
            } catch (error) {
              reject(new Error('Failed to parse chat response'));
            }
          } else {
            reject(new Error(\`Chat creation failed with status \${res.statusCode}\`));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      const chatPayload = JSON.stringify({
        message: prompt,
        modelConfiguration: {
          modelId: 'v0-1.5-md'
        }
      });
      
      req.write(chatPayload);
      req.end();
    });
    
    const chatData = await chatPromise;
    console.log('Demo URL:', chatData.demo);
    
    // Check if package.json exists and install dependencies
    if (fs.existsSync('package.json')) {
      console.log('\\nInstalling dependencies...');
      const { execSync } = require('child_process');
      execSync('npm install', { stdio: 'inherit' });
      console.log('Dependencies installed');
    }
    
  } catch (error) {
    console.error('Generation error:', error);
    process.exit(1);
  }
}

generateWebsite().catch(console.error);`;

    // Write the script to a file
    await sandbox.process.executeCommand(
      `cat > generate-v0.js << 'SCRIPT_EOF'
${v0Script}
SCRIPT_EOF`,
      projectDir
    );
    console.log("✓ v0 generation script written to generate-v0.js");

    // Step 5: Run the generation script
    console.log("\n5. Running v0 code generation...");
    console.log(`Prompt: "${prompt || "Create a modern blog website"}"`);
    console.log("\nThis may take several minutes...\n");

    const genResult = await sandbox.process.executeCommand(
      "node generate-v0.js",
      projectDir,
      {
        V0_API_KEY: process.env.V0_API_KEY,
      },
      600000 // 10 minute timeout
    );

    console.log("\nGeneration output:");
    console.log(genResult.result);

    if (genResult.exitCode !== 0) {
      throw new Error("Generation failed");
    }

    // Step 6: Check generated files
    console.log("\n6. Checking generated files...");
    const filesResult = await sandbox.process.executeCommand(
      "ls -la",
      projectDir
    );
    console.log(filesResult.result);

    // Step 7: Install dependencies if package.json was updated
    const hasNextJS = await sandbox.process.executeCommand(
      "test -f package.json && grep -q next package.json && echo yes || echo no",
      projectDir
    );

    if (hasNextJS.result?.trim() === "yes") {
      console.log("\n7. Installing project dependencies...");
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

      // Step 8: Start dev server in background
      console.log("\n8. Starting development server in background...");

      // Start the server in background using nohup
      await sandbox.process.executeCommand(
        `nohup npm run dev > dev-server.log 2>&1 &`,
        projectDir,
        { PORT: "3000" }
      );

      console.log("✓ Server started in background");

      // Wait a bit for server to initialize
      console.log("Waiting for server to start...");
      await new Promise((resolve) => setTimeout(resolve, 8000));

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
      }
    }

    // Step 9: Get preview URL
    console.log("\n9. Getting preview URL...");
    const preview = await sandbox.getPreviewLink(3000);

    console.log("\n✨ SUCCESS! Website generated with v0!");
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

    return {
      success: true,
      sandboxId: sandboxId,
      projectDir: projectDir,
      previewUrl: preview.url,
    };
  } catch (error: any) {
    console.error("\n❌ ERROR:", error.message);

    if (sandbox) {
      console.log(`\nSandbox ID: ${sandboxId}`);
      console.log("The sandbox is still running for debugging.");
    }

    throw error;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  let sandboxId: string | undefined;
  let prompt: string | undefined;

  // Parse arguments
  if (args.length > 0) {
    // Check if first arg is a sandbox ID (UUID format)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(args[0])) {
      sandboxId = args[0];
      prompt = args.slice(1).join(" ");
    } else {
      prompt = args.join(" ");
    }
  }

  if (!prompt) {
    prompt =
      "Create a modern blog website with markdown support and a dark theme. Include a home page, blog listing page, and individual blog post pages.";
  }

  console.log("📝 Configuration:");
  console.log(
    `- Sandbox: ${sandboxId ? `Using existing ${sandboxId}` : "Creating new"}`
  );
  console.log(`- Prompt: ${prompt}`);
  console.log();

  try {
    await generateWebsiteWithV0(sandboxId, prompt);
  } catch (error) {
    console.error("Failed to generate website with v0:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\n👋 Exiting... The sandbox will continue running.");
  process.exit(0);
});

main(); 