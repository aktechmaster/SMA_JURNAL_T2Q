// --- URL DEPLOYMENT GOOGLE APPS SCRIPT ---
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwi4wU-AyMo5144zyPhNb2YO353BF5GIybtS3Ipwear_CAM9w7umVwp8pkEPPwXJaAFpw/exec"; 

const elKelas = document.getElementById('kelas');
const elPengampu = document.getElementById('pengampu');
const btnLoad = document.getElementById('btnLoad');
const areaList = document.getElementById('student-list-area');
const actionBar = document.getElementById('action-bar');
const countSpan = document.getElementById('count-siswa');

// 1. GET GURU
elKelas.addEventListener('change', function() {
    elPengampu.innerHTML = '<option>⏳ Memuat daftar pengampu...</option>';
    elPengampu.disabled = true;
    btnLoad.style.display = 'none';
    actionBar.style.display = 'none';
    
    areaList.innerHTML = `
        <div style="text-align: center; color: #64748b; padding: 40px 20px; background: #f8fafc; border-radius: 16px; border: 2px dashed #e2e8f0; margin-top: 20px;">
            <i class="fa-solid fa-hand-pointer fa-2x" style="color: #94a3b8; margin-bottom: 10px;"></i>
            <p style="margin: 0; font-weight: 500;">Silakan pilih Pengampu untuk melanjutkan.</p>
        </div>`;
    
    fetch(`${SCRIPT_URL}?action=getGuru&kelas=${this.value}&_nc=${Date.now()}`)
        .then(res => res.json())
        .then(res => {
            const listGuru = res.data || res;
            if (res.status === "success" || Array.isArray(listGuru)) {
                let html = '<option value="" disabled selected>-- Pilih Pengampu --</option>';
                listGuru.forEach(n => html += `<option value="${n}">${n}</option>`);
                elPengampu.innerHTML = html;
                elPengampu.disabled = false;
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal Memuat',
                    text: res.message || 'Gagal mengambil data pengampu',
                    confirmButtonColor: '#2563eb'
                });
            }
        })
        .catch(err => {
            Swal.fire({
                icon: 'error',
                title: 'Koneksi Terganggu',
                text: 'Gagal menghubungkan ke server Google Sheets.',
                confirmButtonColor: '#ef4444'
            });
        });
});

// 2. ENABLE LOAD BUTTON
elPengampu.addEventListener('change', () => {
    btnLoad.style.display = 'block';
});

// 3. GET SISWA & CEK JATAH JURNAL
btnLoad.addEventListener('click', function() {
    const k = elKelas.value;
    const g = elPengampu.value;
    
    areaList.innerHTML = `
        <div style="text-align:center; padding:50px 20px;">
            <i class="fa-solid fa-circle-notch fa-spin fa-3x" style="color:#2563eb; margin-bottom:15px;"></i>
            <p style="color:#475569; font-weight:600; font-size:15px; margin:0;">Memeriksa Jatah & Mengambil Data Siswa...</p>
            <small style="color:#94a3b8;">Mohon tunggu sebentar</small>
        </div>`;
    
    fetch(`${SCRIPT_URL}?action=getSiswa&kelas=${k}&guru=${encodeURIComponent(g)}&_nc=${Date.now()}`)
        .then(res => res.json())
        .then(res => {
            // Skenario Jatah Habis
            if (res.status === "quota_empty") {
                renderQuotaEmptyUI(res.message);
                actionBar.style.display = 'none';

                // Modern Popup
                Swal.fire({
                    icon: 'info',
                    title: 'Jatah Jurnal Habis',
                    text: res.message,
                    confirmButtonText: 'Saya Mengerti',
                    confirmButtonColor: '#ef4444',
                    backdrop: `rgba(15, 23, 42, 0.6)`
                });
                return;
            }

            if (res.status === "error") {
                areaList.innerHTML = `<div style="text-align:center; color:#ef4444; padding:30px; font-weight:600;">⚠️ ${res.message}</div>`;
                actionBar.style.display = 'none';
                return;
            }

            if (!res.data || res.data.length === 0) {
                areaList.innerHTML = `
                    <div style="text-align:center; padding:40px; background:#fef2f2; border-radius:16px; border:1px solid #fecaca; color:#dc2626; margin-top:20px;">
                        <i class="fa-solid fa-users-slash fa-2x" style="margin-bottom:10px;"></i>
                        <p style="font-weight:600; margin:0;">Tidak ada siswa ditemukan di kelas ini.</p>
                    </div>`;
                actionBar.style.display = 'none';
                return;
            }

            renderBulkForm(res.data);
        })
        .catch(err => {
            Swal.fire({
                icon: 'error',
                title: 'Gagal Memuat Data',
                text: 'Terjadi kesalahan jaringan. Sila coba beberapa saat lagi.',
                confirmButtonColor: '#ef4444'
            });
        });
});

