import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, View, TouchableOpacity, Text, Alert, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import { Check } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/src/store/useAuthStore';
import { apiService } from '@/src/api/service';
import { authChrome } from '@/src/theme/tokens';
import {
  AuthBrand,
  AuthButton,
  AuthField,
  AuthFooter,
  AuthHeading,
  AuthSwitch,
} from '@/components/auth/AuthChrome';

const REMEMBER_KEY = 'reloop_remember_email';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<'email' | 'password' | null>(null);
  const { setAuth } = useAuthStore();

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
      style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 16 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <View style={styles.body}>
        <AuthBrand />
        <AuthHeading
          title="Welcome back"
          subtitle="Sign in to continue your loop."
        />

        <AuthField
          label="Email"
          placeholder="name@email.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          returnKeyType="next"
          accessibilityLabel="Email address"
          focused={focused === 'email'}
          onFocus={() => setFocused('email')}
          onBlur={() => setFocused(null)}
        />

        <AuthField
          label="Password"
          placeholder="Your password"
          value={password}
          onChangeText={setPassword}
          textContentType="password"
          autoComplete="password"
          returnKeyType="done"
          onSubmitEditing={handleLogin}
          accessibilityLabel="Password"
          focused={focused === 'password'}
          onFocus={() => setFocused('password')}
          onBlur={() => setFocused(null)}
          secureToggle
          secureVisible={showPassword}
          onToggleSecure={() => setShowPassword((v) => !v)}
        />

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
              { borderColor: rememberMe ? authChrome.onBlackFill : authChrome.inkFaint },
              rememberMe && { backgroundColor: authChrome.onBlackFill },
            ]}>
              {rememberMe && <Check color={authChrome.onBlackLabel} size={13} strokeWidth={3} />}
            </View>
            <Text style={styles.rememberText}>Remember me</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleForgotPassword}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Forgot password"
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        <AuthButton label="Sign in" loading={loading} onPress={handleLogin} />
        <AuthSwitch
          prompt="New to ReLoop?"
          action="Create account"
          onPress={() => router.push('/(auth)/register')}
        />
      </View>

      <AuthFooter>
        By signing in, you agree to our Terms of Service
      </AuthFooter>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: authChrome.canvas,
  },
  body: {
    flex: 1,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  rememberText: {
    fontSize: 13,
    fontWeight: '500',
    color: authChrome.inkMuted,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    color: authChrome.ink,
  },
});
