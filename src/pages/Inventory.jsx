import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Inbox,
  AlertTriangle
} from 'lucide-react';

export default function Inventory() {
  const { inventory, addInventoryItem, editInventoryItem, deleteInventoryItem } = useApp();

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form Fields State
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [itemStock, setItemStock] = useState(0);
  const [itemVendor, setItemVendor] = useState('');

  // Handle opening edit modal
  const openEditModal = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemCategory(item.category);
    setItemStock(item.stock);
    setItemVendor(item.vendor);
    setIsEditOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!itemName || !itemCategory || !itemVendor) return;

    addInventoryItem({
      name: itemName,
      category: itemCategory,
      stock: Number(itemStock),
      vendor: itemVendor
    });

    // Reset and Close
    setItemName('');
    setItemCategory('');
    setItemStock(0);
    setItemVendor('');
    setIsAddOpen(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingItem || !itemName || !itemCategory || !itemVendor) return;

    editInventoryItem(editingItem.id, {
      name: itemName,
      category: itemCategory,
      stock: Number(itemStock),
      vendor: itemVendor
    });

    setIsEditOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (itemId) => {
    if (window.confirm("Are you sure you want to delete this inventory item?")) {
      deleteInventoryItem(itemId);
    }
  };

  // Filter & Search Logic
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = statusFilter === 'All' || item.status === statusFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="pt-20 pl-4 md:pl-72 pr-4 md:pr-8 pb-12 min-h-screen text-slate-100 flex flex-col gap-6">

      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-200">Inventory Ledger</h2>
          <p className="text-xs text-slate-505">Add, edit, track and audit all your warehouse SKU assets.</p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all duration-300 shadow-md shadow-indigo-600/10 cursor-pointer self-start sm:self-auto w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add SKU Item</span>
        </button>
      </div>

      {/* Control Panel: Search & Filters */}
      <div className="glass rounded-2xl p-4 border border-slate-805 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by SKU name or category..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-850 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Filter By:
          </span>
          {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${statusFilter === status
                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                  : 'bg-slate-900/40 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="glass rounded-2xl border border-slate-805 overflow-hidden">
        {filteredInventory.length === 0 ? (
          /* Empty State */
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <Inbox className="h-12 w-12 text-slate-700 mb-3" />
            <p className="text-sm font-bold text-slate-400">No SKU items found matching criteria.</p>
            <p className="text-xs text-slate-500 max-w-sm mt-1">Try adjusting your filters, searching for something else, or creating a new item manually.</p>
          </div>
        ) : (
          /* Responsive Table */
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-850 bg-slate-900/40 text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                  <th className="py-4 px-6">SKU Name</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Current Stock</th>
                  <th className="py-4 px-6">Supplier Vendor</th>
                  <th className="py-4 px-6">Stock Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60 text-xs font-semibold text-slate-300">
                {filteredInventory.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-900/30 transition-colors"
                  >
                    <td className="py-4 px-6 font-bold text-slate-200">{item.name}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-850 border border-slate-800 text-[10px] text-slate-400">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">{item.stock} Units</td>
                    <td className="py-4 px-6 text-slate-400">{item.vendor}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${item.status === 'In Stock'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : item.status === 'Low Stock'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded-lg cursor-pointer transition-colors"
                          title="Edit Item"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-450 rounded-lg cursor-pointer transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* MODALS */}
      {/* 1. Add SKU Item Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-3xl border border-slate-800 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-850 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-200">Create Inventory Record</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 text-slate-500 hover:text-slate-350 rounded-lg hover:bg-slate-900 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Item Name</label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Paracetamol"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                  <input
                    type="text"
                    required
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    placeholder="e.g. Medicine"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={itemStock}
                    onChange={(e) => setItemStock(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Supplier / Vendor</label>
                <input
                  type="text"
                  required
                  value={itemVendor}
                  onChange={(e) => setItemVendor(e.target.value)}
                  placeholder="e.g. BioMed Supplies"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-md shadow-indigo-600/10"
              >
                Insert Item to Ledger
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit SKU Item Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-3xl border border-slate-800 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-850 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-200">Edit SKU Record</h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1 text-slate-500 hover:text-slate-350 rounded-lg hover:bg-slate-900 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Item Name</label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Paracetamol"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                  <input
                    type="text"
                    required
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    placeholder="e.g. Medicine"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={itemStock}
                    onChange={(e) => setItemStock(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Supplier / Vendor</label>
                <input
                  type="text"
                  required
                  value={itemVendor}
                  onChange={(e) => setItemVendor(e.target.value)}
                  placeholder="e.g. BioMed Supplies"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-md shadow-indigo-600/10"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
