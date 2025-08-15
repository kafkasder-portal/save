import React, { useState } from 'react';
import { AlertTriangle, Bug, Info, CheckCircle } from 'lucide-react';

interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info' | 'debug';
  message: string;
  stack?: string;
  user?: string;
  url?: string;
}

const SentryTest: React.FC = () => {
  const [errors, setErrors] = useState<ErrorLog[]>([
    {
      id: '1',
      timestamp: '2024-01-15T10:30:00Z',
      level: 'error',
      message: 'TypeError: Cannot read property of undefined',
      stack: 'at Component.render (App.tsx:45:12)\nat ReactDOM.render',
      user: 'user@example.com',
      url: '/dashboard'
    },
    {
      id: '2',
      timestamp: '2024-01-15T10:25:00Z',
      level: 'warning',
      message: 'Deprecated API usage detected',
      user: 'admin@example.com',
      url: '/settings'
    },
    {
      id: '3',
      timestamp: '2024-01-15T10:20:00Z',
      level: 'info',
      message: 'User login successful',
      user: 'user@example.com',
      url: '/login'
    }
  ]);

  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);

  const triggerTestError = () => {
    const newError: ErrorLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      level: 'error',
      message: 'Test error triggered manually',
      stack: 'at triggerTestError (SentryTest.tsx:45:12)\nat onClick',
      user: 'test@example.com',
      url: '/sentry-test'
    };
    setErrors(prev => [newError, ...prev]);
  };

  const triggerTestWarning = () => {
    const newWarning: ErrorLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      level: 'warning',
      message: 'Test warning triggered manually',
      user: 'test@example.com',
      url: '/sentry-test'
    };
    setErrors(prev => [newWarning, ...prev]);
  };

  const clearErrors = () => {
    setErrors([]);
    setSelectedError(null);
  };

  const getIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Bug className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sentry Test Page</h1>
          <p className="text-gray-600">Test error tracking and monitoring functionality</p>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Controls</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={triggerTestError}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Trigger Test Error
            </button>
            <button
              onClick={triggerTestWarning}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Trigger Test Warning
            </button>
            <button
              onClick={clearErrors}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Clear All Errors
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Error List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Error Log ({errors.length})</h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {errors.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bug className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No errors logged</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {errors.map((error) => (
                    <div
                      key={error.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedError?.id === error.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedError(error)}
                    >
                      <div className="flex items-start gap-3">
                        {getIcon(error.level)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getLevelColor(error.level)}`}>
                              {error.level.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(error.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 truncate">{error.message}</p>
                          {error.user && (
                            <p className="text-xs text-gray-500 mt-1">User: {error.user}</p>
                          )}
                          {error.url && (
                            <p className="text-xs text-gray-500">URL: {error.url}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Error Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Error Details</h2>
            </div>
            <div className="p-6">
              {selectedError ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getLevelColor(selectedError.level)}`}>
                      {selectedError.level.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label>
                    <p className="text-sm text-gray-900">{new Date(selectedError.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <p className="text-sm text-gray-900">{selectedError.message}</p>
                  </div>
                  {selectedError.user && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                      <p className="text-sm text-gray-900">{selectedError.user}</p>
                    </div>
                  )}
                  {selectedError.url && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                      <p className="text-sm text-gray-900">{selectedError.url}</p>
                    </div>
                  )}
                  {selectedError.stack && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stack Trace</label>
                      <pre className="text-xs text-gray-900 bg-gray-50 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                        {selectedError.stack}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <Info className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Select an error to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Errors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {errors.filter(e => e.level === 'error').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Warnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {errors.filter(e => e.level === 'warning').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Info className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Info</p>
                <p className="text-2xl font-bold text-gray-900">
                  {errors.filter(e => e.level === 'info').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Bug className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{errors.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentryTest;
