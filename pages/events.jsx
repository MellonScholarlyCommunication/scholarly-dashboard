/* eslint-disable react/jsx-wrap-multilines */
import { Container } from "@material-ui/core";
import React from "react";
import { LoginRequestWrapper } from "../components/error";
import { EventListingComponent } from "../components/eventLog";

export default function Home() {
  return (
    <div>
      <LoginRequestWrapper
        component={
          <Container>
            <EventListingComponent />
          </Container>
        }
        view="Notifications"
      />
    </div>
  );
}
