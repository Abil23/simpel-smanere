// siswa.js

// IMPOR DATA DARI db.js
import { siswaData, guruData, adminData, riwayatPelanggaranData, pelanggaranData, recalculateSiswaPoin } from "./db.js";

document.addEventListener('DOMContentLoaded', () => {

    // Lakukan perhitungan poin awal
    recalculateSiswaPoin();

    // --- DOM Element Selection ---
    const loginForm = document.getElementById('loginForm');
    const loginCard = document.getElementById('logincard');
    const siswaDashboard = document.getElementById('siswaDashboard');
    const notification = document.getElementById('notification');
    const logoutConfirmOverlay = document.getElementById('logout-confirm-overlay');
    const confirmYesBtn = document.getElementById('confirm-yes-btn');
    const confirmNoBtn = document.getElementById('confirm-no-btn');

    // Dashboard Elements
    const siswaName = document.getElementById('siswaName');
    const welcomeText = document.querySelector('.w-text');
    const userPoint = document.querySelector('.user-point');
    const userStatus = document.querySelector('.user-status');
    const stPenghargaan = document.querySelector('.st-penghargaan');
    const stPoin = document.querySelector('.st-poin');
    const stLanggar = document.querySelector('.st-langgar');
    const riwayatTbody = document.querySelector('.riwayat-card tbody');

    // Profile Elements
    const profilName = document.getElementById('profil-name');
    const profilClass = document.getElementById('profil-class');
    const profilDob = document.getElementById('profil-dob');
    const profilGender = document.getElementById('profil-gender');
    const profilUsername = document.getElementById('profil-username');
    const profilPassword = document.getElementById('profil-password');
    const showPasswordBtn = document.getElementById('show-password');
    const profilNameDisplay = document.getElementById('profil-name-display');
    const profilClassDisplay = document.getElementById('profil-class-display');
    
    // Dashboard Content Tabs
    const content = {
        info: document.querySelector('.info'),
        hukuman: document.querySelector('.hukuman'),
        informasi: document.querySelector('.Informasi'),
        profilContainer: document.querySelector('.profil-container'),
    };
    
    // --- Helper Functions ---

    /**
     * Shows a notification pop-up with a given message.
     * @param {string} message - The message to display.
     */
    function showNotification(message) {
        notification.textContent = message;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    /**
     * Determines the student's status based on their points.
     * @param {number} points - The student's total points (Pelanggaran - Penghargaan).
     * @returns {object} - An object containing the status text and color information.
     */
    function getStatus(points) {
        if (points >= 125) return { text: 'Dikeluarkan', color: '#fff', bgColor: '#212529' };
        if (points >= 100) return { text: 'SP4', color: '#fff', bgColor: '#8b0000' };
        if (points >= 75) return { text: 'SP3', color: '#fff', bgColor: '#dc3545' };
        if (points >= 50) return { text: 'SP2', color: '#212529', bgColor: '#ff7f0e' };
        if (points >= 25) return { text: 'SP1', color: '#212529', bgColor: '#ffc107' };
        return { text: 'Aman', color: '#fff', bgColor: '#28a745' };
    }
    
    /**
     * Hides all main content sections.
     */
    function hideAllContent() {
        Object.values(content).forEach(item => {
            if (item) item.style.display = 'none';
        });
    }

    /**
     * Shows a specific content section.
     * @param {HTMLElement} contentToShow - The content element to show.
     * @param {string} [displayType='block'] - The CSS display type to apply.
     */
    function showContent(contentToShow, displayType = 'block') {
        if (contentToShow) contentToShow.style.display = displayType;
    }
    
    // Fungsi helper untuk memformat tanggal YYYY-MM-DD ke D MMMM YYYY
    function formatTanggal(dateString) {
        if (!dateString) return '-';
        const parts = dateString.split('-');
        if (parts.length !== 3) return dateString;
        const year = parts[0];
        const month = parseInt(parts[1]);
        const day = parts[2];
        const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        return `${day} ${monthNames[month - 1]} ${year}`;
    }

    /**
     * Memuat data siswa ke dashboard dan profil.
     * @param {object} user - Objek data siswa yang sedang login.
     */
    function populateSiswaDashboard(user) {
        // --- 1. Load Data Poin dan Status ---
        if (siswaName) siswaName.textContent = user.nama;
        if (welcomeText) welcomeText.textContent = `Selamat Datang, ${user.nama}!`;

        const currentPoints = user.poin_akumulasi; 
        if (userPoint) userPoint.textContent = `${currentPoints} Poin`;

        const status = getStatus(currentPoints);
        if (userStatus) {
            userStatus.textContent = status.text;
            userStatus.style.color = status.color;
            userStatus.style.backgroundColor = status.bgColor;
        }

        if (stPenghargaan) stPenghargaan.textContent = user.poin_penghargaan;
        if (stPoin) stPoin.textContent = user.poin_pelanggaran;
        
        const riwayatPelanggaranSiswa = riwayatPelanggaranData.filter(r => r.siswaId === user.id);
        const totalPelanggaran = riwayatPelanggaranSiswa.length;
        if (stLanggar) stLanggar.textContent = totalPelanggaran;

        // --- 2. Update Profile Information ---
        if (profilName) profilName.textContent = user.nama;
        if (profilClass) profilClass.textContent = user.kelas;
        
        // MENGGUNAKAN TANGGAL LAHIR DARI DB.JS
        if (profilDob) profilDob.textContent = formatTanggal(user.tanggal_lahir); 
        
        if (profilGender) profilGender.textContent = user.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan';
        if (profilUsername) profilUsername.textContent = user.nis; 
        if (profilPassword) profilPassword.textContent = '••••••••';

        if (profilNameDisplay) profilNameDisplay.textContent = user.nama;
        if (profilClassDisplay) profilClassDisplay.textContent = user.kelas;
        
        // --- 3. Update Pelanggaran Terakhir ---
        const hukumanCard = document.querySelector('.hukuman-card');

        if (riwayatPelanggaranSiswa.length > 0 && hukumanCard) {
            const sortedRiwayat = [...riwayatPelanggaranSiswa].sort((a, b) => b.id - a.id);
            const lastViolation = sortedRiwayat[0];
            
            const lastPelanggaran = pelanggaranData.find(p => p.id === lastViolation.pelanggaranId);
            const lastGuru = guruData.find(g => g.id === lastViolation.guruId);
            
            hukumanCard.classList.remove('default-message');

            const hukumanCardContent = `
                <div class="sisi-kiri">
                    <h2>${lastPelanggaran ? lastPelanggaran.nama : 'Pelanggaran Tidak Diketahui'}</h2>
                    <p>Tanggal: ${formatTanggal(lastViolation.tanggal)}</p>
                    <p class="hukuman-ket">Lihat riwayat untuk keterangan detail.</p>
                    <p><span class="guru">${lastGuru ? lastGuru.nama : 'N/A'}</span></p>
                </div>
                <div class="sisi-kanan">
                    <span class="hukuman-poin">${lastViolation.poin} Poin</span>
                    <span class="hukuman-status">${lastViolation.tindakLanjut ? 'Selesai' : 'Menunggu Tindak Lanjut'}</span>
                </div>
            `;
            hukumanCard.innerHTML = hukumanCardContent;
            
        } else if (hukumanCard) {
             hukumanCard.classList.add('default-message');
            hukumanCard.innerHTML = `
                <div class="sisi-kiri">
                    <h2 style="color: #6c757d; font-weight: 500;">Tidak ada pelanggaran tercatat!</h2>
                    <p class="hukuman-ket" style="margin-top: 10px;">Anda memiliki rekor yang bersih. Pertahankan terus!</p>
                </div>
            `;
        }


        // --- 4. Populate Riwayat Table ---
        if (riwayatTbody) {
            riwayatTbody.innerHTML = '';
            let historyHtml = '';
            
            riwayatPelanggaranSiswa.sort((a, b) => b.id - a.id);
            
            riwayatPelanggaranSiswa.forEach((r, i) => {
                 const pelanggaran = pelanggaranData.find(p => p.id === r.pelanggaranId);
                 const guru = guruData.find(g => g.id === r.guruId);
                 const statusText = r.tindakLanjut ? 'Selesai' : 'Menunggu';
                 
                 historyHtml += `
                    <tr class="riwayat-row">
                        <th>${i + 1}</th>
                        <th>${formatTanggal(r.tanggal)}</th>
                        <th>${pelanggaran ? pelanggaran.nama : 'N/A'}</th>
                        <th class="riwayat-poin">${r.poin} Poin</th>
                        <th class="riwayat-guru">${guru ? guru.nama : 'N/A'}</th>
                        <th class="riwayat-status">${statusText}</th>
                    </tr>
                `;
            });
            riwayatTbody.innerHTML = historyHtml;
        }
        
        // Default view on login
        hideAllContent();
        if (content.info) showContent(content.info);
    }

    // ====================================================================
    // Implementasi Login Universal
    // ====================================================================
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!username || !password) {
                showNotification('Username dan password harus diisi!');
                return;
            }

            // 1. Cek sebagai Siswa (menggunakan NIS)
            const studentUser = siswaData.find(s => s.nis === username);
            if (studentUser && studentUser.password === password) {
                localStorage.setItem('currentUserType', 'siswa');
                localStorage.setItem('currentUserId', studentUser.id);
                localStorage.setItem('currentUserName', studentUser.nama);
                
                if (loginCard) loginCard.style.display = 'none';
                if (siswaDashboard) siswaDashboard.style.display = 'block';
                populateSiswaDashboard(studentUser);
                return;
            }

            // 2. Cek sebagai Guru (menggunakan NIP)
            const teacherUser = guruData.find(g => g.nip === username);
            if (teacherUser && teacherUser.password === password) {
                localStorage.setItem('currentUserType', 'guru');
                localStorage.setItem('currentUserId', teacherUser.nip);
                localStorage.setItem('currentUserName', teacherUser.nama);
                window.location.href = 'guru.html'; 
                return;
            }

            // 3. Cek sebagai Admin (menggunakan NIP)
            const adminUser = adminData.find(a => a.nip === username);
            if (adminUser && adminUser.password === password) {
                localStorage.setItem('currentUserType', 'admin');
                localStorage.setItem('currentUserId', adminUser.nip);
                localStorage.setItem('currentUserName', adminUser.nama);
                window.location.href = 'admin.html'; 
                return;
            }

            // Gagal Login
            showNotification('Username atau password salah atau tidak terdaftar!');
        });
    }

    // Pengecekan status login saat halaman index.html dimuat
    if (siswaDashboard && loginCard) {
        const userType = localStorage.getItem('currentUserType');
        const userId = localStorage.getItem('currentUserId');
        
        if (userType === 'siswa' && userId) {
            const student = siswaData.find(s => s.id == userId);
            if (student) {
                loginCard.style.display = 'none';
                siswaDashboard.style.display = 'block';
                populateSiswaDashboard(student);
            } else {
                localStorage.clear();
                loginCard.style.display = 'flex';
                siswaDashboard.style.display = 'none';
            }
        } else {
            loginCard.style.display = 'flex';
            siswaDashboard.style.display = 'none';
        }
    }


    // --- Dashboard Navigation ---
    const tabs = {
        overview: document.querySelector('.overview'),
        manage: document.querySelector('.manage'),
        pelanggaran: document.querySelector('.pelanggaran'),
        laporan: document.querySelector('.laporan'),
    };

    if (tabs.overview) {
        tabs.overview.addEventListener('click', () => {
            hideAllContent();
            showContent(content.info);
        });
    }

    if (tabs.manage) {
        tabs.manage.addEventListener('click', () => {
            hideAllContent();
            showContent(content.hukuman, 'block');
        });
    }

    if (tabs.pelanggaran) {
        tabs.pelanggaran.addEventListener('click', () => {
            hideAllContent();
            showContent(content.informasi, 'flex');
        });
    }

    if (tabs.laporan) {
        tabs.laporan.addEventListener('click', () => {
            hideAllContent();
            showContent(content.profilContainer, 'flex');
        });
    }
    
    // --- Logout Functionality ---
    const logoutBtn = document.querySelector('.logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (logoutConfirmOverlay) logoutConfirmOverlay.classList.add('show');
        });
    }

    if (confirmNoBtn) {
        confirmNoBtn.addEventListener('click', () => {
            if (logoutConfirmOverlay) logoutConfirmOverlay.classList.remove('show');
        });
    }

    if (confirmYesBtn) {
        confirmYesBtn.addEventListener('click', () => {
            if (logoutConfirmOverlay) logoutConfirmOverlay.classList.remove('show');

            localStorage.clear();
            
            window.location.href = 'index.html'; 
        });
    }
    
    // Show/Hide Password
    if (showPasswordBtn && profilPassword) {
        showPasswordBtn.addEventListener('click', () => {
             const userId = localStorage.getItem('currentUserId');
             const user = siswaData.find(s => s.id == userId);
             
            if (profilPassword.textContent === '••••••••' && user) {
                profilPassword.textContent = user.password;
                showPasswordBtn.textContent = 'Hide Password';
            } else {
                profilPassword.textContent = '••••••••';
                showPasswordBtn.textContent = 'Show Password';
            }
        });
    }
});