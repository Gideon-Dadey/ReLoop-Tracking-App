import React, { useState, useRef } from 'react';
import {
  StyleSheet, View, Alert, Platform, ScrollView, KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
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

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const { setAuth } = useAuthStore();
  const scrollViewRef = useRef<ScrollView>(null);

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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: authChrome.canvas }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.body}>
          <AuthBrand />
          <AuthHeading
            title="Create your account"
            subtitle="Join the loop in under a minute."
          />

          <AuthField
            label="Full name"
            placeholder="Your name"
            value={userName}
            onChangeText={setUserName}
            autoCapitalize="words"
            returnKeyType="next"
            textContentType="name"
            autoComplete="name"
            focused={focused === 'name'}
            onFocus={() => setFocused('name')}
            onBlur={() => setFocused(null)}
          />

          <AuthField
            label="Email"
            placeholder="name@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
            textContentType="emailAddress"
            autoComplete="email"
            focused={focused === 'email'}
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused(null)}
          />

          <AuthField
            label="Password"
            placeholder="Minimum 6 characters"
            value={password}
            onChangeText={setPassword}
            returnKeyType="next"
            textContentType="newPassword"
            autoComplete="password-new"
            focused={focused === 'password'}
            onFocus={() => {
              setFocused('password');
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }}
            onBlur={() => setFocused(null)}
            secureToggle
            secureVisible={showPassword}
            onToggleSecure={() => setShowPassword((v) => !v)}
          />

          <AuthField
            label="Confirm password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            returnKeyType="done"
            textContentType="newPassword"
            autoComplete="password-new"
            onSubmitEditing={handleRegister}
            focused={focused === 'confirm'}
            onFocus={() => {
              setFocused('confirm');
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }}
            onBlur={() => setFocused(null)}
            secureToggle
            secureVisible={showConfirm}
            onToggleSecure={() => setShowConfirm((v) => !v)}
          />

          <AuthButton label="Create account" loading={loading} onPress={handleRegister} />
          <AuthSwitch
            prompt="Already have an account?"
            action="Sign in"
            onPress={() => router.back()}
          />
        </View>

        <AuthFooter>
          By creating an account, you agree to our Terms of Service
        </AuthFooter>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: authChrome.canvas,
  },
  scrollContent: {
    paddingHorizontal: 24,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  body: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
});
