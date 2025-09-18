export { ClassicProfessionalTemplate } from './ClassicProfessional';
export { SleekModernTemplate } from './SleekModern';
export { ElegantVisualTemplate } from './ElegantVisual';

export type { QuoteTemplateProps } from './types';

export enum TemplateType {
  CLASSIC_PROFESSIONAL = 'classic-professional',
  SLEEK_MODERN = 'sleek-modern',
  ELEGANT_VISUAL = 'elegant-visual',
}

export const templateNames = {
  [TemplateType.CLASSIC_PROFESSIONAL]: 'Classic Professional',
  [TemplateType.SLEEK_MODERN]: 'Sleek Modern',
  [TemplateType.ELEGANT_VISUAL]: 'Elegant & Visual',
};

export const templateDescriptions = {
  [TemplateType.CLASSIC_PROFESSIONAL]: 'Clean table layout with large logo and traditional invoice style',
  [TemplateType.SLEEK_MODERN]: 'Minimalist black design with bold headers and integrated payment',
  [TemplateType.ELEGANT_VISUAL]: 'Card-style layout with hero banner and visual elements',
};



