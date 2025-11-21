'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { User } from './columns';

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  onSuccess: () => void;
}

export function EditUserModal({ open, onOpenChange, userId, onSuccess }: EditUserModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch user details when modal opens
  const { data: userData, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => adminService.getUserById(userId!),
    enabled: open && !!userId,
  });

  // Populate form when user data is loaded
  useEffect(() => {
    if (userData?.data) {
      const user = userData.data as User;
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [userData]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (!firstName || !lastName || !email || !phone) {
      toast.error('All fields are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.updateUser(userId, {
        firstName,
        lastName,
        email,
        phone,
      });
      toast.success('User updated successfully');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#1c4233]" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    // Only allow numeric characters and common phone separators (+, -, spaces, parentheses)
                    // Remove all non-numeric except + at the start
                    let value = e.target.value;
                    // If it starts with +, keep it, otherwise remove all non-numeric
                    if (value.startsWith('+')) {
                      const afterPlus = value.slice(1).replace(/\D/g, '');
                      value = '+' + afterPlus;
                    } else {
                      value = value.replace(/\D/g, '');
                    }
                    // Limit to 15 digits (international standard) or 9 digits if no country code
                    const maxLength = value.startsWith('+') ? 16 : 15; // + and up to 15 digits
                    const limitedValue = value.slice(0, maxLength);
                    setPhone(limitedValue);
                  }}
                  placeholder="Enter phone number (e.g., +9665XXXXXXXX or 5XXXXXXXX)"
                  maxLength={16}
                  inputMode="tel"
                  pattern="[+]?[0-9]*"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

