import { cookies } from 'next/headers';
import { getCurrentUser } from '@aws-amplify/auth/server';
import { runWithAmplifyServerContext, cookieBasedClient } from '@/app/_utils/amplifyServerUtils';
import { listTodos, listPosts } from '@/graphql/queries'

import { Amplify } from 'aws-amplify';
import config from '@/amplifyconfiguration.json';
Amplify.configure(config);

// This page always dynamically renders per request
export const dynamic = 'force-dynamic';

export default async function AuthGetCurrentUserServer() {
    try {
        // const currentUser = await runWithAmplifyServerContext({
        //     nextServerContext: { cookies },
        //     operation: (contextSpec) => getCurrentUser(contextSpec)
        // });

        const client = cookieBasedClient
        const allData = await client.graphql({
            query: listPosts,
            authMode: 'iam'
        })
        console.log("allData", allData.data.listPosts.items)
        const posts = allData.data.listPosts.items

        return (
            <>
                {
                    posts.map(post => (
                        <ul>
                            <li>{post.title}</li>
                            <li>{post.body}</li>
                            <li>{post.createdAt}</li>
                        </ul>
                    ))
                }
            </>
        );
    } catch (error) {
        console.error(error);
        return <p>Something went wrong...</p>;
    }
}