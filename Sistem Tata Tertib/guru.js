// guru.js

// IMPOR DATA DARI db.js
import { 
    siswaData, 
    guruData, 
    pelanggaranData, 
    riwayatPelanggaranData, // Menggunakan array riwayatPelanggaranData langsung dari db.js
    penghargaanData, // Data riwayat penghargaan baru
    kategoriPenghargaanData, // Data kategori penghargaan baru
    recalculateSiswaPoin,
    saveData, 
    KEY_RIWAYAT, // Kunci Local Storage untuk riwayatPelanggaranData
    KEY_PENGHARGAAN,
    KEY_GURU 
} from "./db.js";

// ===================== DATA & MAPS UTAMA =====================
let dataSiswaMap = {}; // Map untuk siswa: { id: {nama, kelas, jenis_kelamin, nis} }
let dataGuruMap = {}; // Map untuk guru: { id: {nama} }
let dataPelanggaranMap = {}; // Map untuk jenis pelanggaran: { id: {nama, poin} }
let dataKategoriPenghargaanMap = {}; // Map untuk kategori penghargaan: { id: {nama, poin} }
let kelasList = [];

// ===================== FUNGSI UTILITY & SINKRONISASI =====================

function syncGlobalData() {
    // Sinkronisasi data utama
    siswaData.forEach(s => {
        dataSiswaMap[s.id] = { 
            nama: s.nama, 
            kelas: s.kelas, 
            jenis_kelamin: s.jenis_kelamin, 
            nis: s.nis 
        };
    });
    guruData.forEach(g => {
        dataGuruMap[g.id] = { nama: g.nama, nip: g.nip };
    });
    pelanggaranData.forEach(p => {
        dataPelanggaranMap[p.id] = { nama: p.nama, poin: p.poin };
    });
    kategoriPenghargaanData.forEach(k => {
        dataKategoriPenghargaanMap[k.id] = { nama: k.nama, poin: k.poin };
    });

    // Sinkronisasi data kelas
    kelasList.length = 0;
    kelasList.push(...[...new Set(siswaData.map(s => s.kelas))].sort());
}

function perbaruiSemuaTampilan() {
    syncGlobalData();
    updateDashboard();
    
    // Perbarui Tampilan Sesuai Halaman Aktif
    const activePage = document.querySelector('.menu-item.active')?.getAttribute('data-page') || 'dashboard';
    
    switch (activePage) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'daftar':
            tampilkanPelanggaran();
            break;
        case 'daftarPenghargaan':
            tampilkanPenghargaan();
            break;
        case 'rekap':
            tampilkanRekap();
            break;
    }
}

function simpanDanPerbarui() {
    // Simpan semua data global yang mungkin berubah
    // Note: riwayatPelanggaranData, penghargaanData, guruData adalah variabel yang diimpor
    // dari db.js (yang merupakan array yang dimuat dari LocalStorage)
    saveData(KEY_RIWAYAT, riwayatPelanggaranData);
    saveData(KEY_PENGHARGAAN, penghargaanData);
    saveData(KEY_GURU, guruData);

    recalculateSiswaPoin(); // Hitung ulang poin setelah perubahan
    perbaruiSemuaTampilan(); 
}

// Fungsi untuk mendapatkan data riwayat pelanggaran lengkap (Join)
function getFullRiwayatPelanggaranData() {
    return riwayatPelanggaranData.map(r => {
        const siswa = dataSiswaMap[r.siswaId] || { nama: 'N/A', kelas: 'N/A', jenis_kelelamin: 'N/A', nis: 'N/A' };
        const pelanggaran = dataPelanggaranMap[r.pelanggaranId] || { nama: 'N/A', poin: r.poin };
        const guru = dataGuruMap[r.guruId] || { nama: 'N/A', nip: 'N/A' };
        
        return {
            ...r,
            nis: siswa.nis,
            namaSiswa: siswa.nama,
            kelas: siswa.kelas,
            jenisKelamin: siswa.jenis_kelamin,
            namaPelanggaran: pelanggaran.nama,
            poin: r.poin, 
            namaGuru: guru.nama,
            nipGuru: guru.nip,
            // Tambahkan data siswa lengkap untuk memudahkan filter
            siswaId: r.siswaId 
        };
    });
}

// Fungsi untuk mendapatkan data riwayat penghargaan lengkap (Join)
function getFullRiwayatPenghargaanData() {
    return penghargaanData.map(r => {
        const siswa = dataSiswaMap[r.siswaId] || { nama: 'N/A', kelas: 'N/A', jenis_kelamin: 'N/A', nis: 'N/A' };
        const kategori = dataKategoriPenghargaanMap[r.kategoriId] || { nama: 'N/A', poin: r.poin };
        const guru = dataGuruMap[r.guruId] || { nama: 'N/A', nip: 'N/A' };
        
        return {
            ...r,
            nis: siswa.nis,
            namaSiswa: siswa.nama,
            kelas: siswa.kelas,
            jenisKelamin: siswa.jenis_kelamin,
            namaKategori: kategori.nama,
            poin: r.poin, 
            namaGuru: guru.nama,
            nipGuru: guru.nip
        };
    });
}

function formatTanggal(dateString) {
    if (!dateString) return 'N/A';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    const year = parts[0];
    const month = parseInt(parts[1]);
    const day = parts[2];
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return `${day} ${monthNames[month - 1]} ${year}`;
}


// ===================== LOGIKA NAVIGASI & SESI =====================

function updateProfileInfo(){
    const currentUserName = localStorage.getItem('currentUserName');
    if(currentUserName){
        document.getElementById('guruName').innerText = currentUserName;
    }
}

function showConfirmLogout(e) {
    e.stopPropagation();
    const logoutPopup = document.getElementById('logout-popup');
    const logoutConfirmOverlay = document.getElementById('logout-confirm-overlay');
    if (logoutPopup) logoutPopup.classList.add('hidden');
    if (logoutConfirmOverlay) logoutConfirmOverlay.classList.remove('hidden');
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentUserType');
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUserName');
    window.location.href = 'index.html'; // Redirect ke halaman login terpusat
}

