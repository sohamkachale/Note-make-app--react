// ============================================
// FILE: src/App.jsx
// Enhanced Notes App with Dark Theme and Advanced Features
// ============================================

import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CreditCard as Edit2, Trash2, Save, X, LogOut, Menu, Search, User, Moon, Sun, Eye, EyeOff, Copy, Check } from 'lucide-react';
import './App.css';

// ============================================
// CONTEXT API - Global State Management
// ============================================

const AuthContext = createContext(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('currentUser');
    const savedTheme = localStorage.getItem('theme');
    
    if (loggedInUser) {
      setCurrentUser(loggedInUser);
    }
    
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    setLoading(false);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  const register = (username, password) => {
    const users = JSON.parse(localStorage.getItem('users') || '{}');

    if (users[username]) {
      return { success: false, message: 'Username already exists' };
    }

    users[username] = {
      password: password,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('users', JSON.stringify(users));
    return { success: true, message: 'Registration successful' };
  };

  const login = (username, password) => {
    const users = JSON.parse(localStorage.getItem('users') || '{}');

    if (!users[username]) {
      return { success: false, message: 'User not found' };
    }

    if (users[username].password !== password) {
      return { success: false, message: 'Incorrect password' };
    }

    localStorage.setItem('currentUser', username);
    setCurrentUser(username);
    return { success: true, message: 'Login successful' };
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    register,
    login,
    logout,
    loading,
    darkMode,
    toggleDarkMode
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// ============================================
// AUTHENTICATION COMPONENTS
// ============================================

const LoginPage = ({ onSwitchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    const result = login(username, password);
    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <motion.div
      className="auth-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <motion.div
        className="auth-card"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to access your notes</p>

        <div className="auth-form">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              className="error-message"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="button"
            className="auth-button"
            onClick={handleSubmit}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Sign In
          </motion.button>
        </div>

        <p className="auth-switch">
          Don't have an account?{' '}
          <span onClick={onSwitchToRegister} className="auth-link">
            Sign Up
          </span>
        </p>
      </motion.div>
    </motion.div>
  );
};

const RegisterPage = ({ onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const result = register(username, password);
    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => {
        onSwitchToLogin();
      }, 1500);
    } else {
      setError(result.message);
    }
  };

  return (
    <motion.div
      className="auth-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <motion.div
        className="auth-card"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Start organizing your thoughts</p>

        <div className="auth-form">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              autoComplete="username"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                autoComplete="new-password"
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              className="error-message"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              className="success-message"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {success}
            </motion.div>
          )}

          <motion.button
            type="button"
            className="auth-button"
            onClick={handleSubmit}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Sign Up
          </motion.button>
        </div>

        <p className="auth-switch">
          Already have an account?{' '}
          <span onClick={onSwitchToLogin} className="auth-link">
            Sign In
          </span>
        </p>
      </motion.div>
    </motion.div>
  );
};

// ============================================
// NOTES COMPONENTS
// ============================================

