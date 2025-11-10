import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Briefcase, Network, Search, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Stakeholder {
  id: number;
  name: string;
  kind: string | null;
  workflow_count?: number;
}

interface StakeholderFormData {
  name: string;
  kind: string;
}

export const Stakeholders: React.FC = () => {
  const { user } = useAuth();
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [kindFilter, setKindFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingStakeholder, setEditingStakeholder] = useState<Stakeholder | null>(null);
  const [formData, setFormData] = useState<StakeholderFormData>({ name: '', kind: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const stakeholderKinds = [
    'Internal Team',
    'External Partner',
    'Customer',
    'Regulator',
    'Vendor',
    'Executive',
    'Operations',
    'IT',
    'Finance',
    'Customer Service',
    'Other'
  ];

  useEffect(() => {
    fetchStakeholders();
  }, []);

  const fetchStakeholders = async () => {
    try {
      setLoading(true);

      // Fetch stakeholders with workflow count
      const { data: stakeholdersData, error } = await supabase
        .from('stakeholders')
        .select(`
          id,
          name,
          kind
        `)
        .order('name');

      if (error) throw error;

      // Get workflow counts for each stakeholder
      const stakeholdersWithCounts = await Promise.all(
        (stakeholdersData || []).map(async (stakeholder) => {
          const { count } = await supabase
            .from('workflow_version_stakeholders')
            .select('*', { count: 'exact', head: true })
            .eq('stakeholder_id', stakeholder.id);

          return {
            ...stakeholder,
            workflow_count: count || 0
          };
        })
      );

      setStakeholders(stakeholdersWithCounts);
    } catch (error) {
      console.error('Error fetching stakeholders:', error);
      setMessage({ type: 'error', text: 'Failed to load stakeholders' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingStakeholder(null);
    setFormData({ name: '', kind: '' });
    setShowModal(true);
  };

  const handleEdit = (stakeholder: Stakeholder) => {
    setEditingStakeholder(stakeholder);
    setFormData({ name: stakeholder.name, kind: stakeholder.kind || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Name is required' });
      return;
    }

    try {
      if (editingStakeholder) {
        // Update existing
        const { error } = await supabase
          .from('stakeholders')
          .update({
            name: formData.name.trim(),
            kind: formData.kind.trim() || null
          })
          .eq('id', editingStakeholder.id);

        if (error) throw error;
        setMessage({ type: 'success', text: 'Stakeholder updated successfully' });
      } else {
        // Create new
        const { error } = await supabase
          .from('stakeholders')
          .insert({
            name: formData.name.trim(),
            kind: formData.kind.trim() || null
          });

        if (error) throw error;
        setMessage({ type: 'success', text: 'Stakeholder created successfully' });
      }

      setShowModal(false);
      fetchStakeholders();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Error saving stakeholder:', error);
      setMessage({
        type: 'error',
        text: error.message.includes('unique')
          ? 'A stakeholder with this name already exists'
          : 'Failed to save stakeholder'
      });
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will remove them from all workflows.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('stakeholders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Stakeholder deleted successfully' });
      fetchStakeholders();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting stakeholder:', error);
      setMessage({ type: 'error', text: 'Failed to delete stakeholder' });
    }
  };

  const filteredStakeholders = stakeholders.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKind = kindFilter === 'all' || s.kind === kindFilter;
    return matchesSearch && matchesKind;
  });

  const stats = {
    total: stakeholders.length,
    withWorkflows: stakeholders.filter(s => (s.workflow_count || 0) > 0).length,
    internal: stakeholders.filter(s => s.kind?.toLowerCase().includes('internal')).length,
    external: stakeholders.filter(s => s.kind?.toLowerCase().includes('external') || s.kind?.toLowerCase().includes('partner')).length
  };

  const uniqueKinds = Array.from(new Set(stakeholders.map(s => s.kind).filter(Boolean))) as string[];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      <div className="relative space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Stakeholders
            </h1>
            <p className="text-gray-400 mt-2">
              Manage stakeholders and track their workflow involvement
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70"
          >
            <Plus className="w-5 h-5" />
            Add Stakeholder
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`glass rounded-xl p-4 animate-fade-in ${
            message.type === 'success' ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
          }`}>
            <p className={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>
              {message.text}
            </p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass rounded-2xl p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">Total Stakeholders</h3>
              <Users className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-4xl font-bold text-white">{stats.total}</p>
          </div>

          <div className="glass rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '50ms' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">With Workflows</h3>
              <Network className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-4xl font-bold text-white">{stats.withWorkflows}</p>
          </div>

          <div className="glass rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">Internal Teams</h3>
              <Briefcase className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-4xl font-bold text-white">{stats.internal}</p>
          </div>

          <div className="glass rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '150ms' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">External Partners</h3>
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-4xl font-bold text-white">{stats.external}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="glass rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search stakeholders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <select
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value)}
              className="px-4 py-3 bg-slate-900/50 border border-gray-700 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All Types</option>
              {uniqueKinds.map(kind => (
                <option key={kind} value={kind}>{kind}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stakeholders Grid */}
        {filteredStakeholders.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center animate-fade-in" style={{ animationDelay: '250ms' }}>
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-600 opacity-50" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">
              {searchTerm || kindFilter !== 'all' ? 'No stakeholders found' : 'No stakeholders yet'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || kindFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by adding your first stakeholder'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStakeholders.map((stakeholder, index) => (
              <div
                key={stakeholder.id}
                className="glass rounded-2xl p-6 card-hover animate-fade-in"
                style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">
                      {stakeholder.name}
                    </h3>
                    {stakeholder.kind && (
                      <span className="inline-block px-3 py-1 text-xs font-medium bg-cyan-500/20 text-cyan-400 rounded-full">
                        {stakeholder.kind}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(stakeholder)}
                      className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                      title="Edit stakeholder"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(stakeholder.id, stakeholder.name)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete stakeholder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Workflows</span>
                    <span className="font-bold text-white">{stakeholder.workflow_count || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass rounded-2xl p-8 max-w-md w-full animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                {editingStakeholder ? 'Edit Stakeholder' : 'Add Stakeholder'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Flight Operations Team"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={formData.kind}
                  onChange={(e) => setFormData({ ...formData, kind: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-gray-700 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Select type...</option>
                  {stakeholderKinds.map(kind => (
                    <option key={kind} value={kind}>{kind}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-cyan-500/50"
              >
                {editingStakeholder ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
