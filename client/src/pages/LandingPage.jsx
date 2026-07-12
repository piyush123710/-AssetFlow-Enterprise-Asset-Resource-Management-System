import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap, BarChart3, Database, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-inter selection:bg-indigo-500/30 overflow-hidden relative">
      
      {/* Background Gradients (Linear/Vercel style) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-violet-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Database className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold font-outfit tracking-tight text-white">AssetFlow</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/login">
            <Button variant="ghost" className="hidden sm:inline-flex">Sign In</Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-white text-black hover:bg-gray-200 shadow-none">Get Started</Button>
          </Link>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-24 px-6 sm:px-12 w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-indigo-300 mb-8 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <span>AssetFlow v2.0 is now live</span>
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl sm:text-7xl font-extrabold tracking-tight font-outfit text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-8 max-w-4xl"
          >
            Manage company assets with precision.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl text-slate-400 mb-12 max-w-2xl font-medium leading-relaxed"
          >
            The modern standard for IT asset management. Track laptops, allocate software licenses, and manage audits seamlessly in one unified platform.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto text-base font-semibold bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 group">
                Start for free
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base font-semibold">
                Sign into dashboard
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* Feature Grid */}
        <section className="py-24 px-6 sm:px-12 w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 border-t border-white/5">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-outfit mb-4">Everything you need to scale</h2>
            <p className="text-slate-400 text-lg">Designed for fast-growing startups and enterprises.</p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { icon: Zap, title: "Lightning Fast", desc: "Built on modern web technologies ensuring instant loads and zero lag." },
              { icon: ShieldCheck, title: "Secure by Default", desc: "Enterprise-grade security with role-based access control and audit logs." },
              { icon: BarChart3, title: "Deep Analytics", desc: "Real-time insights into asset utilization, depreciation, and maintenance costs." },
            ].map((feature, idx) => (
              <motion.div key={idx} variants={itemVariants} className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold font-outfit text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-8 border-t border-white/5 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
             <Database className="w-5 h-5 text-indigo-500" />
             <span className="text-lg font-bold font-outfit text-white">AssetFlow</span>
          </div>
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} AssetFlow Inc. All rights reserved.</p>
        </footer>

      </main>
    </div>
  );
};

export default LandingPage;