// --- UI ESTETIK SAAT JATAH HABIS ---
function renderQuotaEmptyUI(msg) {
    areaList.innerHTML = `
        <div style="
            margin-top: 25px;
            background: linear-gradient(135deg, #ffffff 0%, #fef2f2 100%);
            border: 1px solid #fecaca;
            border-radius: 20px;
            padding: 35px 25px;
            text-align: center;
            box-shadow: 0 10px 25px -5px rgba(239, 68, 68, 0.1);
        ">
            <div style="
                width: 70px;
                height: 70px;
                background: #fee2e2;
                color: #ef4444;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px auto;
                font-size: 30px;
                box-shadow: 0 0 0 8px #fef2f2;
            ">
                <i class="fa-solid fa-lock"></i>
            </div>
            <h3 style="color: #991b1b; font-size: 20px; margin: 0 0 10px 0; font-weight: 700;">
                Akses Pengisian Diberhentikan
            </h3>
            <p style="color: #b91c1c; font-size: 15px; margin: 0 0 20px 0; line-height: 1.5;">
                ${msg}
            </p>
            <span style="
                display: inline-block;
                background: #ef4444;
                color: white;
                padding: 6px 16px;
                border-radius: 50px;
                font-size: 12px;
                font-weight: 600;
                letter-spacing: 0.5px;
            ">
                <i class="fa-solid fa-circle-check"></i> STATUS: JURNAL PAS
            </span>
        </div>
    `;
}

// --- FUNGSI RENDER FORM SISWA ---
function renderBulkForm(list) {
    let html = '';
    list.forEach((nama, i) => {
        html += `
        <div class="student-card" id="card-${i}">
            <div class="student-header">
                <div class="student-name">
                    <i class="fa-solid fa-user-graduate" style="color:var(--accent); margin-right:5px;"></i> ${nama}
                    <input type="hidden" id="nama-${i}" value="${nama}">
                </div>
                <div style="width: 110px;">
                    <select id="hadir-${i}" class="mini-select" style="padding: 5px;" onchange="toggleHadir(${i})">
                        <option value="Hadir">✅ Hadir</option>
                        <option value="Sakit">🤒 Sakit</option>
                        <option value="Izin">📩 Izin</option>
                        <option value="Alpha">❌ Alpha</option>
                    </select>
                </div>
            </div>

            <div id="row-setor-${i}" class="input-group">
                <label style="color:var(--accent)">Status Setoran Hari Ini?</label>
                <select id="statusSetor-${i}" class="mini-select" style="border-color:var(--accent); font-weight:600;" onchange="toggleSetor(${i})">
                    <option value="Tidak Setor">Tidak Setor</option>
                    <option value="Setor">🎯 YA, SETOR HAFALAN</option>
                </select>
            </div>

            <div id="details-${i}" class="hidden-details">
                <div class="badge-tahsin"><i class="fa-solid fa-book-open"></i> PROGRES TAHSIN</div>
                <div class="input-group">
                    <div class="input-wrapper">
                        <i class="fa-solid fa-bookmark"></i>
                        <input type="text" id="tilawah-${i}" class="mini-input" placeholder="Batas Tilawah (Juz/Hal)...">
                    </div>
                </div>

                <div class="badge-tahfidz"><i class="fa-solid fa-quran"></i> PROGRES TAHFIDZ</div>
                <div class="input-group">
                    <label>Batas Tahfidz (Surat & Ayat)</label>
                    <div class="input-wrapper">
                        <i class="fa-solid fa-pen-nib"></i>
                        <input type="text" id="tahfidz-${i}" class="mini-input" placeholder="Wajib diisi jika setor...">
                    </div>
                </div>

                <div class="input-group">
                    <label>Target Berikutnya (Opsional)</label>
                    <div class="input-wrapper">
                        <i class="fa-solid fa-award"></i>
                        <input type="text" id="target-${i}" class="mini-input" placeholder="Target besok...">
                    </div>
                </div>
            </div>
        </div>`;
    });
    
    areaList.innerHTML = html;
    countSpan.innerText = list.length;
    actionBar.style.display = 'flex';
    
    window.scrollBy({ top: 200, behavior: 'smooth' });
}

