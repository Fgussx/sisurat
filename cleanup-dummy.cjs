require('dotenv').config();
const mongoose = require('mongoose');
const { SuratKeluar, SuratMasuk, Reminder } = require('./models.js');

async function cleanup() {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('Connected to Atlas');

  // Hapus SEMUA surat keluar yang bukan Moh. Arifin atau Sari Wangi Jati
  const r1 = await SuratKeluar.deleteMany({ tujuan: { $nin: ['Moh. Arifin', 'Sari Wangi Jati'] } });
  console.log('Surat Keluar dihapus:', r1.deletedCount);

  // Hapus SEMUA surat masuk yang bukan nama asli
  const keepMasuk = ['Moh. Arifin', 'Sari Wangi Jati', 'Kurnianto', 'ZADI', 'PC IAI Kab. Pacitan'];
  const r2 = await SuratMasuk.deleteMany({ pengirim: { $nin: keepMasuk } });
  console.log('Surat Masuk dihapus:', r2.deletedCount);

  // Hapus semua reminders lama
  const r3 = await Reminder.deleteMany({});
  console.log('Reminders dihapus:', r3.deletedCount);

  // Buat reminder baru untuk surat masuk yang tindak_lanjut = iya
  const masukList = await SuratMasuk.find({ is_deleted: false, status_tindak_lanjut: 'iya' });
  for (const sm of masukList) {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7);
    await new Reminder({ id_surat_masuk: sm._id, tanggal_batas: deadline, status: 'menunggu' }).save();
    console.log('Reminder dibuat:', sm.pengirim);
  }

  // Summary
  console.log('\nSisa:');
  console.log('  Surat Keluar:', await SuratKeluar.countDocuments());
  console.log('  Surat Masuk:', await SuratMasuk.countDocuments());
  console.log('  Reminders:', await Reminder.countDocuments());

  await mongoose.disconnect();
  console.log('Done');
}

cleanup().catch(e => { console.error(e.message); process.exit(1); });
