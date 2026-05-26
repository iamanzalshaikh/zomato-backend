export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export const uniqueSlug = async (
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> => {
  let slug = slugify(base);
  let candidate = slug;
  let counter = 1;
  while (await exists(candidate)) {
    candidate = `${slug}-${counter++}`;
  }
  return candidate;
};
