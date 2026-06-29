import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { colors, borderRadius, spacing } from '../theme';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  mode?: 'contained' | 'outlined' | 'text';
  icon?: string;
}

export const AppButton: React.FC<Props> = ({
  title,
  onPress,
  loading,
  disabled,
  mode = 'contained',
  icon,
}) => (
  <Button
    mode={mode}
    onPress={onPress}
    loading={loading}
    disabled={disabled || loading}
    icon={icon}
    style={styles.button}
    contentStyle={styles.content}
    labelStyle={styles.label}
    buttonColor={mode === 'contained' ? colors.primary : undefined}
    textColor={mode === 'contained' ? colors.white : colors.primary}
  >
    {title}
  </Button>
);

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: boolean;
  errorText?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  multiline?: boolean;
}

export const AppInput: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  secureTextEntry,
  error,
  errorText,
  keyboardType,
  multiline,
}) => {
  const { TextInput, HelperText } = require('react-native-paper');
  return (
    <View style={styles.inputWrap}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        mode="outlined"
        secureTextEntry={secureTextEntry}
        error={error}
        keyboardType={keyboardType}
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline]}
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
      />
      {error && errorText ? (
        <HelperText type="error" visible>{errorText}</HelperText>
      ) : null}
    </View>
  );
};

export const LoadingScreen = () => (
  <View style={styles.loading}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

export const EmptyState: React.FC<{ message: string; action?: () => void; actionLabel?: string }> = ({
  message,
  action,
  actionLabel,
}) => (
  <View style={styles.empty}>
    <Text variant="bodyLarge" style={styles.emptyText}>{message}</Text>
    {action && actionLabel && (
      <AppButton title={actionLabel} onPress={action} mode="outlined" />
    )}
  </View>
);

const styles = StyleSheet.create({
  button: { borderRadius: borderRadius.md, marginVertical: spacing.sm },
  content: { paddingVertical: spacing.sm },
  label: { fontSize: 16, fontWeight: '600' },
  input: { backgroundColor: colors.surface },
  inputWrap: { marginBottom: spacing.md },
  multiline: { minHeight: 100 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyText: { color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.md },
});
