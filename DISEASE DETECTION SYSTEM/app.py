from flask import Flask, request, jsonify, render_template, session, redirect, url_for, flash
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import date, timedelta
from infer import predict_disease, DISEASE_PRECAUTIONS
from database import get_db, init_db

app = Flask(__name__)
app.secret_key = "medora_secret_key_2024_change_in_production"

# Initialize DB on startup
with app.app_context():
    init_db()

# ---------------------------------------------------------------------------
# Specialty mapping (mirrors disease_mapping.js)
# ---------------------------------------------------------------------------
DISEASE_TO_SPECIALTY = {
    # Infectious Diseases
    'AIDS': 'Infectious Diseases', 'Malaria': 'Infectious Diseases',
    'Chickenpox': 'Infectious Diseases', 'Dengue': 'Infectious Diseases',
    'Typhoid': 'Infectious Diseases', 'Hepatitis A': 'Infectious Diseases',
    'Hepatitis B': 'Infectious Diseases', 'Hepatitis C': 'Infectious Diseases',
    'Hepatitis D': 'Infectious Diseases', 'Hepatitis E': 'Infectious Diseases',
    'Tuberculosis': 'Infectious Diseases', 'Pneumonia': 'Infectious Diseases',
    'Common Cold': 'Infectious Diseases', 'Impetigo': 'Infectious Diseases',
    # Digestive & Liver
    'GERD': 'Digestive & Liver', 'Chronic cholestasis': 'Digestive & Liver',
    'Peptic ulcer disease': 'Digestive & Liver', 'Gastroenteritis': 'Digestive & Liver',
    'Alcoholic hepatitis': 'Digestive & Liver', 'Jaundice': 'Digestive & Liver',
    # Respiratory
    'Bronchial Asthma': 'Respiratory',
    # Cardiovascular
    'Hypertension': 'Cardiovascular', 'Heart disease': 'Cardiovascular',
    'Varicose veins': 'Cardiovascular',
    # Neurological
    'Migraine': 'Neurological', 'Cervical spondylosis': 'Neurological',
    'Paralysis': 'Neurological', 'Vertigo': 'Neurological',
    # Endocrine
    'Diabetes': 'Endocrine', 'Hyperthyroidism': 'Endocrine',
    'Hypothyroidism': 'Endocrine',
    # Musculoskeletal
    'Osteoarthritis': 'Musculoskeletal', 'Arthritis': 'Musculoskeletal',
    # Skin & Dermatological
    'Fungal infections': 'Skin & Dermatological', 'Acne': 'Skin & Dermatological',
    'Psoriasis': 'Skin & Dermatological', 'Dimorphic hemmorhoids': 'Skin & Dermatological',
    # Urinary
    'Urinary tract infection': 'Urinary & Genitourinary',
    # Allergies
    'Allergy': 'Allergies & Reactions', 'Drug reaction': 'Allergies & Reactions',
}

SPECIALIST_LABELS = {
    'Infectious Diseases': 'Infectious Disease Specialist',
    'Digestive & Liver': 'Gastroenterologist',
    'Respiratory': 'Pulmonologist',
    'Cardiovascular': 'Cardiologist',
    'Neurological': 'Neurologist',
    'Endocrine': 'Endocrinologist',
    'Musculoskeletal': 'Orthopedic Doctor',
    'Skin & Dermatological': 'Dermatologist',
    'Urinary & Genitourinary': 'Urologist',
    'Allergies & Reactions': 'Allergist',
}

# ---------------------------------------------------------------------------
# Patient-facing pages
# ---------------------------------------------------------------------------
@app.route('/')
def home():
    return render_template('landing_page.html')

@app.route('/predict')
def predict_page():
    return render_template('predict.html')

@app.route('/my-bookings')
def my_bookings():
    return render_template('my_bookings.html')

