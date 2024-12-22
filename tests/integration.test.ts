import {
    assertEquals,
    assertMatch
} from "https://deno.land/std@0.188.0/testing/asserts.ts";
  
Deno.test("end-to-end: cojack CLI + server", async () => {
    const projectDir = Deno.makeTempDirSync();
  
    const cliCommand = new Deno.Command("deno", {
      args: [
        "run",
        "--allow-net",
        "--allow-read",
        "--allow-write",
        "main.ts",
        projectDir,
      ],
      stdout: "piped",
      stderr: "piped",
    });
  
    const child = cliCommand.spawn();
  
    // 1) Read part of stdout.
    const reader = child.stdout.getReader();
    let rawOutput = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      rawOutput += new TextDecoder().decode(value);
      if (rawOutput.includes("OpenAPI is available at:")) {
        break;
      }
    }
    reader.releaseLock();
    await child.stdout.cancel();  // <-- important
  
    // Read or discard stderr so we can cancel/close it as well.
    const errReader = child.stderr.getReader();
    await errReader.cancel();  // <-- important
  
    // e.g. parse your URL from rawOutput
    const match = rawOutput.match(/(http:\/\/localhost:\d+\/\?token=\S+)/);
    if (!match) {
      throw new Error("Could not parse server URL/token from CLI output:\n" + rawOutput);
    }
    const url = match[1];
  
    // 3) Make an HTTP request
    const res = await fetch(url);
    const body = await res.json();
    assertEquals(res.status, 200);
    assertMatch(body.openapi, /3\.0\.0/);
  
    // 4) Clean up
    Deno.removeSync(projectDir, { recursive: true });
    child.kill("SIGTERM");
    await child.status;
  });
  
    