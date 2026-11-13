import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { colors, fontFamily, radii, spacing } from "@/constants/theme";

export type FilterOption<T extends string> = {
  value: T;
  label: string;
};

type FilterPillsProps<T extends string> = {
  options: FilterOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
};

export function FilterPills<T extends string>({
  options,
  selected,
  onSelect,
}: FilterPillsProps<T>) {
  return (
    <ScrollView
      horizontal
      contentContainerStyle={styles.container}
      showsHorizontalScrollIndicator={false}
    >
      {options.map((option) => {
        const active = option.value === selected;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={[styles.pill, active && styles.pillActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  pill: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 42,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  pillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  label: {
    color: "#475569",
    fontFamily: fontFamily.medium,
    fontSize: 14,
  },
  labelActive: {
    color: colors.surface,
  },
});
