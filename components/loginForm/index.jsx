import { useState, useEffect } from "react";
import { login } from "@inrupt/solid-client-authn-browser";
import {
  LinkButton,
  Input,
  makeStyles,
  createStyles,
} from "@inrupt/prism-react-components";
import { useBem } from "@solid/lit-prism-patterns";
import { Button } from "@material-ui/core";
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

  async function handleLogin() {
    const clientName = CONFIG.demoTitle;
    const oidcIssuer = idp;
    const redirectUrl = currentUrl;
    await login({
      oidcIssuer,
      redirectUrl,
      clientName,
    });
  }

  return (
    <div className={classes.loginFormContainer}>
      <Input
        id="idp"
        label="IDP"
        placeholder="Identity Provider"
        defaultValue={idp}
        onChange={(e) => setIdp(e.target.value)}
      />
      <Button onClick={handleLogin}>
        <LinkButton
          variant="small"
          className={bem("user-menu__list-item-trigger")}
        >
          Log In
        </LinkButton>
      </Button>
    </div>
  );
}
