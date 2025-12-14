import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function Signup() {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [relationship, setRelationship] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactNumber, setEmergencyContactNumber] = useState('');
  const [residentialNumber, setResidentialNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();

  const handleSignup = async () => {
    if (
      !name ||
      !dob ||
      !gender ||
      !relationship ||
      !emergencyContactName ||
      !emergencyContactNumber ||
      !residentialNumber ||
      !email ||
      !password
    ) {
      Alert.alert('Error', 'Please fill in all the required fields');
      return;
    }

    try {
      const userData = {
        name,
        dob,
        gender,
        relationship,
        emergencyContactName,
        emergencyContactNumber,
        residentialNumber,
        email,
        password,
      };

      await AsyncStorage.setItem('user', JSON.stringify(userData));

      Alert.alert('Success', 'Account created successfully!');
      router.replace('/auth/login');
    } catch (error) {
      Alert.alert('Signup Error', 'Something went wrong!');
      console.error(error);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff' }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Sign Up</Text>
      <Text style={styles.subtitle}>Enter Your Details</Text>

      <View style={styles.hr} />

      {/* Form fields */}
      <Text style={styles.detail}>Full Name</Text>
      <TextInput
        placeholder="Enter your full name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.detail}>Date of Birth</Text>
      <TextInput
        placeholder="DD/MM/YYYY"
        style={styles.input}
        value={dob}
        onChangeText={setDob}
      />

      <Text style={styles.detail}>Gender</Text>
      <TextInput
        placeholder="Male / Female / Other"
        style={styles.input}
        value={gender}
        onChangeText={setGender}
      />

      <Text style={styles.detail}>Relationship</Text>
      <TextInput
        placeholder="Father, Mother, Friend..."
        style={styles.input}
        value={relationship}
        onChangeText={setRelationship}
      />

      <Text style={styles.detail}>Emergency Contact Name</Text>
      <TextInput
        placeholder="Enter emergency contact name"
        style={styles.input}
        value={emergencyContactName}
        onChangeText={setEmergencyContactName}
      />

      <Text style={styles.detail}>Emergency Contact Number</Text>
      <TextInput
        placeholder="+91 9876543210"
        style={styles.input}
        keyboardType="phone-pad"
        value={emergencyContactNumber}
        onChangeText={setEmergencyContactNumber}
      />

      <Text style={styles.detail}>Residential Number</Text>
      <TextInput
        placeholder="Phone number"
        style={styles.input}
        keyboardType="phone-pad"
        value={residentialNumber}
        onChangeText={setResidentialNumber}
      />

      <Text style={styles.detail}>Email</Text>
      <TextInput
        placeholder="Enter your email"
        style={styles.input}
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.detail}>Password</Text>
      <TextInput
        placeholder="Enter password"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button title="Sign Up" onPress={handleSignup} />

      <Link href="/auth/login">
        <Text style={styles.link}>Already have an account? Log in</Text>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 28,
    paddingBottom: 60,
    backgroundColor: '#ffffff',
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#222',
    textAlign: 'center',
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },

  hr: {
    height: 1.5,
    backgroundColor: '#e5e5e5',
    marginVertical: 15,
    borderRadius: 10,
  },

  detail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#000',
    marginBottom: 15,
    backgroundColor: '#fafafa',
  },

  link: {
    textAlign: 'center',
    marginTop: 18,
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
  },
});
