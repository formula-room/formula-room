export async function fetchInternalApi<T>(input: string, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    cache: "no-store",
  });

  const payload = (await response.json()) as {
    ok: boolean;
    data?: T;
    error?: string;
  };

  if (!response.ok || !payload.ok || payload.data === undefined) {
    throw new Error(payload.error ?? `Request failed for ${input}`);
  }

  return payload.data;
}
