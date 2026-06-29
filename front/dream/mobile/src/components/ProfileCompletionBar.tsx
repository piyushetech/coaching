import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { colors, spacing } from '../theme';

interface Props {
  label: string;
  percentage: number;
}

export const ProfileCompletionBar: React.FC<Props> = ({ label, percentage }) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.percent}>{percentage}%</Text>
    </View>
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${percentage}%` }]} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { marginVertical: spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  label: { fontSize: 13, color: colors.textSecondary },
  percent: { fontSize: 13, fontWeight: '600', color: colors.primary },
  track: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
});
