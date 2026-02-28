# Pocketbase Specific

This file is intended to help AI Coding Agents know important information about Pocketbase and how it is used in this application.

## Official Pocketbase Documentation
- [Main documentation page](https://pocketbase.io/docs/)
- [Collections](https://pocketbase.io/docs/collections/)
- [API Rules for collection access controls and data filters](https://pocketbase.io/docs/api-rules-and-filters/)
- [Authentication](https://pocketbase.io/docs/authentication/)
- [File uploading and handling](https://pocketbase.io/docs/files-handling/)
- [Working with relations](https://pocketbase.io/docs/working-with-relations/)
- [Extending Pocketbase](https://pocketbase.io/docs/use-as-framework/)

## IMPORTANT Usage Information
The project extends Pocketbase with both GO and JavaScript. The JavaScript extensions use the GOJA runtime and do not allow async code. Keep this in mind when extending code in JS. The JS code also uses `require()` for imports, `module.exports` for exports (also known as commonjs format). Pocketbase will inject values into the JavaScript runtime which can be found in the type file `./pocketbase/pb_data/types.d.ts`. Additional information on the JS runtime can be found [in the JS extension docs](https://pocketbase.io/docs/js-overview/).

Additional specific documentation:
- Information on **users** can be found in [users.md](./users.md)
- Information on **migrations** can be found in [migrations.md](./migrations.md)
- Information on **hooks** can be found in [hooks.md](./hooks.md)
- Information on **querying** can be found in [querying.md](./querying.md)
- Information on **collections** can be found in [collections.md](./collections.md)
- Information on **access & permissions** can be found in [access-permissions.md](./access-permissions.md)
- Information on **admin panel UI** can be found in [pocketbase-admin-panel.md](./pocketbase-admin-panel.md)