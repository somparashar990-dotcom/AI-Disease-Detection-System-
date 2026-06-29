/**
 * booking.js — Handles the booking UI inside the prediction result modal.
 * Loaded after disease_mapping.js and script.js.
 */

// State
let _currentDisease    = '';
let _currentSpecialty  = '';
let _currentDoctorId   = null;
let _currentDoctorName = '';
let _selectedSlotId    = null;
let _selectedSlotLabel = '';
let _allSlots          = [];     // raw slots from API

// ─────────────────────────────────────────────────────────
// Called by script.js after a prediction is returned
// ─────────────────────────────────────────────────────────
function initBookingSection(disease, specialty, specialistLabel) {
  _currentDisease   = disease;
  _currentSpecialty = specialty;

  // Specialty chip
  const chip = document.getElementById('specialty-chip');
  if (chip) chip.textContent = `🩺 ${specialistLabel || specialty}`;

  // Load doctors
  loadDoctorsForSpecialty(specialty);
}

async function loadDoctorsForSpecialty(specialty) {
  const grid    = document.getElementById('doctors-grid');
  const loading = document.getElementById('booking-doctors-loading');
  if (!grid) return;

  grid.innerHTML = '';
  if (loading) loading.style.display = 'block';

  try {
    const res  = await fetch(`/api/doctors/${encodeURIComponent(specialty)}`);
    const docs = await res.json();
    if (loading) loading.style.display = 'none';

    if (!docs.length) {
      grid.innerHTML = `<p style="font-size:0.85rem;color:rgba(255,255,255,0.35);padding:12px 0;">
        No doctors found for this specialty yet.</p>`;
      return;
    }

    docs.forEach(doc => {
      const card = document.createElement('div');
      card.className = 'doctor-card';
      card.dataset.docId = doc.id;
      card.innerHTML = `
        <div class="doctor-card-name">👨‍⚕️ ${doc.name}</div>
        <div class="doctor-card-clinic">${doc.clinic || 'Private Practice'}</div>
        <div class="doctor-card-city">📍 ${doc.city || '—'}</div>
        <button class="btn-book-now" onclick="openBookPanel(${doc.id}, '${escHtml(doc.name)}', '${escHtml(doc.clinic || '')}', '${escHtml(doc.city || '')}')">
          Book Appointment →
        </button>`;
      grid.appendChild(card);
    });
  } catch (e) {
    if (loading) loading.style.display = 'none';
    if (grid) grid.innerHTML = `<p style="color:rgba(255,100,100,0.6);font-size:0.85rem;">Failed to load doctors.</p>`;
  }
}

// ─────────────────────────────────────────────────────────
// Open booking sub-panel
// ─────────────────────────────────────────────────────────
async function openBookPanel(docId, docName, clinic, city) {
  _currentDoctorId   = docId;
  _currentDoctorName = docName;
  _selectedSlotId    = null;
  _selectedSlotLabel = '';

  const overlay = document.getElementById('book-overlay');
  const body    = document.getElementById('book-panel-body');

  body.innerHTML = `
    <h3>👨‍⚕️ ${docName}</h3>
    <p class="sub-head">${clinic} · ${city}</p>
    <div class="slots-section">
      <label>Select an Available Slot</label>
      <div class="slots-list" id="slots-list">
        <span style="font-size:0.82rem;color:rgba(255,255,255,0.3);">
          <span class="loading-dots"><span></span><span></span><span></span></span> Loading slots…
        </span>
      </div>
    </div>
    <div class="book-form">
      <div class="book-form-row">
        <div class="book-field">
          <label>Your Name *</label>
          <input type="text" id="bf-name" placeholder="Full Name" />
        </div>
        <div class="book-field">
          <label>Phone Number *</label>
          <input type="tel" id="bf-phone" placeholder="+91 XXXXXXXXXX" />
        </div>
      </div>
      <div class="book-field">
        <label>Email Address *</label>
        <input type="email" id="bf-email" placeholder="your@email.com" />
      </div>
      <div class="book-field">
        <label>Additional Notes</label>
        <textarea id="bf-notes" placeholder="Any additional information for the doctor…"></textarea>
      </div>
      <button class="btn-confirm-book" id="btn-confirm-book" onclick="confirmBooking()">
        ✓ Confirm Appointment
      </button>
    </div>`;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Load slots
  try {
    const res     = await fetch(`/api/slots/${docId}`);
    _allSlots     = await res.json();
    renderSlots(_allSlots);
  } catch {
    document.getElementById('slots-list').innerHTML =
      '<span class="no-slots-msg">Failed to load slots.</span>';
  }
}

