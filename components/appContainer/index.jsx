/* eslint-disable react/jsx-props-no-spreading */
/**
 * Copyright 2021 Inrupt Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
 * Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Set up common Inrupt styling via Prism
import CssBaseline from "@material-ui/core/CssBaseline";

import { create } from "jss";
import preset from "jss-preset-default";

import { appLayout, useBem } from "@solid/lit-prism-patterns";

import {
  createStyles,
  makeStyles,
  StylesProvider,
  ThemeProvider,
} from "@inrupt/prism-react-components";

import {
  handleIncomingRedirect,
  onSessionRestore,
} from "@inrupt/solid-client-authn-browser";

import { useEffect } from "react";

import { useRouter } from "next/router";

import { SessionProvider, useSession } from "@inrupt/solid-ui-react";

import Header from "../header";
import Nav from "../nav";
import Footer from "../footer";

import theme from "../../src/theme";
import MyDrawer from "./drawer";

const jss = create(preset());
const useStyles = makeStyles(() => createStyles(appLayout.styles(theme)));

/* eslint react/prop-types: 0 */
function AppContainer(props) {
  const bem = useBem(useStyles());

  const { session } = useSession();

  // Fix for solid fetch not invocating on window
  useEffect(() => {
    const authFetch = session.fetch;
    const browserFetch = window.fetch.bind(window);
    const customFetch = (...args) => {
      const { webId } = session.info;
      if (webId) return authFetch(...args);
      return browserFetch(...args);
    };
    session.fetch = customFetch;
  }, [session]);

  const router = useRouter();

  // 1. Register the callback to restore the user's page after refresh and
  //    redirection from the Solid Identity Provider.
  onSessionRestore((url) => {
    router.push(url);
  });

  useEffect(() => {
    // 2. When loading the component, call `handleIncomingRedirect` to authenticate
    //    the user if appropriate, or to restore a previous session.
    handleIncomingRedirect({
      restorePreviousSession: true,
    }).then((info) => {
      // eslint-disable-next-line no-console
      console.log(`Logged in with WebID [${info && info.webId}]`);
    });
  }, []);

  return (
    <SessionProvider restorePreviousSession session={session}>
      <StylesProvider jss={jss}>
        <ThemeProvider theme={theme}>
          <CssBaseline />

          <div className={bem("app-layout")}>
            <Header />
            <Nav />

            <main
              className={bem("app-layout__main")}
              style={{ padding: "15px" }}
            >
              <MyDrawer {...props} />
            </main>

            <Footer />

            <div className={bem("app-layout__mobile-nav-push")} />
          </div>
        </ThemeProvider>
      </StylesProvider>
    </SessionProvider>
  );
}

export default AppContainer;
