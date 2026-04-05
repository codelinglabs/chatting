export function filterTagOptions(options: string[], query: string, limit: number) {
  const normalizedOptions = dedupeTagOptions(options);
  const matches = query ? rankTagOptions(normalizedOptions, query) : normalizedOptions;

  return {
    items: matches.slice(0, limit),
    hiddenCount: Math.max(matches.length - limit, 0)
  };
}

function rankTagOptions(options: string[], query: string) {
  const startsWith = options.filter((option) => option.toLowerCase().startsWith(query));
  const contains = options.filter((option) => option.toLowerCase().includes(query) && !option.toLowerCase().startsWith(query));
  return [...startsWith, ...contains];
}

function dedupeTagOptions(options: string[]) {
  const seen = new Set<string>();
  return options.filter((option) => {
    const normalized = option.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}
