// db.js

// ============================= MOCK DATA AWAL (Gunakan const untuk initial data) =============================
const INITIAL_SISWA_DATA = [
    { id: 1, nis: '1001', password: '1001', nama: 'Ahmad Fauzi', kelas: 'XII-A', hp: '081234567890', jenis_kelamin: 'L', poin_pelanggaran: 0, poin_penghargaan: 0, poin_akumulasi: 0, tanggal_lahir: '2005-05-15' },
    { id: 2, nis: '1002', password: '1002', nama: 'Budi Santoso', kelas: 'XII-B', hp: '081234567891', jenis_kelamin: 'L', poin_pelanggaran: 0, poin_penghargaan: 0, poin_akumulasi: 0, tanggal_lahir: '2006-08-22' },
    { id: 3, nis: '1003', password: '1003', nama: 'Citra Lestari', kelas: 'XII-A', hp: '081234567892', jenis_kelamin: 'P', poin_pelanggaran: 0, poin_penghargaan: 0, poin_akumulasi: 0, tanggal_lahir: '2005-01-01' },
    { id: 4, nis: '1004', password: '1004', nama: 'Dewi Anggraini', kelas: 'XII-C', hp: '081234567893', jenis_kelamin: 'P', poin_pelanggaran: 0, poin_penghargaan: 0, poin_akumulasi: 0, tanggal_lahir: '2006-10-30' },
    { id: 5, nis: '1005', password: '1005', nama: 'Eko Prasetyo', kelas: 'XII-B', hp: '081234567894', jenis_kelamin: 'L', poin_pelanggaran: 0, poin_penghargaan: 0, poin_akumulasi: 0, tanggal_lahir: '2005-06-11' },
    { id: 6, nis: '1006', password: '1006', nama: 'Fitriani', kelas: 'XII-A', hp: '081234567895', jenis_kelamin: 'P', poin_pelanggaran: 0, poin_penghargaan: 0, poin_akumulasi: 0, tanggal_lahir: '2006-03-05' },
    { id: 7, nis: '1007', password: '1007', nama: 'Guntur Saputra', kelas: 'XII-C', hp: '081234567896', jenis_kelamin: 'L', poin_pelanggaran: 0, poin_penghargaan: 0, poin_akumulasi: 0, tanggal_lahir: '2005-11-20' },
    { id: 8, nis: '1008', password: '1008', nama: 'Hesti Purwaningsih', kelas: 'XI-A', hp: '081234567897', jenis_kelamin: 'P', poin_pelanggaran: 0, poin_penghargaan: 0, poin_akumulasi: 0, tanggal_lahir: '2007-04-12' },
    { id: 9, nis: '1009', password: '1009', nama: 'Indra Gunawan', kelas: 'XI-B', hp: '081234567898', jenis_kelamin: 'L', poin_pelanggaran: 0, poin_penghargaan: 0, poin_akumulasi: 0, tanggal_lahir: '2007-07-29' },
    { id: 10, nis: '1010', password: '1010', nama: 'Joko Susilo', kelas: 'XI-C', hp: '081234567899', jenis_kelamin: 'L', poin_pelanggaran: 0, poin_penghargaan: 0, poin_akumulasi: 0, tanggal_lahir: '2006-12-19' },
    { id: 11, nis: '1011', password: '1011', nama: 'Kartika Sari', kelas: 'X-A', hp: '081234567800', jenis_kelamin: 'P', poin_pelanggaran: 0, poin_penghargaan: 0, poin_akumulasi: 0, tanggal_lahir: '2008-02-01' },
    { id: 12, nis: '1012', password: '1012', nama: 'Lutfi Hakim', kelas: 'X-B', hp: '081234567801', jenis_kelamin: 'L', poin_pelanggaran: 0, poin_penghargaan: 0, poin_akumulasi: 0, tanggal_lahir: '2008-09-17' },
    { id: 13, nis: '1013', password: '1013', nama: 'Maria Ulfa', kelas: 'X-C', hp: '081234567802', jenis_kelamin: 'P', poin_pelanggaran: 0, poin_penghargaan: 0, poin_akumulasi: 0, tanggal_lahir: '2007-11-25' },
    { id: 14, nis: '1014', password: '1014', nama: 'Nurul Hidayah', kelas: 'X-A', hp: '081234567803', jenis_kelamin: 'P', poin_pelanggaran: 0, poin_penghargaan: 0, poin_akumulasi: 0, tanggal_lahir: '2008-01-14' },
    { id: 15, nis: '1015', password: '1015', nama: 'Putra Wijaya', kelas: 'X-B', hp: '081234567804', jenis_kelamin: 'L', poin_pelanggaran: 0, poin_penghargaan: 0, poin_akumulasi: 0, tanggal_lahir: '2008-05-03' },
];

