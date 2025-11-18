export const fetcher = async <T = unknown>(url: string): Promise<T[]> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch reward history: ${response.status}`);
  }

  const payload = await response.json().catch(() => null);

  if (!Array.isArray(payload)) {
    return [];
  }

  return payload;
};
