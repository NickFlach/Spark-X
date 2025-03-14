import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  BarChart3,
  Lock,
  Database,
  ChevronRight,
  Check,
  Menu,
  X,
  Github,
  Twitter,
  Linkedin,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-background to-background/80 pt-20 pb-32">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.2),transparent_40%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.2),transparent_40%)]"></div>
      </div>

      <div className="container-custom relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center px-3 py-1 mb-6 text-sm rounded-full bg-primary/10 text-primary">
            <Shield size={14} className="mr-1" />
            Privacy-First Analytics Platform
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            <span className="text-gradient">Privacy-Preserving</span> Analytics <br />
            for the Modern Web
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-10">
            Gain powerful insights without compromising user privacy. Our platform uses advanced
            cryptographic techniques to ensure data remains anonymous while providing actionable
            analytics.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="gradient" size="lg" className="gap-1" asChild>
              <Link to="/dashboard">
                Get Started <ChevronRight size={16} />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#features">Learn More</a>
            </Button>
          </div>

          <div className="mt-16 relative">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-20"></div>
            <div className="relative glass-morphism rounded-lg overflow-hidden border border-white/20">
              <img
                src="https://placehold.co/1200x600/3b82f6/FFFFFF/png?text=Privacy-Preserving+Analytics+Dashboard"
                alt="Dashboard Preview"
                className="w-full max-w-4xl rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Features = () => {
  const features = [
    {
      icon: <Shield className="w-6 h-6 text-blue-500" />,
      title: 'Privacy-First Approach',
      description:
        'Our platform is built from the ground up with privacy as the core principle, using differential privacy and secure multi-party computation.',
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-purple-500" />,
      title: 'Comprehensive Analytics',
      description:
        'Get detailed insights and visualizations without compromising individual user data through advanced anonymization techniques.',
    },
    {
      icon: <Lock className="w-6 h-6 text-green-500" />,
      title: 'Regulatory Compliance',
      description:
        'Stay compliant with GDPR, CCPA, and other privacy regulations while still collecting the analytics data you need.',
    },
    {
      icon: <Database className="w-6 h-6 text-red-500" />,
      title: 'Secure Data Storage',
      description:
        'All data is encrypted both in transit and at rest, with optional self-hosting for complete data sovereignty.',
    },
  ];

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Advanced Features for Modern Privacy
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform combines powerful analytics capabilities with state-of-the-art
            privacy-preserving technologies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-card rounded-xl p-6 shadow-sm hover-scale card-hover">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      title: 'Data Collection',
      description:
        'Data is collected with privacy-preserving techniques like differential privacy applied at the source.',
    },
    {
      number: '02',
      title: 'Anonymization',
      description:
        'Personal identifiers are removed and data is anonymized using k-anonymity and other techniques.',
    },
    {
      number: '03',
      title: 'Secure Processing',
      description:
        'Data is processed using secure multi-party computation, ensuring no single party can access raw data.',
    },
    {
      number: '04',
      title: 'Insights Generation',
      description:
        'Actionable insights are generated from the anonymized data, with statistical noise to prevent re-identification.',
    },
  ];

  return (
    <section className="py-20">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How Our Privacy-Preserving Analytics Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform uses a combination of advanced techniques to provide powerful analytics
            while protecting individual privacy.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-600 hidden md:block"></div>

          <div className="space-y-12 relative">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col md:flex-row gap-8 items-center ${
                  index % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
              >
                <div className="w-full md:w-1/2 flex justify-center">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-30"></div>
                    <div className="relative w-16 h-16 rounded-full bg-card flex items-center justify-center text-2xl font-bold border border-white/20">
                      {step.number}
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-1/2 text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Pricing = () => {
  const plans = [
    {
      name: 'Starter',
      price: '$99',
      description: 'Perfect for small businesses and startups',
      features: [
        'Up to 100,000 monthly events',
        'Basic privacy protection',
        '7-day data retention',
        'Email support',
        '2 team members',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Professional',
      price: '$299',
      description: 'Ideal for growing businesses with privacy needs',
      features: [
        'Up to 1M monthly events',
        'Advanced privacy protection',
        '30-day data retention',
        'Priority support',
        '5 team members',
        'Custom reports',
      ],
      cta: 'Get Started',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For organizations with advanced privacy requirements',
      features: [
        'Unlimited events',
        'Maximum privacy protection',
        'Custom data retention',
        'Dedicated support',
        'Unlimited team members',
        'Custom integration',
        'Self-hosting option',
      ],
      cta: 'Contact Us',
      popular: false,
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your privacy and analytics needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-card rounded-xl overflow-hidden shadow-sm transition-all duration-300 ${
                plan.popular ? 'ring-2 ring-primary scale-105 md:scale-110' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-gradient text-white text-center py-1 text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-muted-foreground">/month</span>}
                </div>
                <p className="text-muted-foreground mb-6">{plan.description}</p>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button variant={plan.popular ? 'gradient' : 'outline'} className="w-full">
                  {plan.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTA = () => {
  return (
    <section className="py-20">
      <div className="container-custom">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient opacity-90"></div>

          <div className="relative z-10 py-16 px-8 md:px-16 text-white text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Protect User Privacy While Gaining Insights?
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Join thousands of companies that trust our privacy-preserving analytics platform to
              make data-driven decisions without compromising user privacy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="glass" size="lg" className="gap-1" asChild>
                <Link to="/dashboard">
                  Get Started <ChevronRight size={16} />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 text-white border-white/20"
              >
                Schedule a Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-card py-12 border-t">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-bold mb-4 text-gradient">Spark-X</h3>
            <p className="text-muted-foreground mb-4">
              Privacy-preserving analytics platform for the modern web.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Case Studies
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cookie Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  GDPR Compliance
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Spark-X. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-gradient">
            Spark-X
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="nav-link">
              Features
            </a>
            <a href="#" className="nav-link">
              Pricing
            </a>
            <a href="#" className="nav-link">
              Documentation
            </a>
            <a href="#" className="nav-link">
              Blog
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/login">Log In</Link>
            </Button>
            <Button variant="gradient" asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-md" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-96 border-b' : 'max-h-0'
        }`}
      >
        <div className="container-custom py-4 space-y-4">
          <nav className="flex flex-col gap-2">
            <a
              href="#features"
              className="px-3 py-2 rounded-md hover:bg-muted transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Features
            </a>
            <a
              href="#"
              className="px-3 py-2 rounded-md hover:bg-muted transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </a>
            <a
              href="#"
              className="px-3 py-2 rounded-md hover:bg-muted transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Documentation
            </a>
            <a
              href="#"
              className="px-3 py-2 rounded-md hover:bg-muted transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Blog
            </a>
          </nav>

          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/login" onClick={() => setIsOpen(false)}>
                Log In
              </Link>
            </Button>
            <Button variant="gradient" className="w-full" asChild>
              <Link to="/signup" onClick={() => setIsOpen(false)}>
                Sign Up
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
};

export default Landing;
