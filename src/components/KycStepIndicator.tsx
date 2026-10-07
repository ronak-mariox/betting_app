import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {colors, gradients, radius, scale, spacing, type} from '../theme';
import {Icon} from './Icon';

type KycStepIndicatorProps = {
  steps: readonly string[];
  /** 0-based index of the step being filled in. */
  current: number;
};

/**
 * Personal → Document → Review progress (Figma KycStepIndicator). Finished
 * steps turn green with a check, the current one is blue with a glow, the
 * rest are outlined; connectors after finished steps get the green→cyan fill.
 */
export const KycStepIndicator = ({steps, current}: KycStepIndicatorProps) => (
  <View
    style={styles.row}
    accessibilityRole="progressbar"
    accessibilityLabel={`Step ${current + 1} of ${steps.length}`}>
    {steps.map((label, index) => {
      const done = index < current;
      const active = index === current;
      const isLast = index === steps.length - 1;
      return (
        <View key={label} style={[styles.step, !isLast && styles.stepGrow]}>
          <View style={styles.node}>
            <View
              style={[
                styles.circle,
                done && styles.circleDone,
                active && styles.circleActive,
              ]}>
              {done ? (
                <Icon name="checkBox" size={12.998} />
              ) : (
                <Text style={[type.stepNumber, !active && styles.numberTodo]}>
                  {index + 1}
                </Text>
              )}
            </View>
            <Text
              style={[
                type.kycStepLabel,
                (done || active) && styles.labelReached,
              ]}>
              {label}
            </Text>
          </View>
          {!isLast ? (
            <View style={styles.connectorWrap}>
              {done ? (
                <LinearGradient
                  useAngle
                  angle={gradients.kycStepDone.angle}
                  colors={[...gradients.kycStepDone.colors]}
                  locations={[...gradients.kycStepDone.locations]}
                  style={styles.connector}
                />
              ) : (
                <View style={[styles.connector, styles.connectorTodo]} />
              )}
            </View>
          ) : null}
        </View>
      );
    })}
  </View>
);

const CIRCLE = scale(31.997);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.xxl, // 20
    paddingVertical: spacing.xl, // 16
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepGrow: {
    flex: 1,
  },
  node: {
    alignItems: 'center',
    gap: spacing.sm, // 6
  },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: scale(1.607),
    borderColor: colors.borderNeutral, // 15% white
  },
  circleDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  circleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    // Figma drop-shadow(0 0 7px rgba(30,136,229,0.45)).
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.45,
    shadowRadius: scale(7),
    elevation: 6,
  },
  numberTodo: {
    color: colors.textDim,
  },
  labelReached: {
    color: colors.accent,
  },
  connectorWrap: {
    flex: 1,
    paddingTop: spacing.xl, // 16 — centres the line on the circle
    paddingHorizontal: spacing.md, // 8
  },
  connector: {
    height: scale(1.992),
  },
  connectorTodo: {
    backgroundColor: colors.borderNav, // 8% white
  },
});