const INITIAL_GURU_DATA = [
    {id: 1, nip: 'Guru01', password: 'Guru01', nama: 'Putra S.Pd', hp: '08123456789', jenis_kelamin: 'L'},
    {id: 2, nip: 'Guru02', password: 'Guru02', nama: 'Putri S.Pd', hp: '08123456789', jenis_kelamin: 'P'},
    {id: 3, nip: 'Guru03', password: 'Guru03', nama: 'Nila S.Pd', hp: '08123456789', jenis_kelamin: 'P'},
];

const INITIAL_ADMIN_DATA = [
    { id: 1, nip: 'ADMIN001', password: 'ADMIN001', nama: 'Admin 1', hp: '081200000001', jenis_kelamin: 'L' },
    { id: 2, nip: 'ADMIN002', password: 'ADMIN002', nama: 'Admin 2', hp: '081200000002', jenis_kelamin: 'P' },
];

const INITIAL_PELANGGARAN_DATA = [
    { id: 1, nama: 'Terlambat masuk sekolah', poin: 5 }, { id: 2, nama: 'Tidak membawa buku pelajaran', poin: 10 },
    { id: 3, nama: 'Merokok di lingkungan sekolah', poin: 50 }, { id: 4, nama: 'Berkelahi', poin: 75 },
    { id: 5, nama: 'Mencuri', poin: 100 }, { id: 6, nama: 'Membolos', poin: 25 },
    { id: 7, nama: 'Tidak mengerjakan PR', poin: 5 }, { id: 8, nama: 'Menggunakan HP saat pelajaran', poin: 15 },
    { id: 9, nama: 'Baju tidak rapi', poin: 5 }, { id: 10, nama: 'Rambut gondrong', poin: 10 },
];

const INITIAL_RIWAYAT_PELANGGARAN_DATA = [
    // Riwayat Pelanggaran: id, siswaId, pelanggaranId, poin, tanggal, guruId, tindakLanjut
    { id: 1, siswaId: 1, pelanggaranId: 1, poin: 5, tanggal: '2025-11-22', guruId: 1, tindakLanjut: true }, 
    { id: 2, siswaId: 2, pelanggaranId: 2, poin: 10, tanggal: '2025-11-23', guruId: 2, tindakLanjut: false }, 
    { id: 3, siswaId: 4, pelanggaranId: 3, poin: 50, tanggal: '2025-11-24', guruId: 1, tindakLanjut: true }, 
    { id: 4, siswaId: 5, pelanggaranId: 6, poin: 25, tanggal: '2025-11-25', guruId: 3, tindakLanjut: false }, 
    { id: 5, siswaId: 6, pelanggaranId: 5, poin: 100, tanggal: '2025-11-26', guruId: 2, tindakLanjut: true }, 
    { id: 6, siswaId: 1, pelanggaranId: 9, poin: 5, tanggal: '2025-11-27', guruId: 3, tindakLanjut: false }, 
    { id: 7, siswaId: 2, pelanggaranId: 7, poin: 5, tanggal: '2025-11-22', guruId: 1, tindakLanjut: true }, 
    { id: 8, siswaId: 7, pelanggaranId: 4, poin: 75, tanggal: '2025-11-23', guruId: 2, tindakLanjut: false }, 
    { id: 9, siswaId: 7, pelanggaranId: 3, poin: 50, tanggal: '2025-11-24', guruId: 3, tindakLanjut: true }, 
    { id: 10, siswaId: 6, pelanggaranId: 2, poin: 10, tanggal: '2025-11-25', guruId: 1, tindakLanjut: false }, 
    { id: 11, siswaId: 4, pelanggaranId: 10, poin: 10, tanggal: '2025-11-26', guruId: 3, tindakLanjut: false }, 
    { id: 12, siswaId: 6, pelanggaranId: 1, poin: 5, tanggal: '2025-11-27', guruId: 2, tindakLanjut: true }, 
];

// Data Kategori Penghargaan
const INITIAL_KATEGORI_PENGHARGAAN_DATA = [
    {id: 1, nama: 'Membantu guru', poin: 5},
    {id: 2, nama: 'Juara kelas', poin: 10},
    {id: 3, nama: 'Menang lomba', poin: 15},
    {id: 4, nama: 'Sikap terpuji', poin: 5},
];

