import React from "react";
import { Page, SkipToContent } from "@patternfly/react-core";

import { HeaderApp } from "../HeaderApp";
import { SidebarApp } from "../SidebarApp";
import { Notifications } from "@app/shared/components/Notifications";

export interface DefaultLayoutProps {}

export const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  const pageId = "main-content-page-layout-horizontal-nav";
  const PageSkipToContent = (
    <SkipToContent href={`#${pageId}`}>Skip to content</SkipToContent>
  );

  return (
    <Page
      header={<HeaderApp />}
      sidebar={<SidebarApp />}
      isManagedSidebar
      skipToContent={PageSkipToContent}
      mainContainerId={pageId}
    >
      {children}
      <Notifications />
    </Page>
  );
};