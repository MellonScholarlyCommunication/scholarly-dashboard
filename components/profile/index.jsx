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
  useSession,
  CombinedDataProvider,
  Text,
  Value,
} from "@inrupt/solid-ui-react";

import {
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
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
              <Typography>Profile</Typography>
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
              <Typography>Artefacts</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ArtefactListingComponent target={target} />
            </AccordionDetails>
          </Accordion>
          <Accordion TransitionProps={{ mountOnEnter: true }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2a-content"
              id="panel2a-header"
            >
              <Typography>Events</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <EventListingComponent target={target} />
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

  return (
    <CombinedDataProvider datasetUrl={target} thingUrl={target}>
      <Card style={{ width }}>
        <Grid container spacing={2} justify="center">
          <Grid item xs={12} sm={9}>
            <CardContent>
              <Typography gutterBottom variant="h2" component="h2">
                <Text property={VCARD.fn} edit={edit} autosave />
              </Typography>

              <Typography
                variant="body2"
                color="textSecondary"
                component="p"
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Text property={VCARD.title} edit={edit} autosave />
              </Typography>

              <Typography
                variant="body2"
                color="textSecondary"
                component="p"
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <BusinessIcon />
                <Text property={VCARD.organization_name} edit={edit} autosave />
              </Typography>

              <Typography
                variant="body2"
                color="textSecondary"
                component="p"
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <PhoneIcon />
                <Text property={VCARD.hasTelephone} edit={edit} autosave />
              </Typography>

              <Typography
                variant="body2"
                color="textSecondary"
                component="p"
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <EmailIcon />
                <Text property={VCARD.hasEmail} edit={edit} autosave />
              </Typography>

              <Typography
                variant="body2"
                color="textSecondary"
                component="p"
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <MessageIcon />
                <Value
                  property={VCARD.hasInstantMessage}
                  edit={edit}
                  autosave
                  onError={() => {}}
                  dataType="url"
                />
              </Typography>

              <Typography
                variant="body2"
                color="textSecondary"
                component="p"
                style={{
                  display: "flex",
                  alignItems: "baseline",
                }}
              />
            </CardContent>

            {editable && webId && target === webId && (
              <Button onClick={() => setEdit(!edit)}>
                {edit ? "Finish editing profile" : "Edit Profile information"}
              </Button>
            )}
          </Grid>
          <Grid item xs={12} sm={3}>
            <CardContent>
              <ProfileAvatar
                property={VCARD.hasPhoto}
                edit={edit}
                autosave
                size="100%"
              />
            </CardContent>
          </Grid>
        </Grid>
      </Card>
    </CombinedDataProvider>
  );
}
