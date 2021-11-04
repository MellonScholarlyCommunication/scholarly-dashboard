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

import { getUrl, getStringNoLocale } from "@inrupt/solid-client";

import {
  useSession,
  CombinedDataProvider,
  useThing,
  Value,
} from "@inrupt/solid-ui-react";

import {
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";

import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import BusinessIcon from "@material-ui/icons/Business";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import MessageIcon from "@mui/icons-material/Message";

import { VCARD } from "@inrupt/lit-generated-vocab-common";

import { Label } from "@inrupt/prism-react-components";
import { ArtefactListingComponent } from "../artefacts";
import { EventListingComponent } from "../eventLog";
import ProfileAvatar from "./avatar";

/**
 * fn -> full name
 * hasPhoto
 * bday
 * hasGender
 *
 * title
 * email
 *
 * hasTelephone
 * hasEmail
 * hasInstantMessage
 * laguage
 */

export default function ProfileView(props) {
  const { session } = useSession();
  const { webId } = session.info;
  const { uri, maxWidth } = props;
  const target = uri || webId;
  const width = maxWidth || "100%";

  return (
    <Container fixed>
      <CombinedDataProvider datasetUrl={target} thingUrl={target}>
        <Card style={{ width }}>
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              Profile
            </AccordionSummary>
            <AccordionDetails>
              <ProfileCard uri={target} editable />
            </AccordionDetails>
          </Accordion>

          <Accordion TransitionProps={{ mountOnEnter: true }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              Artefacts
            </AccordionSummary>
            <AccordionDetails>
              <ArtefactListingComponent target={target} small />
            </AccordionDetails>
          </Accordion>
          <Accordion TransitionProps={{ mountOnEnter: true }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2a-content"
              id="panel2a-header"
            >
              Events
            </AccordionSummary>
            <AccordionDetails>
              <EventListingComponent target={target} small />
            </AccordionDetails>
          </Accordion>
        </Card>
      </CombinedDataProvider>
    </Container>
  );
}

export function ProfileCard(props) {
  const { session } = useSession();
  const { webId } = session.info;
  const { uri, maxWidth, editable } = props;
  const [edit, setEdit] = useState(false);
  const target = uri || webId;
  const width = maxWidth || "100%";

  const { thing, error } = useThing(target);

  function createCardLabel(label, size) {
    return (
      <Grid item xs={12} sm={size} md={size - 1}>
        <Label>{label}</Label>
      </Grid>
    );
  }

  function createCardIcon(IconComponent, size) {
    return (
      <Grid item xs={12} sm={size} md={size - 1}>
        {IconComponent}
      </Grid>
    );
  }
  function createCardEntry(property, size, edit) {
    return (
      <Grid item xs={12} sm={size} md={size + 1} className="valueParent">
        {editable ? (
          <Value property={property} edit={edit} thing={thing} autosave />
        ) : (
          <Label>
            {getUrl(thing, property) || getStringNoLocale(thing, property)}
          </Label>
        )}
      </Grid>
    );
  }

  function getView() {
    if (error) {
      return (
        <Label>
          {`An error occured while loading the resource at: ${target}`}
        </Label>
      );
    }
    if (!thing) {
      return <Label>{`Loading resource: ${target}`}</Label>;
    }
    return (
      <Grid container spacing={2}>
        <Grid item sm={9} xs={12}>
          <Grid container spacing={2}>
            {createCardLabel("Name", 2)}
            {createCardEntry(VCARD.fn, 10, edit)}
            {createCardLabel("Title", 2)}
            {createCardEntry(VCARD.title, 10, edit)}
            {createCardIcon(<BusinessIcon />, 2)}
            {createCardEntry(VCARD.organization_name, 10, edit)}
            {createCardIcon(<PhoneIcon />, 2)}
            {createCardEntry(VCARD.hasTelephone, 10, edit)}
            {createCardIcon(<EmailIcon />, 2)}
            {createCardEntry(VCARD.hasEmail, 10, edit)}
            {createCardIcon(<MessageIcon />, 2)}
            {createCardEntry(VCARD.hasInstantMessage, 10, edit)}
            {editable && webId && target === webId && (
              <Button onClick={() => setEdit(!edit)}>
                {edit ? "Finish editing profile" : "Edit Profile information"}
              </Button>
            )}
          </Grid>
        </Grid>
        <Grid item sm={3} xs={12}>
          <ProfileAvatar
            property={VCARD.hasPhoto}
            edit={edit}
            autosave
            size="100%"
          />
        </Grid>
      </Grid>
    );
  }

  return (
    <CombinedDataProvider datasetUrl={target} thingUrl={target}>
      <Card style={{ width }}>
        <CardContent>{getView()}</CardContent>
      </Card>
    </CombinedDataProvider>
  );
}