function showPage(page) {
    const pages = ["dashboard", "daftar", "daftarPenghargaan", "rekap", "jumlahPelanggaran", "jumlahPenghargaan", "gantiProfil", "detailSiswaTertinggi", "tindakLanjut"];
    pages.forEach(p => {
        const el = document.getElementById(p);
        if(el) el.classList.add("hidden");
    });
    
    const targetElement = document.getElementById(page);
    if (targetElement) targetElement.classList.remove("hidden");
    
    // Kelola kelas 'active' pada sidebar
    document.querySelectorAll("#menuContainer .menu-item").forEach(el => el.classList.remove("active"));
    document.querySelectorAll("#menuContainer .data-header").forEach(el => el.classList.remove("active"));
    document.querySelectorAll("#menuContainer .sub-menu").forEach(el => el.classList.remove("active"));
    document.querySelectorAll("#menuContainer .arrow-open").forEach(el => el.classList.remove("rotate"));

    const activeMenu = document.querySelector(`[data-page="${page}"]`);
    if (activeMenu) {
        activeMenu.classList.add("active");
        
        // Cek jika ini sub-menu item
        const parentSubMenu = activeMenu.closest('.sub-menu');
        if (parentSubMenu) {
            parentSubMenu.classList.add('active');
            const parentHeader = parentSubMenu.closest('.data-container').querySelector('.data-header');
            if (parentHeader) {
                parentHeader.classList.add('active');
                parentHeader.querySelector('.arrow-open')?.classList.add('rotate');
            }
        }
    }
    
    // Memastikan data terbaru dimuat dan ditampilkan
    if (['dashboard', 'daftar', 'daftarPenghargaan', 'rekap', 'jumlahPelanggaran', 'jumlahPenghargaan', 'detailSiswaTertinggi', 'tindakLanjut'].includes(page)) {
        recalculateSiswaPoin(); // Hitung ulang poin
        switch (page) {
            case 'dashboard': updateDashboard(); break;
            case 'daftar': 
                populatePelanggaranFilters(); // Isi ulang filter saat masuk halaman
                tampilkanPelanggaran(); 
                break;
            case 'daftarPenghargaan': 
                populatePenghargaanFilters(); // Isi ulang filter saat masuk halaman
                tampilkanPenghargaan(); 
                break;
            case 'rekap': tampilkanRekap(); break;
            case 'jumlahPelanggaran': filterDetailPelanggaran(); break;
            case 'jumlahPenghargaan': filterDetailPenghargaan(); break;
            case 'detailSiswaTertinggi': tampilkanDetailSiswaTertinggi(); break;
            case 'tindakLanjut': tampilkanTindakLanjut(); break;
        }
    }
}

function toggleSubMenu(event) {
    const container = event.currentTarget.closest('.data-container');
    const submenu = container.querySelector('.sub-menu');
    const header = container.querySelector('.data-header');
    const arrow = container.querySelector('.arrow-open');

    submenu.classList.toggle('active');
    header.classList.toggle('active'); 
    arrow.classList.toggle('rotate');
}

// ===================== LOGIKA DASHBOARD & DETAIL =====================

function updateDashboard() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('dashboardDate').innerText = today.toLocaleDateString('id-ID', options);

    const formattedDate = today.toISOString().split('T')[0];

    // Pelanggaran Hari Ini
    const fullPelanggaran = getFullRiwayatPelanggaranData();
    const pelanggaranHariIni = fullPelanggaran.filter(p => p.tanggal === formattedDate);
    document.getElementById('jumlahPelanggaranHariIni').innerText = pelanggaranHariIni.length;
    
    // Penghargaan Hari Ini
    const fullPenghargaan = getFullRiwayatPenghargaanData();
    const penghargaanHariIni = fullPenghargaan.filter(p => p.tanggal === formattedDate);
    document.getElementById('jumlahPenghargaanHariIni').innerText = penghargaanHariIni.length;

    // Siswa Poin Tertinggi
    recalculateSiswaPoin();
    let siswaTertinggi = "N/A";
    let poinTertinggi = -Infinity;
    
    siswaData.forEach(siswa => {
        if (siswa.poin_akumulasi > poinTertinggi) {
            poinTertinggi = siswa.poin_akumulasi;
            siswaTertinggi = `${siswa.nama} (${siswa.kelas}) (${siswa.poin_akumulasi} poin)`;
        }
    });

    document.getElementById('siswaPoinTertinggi').innerText = poinTertinggi > 0 ? siswaTertinggi : "Belum ada poin tercatat";
    
    // Pengingat Tindak Lanjut
    const siswaTindakLanjut = siswaData.filter(siswa => siswa.poin_akumulasi >= 25);
    document.getElementById('pengingatTindakLanjut').innerText = siswaTindakLanjut.length > 0 ? siswaTindakLanjut.length : "0";
}

function tampilkanDetailSiswaTertinggi() {
    recalculateSiswaPoin(); 
    
    let siswaTertinggiObj = siswaData.reduce((max, s) => s.poin_akumulasi > max.poin_akumulasi ? s : max, {poin_akumulasi: -Infinity});
    
    const infoBody = document.querySelector('#siswaTertinggiInfoBody');
    const pelanggaranBody = document.querySelector('#siswaTertinggiPelanggaranBody');
    const penghargaanBody = document.querySelector('#siswaTertinggiPenghargaanBody');
    
    infoBody.innerHTML = ''; 
    pelanggaranBody.innerHTML = '';
    penghargaanBody.innerHTML = '';

    if (siswaTertinggiObj && siswaTertinggiObj.poin_akumulasi >= 0) {
        const data = siswaTertinggiObj;
        
        // 1. Info Siswa
        const row = infoBody.insertRow();
        row.innerHTML = `
            <td>${data.nama}</td>
            <td>${data.kelas}</td>
            <td><span class="chip chip-pelanggaran">${data.poin_pelanggaran}</span></td>
            <td><span class="chip chip-penghargaan">${data.poin_penghargaan}</span></td>
            <td><span class="chip chip-akumulasi">${data.poin_akumulasi}</span></td>
        `;

        // 2. Riwayat Pelanggaran
        const fullPelanggaran = getFullRiwayatPelanggaranData().filter(r => r.siswaId === data.id);
        fullPelanggaran.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

        fullPelanggaran.forEach(p => {
            const row = pelanggaranBody.insertRow();
            row.innerHTML = `<td>${formatTanggal(p.tanggal)}</td><td>${p.namaPelanggaran}</td><td>${p.poin}</td><td>${p.namaGuru}</td>`;
        });
        
        // 3. Riwayat Penghargaan
        const fullPenghargaan = getFullRiwayatPenghargaanData().filter(r => r.siswaId === data.id);
        fullPenghargaan.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
        
        fullPenghargaan.forEach(p => {
            const row = penghargaanBody.insertRow();
            row.innerHTML = `<td>${formatTanggal(p.tanggal)}</td><td>${p.namaKategori}</td><td>${p.poin}</td><td>${p.namaGuru}</td>`;
        });
    }
}

