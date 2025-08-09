import { useStorageState } from "@/hooks/useStorage";
import { router } from "expo-router";
import { createContext, PropsWithChildren, useContext, useState } from "react";

const AuthContext = createContext<{
  signIn: (username: string, password: string) => void;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
  error?: string | null;
  loading: boolean;
  getToken: () => string | undefined;
}>({
  signIn: (username: string, password: string) => null,
  signOut: () => null,
  session: null,
  isLoading: false,
  error: null,
  loading: false,
  getToken: () => undefined,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState("session");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => {
    const sessionData = session ? JSON.parse(session) : null;
    return sessionData?.token;
  };

  return (
    <AuthContext.Provider
      value={{
        signIn: async (username: string, password: string) => {
          if (!username || !password) {
            setError("Veuillez remplir tous les champs.");
            return;
          }
          setLoading(true);
          setError(null);
          router.push("/(protected)");

          // try {
          //   const response = await SECURITY_API.post("/sign-in", {
          //     username,
          //     password,
          //   });
          //   const data = response.data;
          //   if (data) {
          //     const user = JSON.parse(data.user) as User;
          //     if (user.role.name.toUpperCase() == "TECH") {
          //       console.log("Connected Successfully");
          //       setSession(JSON.stringify({ ...user, token: data.token }));
          //       router.push("/(protected)/");
          //     } else {
          //       setError("Vous n'avez pas access a l'application mobile");
          //     }
          //   } else {
          //     setError("Noms d'utilisateur ou Mot de passe incorrect");
          //   }
          // } catch (error) {
          // if(error instanceof AxiosError)   console.log(error.request);

          //   setError(
          //     "Noms d'utilisateur ou Mot de passe Incorrect \n" +
          //       (error instanceof Error ? error.message : "")
          //   );
          // } finally {
          //   setLoading(false);
          // }
        },
        signOut: () => {
          setSession(null);
        },
        session,
        isLoading,
        error,
        loading,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
