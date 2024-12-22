import { serveFile } from "https://deno.land/std@0.188.0/http/file_server.ts";
import { findOriginalUpdateBlocks, applyEdits } from "./lib/editblock.ts";

interface StartServerOptions {
  projectPath: string;
  accessToken: string;
}

export async function startServer(
  req: Request,
  opts: StartServerOptions
): Promise<Response> {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  
  // Simple auth check
  if (token !== opts.accessToken) {
    return new Response("Invalid token", { status: 401 });
  }

  // Minimal router, to be replaced with a real router/OpenAPI framework
  switch (url.pathname) {
    case "/":
      return serveOpenAPI();
    case "/find_blocks":
      if (req.method === "POST") {
        return handleFindBlocks(req);
      }
      break;
    case "/apply_edits":
      if (req.method === "POST") {
        return handleApplyEdits(req, opts);
      }
      break;
    default:
      return new Response("Not Found", { status: 404 });
  }

  return new Response("Method Not Allowed", { status: 405 });
}

// Placeholder for returning an OpenAPI spec
function serveOpenAPI(): Response {
  const openApiSpec = {
    openapi: "3.0.0",
    info: {
      title: "Cojack Microservice",
      version: "0.1.0"
    },
    paths: {
      "/find_blocks": {
        post: {
          description: "Parse text for original/update blocks",
          responses: {
            "200": { description: "Success" }
          }
        }
      },
      "/apply_edits": {
        post: {
          description: "Apply fuzzy-coded edits to project",
          responses: {
            "200": { description: "Success" }
          }
        }
      }
    }
  };
  const body = JSON.stringify(openApiSpec, null, 2);
  return new Response(body, {
    status: 200,
    headers: { "content-type": "application/json" }
  });
}

async function handleFindBlocks(req: Request): Promise<Response> {
  const { content } = await req.json();
  if (typeof content !== "string") {
    return new Response("Invalid content", { status: 400 });
  }
  const blocks = findOriginalUpdateBlocks(content);
  return new Response(JSON.stringify(blocks), {
    status: 200,
    headers: { "content-type": "application/json" }
  });
}

async function handleApplyEdits(req: Request, opts: StartServerOptions): Promise<Response> {
  const { edits } = await req.json();
  if (!Array.isArray(edits)) {
    return new Response("Invalid edits array", { status: 400 });
  }
  try {
    // In a real scenario, you'd read files from opts.projectPath, etc.
    const results = applyEdits(edits, opts.projectPath);
    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  } catch (err) {
    return new Response(String(err), { status: 500 });
  }
}
