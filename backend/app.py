# app.py
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS, cross_origin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI', 'sqlite:///portfolio.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
# Configuration JWT
app.config['JWT_ERROR_MESSAGE_KEY'] = 'message'
app.config['JWT_DECODE_COMPLETE'] = False

# Email configuration
app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS', 'True').lower() in ('true', '1', 't')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER')
app.config['ADMIN_EMAIL'] = os.environ.get('ADMIN_EMAIL')

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Origin"],
        "supports_credentials": True
    }
})

# Models
project_tags = db.Table('project_tags',
    db.Column('project_id', db.Integer, db.ForeignKey('projects.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.id'), primary_key=True)
)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Project(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    image = db.Column(db.Text)  # Changé de String(255) à Text
    demo_url = db.Column(db.String(255))
    repo_url = db.Column(db.String(255))
    featured = db.Column(db.Boolean, default=False)
    tags = db.relationship('Tag', secondary=project_tags, lazy='subquery',
                          backref=db.backref('projects', lazy=True))

class Tag(db.Model):
    __tablename__ = 'tags'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

class Skill(db.Model):
    __tablename__ = 'skills'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    level = db.Column(db.Integer, nullable=False)
    category = db.Column(db.String(20), nullable=False)

class Contact(db.Model):
    __tablename__ = 'contacts'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

# Helper functions
def send_email(to, subject, template):
    msg = MIMEMultipart()
    msg['Subject'] = subject
    msg['From'] = app.config['MAIL_DEFAULT_SENDER']
    msg['To'] = to
    
    msg.attach(MIMEText(template, 'html'))
    
    try:
        server = smtplib.SMTP(app.config['MAIL_SERVER'], app.config['MAIL_PORT'])
        if app.config['MAIL_USE_TLS']:
            server.starttls()
        if app.config['MAIL_USERNAME'] and app.config['MAIL_PASSWORD']:
            server.login(app.config['MAIL_USERNAME'], app.config['MAIL_PASSWORD'])
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

# Routes
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Missing username or password'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401
    
    if not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    access_token = create_access_token(identity=str(user.id))
    return jsonify({'access_token': access_token}), 200

# Project routes
@app.route('/api/projects', methods=['GET'])
def get_projects():
    featured = request.args.get('featured', '').lower() == 'true'
    tag = request.args.get('tag')
    
    query = Project.query
    
    if featured:
        query = query.filter_by(featured=True)
    
    if tag:
        query = query.join(Project.tags).filter(Tag.name == tag)
    
    projects = query.all()
    
    result = []
    for project in projects:
        result.append({
            'id': project.id,
            'title': project.title,
            'description': project.description,
            'image': project.image,
            'demoUrl': project.demo_url,
            'repoUrl': project.repo_url,
            'featured': project.featured,
            'tags': [tag.name for tag in project.tags]
        })
    
    return jsonify(result)

@app.route('/api/projects/<int:project_id>', methods=['GET'])
def get_project(project_id):
    project = Project.query.get_or_404(project_id)
    
    return jsonify({
        'id': project.id,
        'title': project.title,
        'description': project.description,
        'image': project.image,
        'demoUrl': project.demo_url,
        'repoUrl': project.repo_url,
        'featured': project.featured,
        'tags': [tag.name for tag in project.tags]
    })

from werkzeug.exceptions import BadRequest
@app.route('/api/projects', methods=['POST'])
@jwt_required(optional=False)
def create_project():
    current_user_id = get_jwt_identity()
    # CORRECTION: Utiliser Session.get() au lieu de Query.get()
    user = db.session.get(User, current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    # Vérification que les données JSON sont présentes
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No JSON data provided'}), 400
    except BadRequest:
        return jsonify({'message': 'Invalid JSON format'}), 400
    
    # Validation des champs obligatoires
    required_fields = ['title', 'description']
    for field in required_fields:
        if field not in data or not data[field].strip():
            return jsonify({'message': f'Missing or empty required field: {field}'}), 400
    
    # Validation des tags
    if 'tags' in data and not isinstance(data['tags'], list):
        return jsonify({'message': 'Tags must be an array'}), 400
    
    # VALIDATION: Vérifier la taille de l'image si elle est présente
    if 'image' in data and data['image']:
        # Limite à 10MB pour les images base64 (environ 7.5MB d'image réelle)
        if len(data['image']) > 10 * 1024 * 1024:  # 10MB
            return jsonify({'message': 'Image too large. Maximum size is 10MB'}), 400
    
    project = Project(
        title=data['title'].strip(),
        description=data['description'].strip(),
        image=data.get('image', '').strip() if data.get('image') else None,
        demo_url=data.get('demoUrl', '').strip() if data.get('demoUrl') else None,
        repo_url=data.get('repoUrl', '').strip() if data.get('repoUrl') else None,
        featured=bool(data.get('featured', False))
    )
    
    # CORRECTION: Ajouter le projet à la session avant de traiter les tags
    db.session.add(project)
    
    # Traitement des tags
    if 'tags' in data:
        for tag_name in data['tags']:
            if not isinstance(tag_name, str):
                return jsonify({'message': 'Tag names must be strings'}), 400
            
            tag_name = tag_name.strip()
            if tag_name:  # Ignorer les tags vides
                tag = Tag.query.filter_by(name=tag_name).first()
                if not tag:
                    tag = Tag(name=tag_name)
                    db.session.add(tag)
                project.tags.append(tag)
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        error_message = str(e)
        print(f"Database error during project creation: {error_message}")
        
        # Messages d'erreur plus spécifiques
        if "string data right truncation" in error_message.lower():
            return jsonify({'message': 'One of the fields is too long. Please reduce the content size.'}), 400
        elif "unique constraint" in error_message.lower():
            return jsonify({'message': 'A project with this information already exists.'}), 400
        else:
            return jsonify({'message': f'Database error: {error_message}'}), 500
    
    return jsonify({
        'id': project.id,
        'title': project.title,
        'description': project.description,
        'image': project.image,
        'demoUrl': project.demo_url,
        'repoUrl': project.repo_url,
        'featured': project.featured,
        'tags': [tag.name for tag in project.tags]
    }), 201
    
@app.errorhandler(422)
def handle_unprocessable_entity(e):
    return jsonify({
        'error': 'Unprocessable Entity',
        'message': 'The request was well-formed but was unable to be followed due to semantic errors.'
    }), 422

@app.errorhandler(400)
def handle_bad_request(e):
    return jsonify({
        'error': 'Bad Request',
        'message': 'The request could not be understood by the server due to malformed syntax.'
    }), 400
    
# 5. Ajout de logs pour le débogage
import logging

# Configuration des logs
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Middleware pour logger les requêtes
@app.before_request
def log_request_info():
    logger.debug('Request: %s %s', request.method, request.url)
    if request.is_json:
        logger.debug('JSON Data: %s', request.get_json())

@app.route('/api/projects/<int:project_id>', methods=['PUT'])
@jwt_required(optional=False)
def update_project(project_id):
    current_user_id = get_jwt_identity()
    # CORRECTION: Utiliser Session.get() au lieu de Query.get()
    user = db.session.get(User, current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    project = db.session.get(Project, project_id)
    if not project:
        return jsonify({'message': 'Project not found'}), 404
    
    # Vérification que les données JSON sont présentes
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No JSON data provided'}), 400
    except BadRequest:
        return jsonify({'message': 'Invalid JSON format'}), 400
    
    # Validation des champs obligatoires lors de la mise à jour
    if 'title' in data and not data['title'].strip():
        return jsonify({'message': 'Title cannot be empty'}), 400
    if 'description' in data and not data['description'].strip():
        return jsonify({'message': 'Description cannot be empty'}), 400
    
    # Validation des tags
    if 'tags' in data and not isinstance(data['tags'], list):
        return jsonify({'message': 'Tags must be an array'}), 400
    
    # VALIDATION: Vérifier la taille de l'image si elle est présente
    if 'image' in data and data['image']:
        if len(data['image']) > 10 * 1024 * 1024:  # 10MB
            return jsonify({'message': 'Image too large. Maximum size is 10MB'}), 400
    
    # Mise à jour des champs
    if 'title' in data:
        project.title = data['title'].strip()
    if 'description' in data:
        project.description = data['description'].strip()
    if 'image' in data:
        project.image = data['image'].strip() if data['image'] else None
    if 'demoUrl' in data:
        project.demo_url = data['demoUrl'].strip() if data['demoUrl'] else None
    if 'repoUrl' in data:  
        project.repo_url = data['repoUrl'].strip() if data['repoUrl'] else None
    if 'featured' in data:
        project.featured = bool(data['featured'])
    
    # Mise à jour des tags
    if 'tags' in data:
        # Vider les tags existants
        project.tags.clear()
        
        for tag_name in data['tags']:
            if not isinstance(tag_name, str):
                return jsonify({'message': 'Tag names must be strings'}), 400
            
            tag_name = tag_name.strip()
            if tag_name:  # Ignorer les tags vides
                tag = Tag.query.filter_by(name=tag_name).first()
                if not tag:
                    tag = Tag(name=tag_name)
                    db.session.add(tag)
                project.tags.append(tag)
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        error_message = str(e)
        print(f"Database error during project update: {error_message}")
        
        # Messages d'erreur plus spécifiques
        if "string data right truncation" in error_message.lower():
            return jsonify({'message': 'One of the fields is too long. Please reduce the content size.'}), 400
        elif "unique constraint" in error_message.lower():
            return jsonify({'message': 'A project with this information already exists.'}), 400
        else:
            return jsonify({'message': f'Database error: {error_message}'}), 500
    
    return jsonify({
        'id': project.id,
        'title': project.title,
        'description': project.description,
        'image': project.image,
        'demoUrl': project.demo_url,
        'repoUrl': project.repo_url,
        'featured': project.featured,
        'tags': [tag.name for tag in project.tags]
    }), 200

@app.route('/api/projects/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    project = Project.query.get_or_404(project_id)
    db.session.delete(project)
    db.session.commit()
    
    return jsonify({'message': 'Project deleted successfully'})

# Tags routes
@app.route('/api/tags', methods=['GET'])
def get_tags():
    tags = Tag.query.all()
    return jsonify([{'id': tag.id, 'name': tag.name} for tag in tags])

# Skills routes
@app.route('/api/skills', methods=['GET'])
def get_skills():
    category = request.args.get('category')
    
    query = Skill.query
    
    if category and category != 'all':
        query = query.filter_by(category=category)
    
    skills = query.all()
    
    return jsonify([{
        'id': skill.id,
        'name': skill.name,
        'level': skill.level,
        'category': skill.category
    } for skill in skills])

@app.route('/api/skills', methods=['POST'])
@jwt_required()
def create_skill():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    data = request.get_json()
    
    required_fields = ['name', 'level', 'category']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'message': f'Missing required field: {field}'}), 400
    
    skill = Skill(
        name=data['name'],
        level=data['level'],
        category=data['category']
    )
    
    db.session.add(skill)
    db.session.commit()
    
    return jsonify({
        'id': skill.id,
        'name': skill.name,
        'level': skill.level,
        'category': skill.category
    }), 201

@app.route('/api/skills/<int:skill_id>', methods=['PUT'])
@jwt_required()
def update_skill(skill_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    skill = Skill.query.get_or_404(skill_id)
    data = request.get_json()
    
    if 'name' in data:
        skill.name = data['name']
    if 'level' in data:
        skill.level = data['level']
    if 'category' in data:
        skill.category = data['category']
    
    db.session.commit()
    
    return jsonify({
        'id': skill.id,
        'name': skill.name,
        'level': skill.level,
        'category': skill.category
    })

@app.route('/api/skills/<int:skill_id>', methods=['DELETE'])
@jwt_required()
def delete_skill(skill_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    skill = Skill.query.get_or_404(skill_id)
    db.session.delete(skill)
    db.session.commit()
    
    return jsonify({'message': 'Skill deleted successfully'})

# Contact routes
@app.route('/api/contact', methods=['POST'])
@cross_origin()
def submit_contact():
    # Vérification que les données JSON sont présentes
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No JSON data provided'}), 400
    except BadRequest:
        return jsonify({'message': 'Invalid JSON format'}), 400
    
    # Validation des champs obligatoires
    required_fields = ['name', 'email', 'subject', 'message']
    for field in required_fields:
        if field not in data or not data[field].strip():
            return jsonify({'message': f'Missing or empty required field: {field}'}), 400
    
    # Validation de l'email
    import re
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, data['email'].strip()):
        return jsonify({'message': 'Invalid email format'}), 400
    
    contact = Contact(
        name=data['name'].strip(),
        email=data['email'].strip(),
        subject=data['subject'].strip(),
        message=data['message'].strip()
    )
    
    try:
        db.session.add(contact)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Database error: {str(e)}'}), 500
    
    # Envoi de l'email de notification à l'admin
    admin_email = app.config.get('ADMIN_EMAIL')
    if admin_email:
        email_subject = f"New Contact Form Submission: {data['subject']}"
        email_body = f"""
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> {data['name']}</p>
        <p><strong>Email:</strong> {data['email']}</p>
        <p><strong>Subject:</strong> {data['subject']}</p>
        <p><strong>Message:</strong></p>
        <p>{data['message']}</p>
        """
        send_email(admin_email, email_subject, email_body)
    
    return jsonify({'message': 'Contact form submitted successfully'}), 201

@app.route('/api/contacts', methods=['GET'])
@jwt_required()
def get_contacts():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    contacts = Contact.query.order_by(Contact.created_at.desc()).all()
    
    return jsonify([{
        'id': contact.id,
        'name': contact.name,
        'email': contact.email,
        'subject': contact.subject,
        'message': contact.message,
        'read': contact.read,
        'created_at': contact.created_at.isoformat()
    } for contact in contacts])

@app.route('/api/contacts/<int:contact_id>', methods=['PUT'])
#@cross_origin()
@jwt_required()
def mark_contact_read(contact_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    contact = Contact.query.get_or_404(contact_id)
    contact.read = True
    db.session.commit()
    
    return jsonify({'message': 'Contact marked as read'})

@app.route('/api/contacts/<int:contact_id>', methods=['DELETE'])
@jwt_required()
def delete_contact(contact_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    contact = Contact.query.get_or_404(contact_id)
    db.session.delete(contact)
    db.session.commit()
    
    return jsonify({'message': 'Contact deleted successfully'})

# --- Frontend route (React SPA) ---
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")

# Admin user creation
@app.cli.command('create-admin')
def create_admin():
    """Create an admin user."""
    from flask.cli import with_appcontext
    
    @with_appcontext
    def _create_admin():
        username = input('Admin username: ')
        email = input('Admin email: ')
        password = input('Admin password: ')
        
        user = User.query.filter((User.username == username) | (User.email == email)).first()
        if user:
            print(f'User already exists with username {username} or email {email}')
            return
        
        admin = User(username=username, email=email, is_admin=True)
        admin.set_password(password)
        db.session.add(admin)
        db.session.commit()
        print(f'Admin user {username} created successfully!')
    
    _create_admin()

if __name__ == '__main__':
    app.run(debug=True)