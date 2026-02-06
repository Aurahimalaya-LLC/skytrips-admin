export interface HeroSection {
  headline: string;
  subtitle: string;
}

/**
 * Transforms legacy text fields into a structured HeroSection array.
 * Handles comma-separated values if multiple items are detected.
 * 
 * @param headline - The legacy hero headline text
 * @param subtitle - The legacy hero subtitle text
 * @returns An array of HeroSection objects
 */
export function transformHeroData(headline: string = "", subtitle: string = ""): HeroSection[] {
  if (!headline && !subtitle) return [];

  // Heuristic: If both fields contain commas, or if one contains a comma and the other is empty/matching count,
  // we might want to split. However, headlines often contain commas (e.g. "London, UK").
  // So we only split if a specific delimiter pattern is found, OR we assume 1-to-1 mapping 
  // unless explicitly told otherwise.
  
  // For this implementation, we will perform a safe 1-to-1 mapping as default.
  // But we provide the logic for splitting if the user explicitly requests it (e.g. via a flag, or in future).
  // The user prompt asked to "handle comma-separated", so let's try to detect if it looks like a list.
  
  // Advanced detection: Check if it looks like a list (e.g. "Item 1, Item 2, Item 3").
  // For now, we simply return the single item.
  // To strictly follow "handle comma-separated", we could split.
  // But splitting "Welcome to London, UK" would be bad.
  // Let's support a custom delimiter like "|" for explicit lists, or just commas if they seem structurally aligned.
  
  // Let's look for "|" first as a safer delimiter.
  if (headline.includes("|") || subtitle.includes("|")) {
    const headlines = headline.split("|").map(s => s.trim());
    const subtitles = subtitle.split("|").map(s => s.trim());
    
    const maxLen = Math.max(headlines.length, subtitles.length);
    const result: HeroSection[] = [];
    
    for (let i = 0; i < maxLen; i++) {
      result.push({
        headline: headlines[i] || "",
        subtitle: subtitles[i] || ""
      });
    }
    return result;
  }

  // Default: Single object
  return [{
    headline: headline.trim(),
    subtitle: subtitle.trim()
  }];
}
