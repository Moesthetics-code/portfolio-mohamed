import React, { useEffect, useRef, useState } from 'react';
import API_BASE_URL from '../config/api';

interface Skill {
  id: number;
  name: string;
  level: number;
  category: string;
}

interface Category {
  id: string;
  label: string;
}

const SkillBar: React.FC<{ skill: Skill; index: number }> = ({ skill, index }) => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bar = entry.target as HTMLElement;
            bar.style.width = `${skill.level}%`;
            bar.style.transitionDelay = `${index * 0.1}s`;
          }
        });
      },
      { threshold: 0.1 }
    );

    const barElement = barRef.current;
    if (barElement) {
      observer.observe(barElement);
    }

    return () => {
      if (barElement) {
        observer.unobserve(barElement);
      }
    };
  }, [skill.level, index]);

  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        <h4 className="font-medium dark:text-white">{skill.name}</h4>
        <span className="text-gray-500 dark:text-gray-400">{skill.level}%</span>
      </div>
      <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          ref={barRef}
          className="h-full bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-500 dark:to-teal-400 rounded-full transition-all duration-1000 ease-out"
          style={{ width: '0%' }}
        ></div>
      </div>
    </div>
  );
};

const Skills: React.FC = () => {
  const skillsRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Définir les catégories disponibles
  const categories: Category[] = [
    { id: 'all', label: 'All Skills' },
    { id: 'front-end', label: 'Front-end' },
    { id: 'back-end', label: 'Back-end' },
    { id: 'design', label: 'Design' },
    { id: 'other', label: 'Other' },
  ];

  useEffect(() => {
    const fetchSkills = async () => {
      setLoading(true);
      try {
        // Construire l'URL en fonction de la catégorie sélectionnée
        let url = `${API_BASE_URL}/skills`;
        if (activeCategory !== 'all') {
          url += `?category=${activeCategory}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch skills');
        const data = await response.json();
        setSkills(data);
        setError(null);
      } catch (err) {
        setError('Failed to load skills. Please try again later.');
        console.error('Error fetching skills:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [activeCategory]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const skillsElement = skillsRef.current;
    if (skillsElement) {
      observer.observe(skillsElement);
    }

    return () => {
      if (skillsElement) {
        observer.unobserve(skillsElement);
      }
    };
  }, []);

  return (
    <section 
      id="skills" 
      className="py-20 bg-gray-50 dark:bg-gray-800/50"
      ref={skillsRef}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 opacity-0 transform translate-y-8 transition-all duration-1000 ease-out animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
            My <span className="text-blue-600 dark:text-blue-400">Skills</span>
          </h2>
          <div className="w-20 h-1 bg-blue-600 dark:bg-blue-400 mx-auto rounded-full mb-6"></div>
          <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
            Here are some of the skills and technologies I've been working with recently.
            I'm constantly learning and expanding my expertise.
          </p>
        </div>

        <div className="flex justify-center flex-wrap gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-5 py-2 rounded-full text-sm transition-all ${
                activeCategory === category.id
                  ? 'bg-blue-600 text-white dark:bg-blue-500'
                  : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              } shadow-sm`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center mx-auto max-w-md">
            {error}
          </div>
        ) : skills.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No skills found for the selected category.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-x-16 gap-y-8">
            {skills.map((skill, index) => (
              <SkillBar key={skill.id} skill={skill} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Skills;