import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { ButtonLoader } from '@/components/Skeleton';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useThemeColors, useThemeStore } from '@/src/store/useThemeStore';
import { screenHeader } from '@/src/theme/screenHeader';
import { apiService } from '@/src/api/service';
import { Eye, EyeOff } from 'lucide-react-native';
import { router } from 'expo-router';

const RADIUS = 14;

export default function RegisterScreen() {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { setAuth } = useAuthStore();
  const c = useThemeColors();
  const mode = useThemeStore((s) => s.mode);

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

  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
    <ScrollView
      ref={scrollViewRef}
      style={[styles.container, { backgroundColor: c.bg }]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <AnimatedLogo size={80} variant="settle" />
        <Text style={[screenHeader.authTitle, { color: c.text }]}>Create Account</Text>
        <Text style={[screenHeader.subtitle, { color: c.textMuted, marginTop: 6 }]}>
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
          returnKeyType="next"
          textContentType="name"
          autoComplete="name"
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
          returnKeyType="next"
          textContentType="emailAddress"
          autoComplete="email"
        />

        <Text style={[styles.label, { color: c.textSecondary }]}>Password</Text>
        <View style={[styles.inputRow, { backgroundColor: c.inputBg, borderColor: c.surfaceBorder }]}>
          <TextInput
            style={[styles.inputFlex, { color: c.text }]}
            placeholder="Minimum 6 characters"
            placeholderTextColor={c.textFaint}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            returnKeyType="next"
            textContentType="newPassword"
            autoComplete="password-new"
            onFocus={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn} activeOpacity={0.6}>
            {showPassword ? <EyeOff size={20} color={c.textMuted} /> : <Eye size={20} color={c.textMuted} />}
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: c.textSecondary }]}>Confirm Password</Text>
        <View style={[styles.inputRow, { backgroundColor: c.inputBg, borderColor: c.surfaceBorder }]}>
          <TextInput
            style={[styles.inputFlex, { color: c.text }]}
            placeholder="Re-enter your password"
            placeholderTextColor={c.textFaint}
            secureTextEntry={!showConfirm}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            returnKeyType="done"
            textContentType="newPassword"
            autoComplete="password-new"
            onSubmitEditing={handleRegister}
            onFocus={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn} activeOpacity={0.6}>
            {showConfirm ? <EyeOff size={20} color={c.textMuted} /> : <Eye size={20} color={c.textMuted} />}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.registerButton, { backgroundColor: c.accent }]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ButtonLoader color="#fff" />
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 48, paddingBottom: 40 },
  header: { alignItems: 'center', paddingBottom: 24, paddingTop: 16 },
  logoImage: { width: 80, height: 80, marginBottom: 16, borderRadius: 40 },
  form: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 8, marginTop: 18, letterSpacing: 0.2 },
  input: {
    padding: 16, borderRadius: RADIUS, fontSize: 16, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  inputFlex: { flex: 1, padding: 16, fontSize: 16 },
  eyeBtn: { paddingHorizontal: 14, paddingVertical: 16 },
  registerButton: {
    padding: 18, borderRadius: RADIUS, alignItems: 'center', marginTop: 32,
    shadowColor: '#059669', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  registerButtonText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  linkButton: { marginTop: 24, alignItems: 'center', paddingBottom: 40 },
  linkText: { fontWeight: '600', fontSize: 14 },
});
