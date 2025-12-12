import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { View, ActivityIndicator } from "react-native";
import { Session } from "@supabase/supabase-js";

export default function ProtectedLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // 1️⃣ İlk açılışta mevcut session'ı al
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);

      if (!data.session) {
        router.replace("/(auth)/login");
      }
    });

    // 2️⃣ REAL-TIME auth listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);

      if (!session) {
        router.replace("/(auth)/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 3️⃣ Splash / Loading
  if (checking) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000",
        }}
      >
        <ActivityIndicator size="large" color="#1E88E5" />
      </View>
    );
  }

  // 4️⃣ Session yoksa render etme
  if (!session) return null;

  // 5️⃣ Session varsa app
  return <Stack screenOptions={{ headerShown: false }} />;
}
