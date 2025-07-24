import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Check for API key in environment variables
    const apiKey = process.env.V0_API_KEY;
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "V0_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Return the API key
    // Note: In a production environment, you might want to implement
    // additional security measures like authentication before providing the API key
    return new Response(
      JSON.stringify({ apiKey }),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          // Prevent caching of this response
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        } 
      }
    );
    
  } catch (error: any) {
    console.error("[API] Error retrieving API key:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
} 