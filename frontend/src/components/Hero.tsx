import React, { useEffect, useRef } from 'react';
import { ArrowDown, Github as GitHub, Linkedin, Mail } from 'lucide-react';

const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);

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

    const heroElement = heroRef.current;
    if (heroElement) {
      observer.observe(heroElement);
    }

    return () => {
      if (heroElement) {
        observer.unobserve(heroElement);
      }
    };
  }, []);

  return (
    <section 
      id="home" 
      className="min-h-screen flex items-center justify-center pt-20 pb-10 relative dark:bg-gray-900"
      ref={heroRef}
    >
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center opacity-0 transform translate-y-8 transition-all duration-1000 ease-out animate-fade-in">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight dark:text-white">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-400">
              Creative Developer
            </span>
            <br />& Designer
          </h1>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
            I create beautiful, functional, and responsive digital experiences that
            help businesses and individuals achieve their goals.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <a 
              href="#projects" 
              className="px-8 py-3 rounded-full bg-blue-600 text-white font-medium transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 dark:bg-blue-500 dark:hover:bg-blue-600"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('projects')?.scrollIntoView({
                  behavior: 'smooth',
                });
              }}
            >
              View My Work
            </a>
            <a 
              href="#contact" 
              className="px-8 py-3 rounded-full bg-transparent border-2 border-gray-300 text-gray-800 dark:border-gray-700 dark:text-gray-200 font-medium transition-all hover:border-blue-600 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('contact')?.scrollIntoView({
                  behavior: 'smooth',
                });
              }}
            >
              Contact Me
            </a>
          </div>
          
          <div className="flex justify-center space-x-6">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
              <GitHub size={24} />
              <span className="sr-only">GitHub</span>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
              <Linkedin size={24} />
              <span className="sr-only">LinkedIn</span>
            </a>
            <a href="mailto:example@example.com" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
              <Mail size={24} />
              <span className="sr-only">Email</span>
            </a>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <a 
          href="#about"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('about')?.scrollIntoView({
              behavior: 'smooth',
            });
          }}
          className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          aria-label="Scroll down"
        >
          <ArrowDown size={24} />
        </a>
      </div>
      
      {/* Background gradient */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
};

export default Hero;