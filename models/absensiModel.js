// ======== absensiModel.js ========
const db = require('../config/database');

// Mengecek kehadiran berdasarkan MAC address
exports.cekKehadiran = async (mac_address) => {
  const [rows] = await db.query(
    'SELECT * FROM absensi WHERE mac_address = ? AND DATE(waktu_masuk) = CURDATE() ORDER BY waktu_masuk DESC LIMIT 1',
    [mac_address]
  );
  return rows;
};

// Menambahkan data absensi baru
exports.tambahAbsensi = async ({ mac_address, nama, waktu_masuk, terakhir_terlihat }) => {
  await db.execute(
    "INSERT INTO absensi (mac_address, nama, waktu_masuk, terakhir_terlihat) VALUES (?, ?, ?, ?)",
    [mac_address, nama, waktu_masuk, terakhir_terlihat]
  );
};

// Mengupdate waktu terakhir terlihat
exports.updateTerakhirTerlihat = async (mac_address, terakhir_terlihat) => {
  await db.execute(
    "UPDATE absensi SET terakhir_terlihat = ? WHERE mac_address = ? AND DATE(waktu_masuk) = CURDATE()",
    [terakhir_terlihat, mac_address]
  );
};

// Mengupdate waktu keluar peserta
exports.updateWaktuKeluar = async (mac_address, waktu_keluar) => {
  await db.execute(
    "UPDATE absensi SET waktu_keluar = ? WHERE mac_address = ? AND DATE(waktu_masuk) = CURDATE()",
    [waktu_keluar, mac_address]
  );
};

// Mengupdate waktu keluar peserta yang tidak aktif
exports.updateWaktuKeluarPesertaTidakAktif = async () => {
  const sekarang = new Date();
  const limitWaktu = new Date(sekarang - 10 * 60 * 1000); // 10 menit lalu

  await db.execute(
    `UPDATE absensi 
    SET waktu_keluar = terakhir_terlihat 
    WHERE waktu_keluar IS NULL 
      AND terakhir_terlihat < ? 
      AND DATE(waktu_masuk) = CURDATE()`,
    [limitWaktu]
  );
};


// Mengambil data absensi hari ini
exports.getAbsensiHariIni = async () => {
  const [rows] = await db.query(
    'SELECT mac_address, nama, waktu_masuk, waktu_keluar, terakhir_terlihat FROM absensi WHERE DATE(waktu_masuk) = CURDATE() ORDER BY waktu_masuk DESC'
  );
  return rows;
};

// Mengambil data absensi berdasarkan tanggal tertentu
exports.getAbsensiByTanggal = async (tanggal) => {
  const [rows] = await db.query(
    'SELECT mac_address, nama, waktu_masuk, waktu_keluar, terakhir_terlihat FROM absensi WHERE DATE(waktu_masuk) = ?',
    [tanggal]
  );
  return rows;
};


// Mengambil rekap absensi berdasarkan rentang tanggal
exports.getRekapRange = async (start, end) => {
  const [rows] = await db.query(
    `SELECT * FROM absensi WHERE DATE(waktu_masuk) BETWEEN ? AND ? ORDER BY waktu_masuk ASC`,
    [start, end]
  );
  return rows;
};


// Mengambil jumlah peserta berdasarkan tanggal
exports.getJumlahPesertaByTanggal = async (tanggal) => {
  const [rows] = await db.query(
    `SELECT COUNT(DISTINCT mac_address) AS jumlah 
     FROM absensi 
     WHERE DATE(waktu_masuk) = ?`,
    [tanggal]
  );
  return rows[0]; // karena hasil query berupa array dengan satu objek
};


// Mengambil detail absensi berdasarkan MAC address
exports.getDetailAbsensiByMac = async (mac_address) => {
  const [rows] = await db.query(
    `SELECT mac_address, nama, waktu_masuk, waktu_keluar, terakhir_terlihat 
     FROM absensi 
     WHERE mac_address = ? 
     ORDER BY waktu_masuk DESC`,
    [mac_address]
  );
  return rows;
};


// Mengambil rekap absensi bulanan per orang
exports.getRekapBulanan = async (bulan) => {
  const [rows] = await db.query(
    `SELECT 
        mac_address,
        nama,
        COUNT(DISTINCT DATE(waktu_masuk)) AS jumlah_hadir
     FROM absensi
     WHERE DATE_FORMAT(waktu_masuk, '%Y-%m') = ?
     GROUP BY mac_address, nama
     ORDER BY nama ASC`,
    [bulan]
  );
  return rows;
};


// Mengambil rekap harian per orang
// exports.getRekapHarianPerOrang = async (bulan) => {
//   const [rows] = await db.query(
//     `SELECT 
//         mac_address,
//         nama,
//         COUNT(DISTINCT DATE(waktu_masuk)) AS jumlah_hadir
//      FROM absensi
//      WHERE DATE_FORMAT(waktu_masuk, '%Y-%m') = ?
//      GROUP BY mac_address, nama
//      ORDER BY nama ASC`,
//     [bulan]
//   );
//   return rows;
// };

