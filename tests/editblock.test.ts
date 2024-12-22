import { assertEquals } from "https://deno.land/std@0.188.0/testing/asserts.ts";
import { findOriginalUpdateBlocks, applyEdits } from "../lib/editblock.ts";

Deno.test("findOriginalUpdateBlocks - basic parse", () => {
  const content = `
<<<<< SEARCH
one
two
=====
ONE
TWO
>>>>>> REPLACE
`;
  const blocks = findOriginalUpdateBlocks(content);
  assertEquals(blocks.length, 1);
  assertEquals(blocks[0].originalText, "one\ntwo");
  assertEquals(blocks[0].updatedText, "ONE\nTWO");
});

Deno.test("findOriginalUpdateBlocks - no blocks", () => {
  const content = "This content has no markers...";
  const blocks = findOriginalUpdateBlocks(content);
  assertEquals(blocks.length, 0);
});

Deno.test("applyEdits - fuzzy replacement", () => {
  const edits = [
    {
      filename: "sample.txt",
      originalText: "hello world",
      updatedText: "HELLO WORLD"
    }
  ];
  // pretend that sample.txt content is "hello  world" (extra space => test fuzzy)
  // We'll do a tiny wrapper function that fakes reading/writing from disk.
  // In a real test, use dependency injection or mocking.

  // You can create a temp directory for test
  // but here let's just define a small local approach:
  const projectPath = Deno.makeTempDirSync();
  const filePath = `${projectPath}/sample.txt`;
  Deno.writeTextFileSync(filePath, "hello  world");  // slightly different

  const results = applyEdits(edits, projectPath);
  assertEquals(results[0].ok, true, "Fuzzy match should succeed");
  const newContent = Deno.readTextFileSync(filePath);
  assertEquals(newContent, "HELLO WORLD");

  // Clean up
  Deno.removeSync(projectPath, { recursive: true });
});
