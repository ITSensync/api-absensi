const absensiModel = require('../models/absensiModel');

function formatDate(date) {
  return new Date(date).toLocaleString("sv-SE", { timeZone: "Asia/Jakarta" }).replace("T", " ");
}
/**
 * @swagger
 * tags:
 *   name: ABSENSI
 *   description: API untuk mengelola Data Absensi
 */

/**
 * @swagger
 * /api/absensi:
 *   post:
 *     summary: Menerima data absensi dari scanner
 *     tags:
 *       - Absensi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 mac_address:
 *                   type: string
 *                   example: "AA:BB:CC:DD:EE:FF"
 *                 nama:
 *                   type: string
 *                   example: "John Doe"
 *               required:
 *                 - mac_address
 *                 - nama
 *     responses:
 *       200:
 *         description: Data absensi berhasil diproses
 *       500:
 *         description: Gagal proses absensi
 */
exports.terimaDataAbsensi = async (req, res) => {
  try {
    const dataArray = req.body;

    for (const data of dataArray) {
      const { mac_address, nama } = data;
      const kehadiran = await absensiModel.cekKehadiran(mac_address);

      if (!kehadiran || kehadiran.length === 0) {
        await absensiModel.tambahAbsensi({
          mac_address,
          nama,
          waktu_masuk: new Date(),
          terakhir_terlihat: new Date(),
        });
        // console.log(Absensi baru untuk ${nama} (${mac_address}));
      } else {
        const terakhir_terlihat = kehadiran[0].terakhir_terlihat;

        if (terakhir_terlihat) {
          const terakhir = new Date(terakhir_terlihat);
          const sekarang = new Date();
          const selisihMenit = (sekarang - terakhir) / 60000;

          console.log("Waktu Terakhir Terlihat:", formatDate(terakhir));
          console.log("Waktu Sekarang:", formatDate(sekarang));
          console.log("Selisih Waktu:", selisihMenit.toFixed(2));

          if (selisihMenit > 180 && !kehadiran[0].waktu_keluar) {
            await absensiModel.updateWaktuKeluar(mac_address, terakhir);
            // console.log(Mengisi waktu_keluar untuk ${mac_address} pukul ${formatDate(terakhir)});
          }
        }

        await absensiModel.updateTerakhirTerlihat(mac_address, new Date());
      }
    }

    await absensiModel.updateWaktuKeluarPesertaTidakAktif();

    res.status(200).json({ message: 'Data absensi diproses.' });
  } catch (error) {
    console.error('Gagal proses absensi:', error);
    res.status(500).json({ error: 'Gagal proses absensi' });
  }
};




/**
 * API untuk mengambil rekap absensi hari ini
 * @swagger
 * /api/absensi/rekap:
 *   get:
 *     tags:
 *       - ABSENSI
 *     description: Mengambil rekap absensi untuk hari ini
 *     responses:
 *       200:
 *         description: Daftar absensi hari ini berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   mac_address:
 *                     type: string
 *                   nama:
 *                     type: string
 *                   waktu_masuk:
 *                     type: string
 *                   waktu_keluar:
 *                     type: string
 *                   terakhir_terlihat:
 *                     type: string
 *       500:
 *         description: Terjadi kesalahan saat mengambil data absensi
 */
exports.getRekapAbsensiHariIni = async (req, res) => {
  try {
    const dataAbsensi = await absensiModel.getAbsensiHariIni();
    res.status(200).json(dataAbsensi);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data absensi' });
  }
};


/**
 * API untuk mengambil rekap absensi tanggal tertentu
 * @swagger
 * /api/absensi/rekap/{tanggal}:
 *   get:
 *     tags:
 *       - ABSENSI
 *     description: Mengambil rekap absensi berdasarkan tanggal tertentu format YYYY-MM-DD
 *     parameters:
 *       - name: tanggal
 *         in: path
 *         description: Tanggal absensi yang ingin diambil format YYYY-MM-DD
 *         required: true
 *         schema:
 *           type: string
 *           example: "2025-05-06"
 *     responses:
 *       200:
 *         description: Berhasil mengambil rekap absensi berdasarkan tanggal
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   mac_address:
 *                     type: string
 *                   nama:
 *                     type: string
 *                   waktu_masuk:
 *                     type: string
 *                     format: date-time
 *                   waktu_keluar:
 *                     type: string
 *                     format: date-time
 *                   terakhir_terlihat:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Format tanggal tidak valid
 *       500:
 *         description: Terjadi kesalahan pada server
 */
