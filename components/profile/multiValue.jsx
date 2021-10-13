import { useContext } from "react";
import {
  useThing,
  useSession,
  DatasetContext,
} from "@inrupt/solid-ui-react";
import {
  getSourceUrl,
  getUrl,
  getUrlAll,
} from "@inrupt/solid-client";
import { VCARD } from "@inrupt/lit-generated-vocab-common";
import { Avatar, Typography, Link } from "@material-ui/core";
import MessageIcon from '@mui/icons-material/Message';
import { Label } from "@inrupt/prism-react-components";


export default function MultiValue(props) {
  const { solidDataset: dataset, setDataset } = useContext(DatasetContext);
  const datasetUrl = getSourceUrl(dataset);
  const { fetchSession } = useSession();
  const { thing } = useThing(datasetUrl);
  const values = thing && getUrlAll(thing, props.property.iri.value);

  return (
    <div>
      {values.map(v => 
        <Typography variant="body2" color="textSecondary" component="p"
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <MessageIcon />
          <Link> {v} </Link>
        </Typography>
    )}
    </div>
  )
}