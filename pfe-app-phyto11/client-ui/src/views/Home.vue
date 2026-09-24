<template>
  <!-- Navigation Bar -->
  <nav class="navbar">
    <div class="logo-container">
      <img src="/png/logo.png" alt="" class="h-60px">
    </div>

    <div class="nav-links">
      <a href="#" class="active">Home</a>
      <a href="#">About</a>
      <a href="#">Services</a>
      <a href="#">Research</a>
      <a href="#">Contact</a>
    </div>

    <div class="auth-buttons">
      <button class="signin-btn" @click="handleSignIn">Sign In</button>
      <button class="signup-btn" @click="handleSignUp">Sign Up</button>
    </div>
  </nav>

  <!-- Hero Section with Background Image -->
  <section class="hero-section">
    <div class="hero-overlay">
      <div class="hero-content">
        <h1 style="color: white;">C'est une plateforme de phytoplancton</h1>
        <p class="hero-subtitle">Advanced phytoplankton monitoring and analysis for researchers and environmental scientists</p>
        <div class="hero-cta">
          <button class="primary-cta">Explore Platform</button>
          <button class="secondary-cta">Learn More</button>
        </div>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section class="features-section">
    <h2 class="section-title">Our Platform Features</h2>
    <p class="section-subtitle">Comprehensive tools for phytoplankton research and analysis</p>
    
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">
          <i class="fas fa-microscope"></i>
        </div>
        <h3>Advanced Imaging</h3>
        <p>High-resolution imaging technology for precise phytoplankton identification and classification.</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">
          <i class="fas fa-chart-line"></i>
        </div>
        <h3>Data Analytics</h3>
        <p>Powerful analytics tools to track phytoplankton populations and environmental changes.</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">
          <i class="fas fa-database"></i>
        </div>
        <h3>Comprehensive Database</h3>
        <p>Access to the largest phytoplankton species database with detailed taxonomic information.</p>
      </div>
    </div>
  </section>

  <!-- About Us Section -->
  <section class="about-section">
    <div class="about-content">
      <h2 class="section-title">About Our Platform</h2>
      <p>PhytoVision is a cutting-edge platform dedicated to phytoplankton research and environmental monitoring. Our mission is to provide scientists, researchers, and environmental agencies with the most advanced tools for phytoplankton analysis.</p>
      <p>Founded in 2015 by a team of marine biologists and data scientists, we combine biological expertise with technological innovation to deliver unparalleled insights into phytoplankton populations and their role in aquatic ecosystems.</p>
      <div class="stats-container">
        <div class="stat-item">
          <span class="stat-number">250+</span>
          <span class="stat-label">Research Institutions</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">5,000+</span>
          <span class="stat-label">Species Cataloged</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">15</span>
          <span class="stat-label">Countries Served</span>
        </div>
      </div>
    </div>
    <div class="about-image">
      <img src="https://www.cytobuoy.com/wp-content/uploads/cytobuoy-application-bio-engineering-08.jpg" alt="Phytoplankton analysis in laboratory">
    </div>
  </section>

  <!-- Testimonials Section -->
  <section class="testimonials-section">
    <h2 class="section-title">What Researchers Say</h2>
    <div class="testimonials-container">
      <div class="testimonial-card">
        <div class="testimonial-text">
          "PhytoVision has revolutionized our phytoplankton monitoring program. The platform's analytical tools have significantly reduced our data processing time."
        </div>
        <div class="testimonial-author">
          <img src="https://randomuser.me/api/portraits/women/45.jpg" alt="Dr. Marie Leclerc">
          <div>
            <h4>Dr. Marie Leclerc</h4>
            <p>Marine Biologist, Université de Marseille</p>
          </div>
        </div>
      </div>
      
      <div class="testimonial-card">
        <div class="testimonial-text">
          "The species identification accuracy is unmatched. This platform has become essential for our environmental impact assessments."
        </div>
        <div class="testimonial-author">
          <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Prof. Hans Müller">
          <div>
            <h4>Prof. Hans Müller</h4>
            <p>Director, Baltic Sea Research Institute</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Call to Action Section -->
  <section class="cta-section">
    <h2>Ready to Transform Your Phytoplankton Research?</h2>
    <p>Join leading research institutions and environmental agencies using our platform</p>
    <button class="primary-cta">Get Started Today</button>
  </section>

  <!-- Footer -->
  <footer class="main-footer">
    <div class="footer-content">
      <div class="footer-logo">
        <span class="logo">PhytoVision</span>
        <p>Advanced phytoplankton analysis platform</p>
      </div>
      
      <div class="footer-links">
        <div class="link-group">
          <h4>Platform</h4>
          <a href="#">Features</a>
          <a href="#">Pricing</a>
          <a href="#">Case Studies</a>
        </div>
        
        <div class="link-group">
          <h4>Resources</h4>
          <a href="#">Documentation</a>
          <a href="#">Research Papers</a>
          <a href="#">Blog</a>
        </div>
        
        <div class="link-group">
          <h4>Company</h4>
          <a href="#">About Us</a>
          <a href="#">Team</a>
          <a href="#">Contact</a>
        </div>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p>&copy; 2025 PhytoVision. All rights reserved.</p>
      <div class="social-links">
        <a href="#"><i class="fab fa-twitter"></i></a>
        <a href="#"><i class="fab fa-linkedin"></i></a>
        <a href="#"><i class="fab fa-researchgate"></i></a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from "vue-router";
