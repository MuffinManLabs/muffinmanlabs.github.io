/* Client-safe date formatting — no fs, so client components can import it.
   posts.ts re-exports it for the server side; keeping one definition means a
   locale or month-style tweak cannot half-apply and leave the blog index and
   the post pages formatting dates differently. */
export function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
