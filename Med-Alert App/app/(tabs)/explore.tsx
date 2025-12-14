import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  Linking,
} from 'react-native';

const nearbyHospitals = [
  {
    id: 1,
    name: "Apollo Hospital",
    distance: "1.4 km",
    beds: 42,
    icuBeds: 8,
    ventilators: 5,
    oxygenAvailable: true,
    traumaCenter: true,
    bloodBank: true,
    rating: 4.5,
    reviews: 1832,
    speciality: "Cardiology • Neurology • Emergency",
    waitTime: "12 minutes",
    pricing: "₹₹₹",
    phone: "+91 9876543210",
    eta: "5 min",
    status: "Open",
    is24x7: true,
    verified: true,
    emergencyLevel: "Level 1 (Advanced)",
    openingHours: "Open 24/7",
    hospitalImage:
      "https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg",
    latitude: 28.6139,
    longitude: 77.2090,
    directionsLink:
      "https://www.google.com/maps/dir/?api=1&destination=Apollo+Hospital",
  },
  {
    id: 2,
    name: "Fortis Healthcare",
    distance: "2.1 km",
    beds: 67,
    icuBeds: 12,
    ventilators: 8,
    oxygenAvailable: true,
    traumaCenter: true,
    bloodBank: false,
    rating: 4.3,
    reviews: 1221,
    speciality: "Orthopedics • ICU • General Surgery",
    waitTime: "18 minutes",
    pricing: "₹₹",
    phone: "+91 9988776655",
    eta: "7 min",
    status: "Open",
    is24x7: true,
    verified: true,
    emergencyLevel: "Level 2",
    openingHours: "Open 24/7",
    hospitalImage:
      "https://images.pexels.com/photos/263337/pexels-photo-263337.jpeg",
    latitude: 28.6200,
    longitude: 77.2150,
    directionsLink:
      "https://www.google.com/maps/dir/?api=1&destination=Fortis+Healthcare",
  },
  {
    id: 3,
    name: "City Medical Center",
    distance: "900 m",
    beds: 28,
    icuBeds: 3,
    ventilators: 1,
    oxygenAvailable: false,
    traumaCenter: false,
    bloodBank: false,
    rating: 4.1,
    reviews: 352,
    speciality: "General Physician • Basic Care",
    waitTime: "25 minutes",
    pricing: "₹",
    phone: "+91 9090909090",
    eta: "3 min",
    status: "Closed",
    is24x7: false,
    verified: false,
    emergencyLevel: "Basic",
    openingHours: "8 AM – 9 PM",
    hospitalImage:
      "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg",
    latitude: 28.6250,
    longitude: 77.2000,
    directionsLink:
      "https://www.google.com/maps/dir/?api=1&destination=City+Medical+Center",
  },
];

