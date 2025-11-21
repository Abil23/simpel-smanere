// admin.js

// IMPOR DATA DAN FUNGSI DARI db.js
import { 
    siswaData, 
    guruData, 
    adminData, 
    pelanggaranData, 
    riwayatPelanggaranData,
    recalculateSiswaPoin,
    saveData,
    KEY_SISWA,
    KEY_RIWAYAT,
    KEY_GURU,
    KEY_ADMIN,
    KEY_PELANGGARAN
} from "./db.js";


document.addEventListener('DOMContentLoaded', function () {
    // =====================================================================
    // ======================== DOM ELEMENTS FOR LOGOUT ====================
    // =====================================================================
    const logoutConfirmOverlay = document.getElementById('logout-confirm-overlay');
    const confirmYesBtn = document.getElementById('confirm-yes-btn');
    const confirmNoBtn = document.getElementById('confirm-no-btn');
    const adminUserProfile = document.getElementById('adminUserProfile');
    const logoutDropdown = document.getElementById('logout-dropdown');
    const showConfirmLogoutBtn = document.getElementById('showConfirmLogout');

    // =====================================================================
    // ======================== VERIFIKASI SESI ADMIN ======================
    // =====================================================================
    const userType = localStorage.getItem('currentUserType');
    const userId = localStorage.getItem('currentUserId');
    const adminUser = adminData.find(a => a.nip === userId);

    if (userType !== 'admin' || !adminUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Set nama Admin di sidebar
    const profileName = document.querySelector('.profile-name');
    const profileStatus = document.querySelector('.profile-status');
    if (profileName) profileName.textContent = adminUser.nama;
    if (profileStatus) profileStatus.textContent = 'Admin';
    
    // LOGIKA LOGOUT INTERAKTIF
    
    // 1. Toggle Dropdown saat User Profile diklik
    if (adminUserProfile) {
        adminUserProfile.addEventListener('click', (e) => {
            if (e.target.closest('#logout-dropdown')) return; 
            logoutDropdown.classList.toggle('hidden');
        });
    }

    // 2. Tampilkan Konfirmasi Overlay saat Logout di dropdown diklik
    if (showConfirmLogoutBtn) {
        showConfirmLogoutBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            if (logoutDropdown) logoutDropdown.classList.add('hidden');
            if (logoutConfirmOverlay) logoutConfirmOverlay.classList.remove('hidden');
        });
    }

    // 3. Konfirmasi "Ya"
    if (confirmYesBtn) {
        confirmYesBtn.addEventListener('click', () => {
            if (logoutConfirmOverlay) logoutConfirmOverlay.classList.add('hidden');
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }

    // 4. Konfirmasi "Tidak"
    if (confirmNoBtn) {
        confirmNoBtn.addEventListener('click', () => {
            if (logoutConfirmOverlay) logoutConfirmOverlay.classList.add('hidden');
        });
    }
    
    // Menutup dropdown ketika mengklik di luar sidebar
    document.addEventListener('click', (e) => {
        if (logoutDropdown && !adminUserProfile.contains(e.target) && !logoutDropdown.contains(e.target)) {
            logoutDropdown.classList.add('hidden');
        }
    });

    // ====================== UTILITY FUNCTIONS =======================
    function getStatus(poin) {
        if (poin >= 125) return { text: 'Dikeluarkan', className: 'chip-dikeluarkan', code: 'dikeluarkan' };
        if (poin >= 100) return { text: 'SP4', className: 'chip-sp4', code: 'sp4' };
        if (poin >= 75) return { text: 'SP3', className: 'chip-sp3', code: 'sp3' };
        if (poin >= 50) return { text: 'SP2', className: 'chip-sp2', code: 'sp2' };
        if (poin >= 25) return { text: 'SP1', className: 'chip-sp1', code: 'sp1' };
        return { text: 'Aman', className: 'chip-aman', code: 'aman' };
    }
    
    function updateCurrentDate() {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = today.toLocaleDateString('id-ID', options);
        const dateElement = document.getElementById('adminDashboardDate');
        if (dateElement) {
            dateElement.textContent = formattedDate;
        }
    }


    // ====================== DASHBOARD OVERVIEW LOGIC =======================
    function renderDashboardOverview() {
        updateCurrentDate(); // Panggil fungsi update tanggal
        recalculateSiswaPoin();

        // 1. Total Siswa Bermasalah (SP1+)
        const totalSiswaBermasalah = siswaData.filter(s => s.poin_akumulasi >= 25).length;
        document.getElementById('totalSiswaBermasalah').textContent = totalSiswaBermasalah;
        

        // 2. Total Poin Pelanggaran Global
        const totalPoinPelanggaranGlobal = siswaData.reduce((sum, s) => sum + s.poin_pelanggaran, 0);
        document.getElementById('totalPoinPelanggaranGlobal').textContent = totalPoinPelanggaranGlobal;

        // 3. Total Guru & Admin Terdaftar
        const totalUserCount = guruData.length + adminData.length;
        document.getElementById('totalUserCount').textContent = totalUserCount;

        // 4. Kelas dengan Rata-rata Poin Tertinggi
        const statsPerKelas = {};
        const kelasList = [...new Set(siswaData.map(s => s.kelas))];
        
        if (kelasList.length > 0) {
            kelasList.forEach(kelas => {
                const siswaDiKelas = siswaData.filter(s => s.kelas === kelas);
                const totalPoinKelas = siswaDiKelas.reduce((sum, s) => sum + s.poin_pelanggaran, 0);
                const rataRata = siswaDiKelas.length > 0 ? (totalPoinKelas / siswaDiKelas.length) : 0;
                statsPerKelas[kelas] = rataRata;
            });
    
            const sortedKelas = Object.entries(statsPerKelas).sort(([, a], [, b]) => b - a);
            
            if (sortedKelas.length > 0 && sortedKelas[0][1] > 0) {
                const [kelasTertinggi, rataRata] = sortedKelas[0];
                document.getElementById('kelasPoinTertinggi').textContent = 
                    `${kelasTertinggi} (${rataRata.toFixed(1)} rata-rata)`;
            } else {
                document.getElementById('kelasPoinTertinggi').textContent = 'Semua Aman';
            }
        } else {
             document.getElementById('kelasPoinTertinggi').textContent = 'Tidak Ada Data Kelas';
        }
    }


    // ====================== NAVIGATION & SETUP =======================
    const laporanHeader = document.querySelector('.laporan-header');
    
    if(laporanHeader) {
        laporanHeader.addEventListener('click', function (e) {
            e.stopPropagation();
            this.parentElement.querySelector('.laporan-sub-menu').classList.toggle('active');
            this.querySelector('.arrow-open').classList.toggle('rotate');
        });
    }


    const menuItems = document.querySelectorAll('.menu-item');
    const contentSections = document.querySelectorAll('.content-section');
    const dataHeader = document.querySelector('.data-header');

    if(dataHeader) {
        dataHeader.addEventListener('click', function (e) {
            e.stopPropagation();
            this.parentElement.querySelector('.sub-menu').classList.toggle('active');
            this.querySelector('.arrow-open').classList.toggle('rotate');
        });
    }

    menuItems.forEach(item => {
        item.addEventListener('click', function () {
            const isSubMenuItem = this.parentElement.classList.contains('sub-menu');
            document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
            document.querySelector('.data-header')?.classList.remove('active');
            document.querySelector('.laporan-header')?.classList.remove('active');
            this.classList.add('active');
            
            if (isSubMenuItem) {
                if (this.parentElement.classList.contains('laporan-sub-menu')) {
                     document.querySelector('.laporan-header').classList.add('active');
                } else {
                    dataHeader.classList.add('active');
                }
            } else {
                document.querySelector('.sub-menu.active')?.classList.remove('active');
                document.querySelector('.arrow-open.rotate')?.classList.remove('rotate');
            }
            const contentToShow = this.getAttribute('data-content');
            contentSections.forEach(section => section.classList.add('hidden'));
            const targetSection = document.querySelector(`.${contentToShow}-content`);
            if (targetSection) {
                targetSection.classList.remove('hidden');
                
                recalculateSiswaPoin();
                
                if (contentToShow === 'overview') {
                    renderDashboardOverview(); // Panggil fungsi overview baru
                } else if (contentToShow === 'data-siswa') {
                    populateSiswaFilters();
                    renderSiswaTable();
                } else if (contentToShow === 'data-guru') {
                    renderGuruTable();
                } else if (contentToShow === 'data-admin') {
                    renderAdminTable();
                } else if (contentToShow === 'data-pelanggaran-sub') {
                    renderPelanggaranTable();
                } else if (contentToShow === 'pelanggaran') {
                    populatePelanggaranSiswaFilters();
                    renderPelanggaranSiswaTable();
                } else if (contentToShow === 'report-guru') {
                    renderLaporanGuruTatib();
                } else if (contentToShow === 'report-statistik') {
                    populateStatistikFilters();
                    renderStatistikTable();
                }
            }
        });
    });

    // ======================== MODAL AND DROPDOWN LOGIC ===========================
    function setupDropdowns() {
        document.body.addEventListener('click', function (e) {
            const isDropdownButton = e.target.matches('.action-btn');
            document.querySelectorAll('.dropdown-content.show').forEach(d => {
                if (!isDropdownButton || !d.previousElementSibling.isSameNode(e.target)) {
                    d.classList.remove('show');
                    d.previousElementSibling.classList.remove('open');
                }
            });

            if (isDropdownButton) {
                const dropdown = e.target.nextElementSibling;
                dropdown.classList.toggle('show');
                e.target.classList.toggle('open');
            }
        });
    }

    function setupModals() {
        const modals = document.querySelectorAll('.modal');
        const addButtons = {
            'siswa': document.getElementById('add-siswa-button'),
            'guru': document.getElementById('add-guru-button'),
            'admin': document.getElementById('add-admin-button'),
            'pelanggaran': document.getElementById('add-pelanggaran-button'),
        };

        Object.keys(addButtons).forEach(key => {
            if (addButtons[key]) {
                addButtons[key].addEventListener('click', () => openModal(`add-modal-${key}`))
            }
        });

        modals.forEach(modal => {
            modal.querySelector('.close-button')?.addEventListener('click', () => closeModal(modal.id));
            modal.querySelector('.cancel-btn')?.addEventListener('click', () => closeModal(modal.id));
        });
    }

    function openModal(modalId) { document.getElementById(modalId).classList.remove('hidden'); }
    function closeModal(modalId) { document.getElementById(modalId).classList.add('hidden'); }

    function populateKelasDropdown(elementId) {
        const dropdown = document.getElementById(elementId);
        if (!dropdown) return;
        const grades = ['X', 'XI', 'XII'];
        const classes = ['A', 'B', 'C'];
        dropdown.innerHTML = ''; 
        grades.forEach(grade => {
            classes.forEach(c => {
                const option = `${grade}-${c}`;
                dropdown.innerHTML += `<option value="${option}">${option}</option>`;
            });
        });
    }

    // ======================== DATA SISWA LOGIC ===========================
    const tableBodySiswa = document.querySelector('#siswa-table tbody');
    const searchBarSiswa = document.getElementById('search-bar-siswa');
    const sortSelectSiswa = document.getElementById('sort-select-siswa');
    const filterKelasSiswa = document.getElementById('filter-kelas-siswa');
    const filterGenderSiswa = document.getElementById('filter-gender-siswa');
    const filterStatusSiswa = document.getElementById('filter-status-siswa');
    const editFormSiswa = document.getElementById('edit-form-siswa');
    const addFormSiswa = document.getElementById('add-form-siswa');

    function populateSiswaFilters() {
        if (!filterKelasSiswa || !filterStatusSiswa) return;
        const kelas = [...new Set(siswaData.map(s => s.kelas))];
        filterKelasSiswa.innerHTML = '<option value="all">Semua Kelas</option>';
        kelas.sort().forEach(k => filterKelasSiswa.innerHTML += `<option value="${k}">${k}</option>`);

        // Dapatkan semua status unik
        const allStatuses = siswaData.map(s => getStatus(s.poin_akumulasi));
        const uniqueStatuses = [...new Map(allStatuses.map(item => [item.code, item])).values()];
        
        filterStatusSiswa.innerHTML = '<option value="all">Semua Status</option>';
        uniqueStatuses.forEach(s => filterStatusSiswa.innerHTML += `<option value="${s.code}">${s.text}</option>`);
    }

    function renderSiswaTable() {
        if (!tableBodySiswa) return;
        let filteredData = [...siswaData];
        const searchTerm = searchBarSiswa.value.toLowerCase();
        const sortValue = sortSelectSiswa.value;
        const filterKelas = filterKelasSiswa.value;
        const filterGender = filterGenderSiswa.value;
        const filterStatus = filterStatusSiswa.value;

        if (searchTerm) {
            filteredData = filteredData.filter(s => s.nama.toLowerCase().includes(searchTerm) || s.nis.includes(searchTerm));
        }
        if (filterKelas !== 'all') {
            filteredData = filteredData.filter(s => s.kelas === filterKelas);
        }
        if (filterGender !== 'all') {
            filteredData = filteredData.filter(s => s.jenis_kelamin === filterGender);
        }
        if (filterStatus !== 'all') {
            filteredData = filteredData.filter(s => getStatus(s.poin_akumulasi).code === filterStatus);
        }

        switch (sortValue) {
            case 'az': filteredData.sort((a, b) => a.nama.localeCompare(b.nama)); break;
            case 'poin-tertinggi': filteredData.sort((a, b) => b.poin_akumulasi - a.poin_akumulasi); break;
            case 'kelas': filteredData.sort((a, b) => a.kelas.localeCompare(b.kelas)); break;
            case 'jenis_kelamin': filteredData.sort((a, b) => a.jenis_kelamin.localeCompare(b.jenis_kelamin)); break;
            case 'status': filteredData.sort((a, b) => b.poin_akumulasi - a.poin_akumulasi); break;
        }

        tableBodySiswa.innerHTML = '';
        if (filteredData.length === 0) {
            tableBodySiswa.innerHTML = '<tr><td colspan="12" style="text-align:center;">Data tidak ditemukan</td></tr>';
            return;
        }

        filteredData.forEach((siswa, index) => {
            const status = getStatus(siswa.poin_akumulasi);
            tableBodySiswa.innerHTML += `
                <tr data-id="${siswa.id}">
                    <td>${index + 1}</td><td>${siswa.nis}</td><td>${siswa.password}</td><td>${siswa.nama}</td>
                    <td><span class="chip chip-kelas">${siswa.kelas}</span></td><td>${siswa.hp}</td>
                    <td><span class="chip ${siswa.jenis_kelamin === 'L' ? 'chip-l' : 'chip-p'}">${siswa.jenis_kelamin}</span></td>
                    <td><span class="chip chip-pelanggaran">${siswa.poin_pelanggaran}</span></td>
                    <td><span class="chip chip-penghargaan">${siswa.poin_penghargaan}</span></td>
                    <td><span class="chip chip-akumulasi">${siswa.poin_akumulasi}</span></td>
                    <td><span class="chip ${status.className}">${status.text}</span></td>
                    <td>
                        <div class="action-dropdown">
                            <button class="action-btn">Aksi <span class="arrow-down"></span></button>
                            <div class="dropdown-content"><a href="#" class="edit-btn">Edit</a><a href="#" class="delete-btn">Delete</a></div>
                        </div>
                    </td>
                </tr>`;
        });
    }

    if (tableBodySiswa) {
        tableBodySiswa.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-btn')) {
                const siswaId = e.target.closest('tr').dataset.id;
                const siswa = siswaData.find(s => s.id == siswaId);
                document.getElementById('edit-id-siswa').value = siswa.id;
                document.getElementById('edit-password-siswa').value = siswa.password;
                document.getElementById('edit-nama-siswa').value = siswa.nama;
                document.getElementById('edit-kelas-siswa').value = siswa.kelas;
                document.getElementById('edit-gender-siswa').value = siswa.jenis_kelamin;
                document.getElementById('edit-hp-siswa').value = siswa.hp;
                openModal('edit-modal-siswa');
            }
             if (e.target.classList.contains('delete-btn')) {
                const siswaId = e.target.closest('tr').dataset.id;
                const index = siswaData.findIndex(s => s.id == siswaId);
                if (confirm(`Anda yakin ingin menghapus data siswa ID ${siswaId}? Tindakan ini tidak dapat dibatalkan.`)) {
                    siswaData.splice(index, 1);
                    
                    // Filter out related data (Pelanggaran/Penghargaan, if added later)
                    // For now, only filter riwayatPelanggaranData
                    riwayatPelanggaranData = riwayatPelanggaranData.filter(r => r.siswaId != siswaId);
                    
                    recalculateSiswaPoin();
                    renderSiswaTable();
                    renderPelanggaranSiswaTable();
                    renderStatistikTable();
                }
            }
        });
    }

    if (editFormSiswa) {
        editFormSiswa.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-id-siswa').value;
            const updatedSiswa = {
                id: parseInt(id),
                nis: siswaData.find(s => s.id == id).nis, 
                password: document.getElementById('edit-password-siswa').value,
                nama: document.getElementById('edit-nama-siswa').value,
                kelas: document.getElementById('edit-kelas-siswa').value,
                hp: document.getElementById('edit-hp-siswa').value,
                jenis_kelamin: document.getElementById('edit-gender-siswa').value,
                // Pastikan poin tidak diubah dari form edit siswa
                poin_pelanggaran: siswaData.find(s => s.id == id).poin_pelanggaran, 
                poin_penghargaan: siswaData.find(s => s.id == id).poin_penghargaan, 
                poin_akumulasi: siswaData.find(s => s.id == id).poin_akumulasi, 
            };
            const index = siswaData.findIndex(s => s.id == id);
            siswaData[index] = updatedSiswa;
            
            recalculateSiswaPoin(); 
            renderSiswaTable();
            closeModal('edit-modal-siswa');
        });
    }

    

    // LOGIKA TAMBAH SISWA
    if (addFormSiswa) {
        addFormSiswa.addEventListener('submit', (e) => {
            e.preventDefault();

            const newId = siswaData.length > 0 ? Math.max(...siswaData.map(s => s.id)) + 1 : 1;
            const newNis = document.getElementById('add-nis-siswa').value;
            const newPassword = document.getElementById('add-password-siswa').value;
            const newNama = document.getElementById('add-nama-siswa').value;
            const newKelas = document.getElementById('add-kelas-siswa').value;
            const newHp = document.getElementById('add-hp-siswa').value;
            const newGender = document.getElementById('add-gender-siswa').value;
            
             if (siswaData.some(s => s.nis === newNis)) {
                alert("NIS sudah terdaftar. Gunakan NIS lain.");
                return;
            }

            const newSiswa = {
                id: newId,
                nis: newNis,
                password: newPassword,
                nama: newNama,
                kelas: newKelas,
                hp: newHp,
                jenis_kelamin: newGender,
                poin_pelanggaran: 0, 
                poin_penghargaan: 0, 
                poin_akumulasi: 0, 
            };

            siswaData.push(newSiswa);
            recalculateSiswaPoin(); 
            renderSiswaTable();
            closeModal('add-modal-siswa');
            addFormSiswa.reset(); 
        });
    }

    // ========================= DATA GURU LOGIC ===========================
    const tableBodyGuru = document.querySelector('#guru-table tbody');
    const searchBarGuru = document.getElementById('search-bar-guru');
    const sortSelectGuru = document.getElementById('sort-select-guru');
    const filterGenderGuru = document.getElementById('filter-gender-guru');
    const editFormGuru = document.getElementById('edit-form-guru');
    const addFormGuru = document.getElementById('add-form-guru');

    function renderGuruTable() {
        if (!tableBodyGuru) return;
        let filteredData = [...guruData];
        const searchTerm = searchBarGuru.value.toLowerCase();
        const sortValue = sortSelectGuru.value;
        const filterGender = filterGenderGuru.value;

        if (searchTerm) {
            filteredData = filteredData.filter(g => g.nama.toLowerCase().includes(searchTerm) || g.nip.includes(searchTerm));
        }
        if (filterGender !== 'all') {
            filteredData = filteredData.filter(g => g.jenis_kelamin === filterGender);
        }

        if (sortValue === 'az') {
            filteredData.sort((a, b) => a.nama.localeCompare(b.nama));
        } else if (sortValue === 'jenis_kelamin') {
            filteredData.sort((a, b) => a.jenis_kelamin.localeCompare(b.jenis_kelamin));
        }

        tableBodyGuru.innerHTML = '';
        if (filteredData.length === 0) {
            tableBodyGuru.innerHTML = '<tr><td colspan="7" style="text-align:center;">Data tidak ditemukan</td></tr>';
            return;
        }

        filteredData.forEach((guru, index) => {
            tableBodyGuru.innerHTML += `
                <tr data-id="${guru.id}">
                    <td>${index + 1}</td><td>${guru.nip}</td><td>${guru.password}</td><td>${guru.nama}</td><td>${guru.hp}</td>
                    <td><span class="chip ${guru.jenis_kelamin === 'L' ? 'chip-l' : 'chip-p'}">${guru.jenis_kelamin}</span></td>
                    <td>
                        <div class="action-dropdown">
                            <button class="action-btn">Aksi <span class="arrow-down"></span></button>
                            <div class="dropdown-content"><a href="#" class="edit-btn">Edit</a><a href="#" class="delete-btn">Delete</a></div>
                        </div>
                    </td>
                </tr>`;
        });
    }

    if (tableBodyGuru) {
        tableBodyGuru.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-btn')) {
                const guruId = e.target.closest('tr').dataset.id;
                const guru = guruData.find(g => g.id == guruId);
                document.getElementById('edit-id-guru').value = guru.id;
                document.getElementById('edit-password-guru').value = guru.password;
                document.getElementById('edit-nama-guru').value = guru.nama;
                document.getElementById('edit-gender-guru').value = guru.jenis_kelamin;
                document.getElementById('edit-hp-guru').value = guru.hp;
                openModal('edit-modal-guru');
            }
             if (e.target.classList.contains('delete-btn')) {
                const guruId = e.target.closest('tr').dataset.id;
                const index = guruData.findIndex(g => g.id == guruId);
                 if (confirm(`Anda yakin ingin menghapus data guru ID ${guruId}? Tindakan ini tidak dapat dibatalkan.`)) {
                    guruData.splice(index, 1);
                    renderGuruTable();
                }
            }
        });
    }

    if (editFormGuru) {
        editFormGuru.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-id-guru').value;
            const updatedGuru = {
                id: parseInt(id),
                nip: guruData.find(g => g.id == id).nip, 
                password: document.getElementById('edit-password-guru').value,
                nama: document.getElementById('edit-nama-guru').value,
                hp: document.getElementById('edit-hp-guru').value,
                jenis_kelamin: document.getElementById('edit-gender-guru').value,
            };
            const index = guruData.findIndex(g => g.id == id);
            guruData[index] = updatedGuru;
            renderGuruTable();
            closeModal('edit-modal-guru');
        });
    }

    // LOGIKA TAMBAH GURU
    if (addFormGuru) {
        addFormGuru.addEventListener('submit', (e) => {
            e.preventDefault();

            const newId = guruData.length > 0 ? Math.max(...guruData.map(g => g.id)) + 1 : 1;
            const newNip = document.getElementById('add-nip-guru').value;
            const newPassword = document.getElementById('add-password-guru').value;
            const newNama = document.getElementById('add-nama-guru').value;
            const newHp = document.getElementById('add-hp-guru').value;
            const newGender = document.getElementById('add-gender-guru').value;
            
             if (guruData.some(g => g.nip === newNip)) {
                alert("NIP sudah terdaftar. Gunakan NIP lain.");
                return;
            }

            const newGuru = {
                id: newId,
                nip: newNip,
                password: newPassword,
                nama: newNama,
                hp: newHp,
                jenis_kelamin: newGender,
            };

            guruData.push(newGuru);
            renderGuruTable();
            closeModal('add-modal-guru');
            addFormGuru.reset(); 
        });
    }

    // ======================= DATA ADMIN LOGIC ============================
    const tableBodyAdmin = document.querySelector('#admin-table tbody');
    const searchBarAdmin = document.getElementById('search-bar-admin');
    const sortSelectAdmin = document.getElementById('sort-select-admin');
    const filterGenderAdmin = document.getElementById('filter-gender-admin');
    const editFormAdmin = document.getElementById('edit-form-admin');
    const addFormAdmin = document.getElementById('add-form-admin');

    function renderAdminTable() {
        if (!tableBodyAdmin) return;
        let filteredData = [...adminData];
        const searchTerm = searchBarAdmin.value.toLowerCase();
        const sortValue = sortSelectAdmin.value;
        const filterGender = filterGenderAdmin.value;

        if (searchTerm) {
            filteredData = filteredData.filter(a => a.nama.toLowerCase().includes(searchTerm) || a.nip.includes(searchTerm));
        }
        if (filterGender !== 'all') {
            filteredData = filteredData.filter(a => a.jenis_kelamin === filterGender);
        }

        if (sortValue === 'az') {
            filteredData.sort((a, b) => a.nama.localeCompare(b.nama));
        } else if (sortValue === 'jenis_kelamin') {
            filteredData.sort((a, b) => a.jenis_kelamin.localeCompare(b.jenis_kelamin));
        }

        tableBodyAdmin.innerHTML = '';
        if (filteredData.length === 0) {
            tableBodyAdmin.innerHTML = '<tr><td colspan="7" style="text-align:center;">Data tidak ditemukan</td></tr>';
            return;
        }

        filteredData.forEach((admin, index) => {
            tableBodyAdmin.innerHTML += `
                <tr data-id="${admin.id}">
                    <td>${index + 1}</td><td>${admin.nip}</td><td>${admin.password}</td><td>${admin.nama}</td><td>${admin.hp}</td>
                    <td><span class="chip ${admin.jenis_kelamin === 'L' ? 'chip-l' : 'chip-p'}">${admin.jenis_kelamin}</span></td>
                    <td>
                        <div class="action-dropdown">
                            <button class="action-btn">Aksi <span class="arrow-down"></span></button>
                            <div class="dropdown-content"><a href="#" class="edit-btn">Edit</a><a href="#" class="delete-btn">Delete</a></div>
                        </div>
                    </td>
                </tr>`;
        });
    }

    if (tableBodyAdmin) {
        tableBodyAdmin.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-btn')) {
                const adminId = e.target.closest('tr').dataset.id;
                const admin = adminData.find(a => a.id == adminId);
                document.getElementById('edit-id-admin').value = admin.id;
                document.getElementById('edit-password-admin').value = admin.password;
                document.getElementById('edit-nama-admin').value = admin.nama;
                document.getElementById('edit-gender-admin').value = admin.jenis_kelamin;
                document.getElementById('edit-hp-admin').value = admin.hp;
                openModal('edit-modal-admin');
            }
             if (e.target.classList.contains('delete-btn')) {
                const adminId = e.target.closest('tr').dataset.id;
                const index = adminData.findIndex(a => a.id == adminId);
                 if (confirm(`Anda yakin ingin menghapus data admin ID ${adminId}? Tindakan ini tidak dapat dibatalkan.`)) {
                    adminData.splice(index, 1);
                    renderAdminTable();
                }
            }
        });
    }

    if (editFormAdmin) {
        editFormAdmin.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-id-admin').value;
            const updatedAdmin = {
                id: parseInt(id),
                nip: adminData.find(a => a.id == id).nip, 
                password: document.getElementById('edit-password-admin').value,
                nama: document.getElementById('edit-nama-admin').value,
                hp: document.getElementById('edit-hp-admin').value,
                jenis_kelamin: document.getElementById('edit-gender-admin').value,
            };
            const index = adminData.findIndex(a => a.id == id);
            adminData[index] = updatedAdmin;
            renderAdminTable();
            closeModal('edit-modal-admin');
        });
    }

    // LOGIKA TAMBAH ADMIN
    if (addFormAdmin) {
        addFormAdmin.addEventListener('submit', (e) => {
            e.preventDefault();

            const newId = adminData.length > 0 ? Math.max(...adminData.map(a => a.id)) + 1 : 1;
            const newNip = document.getElementById('add-nip-admin').value;
            const newPassword = document.getElementById('add-password-admin').value;
            const newNama = document.getElementById('add-nama-admin').value;
            const newHp = document.getElementById('add-hp-admin').value;
            const newGender = document.getElementById('add-gender-admin').value;
            
             if (adminData.some(a => a.nip === newNip)) {
                alert("NIP sudah terdaftar. Gunakan NIP lain.");
                return;
            }

            const newAdmin = {
                id: newId,
                nip: newNip,
                password: newPassword,
                nama: newNama,
                hp: newHp,
                jenis_kelamin: newGender,
            };

            adminData.push(newAdmin);
            renderAdminTable();
            closeModal('add-modal-admin');
            addFormAdmin.reset(); 
        });
    }

    // ====================== DATA PELANGGARAN LOGIC =======================
    const tableBodyPelanggaran = document.querySelector('#pelanggaran-table tbody');
    const searchBarPelanggaran = document.getElementById('search-bar-pelanggaran');
    const sortSelectPelanggaran = document.getElementById('sort-select-pelanggaran');
    const editFormPelanggaran = document.getElementById('edit-form-pelanggaran');
    const addFormPelanggaran = document.getElementById('add-form-pelanggaran');

    function renderPelanggaranTable() {
        if (!tableBodyPelanggaran) return;
        let filteredData = [...pelanggaranData];
        const searchTerm = searchBarPelanggaran.value.toLowerCase();
        const sortValue = sortSelectPelanggaran.value;

        if (searchTerm) {
            filteredData = filteredData.filter(p => p.nama.toLowerCase().includes(searchTerm));
        }

        switch (sortValue) {
            case 'az': filteredData.sort((a, b) => a.nama.localeCompare(b.nama)); break;
            case 'poin-tertinggi': filteredData.sort((a, b) => b.poin - a.poin); break;
            case 'poin-terendah': filteredData.sort((a, b) => a.poin - b.poin); break;
        }

        tableBodyPelanggaran.innerHTML = '';
        if (filteredData.length === 0) {
            tableBodyPelanggaran.innerHTML = '<tr><td colspan="4" style="text-align:center;">Data tidak ditemukan</td></tr>';
            return;
        }

        filteredData.forEach((p, index) => {
            tableBodyPelanggaran.innerHTML += `
                <tr data-id="${p.id}">
                    <td>${index + 1}</td><td>${p.nama}</td>
                    <td><span class="chip chip-pelanggaran">${p.poin}</span></td>
                    <td>
                        <div class="action-dropdown">
                            <button class="action-btn">Aksi <span class="arrow-down"></span></button>
                            <div class="dropdown-content"><a href="#" class="edit-btn">Edit</a><a href="#" class="delete-btn">Delete</a></div>
                        </div>
                    </td>
                </tr>`;
        });
    }

    if (tableBodyPelanggaran) {
        tableBodyPelanggaran.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-btn')) {
                const pelanggaranId = e.target.closest('tr').dataset.id;
                const pelanggaran = pelanggaranData.find(p => p.id == pelanggaranId);
                document.getElementById('edit-id-pelanggaran').value = pelanggaran.id;
                document.getElementById('edit-nama-pelanggaran').value = pelanggaran.nama;
                document.getElementById('edit-poin-pelanggaran').value = pelanggaran.poin;
                openModal('edit-modal-pelanggaran');
            }
             if (e.target.classList.contains('delete-btn')) {
                const pelanggaranId = e.target.closest('tr').dataset.id;
                const index = pelanggaranData.findIndex(p => p.id == pelanggaranId);
                 if (confirm(`Anda yakin ingin menghapus data pelanggaran ID ${pelanggaranId}? Semua riwayat terkait akan tetap ada, tetapi tidak akan merujuk ke nama pelanggaran ini.`)) {
                    pelanggaranData.splice(index, 1);
                    recalculateSiswaPoin(); // Poin siswa tidak terpengaruh, tetapi render perlu diperbarui
                    renderPelanggaranTable();
                    renderSiswaTable();
                    renderPelanggaranSiswaTable();
                }
            }
        });
    }

    if (editFormPelanggaran) {
        editFormPelanggaran.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-id-pelanggaran').value;
            const updatedPelanggaran = {
                id: parseInt(id),
                nama: document.getElementById('edit-nama-pelanggaran').value,
                poin: parseInt(document.getElementById('edit-poin-pelanggaran').value),
            };
            const index = pelanggaranData.findIndex(p => p.id == id);
            pelanggaranData[index] = updatedPelanggaran;
            
            // Perlu update semua tabel setelah data pelanggaran diubah
            recalculateSiswaPoin(); // Poin siswa dipengaruhi
            renderPelanggaranTable();
            renderSiswaTable();
            renderPelanggaranSiswaTable();
            
            closeModal('edit-modal-pelanggaran');
        });
    }

    // LOGIKA TAMBAH PELANGGARAN
    if (addFormPelanggaran) {
        addFormPelanggaran.addEventListener('submit', (e) => {
            e.preventDefault();

            const newId = pelanggaranData.length > 0 ? Math.max(...pelanggaranData.map(p => p.id)) + 1 : 1;
            const newNama = document.getElementById('add-nama-pelanggaran').value;
            const newPoin = parseInt(document.getElementById('add-poin-pelanggaran').value);

            const newPelanggaran = {
                id: newId,
                nama: newNama,
                poin: newPoin,
            };

            pelanggaranData.push(newPelanggaran);
            
            recalculateSiswaPoin();
            renderPelanggaranTable();
            renderSiswaTable();
            renderPelanggaranSiswaTable();

            closeModal('add-modal-pelanggaran');
            addFormPelanggaran.reset(); 
        });
    }

    // ====================== PELANGGARAN SISWA LOGIC =======================
    const tableBodyPelanggaranSiswa = document.querySelector('#pelanggaran-siswa-table tbody');
    const searchBarPelanggaranSiswa = document.getElementById('search-bar-pelanggaran-siswa');
    const filterKelasPelanggaranSiswa = document.getElementById('filter-kelas-pelanggaran-siswa');
    const filterGenderPelanggaranSiswa = document.getElementById('filter-gender-pelanggaran-siswa');
    const filterJenisPelanggaranSiswa = document.getElementById('filter-jenis-pelanggaran-siswa');
    const editFormPelanggaranSiswa = document.getElementById('edit-form-pelanggaran-siswa');
    const editJenisPelanggaranSelect = document.getElementById('edit-nama-pelanggaran-selected');
    const editPoinPelanggaranSiswa = document.getElementById('edit-poin-pelanggaran-siswa');
    const editGuruPelanggaranSelect = document.getElementById('edit-guru-pelanggaran-selected');

    function populatePelanggaranSiswaFilters() {
        if (!filterKelasPelanggaranSiswa || !filterJenisPelanggaranSiswa) return;

        // Populate Kelas Filter (from siswaData)
        const kelas = [...new Set(siswaData.map(s => s.kelas))];
        filterKelasPelanggaranSiswa.innerHTML = '<option value="all">Semua Kelas</option>';
        kelas.sort().forEach(k => filterKelasPelanggaranSiswa.innerHTML += `<option value="${k}">${k}</option>`);

        // Populate Jenis Pelanggaran Filter and Edit Modal Dropdown (from pelanggaranData)
        filterJenisPelanggaranSiswa.innerHTML = '<option value="all">Semua Pelanggaran</option>';
        editJenisPelanggaranSelect.innerHTML = '';
        pelanggaranData.forEach(p => {
            filterJenisPelanggaranSiswa.innerHTML += `<option value="${p.id}">${p.nama}</option>`;
            editJenisPelanggaranSelect.innerHTML += `<option value="${p.id}" data-poin="${p.poin}">${p.nama} (${p.poin} Poin)</option>`;
        });

        // Populate Guru Pelapor Dropdown
        editGuruPelanggaranSelect.innerHTML = '';
        guruData.forEach(g => {
            editGuruPelanggaranSelect.innerHTML += `<option value="${g.id}">${g.nama}</option>`;
        });
    }
    
    // Fungsi untuk mendapatkan data lengkap riwayat pelanggaran (Join Siswa + Pelanggaran + Guru)
    function getFullRiwayatData() {
        return riwayatPelanggaranData.map(r => {
            const siswa = siswaData.find(s => s.id === r.siswaId) || {};
            const pelanggaran = pelanggaranData.find(p => p.id === r.pelanggaranId) || {};
            const guru = guruData.find(g => g.id === r.guruId) || {};
            return {
                ...r,
                nis: siswa.nis || 'N/A',
                namaSiswa: siswa.nama || 'N/A',
                kelas: siswa.kelas || 'N/A',
                jenisKelamin: siswa.jenis_kelamin || 'N/A',
                namaPelanggaran: pelanggaran.nama || 'N/A',
                poin: r.poin, // Pastikan poin diambil dari riwayat, bukan dari data pelanggaran
                namaGuru: guru.nama || 'N/A',
            };
        });
    }

    function renderPelanggaranSiswaTable() {
        if (!tableBodyPelanggaranSiswa) return;
        
        let filteredData = getFullRiwayatData();

        const searchTerm = searchBarPelanggaranSiswa.value.toLowerCase();
        const filterKelas = filterKelasPelanggaranSiswa.value;
        const filterGender = filterGenderPelanggaranSiswa.value;
        const filterJenisPelanggaran = filterJenisPelanggaranSiswa.value;

        // Apply Search
        if (searchTerm) {
            filteredData = filteredData.filter(r => 
                r.namaSiswa.toLowerCase().includes(searchTerm) || 
                r.nis.includes(searchTerm) ||
                r.namaPelanggaran.toLowerCase().includes(searchTerm)
            );
        }

        // Apply Filters
        if (filterKelas !== 'all') {
            filteredData = filteredData.filter(r => r.kelas === filterKelas);
        }
        if (filterGender !== 'all') {
            filteredData = filteredData.filter(r => r.jenisKelamin === filterGender);
        }
        if (filterJenisPelanggaran !== 'all') {
            filteredData = filteredData.filter(r => r.pelanggaranId == filterJenisPelanggaran);
        }

        // Urutkan berdasarkan ID (terbaru di atas)
        filteredData.sort((a, b) => b.id - a.id); 

        tableBodyPelanggaranSiswa.innerHTML = '';
        if (filteredData.length === 0) {
            tableBodyPelanggaranSiswa.innerHTML = '<tr><td colspan="10" style="text-align:center;">Data tidak ditemukan</td></tr>';
            return;
        }

        filteredData.forEach((r, index) => {
            tableBodyPelanggaranSiswa.innerHTML += `
                <tr data-id="${r.id}">
                    <td>${index + 1}</td>
                    <td>${r.nis}</td>
                    <td>${r.namaSiswa}</td>
                    <td><span class="chip ${r.jenisKelamin === 'L' ? 'chip-l' : 'chip-p'}">${r.jenisKelamin}</span></td>
                    <td><span class="chip chip-kelas">${r.kelas}</span></td>
                    <td>${r.namaPelanggaran}</td>
                    <td>${r.tanggal}</td> <td><span class="chip chip-pelanggaran">${r.poin}</span></td>
                    <td>${r.namaGuru}</td>
                    <td>
                        <div class="action-dropdown">
                            <button class="action-btn">Aksi <span class="arrow-down"></span></button>
                            <div class="dropdown-content"><a href="#" class="edit-pelanggaran-siswa-btn">Edit</a><a href="#" class="delete-pelanggaran-siswa-btn">Hapus</a></div>
                        </div>
                    </td>
                </tr>`;
        });
    }

    // Event listener untuk membuka Modal Edit Pelanggaran Siswa
    if (tableBodyPelanggaranSiswa) {
        tableBodyPelanggaranSiswa.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-pelanggaran-siswa-btn')) {
                const riwayatId = e.target.closest('tr').dataset.id;
                const riwayat = getFullRiwayatData().find(r => r.id == riwayatId);
                
                document.getElementById('edit-id-pelanggaran-siswa').value = riwayat.id;
                document.getElementById('edit-nama-siswa-pelanggaran').value = riwayat.namaSiswa;
                document.getElementById('edit-kelas-siswa-pelanggaran').value = riwayat.kelas;
                
                document.getElementById('edit-nama-pelanggaran-selected').value = riwayat.pelanggaranId;
                
                // Set nilai poin
                editPoinPelanggaranSiswa.value = riwayat.poin;
                editPoinPelanggaranSiswa.disabled = false; // Buka kunci sementara untuk nilai

                // Set dropdown Guru Pelapor
                editGuruPelanggaranSelect.value = riwayat.guruId;

                openModal('edit-modal-pelanggaran-siswa');
            }
             if (e.target.classList.contains('delete-pelanggaran-siswa-btn')) {
                const riwayatId = e.target.closest('tr').dataset.id;
                const index = riwayatPelanggaranData.findIndex(r => r.id == riwayatId);
                 if (confirm(`Anda yakin ingin menghapus riwayat pelanggaran ID ${riwayatId} ini? Poin siswa akan dihitung ulang.`)) {
                    riwayatPelanggaranData.splice(index, 1);
                    recalculateSiswaPoin();
                    renderPelanggaranSiswaTable();
                    renderSiswaTable();
                    renderStatistikTable();
                }
            }
        });
    }

    // Event listener untuk update poin saat jenis pelanggaran diubah di modal edit
    if (editJenisPelanggaranSelect) {
        editJenisPelanggaranSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const defaultPoin = selectedOption.getAttribute('data-poin'); 
            editPoinPelanggaranSiswa.value = defaultPoin;
        });
    }

    // Event listener untuk menyimpan Edit Pelanggaran Siswa
    if (editFormPelanggaranSiswa) {
        editFormPelanggaranSiswa.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const id = document.getElementById('edit-id-pelanggaran-siswa').value;
            const newPelanggaranId = parseInt(document.getElementById('edit-nama-pelanggaran-selected').value);
            const newPoin = parseInt(editPoinPelanggaranSiswa.value);
            const newGuruId = parseInt(editGuruPelanggaranSelect.value); 
            
            const indexRiwayat = riwayatPelanggaranData.findIndex(r => r.id == id);
            const oldRiwayat = riwayatPelanggaranData[indexRiwayat];
            
            // Update riwayat pelanggaran
            riwayatPelanggaranData[indexRiwayat] = {
                ...oldRiwayat,
                pelanggaranId: newPelanggaranId,
                poin: newPoin,
                guruId: newGuruId, 
            };
            
            // PENTING: Hitung ulang poin siswa dan render semua tabel yang terpengaruh
            recalculateSiswaPoin(); 
            renderPelanggaranSiswaTable();
            renderSiswaTable(); 
            renderStatistikTable(); 
            
            closeModal('edit-modal-pelanggaran-siswa');
        });
    }
    
    // ====================== LAPORAN GURU TATIB LOGIC =======================
    const laporanGuruList = document.getElementById('laporan-guru-list');

    function renderLaporanGuruTatib() {
        if (!laporanGuruList) return;

        const fullRiwayat = getFullRiwayatData();
        // Urutkan berdasarkan ID (terbaru di atas)
        fullRiwayat.sort((a, b) => b.id - a.id); 

        laporanGuruList.innerHTML = '';

        if (fullRiwayat.length === 0) {
            laporanGuruList.innerHTML = '<p style="text-align:center; color:#888;">Belum ada laporan pelanggaran tercatat.</p>';
            return;
        }

        fullRiwayat.forEach(r => {
            const tindakLanjutText = r.tindakLanjut ? 'Sudah Ditindaklanjuti' : 'Menunggu Tindak Lanjut';
            const tindakLanjutChip = r.tindakLanjut ? 'chip-aman' : 'chip-tindak-lanjut';
            const formattedDate = new Date(r.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
            
            // Menggunakan template visual yang mirip dengan gambar
            laporanGuruList.innerHTML += `
                <div class="report-card">
                    <h3>${r.namaPelanggaran}</h3>
                    <span class="report-meta">Tanggal: ${formattedDate}</span>
                    <p class="report-desc">Siswa: ${r.namaSiswa} (${r.kelas}). Poin: ${r.poin}</p>
                    <div class="report-footer">
                        <span class="guru-name">${r.namaGuru}</span>
                        <span class="chip chip-pelanggaran">${r.poin} Poin</span>
                        <span class="chip ${tindakLanjutChip}">${tindakLanjutText}</span>
                    </div>
                </div>
            `;
        });
    }

    // ====================== STATISTIK LOGIC =======================
    const filterKelasStatistik = document.getElementById('filter-kelas-statistik');
    const statistikTableBody = document.querySelector('#statistik-table tbody');

    function populateStatistikFilters() {
        if (!filterKelasStatistik) return;
        const kelas = [...new Set(siswaData.map(s => s.kelas))].sort();
        filterKelasStatistik.innerHTML = '<option value="all">Semua Kelas</option>';
        kelas.forEach(k => filterKelasStatistik.innerHTML += `<option value="${k}">${k}</option>`);
    }

    function calculateStatistikPerKelas() {
        const stats = {};
        const allKelas = [...new Set(siswaData.map(s => s.kelas))].sort();

        // Inisialisasi statistik untuk setiap kelas
        allKelas.forEach(kelas => {
            stats[kelas] = {
                jumlahPelanggaran: 0,
                poinPelanggaran: 0,
                poinPenghargaan: 0,
                totalSiswa: 0
            };
        });

        // Hitung total poin dan jumlah siswa
        siswaData.forEach(siswa => {
            if (stats[siswa.kelas]) {
                stats[siswa.kelas].poinPelanggaran += siswa.poin_pelanggaran;
                stats[siswa.kelas].poinPenghargaan += siswa.poin_penghargaan;
                stats[siswa.kelas].totalSiswa += 1;
            }
        });

        // Hitung jumlah pelanggaran dari riwayatPelanggaranData
        riwayatPelanggaranData.forEach(riwayat => {
            const siswa = siswaData.find(s => s.id === riwayat.siswaId);
            if (siswa && stats[siswa.kelas]) {
                stats[siswa.kelas].jumlahPelanggaran += 1;
            }
        });

        return stats;
    }

    function renderStatistikTable() {
        if (!statistikTableBody) return;
        const statsData = calculateStatistikPerKelas();
        const filterKelas = filterKelasStatistik.value;
        let index = 1;

        statistikTableBody.innerHTML = '';

        for (const kelas in statsData) {
            if (filterKelas === 'all' || filterKelas === kelas) {
                const data = statsData[kelas];
                // Hanya tampilkan baris yang memiliki data
                if (data.poinPelanggaran > 0 || data.poinPenghargaan > 0 || data.jumlahPelanggaran > 0 || data.totalSiswa > 0) {
                    statistikTableBody.innerHTML += `
                        <tr>
                            <td>${index++}</td>
                            <td><span class="chip chip-kelas">${kelas}</span></td>
                            <td>${data.jumlahPelanggaran}</td>
                            <td><span class="chip chip-pelanggaran">${data.poinPelanggaran}</span></td>
                            <td><span class="chip chip-penghargaan">${data.poinPenghargaan}</span></td>
                        </tr>
                    `;
                }
            }
        }

        if (index === 1) {
             statistikTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Tidak ada data statistik untuk ditampilkan.</td></tr>';
        }
    }
    
    // ====================== INITIALIZATION LOGIC =======================
    
    setupDropdowns();
    setupModals();
    populateKelasDropdown('add-kelas-siswa');
    populateKelasDropdown('edit-kelas-siswa');
    
    // Event listener untuk filter Statistik
    if (filterKelasStatistik) filterKelasStatistik.addEventListener('change', renderStatistikTable);

    // ========================= EVENT LISTENERS ===========================
    if (searchBarSiswa) searchBarSiswa.addEventListener('input', renderSiswaTable);
    if (sortSelectSiswa) sortSelectSiswa.addEventListener('change', renderSiswaTable);
    if (filterKelasSiswa) filterKelasSiswa.addEventListener('change', renderSiswaTable);
    if (filterGenderSiswa) filterGenderSiswa.addEventListener('change', renderSiswaTable);
    if (filterStatusSiswa) filterStatusSiswa.addEventListener('change', renderSiswaTable);

    if (searchBarGuru) searchBarGuru.addEventListener('input', renderGuruTable);
    if (sortSelectGuru) sortSelectGuru.addEventListener('change', renderGuruTable);
    if (filterGenderGuru) filterGenderGuru.addEventListener('change', renderGuruTable);

    if (searchBarAdmin) searchBarAdmin.addEventListener('input', renderAdminTable);
    if (sortSelectAdmin) sortSelectAdmin.addEventListener('change', renderAdminTable);
    if (filterGenderAdmin) filterGenderAdmin.addEventListener('change', renderAdminTable);

    if (searchBarPelanggaran) searchBarPelanggaran.addEventListener('input', renderPelanggaranTable);
    if (sortSelectPelanggaran) sortSelectPelanggaran.addEventListener('change', renderPelanggaranTable);

    // Event listener untuk Filter dan Search Pelanggaran Siswa
    if (searchBarPelanggaranSiswa) searchBarPelanggaranSiswa.addEventListener('input', renderPelanggaranSiswaTable);
    if (filterKelasPelanggaranSiswa) filterKelasPelanggaranSiswa.addEventListener('change', renderPelanggaranSiswaTable);
    if (filterGenderPelanggaranSiswa) filterGenderPelanggaranSiswa.addEventListener('change', renderPelanggaranSiswaTable);
    if (filterJenisPelanggaranSiswa) filterJenisPelanggaranSiswa.addEventListener('change', renderPelanggaranSiswaTable);

    
    // Default view on load
    if (document.querySelector('.menu-item.overview')) {
        document.querySelector('.menu-item.overview').click();
    } 
});