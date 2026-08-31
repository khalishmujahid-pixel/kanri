/**
 * ============================================================================
 * PM MODULE EXCELENT MAINTENANCE TELEGRAM BOT ENGINE (v4.0 - Multi-Month Edition)
 * User Biasa: Profil PIC Personal & Swa-Jawab Laporan PM
 * Admin / Supervisor: Dashboard Overview Semua Line & Multi-Sheet Inspector
 * Multi-Month: Dukungan Penuh Bulan ke-1 (Agustus 2026) & Bulan ke-2 (September 2026)
 * ============================================================================
 */

// ============================================================================
// 1. KONFIGURASI BOT & ADMIN
// ============================================================================
const CONFIG = {
  // Token Bot Telegram
  BOT_TOKEN: '8951359806:AAFXsn4VhlXx7_gGNZfohEf3kZ-T-RIoJhk',
  
  // URL Deployment Web App
  WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbzYvd259Z8Cw8g4kBsyTGkvnwaswS6rinGICFW6fWiPP445sw3v2zldOdMf1WqRRJAAtw/exec',
  
  // Daftar Chat ID Admin Default
  ADMIN_IDS: [],
  
  // Zona Waktu
  TIMEZONE: 'Asia/Jakarta',
  
  // Nama Sheet Default jika fallback
  DEFAULT_SHEET_NAME: 'KURDI',
  
  // Default Bulan Aktif Terkini (September 2026 = Bulan 9 / Bulan ke-2)
  DEFAULT_MONTH: 9
};

const MONTHS_CONFIG = {
  8: { num: 8, name: 'Agustus 2026', short: 'Agustus', label: 'Bulan ke-1', days: 31 },
  9: { num: 9, name: 'September 2026', short: 'September', label: 'Bulan ke-2', days: 30 }
};

// ============================================================================
// 2. ENTRY POINT WEBHOOK (doPost & doGet)
// ============================================================================

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return HtmlService.createHtmlOutput('No post data');
    }
    
    const update = JSON.parse(e.postData.contents);
    
    // 1. Handle Callback Query (Klik Tombol Inline)
    if (update.callback_query) {
      handleCallbackQuery(update.callback_query);
      return HtmlService.createHtmlOutput('OK');
    }
    
    // 2. Handle Pesan Teks & Foto Masuk
    if (update.message) {
      handleIncomingMessage(update.message);
      return HtmlService.createHtmlOutput('OK');
    }
    
    return HtmlService.createHtmlOutput('Ignored update');
  } catch (err) {
    Logger.log('Error in doPost: ' + err.toString());
    return HtmlService.createHtmlOutput('Error: ' + err.toString());
  }
}

