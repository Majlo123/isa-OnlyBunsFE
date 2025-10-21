# isa-OnlyBunsFE (Frontend)

This is the frontend client for **OnlyBuns**, a social media web application for rabbit enthusiasts. This single-page application (SPA) was developed using TypeScript and a modern framework (like Angular/React/Vue) as part of the Internet Software Architectures course.

## Key Features

The frontend provides a rich, interactive user interface for all platform features:

* [cite_start]**User Authentication:** Clean and intuitive forms for user registration and login, with client-side validation and error handling [cite: 2065-2068].
* [cite_start]**Dynamic Feed:** A home page that displays a feed of posts from followed users, sorted by creation time[cite: 2092].
* [cite_start]**Post Interaction:** Functionality for viewing, creating, liking, and commenting on posts [cite: 2111, 2125-2127]. [cite_start]Includes a component for uploading images from the user's computer[cite: 2122].
* [cite_start]**User Profiles:** A dedicated profile page where users can view and edit their information, see their posts, followers, and the accounts they follow [cite: 2083-2089].
* [cite_start]**Interactive Map:** A map view (e.g., using Leaflet or OpenLayers) to display nearby posts and rabbit care service locations, centered on the user's address [cite: 2144-2146].
* [cite_start]**Real-time Chat:** A chat interface that connects to the backend via WebSockets for seamless, real-time messaging between users and in groups[cite: 2167].
* [cite_start]**Administrative Views:** Special views for administrators to manage users, posts, and view application analytics [cite: 2100-2104].

## Technology Stack

* **Language:** TypeScript
* **Framework:** Angular / React / Vue
* **State Management:** Redux / NgRx / Pinia (or similar)
* **API Communication:** Axios / Fetch API
* **Real-time:** WebSockets (e.g., using `socket.io-client`)
* **Mapping:** Leaflet / OpenLayers

## Setup and Installation

1.  **Prerequisites:**
    * Node.js and npm/yarn

2.  **Installation:**
    ```bash
    npm install
    ```

3.  **Configuration:**
    * Update the API endpoint URL in the environment configuration file (e.g., `environment.ts` or `.env`) to point to your running backend server.

4.  **Running the Application:**
    ```bash
    npm start
    ```
    The application will be available at `http://localhost:4200` (or another specified port).
