import { useNavigate } from 'react-router-dom';

// Create a simple hook to get navigate, then export it
let navigateFn: ReturnType<typeof useNavigate> | null = null;

export const setNavigate = (navigate: ReturnType<typeof useNavigate>) => {
  navigateFn = navigate;
};

export const navigate = (to: string, options?: { replace?: boolean }) => {
  if (navigateFn) {
    navigateFn(to, options);
  } else {
    console.warn('navigate not initialized yet');
  }
};