function doGet(e) {
  try {
    const params = e ? e.parameter : {};
    const picParam = params.pic || '';
    const monthParam = params.month || params.m || String(CONFIG.DEFAULT_MONTH);
    
    if (picParam.toUpperCase() === 'LIST') {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheetNames = ss ? ss.getSheets().map(s => s.getName()) : [];
      return createJsonResponse({
        success: true,
        availableSheets: sheetNames,
        availableMonths: [
          { num: 8, name: 'Agustus 2026', label: 'Bulan ke-1' },
          { num: 9, name: 'September 2026', label: 'Bulan ke-2' }
        ]
      });
    }
    
    const targetPic = picParam || CONFIG.DEFAULT_SHEET_NAME;
    const scheduleData = fetchPmScheduleFromSheet(targetPic, monthParam);
    
    if (!scheduleData || scheduleData.length === 0) {
      return createJsonResponse({
        success: false,
        error: 'Data PM tidak ditemukan untuk sheet/PIC: ' + targetPic + ' (Bulan ' + monthParam + ')',
        pic: targetPic,
        month: monthParam
      });
    }
    
    const targetMonthNum = parseInt(monthParam, 10) || CONFIG.DEFAULT_MONTH;
    const monthMeta = MONTHS_CONFIG[targetMonthNum] || { name: `Bulan ${targetMonthNum}`, label: `Bulan ke-${targetMonthNum}` };
    
    return createJsonResponse({
      success: true,
      pic: targetPic,
      month: targetMonthNum,
      monthName: monthMeta.name,
      monthLabel: monthMeta.label,
      totalEquipment: scheduleData.length,
      equipmentSchedule: scheduleData
    });
  } catch (err) {
    return createJsonResponse({
      success: false,
      error: err.toString()
    });
  }
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================================
// 3. TELEGRAM MESSAGE & COMMAND ROUTER
// ============================================================================

function handleIncomingMessage(msg) {
  try {
    const chatId = msg.chat.id.toString();
    const text = (msg.text || '').trim();
    const userName = (msg.from && msg.from.first_name) ? msg.from.first_name : 'Rekan Maintenance';
    
    const isAdmin = checkIsAdmin(chatId);
    let activePic = getUserPic(chatId);
    let activeMonth = getUserMonth(chatId);
    
    // Foto Bukti Laporan
    if (msg.photo && msg.photo.length > 0) {
      const caption = (msg.caption || '').trim();
      sendTelegramMessage(chatId, `📸 <b>Foto Bukti PM Diterima!</b>\n<i>${escapeHtml(caption || 'Dokumentasi pemeliharaan tersimpan')}</i>\n\nSilakan lanjutkan input laporan melalui tombol <b>[📝 Input Lapor PM]</b>.`);
      return;
    }
    
    // Format teks cepat: LAPOR#NO_MESIN#KANBAN#TANGGAL
    if (text.toUpperCase().startsWith('LAPOR#') || text.toUpperCase().startsWith('SELESAI#')) {
      if (!activePic) {
        sendPicSelectionKeyboard(chatId, '⚠️ <b>Pilih Sheet PIC Terlebih Dahulu:</b>\nTentukan sheet yang ingin Anda laporkan:', 'lapor');
        return;
      }
      handleTextReport(chatId, activePic, text, activeMonth);
      return;
    }
    
    if (text.startsWith('/start') || text === '🔄 Menu Utama' || text === '/menu' || text.startsWith('/pm')) {
      sendWelcomeMessage(chatId, userName, activePic, activeMonth, isAdmin);
    } 
    else if (text === '📅 Jadwal PM Hari Ini' || text === '/today') {
      if (!activePic) {
        sendPicSelectionKeyboard(chatId, 'Silakan pilih sheet PIC yang ingin dilihat jadwalnya:', 'today');
        return;
      }
      sendTodaySchedule(chatId, activePic, activeMonth);
    } 
    else if (text === '🚨 List PM Delay' || text === '/delay') {
      if (!activePic) {
        sendPicSelectionKeyboard(chatId, 'Silakan pilih sheet PIC yang ingin diperiksa delay-nya:', 'delay');
        return;
      }
      sendDelayDetail(chatId, activePic, activeMonth);
    } 
    else if (text === '📝 Input Lapor PM' || text === '/lapor' || text === '/input') {
      if (!activePic) {
        sendPicSelectionKeyboard(chatId, 'Silakan pilih sheet PIC untuk input laporan:', 'lapor');
        return;
      }
      sendEquipmentSelectionWizard(chatId, activePic, activeMonth);
    }
    else if (text === '📈 Summary Progress PM' || text === '/summary') {
      if (!activePic) {
        sendPicSelectionKeyboard(chatId, 'Silakan pilih sheet PIC untuk melihat ringkasan progress:', 'summary');
        return;
      }
      sendSummaryProgress(chatId, activePic, activeMonth);
    } 
    else if (text === '🗓️ Pilih / Ganti Bulan' || text === '🗓️ Ganti Bulan' || text === '/bulan' || text === '/month') {
      sendMonthSelectionKeyboard(chatId);
    }
    else if (text === '👤 Pilih / Ganti PIC' || text === '👤 Buka / Pantau Sheet' || text === '/pic') {
      sendPicSelectionKeyboard(chatId, 'Silakan pilih sheet PIC yang ingin Anda buka / pantau:');
    } 
    else if (text === '👑 Admin Overview' || text === '/admin') {
      if (isAdmin) {
        sendAdminOverview(chatId, activeMonth);
      } else {
        sendTelegramMessage(chatId, '⛔ <b>Akses Ditolak</b>\nMenu ini khusus untuk Administrator/Supervisor. Ketik <code>/setadmin</code> untuk mendaftar.');
      }
    } 
    else if (text === '/cleandupes' || text === '/bersihkan' || text === '🧹 Bersihkan Duplikat') {
      const res = autoCleanAllDuplicatePmEntries(activePic, activeMonth);
      if (res && res.success) {
        sendTelegramMessage(chatId, `🧹 <b>Pembersihan Data Duplikat Selesai!</b>\n\nSebanyak <b>${res.cleanedCount} entri duplikat tanggal lama</b> telah otomatis dibersihkan dari baris Actual (${getMonthDisplayName(activeMonth)}).\nHanya tanggal aktual <b>paling baru / terakhir</b> yang dipertahankan!`);
      } else {
        sendTelegramMessage(chatId, `ℹ️ Tidak ada entri duplikat tanggal lama yang perlu dibersihkan pada sheet <b>${activePic || 'Aktif'}</b> (${getMonthDisplayName(activeMonth)}).`);
      }
    }
    else if (text === 'ℹ️ Bantuan' || text === '/help') {
      sendHelpMessage(chatId);
    } 
    else if (text.startsWith('/setadmin')) {
      saveUserAsAdmin(chatId);
      sendTelegramMessage(chatId, '✅ <b>Selamat!</b> Chat ID Anda (<code>' + chatId + '</code>) kini terdaftar sebagai <b>ADMINISTRATOR / SUPERVISOR</b>.\nKetik /admin untuk membuka dashboard supervisor.');
    } 
    else {
      sendWelcomeMessage(chatId, userName, activePic, activeMonth, isAdmin);
    }
  } catch (err) {
    Logger.log('Error handling message: ' + err.toString());
  }
}

/**
 * Router Interaktif Callback Query
 */
function handleCallbackQuery(cb) {
  try {
    const chatId = cb.message.chat.id.toString();
    const data = cb.data || '';
    const isAdmin = checkIsAdmin(chatId);
    let activePic = getUserPic(chatId);
    let activeMonth = getUserMonth(chatId);
    
    answerCallback(cb.id);
    
    // 0. Menu Akses Bulan
    if (data === 'cmd_switch_month') {
      sendMonthSelectionKeyboard(chatId);
    }
    else if (data.startsWith('set_month:')) {
      const selectedMonthNum = parseInt(data.substring('set_month:'.length), 10) || CONFIG.DEFAULT_MONTH;
      setUserMonth(chatId, selectedMonthNum);
      activeMonth = selectedMonthNum;
      
      const mInfo = MONTHS_CONFIG[selectedMonthNum] || { name: `Bulan ${selectedMonthNum}`, label: `Bulan ke-${selectedMonthNum}` };
      const text = `✅ <b>Periode Bulan Berhasil Diubah!</b>\n\n` +
                   `🗓️ <b>Bulan Aktif:</b> <b>${mInfo.name} (${mInfo.label})</b>\n` +
                   `👤 <b>PIC Aktif:</b> <code>${activePic || '(Belum Dipilih)'}</code>\n\n` +
                   `Seluruh jadwal, delay, dan input laporan akan mengacu pada periode ini.`;
      sendTelegramMessage(chatId, text, getMainInlineKeyboard(isAdmin, activePic, activeMonth));
    }
    // 1. Pilih PIC
    else if (data.startsWith('set_pic:')) {
      const selectedSheetName = decodeURIComponent(data.substring('set_pic:'.length));
      setUserPic(chatId, selectedSheetName);
      activePic = selectedSheetName;
      
      const mInfo = MONTHS_CONFIG[activeMonth] || { name: `Bulan ${activeMonth}`, label: `Bulan ke-${activeMonth}` };
      const text = `✅ <b>Sheet Berhasil Dibuka!</b>\n\n` +
                   `📄 <b>Sheet Aktif:</b> <code>${selectedSheetName}</code>\n` +
                   `🗓️ <b>Periode:</b> ${mInfo.name} (${mInfo.label})\n\n` +
                   `Silakan pilih menu di bawah ini:`;
      sendTelegramMessage(chatId, text, getMainInlineKeyboard(isAdmin, activePic, activeMonth));
    } 
    // 2. Step 1 Wizard: Buka Menu Pilih Mesin
    else if (data === 'cmd_lapor_wizard' || data === 'cmd_lapor_menu') {
      if (!activePic) {
        sendPicSelectionKeyboard(chatId, 'Silakan pilih sheet PIC untuk input laporan:', 'lapor');
        return;
      }
      sendEquipmentSelectionWizard(chatId, activePic, activeMonth);
    }
    // 3. Step 2 Wizard: Mesin Dipilih -> Tampilkan Pilihan Kanban
    else if (data.startsWith('wiz_eq:')) {
      if (!activePic) {
        sendPicSelectionKeyboard(chatId, 'Silakan pilih sheet PIC terlebih dahulu:');
        return;
      }
      const eqNo = parseInt(data.split(':')[1], 10);
      sendKanbanSelectionWizard(chatId, activePic, eqNo, activeMonth);
    }
    // 4. Step 3 Wizard: Kanban Dipilih -> Tampilkan Pilihan Tanggal
    else if (data.startsWith('wiz_kb:')) {
      if (!activePic) {
        sendPicSelectionKeyboard(chatId, 'Silakan pilih sheet PIC terlebih dahulu:');
        return;
      }
      const parts = data.split(':');
      const eqNo = parseInt(parts[1], 10);
      const kanban = parts[2];
      sendDateSelectionWizard(chatId, activePic, eqNo, kanban, activeMonth);
    }
    // 5. Step 4 Wizard: Tanggal Dipilih -> Eksekusi Penulisan
    else if (data.startsWith('wiz_date:')) {
      if (!activePic) {
        sendPicSelectionKeyboard(chatId, 'Silakan pilih sheet PIC terlebih dahulu:');
        return;
      }
      const parts = data.split(':');
      const eqNo = parseInt(parts[1], 10);
      const kanban = parts[2];
      const chosenDay = parseInt(parts[3], 10);
      
      executeAndConfirmReport(chatId, activePic, eqNo, kanban, chosenDay, activeMonth);
    }
    // 6. Tombol Aksi Menu Utama
    else if (data === 'cmd_today') {
      if (!activePic) {
        sendPicSelectionKeyboard(chatId, 'Silakan pilih sheet PIC yang ingin dilihat jadwalnya:', 'today');
        return;
      }
      sendTodaySchedule(chatId, activePic, activeMonth);
    } 
    else if (data === 'cmd_delay') {
      if (!activePic) {
        sendPicSelectionKeyboard(chatId, 'Silakan pilih sheet PIC yang ingin diperiksa delay-nya:', 'delay');
        return;
      }
      sendDelayDetail(chatId, activePic, activeMonth);
    } 
    else if (data === 'cmd_summary') {
      if (!activePic) {
        sendPicSelectionKeyboard(chatId, 'Silakan pilih sheet PIC untuk melihat ringkasan progress:', 'summary');
        return;
      }
      sendSummaryProgress(chatId, activePic, activeMonth);
    } 
    else if (data === 'cmd_switch_pic') {
      sendPicSelectionKeyboard(chatId, '🔄 <b>Pilih Sheet PIC:</b>\nSilakan pilih sheet yang ingin Anda buka / pantau:');
    } 
    else if (data === 'cmd_admin_overview') {
      if (isAdmin) {
        sendAdminOverview(chatId, activeMonth);
      } else {
        sendTelegramMessage(chatId, '⛔ Akses Admin Diperlukan.');
      }
    } 
    else if (data === 'cmd_help') {
      sendHelpMessage(chatId);
    }
    else if (data === 'cmd_menu') {
      sendWelcomeMessage(chatId, 'Rekan Maintenance', activePic, activeMonth, isAdmin);
    }
  } catch (err) {
    Logger.log('Error handling callback: ' + err.toString());
  }
}

// ============================================================================
// 4. GENERATOR PESAN RESPON & WIZARD LAPORAN PM
// ============================================================================

/**
 * 1. Pesan Sambutan & Menu Utama
 */
function sendWelcomeMessage(chatId, userName, activePic, activeMonth, isAdmin) {
  const today = getTodayDayNumber(activeMonth);
  const mInfo = MONTHS_CONFIG[activeMonth] || { name: `Bulan ${activeMonth}`, label: `Bulan ke-${activeMonth}` };
  const dateStr = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'dd MMMM yyyy');
  
  let msg = `🤖 <b>PM Module Excelent Maintenance</b>\n`;
  msg += `<i>Swa-Jawab Jadwal, Evaluasi Delay & Input Laporan PM</i>\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `👋 Halo, <b>${escapeHtml(userName)}</b>!\n`;
  msg += `🗓️ <b>Bulan Aktif:</b> <b>${mInfo.name} (${mInfo.label})</b>\n`;
  msg += `📅 <b>Tanggal:</b> ${dateStr} (Hari ke-${today})\n`;
  
  if (isAdmin) {
    msg += `👑 <b>Status:</b> <b>Administrator / Supervisor (All Lines)</b>\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    msg += `Silakan pantau seluruh performa line atau buka sheet tertentu:`;
  } else {
    const hasPic = activePic && activePic.length > 0;
    const picDisplay = hasPic ? `<code>${activePic}</code>` : `<i>(Belum Dipilih)</i>`;
    msg += `👤 <b>Profil PIC:</b> ${picDisplay}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    if (!hasPic) {
      msg += `💡 <i>Silakan pilih nama PIC / Sheet Anda melalui tombol <b>[👤 Pilih PIC]</b> di bawah:</i>`;
    } else {
      msg += `Pilih menu cepat di bawah ini:`;
    }
  }
  
  sendTelegramMessage(chatId, msg, getMainInlineKeyboard(isAdmin, activePic, activeMonth), getPersistentReplyKeyboard(isAdmin));
}

/**
 * Dialog Pemilihan Periode Bulan
 */
function sendMonthSelectionKeyboard(chatId) {
  const activeMonth = getUserMonth(chatId);
  
  let msg = `╔══════════════════════════════════════╗\n`;
  msg += `  🗓️ <b>PILIH PERIODE BULAN PM ACTIVITY</b>\n`;
  msg += `╚══════════════════════════════════════╝\n\n`;
  msg += `Program PM Maintenance saat ini telah memasuki <b>Bulan ke-2 (September 2026)</b>.\n\n`;
  msg += `Silakan pilih periode bulan yang ingin Anda kelola / pantau:\n`;
  
  const keyboard = [
    [
      {
        text: `${activeMonth === 9 ? '🟢' : '📅'} Bulan 2: September 2026 ${activeMonth === 9 ? '✔ [AKTIF]' : ''}`,
        callback_data: 'set_month:9'
      }
    ],
    [
      {
        text: `${activeMonth === 8 ? '🟢' : '📅'} Bulan 1: Agustus 2026 ${activeMonth === 8 ? '✔ [AKTIF]' : ''}`,
        callback_data: 'set_month:8'
      }
    ],
    [
      { text: '🔙 Menu Utama', callback_data: 'cmd_menu' }
    ]
  ];
  
  sendTelegramMessage(chatId, msg, { inline_keyboard: keyboard });
}

/**
 * STEP 1 WIZARD: Pilih Equipment / Mesin
 */
function sendEquipmentSelectionWizard(chatId, picName, targetMonth) {
  const schedule = fetchPmScheduleFromSheet(picName, targetMonth);
  const mInfo = MONTHS_CONFIG[targetMonth] || { name: `Bulan ${targetMonth}`, label: `Bulan ke-${targetMonth}` };
  
  if (!schedule || schedule.length === 0) {
    sendTelegramMessage(chatId, `⚠️ Data PM tidak ditemukan untuk sheet: <b>${picName}</b> (${mInfo.name}).`);
    return;
  }
  
  let msg = `╔══════════════════════════════════════╗\n`;
  msg += `  📝 <b>INPUT LAPORAN PM — LANGKAH 1/3</b>\n`;
  msg += `  👤 <b>PIC / Sheet:</b> ${picName}\n`;
  msg += `  🗓️ <b>Periode:</b> ${mInfo.name} (${mInfo.label})\n`;
  msg += `╚══════════════════════════════════════╝\n\n`;
  msg += `Silakan <b>pilih mesin / equipment</b> yang akan dilaporkan pemeliharaannya:\n\n`;
  
  const keyboard = [];
  let currentRow = [];
  
  schedule.forEach((eq, idx) => {
    const totalEqTasks = eq.tasks.length;
    const doneEqTasks = eq.tasks.filter(t => t.done).length;
    const isAllDone = totalEqTasks > 0 && doneEqTasks === totalEqTasks;
    const icon = isAllDone ? '🟢' : '⚙️';
    
    currentRow.push({
      text: `${icon} #${eq.no} ${eq.equipmentName || eq.coreEquipment || 'Mesin ' + eq.no}`,
      callback_data: `wiz_eq:${eq.no}`
    });
    
    if (currentRow.length === 2 || idx === schedule.length - 1) {
      keyboard.push(currentRow);
      currentRow = [];
    }
  });
  
  keyboard.push([{ text: '🔙 Batal / Menu Utama', callback_data: 'cmd_summary' }]);
  
  sendTelegramMessage(chatId, msg, { inline_keyboard: keyboard });
}

