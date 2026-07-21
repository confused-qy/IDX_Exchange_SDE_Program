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
npm test -- --watchAll=false
npm run build
```