import { resetPageBreadcrumbs } from '@/core/helpers/config';

const router = useRouter();

const handleSignIn = () => {
  console.log('Sign In clicked - attempting navigation to sign-in');
  try {
    router.push({ name: 'sign-in' });
    console.log('Navigation to sign-in initiated');
  } catch (error) {
    console.error('Navigation error:', error);
  }
};

const handleSignUp = () => {
  console.log('Sign Up clicked - attempting navigation to sign-up');
  try {
    router.push({ name: 'sign-up' });
    console.log('Navigation to sign-up initiated');
  } catch (error) {
    console.error('Navigation error:', error);
  }
};
onMounted(() => {
  resetPageBreadcrumbs();
});
</script>

<style lang="scss" scoped>
/* Base Styles */
:root {
  --primary-color: #023e8a;
  --primary-dark: #005f92;
  --primary-light: #e6f2f8;
  --text-color: #333;
  --light-text: #777;
  --background-color: #fff;
  --section-bg: #f9f9f9;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
  color: var(--text-color);
  background-color: var(--background-color);
}

/* Navigation Bar */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 5%;
  background-color: var(--background-color);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  top: 0;
  z-index: 100;
}

.logo-container {
  display: flex;
  flex-direction: column;
}

.logo {
  font-size: 1.8rem;
  font-weight: 700;
  color: #023e8a;
}

.logo-subtitle {
  font-size: 0.7rem;
  color: var(--light-text);
  margin-top: -5px;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  text-decoration: none;
  color: var(--text-color);
  font-weight: 500;
  transition: color 0.3s;
  position: relative;
}

.nav-links a:hover {
  color: #023e8a;
}

.nav-links a.active {
  color: #023e8a;
}

.nav-links a.active::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #023e8a;
}

.auth-buttons {
  display: flex;
  gap: 1rem;
}

