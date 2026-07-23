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
const ${componentName} = ({ size, color = 'inherit', style, ...rest }) => {
  const props = {
    ...rest,
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
