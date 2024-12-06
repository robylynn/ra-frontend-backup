FROM node:20.15

ARG APP_WORKDIR

WORKDIR ${APP_WORKDIR}

COPY src ./src
COPY public ./public
COPY [\
    "package.json", \
    "package-lock.json",\
    "postcss.config.js",\
    "tailwind.config.js",\
    "tsconfig.json",\
    ".eslintrc.json",\
    "./"\
]

COPY ["next.config.production.js", "./next.config.js"]
COPY [".env.production", "./.env"]

RUN ["npm", "i"]
RUN ["npm", "run", "build"]

CMD ["npm", "run", "start"]
