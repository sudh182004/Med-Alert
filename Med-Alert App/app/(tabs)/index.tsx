import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Device from "expo-device";
import { ScrollView } from "react-native-gesture-handler";

export default function Dashboard() {
  const router = useRouter();

  // User data
  const [userEmail, setUserEmail] = useState("");
  const [accountCreated, setAccountCreated] = useState("N/A");
  const [lastLogin, setLastLogin] = useState("N/A");

  // Location
  const [location, setLocation] = useState("Fetching...");
  const [loading, setLoading] = useState(true);

  // SOS
  const [sosCount, setSosCount] = useState(4);

  // Fake Real-Time Stats
  const [heartRate, setHeartRate] = useState(82);
  const [oxygen, setOxygen] = useState(97);
  const [temperature, setTemperature] = useState(36.5);
  const [stress, setStress] = useState(22); // %
  const [bp, setBp] = useState("118/76");
  const [steps, setSteps] = useState(2432);
  const [motion, setMotion] = useState("Walking");
  const [fallDetected, setFallDetected] = useState(false);
  const [riskScore, setRiskScore] = useState(10);

  // Device Details
  const deviceModel = Device.modelName;
  const appVersion = "1.0.0";

  const loadDashboard = async () => {
    try {
      setLoading(true);

      // Load SOS reports
      const reports =
        JSON.parse(await AsyncStorage.getItem("sosReports")) || [];
      setSosCount(reports.length);

      // Load user
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUserEmail(userData.email || "Unknown");
        setAccountCreated(userData.createdAt || "28-11-2025");
        setLastLogin(userData.lastLogin || "28-11-2025");
      }

      // Location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocation("Permission Denied");
        setLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;

      let address = "Unknown";
      try {
        const place = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        if (place.length > 0) {
          const info = place[0];
          address = `${info.name || ""} ${info.street || ""}, ${
            info.city || ""
          }, ${info.region || ""}`;
        } else {
          address = `https://maps.google.com/?q=${latitude},${longitude}`;
        }
      } catch {
        address = `https://maps.google.com/?q=${latitude},${longitude}`;
      }

      setLocation(address);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(() => {
      // Fake realtime stats change
      setHeartRate((h) => h + (Math.random() * 5 - 2));
      setOxygen((o) => o + (Math.random() * 1 - 0.5));
      setTemperature((t) => t + (Math.random() * 0.2 - 0.1));
      setStress((s) => Math.max(0, Math.min(100, s + (Math.random() * 4 - 2))));
      setSteps((s) => s + Math.floor(Math.random() * 4));

      const motions = ["Still", "Walking", "Running", "Idle"];
      setMotion(motions[Math.floor(Math.random() * motions.length)]);

      // Random fall detection
      setFallDetected(Math.random() < 0.005);

      // Recalculate risk score
      setRiskScore(10 + Math.floor(Math.random() * 11)); 

    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("loggedIn");
    router.replace("/auth/login");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>❌ Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.email}>Logged in as: {userEmail}</Text>

      {/* USER DETAILS */}
      <View style={styles.card}>
        <Text style={styles.label}>📅 Account Created</Text>
        <Text style={styles.value}>{accountCreated}</Text>

        <Text style={[styles.label, { marginTop: 10 }]}>⏱ Last Login</Text>
        <Text style={styles.value}>{lastLogin}</Text>

        <Text style={[styles.label, { marginTop: 10 }]}>📱 Device</Text>
        <Text style={styles.value}>{deviceModel}</Text>

        <Text style={[styles.label, { marginTop: 10 }]}>🛠 App Version</Text>
        <Text style={styles.value}>{appVersion}</Text>
      </View>

      {/* LOCATION */}
      <View style={styles.card}>
        <Text style={styles.label}>📍 Current Location</Text>
        <Text style={styles.value}>{location}</Text>
      </View>

      {/* SOS */}
      <View style={styles.card}>
        <Text style={styles.label}>🚨 Total SOS Reports Sent</Text>
        <Text style={[styles.value, { color: "crimson" }]}>{sosCount}</Text>
      </View>

      {/* HEALTH STATS */}
      <Text style={styles.sectionTitle}>Health & Safety</Text>

      <View style={styles.row}>
        <View style={styles.smallCard}>
          <Text style={styles.smallLabel}>❤️ Heart Rate</Text>
          <Text style={styles.smallValue}>{heartRate.toFixed(0)} bpm</Text>
        </View>

        <View style={styles.smallCard}>
          <Text style={styles.smallLabel}>🫁 SpO₂</Text>
          <Text style={styles.smallValue}>{oxygen.toFixed(0)}%</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.smallCard}>
          <Text style={styles.smallLabel}>🌡 Temp</Text>
          <Text style={styles.smallValue}>{temperature.toFixed(1)} °C</Text>
        </View>

        <View style={styles.smallCard}>
          <Text style={styles.smallLabel}>🧠 Stress</Text>
          <Text style={styles.smallValue}>{stress.toFixed(0)}%</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.smallCard}>
          <Text style={styles.smallLabel}>💓 BP</Text>
          <Text style={styles.smallValue}>{bp}</Text>
        </View>

        <View style={styles.smallCard}>
          <Text style={styles.smallLabel}>🦶 Steps</Text>
          <Text style={styles.smallValue}>{steps}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.smallCard}>
          <Text style={styles.smallLabel}>📉 Motion</Text>
          <Text style={styles.smallValue}>{motion}</Text>
        </View>

        <View style={styles.smallCard}>
          <Text style={styles.smallLabel}>⚠ Fall</Text>
          <Text style={styles.smallValue}>
            {fallDetected ? "Detected" : "None"}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>🔰 Risk Score</Text>
        <Text
          style={[
            styles.value,
            {
              color: riskScore > 60 ? "red" : riskScore > 30 ? "orange" : "green",
            },
          ]}
        >
          {riskScore} / 100
        </Text>
      </View>

      {/* EMERGENCY NUMBERS */}
      <Text style={styles.sectionTitle}>Emergency Contacts</Text>

      <View style={styles.card}>
        <Text style={styles.label}>👮 Police:</Text>
        <Text style={styles.value}>100</Text>

        <Text style={[styles.label, { marginTop: 10 }]}>🚑 Ambulance:</Text>
        <Text style={styles.value}>102</Text>

        <Text style={[styles.label, { marginTop: 10 }]}>🔥 Fire:</Text>
        <Text style={styles.value}>101</Text>

        <Text style={[styles.label, { marginTop: 10 }]}>👩 Women Helpline:</Text>
        <Text style={styles.value}>1091</Text>

        <Text style={[styles.label, { marginTop: 10 }]}>🏢 Local Police Station:</Text>
        <Text style={styles.value}>+91 9876543210</Text>
      </View>

      {/* Buttons */}
      <TouchableOpacity
        style={styles.sosButton}
        onPress={() => router.push("/sos")}
      >
        <Text style={styles.sosText}>🚨 Open SOS</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.refreshBtn} onPress={loadDashboard}>
        <Text style={styles.refreshText}> Refresh</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  title: { fontSize: 30, fontWeight: "700" },
  logout: { color: "red", fontSize: 16 },
  email: { marginBottom: 20, fontSize: 16, color: "#555" },

  card: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },

  label: { fontSize: 15, color: "#666" },
  value: { fontSize: 18, fontWeight: "700", color: "#222" },

  smallCard: {
    backgroundColor: "#fafafa",
    width: "48%",
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },

  smallLabel: { fontSize: 14, color: "#555" },
  smallValue: { fontSize: 19, fontWeight: "700", marginTop: 5 },

  row: { flexDirection: "row", justifyContent: "space-between" },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 10,
  },

  sosButton: {
    backgroundColor: "crimson",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  sosText: { color: "white", textAlign: "center", fontSize: 18 },

  refreshBtn: {
    backgroundColor: "#ffffffff",
    padding: 12,
    color: "white",
    borderRadius: 10,
    marginTop: 10,
  },
  refreshText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
