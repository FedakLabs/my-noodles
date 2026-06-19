import type { CSSProperties } from 'react';

import { baseSkinCssVars, hashSlugToSkinDefinition, skinDefinitionToCssVars } from './cssVars';
import { brandSkins, categorySkins, countrySkins, normalizeSkinKey } from './registry';
import type { SkinInput, SkinResult } from './types';

export function resolveSkin(input: SkinInput): SkinResult {
  const brand = input.brand?.trim();
  if (brand) {
    const key = normalizeSkinKey(brand);
    const definition = brandSkins[key];
    if (definition) {
      return {
        source: 'brand',
        key,
        cssVars: skinDefinitionToCssVars(definition),
        definition,
      };
    }
  }

  const country = input.country?.trim();
  if (country) {
    const key = normalizeSkinKey(country);
    const definition = countrySkins[key];
    if (definition) {
      return {
        source: 'country',
        key,
        cssVars: skinDefinitionToCssVars(definition),
        definition,
      };
    }
  }

  const category = input.category?.trim();
  if (category) {
    const key = normalizeSkinKey(category);
    const definition = categorySkins[key];
    if (definition) {
      return {
        source: 'category',
        key,
        cssVars: skinDefinitionToCssVars(definition),
        definition,
      };
    }
  }

  const slug = input.slug?.trim();
  if (slug) {
    const definition = hashSlugToSkinDefinition(slug);
    return {
      source: 'hash',
      key: slug,
      cssVars: skinDefinitionToCssVars(definition),
      definition,
    };
  }

  return {
    source: 'base',
    key: 'base',
    cssVars: baseSkinCssVars,
    definition: null,
  };
}

export function skinVarsToStyle(cssVars: Record<string, string>): CSSProperties {
  return cssVars;
}