function tampilkanTindakLanjut() {
    recalculateSiswaPoin(); 
    const tbody = document.getElementById("tindakLanjutBody");
    tbody.innerHTML = "";

    const siswaTindakLanjut = siswaData.map(siswa => {
        const akumulasi = siswa.poin_akumulasi;
        let status = "";
        let className = "";
        
        if (akumulasi >= 125) {
            status = "Dikeluarkan";
            className = 'chip-dikeluarkan';
        } else if (akumulasi >= 100) {
            status = "SP 4";
            className = 'chip-sp4';
        } else if (akumulasi >= 75) {
            status = "SP 3";
            className = 'chip-sp3';
        } else if (akumulasi >= 50) {
            status = "SP 2";
            className = 'chip-sp2';
        } else if (akumulasi >= 25) {
            status = "SP 1";
            className = 'chip-sp1';
        }
        return { siswa: siswa.nama, kelas: siswa.kelas, akumulasi, status, className };
    }).filter(s => s.status !== "");
    
    siswaTindakLanjut.sort((a, b) => b.akumulasi - a.akumulasi); // Urutkan dari poin tertinggi

    siswaTindakLanjut.forEach(s => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><span class="chip chip-kelas">${s.kelas}</span></td>
            <td>${s.siswa}</td>
            <td><span class="chip chip-akumulasi">${s.akumulasi}</span></td>
            <td><span class="chip ${s.className}">${s.status}</span></td>
        `;
        tbody.appendChild(row);
    });
}

function filterDetailPelanggaran() {
    const tanggalFilter = document.getElementById('tanggalDetailPelanggaran').value;
    const searchTerm = document.getElementById('searchDetailPelanggaran').value.toLowerCase();
    const tbody = document.getElementById('detailPelanggaranBody');
    const totalElement = document.getElementById('totalPelanggaranDetail');
    
    if (!tbody || !totalElement) return;

    // LOGIKA FILTER TANGGAL: Jika tanggalFilter kosong, ambil semua data.
    let filteredData = getFullRiwayatPelanggaranData().filter(item => {
        const matchTanggal = !tanggalFilter || item.tanggal === tanggalFilter;
        return matchTanggal;
    });

    const grouped = {};
    filteredData.forEach(item => {
        const namaPelanggaran = item.namaPelanggaran;
        if (namaPelanggaran.toLowerCase().includes(searchTerm)) {
            grouped[namaPelanggaran] = (grouped[namaPelanggaran] || 0) + 1;
        }
    });

    tbody.innerHTML = "";
    let total = 0;
    
    const sortedGrouped = Object.entries(grouped).sort((a, b) => b[1] - a[1]); // Urutkan dari jumlah terbanyak

    sortedGrouped.forEach(([key, count]) => {
        const row = tbody.insertRow();
        row.innerHTML = `<td>${key}</td><td>${count}</td>`;
        total += count;
    });
    totalElement.innerText = total;
}

function filterDetailPenghargaan() {
    const tanggalFilter = document.getElementById('tanggalDetailPenghargaan').value;
    const searchTerm = document.getElementById('searchDetailPenghargaan').value.toLowerCase();
    const tbody = document.getElementById('detailPenghargaanBodyNew');
    const totalElement = document.getElementById('totalPenghargaanDetail');
    
    if (!tbody || !totalElement) return;

    // LOGIKA FILTER TANGGAL: Jika tanggalFilter kosong, ambil semua data.
    let filteredData = getFullRiwayatPenghargaanData().filter(item => {
        const matchTanggal = !tanggalFilter || item.tanggal === tanggalFilter;
        return matchTanggal;
    });

    const grouped = {};
    filteredData.forEach(item => {
        const namaKategori = item.namaKategori;
        if (namaKategori.toLowerCase().includes(searchTerm)) {
            grouped[namaKategori] = (grouped[namaKategori] || 0) + 1;
        }
    });

    tbody.innerHTML = "";
    let total = 0;
    
    const sortedGrouped = Object.entries(grouped).sort((a, b) => b[1] - a[1]); // Urutkan dari jumlah terbanyak

    sortedGrouped.forEach(([key, count]) => {
        const row = tbody.insertRow();
        row.innerHTML = `<td>${key}</td><td>${count}</td>`;
        total += count;
    });
    totalElement.innerText = total;
}

// ===================== LOGIKA CRUD PELANGGARAN =====================

// Fungsi untuk mengisi filter-filter Pelanggaran
function populatePelanggaranFilters() {
    const filterKelas = document.getElementById('pelanggaran-filter-kelas');
    const filterJenis = document.getElementById('pelanggaran-filter-jenis');

    // Isi Filter Kelas
    if (filterKelas) {
        filterKelas.innerHTML = '<option value="all">Semua Kelas</option>';
        kelasList.forEach(kelas => {
            filterKelas.innerHTML += `<option value="${kelas}">${kelas}</option>`;
        });
    }

    // Isi Filter Jenis Pelanggaran
    if (filterJenis) {
        filterJenis.innerHTML = '<option value="all">Semua Pelanggaran</option>';
        pelanggaranData.forEach(p => {
            filterJenis.innerHTML += `<option value="${p.id}">${p.nama}</option>`;
        });
    }
}

function tampilkanPelanggaran() {
    const tanggalFilter = document.getElementById('tanggalPelanggaran').value;
    const searchTerm = document.getElementById('searchPelanggaran').value.toLowerCase();
    const filterKelas = document.getElementById('pelanggaran-filter-kelas').value;
    const filterGender = document.getElementById('pelanggaran-filter-gender').value;
    const filterJenis = document.getElementById('pelanggaran-filter-jenis').value;
    const tbody = document.getElementById("pelanggaranTableBody");
    
    if (!tbody) return;
    
    tbody.innerHTML = "";
    const classOrder = { 'X-A': 1, 'X-B': 2, 'X-C': 3, 'XI-A': 4, 'XI-B': 5, 'XI-C': 6, 'XII-A': 7, 'XII-B': 8, 'XII-C': 9 };
    
    let filteredPelanggaran = getFullRiwayatPelanggaranData().filter(p => {
        // Filter Tanggal
        const matchTanggal = !tanggalFilter || p.tanggal === tanggalFilter;
        
        // Filter Pencarian (NIS/Nama Siswa/Jenis Pelanggaran/Guru)
        const matchSearch = p.namaSiswa.toLowerCase().includes(searchTerm) || 
                            p.nis.includes(searchTerm) ||
                            p.namaPelanggaran.toLowerCase().includes(searchTerm) ||
                            p.namaGuru.toLowerCase().includes(searchTerm); 

        // Filter Kelas
        const matchKelas = filterKelas === 'all' || p.kelas === filterKelas;

        // Filter Gender
        const matchGender = filterGender === 'all' || p.jenisKelamin === filterGender;

        // Filter Jenis Pelanggaran
        const matchJenis = filterJenis === 'all' || p.pelanggaranId == parseInt(filterJenis);

        return matchTanggal && matchSearch && matchKelas && matchGender && matchJenis;
    });

    // Urutkan berdasarkan Kelas
    filteredPelanggaran
        .sort((a, b) => (classOrder[a.kelas] || 99) - (classOrder[b.kelas] || 99))
        .forEach((pelanggaran, index) => {
            const row = document.createElement("tr");
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${pelanggaran.nis}</td>
                <td>${pelanggaran.namaSiswa}</td>
                <td><span class="chip ${pelanggaran.jenisKelamin === 'L' ? 'chip-l' : 'chip-p'}">${pelanggaran.jenisKelamin}</span></td>
                <td><span class="chip chip-kelas">${pelanggaran.kelas}</span></td>
                <td>${pelanggaran.namaPelanggaran}</td>
                <td>${formatTanggal(pelanggaran.tanggal)}</td>
                <td><span class="chip chip-pelanggaran">${pelanggaran.poin}</span></td>
                <td>${pelanggaran.namaGuru}</td>
                <td>
                    <div class="action-dropdown">
                        <button class="action-btn" data-id="${pelanggaran.id}">Aksi <span class="arrow-down"></span></button>
                        <div class="dropdown-content">
                            <a href="#" class="edit-pelanggaran-btn" data-id="${pelanggaran.id}">Edit</a>
                            <a href="#" class="delete-pelanggaran-btn" data-id="${pelanggaran.id}">Hapus</a>
                        </div>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
}

function submitPelanggaran(e) {
    e.preventDefault();
    
    const kelas = document.getElementById("kelasInput").value;
    const siswaNama = document.getElementById("siswaInput").value;
    const jenisDropdown = document.getElementById("jenisPelanggaran");
    const selectedPelanggaranId = parseInt(jenisDropdown.value);
    
    if (!selectedPelanggaranId) {
        // Menggunakan alert karena konfirmasi ini sifatnya mendesak sebelum submit data
        alert("Pilih jenis pelanggaran terlebih dahulu!");
        return;
    }
    
    const pelanggaranDetail = dataPelanggaranMap[selectedPelanggaranId];
    const poin = pelanggaranDetail.poin;
    const tanggal = document.getElementById("tanggalInput").value;
    const keterangan = document.getElementById("keteranganInput").value;

    const currentUserNip = localStorage.getItem('currentUserId');
    const currentGuru = guruData.find(g => g.id === parseInt(currentUserNip)); // Cari berdasarkan ID, bukan NIP
    const siswaTarget = siswaData.find(s => s.nama === siswaNama && s.kelas === kelas);
    
    if (!siswaTarget || !currentGuru) {
        alert("Siswa atau Guru tidak ditemukan.");
        return;
    }

    const newRiwayatId = riwayatPelanggaranData.length > 0 ? Math.max(...riwayatPelanggaranData.map(r => r.id)) + 1 : 1;
    riwayatPelanggaranData.push({
        id: newRiwayatId,
        siswaId: siswaTarget.id,
        pelanggaranId: selectedPelanggaranId,
        poin: poin,
        tanggal: tanggal,
        guruId: currentGuru.id,
        tindakLanjut: false,
        keterangan: keterangan 
    });
    
    simpanDanPerbarui(); 
    document.getElementById("inputPelanggaranForm").reset(); // Reset form
    closeInputPelanggaranModal();
}

function editPelanggaran(riwayatId) {
    const riwayat = getFullRiwayatPelanggaranData().find(r => r.id == riwayatId);
    if (!riwayat) return;

    document.getElementById('editRiwayatId').value = riwayatId;
    
    // Isi dan kunci data Siswa
    document.getElementById('editNamaSiswa').value = riwayat.namaSiswa;
    document.getElementById('editKelasSiswa').value = riwayat.kelas;
    
    // Isi Guru Pelapor (dikunci)
    const editGuruPelapor = document.getElementById('editGuruPelapor');
    // Hanya menampilkan guru yang melaporkan
    editGuruPelapor.innerHTML = `<option value="${riwayat.guruId}">${riwayat.namaGuru}</option>`;
    
    // Set Dropdown Jenis Pelanggaran
    const editJenisPelanggaran = document.getElementById('editJenisPelanggaran');
    editJenisPelanggaran.value = riwayat.pelanggaranId;
    
    // Set Poin Otomatis
    document.getElementById('editPoinPelanggaran').value = riwayat.poin;
    
    document.getElementById('editTanggalInput').value = riwayat.tanggal;
    document.getElementById('editKeterangan').value = riwayat.keterangan || '';
    document.getElementById('editPelanggaranOverlay').style.display = 'flex';
}

function simpanPerubahan(e) {
    e.preventDefault();
    
    const riwayatId = parseInt(document.getElementById('editRiwayatId').value);
    const newPelanggaranId = parseInt(document.getElementById("editJenisPelanggaran").value);
    const newTanggal = document.getElementById('editTanggalInput').value;
    const newKeterangan = document.getElementById('editKeterangan').value;
    
    if (!newPelanggaranId) {
        alert("Pastikan jenis pelanggaran dipilih.");
        return;
    }
    
    const pelanggaranDetail = dataPelanggaranMap[newPelanggaranId];
    const newPoin = pelanggaranDetail.poin;
    
    const riwayatIndex = riwayatPelanggaranData.findIndex(r => r.id === riwayatId);
    
    if (riwayatIndex !== -1) {
        riwayatPelanggaranData[riwayatIndex].pelanggaranId = newPelanggaranId;
        riwayatPelanggaranData[riwayatIndex].poin = newPoin; 
        riwayatPelanggaranData[riwayatIndex].tanggal = newTanggal;
        riwayatPelanggaranData[riwayatIndex].keterangan = newKeterangan;
    }
    
    simpanDanPerbarui();
    batalEdit();
}

function hapusPelanggaran(riwayatId) {
    // Cari dan hapus dari riwayatPelanggaranData
    const riwayatIndex = riwayatPelanggaranData.findIndex(r => r.id === parseInt(riwayatId));
    if (riwayatIndex !== -1) {
         riwayatPelanggaranData.splice(riwayatIndex, 1);
    }
    
    // *** PERBAIKAN: Menyimpan data ke Local Storage setelah penghapusan ***
    saveData(KEY_RIWAYAT, riwayatPelanggaranData);
    
    // Simpan data dan perbarui tampilan
    simpanDanPerbarui();
    
    // Sembunyikan overlay setelah penghapusan berhasil
    const deleteConfirmOverlay = document.getElementById('delete-confirm-overlay');
    if (deleteConfirmOverlay) deleteConfirmOverlay.classList.add('hidden');
}

// Fungsi BARU untuk menampilkan konfirmasi hapus
function showDeleteConfirm(riwayatId) {
    const deleteConfirmOverlay = document.getElementById('delete-confirm-overlay');
    const deleteRiwayatIdInput = document.getElementById('deleteRiwayatId');

    // Menandai ID yang akan dihapus di input hidden overlay
    if (deleteRiwayatIdInput) deleteRiwayatIdInput.value = `pelanggaran_${riwayatId}`;
    
    // Mengubah pesan konfirmasi ke Pelanggaran
    const confirmMessage = deleteConfirmOverlay.querySelector('.confirm-card p');
    if (confirmMessage) confirmMessage.textContent = "Apakah Anda yakin ingin menghapus data pelanggaran ini? Poin siswa akan dihitung ulang.";
    
    if (deleteConfirmOverlay) deleteConfirmOverlay.classList.remove('hidden');
}


// ===================== LOGIKA CRUD PENGHARGAAN =====================

// Fungsi untuk mengisi filter-filter Penghargaan
function populatePenghargaanFilters() {
    const filterJenis = document.getElementById('penghargaan-filter-jenis');
    const filterKelas = document.getElementById('penghargaan-filter-kelas'); 
    
    // Isi Filter Kelas (BARU)
    if (filterKelas) {
        filterKelas.innerHTML = '<option value="all">Semua Kelas</option>';
        kelasList.forEach(kelas => {
            filterKelas.innerHTML += `<option value="${kelas}">${kelas}</option>`;
        });
    }


    // Isi Filter Jenis Penghargaan
    if (filterJenis) {
        filterJenis.innerHTML = '<option value="all">Semua Jenis</option>';
        kategoriPenghargaanData.forEach(k => {
            filterJenis.innerHTML += `<option value="${k.id}">${k.nama}</option>`;
        });
    }
}


function tampilkanPenghargaan() {
    const tanggalFilter = document.getElementById('tanggalPenghargaan').value;
    const searchTerm = document.getElementById('searchPenghargaan').value.toLowerCase();
    const filterKelas = document.getElementById('penghargaan-filter-kelas').value; 
    const filterGender = document.getElementById('penghargaan-filter-gender').value; 
    const filterJenis = document.getElementById('penghargaan-filter-jenis').value;
    const tbody = document.getElementById("daftarPenghargaanBody");
    
    if (!tbody) return;
    
    tbody.innerHTML = "";
    const classOrder = { 'X-A': 1, 'X-B': 2, 'X-C': 3, 'XI-A': 4, 'XI-B': 5, 'XI-C': 6, 'XII-A': 7, 'XII-B': 8, 'XII-C': 9 };
    
    let filteredPenghargaan = getFullRiwayatPenghargaanData().filter(p => {
        // Filter Tanggal
        const matchTanggal = !tanggalFilter || p.tanggal === tanggalFilter;
        
        // Filter Pencarian (NIS/Nama Siswa/Jenis Penghargaan/Guru)
        const matchSearch = p.namaSiswa.toLowerCase().includes(searchTerm) || 
                            p.nis.includes(searchTerm) ||
                            p.namaKategori.toLowerCase().includes(searchTerm) ||
                            p.namaGuru.toLowerCase().includes(searchTerm); 

        // Filter Kelas (BARU)
        const matchKelas = filterKelas === 'all' || p.kelas === filterKelas;
        
        // Filter Gender (BARU)
        const matchGender = filterGender === 'all' || p.jenisKelamin === filterGender;

        // Filter Jenis Penghargaan
        const matchJenis = filterJenis === 'all' || p.kategoriId == parseInt(filterJenis);

        return matchTanggal && matchSearch && matchKelas && matchGender && matchJenis; // Disesuaikan
    });

    // Urutkan berdasarkan Kelas
    filteredPenghargaan
        .sort((a, b) => (classOrder[a.kelas] || 99) - (classOrder[b.kelas] || 99))
        .forEach((penghargaan, index) => {
            const row = document.createElement("tr");
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${penghargaan.nis}</td>
                <td>${penghargaan.namaSiswa}</td>
                <td><span class="chip ${penghargaan.jenisKelamin === 'L' ? 'chip-l' : 'chip-p'}">${penghargaan.jenisKelamin}</span></td>
                <td><span class="chip chip-kelas">${penghargaan.kelas}</span></td>
                <td>${penghargaan.namaKategori}</td>
                <td>${formatTanggal(penghargaan.tanggal)}</td>
                <td><span class="chip chip-penghargaan">${penghargaan.poin}</span></td>
                <td>${penghargaan.namaGuru}</td>
                <td>
                    <div class="action-dropdown">
                        <button class="action-btn" data-id="${penghargaan.id}" data-type="penghargaan">Aksi <span class="arrow-down"></span></button>
                        <div class="dropdown-content">
                            <a href="#" class="edit-penghargaan-btn" data-id="${penghargaan.id}">Edit</a>
                            <a href="#" class="delete-penghargaan-btn" data-id="${penghargaan.id}">Hapus</a>
                        </div>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
}

function submitPenghargaan(e) {
    e.preventDefault();
    
    const kelas = document.getElementById("kelasInputPenghargaan").value;
    const siswaNama = document.getElementById("siswaInputPenghargaan").value;
    const jenisDropdown = document.getElementById("jenisPenghargaan");
    const selectedKategoriId = parseInt(jenisDropdown.value);
    
    if (!selectedKategoriId) {
        alert("Pilih jenis penghargaan terlebih dahulu!");
        return;
    }
    
    const kategoriDetail = dataKategoriPenghargaanMap[selectedKategoriId];
    const poin = kategoriDetail.poin;
    const tanggal = document.getElementById("tanggalInputPenghargaan").value;
    const keterangan = document.getElementById("keteranganInputPenghargaan").value;
    
    const currentUserNip = localStorage.getItem('currentUserId');
    const currentGuru = guruData.find(g => g.id === parseInt(currentUserNip));
    const siswaTarget = siswaData.find(s => s.nama === siswaNama && s.kelas === kelas);
    
    if (!siswaTarget || !currentGuru) {
        alert("Siswa atau Guru tidak ditemukan.");
        return;
    }
    
    const newRiwayatId = penghargaanData.length > 0 ? Math.max(...penghargaanData.map(r => r.id)) + 1 : 1;
    penghargaanData.push({
        id: newRiwayatId,
        siswaId: siswaTarget.id,
        kategoriId: selectedKategoriId,
        poin: poin,
        tanggal: tanggal,
        guruId: currentGuru.id,
        keterangan: keterangan
    });
    
    simpanDanPerbarui();
    document.getElementById("inputPenghargaanForm").reset(); // Reset form
    closeInputPenghargaanModal();
}

function editPenghargaan(riwayatId) {
    const riwayat = getFullRiwayatPenghargaanData().find(r => r.id == riwayatId);
    if (!riwayat) return;

    document.getElementById('editPenghargaanRiwayatId').value = riwayatId;
    
    // Isi dan kunci data Siswa
    document.getElementById('editNamaSiswaPenghargaan').value = riwayat.namaSiswa;
    document.getElementById('editKelasSiswaPenghargaan').value = riwayat.kelas;
    
    // Isi Guru Pelapor (dikunci)
    const editGuruPelapor = document.getElementById('editGuruPelaporPenghargaan');
    editGuruPelapor.innerHTML = `<option value="${riwayat.guruId}">${riwayat.namaGuru}</option>`;
    
    // Set Dropdown Jenis Penghargaan
    const editJenisPenghargaan = document.getElementById('editJenisPenghargaanNew');
    editJenisPenghargaan.value = riwayat.kategoriId;
    
    // Set Poin Otomatis
    document.getElementById('editPoinPenghargaanValue').value = riwayat.poin;
    
    document.getElementById('editTanggalPenghargaanInput').value = riwayat.tanggal;
    document.getElementById('editKeteranganPenghargaan').value = riwayat.keterangan || '';
    document.getElementById('editPenghargaanOverlay').style.display = 'flex';
}

function simpanPerubahanPenghargaan(e) {
    e.preventDefault();
    
    const riwayatId = parseInt(document.getElementById('editPenghargaanRiwayatId').value);
    const newKategoriId = parseInt(document.getElementById("editJenisPenghargaanNew").value);
    const newTanggal = document.getElementById('editTanggalPenghargaanInput').value;
    const newKeterangan = document.getElementById('editKeteranganPenghargaan').value;
    
    if (!newKategoriId) {
        alert("Pastikan jenis penghargaan dipilih.");
        return;
    }
    
    const kategoriDetail = dataKategoriPenghargaanMap[newKategoriId];
    const newPoin = kategoriDetail.poin;
    
    const riwayatIndex = penghargaanData.findIndex(r => r.id === riwayatId);
    
    if (riwayatIndex !== -1) {
        penghargaanData[riwayatIndex].kategoriId = newKategoriId;
        penghargaanData[riwayatIndex].poin = newPoin; 
        penghargaanData[riwayatIndex].tanggal = newTanggal;
        penghargaanData[riwayatIndex].keterangan = newKeterangan;
    }
    
    simpanDanPerbarui();
    batalEditPenghargaan();
}

function hapusPenghargaanConfirm(riwayatId) {
    // Fungsi untuk menampilkan konfirmasi hapus penghargaan (menggunakan overlay yang sama)
    const deleteConfirmOverlay = document.getElementById('delete-confirm-overlay');
    const deleteRiwayatIdInput = document.getElementById('deleteRiwayatId');

    // Menandai ID yang akan dihapus di input hidden overlay
    if (deleteRiwayatIdInput) deleteRiwayatIdInput.value = `penghargaan_${riwayatId}`; 
    
    // Mengubah pesan konfirmasi sedikit jika diperlukan (Opsional)
    const confirmMessage = deleteConfirmOverlay.querySelector('.confirm-card p');
    if (confirmMessage) confirmMessage.textContent = "Apakah Anda yakin ingin menghapus data penghargaan ini? Poin siswa akan dihitung ulang.";
    
    if (deleteConfirmOverlay) deleteConfirmOverlay.classList.remove('hidden');
}

function hapusPenghargaan(riwayatId) {
    const riwayatIndex = penghargaanData.findIndex(r => r.id === parseInt(riwayatId));
    if (riwayatIndex !== -1) {
         penghargaanData.splice(riwayatIndex, 1);
    }
    
    simpanDanPerbarui();
    
    // Sembunyikan overlay setelah penghapusan berhasil
    const deleteConfirmOverlay = document.getElementById('delete-confirm-overlay');
    if (deleteConfirmOverlay) deleteConfirmOverlay.classList.add('hidden');
}

// ===================== LOGIKA REKAP KELAS (DIPERBARUI) =====================

// Fungsi untuk menghitung statistik agregat per kelas
function calculateRekapPerKelas() {
    const stats = {};
    const allKelas = [...new Set(siswaData.map(s => s.kelas))].sort();

    // Inisialisasi statistik untuk setiap kelas
    allKelas.forEach(kelas => {
        stats[kelas] = {
            jumlahPelanggaran: 0,
            poinPelanggaran: 0,
            poinPenghargaan: 0
        };
    });

    // 1. Agregasi Poin Pelanggaran dan Penghargaan per Siswa (sudah dihitung di recalculateSiswaPoin)
    siswaData.forEach(siswa => {
        if (stats[siswa.kelas]) {
            stats[siswa.kelas].poinPelanggaran += siswa.poin_pelanggaran;
            stats[siswa.kelas].poinPenghargaan += siswa.poin_penghargaan;
        }
    });

    // 2. Hitung Jumlah Riwayat Pelanggaran per Kelas
    riwayatPelanggaranData.forEach(riwayat => {
        const siswa = siswaData.find(s => s.id === riwayat.siswaId);
        if (siswa && stats[siswa.kelas]) {
            stats[siswa.kelas].jumlahPelanggaran += 1;
        }
    });

    return stats;
}


function tampilkanRekap() {
    const filterKelas = document.getElementById("kelasRekap").value;
    const tbody = document.querySelector("#rekapTable tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    
    recalculateSiswaPoin();
    const statsData = calculateRekapPerKelas();
    let index = 1;
    
    const sortedKelas = Object.keys(statsData).sort();

    sortedKelas.forEach(kelas => {
        if (filterKelas === 'all' || filterKelas === kelas) {
            const data = statsData[kelas];
            
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index++}</td>
                <td><span class="chip chip-kelas">${kelas}</span></td>
                <td>${data.jumlahPelanggaran}</td>
                <td><span class="chip chip-pelanggaran">${data.poinPelanggaran}</span></td>
                <td><span class="chip chip-penghargaan">${data.poinPenghargaan}</span></td>`; 
            tbody.appendChild(row);
        }
    });
}

