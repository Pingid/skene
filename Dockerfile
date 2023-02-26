FROM node:18

ARG IS_DOCKER=true

WORKDIR /app

ADD '.yarn/releases' '.yarn/releases'

ADD '*.json' 'yarn.lock' '*.yml' '*.cjs' '*.mjs' ./

ADD '@client/package.json' '@client/package.json'
ADD '@server/package.json' '@server/package.json'

RUN yarn install

ADD '@client/*.json' '@client/*.html' '@client/*.cjs'  '@client'
ADD '@client/public' '@client/public'
ADD '@client/src' '@client/src'

ADD '@server/*.json' '@server'
ADD '@server/src' '@server/src'

RUN yarn build
# COPY '@client/*.cjs' '@client/*.json' '@client/*.html' './@client'
# RUN yarn install

# COPY '@client/src' '@client/src'
# COPY '@server/src' '@server/src'
# RUN yarn build