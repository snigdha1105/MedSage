"""
MedSage Flask API Server
Provides REST API endpoints for signup, login, and user management
"""

import os
import sys
import json
import uuid
import hashlib
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from pathlib import Path

# Load environment variables
load_dotenv()

# In-memory database for simple file-based storage
import sqlite3

# Initialize Flask app
app = Flask(__name__)
# Proper CORS setup for all routes, allow credentials and Authorization header
CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "*"}}, allow_headers=["Content-Type", "Authorization"])
# --- Global handler for OPTIONS (CORS preflight) ---
@app.before_request
def handle_options():
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        headers = response.headers
        headers['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
        headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        headers['Access-Control-Allow-Headers'] = request.headers.get('Access-Control-Request-Headers', 'Authorization, Content-Type')
        headers['Access-Control-Allow-Credentials'] = 'true'
        return response

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
app.config['JWT_ALGORITHM'] = 'HS256'
app.config['JWT_EXPIRATION_HOURS'] = 24

# Initialize in-memory user storage
USERS_DB = {}
LIFESTYLE_DB = {}  # user_id -> list of lifestyle entries
MEDICATIONS_DB = {}  # user_id -> list of medications
APPOINTMENTS_DB = {}  # user_id -> list of appointments
REPORTS_DB = {}  # user_id -> list of medical reports
CONVERSATIONS_DB = {}  # user_id -> list of conversations
medsage_system = None  # Initialize as None, will be set during startup

# File upload configuration
UPLOAD_FOLDER = Path('./uploads')
UPLOAD_FOLDER.mkdir(exist_ok=True, parents=True)
ALLOWED_EXTENSIONS = {'pdf', 'jpg', 'jpeg', 'png', 'bmp', 'tiff', 'docx', 'doc'}

def init_database():
    """Initialize in-memory database"""
    try:
        print("[OK] In-memory database initialized successfully")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to initialize database: {e}")
        return False

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# JWT Token Helper Functions
def generate_token(user_id, email):
    """Generate JWT token for user"""
    try:
        payload = {
            'user_id': user_id,
            'email': email,
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + timedelta(hours=app.config['JWT_EXPIRATION_HOURS'])
        }
        token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm=app.config['JWT_ALGORITHM'])
        return token
    except Exception as e:
        print(f"Error generating token: {e}")
        return None

def verify_token(token):
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=[app.config['JWT_ALGORITHM']])
        return payload
    except jwt.ExpiredSignatureError:
        return {'error': 'Token expired'}
    except jwt.InvalidTokenError:
        return {'error': 'Invalid token'}

