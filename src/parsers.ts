// ===== Route Parsing Helpers =====
export function extractDepartureSID(route: string): string {
  if (!route) return "";
  const spacePos = route.indexOf(" ");
  if (spacePos === -1) return route;
  return route.substring(0, spacePos);
}

export function extractDepartureRunway(route: string): string {
  if (!route) return "";
  const spacePos = route.indexOf(" ");
  if (spacePos === -1) {
    const slashPos = route.indexOf("/");
    if (slashPos === -1) return "";
    const afterSlash = route.substring(slashPos + 1);
    let runway = "";
    for (const c of afterSlash) {
      if (/[a-zA-Z0-9]/.test(c)) runway += c;
      else break;
    }
    return runway;
  }
  const firstWord = route.substring(0, spacePos);
  const slashPos = firstWord.indexOf("/");
  if (slashPos === -1) return "";
  const afterSlash = firstWord.substring(slashPos + 1);
  let runway = "";
  for (const c of afterSlash) {
    if (/[a-zA-Z0-9]/.test(c)) runway += c;
    else break;
  }
  return runway;
}

export function extractArrivalSTAR(route: string): string {
  if (!route) return "";
  const spacePos = route.lastIndexOf(" ");
  const lastWord = spacePos === -1 ? route : route.substring(spacePos + 1);
  const slashPos = lastWord.indexOf("/");
  if (slashPos === -1) return lastWord;
  return lastWord.substring(0, slashPos);
}

export function extractArrivalRunway(route: string): string {
  if (!route) return "";
  const spacePos = route.lastIndexOf(" ");
  const lastWord = spacePos === -1 ? route : route.substring(spacePos + 1);
  const slashPos = lastWord.indexOf("/");
  if (slashPos === -1) return "";
  const afterSlash = lastWord.substring(slashPos + 1);
  let runway = "";
  for (const c of afterSlash) {
    if (/[a-zA-Z0-9]/.test(c)) runway += c;
    else break;
  }
  return runway;
}

export function parseIso8601ToEpochSec(iso8601: string): number {
  const ms = Date.parse(iso8601);
  if (isNaN(ms)) return 0;
  return Math.floor(ms / 1000);
}
