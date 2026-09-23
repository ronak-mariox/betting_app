import React, {memo, useMemo} from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {icons, IconName} from '../assets/icons';
import {scale} from '../theme';

type IconProps = {
  name: IconName;
  /**
   * Figma size in design px. Defaults to the size the icon was exported at,
   * so each glyph keeps the geometry the designer drew.
   */
  size?: number;
  /** Overrides the hex stroke/fill baked into the export (e.g. nav active state). */
  color?: string;
  style?: StyleProp<ViewStyle>;
};

/** Swap only explicit hex values — `none` and `white` (clip paths) stay put. */
const recolor = (xml: string, color: string) =>
  xml.replace(/(stroke|fill)="#[0-9a-fA-F]{3,8}"/g, `$1="${color}"`);

export const Icon = memo(({name, size, color, style}: IconProps) => {
  const icon = icons[name];
  const px = scale(size ?? icon.size);
  const xml = useMemo(
    () => (color ? recolor(icon.xml, color) : icon.xml),
    [icon.xml, color],
  );

  return <SvgXml xml={xml} width={px} height={px} style={style} />;
});

Icon.displayName = 'Icon';

export type {IconName};
