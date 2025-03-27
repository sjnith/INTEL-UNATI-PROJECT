interface CodeIssue {
  type: 'security' | 'error' | 'performance' | 'style' | 'logic' | 'best_practice' | 'complexity' | 'memory' | 'syntax' | 'semantic' | 'documentation' | 'concurrency' | 'validation' | 'dependency';
  message: string;
  fix: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  line?: number;
  impact: string;
  category: string;
}

interface AnalysisMetrics {
  cyclomaticComplexity: number;
  maintainabilityIndex: number;
  linesOfCode: number;
  numberOfFunctions: number;
  averageFunctionLength: number;
  commentCoverage: number;
  duplicateCode: number;
  unusedCode: number;
  testCoverage: number;
  securityScore: number;
}

interface AnalysisResult {
  isValid: boolean;
  hasBug: boolean;
  confidence: number;
  suggestions: CodeIssue[];
  metrics: AnalysisMetrics;
  timeComplexity: string;
  spaceComplexity: string;
  syntaxValidity: boolean;
  semanticValidity: boolean;
}

function isValidPythonSyntax(code: string): boolean {
  // Check for basic Python syntax
  const basicSyntaxRules = [
    // Check proper indentation (4 spaces or tabs)
    /^(\s{0}|\s{4}|\t)\S/m,
    // Check function definitions
    /def\s+[a-zA-Z_]\w*\s*\([^)]*\)\s*:/,
    // Check class definitions
    /class\s+[a-zA-Z_]\w*(\s*\([^)]*\))?\s*:/,
    // Check if statements
    /if\s+.*:/,
    // Check for loops
    /for\s+.*:/,
    // Check while loops
    /while\s+.*:/,
  ];

  // Check for matching parentheses, brackets, and braces
  const brackets = {
    '(': ')',
    '[': ']',
    '{': '}'
  };

  const stack: string[] = [];
  const chars = code.split('');

  for (const char of chars) {
    if (['(', '[', '{'].includes(char)) {
      stack.push(char);
    } else if [')', ']', '}'].includes(char) {
      const last = stack.pop();
      if (!last || brackets[last as keyof typeof brackets] !== char) {
        return false;
      }
    }
  }

  if (stack.length !== 0) {
    return false;
  }

  // Check for common syntax errors
  const commonErrors = [
    /[^=!<>]=[^=]/, // Single equals in condition
    /while\s*:\s*$/, // While without condition
    /if\s*:\s*$/, // If without condition
    /for\s*:\s*$/, // For without iteration
    /def\s*:\s*$/, // Function without name
    /class\s*:\s*$/, // Class without name
  ];

  for (const error of commonErrors) {
    if (error.test(code)) {
      return false;
    }
  }

  // Check if the code follows basic Python syntax rules
  return basicSyntaxRules.some(rule => rule.test(code));
}

function validatePythonCode(code: string): boolean {
  if (!code.trim()) return false;

  // Check for basic structural validity
  const hasValidStructure = code.split('\n').every(line => {
    const trimmedLine = line.trim();
    if (trimmedLine === '') return true;
    
    // Check for valid line endings
    if (trimmedLine.endsWith(':')) {
      return /^(if|elif|else|while|for|def|class|try|except|finally)\b/.test(trimmedLine);
    }
    
    return true;
  });

  if (!hasValidStructure) return false;

  // Check for valid function definitions
  const functionDefs = code.match(/def\s+\w+\s*\([^)]*\)\s*:/g) || [];
  for (const def of functionDefs) {
    if (!/def\s+[a-zA-Z_]\w*\s*\([^)]*\)\s*:/.test(def)) {
      return false;
    }
  }

  // Check for valid class definitions
  const classDefs = code.match(/class\s+\w+(\s*\([^)]*\))?\s*:/g) || [];
  for (const def of classDefs) {
    if (!/class\s+[a-zA-Z_]\w*(\s*\([^)]*\))?\s*:/.test(def)) {
      return false;
    }
  }

  // Check for balanced brackets and quotes
  const quotes = code.match(/["']/g) || [];
  if (quotes.length % 2 !== 0) return false;

  return isValidPythonSyntax(code);
}

function analyzeSemantics(code: string): CodeIssue[] {
  const issues: CodeIssue[] = [];

  // Check for undefined variables in function scope
  const functionMatches = code.match(/def\s+\w+\s*\([^)]*\):\s*([^]*?)(?=\n\S|$)/g) || [];
  
  functionMatches.forEach(functionCode => {
    const params = functionCode.match(/def\s+\w+\s*\((.*?)\)/)?.[1].split(',').map(p => p.trim()) || [];
    const variables = new Set([...params]);
    
    // Add variables defined within the function
    const assignments = functionCode.match(/(\w+)\s*=/g) || [];
    assignments.forEach(match => {
      variables.add(match.replace('=', '').trim());
    });

    // Check usage
    const words = functionCode.match(/\b\w+\b/g) || [];
    words.forEach(word => {
      if (!variables.has(word) && 
          !['print', 'def', 'class', 'return', 'if', 'else', 'elif', 'while', 'for', 'in', 'and', 'or', 'not', 'True', 'False', 'None'].includes(word)) {
        if (!['len', 'range', 'str', 'int', 'float', 'list', 'dict', 'set', 'tuple'].includes(word)) {
          issues.push({
            type: 'semantic',
            severity: 'medium',
            message: `Variable '${word}' might need to be defined`,
            fix: `Ensure '${word}' is defined before use or import if it's from a module`,
            impact: 'Potential runtime error if variable is undefined',
            category: 'Semantic'
          });
        }
      }
    });
  });

  return issues;
}

