/* eslint-disable no-param-reassign */
/* eslint-disable no-bitwise */
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

import { useState } from "react";
import {
  createStyles,
  makeStyles,
  LinkButton,
  Label,
} from "@inrupt/prism-react-components";
import { useBem } from "@solid/lit-prism-patterns";
import Link from "next/link";

import { useSession, LogoutButton } from "@inrupt/solid-ui-react";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import styles from "./styles";
import LoginForm from "../loginForm";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export const TESTCAFE_ID_HEADER_LOGO = "header-banner-logo";

const stringToColour = function (str) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let colour = "#";
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    colour += `00${value.toString(16)}`.substr(-2);
  }
  return colour;
};

function invertColor(hex) {
  if (hex.indexOf("#") === 0) {
    hex = hex.slice(1);
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
    throw new Error("Invalid HEX color.");
  }
  // invert color components
  const r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16);
  const g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16);
  const b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
  // pad each with zeros and return
  return `#${padZero(r)}${padZero(g)}${padZero(b)}`;
}

function padZero(str, len) {
  len = len || 2;
  const zeros = new Array(len).join("0");
  return (zeros + str).slice(-len);
}

export default function Header() {
  const { session, sessionRequestInProgress } = useSession();
  const { webId } = session.info;

  const bem = useBem(useStyles());
  const classes = useStyles();

  const colorHex = webId ? stringToColour(webId) : "#FFFFFF";
  const textColorHex = invertColor(colorHex);

  const [open, setOpen] = useState(false);

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
    navigator.clipboard.writeText(webId);
  };

  return (
    <header
      className={bem("header-banner")}
      style={{ position: "fixed", width: "100vw", backgroundColor: colorHex }}
    >
      <div className={classes.logoContainer}>
        {webId && (
          <ClickAwayListener onClickAway={handleTooltipClose}>
            <div>
              <Tooltip
                PopperProps={{
                  disablePortal: true,
                }}
                onClose={handleTooltipClose}
                open={open}
                disableFocusListener
                disableHoverListener
                disableTouchListener
                title="Copied webId to clipboard"
              >
                <Button
                  onClick={handleTooltipOpen}
                  style={{
                    fontWeight: "bold",
                    textTransform: "initial",
                    color: textColorHex,
                  }}
                >
                  Logged in as: {webId}
                </Button>
              </Tooltip>
            </div>
          </ClickAwayListener>
        )}
      </div>

      <div
        className={bem("header-banner__main-nav")}
        style={{ display: "flex", alignItems: "center" }}
      />
      <div className={bem("user-menu")}>
        {!sessionRequestInProgress && session.info.isLoggedIn && (
          <LogoutButton
            onError={console.error}
            onLogout={() => window.location.reload()}
            style={{ backgroundColor: colorHex }}
          >
            <LinkButton
              variant="small"
              className={bem("user-menu__list-item-trigger")}
              style={{ backgroundColor: colorHex }}
            >
              <Label
                onClick={handleTooltipOpen}
                style={{
                  color: textColorHex,
                }}
              >
                Log Out
              </Label>
            </LinkButton>
          </LogoutButton>
        )}

        {!sessionRequestInProgress && !session.info.isLoggedIn && <LoginForm />}
      </div>
    </header>
  );
}
