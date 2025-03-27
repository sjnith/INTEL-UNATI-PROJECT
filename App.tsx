import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { analyzeCode } from './utils/codeAnalyzer';

const EXAMPLE_CODE = `def calculate_factorial(n):
    if n < 0:
        return None
    if n == 0 or n == 1:
        return 1
    return n * calculate_factorial(n - 1)

# Test the function
result = calculate_factorial(5)
print(f"Factorial of 5 is: {result}")`;

function App() {
  const [code, setCode] = useState(EXAMPLE_CODE);
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzeCode> | null>(null);

  const handleCodeChange = (value: string | undefined) => {
    if (value) {
      setCode(value);
    }
  };

  const handleAnalyze = () => {
    setAnalysis(analyzeCode(code));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-900/50 text-red-400 border border-red-700';
      case 'high': return 'bg-orange-900/50 text-orange-400 border border-orange-700';
      case 'medium': return 'bg-yellow-900/50 text-yellow-400 border border-yellow-700';
      case 'low': return 'bg-blue-900/50 text-blue-400 border border-blue-700';
      default: return 'bg-gray-900/50 text-gray-400 border border-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto p-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-primary-600 text-transparent bg-clip-text">
            Python Code Bug Analyzer
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Advanced code analysis tool that detects security vulnerabilities, performance issues, and best practices in your Python code.
          </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-primary-400">Python Code</h2>
              <p className="text-sm text-gray-400 mt-1">Enter your Python code below for analysis</p>
            </div>
            <div className="h-[500px] border-gray-700">
              <Editor
                height="100%"
                defaultLanguage="python"
                theme="vs-dark"
                value={code}
                onChange={handleCodeChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  rulers: [80],
                  wordWrap: 'on',
                  padding: { top: 16 },
                }}
              />
            </div>
            <div className="p-6 bg-gray-800 border-t border-gray-700">
              <button
                onClick={handleAnalyze}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <span>Analyze Code</span>
              </button>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-primary-400">Analysis Results</h2>
              <p className="text-sm text-gray-400 mt-1">Detailed breakdown of code issues and suggestions</p>
            </div>
            <div className="p-6 h-[600px] overflow-y-auto">
              {analysis ? (
                <div className="space-y-6">
                  <div className={`p-4 rounded-lg ${analysis.isValid ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'}`}>
                    <div className="text-lg font-semibold mb-2">
                      {analysis.isValid ? (
                        <span className="text-green-400">✓ Valid Python Code</span>
                      ) : (
                        <span className="text-red-400">✗ Invalid Python Code</span>
                      )}
                    </div>
                    <div className="text-sm">
                      {analysis.isValid
                        ? "The code follows correct Python syntax and structure"
                        : "The code contains syntax errors or structural issues"}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                      <div className="text-sm text-gray-400">Issues Found</div>
                      <div className="text-2xl font-bold text-primary-400 mt-1">
                        {analysis.suggestions.length}
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                      <div className="text-sm text-gray-400">Confidence Score</div>
                      <div className="text-2xl font-bold text-primary-400 mt-1">
                        {analysis.confidence.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                      <div className="text-sm text-gray-400">Time Complexity</div>
                      <div className="text-xl font-bold text-primary-400 mt-1">
                        {analysis.timeComplexity}
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                      <div className="text-sm text-gray-400">Cyclomatic Complexity</div>
                      <div className="text-xl font-bold text-primary-400 mt-1">
                        {analysis.metrics.cyclomaticComplexity}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                      <div className="text-sm text-gray-400">Maintainability Index</div>
                      <div className="text-xl font-bold text-primary-400 mt-1">
                        {analysis.metrics.maintainabilityIndex.toFixed(1)}
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                      <div className="text-sm text-gray-400">Average Function Length</div>
                      <div className="text-xl font-bold text-primary-400 mt-1">
                        {analysis.metrics.averageFunctionLength.toFixed(1)} lines
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {analysis.suggestions.map((issue, index) => (
                      <div key={index} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-primary-400 capitalize">{issue.type}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                              {issue.severity}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-300 mb-3">{issue.message}</p>
                        <div className="bg-gray-800 rounded p-3 border border-gray-700">
                          <div className="text-xs text-gray-400 mb-1">Impact:</div>
                          <p className="text-sm text-yellow-300 mb-3">{issue.impact}</p>
                          <div className="text-xs text-gray-400 mb-1">Suggested Fix:</div>
                          <p className="text-sm text-primary-300">{issue.fix}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <svg className="w-16 h-16 mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p className="text-lg font-medium">Click "Analyze Code" to see results</p>
                  <p className="text-sm mt-2">Your code analysis will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;