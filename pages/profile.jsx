import "react"
import { LoginRequestWrapper } from "../components/error";
import ProfileView, {ProfileCard} from "../components/profile";


export default function Home() {
  return (
    <div>
      <LoginRequestWrapper component={<ProfileCard editable={true}/> } view="Profile" />
    </div>
  );
}