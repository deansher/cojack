#!/usr/bin/env deno run --allow-net --allow-read

import { parse } from "https://deno.land/std@0.188.0/flags/mod.ts";
import { join, fromFileUrl } from "https://deno.land/std@0.188.0/path/mod.ts";
import { serve } from "https://deno.land/std@0.188.0/http/server.ts";
import { randomUUID } from "https://deno.land/std@0.188.0/uuid/v4.ts";
import { startServer } from "./server.ts";

// Parse CLI args
const args = parse(Deno.args, {
  alias: { help: ["h"] },
  boolean: ["help"],
  stopEarly: true
});

if (args.help) {
  console.log(`
Usage:
  deno run --allow-net --allow-read main.ts [projectPath]

Description:
  Cojack microservice that exposes an OpenAPI-compatible API for LLM access.

  If [projectPath] is omitted, defaults to cwd.
  `);
  Deno.exit(0);
}

// The first positional argument is the project directory
const projectPathArg = args._[0] ? String(args._[0]) : Deno.cwd();
// Convert possibly relative path to absolute
const projectPath = projectPathArg.startsWith("file://")
  ? fromFileUrl(projectPathArg)
  : join(Deno.cwd(), projectPathArg);

const accessToken = randomUUID();
const port = Math.floor(40000 + Math.random() * 10000);

async function main() {
  const server = serve((req) => startServer(req, { projectPath, accessToken }), { port });
  const url = `http://localhost:${port}/?token=${accessToken}`;
  console.log(`Cojack started. OpenAPI is available at: ${url}`);
  console.log(`Project path: ${projectPath}`);
  for await (const _ of server) {
    // The server handles requests in startServer
  }
}

main();
