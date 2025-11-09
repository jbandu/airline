import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Mail, Lock, AlertCircle, Network, TreeDeciduous, GitBranch, Bot, Folder, FileText, Grid3x3, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) throw error;
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Folder,
      title: '22 Business Domains',
      description: 'Complete airline operations mapped across all departments',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: FileText,
      title: 'Workflow Catalog',
      description: 'Document and analyze every process in your airline',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Bot,
      title: 'AI Agent Network',
      description: '12 intelligent agents automating operations',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Network,
      title: 'Knowledge Graph',
      description: 'Visualize 600+ relationships across your organization',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: TreeDeciduous,
      title: 'Ontology Tree',
      description: 'Hierarchical view of all business concepts',
      color: 'from-indigo-500 to-blue-500'
    },
    {
      icon: GitBranch,
      title: 'Cross-Domain Bridges',
      description: 'Discover integration points across departments',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: Grid3x3,
      title: 'Semantic Matrix',
      description: 'Find similar workflows and processes',
      color: 'from-cyan-500 to-teal-500'
    },
  ];

  const benefits = [
    'Comprehensive view of airline operations',
    'AI-powered workflow automation',
    'Real-time collaboration tools',
    'Advanced analytics and insights',
    'Enterprise-grade security',
    'Seamless integration capabilities'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>

      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Left side - Branding and Features */}
          <div className="text-white">
            {/* Logo and Title */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/50">
                  <Network className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    AeroGraph
                  </h1>
                  <p className="text-cyan-300 text-sm font-medium tracking-wider">ENTERPRISE PLATFORM</p>
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-4 text-white">
                Airline Operations Intelligence
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                The complete platform for understanding, analyzing, and optimizing airline operations with AI-powered insights.
              </p>
            </div>

            {/* Key Benefits */}
            <div className="mb-12">
              <h3 className="text-lg font-semibold text-cyan-400 mb-4">Why AeroGraph?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-sm font-semibold text-white mb-1">{feature.title}</h4>
                    <p className="text-xs text-gray-400 leading-tight">{feature.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">22</div>
                <div className="text-sm text-gray-400 mt-1">Domains</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">600+</div>
                <div className="text-sm text-gray-400 mt-1">Relationships</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">12</div>
                <div className="text-sm text-gray-400 mt-1">AI Agents</div>
              </div>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
                {/* Glassmorphism effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>

                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {isSignUp ? 'Get Started' : 'Welcome Back'}
                    </h2>
                    <p className="text-gray-300">
                      {isSignUp ? 'Create your account to explore' : 'Sign in to access your dashboard'}
                    </p>
                  </div>

                  {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3 backdrop-blur-sm">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-200">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent backdrop-blur-sm transition-all"
                          placeholder="you@airline.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent backdrop-blur-sm transition-all"
                          placeholder="Enter your password"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/75"
                    >
                      {loading ? (
                        'Loading...'
                      ) : (
                        <>
                          {isSignUp ? 'Create Account' : 'Sign In'}
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <button
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError('');
                      }}
                      className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
                    </button>
                  </div>

                  {isSignUp && (
                    <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg backdrop-blur-sm">
                      <p className="text-xs text-cyan-200 text-center">
                        By signing up, you get instant access to all features including AI agents, knowledge graphs, and comprehensive analytics.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-center text-sm text-gray-400 mt-6">
                Enterprise-grade platform for airline operations
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .bg-grid-pattern {
          background-image:
            linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }

        .animate-blob {
          animation: blob 20s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};
