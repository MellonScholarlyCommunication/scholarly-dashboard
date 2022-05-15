/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-cycle */
import { useThing } from "@inrupt/solid-ui-react";

import {
  asUrl,
  getBooleanAll,
  getDatetimeAll,
  getDecimalAll,
  getIntegerAll,
  getStringNoLocaleAll,
  getUrlAll,
} from "@inrupt/solid-client";
import { RDF } from "@inrupt/lit-generated-vocab-common";
import { Button, Card, CardContent } from "@material-ui/core";
import { Label } from "@inrupt/prism-react-components";
import { ErrorCard } from "../error";
import LoadingComponent from "../loading";
import {
  getPredicateName,
  NOTIFICATIONTYPES,
  openInNewTab,
  PERSONTYPES,
} from "../../utils/util";
import { ProfileCard } from "../profile";
import { NotificationCard } from "../notification";

export function CardViewerComponent(props) {
  const { target } = props;
  const { thing, error } = useThing(target, target);

  function getCard() {
    const types = getUrlAll(thing, RDF.type);

    for (const type of types) {
      if (PERSONTYPES.indexOf(type) !== -1) {
        return <ProfileCard target={target} small />;
      }
      if (NOTIFICATIONTYPES.indexOf(type) !== -1) {
        return <NotificationCard target={target} />;
      }
    }
    return <GenericCardFromThing thing={thing} />;
  }

  function getView() {
    // Try to show non rdf resources
    if (target.toString().endsWith(".html")) {
      return <LandingPageCard target={target} type="html" />;
    }
    if (target.toString().endsWith(".pdf")) {
      return <LandingPageCard target={target} type="pdf" />;
    }

    if (error) return <ErrorCard message={error.message} uri={target} />;
    if (!thing) return <LoadingComponent />;
    return getCard();
  }

  return getView();
}

function GenericCardFromThing(props) {
  const { thing } = props;
  const predicates = Object.keys(thing.predicates);
  const object = {};
  for (const predicate of predicates) {
    const valuestring = getAll(thing, predicate);
    if (valuestring) object[predicate] = valuestring;
  }

  return (
    <Card>
      <Label>
        <b>URI</b>: {asUrl(thing)}
      </Label>
      <CardContent>
        {Object.keys(object).map((p) => (
          <Label>
            <b>{getPredicateName(p)}</b>: {object[p]}
            <br />
          </Label>
        ))}
      </CardContent>
    </Card>
  );
}

function getAll(thing, property) {
  let stringRepresentations = [];
  stringRepresentations = stringRepresentations
    .concat(getStringNoLocaleAll(thing, property))
    .concat(getUrlAll(thing, property))
    .concat(getBooleanAll(thing, property))
    .concat(getDatetimeAll(thing, property))
    .concat(getDecimalAll(thing, property))
    .concat(getIntegerAll(thing, property))
    .concat(getStringNoLocaleAll(thing, property));
  return stringRepresentations.join(", ");
}

function LandingPageCard(props) {
  console.log("target", target);
  const { target, type } = props;
  return (
    <div>
      <b>uri</b>: <small>{target}</small>
      <br />
      <Button
        style={{ backgroundColor: "lightblue" }}
        onClick={() => openInNewTab(target)}
      >
        {type === "pdf" ? "Open PDF" : "Open Landing Page"}
      </Button>
    </div>
  );
}
