import ky from "ky";

const UNAUTHORIZED = 401;

const PUBLIC_ROUTES = ["/login", "/cadastro"];

export const api = ky.create({
  prefix: import.meta.env.VITE_API_URL,
  credentials: "include",
  hooks: {
    afterResponse: [
      async ({ response }) => {
        if (response.status === UNAUTHORIZED && !PUBLIC_ROUTES.includes(window.location.pathname)) {
          window.location.replace("/login");
        }
      },
    ],
  },
});
