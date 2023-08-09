import { useTranslation } from 'react-i18next';
import { useRemoteColumns } from './useRemoteColumns';
import { compareStrings, useBulkConfirmation } from '../../../../framework';
import { IRemotes } from '../Remotes';
import { nameKeyFn, parsePulpIDFromURL, pulpAPI, requestDeleteHubItem } from '../../api/utils';

export function useDeleteRemotes(onComplete: (remotes: IRemotes[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useRemoteColumns();
  const bulkAction = useBulkConfirmation<IRemotes>();

  const deleteRemotes = (remotes: IRemotes[]) => {
    bulkAction({
      title: t('Permanently delete remotes', { count: remotes.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} remotes.', {
        count: remotes.length,
      }),
      actionButtonText: t('Delete remotes', { count: remotes.length }),
      items: remotes.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: nameKeyFn,
      isDanger: true,
      confirmationColumns,
      actionColumns: confirmationColumns,
      onComplete,
      alertPrompts: [t('This will also delete all associated resources under this remote.')],
      actionFn: (remote: IRemotes) =>
        requestDeleteHubItem(
          pulpAPI`/remotes/ansible/collection/${parsePulpIDFromURL(remote.pulp_href) || ''}/`
        ),
    });
  };
  return deleteRemotes;
}
