import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable } from '../../../framework';
import { usePulpView } from '../usePulpView';
import { pulpAPI, pulpHrefKeyFn } from '../api';
import { useRemoteActions } from './hooks/useRemoteActions';
import { useRemoteColumns } from './hooks/useRemoteColumns';
import { useRemoteFilters } from './hooks/useRemoteFilters';
import { useRemoteToolbarActions } from './hooks/useRemoteToolbarActions';
import { useNavigate } from 'react-router-dom';
import { RouteObj } from '../../Routes';

export interface IRemotes {
  pulp_href: string;
  pulp_created: string;
  name: string;
  url: string;
  ca_cert: string;
  client_cert: string;
  client_key: string;
  tls_validation: boolean;
  proxy_url: string;
  pulp_labels: string[];
  pulp_last_updated: string;
  download_concurrency: number;
  max_retries: number;
  policy: 'immediate';
  total_timeout: number;
  connect_timeout: number;
  sock_connect_timeout: number;
  sock_read_timeout: number;
  headers?: string;
  rate_limit: number;
  hidden_fields: {
    name: string;
    is_set: boolean;
  }[];
  requirements_file: string;
  auth_url: string;
  signed_only: boolean;
  last_sync_task: string;
}
export function Remotes() {
  const { t } = useTranslation();
  const toolbarFilters = useRemoteFilters();
  const tableColumns = useRemoteColumns();
  const view = usePulpView<IRemotes>({
    url: pulpAPI`/remotes/`,
    keyFn: pulpHrefKeyFn,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useRemoteToolbarActions(view);
  const rowActions = useRemoteActions(view);

  const navigate = useNavigate();
  return (
    <PageLayout>
      <PageHeader title={t('Remotes')} description={t('Remotes')} />
      <PageTable<IRemotes>
        defaultSubtitle={t('Remote')}
        emptyStateButtonClick={() => navigate(RouteObj.CreateRemotes)}
        emptyStateButtonText={t('Create remote')}
        emptyStateTitle={t('No remotes yet')}
        errorStateTitle={t('Error loading remotes')}
        rowActions={rowActions}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        {...view}
      />
    </PageLayout>
  );
}
