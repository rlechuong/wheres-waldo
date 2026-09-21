const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) throw new Error("VITE_API_URL is not set.");

class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = "ApiError";
  }
}

type ErrorEnvelope = { error?: { code?: string; message?: string } };

const apiFetch = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    throw new ApiError(response.status, "INVALID_RESPONSE", "Unable to parse server response.");
  }

  if (!response.ok) {
    const body = data as ErrorEnvelope;
    throw new ApiError(
      response.status,
      body.error?.code ?? "UNKNOWN_ERROR",
      body.error?.message ?? "Something went wrong.",
    );
  }

  return data as T;
};

export { ApiError, apiFetch };
