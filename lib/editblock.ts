import { join } from "https://deno.land/std@0.188.0/path/mod.ts";

// Basic shape for data
export interface EditBlock {
  filename: string | null;        // null => shell block or unknown
  originalText: string;
  updatedText: string;
}

// Basic shape for fuzzy edit instructions
export interface EditInstruction {
  filename: string;
  originalText: string;
  updatedText: string;
}

// Simplified pattern detection for lines with
// <<<<<<< SEARCH
// =======
// >>>>>>> REPLACE
const HEAD_REGEX = /^<{5,9}\s*SEARCH\s*$/m;
const DIVIDER_REGEX = /^={5,9}\s*$/m;
const UPDATED_REGEX = /^>{5,9}\s*REPLACE\s*$/m;

/**
 * findOriginalUpdateBlocks(content)
 * Basic approach:
 * - Splits lines
 * - Searches for triple-quoted blocks, shell blocks, or search/replace markers
 * - Returns an array of { filename, originalText, updatedText }
 */
export function findOriginalUpdateBlocks(content: string): EditBlock[] {
  const lines = content.split(/\r?\n/);
  const blocks: EditBlock[] = [];
  
  let i = 0;
  while (i < lines.length) {
    // Look for HEAD_REGEX
    if (HEAD_REGEX.test(lines[i])) {
      const originalTextLines: string[] = [];
      const updatedTextLines: string[] = [];
      let j = i + 1;
      
      // gather originalText until DIVIDER_REGEX
      while (j < lines.length && !DIVIDER_REGEX.test(lines[j])) {
        originalTextLines.push(lines[j]);
        j++;
      }
      if (j >= lines.length) {
        // malformed block => stop
        break;
      }
      
      // j is now on the "======" line
      j++;
      // gather updatedText until UPDATED_REGEX
      while (j < lines.length && !UPDATED_REGEX.test(lines[j])) {
        updatedTextLines.push(lines[j]);
        j++;
      }
      if (j >= lines.length) {
        // malformed => stop
        break;
      }
      // j is now on the ">>>>>>>" line
      // We don't parse the filename in this naive approach. 
      // You can adopt the logic from python code that looks a few lines above HEAD_REGEX.
      
      blocks.push({
        filename: null, 
        originalText: originalTextLines.join("\n"),
        updatedText: updatedTextLines.join("\n"),
      });
      
      i = j + 1;
      continue;
    }
    
    i++;
  }
  
  return blocks;
}

/**
 * applyEdits(edits, projectPath)
 * High-level approach:
 * - For each edit:
 *    1. Read the file's content (or create empty if new file).
 *    2. Fuzzy-match originalText in file content => find best approximate region.
 *    3. Replace that region with updatedText.
 *    4. Write file back.
 * - Return success/failure or partial matches.
 */
export function applyEdits(
  edits: EditInstruction[],
  projectPath: string
): Array<{ filename: string; ok: boolean; reason?: string }> {
  const results: Array<{ filename: string; ok: boolean; reason?: string }> = [];
  
  for (const edit of edits) {
    const filePath = join(projectPath, edit.filename);
    
    let content: string;
    try {
      content = Deno.readTextFileSync(filePath);
    } catch (err) {
      // If file doesn't exist, start with empty content
      if (err instanceof Deno.errors.NotFound) {
        content = "";
      } else {
        throw err; // rethrow any other error (e.g., permission denied)
      }
    }
       
    const newContent = fuzzyReplace(content, edit.originalText, edit.updatedText);
    if (newContent == null) {
      // Could not find a good match for originalText
      results.push({ filename: edit.filename, ok: false, reason: "No fuzzy match found" });
      continue;
    }
    
    try {
      Deno.writeTextFileSync(filePath, newContent);
      results.push({ filename: edit.filename, ok: true });
    } catch (err) {
      results.push({ filename: edit.filename, ok: false, reason: String(err) });
    }
  }
  
  return results;
}

/**
 * fuzzyReplace(content, oldSnippet, newSnippet)
 * Minimal example of a "roll-your-own" line-based fuzzy approach:
 *  - Splits content into lines
 *  - Looks for a chunk of lines most similar to oldSnippet
 *  - If similarity > threshold, replaces them with newSnippet
 *  - Returns new content, or null if no match
 */
function fuzzyReplace(
  content: string,
  oldSnippet: string,
  newSnippet: string
): string | null {
  // trivial short-circuit if oldSnippet is empty
  if (!oldSnippet.trim()) {
    return content + "\n" + newSnippet;
  }
  
  const contentLines = content.split(/\r?\n/);
  const snippetLines = oldSnippet.split(/\r?\n/);
  
  let bestScore = 0;
  let bestIndex = -1;
  
  for (let i = 0; i <= contentLines.length - snippetLines.length; i++) {
    const slice = contentLines.slice(i, i + snippetLines.length);
    const score = lineSimilarity(slice, snippetLines);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }
  
  const threshold = 0.7; // tune as desired
  if (bestScore < threshold) {
    return null;
  }
  
  // perform the replacement
  const newLines = [
    ...contentLines.slice(0, bestIndex),
    ...newSnippet.split(/\r?\n/),
    ...contentLines.slice(bestIndex + snippetLines.length),
  ];
  
  return newLines.join("\n");
}

/**
 * lineSimilarity(a, b)
 * Simple similarity measure: fraction of lines that match exactly or differ slightly.
 */
function lineSimilarity(a: string[], b: string[]): number {
  if (a.length !== b.length) return 0;
  let matches = 0;
  for (let i = 0; i < a.length; i++) {
    const dist = levenshteinDistance(a[i], b[i]);
    const maxLen = Math.max(a[i].length, b[i].length);
    const sim = 1 - dist / maxLen; // 1 => identical, 0 => total mismatch
    if (sim > 0.8) {
      matches++;
    }
  }
  return matches / a.length;
}

/**
 * levenshteinDistance(s, t)
 * Standard edit distance. Minimally implemented so we can keep dependencies minimal.
 */
function levenshteinDistance(s: string, t: string): number {
  const d: number[][] = [];
  const n = s.length;
  const m = t.length;
  
  for (let i = 0; i <= n; i++) {
    d[i] = [];
    d[i][0] = i;
  }
  for (let j = 0; j <= m; j++) {
    d[0][j] = j;
  }
  
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,    // deletion
        d[i][j - 1] + 1,    // insertion
        d[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return d[n][m];
}
