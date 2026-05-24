import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Loader2, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { schemesAPI } from '../../services/api';

const CATEGORIES = [
  { value: 'agriculture', label: 'Agriculture & Farming' },
  { value: 'health', label: 'Healthcare & Wellness' },
  { value: 'housing', label: 'Housing & Urban Development' },
  { value: 'education', label: 'Education & Scholarships' },
  { value: 'financial', label: 'Financial Services & Banking' },
  { value: 'women', label: 'Women & Child Development' },
  { value: 'pension', label: 'Pensions & Social Security' },
  { value: 'entrepreneur', label: 'Entrepreneurship & Skills' }
];

const INITIAL_FORM = {
  name: '',
  shortName: '',
  description: '',
  category: 'financial',
  benefits: '',
  applicationProcess: '',
  documentsRequired: '',
  officialLink: '',
  ministry: '',
  launchYear: new Date().getFullYear(),
  isActive: true,
  tags: '',
  eligibility: {
    minAge: '',
    maxAge: '',
    minIncome: '',
    maxIncome: '',
    gender: 'any',
    occupations: '',
    states: '',
    otherCriteria: ''
  }
};

export default function SchemeManagement() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Search & Filter
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchemeId, setEditingSchemeId] = useState(null); // null = Add, non-null = Edit
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  
  // Delete confirm modal
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchSchemes = async () => {
    setLoading(true);
    setError('');
    try {
      // Include inactive schemes for management
      const res = await schemesAPI.getAll({ includeInactive: true });
      setSchemes(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch schemes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  // Show Toast / Success Banner
  const triggerSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleOpenAdd = () => {
    setForm(INITIAL_FORM);
    setEditingSchemeId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (scheme) => {
    setEditingSchemeId(scheme._id);
    setForm({
      name: scheme.name || '',
      shortName: scheme.shortName || '',
      description: scheme.description || '',
      category: scheme.category || 'financial',
      benefits: Array.isArray(scheme.benefits) ? scheme.benefits.join('\n') : '',
      applicationProcess: Array.isArray(scheme.applicationProcess) ? scheme.applicationProcess.join('\n') : '',
      documentsRequired: Array.isArray(scheme.documentsRequired) ? scheme.documentsRequired.join('\n') : '',
      officialLink: scheme.officialLink || '',
      ministry: scheme.ministry || '',
      launchYear: scheme.launchYear || new Date().getFullYear(),
      isActive: scheme.isActive !== false,
      tags: Array.isArray(scheme.tags) ? scheme.tags.join(', ') : '',
      eligibility: {
        minAge: scheme.eligibility?.minAge || '',
        maxAge: scheme.eligibility?.maxAge || '',
        minIncome: scheme.eligibility?.minIncome || '',
        maxIncome: scheme.eligibility?.maxIncome || '',
        gender: scheme.eligibility?.gender || 'any',
        occupations: Array.isArray(scheme.eligibility?.occupations) ? scheme.eligibility.occupations.join(', ') : '',
        states: Array.isArray(scheme.eligibility?.states) ? scheme.eligibility.states.join(', ') : '',
        otherCriteria: Array.isArray(scheme.eligibility?.otherCriteria) ? scheme.eligibility.otherCriteria.join('\n') : ''
      }
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await schemesAPI.delete(deleteConfirmId);
      triggerSuccess('Scheme deleted successfully');
      setSchemes(prev => prev.filter(s => s._id !== deleteConfirmId));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete scheme');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Transform form fields to match database format
    const payload = {
      name: form.name.trim(),
      shortName: form.shortName.trim(),
      description: form.description.trim(),
      category: form.category,
      officialLink: form.officialLink.trim(),
      ministry: form.ministry.trim(),
      launchYear: parseInt(form.launchYear) || undefined,
      isActive: form.isActive,
      benefits: form.benefits.split('\n').map(b => b.trim()).filter(Boolean),
      applicationProcess: form.applicationProcess.split('\n').map(a => a.trim()).filter(Boolean),
      documentsRequired: form.documentsRequired.split('\n').map(d => d.trim()).filter(Boolean),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      eligibility: {
        minAge: form.eligibility.minAge ? parseInt(form.eligibility.minAge) : undefined,
        maxAge: form.eligibility.maxAge ? parseInt(form.eligibility.maxAge) : undefined,
        minIncome: form.eligibility.minIncome ? parseInt(form.eligibility.minIncome) : undefined,
        maxIncome: form.eligibility.maxIncome ? parseInt(form.eligibility.maxIncome) : undefined,
        gender: form.eligibility.gender,
        occupations: form.eligibility.occupations.split(',').map(o => o.trim()).filter(Boolean),
        states: form.eligibility.states.split(',').map(s => s.trim()).filter(Boolean),
        otherCriteria: form.eligibility.otherCriteria.split('\n').map(c => c.trim()).filter(Boolean)
      }
    };

    try {
      if (editingSchemeId) {
        const res = await schemesAPI.update(editingSchemeId, payload);
        triggerSuccess('Scheme updated successfully');
        setSchemes(prev => prev.map(s => s._id === editingSchemeId ? res.data.data : s));
      } else {
        const res = await schemesAPI.create(payload);
        triggerSuccess('Scheme created successfully');
        setSchemes(prev => [res.data.data, ...prev]);
      }
      setIsModalOpen(false);
      setForm(INITIAL_FORM);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save scheme');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered schemes
  const filteredSchemes = schemes.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.shortName && s.shortName.toLowerCase().includes(search.toLowerCase())) ||
      (s.description && s.description.toLowerCase().includes(search.toLowerCase())) ||
      (s.ministry && s.ministry.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = !categoryFilter || s.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Success/Error Alerts */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-5 py-4 flex items-center gap-3 animate-fade-in">
          <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
          <p className="font-medium text-sm">{successMsg}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Operation Failed</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Top Controls Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search schemes by name, description, ministry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field sm:w-56"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn-primary flex items-center justify-center gap-2 py-3 px-5 whitespace-nowrap"
        >
          <Plus size={16} />
          Add Scheme
        </button>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Total Loaded</p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5">{schemes.length}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Active Schemes</p>
          <p className="text-2xl font-bold text-green-600 mt-0.5">{schemes.filter(s => s.isActive).length}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Inactive Drafts</p>
          <p className="text-2xl font-bold text-amber-500 mt-0.5">{schemes.filter(s => !s.isActive).length}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Unique Categories</p>
          <p className="text-2xl font-bold text-indigo-600 mt-0.5">{new Set(schemes.map(s => s.category)).size}</p>
        </div>
      </div>

      {/* Schemes List Table/Cards */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-2">
            <Loader2 size={32} className="animate-spin text-primary-700" />
            <p className="text-sm font-medium">Loading government schemes...</p>
          </div>
        ) : filteredSchemes.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <p className="text-sm">No schemes found matching the criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide">Scheme Details</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide">Ministry</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide">Age Range</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredSchemes.map(scheme => (
                  <tr key={scheme._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{scheme.name}</p>
                          {scheme.shortName && (
                            <span className="bg-gray-100 text-gray-600 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded">
                              {scheme.shortName}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{scheme.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="capitalize bg-primary-50 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full">
                        {scheme.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600 max-w-[120px] truncate" title={scheme.ministry}>
                      {scheme.ministry || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                        ${scheme.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                        {scheme.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-xs text-gray-600 whitespace-nowrap">
                      {scheme.eligibility?.minAge || 0} - {scheme.eligibility?.maxAge || '∞'} yrs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(scheme)}
                          className="p-1.5 text-gray-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Edit Scheme"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(scheme._id)}
                          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Scheme"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl max-h-[90vh] flex flex-col animate-scale-up">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingSchemeId ? 'Edit Government Scheme' : 'Create Government Scheme'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Fill out all eligibility and rule parameters precisely</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* SECTION 1: General Info */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-primary-800 border-b border-primary-50 pb-1">1. General Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Scheme Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                      required
                      placeholder="e.g. Pradhan Mantri Kisan Samman Nidhi"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Short Name / Acronym</label>
                    <input
                      type="text"
                      value={form.shortName}
                      onChange={(e) => setForm(p => ({ ...p, shortName: e.target.value }))}
                      placeholder="e.g. PM-KISAN"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Category *</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))}
                      required
                      className="input-field"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Ministry</label>
                    <input
                      type="text"
                      value={form.ministry}
                      onChange={(e) => setForm(p => ({ ...p, ministry: e.target.value }))}
                      placeholder="e.g. Ministry of Agriculture"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Launch Year</label>
                    <input
                      type="number"
                      value={form.launchYear}
                      onChange={(e) => setForm(p => ({ ...p, launchYear: e.target.value }))}
                      placeholder="e.g. 2019"
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Description *</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                    required
                    placeholder="Short description of what the scheme offers and what problem it resolves..."
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="md:col-span-2">
                    <label className="label">Official Website Link</label>
                    <input
                      type="url"
                      value={form.officialLink}
                      onChange={(e) => setForm(p => ({ ...p, officialLink: e.target.value }))}
                      placeholder="https://pmkisan.gov.in"
                      className="input-field"
                    />
                  </div>
                  <div className="flex items-center mt-6">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setForm(p => ({ ...p, isActive: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      <span className="ms-3 text-sm font-semibold text-gray-700">Scheme is Active</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="label">Search tags (comma-separated)</label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm(p => ({ ...p, tags: e.target.value }))}
                    placeholder="farmer, subsidy, direct benefit transfer, money"
                    className="input-field"
                  />
                </div>
              </div>

              {/* SECTION 2: Eligibility Rules */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-primary-800 border-b border-primary-50 pb-1">2. Eligibility Parameters</h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="label">Min Age (Years)</label>
                    <input
                      type="number"
                      value={form.eligibility.minAge}
                      onChange={(e) => setForm(p => ({ ...p, eligibility: { ...p.eligibility, minAge: e.target.value } }))}
                      placeholder="e.g. 18"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Max Age (Years)</label>
                    <input
                      type="number"
                      value={form.eligibility.maxAge}
                      onChange={(e) => setForm(p => ({ ...p, eligibility: { ...p.eligibility, maxAge: e.target.value } }))}
                      placeholder="e.g. 60"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Min Annual Income (₹)</label>
                    <input
                      type="number"
                      value={form.eligibility.minIncome}
                      onChange={(e) => setForm(p => ({ ...p, eligibility: { ...p.eligibility, minIncome: e.target.value } }))}
                      placeholder="e.g. 0"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Max Annual Income (₹)</label>
                    <input
                      type="number"
                      value={form.eligibility.maxIncome}
                      onChange={(e) => setForm(p => ({ ...p, eligibility: { ...p.eligibility, maxIncome: e.target.value } }))}
                      placeholder="e.g. 200000"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Gender Requirement</label>
                    <select
                      value={form.eligibility.gender}
                      onChange={(e) => setForm(p => ({ ...p, eligibility: { ...p.eligibility, gender: e.target.value } }))}
                      className="input-field"
                    >
                      <option value="any">Any (All Citizens)</option>
                      <option value="male">Male Only</option>
                      <option value="female">Female Only</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Eligible Occupations (comma-separated)</label>
                    <input
                      type="text"
                      value={form.eligibility.occupations}
                      onChange={(e) => setForm(p => ({ ...p, eligibility: { ...p.eligibility, occupations: e.target.value } }))}
                      placeholder="e.g. farmer, artisan, laborer (leave empty for all)"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Eligible States (comma-separated)</label>
                    <input
                      type="text"
                      value={form.eligibility.states}
                      onChange={(e) => setForm(p => ({ ...p, eligibility: { ...p.eligibility, states: e.target.value } }))}
                      placeholder="e.g. Maharashtra, Bihar, Rajasthan (leave empty for all-India)"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Other Criteria (one per line)</label>
                    <textarea
                      value={form.eligibility.otherCriteria}
                      onChange={(e) => setForm(p => ({ ...p, eligibility: { ...p.eligibility, otherCriteria: e.target.value } }))}
                      placeholder="e.g. Applicant must own agricultural land&#10;Should not be an income taxpayer"
                      rows={2}
                      className="input-field resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Lists (Benefits, Documents, Process) */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-primary-800 border-b border-primary-50 pb-1">3. Benefits &amp; Processes (One item per line)</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Scheme Benefits *</label>
                    <textarea
                      value={form.benefits}
                      onChange={(e) => setForm(p => ({ ...p, benefits: e.target.value }))}
                      required
                      placeholder="₹6,000 direct money transfer per year&#10;Paid in 3 equal installments"
                      rows={4}
                      className="input-field resize-none"
                    />
                  </div>
                  <div>
                    <label className="label">Documents Required *</label>
                    <textarea
                      value={form.documentsRequired}
                      onChange={(e) => setForm(p => ({ ...p, documentsRequired: e.target.value }))}
                      required
                      placeholder="Aadhaar Card&#10;Land ownership certificate&#10;Bank account passbook"
                      rows={4}
                      className="input-field resize-none"
                    />
                  </div>
                  <div>
                    <label className="label">Application Process *</label>
                    <textarea
                      value={form.applicationProcess}
                      onChange={(e) => setForm(p => ({ ...p, applicationProcess: e.target.value }))}
                      required
                      placeholder="Step 1: Visit the official portal PM-Kisan&#10;Step 2: Click on New Farmer Registration&#10;Step 3: Submit details and Aadhaar card"
                      rows={4}
                      className="input-field resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex items-center justify-center gap-2 py-3 px-6"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {submitting ? 'Saving...' : 'Save Scheme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-scale-up">
            <h3 className="text-lg font-bold text-gray-900">Delete Scheme?</h3>
            <p className="text-sm text-gray-500 mt-2">
              Are you sure you want to delete this government scheme? This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-gray-200 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
