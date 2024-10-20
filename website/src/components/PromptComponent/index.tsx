// This directive is specific to Next.js, indicating that this is a Client Component
// It means this component will be rendered on the client-side (in the browser)
// Learn more: https://nextjs.org/docs/getting-started/react-essentials#client-components
'use client';

// Importing necessary modules from React
// React is the core library for building user interfaces
// useState is a Hook that lets you add state to function components
// FormEvent and ChangeEvent are types used for form events
// Learn more about React hooks: https://reactjs.org/docs/hooks-intro.html
import React, { useState, FormEvent, ChangeEvent } from 'react';

// TypeScript interface for the expected response data
// This defines the shape of the data we expect to receive from our API
// Learn more about TypeScript interfaces: https://www.typescriptlang.org/docs/handbook/interfaces.html
interface ResponseData {
  response: string;
}

// Main component function
// This is a functional component that returns JSX (JavaScript XML)
// Learn more about function components: https://reactjs.org/docs/components-and-props.html#function-and-class-components
export default function PromptComponent(): JSX.Element {
  // State hooks for managing component state
  // useState returns an array with two elements: the current state value and a function to update it
  // Learn more about useState: https://reactjs.org/docs/hooks-state.html
  const [prompt, setPrompt] = useState<string>(''); // State for the user's input prompt
  const [response, setResponse] = useState<string>(''); // State for the API response
  const [isLoading, setIsLoading] = useState<boolean>(false); // State for tracking if the API call is in progress
  const [error, setError] = useState<string | null>(null); // State for storing any error messages

  // Function to handle form submission
  // This is an async function because it makes an API call
  // Learn more about handling events: https://reactjs.org/docs/handling-events.html
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault(); // Prevent default form submission behavior
    setIsLoading(true); // Set loading state to true
    setError(null); // Clear any previous errors
    try {
      // Fetch API to make HTTP requests
      // We're sending a POST request to our backend API
      // Learn more: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
      const res = await fetch('http://localhost:8000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }), // Send the prompt as JSON in the request body
      });
      
      // Check if the response is ok (status in the range 200-299)
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
      }
      
      // Parse the JSON response
      const data: ResponseData = await res.json();
      setResponse(data.response); // Update the response state with the API response
    } catch (error) {
      console.error('Error:', error);
      // Set the error state with the error message
      setError(error instanceof Error ? error.message : 'An unknown error occurred.');
      setResponse(''); // Clear the response state
    } finally {
      setIsLoading(false); // Set loading state to false, regardless of success or failure
    }
  };

  // Function to handle changes in the textarea
  // This updates the prompt state as the user types
  const handlePromptChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setPrompt(e.target.value);
  };

  // Component's JSX
  // This defines the structure and appearance of our component
  // Learn more about JSX: https://reactjs.org/docs/introducing-jsx.html
  return (
    <div className="max-w-4xl mx-auto mt-16 p-8 bg-gray-800 rounded-2xl shadow-2xl transition-all duration-300 ease-linear">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="prompt" className="block text-xl font-medium text-green-400 mb-4">
            Enter your prompt:
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={handlePromptChange}
            className="w-full px-4 py-3 text-lg text-gray-200 bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 ease-linear"
            rows={5}
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 px-6 text-xl bg-green-600 text-white font-semibold rounded-xl shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-all duration-300 ease-linear disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating...' : 'Generate Response'}
        </button>
      </form>
      {error && (
        <div className="mt-8 p-6 bg-red-700 rounded-xl transition-all duration-300 ease-linear">
          <h2 className="text-2xl font-medium text-white mb-4">Error:</h2>
          <p className="text-lg text-white leading-relaxed">{error}</p>
        </div>
      )}
      {response && (
        <div className="mt-8 p-6 bg-gray-700 rounded-xl transition-all duration-300 ease-linear">
          <h2 className="text-2xl font-medium text-green-400 mb-4">Response:</h2>
          <p className="text-lg text-gray-300 leading-relaxed">{response}</p>
        </div>
      )}
    </div>
  );
}