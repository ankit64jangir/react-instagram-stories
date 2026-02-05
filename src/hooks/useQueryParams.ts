import { useState, useCallback, useEffect } from 'react';

interface QueryParams {
  get: (key: string) => string | null;
  toString: () => string;
}

type SetQueryParams = (
  params: Record<string, string> | ((prev: URLSearchParams) => Record<string, string>),
  options?: { replace?: boolean }
) => void;

/**
 * Custom hook to manage URL query parameters without react-router-dom
 * @returns [queryParams, setQueryParams] - Similar to useSearchParams from react-router-dom
 */
export function useQueryParams(): [QueryParams, SetQueryParams] {
  const [searchParams, setSearchParamsState] = useState<URLSearchParams>(
    () => new URLSearchParams(window.location.search)
  );

  // Listen for popstate events (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setSearchParamsState(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setQueryParams: SetQueryParams = useCallback((params, options = {}) => {
    const newParams = typeof params === 'function'
      ? params(new URLSearchParams(window.location.search))
      : params;

    const searchString = new URLSearchParams(newParams).toString();
    const newUrl = searchString
      ? `${window.location.pathname}?${searchString}`
      : window.location.pathname;

    if (options.replace) {
      window.history.replaceState({}, '', newUrl);
    } else {
      window.history.pushState({}, '', newUrl);
    }

    setSearchParamsState(new URLSearchParams(searchString));
  }, []);

  return [searchParams, setQueryParams];
}

/**
 * Navigate to a URL with query params
 */
export function navigateWithParams(params: Record<string, string>, options?: { replace?: boolean }) {
  const searchString = new URLSearchParams(params).toString();
  const newUrl = searchString
    ? `${window.location.pathname}?${searchString}`
    : window.location.pathname;

  if (options?.replace) {
    window.history.replaceState({}, '', newUrl);
  } else {
    window.history.pushState({}, '', newUrl);
  }

  // Dispatch a custom event so components can react
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/**
 * Clear all query params
 */
export function clearQueryParams(options?: { replace?: boolean }) {
  const newUrl = window.location.pathname;

  if (options?.replace) {
    window.history.replaceState({}, '', newUrl);
  } else {
    window.history.pushState({}, '', newUrl);
  }

  window.dispatchEvent(new PopStateEvent('popstate'));
}
