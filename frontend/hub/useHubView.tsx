import { HTTPError } from 'ky';
import { useCallback, useMemo, useRef } from 'react';
import useSWR from 'swr';
import {
  ISelected,
  ITableColumn,
  IToolbarFilter,
  IView,
  useSelected,
  useView,
} from '../../framework';
import { QueryParams, getQueryString, serverlessURL } from './api';
import { useFetcher } from '../common/crud/Data';

export interface HubItemsResponse<T extends object> {
  meta: {
    count: number;
  };
  data: T[];
  links: {
    next?: string;
  };
}

export type IHubView<T extends object> = IView &
  ISelected<T> & {
    itemCount: number | undefined;
    pageItems: T[] | undefined;
    refresh: () => Promise<HubItemsResponse<T> | undefined>;
    unselectItemsAndRefresh: (items: T[]) => void;
  };

export function useHubView<T extends object>({
  url,
  keyFn,
  toolbarFilters,
  tableColumns,
  disableQueryString,
  queryParams,
}: {
  url: string;
  keyFn: (item: T) => string | number;
  toolbarFilters?: IToolbarFilter[];
  tableColumns?: ITableColumn<T>[];
  disableQueryString?: boolean;
  queryParams?: QueryParams;
}): IHubView<T> {
  const view = useView(
    { sort: tableColumns && tableColumns.length ? tableColumns[0].sort : undefined },
    disableQueryString
  );
  const itemCountRef = useRef<{ itemCount: number | undefined }>({ itemCount: undefined });

  const { page, perPage, sort, sortDirection, filters } = view;

  let queryString = queryParams ? `?${getQueryString(queryParams)}` : '';

  if (filters) {
    for (const key in filters) {
      const toolbarFilter = toolbarFilters?.find((filter) => filter.key === key);
      if (toolbarFilter) {
        const values = filters[key];
        if (values.length > 0) {
          queryString ? (queryString += '&') : (queryString += '?');
          if (values.length > 1) {
            queryString += values.map((value) => `or__${toolbarFilter.query}=${value}`).join('&');
          } else {
            queryString += `${toolbarFilter.query}=${values.join(',')}`;
          }
        }
      }
    }
  }

  if (sort) {
    queryString ? (queryString += '&') : (queryString += '?');
    if (sortDirection === 'desc') {
      queryString += `sort=-${sort}`;
    } else {
      queryString += `sort=${sort}`;
    }
  }

  queryString ? (queryString += '&') : (queryString += '?');
  queryString += `offset=${(page - 1) * perPage}`;

  queryString ? (queryString += '&') : (queryString += '?');
  queryString += `limit=${perPage}`;

  url += queryString;
  const fetcher = useFetcher();
  const response = useSWR<HubItemsResponse<T>>(url, fetcher, {
    dedupingInterval: 0,
    refreshInterval: 30000,
  });
  const { data, mutate } = response;
  const refresh = useCallback(() => mutate(), [mutate]);

  const nextPage = serverlessURL(data?.links?.next);
  useSWR<HubItemsResponse<T>>(nextPage, fetcher, {
    dedupingInterval: 0,
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  let error: Error | undefined = response.error;
  if (error instanceof HTTPError) {
    if (error.response.status === 404 && view.page > 1) {
      view.setPage(1);
      error = undefined;
    }
  }

  const selection = useSelected(data?.data ?? [], keyFn);

  if (data?.meta.count !== undefined) {
    itemCountRef.current.itemCount = data?.meta.count;
  }

  const unselectItemsAndRefresh = useCallback(
    (items: T[]) => {
      selection.unselectItems(items);
      void refresh();
    },
    [refresh, selection]
  );

  return useMemo(() => {
    return {
      refresh,
      itemCount: itemCountRef.current.itemCount,
      pageItems: data?.data,
      error,
      ...view,
      ...selection,
      unselectItemsAndRefresh,
    };
  }, [data?.data, error, refresh, selection, unselectItemsAndRefresh, view]);
}

export async function getAwxError(err: unknown) {
  if (err instanceof HTTPError) {
    try {
      const response = (await err.response.json()) as { __all__?: string[] };
      if ('__all__' in response && Array.isArray(response.__all__)) {
        return JSON.stringify(response.__all__[0]);
      } else {
        return JSON.stringify(response);
      }
    } catch {
      return err.message;
    }
  } else if (err instanceof Error) {
    return err.message;
  } else {
    return 'unknown error';
  }
}
