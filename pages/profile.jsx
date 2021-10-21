import React from "react";
import { LoginRequestWrapper } from "../components/error";
import { ProfileCard } from "../components/profile";

export default function Home() {
  return (
    <div>
      <LoginRequestWrapper
        component={<ProfileCard editable />}
        view="Profile"
      />
    </div>
  );
}
