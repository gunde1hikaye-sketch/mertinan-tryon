import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  top?: number;
  left?: number;
};

export default function ProfileMenu({ top = 50, left = 16 }: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    (async () => {
      const session = await AsyncStorage.getItem("auth_session");
      if (session) {
        const parsed = JSON.parse(session);
        setEmail(parsed?.email ?? "");
      }
    })();
  }, []);

  const logout = async () => {
    await AsyncStorage.removeItem("auth_session");
    setOpen(false);
    router.replace("/(auth)/login");
  };

  return (
    <>
      {/* ☰ Hamburger */}
      <TouchableOpacity
        style={[styles.menuBtn, { top, left }]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>

      {/* Drawer */}
      <Modal transparent visible={open} animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={styles.panel}>
            <Text style={styles.title}>Profil</Text>
            <Text style={styles.email}>{email || "Email bulunamadı"}</Text>

            <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.9}>
              <Text style={styles.logoutText}>Çıkış Yap</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  menuBtn: {
    position: "absolute",
    zIndex: 50,
  },
  menuIcon: {
    fontSize: 30,
    color: "#fff",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    flexDirection: "row",
  },
  panel: {
    width: 270,
    backgroundColor: "#111",
    padding: 18,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
  email: {
    marginTop: 10,
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
  },

  logoutBtn: {
    marginTop: 22,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#E53935",
    alignItems: "center",
  },
  logoutText: { color: "#fff", fontWeight: "900" },
});
