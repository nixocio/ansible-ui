import { extend } from 'cypress/types/lodash';
import { AutomationServerType } from '../automation-servers/AutomationServer';
import { activeAutomationServer } from '../automation-servers/AutomationServersProvider';
import { requestCommon, requestDelete } from '../common/crud/Data';

function apiTag(strings: TemplateStringsArray, ...values: string[]) {
  if (strings[0]?.[0] !== '/') {
    throw new Error('Invalid URL');
  }

  let url = '';
  strings.forEach((fragment, index) => {
    url += fragment;
    if (index !== strings.length - 1) {
      url += encodeURIComponent(`${values.shift() ?? ''}`);
    }
  });

  return url;
}

export function hubAPI(strings: TemplateStringsArray, ...values: string[]) {
  let base = process.env.HUB_API_BASE_PATH;
  if (!base) {
    if (activeAutomationServer?.type === AutomationServerType.Galaxy) {
      base = '/api/galaxy';
    } else {
      base = '/api/automation-hub';
    }
  }
  return base + apiTag(strings, ...values);
}

export function pulpAPI(strings: TemplateStringsArray, ...values: string[]) {
  let base = process.env.HUB_API_BASE_PATH;
  if (!base) {
    if (activeAutomationServer?.type === AutomationServerType.Galaxy) {
      base = '/api/galaxy';
    } else {
      base = '/api/automation-hub';
    }
  }
  return base + '/pulp/api/v3' + apiTag(strings, ...values);
}

export type QueryParams = {
  [key: string]: string;
};

export function getQueryString(queryParams: QueryParams) {
  return Object.entries(queryParams)
    .map(([key, value = '']) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

const UUIDRegEx = /\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/i;

export function parsePulpIDFromURL(url: string): string | null {
  for (const section of url.split('/')) {
    if (section.match(UUIDRegEx)) {
      return section;
    }
  }

  return null;
}

// pulp next links currently include full url - with the wrong server
// "http://localhost:5001/api/page/next?what#ever" -> "/api/page/next?what#ever"
// also has to handle hub links (starting with /api/) and undefined
export function serverlessURL(url?: string) {
  if (!url || url.startsWith('/')) {
    return url;
  }

  const { pathname, search, hash } = new URL(url);
  return `${pathname}${search}${hash}`;
}

export function pulpIdKeyFn(item: { pulp_id: string }) {
  return item.pulp_id;
}

export function pulpHrefKeyFn(item: { pulp_href: string }) {
  return item.pulp_href;
}

export function nameKeyFn(item: { name: string }) {
  return item.name;
}

export function idKeyFn(item: { id: number | string }) {
  return item.id;
}

export function collectionKeyFn(item: {
  collection_version: { pulp_href: string };
  repository: { name: string };
}) {
  return item.collection_version.pulp_href + '_' + item.repository.name;
}

export function appendTrailingSlash(url: string) {
  return url.endsWith('/') ? url : url + '/';
}
interface ResponseBody {
  status: number;
  task: string;
}

export async function requestDeleteHUBItem<T extends ResponseBody>(
  url: string,
  signal?: AbortSignal
) {
  try {
    const response = await requestDelete<T>(url, signal);
    if (response.status === 202) {
      // call for wait for task
    }
  } catch (error) {
    console.log(error);
  }
}

export async function requestDeletePulpItem<T extends ResponseBody>(
  url: string,
  signal?: AbortSignal
) {
  try {
    const response = await requestDelete<T>(url, signal);
    if (response.status === 202) {
      // call for wait for task
    }
  } catch (error) {
    console.log(error);
  }
}