#!/usr/bin/env python
# seed.py - Script to populate the database with initial data

from app import app, db, User, Project, Tag, Skill
from werkzeug.security import generate_password_hash

def seed_database():
    print("Starting database seeding...")
    
    # Clear existing data
    db.session.query(Project).delete()
    db.session.query(Tag).delete()
    db.session.query(Skill).delete()
    db.session.commit()
    print("Cleared existing data")
    
    
    # Create tags
    tag_names = [
        'React', 'Node.js', 'MongoDB', 'Stripe', 'TypeScript', 'Firebase',
        'JavaScript', 'API', 'CSS', 'Tailwind CSS', 'Animation', 'React Native',
        'Redux', 'GraphQL'
    ]
    
    tags = {}
    for tag_name in tag_names:
        tag = Tag(name=tag_name)
        db.session.add(tag)
        tags[tag_name] = tag
    
    db.session.commit()
    print(f"Created {len(tags)} tags")
    
    # Create projects
    projects_data = [
        {
            'title': 'E-Commerce Platform', 
            'description': 'A full-featured online shopping platform with cart functionality, user authentication, and payment processing.', 
            'image': 'https://images.pexels.com/photos/927443/pexels-photo-927443.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 
            'tags': ['React', 'Node.js', 'MongoDB', 'Stripe'], 
            'demo_url': '#', 
            'repo_url': '#', 
            'featured': True
        },
        {
            'title': 'Task Management App', 
            'description': 'A Kanban-style task management application with drag-and-drop functionality and team collaboration features.', 
            'image': 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 
            'tags': ['React', 'TypeScript', 'Firebase'], 
            'demo_url': '#', 
            'repo_url': '#', 
            'featured': True
        },
        {
            'title': 'Weather Dashboard', 
            'description': 'A beautiful weather application with forecast data, location search, and customizable units.', 
            'image': 'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 
            'tags': ['JavaScript', 'API', 'CSS'], 
            'demo_url': '#', 
            'repo_url': '#', 
            'featured': False
        },
        {
            'title': 'Portfolio Website', 
            'description': 'A responsive portfolio website showcasing projects and skills with a modern design.', 
            'image': 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 
            'tags': ['React', 'Tailwind CSS', 'Animation'], 
            'demo_url': '#', 
            'repo_url': '#', 
            'featured': False
        },
        {
            'title': 'Recipe Finder App', 
            'description': 'An application to search, save, and share cooking recipes with ingredient-based filtering.', 
            'image': 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 
            'tags': ['React', 'API', 'Firebase'], 
            'demo_url': '#', 
            'repo_url': '#', 
            'featured': False
        },
        {
            'title': 'Fitness Tracker', 
            'description': 'A workout tracking application with progress visualization and custom routine creation.', 
            'image': 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 
            'tags': ['React Native', 'Redux', 'GraphQL'], 
            'demo_url': '#', 
            'repo_url': '#', 
            'featured': False
        }
    ]
    
    for project_data in projects_data:
        project = Project(
            title=project_data['title'],
            description=project_data['description'],
            image=project_data['image'],
            demo_url=project_data['demo_url'],
            repo_url=project_data['repo_url'],
            featured=project_data['featured']
        )
        
        # Add tags to project
        for tag_name in project_data['tags']:
            project.tags.append(tags[tag_name])
            
        db.session.add(project)
    
    db.session.commit()
    print(f"Created {len(projects_data)} projects")
    
    # Create skills
    skills_data = [
        # Frontend skills
        {'name': 'HTML5', 'level': 90, 'category': 'frontend'},
        {'name': 'CSS3', 'level': 85, 'category': 'frontend'},
        {'name': 'JavaScript', 'level': 90, 'category': 'frontend'},
        {'name': 'TypeScript', 'level': 80, 'category': 'frontend'},
        {'name': 'React', 'level': 85, 'category': 'frontend'},
        {'name': 'Vue.js', 'level': 75, 'category': 'frontend'},
        {'name': 'Angular', 'level': 65, 'category': 'frontend'},
        {'name': 'Tailwind CSS', 'level': 80, 'category': 'frontend'},
        {'name': 'Bootstrap', 'level': 85, 'category': 'frontend'},
        {'name': 'SASS/SCSS', 'level': 75, 'category': 'frontend'},
        {'name': 'Redux', 'level': 80, 'category': 'frontend'},
        
        # Backend skills
        {'name': 'Node.js', 'level': 85, 'category': 'backend'},
        {'name': 'Express.js', 'level': 80, 'category': 'backend'},
        {'name': 'Python', 'level': 85, 'category': 'backend'},
        {'name': 'Flask', 'level': 80, 'category': 'backend'},
        {'name': 'Django', 'level': 75, 'category': 'backend'},
        {'name': 'Ruby on Rails', 'level': 65, 'category': 'backend'},
        {'name': 'PHP', 'level': 70, 'category': 'backend'},
        {'name': 'Java', 'level': 65, 'category': 'backend'},
        {'name': 'GraphQL', 'level': 75, 'category': 'backend'},
        {'name': 'RESTful APIs', 'level': 90, 'category': 'backend'},
        
        # Database skills
        {'name': 'MongoDB', 'level': 85, 'category': 'database'},
        {'name': 'PostgreSQL', 'level': 80, 'category': 'database'},
        {'name': 'MySQL', 'level': 85, 'category': 'database'},
        {'name': 'SQLite', 'level': 80, 'category': 'database'},
        {'name': 'Redis', 'level': 70, 'category': 'database'},
        {'name': 'Firebase', 'level': 80, 'category': 'database'},
        {'name': 'Prisma', 'level': 75, 'category': 'database'},
        {'name': 'Mongoose', 'level': 85, 'category': 'database'},
        
        # DevOps skills
        {'name': 'Git', 'level': 90, 'category': 'devops'},
        {'name': 'Docker', 'level': 75, 'category': 'devops'},
        {'name': 'AWS', 'level': 70, 'category': 'devops'},
        {'name': 'Heroku', 'level': 85, 'category': 'devops'},
        {'name': 'Netlify', 'level': 85, 'category': 'devops'},
        {'name': 'Vercel', 'level': 85, 'category': 'devops'},
        {'name': 'CI/CD', 'level': 75, 'category': 'devops'},
        {'name': 'Linux', 'level': 80, 'category': 'devops'},
        
        # Other skills
        {'name': 'UI/UX Design', 'level': 75, 'category': 'other'},
        {'name': 'Figma', 'level': 80, 'category': 'other'},
        {'name': 'Adobe XD', 'level': 70, 'category': 'other'},
        {'name': 'Photoshop', 'level': 65, 'category': 'other'},
        {'name': 'Illustrator', 'level': 60, 'category': 'other'},
        {'name': 'Jest', 'level': 75, 'category': 'other'},
        {'name': 'Testing Library', 'level': 80, 'category': 'other'},
        {'name': 'Cypress', 'level': 70, 'category': 'other'},
    ]
    
    for skill_data in skills_data:
        skill = Skill(
            name=skill_data['name'],
            level=skill_data['level'],
            category=skill_data['category']
        )
        db.session.add(skill)
    
    db.session.commit()
    print(f"Created {len(skills_data)} skills")
    
    print("Database seeding completed successfully!")

if __name__ == '__main__':
    with app.app_context():
        seed_database()