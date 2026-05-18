import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { UserX, Shield, User as UserIcon, CheckCircle, XCircle } from 'lucide-react';

const Users = () => {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get('/api/users', config);
      setUsersList(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleAccess = async (userId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/users/${userId}/access`, {}, config);
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`/api/users/${userId}`, config);
        fetchUsers();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 font-semibold text-sm text-gray-700 dark:text-gray-300">User</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-700 dark:text-gray-300">Role</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-700 dark:text-gray-300">Status</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-700 dark:text-gray-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {usersList.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{u.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      u.role === 'Admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {u.role === 'Admin' ? <Shield size={14} /> : <UserIcon size={14} />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      u.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {u.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      {u.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => toggleAccess(u._id)}
                        className={`text-sm font-medium ${u.isActive ? 'text-orange-600 hover:text-orange-800 dark:text-orange-400' : 'text-green-600 hover:text-green-800 dark:text-green-400'}`}
                      >
                        {u.isActive ? 'Disable' : 'Enable'}
                      </button>
                      {u._id !== user._id && (
                        <button 
                          onClick={() => deleteUser(u._id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <UserX size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {usersList.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No users found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
