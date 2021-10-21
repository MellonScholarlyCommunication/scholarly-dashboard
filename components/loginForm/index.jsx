import { useState, useEffect } from "react";
import { LoginButton } from "@inrupt/solid-ui-react";
import {
  LinkButton,
  Input,
  makeStyles,
  createStyles,
} from "@inrupt/prism-react-components";
import { useBem } from "@solid/lit-prism-patterns";
import styles from "./styles";
import config from "../../config";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));
const CONFIG = config();

export default function LoginForm() {
  // const [idp, setIdp] = useState("https://broker.pod.inrupt.com");
  const [idp, setIdp] = useState("https://broker.pod.inrupt.com");
  const [currentUrl, setCurrentUrl] = useState("https://localhost:3000");
  const bem = useBem(useStyles());
  const classes = useStyles();

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, [setCurrentUrl]);

  return (
    <div className={classes.loginFormContainer}>
      <Input
        id="idp"
        label="IDP"
        placeholder="Identity Provider"
        defaultValue={idp}
        onChange={(e) => setIdp(e.target.value)}
      />
      <LoginButton
        authOptions={{ clientName: CONFIG.demoTitle }}
        oidcIssuer={idp}
        redirectUrl={currentUrl}
        onError={console.error}
      >
        <LinkButton
          variant="small"
          className={bem("user-menu__list-item-trigger")}
        >
          Log In
        </LinkButton>
      </LoginButton>
    </div>
  );
}
