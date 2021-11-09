/* eslint-disable react/jsx-props-no-spreading */
import { useEffect } from "react";
import {
  FOAF,
  RDF,
  SCHEMA_INRUPT_EXT,
} from "@inrupt/lit-generated-vocab-common";
import { Input, Textarea } from "@inrupt/prism-react-components";
import { getUrlAll } from "@inrupt/solid-client";
import { useSession, useThing } from "@inrupt/solid-ui-react";
import { Button, Card, Container, Grid } from "@material-ui/core";
import { useRouter } from "next/router";

import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";

import { postArtefactWithMetadata } from "../../utils/FileUtils";
import Modalify from "../modalify";
import { ProfileCard } from "../profile";
import useStorageRoot from "../../hooks/useStorageRoot";

const ARTEFACTTYPE = "https://example.com/Artefact";

function UploadComponent() {
  const { session } = useSession();
  const { webId } = session.info;

  const storageRoot = useStorageRoot();
  const router = useRouter();

  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      file: null,
      title: null,
      language: "en",
      abstract: null,
      location: "",
    },
  });

  useEffect(() => {
    if (!storageRoot) return;
    const defaultlocation = storageRoot ? `${storageRoot}scholar/` : null;
    if (defaultlocation)
      reset({
        file: null,
        title: null,
        language: "en",
        abstract: null,
        location: defaultlocation,
      });
  }, [storageRoot, reset]);

  const {
    fields: authorsfields,
    append: authorsappend,
    remove: authorsremove,
  } = useFieldArray({ control, name: "authors" });

  if (authorsfields.length === 0) authorsappend({ webId: "" });

  const onSubmit = async (submission) => {
    const formattedSubmission = { ...submission };
    formattedSubmission.type = ARTEFACTTYPE;
    formattedSubmission.format = submission.file && submission.file[0].type;
    // setting file to first file of fileList
    formattedSubmission.file =
      submission.file && submission.file.length && submission.file[0];

    // Check and set necessary routes

    // Post upload to data pod
    const locations = await postArtefactWithMetadata(
      session.fetch,
      webId,
      formattedSubmission
    );

    router.push({
      pathname: "/",
      query: { uri: locations.resourceMapURI },
    });
  };

  const ProfileCheck = ({ control, index }) => {
    const value = useWatch({
      control,
      name: `authors[${index}].webId`,
    });

    const { thing } = useThing(value, value);

    let types;
    let person;
    if (thing) {
      types = getUrlAll(thing, RDF.type);
      person =
        types.indexOf(FOAF.Person.value) !== -1 ||
        types.indexOf(SCHEMA_INRUPT_EXT.Person.value) !== -1;
    }

    return person ? (
      Modalify(ProfileCard, { uri: value }, "View Profile")
    ) : (
      <div>Invalid profile</div>
    );
  };

  return (
    <Container fixed>
      <Card style={{ paddingLeft: "1%" }}>Upload</Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card style={{ paddingLeft: "5%" }}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <input {...register("file")} type="file" name="file" />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Input
                    label="Title"
                    type="text"
                    style={{ width: "100%" }}
                    {...field}
                  />
                )}
              />
            </Grid>

            {authorsfields.map(({ webId }, index) => {
              return (
                <Controller
                  key={webId}
                  name={`authors[${index}].webId`}
                  control={control}
                  defaultValue={webId || ""}
                  render={({ field }) => {
                    return (
                      <Grid container>
                        <Grid item xs={12} key={`profile${webId}`}>
                          <Input
                            label="Author"
                            type="text"
                            style={{ width: "100%" }}
                            {...field}
                          />
                        </Grid>
                        <Grid item xs={2}>
                          <ProfileCheck control={control} index={index} />
                        </Grid>
                        {index === authorsfields.length - 1 && (
                          <Grid item xs={2} key={`profileremove${webId}`}>
                            <Button
                              type="button"
                              onClick={() => authorsremove({ index })}
                            >
                              Remove
                            </Button>
                          </Grid>
                        )}
                        {index === authorsfields.length - 1 && (
                          <Grid item xs={2}>
                            <Button
                              type="button"
                              onClick={() => authorsappend({ webId: "" })}
                            >
                              Add
                            </Button>
                          </Grid>
                        )}
                      </Grid>
                    );
                  }}
                />
              );
            })}

            <Grid item xs={12}>
              <Controller
                name="abstract"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Textarea
                    label="Abstract"
                    type="text"
                    style={{ width: "100%", height: "10em" }}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="language"
                control={control}
                defaultValue="en"
                render={({ field }) => (
                  <Input
                    label="Language code"
                    type="text"
                    style={{ width: "100%" }}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="location"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Input
                    label="Storage location"
                    type="text"
                    style={{ width: "100%" }}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={5} />
            <Grid item xs={2}>
              <Button variant="outlined" type="submit">
                Submit
              </Button>
            </Grid>
            <Grid item xs={5} />
            <Grid item xs={12} />
            <Grid item xs={12} />
          </Grid>
        </Card>
      </form>
    </Container>
  );
}

export default UploadComponent;
