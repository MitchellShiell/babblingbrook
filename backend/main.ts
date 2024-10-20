// TypeScript interfaces for type safety
// An interface defines the structure of an object
// Learn more: https://www.typescriptlang.org/docs/handbook/interfaces.html

// This interface defines the structure of the request body we expect from the frontend
interface RequestBody {
  prompt: string; // We expect a 'prompt' property of type string
}

// This interface defines the structure of the request body we'll send to the Ollama API
interface OllamaRequestBody {
  model: string; // The name of the model we want to use
  prompt: string; // The prompt we want to send to the model
}

// This interface defines the structure of the response we expect from the Ollama API
interface OllamaResponse {
  model: string; // The name of the model that generated the response
  created_at: string; // The timestamp of when the response was created
  response: string; // The actual response text
  done: boolean; // A flag indicating whether the response is complete
}

// CORS (Cross-Origin Resource Sharing) options
// CORS is a security feature that controls which web sites are allowed to access your API
// Learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
const corsOptions = {
  origin: "http://localhost:3000", // This is the URL of your frontend. Replace if different.
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// // Yahoo API credentials (Now loaded from environment variables for security)
// const clientId = Deno.env.get("YAHOO_CLIENT_ID");
// const clientSecret = Deno.env.get("YAHOO_CLIENT_SECRET");
// const port = Deno.env.get("PORT")
// const redirectUri = `https://localhost:${port}/callback`;

// // Check if the required environment variables are set
// if (!clientId || !clientSecret) {
//   console.error('YAHOO_CLIENT_ID and YAHOO_CLIENT_SECRET must be set in environment variables');
//   Deno.exit(1);
// }

// // Yahoo OAuth URLs
// const authorizationUrl = 'https://api.login.yahoo.com/oauth2/request_auth';
// const tokenUrl = 'https://api.login.yahoo.com/oauth2/get_token';

// // Variable to store the access token
// let accessToken: string | null = null;

// //continue here

// Deno.serve() creates an HTTP server that listens for incoming requests
// Learn more: https://deno.land/manual@v1.34.3/runtime/http_server_apis
Deno.serve(async (req: Request) => {
  // This function is called for every incoming HTTP request

  // Handle CORS preflight requests
  // Preflight requests are sent by browsers before the actual request to check if CORS is configured correctly
  // Learn more: https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request
  if (req.method === "OPTIONS") {
    // If it's an OPTIONS request, we return a response with CORS headers
    return new Response(null, {
      status: 204, // 204 means "No Content"
      headers: {
        "Access-Control-Allow-Origin": corsOptions.origin, // Allow requests from our frontend
        "Access-Control-Allow-Methods": "POST, OPTIONS", // Allow POST and OPTIONS methods
        "Access-Control-Allow-Headers": "Content-Type", // Allow the Content-Type header
      },
    });
  }

  // Set CORS headers for all responses
  const headers = {
    "Access-Control-Allow-Origin": corsOptions.origin, // Allow requests from our frontend
    "Content-Type": "application/json", // We'll be sending JSON responses
  };

  // Check if the request method is POST
  // We only want to allow POST requests for our API
  // Learn about HTTP methods: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
  if (req.method !== "POST") {
    // If it's not a POST request, return an error
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405, // 405 means "Method Not Allowed"
      headers: headers,
    });
  }

  try {
    // Parse the request body
    // req.json() reads the request body and parses it as JSON
    // Learn about JSON parsing: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
    const requestBody: RequestBody = await req.json();
    const { prompt } = requestBody; // Extract the 'prompt' property from the request body

    // Check if a prompt was provided
    if (!prompt) {
      throw new Error("Prompt is required");
    }

    // Define the URL for the Ollama API
    const ollamaUrl = "http://localhost:11434/api/generate";
    // Prepare the request body for the Ollama API
    const ollamaRequestBody: OllamaRequestBody = {
      model: "neural-chat", // The name of the model we want to use
      prompt: prompt, // The prompt we received from the frontend
    };

    // Make a POST request to the Ollama API
    // fetch() is used to make HTTP requests
    // Learn about fetch: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
    const response = await fetch(ollamaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ollamaRequestBody), // Convert the request body to a JSON string
    });

    // Check if the response from Ollama API is successful
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error: ${response.status}, ${errorText}`);
    }

    // Get a reader for the response body
    // This allows us to read the response as a stream of data
    // Learn about ReadableStream: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
    const reader = response.body?.getReader();
    // Create a TextDecoder to convert binary data to text
    // Learn about TextDecoder: https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder
    const decoder = new TextDecoder();
    let fullResponse = "";

    if (!reader) {
      throw new Error("Unable to read response body");
    }

    // Read the response stream chunk by chunk
    // This is useful for handling large responses or streaming data
    // Learn about async/await: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await
    while (true) {
      const { done, value } = await reader.read();
      if (done) break; // If we're done reading, exit the loop

      // Convert the chunk (which is a Uint8Array) to a string
      const chunk = decoder.decode(value);
      // Split the chunk into lines (Ollama API sends one JSON object per line)
      const lines = chunk.split("\n");

      // Process each line
      for (const line of lines) {
        if (line.trim() !== "") {
          try {
            // Parse each line as JSON
            const jsonResponse: OllamaResponse = JSON.parse(line);
            if (jsonResponse.response) {
              // If there's a response, add it to our full response
              fullResponse += jsonResponse.response;
            }
            if (jsonResponse.done) {
              // If the 'done' flag is true, we've received the complete response
              // You could add additional handling here if needed
            }
          } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
          }
        }
      }
    }

    // Return the full response
    return new Response(JSON.stringify({ response: fullResponse }), {
      headers: headers,
    });
  } catch (error) {
    // Error handling
    // If any error occurs during the process, we catch it here
    // Learn about error handling: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error
          ? error.message // If it's an Error object, use its message
          : "An unknown error occurred", // Otherwise, use a generic message
      }),
      {
        status: 500, // 500 means "Internal Server Error"
        headers: headers,
      },
    );
  }
});

// Log a message to indicate that the server is running
console.log("Server running on http://localhost:8000");