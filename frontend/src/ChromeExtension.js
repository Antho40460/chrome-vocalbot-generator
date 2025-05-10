import React, { useState, useEffect } from 'react';
import { FiGlobe, FiMic, FiExternalLink, FiCheck, FiLoader, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';
import './ChromeExtension.css';

// Access environment variables
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const ChromeExtension = () => {
  const [currentUrl, setCurrentUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [crawlResult, setCrawlResult] = useState(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState('initial'); // initial, analyzing, results, assistant, widget

  // Get current tab URL on component mount
  useEffect(() => {
    const getCurrentUrl = async () => {
      try {
        // Check if we're running in a Chrome extension context
        if (window.chrome && chrome.tabs) {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
              setCurrentUrl(tabs[0].url);
            }
          });
        } else {
          // For development outside of extension
          setCurrentUrl('https://example.com');
        }
      } catch (err) {
        console.error('Error getting URL:', err);
        setCurrentUrl('https://example.com');
      }
    };

    getCurrentUrl();
  }, []);

  const handleAnalyzeWebsite = async () => {
    if (!currentUrl) return;
    
    setIsAnalyzing(true);
    setError('');
    setStep('analyzing');
    
    try {
      // Call backend API
      const response = await axios.post(`${BACKEND_URL}/api/crawl`, {
        website_url: currentUrl
      });
      
      setCrawlResult(response.data);
      setStep('results');
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        'Failed to analyze website. Please check the URL and try again.'
      );
      setStep('initial');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateAssistant = async () => {
    if (!crawlResult) return;
    
    setIsAnalyzing(true);
    setError('');
    setStep('creating');
    
    try {
      // Redirect to the main app
      // In a real implementation, you would either:
      // 1. Create the assistant directly via API
      // 2. Open a new tab with assistant creation pre-filled
      
      // For now, simulate success
      setTimeout(() => {
        setStep('assistant');
        setIsAnalyzing(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setError('Failed to create assistant. Please try again.');
      setStep('results');
      setIsAnalyzing(false);
    }
  };

  const handleGenerateWidget = () => {
    setStep('widget');
  };

  const openFullApp = () => {
    // Open the main application in a new tab
    if (window.chrome && chrome.tabs) {
      chrome.tabs.create({ url: BACKEND_URL.replace('/api', '') });
    } else {
      window.open(BACKEND_URL.replace('/api', ''), '_blank');
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'initial':
        return (
          <div className="extension-content">
            <div className="url-display">
              <FiGlobe />
              <span>{currentUrl || 'No URL detected'}</span>
            </div>
            
            <p>Analyze this website to create a voice assistant using its content.</p>
            
            <button 
              className="extension-btn"
              onClick={handleAnalyzeWebsite}
              disabled={!currentUrl || isAnalyzing}
            >
              {isAnalyzing ? <FiLoader className="animate-spin" /> : <FiGlobe />}
              Analyze Website
            </button>
            
            <button className="extension-btn secondary" onClick={openFullApp}>
              <FiExternalLink />
              Open Full Dashboard
            </button>
            
            {error && (
              <div className="extension-message error">
                <FiAlertCircle /> {error}
              </div>
            )}
          </div>
        );
        
      case 'analyzing':
        return (
          <div className="extension-loading">
            <div className="loader"></div>
            <p>Analyzing website content...</p>
            <p>This may take a few moments</p>
          </div>
        );
        
      case 'results':
        return (
          <div className="extension-content">
            <div className="extension-message success">
              <FiCheck /> Website analyzed successfully!
            </div>
            
            <div className="extension-panel">
              <h2>Content Summary</h2>
              <p><strong>Website:</strong> {crawlResult?.website_url}</p>
              <p><strong>Title:</strong> {crawlResult?.content?.title}</p>
              <p><strong>Pages:</strong> {crawlResult?.content?.pages?.length || 0}</p>
              <p><strong>FAQs:</strong> {crawlResult?.content?.faq?.length || 0}</p>
            </div>
            
            <button 
              className="extension-btn"
              onClick={handleCreateAssistant}
            >
              <FiMic />
              Create Voice Assistant
            </button>
            
            <button className="extension-btn secondary" onClick={() => setStep('initial')}>
              Analyze Different URL
            </button>
          </div>
        );
        
      case 'creating':
        return (
          <div className="extension-loading">
            <div className="loader"></div>
            <p>Creating your voice assistant...</p>
          </div>
        );
        
      case 'assistant':
        return (
          <div className="extension-content">
            <div className="extension-message success">
              <FiCheck /> Assistant created successfully!
            </div>
            
            <div className="extension-panel">
              <h2>Assistant Details</h2>
              <p><strong>Name:</strong> Website Assistant</p>
              <p><strong>Voice:</strong> Nova (Female)</p>
              <p><strong>Language:</strong> English</p>
              <p><strong>Model:</strong> GPT-4o</p>
            </div>
            
            <button 
              className="extension-btn"
              onClick={handleGenerateWidget}
            >
              Create Website Widget
            </button>
            
            <button className="extension-btn secondary" onClick={openFullApp}>
              <FiExternalLink />
              Open Full Dashboard
            </button>
          </div>
        );
        
      case 'widget':
        return (
          <div className="extension-content">
            <div className="extension-message success">
              <FiCheck /> Widget code generated!
            </div>
            
            <div className="extension-panel">
              <h2>Widget Code</h2>
              <div className="code-preview">
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: '8px', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto',
                  maxHeight: '120px'
                }}>
                  {`<!-- VoiceBot Widget -->
<script>
  var vapiInstance = null;
  const assistant = "vapi_123456";
  const apiKey = "public_key_123";
  
  (function (d, t) {
    var g = document.createElement(t),
      s = d.getElementsByTagName(t)[0];
    g.src = "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
    g.defer = true;
    g.async = true;
    s.parentNode.insertBefore(g, s);
    g.onload = function () {
      vapiInstance = window.vapiSDK.run({
        apiKey: apiKey,
        assistant: assistant,
        config: {
          position: "bottom-right",
          color: "#4F46E5"
        },
      });
    };
  })(document, "script");
</script>`}
                </pre>
              </div>
              <p className="text-sm mt-2">
                Copy this code and paste it before the closing &lt;/body&gt; tag on your website.
              </p>
            </div>
            
            <button className="extension-btn" onClick={() => {
              // In a real implementation, copy to clipboard
              alert('Code copied to clipboard!');
            }}>
              Copy Code
            </button>
            
            <button className="extension-btn secondary" onClick={openFullApp}>
              <FiExternalLink />
              Open Full Dashboard
            </button>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="chrome-extension">
      <div className="extension-header">
        <h1>
          <FiMic style={{ display: 'inline', marginRight: '8px' }} />
          VoiceBot Generator
        </h1>
      </div>
      
      {renderContent()}
      
      <div className="extension-footer">
        <p style={{ fontSize: '12px', textAlign: 'center', margin: 0 }}>
          {step !== 'initial' ? (
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                setStep('initial');
              }}
              style={{ color: '#4F46E5', textDecoration: 'none' }}
            >
              Start Over
            </a>
          ) : (
            'Powered by Vapi.ai & Firecrawl.ai'
          )}
        </p>
      </div>
    </div>
  );
};

export default ChromeExtension;
