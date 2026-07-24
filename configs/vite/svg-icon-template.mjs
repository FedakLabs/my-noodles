/**
 * SVGR component template: first-class `size` / `color` props.
 * `color` defaults to `'inherit'` (overridable). Strokes use `currentColor`.
 *
 * Plain ESM so Next Turbopack can load it via `svgr.config.mjs`
 * (loader options must be JSON-serializable — no inline functions).
 */
export default function svgIconTemplate(
  { imports, interfaces, componentName, jsx, exports },
  { tpl },
) {
  return tpl`
${imports}
${interfaces}
const ${componentName} = ({ size = 16, color = 'inherit', style, ...rest }) => {
  // Set attrs + style so size wins over SVGR \`icon: true\` (1em) and parent font-size.
  const props = {
    ...rest,
    width: size,
    height: size,
    style: {
      width: size,
      height: size,
      flexShrink: 0,
      color,
      ...style,
    },
  };
  return ${jsx};
};
${exports}
`;
}
