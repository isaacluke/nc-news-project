# NC News

This repo builds an API for NC News, with the purpose of accessing application data programmatically. It's purpose is to mimic the building of a real world backend service to showcase backend understanding.

[Link to the hosted version.](https://nc-news-project-58d8.onrender.com)

## Installation Guide

### Initial Setup

> Clone this repo [here](https://github.com/isaacluke/nc-news-project.git).

Please make sure you have [Node.js](https://nodejs.org/en) installed. The repo uses [npm](https://www.npmjs.com/) as its package manager.

You may choose to run `npm install` to install all dependencies now, in which case you may skip the install commands below.

This repo contains both a development and a test database. To successfully connect to the two databases locally you must load the correct environment variables. 

### Loading in the Environment Variables

To set up the environment variables locally, please complete the following steps:

1. **Install `dotenv`**
    - Dotenv is a zero-dependency module that loads environment variables from a `.env` file into `process.env`. To install use the following command:

        ```npm install dotenv --save```

2. **Create the dotenv Files**
   - Create new `.env.test`  and `.env.development` files in the directory.
   - Please check that the `.env` files are successfully in `.gitignore`.
   - Into each file, give the contents:  
        ```
        PGDATABASE=example_database_name
        ```
        Replacing `example_database_name` with the correct database name for each given environment. See `/db/setup.sql/` to confirm the names.

### Installing Dependencies

#### [Jest](https://jestjs.io/)

- The testing in this repo is done using the Jest framework. Install with the command:

    ```npm install --save-dev jest```
- The testing in this repo also uses [jest-extended](https://www.npmjs.com/package/jest-extended) and [jest-sorted](https://www.npmjs.com/package/jest-sorted) to allow for more logical and readable testing. Install them with the following commands:
    - `npm install --save-dev jest-extended`
    - `npm install --save-dev jest-sorted`

    Please note that the newest version of `jest-extended` only supports Jest version `27.2.5` and newer. If you're using an older version of Jest, use version `1.2.1`.

    To complete the jest setup, add the following to your `package.json` at the root level:
    ```
    "jest": {
        "setupFilesAfterEnv": [
            "jest-extended/all",
            "jest-sorted"
            ]
        }
    ```

    Please note that this is only true for `Jest>v24`, if you are working with `Jest<v23`, you must require each framework as seen in the example [here](https://www.npmjs.com/package/jest-sorted).

#### [supertest](https://www.npmjs.com/package/supertest)
- The high-level abstraction for testing is done using supertest. 
- Install with the command:

    ```npm install supertest --save-dev```

#### [PostgreSQL](https://www.postgresql.org/)

- The database management system used in this repo is PostgreSQL.

- Install with the command: 

    ```npm install pg```

- The seeding in this repo also uses [node-pg-format](https://www.npmjs.com/package/pg-format) to safely create dynamic SQL queries. Install with the command:

    ```npm install --save-dev pg-format```

#### [Express](https://expressjs.com/)

- The web framework used in this repo is Express.

- Install with the command: 

    ```npm install express```

#### [Husky](https://typicode.github.io/husky/)

- This ensures that we do not commit broken code.

- Install with the command: 

    ```npm install --save-dev husky```

### Scripts

- To initialise Husky, run the command:

    ```
    npm run prepare
    ```

- Now that the dependencies are installed, to initially setup the databases run the command:

    ```
    npm run setup-dbs
    ```

- To seed the development database, run the command:

    ```
    npm run seed
    ```

- To seed the test database and run the tests, run the command:

    ```
    npm run test
    ```

The scripts `start` and `seed-prod` in `package.json` are for hosting.

## Versions Used

| Tool | Version |
| --- | --- | 
| Node | v21.6.1 |
| Postgres | 14.10 (Homebrew), server 16.2 (Postgres.app) |
| Express | 4.19.2 |
| dotenv |16.4.5 |
| jest | 27.5.1 |
| jest-extended | 2.0.0 |
| jest-sorted | 1.0.15 |
| supertest | 6.3.4 |
| pg-format | 1.0.4 |
| husky | 8.0.3 |

## Endpoints

A full description of the endpoints, with examples, can be found at the [/api](https://nc-news-project-58d8.onrender.com/api) endpoint. The following is a condensed summary:

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | /api | Serves a json of all the available endpoints |
| GET | /api/topics | Serves an array of all topics |
| GET | /api/articles | Serves an array of all articles. Accepts a topic query |
| GET | /api/users | Serves an array of all users |
| GET | /api/articles/:article_id | Serves the specified article |
| GET | /api/articles/:article_id/comments | Serves the comments of the specified article |
| POST | /api/articles/:article_id/comments | Accepts a comment and serves the posted comment |
| PATCH | /api/articles/:article_id | Accepts a votes increment and serves the article with votes updated |
| DELETE | /api/comments/:comment_id | Deletes the comment |

    
