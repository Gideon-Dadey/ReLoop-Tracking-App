import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform, ScrollView, Image } from 'react-native';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useThemeColors } from '@/src/store/useThemeStore';
import { apiService } from '@/src/api/service';
import { router } from 'expo-router';

const RADIUS = 10;

export default function RegisterScreen() {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const c = useThemeColors();

  const handleRegister = async () => {
    if (!userName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const data = await apiService.register(email, password, userName);
      setAuth(data.user, data.accessToken, data.refreshToken);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.bg }]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Image source={require('../../assets/reloop.png')} style={styles.logoImage} />
        <Text style={[styles.title, { color: c.text }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: c.textMuted }]}>
          Join the circular economy movement
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={[styles.label, { color: c.textSecondary }]}>Full Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: c.inputBg, borderColor: c.surfaceBorder, color: c.text }]}
          placeholder="Enter your name"
          placeholderTextColor={c.textFaint}
          value={userName}
          onChangeText={setUserName}
          autoCapitalize="words"
        />

        <Text style={[styles.label, { color: c.textSecondary }]}>Email Address</Text>
        <TextInput
          style={[styles.input, { backgroundColor: c.inputBg, borderColor: c.surfaceBorder, color: c.text }]}
          placeholder="Enter your email"
          placeholderTextColor={c.textFaint}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={[styles.label, { color: c.textSecondary }]}>Password</Text>
        <TextInput
          style={[styles.input, { backgroundColor: c.inputBg, borderColor: c.surfaceBorder, color: c.text }]}
          placeholder="Minimum 6 characters"
          placeholderTextColor={c.textFaint}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Text style={[styles.label, { color: c.textSecondary }]}>Confirm Password</Text>
        <TextInput
          style={[styles.input, { backgroundColor: c.inputBg, borderColor: c.surfaceBorder, color: c.text }]}
          placeholder="Re-enter your password"
          placeholderTextColor={c.textFaint}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity
          style={[styles.registerButton, { backgroundColor: c.accent }]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => router.back()}>
          <Text style={[styles.linkText, { color: c.accent }]}>
            Already have an account? Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: Platform.OS === 'ios' ? 60 : 48, justifyContent: 'center', minHeight: '100%' },
  header: { alignItems: 'center', paddingBottom: 20, paddingTop: 20 },
  logoImage: { width: 140, height: 140, marginBottom: 12, borderRadius: 32 },
  title: { fontSize: 32, fontWeight: '800', marginTop: 12, letterSpacing: -1 },
  subtitle: { fontSize: 16, marginTop: 4, opacity: 0.7 },
  form: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  input: { padding: 16, borderRadius: RADIUS, fontSize: 16, borderWidth: 1 },
  registerButton: { padding: 18, borderRadius: RADIUS, alignItems: 'center', marginTop: 32 },
  registerButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  linkButton: { marginTop: 20, alignItems: 'center', paddingBottom: 40 },
  linkText: { fontWeight: '600', fontSize: 14 },
});
