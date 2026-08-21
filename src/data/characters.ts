import type { Character } from '../types/character';

export const INITIAL_CHARACTERS: Character[] = [
  {
    id: 'c01',
    code: '01223122',
    name: 'DWI PURNOMO',
    role: 'Team Member',
    department: 'Maintenance',
    unit: 'Shift RED',
    zone: 'Welding Body#2',
    status: 'ACTIVE',
    image: '/assets/characters/dwi_purnomo.jpg',
    portrait: '/assets/characters/dwi_purnomo.jpg',
    summary: 'Maintenance Team Member specializing in Welding Body#2 equipment reliability and technical response.',
    specialization: 'Welding Body#2 Maintenance & Operations',
    categories: {
      idea: {
        id: 'idea',
        label: 'IDEA',
        code: 'SEC-01',
        tagline: 'Innovation & Suggestion System',
        description: 'Repository of ideas and proactive proposals for operational efficiency and equipment reliability.',
        status: 'READY FOR DATA',
        recordsCount: 0,
        lastUpdated: 'Pending Data Input',
        placeholderItems: [
          {
            id: 'IDEA-001',
            title: 'Idea Proposal System Template',
            status: 'INITIALIZED',
            date: 'Phase 2',
            summary: 'Category ready for standardized proposal submissions and Kaizen suggestions.'
          }
        ]
      },
      pm: {
        id: 'pm',
        label: 'PM',
        code: 'SEC-02',
        tagline: 'Preventive Maintenance Execution',
        description: 'Tracking and scheduling for preventive maintenance tasks, inspection logs, and machine uptime assurance.',
        status: 'READY FOR DATA',
        recordsCount: 0,
        lastUpdated: 'Pending Data Input',
        placeholderItems: [
          {
            id: 'PM-001',
            title: 'Preventive Maintenance Schedule Structure',
            status: 'INITIALIZED',
            date: 'Phase 2',
            summary: 'Routine maintenance logs and equipment calibration records.'
          }
        ]
      },
      improvement: {
        id: 'improvement',
        label: 'IMPROVEMENT',
        code: 'SEC-03',
        tagline: 'Kaizen & Process Optimization',
        description: 'Implemented improvement projects, breakdown reduction initiatives, and line cycle enhancements.',
        status: 'ACTIVE — 1 KAIZEN PROJECT',
        recordsCount: 1,
        lastUpdated: 'Agustus 2026',
        placeholderItems: [
          {
            id: 'KAIZEN-UBF-01',
            title: 'Eliminasi Potensi Not-Run Siklus Model Change Lokator NC Mesin GBL ST#5 UBF',
            status: 'COMPLETED',
            date: '2026-08',
            summary: 'Modifikasi logika program PLC timer interlock dan cover deflector sensor proximity anti-spatter pada mesin GBL ST#5 UBF.'
          }
        ]
      },
      safety: {
        id: 'safety',
        label: 'SAFETY',
        code: 'SEC-04',
        tagline: 'Safety Compliance & Zero Incident Protocol',
        description: 'Near-miss reporting, safety patrol observations, 5S compliance, and Red Zone risk assessments.',
        status: 'READY FOR DATA',
        recordsCount: 0,
        lastUpdated: 'Pending Data Input',
        placeholderItems: [
          {
            id: 'SAF-001',
            title: 'Red Zone Safety Verification Standard',
            status: 'INITIALIZED',
            date: 'Phase 2',
            summary: 'Zero incident protocols and workplace safety compliance logs.'
          }
        ]
      }
    }
  },
  {
    id: 'c02',
    code: '01223123',
    name: 'DENNY NURIANTO',
    role: 'Team Member',
    department: 'Maintenance',
    unit: 'Shift RED',
    zone: 'Welding Body#2 / Under Body',
    status: 'ACTIVE',
    image: '/assets/characters/denny_nurianto.jpg',
    portrait: '/assets/characters/denny_nurianto.jpg',
    summary: 'Maintenance Team Member assigned to Welding Body#2 / Under Body (Shift RED).',
    specialization: 'Welding Body#2 Under Body Maintenance & Technical Response',
    categories: {
      idea: {
        id: 'idea',
        label: 'IDEA',
        code: 'SEC-01',
        tagline: 'Innovation & Suggestion System',
        description: 'Repository of ideas and proactive proposals for operational efficiency and equipment reliability.',
        status: 'READY FOR DATA',
        recordsCount: 0,
        lastUpdated: 'Pending Data Input',
        placeholderItems: [
          {
            id: 'IDEA-001',
            title: 'Idea Proposal System Template',
            status: 'INITIALIZED',
            date: 'Phase 2',
            summary: 'Category ready for standardized proposal submissions and Kaizen suggestions.'
          }
        ]
      },
      pm: {
        id: 'pm',
        label: 'PM',
        code: 'SEC-02',
        tagline: 'Preventive Maintenance Execution',
        description: 'Tracking and scheduling for preventive maintenance tasks, inspection logs, and machine uptime assurance.',
        status: 'READY FOR DATA',
        recordsCount: 0,
        lastUpdated: 'Pending Data Input',
        placeholderItems: [
          {
            id: 'PM-001',
            title: 'Preventive Maintenance Schedule Structure',
            status: 'INITIALIZED',
            date: 'Phase 2',
            summary: 'Routine maintenance logs and equipment calibration records.'
          }
        ]
      },
      improvement: {
        id: 'improvement',
        label: 'IMPROVEMENT',
        code: 'SEC-03',
        tagline: 'Kaizen & Process Optimization',
        description: 'Implemented improvement projects, breakdown reduction initiatives, and line cycle enhancements.',
        status: 'READY FOR DATA',
        recordsCount: 0,
        lastUpdated: 'Pending Data Input',
        placeholderItems: [
          {
            id: 'IMP-001',
            title: 'Continuous Improvement Framework',
            status: 'INITIALIZED',
            date: 'Phase 2',
            summary: 'Standardized format for tracking line enhancements and technical modifications.'
          }
        ]
      },
      safety: {
        id: 'safety',
        label: 'SAFETY',
        code: 'SEC-04',
        tagline: 'Safety Compliance & Zero Incident Protocol',
        description: 'Near-miss reporting, safety patrol observations, 5S compliance, and Red Zone risk assessments.',
        status: 'READY FOR DATA',
        recordsCount: 0,
        lastUpdated: 'Pending Data Input',
        placeholderItems: [
          {
            id: 'SAF-001',
            title: 'Red Zone Safety Verification Standard',
            status: 'INITIALIZED',
            date: 'Phase 2',
            summary: 'Zero incident protocols and workplace safety compliance logs.'
          }
        ]
      }
    }
  },
  {
    id: 'c03',
    code: '01121425',
    name: 'AZIZ MUSLIM',
    role: 'Team Member',
    department: 'Maintenance',
    unit: 'Shift RED',
    zone: 'Welding Body#2 / Main Body',
    status: 'ACTIVE',
    image: '/assets/characters/aziz_muslim.jpg',
    portrait: '/assets/characters/aziz_muslim.jpg',
    summary: 'Maintenance Team Member assigned to Welding Body#2 / Main Body (Shift RED).',
    specialization: 'Welding Body#2 Main Body Maintenance & Technical Response',
    categories: {
      idea: {
        id: 'idea',
        label: 'IDEA',
        code: 'SEC-01',
        tagline: 'Innovation & Suggestion System',
        description: 'Repository of ideas and proactive proposals for operational efficiency and equipment reliability.',
        status: 'READY FOR DATA',
        recordsCount: 0,
        lastUpdated: 'Pending Data Input',
        placeholderItems: [
          {
            id: 'IDEA-001',
            title: 'Idea Proposal System Template',
            status: 'INITIALIZED',
            date: 'Phase 2',
            summary: 'Category ready for standardized proposal submissions and Kaizen suggestions.'
          }
        ]
      },
      pm: {
        id: 'pm',
        label: 'PM',
        code: 'SEC-02',
        tagline: 'Preventive Maintenance Execution',
        description: 'Tracking and scheduling for preventive maintenance tasks, inspection logs, and machine uptime assurance.',
        status: 'READY FOR DATA',
        recordsCount: 0,
        lastUpdated: 'Pending Data Input',
        placeholderItems: [
          {
            id: 'PM-001',
            title: 'Preventive Maintenance Schedule Structure',
            status: 'INITIALIZED',
            date: 'Phase 2',
            summary: 'Routine maintenance logs and equipment calibration records.'
          }
        ]
      },
      improvement: {
        id: 'improvement',
        label: 'IMPROVEMENT',
        code: 'SEC-03',
        tagline: 'Kaizen & Process Optimization',
        description: 'Implemented improvement projects, breakdown reduction initiatives, and line cycle enhancements.',
        status: 'READY FOR DATA',
        recordsCount: 0,
        lastUpdated: 'Pending Data Input',
        placeholderItems: [
          {
            id: 'IMP-001',
            title: 'Continuous Improvement Framework',
            status: 'INITIALIZED',
            date: 'Phase 2',
            summary: 'Standardized format for tracking line enhancements and technical modifications.'
          }
        ]
      },
      safety: {
        id: 'safety',
        label: 'SAFETY',
        code: 'SEC-04',
        tagline: 'Safety Compliance & Zero Incident Protocol',
        description: 'Near-miss reporting, safety patrol observations, 5S compliance, and Red Zone risk assessments.',
        status: 'READY FOR DATA',
        recordsCount: 0,
        lastUpdated: 'Pending Data Input',
        placeholderItems: [
          {
            id: 'SAF-001',
            title: 'Red Zone Safety Verification Standard',
            status: 'INITIALIZED',
            date: 'Phase 2',
            summary: 'Zero incident protocols and workplace safety compliance logs.'
          }
        ]
      }
    }
  },
  {
    id: 'c04',
    code: '01830748',
    name: 'PILAR PRATAMA PUTRA',
    role: 'Team Member',
    department: 'Maintenance',
    unit: 'Shift RED',
    zone: 'Welding Body#2 / Main Body',
    status: 'ACTIVE',
    image: '/assets/characters/pilar_pratama_putra.jpg',
    portrait: '/assets/characters/pilar_pratama_putra.jpg',
    summary: 'Maintenance Team Member assigned to Welding Body#2 / Main Body (Shift RED).',
    specialization: 'Welding Body#2 Main Body Maintenance & Technical Response',
    categories: {
      idea: {
        id: 'idea',
        label: 'IDEA',
        code: 'SEC-01',
        tagline: 'Innovation & Suggestion System',
        description: 'Repository of ideas and proactive proposals for operational efficiency and equipment reliability.',
        status: 'READY FOR DATA',
        recordsCount: 0,
        lastUpdated: 'Pending Data Input',
        placeholderItems: [
          {
            id: 'IDEA-001',
            title: 'Idea Proposal System Template',
            status: 'INITIALIZED',
            date: 'Phase 2',
            summary: 'Category ready for standardized proposal submissions and Kaizen suggestions.'
          }
        ]
      },
      pm: {
        id: 'pm',
        label: 'PM',
        code: 'SEC-02',
        tagline: 'Preventive Maintenance Execution',
        description: 'Tracking and scheduling for preventive maintenance tasks, inspection logs, and machine uptime assurance.',
        status: 'READY FOR DATA',
        recordsCount: 0,
        lastUpdated: 'Pending Data Input',
        placeholderItems: [
          {
            id: 'PM-001',
            title: 'Preventive Maintenance Schedule Structure',
            status: 'INITIALIZED',
            date: 'Phase 2',
            summary: 'Routine maintenance logs and equipment calibration records.'
          }
        ]
      },
      improvement: {
        id: 'improvement',
        label: 'IMPROVEMENT',
        code: 'SEC-03',
        tagline: 'Kaizen & Process Optimization',
        description: 'Implemented improvement projects, breakdown reduction initiatives, and line cycle enhancements.',
        status: 'READY FOR DATA',
        recordsCount: 0,
        lastUpdated: 'Pending Data Input',
        placeholderItems: [
          {
            id: 'IMP-001',
            title: 'Continuous Improvement Framework',
            status: 'INITIALIZED',
            date: 'Phase 2',
            summary: 'Standardized format for tracking line enhancements and technical modifications.'
          }
        ]
      },
      safety: {
        id: 'safety',
        label: 'SAFETY',
        code: 'SEC-04',
        tagline: 'Safety Compliance & Zero Incident Protocol',
        description: 'Near-miss reporting, safety patrol observations, 5S compliance, and Red Zone risk assessments.',
        status: 'READY FOR DATA',
        recordsCount: 0,
        lastUpdated: 'Pending Data Input',
        placeholderItems: [
          {
            id: 'SAF-001',
            title: 'Red Zone Safety Verification Standard',
            status: 'INITIALIZED',
            date: 'Phase 2',
            summary: 'Zero incident protocols and workplace safety compliance logs.'
          }
        ]
      }
    }
  },
  {
    id: 'c05',
    code: '01121759',
    name: 'KURDI KURNIAWAN',
    role: 'Team Member',
    department: 'Maintenance',
    unit: 'Shift RED',
    zone: 'Welding Body#2 / Shell Body SA',
    status: 'ACTIVE',
    image: '/assets/characters/kurdi_kurniawan.jpg',
    portrait: '/assets/characters/kurdi_kurniawan.jpg',
    summary: 'Maintenance Team Member assigned to Welding Body#2 / Shell Body SA (Shift RED).',
    specialization: 'Welding Body#2 Shell Body SA Maintenance & Technical Response',
    categories: {
      idea: {
        id: 'idea',
        label: 'IDEA',
        code: 'SEC-01',
        tagline: 'Innovation & Suggestion System',
        description: 'Repository of ideas and proactive proposals for operational efficiency and equipment reliability.',
        status: 'READY FOR DATA',
        recordsCount: 0,
        lastUpdated: 'Pending Data Input',
        placeholderItems: [
          {
            id: 'IDEA-001',
            title: 'Idea Proposal System Template',
            status: 'INITIALIZED',
            date: 'Phase 2',
            summary: 'Category ready for standardized proposal submissions and Kaizen suggestions.'
          }
        ]
      },
      pm: {
        id: 'pm',
        label: 'PM',
        code: 'SEC-02',
        tagline: 'Preventive Maintenance Execution',
        description: 'Tracking and scheduling for preventive maintenance tasks, inspection logs, and machine uptime assurance.',
        status: 'ACTIVE — 1 DOCUMENT',
        recordsCount: 1,
        lastUpdated: 'Agustus 2026',
        placeholderItems: [
          {
            id: 'PM-001',
            title: 'Monthly Schedule PM Body#2 Red Shift — Agustus 2026',
            status: 'COMPLETED',
            date: '2026-08',
            summary: 'Jadwal PM bulanan Shell Body SA, mencakup seluruh peralatan core equipment Shift RED untuk bulan Agustus 2026.'
          }
        ],
        pmDocuments: [
          {
            id: 'PM-C05-2026-08',
            title: 'Monthly Schedule PM Body#2 Red Shift',
            year: 2026,
            month: 8,
            imageUrl: '/assets/documents/pm_c05_2026_08.png',
            pdfUrl: '/assets/documents/pm_c05_2026_08.pdf',
            status: 'COMPLETED',
            notes: 'PIC: Kurdi K. | TL: Tekatno | Area: Shell Body',
            equipmentSchedule: [
              {
                no: 1,
                coreEquipment: 'Robot Matehan BX',
                equipmentName: 'HDR2-1',
                area: 'SB ENGINE HOOD',
                noKanban: 'R161-000',
                tasks: [
                  { kanbanType: 'A', planDay: 3, actualDay: 3, done: true },
                  { kanbanType: 'C', planDay: 23, done: false }
                ]
              },
              {
                no: 2,
                coreEquipment: 'Robot Matehan BX',
                equipmentName: 'BDH2-1',
                area: 'SB BACK DOOR',
                noKanban: 'R163-000',
                tasks: [
                  { kanbanType: 'A', planDay: 4, actualDay: 4, done: true },
                  { kanbanType: 'C', planDay: 23, done: false }
                ]
              },
              {
                no: 3,
                coreEquipment: 'Robot Sealer BX',
                equipmentName: 'HDR 1-1',
                area: 'SB ENGINE HOOD',
                noKanban: 'R167-000',
                tasks: [
                  { kanbanType: 'A', planDay: 5, actualDay: 5, done: true }
                ]
              },
              {
                no: 4,
                coreEquipment: 'Robot Roller BX',
                equipmentName: 'HDR 3-2',
                area: 'SB ENGINE HOOD',
                noKanban: 'R180-000',
                tasks: [
                  { kanbanType: 'A', planDay: 6, actualDay: 6, done: true }
                ]
              },
              {
                no: 5,
                coreEquipment: 'Robot Roller BX',
                equipmentName: 'HDR 3-4',
                area: 'SB ENGINE HOOD',
                noKanban: 'R182-000',
                tasks: [
                  { kanbanType: 'A', planDay: 7, done: false }
                ]
              },
              {
                no: 6,
                coreEquipment: 'Robot Roller BX',
                equipmentName: 'BDH 3-2',
                area: 'SB BACK DOOR',
                noKanban: 'R184-000',
                tasks: [
                  { kanbanType: 'A', planDay: 10, done: false }
                ]
              },
              {
                no: 7,
                coreEquipment: 'Robot Roller BX',
                equipmentName: 'BDH 3-4',
                area: 'SB BACK DOOR',
                noKanban: 'R186-000',
                tasks: [
                  { kanbanType: 'A', planDay: 11, done: false }
                ]
              },
              {
                no: 8,
                coreEquipment: 'Hemming Machine',
                equipmentName: 'FR DOOR LH D26A',
                area: 'SB FD LH D26A',
                noKanban: 'H005-000-A',
                tasks: [
                  { kanbanType: 'A', planDay: 12, done: false }
                ]
              },
              {
                no: 9,
                coreEquipment: 'Hemming Machine',
                equipmentName: 'RR DOOR RH D26A',
                area: 'SB RD RH D26A',
                noKanban: 'H006-000-A',
                tasks: [
                  { kanbanType: 'A', planDay: 13, done: false }
                ]
              },
              {
                no: 10,
                coreEquipment: 'Hemming Machine',
                equipmentName: 'FR DOOR RH D03B',
                area: 'SB FD RH D03B',
                noKanban: 'H014-000-A',
                tasks: [
                  { kanbanType: 'A', planDay: 14, done: false }
                ]
              },
              {
                no: 11,
                coreEquipment: 'Hemming Machine',
                equipmentName: 'RR DOOR RH D03B',
                area: 'SB RD RH D03B',
                noKanban: 'H016-000-A',
                tasks: [
                  { kanbanType: 'A', planDay: 18, done: false }
                ]
              },
              {
                no: 12,
                coreEquipment: 'Loader',
                equipmentName: 'LOADING CONVEYOR',
                area: 'SBF',
                noKanban: 'G025-000',
                tasks: [
                  { kanbanType: 'B', planDay: 1, actualDay: 1, done: true },
                  { kanbanType: 'A', planDay: 19, done: false }
                ]
              },
              {
                no: 13,
                coreEquipment: 'Running Fork',
                equipmentName: 'RUNNING FORK',
                area: 'SBF',
                noKanban: 'G027-000',
                tasks: [
                  { kanbanType: 'B', planDay: 8, actualDay: 8, done: true },
                  { kanbanType: 'A', planDay: 20, done: false }
                ]
              },
              {
                no: 14,
                coreEquipment: 'Lifter Pneumatic',
                equipmentName: 'LIFTER TOSHO',
                area: 'SBF',
                noKanban: 'G029-000',
                tasks: [
                  { kanbanType: 'B', planDay: 8, actualDay: 8, done: true },
                  { kanbanType: 'A', planDay: 21, done: false }
                ]
              },
              {
                no: 15,
                coreEquipment: 'Jig PLC',
                equipmentName: 'ROLLER HEMMING HOOD',
                area: 'SB ENGINE HOOD',
                noKanban: 'J233-000',
                tasks: [
                  { kanbanType: 'B', planDay: 15, actualDay: 15, done: true },
                  { kanbanType: 'A', planDay: 24, done: false }
                ]
              },
              {
                no: 16,
                coreEquipment: 'Servo Dies',
                equipmentName: 'HOOD SERVO',
                area: 'SB ENGINE HOOD',
                noKanban: 'R190-000',
                tasks: [
                  { kanbanType: 'B', planDay: 15, done: false },
                  { kanbanType: 'A', planDay: 27, done: false }
                ]
              },
              {
                no: 17,
                coreEquipment: 'Jig PLC',
                equipmentName: 'UFA#2 D37',
                area: 'UBF',
                noKanban: 'J237-000',
                tasks: [
                  { kanbanType: 'B', planDay: 22, done: false },
                  { kanbanType: 'A', planDay: 28, done: false }
                ]
              },
              {
                no: 18,
                coreEquipment: 'Jig PLC',
                equipmentName: 'UFA#4 D38',
                area: 'UBF',
                noKanban: 'J238-000',
                tasks: [
                  { kanbanType: 'A', planDay: 29, done: false }
                ]
              },
              {
                no: 19,
                coreEquipment: 'Hanger',
                equipmentName: 'HANGER #4',
                area: 'UBF',
                noKanban: 'H004-000',
                tasks: [
                  { kanbanType: 'A', planDay: 31, done: false }
                ]
              }
            ]
          }
        ]

      },
      improvement: {
        id: 'improvement',
        label: 'IMPROVEMENT',
        code: 'SEC-03',
        tagline: 'Kaizen & Process Optimization',
        description: 'Implemented improvement projects, breakdown reduction initiatives, and line cycle enhancements.',
        status: 'READY FOR DATA',
        recordsCount: 0,
        lastUpdated: 'Pending Data Input',
        placeholderItems: [
          {
            id: 'IMP-001',
            title: 'Continuous Improvement Framework',
            status: 'INITIALIZED',
            date: 'Phase 2',
            summary: 'Standardized format for tracking line enhancements and technical modifications.'
          }
        ]
      },
      safety: {
        id: 'safety',
        label: 'SAFETY',
        code: 'SEC-04',
        tagline: 'Safety Compliance & Zero Incident Protocol',
        description: 'Near-miss reporting, safety patrol observations, 5S compliance, and Red Zone risk assessments.',
        status: 'READY FOR DATA',
        recordsCount: 0,
        lastUpdated: 'Pending Data Input',
        placeholderItems: [
          {
            id: 'SAF-001',
            title: 'Red Zone Safety Verification Standard',
            status: 'INITIALIZED',
            date: 'Phase 2',
            summary: 'Zero incident protocols and workplace safety compliance logs.'
          }
        ]
      }
    }
  },
  {
    id: 'c06',
    code: '01221823',
    name: 'IKHMAL ARASYI',
    role: 'Team Member',
    department: 'Maintenance',
    unit: 'Shift RED',
    zone: 'Welding Body#2 / Under Body',
    status: 'ACTIVE',
    image: '/assets/characters/ikhmal_arasyi.jpg',
    portrait: '/assets/characters/ikhmal_arasyi.jpg',
    summary: 'Maintenance Team Member assigned to Welding Body#2 / Under Body (Shift RED).',
    specialization: 'Welding Body#2 Under Body Maintenance & Technical Response',
    categories: {
      idea: {
        id: 'idea',
        label: 'IDEA',
        code: 'SEC-01',
        tagline: 'Innovation & Suggestion System',
        description: 'Repository of ideas and proactive proposals for operational efficiency and equipment reliability.',
        status: 'READY FOR DATA',
        recordsCount: 0,
        lastUpdated: 'Pending Data Input',
        placeholderItems: [
          {
            id: 'IDEA-001',
            title: 'Idea Proposal System Template',
            status: 'INITIALIZED',
            date: 'Phase 2',
            summary: 'Category ready for standardized proposal submissions and Kaizen suggestions.'
          }
        ]
      },
      pm: {
        id: 'pm',
        label: 'PM',
        code: 'SEC-02',
        tagline: 'Preventive Maintenance Execution',
        description: 'Tracking and scheduling for preventive maintenance tasks, inspection logs, and machine uptime assurance.',
        status: 'READY FOR DATA',
        recordsCount: 0,
        lastUpdated: 'Pending Data Input',
        placeholderItems: [
          {
            id: 'PM-001',
            title: 'Preventive Maintenance Schedule Structure',
            status: 'INITIALIZED',
            date: 'Phase 2',
            summary: 'Routine maintenance logs and equipment calibration records.'
          }
        ]
      },
      improvement: {
        id: 'improvement',
        label: 'IMPROVEMENT',
        code: 'SEC-03',
        tagline: 'Kaizen & Process Optimization',
        description: 'Implemented improvement projects, breakdown reduction initiatives, and line cycle enhancements.',
        status: 'READY FOR DATA',
        recordsCount: 0,
        lastUpdated: 'Pending Data Input',
        placeholderItems: [
          {
            id: 'IMP-001',
            title: 'Continuous Improvement Framework',
            status: 'INITIALIZED',
            date: 'Phase 2',
            summary: 'Standardized format for tracking line enhancements and technical modifications.'
          }
        ]
      },
      safety: {
        id: 'safety',
        label: 'SAFETY',
        code: 'SEC-04',
        tagline: 'Safety Compliance & Zero Incident Protocol',
        description: 'Near-miss reporting, safety patrol observations, 5S compliance, and Red Zone risk assessments.',
        status: 'READY FOR DATA',
        recordsCount: 0,
        lastUpdated: 'Pending Data Input',
        placeholderItems: [
          {
            id: 'SAF-001',
            title: 'Red Zone Safety Verification Standard',
            status: 'INITIALIZED',
            date: 'Phase 2',
            summary: 'Zero incident protocols and workplace safety compliance logs.'
          }
        ]
      }
    }
  }
];

