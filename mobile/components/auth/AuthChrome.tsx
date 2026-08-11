import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { ButtonLoader } from '@/components/Skeleton';
import BrandMark from '@/components/BrandMark';
import { typography } from '@/src/theme/fonts';
import { authChrome } from '@/src/theme/tokens';

export function AuthBrand() {
  return <BrandMark size={36} showWordmark wordmarkSize={22} align="left" />;
}

export function AuthHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.heading}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

type AuthFieldProps = TextInputProps & {
  label: string;
  focused?: boolean;
  secureToggle?: boolean;
  secureVisible?: boolean;
  onToggleSecure?: () => void;
};

export function AuthField({
  label,
  focused,
  secureToggle,
  secureVisible,
  onToggleSecure,
  style,
  ...inputProps
}: AuthFieldProps) {
  const borderColor = focused ? authChrome.focused : authChrome.fieldBorder;

  if (secureToggle) {
    return (
      <View style={styles.fieldWrap}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.inputRow, { borderColor }]}>
          <TextInput
            {...inputProps}
            style={styles.inputFlex}
            placeholderTextColor={authChrome.inkFaint}
            secureTextEntry={!secureVisible}
          />
          <TouchableOpacity onPress={onToggleSecure} style={styles.eyeBtn} activeOpacity={0.6}>
            {secureVisible
              ? <EyeOff size={20} color={authChrome.inkMuted} />
              : <Eye size={20} color={authChrome.inkMuted} />}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        style={[styles.input, { borderColor }, style]}
        placeholderTextColor={authChrome.inkFaint}
      />
    </View>
  );
}

export function AuthButton({
  label,
  loading,
  onPress,
  disabled,
}: {
  label: string;
  loading?: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.button, { opacity: loading || disabled ? 0.7 : 1 }]}
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {loading ? (
        <ButtonLoader color={authChrome.onBlackLabel} />
      ) : (
        <Text style={styles.buttonLabel}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

export function AuthSwitch({
  prompt,
  action,
  onPress,
}: {
  prompt: string;
  action: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.switchRow}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="link"
      accessibilityLabel={`${prompt} ${action}`}
    >
      <Text style={styles.switchPrompt}>{prompt} </Text>
      <Text style={styles.switchAction}>{action}</Text>
    </TouchableOpacity>
  );
}

export function AuthFooter({ children }: { children: string }) {
  return <Text style={styles.footer}>{children}</Text>;
}

const styles = StyleSheet.create({
  heading: {
    marginTop: 36,
    marginBottom: 8,
  },
  title: {
    color: authChrome.ink,
    fontSize: 32,
    letterSpacing: -0.7,
    ...typography.headline,
  },
  subtitle: {
    marginTop: 8,
    color: authChrome.inkMuted,
    fontSize: 15,
    lineHeight: 22,
    ...typography.body,
  },
  fieldWrap: {
    marginTop: 18,
  },
  label: {
    fontSize: 13,
    marginBottom: 8,
    color: authChrome.inkMuted,
    ...typography.label,
  },
  input: {
    height: authChrome.controlHeight,
    paddingHorizontal: 16,
    borderRadius: authChrome.controlRadius,
    fontSize: 16,
    borderWidth: 1,
    backgroundColor: authChrome.field,
    color: authChrome.ink,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: authChrome.controlHeight,
    borderRadius: authChrome.controlRadius,
    borderWidth: 1,
    backgroundColor: authChrome.field,
  },
  inputFlex: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    color: authChrome.ink,
    height: '100%',
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  button: {
    height: authChrome.controlHeight,
    borderRadius: authChrome.controlRadius,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    backgroundColor: authChrome.onBlackFill,
  },
  buttonLabel: {
    color: authChrome.onBlackLabel,
    fontSize: 15,
    ...typography.sectionTitle,
  },
  switchRow: {
    marginTop: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchPrompt: {
    color: authChrome.inkMuted,
    fontSize: 14,
    ...typography.body,
  },
  switchAction: {
    color: authChrome.ink,
    fontSize: 14,
    ...typography.sectionTitle,
  },
  footer: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    color: authChrome.inkFaint,
    ...typography.body,
  },
});
