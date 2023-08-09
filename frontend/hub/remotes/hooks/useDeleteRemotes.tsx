import { useTranslation } from 'react-i18next';
import { useRemoteColumns } from './useRemoteColumns';
import { compareStrings, useBulkConfirmation } from '../../../../framework';
import { IRemotes } from '../Remotes';
import { requestDelete } from '../../../common/crud/Data';
import { nameKeyFn, parsePulpIDFromURL, pulpAPI, waitForHubTask } from '../../api';

export interface ITask {
  task: string;
}

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
        requestDelete<ITask>(
          pulpAPI`/remotes/ansible/collection/${parsePulpIDFromURL(remote.pulp_href) || ''}/`
        ).then(async (response) => {
          await waitForHubTask(parsePulpIDFromURL(response?.task));
        }),
      //   http://localhost:8002/api/automation-hub/pulp/api/v3/remotes/ansible/collection/ebffbbac-68b4-4c5c-8b0c-c6ee8a0d9d71/
    });
  };

  return deleteRemotes;
}