export default function ExploreScreen() {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("Fetching location...");
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState(null);

  const fetchLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission Needed", "Please allow location access.");
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);

      const places = await Location.reverseGeocodeAsync(loc.coords);
      if (places.length > 0) {
        const info = places[0];
        setAddress(`${info.name || ""} ${info.street || ""}, ${info.city}`);
      }
    } catch {
      Alert.alert("Error", "Unable to get location.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#999" />
        <Text>Loading explore page...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore</Text>

      <View style={styles.locationCard}>
        <Text style={styles.locationLabel}>Your Location</Text>
        <Text style={styles.locationValue}>{address}</Text>
      </View>

      <Text style={styles.sectionTitle}>Nearby Hospitals</Text>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {nearbyHospitals.map((h) => (
          <TouchableOpacity
            key={h.id}
            style={styles.hospitalCard}
            onPress={() => setSelectedHospital(h)}
          >
            <Image source={{ uri: h.hospitalImage }} style={styles.hospitalImage} />

            <View style={styles.rowBetween}>
              <Text style={styles.hospitalName}>{h.name}</Text>
              {h.verified && <Text style={styles.verified}>✔</Text>}
            </View>

            <View style={styles.rowBetween}>
              <Text style={styles.pricing}>{h.pricing}</Text>

              <Text
                style={[
                  styles.statusPill,
                  { backgroundColor: h.status === "Open" ? "#E0F8EA" : "#FDE7E7" },
                ]}
              >
                {h.status}
              </Text>
            </View>

            <Text style={styles.speciality}>{h.speciality}</Text>

            <Text style={styles.info}>
              📍 {h.distance}   ⭐ {h.rating} ({h.reviews})
            </Text>

            <View style={styles.iconRow}>
              <Text style={styles.tag}>🛏 Beds: {h.beds}</Text>
              <Text style={styles.tag}>🧪 ICU: {h.icuBeds}</Text>
              <Text style={styles.tag}>💨 Vent: {h.ventilators}</Text>
              <Text style={styles.tag}>🟦 O₂: {h.oxygenAvailable ? "Yes" : "No"}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {location && (
        <>
          <Image
            source={{
              uri: `https://maps.googleapis.com/maps/api/staticmap?center=${location.latitude},${location.longitude}&zoom=14&size=600x300&markers=color:red%7C${location.latitude},${location.longitude}&key=YOUR_API_KEY`,
            }}
            style={styles.map}
          />
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                `https://maps.google.com/?q=${location.latitude},${location.longitude}`
              )
            }
          >
            <Text style={styles.mapLink}>View on Maps →</Text>
          </TouchableOpacity>
        </>
      )}

      <Modal visible={!!selectedHospital} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            {selectedHospital && (
              <>
                <Text style={styles.modalTitle}>{selectedHospital.name}</Text>
                <Text style={styles.modalText}>📍 {selectedHospital.distance}</Text>
                <Text style={styles.modalText}>⭐ {selectedHospital.rating}</Text>
                <Text style={styles.modalText}>
                  Beds: {selectedHospital.beds}
                </Text>
                <Text style={styles.modalText}>
                  ICU: {selectedHospital.icuBeds}
                </Text>
                <Text style={styles.modalText}>Phone: {selectedHospital.phone}</Text>

                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => Linking.openURL(`tel:${selectedHospital.phone}`)}
                >
                  <Text style={styles.callBtnText}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.directionBtn}
                  onPress={() => Linking.openURL(selectedHospital.directionsLink)}
                >
                  <Text style={styles.directionBtnText}>Directions</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setSelectedHospital(null)}
                >
                  <Text style={styles.closeBtnText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: "#fff" },
  title: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center",
    color: "#111",
  },

  locationCard: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: "#FAFAFA",
  },
  locationLabel: { fontSize: 14, color: "#666" },
  locationValue: { fontSize: 17, color: "#111", marginTop: 4 },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
    color: "#111",
  },

  list: {
  flexGrow: 1,
  marginBottom: 20,
},


  hospitalCard: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 14,
    marginBottom: 14,
    backgroundColor: "#FFF",
  },

  hospitalImage: {
    width: "100%",
    height: 130,
    borderRadius: 10,
    marginBottom: 10,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  hospitalName: { fontSize: 18, fontWeight: "700", color: "#000" },
  verified: { fontSize: 18, fontWeight: "700", color: "#007AFF" },

  pricing: { fontSize: 14, color: "#444", fontWeight: "500", marginTop: 3 },

  statusPill: {
    fontSize: 12,
    paddingVertical: 2,
    paddingHorizontal: 12,
    borderRadius: 12,
    overflow: "hidden",
    fontWeight: "600",
    color: "#333",
  },

  speciality: {
    fontSize: 13,
    color: "#666",
    marginTop: 6,
    marginBottom: 6,
  },

  info: { fontSize: 14, color: "#444" },

  iconRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  tag: {
    fontSize: 12,
    color: "#333",
    borderWidth: 1,
    borderColor: "#DDD",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 8,
  },

  map: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginTop: 10,
  },
  mapLink: {
    fontSize: 16,
    marginTop: 8,
    color: "#007AFF",
    textAlign: "center",
    fontWeight: "500",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    width: "88%",
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    marginBottom: 10,
  },

  modalText: { fontSize: 16, color: "#333", marginBottom: 5 },

  callBtn: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  callBtnText: { color: "#FFF", fontSize: 16, textAlign: "center" },

  directionBtn: {
    backgroundColor: "#4C8BF5",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  directionBtnText: { color: "white", fontSize: 16, textAlign: "center" },

  closeBtn: {
    borderWidth: 1,
    borderColor: "#DDD",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  closeBtnText: { color: "#555", fontSize: 16, textAlign: "center" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
