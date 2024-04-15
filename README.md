# NC News

This repo builds an API for NC News, with the purpose of accessing application data programmatically. 

## Initial Setup

This repo contains both a development and a test database. To successfully connect to the two databases locally you must load the correct environment variables. 

### Loading in the Environment Variables

To set up the environment variables locally, please complete the following steps:

1. **Install `dotenv`**
    - Dotenv is a zero-dependency module that loads environment variables from a `.env` file into `process.env`. To install use the following command:

        ```npm install dotenv --save```

2. **Create the dotenv Files**
   - Create new `.env.test`  and `.env.development` files in the directory.
   - Please check that the `.env` files are `.gitignored`.
   - Into each file, add `PGDATABASE=`, with the correct database name for the given environment, see `/db/setup.sql/` to confirm the names.

## Dependencies

### Test suite

The test suite uses the following dependencies:

1. **jest**
    - The testing in this repo is done using the jest framework. Install with the command:

        ```npm install --save-dev jest```
    - The testing in this repo also uses **Jest Sorted**, which extends jest.expect. Install with the command:

        ```npm install --save-dev jest-sorted```

        As well as adding the following to your `package.json` at the root level:
        - If **Jest>v24**, then: ```"jest": {"setupFilesAfterEnv": ["jest-sorted"]}```
        - If **Jest<v23**, then: ```"jest": {"setupTestFrameworkScriptFile":"jest-sorted"}``` 

2. **supertest**
    - The high-level abstraction for testing is done using supertest. Install with the command:
    
        ```npm install supertest --save-dev```

### PostgreSQL

The database management system used in this repo is PostgreSQL.

Install with the command: ```npm install pg```

### Express

The web framework used in this repo is Express.

Install with the command: ```npm install express```


    
