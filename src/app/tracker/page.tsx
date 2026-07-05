'use client';

import React, { useState } from 'react';
import { useApp } from '@/components/Layout/AppContext';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Calendar,
  Building,
  RefreshCw,
  FolderOpen,
  Check
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ComplianceTrackerPage() {
  const { compliances, toggleCompliance, addCompliance, company } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for new compliance
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('GST');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newDesc, setNewDesc] = useState('');

  // Handle task completion toggle
  const handleToggle = (id: string) => {
    toggleCompliance(id);
  };

  // Handle Form Submission
  const handleAddCompliance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDueDate) return;
    
    addCompliance(newTitle, newCategory, newDueDate, newPriority, newDesc);
    
    // Reset Form
    setNewTitle('');
    setNewCategory('GST');
    setNewDueDate('');
    setNewPriority('medium');
    setNewDesc('');
    setShowAddModal(false);
  };

  // Filter logic
  const filteredCompliances = compliances.filter(comp => {
    const matchesSearch = comp.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          comp.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || comp.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || comp.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || comp.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const categories = ['GST', 'PF', 'ESI', 'Labour Law', 'Tax', 'General'];

  return (
    <div className="space-y-6">
      {/* Header and Add Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Compliance Tracker
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor state laws, GST filings, and monthly payroll tax deposits. Update task completion status to audit score health.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-lg shadow-blue-500/10 hover:scale-105 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Custom Obligation
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search obligations or codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-border bg-background text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Status */}
          <div className="flex items-center gap-1 bg-background border border-border rounded-lg p-1">
            <span className="text-[10px] text-muted-foreground ml-1.5 font-bold uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-[10px] font-bold text-foreground focus:outline-none pr-1"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>

          {/* Category */}
          <div className="flex items-center gap-1 bg-background border border-border rounded-lg p-1">
            <span className="text-[10px] text-muted-foreground ml-1.5 font-bold uppercase">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent border-none text-[10px] font-bold text-foreground focus:outline-none pr-1"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="flex items-center gap-1 bg-background border border-border rounded-lg p-1">
            <span className="text-[10px] text-muted-foreground ml-1.5 font-bold uppercase">Risk Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent border-none text-[10px] font-bold text-foreground focus:outline-none pr-1"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tracker Grid Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border bg-secondary/15 flex justify-between items-center text-xs text-muted-foreground uppercase font-bold tracking-wider">
          <div className="grid grid-cols-12 w-full gap-4 items-center">
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-6">Compliance Task details</div>
            <div className="col-span-2 text-center">Category</div>
            <div className="col-span-1 text-center">Risk Level</div>
            <div className="col-span-2 text-right">Due Date / Fine</div>
          </div>
        </div>

        <div className="divide-y divide-border">
          {filteredCompliances.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
              <FolderOpen className="w-10 h-10 text-slate-400" />
              <h3 className="text-xs font-bold text-foreground">No Obligations Found</h3>
              <p className="text-[11px] text-muted-foreground">Adjust filters or search parameters to inspect regulatory details.</p>
            </div>
          ) : (
            filteredCompliances.map((comp) => {
              const isCompleted = comp.status === 'completed';
              return (
                <div key={comp.id} className={`p-4 hover:bg-secondary/20 transition-all flex items-center ${isCompleted ? 'bg-secondary/10' : ''}`}>
                  <div className="grid grid-cols-12 w-full gap-4 items-center">
                    {/* Completion Checkmark trigger */}
                    <div className="col-span-1 flex justify-center">
                      <button
                        onClick={() => handleToggle(comp.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isCompleted 
                            ? 'bg-emerald-600 border-emerald-600 text-white' 
                            : comp.status === 'overdue'
                              ? 'border-rose-500 hover:bg-rose-500/10'
                              : 'border-slate-300 dark:border-slate-600 hover:bg-blue-600/10'
                        }`}
                        title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
                      >
                        {isCompleted && <Check className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Task details */}
                    <div className="col-span-6 space-y-1">
                      <span className={`text-xs font-semibold text-foreground block ${isCompleted ? 'line-through opacity-55' : ''}`}>
                        {comp.title}
                      </span>
                      <p className="text-[10px] text-muted-foreground leading-normal max-w-xl">{comp.description}</p>
                    </div>

                    {/* Category */}
                    <div className="col-span-2 text-center">
                      <span className="px-2 py-0.5 text-[9px] uppercase font-bold rounded bg-secondary text-muted-foreground">
                        {comp.category}
                      </span>
                    </div>

                    {/* Priority Risk Level */}
                    <div className="col-span-1 text-center">
                      <span className={`px-2 py-0.5 text-[8px] font-bold uppercase rounded-full ${
                        comp.priority === 'high'
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/25'
                          : comp.priority === 'medium'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/25'
                            : 'bg-blue-500/10 text-blue-500 border border-blue-500/25'
                      }`}>
                        {comp.priority}
                      </span>
                    </div>

                    {/* Date and Fines */}
                    <div className="col-span-2 text-right">
                      <span className="text-xs font-bold text-foreground block">{formatDate(comp.due_date)}</span>
                      {comp.status === 'overdue' && comp.penalty_amount > 0 ? (
                        <span className="text-[9px] font-semibold text-rose-500 block mt-0.5">
                          Fine: {formatCurrency(comp.penalty_amount)}
                        </span>
                      ) : comp.completion_date ? (
                        <span className="text-[9px] font-semibold text-emerald-500 block mt-0.5">
                          Done {formatDate(comp.completion_date)}
                        </span>
                      ) : (
                        <span className="text-[9px] text-muted-foreground block mt-0.5">No Fines</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Custom Compliance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg p-6 mx-4 rounded-xl border border-border bg-card text-card-foreground shadow-2xl animate-slide-up">
            <h3 className="text-base font-bold text-foreground mb-4">Add Custom Compliance Task</h3>

            <form onSubmit={handleAddCompliance} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Obligation Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. GST Annual Return GSTR-9"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Regulatory Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Risk Level / Priority
                </label>
                <div className="flex gap-4">
                  {['high', 'medium', 'low'].map(p => (
                    <label key={p} className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                      <input
                        type="radio"
                        name="priority"
                        value={p}
                        checked={newPriority === p}
                        onChange={(e) => setNewPriority(e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="capitalize">{p} Risk</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Description / Compliance Notes
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Detailed requirements under state or central circular..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs rounded-lg hover:bg-secondary border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs text-white font-medium rounded-lg bg-blue-600 hover:bg-blue-700 focus:outline-none"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