const NoteCard = ({ note, onEdit, onDelete }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${note.title}\n\n${note.description}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="note-card"
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <div className="note-header">
        <h3 className="note-title">{note.title}</h3>
        <div className="note-actions">
          <motion.button
            className="icon-button copy"
            onClick={handleCopy}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Copy note"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </motion.button>
          <motion.button
            className="icon-button edit"
            onClick={() => onEdit(note)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Edit note"
          >
            <Edit2 size={18} />
          </motion.button>
          <motion.button
            className="icon-button delete"
            onClick={() => onDelete(note.id)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Delete note"
          >
            <Trash2 size={18} />
          </motion.button>
        </div>
      </div>
      <p className="note-description">{note.description}</p>
      <div className="note-footer">
        <span className="note-date">
          {new Date(note.updatedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </span>
      </div>
    </motion.div>
  );
};

const NoteEditorModal = ({ note, onClose, onSave }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [description, setDescription] = useState(note?.description || '');
  const [error, setError] = useState('');

  const handleSave = () => {
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    onSave({
      id: note?.id || Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      createdAt: note?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content"
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{note ? 'Edit Note' : 'Create New Note'}</h2>
          <motion.button
            className="icon-button"
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Close modal"
          >
            <X size={24} />
          </motion.button>
        </div>

        <div className="modal-body">
          <div className="input-group">
            <label htmlFor="note-title">Title</label>
            <input
              id="note-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title"
              autoFocus
            />
          </div>

          <div className="input-group">
            <label htmlFor="note-description">Description</label>
            <textarea
              id="note-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter note description"
              rows={8}
            />
          </div>

          {error && (
            <motion.div
              className="error-message"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {error}
            </motion.div>
          )}
        </div>

        <div className="modal-footer">
          <motion.button
            className="button secondary"
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
          <motion.button
            className="button primary"
            onClick={handleSave}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Save size={18} />
            {note ? 'Update' : 'Create'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const NotesDashboard = () => {
  const { currentUser, logout, darkMode, toggleDarkMode } = useAuth();
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [sortBy, setSortBy] = useState('updated');

  useEffect(() => {
    loadNotes();
  }, [currentUser]);

  useEffect(() => {
    let filtered = notes;
    
    if (searchQuery.trim()) {
      filtered = notes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'updated') {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      } else if (sortBy === 'created') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
    
    setFilteredNotes(sorted);
  }, [searchQuery, notes, sortBy]);

  const loadNotes = () => {
    const userNotes = localStorage.getItem(`notes_${currentUser}`);
    if (userNotes) {
      setNotes(JSON.parse(userNotes));
    } else {
      setNotes([]);
    }
  };

  const saveNotes = (updatedNotes) => {
    localStorage.setItem(`notes_${currentUser}`, JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  const handleCreateNote = () => {
    setEditingNote(null);
    setShowEditor(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setShowEditor(true);
  };

  const handleSaveNote = (note) => {
    let updatedNotes;
    if (editingNote) {
      updatedNotes = notes.map((n) => (n.id === note.id ? note : n));
    } else {
      updatedNotes = [note, ...notes];
    }
    saveNotes(updatedNotes);
    setShowEditor(false);
    setEditingNote(null);
  };

  const handleDeleteNote = (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      const updatedNotes = notes.filter((note) => note.id !== id);
      saveNotes(updatedNotes);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <h1>NotesApp</h1>
          </div>

          <div className="navbar-desktop">
            <div className="search-container">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="navbar-actions">
              <motion.button
                className="icon-button theme-toggle"
                onClick={toggleDarkMode}
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Toggle theme"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </motion.button>
              
              <div className="user-info">
                <User size={18} />
                <span>{currentUser}</span>
              </div>
              <motion.button
                className="button logout"
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut size={18} />
                Logout
              </motion.button>
            </div>
          </div>

          <motion.button
            className="mobile-menu-button"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle mobile menu"
          >
            <Menu size={24} />
          </motion.button>
        </div>

        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              className="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="search-container mobile">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <button 
                className="icon-button theme-toggle mobile" 
                onClick={toggleDarkMode}
                aria-label="Toggle theme"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              
              <div className="user-info mobile">
                <User size={18} />
                <span>{currentUser}</span>
              </div>
              <button className="button logout mobile" onClick={handleLogout}>
                <LogOut size={18} />
                Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <div className="dashboard-content">
        <div className="content-header">
          <div>
            <h2>My Notes</h2>
            <p className="notes-count">
              {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
              {searchQuery && ' found'}
            </p>
          </div>
          <div className="header-actions">
            <select 
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="updated">Last Updated</option>
              <option value="created">Date Created</option>
              <option value="title">Title (A-Z)</option>
            </select>
            <motion.button
              className="button primary add-note"
              onClick={handleCreateNote}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={20} />
              New Note
            </motion.button>
          </div>
        </div>

        <div className="notes-grid">
          <AnimatePresence mode="popLayout">
            {filteredNotes.length === 0 ? (
              <motion.div
                className="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h3>
                  {searchQuery
                    ? 'No notes found'
                    : 'No notes yet'}
                </h3>
                <p>
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Create your first note to get started'}
                </p>
                {!searchQuery && (
                  <motion.button
                    className="button primary"
                    onClick={handleCreateNote}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus size={20} />
                    Create Note
                  </motion.button>
                )}
              </motion.div>
            ) : (
              filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleEditNote}
                  onDelete={handleDeleteNote}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showEditor && (
          <NoteEditorModal
            note={editingNote}
            onClose={() => {
              setShowEditor(false);
              setEditingNote(null);
            }}
            onSave={handleSaveNote}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const App = () => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <AuthProvider>
      <AppContent showLogin={showLogin} setShowLogin={setShowLogin} />
    </AuthProvider>
  );
};

const AppContent = ({ showLogin, setShowLogin }) => {
  const { currentUser } = useAuth();

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        {!currentUser ? (
          showLogin ? (
            <LoginPage
              key="login"
              onSwitchToRegister={() => setShowLogin(false)}
            />
          ) : (
            <RegisterPage
              key="register"
              onSwitchToLogin={() => setShowLogin(true)}
            />
          )
        ) : (
          <NotesDashboard key="dashboard" />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;