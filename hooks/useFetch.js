import { useSession } from "@inrupt/solid-ui-react";

function useFetch() {
  const { session } = useSession();
  const { webId } = session.info;
  return webId ? session.fetch : window.fetch.bind(window) 
}

export default useFetch
