import { Text, TextInput, StyleSheet, TextStyle } from 'react-native';
import { fontFamilyForWeight, fonts } from './fonts';

let applied = false;

/**
 * Applies Geist globally after fonts are loaded.
 * Resolves fontWeight → correct Geist file so weights render on iOS and Android.
 */
export function applyAppFonts() {
  if (applied) return;
  applied = true;

  const patchTextComponent = (Component: typeof Text | typeof TextInput) => {
    const comp = Component as any;
    const render = comp.render;
    if (!render) return;

    comp.render = function patchedRender(props: { style?: TextStyle | TextStyle[] }, ref: unknown) {
      const flat = StyleSheet.flatten(props.style) as TextStyle | undefined;
      const fontFamily = flat?.fontFamily ?? fontFamilyForWeight(flat?.fontWeight ?? '400');
      return render.call(this, {
        ...props,
        style: [{ fontFamily }, props.style],
      }, ref);
    };
  };

  patchTextComponent(Text);
  patchTextComponent(TextInput);

  const textDefaults = (Text as any).defaultProps ?? {};
  (Text as any).defaultProps = {
    ...textDefaults,
    style: StyleSheet.flatten([textDefaults.style, { fontFamily: fonts.regular }]),
  };

  const inputDefaults = (TextInput as any).defaultProps ?? {};
  (TextInput as any).defaultProps = {
    ...inputDefaults,
    style: StyleSheet.flatten([inputDefaults.style, { fontFamily: fonts.regular }]),
  };
}
