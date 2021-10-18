import "react"
import { LoginRequestWrapper } from "../components/error";
import { SettingsView } from "../components/settings";


export default function Home() {
  return (
    <div>
      <LoginRequestWrapper component={<SettingsView/>} view="Settings" />
    </div>
  );
}