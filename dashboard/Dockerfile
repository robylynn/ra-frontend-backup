FROM node:20.15

ARG APP_WORKDIR

WORKDIR ${APP_WORKDIR}

COPY src ./src
COPY public ./public
COPY [\
    "package.json", \
    "yarn.lock",\
    "postcss.config.js",\
    "tailwind.config.js",\
    "tsconfig.json",\
    ".eslintrc.json",\
    "./"\
]

COPY ["next.config.production.js", "./next.config.js"]
COPY [".env.production", "./.env"]

RUN ["yarn", "--network-timeout", "100000", "install"]
RUN ["npx", "next-ws-cli@latest", "patch"]
RUN ["yarn", "build"]

CMD ["yarn", "start"]