// Menghapus fungsi urutkanPoin dan urutkanAbjad karena Rekap Kelas kini menampilkan data agregat.

// ===================== LOGIKA MODAL & DROPDOWN =====================

function openInputPelanggaranModal() {
    // Isi dropdown jenis pelanggaran
    const jenisDropdown = document.getElementById("jenisPelanggaran");
    jenisDropdown.innerHTML = '<option value="" disabled selected>Pilih Jenis Pelanggaran</option>';
    pelanggaranData.forEach(p => {
        jenisDropdown.innerHTML += `<option value="${p.id}">${p.nama}</option>`;
    });
    
    // Set Tanggal Input ke hari ini
    document.getElementById("tanggalInput").value = new Date().toISOString().split('T')[0];
    
    // Set nilai default form info
    document.getElementById('nisAuto').value = '';
    document.getElementById('jenisKelaminAuto').value = '';
    document.getElementById('poinPelanggaranAuto').value = '';
    
    document.getElementById('inputPelanggaranOverlay').style.display = 'flex';
}

function closeInputPelanggaranModal() {
    document.getElementById('inputPelanggaranOverlay').style.display = 'none';
}

function batalEdit() {
    document.getElementById('editPelanggaranOverlay').style.display = 'none';
}

function openInputPenghargaanModal() {
    // Isi dropdown jenis penghargaan
    const jenisDropdown = document.getElementById("jenisPenghargaan");
    jenisDropdown.innerHTML = '<option value="" disabled selected>Pilih Jenis Penghargaan</option>';
    kategoriPenghargaanData.forEach(k => {
        jenisDropdown.innerHTML += `<option value="${k.id}">${k.nama} (${k.poin} poin)</option>`;
    });
    
    // Set Tanggal Input ke hari ini
    document.getElementById("tanggalInputPenghargaan").value = new Date().toISOString().split('T')[0];
    
    document.getElementById('inputPenghargaanOverlay').style.display = 'flex';
}

