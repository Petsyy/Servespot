
export const setCookie = (name, value, days = 7) => {
  if (typeof document === "undefined") return;
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value ?? "")}${expires}; path=/; SameSite=Lax${secure}`;
};

export const getCookie = (name) => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  if (match) {
    return decodeURIComponent(match[1]);
  }
  return localStorage.getItem(name);
};

export const removeCookie = (name) => {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax${secure}`;
};

export const getActiveRole = () => getCookie("role");
export const getVolunteerId = () => getCookie("volunteerId");
export const getOrgId = () => getCookie("orgId");
export const getAdminId = () => getCookie("adminId");

export const clearClientSessionCookies = () => {
  removeCookie("role");
  removeCookie("volunteerId");
  removeCookie("orgId");
  removeCookie("adminId");
  removeCookie("volunteerName");
  removeCookie("orgName");
  removeCookie("authToken");
  removeCookie("adminToken");
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
  }
};

