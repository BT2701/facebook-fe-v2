import "./App.css";
import { Router } from "./routes/Router";
import { NotificationProvider } from './context/NotificationContext';
function App() {
  return (
    <div>
        <NotificationProvider>
          <Router />
        </NotificationProvider>
    </div>
  );
}

export default App;
