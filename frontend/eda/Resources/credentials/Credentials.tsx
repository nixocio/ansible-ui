import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { RouteObj } from '../../../common/Routes';
import { EDA_API_PREFIX } from '../../constants';
import { EdaCredential } from '../../interfaces/EdaCredential';
import { useEdaView } from '../../useEventDrivenView';
import { useCredentialActions } from './hooks/useCredentialActions';
import { useCredentialColumns } from './hooks/useCredentialColumns';
import { useCredentialFilters } from './hooks/useCredentialFilters';
import { useCredentialsActions } from './hooks/useCredentialsActions';

export function Credentials() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toolbarFilters = useCredentialFilters();
  const tableColumns = useCredentialColumns();
  const view = useEdaView<EdaCredential>({
    url: `${EDA_API_PREFIX}/credentials/`,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useCredentialsActions(view);
  const rowActions = useCredentialActions(view);
  return (
    <PageLayout>
      <PageHeader
        title={t('Credentials')}
        description={t(
          'Credentials are utilized by EDA for authentication when launching rulebooks.'
        )}
      />
      <PageTable
        id="eda-credentials-table"
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        rowActions={rowActions}
        errorStateTitle={t('Error loading credentials')}
        emptyStateTitle={t('There are currently no credentials created for your organization.')}
        emptyStateDescription={t('Please create a credential by using the button below.')}
        emptyStateButtonText={t('Create credential')}
        emptyStateButtonClick={() => navigate(RouteObj.CreateEdaCredential)}
        {...view}
        defaultSubtitle={t('Credential')}
      />
    </PageLayout>
  );
}
