// lib/siklus/copy/id.js
// RISA - Siklusku (MVP v1.0) - Copy map (ID)
// No external i18n libs. Tiny formatter included.

const fmt = (s, vars = {}) =>
  s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));

export const COPY_ID = {
  onboarding: {
    gate: {
      title: "Selamat datang di Siklusku",
      subtitle: "Mari mulai perjalanan memahami tubuhmu.",
      yes: "Sudah haid",
      no: "Belum pernah haid"
    },
    firstPeriodGuide: {
      sections: {
        apaItu:
          "Haid adalah tanda bahwa tubuhmu sehat dan siap tumbuh jadi perempuan utuh. Haid (menstruasi) merupakan proses alami ketika dinding rahim meluruh dan keluar melalui vagina dalam bentuk darah.",
        kenapaTerjadi:
          "Tubuh perempuan setiap bulan mempersiapkan rahim untuk kemungkinan kehamilan. Kalau tidak ada pembuahan, lapisan rahim dilepaskan dan keluar sebagai darah haid.",
        persiapan:
          "Siapkan pembalut, celana dalam cadangan, dan catat di sini saat waktunya tiba. Kamu nggak sendiri kok.",
        tandaTanda:
          "Kram perut, punggung pegal-pegal, payudara sensitif, perubahan suasana hati, dan perut kembung."
      },
      cta: "Siap mulai mencatat saat waktunya tiba?"
    },
    lastPeriodDates: {
      title: "Kapan haid terakhirmu dimulai?",
      help: "Isi tanggal haid terakhirmu",
      startLabel: "Tanggal mulai haid",
      endLabel: "Tanggal berakhir haid",
      errFuture: "Tanggal tidak boleh di masa depan",
      errOrder: "Tanggal berakhir harus setelah tanggal mulai"
    },
    cycleDetails: {
      title: "Ceritakan pola siklusmu",
      cycleLengthLabel: "Panjang siklus (hari)",
      cycleLengthHint: "Biasanya 21-35 hari. Kalau belum tahu, isi 28.",
      periodLengthLabel: "Lama haid (hari)",
      periodLengthHint: "Biasanya 2-8 hari.",
      regularity: {
        label: "Keteraturan siklus",
        regular: "Teratur",
        irregular: "Tidak teratur",
        notSure: "Tidak tahu"
      },
      painLabel: "Seberapa nyeri haidmu?",
      painHint: "1 = Tidak nyeri, 10 = Sangat nyeri sampai tidak bisa beraktivitas"
    },
    birthYear: {
      title: "Tahun kelahiranmu",
      label: "Tahun lahir",
      helper: "Contoh: 2007",
      error: "Masukkan tahun antara 2004-2011"
    },
    goals: {
      title: "Apa saja yang juga ingin kamu catat di sini?",
      options: {
        prediction: "Prediksi haid berikutnya",
        fertility: "Mengetahui masa subur",
        mood: "Tracking mood dan emosi",
        symptoms: "Mencatat gejala haid",
        pain: "Mencatat tingkat nyeri"
      },
      helper: "Pilih semua yang relevan. Kami akan sesuaikan untukmu!"
    },
    loveLetter: {
      title: "Surat Cinta dari Tubuhmu",
      body:
        "Hai sayangku. Aku tubuhmu.\n" +
        "Setiap bulan, aku membersihkan dan mempersiapkan ruang baru untukmu. Bukan karena ada yang salah, tapi karena aku sehat.\n" +
        "Aku akan selalu memberi tahu apa yang kubutuhkan.\n" +
        "Cukup dengarkan dan catat.",
      close: "Mulai Mencatat"
    }
  },
  cycle: {
    header: {
      dayHeadline: (vars) => fmt("Hari ke-{day} siklusmu", vars),
      phaseIntro: (vars) => fmt("Kamu sedang di fase {phaseName}", vars)
    },
    phases: {
      menstrual: { name: "Menstruasi", desc: "Fase pembersihan alami tubuhmu" },
      follicular: { name: "Folikuler", desc: "Masa pemulihan dan pertumbuhan sel baru" },
      ovulation: { name: "Ovulasi", desc: "Sel telur sudah siap dibuahi, ini masa subur kamu." },
      luteal: { name: "Luteal", desc: "Persiapan tubuh menuju menstruasi berikutnya" }
    },
    tips: {
      menstrual: [
        "Istirahat cukup dan konsumsi makanan bergizi. Tubuhmu sedang bekerja keras!"
      ],
      follicular: [
        "Energi mulai meningkat! Waktu yang baik untuk olahraga ringan atau belajar hal baru."
      ],
      ovulation: ["Puncak kesuburan, tetap jaga kesehatan."],
      luteal: [
        "Mungkin kamu merasa lebih lelah atau sensitif dari biasanya. Perbanyak istirahat dan merawat diri."
      ],
      psaOvulation: "Ovulasi = Masa Subur. Perempuan memiliki peluang kehamilan lebih tinggi di masa ini."
    }
  }
};

export default COPY_ID;
