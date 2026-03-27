'use client';

import { useEffect } from 'react';

import { useAdminToast } from './admin-toast';

export function AdminLoginFeedback({
  message,
  error,
}: {
  message?: string;
  error?: string;
}) {
  const { pushToast } = useAdminToast();

  useEffect(() => {
    if (message) {
      pushToast({ variant: 'success', message });
    }
  }, [message, pushToast]);

  useEffect(() => {
    if (error) {
      pushToast({ variant: 'error', message: error });
    }
  }, [error, pushToast]);

  return null;
}
