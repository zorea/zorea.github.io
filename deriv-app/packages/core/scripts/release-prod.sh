#!/bin/sh

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
WHITE='\033[1;37m'
RESET='\033[0m'

function message {
    echo ${GREEN}"  >"${RESET} $1
}

function confirm {
    read -p "$(echo "\n${WHITE}$1 ${RESET}(y/n)${YELLOW}") " -n 1 -r &&
    echo "${RESET}"
}

cd $(git rev-parse --show-toplevel) &&

if [[ ! $(git config --get remote.origin.url) =~ binary-com/deriv-app ]]; then
    echo ${RED}"  > ERROR: "${RESET}"remote 'origin' should be deriv-app."
    exit 1
fi

if [[ ! $(git config --get remote.production.url) =~ binary-com/deriv-app-production ]]; then
    echo "$RED  > ERROR: $RESET remote 'production' should be pointing to binary-com/deriv-app-production."
    exit 1
fi

if [[ ! $(git rev-parse --abbrev-ref HEAD) =~ master ]]; then
    echo "$RED  > ERROR: $RESET Current working branch should be master."
    exit 1
fi

if [[ -z $(command -v lerna) ]]; then
    echo "$RED  > ERROR: $RESET Please install lerna globally."
fi

message "Creating CNAME" &&
echo "deriv.app" > ./packages/core/scripts/CNAME &&

message "Checking npm production value" &&
if [[ $(npm config get production) =~ ^true$ ]]
then
    npm config set -g production false
fi

message "Installing packages" &&
lerna bootstrap --ci && lerna run build:travis &&

confirm "Please confirm release to PRODUCTION" &&
if [[ $REPLY =~ ^[Nn]$ ]]
then
    message "Aborting release..."
    exit
fi &&

export NODE_ENV=production &&

message "Running build and deploy" &&
npm run build:local &&
cd packages/core/ &&
npm run deploy:clean -- --remote=production