/**
 * STEP 2 WIZARD: Pilih Kanban (A/B/C/D)
 */
function sendKanbanSelectionWizard(chatId, picName, eqNo, targetMonth) {
  const schedule = fetchPmScheduleFromSheet(picName, targetMonth);
  const eq = schedule ? schedule.find(item => item.no === eqNo) : null;
  const mInfo = MONTHS_CONFIG[targetMonth] || { name: `Bulan ${targetMonth}` };
  
  if (!eq) {
    sendTelegramMessage(chatId, `⚠️ Equipment #${eqNo} tidak ditemukan pada ${mInfo.name}.`);
    return;
  }
  
  let msg = `╔══════════════════════════════════════╗\n`;
  msg += `  📝 <b>INPUT LAPORAN PM — LANGKAH 2/3</b>\n`;
  msg += `  ⚙️ <b>Mesin:</b> #${eq.no} ${eq.equipmentName}\n`;
  msg += `  🏷️ <b>Core:</b> ${eq.coreEquipment} (${eq.area})\n`;
  msg += `  🗓️ <b>Bulan:</b> ${mInfo.name}\n`;
  msg += `╚══════════════════════════════════════╝\n\n`;
  msg += `Pilih <b>Jenis Kanban</b> yang akan dilaporkan:\n\n`;
  
  const keyboard = [];
  const kanbanTypes = ['A', 'B', 'C', 'D'];
  
  kanbanTypes.forEach(kbType => {
    const taskPlan = eq.tasks.find(t => t.kanbanType === kbType);
    
    if (!taskPlan) {
      msg += `▫️ <b>KANBAN ${kbType}:</b> <i>🚫 Tidak ada Plan pada ${mInfo.short || mInfo.name}</i>\n`;
      keyboard.push([{
        text: `🚫 KANBAN ${kbType} (Tidak Ada Plan)`,
        callback_data: `noop`
      }]);
    } else if (taskPlan.done) {
      msg += `▫️ <b>KANBAN ${kbType}:</b> 🟢 <b>SUDAH DI-PM</b> (Aktual D${taskPlan.actualDay || taskPlan.planDay}) — <i>Klik untuk update/pindah tanggal</i>\n`;
      keyboard.push([{
        text: `🟢 KANBAN ${kbType} [Done D${taskPlan.actualDay || taskPlan.planDay} ➜ Update Tgl]`,
        callback_data: `wiz_kb:${eq.no}:${kbType}`
      }]);
    } else {
      msg += `▫️ <b>KANBAN ${kbType}:</b> ⏳ <b>BELUM DI-PM</b> (Target Plan: Tanggal ${taskPlan.planDay})\n`;
      keyboard.push([{
        text: `⚡ KANBAN ${kbType} [BELUM DI-PM — Target D${taskPlan.planDay}]`,
        callback_data: `wiz_kb:${eq.no}:${kbType}`
      }]);
    }
  });
  
  msg += `\n<i>💡 Klik tombol Kanban yang ingin Anda input:</i>`;
  keyboard.push([{ text: '🔙 Kembali Pilih Mesin Lain', callback_data: 'cmd_lapor_wizard' }]);
  
  sendTelegramMessage(chatId, msg, { inline_keyboard: keyboard });
}

/**
 * STEP 3 WIZARD: Pilih Tanggal Eksekusi
 */
function sendDateSelectionWizard(chatId, picName, eqNo, kanbanType, targetMonth) {
  const schedule = fetchPmScheduleFromSheet(picName, targetMonth);
  const eq = schedule ? schedule.find(item => item.no === eqNo) : null;
  const mInfo = MONTHS_CONFIG[targetMonth] || { name: `Bulan ${targetMonth}`, days: 30 };
  const totalDays = mInfo.days || 30;
  
  if (!eq) {
    sendTelegramMessage(chatId, `⚠️ Equipment #${eqNo} tidak ditemukan.`);
    return;
  }
  
  let msg = `╔══════════════════════════════════════╗\n`;
  msg += `  📅 <b>PILIH TANGGAL EKSEKUSI PM — LANGKAH 3/3</b>\n`;
  msg += `  ⚙️ <b>Mesin:</b> #${eq.no} ${eq.equipmentName}\n`;
  msg += `  🏷️ <b>Kanban:</b> KANBAN ${kanbanType}\n`;
  msg += `  🗓️ <b>Periode:</b> ${mInfo.name}\n`;
  msg += `╚══════════════════════════════════════╝\n\n`;
  msg += `Pilih <b>tanggal aktual</b> saat pemeliharaan mesin selesai dilakukan:\n`;
  
  const keyboard = [];
  let currentRow = [];
  
  for (let d = 1; d <= totalDays; d++) {
    currentRow.push({
      text: `D${d}`,
      callback_data: `wiz_date:${eq.no}:${kanbanType}:${d}`
    });
    
    if (currentRow.length === 5 || d === totalDays) {
      keyboard.push(currentRow);
      currentRow = [];
    }
  }
  
  keyboard.push([{ text: '🔙 Ganti Kanban', callback_data: `wiz_eq:${eq.no}` }]);
  
  sendTelegramMessage(chatId, msg, { inline_keyboard: keyboard });
}

/**
 * STEP 4: Eksekusi Penulisan ke Google Sheet & Kirim Konfirmasi
 */
function executeAndConfirmReport(chatId, picName, eqNo, kanbanType, chosenDay, targetMonth) {
  const res = executeReportToSheet(picName, eqNo, kanbanType, chosenDay, targetMonth);
  const mInfo = MONTHS_CONFIG[targetMonth] || { name: `Bulan ${targetMonth}` };
  
  if (res && res.success) {
    const actionText = res.isUpdated 
      ? `🔄 <b>TANGGAL PM BERHASIL DIPERBARUI!</b>\n<i>(Pindah dari tanggal D${res.previousDay} ➜ D${res.newDay})</i>`
      : `✅ <b>LAPORAN PM BERHASIL DISIMPAN!</b>`;
      
    let msg = `╔══════════════════════════════════════╗\n`;
    msg += `  ${actionText}\n`;
    msg += `╚══════════════════════════════════════╝\n\n`;
    msg += `📄 <b>Sheet PIC :</b> <code>${picName}</code>\n`;
    msg += `🗓️ <b>Periode   :</b> <b>${mInfo.name}</b>\n`;
    msg += `⚙️ <b>Mesin No  :</b> #${eqNo}\n`;
    msg += `🏷️ <b>Kanban    :</b> KANBAN ${kanbanType}\n`;
    msg += `📅 <b>Tgl Aktual:</b> Tanggal ${chosenDay} (D${chosenDay})\n`;
    msg += `📊 <b>Status    :</b> 🟢 <b>100% COMPLETED</b>\n\n`;
    msg += `Data otomatis tercatat dan tersinkronisasi ke Dashboard & S-Curve KANRI! ✨`;
    
    const inline = {
      inline_keyboard: [
        [{ text: '📝 Input Lapor Mesin Lain', callback_data: 'cmd_lapor_wizard' }],
        [{ text: '📈 Lihat Progress S-Curve', callback_data: 'cmd_summary' }, { text: '🚨 Cek Sisa Delay', callback_data: 'cmd_delay' }],
        [{ text: '🔄 Menu Utama', callback_data: 'cmd_menu' }]
      ]
    };
    
    sendTelegramMessage(chatId, msg, inline);
  } else {
    sendTelegramMessage(chatId, `❌ <b>Gagal Menyimpan Laporan</b>\nTerjadi kendala teknis saat menulis ke Google Sheet.\n<i>Pesan Error: ${res ? res.error : 'Unknown'}</i>`);
  }
}

