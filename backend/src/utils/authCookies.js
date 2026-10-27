const isProduction = process.env.NODE_ENV === "production";

const cookieBaseOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const clearCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};

export const setAuthCookie = (res, token) => {
  res.clearCookie("adminToken", clearCookieOptions);
  res.cookie("authToken", token, cookieBaseOptions);
};

export const setAdminCookie = (res, token) => {
  res.clearCookie("authToken", clearCookieOptions);
  res.cookie("adminToken", token, cookieBaseOptions);
};

export const clearAuthCookies = (res) => {
  res.clearCookie("authToken", clearCookieOptions);
  res.clearCookie("adminToken", clearCookieOptions);
};