function closeInputPenghargaanModal() {
    document.getElementById('inputPenghargaanOverlay').style.display = 'none';
}

function batalEditPenghargaan() {
    document.getElementById('editPenghargaanOverlay').style.display = 'none';
}


function populateKelasOptions(elementId) {
    const dropdown = document.getElementById(elementId);
    if (!dropdown) return;
    dropdown.innerHTML = '';
    
    // Tambahkan opsi "Semua Kelas" hanya untuk Rekap Kelas
    if (elementId === 'kelasRekap') {
         dropdown.innerHTML += '<option value="all">Semua Kelas</option>';
    }

    kelasList.forEach(kelas => {
        dropdown.innerHTML += `<option value="${kelas}">${kelas}</option>`;
    });
}

function populateSiswaOptions(kelasElementId, siswaElementId) {
    const kelas = document.getElementById(kelasElementId).value;
    const siswaDropdown = document.getElementById(siswaElementId);
    if (!siswaDropdown) return;
    
    siswaDropdown.innerHTML = "";
    siswaData.filter(s => s.kelas === kelas).forEach(siswa => {
        const option = document.createElement("option");
        option.value = siswa.nama;
        option.text = siswa.nama;
        option.dataset.id = siswa.id;
        siswaDropdown.add(option);
    });
    
    // Panggil update auto-fill setelah mengisi dropdown siswa
    updateAutoFillInfo(siswaElementId);
}

