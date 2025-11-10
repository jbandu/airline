import React, { useEffect, useState, useRef } from 'react';
import { Folder, Search, TrendingUp, Layers, Activity, Upload, X, Bot, Save } from 'lucide-react';
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
  const [saving, setSaving] = useState(false);
  const [agentCount, setAgentCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
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
        supabase.from('workflows').select('agentic_function_type').is('archived_at', null),
      ]);

      if (domainsResult.data && subdomainsResult.data) {
        setSubdomains(subdomainsResult.data);

        // Count unique agent types from workflows
        const uniqueAgentTypes = new Set(
          workflowsResult.data
            ?.map(w => w.agentic_function_type)
            .filter(type => type && type.trim() !== '')
        );
        setAgentCount(uniqueAgentTypes.size);

        const domainsWithStats: DomainWithStats[] = await Promise.all(
          domainsResult.data.map(async (domain) => {
            const domainSubdomains = subdomainsResult.data.filter(
              (sd) => sd.domain_id === domain.id
            );
            const subdomainCount = domainSubdomains.length;

            const subdomainIds = domainSubdomains.map(sd => sd.id);

            let workflowCount = 0;
            if (subdomainIds.length > 0) {
              const { count } = await supabase
                .from('workflows')
                .select('*', { count: 'exact', head: true })
                .in('subdomain_id', subdomainIds)
                .is('archived_at', null);

              workflowCount = count || 0;
            }

            return {
              ...domain,
              subdomainCount,
              workflowCount,
            };
          })
        );

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
    agentTypes: agentCount,
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

  const handleEditDomain = () => {
    if (selectedDomain) {
      setEditedName(selectedDomain.name);
      setEditedDescription(selectedDomain.description);
      setIsEditing(true);
    }
  };

  const handleSaveDomain = async () => {
    if (!selectedDomain) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('domains')
        .update({
          name: editedName,
          description: editedDescription,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedDomain.id);

      if (error) throw error;

      await loadData();

      const updatedDomain = domains.find(d => d.id === selectedDomain.id);
      if (updatedDomain) {
        setSelectedDomain(updatedDomain);
      }

      setIsEditing(false);
    } catch (error: any) {
      console.error('Error saving domain:', error);
      alert('Failed to save domain: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedName('');
    setEditedDescription('');
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
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Agent Types</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.agentTypes}</div>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setSelectedDomain(null); setIsEditing(false); }}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? 'Edit Domain' : selectedDomain.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {isEditing ? 'Update domain details' : 'Domain Details'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button
                    onClick={handleEditDomain}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => { setSelectedDomain(null); setIsEditing(false); }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="text-2xl text-gray-500">&times;</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {isEditing ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                      Domain Name
                    </label>
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter domain name"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                      Description
                    </label>
                    <textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter domain description"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <button
                      onClick={handleSaveDomain}
                      disabled={saving || !editedName.trim()}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">Domain Icon</label>
                    <div className="flex items-center gap-4">
                      {selectedDomain.icon_url ? (
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
