import { StrictMode } from "react";

import { createRouter, RouterProvider } from "@tanstack/react-router";

import "./styles/index.css";
import { createRoot } from "react-dom/client";

import { routeTree } from "./routeTree.gen";

export const router = createRouter({
  defaultPreload: "intent",
  defaultPreloadDelay: 80,
  routeTree,
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
