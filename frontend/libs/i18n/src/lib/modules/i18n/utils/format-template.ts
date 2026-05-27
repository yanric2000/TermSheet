export function formatTemplate(template: string, args: readonly unknown[]): string {
  if (args.length === 0) return template;
  return template.replace(/\{(\d+)\}/g, (_, index: string) => {
    const value = args[Number(index)];
    return value === undefined || value === null ? '' : String(value);
  });
}
