'use client';

/**
 * Toast Component Usage Examples
 * 
 * This file demonstrates how to use the Toast notification system
 * throughout your application.
 */

import React from 'react';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui';

export const ToastExample: React.FC = () => {
  const toast = useToast();

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-6">Toast Examples</h2>

      {/* Success Toast */}
      <Button
        onClick={() => toast.success('Your changes have been saved successfully!')}
        variant="success"
      >
        Show Success Toast
      </Button>

      {/* Success with Title */}
      <Button
        onClick={() => toast.success('Your profile has been updated.', 'Success!')}
        variant="success"
      >
        Success with Title
      </Button>

      {/* Error Toast */}
      <Button
        onClick={() => toast.error('Failed to save changes. Please try again.')}
        variant="danger"
      >
        Show Error Toast
      </Button>

      {/* Error with Title */}
      <Button
        onClick={() => toast.error('Please check your internet connection.', 'Connection Error')}
        variant="danger"
      >
        Error with Title
      </Button>

      {/* Warning Toast */}
      <Button
        onClick={() => toast.warning('Your session will expire in 5 minutes.')}
        variant="warning"
      >
        Show Warning Toast
      </Button>

      {/* Info Toast */}
      <Button
        onClick={() => toast.info('New features are now available!')}
        variant="primary"
      >
        Show Info Toast
      </Button>

      {/* Custom Duration */}
      <Button
        onClick={() => toast.success('This will disappear in 10 seconds', 'Long Duration', 10000)}
        variant="success"
      >
        Long Duration (10s)
      </Button>

      {/* No Auto-dismiss */}
      <Button
        onClick={() => toast.info('This toast will stay until you close it', 'Persistent', 0)}
        variant="primary"
      >
        Persistent Toast
      </Button>

      {/* Multiple Toasts */}
      <Button
        onClick={() => {
          toast.success('First notification');
          setTimeout(() => toast.info('Second notification'), 500);
          setTimeout(() => toast.warning('Third notification'), 1000);
        }}
        variant="primary"
      >
        Show Multiple Toasts
      </Button>

      {/* Clear All */}
      <Button
        onClick={() => toast.clearAll()}
        variant="secondary"
      >
        Clear All Toasts
      </Button>

      {/* Advanced Usage with showToast */}
      <Button
        onClick={() => {
          toast.showToast({
            title: 'Custom Toast',
            message: 'This is a custom configured toast',
            variant: 'info',
            duration: 7000,
          });
        }}
        variant="primary"
      >
        Custom Configuration
      </Button>
    </div>
  );
};

/**
 * USAGE IN YOUR COMPONENTS:
 * 
 * 1. Import the hook:
 *    import { useToast } from '@/contexts/ToastContext';
 * 
 * 2. Use in your component:
 *    const toast = useToast();
 * 
 * 3. Show notifications:
 *    toast.success('Operation successful!');
 *    toast.error('Something went wrong');
 *    toast.warning('Please be careful');
 *    toast.info('Here is some information');
 * 
 * 4. With titles:
 *    toast.success('Your file has been uploaded', 'Upload Complete');
 * 
 * 5. Custom duration (in milliseconds):
 *    toast.success('Quick message', undefined, 2000); // 2 seconds
 * 
 * 6. Persistent (no auto-dismiss):
 *    toast.error('Critical error', 'Error', 0);
 * 
 * 7. Clear all toasts:
 *    toast.clearAll();
 * 
 * COMMON USE CASES:
 * 
 * - Form submission success/error
 * - API request feedback
 * - File upload status
 * - Authentication messages
 * - Validation errors
 * - System notifications
 * - User action confirmations
 */

/**
 * EXAMPLE: Form Submission
 */
export const FormExample = () => {
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Your form has been submitted successfully!', 'Success');
    } catch (error) {
      toast.error('Failed to submit form. Please try again.', 'Error');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button type="submit">Submit</Button>
    </form>
  );
};

/**
 * EXAMPLE: File Upload
 */
export const FileUploadExample = () => {
  const toast = useToast();

  const handleUpload = async (file: File) => {
    toast.info('Uploading file...', 'Upload Started');
    
    try {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`${file.name} has been uploaded successfully!`, 'Upload Complete');
    } catch (error) {
      toast.error('Failed to upload file. Please try again.', 'Upload Failed');
    }
  };

  return <div>{/* File upload UI */}</div>;
};

/**
 * EXAMPLE: Authentication
 */
export const AuthExample = () => {
  const toast = useToast();

  const handleLogin = async (email: string, password: string) => {
    try {
      // Simulate login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Welcome back!', 'Login Successful');
    } catch (error) {
      toast.error('Invalid email or password', 'Login Failed');
    }
  };

  const handleLogout = () => {
    toast.info('You have been logged out successfully', 'Logged Out');
  };

  return <div>{/* Auth UI */}</div>;
};
