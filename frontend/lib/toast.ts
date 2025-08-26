import { toast, ToastOptions } from 'react-toastify';

const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  style: {
    fontFamily: 'inherit',
    fontSize: '14px',
  },
};

export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    toast.success(` ${message}`, { ...defaultOptions, ...options });
  },
  
  error: (message: string, options?: ToastOptions) => {
    toast.error(` ${message}`, { ...defaultOptions, ...options });
  },
  
  info: (message: string, options?: ToastOptions) => {
    toast.info(` ${message}`, { ...defaultOptions, ...options });
  },
  
  warning: (message: string, options?: ToastOptions) => {
    toast.warning(`${message}`, { ...defaultOptions, ...options });
  },
  
  loading: (message: string, options?: ToastOptions) => {
    return toast.loading(`${message}`, { ...defaultOptions, ...options });
  },
  
  update: (toastId: string | number, message: string, type: 'success' | 'error' | 'info', options?: ToastOptions) => {
    toast.update(toastId, {
      render: `${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'} ${message}`,
      type: type,
      isLoading: false,
      ...defaultOptions,
      ...options
    });
  }
};
