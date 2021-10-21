import React from "react";
import { ArtefactListingComponent } from "../components/artefacts";
import { LoginRequestWrapper } from "../components/error";

export default function Home() {
  return (
    <div>
      <LoginRequestWrapper
        component={<ArtefactListingComponent />}
        view="Notifications"
      />
    </div>
  );
}
