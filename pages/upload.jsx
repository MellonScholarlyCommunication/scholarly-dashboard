import { useState, useEffect } from "react"
import UploadContainer from "../components/upload"
import { LoginRequestWrapper } from "../components/error";
import { useSession } from "@inrupt/solid-ui-react";
import { isInitialized } from "../components/settings"
import { useRouter } from "next/router";

export default function Home() {
  return (
    <div>
      <LoginRequestWrapper component={<InstantiationWrapper component={<UploadContainer />} />} view="Upload" />
    </div>
  );
}

function InstantiationWrapper(props) {
  const { session } = useSession();
  const { webId } = session.info;
  const Component = props.component
  const router = useRouter()

  useEffect(() => {
    if (!webId) return;
    let running = true
    async function check() {
      let initialized = await isInitialized(session)
      if(running && !initialized) {
        alert('Please complete your data pod settings.')
        router.push({
          pathname: '/settings',
          query: { edit: true},
        })
      }
    }
    check()
    return () => { running = false }
  }, [webId])

  return ( Component )
}