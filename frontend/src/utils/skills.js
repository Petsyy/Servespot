import { skillsOptions } from "@/constants/skills";

function toTitleCase(input) {
  return input
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Normalize an array of skills to canonical labels from skillsOptions when possible
// - trims whitespace
// - case-insensitive match to canonical options
// - falls back to Title Case for unknown skills
// - de-duplicates case-insensitively
export function normalizeSkills(skills) {
  if (!Array.isArray(skills)) return [];

  const seen = new Set();
  const normalized = [];

  for (const raw of skills) {
    if (typeof raw !== "string") continue;
    const trimmed = raw.trim();
    if (!trimmed) continue;

    // Try to match canonical option (case-insensitive)
    const match = skillsOptions.find(
      (opt) => opt.toLowerCase() === trimmed.toLowerCase()
    );
    const label = match || toTitleCase(trimmed);

    const key = label.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      normalized.push(label);
    }
  }
  return normalized;
}

// Prepare skills for display: normalize then sort A->Z
export function prepareSkillsForDisplay(skills) {
  return normalizeSkills(Array.isArray(skills) ? skills : [])
    .slice()
    .sort((a, b) => a.localeCompare(b));
}