def token_required(f):
    """Decorator to require valid JWT token"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Allow OPTIONS requests (CORS preflight) to pass through without token
        if request.method == 'OPTIONS':
            return '', 200
        
        token = None
        
        # Check for token in headers
        if 'Authorization' in request.headers:
            try:
                token = request.headers['Authorization'].split(" ")[1]
            except IndexError:
                return jsonify({'success': False, 'error': 'Invalid authorization header'}), 401
        
        if not token:
            return jsonify({'success': False, 'error': 'Token missing'}), 401
        
        payload = verify_token(token)
        if 'error' in payload:
            return jsonify({'success': False, 'error': payload['error']}), 401
        
        # Pass user data to route
        kwargs['current_user'] = payload
        return f(*args, **kwargs)
    
    return decorated_function

# ==================== Authentication Routes ====================

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'full_name', 'age', 'gender']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'Missing fields: {", ".join(missing_fields)}'
            }), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '').strip()
        full_name = data.get('full_name', '').strip()
        age = data.get('age')
        gender = data.get('gender', '').strip()
        
        # Validate inputs
        if not email or not password or not full_name or not gender:
            return jsonify({
                'success': False,
                'error': 'Please provide valid email, password, name, and gender'
            }), 400
        
        if len(password) < 8:
            return jsonify({
                'success': False,
                'error': 'Password must be at least 8 characters long'
            }), 400
        
        try:
            age = int(age)
            if age < 13 or age > 150:
                return jsonify({
                    'success': False,
                    'error': 'Age must be between 13 and 150'
                }), 400
        except (ValueError, TypeError):
            return jsonify({
                'success': False,
                'error': 'Age must be a valid number'
            }), 400
        
        if gender.lower() not in ['male', 'female', 'other']:
            return jsonify({
                'success': False,
                'error': 'Gender must be male, female, or other'
            }), 400
        
        # Check if email already exists
        if email in USERS_DB:
            return jsonify({
                'success': False,
                'error': 'Email already registered'
            }), 400
        
        # Create new user
        user_id = str(uuid.uuid4())
        USERS_DB[email] = {
            'user_id': user_id,
            'email': email,
            'password_hash': hashlib.sha256(password.encode()).hexdigest(),
            'full_name': full_name,
            'age': age,
            'gender': gender,
            'created_at': datetime.now().isoformat()
        }
        
        # Generate token for newly created user
        token = generate_token(user_id, email)
        
        return jsonify({
            'success': True,
            'user_id': user_id,
            'email': email,
            'full_name': full_name,
            'token': token,
            'message': 'Account created successfully!'
        }), 201
    
    except Exception as e:
        print(f"Signup error: {e}")
        return jsonify({
            'success': False,
            'error': f'Signup failed: {str(e)}'
        }), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Authenticate user and return JWT token"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({
                'success': False,
                'error': 'Email and password are required'
            }), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '').strip()
        
        if not email or not password:
            return jsonify({
                'success': False,
                'error': 'Please provide valid email and password'
            }), 400
        
        # Check if user exists
        if email not in USERS_DB:
            return jsonify({
                'success': False,
                'error': 'Invalid email or password'
            }), 401
        
        user = USERS_DB[email]
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        if user['password_hash'] != password_hash:
            return jsonify({
                'success': False,
                'error': 'Invalid email or password'
            }), 401
        
        # Generate token
        token = generate_token(user['user_id'], email)
        
        return jsonify({
            'success': True,
            'user_id': user['user_id'],
            'email': email,
            'full_name': user['full_name'],
            'token': token,
            'message': 'Login successful!'
        }), 200
    
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({
            'success': False,
            'error': f'Login failed: {str(e)}'
        }), 500

# ==================== User Routes ====================

@app.route('/api/user/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    """Get current user's profile"""
    try:
        if not medsage_system:
            return jsonify({'success': False, 'error': 'System not initialized'}), 500
        
        profile = medsage_system.get_profile(current_user['user_id'])
        
        if not profile:
            return jsonify({
                'success': False,
                'error': 'Profile not found'
            }), 404
        
        return jsonify({
            'success': True,
            'profile': profile
        }), 200
    
    except Exception as e:
        print(f"Get profile error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/user/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    """Update current user's profile"""
    try:
        data = request.get_json()
        
        if not medsage_system:
            return jsonify({'success': False, 'error': 'System not initialized'}), 500
        
        result = medsage_system.update_profile(current_user['user_id'], data)
        
        if not result.get('success'):
            return jsonify({
                'success': False,
                'error': result.get('error', 'Update failed')
            }), 400
        
        return jsonify({
            'success': True,
            'message': 'Profile updated successfully'
        }), 200
    
    except Exception as e:
        print(f"Update profile error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ==================== Health Data Routes ====================

@app.route('/api/health/check', methods=['POST'])
@token_required
def health_check(current_user):
    """Perform health check"""
    try:
        data = request.get_json()
        symptoms = data.get('symptoms', [])
        
        if not medsage_system:
            return jsonify({'success': False, 'error': 'System not initialized'}), 500
        
        result = medsage_system.symptom_checker.analyze_symptoms(symptoms)
        
        return jsonify({
            'success': True,
            'analysis': result
        }), 200
    
    except Exception as e:
        print(f"Health check error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ==================== Lifestyle Routes ====================

@app.route('/api/lifestyle/log', methods=['POST'])
@token_required
def log_lifestyle(current_user):
    """Log lifestyle data"""
    try:
        data = request.get_json()
        date = data.get('date', datetime.now().date().isoformat())
        
        lifestyle_data = {
            'sleep_hours': data.get('sleep_hours'),
            'exercise_minutes': data.get('exercise_minutes'),
            'mood': data.get('mood'),
            'stress_level': data.get('stress_level')
        }
        
        if not medsage_system:
            return jsonify({'success': False, 'error': 'System not initialized'}), 500
        
        result = medsage_system.lifestyle_tracker.log_daily_lifestyle(
            current_user['user_id'],
            date,
            lifestyle_data
        )
        
        return jsonify(result), 201 if result.get('success') else 400
    
    except Exception as e:
        print(f"Log lifestyle error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/lifestyle/summary', methods=['GET'])
@token_required
def get_lifestyle_summary(current_user):
    """Get lifestyle summary"""
    try:
        days = request.args.get('days', 7, type=int)
        
        if not medsage_system:
            return jsonify({'success': False, 'error': 'System not initialized'}), 500
        
        result = medsage_system.lifestyle_tracker.get_lifestyle_summary(
            current_user['user_id'],
            days
        )
        
        return jsonify(result), 200
    
    except Exception as e:
        print(f"Get lifestyle summary error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ==================== Health Status Routes ====================

@app.route('/api/health/score', methods=['GET'])
@token_required
def get_health_score(current_user):
    """Get user's health score"""
    try:
        if not medsage_system:
            return jsonify({'success': False, 'error': 'System not initialized'}), 500
        
        score = medsage_system.health_analyzer.calculate_health_score(current_user['user_id'])
        
        return jsonify({
            'success': True,
            'health_score': score
        }), 200
    
    except Exception as e:
        print(f"Get health score error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ==================== Health Routes ====================

@app.route('/api/health/vital-signs', methods=['POST'])
@token_required
def record_vital_signs(current_user):
    """Record vital signs (blood pressure, heart rate, etc.)"""
    try:
        data = request.get_json()
        
        vitals = {
            'blood_pressure': data.get('blood_pressure'),
            'heart_rate': data.get('heart_rate'),
            'temperature': data.get('temperature'),
            'blood_sugar': data.get('blood_sugar'),
            'bmi': data.get('bmi')
        }
        
        if not medsage_system:
            return jsonify({'success': False, 'error': 'System not initialized'}), 500
        
        # Store vitals in database
        result = medsage_system.store_vitals(current_user['user_id'], vitals)
        
        return jsonify(result), 201 if result.get('success') else 400
    
    except Exception as e:
        print(f"Record vitals error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health/vitals', methods=['GET'])
@token_required
def get_vital_signs(current_user):
    """Get user's vital signs"""
    try:
        days = request.args.get('days', 30, type=int)
        
        if not medsage_system:
            return jsonify({'success': False, 'error': 'System not initialized'}), 500
        
        vitals = medsage_system.get_vitals(current_user['user_id'], days)
        
        return jsonify({
            'success': True,
            'vitals': vitals
        }), 200
    
    except Exception as e:
        print(f"Get vitals error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ==================== Health Routes ====================

@app.route('/api/health/insights', methods=['GET'])
@token_required
def get_health_insights(current_user):
    """Get AI health insights"""
    try:
        if not medsage_system:
            return jsonify({'success': False, 'error': 'System not initialized'}), 500
        
        insights = medsage_system.generate_health_insights(current_user['user_id'])
        
        return jsonify({
            'success': True,
            'insights': insights
        }), 200
    
    except Exception as e:
        print(f"Get insights error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ==================== System Routes ====================

@app.route('/api/health', methods=['GET'])
def health_check_api():
    """API health check"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    }), 200

@app.route('/api/status', methods=['GET'])
def system_status():
    """Get system status"""
    return jsonify({
        'success': True,
        'status': 'running',
        'medsage_initialized': medsage_system is not None,
        'timestamp': datetime.now().isoformat()
    }), 200

# ==================== Medical Reports Routes ====================

@app.route('/api/report/upload', methods=['POST', 'OPTIONS'])
@token_required
def upload_report(current_user):
    """Upload medical report"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'success': False, 'error': 'File type not allowed. Allowed: PDF, JPG, PNG, BMP, TIFF, DOCX'}), 400
        
        # Get form data
        report_name = request.form.get('name', 'Unnamed Report')
        report_type = request.form.get('report_type', 'other')
        notes = request.form.get('notes', '')
        
        # Save file
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = UPLOAD_FOLDER / unique_filename
        file.save(file_path)
        
        # Create report record
        report_id = str(uuid.uuid4())
        report = {
            'id': report_id,
            'name': report_name,
            'report_type': report_type,
            'file_name': filename,
            'file_path': str(file_path),
            'file_size': file.content_length,
            'notes': notes,
            'uploaded_at': datetime.now().isoformat()
        }
        
        user_id = current_user['user_id']
        if user_id not in REPORTS_DB:
            REPORTS_DB[user_id] = []
        
        REPORTS_DB[user_id].append(report)
        
        return jsonify({
            'success': True,
            'message': 'Report uploaded successfully',
            'report': report
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/report/list', methods=['GET', 'OPTIONS'])
@token_required
def list_reports(current_user):
    """Get list of medical reports"""
    try:
        user_id = current_user['user_id']
        reports = REPORTS_DB.get(user_id, [])
        
        return jsonify({
            'success': True,
            'reports': reports
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/report/<report_id>', methods=['GET', 'DELETE', 'OPTIONS'])
@token_required
def manage_report(current_user, report_id):
    """Get or delete a specific report"""
    try:
        user_id = current_user['user_id']
        reports = REPORTS_DB.get(user_id, [])
        
        if request.method == 'GET':
            report = next((r for r in reports if r['id'] == report_id), None)
            if not report:
                return jsonify({'success': False, 'error': 'Report not found'}), 404
            return jsonify({'success': True, 'report': report}), 200
        
        elif request.method == 'DELETE':
            REPORTS_DB[user_id] = [r for r in reports if r['id'] != report_id]
            return jsonify({'success': True, 'message': 'Report deleted'}), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== Medication Routes ====================

@app.route('/api/medication/add', methods=['POST', 'OPTIONS'])
@token_required
def add_medication(current_user):
    """Add a medication"""
    try:
        data = request.get_json()
        med_id = str(uuid.uuid4())
        
        medication = {
            'id': med_id,
            'name': data.get('name'),
            'dosage': data.get('dosage'),
            'frequency': data.get('frequency'),
            'start_date': data.get('start_date'),
            'end_date': data.get('end_date'),
            'notes': data.get('notes'),
            'doses_logged': 0,
            'added_at': datetime.now().isoformat()
        }
        
        user_id = current_user['user_id']
        if user_id not in MEDICATIONS_DB:
            MEDICATIONS_DB[user_id] = []
        
        MEDICATIONS_DB[user_id].append(medication)
        
        return jsonify({
            'success': True,
            'message': 'Medication added successfully',
            'medication': medication
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/medication/active', methods=['GET', 'OPTIONS'])
@token_required
def get_active_medications(current_user):
    """Get active medications"""
    try:
        user_id = current_user['user_id']
        medications = MEDICATIONS_DB.get(user_id, [])
        
        return jsonify({
            'success': True,
            'medications': medications
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/medication/log-dose', methods=['POST', 'OPTIONS'])
@token_required
def log_medication_dose(current_user):
    """Log that medication was taken"""
    try:
        data = request.get_json()
        user_id = current_user['user_id']
        med_id = data.get('medication_id')
        
        medications = MEDICATIONS_DB.get(user_id, [])
        for med in medications:
            if med['id'] == med_id:
                med['doses_logged'] = med.get('doses_logged', 0) + 1
                return jsonify({
                    'success': True,
                    'message': 'Dose logged successfully',
                    'doses_logged': med['doses_logged']
                }), 200
        
        return jsonify({'success': False, 'error': 'Medication not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== Appointment Routes ====================

@app.route('/api/appointment/schedule', methods=['POST', 'OPTIONS'])
@token_required
def schedule_appointment(current_user):
    """Schedule an appointment"""
    try:
        data = request.get_json()
        apt_id = str(uuid.uuid4())
        
        appointment = {
            'id': apt_id,
            'date': data.get('date'),
            'time': data.get('time'),
            'doctor': data.get('doctor'),
            'purpose': data.get('purpose'),
            'location': data.get('location'),
            'notes': data.get('notes'),
            'status': 'scheduled',
            'scheduled_at': datetime.now().isoformat()
        }
        
        user_id = current_user['user_id']
        if user_id not in APPOINTMENTS_DB:
            APPOINTMENTS_DB[user_id] = []
        
        APPOINTMENTS_DB[user_id].append(appointment)
        
        return jsonify({
            'success': True,
            'message': 'Appointment scheduled successfully',
            'appointment': appointment
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/appointment/upcoming', methods=['GET', 'OPTIONS'])
@token_required
def get_upcoming_appointments(current_user):
    """Get upcoming appointments"""
    try:
        user_id = current_user['user_id']
        appointments = APPOINTMENTS_DB.get(user_id, [])
        
        return jsonify({
            'success': True,
            'appointments': appointments
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== Women's Health Routes ====================

@app.route('/api/womens-health/period', methods=['POST', 'OPTIONS'])
@token_required
def log_period(current_user):
    """Log menstrual period"""
    try:
        data = request.get_json()
        period_id = str(uuid.uuid4())
        
        period = {
            'id': period_id,
            'start_date': data.get('start_date'),
            'end_date': data.get('end_date'),
            'flow': data.get('flow', 'medium'),
            'notes': data.get('notes'),
            'logged_at': datetime.now().isoformat()
        }
        
        user_id = current_user['user_id']
        if user_id not in CONVERSATIONS_DB:
            CONVERSATIONS_DB[user_id] = {'periods': [], 'symptoms': []}
        elif 'periods' not in CONVERSATIONS_DB[user_id]:
            CONVERSATIONS_DB[user_id]['periods'] = []
        
        CONVERSATIONS_DB[user_id]['periods'].append(period)
        
        return jsonify({
            'success': True,
            'message': 'Period logged successfully',
            'period': period
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/womens-health/periods', methods=['GET', 'OPTIONS'])
@token_required
def get_periods(current_user):
    """Get period logs"""
    try:
        user_id = current_user['user_id']
        data = CONVERSATIONS_DB.get(user_id, {})
        periods = data.get('periods', [])
        
        return jsonify({
            'success': True,
            'periods': periods
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/womens-health/symptom', methods=['POST', 'OPTIONS'])
@token_required
def log_symptom(current_user):
    """Log symptom"""
    try:
        data = request.get_json()
        symptom_id = str(uuid.uuid4())
        
        symptom = {
            'id': symptom_id,
            'symptom_type': data.get('symptom_type'),
            'severity': data.get('severity', 5),
            'notes': data.get('notes'),
            'date': data.get('date', datetime.now().isoformat()),
            'logged_at': datetime.now().isoformat()
        }
        
        user_id = current_user['user_id']
        if user_id not in CONVERSATIONS_DB:
            CONVERSATIONS_DB[user_id] = {'periods': [], 'symptoms': []}
        elif 'symptoms' not in CONVERSATIONS_DB[user_id]:
            CONVERSATIONS_DB[user_id]['symptoms'] = []
        
        CONVERSATIONS_DB[user_id]['symptoms'].append(symptom)
        
        return jsonify({
            'success': True,
            'message': 'Symptom logged successfully',
            'symptom': symptom
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/womens-health/symptoms', methods=['GET', 'OPTIONS'])
@token_required
def get_symptoms(current_user):
    """Get symptom logs"""
    try:
        user_id = current_user['user_id']
        data = CONVERSATIONS_DB.get(user_id, {})
        symptoms = data.get('symptoms', [])
        
        return jsonify({
            'success': True,
            'symptoms': symptoms
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== Lifestyle Routes (In-Memory Database) ====================

@app.route('/api/lifestyle/activity', methods=['POST', 'OPTIONS'])
@token_required
def log_activity(current_user):
    """Log physical activity"""
    try:
        data = request.get_json()
        activity_id = str(uuid.uuid4())
        
        activity = {
            'id': activity_id,
            'activity_type': data.get('activity_type'),
            'duration': data.get('duration'),
            'intensity': data.get('intensity', 'medium'),
            'calories': data.get('calories'),
            'notes': data.get('notes'),
            'date': data.get('date', datetime.now().isoformat()),
            'logged_at': datetime.now().isoformat()
        }
        
        user_id = current_user['user_id']
        if user_id not in LIFESTYLE_DB:
            LIFESTYLE_DB[user_id] = []
        
        LIFESTYLE_DB[user_id].append(activity)
        
        return jsonify({
            'success': True,
            'message': 'Activity logged successfully',
            'activity': activity
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/lifestyle/meal', methods=['POST', 'OPTIONS'])
@token_required
def log_meal(current_user):
    """Log meal"""
    try:
        data = request.get_json()
        meal_id = str(uuid.uuid4())
        
        meal = {
            'id': meal_id,
            'meal_type': data.get('meal_type'),
            'description': data.get('description'),
            'calories': data.get('calories'),
            'protein': data.get('protein'),
            'carbs': data.get('carbs'),
            'fat': data.get('fat'),
            'notes': data.get('notes'),
            'date': data.get('date', datetime.now().isoformat()),
            'logged_at': datetime.now().isoformat()
        }
        
        user_id = current_user['user_id']
        if user_id not in LIFESTYLE_DB:
            LIFESTYLE_DB[user_id] = []
        
        LIFESTYLE_DB[user_id].append(meal)
        
        return jsonify({
            'success': True,
            'message': 'Meal logged successfully',
            'meal': meal
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/lifestyle/stats', methods=['GET', 'OPTIONS'])
@token_required
def get_lifestyle_stats(current_user):
    """Get lifestyle statistics"""
    try:
        user_id = current_user['user_id']
        entries = LIFESTYLE_DB.get(user_id, [])
        
        # Calculate summary stats
        total_activities = len([e for e in entries if 'activity_type' in e])
        total_meals = len([e for e in entries if 'meal_type' in e])
        total_calories = sum([int(e.get('calories', 0)) for e in entries])
        avg_calories = int(total_calories / (total_meals or 1))
        
        return jsonify({
            'success': True,
            'summary': {
                'total_activities': total_activities,
                'total_meals': total_meals,
                'total_calories': total_calories,
                'average_calories_per_meal': avg_calories,
                'entries': entries[-10:]  # Last 10 entries
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== AI Doctor Routes ====================

@app.route('/api/ai/consult', methods=['POST', 'OPTIONS'])
@token_required
def ai_consult(current_user):
    """Get AI doctor consultation"""
    try:
        data = request.get_json()
        user_id = current_user['user_id']
        question = data.get('question')
        
        # Simple AI response based on question keywords
        response = generate_ai_response(question)
        
        consultation = {
            'id': str(uuid.uuid4()),
            'question': question,
            'response': response,
            'timestamp': datetime.now().isoformat()
        }
        
        if user_id not in CONVERSATIONS_DB:
            CONVERSATIONS_DB[user_id] = {'conversations': []}
        elif 'conversations' not in CONVERSATIONS_DB[user_id]:
            CONVERSATIONS_DB[user_id]['conversations'] = []
        
        CONVERSATIONS_DB[user_id]['conversations'].append(consultation)
        
        return jsonify({
            'success': True,
            'consultation': consultation
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/ai/history', methods=['GET', 'OPTIONS'])
@token_required
def get_consultation_history(current_user):
    """Get AI consultation history"""
    try:
        user_id = current_user['user_id']
        data = CONVERSATIONS_DB.get(user_id, {})
        conversations = data.get('conversations', [])
        
        return jsonify({
            'success': True,
            'conversations': conversations
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def generate_ai_response(question):
    """Generate AI response based on question"""
    question_lower = question.lower()
    
    if 'fever' in question_lower or 'temperature' in question_lower:
        return "For fever: Rest, stay hydrated, and monitor temperature. If fever persists beyond 3 days or exceeds 103°F (39.4°C), seek medical attention."
    elif 'headache' in question_lower:
        return "For headaches: Drink water, rest in a quiet dark room, and take over-the-counter pain relievers. If headaches are persistent or severe, consult a doctor."
    elif 'cough' in question_lower or 'cold' in question_lower:
        return "For cold/cough: Use honey or cough drops, stay hydrated, and get adequate rest. Most colds resolve in 7-10 days. See a doctor if symptoms worsen."
    elif 'sleep' in question_lower or 'insomnia' in question_lower:
        return "For sleep issues: Maintain a consistent sleep schedule, avoid screens before bed, and create a comfortable sleep environment. If insomnia persists, consult a sleep specialist."
    elif 'exercise' in question_lower or 'workout' in question_lower:
        return "For exercise: Aim for 150 minutes of moderate cardio weekly plus 2 days of strength training. Always warm up before and cool down after exercise."
    elif 'diet' in question_lower or 'nutrition' in question_lower:
        return "For healthy eating: Include whole grains, lean proteins, fruits, and vegetables. Limit processed foods, sugar, and sodium. Consult a nutritionist for personalized advice."
    else:
        return "Thank you for your question. For medical concerns, please consult a healthcare professional. This AI assistant provides general health information only."

# ==================== Error Handlers ====================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'success': False,
        'error': 'Route not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

# ==================== Main ====================

if __name__ == '__main__':
    print("=" * 60)
    print("MedSage API Server")
    print("=" * 60)
    
    # Initialize database
    if init_database():
        print("\nStarting Flask API server...")
        print("Server running on http://localhost:5000")
        print("\nAvailable endpoints:")
        print("  POST   /api/auth/signup       - Register new user")
        print("  POST   /api/auth/login        - Login user")
        print("  GET    /api/user/profile      - Get user profile")
        print("  PUT    /api/user/profile      - Update user profile")
        print("  POST   /api/lifestyle/log    - Log lifestyle data")
        print("  GET    /api/lifestyle/summary - Get lifestyle summary")
        print("  GET    /api/health/score     - Get health score")
        print("  POST   /api/health/vital-signs - Record vital signs")
        print("  GET    /api/health/vitals    - Get vital signs")
        print("  GET    /api/health/insights  - Get health insights")
        print("  GET    /api/health           - Health check endpoint")
        print("\nPress Ctrl+C to stop the server")
        print("=" * 60 + "\n")
        
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=False,
            use_reloader=False
        )
    else:
        print("Failed to initialize database. Exiting.")
        sys.exit(1)
