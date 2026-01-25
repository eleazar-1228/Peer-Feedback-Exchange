import { LoginPage } from "./components/LoginPage";

export default function App() {
  return <LoginPage onLogin={(role) => console.log("Logged in as:", role)} />;
}