exports.getRekapAbsensiByTanggal = async (req, res) => {
  const { tanggal } = req.params;

  // Validasi format tanggal (YYYY-MM-DD)
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(tanggal)) {
    return res.status(400).json({ message: 'Format tanggal tidak valid, gunakan format YYYY-MM-DD.' });
  }

  try {
    const dataAbsensi = await absensiModel.getAbsensiByTanggal(tanggal);
    res.status(200).json(dataAbsensi);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data absensi' });
  }
};


/**
 * API untuk mengambil rekap absensi berdasarkan rentang tanggal
 * @swagger
 * /api/absensi/rekap/rekap-range:
 *   get:
 *     tags:
 *       - ABSENSI
 *     description: Mengambil rekap absensi berdasarkan rentang tanggal (start dan end sebagai query parameters)
 *     parameters:
 *       - name: start
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-05-01"
 *         description: Tanggal mulai rentang format YYYY-MM-DD
 *       - name: end
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-05-07"
 *         description: Tanggal akhir rentang format YYYY-MM-DD
 *     responses:
 *       200:
 *         description: Berhasil mengambil rekap absensi dalam rentang tanggal
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   mac_address:
 *                     type: string
 *                   nama:
 *                     type: string
 *                   waktu_masuk:
 *                     type: string
 *                     format: date-time
 *                   waktu_keluar:
 *                     type: string
 *                     format: date-time
 *                   terakhir_terlihat:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Parameter start atau end tidak valid
 *       500:
 *         description: Terjadi kesalahan pada server
 */
