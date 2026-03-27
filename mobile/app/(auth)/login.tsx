import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useThemeStore, useThemeColors } from '@/src/store/useThemeStore';
import { apiService } from '@/src/api/service';
import { Sun, Moon, Check } from 'lucide-react-native';
import { router } from 'expo-router';

const RADIUS = 10;
const REMEMBER_KEY = 'reloop_remember_me';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const c = useThemeColors();
  const { mode, toggleTheme } = useThemeStore();

  // Load saved credentials on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(REMEMBER_KEY);
        if (saved) {
          const { email: savedEmail, password: savedPassword } = JSON.parse(saved);
          setEmail(savedEmail);
          setPassword(savedPassword);
          setRememberMe(true);
        }
      } catch {}
    })();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const data = await apiService.login(email, password);

      // Save or clear remembered credentials
      if (rememberMe) {
        await AsyncStorage.setItem(REMEMBER_KEY, JSON.stringify({ email, password }));
      } else {
        await AsyncStorage.removeItem(REMEMBER_KEY);
      }

      setAuth(data.user, data.accessToken, data.refreshToken);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Check your credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
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
  };

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <TouchableOpacity onPress={toggleTheme} style={styles.themeBtn} activeOpacity={0.7}>
        {mode === 'dark' ? (
          <Sun color={c.textMuted} size={18} strokeWidth={1.8} />
        ) : (
          <Moon color={c.textMuted} size={18} strokeWidth={1.8} />
        )}
      </TouchableOpacity>

      <View style={styles.header}>
        <Image source={require('../../assets/reloop.png')} style={styles.logoImage} />
        <Text style={[styles.subtitle, { color: c.textMuted, marginTop: 0 }]}>Circular Economy Platform</Text>
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
        />

        <Text style={[styles.label, { color: c.textSecondary }]}>Password</Text>
        <TextInput
          style={[styles.input, { backgroundColor: c.inputBg, borderColor: c.surfaceBorder, color: c.text }]}
          placeholder="Enter your password"
          placeholderTextColor={c.textFaint}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Remember Me & Forgot Password Row */}
        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={styles.rememberRow}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.7}
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

          <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
            <Text style={[styles.forgotText, { color: c.accent }]}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.loginButton, { backgroundColor: c.accent }]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/(auth)/register')}>
          <Text style={[styles.linkText, { color: c.accent }]}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: c.textFaint }]}>
          By signing in, you agree to our Terms of Service
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  themeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 40,
    right: 20,
    width: 40, height: 40,
    borderRadius: RADIUS,
    justifyContent: 'center', alignItems: 'center',
    zIndex: 10,
  },
  header: { alignItems: 'center', marginTop: 40, marginBottom: 30 },
  logoImage: { width: 140, height: 140, marginBottom: 12, borderRadius: 32 },
  title: { fontSize: 34, fontWeight: '800', marginTop: 4, letterSpacing: -1 },
  subtitle: { fontSize: 16, marginTop: 4, opacity: 0.7 },
  form: { width: '100%', maxWidth: 400, alignSelf: 'center', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  input: { padding: 16, borderRadius: RADIUS, fontSize: 16, borderWidth: 1 },

  // Remember Me & Forgot Password
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  rememberText: {
    fontSize: 13,
    fontWeight: '500',
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
  },

  loginButton: { padding: 18, borderRadius: RADIUS, alignItems: 'center', marginTop: 28 },
  loginButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  linkButton: { marginTop: 20, alignItems: 'center' },
  linkText: { fontWeight: '600', fontSize: 14 },
  footer: { paddingBottom: 20, alignItems: 'center' },
  footerText: { fontSize: 12 },
});
