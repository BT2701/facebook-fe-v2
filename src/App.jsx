import "./App.css";
import { Router } from "./routes/Router";
import { NotificationProvider } from './context/NotificationContext';
import { ChatConnProvider } from "./context/ChatConnContext";
function App() {
  return (
    <div>
      <ChatConnProvider>
        <NotificationProvider>
          <Router />
        </NotificationProvider>
      </ChatConnProvider>
    </div>
  );
}

export default App;