function analyzeBestPractices(code: string): CodeIssue[] {
  const issues: CodeIssue[] = [];

  if (code.match(/def\s+\w+\s*\([^)]*=\s*\[\s*\][^)]*\)/)) {
    issues.push({
      type: 'best_practice',
      severity: 'medium',
      message: 'Mutable default argument used',
      fix: 'Use None as default and initialize mutable object inside function',
      impact: 'Potential unexpected behavior with shared mutable state',
      category: 'Best Practices'
    });
  }

  if (code.match(/except\s*:/)) {
    issues.push({
      type: 'best_practice',
      severity: 'low',
      message: 'Bare except clause used',
      fix: 'Specify exception types to catch',
      impact: 'May hide errors or catch unexpected exceptions',
      category: 'Best Practices'
    });
  }

  return issues;
}

function analyzeSecurityIssues(code: string): CodeIssue[] {
  const issues: CodeIssue[] = [];

  if (code.match(/eval\s*\(/)) {
    issues.push({
      type: 'security',
      severity: 'critical',
      message: 'Use of eval() detected',
      fix: 'Avoid using eval() and use safer alternatives',
      impact: 'Critical security vulnerability - arbitrary code execution',
      category: 'Security'
    });
  }

  const credentialPatterns = [
    /password\s*=\s*["'][^"']+["']/,
    /api_key\s*=\s*["'][^"']+["']/,
    /secret\s*=\s*["'][^"']+["']/
  ];

  credentialPatterns.forEach(pattern => {
    if (pattern.test(code)) {
      issues.push({
        type: 'security',
        severity: 'high',
        message: 'Hardcoded credentials detected',
        fix: 'Use environment variables or secure credential management',
        impact: 'Security risk - exposed sensitive information',
        category: 'Security'
      });
    }
  });

  return issues;
}

export function analyzeCode(code: string): AnalysisResult {
  if (!code.trim()) {
    return {
      isValid: false,
      hasBug: false,
      confidence: 100,
      suggestions: [],
      metrics: {
        cyclomaticComplexity: 0,
        maintainabilityIndex: 100,
        linesOfCode: 0,
        numberOfFunctions: 0,
        averageFunctionLength: 0,
        commentCoverage: 0,
        duplicateCode: 0,
        unusedCode: 0,
        testCoverage: 0,
        securityScore: 100
      },
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
      syntaxValidity: true,
      semanticValidity: true
    };
  }

  const isValid = validatePythonCode(code);
  const semanticIssues = analyzeSemantics(code);
  const bestPracticeIssues = analyzeBestPractices(code);
  const securityIssues = analyzeSecurityIssues(code);

  const allIssues = [
    ...semanticIssues,
    ...bestPracticeIssues,
    ...securityIssues
  ];

  if (!isValid) {
    allIssues.unshift({
      type: 'syntax',
      severity: 'critical',
      message: 'Invalid Python syntax detected',
      fix: 'Review and correct syntax errors',
      impact: 'Code will not execute',
      category: 'Syntax'
    });
  }

  const cyclomaticComplexity = (code.match(/if|elif|for|while|and|or|except/g) || []).length + 1;
  const maintainabilityIndex = Math.max(0, (171 - 5.2 * Math.log(code.length) - 0.23 * cyclomaticComplexity - 16.2 * Math.log(code.split('\n').length)) * 100 / 171);

  const metrics: AnalysisMetrics = {
    cyclomaticComplexity,
    maintainabilityIndex,
    linesOfCode: code.split('\n').length,
    numberOfFunctions: (code.match(/def\s+/g) || []).length,
    averageFunctionLength: code.split('\n').length / Math.max(1, (code.match(/def\s+/g) || []).length),
    commentCoverage: ((code.match(/#.*$/gm) || []).length / code.split('\n').length) * 100,
    duplicateCode: 0,
    unusedCode: 0,
    testCoverage: (code.match(/def\s+test_/g) || []).length / Math.max(1, (code.match(/def\s+/g) || []).length) * 100,
    securityScore: 100 - (securityIssues.length * 20)
  };

  const confidence = Math.max(0, Math.min(100, 100 - (allIssues.length * 10)));

  return {
    isValid,
    hasBug: !isValid || allIssues.length > 0,
    confidence,
    suggestions: allIssues,
    metrics,
    timeComplexity: code.match(/for.*:\s*[^\n]*\n\s*for.*:/) ? 'O(n²)' : code.match(/for.*:|while.*:/) ? 'O(n)' : 'O(1)',
    spaceComplexity: 'O(1)',
    syntaxValidity: isValid,
    semanticValidity: semanticIssues.length === 0
  };
}