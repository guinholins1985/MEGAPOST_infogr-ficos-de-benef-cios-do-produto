export interface Benefit {
  title: string;
  description: string;
  icon: string;
}

export interface InfographicData {
  productName: string;
  headline: string;
  summary: string;
  benefits: Benefit[];
  productImageUrl?: string;
}

export type IconName = 'CheckCircle' | 'LightningBolt' | 'ShieldCheck' | 'Star' | 'Heart' | 'Rocket' | 'AcademicCap' | 'Adjustments' | 'Annotation' | 'Archive' | 'ArrowCircleUp' | 'Beaker' | 'Download' | 'DocumentDuplicate' | 'ZoomIn' | 'ZoomOut';