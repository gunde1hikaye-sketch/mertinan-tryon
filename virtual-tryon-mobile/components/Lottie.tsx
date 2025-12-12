import React from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import LottieView from "lottie-react-native";

export default function AppLottie(props: any) {
  if (Platform.OS === "web") {
    return (
      <View style={[{ justifyContent: "center", alignItems: "center" }, props.style]}>
        <ActivityIndicator />
      </View>
    );
  }
  return <LottieView {...props} />;
}
