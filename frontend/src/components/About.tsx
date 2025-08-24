import React, { useEffect, useRef } from 'react';
import { User, Calendar, MapPin, Briefcase } from 'lucide-react';
import profile from '../assets/profile.jpg';

const About: React.FC = () => {
  const aboutRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    const aboutElement = aboutRef.current;
    const imageElement = imageRef.current;
    const contentElement = contentRef.current;

    if (aboutElement) observer.observe(aboutElement);
    if (imageElement) observer.observe(imageElement);
    if (contentElement) observer.observe(contentElement);

    return () => {
      if (aboutElement) observer.unobserve(aboutElement);
      if (imageElement) observer.unobserve(imageElement);
      if (contentElement) observer.unobserve(contentElement);
    };
  }, []);

  return (
    <section 
      id="about" 
      ref={aboutRef}
      className="py-20 dark:bg-gray-900/60"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
            About <span className="text-blue-600 dark:text-blue-400">Me</span>
          </h2>
          <div className="w-20 h-1 bg-blue-600 dark:bg-blue-400 mx-auto rounded-full"></div>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div 
            ref={imageRef}
            className="lg:w-5/12 opacity-0 transform translate-x-8 transition-all duration-1000 ease-out"
          >
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-xl shadow-blue-600/10 dark:shadow-blue-400/5 border-2 border-gray-100 dark:border-gray-800">
                <img 
                  src={profile} 
                  alt="Mon portrait" 
                  className="w-full h-auto object-cover aspect-[3/4]" 
                />
              </div>
              <div className="absolute -bottom-4 -right-4 w-40 h-40 bg-blue-600/10 dark:bg-blue-400/10 rounded-3xl -z-10"></div>
              <div className="absolute -top-4 -left-4 w-40 h-40 bg-teal-500/10 dark:bg-teal-400/10 rounded-3xl -z-10"></div>
            </div>
          </div>

          <div 
            ref={contentRef}
            className="lg:w-7/12 opacity-0 transform -translate-x-8 transition-all duration-1000 ease-out"
          >
            <h3 className="text-2xl font-semibold mb-6 dark:text-white">Full Stack Developer</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
              I'm a passionate full stack developer with 3 years of experience creating 
              beautiful, functional digital experiences. I specialize in both front-end and back-end development,
              with expertise in various frameworks and technologies.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
              My approach combines technical expertise with creative problem-solving, 
              allowing me to deliver robust solutions that not only look good but also perform exceptionally well.
              I'm constantly learning and exploring new technologies to stay at the forefront of web development.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-4">
                  <User size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400">Name</h4>
                  <p className="font-medium dark:text-white">Mohamed NDIAYE</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-4">
                  <Calendar size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400">Experience</h4>
                  <p className="font-medium dark:text-white">3 Years</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-4">
                  <MapPin size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400">Location</h4>
                  <p className="font-medium dark:text-white">Dakar, Sénégal</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-4">
                  <Briefcase size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400">Available For</h4>
                  <p className="font-medium dark:text-white">Freelance & Full-time</p>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <a 
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('contact')?.scrollIntoView({
                    behavior: 'smooth',
                  });
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Contact Me
              </a>
              <a 
                href="#" 
                className="px-6 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:border-blue-600 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors"
                download
              >
                Download CV
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;