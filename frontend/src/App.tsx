import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Composants de page principale
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import CustomCursor from './components/CustomCursor';

// Composants admin
import Login from './components/Login';
import AdminLayout from './components/AdminLayout';
import CreateProject from './components/CreateProject';
import AdminProjects from './components/AdminProjects';
import AdminSkills from './components/AdminSkills';

// // Pages admin (à créer si elles n'existent pas encore)
// import AdminDashboard from './pages/admin/Dashboard';
// import AdminSkills from './pages/admin/Skills';
// import AdminTags from './pages/admin/Tags';
// import AdminMessages from './pages/admin/Messages';

import { initializeTheme } from './utils/theme';
import './styles/animations.css';
import AdminContacts from './components/AdminContacts';

// Composant pour la page d'accueil
const HomePage = () => {
  useEffect(() => {
    // Set page title
    document.title = 'Mohamed NDIAYE | Creative Developer & Designer';
      
    // Add smooth scrolling to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const href = (e.currentTarget as HTMLAnchorElement).getAttribute('href');
        if (href) {
          document.querySelector(href)?.scrollIntoView({
            behavior: 'smooth'
          });
        }
      });
    });
  }, []);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
};

function App() {
  useEffect(() => {
    // Initialize theme settings
    initializeTheme();
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen dark:bg-gray-900 dark:text-white">
        <CustomCursor />
        <Routes>
          {/* Route pour la page principale */}
          <Route path="/" element={<HomePage />} />
          
          {/* Route pour la page de connexion */}
          <Route path="/login" element={<Login />} />
          
          {/* Routes pour l'administration avec le layout admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminProjects />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="projects/create" element={<CreateProject />} /> {/* Nouvelle route */}
            <Route path="skills" element={<AdminSkills />} />
            <Route path="contact" element={<AdminContacts />} />
            <Route path="projects/edit/:id" element={<CreateProject />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;