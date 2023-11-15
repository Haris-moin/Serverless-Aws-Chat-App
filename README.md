# chatbot-webapp-be

Need to install following for this repository:

- Node.js version 14 or above
- NPM or YARN
- Docker and Docker-Compose
- Sequelize cli

##### Instructions for development server

Clone this repository:

````sh
git clone https://gitlab.mynisum.com/prologis/prologis-chatbot-poc/chatbot-webapp-be.git


Now install project dependencies

```sh
yarn install
# or
npm install
````

### Deployment

In order to deploy the example, you need to run the following command:

```
$ serverless deploy
```

After running deploy, you should see output similar to:

```bash
Deploying poc to stage dev (us-east-1)
✔ Service deployed to stack poc-dev
functions:
  propertySearch: poc-dev-propertySearch
```
