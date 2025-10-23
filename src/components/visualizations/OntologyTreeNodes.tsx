import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  FileText,
  Bot,
  TrendingUp,
  Layers,
  CheckCircle,
  Clock,
  FileEdit,
  AlertCircle,
} from 'lucide-react';

interface Workflow {
  id: number;
  name: string;
  status: string;
  complexity: number;
  agentic_potential: number;
  implementation_wave: number;
}

interface Subdomain {
  id: number;
  name: string;
  children: Workflow[];
  avg_potential: number | null;
  avg_complexity: number | null;
  workflow_count: number;
}

interface Domain {
  id: number;
  name: string;
  children: Subdomain[];
  workflow_count: number;
}

interface DomainNodeProps {
  domain: Domain;
  isExpanded: boolean;
}

interface SubdomainNodeProps {
  subdomain: Subdomain;
  isExpanded: boolean;
}

interface WorkflowNodeProps {
  workflow: Workflow;
}

export const DomainNode: React.FC<DomainNodeProps> = ({ domain, isExpanded }) => {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
        {isExpanded ? (
          <FolderOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        ) : (
          <Folder className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-left">{domain.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-500 text-left">
            {domain.children.length} subdomains • {domain.workflow_count} workflows
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium rounded-full">
          {domain.workflow_count} workflows
        </span>
      </div>
    </div>
  );
};

export const SubdomainNode: React.FC<SubdomainNodeProps> = ({ subdomain, isExpanded }) => {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
        <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 dark:text-white text-left">{subdomain.name}</h4>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-500">
            <span>{subdomain.workflow_count} workflows</span>
            {subdomain.avg_potential !== null && (
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Avg Potential: {subdomain.avg_potential.toFixed(1)}/5
              </span>
            )}
          </div>
        </div>
      </div>
      {subdomain.workflow_count > 0 && (
        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
          {subdomain.workflow_count}
        </span>
      )}
    </div>
  );
};

export const WorkflowNode: React.FC<WorkflowNodeProps> = ({ workflow }) => {
  const navigate = useNavigate();

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'draft':
        return <FileEdit className="w-4 h-4 text-gray-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'in_progress':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'draft':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  const getPotentialColor = (potential: number) => {
    if (potential >= 4) return 'text-red-600 dark:text-red-400';
    if (potential >= 3) return 'text-orange-600 dark:text-orange-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  return (
    <button
      onClick={() => navigate(`/workflows/${workflow.id}`)}
      className="w-full flex items-center justify-between p-3 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors border border-gray-200 dark:border-gray-700 rounded-lg group"
    >
      <div className="flex items-center gap-3 flex-1">
        <FileText className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h5 className="font-medium text-gray-900 dark:text-white text-left truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
              {workflow.name}
            </h5>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${getStatusColor(workflow.status)}`}>
              {getStatusIcon(workflow.status)}
              {workflow.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-500">Agentic Potential</p>
            <p className={`text-sm font-bold ${getPotentialColor(workflow.agentic_potential)}`}>
              {workflow.agentic_potential}/5
            </p>
          </div>
          <Bot className="w-5 h-5 text-pink-600 dark:text-pink-400" />
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-500">Complexity</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {workflow.complexity}/5
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-500">Wave</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {workflow.implementation_wave}
          </p>
        </div>
      </div>
    </button>
  );
};
