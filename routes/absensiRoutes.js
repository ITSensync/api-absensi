const express = require('express');
const router = express.Router();
const absensiController = require('../controllers/absensiController');

// Untuk menerima data dari scanner

/**
 * @swagger
 * tags:
 *   name: ABSENSI
 *   description: API untuk mengelola Data Absens
 */
router.post('/', absensiController.terimaDataAbsensi);

// Untuk frontend ambil rekap absensi
router.get('/rekap/bulanan', absensiController.getRekapBulanan);
router.get('/rekap', absensiController.getRekapAbsensiHariIni);  
router.get('/rekap/rekap-range', absensiController.getRekapRange);
router.get('/rekap/:tanggal', absensiController.getRekapAbsensiByTanggal);  
router.get('/rekap/jumlah/:tanggal', absensiController.getJumlahPeserta);
router.get('/rekap/detail/:mac_address', absensiController.getDetailAbsensi);
// router.get('/rekap/harian/per-orang', absensiController.getRekapHarianPerOrang);




module.exports = router;
