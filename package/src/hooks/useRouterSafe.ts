import { useCallback, useEffect, useState } from 'react';

// Safe hook that works with or without react-router-dom
export const useRouterSafe = () => {
  const [isRouterAvailable, setIsRouterAvailable] = useState(false);
  const [navigate, setNavigate] = useState<((path: string, options?: any) => void) | null>(null);
  const [params, setParams] = useState<Record<string, string>>({});

  useEffect(() => {
    // Try to dynamically import react-router-dom
    import('react-router-dom')
      .then(({ useNavigate, useParams }) => {
        try {
          // This will work if we're in a React component tree with Router
          const nav = useNavigate();
          const par = useParams();

          setNavigate(() => nav);
          setParams(par as Record<string, string>);
          setIsRouterAvailable(true);
        } catch (error) {
          // useNavigate/useParams hooks failed (not in Router context)
          setIsRouterAvailable(false);
        }
      })
      .catch(() => {
        // react-router-dom not installed
        setIsRouterAvailable(false);
      });
  }, []);

  const safeNavigate = useCallback((path: string, options?: any) => {
    if (navigate) {
      navigate(path, options);
    } else {
      // Fallback: use browser history API
      if (options?.replace) {
        window.history.replaceState(null, '', path);
      } else {
        window.history.pushState(null, '', path);
      }
    }
  }, [navigate]);

  return {
    isRouterAvailable,
    navigate: safeNavigate,
    params,
  };
};