import { useEffect } from "react";
import { useSession } from "@inrupt/solid-ui-react";
import { useRouter } from "next/router";
import UploadContainer from "../components/upload";
import { LoginRequestWrapper } from "../components/error";
import { isInitialized } from "../components/settings";

export default function Home() {
  return (
    <div>
      <LoginRequestWrapper
        component={<InstantiationWrapper component={<UploadContainer />} />}
        view="Upload"
      />
    </div>
  );
}

function InstantiationWrapper(props) {
  const { session } = useSession();
  const { webId } = session.info;
  const Component = props.component;
  const router = useRouter();

  useEffect(() => {
    if (!webId) return;
    async function check() {
      const initialized = await isInitialized(session);
      if (!initialized) {
        router.push({
          pathname: "/settings",
          query: { edit: true },
          shallow: true,
        });
      }
    }
    check();
  }, [session, router, webId]);

  return Component;
}
