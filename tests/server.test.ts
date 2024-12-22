import { assertEquals } from "https://deno.land/std@0.188.0/testing/asserts.ts";
import { startServer } from "../server.ts";
import { serve } from "https://deno.land/std@0.188.0/http/server.ts";

Deno.test("server - find_blocks endpoint", async () => {
  // Use a random token for test
  const token = "testtoken123";
  const projectPath = Deno.makeTempDirSync();

  const handler = (req: Request) => startServer(req, { projectPath, accessToken: token });

  // Spin up server on an ephemeral port
  const abortController = new AbortController();
  const { signal } = abortController;
  const port = 50001 + Math.floor(Math.random() * 5000);
  const server = serve(handler, { port, signal });

  // Make a POST request
  const testUrl = `http://localhost:${port}/find_blocks?token=${token}`;
  const body = { content: "<<<<< SEARCH\nline\n=====\nLINE\n>>>>>> REPLACE\n" };
  const response = await fetch(testUrl, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  assertEquals(response.status, 200);
  assertEquals(data.length, 1, "Should parse 1 block");

  // Tear down
  abortController.abort();
  await server; // Wait for server to finish
  Deno.removeSync(projectPath, { recursive: true });
});
