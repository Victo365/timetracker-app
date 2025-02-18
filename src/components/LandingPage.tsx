import React from 'react';
import { Clock, CheckCircle, Users, ArrowRight, Zap, Target, TrendingUp } from 'lucide-react';

interface LandingPageProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSignIn, onSignUp }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <header className="bg-white border-b border-slate-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="h-7 w-7 sm:h-8 sm:w-8 text-sky-500" />
            <span className="text-lg sm:text-xl font-bold text-slate-800">TimeTracker</span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={onSignIn}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-sky-600 hover:text-sky-700 font-medium text-sm sm:text-base"
            >
              Sign In
            </button>
            <button
              onClick={onSignUp}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors text-sm sm:text-base"
            >
              Sign Up
            </button>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6">
                Track Your Time,
                <br />
                <span className="text-sky-500">Boost Your Productivity</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-8">
                Simple, intuitive time tracking for professionals. Monitor your work hours, 
                track breaks, and generate detailed reports with ease.
              </p>
              <button
                onClick={onSignUp}
                className="inline-flex items-center px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors text-lg font-medium group"
              >
                Start Tracking Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
              Everything You Need
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-slate-50 rounded-xl">
                <Clock className="h-12 w-12 text-sky-500 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Easy Time Tracking
                </h3>
                <p className="text-slate-600">
                  Log your work hours with just a few clicks. Simple and intuitive interface 
                  for hassle-free time tracking.
                </p>
              </div>
              <div className="p-6 bg-slate-50 rounded-xl">
                <CheckCircle className="h-12 w-12 text-sky-500 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Detailed Reports
                </h3>
                <p className="text-slate-600">
                  Generate comprehensive reports of your work hours. Track your productivity 
                  and identify areas for improvement.
                </p>
              </div>
              <div className="p-6 bg-slate-50 rounded-xl">
                <Users className="h-12 w-12 text-sky-500 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Team Friendly
                </h3>
                <p className="text-slate-600">
                  Perfect for freelancers and teams alike. Keep track of your work hours 
                  and stay organized.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
              What Our Users Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <p className="text-slate-600 mb-4">
                  "TimeTracker has completely transformed how I manage my work hours. 
                  It's simple, efficient, and exactly what I needed."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
                    <span className="text-sky-600 font-semibold">JD</span>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-slate-900">John Doe</p>
                    <p className="text-sm text-slate-500">Freelance Developer</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <p className="text-slate-600 mb-4">
                  "The best time tracking app I've used. Clean interface and powerful 
                  features make it perfect for my daily use."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
                    <span className="text-sky-600 font-semibold">AS</span>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-slate-900">Alice Smith</p>
                    <p className="text-sm text-slate-500">Project Manager</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <p className="text-slate-600 mb-4">
                  "Finally, a time tracking solution that doesn't get in the way. 
                  It just works, and that's exactly what I needed."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
                    <span className="text-sky-600 font-semibold">RJ</span>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-slate-900">Robert Johnson</p>
                    <p className="text-sm text-slate-500">Business Owner</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* New Engaging CTA Section */}
        <section className="py-20 bg-gradient-to-br from-sky-500 to-sky-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-6">
                Transform Your Time Management Today
              </h2>
              <p className="text-xl text-sky-100 max-w-2xl mx-auto">
                Join thousands of professionals who have already revolutionized their productivity
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
                <Zap className="h-10 w-10 text-sky-200 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Instant Insights</h3>
                <p className="text-sky-100">
                  Get real-time analytics and insights about your work patterns
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
                <Target className="h-10 w-10 text-sky-200 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Goal Tracking</h3>
                <p className="text-sky-100">
                  Set and achieve your productivity goals with ease
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
                <TrendingUp className="h-10 w-10 text-sky-200 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Performance Boost</h3>
                <p className="text-sky-100">
                  See your productivity improve week after week
                </p>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={onSignUp}
                className="inline-flex items-center px-8 py-4 bg-white text-sky-600 rounded-lg transition-all transform hover:scale-105 hover:shadow-lg text-lg font-medium group"
              >
                Start Your Productivity Journey
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6 text-sky-500" />
              <span className="text-slate-600">© 2025 TimeTracker. All rights reserved.</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-slate-600 hover:text-sky-500">Privacy Policy</a>
              <a href="#" className="text-slate-600 hover:text-sky-500">Terms of Service</a>
              <a href="#" className="text-slate-600 hover:text-sky-500">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};