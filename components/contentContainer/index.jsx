import React from "react";
import { useSession, useThing } from "@inrupt/solid-ui-react";

import { useRouter } from "next/router";

import { getUrlAll } from "@inrupt/solid-client";

import {
  RDF,
  FOAF,
  SCHEMA_INRUPT_EXT,
} from "@inrupt/lit-generated-vocab-common";

import { Grid } from "@material-ui/core";

import URLComponent from "../urlComponent";
import ErrorComponent from "../error";
import ProfileView from "../profile";
import { ARTEFACTTYPES, ArtefactViewComponent } from "../artefacts";

import LoadingComponent from "../loading";

function ContentContainer() {
  const router = useRouter();

  const { session } = useSession();
  const { webId } = session.info;

  let target =
    Array.isArray(router.query.uri) && router.query.uri.length
      ? router.query.uri[0]
      : router.query.uri;
  target = target || webId;

  const { thing, error } = useThing(target, target, { fetch: session.fetch });

  let types;
  let person;
  let artefact;
  if (thing) {
    types = getUrlAll(thing, RDF.type);
    person =
      types.indexOf(FOAF.Person.value) !== -1 ||
      types.indexOf(SCHEMA_INRUPT_EXT.Person.value) !== -1;
    artefact = false;
    for (const artefactType of ARTEFACTTYPES) {
      if (types.indexOf(artefactType) !== -1) artefact = true;
    }
  }

  function getScreen() {
    if (error) {
      return <ErrorComponent uri={target} />;
    }
    if (!target) {
      return <ErrorComponent uri={target} message="No target URI given." />;
    }
    if (!thing) {
      return <LoadingComponent uri={target} />;
    }
    if (person) {
      return <ProfileView uri={target} />;
    }
    if (artefact) {
      return <ArtefactViewComponent uri={target} />;
    }
    return (
      <ErrorComponent
        uri={target}
        message="Provided URI does not contain a scholarly artefact or profile"
      />
    );
  }

  return (
    <Grid container spacing={2} justify="center">
      <Grid item md={8} sm={10} xs={12} style={{ backgroundColor: "white" }}>
        <Grid container>
          <Grid item xs={12}>
            <URLComponent uri={target} />
          </Grid>
          <Grid
            item
            xs={12}
            className="viewContainer"
            style={{ margin: "auto" }}
          >
            {getScreen()}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default ContentContainer;
