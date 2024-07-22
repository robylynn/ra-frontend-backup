# RA Frontend Setup
First install node version manager,
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

Install NodeJS version 20.13.1,
```
nvm install 20.13.1
nvm use 20.13.1
```

Navigate to the dashboard directory and set up the node packages,
```
cd dashboard && yarn install
```

Patch the Next.JS installation to support [websockets](https://github.com/apteryxxyz/next-ws)
```
npx next-ws-cli@latest patch
```