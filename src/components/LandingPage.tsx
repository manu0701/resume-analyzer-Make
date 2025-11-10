import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { CheckCircle, ArrowRight, FileText, Zap, Shield, TrendingUp, Clock, Upload, Mail, MapPin, Phone } from 'lucide-react';
import { Navigation } from './Navigation';
import { motion } from 'motion/react';
import { User } from '../App';

interface LandingPageProps {
  onGetStarted: () => void;
  user?: User | null;
  onLogout?: () => void;
  onDashboard?: () => void;
}

export function LandingPage({ onGetStarted, user, onLogout, onDashboard }: LandingPageProps) {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/30 to-white">
      {/* Navigation */}
      <Navigation 
        showAuthButtons 
        onGetStarted={onGetStarted}
        onSignIn={onGetStarted}
        onLogoClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        scrollToSection={scrollToSection}
        user={user}
        onLogout={onLogout}
        onDashboard={onDashboard}
      />

      {/* Hero Section with Video Background */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 -z-10">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover blur-xl opacity-20 scale-110"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-business-woman-working-on-a-laptop-in-an-office-44691-large.mp4" type="video/mp4" />
          </video>
          {/* Gradient overlay for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white"></div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div 
            className="inline-block mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-purple-50 text-primary px-6 py-2 rounded-full text-sm font-medium shadow-sm border border-purple-100">
              AI-Powered Resume Enhancement ✨
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            className="text-6xl font-bold text-gray-900 mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Transform Your Resume With{' '}
            <span className="text-primary">AI-Powered</span> Insights
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            className="text-xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Upload your resume and let our advanced AI provide personalized suggestions 
            to help you stand out to employers and land your dream job.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex items-center justify-center gap-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                size="lg" 
                onClick={onGetStarted}
                className="text-base px-8 py-3 h-auto shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Improve My Resume
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => scrollToSection('how-it-works')}
                className="text-base px-8 py-3 h-auto bg-white/90 backdrop-blur-sm border-2 hover:bg-white transition-all duration-300"
              >
                How it works
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust Badges */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <p className="text-sm text-gray-600 font-medium">Trusted by professionals from top companies</p>
            <div className="flex items-center justify-center gap-10 text-gray-500">
              <span className="font-semibold text-lg hover:text-primary transition-colors duration-300 cursor-default">Mercado Libre</span>
              <span className="font-semibold text-lg hover:text-primary transition-colors duration-300 cursor-default">PwC</span>
              <span className="font-semibold text-lg hover:text-primary transition-colors duration-300 cursor-default">Accenture</span>
              <span className="font-semibold text-lg hover:text-primary transition-colors duration-300 cursor-default">Globant</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <div className="bg-purple-50 text-primary px-6 py-2 rounded-full text-sm font-medium border border-purple-100">
                Key Features
              </div>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Why Use Resume Improver?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform provides detailed, personalized feedback to help you create 
              a standout resume that gets noticed by recruiters.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-purple-100 transition-colors">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    AI-Powered Analysis
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our advanced AI provides personalized feedback based on industry best practices 
                    and recruiter preferences.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-6">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Instant Feedback
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Get detailed suggestions and improvements within seconds, no waiting for human reviewers.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-6">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    PDF Compatibility
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Upload your existing resume PDF and get feedback without reformatting or retyping.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-6">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Actionable Suggestions
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Receive specific, practical tips you can implement immediately to improve your resume.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 5 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-6">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Privacy First
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Your resume data is processed securely and never shared with third parties.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 6 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-6">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Easy to Use
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Simple upload process and intuitive interface make improving your resume quick and painless.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 bg-gradient-to-b from-white to-purple-50/30">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <div className="bg-purple-50 text-primary px-6 py-2 rounded-full text-sm font-medium border border-purple-100">
                Simple Process
              </div>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              How Resume Improver Works
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Three simple steps to transform your resume and improve your job search results.
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <motion.div 
                className="inline-flex items-center justify-center w-20 h-20 rounded-full border-4 border-primary text-primary mb-6"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-2xl font-bold">01</span>
              </motion.div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Upload Your Resume
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Simply drag and drop your existing resume PDF or upload it from your device.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <motion.div 
                className="inline-flex items-center justify-center w-20 h-20 rounded-full border-4 border-primary text-primary mb-6"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-2xl font-bold">02</span>
              </motion.div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                AI Analysis
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Our advanced AI instantly analyzes your resume against industry standards and best practices.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <motion.div 
                className="inline-flex items-center justify-center w-20 h-20 rounded-full border-4 border-primary text-primary mb-6"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-2xl font-bold">03</span>
              </motion.div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Get Actionable Feedback
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Receive detailed suggestions and a personalized action plan to improve your resume.
              </p>
            </motion.div>
          </div>

          {/* CTA */}
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                size="lg" 
                onClick={onGetStarted}
                className="text-base px-10 py-3 h-auto shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-white">Resume Improver</span>
              </div>
              <p className="text-sm leading-relaxed">
                Transform your resume with AI-powered insights and land your dream job.
              </p>
            </div>

            {/* Product Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors cursor-pointer">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors cursor-pointer">
                    How It Works
                  </button>
                </li>
                <li>
                  <button onClick={onGetStarted} className="hover:text-white transition-colors cursor-pointer">
                    Get Started
                  </button>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:info@resumeimprover.com" className="hover:text-white transition-colors">
                    info@resumeimprover.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Buenos Aires, Argentina</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-800 text-sm text-center">
            <p>© 2024 Resume Improver. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}