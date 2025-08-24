import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Github, ChevronLeft, ChevronRight } from 'lucide-react';
import API_BASE_URL from '../config/api';

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  tags: string[];
  demoUrl: string;
  repoUrl: string;
  featured: boolean;
}

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <div className="rounded-xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-gray-800 group">
      <div className="relative overflow-hidden">
        <img 
          src={project.image} 
          alt={project.title} 
          className="w-full h-64 object-cover object-center transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
          <div className="p-6 w-full">
            <div className="flex gap-4 justify-end">
              {project.demoUrl && (
                <a 
                  href={project.demoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-white/90 rounded-full text-gray-800 hover:bg-blue-600 hover:text-white transition-colors"
                  aria-label={`View live demo of ${project.title}`}
                >
                  <ExternalLink size={18} />
                </a>
              )}
              {project.repoUrl && (
                <a 
                  href={project.repoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-white/90 rounded-full text-gray-800 hover:bg-blue-600 hover:text-white transition-colors"
                  aria-label={`View source code of ${project.title}`}
                >
                  <Github size={18} />
                </a>
              )}
            </div>
          </div>
        </div>
        {project.featured && (
          <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs px-3 py-1 rounded-full">
            Featured
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 dark:text-white">{project.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2 dark:text-gray-300">{project.description}</p>
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span 
              key={tag} 
              className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [tags, setTags] = useState<string[]>([]);
  const projectsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch all available tags
    const fetchTags = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/tags`);
        if (!response.ok) throw new Error('Failed to fetch tags');
        const data = await response.json();
        setTags(data.map((tag: { name: string }) => tag.name));
      } catch (err) {
        console.error('Error fetching tags:', err);
      }
    };

    fetchTags();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        // Construct URL based on filter
        let url = `${API_BASE_URL}/projects`;
        if (filter === 'featured') {
          url += '?featured=true';
        } else if (filter !== 'all') {
          url += `?tag=${filter}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch projects');
        const data = await response.json();
        setProjects(data);
        setError(null);
      } catch (err) {
        setError('Failed to load projects. Please try again later.');
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [filter]);

  useEffect(() => {
    setCurrentPage(1); // reset page on filter change
  }, [filter]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
        }
      });
    }, { threshold: 0.1 });

    const projectsElement = projectsRef.current;
    if (projectsElement) observer.observe(projectsElement);
    return () => {
      if (projectsElement) observer.unobserve(projectsElement);
    };
  }, []);

  // Calculate pagination
  const projectsPerPage = 3;
  const totalPages = Math.ceil(projects.length / projectsPerPage);
  const startIndex = (currentPage - 1) * projectsPerPage;
  const currentProjects = projects.slice(startIndex, startIndex + projectsPerPage);

  const handleFilterChange = (filterValue: string) => {
    setFilter(filterValue);
  };

  return (
    <section id="projects" className="py-20 dark:bg-gray-900" ref={projectsRef}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 opacity-0 transform translate-y-8 transition-all duration-1000 ease-out animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
            My <span className="text-blue-600 dark:text-blue-400">Projects</span>
          </h2>
          <div className="w-20 h-1 bg-blue-600 dark:bg-blue-400 mx-auto rounded-full mb-6"></div>
          <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
            Browse through my latest projects and explore what I've been working on. Each project 
            represents my passion for creating intuitive and innovative solutions.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-5 py-2 rounded-full text-sm transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white dark:bg-blue-500'
                : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            } shadow-sm`}
          >
            All Projects
          </button>
          <button
            onClick={() => handleFilterChange('featured')}
            className={`px-5 py-2 rounded-full text-sm transition-all ${
              filter === 'featured'
                ? 'bg-blue-600 text-white dark:bg-blue-500'
                : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            } shadow-sm`}
          >
            Featured
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleFilterChange(tag)}
              className={`px-5 py-2 rounded-full text-sm transition-all ${
                filter === tag
                  ? 'bg-blue-600 text-white dark:bg-blue-500'
                  : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              } shadow-sm`}
            >
              {tag}
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
        ) : projects.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No projects found for the selected filter.
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-10 space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                  aria-label="Previous Page"
                >
                  <ChevronLeft />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded-full text-sm ${
                      currentPage === i + 1
                        ? 'bg-blue-600 text-white dark:bg-blue-500'
                        : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                  aria-label="Next Page"
                >
                  <ChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Projects;