function updateAutoFillInfo(siswaElementId) {
    const siswaDropdown = document.getElementById(siswaElementId);
    const selectedNama = siswaDropdown.value;
    
    const siswaTarget = siswaData.find(s => s.nama === selectedNama);
    
    if (siswaElementId === 'siswaInput' && siswaTarget) {
        document.getElementById('nisAuto').value = siswaTarget.nis || 'N/A';
        document.getElementById('jenisKelaminAuto').value = siswaTarget.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan';
    } else if (siswaElementId === 'siswaInputPenghargaan' && siswaTarget) {
         document.getElementById('nisAutoPenghargaan').value = siswaTarget.nis || 'N/A';
        document.getElementById('jenisKelaminAutoPenghargaan').value = siswaTarget.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan';
    }
}

// Fungsi untuk update Poin secara otomatis saat Jenis Pelanggaran dipilih di Modal Input
function updatePoinAuto() {
    const jenisDropdown = document.getElementById("jenisPelanggaran");
    const selectedPelanggaranId = parseInt(jenisDropdown.value);
    const poinInput = document.getElementById('poinPelanggaranAuto');

    if (selectedPelanggaranId && dataPelanggaranMap[selectedPelanggaranId]) {
        poinInput.value = dataPelanggaranMap[selectedPelanggaranId].poin;
    } else {
        poinInput.value = '';
    }
}

