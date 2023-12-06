import { NextResponse, NextRequest } from "next/server";
import { generateClient } from "aws-amplify/api";
import { createTodo, createPost } from '../../../graphql/mutations';
import { Amplify } from 'aws-amplify';
import config from '../../../amplifyconfiguration.json';
Amplify.configure(config);

export async function POST(req) {
    const request = await req.json()
    const todoName = request.name
    const todoDescription = request.description
    const table = request.table
    
    let response
    try {
        const client = generateClient()
        let newData = ""
        if (table === "Post") {
            newData = await client.graphql({
                query: createPost,
                variables: {
                    input: {
                        "title": todoName,
                        "body": todoDescription
                    }   
                }
            });
        } else {
            newData = await client.graphql({
                query: createTodo,
                variables: {
                    input: {
                        "name": todoName,
                        "description": todoDescription
                    }   
                }
            });
        }
        console.log("create record!", newData)

        response = {
            statusCode: 200,
            body: {
                "status": "ok"
            }
        }
    }
    catch (error) {
        console.error('更新時にエラーが発生しました:', error);
        response = {
            statusCode: 500,
            body: {
                "status": "ng"
            }
        }
    }
    return NextResponse.json({
        response
    })
}
