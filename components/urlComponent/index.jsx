import { useState } from "react";
import { TextField, Button, Grid } from "@material-ui/core";

import { useRouter } from "next/router";

import { makeStyles, createStyles } from "@inrupt/prism-react-components";
import styles from "./styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

/**
 * Component to set and display the URI of the currently selected item
 * @param { uri: string, updateTarget: Function } props
 * @returns
 */
function URLComponent(props) {
  const { uri } = props;
  const router = useRouter();
  const classes = useStyles();
  const [value, setValue] = useState(uri || "");
  const PLACEHOLDER = "Artefact or Profile URI";

  function submitURI() {
    router.push({
      pathname: "/",
      query: { uri: value },
      shallow: true,
    });
  }

  function handleKeyDown(e) {
    if (e.keyCode === 13) submitURI();
  }

  return (
    <div className={classes.urlBar}>
      <Grid container spacing={1}>
        <Grid item sm={10} xs={12}>
          <TextField
            className={classes.urlField}
            id="outlined-basic"
            variant="outlined"
            label={PLACEHOLDER}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </Grid>
        <Grid item sm={2} xs={12}>
          <Button
            className={classes.confirmButton}
            variant="outlined"
            onClick={submitURI}
          >
            Search
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}

export default URLComponent;
