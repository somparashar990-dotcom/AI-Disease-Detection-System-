// Disease categories and their associated conditions
const DISEASE_CATEGORIES = {
    'Infectious Diseases': [
        'AIDS',
        'Malaria',
        'Chickenpox',
        'Dengue',
        'Typhoid',
        'Hepatitis A',
        'Hepatitis B',
        'Hepatitis C',
        'Hepatitis D',
        'Hepatitis E',
        'Tuberculosis',
        'Pneumonia',
        'Common Cold',
        'Impetigo'
    ],
    'Digestive & Liver': [
        'GERD',
        'Chronic cholestasis',
        'Peptic ulcer disease',
        'Gastroenteritis',
        'Alcoholic hepatitis',
        'Jaundice'
    ],
    'Respiratory': [
        'Bronchial Asthma',
        'Pneumonia'
    ],
    'Cardiovascular': [
        'Hypertension',
        'Heart disease',
        'Varicose veins'
    ],
    'Neurological': [
        'Migraine',
        'Cervical spondylosis',
        'Paralysis',
        'Vertigo'
    ],
    'Endocrine': [
        'Diabetes',
        'Hyperthyroidism',
        'Hypothyroidism'
    ],
    'Musculoskeletal': [
        'Osteoarthritis',
        'Arthritis'
    ],
    'Skin & Dermatological': [
        'Fungal infections',
        'Acne',
        'Psoriasis',
        'Dimorphic hemmorhoids'
    ],
    'Urinary & Genitourinary': [
        'Urinary tract infection'
    ],
    'Allergies & Reactions': [
        'Allergy',
        'Drug reaction'
    ]
};

// City coordinates for maps
const CITY_COORDINATES = {
    'Ranchi': { lat: 23.3441, lng: 85.3096 },
    'Dhanbad': { lat: 23.7957, lng: 86.4304 },
    'Jamshedpur': { lat: 22.8046, lng: 86.2029 }
};

// Specialist types for each category
const SPECIALIST_TYPES = {
    'Infectious Diseases': 'Infectious Disease Specialist',
    'Digestive & Liver': 'Gastroenterologist',
    'Respiratory': 'Pulmonologist',
    'Cardiovascular': 'Cardiologist',
    'Neurological': 'Neurologist',
    'Endocrine': 'Endocrinologist',
    'Musculoskeletal': 'Orthopedic Doctor',
    'Skin & Dermatological': 'Dermatologist',
    'Urinary & Genitourinary': 'Urologist',
    'Allergies & Reactions': 'Allergist'
};