/**
 * Handle input teks cepat: LAPOR#NO#KANBAN#TANGGAL
 */
function handleTextReport(chatId, picName, text, targetMonth) {
  const parts = text.split('#');
  if (parts.length < 4) {
    sendTelegramMessage(chatId, `⚠️ Format salah. Gunakan format:\n<code>LAPOR#NO_MESIN#KANBAN#TANGGAL</code>\nContoh: <code>LAPOR#1#A#5</code>`);
    return;
  }
  
  const eqNo = parseInt(parts[1], 10);
  const kanban = parts[2].toUpperCase().trim();
  const day = parseInt(parts[3], 10);
  
  if (isNaN(eqNo) || isNaN(day) || !['A', 'B', 'C', 'D'].includes(kanban)) {
    sendTelegramMessage(chatId, `⚠️ Parameter tidak valid. Pastikan nomor mesin dan tanggal adalah angka, serta kanban adalah A, B, C, atau D.`);
    return;
  }
  
  executeAndConfirmReport(chatId, picName, eqNo, kanban, day, targetMonth);
}

/**
 * 2. Jadwal PM Hari Ini
 */
function sendTodaySchedule(chatId, picName, targetMonth) {
  const schedule = fetchPmScheduleFromSheet(picName, targetMonth);
  const mInfo = MONTHS_CONFIG[targetMonth] || { name: `Bulan ${targetMonth}` };
  
  if (!schedule || schedule.length === 0) {
    sendTelegramMessage(chatId, `⚠️ Data PM tidak ditemukan untuk sheet: <b>${picName}</b> (${mInfo.name}).`);
    return;
  }
  
  const calendarDay = getTodayDayNumber(targetMonth);
  const dateStr = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'dd MMMM yyyy');
  
  const todayTasks = [];
  schedule.forEach(eq => {
    eq.tasks.forEach(t => {
      if (t.planDay === calendarDay) {
        todayTasks.push({
          no: eq.no,
          coreEquipment: eq.coreEquipment,
          equipmentName: eq.equipmentName,
          area: eq.area,
          noKanban: eq.noKanban || '-',
          kanbanType: t.kanbanType,
          planDay: t.planDay,
          done: t.done,
          actualDay: t.actualDay
        });
      }
    });
  });
  
  let msg = `╔══════════════════════════════════════╗\n`;
  msg += `  📅 <b>JADWAL PM HARI INI</b>\n`;
  msg += `  👤 <b>PIC / Sheet:</b> ${picName}\n`;
  msg += `  🗓️ <b>Bulan:</b> ${mInfo.name}\n`;
  msg += `  📆 <b>Tanggal:</b> ${dateStr} (Day ${calendarDay})\n`;
  msg += `╚══════════════════════════════════════╝\n\n`;
  
  if (todayTasks.length === 0) {
    msg += `🎉 <b>TIDAK ADA JADWAL PM PADA HARI INI (D${calendarDay})!</b>\n`;
    msg += `Semua mesin dalam status standby / tidak ada plan pada tanggal ini.\n\n`;
    msg += `💡 <i>Gunakan tombol [🚨 Lihat List Delay] untuk memeriksa task yang belum selesai.</i>`;
  } else {
    msg += `📌 <b>Total Target Hari Ini:</b> ${todayTasks.length} Task\n\n`;
    
    todayTasks.forEach((t, idx) => {
      const statusIcon = t.done ? `🟢 COMPLETED (Done D${t.actualDay || t.planDay})` : '⏳ PENDING (BELUM SELESAI)';
      const kanbanBadge = `[KANBAN ${t.kanbanType}]`;
      
      msg += `<b>${idx + 1}. ⚙️ #${t.no} ${escapeHtml(t.equipmentName)}</b>\n`;
      msg += `   ├ 🏷️ <b>Core:</b> ${escapeHtml(t.coreEquipment)}\n`;
      msg += `   ├ 📍 <b>Area:</b> ${escapeHtml(t.area)}\n`;
      msg += `   ├ 📋 <b>No Kanban:</b> <code>${escapeHtml(t.noKanban)}</code> ${kanbanBadge}\n`;
      msg += `   └ 📊 <b>Status:</b> <b>${statusIcon}</b>\n\n`;
    });
    
    const pendingCount = todayTasks.filter(t => !t.done).length;
    if (pendingCount > 0) {
      msg += `⚠️ <i>Masih ada <b>${pendingCount} task</b> yang belum dieksekusi hari ini.</i>`;
    } else {
      msg += `✨ <i>Luar biasa! Seluruh jadwal PM hari ini sudah selesai (100% Done).</i>`;
    }
  }
  
  const inline = {
    inline_keyboard: [
      [{ text: '📝 Input Lapor PM', callback_data: 'cmd_lapor_wizard' }, { text: '🚨 Lihat List Delay', callback_data: 'cmd_delay' }],
      [{ text: '📈 Progress S-Curve', callback_data: 'cmd_summary' }, { text: '🗓️ Ganti Bulan', callback_data: 'cmd_switch_month' }]
    ]
  };
  
  sendTelegramMessage(chatId, msg, inline);
}

/**
 * 3. List PM Delay
 */
function sendDelayDetail(chatId, picName, targetMonth) {
  const schedule = fetchPmScheduleFromSheet(picName, targetMonth);
  const mInfo = MONTHS_CONFIG[targetMonth] || { name: `Bulan ${targetMonth}` };
  
  if (!schedule || schedule.length === 0) {
    sendTelegramMessage(chatId, `⚠️ Data PM tidak ditemukan untuk sheet: <b>${picName}</b> (${mInfo.name}).`);
    return;
  }
  
  const calendarDay = getTodayDayNumber(targetMonth);
  const dateStr = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'dd MMMM yyyy');
  
  const delayedTasks = [];
  schedule.forEach(eq => {
    eq.tasks.forEach(t => {
      if (t.planDay <= calendarDay && !t.done) {
        delayedTasks.push({
          no: eq.no,
          coreEquipment: eq.coreEquipment,
          equipmentName: eq.equipmentName,
          area: eq.area,
          noKanban: eq.noKanban || '-',
          kanbanType: t.kanbanType,
          planDay: t.planDay,
          daysLate: Math.max(0, calendarDay - t.planDay)
        });
      }
    });
  });
  
  const kanbanA = delayedTasks.filter(t => t.kanbanType === 'A');
  const kanbanB = delayedTasks.filter(t => t.kanbanType === 'B');
  const kanbanC = delayedTasks.filter(t => t.kanbanType === 'C');
  const kanbanD = delayedTasks.filter(t => t.kanbanType === 'D');
  
  let msg = `╔══════════════════════════════════════╗\n`;
  msg += `  🚨 <b>DAFTAR PM DELAY & REMAIN</b>\n`;
  msg += `  👤 <b>PIC / Sheet:</b> ${picName}\n`;
  msg += `  🗓️ <b>Periode:</b> ${mInfo.name}\n`;
  msg += `  📆 <b>Cutoff:</b> Hari ke-${calendarDay} (${dateStr})\n`;
  msg += `╚══════════════════════════════════════╝\n\n`;
  
  if (delayedTasks.length === 0) {
    msg += `🎉 <b>EXCELLENT! ON TRACK (TIDAK ADA PM DELAY)!</b>\n\n`;
    msg += `Seluruh jadwal PM ${mInfo.name} s/d Hari ke-${calendarDay} telah berhasil diselesaikan tepat waktu (100% On Schedule).\n`;
  } else {
    msg += `⚠️ <b>TOTAL DELAY: ${delayedTasks.length} TASK</b>\n`;
    msg += `├ 🔴 Kanban A (Rutin)     : <b>${kanbanA.length} Task</b>\n`;
    msg += `├ 🟠 Kanban B (Periodik)  : <b>${kanbanB.length} Task</b>\n`;
    msg += `├ 🟡 Kanban C (Overhaul)  : <b>${kanbanC.length} Task</b>\n`;
    msg += `└ 🔵 Kanban D (Korektif)  : <b>${kanbanD.length} Task</b>\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    const renderGroup = (title, emoji, list) => {
      if (list.length === 0) return '';
      let str = `${emoji} <b>${title} (${list.length} DELAY):</b>\n`;
      list.forEach((t, i) => {
        const lateInfo = t.daysLate === 0 ? 'Hari Ini (Belum Selesai)' : `Terlambat ${t.daysLate} Hari`;
        str += `${i + 1}. ▫️ <b>#${t.no} ${escapeHtml(t.equipmentName)}</b>\n`;
        str += `   ├ 🏷️ <i>Core: ${escapeHtml(t.coreEquipment)}</i>\n`;
        str += `   ├ 📍 Area: ${escapeHtml(t.area)} | No KB: <code>${escapeHtml(t.noKanban)}</code>\n`;
        str += `   ├ 📅 Target Plan: Tanggal ${t.planDay}\n`;
        str += `   └ ⏳ <b>Keterlambatan:</b> <u>${lateInfo}</u>\n\n`;
      });
      return str;
    };
    
    msg += renderGroup('KANBAN A — ROUTINE INSPECTION', '🔴', kanbanA);
    msg += renderGroup('KANBAN B — PERIODIC MAINTENANCE', '🟠', kanbanB);
    msg += renderGroup('KANBAN C — SPECIAL / OVERHAUL', '🟡', kanbanC);
    msg += renderGroup('KANBAN D — CORRECTIVE / SPARE', '🔵', kanbanD);
    
    msg += `────────────────────────────────────\n`;
    msg += `💡 <i>Gunakan tombol <b>[📝 Input Lapor PM]</b> di bawah untuk mengupdate mesin yang sudah dieksekusi!</i>`;
  }
  
  const inline = {
    inline_keyboard: [
      [{ text: '📝 Input Lapor PM', callback_data: 'cmd_lapor_wizard' }, { text: '📅 Jadwal Hari Ini', callback_data: 'cmd_today' }],
      [{ text: '📈 Progress S-Curve', callback_data: 'cmd_summary' }, { text: '🗓️ Ganti Bulan', callback_data: 'cmd_switch_month' }]
    ]
  };
  
  sendTelegramMessage(chatId, msg, inline);
}

