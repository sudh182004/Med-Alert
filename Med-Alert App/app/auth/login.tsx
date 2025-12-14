import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  Easing
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // ✨ FIXED ANIMATION (useRef so it doesn't reset)
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    // 👇 AUTO LOGIN CHECK
    const checkLoginStatus = async () => {
      const loggedIn = await AsyncStorage.getItem('loggedIn');
      if (loggedIn === 'true') {
        router.replace('/(tabs)/sos');
      }
    };
    checkLoginStatus();
  }, []);

  // 🔐 LOGIN FUNCTION
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill both fields');
      return;
    }

    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (!storedUser) {
        Alert.alert('No Account Found', 'Please sign up first!');
        return;
      }
      const userData = JSON.parse(storedUser);

      if (userData.email === email && userData.password === password) {
        await AsyncStorage.setItem('loggedIn', 'true');
        Alert.alert('Success', 'Login successful!');
        router.replace('/(tabs)/sos');
      } else {
        Alert.alert('Error', 'Invalid email or password');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed');
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.title}>Welcome Back 👋</Text>
      <Text style={styles.subtitle}>Login to continue</Text>

      {/* 📩 Email Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="mail" size={20} color="#777" />
        <TextInput
          placeholder="Email Address"
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* 🔐 Password Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed" size={20} color="#777" />
        <TextInput
          placeholder="Password"
          secureTextEntry={!showPassword}
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#777" />
        </TouchableOpacity>
      </View>

      {/* 👉 Gradient Login Button */}
      <TouchableOpacity onPress={handleLogin} style={{ width: '100%', marginTop: 20 }}>
        <LinearGradient
          colors={['#ff5555', '#ff0000']}
          style={styles.loginButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.loginText}>Login</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* 🔗 Signup Link */}
      <Link href="/auth/signup">
        <Text style={styles.linkText}>
          Don’t have an account? <Text style={{ color: '#ff3333' }}>Sign Up</Text>
        </Text>
      </Link>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    padding: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#222',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 15,
    color: '#777',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#000', // 👈 IMPORTANT
  },
  loginButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  linkText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    color: '#444',
  },
});
