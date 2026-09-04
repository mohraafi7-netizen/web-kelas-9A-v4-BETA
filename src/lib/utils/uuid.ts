export function isValidUuid(id: string | null | undefined): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export function isTemporaryMessage(id: string | null | undefined): boolean {
  if (!id) return false;
  return id.startsWith('temp-') || !isValidUuid(id);
}