/**
 * 4. Summary Progress & S-Curve
 */
function sendSummaryProgress(chatId, picName, targetMonth) {
  const schedule = fetchPmScheduleFromSheet(picName, targetMonth);
  const mInfo = MONTHS_CONFIG[targetMonth] || { name: `Bulan ${targetMonth}` };
  
  if (!schedule || schedule.length === 0) {
    sendTelegramMessage(chatId, `⚠️ Data PM tidak ditemukan untuk sheet: <b>${picName}</b> (${mInfo.name}).`);
    return;
  }
  
  const allTasks = [];
  schedule.forEach(eq => {
    eq.tasks.forEach(t => allTasks.push(t));
  });
  
  const calendarDay = getTodayDayNumber(targetMonth);
  const dateStr = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'dd MMMM yyyy');
  
  const totalMonth = allTasks.length;
  const planTarget = allTasks.filter(t => t.planDay <= calendarDay).length;
  const actualDone = allTasks.filter(t => t.done && (t.actualDay || t.planDay) <= calendarDay).length;
  const delayCount = allTasks.filter(t => t.planDay <= calendarDay && !t.done).length;
  const achieveRate = planTarget > 0 ? Math.round((actualDone / planTarget) * 100) : 100;
  const monthRate = totalMonth > 0 ? Math.round((actualDone / totalMonth) * 100) : 0;
  
  const kanbanA = allTasks.filter(t => t.kanbanType === 'A');
  const kanbanB = allTasks.filter(t => t.kanbanType === 'B');
  const kanbanC = allTasks.filter(t => t.kanbanType === 'C');
  const kanbanD = allTasks.filter(t => t.kanbanType === 'D');
  
  const kanbanADone = kanbanA.filter(t => t.done).length;
  const kanbanBDone = kanbanB.filter(t => t.done).length;
  const kanbanCDone = kanbanC.filter(t => t.done).length;
  const kanbanDDone = kanbanD.filter(t => t.done).length;
  
  const statusBadge = delayCount <= 0 ? '🟢 ON TRACK (S-CURVE AMAN)' : `🔴 BEHIND SCHEDULE (-${delayCount} TASK)`;
  
  let msg = `╔══════════════════════════════════════╗\n`;
  msg += `  📈 <b>RINGKASAN TELEMETRI PM BULANAN</b>\n`;
  msg += `  👤 <b>PIC / Sheet:</b> ${picName}\n`;
  msg += `  🗓️ <b>Periode:</b> ${mInfo.name}\n`;
  msg += `  📆 <b>Cutoff:</b> Hari ke-${calendarDay} (${dateStr})\n`;
  msg += `╚══════════════════════════════════════╝\n\n`;
  
  msg += `📊 <b>STATUS PERFORMA:</b>\n<b>${statusBadge}</b>\n\n`;
  
  msg += `<b>📋 METRIK PENCAPAIAN (D${calendarDay}):</b>\n`;
  msg += `├ ⚙️ Core Equipment : <b>${schedule.length} Unit</b>\n`;
  msg += `├ 🎯 Target Plan s/d D${calendarDay} : <b>${planTarget} / ${totalMonth} Task</b>\n`;
  msg += `├ ✅ Aktual Selesai s/d D${calendarDay} : <b>${actualDone} Task</b>\n`;
  msg += `├ ⚠️ Sisa Delay Saat Ini : <b>${delayCount === 0 ? '0 (ON TRACK)' : '-' + delayCount + ' Task'}</b>\n`;
  msg += `├ 🏆 <b>Achievement Rate</b> : <b>${achieveRate}%</b> (vs Plan Hari Ini)\n`;
  msg += `└ 📦 <b>Monthly Progress</b> : <b>${monthRate}%</b> (dari Total ${totalMonth} Task)\n\n`;
  
  msg += `<b>🏷️ PROGRESS KANBAN (${mInfo.short || mInfo.name}):</b>\n`;
  msg += `├ 🔴 Kanban A : <b>${kanbanADone} / ${kanbanA.length} Done</b>\n`;
  if (kanbanB.length > 0) msg += `├ 🟠 Kanban B : <b>${kanbanBDone} / ${kanbanB.length} Done</b>\n`;
  if (kanbanC.length > 0) msg += `├ 🟡 Kanban C : <b>${kanbanCDone} / ${kanbanC.length} Done</b>\n`;
  if (kanbanD.length > 0) msg += `├ 🔵 Kanban D : <b>${kanbanDDone} / ${kanbanD.length} Done</b>\n`;
  msg += `\n`;
  
  const filledBars = Math.min(10, Math.max(0, Math.round(achieveRate / 10)));
  const emptyBars = 10 - filledBars;
  const progressBar = '█'.repeat(filledBars) + '░'.repeat(emptyBars);
  msg += `<b>Progress Target:</b>\n<code>[${progressBar}] ${achieveRate}%</code>\n\n`;
  
  const inline = {
    inline_keyboard: [
      [{ text: '📝 Input Lapor PM', callback_data: 'cmd_lapor_wizard' }, { text: '🚨 Lihat List Delay', callback_data: 'cmd_delay' }],
      [{ text: '📅 Jadwal Hari Ini', callback_data: 'cmd_today' }, { text: '🗓️ Ganti Bulan', callback_data: 'cmd_switch_month' }]
    ]
  };
  
  sendTelegramMessage(chatId, msg, inline);
}

/**
 * 5. Dashboard Admin / Supervisor (Overview Semua Line)
 */
function sendAdminOverview(chatId, targetMonth) {
  const dateStr = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'dd MMMM yyyy');
  const calendarDay = getTodayDayNumber(targetMonth);
  const mInfo = MONTHS_CONFIG[targetMonth] || { name: `Bulan ${targetMonth}` };
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss ? ss.getSheets() : [];
  
  let msg = `╔══════════════════════════════════════╗\n`;
  msg += `  👑 <b>SUPERVISOR PM DASHBOARD</b>\n`;
  msg += `  🌐 <b>Overview Seluruh Sheet & Line</b>\n`;
  msg += `  🗓️ <b>Periode:</b> ${mInfo.name}\n`;
  msg += `  📆 <b>Cutoff:</b> Hari ke-${calendarDay} (${dateStr})\n`;
  msg += `╚══════════════════════════════════════╝\n\n`;
  
  let totalAllPlan = 0;
  let totalAllActual = 0;
  let totalAllDelay = 0;
  
  sheets.forEach((sheet, idx) => {
    const sheetName = sheet.getName();
    const schedule = fetchPmScheduleFromSheet(sheetName, targetMonth);
    
    if (!schedule || schedule.length === 0) return;
    
    const allTasks = [];
    schedule.forEach(eq => eq.tasks.forEach(t => allTasks.push(t)));
    if (allTasks.length === 0) return;
    
    const planTarget = allTasks.filter(t => t.planDay <= calendarDay).length;
    const actualDone = allTasks.filter(t => t.done && (t.actualDay || t.planDay) <= calendarDay).length;
    const delay = allTasks.filter(t => t.planDay <= calendarDay && !t.done).length;
    const rate = planTarget > 0 ? Math.round((actualDone / planTarget) * 100) : 100;
    
    totalAllPlan += planTarget;
    totalAllActual += actualDone;
    totalAllDelay += delay;
    
    const statusIcon = delay === 0 ? '🟢 ON TRACK' : `🔴 DELAY -${delay}`;
    
    msg += `<b>${idx + 1}. 📄 ${sheetName}</b>\n`;
    msg += `   ├ Target: ${planTarget}/${allTasks.length} | Done: ${actualDone} | <b>Rate: ${rate}%</b>\n`;
    msg += `   └ Status: <b>${statusIcon}</b>\n\n`;
  });
  
  const overallRate = totalAllPlan > 0 ? Math.round((totalAllActual / totalAllPlan) * 100) : 0;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📊 <b>TOTAL LINE OVERVIEW (${mInfo.short || mInfo.name}):</b>\n`;
  msg += `├ Total Target s/d D${calendarDay} : <b>${totalAllPlan} Task</b>\n`;
  msg += `├ Total Aktual Selesai     : <b>${totalAllActual} Task</b>\n`;
  msg += `├ Total Delay Seluruh Line : <b>${totalAllDelay} Task</b>\n`;
  msg += `└ Total Line Achievement   : <b>${overallRate}%</b>\n`;
  
  const inline = {
    inline_keyboard: [
      [{ text: '🔄 Refresh Overview', callback_data: 'cmd_admin_overview' }, { text: '🗓️ Ganti Bulan', callback_data: 'cmd_switch_month' }],
      [{ text: '👤 Buka Sheet Tertentu', callback_data: 'cmd_switch_pic' }]
    ]
  };
  
  sendTelegramMessage(chatId, msg, inline);
}

/**
 * 6. Pesan Bantuan
 */
function sendHelpMessage(chatId) {
  let msg = `📖 <b>PANDUAN & BANTUAN PM MODULE EXCELENT MAINTENANCE</b>\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `<b>📌 Alur Input Laporan PM:</b>\n`;
  msg += `1. Klik <b>[📝 Input Lapor PM]</b> lalu pilih Mesin.\n`;
  msg += `2. Pilih Kanban (hanya Kanban yang ada di Plan bulan aktif yang tampil).\n`;
  msg += `3. Pilih tanggal eksekusi (1 s/d hari ini / akhir bulan).\n`;
  msg += `4. Data otomatis tersimpan ke baris Actual periode yang dipilih di Google Sheet!\n\n`;
  
  msg += `<b>🤖 Daftar Command:</b>\n`;
  msg += `• /start - Membuka menu utama\n`;
  msg += `• /bulan - Mengganti periode bulan (Agustus vs September)\n`;
  msg += `• /today - Menampilkan jadwal PM hari ini\n`;
  msg += `• /delay - Menampilkan seluruh mesin yang delay\n`;
  msg += `• /lapor - Membuka wizard input laporan PM\n`;
  msg += `• /summary - Melihat performa S-Curve PM\n`;
  msg += `• /pic - Mengganti pilihan Sheet / PIC aktif\n`;
  msg += `• /admin - Membuka dashboard supervisor (jika admin)\n`;
  msg += `• /setadmin - Mendaftarkan ID Anda sebagai Admin bot\n\n`;
  
  sendTelegramMessage(chatId, msg, getMainInlineKeyboard(checkIsAdmin(chatId), getUserPic(chatId), getUserMonth(chatId)));
}

