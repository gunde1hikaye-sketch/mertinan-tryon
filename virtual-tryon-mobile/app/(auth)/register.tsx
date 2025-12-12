import React, { useMemo, useState } from "react";
import {
  Alert,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "../../lib/supabase";

const bgImage = require("../(tabs)/cosmic_bg.png");

// min 8, en az 1 küçük, 1 büyük, 1 sayı
const isStrongPassword = (pw: string) => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pw);
};

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return email.trim().length > 3 && pw.length > 0 && pw2.length > 0 && !loading;
  }, [email, pw, pw2, loading]);

  const onRegister = async () => {
    setError(null);

    const e = email.trim().toLowerCase();
    if (!e.includes("@")) return setError("Geçerli bir email gir.");
    if (pw !== pw2) return setError("Şifreler aynı değil.");
    if (!isStrongPassword(pw)) {
      return setError("Şifre: min 8 karakter + büyük/küçük harf + sayı içermeli.");
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: e,
        password: pw,
      });

      if (error) {
        // Supabase hata mesajlarını sadeleştir
        if (error.message.toLowerCase().includes("already registered")) {
          setError("Bu email zaten kayıtlı.");
        } else {
          setError(error.message);
        }
        return;
      }

      // Eğer Supabase'de "Confirm email" AÇIK ise
      if (!data.session) {
        Alert.alert(
          "Kayıt başarılı",
          "Email doğrulama linki gönderildi. Mailini kontrol et (spam dahil)."
        );
        router.replace("/(auth)/login");
        return;
      }

      // Email confirmation kapalıysa direkt giriş yapar
      router.replace("/(tabs)");
    } catch (e) {
      setError("Beklenmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={bgImage} resizeMode="cover" style={styles.bg}>
        <View style={styles.darkLayer} />

        <View style={styles.card}>
          <Text style={styles.title}>Kayıt Ol</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="ornek@mail.com"
            placeholderTextColor="rgba(255,255,255,0.5)"
            style={styles.input}
          />

          <Text style={styles.label}>Şifre</Text>
          <TextInput
            value={pw}
            onChangeText={setPw}
            secureTextEntry
            placeholder="Min 8, Aa1..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            style={styles.input}
          />

          <Text style={styles.label}>Şifre (tekrar)</Text>
          <TextInput
            value={pw2}
            onChangeText={setPw2}
            secureTextEntry
            placeholder="Tekrar gir"
            placeholderTextColor="rgba(255,255,255,0.5)"
            style={styles.input}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.primaryBtn, !canSubmit && { opacity: 0.65 }]}
            onPress={onRegister}
            disabled={!canSubmit}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryBtnText}>
              {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => router.replace("/(auth)/login")}
          >
            <Text style={styles.linkText}>Zaten hesabın var mı? Giriş yap</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  bg: { flex: 1, justifyContent: "center", alignItems: "center" },
  darkLayer: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },

  card: {
    width: "88%",
    borderRadius: 22,
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  title: { color: "#fff", fontSize: 26, fontWeight: "900", marginBottom: 12 },

  label: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: "800", marginTop: 10 },

  input: {
    marginTop: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.25)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  error: { marginTop: 10, color: "#ffb4b4", fontWeight: "700" },

  primaryBtn: {
    marginTop: 14,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "#1E88E5",
  },

  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "900" },

  linkBtn: { marginTop: 12, alignItems: "center" },
  linkText: { color: "rgba(255,255,255,0.85)", fontWeight: "800" },
});