function renderSlots(slots) {
  const container = document.getElementById('slots-list');
  if (!slots.length) {
    container.innerHTML = '<span class="no-slots-msg">No available slots in the next 14 days.</span>';
    return;
  }

  // Group by date
  const byDate = {};
  slots.forEach(s => {
    if (!byDate[s.slot_date]) byDate[s.slot_date] = [];
    byDate[s.slot_date].push(s);
  });

  container.innerHTML = '';
  Object.entries(byDate).forEach(([date, daySlots]) => {
    const dateEl = document.createElement('div');
    dateEl.className = 'slot-date-header';
    dateEl.textContent = formatDate(date);
    container.appendChild(dateEl);

    daySlots.forEach(s => {
      const btn = document.createElement('button');
      btn.className = 'slot-btn';
      btn.dataset.slotId = s.id;
      btn.textContent = `${fmt12(s.start_time)} – ${fmt12(s.end_time)}`;
      btn.onclick = () => selectSlot(btn, s.id, `${formatDate(date)}, ${fmt12(s.start_time)} – ${fmt12(s.end_time)}`);
      container.appendChild(btn);
    });
  });
}

function selectSlot(btn, slotId, label) {
  document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('picked'));
  btn.classList.add('picked');
  _selectedSlotId    = slotId;
  _selectedSlotLabel = label;
}

// ─────────────────────────────────────────────────────────
// Confirm booking
// ─────────────────────────────────────────────────────────
async function confirmBooking() {
  const name  = document.getElementById('bf-name').value.trim();
  const phone = document.getElementById('bf-phone').value.trim();
  const email = document.getElementById('bf-email').value.trim();
  const notes = document.getElementById('bf-notes').value.trim();

  if (!name || !phone || !email) {
    shake(document.getElementById('btn-confirm-book'));
    alert('Please fill in your name, phone and email.');
    return;
  }
  if (!_selectedSlotId) {
    alert('Please select a time slot first.');
    return;
  }

  // Get symptoms from the form
  const checkedBoxes = document.querySelectorAll('input[name="symptom"]:checked');
  const symptoms     = Array.from(checkedBoxes).map(c => c.value).join(', ');

  const btn = document.getElementById('btn-confirm-book');
  btn.disabled = true;
  btn.textContent = 'Booking…';

  try {
    const res  = await fetch('/api/book', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        slot_id      : _selectedSlotId,
        doctor_id    : _currentDoctorId,
        patient_name : name,
        patient_email: email,
        patient_phone: phone,
        disease      : _currentDisease,
        symptoms     : symptoms,
        notes        : notes,
      })
    });
    const data = await res.json();

    if (data.success) {
      showBookingSuccess(data.appointment, email);
    } else {
      btn.disabled = false;
      btn.textContent = '✓ Confirm Appointment';
      alert(data.error || 'Booking failed. Please try another slot.');
    }
  } catch {
    btn.disabled = false;
    btn.textContent = '✓ Confirm Appointment';
    alert('Network error. Please try again.');
  }
}

function showBookingSuccess(appt, email) {
  const body = document.getElementById('book-panel-body');
  body.innerHTML = `
    <div class="booking-success">
      <div class="check-icon">✓</div>
      <h3>Appointment Confirmed!</h3>
      <p>Your appointment has been successfully booked.</p>
      <div class="booking-detail-box">
        <div style="margin-bottom:8px;"><strong>Doctor:</strong> <span style="color:#e8eaf0;">${appt.doctor_name}</span></div>
        <div style="margin-bottom:8px;"><strong>Clinic:</strong> <span style="color:#e8eaf0;">${appt.clinic}</span></div>
        <div style="margin-bottom:8px;"><strong>Date:</strong> <span style="color:#e8eaf0;">${formatDate(appt.slot_date)}</span></div>
        <div style="margin-bottom:8px;"><strong>Time:</strong> <span style="color:#e8eaf0;">${fmt12(appt.start_time)} – ${fmt12(appt.end_time)}</span></div>
        <div><strong>Condition:</strong> <span style="color:#c4b5fd;">${appt.disease || '—'}</span></div>
      </div>
      <p style="font-size:0.8rem;margin-bottom:20px;">Use your email <strong style="color:#818cf8;">${email}</strong> to view or cancel this booking.</p>
      <a class="btn-view-bookings" href="/my-bookings">View My Bookings →</a>
    </div>`;
}

function closeBookPanel() {
  document.getElementById('book-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// Close on backdrop click
document.addEventListener('click', e => {
  if (e.target.id === 'book-overlay') closeBookPanel();
});

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
function fmt12(t) {
  const [h, m] = t.split(':');
  const hr = parseInt(h);
  const suffix = hr >= 12 ? 'PM' : 'AM';
  return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${suffix}`;
}

function formatDate(d) {
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-IN', {weekday:'short', day:'numeric', month:'short'});
}

function escHtml(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function shake(el) {
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = 'shake 0.4s ease';
}
