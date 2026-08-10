import { AuthProvider } from "./auth/AuthProvider";
import AppRouter from "./router";

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
