import { Asset } from "expo-asset";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  resultImage: string;
  onClear: () => void;
};

export default function ResultCard({ resultImage, onClear }: Props) {
  const [saving, setSaving] = useState(false);

  const shareLocalUri = async (localUri: string) => {
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      alert("Bu cihazda paylaşım desteklenmiyor.");
      return;
    }

    await Sharing.shareAsync(localUri, {
      dialogTitle: "Try-On görselini kaydet / paylaş",
    });

    alert("✅ Paylaş ekranından 'Fotoğraflara Kaydet' seçebilirsin.");
  };

  const saveResult = async () => {
    if (Platform.OS === "web") {
      alert("Web’de kaydetme desteklenmiyor. Telefonda dene.");
      return;
    }

    try {
      setSaving(true);

      // ✅ 1) En stabil yol: Asset ile indir
      try {
        const asset = Asset.fromURI(resultImage);
        await asset.downloadAsync();

        if (asset.localUri) {
          await shareLocalUri(asset.localUri);
          return;
        }
      } catch (e1: any) {
        console.log("ASSET DOWNLOAD FAILED:", e1?.message ?? e1);
      }

      // ✅ 2) Fallback: GET ile indir (bazı linkler redirect/hotlink yapar)
      // Not: HEAD kullanmıyoruz çünkü iOS’ta sık hata veriyor.
      try {
        const res = await fetch(resultImage, {
          method: "GET",
          headers: {
            Accept: "image/*,*/*;q=0.8",
            "User-Agent": "Mozilla/5.0",
          },
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`İndirme başarısız (HTTP ${res.status}) ${text.slice(0, 120)}`);
        }

        // Redirect sonrası gerçek URL res.url olabilir
        const finalUrl = (res as any).url || resultImage;

        const asset2 = Asset.fromURI(finalUrl);
        await asset2.downloadAsync();

        if (!asset2.localUri) throw new Error("Fallback indirildi ama localUri oluşmadı.");
        await shareLocalUri(asset2.localUri);
        return;
      } catch (e2: any) {
        console.log("FETCH FALLBACK FAILED:", e2?.message ?? e2);
        alert(
          "Kaydetme başarısız.\n\n" +
            "Muhtemel sebep: imageUrl korumalı (403), geçici link, ya da cihaz linke erişemiyor.\n\n" +
            "Hata:\n" +
            String(e2?.message ?? e2)
        );
      }
    } catch (e: any) {
      alert("Kaydetme hatası:\n" + (e?.message ? String(e.message) : String(e)));
      console.log("SAVE ERROR:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.resultCard}>
      <View style={styles.header}>
        <Text style={styles.title}>Sonuç</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            onPress={saveResult}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.saveText}>Kaydet</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.clearBtn} onPress={onClear} activeOpacity={0.85}>
            <Text style={styles.clearText}>Temizle</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.imageWrap}>
        <Image source={{ uri: resultImage }} style={styles.image} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  resultCard: {
    width: "90%",
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  title: { fontSize: 18, fontWeight: "800", color: "#fff" },
  actions: { flexDirection: "row", alignItems: "center", gap: 8 },

  saveBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(30,136,229,0.22)",
    borderWidth: 1,
    borderColor: "rgba(30,136,229,0.35)",
    minWidth: 74,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: { color: "#fff", fontSize: 12, fontWeight: "900" },

  clearBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  clearText: { color: "rgba(255,255,255,0.92)", fontSize: 12, fontWeight: "800" },

  imageWrap: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 12,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  image: { width: "100%", aspectRatio: 3 / 4, resizeMode: "contain" },
});
