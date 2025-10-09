# Torah Administrador

This is a web application for managing the content of the Torah. It allows authenticated users to edit the books of the Torah, their abbreviations, chapters, and verses. It also includes sections for managing a dedication and a glossary.

## Features

*   User authentication (Login/Logout).
*   View a list of the books of the Torah, grouped by testament.
*   Edit the name and abbreviation of each book.
*   Edit the content of each verse in a book.
*   Edit the content of the dedication.
*   Edit the content of the glossary.

## Architecture

The application is a single-page application (SPA) built with React. It uses a component-based architecture, with a clear separation of concerns between the UI components, the business logic (hooks), and the application state (context).

The application is divided into the following main directories:

*   `src/components`: Contains the React components that make up the user interface.
*   `src/context`: Contains the React context for managing the application's global state, such as user authentication.
*   `src/hooks`: Contains the custom hooks that encapsulate the business logic, such as fetching data from the API and managing the state of the different modules.
*   `src/router`: Contains the application's routing configuration.

## Quick Start

```sh
git clone https://github.com/C-D-P-A/Torah-Administrador.git && cd torah-administrador && npm install && npm run dev
```

This will start the application in development mode. Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

The application has the following scripts available:

*   `npm run dev`: Starts the development server.
*   `npm run build`: Builds the application for production.
*   `npm run lint`: Lints the code using ESLint.
*   `npm run preview`: Previews the production build.

## Technologies Used

*   [React](https://reactjs.org/) - A JavaScript library for building user interfaces.
*   [Vite](https://vitejs.dev/) - A fast build tool for modern web projects.
*   [React Router](https://reactrouter.com/) - For routing and navigation.
*   [React Bootstrap](https://react-bootstrap.github.io/) - For UI components.
*   [Axios](https://axios-http.com/) - For making HTTP requests to the backend API.
*   [ESLint](https://eslint.org/) - For code linting.

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1.  Fork the repository.
2.  Create a new branch:
    ```sh
    git checkout -b my-new-feature
    ```
3.  Make your changes and commit them:
    ```sh
    git commit -am 'Add some feature'
    ```
4.  Push to the branch:
    ```sh
    git push origin my-new-feature
    ```
5.  Submit a pull request.
