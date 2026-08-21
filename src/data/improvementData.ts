import type { ImprovementProject } from '../types/improvement';

export const IMPROVEMENT_PROJECTS: ImprovementProject[] = [
  {
    id: 'IMP-DWI-01',
    code: 'KAIZEN-UBF-01',
    title: 'ELIMINASI POTENSI NOT-RUN SIKLUS MODEL CHANGE LOKATOR NC MESIN GBL ST#5 UBF',
    picName: 'DWI PURNOMO',
    regNumber: '01223122',
    unitShift: 'WELDING BODY#2 // SHIFT RED',
    period: 'Agustus 2026',
    status: 'COMPLETED',
    background: {
      layoutTitle: 'LAYOUT UBF (UNDER BODY FINAL) // GLOBAL BODY LINE (GBL)',
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
            'Tidak ada sinyal error maupun notifikasi alarm pada layar sentuh HMI',
            'Waktu henti (line stop) bertambah lama karena pelacakan sinyal harus dilakukan manual'
          ],
          illustrationType: 'inverter_alarm',
          warningTag: 'ZERO ALARM / SILENT LINE STOP'
        },
        after: {
          title: 'Penambahan Logika Timer Adding Error & Auto Alarm HMI',
          description: 'Modifikasi program PLC dengan logika timeout: jika dalam waktu tertentu lokator NC tidak run setelah instruksi model change, alarm otomatis aktif.',
          bulletPoints: [
            'Menambahkan Timer Interlock Error pada ladder program PLC (Logic Timeout Validation)',
            'Jika lokator NC tidak RUN dalam batas waktu toleransi saat model change, alarm langsung berbunyi',
            'Visualisasi popup error pada layar HMI mendeteksi sensor freeze secara presisi dan seketika'
          ],
          illustrationType: 'inverter_alarm',
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
          illustrationType: 'robot_position',
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
          illustrationType: 'robot_position',
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
    }
  }
];
