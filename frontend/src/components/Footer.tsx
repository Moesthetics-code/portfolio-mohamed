import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 bg-gray-900 text-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-3 gap-12 md:gap-8 mb-12">
          <div>
            <a href="#home" className="text-2xl font-bold tracking-tight mb-4 inline-block">
              <span className="text-blue-400">Port</span>
              <span>folio</span>
            </a>
            <p className="text-gray-400 mt-4 max-w-md">
              A passionate full stack developer with expertise in both front-end and back-end technologies,
              creating beautiful and functional digital experiences.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#home" 
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('home')?.scrollIntoView({
                      behavior: 'smooth',
                    });
                  }}
                >
                  Home
                </a>
              </li>
              <li>
                <a 
                  href="#about" 
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('about')?.scrollIntoView({
                      behavior: 'smooth',
                    });
                  }}
                >
                  About
                </a>
              </li>
              <li>
                <a 
                  href="#skills" 
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('skills')?.scrollIntoView({
                      behavior: 'smooth',
                    });
                  }}
                >
                  Skills
                </a>
              </li>
              <li>
                <a 
                  href="#projects" 
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('projects')?.scrollIntoView({
                      behavior: 'smooth',
                    });
                  }}
                >
                  Projects
                </a>
              </li>
              <li>
                <a 
                  href="#contact" 
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('contact')?.scrollIntoView({
                      behavior: 'smooth',
                    });
                  }}
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Dakar, Sénégal</li>
              <li>mouhamedndiayeisidk@groupeisi.com</li>
              <li>+221 77 877 58 92</li>
              <li>+221 70 329 99 32</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-800 text-center text-gray-400">
          <p className="flex items-center justify-center">
            © {currentYear} Portfolio. Made with 
            <Heart size={16} className="inline-block mx-1 text-red-500" fill="currentColor" /> by 
            <span className="font-medium text-white ml-1">Mohamed NDIAYE</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;