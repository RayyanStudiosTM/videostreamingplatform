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

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <nav className="bg-slate-900/50 backdrop-blur border-b border-purple-500/20 p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">VideoStream</h1>
            <button onClick={() => setView('auth')} className="bg-purple-500 text-white px-6 py-2 rounded-lg">Get Started</button>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <h1 className="text-6xl font-bold text-white mb-6">
            Secure Video Platform<br/>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">With Smart Analysis</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">Professional video platform with Firebase authentication, MongoDB storage, and real-time processing</p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => { setView('auth'); setAuthMode('signup'); }} className="bg-purple-500 text-white px-8 py-4 rounded-lg text-lg">Start Free Trial</button>
            <button onClick={() => { setView('auth'); setAuthMode('admin'); }} className="bg-slate-800 text-white px-8 py-4 rounded-lg text-lg border border-purple-500/20">Admin Access</button>
          </div>
        </div>
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
            <button onClick={handleAuth} className="w-full bg-purple-500 text-white py-3 rounded-lg font-semibold">
              {authMode === 'admin' ? 'Admin Sign In' : authMode === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
          {authMode !== 'admin' && (
            <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="mt-4 text-purple-400 w-full">
              {authMode === 'login' ? "Don't have an account? Sign up" : 'Have an account? Sign in'}
            </button>
          )}
          <button onClick={() => setAuthMode(authMode === 'admin' ? 'login' : 'admin')} className="mt-4 w-full bg-slate-700/50 text-white py-2 rounded-lg">
            {authMode === 'admin' ? 'User Login' : 'Admin Login'}
          </button>
          <button onClick={() => setView('landing')} className="mt-4 w-full text-gray-400">Back</button>
          {authMode === 'admin' && (
            <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <p className="text-sm text-gray-300">Admin: admin@admin.com / 123456</p>
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
              <button onClick={() => setAdminTab('videos')} className={`px-4 py-2 rounded ${adminTab === 'videos' ? 'bg-purple-500 text-white' : 'text-gray-300'}`}>Videos</button>
              <button onClick={() => setAdminTab('users')} className={`px-4 py-2 rounded ${adminTab === 'users' ? 'bg-purple-500 text-white' : 'text-gray-300'}`}>Users</button>
            </div>
            <button onClick={() => { setUser(null); setView('landing'); }} className="text-gray-300">Logout</button>
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
                    <button onClick={() => deleteUser(u.uid)} className="bg-red-500/20 text-red-400 px-4 py-2 rounded">Delete</button>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-white mb-8">All Videos</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {videos.map(v => (
                  <div key={v.id} className="bg-slate-800/50 border border-purple-500/20 rounded-xl overflow-hidden">
                    <div className="aspect-video bg-slate-900 flex items-center justify-center">
                      {v.status === 'completed' ? (
                        <button onClick={() => setSelectedVideo(v)} className="text-white text-4xl">▶</button>
                      ) : (
                        <div className="text-center"><p className="text-white">{v.status}</p><p className="text-gray-400">{v.progress}%</p></div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold mb-2">{v.title}</h3>
                      {v.sensitivity && <span className={`px-2 py-1 rounded text-xs ${v.sensitivity === 'safe' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{v.sensitivity}</span>}
                      <button onClick={() => deleteVideo(v.id)} className="mt-2 w-full bg-red-500/20 text-red-400 py-2 rounded">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        {selectedVideo && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelectedVideo(null)}>
            <div className="bg-slate-800 rounded-xl max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 flex justify-between border-b border-purple-500/20">
                <h3 className="text-white">{selectedVideo.title}</h3>
                <button onClick={() => setSelectedVideo(null)} className="text-white">×</button>
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
            <button onClick={() => { setUser(null); setView('landing'); }} className="text-gray-300">Logout</button>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto p-8">
        {canUpload ? (
          <div className="bg-slate-800/50 border border-purple-500/20 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Upload Video</h2>
            <input type="file" accept="video/*" onChange={handleUpload} className="hidden" id="upload"/>
            <label htmlFor="upload" className="block border-2 border-dashed border-purple-500/30 rounded-lg p-12 text-center cursor-pointer hover:border-purple-500/60">
              <p className="text-white text-lg">Click to upload</p>
              <p className="text-gray-400 text-sm">MP4, WebM, OGG (max 100MB)</p>
            </label>
          </div>
        ) : (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 mb-8">
            <h3 className="text-yellow-400 font-semibold">Viewer Account</h3>
            <p className="text-gray-300 text-sm">View-only access. Contact admin to upgrade.</p>
          </div>
        )}
        <div className="grid md:grid-cols-3 gap-6">
          {videos.length === 0 ? (
            <p className="col-span-full text-center text-gray-400 py-12">No videos yet</p>
          ) : (
            videos.map(v => (
              <div key={v.id} className="bg-slate-800/50 border border-purple-500/20 rounded-xl overflow-hidden">
                <div className="aspect-video bg-slate-900 flex items-center justify-center">
                  {v.status === 'completed' ? (
                    <button onClick={() => setSelectedVideo(v)} className="text-white text-4xl">▶</button>
                  ) : (
                    <div className="text-center">
                      <p className="text-white">{v.status}</p>
                      <p className="text-gray-400">{v.progress}%</p>
                      <div className="w-32 bg-slate-800 rounded-full h-1.5 mx-auto mt-2">
                        <div className="bg-purple-500 h-1.5 rounded-full" style={{width: `${v.progress}%`}}></div>
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelectedVideo(null)}>
          <div className="bg-slate-800 rounded-xl max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 flex justify-between border-b border-purple-500/20">
              <h3 className="text-white">{selectedVideo.title}</h3>
              <button onClick={() => setSelectedVideo(null)} className="text-white text-2xl">×</button>
            </div>
            <video controls className="w-full" src={selectedVideo.url}></video>
          </div>
        </div>
      )}
    </div>
  );
}