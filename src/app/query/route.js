import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import { listTodos, getTodo } from "../../graphql/queries";
import { Amplify } from 'aws-amplify';
import config from '../../amplifyconfiguration.json';
Amplify.configure(config);

export async function GET() {
    const client = generateClient()
    // List all items
    const allTodo = await client.graphql({
       query: listTodos
    });
    //console.log("allTodo", allTodo.data.listTodos.items);
    const response = {
        statusCode: 200,
        body: {
            "todos": allTodo.data.listTodos.items
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
    
    // const insertRecord = async () => {
    //     try {
    //         const client = generateClient()
    //         const newTodo = await client.graphql({
    //             query: createTodo,
    //             variables: {
    //                 input: {
    //                     "name": todoName,
    //                     "description": todoDescription
    //                 }   
    //             }
    //         });
    //         console.log("create record.")
    //     }
    //     catch (error) {
    //         console.error('更新時にエラーが発生しました:', error);
    //     }
    // }
    
}
