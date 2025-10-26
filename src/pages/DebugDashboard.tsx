import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info, Download, Trash2, RefreshCw, Database, Activity } from 'lucide-react';
import { errorLogger, type ErrorLog } from '../lib/errorLogger';
import { supabase } from '../lib/supabase';
import { SCHEMA_FIELDS } from '../lib/dataValidator';

export const DebugDashboard: React.FC = () => {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof errorLogger.getStats>>();
  const [filter, setFilter] = useState<{
    type?: ErrorLog['type'];
    severity?: ErrorLog['severity'];
  }>({});
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [schemaInfo, setSchemaInfo] = useState<any>(null);

  useEffect(() => {
    loadLogs();
    checkSchema();

    let interval: NodeJS.Timeout | undefined;
    if (autoRefresh) {
      interval = setInterval(loadLogs, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [filter, autoRefresh]);

  const loadLogs = () => {
    const allLogs = errorLogger.getLogs({
      type: filter.type,
      severity: filter.severity,
      limit: 100,
    });
    setLogs(allLogs);
    setStats(errorLogger.getStats());
  };

  const checkSchema = async () => {
    try {
      // Check if we can connect to the database
      const { data: domains, error: domainError } = await supabase
        .from('domains')
        .select('*')
        .limit(1);

      const { data: workflows, error: workflowError } = await supabase
        .from('workflows')
        .select('*')
        .limit(1);

      const { data: subdomains, error: subdomainError } = await supabase
        .from('subdomains')
        .select('*')
        .limit(1);

      setSchemaInfo({
        domains: {
          accessible: !domainError,
          error: domainError?.message,
          sampleFields: domains?.[0] ? Object.keys(domains[0]) : [],
        },
        workflows: {
          accessible: !workflowError,
          error: workflowError?.message,
          sampleFields: workflows?.[0] ? Object.keys(workflows[0]) : [],
        },
        subdomains: {
          accessible: !subdomainError,
          error: subdomainError?.message,
          sampleFields: subdomains?.[0] ? Object.keys(subdomains[0]) : [],
        },
      });
    } catch (error) {
      console.error('Failed to check schema:', error);
    }
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all error logs?')) {
      errorLogger.clearLogs();
      loadLogs();
    }
  };

  const handleExportLogs = () => {
    const json = errorLogger.exportLogs();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity: ErrorLog['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'medium':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'low':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    }
  };

  const getSeverityIcon = (severity: ErrorLog['severity']) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <XCircle className="w-5 h-5" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5" />;
      case 'low':
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const compareSchemaFields = (table: string, actualFields: string[]) => {
    const expectedFields = SCHEMA_FIELDS[table as keyof typeof SCHEMA_FIELDS] || [];
    const missing = expectedFields.filter(f => !actualFields.includes(f));
    const extra = actualFields.filter(f => !expectedFields.includes(f));
    return { missing, extra };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Debug Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            System diagnostics and error monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span className="text-gray-700 dark:text-gray-300">Auto-refresh</span>
          </label>
          <button
            onClick={loadLogs}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Errors</div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <div className="text-sm text-gray-600 dark:text-gray-400">Recent (1h)</div>
            </div>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.recentErrors}</div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <div className="text-sm text-gray-600 dark:text-gray-400">Critical</div>
            </div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.criticalErrors}</div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <div className="text-sm text-gray-600 dark:text-gray-400">Database</div>
            </div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {stats.byType.database || 0}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div className="text-sm text-gray-600 dark:text-gray-400">Validation</div>
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.byType.validation || 0}
            </div>
          </div>
        </div>
      )}

      {/* Schema Status */}
      {schemaInfo && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Database Schema Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(schemaInfo).map(([tableName, info]: [string, any]) => {
              const comparison = info.sampleFields.length > 0
                ? compareSchemaFields(tableName, info.sampleFields)
                : { missing: [], extra: [] };

              return (
                <div
                  key={tableName}
                  className={`p-4 rounded-lg border ${
                    info.accessible
                      ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {info.accessible ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                    <h3 className="font-bold text-gray-900 dark:text-white capitalize">{tableName}</h3>
                  </div>
                  {info.accessible ? (
                    <div className="text-sm space-y-1">
                      <div className="text-gray-600 dark:text-gray-400">
                        Fields: {info.sampleFields.length}
                      </div>
                      {comparison.missing.length > 0 && (
                        <div className="text-orange-600 dark:text-orange-400">
                          Missing: {comparison.missing.join(', ')}
                        </div>
                      )}
                      {comparison.extra.length > 0 && (
                        <div className="text-blue-600 dark:text-blue-400">
                          Extra: {comparison.extra.join(', ')}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-red-600 dark:text-red-400">{info.error}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Error Type
              </label>
              <select
                value={filter.type || 'all'}
                onChange={(e) => setFilter({ ...filter, type: e.target.value === 'all' ? undefined : e.target.value as ErrorLog['type'] })}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="database">Database</option>
                <option value="network">Network</option>
                <option value="validation">Validation</option>
                <option value="runtime">Runtime</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Severity
              </label>
              <select
                value={filter.severity || 'all'}
                onChange={(e) => setFilter({ ...filter, severity: e.target.value === 'all' ? undefined : e.target.value as ErrorLog['severity'] })}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportLogs}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={handleClearLogs}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Logs */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Error Logs ({logs.length})</h2>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-800 max-h-[600px] overflow-y-auto">
          {logs.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No errors logged</h3>
              <p className="text-gray-600 dark:text-gray-400">System is running smoothly!</p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`mt-1 p-2 rounded-lg ${getSeverityColor(log.severity)}`}>
                    {getSeverityIcon(log.severity)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(log.severity)}`}>
                        {log.severity.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {log.type}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{log.message}</h3>

                    {log.context && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {log.context.table && <span className="mr-2">Table: {log.context.table}</span>}
                        {log.context.operation && <span className="mr-2">Operation: {log.context.operation}</span>}
                        {log.context.route && <span>Route: {log.context.route}</span>}
                      </div>
                    )}

                    {log.details && (
                      <details className="mt-2">
                        <summary className="text-sm text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                          Show details
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}

                    {log.stack && (
                      <details className="mt-2">
                        <summary className="text-sm text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                          Show stack trace
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap">
                          {log.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