// Doctor recommendations by category
const DOCTOR_RECOMMENDATIONS = {
    'Infectious Diseases': [
        {
            name: 'Dr. Rajesh Kumar Singh',
            city: 'Ranchi',
            clinic: 'Devra Clinic & Diagnostics',
            contact: '+91 9876543210',
            mapLink: 'https://www.google.com/maps/search/Devra+Clinic+%26+Diagnostics+Ranchi'
        },
        {
            name: 'Dr. V.S.V. Prasad',
            city: 'Dhanbad',
            clinic: 'The Internal Medicine Clinic',
            contact: '+91 8765432109',
            mapLink: 'https://www.google.com/maps/search/The+Internal+Medicine+Clinic+Dhanbad'
        },
        {
            name: 'Dr. S. K. Mishra',
            city: 'Jamshedpur',
            clinic: 'Consultant Physician Clinic',
            contact: '+91 7654321098',
            mapLink: 'https://www.google.com/maps/search/Consultant+Physician+Clinic+Jamshedpur'
        }
    ],
    'Digestive & Liver': [
        {
            name: 'Dr. Deepak Kumar',
            city: 'Ranchi',
            clinic: 'Manipal Hospital',
            contact: '+91 6543210987',
            mapLink: 'https://www.google.com/maps/search/Manipal+Hospital+Ranchi'
        },
        {
            name: 'Dr. Rajan Kumar Barnwal',
            city: 'Jamshedpur',
            clinic: 'Barnwal Clinic',
            contact: '+91 9123456780',
            mapLink: 'https://www.google.com/maps/search/Barnwal+Clinic+Jamshedpur'
        },
        {
            name: 'Dr. Aloke',
            city: 'Dhanbad',
            clinic: 'Tata Central Hospital',
            contact: '+91 8234567891',
            mapLink: 'https://www.google.com/maps/search/Tata+Central+Hospital+Dhanbad'
        }
    ],
    'Respiratory': [
        {
            name: 'Dr. Ankush Sharma',
            city: 'Ranchi',
            clinic: 'Dr Ankush Sharma Clinic',
            contact: '+91 7345678902',
            mapLink: 'https://www.google.com/maps/search/Dr+Ankush+Sharma+Clinic+Ranchi'
        },
        {
            name: 'Dr. Satish Kumar Prasad',
            city: 'Jamshedpur',
            clinic: 'Prasad Chest Clinic',
            contact: '+91 9456789013',
            mapLink: 'https://www.google.com/maps/search/Prasad+Chest+Clinic+Jamshedpur'
        },
        {
            name: 'Dr. Shambhavi Narayan',
            city: 'Dhanbad',
            clinic: 'Shwet Shree Clinic',
            contact: '+91 8567890124',
            mapLink: 'https://www.google.com/maps/search/Shwet+Shree+Clinic+Dhanbad'
        }
    ],
    'Cardiovascular': [
        {
            name: 'Dr. Rajiv Kumar',
            city: 'Ranchi',
            clinic: 'Maa Medical Hall',
            contact: '+91 7678901235',
            mapLink: 'https://www.google.com/maps/search/Maa+Medical+Hall+Ranchi'
        },
        {
            name: 'Dr. R C Choudhary',
            city: 'Dhanbad',
            clinic: 'Katras Nursing Home',
            contact: '+91 9789012346',
            mapLink: 'https://www.google.com/maps/search/Katras+Nursing+Home+Dhanbad'
        },
        {
            name: 'Dr. Raihan Ahmad',
            city: 'Ranchi',
            clinic: 'Private Practice',
            contact: '+91 8890123457',
            mapLink: 'https://www.google.com/maps/search/Dr+Raihan+Ahmad+Ranchi'
        }
    ],
    'Neurological': [
        {
            name: 'Dr. Sanjay Kumar',
            city: 'Ranchi',
            clinic: 'Kadru Clinic',
            contact: '+91 7901234568',
            mapLink: 'https://www.google.com/maps/search/Kadru+Clinic+Ranchi'
        },
        {
            name: 'Dr. Sheetal Sadashiv Bankar',
            city: 'Ranchi',
            clinic: 'Manipal Hospital',
            contact: '+91 9012345679',
            mapLink: 'https://www.google.com/maps/search/Manipal+Hospital+Ranchi'
        },
        {
            name: 'Dr. Raj Kumar Prasad',
            city: 'Dhanbad',
            clinic: 'Matri Sadan',
            contact: '+91 8123456780',
            mapLink: 'https://www.google.com/maps/search/Matri+Sadan+Dhanbad'
        }
    ],
    'Endocrine': [
        {
            name: 'Dr. S. K. Mishra',
            city: 'Jamshedpur',
            clinic: 'Consultant Physician & Diabetologist',
            contact: '+91 7234567891',
            mapLink: 'https://www.google.com/maps/search/Consultant+Physician+Diabetologist+Jamshedpur'
        },
        {
            name: 'Dr. Deepak Chandra Prakash',
            city: 'Ranchi',
            clinic: 'Manipal Hospital',
            contact: '+91 9345678902',
            mapLink: 'https://www.google.com/maps/search/Manipal+Hospital+Ranchi'
        },
        {
            name: 'Dr. Sunil Kumar Singh',
            city: 'Ranchi',
            clinic: 'Shyam Medical Hall',
            contact: '+91 8456789013',
            mapLink: 'https://www.google.com/maps/search/Shyam+Medical+Hall+Ranchi'
        }
    ],
    'Musculoskeletal': [
        {
            name: 'Dr. Rakesh Mishra',
            city: 'Ranchi',
            clinic: 'Orthopedic Clinic',
            contact: '+91 7567890124',
            mapLink: 'https://www.google.com/maps/search/Orthopedic+Clinic+Ranchi'
        },
        {
            name: 'Dr. Avinash Kumar',
            city: 'Ranchi',
            clinic: 'Orthopedic Practice',
            contact: '+91 9678901235',
            mapLink: 'https://www.google.com/maps/search/Orthopedic+Practice+Ranchi'
        },
        {
            name: 'Dr. Uma Shankar Verma',
            city: 'Ranchi',
            clinic: 'Verma Clinic',
            contact: '+91 8789012346',
            mapLink: 'https://www.google.com/maps/search/Verma+Clinic+Ranchi'
        }
    ],
    'Skin & Dermatological': [
        {
            name: 'Dr. Abhinav Sahay',
            city: 'Ranchi',
            clinic: 'Allo Sexual Health Clinic',
            contact: '+91 7890123457',
            mapLink: 'https://www.google.com/maps/search/Allo+Sexual+Health+Clinic+Ranchi'
        },
        {
            name: 'Dr. Pooja Alankar',
            city: 'Ranchi',
            clinic: 'Dermatology Practice',
            contact: '+91 9901234568',
            mapLink: 'https://www.google.com/maps/search/Dermatology+Clinic+Ranchi'
        },
        {
            name: 'Dr. Subodh Kumar Singh',
            city: 'Ranchi',
            clinic: 'Skin Clinic',
            contact: '+91 8012345679',
            mapLink: 'https://www.google.com/maps/search/Skin+Clinic+Ranchi'
        }
    ],
    'Urinary & Genitourinary': [
        {
            name: 'Dr. Tushar Arya',
            city: 'Ranchi',
            clinic: 'Arya Clinic',
            contact: '+91 7123456780',
            mapLink: 'https://www.google.com/maps/search/Arya+Clinic+Ranchi'
        },
        {
            name: 'Dr. Ratnesh Dubey',
            city: 'Ranchi',
            clinic: 'Private Practice',
            contact: '+91 9234567891',
            mapLink: 'https://www.google.com/maps/search/Dr+Ratnesh+Dubey+Ranchi'
        },
        {
            name: 'Dr. Brij Bhushan Sahni',
            city: 'Dhanbad',
            clinic: 'Kumar & Associates',
            contact: '+91 8345678902',
            mapLink: 'https://www.google.com/maps/search/Kumar+%26+Associates+Dhanbad'
        }
    ],
    'Allergies & Reactions': [
        {
            name: 'Dr. Prashanta Kumar Sen Gupta',
            city: 'Ranchi',
            clinic: 'Family Health Centre',
            contact: '+91 7456789013',
            mapLink: 'https://www.google.com/maps/search/Family+Health+Centre+Ranchi'
        },
        {
            name: 'Dr. Chandan Barnwal',
            city: 'Ranchi',
            clinic: 'Barnwal Clinic',
            contact: '+91 9567890124',
            mapLink: 'https://www.google.com/maps/search/Barnwal+Clinic+Ranchi'
        },
        {
            name: 'Dr. Suresh Kumar Agarwalla',
            city: 'Ranchi',
            clinic: 'Agarwalla Clinic',
            contact: '+91 8678901235',
            mapLink: 'https://www.google.com/maps/search/Agarwalla+Clinic+Ranchi'
        }
    ]
};

