import { supabase } from "../../lib/supabase";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from "react-native";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email || !password) {
      Alert.alert("Hata", "Email ve şifre gir.");
      return;
    }

    try {
      setLoading(true);

      // 🔐 LOGIN
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("LOGIN DATA:", data);
      console.log("LOGIN ERROR:", error);

      if (error) {
        Alert.alert("Giriş Hatası", error.message);
        return;
      }

      // ✅ SESSION KONTROL (ADIM 3)
      const sessionRes = await supabase.auth.getSession();
      console.log("SESSION KONTROL:", sessionRes.data.session);

      if (!sessionRes.data.session) {
        Alert.alert("Hata", "Session oluşmadı");
        return;
      }

      // 🚀 BAŞARILI
      router.replace("/(tabs)");
    } catch (e: any) {
      console.log("LOGIN CATCH ERROR:", e);
      Alert.alert("Beklenmeyen Hata", String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giriş Yap</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#999"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <TextInput
        placeholder="Şifre"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={onLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#000",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 16,
    color: "#fff",
    marginBottom: 14,
  },
  button: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#1E88E5",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
});
