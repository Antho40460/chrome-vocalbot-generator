import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiHome, FiSettings, FiUser, FiDollarSign, FiClock, FiCheckCircle, FiCopy, FiMic, FiGlobe, FiBriefcase, FiPieChart } from 'react-icons/fi';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import './App.css';

// Load environment variables
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const STRIPE_PUBLIC_KEY = process.env.REACT_APP_STRIPE_PUBLIC_KEY || '';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    const session = supabase.auth.getSession();
    
    // Set user if session exists
    if (session) {
      setUser(session.user);
    }
    
    setLoading(false);
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="loader"></div>
    </div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/" element={user ? <Dashboard user={user} /> : <Landing />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
          <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/crawl" element={user ? <WebsiteCrawler user={user} /> : <Navigate to="/login" />} />
          <Route path="/assistant" element={user ? <AssistantCreator user={user} /> : <Navigate to="/login" />} />
          <Route path="/widget" element={user ? <WidgetGenerator user={user} /> : <Navigate to="/login" />} />
          <Route path="/billing" element={user ? <BillingDashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

function Landing() {
  return (
    <div className="landing-page">
      <header className="bg-indigo-600 text-white">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <FiMic className="text-2xl mr-2" />
            <span className="text-xl font-bold">VoiceBot Generator</span>
          </div>
          <div>
            <Link to="/login" className="px-4 py-2 mr-2 rounded text-white hover:bg-indigo-700 transition">Login</Link>
            <Link to="/signup" className="px-4 py-2 bg-white text-indigo-600 rounded hover:bg-gray-100 transition">Sign Up</Link>
          </div>
        </nav>
        
        <div className="container mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Create Voice Chatbots in Minutes</h1>
          <p className="text-xl mb-8">Turn your website content into an intelligent voice assistant with just a few clicks</p>
          <Link to="/signup" className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition text-lg">Get Started Free</Link>
        </div>
      </header>
      
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center text-indigo-600 text-2xl mx-auto mb-4">
                <FiGlobe />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Analyze Your Website</h3>
              <p className="text-gray-600">Our extension automatically extracts content from your website to create knowledge for your assistant.</p>
            </div>
            
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center text-indigo-600 text-2xl mx-auto mb-4">
                <FiMic />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Customize Your Assistant</h3>
              <p className="text-gray-600">Choose voice, language, and customize how your assistant responds to visitors.</p>
            </div>
            
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center text-indigo-600 text-2xl mx-auto mb-4">
                <FiBriefcase />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Add to Your Website</h3>
              <p className="text-gray-600">Get an easy-to-integrate widget code that you can add to your website in seconds.</p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-indigo-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Simple Pricing</h2>
          <p className="text-xl text-center text-gray-600 mb-12">Pay only for what you use</p>
          
          <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Usage-Based Pricing</h3>
              <div className="text-5xl font-bold text-indigo-600 mb-4">$0.49<span className="text-xl text-gray-600">/minute</span></div>
              <p className="text-gray-600 mb-6">Only pay for the time your visitors spend talking with your assistant</p>
              
              <ul className="text-left mb-8">
                <li className="flex items-center mb-3">
                  <FiCheckCircle className="text-green-500 mr-2" />
                  <span>No monthly subscription</span>
                </li>
                <li className="flex items-center mb-3">
                  <FiCheckCircle className="text-green-500 mr-2" />
                  <span>Unlimited website visitors</span>
                </li>
                <li className="flex items-center mb-3">
                  <FiCheckCircle className="text-green-500 mr-2" />
                  <span>Real-time usage dashboard</span>
                </li>
                <li className="flex items-center">
                  <FiCheckCircle className="text-green-500 mr-2" />
                  <span>Pay-as-you-go billing</span>
                </li>
              </ul>
              
              <Link to="/signup" className="block w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">Start Creating</Link>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <FiMic className="text-2xl mr-2" />
              <span className="text-xl font-bold">VoiceBot Generator</span>
            </div>
            
            <div className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} VoiceBot Generator. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real implementation, use Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success('Login successful!');
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center mb-6">
          <FiMic className="text-3xl text-indigo-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-6">Log in to VoiceBot Generator</h2>
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <span className="text-gray-600">Don't have an account?</span>{' '}
          <Link to="/signup" className="text-indigo-600 hover:text-indigo-800">Sign up</Link>
        </div>
      </div>
    </div>
  );
}

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real implementation, use Supabase auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success('Check your email to confirm your account');
    } catch (error) {
      toast.error(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center mb-6">
          <FiMic className="text-3xl text-indigo-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-6">Create your VoiceBot account</h2>
        
        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signup-email">
              Email
            </label>
            <input
              className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signup-password">
              Password
            </label>
            <input
              className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength="6"
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <span className="text-gray-600">Already have an account?</span>{' '}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-800">Log in</Link>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ user }) {
  const [activeTab, setActiveTab] = useState('home');
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-800 text-white">
        <div className="p-4 flex items-center">
          <FiMic className="text-2xl mr-2" />
          <span className="text-xl font-bold">VoiceBot</span>
        </div>
        
        <nav className="mt-8">
          <NavItem
            icon={<FiHome />}
            text="Home"
            active={activeTab === 'home'}
            onClick={() => setActiveTab('home')}
          />
          <NavItem
            icon={<FiGlobe />}
            text="Website Crawler"
            active={activeTab === 'crawler'}
            onClick={() => setActiveTab('crawler')}
          />
          <NavItem
            icon={<FiMic />}
            text="Assistant Creator"
            active={activeTab === 'assistant'}
            onClick={() => setActiveTab('assistant')}
          />
          <NavItem
            icon={<FiBriefcase />}
            text="Widget Generator"
            active={activeTab === 'widget'}
            onClick={() => setActiveTab('widget')}
          />
          <NavItem
            icon={<FiDollarSign />}
            text="Billing"
            active={activeTab === 'billing'}
            onClick={() => setActiveTab('billing')}
          />
          <NavItem
            icon={<FiSettings />}
            text="Settings"
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
          />
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <header className="bg-white shadow-sm">
          <div className="mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold">
              {activeTab === 'home' && 'Dashboard'}
              {activeTab === 'crawler' && 'Website Crawler'}
              {activeTab === 'assistant' && 'Assistant Creator'}
              {activeTab === 'widget' && 'Widget Generator'}
              {activeTab === 'billing' && 'Billing'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
            
            <div className="flex items-center">
              <span className="mr-4 text-gray-600">{user?.email}</span>
              <button 
                className="text-gray-700 hover:text-indigo-600"
                onClick={async () => {
                  await supabase.auth.signOut();
                  toast.success('Logged out successfully');
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        
        <main className="p-6">
          {activeTab === 'home' && <HomeTab user={user} />}
          {activeTab === 'crawler' && <WebsiteCrawler user={user} />}
          {activeTab === 'assistant' && <AssistantCreator user={user} />}
          {activeTab === 'widget' && <WidgetGenerator user={user} />}
          {activeTab === 'billing' && <BillingDashboard user={user} />}
          {activeTab === 'settings' && <SettingsTab user={user} />}
        </main>
      </div>
    </div>
  );
}

function NavItem({ icon, text, active, onClick }) {
  return (
    <div
      className={`flex items-center px-4 py-3 cursor-pointer transition-colors ${
        active ? 'bg-indigo-900' : 'hover:bg-indigo-700'
      }`}
      onClick={onClick}
    >
      <span className="mr-3">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function HomeTab({ user }) {
  const [stats, setStats] = useState({
    websites: 0,
    assistants: 0,
    minutes: 0,
    cost: 0
  });
  
  useEffect(() => {
    // In a real implementation, fetch stats from backend
    // For now, use mock data
    setStats({
      websites: 2,
      assistants: 1,
      minutes: 45,
      cost: 22.05
    });
  }, []);
  
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<FiGlobe className="text-blue-500" />}
          title="Websites"
          value={stats.websites}
          description="Total websites analyzed"
        />
        <StatCard
          icon={<FiMic className="text-green-500" />}
          title="Assistants"
          value={stats.assistants}
          description="Active voice assistants"
        />
        <StatCard
          icon={<FiClock className="text-purple-500" />}
          title="Minutes"
          value={stats.minutes}
          description="Total conversation time"
        />
        <StatCard
          icon={<FiDollarSign className="text-yellow-500" />}
          title="Cost"
          value={`$${stats.cost.toFixed(2)}`}
          description="Total usage cost"
        />
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionCard
            icon={<FiGlobe />}
            title="Analyze Website"
            description="Extract content from your website"
            buttonText="Start"
            onClick={() => window.location.href = '/crawl'}
          />
          <ActionCard
            icon={<FiMic />}
            title="Create Assistant"
            description="Create a new voice assistant"
            buttonText="Create"
            onClick={() => window.location.href = '/assistant'}
          />
          <ActionCard
            icon={<FiBriefcase />}
            title="Generate Widget"
            description="Get code to add to your website"
            buttonText="Generate"
            onClick={() => window.location.href = '/widget'}
          />
        </div>
      </div>
      
      {stats.assistants > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-2 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Website
                </th>
                <th className="px-4 py-2 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-4 py-2 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-2 border-b border-gray-200">
                  {new Date().toLocaleDateString()}
                </td>
                <td className="px-4 py-2 border-b border-gray-200">
                  example.com
                </td>
                <td className="px-4 py-2 border-b border-gray-200">
                  12 minutes
                </td>
                <td className="px-4 py-2 border-b border-gray-200">
                  $5.88
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b border-gray-200">
                  {new Date(Date.now() - 86400000).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 border-b border-gray-200">
                  mysite.com
                </td>
                <td className="px-4 py-2 border-b border-gray-200">
                  33 minutes
                </td>
                <td className="px-4 py-2 border-b border-gray-200">
                  $16.17
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, title, value, description }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-gray-100 mr-4">
          {icon}
        </div>
        <div>
          <div className="text-sm text-gray-500">{title}</div>
          <div className="text-2xl font-semibold">{value}</div>
          <div className="text-xs text-gray-500">{description}</div>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon, title, description, buttonText, onClick }) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 flex flex-col">
      <div className="flex items-center mb-4">
        <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-3">
          {icon}
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <button
        className="mt-auto px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        onClick={onClick}
      >
        {buttonText}
      </button>
    </div>
  );
}

function WebsiteCrawler({ user }) {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [crawlResults, setCrawlResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleCrawl = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Validate URL
      new URL(websiteUrl);
      
      // Call backend API
      const response = await axios.post(`${BACKEND_URL}/api/crawl`, {
        website_url: websiteUrl
      });
      
      setCrawlResults(response.data);
      toast.success('Website crawled successfully!');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Invalid URL or crawling failed');
      toast.error('Website crawling failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Website Crawler</h2>
        <p className="text-gray-600 mb-4">
          Enter your website URL to extract content and create a knowledge base for your voice assistant.
        </p>
        
        <form onSubmit={handleCrawl} className="mb-4">
          <div className="flex">
            <input
              type="text"
              placeholder="https://example.com"
              className="flex-1 px-4 py-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              required
            />
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-r hover:bg-indigo-700 transition"
              disabled={loading}
            >
              {loading ? 'Analyzing...' : 'Analyze Site'}
            </button>
          </div>
          {error && (
            <div className="text-red-500 text-sm mt-2">{error}</div>
          )}
        </form>
      </div>
      
      {crawlResults && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Crawl Results</h2>
          
          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-2">Website: {crawlResults.website_url}</h3>
            <p className="text-gray-600">Title: {crawlResults.content.title}</p>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Pages</h3>
            {crawlResults.content.pages.map((page, index) => (
              <div key={index} className="border-b py-3">
                <div className="font-semibold">{page.title}</div>
                <div className="text-sm text-gray-500 mb-1">{page.url}</div>
                <p className="text-gray-700">{page.content}</p>
              </div>
            ))}
          </div>
          
          {crawlResults.content.faq && crawlResults.content.faq.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-2">FAQs</h3>
              {crawlResults.content.faq.map((item, index) => (
                <div key={index} className="mb-3">
                  <div className="font-semibold">{item.question}</div>
                  <p className="text-gray-700">{item.answer}</p>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6">
            <button
              className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
              onClick={() => window.location.href = '/assistant'}
            >
              Create Assistant with This Content
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AssistantCreator({ user }) {
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState('');
  const [assistantName, setAssistantName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState(
    'You are a helpful assistant for this website. Answer user questions accurately based on the website content.'
  );
  const [voiceId, setVoiceId] = useState('nova');
  const [language, setLanguage] = useState('en');
  const [llmModel, setLlmModel] = useState('gpt-4o');
  const [temperature, setTemperature] = useState(0.7);
  const [maxResponseDuration, setMaxResponseDuration] = useState(120);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdAssistant, setCreatedAssistant] = useState(null);
  
  useEffect(() => {
    // In a real implementation, fetch user's crawled websites
    // For now, use mock data
    setWebsites([
      { id: '123', url: 'example.com', title: 'Example Website' },
      { id: '456', url: 'mysite.com', title: 'My Site' }
    ]);
  }, []);
  
  const handleCreateAssistant = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Call backend API to create assistant
      const response = await axios.post(`${BACKEND_URL}/api/assistants`, {
        website_id: selectedWebsite,
        config: {
          name: assistantName,
          system_prompt: systemPrompt,
          voice_id: voiceId,
          language,
          llm_model: llmModel,
          temperature: parseFloat(temperature),
          max_response_duration: parseInt(maxResponseDuration)
        }
      });
      
      setCreatedAssistant(response.data);
      toast.success('Assistant created successfully!');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to create assistant');
      toast.error('Assistant creation failed');
    } finally {
      setLoading(false);
    }
  };
  
  const voices = [
    { id: 'nova', name: 'Nova (Female)' },
    { id: 'shimmer', name: 'Shimmer (Female)' },
    { id: 'echo', name: 'Echo (Male)' },
    { id: 'fable', name: 'Fable (Male)' }
  ];
  
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'de', name: 'German' }
  ];
  
  const models = [
    { id: 'gpt-4o', name: 'GPT-4o (Recommended)' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Faster)' }
  ];
  
  return (
    <div>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Create Voice Assistant</h2>
        <p className="text-gray-600 mb-6">
          Design your custom voice assistant using the content from your crawled website.
        </p>
        
        {!createdAssistant ? (
          <form onSubmit={handleCreateAssistant}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Select Website
              </label>
              <select
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedWebsite}
                onChange={(e) => setSelectedWebsite(e.target.value)}
                required
              >
                <option value="">-- Select a website --</option>
                {websites.map((website) => (
                  <option key={website.id} value={website.id}>
                    {website.title} ({website.url})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Assistant Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={assistantName}
                onChange={(e) => setAssistantName(e.target.value)}
                placeholder="e.g., Company Support Assistant"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                System Prompt
              </label>
              <textarea
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Instructions for your assistant..."
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                This defines how your assistant will behave and respond.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Voice
                </label>
                <select
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={voiceId}
                  onChange={(e) => setVoiceId(e.target.value)}
                >
                  {voices.map((voice) => (
                    <option key={voice.id} value={voice.id}>
                      {voice.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Language
                </label>
                <select
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  LLM Model
                </label>
                <select
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={llmModel}
                  onChange={(e) => setLlmModel(e.target.value)}
                >
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Temperature ({temperature})
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  className="w-full"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>More Precise</span>
                  <span>More Creative</span>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Max Response Duration (seconds)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={maxResponseDuration}
                onChange={(e) => setMaxResponseDuration(e.target.value)}
                min="10"
                max="300"
              />
              <p className="text-sm text-gray-500 mt-1">
                Maximum length of assistant's voice responses in seconds.
              </p>
            </div>
            
            <div className="bg-indigo-50 p-4 rounded-lg mb-6">
              <div className="flex items-center mb-2">
                <FiCheckCircle className="text-indigo-600 mr-2" />
                <span className="font-semibold">Test Mode</span>
              </div>
              <p className="text-sm text-gray-600">
                Your assistant will be created in Test Mode, which allows up to 5 minutes of testing before finalizing.
              </p>
            </div>
            
            {error && (
              <div className="text-red-500 text-sm mb-4">{error}</div>
            )}
            
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Assistant'}
            </button>
          </form>
        ) : (
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <div className="flex items-center mb-4">
              <FiCheckCircle className="text-green-500 text-2xl mr-3" />
              <h3 className="text-xl font-bold text-green-700">Assistant Created Successfully!</h3>
            </div>
            
            <div className="mb-4">
              <div className="font-semibold">Name:</div>
              <div>{createdAssistant.config.name}</div>
            </div>
            
            <div className="mb-4">
              <div className="font-semibold">Voice:</div>
              <div>{voices.find(v => v.id === createdAssistant.config.voice_id)?.name || createdAssistant.config.voice_id}</div>
            </div>
            
            <div className="mb-4">
              <div className="font-semibold">Language:</div>
              <div>{languages.find(l => l.code === createdAssistant.config.language)?.name || createdAssistant.config.language}</div>
            </div>
            
            <div className="mb-4">
              <div className="font-semibold">Model:</div>
              <div>{models.find(m => m.id === createdAssistant.config.llm_model)?.name || createdAssistant.config.llm_model}</div>
            </div>
            
            <div className="mb-6">
              <div className="font-semibold">Assistant ID:</div>
              <div className="font-mono bg-gray-100 p-2 rounded">{createdAssistant.id}</div>
            </div>
            
            <div className="flex space-x-4">
              <button
                className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                onClick={() => window.location.href = '/widget'}
              >
                Generate Widget
              </button>
              
              <button
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
                onClick={() => setCreatedAssistant(null)}
              >
                Create Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function WidgetGenerator({ user }) {
  const [assistants, setAssistants] = useState([]);
  const [selectedAssistant, setSelectedAssistant] = useState('');
  const [color, setColor] = useState('#4F46E5');
  const [position, setPosition] = useState('bottom-right');
  const [ctaText, setCtaText] = useState('Chat with me');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedWidget, setGeneratedWidget] = useState(null);
  
  useEffect(() => {
    // In a real implementation, fetch user's assistants
    // For now, use mock data
    setAssistants([
      { 
        id: '789', 
        config: { name: 'Customer Support' },
        website_id: '123',
        website_url: 'example.com'
      }
    ]);
  }, []);
  
  const handleGenerateWidget = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Call backend API to generate widget
      const response = await axios.post(`${BACKEND_URL}/api/widgets`, {
        assistant_id: selectedAssistant,
        config: {
          color,
          position,
          cta_text: ctaText,
          avatar_url: avatarUrl || undefined
        }
      });
      
      setGeneratedWidget(response.data);
      toast.success('Widget generated successfully!');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to generate widget');
      toast.error('Widget generation failed');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCopyCode = () => {
    if (generatedWidget) {
      navigator.clipboard.writeText(generatedWidget.iframe_code);
      toast.success('Widget code copied to clipboard!');
    }
  };
  
  const positions = [
    { value: 'bottom-right', label: 'Bottom Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'top-left', label: 'Top Left' }
  ];
  
  return (
    <div>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Widget Generator</h2>
        <p className="text-gray-600 mb-6">
          Create and customize a widget to add your voice assistant to your website.
        </p>
        
        {!generatedWidget ? (
          <form onSubmit={handleGenerateWidget}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Select Assistant
              </label>
              <select
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedAssistant}
                onChange={(e) => setSelectedAssistant(e.target.value)}
                required
              >
                <option value="">-- Select an assistant --</option>
                {assistants.map((assistant) => (
                  <option key={assistant.id} value={assistant.id}>
                    {assistant.config.name} ({assistant.website_url})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Button Color
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    className="w-12 h-10 border rounded mr-2"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Position
                </label>
                <select
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                >
                  {positions.map((pos) => (
                    <option key={pos.value} value={pos.value}>
                      {pos.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Button Text
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="e.g., Chat with me"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Avatar URL (Optional)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                />
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">Widget Preview</h3>
              <div className="border border-dashed border-gray-300 h-40 flex items-center justify-center relative">
                <div className={`absolute ${position.replace('-', '-')} m-4`}>
                  <button
                    style={{ backgroundColor: color }}
                    className="px-4 py-2 text-white rounded-full flex items-center"
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-6 h-6 rounded-full mr-2" />
                    ) : (
                      <FiMic className="mr-2" />
                    )}
                    {ctaText}
                  </button>
                </div>
                <span className="text-gray-400">Website Preview</span>
              </div>
            </div>
            
            {error && (
              <div className="text-red-500 text-sm mb-4">{error}</div>
            )}
            
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Widget'}
            </button>
          </form>
        ) : (
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <div className="flex items-center mb-4">
              <FiCheckCircle className="text-green-500 text-2xl mr-3" />
              <h3 className="text-xl font-bold text-green-700">Widget Generated Successfully!</h3>
            </div>
            
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Add this code to your website:</h4>
              <div className="relative">
                <SyntaxHighlighter
                  language="html"
                  style={docco}
                  className="p-4 rounded border border-gray-300 max-h-64 overflow-y-auto"
                >
                  {generatedWidget.iframe_code}
                </SyntaxHighlighter>
                <button
                  className="absolute top-2 right-2 p-2 bg-white rounded-md border border-gray-300 hover:bg-gray-50"
                  onClick={handleCopyCode}
                  title="Copy to clipboard"
                >
                  <FiCopy />
                </button>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Instructions:</h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Copy the code above.</li>
                <li>Paste it before the closing &lt;/body&gt; tag on your website.</li>
                <li>Save your changes and test the widget on your website.</li>
              </ol>
            </div>
            
            <div className="flex space-x-4">
              <button
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
                onClick={() => setGeneratedWidget(null)}
              >
                Create Another Widget
              </button>
              
              <button
                className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                onClick={handleCopyCode}
              >
                Copy Code
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BillingDashboard({ user }) {
  const [usageData, setUsageData] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // In a real implementation, fetch usage data from backend
    // For now, use mock data
    const mockData = [
      {
        id: '1',
        date: '2023-03-15',
        assistant_name: 'Customer Support',
        website: 'example.com',
        duration: 120, // seconds
        cost: 0.98 // USD
      },
      {
        id: '2',
        date: '2023-03-14',
        assistant_name: 'Customer Support',
        website: 'example.com',
        duration: 450, // seconds
        cost: 3.68 // USD
      },
      {
        id: '3',
        date: '2023-03-12',
        assistant_name: 'Sales Assistant',
        website: 'mysite.com',
        duration: 1080, // seconds
        cost: 8.82 // USD
      }
    ];
    
    setUsageData(mockData);
    setTotalCost(mockData.reduce((sum, item) => sum + item.cost, 0));
  }, []);
  
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  const handleTopUp = () => {
    // In a real implementation, redirect to Stripe checkout
    toast.info('Redirecting to payment page...');
  };
  
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
              <FiClock className="text-xl" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Usage</div>
              <div className="text-2xl font-semibold">
                {formatDuration(usageData.reduce((sum, item) => sum + item.duration, 0))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
              <FiDollarSign className="text-xl" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Cost</div>
              <div className="text-2xl font-semibold">${totalCost.toFixed(2)}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
              <FiPieChart className="text-xl" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Rate</div>
              <div className="text-2xl font-semibold">$0.49/minute</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Usage History</h2>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            onClick={handleTopUp}
          >
            Top Up Credit
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-2 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Assistant
                </th>
                <th className="px-4 py-2 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Website
                </th>
                <th className="px-4 py-2 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-4 py-2 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody>
              {usageData.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2 border-b border-gray-200">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200">
                    {item.assistant_name}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200">
                    {item.website}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200">
                    {formatDuration(item.duration)}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200">
                    ${item.cost.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-indigo-50 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Understanding Your Billing</h2>
        <ul className="space-y-3">
          <li className="flex items-start">
            <FiCheckCircle className="text-indigo-600 mt-1 mr-2" />
            <span>You are charged <strong>$0.49 per minute</strong> of conversation time.</span>
          </li>
          <li className="flex items-start">
            <FiCheckCircle className="text-indigo-600 mt-1 mr-2" />
            <span>Time is measured from when a visitor starts speaking until the assistant finishes responding.</span>
          </li>
          <li className="flex items-start">
            <FiCheckCircle className="text-indigo-600 mt-1 mr-2" />
            <span>You can view detailed usage statistics per website and assistant.</span>
          </li>
          <li className="flex items-start">
            <FiCheckCircle className="text-indigo-600 mt-1 mr-2" />
            <span>Add credit at any time to ensure your assistants keep running.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function SettingsTab({ user }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100"
              value={user?.email || ''}
              disabled
            />
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
          Add Payment Method
        </button>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">API Keys</h3>
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Your API Key</span>
            <button className="text-indigo-600 hover:text-indigo-800">
              <FiCopy />
            </button>
          </div>
          <div className="font-mono bg-gray-100 p-2 rounded">
            ••••••••••••••••••••••••••••••
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Use this key to access the API programmatically.
          </p>
        </div>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition">
          Regenerate Key
        </button>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h3>
        <button className="px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 transition">
          Delete Account
        </button>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
      <p className="text-xl mb-8">Page not found</p>
      <Link to="/" className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
        Go Home
      </Link>
    </div>
  );
}

export default App;
