import Hero from './components/Hero';
import Navbar from './components/UI/Navbar';
import Work from './components/Work';
import About from './components/About';
import Services from './components/Services';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  return (
    <div className="app-root grain min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />
      <main>
        <Hero />
        <Work />
        <About />
        <Services />
        <Testimonials />
      </main>
      <Contact />
      <Footer />
    </div>
  );
}

export default App;