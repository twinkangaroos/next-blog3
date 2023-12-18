import { getCurrentUser } from 'aws-amplify/auth/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { runWithAmplifyServerContext } from '@/app/_utils/amplifyServerUtils';

import { listTodos, listPosts } from '@/graphql/queries'
import { generateClient } from "aws-amplify/api";
import { Amplify } from 'aws-amplify';
import config from '@/amplifyconfiguration.json';
Amplify.configure(config);

export async function GET() {
    const user = await runWithAmplifyServerContext({
        nextServerContext: { cookies },
        operation: (contextSpec) => getCurrentUser(contextSpec)
    });

    const client = generateClient()
    const allData = await client.graphql({
        query: listPosts,
        authMode: 'iam'
    })
    console.log("allData", allData.data.listPosts.items)

    return NextResponse.json({ allData });
}