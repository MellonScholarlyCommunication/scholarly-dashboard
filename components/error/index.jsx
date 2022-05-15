import React from "react";
import { useSession } from "@inrupt/solid-ui-react";

export default function ErrorComponent(props) {
  const { message, uri } = props;
  return (
    <div>
      <small>
        <label style={{ color: "red" }}>
          {`The requested resource ${
            uri && `at ${uri}`
          } could not be retrieved: ${message || "Unknown error"}`}
        </label>
      </small>
    </div>
  );
}

export function ErrorCard(props) {
  const { message, uri } = props;
  return (
    <div>
      <b>uri: {uri}</b>
      <br />
      <small>
        <label style={{ color: "red" }}>
          {`The requested resource ${
            uri && `at ${uri}`
          } could not be retrieved: ${message || "Unknown error"}`}
        </label>
      </small>
    </div>
  );
}

export function LoginRequestWrapper(props) {
  const { session } = useSession();
  const { isLoggedIn } = session.info;
  const { component, view } = props;

  return isLoggedIn ? (
    component
  ) : (
    <div>
      <label>
        {`${
          view
            ? `The ${view} view is only available`
            : "This action is only possible"
        } when logged in with Solid. Please login at the top right of the screen.`}
      </label>
    </div>
  );
}
