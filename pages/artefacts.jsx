/* eslint-disable react/jsx-wrap-multilines */
import { Container } from "@material-ui/core";
import React from "react";
import { ArtefactListingComponent } from "../components/artefacts";
import { LoginRequestWrapper } from "../components/error";

export default function Home() {
  return (
    <div>
      <LoginRequestWrapper
        component={
          <Container>
            <ArtefactListingComponent />
          </Container>
        }
        view="Notifications"
      />
    </div>
  );
}
