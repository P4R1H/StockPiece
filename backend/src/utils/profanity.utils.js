// Define regex patterns for the target words.
const profanityPatterns = [
  // Pattern for "nigga" with common leetspeak substitutions and inserted symbols.
  /n[\W_]*[i!1][\W_]*[g9][\W_]*[g9][\W_]*[a@4]/gi,
  // Pattern for "nigger" with leetspeak substitutions and inserted symbols.
  /n[\W_]*[i!1][\W_]*[g9][\W_]*[g9][\W_]*[e3][\W_]*[r]/gi,
  // Pattern for "faggot" with common leetspeak substitutions and inserted symbols.
  /f[\W_]*[a@4][\W_]*[g9][\W_]*[g9][\W_]*[o0][\W_]*t/gi,
  // Pattern for "fag" using word boundaries to ensure it matches the full word.
  /\bfag\b/gi,
];

function containsProfanity(text) {
  return profanityPatterns.some((pattern) => pattern.test(text));
}

export default containsProfanity;
