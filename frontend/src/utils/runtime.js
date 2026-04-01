const LOCAL_API_ORIGIN = "http://localhost:5003";

function stripTrailingSlash(value = "") {
  return value.replace(/\/+$/, "");
}

function getBrowserOrigin() {
  if (typeof window === "undefined") {
    return LOCAL_API_ORIGIN;
  }

  return window.location.origin;
}

function isLocalhost() {
  if (typeof window === "undefined") {
    return true;
  }

  return ["localhost", "127.0.0.1"].includes(window.location.hostname);
}

const defaultApiBaseUrl = isLocalhost() ? LOCAL_API_ORIGIN : getBrowserOrigin();

export const API_BASE_URL = stripTrailingSlash(
  import.meta.env.VITE_API_BASE || defaultApiBaseUrl
);

export const API_URL = stripTrailingSlash(
  import.meta.env.VITE_API_URL || `${API_BASE_URL}/api`
);

export const FILE_BASE_URL = stripTrailingSlash(
  import.meta.env.VITE_FILE_BASE || API_BASE_URL
);

export const SOCKET_URL = stripTrailingSlash(
  import.meta.env.VITE_SOCKET_URL || (isLocalhost() ? LOCAL_API_ORIGIN : "")
);

export const SOCKET_ENABLED = Boolean(SOCKET_URL);
