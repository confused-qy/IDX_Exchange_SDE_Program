# IDX Exchange frontend

React listings page for the IDX Exchange Express API.

## Development

Start the backend on port 5001, then run:

```bash
npm install
npm start
```

The app opens at <http://localhost:3000>. During development, requests beginning
with `/api` are proxied to `http://localhost:5001`.

## Checks

```bash
npm run lint
npm test -- --watchAll=false
npm run build
```

## Source organization

- `src/api/` owns HTTP requests and response handling.
- `src/components/` contains reusable user-interface components and their styles.
- `src/pages/` contains route-level screens that compose components.
- `src/hooks/` contains reusable React state and side-effect logic.
- `src/utils/` contains framework-independent formatting and data helpers.

`App.js` defines the application routes, `index.js` mounts React, and
`setupTests.js` configures the test environment.