# ---------------------------------------------------------------------------
# Prediction API
# ---------------------------------------------------------------------------
@app.route('/api/predict', methods=['POST'])
def predict():
    symptoms = request.json.get('symptoms')
    if not symptoms:
        return jsonify({'error': 'No symptoms provided'}), 400

    symptoms_list = [s.strip() for s in symptoms.split(',')] if isinstance(symptoms, str) else symptoms
    prediction = predict_disease(symptoms_list)
    precautions = DISEASE_PRECAUTIONS.get(prediction, [
        'Consult a healthcare professional', 'Rest and hydration',
        'Monitor symptoms', 'Seek medical advice'
    ])
    specialty = DISEASE_TO_SPECIALTY.get(prediction, 'General Practitioner')
    specialist_label = SPECIALIST_LABELS.get(specialty, 'General Practitioner')

    return jsonify({
        'prediction': prediction,
        'precautions': precautions,
        'specialty': specialty,
        'specialist_label': specialist_label,
    })

# ---------------------------------------------------------------------------
# Doctors API
# ---------------------------------------------------------------------------
@app.route('/api/doctors/<specialty>')
def get_doctors_by_specialty(specialty):
    conn = get_db()
    doctors = conn.execute(
        "SELECT id, name, specialty, clinic, city, contact FROM doctors WHERE specialty = ?",
        (specialty,)
    ).fetchall()
    conn.close()
    return jsonify([dict(d) for d in doctors])

@app.route('/api/slots/<int:doctor_id>')
def get_slots(doctor_id):
    """Return available (non-booked) slots for a doctor for the next 14 days."""
    today = date.today().isoformat()
    end_date = (date.today() + timedelta(days=14)).isoformat()
    conn = get_db()
    slots = conn.execute(
        """SELECT id, slot_date, start_time, end_time
           FROM time_slots
           WHERE doctor_id = ? AND is_booked = 0
             AND slot_date BETWEEN ? AND ?
           ORDER BY slot_date, start_time""",
        (doctor_id, today, end_date)
    ).fetchall()
    conn.close()
    return jsonify([dict(s) for s in slots])

# ---------------------------------------------------------------------------
# Booking API
# ---------------------------------------------------------------------------
@app.route('/api/book', methods=['POST'])
def book_appointment():
    data = request.json
    required = ['slot_id', 'doctor_id', 'patient_name', 'patient_email', 'patient_phone']
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400

    conn = get_db()
    # Verify slot exists and is available
    slot = conn.execute(
        "SELECT * FROM time_slots WHERE id = ? AND is_booked = 0", (data['slot_id'],)
    ).fetchone()
    if not slot:
        conn.close()
        return jsonify({'error': 'Slot not available or already booked'}), 409

    cur = conn.cursor()
    cur.execute(
        """INSERT INTO appointments
           (time_slot_id, doctor_id, patient_name, patient_email, patient_phone, disease, symptoms, notes)
           VALUES (?,?,?,?,?,?,?,?)""",
        (data['slot_id'], data['doctor_id'], data['patient_name'],
         data['patient_email'], data['patient_phone'],
         data.get('disease', ''), data.get('symptoms', ''), data.get('notes', ''))
    )
    appointment_id = cur.lastrowid
    conn.execute("UPDATE time_slots SET is_booked = 1 WHERE id = ?", (data['slot_id'],))
    conn.commit()

    # Get appointment details for response
    appt = conn.execute(
        """SELECT a.*, d.name as doctor_name, d.clinic, d.city,
                  t.slot_date, t.start_time, t.end_time
           FROM appointments a
           JOIN doctors d ON a.doctor_id = d.id
           JOIN time_slots t ON a.time_slot_id = t.id
           WHERE a.id = ?""",
        (appointment_id,)
    ).fetchone()
    conn.close()

    return jsonify({'success': True, 'appointment': dict(appt)})

