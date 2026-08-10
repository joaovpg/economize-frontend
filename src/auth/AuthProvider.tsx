import { type ReactNode } from "react";
import { AuthContext, unauthenticatedState } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthContext.Provider value={unauthenticatedState}>{children}</AuthContext.Provider>;
}
