# NRC Functions Servce

The Functions service which handles all the functions used in the callbacks plugins, as well as NRC Sudan specific functions.

# Setup

Be sure to install the node modules

```bash 
npm install
```

In order to use the functions, you need to be logged into a twilio account.

To Run the Flex plugin, make sure you are logged into the NRC Sudan Twilio Account

```bash
# Make sure you have the Account SID and Auth Token from the Twilio Console
twilio login

# Once you have logged into the Sudan Account, be sure to use that profile
twilio profiles:use <YOUR NRC SUDAN ACCOUNT>
```

Now copy the .env.example file, rename to .env and fill out the values from the Twilio account

After you have done this, you can deploy the functions to the account using

```bash
npm run deploy
```

