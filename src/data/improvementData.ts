import type { ImprovementProject } from '../types/improvement';

export const IMPROVEMENT_PROJECTS: ImprovementProject[] = [
  {
    id: 'IMP-DWI-01',
    characterId: 'c01',
    code: 'KAIZEN-UBF-01',
    title: 'ELIMINASI POTENSI NOT-RUN SIKLUS MODEL CHANGE LOKATOR NC MESIN GBL ST#5 UBF',
    picName: 'DWI PURNOMO',
    regNumber: '01223122',
    unitShift: 'WELDING BODY#2 // SHIFT RED',
    period: 'Agustus 2026',
    status: 'COMPLETED',
    thumbnailUrl: '/assets/improvements/DWI P/1.jpeg',
    pptxUrl: '/assets/improvements/DWI P/Purnomo Kanri.pptx',
    background: {
      layoutTitle: 'LAYOUT UBF (UNDER BODY FINAL) // GLOBAL BODY LINE (GBL)',
      layoutImageUrl: '/assets/improvements/ubf_st5_real_mapping.png',
      layoutImageCaption: 'Real CAD Engineering Layout UBF Line — Menyorot Titik Masalah ST#5 GBL (Occurrence) & Titik Yokoten ST#2 Robot NC',
      problemTitle: 'LOKATOR NC NOT CAR-TYPE CHANGE COMPLETE (ZERO ALARM ERROR)',
      problemDescription: 'Saat proses pergantian tipe model (D26A/D03B ke model 230B atau sebaliknya), lokator NC tidak berpindah posisi. Sistem tidak memunculkan indikasi alarm error sehingga stasiun tertahan pada status Waiting NC Start dan mengakibatkan ST#5 UBF Not RUN (Line Stop).',
      activeEquipmentName: 'Mesin GBL ST#5 UBF (Global Body Line)',
      stations: [
        { id: 'st1', name: 'ST#1 UBF', status: 'normal' },
        { id: 'st2', name: 'ST#2 UBF', status: 'normal', details: 'Lokator NC (Target Yokoten)' },
        { id: 'st3', name: 'ST#3 UBF', status: 'normal' },
        { id: 'st4', name: 'ST#4 UBF', status: 'normal' },
        { id: 'st5', name: 'ST#5 UBF (GBL)', isHighlight: true, status: 'issue', details: 'Occurrence Point: Lokator NC Freeze' },
        { id: 'st6', name: 'ST#6 UBF', status: 'normal' }
      ],
      standardFlow: [
        { step: 'Instruksi Model Change (D26/D03 <-> 230B)' },
        { step: 'Sensor Part Detect Membaca Area Fixture Kosong (OFF)' },
        { step: 'Interlock PLC Membuka Izin Pergerakan' },
        { step: 'Mekanisme Lokator NC Berpindah ke Posisi Model Baru' },
        { step: 'Model Change Completed -> ST#5 Auto RUN Normal' }
      ],
      actualFlow: [
        { step: 'Instruksi Model Change (D26/D03 <-> 230B)' },
        { step: 'Sensor Part Detect Menempel Gram Spatter (FREEZE ON)', isProblem: true, notes: 'Kontak Sinyal ON Terus Tanpa Part' },
        { step: 'PLC Mengira Part Masih Terpasang -> Interlock Mengunci Lokator', isProblem: true, notes: 'Safety Interlock Lock' },
        { step: 'Lokator NC Diam / Tidak Ada Pergerakan (No Switching Action)' },
        { step: 'ST#5 UBF NOT RUN / Waiting NC Start (TANPA SINYAL ERROR)', isProblem: true, notes: 'Silent Line Stop Tanpa Alarm' }
      ],
      rootCauseEffects: [
        'Akumulasi serbuk besi (gram spatter pengelasan) menumpuk pada kepala sensor proximity',
        'Sensor mengalami kegagalan sinyal Freeze Continuous ON (aktif konstan padahal fixture kosong)',
        'Interlock keselamatan PLC menahan gerak lokator NC demi mencegah benturan mekanikal',
        'Ketiadaan alarm timeout pada program PLC menyebabkan stasiun silent stop (Waiting NC Start)'
      ],
      whyWhyTree: {
        rootFault: 'ST#5 UBF Mengalami Silent Line Stop (Not RUN) Tanpa Indikasi Alarm',
        nodes: [
          {
            id: 'why-1',
            level: 1,
            label: 'Why 1: Stasiun Tertahan pada Status Waiting NC Start',
            description: 'Siklus Car-Type Model Change pada lokator NC tidak kunjung tuntas (Not Completed).'
          },
          {
            id: 'why-2',
            level: 2,
            label: 'Why 2: Lokator NC Tidak Mau Berpindah Posisi Saat Model Change',
            description: 'Logika keselamatan (Safety Interlock) pada PLC mengunci perintah gerak lokator NC.'
          },
          {
            id: 'why-3',
            level: 3,
            label: 'Why 3: Interlock PLC Menahan Perintah Gerak Lokator',
            description: 'Program PLC mendeteksi adanya komponen (Part Detected) yang masih berada di area fixture.',
            value: 'Interlock Active',
            isTrigger: true
          },
          {
            id: 'why-4',
            level: 4,
            label: 'Why 4: Sensor Part Detection Mengalami Freeze Continuous ON',
            description: 'Sensor proximity tertutup tumpukan serbuk besi (gram spatter pengelasan) sehingga kontak aktif terus-menerus.',
            value: 'Akumulasi Gram Spatter',
            isTrigger: true
          },
          {
            id: 'why-5',
            level: 5,
            label: 'Why 5: Tidak Muncul Alarm Error Saat Sensor Mengalami Freeze ON',
            description: 'Program PLC belum dilengkapi logika timer interlock timeout untuk memvalidasi durasi aktif sensor terhadap siklus kerja aktual.',
            value: 'No Timeout Logic',
            isTrigger: true
          }
        ],
        guideline: 'PIC Kaizen: DWI PURNOMO | PIC PM: Ahmad Jumadi (White Shift) | Mesin: GBL (Global Body Line) ST#5 UBF'
      },
      challenge: 'BAGAIMANA MENGELIMINASI POTENSI NOT-RUN PADA SIKLUS SWITCHING LOKATOR NC SERTA MENCEGAH ANOMALI SENSOR PROXIMITY TANPA INDIKASI ALARM PADA MESIN GBL ST#5 UBF'
    },
    aspects: [
      {
        id: 'plc-timer-interlock',
        aspectTitle: 'Aspek 1: Modifikasi Program PLC & Alarm Timer Interlock',
        kadai: 'KADAI → Tambahkan logika PLC timer adding error jika lokator NC tidak merespons dalam durasi tertentu saat siklus model switching',
        before: {
          title: 'Sistem Tertahan Tanpa Alarm Saat Sensor Freeze ON',
          description: 'PLC mengunci siklus lokator tanpa memunculkan peringatan error, sehingga teknisi harus melacak sinyal secara manual saat line stop terjadi.',
          bulletPoints: [
            'Saat sensor part detect ON terus, PLC hanya menahan perintah switching lokator secara pasif',
            'Tidak ada sinyal error maupun notifikasi alarm pada layar sentuh HMI (Kotak merah kolom B baris 1 & 2 kosong)',
            'Waktu henti (line stop) bertambah lama karena pelacakan sinyal harus dilakukan manual'
          ],
          illustrationType: 'inverter_alarm',
          imageUrl: '/assets/improvements/hmi_locator_alarm.jpg',
          imageCaption: 'HMI Sebelum Kaizen: Kolom B Baris 1 & 2 Kosong (Zero Alarm saat NC Locator Freeze)',
          galleryImages: [
            {
              url: '/assets/improvements/hmi_locator_alarm.jpg',
              title: 'HMI Display Sebelum Kaizen (Zero Alarm)',
              caption: 'Slot Kolom B Baris 1 & 2 Masih Kosong — Tidak Ada Indikasi Alarm Saat NC Locator Freeze',
              typeBadge: 'BEFORE: HMI SCREEN'
            }
          ],
          warningTag: 'ZERO ALARM / SILENT LINE STOP'
        },
        after: {
          title: 'Penambahan Logika Timer Adding Error & Auto Alarm HMI',
          description: 'Modifikasi program PLC dengan logika timeout dan penambahan alarm "POKAYOKE FAULT NC" pada HMI: jika dalam waktu tertentu lokator NC tidak run setelah instruksi model change, alarm otomatis aktif.',
          bulletPoints: [
            'Modifikasi Ladder PLC (Rung 000057 & 000058): Output Coil M01D (POKAYOKE FAUL NC) & M01C (POKAYOKE FAULT)',
            'Penambahan tombol/indikator alarm baru "POKAYOKE FAULT NC" pada slot Kolom B Baris 1 Layar HMI',
            'Deteksi dini otomatis dalam batas toleransi waktu: alarm berbunyi seketika jika lokator NC freeze saat model change'
          ],
          illustrationType: 'inverter_alarm',
          imageUrl: '/assets/improvements/hmi_after_pokayoke_nc.jpg',
          imageCaption: 'HMI Sesudah Kaizen: Alarm "POKAYOKE FAULT NC" Aktif pada Kolom B Baris 1',
          galleryImages: [
            {
              url: '/assets/improvements/hmi_after_pokayoke_nc.jpg',
              title: '1. Modifikasi Layar HMI (After Kaizen)',
              caption: 'Penambahan Indikator Alarm "POKAYOKE FAULT NC" pada Slot Kolom B Baris 1 Layar HMI',
              typeBadge: '1. HMI SCREEN AFTER'
            },
            {
              url: '/assets/improvements/plc_ladder_pokayoke_nc.jpg',
              title: '2. Modifikasi Program PLC Ladder (After Kaizen)',
              caption: 'Program1 Rung 000057 & 000058: Penambahan Output Coil M01D (POKAYOKE FAUL NC) & M01C (POKAYOKE FAULT)',
              typeBadge: '2. PLC LADDER LOGIC'
            }
          ],
          solutionTag: 'AUTO ALARM TIMER INTERLOCK (< 5s)'
        },
        results: [
          { text: 'Deteksi otomatis dan visualisasi alarm sensor freeze dalam durasi < 5 detik', isOk: true },
          { text: 'Menghilangkan potensi unnoticed line stop pada mesin GBL ST#5 UBF', isOk: true }
        ],
        yokotenNote: 'Sudah di-yokoten ke stasiun robot NC lainnya di UBF yaitu ST#2 UBF'
      },
      {
        id: 'cover-proximity-anti-spatter',
        aspectTitle: 'Aspek 2: Modifikasi Cover Pelindung Proximity Anti-Spatter',
        kadai: 'KADAI → Rancang dan pasang cover pelindung sensor proximity agar tidak mudah kotor oleh akumulasi gram dan spatter pengelasan',
        before: {
          title: 'Sensor Terbuka & Rawan Tertempel Gram Spatter',
          description: 'Kepala sensor proximity terpapar langsung oleh percikan spatter pengelasan sehingga serbuk besi menumpuk dan memicu sinyal ON palsu.',
          bulletPoints: [
            'Permukaan sensor proximity terbuka tanpa pelindung khusus anti-spatter',
            'Serbuk besi (gram) dan spatter pengelasan mudah menempel pada sensing face',
            'Menimbulkan kontak elektromagnetik palsu (False Detection Continuous ON)'
          ],
          illustrationType: 'cover_deflector',
          warningTag: 'RAWAN AKUMULASI GRAM SPATTER'
        },
        after: {
          title: 'Pemasangan Cover Modifikasi Deflector Anti-Spatter',
          description: 'Memasang cover pelindung sudut (deflector cover) berbahan anti-stick yang melindungi sensor dari lintasan percikan spatter.',
          bulletPoints: [
            'Modifikasi cover pelindung sensor dengan desain deflector penangkal spatter',
            'Mencegah partikel gram besi menempel pada area sensing zone',
            'Memastikan sensor hanya aktif saat komponen benda kerja riil terpasang di fixture'
          ],
          illustrationType: 'cover_deflector',
          solutionTag: 'PROTEKSI COVER DEFLECTOR ANTI-STICK'
        },
        results: [
          { text: 'Sensor proximity 100% bebas dari akumulasi gram spatter pengelasan', isOk: true },
          { text: 'Mencegah potensi false part detection berulang pada fixture GBL ST#5', isOk: true }
        ],
        yokotenNote: 'Diterapkan dan distandarisasi di ST#5 dan ST#2 UBF'
      }
    ],
    yokoten: {
      title: 'YOKOTEN ACTIVITY ROBOT NC LOKATOR UBF (ST#5 & ST#2)',
      stationHeaders: [
        { name: 'ST#5 UBF (Occurrence Point)', spans: 1, subTypes: ['MESIN GBL'] },
        { name: 'ST#2 UBF (Yokoten Point)', spans: 1, subTypes: ['ROBOT NC'] }
      ],
      diagnosticRows: [
        {
          no: 1,
          paramName: 'LOGIKA PLC TIMER ADDING ERROR INTERLOCK',
          standard: 'Timeout < 5 Detik Terdeteksi',
          readings: [
            { station: 'ST#5 UBF', value: 'AKTIF (OK)', status: 'normal' },
            { station: 'ST#2 UBF', value: 'AKTIF (OK)', status: 'normal' }
          ]
        },
        {
          no: 2,
          paramName: 'COVER DEFLECTOR PROXIMITY ANTI-SPATTER',
          standard: '100% Terpasang Presisi',
          readings: [
            { station: 'ST#5 UBF', value: 'TERPASANG (OK)', status: 'normal' },
            { station: 'ST#2 UBF', value: 'TERPASANG (OK)', status: 'normal' }
          ]
        },
        {
          no: 3,
          paramName: 'STATUS KEBERSIHAN SENSOR DARI GRAM SPATTER',
          standard: 'Zero Spatter Accumulation',
          readings: [
            { station: 'ST#5 UBF', value: 'BERSIH (OK)', status: 'normal' },
            { station: 'ST#2 UBF', value: 'BERSIH (OK)', status: 'normal' }
          ]
        }
      ],
      timelineRows: [
        {
          station: 'ST#5 UBF — GBL (Origin)',
          agustus: { w1: true, w2: true, w3: true, w4: true },
          september: { w1: false, w2: false, w3: false, w4: false }
        },
        {
          station: 'ST#2 UBF — Robot NC (Yokoten)',
          agustus: { w1: false, w2: false, w3: true, w4: true },
          september: { w1: false, w2: false, w3: false, w4: false }
        }
      ],
      targetCompletion: 'Yokoten modifikasi program PLC & cover pelindung sensor proximity telah tuntas 100% pada seluruh stasiun robot NC di UBF (ST#5 & ST#2) pada Agustus 2026.'
    },
    presentationSlides: [
      {
        id: 1,
        url: '/assets/improvements/DWI P/1.jpeg',
        title: 'ELIMINASI POTENSI NOT-RUN LOKATOR NC MESIN GBL ST#5 UBF',
        caption: 'Slide 1: Cover Proyek Kaizen — Eliminasi Silent Line Stop Siklus Model Change'
      },
      {
        id: 2,
        url: '/assets/improvements/DWI P/2.png',
        title: 'BACKGROUND & LAYOUT AREA GBL UBF',
        caption: 'Slide 2: Latar Belakang & Layout Line UBF — Occurrence Point ST#5 GBL'
      },
      {
        id: 3,
        url: '/assets/improvements/DWI P/3.png',
        title: 'PROBLEM STATEMENT & ALUR MASALAH',
        caption: 'Slide 3: Problem Statement — Sensor Freeze ON & Silent Line Stop Tanpa Alarm'
      },
      {
        id: 4,
        url: '/assets/improvements/DWI P/4.png',
        title: 'WHY-WHY ANALYSIS (5 WHY)',
        caption: 'Slide 4: Analisa 5-Why — Akar Penyebab Not-Run NC Locator Siklus Model Change'
      },
      {
        id: 5,
        url: '/assets/improvements/DWI P/5.png',
        title: 'KAIZEN ASPEK 1: MODIFIKASI PROGRAM PLC',
        caption: 'Slide 5: Before/After — Penambahan Logika Timer Adding Error & Alarm HMI POKAYOKE FAULT NC'
      },
      {
        id: 6,
        url: '/assets/improvements/DWI P/6.png',
        title: 'KAIZEN ASPEK 2: COVER DEFLECTOR ANTI-SPATTER',
        caption: 'Slide 6: Before/After — Pemasangan Cover Pelindung Sensor Proximity Anti-Gram Spatter'
      },
      {
        id: 7,
        url: '/assets/improvements/DWI P/7.png',
        title: 'HASIL KAIZEN & SUMMARY PENCAPAIAN',
        caption: 'Slide 7: Hasil Kaizen — Auto Alarm < 5 Detik & Sensor 100% Bebas Gram Spatter'
      },
      {
        id: 8,
        url: '/assets/improvements/DWI P/8.png',
        title: 'YOKOTEN ACTIVITY — ST#5 & ST#2 UBF',
        caption: 'Slide 8: Yokoten & Standardisasi — Robot NC Lokator UBF (ST#5 & ST#2) Tuntas 100%'
      }
    ]
  },
  {
    id: 'IMP-PILAR-01',
    characterId: 'c04',
    code: 'KAIZEN-OHC-01',
    title: 'OHC FLOW OPTIMIZATION TO SUPPORT NEW TACT TIME (1.80 MIN -> 1.57 MIN)',
    picName: 'PILAR PRATAMA PUTRA',
    regNumber: '01830748',
    unitShift: 'WELDING BODY#2 // SHIFT RED',
    period: 'Agustus 2026',
    status: 'COMPLETED',
    thumbnailUrl: '/assets/improvements/pilar_ohc_summary_infographic.jpg',
    pptxUrl: '/assets/improvements/Pilar Kaizen.pptx',
    background: {
      layoutTitle: 'OHC (OVERHEAD CONVEYOR) MAIN BODY FLOW SYSTEM // BODY#2',
      layoutImageUrl: '/assets/improvements/pilar_ohc_summary_infographic.jpg',
      layoutImageCaption: 'Infografis Ringkasan Kaizen OHC Flow Optimization — Body#2 Red Zone',
      problemTitle: 'BOTTLENECK TRANSFER OHC PADA PENINGKATAN TARGET TACT TIME 1.57 MENIT',
      problemDescription: 'Peningkatan kapasitas produksi menuntut akselerasi cycle time dari 1.80 menit menjadi 1.57 menit. Jalur Overhead Conveyor (OHC) mengalami bottleneck transfer dan delay flow yang berpotensi membatasi output line pengelasan Body#2.',
      activeEquipmentName: 'Overhead Conveyor (OHC) Main Body Transfer System',
      stations: [
        { id: 'st1', name: 'OHC Loader', status: 'normal' },
        { id: 'st2', name: 'Main Buffer', status: 'normal' },
        { id: 'st3', name: 'Transfer Station', isHighlight: true, status: 'issue', details: 'Speed Up & Flow Balance Target' },
        { id: 'st4', name: 'Unloader Zone', status: 'normal' }
      ],
      challenge: 'BAGAIMANA MENGOPTIMALKAN ALIRAN OHC & MEMPERCEPAT KECEPATAN TRANSFER UNTUK MENCAPAI TARGET TACT TIME 1.57 MENIT SECARA STABIL'
    },
    presentationSlides: [
      {
        id: 1,
        url: '/assets/improvements/1.jpeg',
        title: 'OHC FLOW OPTIMIZATION TO SUPPORT NEW TACT TIME',
        caption: 'Slide 1: Cover Proyek Kaizen — Optimasi Aliran OHC Menuju Tact Time Baru'
      },
      {
        id: 2,
        url: '/assets/improvements/2.png',
        title: 'BACKGROUND & TACT TIME TARGET',
        caption: 'Slide 2: Latar Belakang & Target Tact Time (1.80 Menit -> 1.57 Menit)'
      },
      {
        id: 3,
        url: '/assets/improvements/3.png',
        title: 'CHALLENGE & FLOW SCHEMATIC',
        caption: 'Slide 3: Tantangan & Skema Alur Overhead Conveyor (OHC)'
      },
      {
        id: 4,
        url: '/assets/improvements/4.png',
        title: 'GAP ANALYSIS & BOTTLENECK POINTS',
        caption: 'Slide 4: Analisis Kesenjangan (Gap Analysis) & Titik Hambatan Aliran'
      },
      {
        id: 5,
        url: '/assets/improvements/5.png',
        title: 'KAIZEN ACTION: SPEED UP & LAYOUT OPTIMIZATION',
        caption: 'Slide 5: Tindakan Kaizen — Akselerasi Kecepatan OHC & Penataan Jalur'
      },
      {
        id: 6,
        url: '/assets/improvements/6.png',
        title: 'PROBLEM ANALYSIS & COUNTERMEASURES',
        caption: 'Slide 6: Analisis Masalah & Penerapan Solusi Teknis (Tersedia Video Footage)'
      },
      {
        id: 7,
        url: '/assets/improvements/7.png',
        title: 'KAIZEN ACTION EXECUTION DETAILS',
        caption: 'Slide 7: Rincian Eksekusi Perbaikan & Pengujian Sistem'
      },
      {
        id: 8,
        url: '/assets/improvements/8.png',
        title: 'KAIZEN RESULT SUMMARY & TARGET ACHIEVEMENT',
        caption: 'Slide 8: Rangkuman Hasil Kaizen — Target Tact Time 1.57 Menit Tercapai 100%'
      },
      {
        id: 9,
        url: '/assets/improvements/9.jpeg',
        title: 'YOKOTEN & STANDARDIZATION',
        caption: 'Slide 9: Yokoten & Standardisasi Operasional Red Zone'
      }
    ],
    aspects: []
  }
];

