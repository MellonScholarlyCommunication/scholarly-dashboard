import { getSolidDataset, getThing } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import { useState, useEffect } from "react";

function useThingFixed(thingURI) {
  const [thing, setThing] = useState(undefined)
  const [error, setError] = useState(undefined)
  const { session } = useSession();
  const { webId } = session.info;

  useEffect(() => {
    if (!thingURI) return;


    async function fetchDataset(fetch) {
      try {
        const dataset = await getSolidDataset(
          thingURI,
          { fetch: session.fetch }          // fetch from authenticated session
        ); 
        setThing(getThing(dataset, thingURI))
      } catch (error) {
        setError(error)
      }
      
    }
    fetchDataset(fetchFunction)
  }, [thingURI])

  return { thing, error }
}

export default useThingFixed