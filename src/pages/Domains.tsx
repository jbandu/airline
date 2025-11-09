import React, { useEffect, useState, useRef } from 'react';
import { Folder, Search, TrendingUp, Layers, Activity, Upload, X, Network, Plus } from 'lucide-react';
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

        const domainsWithStats: DomainWithStats[] = domainsResult.data.map((domain) => {
          const domainSubdomains = subdomainsResult.data.filter(
            (sd) => sd.domain_id === domain.id
          );
          const subdomainCount = domainSubdomains.length;

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
    'from-blue-500 to-cyan-600',
    'from-green-500 to-emerald-600',
    'from-amber-500 to-orange-600',
    'from-red-500 to-rose-600',
    'from-purple-500 to-pink-600',
    'from-pink-500 to-fuchsia-600',
    'from-cyan-500 to-teal-600',
    'from-teal-500 to-green-600',
    'from-orange-500 to-amber-600',
    'from-lime-500 to-green-600',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-500 mx-auto"></div>
          <p className="text-cyan-400 mt-6 text-lg">Loading domains...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 p-8 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/50 animate-pulse-glow">
              <Layers className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-5xl font-bold text-gradient-cyan">Business Domains</h1>
              <p className="text-cyan-300 text-lg mt-1">
                {domains.length} core business domains with {subdomains.length} subdomains
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass rounded-2xl p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">Total Domains</h3>
              <Layers className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-4xl font-bold text-white">{stats.totalDomains}</p>
            <p className="text-xs text-gray-500 mt-1">Business areas</p>
          </div>

          <div className="glass rounded-2xl p-6 animate-fade-in animation-delay-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">Subdomains</h3>
              <Folder className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-4xl font-bold text-white">{stats.totalSubdomains}</p>
            <p className="text-xs text-gray-500 mt-1">Functional areas</p>
          </div>

          <div className="glass rounded-2xl p-6 animate-fade-in animation-delay-400">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">Workflows</h3>
              <Activity className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-4xl font-bold text-white">{stats.totalWorkflows}</p>
            <p className="text-xs text-gray-500 mt-1">Documented processes</p>
          </div>

          <div className="glass rounded-2xl p-6 animate-fade-in animation-delay-600">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">Avg Subdomains</h3>
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-4xl font-bold text-white">{stats.avgSubdomainsPerDomain}</p>
            <p className="text-xs text-gray-500 mt-1">Per domain</p>
          </div>
        </div>

        {/* Search */}
        <div className="glass rounded-2xl p-4 mb-8 animate-fade-in animation-delay-800">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search domains..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Domain Grid */}
        {filteredDomains.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Folder className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No domains found</h3>
            <p className="text-gray-400">Try adjusting your search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDomains.map((domain, index) => (
              <div
                key={domain.id}
                className="glass rounded-2xl overflow-hidden card-hover cursor-pointer animate-fade-in"
                style={{ animationDelay: `${Math.min(index * 50, 1000)}ms` }}
                onClick={() => setSelectedDomain(domain)}
              >
                <div className={`h-2 bg-gradient-to-r ${getDomainColor(index)}`} />

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    {domain.icon_url ? (
                      domain.icon_url.startsWith('http') ? (
                        <div className="w-14 h-14 rounded-xl overflow-hidden shadow-lg shadow-white/10">
                          <img src={domain.icon_url} alt={domain.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getDomainColor(index)} flex items-center justify-center shadow-lg text-3xl`}>
                          {domain.icon_url}
                        </div>
                      )
                    ) : (
                      <div className={`w-14 h-14 bg-gradient-to-br ${getDomainColor(index)} rounded-xl flex items-center justify-center shadow-lg`}>
                        <Folder className="w-7 h-7 text-white" />
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-lg text-white mb-2 line-clamp-2 min-h-[3.5rem]">
                    {domain.name}
                  </h3>

                  <p className="text-sm text-gray-400 mb-4 line-clamp-2 min-h-[2.5rem]">
                    {domain.description || 'No description'}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg">
                      <span className="text-sm text-gray-400">Subdomains</span>
                      <span className="text-lg font-bold text-cyan-400">{domain.subdomainCount}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg">
                      <span className="text-sm text-gray-400">Workflows</span>
                      <span className="text-lg font-bold text-blue-400">{domain.workflowCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Domain Button - Bottom */}
        <div className="mt-12 flex justify-center">
          <button className="glass rounded-xl px-6 py-3 flex items-center gap-2 text-gray-300 hover:text-white hover:bg-white/10 transition-all border border-white/10 hover:border-cyan-500/50">
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Domain</span>
          </button>
        </div>
      </div>

      {/* Modal */}
      {selectedDomain && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedDomain(null)}>
          <div className="glass rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/20" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-6 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="text-3xl font-bold text-white">{selectedDomain.name}</h2>
                <p className="text-cyan-100 mt-1">Domain Details</p>
              </div>
              <button
                onClick={() => setSelectedDomain(null)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="text-sm font-semibold text-cyan-400 block mb-3">Domain Icon</label>
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
                          className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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
                          className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="w-20 h-20 bg-white/5 rounded-xl flex items-center justify-center">
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
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/50 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{uploading ? 'Uploading...' : selectedDomain.icon_url ? 'Change Icon' : 'Upload Icon'}</span>
                    </button>
                    <p className="text-xs text-gray-400 mt-2">
                      Max 2MB. JPG, PNG, or SVG.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-cyan-400 block mb-2">Description</label>
                <p className="text-gray-300">
                  {selectedDomain.description || 'No description available'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-sm text-gray-400 mb-1">Subdomains</div>
                  <div className="text-2xl font-bold text-cyan-400">{selectedDomain.subdomainCount}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-sm text-gray-400 mb-1">Workflows</div>
                  <div className="text-2xl font-bold text-blue-400">{selectedDomain.workflowCount}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-sm text-gray-400 mb-1">Created</div>
                  <div className="text-sm font-medium text-white">
                    {new Date(selectedDomain.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-cyan-400 block mb-3">Subdomains ({getSubdomainsForDomain(selectedDomain.id).length})</label>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {getSubdomainsForDomain(selectedDomain.id).length > 0 ? (
                    getSubdomainsForDomain(selectedDomain.id).map((subdomain) => (
                      <div
                        key={subdomain.id}
                        onClick={() => handleSubdomainClick(subdomain.id)}
                        className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <Folder className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                          <div className="flex-1">
                            <div className="font-medium text-white group-hover:text-cyan-400 transition-colors">{subdomain.name}</div>
                            {subdomain.description && (
                              <div className="text-sm text-gray-400 mt-1">{subdomain.description}</div>
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
