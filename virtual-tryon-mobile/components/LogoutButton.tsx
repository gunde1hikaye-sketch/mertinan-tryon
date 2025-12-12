import { TouchableOpacity, Text, Alert } from "react-native";
import { supabase } from "../lib/supabase";
import { router } from "expo-router";

export default function LogoutButton() {
  const logout = async () => {
    await supabase.auth.signOut();
    Alert.alert("Çıkış yapıldı");
    router.replace("/(auth)/login");
  };

  return (
    <TouchableOpacity onPress={logout}>
      <Text style={{ color: "#fff", fontWeight: "900" }}>Çıkış Yap</Text>
    </TouchableOpacity>
  );
}
