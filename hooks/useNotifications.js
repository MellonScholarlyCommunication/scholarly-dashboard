import { useState, useEffect } from "react";
import { getContainedResourceURLs } from "../utils/FileUtils";
import { getThing, getUrl, getSolidDataset } from "@inrupt/solid-client"
import { useSession } from "@inrupt/solid-ui-react";
import { LDP } from "@inrupt/lit-generated-vocab-common";

export default function useNotifications() {
  const { session } = useSession();
  const { webId } = session.info;

  const [notificationIds, setNotificationIds] = useState([])

  useEffect(() => {
    let running = true;
    async function effect() {
      if (!webId) return
      let thing = getThing(await getSolidDataset(webId, {fetch: session.fetch}), webId)
      let inbox = getUrl(thing, LDP.inbox)
      let notificationIds = await getContainedResourceURLs(session.fetch, inbox)
      if (running) setNotificationIds(notificationIds || [])
    }
    effect()
    return () => { running = false }
  }, [webId])

  return notificationIds
}