@app.route('/api/appointments/by-email', methods=['POST'])
def appointments_by_email():
    email = request.json.get('email', '').strip()
    if not email:
        return jsonify({'error': 'Email required'}), 400
    conn = get_db()
    appts = conn.execute(
        """SELECT a.id, a.patient_name, a.patient_email, a.patient_phone,
                  a.disease, a.symptoms, a.notes, a.status, a.booked_at,
                  d.name as doctor_name, d.specialty, d.clinic, d.city, d.contact,
                  t.slot_date, t.start_time, t.end_time
           FROM appointments a
           JOIN doctors d ON a.doctor_id = d.id
           JOIN time_slots t ON a.time_slot_id = t.id
           WHERE a.patient_email = ?
           ORDER BY t.slot_date, t.start_time""",
        (email,)
    ).fetchall()
    conn.close()
    return jsonify([dict(a) for a in appts])

@app.route('/api/appointments/cancel/<int:appt_id>', methods=['POST'])
def cancel_appointment(appt_id):
    conn = get_db()
    appt = conn.execute("SELECT * FROM appointments WHERE id = ?", (appt_id,)).fetchone()
    if not appt:
        conn.close()
        return jsonify({'error': 'Appointment not found'}), 404
    conn.execute("UPDATE appointments SET status = 'cancelled' WHERE id = ?", (appt_id,))
    conn.execute("UPDATE time_slots SET is_booked = 0 WHERE id = ?", (appt['time_slot_id'],))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# ---------------------------------------------------------------------------
# Doctor Auth & Dashboard
# ---------------------------------------------------------------------------
@app.route('/doctor/register', methods=['GET', 'POST'])
def doctor_register():
    if request.method == 'POST':
        data = request.form
        name     = data.get('name', '').strip()
        email    = data.get('email', '').strip().lower()
        password = data.get('password', '')
        specialty= data.get('specialty', '')
        clinic   = data.get('clinic', '').strip()
        city     = data.get('city', '').strip()
        contact  = data.get('contact', '').strip()
        bio      = data.get('bio', '').strip()

        if not all([name, email, password, specialty]):
            flash('Name, email, password and specialty are required.', 'error')
            return render_template('doctor_register.html', specialties=list(SPECIALIST_LABELS.keys()))

        conn = get_db()
        existing = conn.execute("SELECT id FROM doctors WHERE email = ?", (email,)).fetchone()
        if existing:
            conn.close()
            flash('An account with this email already exists.', 'error')
            return render_template('doctor_register.html', specialties=list(SPECIALIST_LABELS.keys()))

        pw_hash = generate_password_hash(password)
        conn.execute(
            "INSERT INTO doctors (name, email, password_hash, specialty, clinic, city, contact, bio) VALUES (?,?,?,?,?,?,?,?)",
            (name, email, pw_hash, specialty, clinic, city, contact, bio)
        )
        conn.commit()
        doctor_id = conn.execute("SELECT id FROM doctors WHERE email = ?", (email,)).fetchone()['id']
        conn.close()

        # Auto-seed slots for this new doctor
        conn2 = get_db()
        from database import _seed_slots
        _seed_slots(conn2.cursor(), conn2)
        conn2.close()

        session['doctor_id']   = doctor_id
        session['doctor_name'] = name
        flash('Registration successful! Welcome to Medora.', 'success')
        return redirect(url_for('doctor_dashboard'))

    return render_template('doctor_register.html', specialties=list(SPECIALIST_LABELS.keys()))


@app.route('/doctor/login', methods=['GET', 'POST'])
def doctor_login():
    if request.method == 'POST':
        email    = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        conn = get_db()
        doc = conn.execute("SELECT * FROM doctors WHERE email = ?", (email,)).fetchone()
        conn.close()
        if doc and check_password_hash(doc['password_hash'], password):
            session['doctor_id']   = doc['id']
            session['doctor_name'] = doc['name']
            return redirect(url_for('doctor_dashboard'))
        flash('Invalid email or password.', 'error')
    
    conn = get_db()
    doctors = conn.execute("SELECT name, email, specialty FROM doctors ORDER BY name LIMIT 10").fetchall()
    conn.close()
    return render_template('doctor_login.html', doctors=doctors)


