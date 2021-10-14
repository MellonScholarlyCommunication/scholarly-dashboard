import "react"
import { LoginRequestWrapper } from "../components/error";
import { NotificationView } from "../components/notification";


export default function Home() {
  return (
    <div>
      <LoginRequestWrapper component={<NotificationView/>} />
    </div>
  );
}