import { type FormEvent, useState, type ReactElement } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App(): ReactElement {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet(): Promise<void> {
    try {
      // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
      const message = await invoke<string>("greet", { name });
      setGreetMsg(message);
    } catch (error) {
      console.error("Failed to greet:", error);
      setGreetMsg("Failed to connect to the backend. Please ensure the app is running properly.");
    }
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    void greet();
  };

  return (
    <div className="container">
      <h1>Welcome to EvorBrain!</h1>

      <p>Your offline-first personal productivity system.</p>

      <form className="row" onSubmit={handleSubmit}>
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>

      <p>{greetMsg}</p>
    </div>
  );
}

export default App;
