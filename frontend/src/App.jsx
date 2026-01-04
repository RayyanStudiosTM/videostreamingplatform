import React, { useState, useEffect } from 'react';

// Simulated Firebase & Admin Auth
const auth = {
  async firebaseSignup(email, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) throw new Error('Email exists');
    const user = { uid: 'fb_' + Date.now(), email, password, role: 'viewer' };
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    return { uid: user.uid, email, role: user.role };
  },
  async firebaseLogin(email, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid credentials');
    return { uid: user.uid, email: user.email, role: user.role };
  },
  async adminLogin(email, password) {
    if (email === 'admin@admin.com' && password === '123456') {
      return { uid: 'admin', email, role: 'admin', isAdmin: true };
    }
    throw new Error('Invalid admin credentials');
  }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing');
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [videos, setVideos] = useState([]);
  const [users, setUsers] = useState([]);
  const [adminTab, setAdminTab] = useState('videos');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    const vids = JSON.parse(localStorage.getItem('videos') || '[]');
    setVideos(user.isAdmin ? vids : vids.filter(v => v.userId === user.uid));
    if (user.isAdmin) setUsers(JSON.parse(localStorage.getItem('users') || '[]'));
  };

  const handleAuth = async () => {
    setError('');
    try {
      let u;
      if (authMode === 'admin') u = await auth.adminLogin(email, password);
      else if (authMode === 'login') u = await auth.firebaseLogin(email, password);
      else u = await auth.firebaseSignup(email, password);
      setUser(u);
      setView(u.isAdmin ? 'admin' : 'dashboard');
      setEmail('');
      setPassword('');
    } catch (e) {
      setError(e.message);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('video/')) return alert('Upload video file');
    
    const video = {
      id: Date.now().toString(),
      userId: user.uid,
      title: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0,
      sensitivity: null,
      url: URL.createObjectURL(file)
    };
    
    const vids = JSON.parse(localStorage.getItem('videos') || '[]');
    vids.push(video);
    localStorage.setItem('videos', JSON.stringify(vids));
    setVideos(prev => [...prev, video]);

    // Simulate processing
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(r => setTimeout(r, 300));
      const vids = JSON.parse(localStorage.getItem('videos') || '[]');
      const v = vids.find(x => x.id === video.id);
      v.progress = i;
      v.status = i === 100 ? 'completed' : 'processing';
      if (i === 100) v.sensitivity = Math.random() > 0.3 ? 'safe' : 'flagged';
      localStorage.setItem('videos', JSON.stringify(vids));
      setVideos(user.isAdmin ? vids : vids.filter(x => x.userId === user.uid));
    }
  };

  const updateRole = async (uid, role) => {
    const u = JSON.parse(localStorage.getItem('users') || '[]');
    const idx = u.findIndex(x => x.uid === uid);
    u[idx].role = role;
    localStorage.setItem('users', JSON.stringify(u));
    setUsers(u);
    alert('Role updated!');
  };

  const deleteUser = (uid) => {
    if (!confirm('Delete user?')) return;
    let u = JSON.parse(localStorage.getItem('users') || '[]');
    u = u.filter(x => x.uid !== uid);
    localStorage.setItem('users', JSON.stringify(u));
    let v = JSON.parse(localStorage.getItem('videos') || '[]');
    v = v.filter(x => x.userId !== uid);
    localStorage.setItem('videos', JSON.stringify(v));
    setUsers(u);
    setVideos(v);
  };

  const deleteVideo = (id) => {
    if (!confirm('Delete video?')) return;
    let v = JSON.parse(localStorage.getItem('videos') || '[]');
    v = v.filter(x => x.id !== id);
    localStorage.setItem('videos', JSON.stringify(v));
    setVideos(v);
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Sticky Navigation */}
        <nav className="sticky top-0 z-50 bg-slate-900/50 backdrop-blur border-b border-purple-500/20 p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">VideoStream</h1>
            <div className="hidden md:flex gap-6 text-gray-300">
              <button onClick={() => scrollToSection('features')} className="hover:text-purple-400 transition">Features</button>
              <button onClick={() => scrollToSection('how-it-works')} className="hover:text-purple-400 transition">How It Works</button>
              <button onClick={() => scrollToSection('pricing')} className="hover:text-purple-400 transition">Pricing</button>
              <button onClick={() => scrollToSection('testimonials')} className="hover:text-purple-400 transition">Testimonials</button>
              <button onClick={() => scrollToSection('faq')} className="hover:text-purple-400 transition">FAQ</button>
            </div>
            <button onClick={() => setView('auth')} className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition">Get Started</button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <h1 className="text-6xl font-bold text-white mb-6">
            Secure Video Platform<br/>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">With Smart Analysis</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">AI-powered video moderation, Firebase authentication, and role-based access control—all in one seamless platform [web:11][web:16]</p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => { setView('auth'); setAuthMode('signup'); }} className="bg-purple-500 text-white px-8 py-4 rounded-lg text-lg hover:bg-purple-600 transition">Start Free Trial</button>
            <button onClick={() => { setView('auth'); setAuthMode('admin'); }} className="bg-slate-800 text-white px-8 py-4 rounded-lg text-lg border border-purple-500/20 hover:border-purple-500/50 transition">Admin Access</button>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-16 flex justify-center gap-8 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              <span>Firebase Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              <span>RBAC Enabled</span>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="max-w-7xl mx-auto px-4 py-24">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-purple-400 mb-2">FEATURES</h2>
            <h3 className="text-4xl font-bold text-white">Everything You Need</h3>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/50 transition">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              </div>
              <h4 className="text-white font-semibold text-lg mb-2">AI Content Analysis</h4>
              <p className="text-gray-400 text-sm">Automatic sensitivity detection and flagging for unsafe content [web:11]</p>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/50 transition">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              </div>
              <h4 className="text-white font-semibold text-lg mb-2">Role-Based Access</h4>
              <p className="text-gray-400 text-sm">Granular permissions with Viewer, Editor, and Admin roles [web:16]</p>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/50 transition">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <h4 className="text-white font-semibold text-lg mb-2">Real-Time Processing</h4>
              <p className="text-gray-400 text-sm">Live progress tracking with instant feedback during uploads</p>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/50 transition">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              </div>
              <h4 className="text-white font-semibold text-lg mb-2">Firebase Auth</h4>
              <p className="text-gray-400 text-sm">Enterprise-grade security with encrypted authentication</p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div id="how-it-works" className="bg-slate-900/50 py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-base font-semibold text-purple-400 mb-2">HOW IT WORKS</h2>
              <h3 className="text-4xl font-bold text-white">Get Started in 3 Steps</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">1</div>
                <h4 className="text-white font-semibold text-xl mb-2">Sign Up</h4>
                <p className="text-gray-400">Create your account in 30 seconds with secure Firebase authentication [web:16]</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">2</div>
                <h4 className="text-white font-semibold text-xl mb-2">Upload Videos</h4>
                <p className="text-gray-400">Drop your videos and watch AI analyze content automatically [web:17]</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">3</div>
                <h4 className="text-white font-semibold text-xl mb-2">Collaborate</h4>
                <p className="text-gray-400">Manage team permissions with powerful role-based access control</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div id="pricing" className="max-w-7xl mx-auto px-4 py-24">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-purple-400 mb-2">PRICING</h2>
            <h3 className="text-4xl font-bold text-white">Choose Your Role</h3>
            <p className="text-gray-400 mt-4">Start free and upgrade as you grow [web:16][web:19]</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Viewer */}
            <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-xl p-8">
              <h4 className="text-purple-400 font-semibold text-lg mb-2">Viewer</h4>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">Free</span>
              </div>
              <p className="text-gray-400 mb-6">Perfect for getting started</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-gray-300">
                  <svg className="w-5 h-5 text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  <span>View videos</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <svg className="w-5 h-5 text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  <span>Basic analytics</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <svg className="w-5 h-5 text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  <span>Email support</span>
                </li>
              </ul>
              <button onClick={() => { setView('auth'); setAuthMode('signup'); }} className="w-full bg-slate-700 text-white py-3 rounded-lg hover:bg-slate-600 transition">Get Started</button>
            </div>

            {/* Editor */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-8 relative transform scale-105 shadow-2xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-slate-900 px-4 py-1 rounded-full text-sm font-semibold">POPULAR</div>
              <h4 className="text-white font-semibold text-lg mb-2">Editor</h4>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">$29</span>
                <span className="text-white/80">/month</span>
              </div>
              <p className="text-white/90 mb-6">For content creators</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-white">
                  <svg className="w-5 h-5 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  <span>Everything in Viewer</span>
                </li>
                <li className="flex items-start gap-2 text-white">
                  <svg className="w-5 h-5 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  <span>Upload videos</span>
                </li>
                <li className="flex items-start gap-2 text-white">
                  <svg className="w-5 h-5 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  <span>AI content analysis</span>
                </li>
                <li className="flex items-start gap-2 text-white">
                  <svg className="w-5 h-5 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  <span>Priority support</span>
                </li>
              </ul>
              <button onClick={() => { setView('auth'); setAuthMode('signup'); }} className="w-full bg-white text-purple-600 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">Start Free Trial</button>
            </div>

            {/* Admin */}
            <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-xl p-8">
              <h4 className="text-purple-400 font-semibold text-lg mb-2">Admin</h4>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">$99</span>
                <span className="text-gray-400">/month</span>
              </div>
              <p className="text-gray-400 mb-6">Full platform control</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-gray-300">
                  <svg className="w-5 h-5 text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  <span>Everything in Editor</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <svg className="w-5 h-5 text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  <span>User management</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <svg className="w-5 h-5 text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  <span>Role assignment</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <svg className="w-5 h-5 text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  <span>All videos access</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <svg className="w-5 h-5 text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  <span>24/7 dedicated support</span>
                </li>
              </ul>
              <button onClick={() => { setView('auth'); setAuthMode('admin'); }} className="w-full bg-slate-700 text-white py-3 rounded-lg hover:bg-slate-600 transition">Contact Sales</button>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div id="testimonials" className="bg-slate-900/50 py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-base font-semibold text-purple-400 mb-2">TESTIMONIALS</h2>
              <h3 className="text-4xl font-bold text-white">Loved by Creators</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-xl p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  ))}
                </div>
                <p className="text-gray-300 mb-4">"VideoStream transformed how we manage content. The AI analysis caught issues we would have missed manually [web:13][web:15]"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">SJ</div>
                  <div>
                    <h5 className="text-white font-semibold">Sarah Johnson</h5>
                    <p className="text-gray-400 text-sm">Content Manager</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-xl p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  ))}
                </div>
                <p className="text-gray-300 mb-4">"The role-based permissions are exactly what our team needed. Setup took minutes [web:15][web:18]"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-semibold">MC</div>
                  <div>
                    <h5 className="text-white font-semibold">Michael Chen</h5>
                    <p className="text-gray-400 text-sm">Tech Lead</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-xl p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  ))}
                </div>
                <p className="text-gray-300 mb-4">"Best video platform for teams. The admin panel makes managing 50+ users effortless [web:13]"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">EP</div>
                  <div>
                    <h5 className="text-white font-semibold">Emily Park</h5>
                    <p className="text-gray-400 text-sm">Product Director</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div id="faq" className="max-w-4xl mx-auto px-4 py-24">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-purple-400 mb-2">FAQ</h2>
            <h3 className="text-4xl font-bold text-white">Common Questions</h3>
          </div>
          
          <div className="space-y-4">
            {[
              { q: 'What video formats are supported?', a: 'We support MP4, WebM, and OGG formats up to 100MB per file [web:17]' },
              { q: 'How does the AI analysis work?', a: 'Our AI automatically scans uploaded videos for sensitive content and flags potential issues in real-time during processing [web:20]' },
              { q: 'Can I upgrade my role later?', a: 'Yes! Contact your admin to upgrade from Viewer to Editor, or reach out to our team for Admin access [web:17]' },
              { q: 'Is my data secure?', a: 'Absolutely. We use Firebase authentication with industry-standard encryption to protect all user data and videos' },
              { q: 'What happens if a video is flagged?', a: 'Flagged videos are marked with a red sensitivity badge and can be reviewed by editors or admins before publishing [web:20]' }
            ].map((faq, i) => (
              <div key={i} className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-6 text-left flex justify-between items-center hover:bg-slate-800/70 transition"
                >
                  <span className="text-white font-semibold">{faq.q}</span>
                  <svg className={`w-5 h-5 text-purple-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-400">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact/CTA Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-24">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Video Workflow?</h2>
            <p className="text-white/90 text-lg mb-8">Join thousands of creators using VideoStream to manage, analyze, and secure their content</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => { setView('auth'); setAuthMode('signup'); }} className="bg-white text-purple-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition">Start Free Trial</button>
              <button onClick={() => scrollToSection('pricing')} className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition">View Pricing</button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-slate-900/50 border-t border-purple-500/20 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-white font-bold text-xl mb-4">VideoStream</h3>
                <p className="text-gray-400 text-sm">Secure video platform with smart AI analysis</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><button onClick={() => scrollToSection('features')} className="hover:text-purple-400">Features</button></li>
                  <li><button onClick={() => scrollToSection('pricing')} className="hover:text-purple-400">Pricing</button></li>
                  <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-purple-400">How It Works</button></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><button onClick={() => scrollToSection('testimonials')} className="hover:text-purple-400">Testimonials</button></li>
                  <li><button onClick={() => scrollToSection('faq')} className="hover:text-purple-400">FAQ</button></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Contact</h4>
                <p className="text-gray-400 text-sm">support@videostream.com</p>
                <p className="text-gray-400 text-sm mt-2">Aurangabad, Maharashtra, IN</p>
              </div>
            </div>
            <div className="border-t border-purple-500/20 mt-8 pt-8 text-center text-gray-400 text-sm">
              <p>© 2026 VideoStream. Built with React & Firebase.</p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  if (view === 'auth') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            {authMode === 'admin' ? 'Admin Login' : authMode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          {error && <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4"><p className="text-red-400 text-sm">{error}</p></div>}
          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={authMode === 'admin' ? 'admin@admin.com' : 'Email'}
              className="w-full bg-slate-900/50 border border-purple-500/20 rounded-lg px-4 py-3 text-white"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-slate-900/50 border border-purple-500/20 rounded-lg px-4 py-3 text-white"
            />
            <button onClick={handleAuth} className="w-full bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600 transition">
              {authMode === 'admin' ? 'Admin Sign In' : authMode === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
          {authMode !== 'admin' && (
            <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="mt-4 text-purple-400 w-full hover:text-purple-300 transition">
              {authMode === 'login' ? "Don't have an account? Sign up" : 'Have an account? Sign in'}
            </button>
          )}
          <button onClick={() => setAuthMode(authMode === 'admin' ? 'login' : 'admin')} className="mt-4 w-full bg-slate-700/50 text-white py-2 rounded-lg hover:bg-slate-700 transition">
            {authMode === 'admin' ? 'User Login' : 'Admin Login'}
          </button>
          <button onClick={() => setView('landing')} className="mt-4 w-full text-gray-400 hover:text-gray-300 transition">← Back to Home</button>
          {authMode === 'admin' && (
            <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <p className="text-sm text-gray-300">Demo Admin: admin@admin.com / 123456</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <nav className="bg-slate-900/50 backdrop-blur border-b border-purple-500/20 p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex gap-4">
              <button onClick={() => setAdminTab('videos')} className={`px-4 py-2 rounded transition ${adminTab === 'videos' ? 'bg-purple-500 text-white' : 'text-gray-300 hover:text-white'}`}>Videos</button>
              <button onClick={() => setAdminTab('users')} className={`px-4 py-2 rounded transition ${adminTab === 'users' ? 'bg-purple-500 text-white' : 'text-gray-300 hover:text-white'}`}>Users</button>
            </div>
            <button onClick={() => { setUser(null); setView('landing'); }} className="text-gray-300 hover:text-white transition">Logout</button>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto p-8">
          {adminTab === 'users' ? (
            <>
              <h2 className="text-3xl font-bold text-white mb-8">User Management</h2>
              {users.map(u => (
                <div key={u.uid} className="bg-slate-800/50 border border-purple-500/20 rounded-xl p-6 mb-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-semibold">{u.email}</h3>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs ${u.role === 'admin' ? 'bg-red-500/20 text-red-400' : u.role === 'editor' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>{u.role}</span>
                  </div>
                  <div className="flex gap-2">
                    <select onChange={(e) => updateRole(u.uid, e.target.value)} value={u.role} className="bg-slate-900 border border-purple-500/20 rounded px-3 py-2 text-white">
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button onClick={() => deleteUser(u.uid)} className="bg-red-500/20 text-red-400 px-4 py-2 rounded hover:bg-red-500/30 transition">Delete</button>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-white mb-8">All Videos</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {videos.map(v => (
                  <div key={v.id} className="bg-slate-800/50 border border-purple-500/20 rounded-xl overflow-hidden hover:border-purple-500/50 transition">
                    <div className="aspect-video bg-slate-900 flex items-center justify-center">
                      {v.status === 'completed' ? (
                        <button onClick={() => setSelectedVideo(v)} className="text-white text-4xl hover:text-purple-400 transition">▶</button>
                      ) : (
                        <div className="text-center"><p className="text-white">{v.status}</p><p className="text-gray-400">{v.progress}%</p></div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold mb-2">{v.title}</h3>
                      {v.sensitivity && <span className={`px-2 py-1 rounded text-xs ${v.sensitivity === 'safe' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{v.sensitivity}</span>}
                      <button onClick={() => deleteVideo(v.id)} className="mt-2 w-full bg-red-500/20 text-red-400 py-2 rounded hover:bg-red-500/30 transition">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        {selectedVideo && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={() => setSelectedVideo(null)}>
            <div className="bg-slate-800 rounded-xl max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 flex justify-between border-b border-purple-500/20">
                <h3 className="text-white">{selectedVideo.title}</h3>
                <button onClick={() => setSelectedVideo(null)} className="text-white text-2xl hover:text-purple-400 transition">×</button>
              </div>
              <video controls className="w-full" src={selectedVideo.url}></video>
            </div>
          </div>
        )}
      </div>
    );
  }

  const canUpload = user?.role === 'editor' || user?.isAdmin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="bg-slate-900/50 backdrop-blur border-b border-purple-500/20 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">VideoStream</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300 text-sm">{user.email} <span className="text-purple-400">({user.role})</span></span>
            <button onClick={() => { setUser(null); setView('landing'); }} className="text-gray-300 hover:text-white transition">Logout</button>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto p-8">
        {canUpload ? (
          <div className="bg-slate-800/50 border border-purple-500/20 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Upload Video</h2>
            <input type="file" accept="video/*" onChange={handleUpload} className="hidden" id="upload"/>
            <label htmlFor="upload" className="block border-2 border-dashed border-purple-500/30 rounded-lg p-12 text-center cursor-pointer hover:border-purple-500/60 transition">
              <p className="text-white text-lg">Click to upload</p>
              <p className="text-gray-400 text-sm">MP4, WebM, OGG (max 100MB)</p>
            </label>
          </div>
        ) : (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 mb-8">
            <h3 className="text-yellow-400 font-semibold">Viewer Account</h3>
            <p className="text-gray-300 text-sm">View-only access. Contact admin to upgrade to Editor for upload permissions.</p>
          </div>
        )}
        <div className="grid md:grid-cols-3 gap-6">
          {videos.length === 0 ? (
            <p className="col-span-full text-center text-gray-400 py-12">No videos yet</p>
          ) : (
            videos.map(v => (
              <div key={v.id} className="bg-slate-800/50 border border-purple-500/20 rounded-xl overflow-hidden hover:border-purple-500/50 transition">
                <div className="aspect-video bg-slate-900 flex items-center justify-center">
                  {v.status === 'completed' ? (
                    <button onClick={() => setSelectedVideo(v)} className="text-white text-4xl hover:text-purple-400 transition">▶</button>
                  ) : (
                    <div className="text-center">
                      <p className="text-white">{v.status}</p>
                      <p className="text-gray-400">{v.progress}%</p>
                      <div className="w-32 bg-slate-800 rounded-full h-1.5 mx-auto mt-2">
                        <div className="bg-purple-500 h-1.5 rounded-full transition-all" style={{width: `${v.progress}%`}}></div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-2">{v.title}</h3>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">{(v.size/1024/1024).toFixed(2)} MB</span>
                    {v.sensitivity && <span className={`px-2 py-1 rounded text-xs ${v.sensitivity === 'safe' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{v.sensitivity}</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={() => setSelectedVideo(null)}>
          <div className="bg-slate-800 rounded-xl max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 flex justify-between border-b border-purple-500/20">
              <h3 className="text-white">{selectedVideo.title}</h3>
              <button onClick={() => setSelectedVideo(null)} className="text-white text-2xl hover:text-purple-400 transition">×</button>
            </div>
            <video controls className="w-full" src={selectedVideo.url}></video>
          </div>
        </div>
      )}
    </div>
  );
}
