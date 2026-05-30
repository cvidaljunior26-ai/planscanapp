import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: string | null;
  companyId: string | null;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null, session: null, loading: true, role: null, companyId: null,
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, company_id")
            .eq("id", session.user.id)
            .single();
          setState({ user: session.user, session, loading: false, role: profile?.role ?? null, companyId: profile?.company_id ?? null });
        } else {
          setState({ user: null, session: null, loading: false, role: null, companyId: null });
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  return state;
}
