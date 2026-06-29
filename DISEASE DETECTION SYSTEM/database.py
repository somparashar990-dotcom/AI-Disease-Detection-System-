import sqlite3
import os
from datetime import date, timedelta
from werkzeug.security import generate_password_hash

DB_PATH = os.path.join(os.path.dirname(__file__), "medora.db")

# All doctors seeded from disease_mapping.js — grouped by specialty
SEED_DOCTORS = [
    # Infectious Diseases
    {"name": "Dr. Rajesh Kumar Singh",      "email": "rajesh.singh@medora.in",    "specialty": "Infectious Diseases", "clinic": "Devra Clinic & Diagnostics",          "city": "Ranchi",      "contact": "+91 9876543210"},
    {"name": "Dr. V.S.V. Prasad",           "email": "vsv.prasad@medora.in",      "specialty": "Infectious Diseases", "clinic": "The Internal Medicine Clinic",          "city": "Dhanbad",     "contact": "+91 8765432109"},
    {"name": "Dr. S. K. Mishra",            "email": "sk.mishra.inf@medora.in",   "specialty": "Infectious Diseases", "clinic": "Consultant Physician Clinic",           "city": "Jamshedpur",  "contact": "+91 7654321098"},
    # Digestive & Liver
    {"name": "Dr. Deepak Kumar",            "email": "deepak.kumar@medora.in",    "specialty": "Digestive & Liver",   "clinic": "Manipal Hospital",                     "city": "Ranchi",      "contact": "+91 6543210987"},
    {"name": "Dr. Rajan Kumar Barnwal",     "email": "rajan.barnwal@medora.in",   "specialty": "Digestive & Liver",   "clinic": "Barnwal Clinic",                        "city": "Jamshedpur",  "contact": "+91 9123456780"},
    {"name": "Dr. Aloke",                   "email": "aloke@medora.in",           "specialty": "Digestive & Liver",   "clinic": "Tata Central Hospital",                 "city": "Dhanbad",     "contact": "+91 8234567891"},
    # Respiratory
    {"name": "Dr. Ankush Sharma",           "email": "ankush.sharma@medora.in",   "specialty": "Respiratory",         "clinic": "Dr Ankush Sharma Clinic",               "city": "Ranchi",      "contact": "+91 7345678902"},
    {"name": "Dr. Satish Kumar Prasad",     "email": "satish.prasad@medora.in",   "specialty": "Respiratory",         "clinic": "Prasad Chest Clinic",                   "city": "Jamshedpur",  "contact": "+91 9456789013"},
    {"name": "Dr. Shambhavi Narayan",       "email": "shambhavi.narayan@medora.in","specialty": "Respiratory",        "clinic": "Shwet Shree Clinic",                    "city": "Dhanbad",     "contact": "+91 8567890124"},
    # Cardiovascular
    {"name": "Dr. Rajiv Kumar",             "email": "rajiv.kumar@medora.in",     "specialty": "Cardiovascular",      "clinic": "Maa Medical Hall",                      "city": "Ranchi",      "contact": "+91 7678901235"},
    {"name": "Dr. R C Choudhary",           "email": "rc.choudhary@medora.in",    "specialty": "Cardiovascular",      "clinic": "Katras Nursing Home",                   "city": "Dhanbad",     "contact": "+91 9789012346"},
    {"name": "Dr. Raihan Ahmad",            "email": "raihan.ahmad@medora.in",    "specialty": "Cardiovascular",      "clinic": "Private Practice",                      "city": "Ranchi",      "contact": "+91 8890123457"},
    # Neurological
    {"name": "Dr. Sanjay Kumar",            "email": "sanjay.kumar@medora.in",    "specialty": "Neurological",        "clinic": "Kadru Clinic",                          "city": "Ranchi",      "contact": "+91 7901234568"},
    {"name": "Dr. Sheetal Sadashiv Bankar", "email": "sheetal.bankar@medora.in",  "specialty": "Neurological",        "clinic": "Manipal Hospital",                      "city": "Ranchi",      "contact": "+91 9012345679"},
    {"name": "Dr. Raj Kumar Prasad",        "email": "raj.prasad@medora.in",      "specialty": "Neurological",        "clinic": "Matri Sadan",                           "city": "Dhanbad",     "contact": "+91 8123456780"},
    # Endocrine
    {"name": "Dr. S. K. Mishra",            "email": "sk.mishra.endo@medora.in",  "specialty": "Endocrine",           "clinic": "Consultant Physician & Diabetologist",  "city": "Jamshedpur",  "contact": "+91 7234567891"},
    {"name": "Dr. Deepak Chandra Prakash",  "email": "deepak.prakash@medora.in",  "specialty": "Endocrine",           "clinic": "Manipal Hospital",                      "city": "Ranchi",      "contact": "+91 9345678902"},
    {"name": "Dr. Sunil Kumar Singh",       "email": "sunil.singh@medora.in",     "specialty": "Endocrine",           "clinic": "Shyam Medical Hall",                    "city": "Ranchi",      "contact": "+91 8456789013"},
    # Musculoskeletal
    {"name": "Dr. Rakesh Mishra",           "email": "rakesh.mishra@medora.in",   "specialty": "Musculoskeletal",     "clinic": "Orthopedic Clinic",                     "city": "Ranchi",      "contact": "+91 7567890124"},
    {"name": "Dr. Avinash Kumar",           "email": "avinash.kumar@medora.in",   "specialty": "Musculoskeletal",     "clinic": "Orthopedic Practice",                   "city": "Ranchi",      "contact": "+91 9678901235"},
    {"name": "Dr. Uma Shankar Verma",       "email": "uma.verma@medora.in",       "specialty": "Musculoskeletal",     "clinic": "Verma Clinic",                          "city": "Ranchi",      "contact": "+91 8789012346"},
    # Skin & Dermatological
    {"name": "Dr. Abhinav Sahay",           "email": "abhinav.sahay@medora.in",   "specialty": "Skin & Dermatological","clinic": "Allo Sexual Health Clinic",            "city": "Ranchi",      "contact": "+91 7890123457"},
    {"name": "Dr. Pooja Alankar",           "email": "pooja.alankar@medora.in",   "specialty": "Skin & Dermatological","clinic": "Dermatology Practice",                 "city": "Ranchi",      "contact": "+91 9901234568"},
    {"name": "Dr. Subodh Kumar Singh",      "email": "subodh.singh@medora.in",    "specialty": "Skin & Dermatological","clinic": "Skin Clinic",                          "city": "Ranchi",      "contact": "+91 8012345679"},
    # Urinary & Genitourinary
    {"name": "Dr. Tushar Arya",             "email": "tushar.arya@medora.in",     "specialty": "Urinary & Genitourinary","clinic": "Arya Clinic",                       "city": "Ranchi",      "contact": "+91 7123456780"},
    {"name": "Dr. Ratnesh Dubey",           "email": "ratnesh.dubey@medora.in",   "specialty": "Urinary & Genitourinary","clinic": "Private Practice",                  "city": "Ranchi",      "contact": "+91 9234567891"},
    {"name": "Dr. Brij Bhushan Sahni",      "email": "brij.sahni@medora.in",      "specialty": "Urinary & Genitourinary","clinic": "Kumar & Associates",               "city": "Dhanbad",     "contact": "+91 8345678902"},
    # Allergies & Reactions
    {"name": "Dr. Prashanta Kumar Sen Gupta","email": "prashanta.gupta@medora.in","specialty": "Allergies & Reactions","clinic": "Family Health Centre",                "city": "Ranchi",      "contact": "+91 7456789013"},
    {"name": "Dr. Chandan Barnwal",         "email": "chandan.barnwal@medora.in", "specialty": "Allergies & Reactions","clinic": "Barnwal Clinic",                      "city": "Ranchi",      "contact": "+91 9567890124"},
    {"name": "Dr. Suresh Kumar Agarwalla",  "email": "suresh.agarwalla@medora.in","specialty": "Allergies & Reactions","clinic": "Agarwalla Clinic",                    "city": "Ranchi",      "contact": "+91 8678901235"},
]