// Data Riwayat Penghargaan Baru
const INITIAL_RIWAYAT_PENGHARGAAN_DATA = [
    // Riwayat Penghargaan: id, siswaId, kategoriId, poin, tanggal, guruId
    { id: 1, siswaId: 1, kategoriId: 1, poin: 5, tanggal: '2025-11-22', guruId: 1 }, 
    { id: 2, siswaId: 3, kategoriId: 2, poin: 10, tanggal: '2025-11-23', guruId: 2 },
    { id: 3, siswaId: 8, kategoriId: 3, poin: 15, tanggal: '2025-11-24', guruId: 3 },
    { id: 4, siswaId: 10, kategoriId: 1, poin: 5, tanggal: '2025-11-25', guruId: 1 },
];


// ====================== KEY STORAGE =======================
const KEY_SISWA = 'siswaData';
const KEY_RIWAYAT = 'riwayatPelanggaranData';
const KEY_PENGHARGAAN = 'penghargaanData'; // Kunci baru untuk riwayat penghargaan
const KEY_KATEGORI_PENGHARGAAN = 'kategoriPenghargaanData'; // Kunci baru untuk kategori penghargaan
const KEY_GURU = 'guruData';
const KEY_ADMIN = 'adminData';
const KEY_PELANGGARAN = 'pelanggaranData';


// ====================== DATA ACCESS FUNCTIONS =======================

/** Memuat data dari Local Storage atau data inisial jika belum ada. */
function loadData(key, initialData) {
    const data = localStorage.getItem(key);
    if (data) {
        return JSON.parse(data);
    }
    // Jika Local Storage kosong, inisialisasi dan simpan data awal
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
}

/** Menyimpan data ke Local Storage. */
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// -------------------------------------------------------------
// * Variabel Lokal untuk menampung data yang sedang diolah
// * Kita MUAT SEMUA DATA INTI dari LocalStorage
// -------------------------------------------------------------
let siswaData = loadData(KEY_SISWA, INITIAL_SISWA_DATA);
let riwayatPelanggaranData = loadData(KEY_RIWAYAT, INITIAL_RIWAYAT_PELANGGARAN_DATA);
let guruData = loadData(KEY_GURU, INITIAL_GURU_DATA);
let adminData = loadData(KEY_ADMIN, INITIAL_ADMIN_DATA);
let pelanggaranData = loadData(KEY_PELANGGARAN, INITIAL_PELANGGARAN_DATA);
let penghargaanData = loadData(KEY_PENGHARGAAN, INITIAL_RIWAYAT_PENGHARGAAN_DATA); // Data riwayat penghargaan
let kategoriPenghargaanData = loadData(KEY_KATEGORI_PENGHARGAAN, INITIAL_KATEGORI_PENGHARGAAN_DATA); // Data kategori penghargaan


// ====================== FUNGSI UTAMA SINKRONISASI DATA =======================

function recalculateSiswaPoin() {
    // 1. Reset total poin pelanggaran dan penghargaan untuk semua siswa
    siswaData.forEach(siswa => {
        siswa.poin_pelanggaran = 0;
        siswa.poin_penghargaan = 0;
        siswa.poin_akumulasi = 0;
    });

    // 2. Hitung total poin pelanggaran berdasarkan riwayat
    riwayatPelanggaranData.forEach(riwayat => {
        const siswa = siswaData.find(s => s.id === riwayat.siswaId);
        if (siswa) {
            siswa.poin_pelanggaran += riwayat.poin;
        }
    });
    
    // 3. Hitung total poin penghargaan berdasarkan riwayat penghargaan
    penghargaanData.forEach(penghargaan => {
        const siswa = siswaData.find(s => s.id === penghargaan.siswaId);
        if (siswa) {
            siswa.poin_penghargaan += penghargaan.poin;
        }
    });

    // 4. Hitung akumulasi poin (Pelanggaran - Penghargaan), dibatasi minimal 0
    siswaData.forEach(siswa => {
        let akumulasi = siswa.poin_pelanggaran - siswa.poin_penghargaan;
        siswa.poin_akumulasi = Math.max(0, akumulasi);
    });
    
    // 5. Setelah kalkulasi, SIMPAN kembali data siswa ke localStorage
    saveData(KEY_SISWA, siswaData);
}

// ====================== EKSPOR DATA DAN FUNGSI =======================

// Lakukan kalkulasi awal saat db.js dimuat
recalculateSiswaPoin();

export {
    siswaData,
    guruData,
    adminData,
    pelanggaranData,
    riwayatPelanggaranData,
    penghargaanData, // Export data penghargaan baru
    kategoriPenghargaanData, // Export kategori penghargaan
    recalculateSiswaPoin,
    saveData,
    KEY_SISWA,
    KEY_RIWAYAT,
    KEY_GURU,
    KEY_ADMIN,
    KEY_PELANGGARAN,
    KEY_PENGHARGAAN // Export key penghargaan
};
