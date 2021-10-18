import { useSession } from "@inrupt/solid-ui-react"
import "react"


export default function ErrorComponent(props) {
  

  return(
    <div>
      <label>
        The requested resource at {props.uri} could not be retrieved: {props.message || "Unknown error"}
      </label>
    </div>
  )
}


export function LoginRequestWrapper(props) {
  const { session } = useSession();
  const { webId, isLoggedIn } = session.info;

  console.log('isloggedIn', isLoggedIn, props)

  return (
    isLoggedIn
    ? props.component
    : <div>
        <label>
            {`${props.view ? `The ${props.view} view is only available` : "This action is only possible"} when logged in with Solid. Please login at the top right of the screen.`}
        </label>
      </div>
  )
}