// Fungsi untuk update Poin Penghargaan secara otomatis saat Jenis Penghargaan dipilih di Modal Input
function updatePoinPenghargaanAuto() {
    const jenisDropdown = document.getElementById("jenisPenghargaan");
    const selectedKategoriId = parseInt(jenisDropdown.value);
    const poinInput = document.getElementById('poinPenghargaanAuto');

    if (selectedKategoriId && dataKategoriPenghargaanMap[selectedKategoriId]) {
        poinInput.value = dataKategoriPenghargaanMap[selectedKategoriId].poin;
    } else {
        poinInput.value = '';
    }
}

// Menutup semua dropdown aksi yang terbuka
function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-content.show').forEach(d => {
        d.classList.remove('show');
        d.previousElementSibling.classList.remove('open');
    });
}

// Delegasi Event untuk Dropdown Aksi
function setupDropdownDelegation() {
    document.body.addEventListener('click', function(e) {
        const isDropdownButton = e.target.closest('.action-btn');
        const isDropdownItem = e.target.closest('.dropdown-content a');

        // 1. Logika Toggle Dropdown
        if (isDropdownButton) {
            e.preventDefault();
            e.stopPropagation(); // Mencegah penutupan global

            const dropdownContent = isDropdownButton.closest('.action-dropdown').querySelector('.dropdown-content');
            const isOpen = isDropdownButton.classList.contains('open');

            closeAllDropdowns(); // Tutup yang lain

            if (!isOpen) {
                dropdownContent.classList.add('show');
                isDropdownButton.classList.add('open');
            }
        } else if (!isDropdownItem) {
            closeAllDropdowns();
        }

        // 2. Logika Klik Item Dropdown (Edit/Hapus)
        if (isDropdownItem) {
            e.preventDefault();
            e.stopPropagation();
            
            const riwayatId = isDropdownItem.dataset.id;
            const isPenghargaan = isDropdownItem.closest('.action-dropdown')?.querySelector('.action-btn')?.dataset.type === 'penghargaan';

            // Close dropdown manually before calling the next function
            closeAllDropdowns();
            
            if (isPenghargaan) {
                 if (isDropdownItem.classList.contains('edit-penghargaan-btn')) {
                    editPenghargaan(riwayatId);
                } else if (isDropdownItem.classList.contains('delete-penghargaan-btn')) {
                    hapusPenghargaanConfirm(riwayatId); 
                }
            } else { // Pelanggaran
                if (isDropdownItem.classList.contains('edit-pelanggaran-btn')) {
                    editPelanggaran(riwayatId);
                } else if (isDropdownItem.classList.contains('delete-pelanggaran-btn')) {
                    showDeleteConfirm(riwayatId); // Tampilkan konfirmasi overlay
                }
            }
        }
    });
}


// ===================== INISIALISASI & EVENT LISTENERS SETUP =====================

