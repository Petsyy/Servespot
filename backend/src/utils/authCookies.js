const isProduction = process.env.NODE_ENV === "production";

const cookieBaseOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const setAuthCookie = (res, token) => {
  res.cookie("authToken", token, cookieBaseOptions);
};

export const setAdminCookie = (res, token) => {
  res.cookie("adminToken", token, cookieBaseOptions);
};

export const clearAuthCookies = (res) => {
  const clearOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };

  res.clearCookie("authToken", clearOptions);
  res.clearCookie("adminToken", clearOptions);
};
