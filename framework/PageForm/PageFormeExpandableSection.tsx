import React from 'react';
import { ExpandableSection } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

interface IPageFormExpandableSectionProps {
  children: React.ReactNode;
}
export function PageFormExpandableSection(props: IPageFormExpandableSectionProps) {
  const { children } = props;
  const { t } = useTranslation();

  return (
    <ExpandableSection
      toggleTextExpanded={t`Hide advanced options`}
      toggleTextCollapsed={t`Show advanced options`}
    >
      {children}
    </ExpandableSection>
  );
}