.signin-btn, .signup-btn {
  padding: 0.6rem 1.5rem;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.signin-btn {
  background: transparent;
  border: 2px solid #023e8a;
  color: #023e8a;
}

.signin-btn:hover {
  background-color: var(--primary-light);
}

.signup-btn {
  background-color: #023e8a;
  border: 2px solid #023e8a;
  color: white;
}

.signup-btn:hover {
  background-color: white;
  border-color: #023e8a;
  color: #023e8a;
}

/* Hero Section */
.hero-section {
  height: 80vh;
  background-image: url('https://img.freepik.com/photos-gratuite/technologie-integree-dans-vie-quotidienne_23-2151887054.jpg?ga=GA1.1.238601098.1749345681&semt=ais_hybrid&w=740');
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
}

.hero-content {
  width: 50%;
  padding: 0 5%;
  color: white;
}

.hero-content h1 {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero-cta {
  display: flex;
  gap: 1rem;
}

.primary-cta, .secondary-cta {
  padding: 0.8rem 2rem;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1rem;
}

.primary-cta {
  background-color: #023e8a;
  border: 2px solid #023e8a;
  color: white;
}

.primary-cta:hover {
  background-color: var(--primary-dark);
  border-color: var(--primary-dark);
}

.secondary-cta {
  background-color: transparent;
  border: 2px solid white;
  color: white;
}

.secondary-cta:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Sections Common Styles */
.section-title {
  font-size: 2.2rem;
  color: #023e8a;
  margin-bottom: 1rem;
  text-align: center;
}

.section-subtitle {
  font-size: 1.1rem;
  color: var(--light-text);
  text-align: center;
  margin-bottom: 3rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

/* Features Section */
.features-section {
  padding: 5rem 5%;
  background-color: var(--section-bg);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.feature-card {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  text-align: center;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 2.5rem;
  color: #023e8a;
  margin-bottom: 1.5rem;
}

.feature-card h3 {
  font-size: 1.4rem;
  margin-bottom: 1rem;
  color: #023e8a;
}

.feature-card p {
  color: var(--light-text);
  line-height: 1.6;
}

/* About Section */
.about-section {
  padding: 5rem 5%;
  display: flex;
  align-items: center;
  gap: 4rem;
}

.about-content {
  flex: 1;
}

.about-content p {
  margin-bottom: 1.5rem;
  line-height: 1.6;
  color: var(--text-color);
}

.about-image {
  flex: 1;
}

.about-image img {
  width: 100%;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.stats-container {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2.2rem;
  font-weight: 700;
  color: #023e8a;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--light-text);
}

/* Testimonials Section */
.testimonials-section {
  padding: 5rem 5%;
  background-color: var(--section-bg);
}

.testimonials-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.testimonial-card {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.testimonial-text {
  font-style: italic;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  color: var(--text-color);
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.testimonial-author img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.testimonial-author h4 {
  color: #023e8a;
  margin-bottom: 0.3rem;
}

.testimonial-author p {
  font-size: 0.9rem;
  color: var(--light-text);
}

/* CTA Section */
.cta-section {
  padding: 5rem 5%;
  text-align: center;
  color: white;
}

.cta-section h2 {
  font-size: 2.2rem;
  margin-bottom: 1rem;
}

.cta-section p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

/* Footer */
.main-footer {
  background-color: #222;
  color: white;
  padding: 4rem 5% 2rem;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 3rem;
  margin-bottom: 3rem;
}

.footer-logo {
  flex: 1;
  min-width: 250px;
}

.footer-logo .logo {
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  display: block;
}

.footer-logo p {
  color: #aaa;
  line-height: 1.6;
}

.footer-links {
  display: flex;
  flex: 2;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 2rem;
}

.link-group {
  min-width: 150px;
}

.link-group h4 {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  color: white;
}

.link-group a {
  display: block;
  color: #aaa;
  text-decoration: none;
  margin-bottom: 0.8rem;
  transition: color 0.3s;
}

.link-group a:hover {
  color: white;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid #444;
  color: #aaa;
  font-size: 0.9rem;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-links a {
  color: white;
  font-size: 1.2rem;
  transition: color 0.3s;
}

.social-links a:hover {
  color: #023e8a;
}

/* Responsive Adjustments */
@media (max-width: 1024px) {
  .hero-content {
    width: 60%;
  }
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem 5%;
  }
  
  .nav-links {
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .hero-content {
    width: 100%;
    text-align: center;
  }
  
  .hero-cta {
    justify-content: center;
  }
  
  .about-section {
    flex-direction: column;
  }
  
  .footer-content {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .hero-content h1 {
    font-size: 2.2rem;
  }
  
  .hero-cta {
    flex-direction: column;
    align-items: center;
  }
  
  .section-title {
    font-size: 1.8rem;
  }
}
</style>