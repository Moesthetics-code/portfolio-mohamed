// CreateProject.tsx - Version corrigée avec meilleure gestion d'erreurs
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Upload, Loader } from 'lucide-react';
import API_BASE_URL from '../config/api';

interface Tag {
  id: number;
  name: string;
}

interface CreateProjectFormData {
  title: string;
  description: string;
  image: string;
  demoUrl: string;
  repoUrl: string;
  featured: boolean;
  tags: string[];
}

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Pour l'édition
  const isEditing = Boolean(id);
  
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [formData, setFormData] = useState<CreateProjectFormData>({
    title: '',
    description: '',
    image: '',
    demoUrl: '',
    repoUrl: '',
    featured: false,
    tags: []
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(false);

  // Vérifier l'authentification
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      setAuthError('You must be logged in to create a project.');
    } else {
      setAuthError(null);
    }
  }, []);

  // Charger les tags disponibles
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/tags`);
        if (!response.ok) {
          throw new Error('Failed to fetch tags');
        }
        const data = await response.json();
        setAvailableTags(data);
      } catch (err) {
        console.error('Error fetching tags:', err);
      }
    };

    fetchTags();
  }, []);

  // Charger le projet existant en mode édition
  useEffect(() => {
    if (isEditing && id) {
      const fetchProject = async () => {
        setIsLoadingProject(true);
        try {
          const token = localStorage.getItem('jwtToken');
          const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch project');
          }
          
          const project = await response.json();
          setFormData({
            title: project.title,
            description: project.description,
            image: project.image || '',
            demoUrl: project.demoUrl || '',
            repoUrl: project.repoUrl || '',
            featured: project.featured,
            tags: project.tags || []
          });
          
          if (project.image) {
            setImagePreview(project.image);
          }
        } catch (err) {
          console.error('Error fetching project:', err);
          setErrors({ submit: 'Failed to load project data.' });
        } finally {
          setIsLoadingProject(false);
        }
      };
      
      fetchProject();
    }
  }, [isEditing, id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const handleTagAdd = () => {
    if (!newTag.trim()) return;
    
    const trimmedTag = newTag.trim();
    if (formData.tags.includes(trimmedTag)) {
      return;
    }
    
    setFormData({
      ...formData,
      tags: [...formData.tags, trimmedTag]
    });
    setNewTag('');
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleTagSelect = (tagName: string) => {
    if (formData.tags.includes(tagName)) return;
    
    setFormData({
      ...formData,
      tags: [...formData.tags, tagName]
    });
    setNewTag('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation du fichier
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, image: 'File must be an image' });
      return;
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: 'File size must be less than 5MB' });
      return;
    }

    setIsLoading(true);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageUrl = reader.result as string;
      setImagePreview(imageUrl);
      setFormData({ ...formData, image: imageUrl });
      setIsLoading(false);
      
      // Clear image error
      if (errors.image) {
        setErrors({ ...errors, image: '' });
      }
    };
    
    reader.onerror = () => {
      setErrors({ ...errors, image: 'Failed to read file' });
      setIsLoading(false);
    };
    
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters long';
    }
    
    // Validation des URLs (champs optionnels)
    if (formData.demoUrl && !isValidUrl(formData.demoUrl)) {
      newErrors.demoUrl = 'Please enter a valid URL';
    }
    
    if (formData.repoUrl && !isValidUrl(formData.repoUrl)) {
      newErrors.repoUrl = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setErrors({}); // Clear previous errors
    
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        setAuthError('You must be logged in to create a project.');
        setIsSubmitting(false);
        return;
      }
      
      const url = isEditing 
        ? `${API_BASE_URL}/projects/${id}`
        : `${API_BASE_URL}/projects`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      console.log('Sending request:', {
        url,
        method,
        data: formData
      });
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          demoUrl: formData.demoUrl || null,
          repoUrl: formData.repoUrl || null
        })
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: 'Server error' };
        }
        
        if (response.status === 401 || response.status === 403) {
          setAuthError('Authentication failed. Please log in again.');
          localStorage.removeItem('jwtToken');
        } else if (response.status === 400) {
          // Erreurs de validation du serveur
          setErrors({ submit: errorData.message || 'Invalid data provided' });
        } else if (response.status === 422) {
          // Erreur de validation côté serveur
          setErrors({ submit: errorData.message || 'Data validation failed' });
        } else {
          throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'create'} project`);
        }
      } else {
        const data = await response.json();
        console.log(`Project ${isEditing ? 'updated' : 'created'} successfully:`, data);
        
        // Redirection vers la page d'administration des projets
        navigate('/admin/projects');
      }
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} project:`, err);
      setErrors({ 
        submit: `Failed to ${isEditing ? 'update' : 'create'} project. Please try again.` 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd();
    }
  };

  const filteredTags = availableTags.filter(tag => 
    tag.name.toLowerCase().includes(newTag.toLowerCase()) && 
    !formData.tags.includes(tag.name)
  );

  if (authError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center mx-auto max-w-md mb-4 dark:bg-red-900/30 dark:text-red-400">
          {authError}
        </div>
        <div className="text-center">
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (isLoadingProject) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <section className="py-20 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
            {isEditing ? 'Edit' : 'Create New'} <span className="text-blue-600 dark:text-blue-400">Project</span>
          </h2>
          <div className="w-20 h-1 bg-blue-600 dark:bg-blue-400 mx-auto rounded-full mb-6"></div>
          <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
            {isEditing ? 'Update your project details below.' : 'Add a new project to your portfolio. Fill in the details below to showcase your work.'}
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="mb-6">
              <label 
                htmlFor="title" 
                className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
              >
                Project Title*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.title ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 dark:focus:ring-blue-600'
                }`}
                placeholder="Enter project title"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <label 
                htmlFor="description" 
                className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
              >
                Description*
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.description ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 dark:focus:ring-blue-600'
                }`}
                placeholder="Enter project description"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <label 
                htmlFor="image" 
                className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
              >
                Project Image
              </label>
              <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-64 rounded-lg mx-auto object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData({ ...formData, image: '' });
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    {isLoading ? (
                      <div className="flex justify-center items-center">
                        <Loader size={24} className="animate-spin text-blue-600 dark:text-blue-400" />
                        <span className="ml-2 text-gray-600 dark:text-gray-300">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          Upload an image for your project (max 5MB)
                        </p>
                        <label
                          htmlFor="actual-upload"
                          className="mt-2 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 cursor-pointer transition-colors"
                        >
                          Select File
                        </label>
                      </>
                    )}
                  </div>
                )}
                <input
                  id="actual-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              {errors.image && (
                <p className="text-red-500 text-sm mt-1">{errors.image}</p>
              )}
            </div>

            {/* URLs */}
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <div>
                <label 
                  htmlFor="demoUrl" 
                  className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
                >
                  Demo URL
                </label>
                <input
                  type="url"
                  id="demoUrl"
                  name="demoUrl"
                  value={formData.demoUrl}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.demoUrl ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 dark:focus:ring-blue-600'
                  }`}
                  placeholder="https://..."
                />
                {errors.demoUrl && (
                  <p className="text-red-500 text-sm mt-1">{errors.demoUrl}</p>
                )}
              </div>
              <div>
                <label 
                  htmlFor="repoUrl" 
                  className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
                >
                  Repository URL
                </label>
                <input
                  type="url"
                  id="repoUrl"
                  name="repoUrl"
                  value={formData.repoUrl}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.repoUrl ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 dark:focus:ring-blue-600'
                  }`}
                  placeholder="https://github.com/..."
                />
                {errors.repoUrl && (
                  <p className="text-red-500 text-sm mt-1">{errors.repoUrl}</p>
                )}
              </div>
            </div>

            {/* Featured Checkbox */}
            <div className="mb-6">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:focus:ring-blue-600"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Featured Project</span>
              </label>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <label 
                htmlFor="tags" 
                className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
              >
                Tags
              </label>
              
              <div className="mb-2">
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.map((tag) => (
                      <div 
                        key={tag} 
                        className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm px-3 py-1 rounded-full flex items-center"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleTagRemove(tag)}
                          className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  id="tags"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:ring-blue-600"
                  placeholder="Add tags (press Enter to add)"
                />
                {newTag && filteredTags.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredTags.map((tag) => (
                      <div 
                        key={tag.id}
                        onClick={() => handleTagSelect(tag.name)}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-700 dark:text-gray-200"
                      >
                        {tag.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Type a tag name and press Enter to add it. You can add existing tags or create new ones.
              </p>
            </div>

            {/* Submit Button */}
            <div className="text-center mt-8">
              {errors.submit && (
                <p className="text-red-500 mb-4">{errors.submit}</p>
              )}
              <div className="flex gap-4 justify-center">
                <button
                  type="button"
                  onClick={() => navigate('/admin/projects')}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-blue-600"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <Loader size={20} className="animate-spin mr-2" />
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </span>
                  ) : (
                    isEditing ? 'Update Project' : 'Create Project'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default CreateProject;