// Reverse mapping: disease name to category
const DISEASE_TO_CATEGORY = {};

// Build the reverse mapping
Object.entries(DISEASE_CATEGORIES).forEach(([category, diseases]) => {
    diseases.forEach(disease => {
        DISEASE_TO_CATEGORY[disease.toLowerCase()] = category;
    });
});

// Function to get the category for a disease
function getDiseaseCategory(diseaseName) {
    return DISEASE_TO_CATEGORY[diseaseName.toLowerCase()] || 'Other';
}

// Function to get all diseases in a category
function getDiseasesByCategory(category) {
    return DISEASE_CATEGORIES[category] || [];
}

// Function to get all categories
function getAllCategories() {
    return Object.keys(DISEASE_CATEGORIES);
}

// Function to get specialist type for a category
function getSpecialistType(category) {
    return SPECIALIST_TYPES[category] || 'General Practitioner';
}

// Function to get doctors for a category
function getDoctorsByCategory(category) {
    return DOCTOR_RECOMMENDATIONS[category] || [];
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DISEASE_CATEGORIES,
        SPECIALIST_TYPES,
        DOCTOR_RECOMMENDATIONS,
        DISEASE_TO_CATEGORY,
        CITY_COORDINATES,
        getDiseaseCategory,
        getDiseasesByCategory,
        getAllCategories,
        getSpecialistType,
        getDoctorsByCategory
    };
}
