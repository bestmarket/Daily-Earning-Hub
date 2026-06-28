const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  import.meta.env.BASE_URL.replace(/\/$/, "");

export default API_BASE;
