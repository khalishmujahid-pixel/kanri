# 🚀 Panduan Setup Bot Telegram PM KANRI (Mesin Swa-Jawab Otomatis)

Panduan lengkap untuk memasang dan mengaktifkan **Telegram Bot Engine** pada Google Apps Script Anda. Bot ini menyediakan fitur swa-jawab otomatis untuk seluruh PIC pemeliharaan (Kurdi, Dwi, Denny, Aziz, Pilar) serta dashboard pengawasan untuk Admin/Supervisor.

---

## 📋 Fitur-Fitur yang Tersedia di Bot

1. **📅 Jadwal PM Hari Ini (`/today`)**:
   - Menampilkan daftar peralatan yang wajib di-PM pada hari ini.
   - Menampilkan detail Nama Mesin, Core Equipment, Area, No Kanban, dan Status (✅ *Completed* vs ⏳ *Pending*).
2. **🚨 List PM Delay Detail (`/delay`)**:
   - Menampilkan total keterlambatan task s/d hari ini.
   - Dikelompokkan rapi per **Kanban A (Rutin)**, **Kanban B (Periodik)**, **Kanban C (Overhaul)**, dan **Kanban D (Korektif)**.
   - Menyertakan detail lengkap: **Nama Mesin**, **Core Equipment**, **Area**, **No Kanban**, **Tanggal Plan**, dan **Berapa Hari Terlambat**.
3. **📈 Telemetri & KPI Progress S-Curve (`/summary`)**:
   - Menampilkan target vs aktual, persentase pencapaian (*Achievement Rate* %), dan visual *progress bar*.
4. **👤 Pemilihan & Pengalihan PIC (`/pic`)**:
   - Setiap pengguna dapat memilih profil PIC-nya masing-masing melalui tombol interaktif sekali klik.
   - Pilihan PIC tersimpan otomatis untuk setiap akun Telegram (`chat_id`).
5. **👑 Mode Supervisor / Admin (`/admin`)**:
   - Ringkasan performa seluruh PIC & line dalam satu tampilan ringkas.
   - Total akumulasi target, aktual, dan delay seluruh divisi.

---

## 🛠️ Langkah-Langkah Pemasangan di Google Apps Script

### Langkah 1: Buka Google Apps Script dari Spreadsheet Anda
1. Buka file Google Sheets PM Anda di browser.
2. Klik menu **Extensions (Ekstensi)** > **Apps Script**.

### Langkah 2: Masukkan Kode `TelegramBotEngine.gs`
1. Hapus seluruh isi file `Code.gs` (atau buat file baru bernama `TelegramBotEngine.gs`).
2. Salin (*copy*) seluruh kode dari file [`TelegramBotEngine.gs`](file:///c:/Users/Khalish/Desktop/KANRI/google-apps-script/TelegramBotEngine.gs) di proyek ini dan tempelkan (*paste*) ke editor Apps Script.
3. Simpan proyek dengan menekan tombol disket (💾) atau `Ctrl + S`.

### Langkah 3: Deploy sebagai Web App
1. Di pojok kanan atas editor Apps Script, klik tombol **Deploy** > **New deployment (Penerapan baru)**.
2. Klik ikon gerigi (⚙️) di sebelah *Select type* > pilih **Web app**.
3. Konfigurasikan opsi berikut:
   - **Description**: `KANRI Telegram Bot Engine v2`
   - **Execute as**: `Me (email Anda)`
   - **Who has access**: `Anyone (Siapa saja)` *(Penting agar Telegram Webhook dapat mengirim request)*
4. Klik **Deploy**.
5. Berikan izin akses (*Authorize Access*) dengan akun Google Anda jika diminta.
6. Salin **Web App URL** yang berakhiran `/exec` (misal: `https://script.google.com/macros/s/AKfycbz.../exec`).

### Langkah 4: Daftarkan Webhook ke Telegram
Anda dapat mendaftarkan webhook dengan salah satu dari dua cara mudah berikut:

#### Cara A (Otomatis dari Apps Script):
1. Pada menu fungsi di bagian atas editor Apps Script, pilih fungsi `setupTelegramWebhook`.
2. Klik tombol **Run (Jalankan)**.
3. Buka menu **Execution log** untuk memastikan responnya `{"ok":true,"result":true,"description":"Webhook was set"}`.

#### Cara B (Manual via Browser):
Buka tab baru di browser Anda dan akses URL berikut (ganti `<WEB_APP_URL>` dengan URL deployment Anda):
```text
https://api.telegram.org/bot8951359806:AAFXsn4VhlXx7_gGNZfohEf3kZ-T-RIoJhk/setWebhook?url=<WEB_APP_URL>&drop_pending_updates=true
```

---

## 👑 Cara Mengaktifkan Akun Admin / Supervisor Anda

Setelah bot aktif:
1. Buka Bot Telegram Anda.
2. Kirim perintah `/setadmin` ke bot.
3. Bot akan otomatis mendaftarkan `chat_id` Telegram Anda ke database script sebagai **ADMIN**.
4. Setelah terdaftar, tombol **👑 Admin Overview** akan muncul di menu utama bot Anda, dan Anda dapat mengakses laporan seluruh PIC kapan saja!

---

## 📱 Daftar Perintah Chat (Commands)

| Perintah | Fungsi |
|---|---|
| `/start` atau `/menu` | Menampilkan menu utama & kartu status PIC aktif |
| `/today` | Menampilkan jadwal PM yang jatuh tempo hari ini |
| `/delay` | Menampilkan rincian seluruh PM yang delay (detail mesin & kanban A/B/C/D) |
| `/summary` | Menampilkan persentase pencapaian dan telemetri S-Curve |
| `/pic` | Membuka menu pemilihan profil PIC |
| `/admin` | Membuka dashboard supervisor (khusus Admin) |
| `/setadmin` | Mendaftarkan akun Telegram Anda sebagai Admin |
| `/help` | Menampilkan panduan kategori Kanban & bantuan sistem |

---

## 💡 Tips & Catatan Penting
- **Pewarnaan Hijau di Spreadsheet**: Pastikan sel aktual di spreadsheet yang telah selesai diisi dengan warna hijau (`#b6d7a8`, `#34a853`, dsb.) agar bot otomatis mengenalinya sebagai `COMPLETED / DONE`.
- **Nama Sheet**: Pastikan nama tab sheet di Google Spreadsheet Anda sesuai dengan nama PIC (misal: `KURDI KURNIAWAN`, `DWI PURNOMO`, dst.).
