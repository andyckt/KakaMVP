import { SDKMessage } from "@anthropic-ai/claude-code";

export interface V0CodeGenerationResult {
  success: boolean;
  messages: any[];
  error?: string;
}

export async function generateCodeWithV0(prompt: string): Promise<V0CodeGenerationResult> {
  try {
    const messages: any[] = [];
    const apiKey = process.env.V0_API_KEY;
    
    if (!apiKey) {
      throw new Error("V0_API_KEY environment variable is not set");
    }
    
    // Make request to v0 API
    const response = await fetch("https://api.v0.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "v0-1.5-md",
        messages: [
          { role: "user", content: prompt }
        ],
        stream: true
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate code with v0");
    }
    
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    if (!reader) {
      throw new Error("No response body");
    }
    
    // Process the streaming response
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");
      
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          
          if (data === "[DONE]") break;
          
          try {
            const parsedData = JSON.parse(data);
            
            // Convert v0 format to match Claude's message format for compatibility
            const content = parsedData.choices[0]?.delta?.content;
            if (content) {
              messages.push({
                type: "assistant",
                message: { content }
              });
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }
    
    return {
      success: true,
      messages
    };
    
  } catch (error: any) {
    console.error("Error generating code with v0:", error);
    return {
      success: false,
      messages: [],
      error: error.message
    };
  }
} 