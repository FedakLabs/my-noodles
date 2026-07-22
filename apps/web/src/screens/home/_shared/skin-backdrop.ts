import type { SkinDefinition, SkinResult } from '@my-noodles/ui';

export function skinDefinitionToGradient(definition: SkinDefinition | null | undefined): string {
  if (!definition) {
    return 'linear-gradient(145deg, rgba(232, 93, 76, 0.16), rgba(251, 247, 242, 0.9))';
  }

  return `linear-gradient(145deg, ${definition.gradientStart}, ${definition.gradientEnd})`;
}

export function skinResultToGradient(skin: SkinResult): string {
  return skinDefinitionToGradient(skin.definition);
}

export function skinDefinitionToTint(definition: SkinDefinition | null | undefined, alpha = 0.35): string {
  if (!definition) {
    return `rgba(232, 93, 76, ${alpha})`;
  }

  return definition.accent;
}