DEFAULT_PASSWORD = "Doctor@123"

# 1-hour slots, 10am–6pm → 8 slots per day
SLOT_HOURS = [
    ("10:00", "11:00"), ("11:00", "12:00"), ("12:00", "13:00"), ("13:00", "14:00"),
    ("14:00", "15:00"), ("15:00", "16:00"), ("16:00", "17:00"), ("17:00", "18:00"),
]


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    conn = get_db()
    cur = conn.cursor()

    cur.executescript("""
        CREATE TABLE IF NOT EXISTS doctors (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            name          TEXT NOT NULL,
            email         TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            specialty     TEXT NOT NULL,
            clinic        TEXT,
            city          TEXT,
            contact       TEXT,
            bio           TEXT,
            created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS time_slots (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            doctor_id   INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
            slot_date   TEXT NOT NULL,
            start_time  TEXT NOT NULL,
            end_time    TEXT NOT NULL,
            is_booked   INTEGER DEFAULT 0,
            UNIQUE(doctor_id, slot_date, start_time)
        );

        CREATE TABLE IF NOT EXISTS appointments (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            time_slot_id   INTEGER NOT NULL REFERENCES time_slots(id) ON DELETE CASCADE,
            doctor_id      INTEGER NOT NULL REFERENCES doctors(id),
            patient_name   TEXT NOT NULL,
            patient_email  TEXT NOT NULL,
            patient_phone  TEXT NOT NULL,
            disease        TEXT,
            symptoms       TEXT,
            notes          TEXT,
            status         TEXT DEFAULT 'confirmed',
            booked_at      DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()

    # Seed doctors if table is empty
    cur.execute("SELECT COUNT(*) FROM doctors")
    if cur.fetchone()[0] == 0:
        pw_hash = generate_password_hash(DEFAULT_PASSWORD)
        for doc in SEED_DOCTORS:
            cur.execute(
                """INSERT OR IGNORE INTO doctors
                   (name, email, password_hash, specialty, clinic, city, contact)
                   VALUES (?,?,?,?,?,?,?)""",
                (doc["name"], doc["email"], pw_hash,
                 doc["specialty"], doc["clinic"], doc["city"], doc["contact"])
            )
        conn.commit()
        print(f"[DB] Seeded {len(SEED_DOCTORS)} doctors.")
        _seed_slots(cur, conn)
    else:
        # Seed slots for next 14 days if not already present
        _seed_slots(cur, conn)

    conn.close()


def _seed_slots(cur, conn):
    """Generate 1-hour slots 10am–6pm for all doctors for the next 14 days."""
    today = date.today()
    cur.execute("SELECT id FROM doctors")
    doctor_ids = [r[0] for r in cur.fetchall()]
    inserted = 0
    for doc_id in doctor_ids:
        for day_offset in range(1, 15):  # next 14 days
            slot_date = (today + timedelta(days=day_offset)).isoformat()
            for start, end in SLOT_HOURS:
                try:
                    cur.execute(
                        "INSERT OR IGNORE INTO time_slots (doctor_id, slot_date, start_time, end_time) VALUES (?,?,?,?)",
                        (doc_id, slot_date, start, end)
                    )
                    inserted += cur.rowcount
                except Exception:
                    pass
    conn.commit()
    if inserted:
        print(f"[DB] Generated {inserted} time slots for the next 14 days.")


if __name__ == "__main__":
    init_db()
    print("[DB] Database initialized successfully.")
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM doctors")
    print(f"[DB] Doctors in DB: {cur.fetchone()[0]}")
    cur.execute("SELECT COUNT(*) FROM time_slots")
    print(f"[DB] Time slots in DB: {cur.fetchone()[0]}")
    conn.close()
