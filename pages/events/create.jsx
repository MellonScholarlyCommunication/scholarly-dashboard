import React from "react";
import { LoginRequestWrapper } from "../../components/error";
import { CreateEventView } from "../../components/notification";

export default function Home() {
  return (
    <div>
      <LoginRequestWrapper
        component={<CreateEventView />}
        view="Create Notification"
      />
    </div>
  );
}
