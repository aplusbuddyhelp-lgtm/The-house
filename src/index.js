import { h, render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { 
  auth, 
  db,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  doc,
  setDoc
} from './firebase.js';
import './style.css';

function App() {
  const [screen, setScreen] = useState('login');
  const [user, setUser] = useState(null);

  // Auth states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupCountry, setSignupCountry] = useState('');
  const [signupCity, setSignupCity] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');

  // Main app states
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: 'DHouse Official',
      time: '2h ago',
      content: '🎉 Welcome to DHouse! Get ready for the most exciting season yet!',
      likes: 24,
      comments: 12
    },
    {
      id: 2,
      user: 'Sarah K.',
      time: '4h ago',
      content: 'Did anyone catch last night\'s episode? The drama was unreal! 😱',
      likes: 18,
      comments: 7
    }
  ]);
  const [newPost, setNewPost] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const countries = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Nigeria', 'South Africa', 'Kenya', 'Ghana', 'India', 'Pakistan', 'Other'];

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.emailVerified) {
        setUser(currentUser);
        setScreen('main');
      } else if (currentUser) {
        setScreen('login');
        alert('📧 Please verify your email. Check spam folder!');
      } else {
        setUser(null);
        setScreen('login');
      }
    });
    return () => unsubscribe();
  }, []);

  // Handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      if (!result.user.emailVerified) {
        alert('📧 Please verify your email. Check spam folder!');
        await auth.signOut();
        return;
      }
      setUser(result.user);
      setScreen('main');
    } catch (error) {
      alert('❌ ' + error.message);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (signupPassword !== signupConfirmPassword) {
      alert('❌ Passwords do not match!');
      return;
    }
    if (signupPassword.length < 6) {
      alert('❌ Password must be at least 6 characters!');
      return;
    }
    try {
      const result = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      await updateProfile(result.user, { displayName: signupUsername });
      await setDoc(doc(db, 'users', result.user.uid), {
        username: signupUsername,
        email: signupEmail,
        country: signupCountry,
        city: signupCity,
        createdAt: new Date()
      });
      await sendEmailVerification(result.user);
      alert('📧 Verification email sent! Check inbox and spam.');
      await auth.signOut();
      setScreen('login');
      setLoginEmail(signupEmail);
    } catch (error) {
      alert('❌ ' + error.message);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      alert('📧 Password reset sent! Check inbox and spam.');
      setScreen('login');
    } catch (error) {
      alert('❌ ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setScreen('login');
    } catch (error) {
      alert('❌ ' + error.message);
    }
  };

  const handleAddPost = () => {
    if (newPost.trim()) {
      setPosts([
        {
          id: posts.length + 1,
          user: user?.displayName || user?.email || 'Anonymous',
          time: 'Just now',
          content: newPost,
          likes: 0,
          comments: 0
        },
        ...posts
      ]);
      setNewPost('');
    }
  };

  // ============================================================
  // ===== RENDER =====
  // ============================================================

  // --- LOGIN ---
  if (screen === 'login') {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">🏠</div>
          <h1>DHouse</h1>
          <p className="auth-subtitle">Welcome back!</p>
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email" value={loginEmail} onInput={(e) => setLoginEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={loginPassword} onInput={(e) => setLoginPassword(e.target.value)} required />
            <button type="submit" className="auth-button">Login</button>
          </form>
          <div className="auth-links">
            <button onClick={() => setScreen('signup')}>Don't have an account? Sign Up</button>
            <button onClick={() => setScreen('reset')}>Forgot Password?</button>
          </div>
        </div>
      </div>
    );
  }

  // --- SIGNUP ---
  if (screen === 'signup') {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">🏠</div>
          <h1>DHouse</h1>
          <p className="auth-subtitle">Create your account</p>
          <form onSubmit={handleSignup}>
            <input type="text" placeholder="Username" value={signupUsername} onInput={(e) => setSignupUsername(e.target.value)} required />
            <input type="email" placeholder="Email" value={signupEmail} onInput={(e) => setSignupEmail(e.target.value)} required />
            <select value={signupCountry} onInput={(e) => setSignupCountry(e.target.value)} required>
              <option value="">Select Country</option>
              {countries.map((c) => <option key={c}>{c}</option>)}
            </select>
            <input type="text" placeholder="City" value={signupCity} onInput={(e) => setSignupCity(e.target.value)} required />
            <input type="password" placeholder="Password (min 6 chars)" value={signupPassword} onInput={(e) => setSignupPassword(e.target.value)} required minLength="6" />
            <input type="password" placeholder="Confirm Password" value={signupConfirmPassword} onInput={(e) => setSignupConfirmPassword(e.target.value)} required />
            <button type="submit" className="auth-button">Sign Up</button>
          </form>
          <div className="auth-links">
            <button onClick={() => setScreen('login')}>Already have an account? Login</button>
          </div>
        </div>
      </div>
    );
  }

  // --- RESET ---
  if (screen === 'reset') {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">🔑</div>
          <h1>DHouse</h1>
          <p className="auth-subtitle">Reset Password</p>
          <form onSubmit={handleReset}>
            <input type="email" placeholder="Email" value={resetEmail} onInput={(e) => setResetEmail(e.target.value)} required />
            <button type="submit" className="auth-button">Send Reset Link</button>
          </form>
          <div className="auth-links">
            <button onClick={() => setScreen('login')}>Back to Login</button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN APP ---
  if (screen === 'main') {
    return (
      <div className="main-app">
        {/* Top Bar */}
        <div className="top-bar">
          <div className="top-bar-left">
            <button onClick={() => setShowMenu(!showMenu)} className="icon-btn">☰</button>
            <span className="app-title">DHouse</span>
          </div>
          <div className="top-bar-right">
            <button className="icon-btn">🔍</button>
            <button className="icon-btn">➕</button>
          </div>
        </div>

        {/* Content */}
        <div className="content-area">
          <div className="feed-container">
            <div className="create-post">
              <div className="create-post-input">
                <span className="avatar">{user?.displayName?.[0] || '👤'}</span>
                <input
                  type="text"
                  placeholder="What's on your mind?"
                  value={newPost}
                  onInput={(e) => setNewPost(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPost()}
                />
              </div>
              <button onClick={handleAddPost} className="post-btn">Post</button>
            </div>

            {posts.map((post) => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <div className="post-user">
                    <span className="avatar">{post.user[0]}</span>
                    <div>
                      <div className="post-username">{post.user}</div>
                      <div className="post-handle">· {post.time}</div>
                    </div>
                  </div>
                  <button className="more-btn">⋯</button>
                </div>
                <div className="post-content">{post.content}</div>
                <div className="post-actions">
                  <button className="action-btn">❤️ {post.likes}</button>
                  <button className="action-btn">💬 {post.comments}</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="bottom-nav">
          {['📰', '👥', '🎯', '🔮', '🏠', '🔔'].map((icon, i) => (
            <button
              key={i}
              className={`nav-btn ${activeTab === ['feed', 'community', 'wordgame', 'predictions', 'housemates', 'notifications'][i] ? 'active' : ''}`}
              onClick={() => setActiveTab(['feed', 'community', 'wordgame', 'predictions', 'housemates', 'notifications'][i])}
            >
              <span className="nav-icon">{icon}</span>
            </button>
          ))}
        </div>

        {/* Side Menu */}
        {showMenu && (
          <div className="side-menu-overlay" onClick={() => setShowMenu(false)}>
            <div className="side-menu" onClick={(e) => e.stopPropagation()}>
              <div className="side-menu-header">
                <span className="avatar-large">{user?.displayName?.[0] || '👤'}</span>
                <h3>{user?.displayName || user?.email}</h3>
                <p>{user?.email}</p>
              </div>
              <div className="side-menu-items">
                <button className="side-menu-item">👤 Profile</button>
                <button className="side-menu-item">⚙️ Settings</button>
                <button className="side-menu-item logout" onClick={handleLogout}>🚪 Logout</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

render(<App />, document.getElementById('app'));
