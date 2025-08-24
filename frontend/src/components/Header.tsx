import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
];

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      // Determine active section based on scroll position
      const sections = navItems.map(item => item.href.substring(1));
      const sectionElements = sections.map(id => document.getElementById(id));
      const scrollPosition = window.scrollY + 100;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header 
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-md py-3' : 'bg-transparent py-6'
      } dark:text-white`}
    >
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <a href="#home" className="text-2xl font-bold tracking-tight">
          <span className="text-blue-600 dark:text-blue-400">Port</span>
          <span>folio</span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`relative font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                activeSection === item.href.substring(1) ? 'text-blue-600 dark:text-blue-400' : ''
              }`}
              onClick={(e) => {
                e.preventDefault();
                document.querySelector(item.href)?.scrollIntoView({
                  behavior: 'smooth'
                });
              }}
            >
              {item.label}
              {activeSection === item.href.substring(1) && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </a>
          ))}
          <ThemeToggle />
        </nav>

        {/* Mobile Navigation Toggle */}
        <div className="flex items-center md:hidden">
          <ThemeToggle />
          <button
            onClick={toggleMenu}
            className="ml-4 p-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {/* Mobile Menu */}
<div
  className={`fixed inset-0 z-40 bg-white dark:bg-gray-900 transition-transform duration-300 ease-in-out ${
    isMenuOpen ? 'translate-x-0' : 'translate-x-full'
  } md:hidden flex flex-col pt-24 px-4`}
>
  {/* Close Button */}
  <button
    onClick={() => setIsMenuOpen(false)}
    className="absolute top-6 right-6 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
    aria-label="Close mobile menu"
  >
    <X size={28} />
  </button>

  {/* Navigation Links */}
  <nav className="flex flex-col space-y-6 text-center mt-8">
    {navItems.map((item) => (
      <a
        key={item.label}
        href={item.href}
        className={`text-lg font-medium ${
          activeSection === item.href.substring(1)
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-gray-700 dark:text-gray-200'
        }`}
        onClick={(e) => {
          e.preventDefault();
          document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' });
          setIsMenuOpen(false);
        }}
      >
        {item.label}
      </a>
    ))}
  </nav>
</div>

    </header>
  );
};

export default Header;