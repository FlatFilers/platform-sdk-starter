# platform-sdk-starter
Basic starter project for the Flatfile Platform SDK

## Getting Started

### Configure the environment
1. Create a `.env` file in the project root using the `.env.example` file as a template.
2. Follow these [instructions](https://support.flatfile.com/hc/en-us/articles/4406299638932-How-can-I-create-API-Keys-) to generate an Access Key ID and Secret Access Key
3. Add the Access Key ID to your `.env` file as the `FLATFILE_ACCESS_KEY_ID` variable
4. Add the Secret Access Key to your `.env` file as the `FLATFILE_SECRET` variable

### Deploy the Schema
1. Login to Flatfile and [find your team ID](https://support.flatfile.com/hc/en-us/articles/6097149079188-Where-is-my-TeamID-What-other-IDs-do-I-need-to-know-)
2. From the root directory of this project run `npx --yes @flatfile/cli publish ./src/index.ts --team <YOUR_TEAM_ID>`
