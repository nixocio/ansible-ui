import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { EdaUser } from '../../../interfaces/EdaUser';
import { IEdaView } from '../../../useEventDrivenView';
import { useDeleteUsers } from './useDeleteUser';
import { ButtonVariant } from '@patternfly/react-core';

export function useUserActions(view: IEdaView<EdaUser>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteUsers = useDeleteUsers(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaUser>[]>(
    () => [
      {
        type: PageActionType.Button,
        variant: ButtonVariant.primary,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        label: t('Edit user'),
        isPinned: true,
        onClick: (User: EdaUser) =>
          navigate(RouteObj.EditEdaUser.replace(':id', User.id.toString())),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete user'),
        onClick: (User: EdaUser) => deleteUsers([User]),
        isDanger: true,
      },
    ],
    [deleteUsers, navigate, t]
  );
}
