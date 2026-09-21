/**
 * PackSmart AI — Resilient API Client with Timeout & Error Handling
 * Handles:
 * - Network offline / connection refused
 * - API timeouts via AbortController
 * - Authentication expiry (401 Unauthorized)
 * - Structured error reporting
 */

const DEFAULT_TIMEOUT_MS = 8000;

export class ApiError extends Error {
  constructor(message, type, status = 0, details = null) {
    super(message);
    this.name = "ApiError";
    this.type = type; // "OFFLINE", "TIMEOUT", "AUTH_EXPIRED", "SERVER_ERROR", "VALIDATION"
    this.status = status;
    this.details = details;
  }
}

/**
 * Fetch wrapper with timeout, token attachment, and unified error mapping.
 */
export async function apiFetch(endpoint, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Retrieve auth token from storage if not explicitly provided
  const storedToken = localStorage.getItem("packsmart_token");
  const headers = {
    "Content-Type": "application/json",
    ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
    ...(options.headers || {})
  };

  const urlsToTry = [endpoint];
  if (!endpoint.startsWith("http")) {
    urlsToTry.push(`http://127.0.0.1:8000${endpoint}`);
  }

  let lastError = null;

  for (const url of urlsToTry) {
    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle 401 Unauthorized (Auth Expiry)
      if (response.status === 401) {
        localStorage.removeItem("packsmart_token");
        localStorage.removeItem("packsmart_user");
        window.dispatchEvent(new CustomEvent("packsmart:auth-expired", {
          detail: { message: "Your authentication session has expired. Please log in again." }
        }));
        throw new ApiError(
          "Your session has expired. Please log in again.",
          "AUTH_EXPIRED",
          401
        );
      }

      // Handle 403 Forbidden
      if (response.status === 403) {
        throw new ApiError(
          "Access denied: You do not have permission to perform this action.",
          "FORBIDDEN",
          403
        );
      }

      // Handle 422 Unprocessable Entity (Validation Error)
      if (response.status === 422) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          "Invalid input data submitted to server.",
          "VALIDATION",
          422,
          errorData.detail || errorData
        );
      }

      // Handle 500 Server Error
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.detail || `Server returned error (${response.status})`,
          "SERVER_ERROR",
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (err) {
      if (err.name === "AbortError") {
        clearTimeout(timeoutId);
        throw new ApiError(
          `Request timed out after ${timeoutMs / 1000}s. The PackSmart AI server is taking too long to respond.`,
          "TIMEOUT",
          408
        );
      }

      if (err instanceof ApiError) {
        throw err;
      }

      lastError = err;
      // If relative URL failed, loop will try absolute http://127.0.0.1:8000 URL
    }
  }

  clearTimeout(timeoutId);
  throw new ApiError(
    "Unable to connect to PackSmart AI server. The backend may be offline.",
    "OFFLINE",
    0,
    lastError?.message
  );
}
