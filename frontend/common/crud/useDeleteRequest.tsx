import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RouteObj } from '../../Routes';
import { AnsibleError } from './ansible-error';
import { getCookie } from './cookie';
import { Delay } from './delay';

export function useDeleteRequest() {
  const navigate = useNavigate();

  const abortSignalRef = useRef<{ signal?: AbortSignal }>({});
  useEffect(() => {
    const abortController = new AbortController();
    abortSignalRef.current.signal = abortController.signal;
    return () => abortController.abort();
  }, []);

  return async (url: string) => {
    await Delay();
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'X-CSRFToken': getCookie('csrftoken') ?? '' },
        signal: abortSignalRef.current.signal,
      });
    } catch (error) {
      if (error.name === 'AbortError') {
        return;
      }
    }

    if (!response.ok) {
      if (response.status === 401) {
        navigate(RouteObj.Login + '?navigate-back=true');
      }

      let responseBody: string | undefined;
      try {
        responseBody = await response.text();
      } catch {
        // Do nothing - response body was not valid json
      }

      throw new AnsibleError(response.statusText, response.status, responseBody);
    }

    return response.json();
  };
}
