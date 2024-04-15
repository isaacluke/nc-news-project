# NC News

This repo contains both a development and a test database. To successfully connect to the two databases locally you must load the correct environment variables. 

## Loading in the Environment Variables

To set up the environment variables locally, please complete the following steps:

1. **Install `dotenv`**
    - Dotenv is a zero-dependency module that loads environment variables from a `.env` file into `process.env`. To install use the following command:

        ```npm install dotenv --save```

2. **Create the dotenv Files**
   - Create new `.env.test`  and `.env.development` files in the directory.
   - Please check that the `.env` files are `.gitignored`.
   - Into each file, add `PGDATABASE=`, with the correct database name for the given environment, see `/db/setup.sql/` to confirm the names.

