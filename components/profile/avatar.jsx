import { useContext, useState } from "react";
import {
  useThing,
  DatasetContext,
  SessionContext,
} from "@inrupt/solid-ui-react";
import {
  getSourceUrl,
  getUrl,
  saveSolidDatasetAt,
  setThing,
  setUrl,
} from "@inrupt/solid-client";
import { VCARD } from "@inrupt/lit-generated-vocab-common";
import { Avatar, Button } from "@material-ui/core";
import { Input } from "@inrupt/prism-react-components";

export default function ProfileAvatar(props) {
  const { edit, size } = props;
  const { solidDataset: dataset, setDataset } = useContext(DatasetContext);
  const datasetUrl = getSourceUrl(dataset);
  const { fetch } = useContext(SessionContext);
  let { thing } = useThing(datasetUrl);
  const profileImageURL = thing && getUrl(thing, VCARD.hasPhoto);

  const [imageURL, setImageURL] = useState(profileImageURL);

  async function updateImage() {
    if (!imageURL) return;
    thing = await setUrl(thing, VCARD.hasPhoto, imageURL.trim());
    const savedDataset = await saveSolidDatasetAt(
      getSourceUrl(dataset),
      setThing(dataset, thing),
      { fetch }
    );
    setDataset(savedDataset);
    // const savedDataset = await saveSolidDatasetAt()
  }

  return edit ? (
    <div>
      <Input
        placeholder="Profile image URL"
        onBlur={(e) => setImageURL(e.target.value)}
      />
      <Avatar
        src={imageURL}
        variant="rounded"
        className="avatar"
        style={{ width: size, height: size }}
      />
      <Button onClick={updateImage}>Update profile image</Button>
    </div>
  ) : (
    <Avatar
      alt="No profile picture"
      src={profileImageURL}
      variant="rounded"
      className="avatar"
      style={{ width: size, height: size }}
    />
  );
}
