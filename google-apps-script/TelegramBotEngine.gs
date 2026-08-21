/**
 * ============================================================================
 * PM MODULE EXCELENT MAINTENANCE TELEGRAM BOT ENGINE (v3.2 - Dual View Mode)
 * User Biasa: Profil PIC Personal & Swa Jawab
 * Admin / Supervisor: Dashboard Overview Semua Line & Multi Sheet Inspector
 * ============================================================================
 */

// ============================================================================
// 1. KONFIGURASI BOT & ADMIN
// ============================================================================
const CONFIG = {
  // Token Bot Telegram
  BOT_TOKEN: '8951359806:AAFXsn4VhlXx7_gGNZfohEf3kZ-T-RIoJhk',
  
  // URL Deployment Web App Anda
  WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbzYvd259Z8Cw8g4kBsyTGkvnwaswS6rinGICFW6fWiPP445sw3v2zldOdMf1WqRRJAAtw/exec',
  
  // Daftar Chat ID Admin Default
  ADMIN_IDS: [],
  
  // Zona Waktu
  TIMEZONE: 'Asia/Jakarta',
  
  // Nama Sheet Default jika fallback
  DEFAULT_SHEET_NAME: 'KURDI'
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
    
    if (picParam.toUpperCase() === 'LIST') {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheetNames = ss ? ss.getSheets().map(s => s.getName()) : [];
      return createJsonResponse({
        success: true,
        availableSheets: sheetNames
      });
    }
    
    const targetPic = picParam || CONFIG.DEFAULT_SHEET_NAME;
    const scheduleData = fetchPmScheduleFromSheet(targetPic);
    
    if (!scheduleData || scheduleData.length === 0) {
      return createJsonResponse({
        success: false,
        error: 'Data PM tidak ditemukan untuk sheet/PIC: ' + targetPic,
        pic: targetPic
      });
    }
    
    return createJsonResponse({
      success: true,
      pic: targetPic,
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
      handleTextReport(chatId, activePic, text);
      return;
    }
    
    if (text.startsWith('/start') || text === '🔄 Menu Utama' || text === '/menu' || text.startsWith('/pm')) {
      sendWelcomeMessage(chatId, userName, activePic, isAdmin);
    } 
    else if (text === '📅 Jadwal PM Hari Ini' || text === '/today') {
      if (!activePic) {
        sendPicSelectionKeyboard(chatId, 'Silakan pilih sheet PIC yang ingin dilihat jadwalnya:', 'today');
        return;
      }
      sendTodaySchedule(chatId, activePic);
    } 
    else if (text === '🚨 List PM Delay' || text === '/delay') {
      if (!activePic) {
        sendPicSelectionKeyboard(chatId, 'Silakan pilih sheet PIC yang ingin diperiksa delay-nya:', 'delay');
        return;
      }
      sendDelayDetail(chatId, activePic);
    } 
    else if (text === '📝 Input Lapor PM' || text === '/lapor' || text === '/input') {
      if (!activePic) {
        sendPicSelectionKeyboard(chatId, 'Silakan pilih sheet PIC untuk input laporan:', 'lapor');
        return;
      }
      sendEquipmentSelectionWizard(chatId, activePic);
    }
    else if (text === '📈 Summary Progress PM' || text === '/summary') {
      if (!activePic) {
        sendPicSelectionKeyboard(chatId, 'Silakan pilih sheet PIC untuk melihat ringkasan progress:', 'summary');
        return;
      }
      sendSummaryProgress(chatId, activePic);
    } 
    else if (text === '👤 Pilih / Ganti PIC' || text === '👤 Buka / Pantau Sheet' || text === '/pic') {
      sendPicSelectionKeyboard(chatId, 'Silakan pilih sheet PIC yang ingin Anda buka / pantau:');
    } 
    else if (text === '👑 Admin Overview' || text === '/admin') {
      if (isAdmin) {
        sendAdminOverview(chatId);
      } else {
        sendTelegramMessage(chatId, '⛔ <b>Akses Ditolak</b>\nMenu ini khusus untuk Administrator/Supervisor. Ketik <code>/setadmin</code> untuk mendaftar.');
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
      sendWelcomeMessage(chatId, userName, activePic, isAdmin);
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
    
    answerCallback(cb.id);
    
    // 1. Pilih PIC
    if (data.startsWith('set_pic:')) {
      const selectedSheetName = decodeURIComponent(data.substring('set_pic:'.length));
      setUserPic(chatId, selectedSheetName);
      activePic = selectedSheetName;
      
      const text = `✅ <b>Sheet Berhasil Dibuka!</b>\n\n` +
                   `📄 <b>Sheet Aktif:</b> <code>${selectedSheetName}</code>\n\n` +
                   `Silakan pilih menu di bawah ini:`;
      sendTelegramMessage(chatId, text, getMainInlineKeyboard(isAdmin, activePic));
    } 
    // 2. Step 1 Wizard: Buka Menu Pilih Mesin
    else if (data === 'cmd_lapor_wizard' || data === 'cmd_lapor_menu') {
      if (!activePic) {
        sendPicSelectionKeyboard(chatId, 'Silakan pilih sheet PIC untuk input laporan:', 'lapor');
        return;
      }
      sendEquipmentSelectionWizard(chatId, activePic);
    }
    // 3. Step 2 Wizard: Mesin Dipilih -> Tampilkan Pilihan Kanban
    else if (data.startsWith('wiz_eq:')) {
      if (!activePic) {
        sendPicSelectionKeyboard(chatId, 'Silakan pilih sheet PIC terlebih dahulu:');
        return;
      }
      const eqNo = parseInt(data.split(':')[1], 10);
      sendKanbanSelectionWizard(chatId, activePic, eqNo);
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
      sendDateSelectionWizard(chatId, activePic, eqNo, kanban);
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
      
      executeAndConfirmReport(chatId, activePic, eqNo, kanban, chosenDay);
    }
    // 6. Tombol Aksi Menu Utama
    else if (data === 'cmd_today') {
      if (!activePic) {
        sendPicSelectionKeyboard(chatId, 'Silakan pilih sheet PIC yang ingin dilihat jadwalnya:', 'today');
        return;
      }
      sendTodaySchedule(chatId, activePic);
    } 
    else if (data === 'cmd_delay') {
      if (!activePic) {
        sendPicSelectionKeyboard(chatId, 'Silakan pilih sheet PIC yang ingin diperiksa delay-nya:', 'delay');
        return;
      }
      sendDelayDetail(chatId, activePic);
    } 
    else if (data === 'cmd_summary') {
      if (!activePic) {
        sendPicSelectionKeyboard(chatId, 'Silakan pilih sheet PIC untuk melihat ringkasan progress:', 'summary');
        return;
      }
      sendSummaryProgress(chatId, activePic);
    } 
    else if (data === 'cmd_switch_pic') {
      sendPicSelectionKeyboard(chatId, '🔄 <b>Pilih Sheet PIC:</b>\nSilakan pilih sheet yang ingin Anda buka / pantau:');
    } 
    else if (data === 'cmd_admin_overview') {
      if (isAdmin) {
        sendAdminOverview(chatId);
      } else {
        sendTelegramMessage(chatId, '⛔ Akses Admin Diperlukan.');
      }
    } 
    else if (data === 'cmd_help') {
      sendHelpMessage(chatId);
    }
  } catch (err) {
    Logger.log('Error handling callback: ' + err.toString());
  }
}

// ============================================================================
// 4. GENERATOR PESAN RESPON & WIZARD LAPORAN PM
// ============================================================================

/**
 * 1. Pesan Sambutan & Menu Utama (Disesuaikan untuk Admin vs PIC Biasa)
 */
function sendWelcomeMessage(chatId, userName, activePic, isAdmin) {
  const today = getTodayDayNumber();
  const dateStr = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'dd MMMM yyyy');
  
  let msg = `🤖 <b>PM Module Excelent Maintenance</b>\n`;
  msg += `<i>Swa-Jawab Jadwal, Evaluasi Delay & Input Laporan PM</i>\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `👋 Halo, <b>${escapeHtml(userName)}</b>!\n`;
  msg += `📅 <b>Tanggal:</b> ${dateStr} (Hari ke-${today})\n`;
  
  if (isAdmin) {
    // Tampilan Khusus Admin: Tidak Menampilkan Profil PIC Tertentu
    msg += `👑 <b>Status:</b> <b>Administrator / Supervisor (All Lines)</b>\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    msg += `Silakan pantau seluruh performa line atau buka sheet tertentu:`;
  } else {
    // Tampilan PIC Biasa: Menampilkan Profil PIC Masing-masing
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
  
  sendTelegramMessage(chatId, msg, getMainInlineKeyboard(isAdmin, activePic), getPersistentReplyKeyboard(isAdmin));
}

/**
 * STEP 1 WIZARD: Pilih Equipment / Mesin
 */
function sendEquipmentSelectionWizard(chatId, picName) {
  const schedule = fetchPmScheduleFromSheet(picName);
  
  if (!schedule || schedule.length === 0) {
    sendTelegramMessage(chatId, `⚠️ Data PM tidak ditemukan untuk sheet: <b>${picName}</b>.`);
    return;
  }
  
  let msg = `╔══════════════════════════════════════╗\n`;
  msg += `  📝 <b>INPUT LAPORAN PM — LANGKAH 1/3</b>\n`;
  msg += `  👤 <b>PIC / Sheet:</b> ${picName}\n`;
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
      text: `${icon} #${eq.no} ${eq.equipmentName}`,
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
 * STEP 2 WIZARD: Pilih Kanban (A/B/C/D) dengan Validasi Plan & Notifikasi Hijau
 */
function sendKanbanSelectionWizard(chatId, picName, eqNo) {
  const schedule = fetchPmScheduleFromSheet(picName);
  const eq = schedule ? schedule.find(item => item.no === eqNo) : null;
  
  if (!eq) {
    sendTelegramMessage(chatId, `⚠️ Equipment #${eqNo} tidak ditemukan.`);
    return;
  }
  
  let msg = `╔══════════════════════════════════════╗\n`;
  msg += `  📝 <b>INPUT LAPORAN PM — LANGKAH 2/3</b>\n`;
  msg += `  ⚙️ <b>Mesin:</b> #${eq.no} ${eq.equipmentName}\n`;
  msg += `  🏷️ <b>Core:</b> ${eq.coreEquipment} (${eq.area})\n`;
  msg += `╚══════════════════════════════════════╝\n\n`;
  msg += `Pilih <b>Jenis Kanban</b> yang akan dilaporkan:\n\n`;
  
  const keyboard = [];
  const kanbanTypes = ['A', 'B', 'C', 'D'];
  
  kanbanTypes.forEach(kbType => {
    const taskPlan = eq.tasks.find(t => t.kanbanType === kbType);
    
    if (!taskPlan) {
      msg += `▫️ <b>KANBAN ${kbType}:</b> <i>🚫 Tidak ada Plan bulan ini</i>\n`;
      keyboard.push([{
        text: `🚫 KANBAN ${kbType} (Tidak Ada Plan)`,
        callback_data: `noop`
      }]);
    } else if (taskPlan.done) {
      msg += `▫️ <b>KANBAN ${kbType}:</b> 🟢 <b>SUDAH DI-PM (SELESAI)</b> — <i>Done D${taskPlan.actualDay || taskPlan.planDay}</i>\n`;
      keyboard.push([{
        text: `🟢 KANBAN ${kbType} [SUDAH DI-PM: D${taskPlan.actualDay || taskPlan.planDay}]`,
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
 * STEP 3 WIZARD: Pilih Tanggal Eksekusi (1 s/d Hari Ini)
 */
function sendDateSelectionWizard(chatId, picName, eqNo, kanbanType) {
  const schedule = fetchPmScheduleFromSheet(picName);
  const eq = schedule ? schedule.find(item => item.no === eqNo) : null;
  const today = getTodayDayNumber();
  const dateStr = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'MMMM yyyy');
  
  if (!eq) {
    sendTelegramMessage(chatId, `⚠️ Equipment #${eqNo} tidak ditemukan.`);
    return;
  }
  
  let msg = `╔══════════════════════════════════════╗\n`;
  msg += `  📅 <b>PILIH TANGGAL EKSEKUSI PM — LANGKAH 3/3</b>\n`;
  msg += `  ⚙️ <b>Mesin:</b> #${eq.no} ${eq.equipmentName}\n`;
  msg += `  🏷️ <b>Kanban:</b> [KANBAN ${kanbanType}]\n`;
  msg += `  📆 <b>Periode:</b> ${dateStr} (Maksimal Hari Ini: D${today})\n`;
  msg += `╚══════════════════════════════════════╝\n\n`;
  msg += `Pilih <b>tanggal aktual</b> pemeliharaan dilakukan:\n\n`;
  
  const keyboard = [];
  
  // Tombol Eksekusi Hari Ini
  keyboard.push([{
    text: `🌟 EKSEKUSI HARI INI (Tanggal ${today})`,
    callback_data: `wiz_date:${eq.no}:${kanbanType}:${today}`
  }]);
  
  // Pilihan tanggal sebelumnya (1..today-1)
  let dateRow = [];
  for (let d = today - 1; d >= 1; d--) {
    dateRow.push({
      text: `Tgl ${d}`,
      callback_data: `wiz_date:${eq.no}:${kanbanType}:${d}`
    });
    
    if (dateRow.length === 4 || d === 1) {
      keyboard.push(dateRow);
      dateRow = [];
    }
  }
  
  keyboard.push([{ text: `🔙 Kembali Pilih Kanban`, callback_data: `wiz_eq:${eq.no}` }]);
  
  sendTelegramMessage(chatId, msg, { inline_keyboard: keyboard });
}

/**
 * STEP 4 WIZARD: Eksekusi Penulisan & Konfirmasi Notifikasi Hijau
 */
function executeAndConfirmReport(chatId, picName, eqNo, kanbanType, chosenDay) {
  const schedule = fetchPmScheduleFromSheet(picName);
  const eq = schedule ? schedule.find(item => item.no === eqNo) : null;
  const eqName = eq ? eq.equipmentName : `Mesin #${eqNo}`;
  const coreEq = eq ? eq.coreEquipment : '-';
  const area = eq ? eq.area : '-';
  
  const success = executeReportToSheet(picName, eqNo, kanbanType, chosenDay);
  
  if (success) {
    let msg = `╔══════════════════════════════════════╗\n`;
    msg += `  🟢 <b>LAPORAN PM BERHASIL DISIMPAN!</b>\n`;
    msg += `╚══════════════════════════════════════╝\n\n`;
    msg += `✅ <b>Status:</b> <b>SUDAH DI-PM (SELESAI)</b>\n`;
    msg += `👤 <b>PIC / Sheet:</b> <code>${picName}</code>\n`;
    msg += `⚙️ <b>Mesin:</b> #${eqNo} <b>${escapeHtml(eqName)}</b>\n`;
    msg += `🏷️ <b>Core:</b> ${escapeHtml(coreEq)} (${escapeHtml(area)})\n`;
    msg += `📋 <b>Jenis Kanban:</b> <b>[KANBAN ${kanbanType}]</b>\n`;
    msg += `📅 <b>Tanggal Eksekusi:</b> <b>Tanggal ${chosenDay} (Bulan Aktif)</b>\n\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `✨ <i>Huruf <b>${kanbanType}</b> dan warna latar belakang <b>HIJAU</b> telah otomatis tercatat pada baris Actual Google Sheet!</i>\n\n`;
    msg += `Silakan pilih menu selanjutnya:`;
    
    const inline = {
      inline_keyboard: [
        [{ text: '📝 Lapor Mesin Lain', callback_data: 'cmd_lapor_wizard' }],
        [{ text: '🚨 Cek Sisa Delay', callback_data: 'cmd_delay' }, { text: '📈 Progress S-Curve', callback_data: 'cmd_summary' }],
        [{ text: '🔄 Menu Utama', callback_data: 'cmd_summary' }]
      ]
    };
    
    sendTelegramMessage(chatId, msg, inline);
  } else {
    sendTelegramMessage(chatId, `❌ <b>Gagal Menyimpan ke Google Sheet!</b>\nPeriksa kembali apakah sheet <b>${picName}</b> sedang dibuka atau terkunci.`);
  }
}

/**
 * Handle input laporan teks cepat
 */
function handleTextReport(chatId, picName, text) {
  const parts = text.split('#');
  if (parts.length < 3) {
    sendTelegramMessage(chatId, `ℹ️ <b>Format Laporan Teks:</b>\n<code>LAPOR#NO_MESIN#KANBAN</code> atau <code>LAPOR#NO_MESIN#KANBAN#TANGGAL</code>\nContoh: <code>LAPOR#3#A</code> atau <code>LAPOR#3#A#22</code>`);
    return;
  }
  
  const query = parts[1].trim();
  const kanban = parts[2].trim().toUpperCase();
  const customDay = parts[3] ? parseInt(parts[3].trim(), 10) : getTodayDayNumber();
  const today = getTodayDayNumber();
  
  const actualDay = Math.min(today, Math.max(1, isNaN(customDay) ? today : customDay));
  
  const schedule = fetchPmScheduleFromSheet(picName);
  if (!schedule || schedule.length === 0) {
    sendTelegramMessage(chatId, `⚠️ Sheet tidak ditemukan: <b>${picName}</b>`);
    return;
  }
  
  let targetEq = null;
  const eqNo = parseInt(query, 10);
  if (!isNaN(eqNo)) {
    targetEq = schedule.find(eq => eq.no === eqNo);
  } else {
    targetEq = schedule.find(eq => eq.equipmentName.toLowerCase().includes(query.toLowerCase()));
  }
  
  if (!targetEq) {
    sendTelegramMessage(chatId, `⚠️ Mesin <b>${escapeHtml(query)}</b> tidak ditemukan di sheet <b>${picName}</b>.`);
    return;
  }
  
  executeAndConfirmReport(chatId, picName, targetEq.no, kanban, actualDay);
}

/**
 * 2. Cek Jadwal PM Hari Ini
 */
function sendTodaySchedule(chatId, picName) {
  const schedule = fetchPmScheduleFromSheet(picName);
  const calendarDay = getTodayDayNumber();
  const dateStr = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'dd MMMM yyyy');
  
  if (!schedule || schedule.length === 0) {
    sendTelegramMessage(chatId, `⚠️ <b>Data Tidak Ditemukan</b>\nTidak ada data jadwal PM untuk sheet: <b>${picName}</b>.`);
    return;
  }
  
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
      [{ text: '📈 Progress S-Curve', callback_data: 'cmd_summary' }, { text: '👤 Ganti PIC / Sheet', callback_data: 'cmd_switch_pic' }]
    ]
  };
  
  sendTelegramMessage(chatId, msg, inline);
}

/**
 * 3. List PM Delay
 */
function sendDelayDetail(chatId, picName) {
  const schedule = fetchPmScheduleFromSheet(picName);
  
  if (!schedule || schedule.length === 0) {
    sendTelegramMessage(chatId, `⚠️ Data PM tidak ditemukan untuk sheet: <b>${picName}</b>.`);
    return;
  }
  
  const calendarDay = getTodayDayNumber();
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
  msg += `  📆 <b>Cutoff:</b> Hari ke-${calendarDay} (${dateStr})\n`;
  msg += `╚══════════════════════════════════════╝\n\n`;
  
  if (delayedTasks.length === 0) {
    msg += `🎉 <b>EXCELLENT! ON TRACK (TIDAK ADA PM DELAY)!</b>\n\n`;
    msg += `Seluruh jadwal PM s/d Hari ke-${calendarDay} telah berhasil diselesaikan tepat waktu (100% On Schedule).\n`;
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
      [{ text: '📈 Progress S-Curve', callback_data: 'cmd_summary' }, { text: '👤 Ganti PIC / Sheet', callback_data: 'cmd_switch_pic' }]
    ]
  };
  
  sendTelegramMessage(chatId, msg, inline);
}

/**
 * 4. Summary Progress & S-Curve
 */
function sendSummaryProgress(chatId, picName) {
  const schedule = fetchPmScheduleFromSheet(picName);
  
  if (!schedule || schedule.length === 0) {
    sendTelegramMessage(chatId, `⚠️ Data PM tidak ditemukan untuk sheet: <b>${picName}</b>.`);
    return;
  }
  
  const allTasks = [];
  schedule.forEach(eq => {
    eq.tasks.forEach(t => allTasks.push(t));
  });
  
  const calendarDay = getTodayDayNumber();
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
  msg += `  📈 <b>RINGKASAN TELEMETRI PM BULAN INI</b>\n`;
  msg += `  👤 <b>PIC / Sheet:</b> ${picName}\n`;
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
  
  msg += `<b>🏷️ PROGRESS KANBAN (BULAN INI):</b>\n`;
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
      [{ text: '📅 Jadwal Hari Ini', callback_data: 'cmd_today' }, { text: '👤 Ganti PIC / Sheet', callback_data: 'cmd_switch_pic' }]
    ]
  };
  
  sendTelegramMessage(chatId, msg, inline);
}

/**
 * 5. Dashboard Admin / Supervisor (Overview Semua Line)
 */
function sendAdminOverview(chatId) {
  const dateStr = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'dd MMMM yyyy');
  const calendarDay = getTodayDayNumber();
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss ? ss.getSheets() : [];
  
  let msg = `╔══════════════════════════════════════╗\n`;
  msg += `  👑 <b>SUPERVISOR PM DASHBOARD</b>\n`;
  msg += `  🌐 <b>Overview Seluruh Sheet & Line</b>\n`;
  msg += `  📆 <b>Cutoff:</b> Hari ke-${calendarDay} (${dateStr})\n`;
  msg += `╚══════════════════════════════════════╝\n\n`;
  
  let totalAllPlan = 0;
  let totalAllActual = 0;
  let totalAllDelay = 0;
  
  sheets.forEach((sheet, idx) => {
    const sheetName = sheet.getName();
    const schedule = fetchPmScheduleFromSheet(sheetName);
    
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
  msg += `📊 <b>TOTAL LINE OVERVIEW:</b>\n`;
  msg += `├ Total Target s/d D${calendarDay} : <b>${totalAllPlan} Task</b>\n`;
  msg += `├ Total Aktual Selesai     : <b>${totalAllActual} Task</b>\n`;
  msg += `├ Total Delay Seluruh Line : <b>${totalAllDelay} Task</b>\n`;
  msg += `└ Total Line Achievement   : <b>${overallRate}%</b>\n`;
  
  const inline = {
    inline_keyboard: [
      [{ text: '🔄 Refresh Overview', callback_data: 'cmd_admin_overview' }],
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
  msg += `2. Pilih Kanban (hanya Kanban yang ada di Plan bulan ini yang aktif).\n`;
  msg += `3. Pilih tanggal eksekusi (1 s/d hari ini).\n`;
  msg += `4. Data otomatis tersimpan ke baris Actual Google Sheet!\n\n`;
  
  msg += `<b>🤖 Daftar Command:</b>\n`;
  msg += `• /start - Membuka menu utama\n`;
  msg += `• /today - Menampilkan jadwal PM hari ini\n`;
  msg += `• /delay - Menampilkan seluruh mesin yang delay\n`;
  msg += `• /lapor - Membuka wizard input laporan PM\n`;
  msg += `• /summary - Melihat performa S-Curve PM\n`;
  msg += `• /pic - Mengganti pilihan Sheet / PIC aktif\n`;
  msg += `• /admin - Membuka dashboard supervisor (jika admin)\n`;
  msg += `• /setadmin - Mendaftarkan ID Anda sebagai Admin bot\n\n`;
  
  sendTelegramMessage(chatId, msg, getMainInlineKeyboard(checkIsAdmin(chatId), getUserPic(chatId)));
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
// 5. PARSER & WRITER DATA SPREADSHEET PM
// ============================================================================

function executeReportToSheet(picName, eqNo, kanbanType, actualDay) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return false;
    
    let sheet = ss.getSheetByName(picName);
    if (!sheet) {
      const sheets = ss.getSheets();
      for (let i = 0; i < sheets.length; i++) {
        if (sheets[i].getName().toLowerCase().includes(picName.toLowerCase())) {
          sheet = sheets[i];
          break;
        }
      }
    }
    if (!sheet) return false;
    
    const data = sheet.getDataRange().getValues();
    
    let headerRowIdx = -1;
    let dayColMap = {};
    for (let r = 0; r < Math.min(15, data.length); r++) {
      for (let c = 0; c < data[r].length; c++) {
        const val = parseInt(data[r][c], 10);
        if (!isNaN(val) && val >= 1 && val <= 31) {
          if (headerRowIdx === -1) headerRowIdx = r;
          dayColMap[val] = c;
        }
      }
      if (headerRowIdx !== -1) break;
    }
    
    if (headerRowIdx === -1 || !dayColMap[actualDay]) return false;
    
    const targetColIdx = dayColMap[actualDay];
    
    let targetActualRowIdx = -1;
    for (let r = headerRowIdx + 1; r < data.length; r++) {
      const noVal = parseInt(data[r][0], 10);
      if (noVal === eqNo) {
        targetActualRowIdx = r + 1;
        break;
      }
    }
    
    if (targetActualRowIdx === -1 || targetActualRowIdx >= data.length) return false;
    
    const cell = sheet.getRange(targetActualRowIdx + 1, targetColIdx + 1);
    cell.setValue(kanbanType);
    cell.setBackground('#b6d7a8');
    
    return true;
  } catch (err) {
    Logger.log('Error writing report to sheet: ' + err.toString());
    return false;
  }
}

function fetchPmScheduleFromSheet(picName) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return null;
    
    let sheet = ss.getSheetByName(picName);
    if (!sheet) {
      const sheets = ss.getSheets();
      for (let i = 0; i < sheets.length; i++) {
        if (sheets[i].getName().toLowerCase().includes(picName.toLowerCase())) {
          sheet = sheets[i];
          break;
        }
      }
    }
    
    if (!sheet) {
      sheet = ss.getSheets()[0];
    }
    
    if (!sheet) return null;
    
    const data = sheet.getDataRange().getValues();
    const backgrounds = sheet.getDataRange().getBackgrounds();
    
    let headerRowIdx = -1;
    let dayColMap = {};
    
    for (let r = 0; r < Math.min(15, data.length); r++) {
      for (let c = 0; c < data[r].length; c++) {
        const val = parseInt(data[r][c], 10);
        if (!isNaN(val) && val >= 1 && val <= 31) {
          if (headerRowIdx === -1) headerRowIdx = r;
          dayColMap[val] = c;
        }
      }
      if (headerRowIdx !== -1) break;
    }
    
    if (headerRowIdx === -1) return [];
    
    const schedule = [];
    let currentEquipment = null;
    
    for (let r = headerRowIdx + 1; r < data.length; r++) {
      const row = data[r];
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
          const bg = backgrounds[r][col] ? backgrounds[r][col].toLowerCase() : '';
          
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
  } catch (err) {
    Logger.log('Error parsing sheet: ' + err.toString());
    return null;
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
// 6. HELPER TELEGRAM API (MESSAGE SPLIT & ERROR RESILIENCE)
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

function getTodayDayNumber() {
  const now = new Date();
  const dayStr = Utilities.formatDate(now, CONFIG.TIMEZONE, 'd');
  return parseInt(dayStr, 10);
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getMainInlineKeyboard(isAdmin, activePic) {
  if (isAdmin) {
    // Keyboard Khusus Admin / Supervisor: Mengutamakan Overview Seluruh Line
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
          { text: `👤 Buka / Pantau Sheet (${activePic || 'Pilih Sheet'})`, callback_data: 'cmd_switch_pic' }
        ]
      ]
    };
  } else {
    // Keyboard PIC Personal
    const picLabel = activePic ? `👤 PIC: ${activePic}` : `👤 Pilih PIC`;
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
          { text: `🔄 Ganti PIC (${picLabel})`, callback_data: 'cmd_switch_pic' }
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
        ['📝 Input Lapor PM', '👤 Buka / Pantau Sheet']
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    };
  }
  
  return {
    keyboard: [
      ['📝 Input Lapor PM', '🚨 List PM Delay'],
      ['📅 Jadwal PM Hari Ini', '📈 Summary Progress PM'],
      ['👤 Pilih / Ganti PIC']
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
