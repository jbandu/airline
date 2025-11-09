import React, { useEffect, useState, useRef } from 'react';
import { Folder, Plus, Search, TrendingUp, Layers, Activity, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Domain, Subdomain } from '../types/database.types';

interface DomainWithStats extends Domain {
  subdomainCount: number;
  workflowCount: number;
  icon_url?: string | null;
}

export const Domains: React.FC = () => {
  const navigate = useNavigate();
  const [domains, setDomains] = useState<DomainWithStats[]>([]);
  const [subdomains, setSubdomains] = useState<Subdomain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<DomainWithStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [domainsResult, subdomainsResult, workflowsResult] = await Promise.all([
        supabase.from('domains').select('*').order('name'),
        supabase.from('subdomains').select('*').order('name'),
        supabase.from('workflows').select('id, subdomain_id').is('archived_at', null),
      ]);

      if (domainsResult.data && subdomainsResult.data) {
        setSubdomains(subdomainsResult.data);

        // Create a map of subdomain_id -> workflow count
        const workflowCountBySubdomain = new Map<string, number>();
        if (workflowsResult.data) {
          workflowsResult.data.forEach((workflow) => {
            if (workflow.subdomain_id) {
              workflowCountBySubdomain.set(
                workflow.subdomain_id,
                (workflowCountBySubdomain.get(workflow.subdomain_id) || 0) + 1
              );
            }
          });
        }

        // Calculate stats for each domain
        const domainsWithStats: DomainWithStats[] = domainsResult.data.map((domain) => {
          const domainSubdomains = subdomainsResult.data.filter(
            (sd) => sd.domain_id === domain.id
          );
          const subdomainCount = domainSubdomains.length;

          // Sum up workflows for all subdomains in this domain
          let workflowCount = 0;
          domainSubdomains.forEach((subdomain) => {
            workflowCount += workflowCountBySubdomain.get(subdomain.id) || 0;
          });

          return {
            ...domain,
            subdomainCount,
            workflowCount,
          };
        });

        console.log('Workflow count summary:', {
          totalWorkflows: workflowsResult.data?.length || 0,
          workflowsWithSubdomain: workflowsResult.data?.filter(w => w.subdomain_id).length || 0,
          workflowsWithoutSubdomain: workflowsResult.data?.filter(w => !w.subdomain_id).length || 0,
        });

        setDomains(domainsWithStats);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubdomainsForDomain = (domainId: string) => {
    return subdomains.filter((sd) => sd.domain_id === domainId);
  };

  const filteredDomains = domains.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalDomains: domains.length,
    totalSubdomains: subdomains.length,
    totalWorkflows: domains.reduce((sum, d) => sum + d.workflowCount, 0),
    avgSubdomainsPerDomain: domains.length > 0 ? Math.round((subdomains.length / domains.length) * 10) / 10 : 0,
  };

  const domainColors = [
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600',
    'from-amber-500 to-amber-600',
    'from-red-500 to-red-600',
    'from-purple-500 to-purple-600',
    'from-pink-500 to-pink-600',
    'from-cyan-500 to-cyan-600',
    'from-teal-500 to-teal-600',
    'from-orange-500 to-orange-600',
    'from-lime-500 to-lime-600',
  ];

  const getDomainColor = (index: number) => {
    return domainColors[index % domainColors.length];
  };

  const handleIconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !selectedDomain) return;

    const file = event.target.files[0];

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB');
      return;
    }

    try {
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `domain-${selectedDomain.id}-${Date.now()}.${fileExt}`;
      const filePath = `domain-icons/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('domains')
        .update({ icon_url: publicUrl })
        .eq('id', selectedDomain.id);

      if (updateError) throw updateError;

      await loadData();

      const updatedDomain = domains.find(d => d.id === selectedDomain.id);
      if (updatedDomain) {
        setSelectedDomain(updatedDomain);
      }
    } catch (error: any) {
      console.error('Error uploading icon:', error);
      alert('Failed to upload icon: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveIcon = async () => {
    if (!selectedDomain || !selectedDomain.icon_url) return;

    try {
      setUploading(true);

      const { error } = await supabase
        .from('domains')
        .update({ icon_url: null })
        .eq('id', selectedDomain.id);

      if (error) throw error;

      await loadData();

      const updatedDomain = domains.find(d => d.id === selectedDomain.id);
      if (updatedDomain) {
        setSelectedDomain(updatedDomain);
      }
    } catch (error: any) {
      console.error('Error removing icon:', error);
      alert('Failed to remove icon: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubdomainClick = (subdomainId: string) => {
    navigate(`/subdomains?subdomain=${subdomainId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Business Domains</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {domains.length} core business domains with {subdomains.length} subdomains
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add Domain</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Domains</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDomains}</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Folder className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Subdomains</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSubdomains}</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Workflows</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalWorkflows}</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Subdomains</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgSubdomainsPerDomain}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search domains..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading domains...</p>
          </div>
        </div>
      ) : filteredDomains.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Folder className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No domains found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search term</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDomains.map((domain, index) => (
              <div
                key={domain.id}
                className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedDomain(domain)}
              >
                <div className={`h-2 bg-gradient-to-r ${getDomainColor(index)}`} />

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    {domain.icon_url ? (
                      domain.icon_url.startsWith('http') ? (
                        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg">
                          <img src={domain.icon_url} alt={domain.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg text-2xl">
                          {domain.icon_url}
                        </div>
                      )
                    ) : (
                      <div className={`w-12 h-12 bg-gradient-to-br ${getDomainColor(index)} rounded-xl flex items-center justify-center shadow-lg`}>
                        <Folder className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors min-h-[3.5rem]">
                    {domain.name}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 min-h-[2.5rem]">
                    {domain.description || 'No description'}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Subdomains</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">{domain.subdomainCount}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Workflows</span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{domain.workflowCount}</span>
                    </div>
                  </div>
                </div>
              </div>
          ))}
        </div>
      )}

      {selectedDomain && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedDomain(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedDomain.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Domain Details</p>
              </div>
              <button
                onClick={() => setSelectedDomain(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="text-2xl text-gray-500">&times;</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">Domain Icon</label>
                <div className="flex items-center gap-4">
                  {selectedDomain.icon_url ? (
                    selectedDomain.icon_url.startsWith('http') ? (
                      <div className="relative group">
                        <img
                          src={selectedDomain.icon_url}
                          alt={selectedDomain.name}
                          className="w-20 h-20 rounded-xl object-cover shadow-lg"
                        />
                        <button
                          onClick={handleRemoveIcon}
                          disabled={uploading}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative group">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg text-4xl">
                          {selectedDomain.icon_url}
                        </div>
                        <button
                          onClick={handleRemoveIcon}
                          disabled={uploading}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                      <Folder className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleIconUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{uploading ? 'Uploading...' : selectedDomain.icon_url ? 'Change Icon' : 'Upload Icon'}</span>
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Max 2MB. JPG, PNG, or SVG.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Description</label>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedDomain.description || 'No description available'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Subdomains</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedDomain.subdomainCount}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Workflows</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{selectedDomain.workflowCount}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Created</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(selectedDomain.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">Subdomains ({getSubdomainsForDomain(selectedDomain.id).length})</label>
                <div className="space-y-2">
                  {getSubdomainsForDomain(selectedDomain.id).length > 0 ? (
                    getSubdomainsForDomain(selectedDomain.id).map((subdomain) => (
                      <div
                        key={subdomain.id}
                        onClick={() => handleSubdomainClick(subdomain.id)}
                        className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-700 border border-transparent transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <Folder className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{subdomain.name}</div>
                            {subdomain.description && (
                              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subdomain.description}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Folder className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>No subdomains yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
