import { api } from "../api/client";
const Cookies = require("js-cookie");

export async function handleLogout() {
  try {
    // Call backend logout route
    await api.post("/auth/logout", {}, { withCredentials: true });
  } catch (error) {
    console.warn("Logout request failed:", error);
  } finally {
    // Clear all localStorage
    localStorage.clear();
    
    // Clear all sessionStorage
    sessionStorage.clear();
    
    // Clear all cookies using js-cookie
    Cookies.remove('auth-token');
    Cookies.remove('refresh-token');
    
    // Clear any other cookies that might exist
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
    
    // Force redirect to login page
    window.location.href = "/";
  }
}
