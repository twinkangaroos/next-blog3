import { NextResponse, NextRequest } from "next/server"
import { generateClient } from "aws-amplify/api"
import { listTodos, getTodo } from "../../../graphql/queries"
import { listPosts, getPost } from "../../../graphql/queries"
import { Amplify } from 'aws-amplify'
import config from '../../../amplifyconfiguration.json'
Amplify.configure(config)

// ※GETはなぜか最新に反映されないため、POSTにする。
export async function POST(req) {
    const client = generateClient()
    const request = await req.json()
    const table = request.table
    
    // List all items
    let allData = ""
    if (table === "Post") {
        allData = await client.graphql({
            query: listPosts
        })
    } else {
        allData = await client.graphql({
            query: listTodos
        })
    }
    
    // ソート: 作成日順 (createdAtが数値であることを仮定)
    const sortedTodos = allData.data.listTodos.items.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt)
    })
    console.log("sortedTodos", sortedTodos);
    const response = {
        statusCode: 200,
        body: {
            "todos": sortedTodos
        }
    }
    console.log("response", response)
    return NextResponse.json({
        response
    })

    // Get a specific item
    // const onePost = await client.graphql({
    //     query: getPost,
    //     variables: { id: 'YOUR_RECORD_ID' }
    // });
}
