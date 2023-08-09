import { request } from 'http';
import { AutomationServerType } from '../automation-servers/AutomationServer';
import { activeAutomationServer } from '../automation-servers/AutomationServersProvider';
import { stringIsUUID } from '../awx/common/util/strings';
import { requestDelete, requestGet } from '../common/crud/Data';
import { useGet } from '../common/crud/useGet';
import { Task } from './tasks/Task';

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

export async function waitForHubTask(taskHref: string | null, signal?: AbortSignal, retries = 10) {
  const failingStatus = ['skipped', 'failed', 'canceled'];
  const successStatus = ['completed'];

  if (taskHref === null || !stringIsUUID(taskHref)) {
    throw new Error('Invalid task href');
  }

  let task: Task | null = null;
  try {
    task = await requestGet<Task>(pulpAPI`/tasks/${taskHref}`, signal);
    while (
      !successStatus.includes(task.state) &&
      !failingStatus.includes(task.state) &&
      retries > 0
    ) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      task = await requestGet<Task>(pulpAPI`/tasks/${taskHref}`, signal);
      retries--;
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(t(`Error waiting for task: ${error.message}`));
    }
    throw new Error(t(`Error waiting for task`));
  }

  if (task && task.state === 'failed') {
    throw new Error(`Task failed ${task?.error?.description ?? ''}}`);
  }
  return task;
}

interface Options {
  bailAfter?: number;
  multiplier?: number;
  waitMs?: number;
}

// export function waitForTask(task: Task, options: Options = {}) {
//   // default to starting with a 2s wait, increasing the wait time 1.5x each time, with max 10 attempts
//   // 2000, 1.5, 10 = ~226s ; 500, 1.5, 10 = ~57s
//   const { waitMs = 2000, multiplier = 1.5, bailAfter = 10 } = options;

//   return useGet<Task>(pulpAPI`/tasks/${task.pulp_href}`).then((result) => {
//     const failing = ['skipped', 'failed', 'canceled'];

//     if (failing.includes(result.data.state)) {
//       return Promise.reject(
//         result.data.error?.description ?? t`Task failed without error message.`
//       );
//     }

//     if (result.data.state !== 'completed') {
//       if (!bailAfter) {
//         return Promise.reject(new Error(t`Giving up waiting for task after 10 attempts.`));
//       }

//       return new Promise((r) => setTimeout(r, waitMs)).then(() =>
//         waitForTask(task, {
//           ...options,
//           waitMs: Math.round(waitMs * multiplier),
//           bailAfter: bailAfter - 1,
//         })
//       );
//     }
//   });
// }
