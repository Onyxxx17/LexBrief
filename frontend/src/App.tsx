import { useState } from 'react'

interface Summary {
  id: number;
  summary: string;
  keyClauses: string[];
  wordCount: number;
  originalWordCount: number;
  compressionRatio: number;
  aiModel: string;
  createdAt: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState('');
  const [options, setOptions] = useState({
    length: 'medium',
    focus: 'general',
    tone: 'legal'
  });

  const API_BASE = 'http://localhost:3001/api';

  const handleFileUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');
    setSummary(null);

    try {
      const formData = new FormData();
      formData.append('document', file);

      const uploadResponse = await fetch(`${API_BASE}/documents/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload document');
      }

      const uploadData = await uploadResponse.json();
      const documentId = uploadData.document.id;

      const summaryResponse = await fetch(`${API_BASE}/summarize/${documentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!summaryResponse.ok) {
        throw new Error('Failed to generate summary');
      }

      const summaryData = await summaryResponse.json();
      setSummary(summaryData.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTextSummarize = async () => {
    if (!textInput.trim() || textInput.length < 100) {
      setError('Please enter at least 100 characters of text');
      return;
    }

    setLoading(true);
    setError('');
    setSummary(null);

    try {
      const response = await fetch(`${API_BASE}/summarize/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textInput,
          ...options,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="text-center py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            ⚖️ LexBrief
          </h1>
          <p className="text-lg md:text-xl text-slate-600 font-medium">
            AI-Powered Legal Document Summarizer
          </p>
          <p className="text-sm md:text-base text-slate-500 mt-2 max-w-2xl mx-auto">
            Transform complex legal documents into clear, actionable summaries with key insights and clauses
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pb-12">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white rounded-xl p-1 shadow-lg border border-slate-200">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'upload'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload File
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'text'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Paste Text
            </button>
          </div>
        </div>

        {/* Options Panel */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">
            Customization Options
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Summary Length
              </label>
              <select
                value={options.length}
                onChange={(e) => setOptions({ ...options, length: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-700 font-medium"
              >
                <option value="brief">Brief (2-3 sentences)</option>
                <option value="medium">Medium (1-2 paragraphs)</option>
                <option value="detailed">Detailed (3-4 paragraphs)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Focus Area
              </label>
              <select
                value={options.focus}
                onChange={(e) => setOptions({ ...options, focus: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-700 font-medium"
              >
                <option value="general">General Overview</option>
                <option value="financial">Financial Terms</option>
                <option value="compliance">Compliance & Legal</option>
                <option value="risks">Risk Assessment</option>
                <option value="obligations">Obligations & Duties</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Writing Tone
              </label>
              <select
                value={options.tone}
                onChange={(e) => setOptions({ ...options, tone: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-700 font-medium"
              >
                <option value="legal">Legal Professional</option>
                <option value="business">Business Friendly</option>
                <option value="simplified">Simplified Language</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-8">
          {activeTab === 'upload' ? (
            <div className="text-center">
              <div className="mb-6">
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 hover:border-blue-400 transition-colors duration-200">
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer block"
                  >
                    <div className="text-6xl mb-4">📄</div>
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">
                      {file ? file.name : 'Choose a document to analyze'}
                    </h3>
                    <p className="text-slate-500 mb-4">
                      Support for PDF, DOCX, DOC, and TXT files up to 10MB
                    </p>
                    <div className="inline-flex items-center px-4 py-2 bg-slate-100 rounded-lg text-slate-600 text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Click to browse files
                    </div>
                  </label>
                </div>
              </div>
              
              <button
                onClick={handleFileUpload}
                disabled={!file || loading}
                className="inline-flex items-center px-8 py-4 bg-linear-to-r from-blue-500 to-purple-600 text-black font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Document...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Summary
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Legal Document Text
                </label>
                <textarea
                  placeholder="Paste your legal document text here (minimum 100 characters)..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="w-full h-64 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-slate-900 placeholder-slate-400"
                  rows={12}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className={`text-sm ${textInput.length >= 100 ? 'text-green-600' : 'text-slate-500'}`}>
                    {textInput.length} characters (minimum 100 required)
                  </span>
                  {textInput.length >= 100 && (
                    <span className="text-green-600 text-sm font-medium">✓ Ready to process</span>
                  )}
                </div>
              </div>
              
              <div className="text-center">
                <button
                  onClick={handleTextSummarize}
                  disabled={textInput.length < 100 || loading}
                  className="inline-flex items-center px-8 py-4 bg-linear-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing Text...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Generate Summary
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Summary Results */}
        {summary && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">📋 Analysis Complete</h2>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                  {summary.wordCount} words
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                  {summary.compressionRatio}% compression
                </span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
                  {summary.aiModel}
                </span>
                <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full font-medium">
                  Original: {summary.originalWordCount} words
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Document Summary
                </h3>
                <div className="bg-slate-50 rounded-xl p-6">
                  <p className="text-slate-700 leading-relaxed">{summary.summary}</p>
                </div>
              </div>

              {summary.keyClauses && summary.keyClauses.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Key Clauses & Provisions
                  </h3>
                  <div className="space-y-3">
                    {summary.keyClauses.map((clause, index) => (
                      <div key={index} className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-xl">
                        <p className="text-slate-700 leading-relaxed">{clause}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App
