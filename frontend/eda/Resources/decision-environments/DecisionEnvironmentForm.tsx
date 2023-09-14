import { Trans, useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import {
  PageForm,
  PageFormSelect,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
} from '../../../../framework';
import { RouteObj } from '../../../common/Routes';
import { useGet } from '../../../common/crud/useGet';
import { usePatchRequest } from '../../../common/crud/usePatchRequest';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { EdaRoute } from '../../EdaRoutes';
import { EDA_API_PREFIX } from '../../constants';
import { EdaCredential } from '../../interfaces/EdaCredential';
import {
  EdaDecisionEnvironment,
  EdaDecisionEnvironmentRead,
} from '../../interfaces/EdaDecisionEnvironment';
import { EdaResult } from '../../interfaces/EdaResult';

function DecisionEnvironmentInputs() {
  const { t } = useTranslation();
  const { data: credentials } = useGet<EdaResult<EdaCredential>>(`${EDA_API_PREFIX}/credentials/`);
  const imageHelpBlock = (
    <>
      <p>
        {t(
          'The full image location, including the container registry, image name, and version tag.'
        )}
      </p>
      <br />
      <p>{t('Examples:')}</p>
      <Trans>
        <code>quay.io/ansible/awx-latest repo/project/image-name:tag</code>
      </Trans>
    </>
  );
  return (
    <>
      <PageFormTextInput<EdaDecisionEnvironment>
        name="name"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
        maxLength={150}
        autoComplete="new-name"
      />
      <PageFormTextInput<EdaDecisionEnvironment>
        name="description"
        label={t('Description')}
        placeholder={t('Enter description')}
        maxLength={150}
      />
      <PageFormTextInput<EdaDecisionEnvironment>
        name="image_url"
        label={t('Image')}
        placeholder={t('Enter image name')}
        maxLength={150}
        isRequired
        labelHelp={imageHelpBlock}
        labelHelpTitle={t('Image')}
      />
      <PageFormSelect
        name={'credential_id'}
        label={t('Credential')}
        placeholderText={t('Select credential')}
        options={
          credentials?.results
            ? credentials.results.map((item: { name: string; id: number }) => ({
                label: item.name,
                value: item.id,
              }))
            : []
        }
        footer={<Link to={RouteObj.CreateEdaCredential}>Create credential</Link>}
        labelHelp={t('The token needed to utilize the Decision environment image.')}
        labelHelpTitle={t('Credential')}
      />
    </>
  );
}

export function CreateDecisionEnvironment() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cache } = useSWRConfig();
  const postRequest = usePostRequest<Partial<EdaDecisionEnvironment>, EdaDecisionEnvironment>();

  const onSubmit: PageFormSubmitHandler<EdaDecisionEnvironment> = async (decisionEnvironment) => {
    const newDecisionEnvironment = await postRequest(
      `${EDA_API_PREFIX}/decision-environments/`,
      decisionEnvironment
    );
    (cache as unknown as { clear: () => void }).clear?.();
    navigate(
      RouteObj.EdaDecisionEnvironmentDetails.replace(':id', newDecisionEnvironment.id.toString())
    );
  };
  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();
  return (
    <PageLayout>
      <PageHeader
        title={t('Create Decision Environment')}
        breadcrumbs={[
          { label: t('Decision Environments'), to: getPageUrl(EdaRoute.DecisionEnvironments) },
          { label: t('Create Decision Environment') },
        ]}
      />
      <PageForm
        submitText={t('Create decision environment')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
      >
        <DecisionEnvironmentInputs />
      </PageForm>
    </PageLayout>
  );
}

export function EditDecisionEnvironment() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: decisionEnvironment } = useGet<EdaDecisionEnvironmentRead>(
    `${EDA_API_PREFIX}/decision-environments/${id.toString()}/`
  );
  const { cache } = useSWRConfig();
  const patchRequest = usePatchRequest<Partial<EdaDecisionEnvironment>, EdaDecisionEnvironment>();

  const onSubmit: PageFormSubmitHandler<EdaDecisionEnvironment> = async (decisionEnvironment) => {
    await patchRequest(`${EDA_API_PREFIX}/decision-environments/${id}/`, decisionEnvironment);
    (cache as unknown as { clear: () => void }).clear?.();
    navigate(-1);
  };
  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();

  if (!decisionEnvironment) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Decision Environments'), to: getPageUrl(EdaRoute.DecisionEnvironments) },
            { label: t('Edit Decision Environment') },
          ]}
        />
      </PageLayout>
    );
  } else {
    return (
      <PageLayout>
        <PageHeader
          title={`${t('Edit')} ${decisionEnvironment?.name || t('Decision Environment')}`}
          breadcrumbs={[
            { label: t('Decision Environments'), to: getPageUrl(EdaRoute.DecisionEnvironments) },
            { label: `${t('Edit')} ${decisionEnvironment?.name || t('Decision Environment')}` },
          ]}
        />
        <PageForm
          submitText={t('Save decision environment')}
          onSubmit={onSubmit}
          cancelText={t('Cancel')}
          onCancel={onCancel}
          defaultValue={{
            ...decisionEnvironment,
            credential_id: decisionEnvironment?.credential?.id || undefined,
          }}
        >
          <DecisionEnvironmentInputs />
        </PageForm>
      </PageLayout>
    );
  }
}
