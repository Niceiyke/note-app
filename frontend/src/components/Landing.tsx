import { Auth } from './Auth'
import { motion } from 'framer-motion'
import { 
  Zap, Shield, Globe, Smartphone, 
  CheckCircle2, ArrowRight, Sparkles, Layout
} from 'lucide-react'

export function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Onote" className="h-10 w-10 rounded-xl" />
            <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Onote</h1>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-slate-900 transition-colors hidden md:block">Features</a>
            <a href="#pricing" className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-slate-900 transition-colors hidden md:block">Pricing</a>
            <div className="h-4 w-px bg-slate-200 hidden md:block"></div>
            <button 
              onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-48 pb-24 overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-screen bg-emerald-500/5 -skew-x-12 -translate-y-24 translate-x-24 -z-10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-indigo-500/5 skew-x-12 translate-y-24 -translate-x-24 -z-10 blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2.5 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full"
              >
                <Sparkles className="h-4 w-4 text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">A Productivity Masterpiece</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter text-slate-900"
              >
                Organize Your <br />
                <span className="text-emerald-500 italic">Thoughts</span>, Fast.
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg"
              >
                The modern, high-performance note-taking app that helps you capture ideas, manage tasks, and stay productive across all your devices.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center gap-4"
              >
                <button 
                  onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-10 py-5 bg-slate-900 text-white rounded-2xl text-base font-black uppercase tracking-widest hover:scale-105 hover:bg-slate-800 active:scale-95 transition-all shadow-2xl shadow-slate-300 flex items-center gap-3"
                >
                  START CAPTURING <ArrowRight className="h-5 w-5" />
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-6 pt-10"
              >
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                      U{i}
                    </div>
                  ))}
                  <div className="h-10 w-10 rounded-full border-2 border-white bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white">
                    +1k
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Join 1,000+ happy users worldwide</p>
              </motion.div>
            </div>

            <div id="auth-section" className="relative">
              <div className="absolute -inset-4 bg-emerald-500/10 blur-3xl -z-10 rounded-full"></div>
              <Auth />
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Our Platform</h2>
              <p className="text-4xl font-black text-slate-900 tracking-tight">Everything you need to stay <span className="text-emerald-500">Ahead.</span></p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              {[
                { icon: Zap, title: "Lightning Fast", desc: "Experience zero latency with our optimized cloud infrastructure." },
                { icon: Shield, title: "Military Grade", desc: "Your notes are encrypted and stored securely in our private vault." },
                { icon: Smartphone, title: "PWA Ready", desc: "Install Onote on any device and access your notes offline." },
                { icon: Layout, title: "Smart Filters", desc: "Organize notes by category and status with our intelligent grid." },
                { icon: Globe, title: "Cloud Sync", desc: "Seamlessly synchronize your data across web, mobile, and desktop." },
                { icon: CheckCircle2, title: "Task Engine", desc: "Transform simple notes into actionable checklists instantly." },
              ].map((f, i) => (
                <div key={i} className="group space-y-6 p-8 rounded-[32px] bg-slate-50 border border-transparent hover:border-slate-200 hover:bg-white transition-all duration-300">
                  <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200/50 group-hover:scale-110 group-hover:bg-emerald-500 transition-all duration-300">
                    <f.icon className="h-8 w-8 text-slate-900 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">{f.title}</h3>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-24 bg-slate-900 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <svg width="100%" height="100%">
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-12">
              Built for <span className="text-emerald-400">Excellence.</span>
            </h2>
            <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto mb-16 leading-relaxed">
              Onote isn't just a note-taking app. It's your digital brain, designed to handle the complexity of modern life with elegance and speed.
            </p>
            <div className="flex flex-wrap justify-center gap-12">
              {[
                { val: "99.9%", label: "Uptime Guaranteed" },
                { val: "1k+", label: "Active Users" },
                { val: "24/7", label: "Expert Support" },
              ].map((stat, i) => (
                <div key={i} className="space-y-2">
                  <div className="text-4xl font-black text-white">{stat.val}</div>
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Onote" className="h-8 w-8 rounded-lg" />
            <span className="text-xl font-black tracking-tight uppercase">Onote</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">© 2026 Onote Productivity Lab. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-slate-900 transition-colors">Privacy</a>
            <a href="#" className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-slate-900 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
