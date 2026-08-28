export type CategoryKey = 'idea' | 'pm' | 'improvement' | 'safety';

/** A single Kanban task in a PM schedule */
export interface PmKanbanTask {
  kanbanType: 'A' | 'B' | 'C' | 'D';
  planDay: number;       // 1–31
  actualDay?: number;    // 1–31 (when executed)
  done: boolean;         // true if executed / green in actual row
}

/** Schedule entry per equipment in a monthly PM sheet */
export interface PmEquipmentEntry {
  no: number;
  coreEquipment: string;
  equipmentName: string;
  area: string;
  noKanban: string;
  tasks: PmKanbanTask[];
}

/** A single PM document entry (monthly schedule image/pdf + metadata) */
export interface PmDocument {
  id: string;
  title: string;
  year: number;
  month: number; // 1–12
  imageUrl: string;
  pdfUrl?: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PLANNED';
  notes?: string;
  equipmentSchedule?: PmEquipmentEntry[];
}

export interface CategoryData {
  id: CategoryKey;
  label: string;
  code: string;
  tagline: string;
  description: string;
  status: string;
  recordsCount: number;
  lastUpdated: string;
  placeholderItems: Array<{
    id: string;
    title: string;
    status: string;
    date: string;
    summary: string;
  }>;
  /** PM-specific: list of monthly schedule documents */
  pmDocuments?: PmDocument[];
}

export interface Character {
  id: string;
  code: string; // e.g. "C01"
  name: string; // e.g. "Character 01"
  role: string;
  department: string;
  unit: string;
  zone: string;
  status: 'ACTIVE' | 'STANDBY' | 'ON_DUTY';
  image: string;
  portrait: string;
  summary: string;
  specialization: string;
  categories: {
    idea: CategoryData;
    pm: CategoryData;
    improvement: CategoryData;
    safety: CategoryData;
  };
  /** Team Leader fields */
  isTeamLeader?: boolean;    // true for TL characters
  leaderOf?: string[];       // array of member character IDs
  tlVideoUrl?: string;       // URL for TL welcome video overlay
}
