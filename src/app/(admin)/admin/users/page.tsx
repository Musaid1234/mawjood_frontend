'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { adminService } from '@/services/admin.service';
import { UsersTable } from '@/components/admin/users/UsersTable';
import { createColumns, User } from '@/components/admin/users/columns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    status: '',
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    userId: string | null;
  }>({ open: false, userId: null });

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchInput]);

  // Fetch users when filters or debouncedSearch change
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const params: any = {
          page: 1,
          limit: 100,
        };

        if (debouncedSearch) params.search = debouncedSearch;
        if (filters.role && filters.role !== 'all') params.role = filters.role;
        if (filters.status && filters.status !== 'all') params.status = filters.status;

        const response = await adminService.getAllUsers(params);
        setUsers(response.data.users || []);
      } catch (error: any) {
        console.error('Error fetching users:', error);
        toast.error(error.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [debouncedSearch, filters.role, filters.status]);

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      await adminService.updateUserRole(userId, role);
      toast.success(`User role updated to ${role.replace('_', ' ')}`);
      // Refetch users
      const params: any = { page: 1, limit: 100 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filters.role && filters.role !== 'all') params.role = filters.role;
      if (filters.status && filters.status !== 'all') params.status = filters.status;
      const response = await adminService.getAllUsers(params);
      setUsers(response.data.users || []);
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(error.message || 'Failed to update user role');
    }
  };

  const handleUpdateStatus = async (userId: string, status: string) => {
    try {
      await adminService.updateUserStatus(userId, status);
      toast.success(`User status updated to ${status}`);
      // Refetch users
      const params: any = { page: 1, limit: 100 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filters.role && filters.role !== 'all') params.role = filters.role;
      if (filters.status && filters.status !== 'all') params.status = filters.status;
      const response = await adminService.getAllUsers(params);
      setUsers(response.data.users || []);
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteDialog.userId) return;

    try {
      await adminService.deleteUser(deleteDialog.userId);
      toast.success('User deleted successfully');
      setDeleteDialog({ open: false, userId: null });
      // Refetch users
      const params: any = { page: 1, limit: 100 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filters.role && filters.role !== 'all') params.role = filters.role;
      if (filters.status && filters.status !== 'all') params.status = filters.status;
      const response = await adminService.getAllUsers(params);
      setUsers(response.data.users || []);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleRoleFilter = (value: string) => {
    setFilters((prev) => ({ ...prev, role: value }));
  };

  const handleStatusFilter = (value: string) => {
    setFilters((prev) => ({ ...prev, status: value }));
  };

  const columns = createColumns(
    handleUpdateRole,
    handleUpdateStatus,
    (userId) => setDeleteDialog({ open: true, userId })
  );

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1c4233]" />
      </div>
    );
  }

  return (
    <div className="py-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Users Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage all users, their roles, and status
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1c4233] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Total Users</p>
          <p className="text-3xl font-bold mt-1">{users.length}</p>
        </div>
        <div className="bg-[#245240] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Active Users</p>
          <p className="text-3xl font-bold mt-1">
            {users.filter((u) => u.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="bg-[#2d624d] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Business Owners</p>
          <p className="text-3xl font-bold mt-1">
            {users.filter((u) => u.role === 'BUSINESS_OWNER').length}
          </p>
        </div>
        <div className="bg-[#36725a] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Admins</p>
          <p className="text-3xl font-bold mt-1">
            {users.filter((u) => u.role === 'ADMIN').length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <UsersTable
          columns={columns}
          data={users}
          onSearchChange={handleSearchChange}
          onRoleFilter={handleRoleFilter}
          onStatusFilter={handleStatusFilter}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, userId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              account and remove all associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