@app.route('/doctor/logout')
def doctor_logout():
    session.pop('doctor_id', None)
    session.pop('doctor_name', None)
    return redirect(url_for('home'))


@app.route('/doctor/dashboard')
def doctor_dashboard():
    if 'doctor_id' not in session:
        return redirect(url_for('doctor_login'))
    doc_id = session['doctor_id']
    conn = get_db()
    doctor = conn.execute("SELECT * FROM doctors WHERE id = ?", (doc_id,)).fetchone()
    today = date.today().isoformat()
    end_date = (date.today() + timedelta(days=14)).isoformat()
    slots = conn.execute(
        """SELECT * FROM time_slots WHERE doctor_id = ?
           AND slot_date BETWEEN ? AND ?
           ORDER BY slot_date, start_time""",
        (doc_id, today, end_date)
    ).fetchall()
    appointments = conn.execute(
        """SELECT a.*, t.slot_date, t.start_time, t.end_time
           FROM appointments a
           JOIN time_slots t ON a.time_slot_id = t.id
           WHERE a.doctor_id = ?
           ORDER BY t.slot_date DESC, t.start_time DESC""",
        (doc_id,)
    ).fetchall()
    conn.close()
    return render_template('doctor_dashboard.html',
                           doctor=doctor, slots=slots, appointments=appointments)


@app.route('/doctor/slots/add', methods=['POST'])
def add_slot():
    if 'doctor_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    data        = request.json
    slot_date   = data.get('slot_date')
    start_time  = data.get('start_time')
    end_time    = data.get('end_time')
    doc_id      = session['doctor_id']
    if not all([slot_date, start_time, end_time]):
        return jsonify({'error': 'Missing fields'}), 400
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO time_slots (doctor_id, slot_date, start_time, end_time) VALUES (?,?,?,?)",
            (doc_id, slot_date, start_time, end_time)
        )
        conn.commit()
        slot_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
        conn.close()
        return jsonify({'success': True, 'slot_id': slot_id})
    except Exception as e:
        conn.close()
        return jsonify({'error': 'Slot already exists or invalid data'}), 409


@app.route('/doctor/slots/delete/<int:slot_id>', methods=['POST'])
def delete_slot(slot_id):
    if 'doctor_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    conn = get_db()
    slot = conn.execute(
        "SELECT * FROM time_slots WHERE id = ? AND doctor_id = ?",
        (slot_id, session['doctor_id'])
    ).fetchone()
    if not slot:
        conn.close()
        return jsonify({'error': 'Slot not found'}), 404
    if slot['is_booked']:
        conn.close()
        return jsonify({'error': 'Cannot delete a booked slot'}), 409
    conn.execute("DELETE FROM time_slots WHERE id = ?", (slot_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})


@app.route('/doctor/appointments/update/<int:appt_id>', methods=['POST'])
def update_appointment_status(appt_id):
    if 'doctor_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    status = request.json.get('status')
    if status not in ('confirmed', 'completed', 'cancelled'):
        return jsonify({'error': 'Invalid status'}), 400
    conn = get_db()
    appt = conn.execute(
        "SELECT * FROM appointments WHERE id = ? AND doctor_id = ?",
        (appt_id, session['doctor_id'])
    ).fetchone()
    if not appt:
        conn.close()
        return jsonify({'error': 'Not found'}), 404
    conn.execute("UPDATE appointments SET status = ? WHERE id = ?", (status, appt_id))
    if status == 'cancelled':
        conn.execute("UPDATE time_slots SET is_booked = 0 WHERE id = ?", (appt['time_slot_id'],))
    conn.commit()
    conn.close()
    return jsonify({'success': True})


if __name__ == '__main__':
    app.run(debug=True)