document.addEventListener('DOMContentLoaded', function() {
    // --- Pengecekan Sesi Login Terpusat (BARU) ---
    const userType = localStorage.getItem('currentUserType');
    const userId = localStorage.getItem('currentUserId');
    const mainPage = document.getElementById("mainPage");

    if (userType !== 'guru' || !userId) {
        // Jika tidak terautentikasi sebagai guru, redirect ke halaman login
        window.location.href = 'index.html';
        return;
    }
    
    // Jika terautentikasi, tampilkan dashboard
    mainPage.style.display = "flex";
    
    syncGlobalData();
    recalculateSiswaPoin(); 

    // --- DOM Elemen Konfirmasi Delete Baru ---
    const deleteConfirmOverlay = document.getElementById('delete-confirm-overlay');
    const deleteConfirmYesBtn = document.getElementById('delete-confirm-yes-btn');
    const deleteConfirmNoBtn = document.getElementById('delete-confirm-no-btn');
    const deleteRiwayatIdInput = document.getElementById('deleteRiwayatId');

    // --- SETUP DROPDOWN DELEGATION ---
    setupDropdownDelegation();

    // --- DOM Elemen Konfirmasi Logout ---
    const logoutConfirmOverlay = document.getElementById('logout-confirm-overlay');
    const confirmYesBtn = document.getElementById('confirm-yes-btn');
    const confirmNoBtn = document.getElementById('confirm-no-btn');

    // Set initial values untuk tanggal ke hari ini
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = ['tanggalInput', 'tanggalInputPenghargaan', 'tanggalPelanggaran', 'tanggalPenghargaan', 'tanggalDetailPelanggaran', 'tanggalDetailPenghargaan'];
    dateInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = today;
    });
    
    // --- SETUP DROPDOWNS & MODALS ---
    populateKelasOptions("kelasInput");
    populateKelasOptions("kelasInputPenghargaan");
    populateKelasOptions("kelasRekap");
    
    populateSiswaOptions("kelasInput", "siswaInput");
    populateSiswaOptions("kelasInputPenghargaan", "siswaInputPenghargaan");
    
    // Pengisian dropdown untuk Modal Edit/Input
    const editJenisPelanggaran = document.getElementById('editJenisPelanggaran');
    pelanggaranData.forEach(p => {
        if(editJenisPelanggaran) editJenisPelanggaran.innerHTML += `<option value="${p.id}">${p.nama} (${p.poin} poin)</option>`;
    });
    
    const editJenisPenghargaanNew = document.getElementById('editJenisPenghargaanNew');
    kategoriPenghargaanData.forEach(k => {
        if(editJenisPenghargaanNew) editJenisPenghargaanNew.innerHTML += `<option value="${k.id}">${k.nama} (${k.poin} poin)</option>`;
    });
    
    // --- 1. Sesi & Profil ---
    updateProfileInfo();

    // --- 2. Sidebar Navigation & Dropdown ---
    document.getElementById('sidebar-profile')?.addEventListener('click', () => {
        document.getElementById('logout-popup').classList.toggle('hidden');
    });
    
    document.getElementById('showConfirmLogout')?.addEventListener('click', showConfirmLogout);

    if (confirmYesBtn) {
        confirmYesBtn.addEventListener('click', logout);
    }
    if (confirmNoBtn) {
        confirmNoBtn.addEventListener('click', () => logoutConfirmOverlay.classList.add('hidden'));
    }
    
    // NOTE: Ganti Profil menu sudah dihapus dari HTML
    
    document.querySelectorAll('#menuContainer .data-container .data-header').forEach(header => {
        header.addEventListener('click', toggleSubMenu);
    });

    document.querySelectorAll('#menuContainer .menu-item').forEach(menuItem => {
        const page = menuItem.getAttribute('data-page');
        if (page) {
            menuItem.addEventListener('click', () => showPage(page));
        }
    });


    // --- 3. Dashboard Quick Links ---
    document.getElementById('dashboardcolumn-yellow')?.addEventListener('click', () => showPage('jumlahPelanggaran'));
    document.getElementById('dashboardcolumn-green')?.addEventListener('click', () => showPage('jumlahPenghargaan'));
    document.getElementById('dashboardcolumn-red')?.addEventListener('click', () => showPage('detailSiswaTertinggi'));
    document.getElementById('dashboardcolumn-blue')?.addEventListener('click', () => showPage('tindakLanjut'));
    
    // --- 4. Kembali Buttons (Back to Dashboard) ---
    document.querySelectorAll('#content .cancel-btn[data-page="dashboard"]').forEach(btn => {
         btn.addEventListener('click', () => showPage('dashboard'));
    });

    // --- 5. Form/Input Button Pelanggaran ---
    document.getElementById('inputPelanggaranBtn')?.addEventListener('click', openInputPelanggaranModal);
    document.getElementById('closeInputPelanggaranBtn')?.addEventListener('click', closeInputPelanggaranModal);
    document.getElementById('inputPelanggaranForm')?.addEventListener('submit', submitPelanggaran); // Gunakan form submit
    
    document.getElementById("kelasInput")?.addEventListener("change", () => populateSiswaOptions("kelasInput", "siswaInput"));
    document.getElementById("siswaInput")?.addEventListener("change", () => updateAutoFillInfo("siswaInput"));
    document.getElementById("jenisPelanggaran")?.addEventListener("change", updatePoinAuto);
    document.getElementById("editJenisPelanggaran")?.addEventListener("change", function() {
        const selectedId = parseInt(this.value);
        document.getElementById('editPoinPelanggaran').value = dataPelanggaranMap[selectedId] ? dataPelanggaranMap[selectedId].poin : '';
    });

    // --- 6. Konfirmasi Hapus Pelanggaran/Penghargaan Event Listeners ---
    if (deleteConfirmYesBtn) {
        deleteConfirmYesBtn.addEventListener('click', () => {
            const fullId = deleteRiwayatIdInput.value;
            const [type, id] = fullId.split('_');
            
            if (type === 'penghargaan') {
                hapusPenghargaan(id);
            } else {
                hapusPelanggaran(id);
            }
        });
    }

    if (deleteConfirmNoBtn) {
        deleteConfirmNoBtn.addEventListener('click', () => {
            if (deleteConfirmOverlay) deleteConfirmOverlay.classList.add('hidden');
            deleteRiwayatIdInput.value = ''; // Bersihkan ID saat batal
        });
    }

    // --- 7. Form/Input Button Penghargaan ---
    document.getElementById('inputPenghargaanBtn')?.addEventListener('click', openInputPenghargaanModal);
    document.getElementById('closeInputPenghargaanBtn2')?.addEventListener('click', closeInputPenghargaanModal);
    document.getElementById('inputPenghargaanForm')?.addEventListener('submit', submitPenghargaan); // Gunakan form submit
    
    document.getElementById("kelasInputPenghargaan")?.addEventListener("change", () => populateSiswaOptions("kelasInputPenghargaan", "siswaInputPenghargaan"));
    document.getElementById("siswaInputPenghargaan")?.addEventListener("change", () => updateAutoFillInfo("siswaInputPenghargaan"));
    document.getElementById("jenisPenghargaan")?.addEventListener("change", updatePoinPenghargaanAuto);


    // --- 8. Filter Penghargaan ---
    document.getElementById('tanggalPenghargaan')?.addEventListener('change', tampilkanPenghargaan);
    document.getElementById('searchPenghargaan')?.addEventListener('keyup', tampilkanPenghargaan);
    document.getElementById('penghargaan-filter-jenis')?.addEventListener('change', tampilkanPenghargaan);
    document.getElementById('penghargaan-filter-kelas')?.addEventListener('change', tampilkanPenghargaan); 
    document.getElementById('penghargaan-filter-gender')?.addEventListener('change', tampilkanPenghargaan); 


    // --- 9. Edit Modal Action Pelanggaran ---
    document.getElementById('editPelanggaranForm')?.addEventListener('submit', simpanPerubahan);
    document.getElementById('batalEditBtn')?.addEventListener('click', batalEdit);
    
    // --- 10. Edit Modal Action Penghargaan ---
    document.getElementById('editJenisPenghargaanNew')?.addEventListener('change', function() {
        const selectedId = parseInt(this.value);
        document.getElementById('editPoinPenghargaanValue').value = dataKategoriPenghargaanMap[selectedId] ? dataKategoriPenghargaanMap[selectedId].poin : '';
    });
    document.getElementById('editPenghargaanForm')?.addEventListener('submit', simpanPerubahanPenghargaan);
    document.getElementById('batalEditPenghargaanBtn')?.addEventListener('click', batalEditPenghargaan);
    
    // --- 11. Filter dan Sorting Daftar Pelanggaran/Penghargaan ---
    document.getElementById('tanggalPelanggaran')?.addEventListener('change', tampilkanPelanggaran);
    document.getElementById('searchPelanggaran')?.addEventListener('keyup', tampilkanPelanggaran);
    document.getElementById('pelanggaran-filter-kelas')?.addEventListener('change', tampilkanPelanggaran);
    document.getElementById('pelanggaran-filter-gender')?.addEventListener('change', tampilkanPelanggaran);
    document.getElementById('pelanggaran-filter-jenis')?.addEventListener('change', tampilkanPelanggaran);


    document.getElementById('tanggalPenghargaan')?.addEventListener('change', tampilkanPenghargaan);
    document.getElementById('searchPenghargaan')?.addEventListener('keyup', tampilkanPenghargaan);
    
    // --- 12. Filter dan Sorting Rekap Kelas ---
    document.getElementById('kelasRekap')?.addEventListener('change', tampilkanRekap);

    // --- 13. Filter Rincian Harian ---
    document.getElementById('tanggalDetailPelanggaran')?.addEventListener('change', filterDetailPelanggaran);
    document.getElementById('searchDetailPelanggaran')?.addEventListener('keyup', filterDetailPelanggaran);
    
    document.getElementById('tanggalDetailPenghargaan')?.addEventListener('change', filterDetailPenghargaan);
    document.getElementById('searchDetailPenghargaan')?.addEventListener('keyup', filterDetailPenghargaan);
    
    // Tampilkan Overview/Dashboard saat pertama kali load
    const initialPage = document.querySelector('.menu-item.overview').getAttribute('data-page');
    showPage(initialPage);
});