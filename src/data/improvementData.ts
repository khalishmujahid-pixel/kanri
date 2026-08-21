import type { ImprovementProject } from '../types/improvement';

export const IMPROVEMENT_PROJECTS: ImprovementProject[] = [
  {
    id: 'IMP-ROBOT-01',
    code: 'KAIZEN-BODY2-01',
    title: 'MODIFICATION HOME POSITION ROBOT UMR 5-5 & UMR 5-6',
    picName: 'RIZA TAUFIQUROHMAN',
    regNumber: '1324761',
    unitShift: 'BODY 2 WHITE SHIFT',
    period: 'Agustus 2026',
    status: 'COMPLETED',
    background: {
      layoutTitle: 'LAYOUT UB (UNDER BODY FINAL)',
      problemTitle: 'ROBOT INTERFERENCE WITH BORDESK',
      problemDescription: 'Posisi home post robot UMR 5-5 berada di bawah bordesk, menyebabkan holder menabrak struktur bordesk saat eksekusi posisi jump dan merusak sinkronisasi data encoder JT 5.',
      activeEquipmentName: 'Robot UMR 5-5 (ST5 Under Body)',
      stations: [
        { id: 'uca', name: 'UCA', status: 'normal' },
        { id: 'uf', name: 'Under Front', status: 'normal' },
        { id: 'buff1', name: 'Buff', status: 'normal' },
        { id: 'ur-d26', name: 'Under Rear D26', status: 'normal' },
        { id: 'st1', name: 'ST1', status: 'normal' },
        { id: 'st2', name: 'ST2', status: 'normal' },
        { id: 'st3', name: 'ST3', status: 'normal' },
        { id: 'st4', name: 'ST4', status: 'normal' },
        { id: 'st5', name: 'ST5 (UMR 5-5)', isHighlight: true, status: 'issue', details: 'Robot Interference Point' },
        { id: 'st6', name: 'ST6', status: 'normal' },
        { id: 'ubf', name: 'Under Body Final', status: 'normal' }
      ],
      standardFlow: [
        { step: 'Robot Not Run' },
        { step: 'Check Condition [Jump] = Y' },
        { step: 'Manual Teaching' },
        { step: 'Auto Run' },
        { step: 'Next Step' }
      ],
      actualFlow: [
        { step: 'Robot Not Run' },
        { step: 'Check Condition [Jump] = N' },
        { step: 'Run Individual [Call Home Post Prog.]', isProblem: true, notes: 'Holder interference with bordesk' },
        { step: 'Auto Run' },
        { step: 'Next Step' }
      ],
      rootCauseEffects: [
        'Holder robot membentur struktur bordesk saat call program home post',
        'Data encoder JT 5 mengalami pergeseran mekanikal akibat benturan',
        'Sistem menjadi tidak sinkron (Not Synchron)',
        'Efek fatal: Diperlukan re-teaching ulang robot untuk SEMUA model'
      ],
      challenge: 'BAGAIMANA MENGHILANGKAN POTENSI ROBOT MENABRAK BORDESK KETIKA POSISI JUMP'
    },
    aspects: [
      {
        id: 'safety-interference',
        aspectTitle: 'Aspek 1: Safety & Anti-Interference',
        kadai: 'KADAI → Modify home position robot supaya gerakan lebih bebas dan aman',
        before: {
          title: 'Posisi Home Post UMR 5-5 di Bawah Bordesk',
          description: 'Gun robot berada tepat di bawah struktur bordesk. Ruang gerak sangat terbatas dan rawan terjadi tabrakan saat program dipanggil.',
          bulletPoints: [
            'Posisi gun robot saat homepost berada di bawah bordesk',
            'Gerakan robot tidak bebas dan tidak aman saat start posisi',
            'Effect: Holder berbenturan langsung dengan bordesk'
          ],
          illustrationType: 'robot_position',
          warningTag: 'BAHAYA BENTURAN STRUKTUR'
        },
        after: {
          title: 'Modif Posisi Home Post UMR 5-5 (Naik 300mm)',
          description: 'Home position gun dinaikkan setinggi 300mm sehingga berada di atas level bordesk dengan clearance aman.',
          bulletPoints: [
            'Posisi gun robot naik 300mm ke atas sehingga posisi gun berada DI ATAS bordesk',
            'Gerakan robot 100% bebas tanpa halangan mekanis',
            'Bebas dari risiko tabrakan saat operator/sistem melakukan Call Program 0'
          ],
          illustrationType: 'robot_position',
          solutionTag: 'ELEVASI AMAN (+300mm CLEARANCE)'
        },
        results: [
          { text: 'Gerakan lebih aman ketika langsung call program 0', isOk: true },
          { text: 'Tidak ada lagi potensi robot menabrak bordesk (Zero Crash)', isOk: true }
        ],
        yokotenNote: 'Sudah di-yokoten di robot yang lainnya yaitu UMR 5-6'
      },
      {
        id: 'ergonomics-cuptip',
        aspectTitle: 'Aspek 2: Ergonomi Pergantian Cup Tip',
        kadai: 'KADAI → Tingkatkan ergonomi dan efisiensi waktu maintenance saat pergantian consumable cup tip',
        before: {
          title: 'Posisi Pergantian Cup Tip Sempit & Di Bawah Bordesk',
          description: 'Teknisi harus membungkuk dalam posisi tidak ergonomis untuk menjangkau gun di bawah bordesk.',
          bulletPoints: [
            'Posisi gun robot saat homepost berada di bawah bordesk',
            'Ruang gerak teknisi sangat sempit dan terhalang besi struktur',
            'Sangat tidak ergonomis saat proses penggantian cup tip robot'
          ],
          illustrationType: 'ergonomics',
          warningTag: 'TIDAK ERGONOMIS & STRAIN RISK'
        },
        after: {
          title: 'Posisi Ganti Cup Tip Lebih Tinggi & Terbuka',
          description: 'Gun berada pada ketinggian kerja optimal (chest level) yang ergonomis dan bebas halangan.',
          bulletPoints: [
            'Posisi gun robot naik 300mm ke atas sehingga posisi gun di atas bordesk',
            'Teknisi dapat berdiri dengan postur tubuh tegak dan nyaman',
            'Akses kunci dan alat pergantian cup tip langsung terbuka tanpa halangan'
          ],
          illustrationType: 'ergonomics',
          solutionTag: 'POSTUR KERJA ERGONOMI 100%'
        },
        results: [
          { text: 'Posisi ganti cup tip jauh lebih ergonomis bagi teknisi', isOk: true },
          { text: 'Waktu pergantian consumable cup tip lebih cepat dan aman', isOk: true }
        ],
        yokotenNote: 'Sudah di-yokoten di robot yang lainnya yaitu UMR 5-6'
      }
    ],
    yokoten: {
      title: 'YOKOTEN ACTIVITY ROBOT HOME POSITION',
      diagnosticRows: [],
      stationHeaders: [
        { name: 'UMR 5-5', spans: 1, subTypes: ['UB ST5'] },
        { name: 'UMR 5-6', spans: 1, subTypes: ['UB ST5/6'] }
      ],
      timelineRows: [
        {
          station: 'ROBOT UMR 5-5 (Origin)',
          agustus: { w1: true, w2: true, w3: false, w4: false },
          september: { w1: false, w2: false, w3: false, w4: false }
        },
        {
          station: 'ROBOT UMR 5-6 (Yokoten)',
          agustus: { w1: false, w2: false, w3: true, w4: true },
          september: { w1: false, w2: false, w3: false, w4: false }
        }
      ],
      targetCompletion: 'Yokoten modifikasi posisi home post robot telah tuntas 100% di UMR 5-5 & UMR 5-6 pada Agustus 2026.'
    }
  },
  {
    id: 'IMP-INVERTER-01',
    code: 'KAIZEN-BODY2-02',
    title: 'VISUALIZATION LIFE ALARM INVERTER AT HMI',
    picName: 'D. ALZAMZAM',
    regNumber: '2538625',
    unitShift: 'BODY 2 WHITE SHIFT',
    period: 'Agustus 2026',
    status: 'YOKOTEN',
    background: {
      layoutTitle: 'LAYOUT MBF (MAIN BODY FINAL)',
      problemTitle: 'ALARM ERROR ON HMI 5ST MBF (INVERTER ERROR E.7)',
      problemDescription: 'Inverter pada Station 5 Main Body Final mengalami shutdown mendadak akibat error E.7 (CPU Fault). Kondisi ini terjadi karena kapasitor sirkuit kontrol telah mencapai batas kritis 0% tanpa terdeteksi sebelumnya.',
      activeEquipmentName: 'Inverter Station 5 MBF',
      stations: [
        { id: 'st4', name: 'ST#4', status: 'normal' },
        { id: 'st5', name: 'ST#5', isHighlight: true, status: 'issue', details: 'Alarm Error E.7 Inverter' },
        { id: 'st6', name: 'ST#6', status: 'normal' },
        { id: 'st7', name: 'ST#7', status: 'normal' },
        { id: 'st8', name: 'ST#8', status: 'normal' },
        { id: 'st9', name: 'ST#9', status: 'normal' },
        { id: 'buf-iai', name: 'Buffer IAI', status: 'normal' },
        { id: 'buf-1', name: 'Buffer-1', status: 'normal' },
        { id: 'buf-2', name: 'Buffer-2', status: 'normal' },
        { id: 'roof', name: 'Roof Jig', status: 'normal' }
      ],
      whyWhyTree: {
        rootFault: 'Inverter Tiba-Tiba Mengalami Fault E.7',
        nodes: [
          {
            id: 'why-1',
            level: 1,
            label: 'Why 1: Terjadi CPU Fault pada Inverter',
            description: 'Indikasi E.7 pada operation panel mengindikasikan CPU Fault'
          },
          {
            id: 'why-2',
            level: 2,
            label: 'Why 2: Penurunan Nilai Life Alarm Komponen Inverter',
            description: 'P256 Inrush (100%), P258 Main Cap (100%), namun P257 Control Circuit Capasitor = 0%',
            value: 'P257 = 0%',
            isTrigger: true
          },
          {
            id: 'why-3',
            level: 3,
            label: 'Why 3: Kapasitor Habis Tanpa Adanya Early Warning Telemetri',
            description: 'Berdasarkan manual book: Batas 10% or less adalah indikator wajib replacement. Maintenance tidak mengetahui nilai alarm sebelum rusak.',
            value: '<= 10% Guideline Replacement',
            isTrigger: true
          }
        ],
        guideline: 'Control Circuit Capasitor (P257) sudah 0% (Standard >10%). Batas 10% atau kurang adalah panduan penggantian wajib.'
      },
      challenge: 'BAGAIMANA CARA MENGETAHUI LEBIH AWAL KONDISI INVERTER ABNORMAL SEBELUM TERJADI ERROR'
    },
    aspects: [
      {
        id: 'inverter-telemetry',
        aspectTitle: 'Integrasi PLC & Visualisasi Life Alarm HMI',
        kadai: 'KADAI → Visualisasi Life Alarm Inverter Pada HMI untuk mengetahui lebih awal gejala abnormal pada inverter',
        before: {
          title: 'Inverter Tiba-Tiba Error Tanpa Telemetri Terbaca',
          description: 'Sebelum terjadi error, inverter sebenarnya sudah mengeluarkan kode internal life alarm, namun tidak terhubung ke sistem pemantauan.',
          bulletPoints: [
            'Inverter tiba-tiba mengalami error E.7 dan menghentikan line produksi',
            'Control circuit capasitor (P257) sudah drop hingga 0% (Standar >10%)',
            'Sebelum error, inverter sebenarnya sudah memberi life alarm internal tapi tidak terlihat',
            'MP Maintenance tidak mengetahui kalau inverter sedang dalam kondisi kritis',
            'PROBLEM: Belum adanya visualisasi life alarm pada layar sentuh HMI'
          ],
          illustrationType: 'inverter_alarm',
          warningTag: 'TIDAK ADA VISUALISASI ALARM DINI'
        },
        after: {
          title: 'Komunikasi Inverter-PLC & Display Visualisasi HMI',
          description: 'Menambahkan mapping address alarm ke PLC dan merancang dedicated page pemantauan health parameter di HMI.',
          bulletPoints: [
            'Make Communication Inverter to PLC based on Manual Book protocol',
            'ADDING ADDRESS INPUT LIFE ALARM INVERTER TO PLC BASED ON MANUAL BOOK',
            'Make visualization Life Alarm Inverter on HMI screen',
            'Dedicated display khusus P256, P257, P258 dan popup alarm otomatis saat degradasi'
          ],
          illustrationType: 'inverter_alarm',
          solutionTag: 'VISUALISASI REAL-TIME HMI & PLC'
        },
        results: [
          { text: 'Dapat mengetahui lebih awal kondisi inverter apabila terjadi abnormality', isOk: true },
          { text: 'Dapat melakukan penanggulangan & penggantian preventif sebelum inverter error', isOk: true }
        ],
        yokotenNote: 'Target Yokoten di Main Body 2 tuntas pada Week 4 September 2026'
      }
    ],
    yokoten: {
      title: 'YOKOTEN ACTIVITY — SCANNING LIFE ALARM INVERTER MB #2',
      stationHeaders: [
        { name: 'ST 1', spans: 1, subTypes: ['SINGLE'] },
        { name: 'ST 2', spans: 2, subTypes: ['LOWER', 'UPPER'] },
        { name: 'ST 3', spans: 3, subTypes: ['LOWER', 'UPPER', 'UPPER 2'] },
        { name: 'ST 4', spans: 2, subTypes: ['LOWER', 'UPPER'] },
        { name: 'ST 5', spans: 2, subTypes: ['LOWER', 'UPPER'] },
        { name: 'ST 6', spans: 2, subTypes: ['LOWER', 'UPPER'] },
        { name: 'ST 7', spans: 2, subTypes: ['LOWER', 'UPPER'] },
        { name: 'ST 8', spans: 1, subTypes: ['SINGLE'] },
        { name: 'ST 9', spans: 1, subTypes: ['SINGLE'] }
      ],
      diagnosticRows: [
        {
          no: 1,
          paramName: 'INRUSH CURRENT LIMIT CONTROL (P256)',
          standard: 'std > 10%',
          readings: [
            { station: 'ST 1', value: '20%', status: 'normal' },
            { station: 'ST 2', subType: 'LOWER', value: '97%', status: 'normal' },
            { station: 'ST 2', subType: 'UPPER', value: '97%', status: 'normal' },
            { station: 'ST 3', subType: 'LOWER', value: '93%', status: 'normal' },
            { station: 'ST 3', subType: 'UPPER', value: '99%', status: 'normal' },
            { station: 'ST 3', subType: 'UPPER 2', value: '100%', status: 'normal' },
            { station: 'ST 4', subType: 'LOWER', value: '93%', status: 'normal' },
            { station: 'ST 4', subType: 'UPPER', value: '99%', status: 'normal' },
            { station: 'ST 5', subType: 'LOWER', value: '100%', status: 'normal' },
            { station: 'ST 5', subType: 'UPPER', value: '100%', status: 'normal' },
            { station: 'ST 6', subType: 'LOWER', value: '93%', status: 'normal' },
            { station: 'ST 6', subType: 'UPPER', value: '93%', status: 'normal' },
            { station: 'ST 7', subType: 'LOWER', value: '94%', status: 'normal' },
            { station: 'ST 7', subType: 'UPPER', value: '94%', status: 'normal' },
            { station: 'ST 8', value: '75%', status: 'normal' },
            { station: 'ST 9', value: '100%', status: 'normal' }
          ]
        },
        {
          no: 2,
          paramName: 'CONTROL CIRCUIT CAPASITOR (P257)',
          standard: 'std > 10%',
          readings: [
            { station: 'ST 1', value: '82%', status: 'normal' },
            { station: 'ST 2', subType: 'LOWER', value: '88%', status: 'normal' },
            { station: 'ST 2', subType: 'UPPER', value: '71%', status: 'normal' },
            { station: 'ST 3', subType: 'LOWER', value: '77%', status: 'normal' },
            { station: 'ST 3', subType: 'UPPER', value: '87%', status: 'normal' },
            { station: 'ST 3', subType: 'UPPER 2', value: '95%', status: 'normal' },
            { station: 'ST 4', subType: 'LOWER', value: '84%', status: 'normal' },
            { station: 'ST 4', subType: 'UPPER', value: '96%', status: 'normal' },
            { station: 'ST 5', subType: 'LOWER', value: '89%', status: 'normal' },
            { station: 'ST 5', subType: 'UPPER', value: '100%', status: 'normal' },
            { station: 'ST 6', subType: 'LOWER', value: '80%', status: 'normal' },
            { station: 'ST 6', subType: 'UPPER', value: '72%', status: 'normal' },
            { station: 'ST 7', subType: 'LOWER', value: '48%', status: 'warning' },
            { station: 'ST 7', subType: 'UPPER', value: '50%', status: 'warning' },
            { station: 'ST 8', value: '71%', status: 'normal' },
            { station: 'ST 9', value: '26%', status: 'warning' }
          ]
        },
        {
          no: 3,
          paramName: 'MAIN CIRCUIT CAPASITOR (P258)',
          standard: 'std > 85%',
          readings: [
            { station: 'ST 1', value: '100%', status: 'normal' },
            { station: 'ST 2', subType: 'LOWER', value: '100%', status: 'normal' },
            { station: 'ST 2', subType: 'UPPER', value: '100%', status: 'normal' },
            { station: 'ST 3', subType: 'LOWER', value: '100%', status: 'normal' },
            { station: 'ST 3', subType: 'UPPER', value: '95%', status: 'normal' },
            { station: 'ST 3', subType: 'UPPER 2', value: '100%', status: 'normal' },
            { station: 'ST 4', subType: 'LOWER', value: '100%', status: 'normal' },
            { station: 'ST 4', subType: 'UPPER', value: '100%', status: 'normal' },
            { station: 'ST 5', subType: 'LOWER', value: '100%', status: 'normal' },
            { station: 'ST 5', subType: 'UPPER', value: '100%', status: 'normal' },
            { station: 'ST 6', subType: 'LOWER', value: '100%', status: 'normal' },
            { station: 'ST 6', subType: 'UPPER', value: '100%', status: 'normal' },
            { station: 'ST 7', subType: 'LOWER', value: '100%', status: 'normal' },
            { station: 'ST 7', subType: 'UPPER', value: '98%', status: 'normal' },
            { station: 'ST 8', value: '100%', status: 'normal' },
            { station: 'ST 9', value: '100%', status: 'normal' }
          ]
        }
      ],
      timelineRows: [
        {
          station: 'STATION 1',
          agustus: { w1: true, w2: false, w3: false, w4: false },
          september: { w1: false, w2: false, w3: false, w4: false }
        },
        {
          station: 'STATION 2',
          agustus: { w1: false, w2: false, w3: false, w4: true },
          september: { w1: false, w2: false, w3: false, w4: false }
        },
        {
          station: 'STATION 3',
          agustus: { w1: false, w2: false, w3: false, w4: true },
          september: { w1: false, w2: false, w3: false, w4: false }
        },
        {
          station: 'STATION 4',
          agustus: { w1: false, w2: false, w3: false, w4: true },
          september: { w1: false, w2: false, w3: false, w4: false }
        },
        {
          station: 'STATION 5',
          agustus: { w1: false, w2: false, w3: false, w4: true },
          september: { w1: false, w2: false, w3: false, w4: false }
        },
        {
          station: 'STATION 6',
          agustus: { w1: false, w2: false, w3: false, w4: false },
          september: { w1: true, w2: false, w3: false, w4: false }
        },
        {
          station: 'STATION 7',
          agustus: { w1: false, w2: false, w3: false, w4: false },
          september: { w1: false, w2: true, w3: false, w4: false }
        },
        {
          station: 'STATION 8',
          agustus: { w1: false, w2: false, w3: false, w4: false },
          september: { w1: false, w2: false, w3: true, w4: false }
        },
        {
          station: 'STATION 9',
          agustus: { w1: false, w2: false, w3: false, w4: false },
          september: { w1: false, w2: false, w3: false, w4: true }
        }
      ],
      targetCompletion: 'Target yokoten improvement di Main Body selesai pada week 4 Bulan September 2026'
    }
  }
];
