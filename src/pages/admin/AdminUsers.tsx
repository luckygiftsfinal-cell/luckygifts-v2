import React, { useState } from "react";
import { Search, User, Crown, Mail, MoreVertical, Edit2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

const mockUsers = [
  { id: "1", name: "Ahmed Al-Maktoum", email: "ahmed@example.com", phone: "+971 50 123 4567", vip: "Diamond", joined: "12 Mar 2026", status: "Active" },
  { id: "2", name: "Sarah Jenkins", email: "sarah@example.com", phone: "+44 7700 900000", vip: "Gold", joined: "10 Mar 2026", status: "Active" },
  { id: "3", name: "Tariq Mansour", email: "tariq@example.com", phone: "+966 50 000 0000", vip: "None", joined: "05 Mar 2026", status: "Active" },
  { id: "4", name: "Elena Rodriguez", email: "elena@example.com", phone: "+34 600 000 000", vip: "None", joined: "01 Mar 2026", status: "Banned" },
];

export default function AdminUsers() {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingVIP, setEditingVIP] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  const handleAction = (action: string, userId: string, userName: string) => {
    if (action === "vip") {
      setEditingVIP(userId);
    }
    if (action === "edit") {
      const userToEdit = users.find(u => u.id === userId);
      if (userToEdit) setEditingUser({ ...userToEdit });
    }
    if (action === "restrict") {
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          const isBanned = u.status === "Banned";
          const newStatus = isBanned ? "Active" : "Banned";
          if (isBanned) toast.success(`${userName} has been reactivated`, { icon: "✅" });
          else toast.error(`${userName} has been banned`, { icon: "🚫" });
          return { ...u, status: newStatus };
        }
        return u;
      }));
    }
  };

  const handleVIPChange = (userId: string, newLevel: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, vip: newLevel } : u));
    toast.success(`VIP Level updated to ${newLevel}`, { icon: "👑" });
    setEditingVIP(null);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
    toast.success("User updated successfully!");
    setEditingUser(null);
  };

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">VIP Users Management</h1>
        <p className="text-white/40">Manage your user base, monitor activity, and assign VIP levels.</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-lg">
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Total Users</p>
          <p className="text-3xl font-black text-white">4,892</p>
        </div>
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-lg">
          <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-widest mb-2">VIP Members</p>
          <p className="text-3xl font-black text-[#FFD700]">156</p>
        </div>
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-lg">
          <p className="text-[#00C853] text-[10px] font-black uppercase tracking-widest mb-2">New This Week</p>
          <p className="text-3xl font-black text-[#00C853]">+42</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-lg">
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={18} />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-white/10 rounded-full py-2 pl-12 pr-4 text-sm text-black focus:outline-none focus:border-[#FFD700] transition-colors"
              />
            </div>
            
            <select className="bg-white border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-black focus:outline-none focus:border-[#FFD700] transition-colors">
              <option value="all">All VIP Levels</option>
              <option value="diamond">Diamond</option>
              <option value="gold">Gold</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button className="bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">Export CSV</button>
            <button className="bg-[#FFD700] text-black text-xs font-black px-4 py-2 rounded-lg transition-colors uppercase">Add User</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black text-white/40 uppercase tracking-widest">
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-6">Contact Info</th>
                <th className="py-4 px-6">Joined Date</th>
                <th className="py-4 px-6">VIP Level</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.filter(u => u.vip !== "None").map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center text-white/40 font-black group-hover:text-[#FFD700] transition-colors">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{user.name}</p>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest">ID: #{user.id}0421</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <Mail size={12} /> {user.email}
                      </div>
                      <div className="text-[10px] text-white/30 font-medium">{user.phone}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-white/60 text-sm">
                    {user.joined}
                  </td>
                  <td className="py-4 px-6">
                    {user.vip !== "None" ? (
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md w-fit border ${
                        user.vip === "Diamond" 
                          ? "bg-[#00E5FF]/10 border-[#00E5FF]/30 text-[#00E5FF]" 
                          : "bg-[#FFD700]/10 border-[#FFD700]/30 text-[#FFD700]"
                      }`}>
                        <Crown size={12} />
                        <span className="text-[10px] font-black uppercase tracking-wider">{user.vip}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Standard</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest ${
                      user.status === "Active" ? "bg-[#00C853]/10 text-[#00C853]" : "bg-[#ef4444]/10 text-[#ef4444]"
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleAction("vip", user.id, user.name)}
                        title="Change VIP Level" 
                        className="p-2 text-white/40 hover:text-[#FFD700] transition-colors"
                      >
                        <Crown size={16} />
                      </button>
                      <button 
                        onClick={() => handleAction("edit", user.id, user.name)}
                        title="Edit User" 
                        className="p-2 text-white/40 hover:text-white transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleAction("restrict", user.id, user.name)}
                        title="Restrict User" 
                        className="p-2 text-white/40 hover:text-[#ef4444] transition-colors"
                      >
                        <ShieldAlert size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIP Change Modal */}
      {editingVIP && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingVIP(null)} />
          <div className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-6 text-center">Set VIP Level</h3>
            <div className="space-y-3">
              {[
                { level: "Diamond", color: "#00E5FF" },
                { level: "Gold", color: "#FFD700" },
                { level: "None", color: "#FFFFFF" }
              ].map((v) => (
                <button
                  key={v.level}
                  onClick={() => handleVIPChange(editingVIP, v.level)}
                  className="w-full py-4 rounded-2xl border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all flex items-center justify-center gap-3 group"
                >
                  <Crown size={20} style={{ color: v.color }} />
                  <span className="font-black uppercase tracking-widest text-sm" style={{ color: v.color }}>{v.level === "None" ? "Standard User" : `${v.level} Level`}</span>
                </button>
              ))}
            </div>
            <button 
              onClick={() => setEditingVIP(null)}
              className="w-full mt-6 text-white/40 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingUser(null)} />
          <div className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-6">Edit User Profile</h3>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">User ID</label>
                <input 
                  type="text" 
                  value={editingUser.id}
                  onChange={(e) => setEditingUser({ ...editingUser, id: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Phone Number</label>
                <input 
                  type="text" 
                  value={editingUser.phone}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none transition-colors"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-white/40 font-bold uppercase tracking-widest text-xs hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#FFD700] text-black font-black uppercase tracking-widest text-xs hover:bg-[#e6c200] transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
