export const decodeHtml = (s: string) => {
  if (typeof window === "undefined") return s;
  return new DOMParser().parseFromString(s, "text/html").documentElement.textContent || s;
};



