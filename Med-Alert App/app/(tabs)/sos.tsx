// import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as Location from 'expo-location';
// import React, { useState } from 'react';
// import { ActivityIndicator, Alert, Button, Linking, StyleSheet, Text, View } from 'react-native';

// export default function SOSScreen() {
//   const [loading, setLoading] = useState(false);

//   const handleSendSOS = async () => {
//     try {
//       setLoading(true);

//       // 🔹 Get saved user data
//      // 🔹 Get saved user data
// const storedUser = await AsyncStorage.getItem('user');
// if (!storedUser) {
//   Alert.alert("Error", "User not found!");
//   return;
// }
// const user = JSON.parse(storedUser);

// let emergencyNumber = user.emergencyContactNumber?.trim();

// if (!emergencyNumber) {
//   Alert.alert("Error", "Emergency contact number missing!");
//   return;
// }

// // 🧩 Add +91 automatically if missing
// if (!emergencyNumber.startsWith('+')) {
//   emergencyNumber = '+91' + emergencyNumber;
// }


//       // 📍 Ask for Location
//       let { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert("Permission Required", "Please allow location access to send SOS.");
//         setLoading(false);
//         return;
//       }

//       // 📍 Fetch live location
//       let location = await Location.getCurrentPositionAsync({});
//       const { latitude, longitude } = location.coords;

//       let address = `https://maps.google.com/?q=${latitude},${longitude}`;

//       // 📝 WhatsApp message text
//       const message = 
//         `🚨 *SOS ALERT* 🚨\n\n` +
//         `I need help urgently!\n` +
//         `📍 Location: ${address}\n\n` +
//         `Please reach me as soon as possible. 🙏`;

//       const url = `whatsapp://send?phone=${emergencyNumber}&text=${encodeURIComponent(message)}`;

//       // 🔗 Open WhatsApp
//       const supported = await Linking.canOpenURL(url);
//       if (!supported) {
//         Alert.alert("Error", "WhatsApp is not installed on this device.");
//         return;
//       }

//       await Linking.openURL(url);

//       Alert.alert("SOS Triggered", "WhatsApp is opening with your emergency message.");

//     } catch (error) {
//       console.error(error);
//       Alert.alert("Error", "Could not send SOS.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>SOS Notification</Text>
//       {loading ? (
//         <ActivityIndicator size="large" color="red" />
//       ) : (
//         <Button title="Send SOS" color="red" onPress={handleSendSOS} />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
// });


import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, View } from 'react-native';
import { Pressable } from "react-native";

export default function SOSScreen() {
  const [loading, setLoading] = useState(false);

  const handleSendSOS = async () => {
    try {
      setLoading(true);

      // 🧍 Dummy User Data if not stored in Async
      let user = { name: "Tanvis Singh", emergencyContactNumber: "9876543210" };

      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        user = JSON.parse(storedUser);
      }

      let emergencyNumber = user.emergencyContactNumber?.trim();
      if (!emergencyNumber) return Alert.alert("Error", "Emergency contact number missing!");

      if (!emergencyNumber.startsWith('+')) emergencyNumber = '+91' + emergencyNumber;

      // 📍 Location Permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Required", "Please allow location access.");
        return;
      }

      // 📍 Get User Location
      let location = await Location.getCurrentPositionAsync({});
      const userLink = `https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`;

      // 🌐 Send to Twilio Server
      const res = await fetch("http://192.168.27.47:3000/send-sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: user.name,
          userLocationLink: userLink,
          emergencyNumber,
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      Alert.alert("🚨 SOS Sent", "Emergency Message Sent To Contact");

    } catch (error: any) {
      console.log(error);
      Alert.alert("Error", "Could not send SOS.");
    } finally {
      setLoading(false);
    }
  };

return (
  <View style={styles.container}>
    <Text style={styles.title}>🚨 SOS Notification</Text>

    {loading ? (
      <ActivityIndicator size="large" color="red" />
    ) : (
      <Pressable style={styles.sosButton} onPress={handleSendSOS}>
        <Text style={styles.sosButtonText}>SEND SOS</Text>
      </Pressable>
    )}
  </View>
);

}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22,borderRadius:20, fontWeight: 'bold', marginBottom: 20 },sosButton: {
  backgroundColor: "red",
  paddingVertical: 58,
  paddingHorizontal: 100,
  borderRadius: 114,
  elevation: 6, // Android shadow
  shadowColor: "#000", // iOS shadow
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
},

sosButtonText: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 18,
  letterSpacing: 1,
},

});