// Fungsi bantu untuk validasi format tanggal YYYY-MM-DD
function isValidDate(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

exports.getRekapRange = async (req, res) => {
  try {
    const { start, end } = req.query;

    // Validasi: pastikan format tanggal sesuai YYYY-MM-DD
    if (!start || !end) {
      return res.status(400).json({
        message: 'Parameter start dan end wajib diisi.',
      });
    }

    if (!isValidDate(start) || !isValidDate(end)) {
      return res.status(400).json({
        message: 'Format tanggal tidak valid, gunakan format YYYY-MM-DD.',
      });
    }
  
    const hasil = await absensiModel.getRekapRange(start, end);
    res.status(200).json(hasil);
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};



// Mengambil jumlah peserta berdasarkan tanggal
/**
 * @swagger
 * /api/absensi/rekap/jumlah/{tanggal}:
 *   get:
 *     tags:
 *       - ABSENSI
 *     description: Mengambil jumlah peserta absensi berdasarkan tanggal tertentu format YYYY-MM-DD
 *     parameters:
 *       - name: tanggal
 *         in: path
 *         description: Tanggal absensi format YYYY-MM-DD
 *         required: true
 *         schema:
 *           type: string
 *           example: 2025-05-01
 *     responses:
 *       200:
 *         description: Berhasil mengambil jumlah peserta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tanggal:
 *                   type: string
 *                 jumlah_peserta:
 *                   type: integer
 *       400:
 *         description: Format tanggal tidak valid
 *       500:
 *         description: Terjadi kesalahan pada server
 */
exports.getJumlahPeserta = async (req, res) => {
  try {
    const { tanggal } = req.params;

    // Validasi format tanggal
    if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
      return res.status(400).json({ message: 'Format tanggal tidak valid, gunakan format YYYY-MM-DD.' });
    }

    const data = await absensiModel.getJumlahPesertaByTanggal(tanggal);
    res.json({ tanggal, jumlah_peserta: data.jumlah });
  } catch (error) {
    console.error('Gagal mengambil jumlah peserta:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};



// Mengambil detail absensi berdasarkan MAC address
/**
 * @swagger
 * /api/absensi/rekap/detail/{mac_address}:
 *   get:
 *     tags:
 *       - ABSENSI
 *     description: Mengambil riwayat absensi berdasarkan MAC address
 *     parameters:
 *       - name: mac_address
 *         in: path
 *         description: MAC address perangkat
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Berhasil mengambil data absensi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   mac_address:
 *                     type: string
 *                   nama:
 *                     type: string
 *                   waktu_masuk:
 *                     type: string
 *                     format: date-time
 *                   waktu_keluar:
 *                     type: string
 *                     format: date-time
 *                   terakhir_terlihat:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: MAC address tidak valid
 *       404:
 *         description: Data tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan pada server
 */

exports.getDetailAbsensi = async (req, res) => {
  try {
    const { mac_address } = req.params;

    if (!mac_address) {
      return res.status(400).json({ message: 'MAC address wajib diisi.' });
    }

    const data = await absensiModel.getDetailAbsensiByMac(mac_address);

    if (data.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan.' });
    }

    res.json(data);
  } catch (error) {
    console.error('Gagal mengambil detail absensi:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};


// Mengambil rekap absensi bulanan

/**
 * @swagger
 * /api/absensi/rekap/bulanan:
 *   get:
 *     tags:
 *       - ABSENSI
 *     description: Mengambil rekap jumlah kehadiran per orang dalam satu bulan
 *     parameters:
 *       - name: bulan
 *         in: query
 *         description: Bulan absensi format YYYY-MM)
 *         required: true
 *         schema:
 *           type: string
 *           example: "2025-05"
 *     responses:
 *       200:
 *         description: Berhasil mengambil rekap bulanan
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   mac_address:
 *                     type: string
 *                   nama:
 *                     type: string
 *                   jumlah_hadir:
 *                     type: integer
 *       400:
 *         description: Format bulan tidak valid
 *       500:
 *         description: Terjadi kesalahan pada server
 */

exports.getRekapBulanan = async (req, res) => {
  try {
    const { bulan } = req.query;

    const regexBulan = /^\d{4}-\d{2}$/;
    if (!regexBulan.test(bulan)) {
      return res.status(400).json({ message: 'Format bulan tidak valid, gunakan YYYY-MM.' });
    }

    const data = await absensiModel.getRekapBulanan(bulan);
    res.json(data);
  } catch (error) {
    console.error('Gagal mengambil rekap bulanan:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};


// // Mengambil rekap harian per orang

// /**
//  * @swagger
//  * /api/absensi/rekap/harian/per-orang:
//  *   get:
//  *     tags:
//  *       - ABSENSI
//  *     description: Mengambil rekap kehadiran per orang dalam satu bulan
//  *     parameters:
//  *       - name: bulan
//  *         in: query
//  *         description: Bulan absensi format YYYY-MM
//  *         required: true
//  *         schema:
//  *           type: string
//  *           example: "2025-05"
//  *     responses:
//  *       200:
//  *         description: Berhasil mengambil rekap harian per orang
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 type: object
//  *                 properties:
//  *                   mac_address:
//  *                     type: string
//  *                   nama:
//  *                     type: string
//  *                   jumlah_hadir:
//  *                     type: integer
//  *       400:
//  *         description: Format bulan tidak valid
//  *       500:
//  *         description: Terjadi kesalahan pada server
//  */


// exports.getRekapHarianPerOrang = async (req, res) => {
//   try {
//     const { bulan } = req.query;

//     const regexBulan = /^\d{4}-\d{2}$/;
//     if (!regexBulan.test(bulan)) {
//       return res.status(400).json({ message: 'Format bulan tidak valid, gunakan YYYY-MM.' });
//     }

//     const data = await absensiModel.getRekapHarianPerOrang(bulan);
//     res.json(data);
//   } catch (error) {
//     console.error('Gagal mengambil rekap harian per orang:', error);
//     res.status(500).json({ message: 'Terjadi kesalahan pada server' });
//   }
// };


