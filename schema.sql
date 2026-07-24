-- 1. Tabel Posisi Pekerjaan
CREATE TABLE IF NOT EXISTS positions (
    position VARCHAR(100) PRIMARY KEY
);

-- 2. Tabel Pengaturan
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY DEFAULT 1,
    timerDuration INT DEFAULT 60,
    theme VARCHAR(20) DEFAULT 'light'
);

-- 3. Tabel Akun Peserta Terdaftar
CREATE TABLE IF NOT EXISTS registered_candidates (
    email VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    position VARCHAR(100) NOT NULL,
    experience VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'registered'
);

-- 4. Tabel Data Diri Peserta Tes
CREATE TABLE IF NOT EXISTS participants (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    position VARCHAR(100) NOT NULL,
    experience VARCHAR(50) NOT NULL,
    education VARCHAR(100) NOT NULL,
    domicile VARCHAR(100) NOT NULL,
    testDate VARCHAR(50) NOT NULL
);

-- 5. Tabel Hasil Ujian & Skor Peserta
CREATE TABLE IF NOT EXISTS results (
    participantId VARCHAR(50) PRIMARY KEY,
    score_kepribadian INT NOT NULL,
    score_logika INT NOT NULL,
    score_copywriting INT NOT NULL,
    score_kreativitas INT NOT NULL,
    score_analisa_data INT NOT NULL,
    totalScore INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    answers TEXT, -- Menyimpan jawaban detail jika diperlukan (dalam bentuk string JSON)
    FOREIGN KEY (participantId) REFERENCES participants(id) ON DELETE CASCADE
);

INSERT IGNORE INTO settings (id, timerDuration, theme) VALUES (1, 60, 'light');
