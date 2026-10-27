const LOCAL_API_ORIGIN = "http://localhost:5003";

function stripTrailingSlash(value = "") {
  return String(value).trim().replace(/\/+$/, "");
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

function isServespotVercelHost() {
  if (typeof window === "undefined") {
    return false;
  }

  const { hostname } = window.location;
  return hostname.endsWith(".vercel.app") && hostname.startsWith("servespot");
}

const defaultApiBaseUrl = isLocalhost() ? LOCAL_API_ORIGIN : getBrowserOrigin();
const envApiBaseUrl = stripTrailingSlash(import.meta.env.VITE_API_BASE || "");
const envApiUrl = stripTrailingSlash(import.meta.env.VITE_API_URL || "");

export const API_BASE_URL = stripTrailingSlash(
  isServespotVercelHost() ? getBrowserOrigin() : (envApiBaseUrl || defaultApiBaseUrl)
);

export const API_URL = stripTrailingSlash(
  isServespotVercelHost() ? `${getBrowserOrigin()}/api` : (envApiUrl || `${API_BASE_URL}/api`)
);

export const FILE_BASE_URL = stripTrailingSlash(
  import.meta.env.VITE_FILE_BASE || API_BASE_URL
);

const socketFlag = import.meta.env.VITE_ENABLE_SOCKET;

function isSocketEnabled() {
  if (socketFlag === undefined) {
    return false;
  }

  return String(socketFlag).toLowerCase() === "true";
}

export const SOCKET_URL = stripTrailingSlash(
  import.meta.env.VITE_SOCKET_URL || (isLocalhost() ? LOCAL_API_ORIGIN : "")
);

export const SOCKET_ENABLED = isSocketEnabled() && Boolean(SOCKET_URL);
