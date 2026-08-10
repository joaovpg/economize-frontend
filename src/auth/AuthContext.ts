import { createContext } from "react";

export type AuthStatus = "loading" | "unauthenticated" | "authenticated";

export type AuthUser = {
  id: string;
  name: string;
};

export type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;
};

export const unauthenticatedState: AuthState = {
  status: "unauthenticated",
  user: null,
};

export const AuthContext = createContext<AuthState>(unauthenticatedState);
