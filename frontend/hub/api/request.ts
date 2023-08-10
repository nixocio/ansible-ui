import { AnsibleError } from '../../common/crud/ansible-error';
import { getCookie } from '../../common/crud/cookie';
import { Delay } from '../../common/crud/delay';

interface Options {
  method: string;
  headers?: HeadersInit;
  body?: BodyInit;
  signal?: AbortSignal;
}

interface Response<T> {
  statusCode: number;
  response: T;
}

export async function request<T>(url: string, options: Options): Promise<Response<T>> {
  await Delay();

  const defaulHeaders = {
    'X-CSRFToken': getCookie('csrftoken') || '',
  };
  const receivedResponse = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      ...defaulHeaders,
      ...options.headers,
    },
  });

  if (!receivedResponse.ok) {
    throw new AnsibleError(
      receivedResponse.statusText,
      receivedResponse.status,
      await receivedResponse.text()
    );
  }

  return {
    response: (await receivedResponse.json()) as T,
    statusCode: receivedResponse.status,
  };
}

export async function postRequest<T>(url: string, data: T, signal?: AbortSignal) {
  const options: Options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    signal,
  };
  return request<T>(url, options);
}

export async function patchRequest<T>(url: string, data: T, signal?: AbortSignal) {
  const options: Options = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    signal,
  };
  return request<T>(url, options);
}

export async function deleteRequest<T>(url: string, signal?: AbortSignal) {
  const options: Options = {
    method: 'DELETE',
    signal,
  };
  return request<T>(url, options);
}

export async function getRequest<T>(url: string, signal?: AbortSignal) {
  const options: Options = {
    method: 'GET',
    signal,
  };
  return request<T>(url, options);
}
