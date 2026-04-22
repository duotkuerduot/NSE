const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export async function apiClient<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const errorPayload = (await response.json()) as { detail?: string };
      if (errorPayload.detail) {
        message = errorPayload.detail;
      }
    } catch {
      const errorText = await response.text();
      if (errorText) {
        message = errorText;
      }
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}
