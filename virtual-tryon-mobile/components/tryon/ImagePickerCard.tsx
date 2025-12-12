import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  label: string; // MODEL / TİŞÖRT
  imageUri: string | null;
  onPress: () => void;
};

export default function ImagePickerCard({ label, imageUri, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.86}>
      {imageUri ? (
        <>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Değiştir</Text>
          </View>
          <View style={styles.labelBar}>
            <Text style={styles.labelText}>{label}</Text>
          </View>
        </>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{label}</Text>
          <Text style={styles.emptyDesc}>Dokun ve seç</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    height: 190,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  image: { width: "100%", height: "100%" },

  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyTitle: { color: "#fff", fontSize: 16, fontWeight: "900", marginBottom: 4 },
  emptyDesc: { color: "rgba(255,255,255,0.75)", fontSize: 12 },

  badge: {
    position: "absolute",
    right: 10,
    bottom: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "800" },

  labelBar: {
    position: "absolute",
    left: 10,
    top: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  labelText: { color: "#fff", fontSize: 12, fontWeight: "900", letterSpacing: 0.5 },
});
