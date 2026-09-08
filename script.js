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
    elPengampu.innerHTML = '<option>⏳ Loading...</option>';
    elPengampu.disabled = true;
    btnLoad.style.display = 'none';
    
    fetch(`${SCRIPT_URL}?action=getGuru&kelas=${this.value}`)
        .then(res => res.json())
        .then(data => {
            let html = '<option value="" disabled selected>-- Pilih Pengampu --</option>';
            data.forEach(n => html += `<option value="${n}">${n}</option>`);
            elPengampu.innerHTML = html;
            elPengampu.disabled = false;
        });
});

// 2. ENABLE LOAD BUTTON
elPengampu.addEventListener('change', () => {
    btnLoad.style.display = 'block';
});

// 3. GET SISWA & GENERATE CARDS
btnLoad.addEventListener('click', function() {
    const k = elKelas.value;
    const g = elPengampu.value;
    
    areaList.innerHTML = '<div style="text-align:center; padding:30px;"><i class="fa-solid fa-spinner fa-spin fa-2x" style="color:var(--accent)"></i><p>Mengambil Data Siswa...</p></div>';
    
    fetch(`${SCRIPT_URL}?action=getSiswa&kelas=${k}&guru=${encodeURIComponent(g)}`)
        .then(res => res.json())
        .then(siswaList => {
            if(!siswaList || siswaList.length === 0) {
                areaList.innerHTML = '<div style="text-align:center; color:red">Tidak ada siswa ditemukan.</div>';
                return;
            }
            renderBulkForm(siswaList);
        });
});

// --- FUNGSI RENDER (MEMBUAT TAMPILAN PER SISWA) ---
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
    
    // Auto scroll sedikit ke bawah
    window.scrollBy({ top: 200, behavior: 'smooth' });
}

// --- LOGIKA TOGGLE KEHADIRAN & SETORAN ---
window.toggleHadir = (i) => {
    const val = document.getElementById(`hadir-${i}`).value;
    const card = document.getElementById(`card-${i}`);
    const rowSetor = document.getElementById(`row-setor-${i}`);
    const selectSetor = document.getElementById(`statusSetor-${i}`);
    
    if(val !== 'Hadir') {
        card.classList.add('absent');
        rowSetor.style.display = 'none'; // Sembunyikan opsi setor
        selectSetor.value = 'Tidak Setor'; // Reset
        toggleSetor(i); // Hide details
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
        // Reset fields
        document.getElementById(`tilawah-${i}`).value = '';
        document.getElementById(`tahfidz-${i}`).value = '';
        document.getElementById(`target-${i}`).value = '';
    }
};

// --- SUBMIT SEMUA DATA ---
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

                // VALIDASI: Jika setor, tahfidz wajib diisi
                if (!dTahfidz.trim()) {
                    document.getElementById(`tahfidz-${i}`).style.borderColor = 'red';
                    errorMsg = `Mohon isi Batas Tahfidz untuk siswa: ${nama}`;
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

    if(errorMsg) {
        alert("⚠️ " + errorMsg);
        return;
    }

    if(!confirm(`Yakin kirim data untuk ${payload.length} siswa?`)) return;

    // ANIMASI LOADING
    const oldText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> MENGIRIM...';
    btn.disabled = true;

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(res => {
        if(res.status === 'success') {
            alert("✅ SUKSES! Data tersimpan.");
            window.location.reload();
        } else {
            throw new Error(res.message);
        }
    })
    .catch(err => {
        alert("Gagal: " + err);
        btn.innerHTML = oldText;
        btn.disabled = false;
    });
};
