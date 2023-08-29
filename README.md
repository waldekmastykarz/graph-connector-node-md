# Sample connector

```sh
# restore dependencies
npm i
# create AAD app reg
./setup.sh
# create Microsoft Graph connector and register schema
npm run createConnector
# load content
npm run loadContent
```

## Notes

`NODE_TLS_REJECT_UNAUTHORIZED=0` is required to skip certificate validation errors when using the Microsoft 365 Developer Proxy.

`NODE_NO_WARNINGS=1` suppresses Node.js warnings about skipping certificate validation.
