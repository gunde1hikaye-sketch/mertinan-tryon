import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { View, ActivityIndicator } from "react-native";

export default function RootLayout() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      await supabase.auth.getSession();
      setChecking(false);
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      setChecking(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
