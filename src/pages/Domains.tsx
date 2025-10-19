import React, { useEffect, useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Plus, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Domain, Subdomain } from '../types/database.types';

export const Domains: React.FC = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [subdomains, setSubdomains] = useState<Subdomain[]>([]);
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [selectedSubdomain, setSelectedSubdomain] = useState<Subdomain | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDomains();
    loadSubdomains();
  }, []);

  const loadDomains = async () => {
    const { data } = await supabase
      .from('domains')
      .select('*')
      .order('name');
    if (data) setDomains(data);
  };

  const loadSubdomains = async () => {
    const { data } = await supabase
      .from('subdomains')
      .select('*')
      .order('name');
    if (data) setSubdomains(data);
  };

  const toggleDomain = (domainId: string) => {
    const newExpanded = new Set(expandedDomains);
    if (newExpanded.has(domainId)) {
      newExpanded.delete(domainId);
    } else {
      newExpanded.add(domainId);
    }
    setExpandedDomains(newExpanded);
  };

  const getSubdomainsForDomain = (domainId: string) => {
    return subdomains.filter(sd => sd.domain_id === domainId);
  };

  const filteredDomains = domains.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Domains & Subdomains</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Organize workflows by domain and subdomain
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add Domain</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search domains and subdomains..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 h-[calc(100vh-300px)] overflow-y-auto">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Domain Tree</h2>
          <div className="space-y-1">
            {filteredDomains.map((domain) => {
              const isExpanded = expandedDomains.has(domain.id);
              const domainSubdomains = getSubdomainsForDomain(domain.id);
              return (
                <div key={domain.id}>
                  <button
                    onClick={() => {
                      toggleDomain(domain.id);
                      setSelectedDomain(domain);
                      setSelectedSubdomain(null);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left ${
                      selectedDomain?.id === domain.id && !selectedSubdomain
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {domainSubdomains.length > 0 && (
                      isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                    )}
                    {domainSubdomains.length === 0 && <div className="w-4" />}
                    {isExpanded ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
                    <span className="font-medium truncate">{domain.name}</span>
                    <span className="ml-auto text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {domainSubdomains.length}
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                      {domainSubdomains.map((subdomain) => (
                        <button
                          key={subdomain.id}
                          onClick={() => {
                            setSelectedDomain(domain);
                            setSelectedSubdomain(subdomain);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left ${
                            selectedSubdomain?.id === subdomain.id
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <Folder className="w-4 h-4" />
                          <span className="text-sm truncate">{subdomain.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {filteredDomains.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Folder className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No domains found</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          {selectedSubdomain ? (
            <div>
              <div className="mb-6">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {selectedDomain?.name} / Subdomain
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedSubdomain.name}
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">
                    {selectedSubdomain.description || 'No description available'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Created</label>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                      {new Date(selectedSubdomain.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Updated</label>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                      {new Date(selectedSubdomain.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : selectedDomain ? (
            <div>
              <div className="mb-6">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Domain</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedDomain.name}
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">
                    {selectedDomain.description || 'No description available'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Subdomains</label>
                    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                      {getSubdomainsForDomain(selectedDomain.id).length}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Created</label>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                      {new Date(selectedDomain.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Folder className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg">Select a domain or subdomain to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