function sendPicSelectionKeyboard(chatId, title) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss ? ss.getSheets() : [];
  
  const keyboard = [];
  sheets.forEach(s => {
    const name = s.getName();
    keyboard.push([{
      text: `👤 ${name}`,
      callback_data: `set_pic:${encodeURIComponent(name)}`
    }]);
  });
  
  sendTelegramMessage(chatId, title, { inline_keyboard: keyboard });
}

// ============================================================================
// 5. PARSER & WRITER DATA SPREADSHEET PM (MULTI-MONTH BLOCK ENGINE)
// ============================================================================

/**
 * Mendeteksi seluruh blok tabel bulan dalam lembar spreadsheet berdasarkan baris header hari
 */
function detectMonthBlocks(data) {
  const blocks = [];
  const headerRows = [];
  
  for (let r = 0; r < data.length; r++) {
    const row = data[r];
    let dayCols = {};
    let dayCount = 0;
    
    for (let c = 0; c < row.length; c++) {
      const val = parseInt(row[c], 10);
      if (!isNaN(val) && val >= 1 && val <= 31) {
        dayCols[val] = c;
        dayCount++;
      }
    }
    
    // Jika sebuah baris memiliki minimal 15 nomor hari berturut-turut, maka itu baris header hari PM
    if (dayCount >= 15) {
      headerRows.push({ rowIdx: r, dayColMap: dayCols, dayCount: dayCount });
    }
  }
  
  for (let i = 0; i < headerRows.length; i++) {
    const h = headerRows[i];
    const nextHeader = headerRows[i + 1];
    const startRow = h.rowIdx + 1;
    const endRow = nextHeader ? nextHeader.rowIdx - 1 : data.length - 1;
    
    // Deteksi nama bulan dari baris-baris di atas header (maksimal 6 baris ke atas)
    let detectedMonthNum = null;
    let detectedMonthName = '';
    
    for (let pr = Math.max(0, h.rowIdx - 6); pr <= h.rowIdx; pr++) {
      const text = data[pr].join(' ').toUpperCase();
      if (text.includes('SEPTEMBER') || text.includes('SEP')) {
        detectedMonthNum = 9;
        detectedMonthName = 'September 2026';
        break;
      } else if (text.includes('AGUSTUS') || text.includes('AUGUST') || text.includes('AUG')) {
        detectedMonthNum = 8;
        detectedMonthName = 'Agustus 2026';
        break;
      } else if (text.includes('OKTOBER') || text.includes('OCT')) {
        detectedMonthNum = 10;
        detectedMonthName = 'Oktober 2026';
        break;
      } else if (text.includes('JULI') || text.includes('JUL')) {
        detectedMonthNum = 7;
        detectedMonthName = 'Juli 2026';
        break;
      }
    }
    
    // Fallback: Jika tidak terdeteksi dari teks, Blok 0 = Agustus (8), Blok 1 = September (9), dst.
    if (!detectedMonthNum) {
      detectedMonthNum = 8 + i;
      detectedMonthName = detectedMonthNum === 9 ? 'September 2026' : (detectedMonthNum === 8 ? 'Agustus 2026' : `Bulan ${detectedMonthNum}`);
    }
    
    blocks.push({
      blockIndex: i,
      monthNum: detectedMonthNum,
      monthName: detectedMonthName,
      headerRowIdx: h.rowIdx,
      startRow: startRow,
      endRow: endRow,
      dayColMap: h.dayColMap
    });
  }
  
  return blocks;
}

function parseScheduleFromBlock(data, backgrounds, block) {
  const schedule = [];
  let currentEquipment = null;
  const dayColMap = block.dayColMap;
  
  for (let r = block.startRow; r <= block.endRow; r++) {
    const row = data[r];
    if (!row) continue;
    
    const noVal = parseInt(row[0], 10);
    const coreEq = String(row[1] || '').trim();
    const eqName = String(row[2] || '').trim();
    const area = String(row[3] || '').trim();
    const noKanban = String(row[4] || '').trim();
    
    let rowTag = '';
    for (let c = 4; c <= 7; c++) {
      const t = String(row[c] || '').trim().toUpperCase();
      if (t === 'P' || t === 'PLAN') { rowTag = 'P'; break; }
      if (t === 'A' || t === 'ACTUAL') { rowTag = 'A'; break; }
    }
    
    const isNewEquipment = !isNaN(noVal) && noVal > 0;
    
    if (isNewEquipment) {
      if (currentEquipment) {
        schedule.push(currentEquipment);
      }
      currentEquipment = {
        no: noVal,
        coreEquipment: coreEq,
        equipmentName: eqName,
        area: area,
        noKanban: noKanban,
        tasks: []
      };
    }
    
    if (!currentEquipment) continue;
    
    const isActualRow = rowTag === 'A' || (!isNewEquipment && (rowTag === 'A' || eqName === '' || noVal === 0 || isNaN(noVal)));
    
    if (!isActualRow) {
      Object.keys(dayColMap).forEach(dayStr => {
        const day = parseInt(dayStr, 10);
        const col = dayColMap[day];
        const cellVal = String(row[col] || '').trim().toUpperCase();
        
        if (cellVal === 'A' || cellVal === 'B' || cellVal === 'C' || cellVal === 'D') {
          currentEquipment.tasks.push({
            kanbanType: cellVal,
            planDay: day,
            done: false
          });
        }
      });
    } else {
      Object.keys(dayColMap).forEach(dayStr => {
        const day = parseInt(dayStr, 10);
        const col = dayColMap[day];
        const cellVal = String(row[col] || '').trim().toUpperCase();
        const bg = (backgrounds[r] && backgrounds[r][col]) ? backgrounds[r][col].toLowerCase() : '';
        
        const isLetterMark = (cellVal === 'A' || cellVal === 'B' || cellVal === 'C' || cellVal === 'D');
        const isCheckSymbol = (cellVal === '✓' || cellVal === '✔' || cellVal === 'V' || cellVal === 'OK');
        const isGreen = isGreenColor(bg);
        
        if (isLetterMark || isCheckSymbol || isGreen) {
          let targetTask = null;
          
          if (isLetterMark) {
            targetTask = currentEquipment.tasks.find(t => t.kanbanType === cellVal && t.planDay === day && !t.done);
            if (!targetTask) {
              targetTask = currentEquipment.tasks.find(t => t.kanbanType === cellVal && !t.done);
            }
          }
          
          if (!targetTask) {
            targetTask = currentEquipment.tasks.find(t => t.planDay === day && !t.done);
          }
          
          if (!targetTask && (isGreen || isCheckSymbol)) {
            targetTask = currentEquipment.tasks.find(t => !t.done);
          }
          
          if (targetTask) {
            targetTask.done = true;
            targetTask.actualDay = day;
          }
        }
      });
    }
  }
  
  if (currentEquipment) {
    schedule.push(currentEquipment);
  }
  
  return schedule;
}

/**
 * Pencari sheet yang cerdas dan toleran terhadap variasi nama PIC (misal: "MOCHAMAD DENDY" -> Sheet "DENDY")
 */
