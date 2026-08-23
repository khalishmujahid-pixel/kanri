export interface StationLayoutItem {
  id: string;
  name: string;
  isHighlight?: boolean;
  status?: 'ok' | 'issue' | 'normal';
  details?: string;
}

export interface WhyWhyItem {
  id: string;
  level: number; // 1, 2, 3
  label: string;
  description?: string;
  value?: string;
  isTrigger?: boolean;
}

export interface FlowchartNode {
  step: string;
  isProblem?: boolean;
  notes?: string;
}

export interface BackgroundData {
  layoutTitle: string;
  layoutImageUrl?: string;
  layoutImageCaption?: string;
  stations: StationLayoutItem[];
  problemTitle: string;
  problemDescription: string;
  activeEquipmentName?: string;
  standardFlow?: FlowchartNode[];
  actualFlow?: FlowchartNode[];
  rootCauseEffects?: string[];
  whyWhyTree?: {
    rootFault: string;
    nodes: WhyWhyItem[];
    guideline: string;
  };
  challenge: string;
}

export interface ImprovementImageItem {
  url: string;
  title?: string;
  caption?: string;
  typeBadge?: string;
}

export interface BeforeAfterAspect {
  id: string;
  aspectTitle: string;
  kadai: string;
  before: {
    title: string;
    description: string;
    bulletPoints: string[];
    illustrationType?: 'robot_position' | 'ergonomics' | 'inverter_alarm';
    imageUrl?: string;
    imageCaption?: string;
    galleryImages?: ImprovementImageItem[];
    warningTag: string;
  };
  after: {
    title: string;
    description: string;
    bulletPoints: string[];
    illustrationType?: 'robot_position' | 'ergonomics' | 'inverter_alarm';
    imageUrl?: string;
    imageCaption?: string;
    galleryImages?: ImprovementImageItem[];
    solutionTag: string;
  };
  results: Array<{
    text: string;
    isOk: boolean;
  }>;
  yokotenNote?: string;
}

export interface YokotenDiagnosticCell {
  station: string;
  subType?: 'LOWER' | 'UPPER' | 'UPPER 2' | 'SINGLE';
  value: string;
  status: 'normal' | 'warning' | 'danger';
}

export interface YokotenDiagnosticRow {
  no: number;
  paramName: string;
  standard: string;
  readings: YokotenDiagnosticCell[];
}

export interface YokotenTimelineItem {
  station: string;
  agustus: { w1: boolean; w2: boolean; w3: boolean; w4: boolean };
  september: { w1: boolean; w2: boolean; w3: boolean; w4: boolean };
}

export interface YokotenData {
  title: string;
  diagnosticRows: YokotenDiagnosticRow[];
  stationHeaders: Array<{ name: string; spans: number; subTypes: string[] }>;
  timelineRows: YokotenTimelineItem[];
  targetCompletion: string;
}

export interface ImprovementProject {
  id: string;
  characterId?: string;
  title: string;
  code: string;
  picName: string;
  regNumber: string;
  unitShift: string;
  period: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'YOKOTEN';
  background: BackgroundData;
  aspects: BeforeAfterAspect[];
  yokoten?: YokotenData;
}
