import { useState, useEffect } from "react";
import { getThing, getUrl, getSolidDataset } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import { LDP } from "@inrupt/lit-generated-vocab-common";
import { getContainedResourceURLs } from "../utils/FileUtils";

export default function useNotifications() {
  const { session } = useSession();
  const { webId } = session.info;

  const [notificationIds, setNotificationIds] = useState([]);

  useEffect(() => {
    let running = true;
    async function effect() {
      if (!webId) return;
      const thing = getThing(
        await getSolidDataset(webId, { fetch: session.fetch }),
        webId
      );
      const inbox = getUrl(thing, LDP.inbox);
      const notificationIds = await getContainedResourceURLs(
        session.fetch,
        inbox
      );
      if (running) setNotificationIds(notificationIds || []);
    }
    effect();
    return () => {
      running = false;
    };
  }, [session.fetch, webId]);

  return notificationIds;
}
