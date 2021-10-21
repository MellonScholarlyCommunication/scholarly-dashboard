import React from "react";
import { LoginRequestWrapper } from "../components/error";
import { EventListingComponent } from "../components/eventLog";

export default function Home() {
  return (
    <div>
      <LoginRequestWrapper
        component={<EventListingComponent />}
        view="Notifications"
      />
    </div>
  );
}
