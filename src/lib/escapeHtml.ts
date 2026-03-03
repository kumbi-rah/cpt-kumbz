/**
 * Escapes HTML special characters to prevent XSS when inserting
 * user-controlled strings into innerHTML / setHTML calls.
 */
export function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
