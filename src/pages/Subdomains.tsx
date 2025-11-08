import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Domain, Subdomain, User } from '../types/database.types';
import {
  Grid,
  List,
  Table,
  Clock,
  Folder,
  FileText,
  Search,
  ChevronDown,
  Calendar,
  TrendingUp,
  User as UserIcon
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface SubdomainWithDetails extends Subdomain {
  domain?: Domain;
  workflowCount: number;
  creator_name?: string;
  creator_email?: string;
}

type ViewMode = 'grid' | 'list' | 'table' | 'timeline';
type SortMode = 'name' | 'recent' | 'workflows' | 'domain';

export const Subdomains: React.FC = () => {
  const [subdomains, setSubdomains] = useState<SubdomainWithDetails[]>([]);
  const [filteredSubdomains, setFilteredSubdomains] = useState<SubdomainWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [domains, setDomains] = useState<Domain[]>([]);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    loadData();

    // Check for initial filters from URL params
    const domainId = searchParams.get('domain');
    const subdomainId = searchParams.get('subdomain');
    const view = searchParams.get('view') as ViewMode;

    if (domainId) setSelectedDomain(domainId);
    if (view) setViewMode(view);

    // If a specific subdomain is requested, filter to its domain and set search
    if (subdomainId) {
      const subdomain = subdomains.find(s => s.id === subdomainId);
      if (subdomain) {
        setSelectedDomain(subdomain.domain_id);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    filterSubdomains();
  }, [searchTerm, sortMode, selectedDomain, subdomains]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load domains and subdomains
      const [domainsResult, subdomainsResult, workflowsResult] = await Promise.all([
        supabase.from('domains').select('*').order('name'),
        supabase.from('subdomains').select('*').order('name'),
        supabase.from('workflows').select('subdomain_id').is('archived_at', null),
      ]);

      if (domainsResult.error) throw domainsResult.error;
      if (subdomainsResult.error) throw subdomainsResult.error;
      if (workflowsResult.error) throw workflowsResult.error;

      // Create a map of workflow counts per subdomain
      const workflowCounts = new Map<string, number>();
      workflowsResult.data?.forEach((workflow) => {
        if (workflow.subdomain_id) {
          workflowCounts.set(
            workflow.subdomain_id,
            (workflowCounts.get(workflow.subdomain_id) || 0) + 1
          );
        }
      });

      // Get unique creator IDs to fetch user info
      const creatorIds = [...new Set(
        subdomainsResult.data
          .map(s => s.created_by)
          .filter((id): id is string => id !== null)
      )];

      // Fetch creator information from auth.users (via admin API or stored profiles)
      // Note: This requires a server-side function or profiles table in production
      // For now, we'll use the current user's info if available
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      // Create a map of creator info
      const creatorMap = new Map<string, { name: string; email: string }>();
      if (currentUser) {
        creatorMap.set(currentUser.id, {
          name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'User',
          email: currentUser.email || ''
        });
      }

      // Enhance subdomains with domain info, workflow counts, and creator info
      const subdomainsWithDetails: SubdomainWithDetails[] = subdomainsResult.data.map((subdomain) => {
        const domain = domainsResult.data.find((d) => d.id === subdomain.domain_id);
        const creator = subdomain.created_by ? creatorMap.get(subdomain.created_by) : null;

        return {
          ...subdomain,
          domain,
          workflowCount: workflowCounts.get(subdomain.id) || 0,
          creator_name: creator?.name || (subdomain.created_by ? 'System User' : 'Unknown'),
          creator_email: creator?.email || '',
        };
      });

      setDomains(domainsResult.data || []);
      setSubdomains(subdomainsWithDetails);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSubdomains = () => {
    let filtered = [...subdomains];

    // Filter by domain
    if (selectedDomain !== 'all') {
      filtered = filtered.filter((s) => s.domain_id === selectedDomain);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.domain?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    switch (sortMode) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'recent':
        filtered.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'workflows':
        filtered.sort((a, b) => b.workflowCount - a.workflowCount);
        break;
      case 'domain':
        filtered.sort((a, b) =>
          (a.domain?.name || '').localeCompare(b.domain?.name || '')
        );
        break;
    }

    setFilteredSubdomains(filtered);
  };

  const getDomainColor = (domainId: string) => {
    const colors = [
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
    const index = domains.findIndex((d) => d.id === domainId);
    return colors[index % colors.length];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const handleSubdomainClick = (subdomain: SubdomainWithDetails) => {
    navigate(`/workflows?subdomain=${subdomain.id}`);
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredSubdomains.map((subdomain) => (
        <div
          key={subdomain.id}
          onClick={() => handleSubdomainClick(subdomain)}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
        >
          <div className={`h-2 bg-gradient-to-r ${getDomainColor(subdomain.domain_id)}`} />
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 text-lg">{subdomain.name}</h3>
              <div className="flex items-center text-sm text-gray-500">
                <FileText className="w-4 h-4 mr-1" />
                <span>{subdomain.workflowCount}</span>
              </div>
            </div>

            {subdomain.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {subdomain.description}
              </p>
            )}

            <div className="space-y-2 pt-3 border-t">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <Folder className="w-3 h-3 mr-1" />
                  <span className="truncate max-w-[150px]">{subdomain.domain?.name}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{getRelativeTime(subdomain.created_at)}</span>
                </div>
              </div>
              {subdomain.creator_name && (
                <div className="flex items-center text-xs text-gray-500">
                  <UserIcon className="w-3 h-3 mr-1" />
                  <span className="truncate" title={subdomain.creator_email || subdomain.creator_name}>
                    {subdomain.creator_name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-2">
      {filteredSubdomains.map((subdomain) => (
        <div
          key={subdomain.id}
          onClick={() => handleSubdomainClick(subdomain)}
          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer p-4 flex items-center justify-between"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className={`w-1 h-12 rounded bg-gradient-to-b ${getDomainColor(subdomain.domain_id)}`} />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{subdomain.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-1">
                  {subdomain.description || 'No description'}
                </p>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Folder className="w-3 h-3 mr-1" />
                    {subdomain.domain?.name}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDate(subdomain.created_at)}
                  </span>
                  {subdomain.creator_name && (
                    <span className="flex items-center" title={subdomain.creator_email || subdomain.creator_name}>
                      <UserIcon className="w-3 h-3 mr-1" />
                      {subdomain.creator_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6 ml-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{subdomain.workflowCount}</div>
              <div className="text-xs text-gray-500">Workflows</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTableView = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Subdomain
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Domain
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Workflows
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Creator
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredSubdomains.map((subdomain) => (
            <tr
              key={subdomain.id}
              onClick={() => handleSubdomainClick(subdomain)}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className={`w-1 h-10 rounded mr-3 bg-gradient-to-b ${getDomainColor(subdomain.domain_id)}`} />
                  <div className="font-medium text-gray-900">{subdomain.name}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{subdomain.domain?.name}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-600 line-clamp-2 max-w-md">
                  {subdomain.description || '-'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-sm text-gray-900">
                  <FileText className="w-4 h-4 mr-1 text-gray-400" />
                  {subdomain.workflowCount}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-sm text-gray-600" title={subdomain.creator_email || subdomain.creator_name}>
                  <UserIcon className="w-4 h-4 mr-1 text-gray-400" />
                  {subdomain.creator_name || '-'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1 text-gray-400" />
                  {formatDate(subdomain.created_at)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderTimelineView = () => {
    // Group by month
    const groupedByMonth = filteredSubdomains.reduce((acc, subdomain) => {
      const date = new Date(subdomain.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(subdomain);
      return acc;
    }, {} as Record<string, SubdomainWithDetails[]>);

    const sortedMonths = Object.keys(groupedByMonth).sort().reverse();

    return (
      <div className="space-y-8">
        {sortedMonths.map((monthKey) => {
          const [year, month] = monthKey.split('-');
          const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
          });

          return (
            <div key={monthKey} className="relative">
              <div className="sticky top-0 z-10 bg-gray-50 px-4 py-2 rounded-lg mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  {monthName}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({groupedByMonth[monthKey].length} subdomain{groupedByMonth[monthKey].length !== 1 ? 's' : ''})
                  </span>
                </h3>
              </div>

              <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                {groupedByMonth[monthKey].map((subdomain) => (
                  <div
                    key={subdomain.id}
                    onClick={() => handleSubdomainClick(subdomain)}
                    className="relative bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer p-4 ml-6"
                  >
                    <div
                      className={`absolute -left-9 top-6 w-4 h-4 rounded-full bg-gradient-to-br ${getDomainColor(subdomain.domain_id)} border-2 border-white`}
                    />

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{subdomain.name}</h4>
                        {subdomain.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {subdomain.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Folder className="w-3 h-3 mr-1" />
                            {subdomain.domain?.name}
                          </span>
                          <span className="flex items-center">
                            <FileText className="w-3 h-3 mr-1" />
                            {subdomain.workflowCount} workflows
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDate(subdomain.created_at)}
                          </span>
                          {subdomain.creator_name && (
                            <span className="flex items-center" title={subdomain.creator_email || subdomain.creator_name}>
                              <UserIcon className="w-3 h-3 mr-1" />
                              {subdomain.creator_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading subdomains...</div>
      </div>
    );
  }

  // Group subdomains by domain
  const groupedByDomain = useMemo(() => {
    const grouped = new Map<string, { domain: Domain; subdomains: SubdomainWithDetails[] }>();

    filteredSubdomains.forEach((subdomain) => {
      if (subdomain.domain) {
        if (!grouped.has(subdomain.domain.id)) {
          grouped.set(subdomain.domain.id, {
            domain: subdomain.domain,
            subdomains: [],
          });
        }
        grouped.get(subdomain.domain.id)!.subdomains.push(subdomain);
      }
    });

    return Array.from(grouped.values()).sort((a, b) => a.domain.name.localeCompare(b.domain.name));
  }, [filteredSubdomains]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Subdomains by Domain</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Explore {filteredSubdomains.length} subdomain{filteredSubdomains.length !== 1 ? 's' : ''} across {groupedByDomain.length} domain{groupedByDomain.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search subdomains..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Domain Filter */}
          <div className="relative">
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white cursor-pointer"
            >
              <option value="all">All Domains</option>
              {domains.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {domain.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="appearance-none pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white cursor-pointer"
            >
              <option value="name">Sort by Name</option>
              <option value="recent">Recently Added</option>
              <option value="workflows">Most Workflows</option>
              <option value="domain">Domain Name</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="text-3xl font-bold">{filteredSubdomains.length}</div>
          <div className="text-sm opacity-90">Total Subdomains</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="text-3xl font-bold">{groupedByDomain.length}</div>
          <div className="text-sm opacity-90">Active Domains</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="text-3xl font-bold">
            {filteredSubdomains.reduce((sum, s) => sum + s.workflowCount, 0)}
          </div>
          <div className="text-sm opacity-90">Total Workflows</div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-4 text-white">
          <div className="text-3xl font-bold">
            {filteredSubdomains.length > 0
              ? Math.round(
                  filteredSubdomains.reduce((sum, s) => sum + s.workflowCount, 0) /
                    filteredSubdomains.length
                )
              : 0}
          </div>
          <div className="text-sm opacity-90">Avg Workflows/Subdomain</div>
        </div>
      </div>

      {/* Content - Grouped by Domain */}
      {groupedByDomain.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <div className="text-gray-400 text-lg">No subdomains found</div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            {searchTerm || selectedDomain !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating a domain and subdomain'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByDomain.map(({ domain, subdomains }) => (
            <div key={domain.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {/* Domain Header */}
              <div className={`bg-gradient-to-r ${getDomainColor(domain.id)} p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Folder className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{domain.name}</h2>
                      {domain.description && (
                        <p className="text-white/90 mt-1">{domain.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{subdomains.length}</div>
                    <div className="text-sm opacity-90">Subdomain{subdomains.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              </div>

              {/* Subdomains List */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subdomains.map((subdomain) => (
                    <div
                      key={subdomain.id}
                      onClick={() => handleSubdomainClick(subdomain)}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 cursor-pointer bg-gray-50 dark:bg-gray-700"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base">{subdomain.name}</h3>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <FileText className="w-4 h-4 mr-1" />
                          <span>{subdomain.workflowCount}</span>
                        </div>
                      </div>

                      {subdomain.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                          {subdomain.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{getRelativeTime(subdomain.created_at)}</span>
                        </div>
                        {subdomain.creator_name && (
                          <div className="flex items-center" title={subdomain.creator_email || subdomain.creator_name}>
                            <UserIcon className="w-3 h-3 mr-1" />
                            <span className="truncate max-w-[100px]">{subdomain.creator_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
