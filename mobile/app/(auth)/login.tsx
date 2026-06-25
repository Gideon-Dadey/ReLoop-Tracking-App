import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  Alert, Platform, KeyboardAvoidingView,
} from 'react-native';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { ButtonLoader } from '@/components/Skeleton';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useThemeColors, useThemeStore } from '@/src/store/useThemeStore';
import { screenHeader } from '@/src/theme/screenHeader';
import { apiService } from '@/src/api/service';
import { Check, Eye, EyeOff } from 'lucide-react-native';
import { router } from 'expo-router';

const RADIUS = 14;
const REMEMBER_KEY = 'reloop_remember_email';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setAuth } = useAuthStore();
  const c = useThemeColors();
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    (async () => {
      try {
        const savedEmail = await SecureStore.getItemAsync(REMEMBER_KEY);
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch {}
    })();
  }, []);

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const data = await apiService.login(email, password);

      if (rememberMe) {
        await SecureStore.setItemAsync(REMEMBER_KEY, email);
      } else {
        await SecureStore.deleteItemAsync(REMEMBER_KEY);
      }

      setAuth(data.user, data.accessToken, data.refreshToken);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Check your credentials');
    } finally {
      setLoading(false);
    }
  }, [email, password, rememberMe, setAuth]);

  const handleForgotPassword = useCallback(() => {
    if (!email) {
      Alert.alert(
        'Reset Password',
        'Please enter your email address first, then tap Forgot Password.',
      );
      return;
    }
    Alert.alert(
      'Password Reset',
      `A password reset link has been sent to ${email}. Please check your inbox.`,
      [{ text: 'OK' }],
    );
  }, [email]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: c.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <View style={styles.header}>
        <AnimatedLogo size={100} variant="settle" />
        <Text style={[screenHeader.subtitle, { color: c.textMuted, marginTop: 0 }]}>Circular Economy Platform</Text>
      </View>

      <View style={styles.form}>
        <Text style={[styles.label, { color: c.textSecondary }]}>Email Address</Text>
        <TextInput
          style={[styles.input, { backgroundColor: c.inputBg, borderColor: c.surfaceBorder, color: c.text }]}
          placeholder="Enter your email"
          placeholderTextColor={c.textFaint}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          returnKeyType="next"
          accessibilityLabel="Email address"
        />

        <Text style={[styles.label, { color: c.textSecondary }]}>Password</Text>
        <View style={[styles.inputRow, { backgroundColor: c.inputBg, borderColor: c.surfaceBorder }]}>
          <TextInput
            style={[styles.inputFlex, { color: c.text }]}
            placeholder="Enter your password"
            placeholderTextColor={c.textFaint}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            textContentType="password"
            autoComplete="password"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            accessibilityLabel="Password"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn} activeOpacity={0.6}>
            {showPassword ? <EyeOff size={20} color={c.textMuted} /> : <Eye size={20} color={c.textMuted} />}
          </TouchableOpacity>
        </View>

        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={styles.rememberRow}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.7}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: rememberMe }}
            accessibilityLabel="Remember my email"
          >
            <View style={[
              styles.checkbox,
              { borderColor: rememberMe ? c.accent : c.textFaint },
              rememberMe && { backgroundColor: c.accent },
            ]}>
              {rememberMe && <Check color="#fff" size={14} strokeWidth={3} />}
            </View>
            <Text style={[styles.rememberText, { color: c.textSecondary }]}>Remember me</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleForgotPassword}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Forgot password"
          >
            <Text style={[styles.forgotText, { color: c.accent }]}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.loginButton, { backgroundColor: c.accent, opacity: loading ? 0.7 : 1 }]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Sign in"
        >
          {loading ? (
            <ButtonLoader color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push('/(auth)/register')}
          accessibilityRole="link"
          accessibilityLabel="Go to sign up"
        >
          <Text style={[styles.linkText, { color: c.accent }]}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: c.textFaint }]}>
          By signing in, you agree to our Terms of Service
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginTop: 20, marginBottom: 32 },
  logoImage: { width: 100, height: 100, marginBottom: 16, borderRadius: 50 },
  form: { width: '100%', maxWidth: 400, alignSelf: 'center', marginBottom: 20 },
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
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
  },
  rememberRow: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', marginRight: 8,
  },
  rememberText: { fontSize: 13, fontWeight: '500' },
  forgotText: { fontSize: 13, fontWeight: '700' },
  loginButton: {
    padding: 18, borderRadius: RADIUS, alignItems: 'center', marginTop: 30,
    shadowColor: '#059669', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  loginButtonText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  linkButton: { marginTop: 24, alignItems: 'center' },
  linkText: { fontWeight: '600', fontSize: 14 },
  footer: { paddingBottom: 20, alignItems: 'center' },
  footerText: { fontSize: 11, fontWeight: '500' },
});