function findSheetByPicName(ss, picName) {
  if (!ss || !picName) return null;
  const cleanPic = String(picName).trim().toUpperCase();
  
  // 1. Exact match
  let sheet = ss.getSheetByName(cleanPic);
  if (sheet) return sheet;
  
  sheet = ss.getSheetByName(picName);
  if (sheet) return sheet;
  
  const sheets = ss.getSheets();
  
  // 2. Exact match case-insensitive
  for (let i = 0; i < sheets.length; i++) {
    if (sheets[i].getName().toUpperCase().trim() === cleanPic) {
      return sheets[i];
    }
  }
  
  // 3. Substring match
  for (let i = 0; i < sheets.length; i++) {
    const sName = sheets[i].getName().toUpperCase().trim();
    if (cleanPic.includes(sName) || sName.includes(cleanPic)) {
      return sheets[i];
    }
  }
  
  // 4. Special name aliases
  if (cleanPic.includes('DENDY') || cleanPic.includes('MOCHAMAD') || cleanPic.includes('GHIFFARI')) {
    sheet = ss.getSheetByName('DENDY');
    if (sheet) return sheet;
  }
  if (cleanPic.includes('DWI') || cleanPic.includes('PURNOMO')) {
    sheet = ss.getSheetByName('DWI');
    if (sheet) return sheet;
  }
  if (cleanPic.includes('DENNY') || cleanPic.includes('NURIANTO')) {
    sheet = ss.getSheetByName('DENNY');
    if (sheet) return sheet;
  }
  if (cleanPic.includes('AZIZ') || cleanPic.includes('MUSLIM')) {
    sheet = ss.getSheetByName('AZIZ');
    if (sheet) return sheet;
  }
  if (cleanPic.includes('PILAR') || cleanPic.includes('PRATAMA')) {
    sheet = ss.getSheetByName('PILAR');
    if (sheet) return sheet;
  }
  if (cleanPic.includes('KURDI') || cleanPic.includes('KURNIAWAN')) {
    sheet = ss.getSheetByName('KURDI');
    if (sheet) return sheet;
  }
  if (cleanPic.includes('IKHMAL') || cleanPic.includes('ARASYI')) {
    sheet = ss.getSheetByName('IKHMAL');
    if (sheet) return sheet;
  }
  if (cleanPic.includes('ARLI') || cleanPic.includes('YULIANTO')) {
    sheet = ss.getSheetByName('ARLI');
    if (sheet) return sheet;
  }
  
  return null;
}

function fetchPmScheduleFromSheet(picName, targetMonth) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return null;
    
    let sheet = findSheetByPicName(ss, picName);
    if (!sheet) return null;
    
    const data = sheet.getDataRange().getValues();
    const backgrounds = sheet.getDataRange().getBackgrounds();
    
    const blocks = detectMonthBlocks(data);
    if (blocks.length === 0) return [];
    
    const monthNum = parseInt(targetMonth, 10) || CONFIG.DEFAULT_MONTH;
    let matchedBlock = blocks.find(b => b.monthNum === monthNum);
    
    if (!matchedBlock) {
      const monthStr = String(targetMonth || '').toLowerCase();
      matchedBlock = blocks.find(b => b.monthName.toLowerCase().includes(monthStr));
    }
    
    if (!matchedBlock) {
      if (monthNum === 8 && blocks.length > 0) {
        matchedBlock = blocks[0];
      } else {
        matchedBlock = blocks[blocks.length - 1];
      }
    }
    
    return parseScheduleFromBlock(data, backgrounds, matchedBlock);
  } catch (err) {
    Logger.log('Error parsing sheet: ' + err.toString());
    return null;
  }
}

function executeReportToSheet(picName, eqNo, kanbanType, actualDay, targetMonth) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return { success: false, error: 'Spreadsheet tidak aktif' };
    
    let sheet = findSheetByPicName(ss, picName);
    if (!sheet) return { success: false, error: 'Sheet PIC tidak ditemukan untuk: ' + picName };
    
    const data = sheet.getDataRange().getValues();
    const blocks = detectMonthBlocks(data);
    if (blocks.length === 0) return { success: false, error: 'Tabel bulan tidak terdeteksi' };
    
    const monthNum = parseInt(targetMonth, 10) || CONFIG.DEFAULT_MONTH;
    let targetBlock = blocks.find(b => b.monthNum === monthNum);
    if (!targetBlock) {
      targetBlock = (monthNum === 8) ? blocks[0] : blocks[blocks.length - 1];
    }
    
    const dayColMap = targetBlock.dayColMap;
    if (!dayColMap[actualDay]) return { success: false, error: 'Kolom tanggal D' + actualDay + ' tidak ditemukan pada tabel ' + targetBlock.monthName };
    
    const targetColIdx = dayColMap[actualDay];
    
    let targetActualRowIdx = -1;
    for (let r = targetBlock.startRow; r <= targetBlock.endRow; r++) {
      const noVal = parseInt(data[r][0], 10);
      if (noVal === eqNo) {
        targetActualRowIdx = r + 1; // Baris Actual berada tepat di bawah baris Plan
        break;
      }
    }
    
    if (targetActualRowIdx === -1 || targetActualRowIdx >= data.length) {
      return { success: false, error: 'Baris mesin #' + eqNo + ' tidak ditemukan pada tabel ' + targetBlock.monthName };
    }
    
    // Bersihkan data tanggal sebelumnya untuk jenis KANBAN yang SAMA pada blok bulan ini
    let previousDay = null;
    Object.keys(dayColMap).forEach(dStr => {
      const d = parseInt(dStr, 10);
      const c = dayColMap[d];
      const cellVal = String(data[targetActualRowIdx][c] || '').trim().toUpperCase();
      
      if (cellVal === kanbanType && d !== actualDay) {
        previousDay = d;
        const prevCell = sheet.getRange(targetActualRowIdx + 1, c + 1);
        prevCell.setValue('');
        prevCell.setBackground(null);
      }
    });
    
    // Tulis data aktual baru pada tanggal yang dipilih
    const cell = sheet.getRange(targetActualRowIdx + 1, targetColIdx + 1);
    cell.setValue(kanbanType);
    cell.setBackground('#b6d7a8');
    
    return {
      success: true,
      monthNum: targetBlock.monthNum,
      monthName: targetBlock.monthName,
      isUpdated: (previousDay !== null && previousDay !== actualDay),
      previousDay: previousDay,
      newDay: actualDay
    };
  } catch (err) {
    Logger.log('Error writing report to sheet: ' + err.toString());
    return { success: false, error: err.toString() };
  }
}

function isGreenColor(hex) {
  if (!hex) return false;
  const h = hex.toLowerCase().trim();
  
  const greenPalette = [
    '#b6d7a8', '#34a853', '#00ff00', '#43a047', '#a8d5ba', 
    '#6aa84f', '#93c47d', '#8fce00', '#d9ead3', '#27ae60', 
    '#2ecc71', '#57bb8a', '#81c784', '#4caf50', '#388e3c',
    '#1e7e34', '#28a745', '#70ad47', '#548235', '#375623',
    '#e2f0d9', '#c6efce', '#a9d08e'
  ];
  
  for (let i = 0; i < greenPalette.length; i++) {
    if (h.includes(greenPalette[i].replace('#', ''))) return true;
  }
  
  if (h.startsWith('#') && h.length === 7) {
    const r = parseInt(h.substring(1, 3), 16);
    const g = parseInt(h.substring(3, 5), 16);
    const b = parseInt(h.substring(5, 7), 16);
    
    const isGray = Math.abs(r - g) < 18 && Math.abs(g - b) < 18;
    if (!isGray && g > 115 && g > r + 18 && g > b + 18) {
      return true;
    }
  }
  
  return false;
}

// ============================================================================
// 6. HELPER TELEGRAM API & STATE MANAGEMENT
// ============================================================================

function sendTelegramMessage(chatId, text, inlineKeyboard, replyKeyboard) {
  const MAX_CHUNK = 3800;
  
  if (text.length <= MAX_CHUNK) {
    return sendSingleTelegramMessage(chatId, text, inlineKeyboard, replyKeyboard);
  }
  
  const lines = text.split('\n');
  let currentChunk = '';
  const chunks = [];
  
  for (let i = 0; i < lines.length; i++) {
    if ((currentChunk + lines[i] + '\n').length > MAX_CHUNK) {
      chunks.push(currentChunk);
      currentChunk = lines[i] + '\n';
    } else {
      currentChunk += lines[i] + '\n';
    }
  }
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk);
  }
  
  for (let i = 0; i < chunks.length; i++) {
    const isLast = (i === chunks.length - 1);
    sendSingleTelegramMessage(
      chatId, 
      chunks[i], 
      isLast ? inlineKeyboard : null, 
      isLast ? replyKeyboard : null
    );
  }
}

function sendSingleTelegramMessage(chatId, text, inlineKeyboard, replyKeyboard) {
  const url = `https://api.telegram.org/bot${CONFIG.BOT_TOKEN}/sendMessage`;
  
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    disable_web_page_preview: true
  };
  
  if (inlineKeyboard) {
    payload.reply_markup = inlineKeyboard;
  } else if (replyKeyboard) {
    payload.reply_markup = replyKeyboard;
  }
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const res = UrlFetchApp.fetch(url, options);
    const json = JSON.parse(res.getContentText());
    if (!json.ok) {
      Logger.log('Telegram API Error: ' + res.getContentText());
    }
    return json;
  } catch (err) {
    Logger.log('Failed to send Telegram message: ' + err.toString());
    return null;
  }
}

function answerCallback(callbackQueryId) {
  const url = `https://api.telegram.org/bot${CONFIG.BOT_TOKEN}/answerCallbackQuery`;
  UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ callback_query_id: callbackQueryId }),
    muteHttpExceptions: true
  });
}

function setUserPic(chatId, picName) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('user_pic_' + chatId, picName);
}

