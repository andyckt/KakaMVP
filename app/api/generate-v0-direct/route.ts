import { NextRequest } from "next/server";
import { v0Api } from "@/lib/v0-api";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const apiKey = process.env.V0_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing V0_API_KEY" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    
    console.log("[API] Starting direct v0 generation for prompt:", prompt);
    
    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    
    // Start the async generation
    (async () => {
      try {
        // Initialize v0 API service
        const v0Service = v0Api(apiKey);
        
        // Send initial progress message
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ 
            type: "progress", 
            message: "开发中" 
          })}\n\n`)
        );
        
        // Create chat with prompt
        const chat = await v0Service.createChat(prompt);
        
        // Send chat created message
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ 
            type: "progress", 
            message: `Chat created with ID: ${chat.id}` 
          })}\n\n`)
        );
        
        // Extract and send assistant messages
        const assistantMessages = v0Service.extractAssistantMessages(chat);
        if (assistantMessages.length > 0) {
          for (const message of assistantMessages) {
            await writer.write(
              encoder.encode(`data: ${JSON.stringify({ 
                type: "claude_message", 
                content: message 
              })}\n\n`)
            );
          }
        }
        
        // Send completion with demo URL and chat ID
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ 
            type: "complete", 
            chatId: chat.id,
            previewUrl: chat.demo 
          })}\n\n`)
        );
        console.log(`[API] Generation complete. Preview URL: ${chat.demo}, Chat ID: ${chat.id}`);
        
        // Send done signal
        await writer.write(encoder.encode("data: [DONE]\n\n"));
      } catch (error: any) {
        console.error("[API] Error during v0 generation:", error);
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ 
            type: "error", 
            message: error.message || "An error occurred during v0 generation"
          })}\n\n`)
        );
        await writer.write(encoder.encode("data: [DONE]\n\n"));
      } finally {
        await writer.close();
      }
    })();
    
    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
    
  } catch (error: any) {
    console.error("[API] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
} 