// --- LOGIKA CARD TOGGLE ---
window.toggleHadir = (i) => {
    const val = document.getElementById(`hadir-${i}`).value;
    const card = document.getElementById(`card-${i}`);
    const rowSetor = document.getElementById(`row-setor-${i}`);
    const selectSetor = document.getElementById(`statusSetor-${i}`);
    
    if(val !== 'Hadir') {
        card.classList.add('absent');
        rowSetor.style.display = 'none';
        selectSetor.value = 'Tidak Setor';
        toggleSetor(i);
    } else {
        card.classList.remove('absent');
        rowSetor.style.display = 'block';
    }
};

window.toggleSetor = (i) => {
    const val = document.getElementById(`statusSetor-${i}`).value;
    const details = document.getElementById(`details-${i}`);
    const card = document.getElementById(`card-${i}`);
    
    if(val === 'Setor') {
        details.classList.add('show-details');
        card.classList.add('active-setor');
    } else {
        details.classList.remove('show-details');
        card.classList.remove('active-setor');
        document.getElementById(`tilawah-${i}`).value = '';
        document.getElementById(`tahfidz-${i}`).value = '';
        document.getElementById(`target-${i}`).value = '';
    }
};

// --- SUBMIT DENGAN SWEETALERT2 MODAL & AUTO REFRESH ---
window.submitData = () => {
    const cards = document.querySelectorAll('.student-card');
    const k = elKelas.value;
    const g = elPengampu.value;
    const btn = document.querySelector('.btn-submit');
    
    let payload = [];
    let errorMsg = null;

    cards.forEach((c, i) => {
        const nama = document.getElementById(`nama-${i}`).value;
        const hadir = document.getElementById(`hadir-${i}`).value;
        const setor = document.getElementById(`statusSetor-${i}`).value;
        
        let dTilawah = "-", dTahfidz = "-", dTarget = "-";

        if (hadir === 'Hadir') {
            dTilawah = document.getElementById(`tilawah-${i}`).value;

            if (setor === 'Setor') {
                dTahfidz = document.getElementById(`tahfidz-${i}`).value;
                dTarget = document.getElementById(`target-${i}`).value;

                if (!dTahfidz.trim()) {
                    document.getElementById(`tahfidz-${i}`).style.borderColor = '#ef4444';
                    errorMsg = `Mohon isi Batas Tahfidz untuk siswa: <b>${nama}</b>`;
                }
            }
        }

        payload.push({
            kelas: k,
            pengampu: g,
            siswa: nama,
            kehadiran: hadir,
            statusSetor: setor,
            batasTilawah: dTilawah,
            batasTahfidz: dTahfidz,
            target: dTarget
        });
    });

    // Validasi Gagal
    if(errorMsg) {
        Swal.fire({
            icon: 'warning',
            title: 'Data Belum Lengkap',
            html: errorMsg,
            confirmButtonColor: '#f59e0b'
        });
        return;
    }

    // Modal Konfirmasi Modern
    Swal.fire({
        title: 'Kirim Jurnal T2Q?',
        text: `Anda akan mengirimkan data untuk ${payload.length} siswa.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#64748b',
        confirmButtonText: '<i class="fa-solid fa-paper-plane"></i> Ya, Kirim Sekarang!',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            
            // Loading State Modal
            Swal.fire({
                title: 'Mengirim Data...',
                text: 'Mohon tunggu, sedang menyimpan jurnal ke sistem.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(res => {
                if(res.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: 'BERHASIL TERKIRIM!',
                        text: res.message,
                        timer: 2500,
                        showConfirmButton: false
                    }).then(() => {
                        // Hard Refresh untuk bersihkan cache browser
                        window.location.href = window.location.pathname + '?refresh=' + Date.now();
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'GAGAL MENYIMPAN',
                        text: res.message,
                        confirmButtonColor: '#ef4444'
                    });
                }
            })
            .catch(err => {
                Swal.fire({
                    icon: 'error',
                    title: 'Gangguan Koneksi',
                    text: 'Gagal mengirim data. Coba periksa koneksi internet Anda.',
                    confirmButtonColor: '#ef4444'
                });
            });
        }
    });
};
