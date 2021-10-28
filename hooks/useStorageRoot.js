/* eslint-disable consistent-return */
import { useSession } from "@inrupt/solid-ui-react";
import { useState, useEffect } from "react";
import { getStorageRoot } from "../utils/FileUtils";

/**
 *
 * @param {fetch: Function, webId: string, types: string[] } props
 * @returns
 */
export default function useStorageRoot() {
  const { session } = useSession();
  const { webId } = session.info;
  const [root, setRoot] = useState(null);

  useEffect(() => {
    if (!webId) return;
    let running = true;
    async function run() {
      const root = await getStorageRoot(webId, session.fetch);
      if (running) setRoot(root);
    }
    run();
    return () => {
      running = false;
    };
  }, [session.fetch, webId]);

  return root;
}
