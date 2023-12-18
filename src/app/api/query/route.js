import { NextResponse, NextRequest } from "next/server"
import { listTodos, listPosts } from "@/graphql/queries"
import { Amplify } from 'aws-amplify'

import { runWithAmplifyServerContext, cookieBasedClient } from '@/app/_utils/amplifyServerUtils';
import { getCurrentUser } from 'aws-amplify/auth/server';
import { cookies } from 'next/headers';

import config from '@/amplifyconfiguration.json'
Amplify.configure(config)

// ※GETはキャッシュの影響か最新取得できないため、POSTにする。
export async function POST(req, res) {
    let response = null
    try {
        let user = null
        try {
            user = await runWithAmplifyServerContext({
                nextServerContext: { cookies },
                operation: (contextSpec) => getCurrentUser(contextSpec)
            })
            console.log("Login ok.")
        } catch (error) {
            console.log("Not login ok.")
        }

        const request = await req.json()
        const table = request.table
        // "No current user" error防止
        const client = cookieBasedClient
        let authMode = 'iam'
        // ログイン済みの場合
        if (user) {
            authMode = 'userPool'
        }

        // List all items
        let allData = ""
        let sortedData = ""
        if (table === "Post") {
            allData = await client.graphql({
                query: listPosts,
                authMode: 'iam'
            })
            sortedData = allData.data.listPosts.items.sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt)
            })
        } else {
            allData = await client.graphql({
                query: listTodos,
                authMode: authMode
            })
            // ソート: 作成日順 (createdAtが数値であることを仮定)
            sortedData = allData.data.listTodos.items.sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt)
            })
        }
        // console.log("sortedData", sortedData);
        response = {
            statusCode: 200,
            body: {
                "todos": sortedData
            }
        }
    } catch (error) {
        console.log("graphql api error!", error)
        response = {
            statusCode: 500,
            body: {
                "todos": ""
            }
        }
    }
    // console.log("response", response)
    return NextResponse.json({
        response
    })

    // Get a specific item
    // const onePost = await client.graphql({
    //     query: getPost,
    //     variables: { id: 'YOUR_RECORD_ID' }
    // });
}
