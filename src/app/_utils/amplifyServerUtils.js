import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import amplifyConfig from '@/amplifyconfiguration.json';
import { generateServerClientUsingReqRes, generateServerClientUsingCookies } from "@aws-amplify/adapter-nextjs/api"
import { cookies } from "next/headers"

export const { runWithAmplifyServerContext } = createServerRunner({
    config: amplifyConfig
});

export const reqResBasedClient = generateServerClientUsingReqRes({
    config: amplifyConfig
})

export const cookieBasedClient = generateServerClientUsingCookies({
    config: amplifyConfig,
    cookies,
})
