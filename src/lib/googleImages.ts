/** Google Images search for a plant name, opened in a new tab. */
export function googleImagesUrl(name: string): string {
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(name)}`;
}
