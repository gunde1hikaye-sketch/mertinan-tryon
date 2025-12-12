import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import LottieView from "../../components/Lottie";
import React, { useState } from "react";
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { router } from "expo-router";

import { supabase } from "../../lib/supabase";
import ProfileMenu from "../../components/tryon/ProfileMenu";
import ImagePickerCard from "../../components/tryon/ImagePickerCard";
import ResultCard from "../../components/tryon/ResultCard";
import LogoutButton from "../../components/LogoutButton";

const bgImage = require("./cosmic_bg.png");
const loadingAnimation = require("../../assets/animations/loading.json");

// 🔴 PROD API
const API_URL = "https://mertinan-tryon.vercel.app/api/tryon";
// 🟡 LOCAL test için:
// const API_URL = "http://localhost:3000/api/tryon";

export default function HomeScreen() {
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [tshirtImage, setTshirtImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ===============================
  // IMAGE PICK
  // ===============================
  const pickImage = async (setter: (v: string) => void) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("İzin Gerekli", "Galeri iznine izin vermen gerekiyor.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;

    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 640 } }],
      {
        compress: 0.25,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      }
    );

    if (!manipulated.base64) {
      Alert.alert("Hata", "Fotoğraf işlenemedi (base64 oluşmadı).");
      return;
    }

    setter("data:image/jpeg;base64," + manipulated.base64);
  };

  // ===============================
  // GENERATE TRY-ON (ADIM 4)
  // ===============================
  const generateTryOn = async () => {
    if (!modelImage || !tshirtImage) {
      Alert.alert("Uyarı", "Lütfen iki fotoğrafı da seç!");
      return;
    }

    setLoading(true);

    try {
      // 🔐 SESSION AL
      const { data, error } = await supabase.auth.getSession();

      console.log("🟢 SESSION DATA:", data);
      console.log("🔴 SESSION ERROR:", error);

      if (error || !data.session) {
        Alert.alert("Oturum Yok", "Lütfen tekrar giriş yap.");
        router.replace("/(auth)/login");
        return;
      }

      const token = data.session.access_token;
      console.log("🔐 ACCESS TOKEN (ilk 20):", token.slice(0, 20));

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🔥 EN ÖNEMLİ SATIR
        },
        body: JSON.stringify({
          modelImage,
          tshirtImage,
          generateVideo: false,
        }),
      });

      const rawText = await response.text();

      console.log("📡 RESPONSE STATUS:", response.status);
      console.log("📩 RAW RESPONSE:", rawText);

      if (!response.ok) {
        Alert.alert(
          "Sunucu Hatası",
          response.status === 401
            ? "Yetkisiz. Tekrar giriş yap."
            : "Sunucu hatası."
        );
        return;
      }

      const json = rawText ? JSON.parse(rawText) : null;

      if (!json?.imageUrl) {
        Alert.alert("Hata", "API imageUrl döndürmedi.");
        return;
      }

      setResultImage(json.imageUrl);
    } catch (e) {
      console.log("🔥 FETCH ERROR:", e);
      Alert.alert("Bağlantı Hatası", "Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  };

  const canGenerate = !!modelImage && !!tshirtImage && !loading;

  // ===============================
  // UI
  // ===============================
  return (
    <View style={styles.container}>
      <ImageBackground source={bgImage} resizeMode="cover" style={styles.bg}>
        <View style={styles.darkLayer} />

        <ProfileMenu top={50} left={16} />
        <View style={{ position: "absolute", top: 50, right: 16 }}>
          <LogoutButton />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.overlay}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Virtual Try-On Mobile</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Fotoğrafları Yükle</Text>
            <Text style={styles.cardDesc}>
              Kartlara dokunarak fotoğraf seçebilirsin.
            </Text>

            <View style={styles.previewGrid}>
              <ImagePickerCard
                label="MODEL"
                imageUri={modelImage}
                onPress={() => pickImage(setModelImage)}
              />
              <ImagePickerCard
                label="TİŞÖRT"
                imageUri={tshirtImage}
                onPress={() => pickImage(setTshirtImage)}
              />
            </View>

            <TouchableOpacity
              style={[styles.generateButton, !canGenerate && { opacity: 0.6 }]}
              onPress={generateTryOn}
              disabled={!canGenerate}
            >
              {loading ? (
                <LottieView
                  autoPlay
                  loop
                  style={{ width: 58, height: 58 }}
                  source={loadingAnimation}
                />
              ) : (
                <Text style={styles.generateButtonText}>
                  Generate Try-On
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {resultImage && (
            <ResultCard
              resultImage={resultImage}
              onClear={() => setResultImage(null)}
            />
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

// ===============================
// STYLES
// ===============================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  bg: { flex: 1 },
  darkLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  overlay: {
    paddingTop: 60,
    paddingBottom: 28,
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 14,
  },
  card: {
    width: "88%",
    padding: 18,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    marginBottom: 16,
  },
  cardTitle: { fontSize: 18, fontWeight: "800", color: "#fff" },
  cardDesc: {
    marginTop: 6,
    marginBottom: 12,
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    lineHeight: 18,
  },
  previewGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
    marginBottom: 14,
  },
  generateButton: {
    paddingVertical: 16,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E88E5",
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
});