function getUserPic(chatId) {
  const props = PropertiesService.getScriptProperties();
  const saved = props.getProperty('user_pic_' + chatId);
  return saved || '';
}

function setUserMonth(chatId, monthNum) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('user_month_' + chatId, String(monthNum));
}

function getUserMonth(chatId) {
  const props = PropertiesService.getScriptProperties();
  const saved = props.getProperty('user_month_' + chatId);
  return parseInt(saved, 10) || CONFIG.DEFAULT_MONTH;
}

function getMonthDisplayName(monthNum) {
  const m = MONTHS_CONFIG[monthNum];
  return m ? m.name : `Bulan ${monthNum}`;
}

function saveUserAsAdmin(chatId) {
  const props = PropertiesService.getScriptProperties();
  const admins = getAdminList();
  if (!admins.includes(chatId)) {
    admins.push(chatId);
    props.setProperty('admin_chat_ids', JSON.stringify(admins));
  }
}

function getAdminList() {
  const props = PropertiesService.getScriptProperties();
  const raw = props.getProperty('admin_chat_ids');
  let list = CONFIG.ADMIN_IDS.slice();
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        list = Array.from(new Set([...list, ...parsed]));
      }
    } catch(e) {}
  }
  return list;
}

function checkIsAdmin(chatId) {
  const admins = getAdminList();
  return admins.includes(chatId);
}

function getTodayDayNumber(targetMonth) {
  const now = new Date();
  const currentMonthNum = parseInt(Utilities.formatDate(now, CONFIG.TIMEZONE, 'M'), 10);
  const targetM = parseInt(targetMonth, 10) || CONFIG.DEFAULT_MONTH;
  
  // Jika bulan yang dipilih adalah bulan sekarang
  if (targetM === currentMonthNum) {
    const dayStr = Utilities.formatDate(now, CONFIG.TIMEZONE, 'd');
    return parseInt(dayStr, 10);
  }
  
  // Jika bulan lalu (misal Agustus di saat September), cutoff = total hari
  if (targetM < currentMonthNum) {
    const mInfo = MONTHS_CONFIG[targetM];
    return mInfo ? mInfo.days : 31;
  }
  
  // Jika bulan sekarang atau awal bulan
  const dayStr = Utilities.formatDate(now, CONFIG.TIMEZONE, 'd');
  return Math.min(30, Math.max(1, parseInt(dayStr, 10)));
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getMainInlineKeyboard(isAdmin, activePic, activeMonth) {
  const mInfo = MONTHS_CONFIG[activeMonth] || { short: 'September' };
  const monthBtnLabel = `🗓️ Periode: ${mInfo.short || 'September 2026'}`;
  const picLabel = activePic ? `👤 PIC: ${activePic}` : `👤 Pilih PIC`;
  
  if (isAdmin) {
    return {
      inline_keyboard: [
        [
          { text: '👑 Admin Overview (Semua Line)', callback_data: 'cmd_admin_overview' }
        ],
        [
          { text: '🚨 List PM Delay', callback_data: 'cmd_delay' },
          { text: '📈 Progress S-Curve', callback_data: 'cmd_summary' }
        ],
        [
          { text: '📅 Jadwal Hari Ini', callback_data: 'cmd_today' },
          { text: '📝 Input Lapor PM', callback_data: 'cmd_lapor_wizard' }
        ],
        [
          { text: monthBtnLabel, callback_data: 'cmd_switch_month' },
          { text: `👤 Sheet: ${activePic || 'Pilih'}`, callback_data: 'cmd_switch_pic' }
        ]
      ]
    };
  } else {
    return {
      inline_keyboard: [
        [
          { text: '📝 Input Lapor PM', callback_data: 'cmd_lapor_wizard' },
          { text: '🚨 Lihat List Delay', callback_data: 'cmd_delay' }
        ],
        [
          { text: '📅 Jadwal Hari Ini', callback_data: 'cmd_today' },
          { text: '📈 Progress S-Curve', callback_data: 'cmd_summary' }
        ],
        [
          { text: monthBtnLabel, callback_data: 'cmd_switch_month' },
          { text: picLabel, callback_data: 'cmd_switch_pic' }
        ]
      ]
    };
  }
}

function getPersistentReplyKeyboard(isAdmin) {
  if (isAdmin) {
    return {
      keyboard: [
        ['👑 Admin Overview', '🚨 List PM Delay'],
        ['📅 Jadwal PM Hari Ini', '📈 Summary Progress PM'],
        ['📝 Input Lapor PM', '🗓️ Pilih / Ganti Bulan'],
        ['👤 Buka / Pantau Sheet']
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    };
  }
  
  return {
    keyboard: [
      ['📝 Input Lapor PM', '🚨 List PM Delay'],
      ['📅 Jadwal PM Hari Ini', '📈 Summary Progress PM'],
      ['🗓️ Pilih / Ganti Bulan', '👤 Pilih / Ganti PIC']
    ],
    resize_keyboard: true,
    one_time_keyboard: false
  };
}

function setupTelegramWebhook() {
  const webAppUrl = CONFIG.WEB_APP_URL;
  const token = CONFIG.BOT_TOKEN;
  const url = "https://api.telegram.org/bot" + token + "/setWebhook?url=" + encodeURIComponent(webAppUrl) + "&drop_pending_updates=true";
  
  const res = UrlFetchApp.fetch(url);
  Logger.log("Set Webhook Result: " + res.getContentText());
}

// ============================================================================
// 7. UTILITY PEMBERSIH DUPLIKAT MASSAL
// ============================================================================

function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    if (ui) {
      ui.createMenu('🛠️ PM Bot Tools')
        .addItem('🧹 Bersihkan Semua Duplikat Tanggal Lama', 'menuCleanDuplicates')
        .addItem('🔄 Sinkronkan Webhook Telegram', 'setupTelegramWebhook')
        .addToUi();
    }
  } catch (e) {
    Logger.log('onOpen UI not available: ' + e.toString());
  }
}

function menuCleanDuplicates() {
  const res = autoCleanAllDuplicatePmEntries();
  Logger.log('Hasil Pembersihan: ' + JSON.stringify(res));
  
  try {
    const ui = SpreadsheetApp.getUi();
    if (ui) {
      if (res && res.success) {
        ui.alert('🧹 Pembersihan Duplikat Selesai!', `Sebanyak ${res.cleanedCount} sel tanggal lama pada baris Actual telah berhasil dibersihkan.\nHanya tanggal aktual paling baru yang dipertahankan.`, ui.ButtonSet.OK);
      } else {
        ui.alert('ℹ️ Info', 'Tidak ditemukan sel duplikat yang perlu dibersihkan.', ui.ButtonSet.OK);
      }
    }
  } catch (e) {
    Logger.log('UI Alert dilewati (dieksekusi langsung dari editor). Total bersih: ' + (res ? res.cleanedCount : 0));
  }
  return res;
}

function autoCleanAllDuplicatePmEntries(targetSheetName, targetMonth) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return { success: false, cleanedCount: 0 };
    
    let sheets = [];
    if (targetSheetName) {
      const s = ss.getSheetByName(targetSheetName);
      if (s) sheets.push(s);
    }
    if (sheets.length === 0) {
      sheets = ss.getSheets();
    }
    
    let totalCleaned = 0;
    
    sheets.forEach(sheet => {
      if (!sheet) return;
      
      const data = sheet.getDataRange().getValues();
      const blocks = detectMonthBlocks(data);
      if (blocks.length === 0) return;
      
      const targetBlocks = targetMonth 
        ? blocks.filter(b => b.monthNum === parseInt(targetMonth, 10))
        : blocks;
        
      targetBlocks.forEach(block => {
        const dayColMap = block.dayColMap;
        
        for (let r = block.startRow; r <= block.endRow; r++) {
          const row = data[r];
          const noVal = parseInt(row[0], 10);
          
          let isActualRow = false;
          for (let c = 0; c < Math.min(10, row.length); c++) {
            const cellStr = String(row[c] || '').trim().toUpperCase();
            if (cellStr === 'ACTUAL' || cellStr === 'A') {
              isActualRow = true;
              break;
            }
          }
          
          if (!isActualRow && (isNaN(noVal) || noVal === 0 || row[0] === '')) {
            isActualRow = true;
          }
          
          if (isActualRow) {
            const kanbanGroup = { 'A': [], 'B': [], 'C': [], 'D': [] };
            
            Object.keys(dayColMap).forEach(dStr => {
              const day = parseInt(dStr, 10);
              const col = dayColMap[day];
              const cellVal = String(row[col] || '').trim().toUpperCase();
              
              if (cellVal === 'A' || cellVal === 'B' || cellVal === 'C' || cellVal === 'D') {
                kanbanGroup[cellVal].push({ day: day, col: col });
              }
            });
            
            ['A', 'B', 'C', 'D'].forEach(kb => {
              const list = kanbanGroup[kb];
              if (list.length > 1) {
                list.sort((a, b) => a.day - b.day);
                for (let i = 0; i < list.length - 1; i++) {
                  const oldEntry = list[i];
                  sheet.getRange(r + 1, oldEntry.col + 1).setValue('');
                  sheet.getRange(r + 1, oldEntry.col + 1).setBackground(null);
                  totalCleaned++;
                }
              }
            });
          }
        }
      });
    });
    
    return { success: true, cleanedCount: totalCleaned };
  } catch (err) {
    Logger.log('Error cleaning duplicates: ' + err.toString());
    return { success: false, error: err.toString(), cleanedCount: 0 };
  }
}
