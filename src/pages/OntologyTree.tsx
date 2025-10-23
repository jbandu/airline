import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Filter, ChevronDown, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { DomainNode, SubdomainNode, WorkflowNode } from '../components/visualizations/OntologyTreeNodes';

interface Workflow {
  id: number;
  name: string;
  type: 'workflow';
  status: string;
  complexity: number;
  agentic_potential: number;
  implementation_wave: number;
}

interface Subdomain {
  id: number;
  name: string;
  type: 'subdomain';
  children: Workflow[];
  avg_potential: number | null;
  avg_complexity: number | null;
  workflow_count: number;
}

interface Domain {
  id: number;
  name: string;
  type: 'domain';
  children: Subdomain[];
  workflow_count: number;
}

interface OntologyData {
  name: string;
  type: 'root';
  children: Domain[];
}

export const OntologyTree: React.FC = () => {
  const [data, setData] = useState<OntologyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDomains, setExpandedDomains] = useState<Set<number>>(new Set());
  const [expandedSubdomains, setExpandedSubdomains] = useState<Set<number>>(new Set());
  const [filterMinPotential, setFilterMinPotential] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [expandAll, setExpandAll] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.rpc('get_ontology_tree');

      if (error) throw error;

      if (result) {
        setData(result as OntologyData);
      }
    } catch (error) {
      console.error('Error loading ontology tree:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDomain = (domainId: number) => {
    setExpandedDomains((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(domainId)) {
        newSet.delete(domainId);
      } else {
        newSet.add(domainId);
      }
      return newSet;
    });
  };

  const toggleSubdomain = (subdomainId: number) => {
    setExpandedSubdomains((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subdomainId)) {
        newSet.delete(subdomainId);
      } else {
        newSet.add(subdomainId);
      }
      return newSet;
    });
  };

  const handleExpandAll = () => {
    if (expandAll) {
      setExpandedDomains(new Set());
      setExpandedSubdomains(new Set());
    } else {
      const allDomainIds = data?.children.map((d) => d.id) || [];
      const allSubdomainIds = data?.children.flatMap((d) => d.children.map((s) => s.id)) || [];
      setExpandedDomains(new Set(allDomainIds));
      setExpandedSubdomains(new Set(allSubdomainIds));
    }
    setExpandAll(!expandAll);
  };

  const filterData = (domain: Domain): Domain | null => {
    const filteredSubdomains = domain.children
      .map((subdomain) => {
        const filteredWorkflows = subdomain.children.filter((workflow) => {
          const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesPotential = workflow.agentic_potential >= filterMinPotential;
          return matchesSearch && matchesPotential;
        });

        const matchesSubdomainSearch = subdomain.name.toLowerCase().includes(searchTerm.toLowerCase());

        if (filteredWorkflows.length > 0 || (matchesSubdomainSearch && searchTerm)) {
          return {
            ...subdomain,
            children: filteredWorkflows,
          };
        }
        return null;
      })
      .filter((s) => s !== null) as Subdomain[];

    const matchesDomainSearch = domain.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (filteredSubdomains.length > 0 || (matchesDomainSearch && searchTerm)) {
      return {
        ...domain,
        children: filteredSubdomains,
      };
    }
    return null;
  };

  const filteredDomains = data?.children
    .map(filterData)
    .filter((d) => d !== null) as Domain[] || [];

  const totalWorkflows = filteredDomains.reduce((sum, d) => sum + d.workflow_count, 0);
  const totalDomains = filteredDomains.length;
  const totalSubdomains = filteredDomains.reduce((sum, d) => sum + d.children.length, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading ontology tree...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Ontology Tree
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Hierarchical view of domains, subdomains, and workflows
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExpandAll}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {expandAll ? (
                  <>
                    <Minimize2 className="w-4 h-4" />
                    Collapse All
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4" />
                    Expand All
                  </>
                )}
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showFilters
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search workflows, subdomains, or domains..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-900 dark:text-white"
            />
          </div>

          {showFilters && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Min Agentic Potential:
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={filterMinPotential}
                  onChange={(e) => setFilterMinPotential(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 min-w-[3rem]">
                  {filterMinPotential}/5
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Domains</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalDomains}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Subdomains</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalSubdomains}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Workflows</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalWorkflows}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="p-6">
            {filteredDomains.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">No results found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDomains.map((domain) => (
                  <div key={domain.id} className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleDomain(domain.id)}
                      className="w-full"
                    >
                      <DomainNode
                        domain={domain}
                        isExpanded={expandedDomains.has(domain.id)}
                      />
                    </button>

                    {expandedDomains.has(domain.id) && (
                      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 space-y-3">
                        {domain.children.length === 0 ? (
                          <p className="text-sm text-gray-500 dark:text-gray-500 pl-8">
                            No subdomains found
                          </p>
                        ) : (
                          domain.children.map((subdomain) => (
                            <div
                              key={subdomain.id}
                              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900"
                            >
                              <button
                                onClick={() => toggleSubdomain(subdomain.id)}
                                className="w-full"
                              >
                                <SubdomainNode
                                  subdomain={subdomain}
                                  isExpanded={expandedSubdomains.has(subdomain.id)}
                                />
                              </button>

                              {expandedSubdomains.has(subdomain.id) && (
                                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 space-y-2">
                                  {subdomain.children.length === 0 ? (
                                    <p className="text-sm text-gray-500 dark:text-gray-500 pl-8">
                                      No workflows found
                                    </p>
                                  ) : (
                                    subdomain.children.map((workflow) => (
                                      <WorkflowNode
                                        key={workflow.id}
                                        workflow={workflow}
                                      />
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
