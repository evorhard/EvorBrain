import { createSignal } from "solid-js";
import logo from "./assets/logo.svg";
import { invoke } from "@tauri-apps/api/core";

function App() {
  const [greetMsg, setGreetMsg] = createSignal("");
  const [name, setName] = createSignal("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name: name() }));
  }

  return (
    <main class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-8">
      <div class="max-w-2xl w-full">
        <h1 class="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Welcome to EvorBrain
        </h1>

        <div class="flex justify-center gap-8 mb-8">
          <a href="https://vitejs.dev" target="_blank" class="transition-transform hover:scale-110">
            <img src="/vite.svg" class="w-16 h-16" alt="Vite logo" />
          </a>
          <a href="https://tauri.app" target="_blank" class="transition-transform hover:scale-110">
            <img src="/tauri.svg" class="w-16 h-16" alt="Tauri logo" />
          </a>
          <a href="https://solidjs.com" target="_blank" class="transition-transform hover:scale-110">
            <img src={logo} class="w-16 h-16" alt="Solid logo" />
          </a>
        </div>
        
        <p class="text-center text-gray-600 dark:text-gray-400 mb-8">
          Built with Tauri, Vite, and SolidJS
        </p>

        <form
          class="flex flex-col gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
          onSubmit={(e) => {
            e.preventDefault();
            greet();
          }}
        >
          <input
            id="greet-input"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-evorbrain-500 dark:bg-gray-700 dark:text-white"
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder="Enter a name..."
          />
          <button 
            type="submit"
            class="px-4 py-2 bg-evorbrain-500 text-white rounded-md hover:bg-evorbrain-600 transition-colors"
          >
            Greet
          </button>
        </form>
        
        <p class="text-center mt-4 text-lg font-medium text-gray-900 dark:text-white">
          {greetMsg()}
        </p>
      </div>
    </main>
  );
}

export default App;
