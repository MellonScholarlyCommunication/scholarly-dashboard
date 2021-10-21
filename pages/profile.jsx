/* eslint-disable react/jsx-wrap-multilines */
import { Container } from "@material-ui/core";
import React from "react";
import { LoginRequestWrapper } from "../components/error";
import { ProfileCard } from "../components/profile";

export default function Home() {
  return (
    <div>
      <LoginRequestWrapper
        component={
          <Container>
            <ProfileCard editable />
          </Container>
        }
        view="Profile"
      />
    </div>
  );
}
