const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    console.log("Memulai proses pembuatan Buku Panduan (PDF)...");
    console.log("Pastikan frontend (localhost:3000) dan backend (localhost:8000) sedang berjalan.");
    
    // Pastikan folder untuk menampung screenshot ada
    const imgDir = path.join(__dirname, 'manual_images');
    if (!fs.existsSync(imgDir)) {
        fs.mkdirSync(imgDir);
    }

    const browser = await puppeteer.launch({ headless: 'new', defaultViewport: { width: 1440, height: 900 } });
    const page = await browser.newPage();
    
    // Fungsi bantuan untuk mengambil screenshot
    const takeShot = async (url, filename, waitTime = 2000) => {
        console.log(`Mengambil screenshot untuk: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, waitTime)); // tunggu animasi selesai
        const filePath = path.join(imgDir, filename);
        await page.screenshot({ path: filePath });
        return filePath;
    };

    try {
        // 1. Screenshot Halaman Publik
        await takeShot('http://localhost:3000/', '1_home.png');
        await takeShot('http://localhost:3000/edukasi/mitra', '2_mitra_publik.png');
        
        // 2. Login ke Admin
        console.log("Melakukan login sebagai admin...");
        await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
        await page.type('input[type="email"]', 'admin@bi-mengajar.id');
        await page.type('input[type="password"]', 'password');
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        
        // 3. Screenshot Halaman Admin
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: path.join(imgDir, '3_dashboard.png') });
        
        await takeShot('http://localhost:3000/admin/mitra', '4_admin_mitra.png');
        await takeShot('http://localhost:3000/admin/users', '5_admin_users.png');
        
        // 4. Menyusun Konten HTML untuk PDF
        console.log("Menyusun dokumen PDF...");
        const getImgSrc = (filename) => {
            const imgPath = path.join(imgDir, filename);
            const base64 = fs.readFileSync(imgPath).toString('base64');
            return `data:image/png;base64,${base64}`;
        };

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Buku Panduan Penggunaan Sistem BI Mengajar</title>
            <style>
                body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 40px; }
                .cover { height: 90vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
                .cover h1 { font-size: 42px; color: #003366; margin-bottom: 10px; }
                .cover h3 { font-size: 24px; color: #666; font-weight: normal; }
                .page-break { page-break-before: always; }
                h2 { color: #003366; border-bottom: 2px solid #ef4444; padding-bottom: 8px; margin-top: 40px; }
                h3 { color: #1e40af; margin-top: 30px; }
                p { margin-bottom: 15px; font-size: 14px; text-align: justify; }
                img { max-width: 100%; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 20px 0; }
                .feature-box { background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
                ul { margin-bottom: 15px; font-size: 14px; }
                li { margin-bottom: 8px; }
            </style>
        </head>
        <body>
            <div class="cover">
                <h1>BUKU PANDUAN PENGGUNAAN</h1>
                <h3>Sistem Informasi BI Mengajar Pematangsiantar</h3>
                <p style="margin-top: 50px; color: #999;">Dibuat secara otomatis</p>
            </div>
            
            <div class="page-break"></div>
            
            <h2>1. Halaman Publik (Masyarakat Umum)</h2>
            
            <h3>1.1 Halaman Beranda (Home)</h3>
            <p>Halaman utama ini adalah wajah dari platform BI Mengajar. Pengunjung dapat melihat informasi singkat tentang program edukasi, berita terbaru, dan akses cepat ke berbagai fitur edukasi.</p>
            <img src="${getImgSrc('1_home.png')}" alt="Halaman Beranda" />
            
            <h3>1.2 Halaman Mitra Edukasi</h3>
            <p>Pada halaman ini, publik dapat melihat daftar mitra atau organisasi yang bekerja sama dengan Bank Indonesia Pematangsiantar. Terdapat juga tombol <strong>"Ajukan Kolaborasi"</strong> bagi komunitas/sekolah yang ingin bergabung.</p>
            <div class="feature-box">
                <strong>Catatan Penting:</strong> Pengajuan kolaborasi dari masyarakat tidak akan langsung tampil di halaman ini. Pengajuan akan masuk ke panel admin dengan status "Menunggu" dan harus disetujui (verifikasi) terlebih dahulu oleh Administrator.
            </div>
            <img src="${getImgSrc('2_mitra_publik.png')}" alt="Mitra Edukasi Publik" />
            
            <div class="page-break"></div>
            
            <h2>2. Halaman Administrator</h2>
            
            <h3>2.1 Dashboard Utama</h3>
            <p>Setelah melakukan login (menggunakan email dan password admin), Anda akan diarahkan ke Dashboard. Halaman ini memberikan ringkasan (statistik) aktivitas terbaru di platform.</p>
            <img src="${getImgSrc('3_dashboard.png')}" alt="Dashboard Admin" />
            
            <h3>2.2 Manajemen Mitra Edukasi</h3>
            <p>Halaman ini digunakan untuk mengelola data mitra. Anda dapat menerima atau menolak pengajuan kolaborasi, serta mengatur apakah profil mitra tersebut akan ditampilkan di website publik atau disembunyikan.</p>
            <ul>
                <li><strong>Status Persetujuan:</strong> Ubah menjadi "Diterima" jika proposal mitra disetujui.</li>
                <li><strong>Tampil di Web:</strong> Tombol toggle ini (hijau/abu-abu) digunakan untuk menampilkan atau menyembunyikan mitra di halaman publik.</li>
                <li><strong>Tambah Mitra:</strong> Admin juga dapat menambahkan mitra secara manual. Mitra yang ditambah secara manual akan langsung berstatus Diterima.</li>
            </ul>
            <img src="${getImgSrc('4_admin_mitra.png')}" alt="Manajemen Mitra" />
            
            <div class="page-break"></div>
            
            <h3>2.3 Manajemen User (Pengguna)</h3>
            <p>Fitur krusial untuk mengontrol siapa saja yang memiliki akses ke dalam sistem. Terdapat dua jenis <em>Role</em>: <strong>Admin</strong> dan <strong>User</strong>.</p>
            <ul>
                <li><strong>Tambah User:</strong> Digunakan untuk membuatkan akun baru bagi staf atau instansi terkait.</li>
                <li><strong>Edit User:</strong> Anda dapat mengganti Nama, Email, mengubah Role, atau mereset Password dari pengguna.</li>
                <li><strong>Hapus User:</strong> Menghapus akses pengguna.</li>
            </ul>
            <div class="feature-box">
                <strong>Sistem Proteksi:</strong> Sistem dilengkapi dengan keamanan khusus. Jika di dalam sistem hanya tersisa <strong>1 Akun Admin</strong>, maka akun tersebut tidak dapat dihapus dan jabatannya tidak dapat diturunkan. Hal ini mencegah sistem terkunci (tidak memiliki admin).
            </div>
            <img src="${getImgSrc('5_admin_users.png')}" alt="Manajemen User" />

        </body>
        </html>
        `;

        // Generate PDF
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfPath = path.join(__dirname, 'Panduan_Penggunaan_BI_Mengajar.pdf');
        await page.pdf({ 
            path: pdfPath, 
            format: 'A4', 
            printBackground: true,
            margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
        });
        
        console.log("✅ BERHASIL! Buku panduan PDF telah disimpan di: " + pdfPath);
        
    } catch (e) {
        console.error("Terjadi kesalahan:", e);
    } finally {
        await browser.close();
    }
})();
