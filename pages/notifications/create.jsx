import "react"
import { LoginRequestWrapper } from "../../components/error";
import { CreateNotificationView } from "../../components/notification";

export default function Home() {
  return (
    <div>
      <LoginRequestWrapper component={<CreateNotificationView />} view="Create Notification" />
    </div>
  );
}