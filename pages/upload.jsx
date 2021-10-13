import { useState, useEffect } from "react"
import UploadContainer from "../components/upload"
import { LoginRequestWrapper } from "../components/error";
import { useSession } from "@inrupt/solid-ui-react";
import { checkRequiredProfileLinks, InitializationView } from "../components/initialization";

export default function Home() {
  return (
    <div>
      <LoginRequestWrapper component={<InstantiationWrapper component={<UploadContainer />} />} />
    </div>
  );
}

function InstantiationWrapper(props) {
  const { session } = useSession();
  const { webId } = session.info;
  const Component = props.component

  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!webId) return;
    let running = true
    checkRequiredProfileLinks(session.fetch, webId).then(bool => { console.log('bool', bool); if (running) setInitialized(bool) })
    return () => { running = false }
  }, [webId])

  function onSuccess() {
    setInitialize(false)
  }

  return (
    initialized 
      ? Component
      : <InitializationView onSuccess={onSuccess}/>
  )
}