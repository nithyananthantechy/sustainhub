import React, { useEffect, useState } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { 
  Settings as SettingsIcon, Building, ShieldCheck, Key, 
  Users, Mail, CheckCircle2, Copy, RefreshCw, Plus, 
  UserPlus, ShieldAlert, Sparkles, Code
} from 'lucide-react';

interface CompanyUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  isActive: boolean;
  createdAt: string;
}

const Settings: React.FC = () => {
  const { user, company, updateCompany } = useAuth();
  
  // Company Profile form
  const [name, setName] = useState(company?.name || '');
  const [logoUrl, setLogoUrl] = useState(company?.logoUrl || '');
  const [csrDataSource, setCsrDataSource] = useState<'manual' | 'api' | 'sharepoint'>(company?.csrDataSource || 'manual');
  const [sharepointTenantId, setSharepointTenantId] = useState('');
  const [sharepointListId, setSharepointListId] = useState('');
  const [monthlyRpc, setMonthlyRpc] = useState('0');

  // API Key & User list
  const [apiKey, setApiKey] = useState('');
  const [usersList, setUsersList] = useState<CompanyUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  // Action states
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'manager' | 'user'>('user');
  const [inviteResult, setInviteResult] = useState<{ password?: string; message?: string } | null>(null);

  const [savingSettings, setSavingSettings] = useState(false);
  const [rotatingKey, setRotatingKey] = useState(false);
  const [submittingInvite, setSubmittingInvite] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Widget Builder state
  const [widgetBrand, setWidgetBrand] = useState('indigo');
  const [widgetCopied, setWidgetCopied] = useState(false);

  const isAdmin = user?.role === 'admin';

  // Load detailed settings (API key & user list)
  useEffect(() => {
    const loadSettingsData = async () => {
      if (!company) return;
      try {
        const companyDetailsRes = await api.get(`/companies/${company.id}`);
        const details = companyDetailsRes.data;
        
        setName(details.name);
        setLogoUrl(details.logoUrl || '');
        setCsrDataSource(details.csrDataSource);
        setSharepointTenantId(details.sharepointTenantId || '');
        setSharepointListId(details.sharepointListId || '');
        setMonthlyRpc(details.monthlyRpc ? String(details.monthlyRpc) : '0');
        setApiKey(details.apiKey || '');
        setUsersList(details.users || []);
      } catch (err) {
        console.error('Failed to load settings details:', err);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadSettingsData();
  }, [company]);

  // Save Company settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !isAdmin) return;

    setSavingSettings(true);
    setFeedbackMessage(null);
    setErrorMessage(null);

    try {
      const res = await api.put(`/companies/${company.id}`, {
        name,
        logoUrl: logoUrl || null,
        csrDataSource,
        sharepointTenantId: sharepointTenantId || null,
        sharepointListId: sharepointListId || null,
        monthlyRpc: Number(monthlyRpc),
      });

      // Update local storage and context
      updateCompany(res.data.company);
      setFeedbackMessage('Company settings updated successfully.');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Failed to update company settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Copy API key to clipboard
  const handleCopyKey = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyWidget = () => {
    if (!company) return;
    const widgetUrl = `${window.location.origin}/widget?company_id=${company.id}&brand=${widgetBrand}`;
    const iframeCode = `<iframe src="${widgetUrl}" width="100%" height="600" frameborder="0" style="border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"></iframe>`;
    navigator.clipboard.writeText(iframeCode);
    setWidgetCopied(true);
    setTimeout(() => setWidgetCopied(false), 2000);
  };

  // Rotate API Key
  const handleRotateKey = async () => {
    if (!isAdmin) return;
    const confirmRotate = window.confirm(
      'WARNING: Rotating the API Key will immediately invalidate your active key. Any automated scripts using this key will fail until updated. Do you want to continue?'
    );
    if (!confirmRotate) return;

    setRotatingKey(true);
    try {
      const res = await api.post('/companies/api-key');
      setApiKey(res.data.apiKey);
      setFeedbackMessage('API key rotated successfully. Make sure to update your external scripts.');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Failed to rotate API Key.');
    } finally {
      setRotatingKey(false);
    }
  };

  // Invite user
  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail || !isAdmin) return;

    setSubmittingInvite(true);
    setInviteResult(null);
    setErrorMessage(null);

    try {
      const res = await api.post('/companies/invite-user', {
        name: inviteName,
        email: inviteEmail,
        role: inviteRole,
      });

      setInviteResult({
        message: `Invitation generated successfully for ${inviteName}!`,
        password: res.data.temporaryPassword,
      });

      // Refresh users list
      const companyDetailsRes = await api.get(`/companies/${company?.id}`);
      setUsersList(companyDetailsRes.data.users || []);

      // Clear input fields
      setInviteName('');
      setInviteEmail('');
      setInviteRole('user');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Failed to invite user.');
    } finally {
      setSubmittingInvite(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'manager': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Banner */}
      <div>
        <h1 className="font-outfit font-extrabold text-3xl text-slate-800 tracking-tight">
          Settings Panel
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Configure telemetry data streams, retrieve API integration tokens, and organize user staff accounts.
        </p>
      </div>

      {feedbackMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs font-semibold text-emerald-700 animate-fadeIn">
          {feedbackMessage}
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-semibold text-accent-rose animate-fadeIn">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Forms for Company details) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-premium">
            <div className="flex items-center space-x-2 pb-4 border-b border-slate-50 mb-6">
              <Building className="w-5 h-5 text-brand-600" />
              <h3 className="font-outfit font-bold text-slate-800 text-sm">Company Profile & Data Stream</h3>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    className="input-premium"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isAdmin || savingSettings}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Logo Image URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://example.com/logo.png"
                    className="input-premium"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    disabled={!isAdmin || savingSettings}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    CSR Metric Source
                  </label>
                  <select
                    value={csrDataSource}
                    onChange={(e: any) => setCsrDataSource(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 outline-none focus:border-brand-500"
                    disabled={!isAdmin || savingSettings}
                  >
                    <option value="manual">Manual Entry Only</option>
                    <option value="api">External API push</option>
                    <option value="sharepoint">SharePoint List synchronization</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Monthly Target RPC
                  </label>
                  <input
                    type="number"
                    className="input-premium"
                    value={monthlyRpc}
                    onChange={(e) => setMonthlyRpc(e.target.value)}
                    disabled={!isAdmin || savingSettings}
                  />
                </div>
              </div>

              {/* SharePoint Specific Settings */}
              {csrDataSource === 'sharepoint' && (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-4 animate-slideDown">
                  <span className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-brand-600" />
                    SharePoint API credentials
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                        Active Tenant Directory ID
                      </label>
                      <input
                        type="text"
                        placeholder="Azure AD Tenant GUID"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-brand-500"
                        value={sharepointTenantId}
                        onChange={(e) => setSharepointTenantId(e.target.value)}
                        disabled={!isAdmin || savingSettings}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                        Target List UUID
                      </label>
                      <input
                        type="text"
                        placeholder="SharePoint List GUID"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-brand-500"
                        value={sharepointListId}
                        onChange={(e) => setSharepointListId(e.target.value)}
                        disabled={!isAdmin || savingSettings}
                      />
                    </div>
                  </div>
                </div>
              )}

              {isAdmin ? (
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="py-2.5 px-4 bg-brand-700 hover:bg-brand-850 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  {savingSettings ? 'Saving Changes...' : 'Save Settings'}
                </button>
              ) : (
                <div className="text-[10px] text-slate-400 font-semibold flex items-center">
                  <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                  Read-only: You must hold the Admin role to modify company settings.
                </div>
              )}
            </form>
          </div>

          {/* User management list */}
          <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-premium">
            <div className="flex items-center space-x-2 pb-4 border-b border-slate-50 mb-6">
              <Users className="w-5 h-5 text-brand-600" />
              <h3 className="font-outfit font-bold text-slate-800 text-sm">Employee Accounts</h3>
            </div>

            {loadingUsers ? (
              <div className="py-6 flex justify-center">
                <div className="w-6 h-6 border-4 border-slate-100 border-t-brand-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3">Name</th>
                      <th className="pb-3">Email Address</th>
                      <th className="pb-3">Role</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs">
                    {usersList.map((usr) => (
                      <tr key={usr.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 font-semibold text-slate-700">{usr.name}</td>
                        <td className="py-3 text-slate-500">{usr.email}</td>
                        <td className="py-3">
                          <span className={`inline-block px-2 py-0.5 text-[9px] font-extrabold uppercase rounded border tracking-wider ${getRoleBadge(usr.role)}`}>
                            {usr.role}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            usr.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {usr.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (API Key & Invites) */}
        <div className="space-y-8">
          {/* API Key box */}
          <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-premium space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-50">
              <Key className="w-4 h-4 text-brand-600" />
              <h3 className="font-outfit font-bold text-slate-800 text-sm">Developer Integration Token</h3>
            </div>

            <p className="text-[10px] text-slate-400 leading-normal">
              Use this key to submit operational stats from external processes or scripts.
            </p>

            <div className="flex items-center space-x-1">
              <input
                type="password"
                className="input-premium bg-slate-50 font-mono text-[10px]"
                value={apiKey}
                readOnly
              />
              <button
                onClick={handleCopyKey}
                className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-500"
                title="Copy to clipboard"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {isAdmin && (
              <button
                onClick={handleRotateKey}
                disabled={rotatingKey}
                className="w-full flex items-center justify-center py-2 border border-brand-200 hover:border-brand-300 text-brand-700 hover:bg-brand-50 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${rotatingKey ? 'animate-spin' : ''}`} />
                Rotate Integration Key
              </button>
            )}
          </div>

          {/* Widget Builder Panel */}
          {isAdmin && company && (
            <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-premium space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-50">
                <Code className="w-4 h-4 text-brand-600" />
                <h3 className="font-outfit font-bold text-slate-800 text-sm">Embeddable Widget Builder</h3>
              </div>

              <p className="text-[10px] text-slate-400 leading-normal">
                Generate an iframe snippet to embed the transparency and grievance portal onto your public website.
              </p>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Brand Color
                </label>
                <select
                  value={widgetBrand}
                  onChange={(e) => setWidgetBrand(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 outline-none"
                >
                  <option value="indigo">Indigo (Default)</option>
                  <option value="emerald">Emerald</option>
                  <option value="teal">Teal</option>
                  <option value="rose">Rose</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Embed Code
                </label>
                <div className="flex flex-col space-y-2">
                  <textarea
                    readOnly
                    className="w-full h-24 p-3 bg-slate-800 text-emerald-400 font-mono text-[10px] rounded-xl outline-none resize-none"
                    value={`<iframe src="${window.location.origin}/widget?company_id=${company.id}&brand=${widgetBrand}" width="100%" height="600" frameborder="0" style="border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"></iframe>`}
                  />
                  <button
                    onClick={handleCopyWidget}
                    className="flex justify-center items-center py-2.5 bg-brand-700 hover:bg-brand-850 text-white font-bold text-xs rounded-xl shadow-md transition-all duration-200"
                  >
                    {widgetCopied ? <CheckCircle2 className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
                    {widgetCopied ? 'Copied to Clipboard' : 'Copy Snippet'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* User Invitation Panel */}
          {isAdmin && (
            <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-premium space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-50">
                <UserPlus className="w-4 h-4 text-brand-600" />
                <h3 className="font-outfit font-bold text-slate-800 text-sm">Invite Employee</h3>
              </div>

              {inviteResult && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-2 animate-fadeIn">
                  <div className="text-[11px] font-bold text-emerald-800">{inviteResult.message}</div>
                  <div className="text-[10px] text-slate-500">
                    Give them their temporary credentials:
                  </div>
                  <div className="p-2 bg-white border border-emerald-100 rounded-lg text-center font-mono font-bold text-slate-800 text-xs select-all">
                    {inviteResult.password}
                  </div>
                </div>
              )}

              <form onSubmit={handleInviteUser} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Employee Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="input-premium"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    disabled={submittingInvite}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="john@company.com"
                    className="input-premium"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    disabled={submittingInvite}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Permission Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e: any) => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 outline-none"
                    disabled={submittingInvite}
                  >
                    <option value="user">User (View Only)</option>
                    <option value="manager">Manager (Respond Tickets)</option>
                    <option value="admin">Admin (Full Control)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submittingInvite}
                  className="w-full py-2.5 bg-brand-700 hover:bg-brand-850 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  Send Invitation
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
