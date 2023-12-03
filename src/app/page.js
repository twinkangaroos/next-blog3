"use client"
import { useState, useEffect } from 'react';
import { Button, Flex, Table, TableCell, TableBody, TableHead, TableRow, TextField, Card } from '@aws-amplify/ui-react';

import { generateClient } from "aws-amplify/api";
import { createTodo } from '../graphql/mutations';
import { listTodos, getTodo } from "../graphql/queries";
import { listPosts, getPost } from "../graphql/queries";
import '@aws-amplify/ui-react/styles.css';

// import { getQueryTodo } from "./query/page";

import { Amplify } from 'aws-amplify';
import config from '../amplifyconfiguration.json';
Amplify.configure(config);

export default function Home() {
    const [todos, setTodos] = useState([])
    const [todoName, setTodoName] = useState("")
    const [todoDescription, setTodoDescription] = useState("")

    //useEffect(() => {
        // getRecord()
    //}, [])
    
    const onReadClick = async () => {
        // CSR
        // const client = generateClient()
        // const allTodo = await client.graphql({
        //     query: listTodos
        // });
        // console.log("allTodo", allTodo.data.listTodos.items);
        // setTodos(allTodo.data.listTodos.items)
        
        try {
            const response = await fetch(`/query`);
            const result = await response.json();
            console.log("result", result.response.body.todos)
            setTodos(result.response.body.todos);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        
        // Get a specific item
        // const onePost = await client.graphql({
        //     query: getPost,
        //     variables: { id: 'YOUR_RECORD_ID' }
        // });
    }

    const onAddClick = async () => {
        //e.preventDefault()
        try {
            const client = generateClient()
            const newTodo = await client.graphql({
                query: createTodo,
                variables: {
                    input: {
                        "name": todoName,
                        "description": todoDescription
                    }   
                }
            });
            console.log("create record.")
            getRecord()
            // TODO：テキストボックス空にならない
            setTodoName("")
            setTodoDescription("")
        }
        catch (error) {
            console.error('更新時にエラーが発生しました:', error);
        }
    }
    
    return (
        <Flex direction="column">
            <Flex>ToDoリスト</Flex>
            <Table
                caption={""}
                highlightOnHover={true}
                size={"small"}
                variation={"striped"}
            >
                <TableHead>
                    <TableRow>
                        <TableCell as="th">すべきこと</TableCell>
                        <TableCell as="th">説明</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {
                    todos ?
                    todos.map(todo => (
                        <TableRow key={todo.id}>
                            <TableCell>{todo.name}</TableCell>
                            <TableCell>{todo.description}</TableCell>
                        </TableRow>
                    ))
                    :
                    ''
                }
                </TableBody>
            </Table>
            <hr />
            <Flex>
                <Card variation="outlined">
                    <Flex alignItems="flex-start">
                        <TextField
                            descriptiveText="すべきことを入力してください"
                            placeholder="name"
                            label="すべきこと"
                            errorMessage="There is an error"
                            defaultValue={todoName}
                            onChange={e => setTodoName(e.target.value)}
                        />
                        <TextField
                            descriptiveText="説明を入力してください"
                            placeholder="description"
                            label="説明"
                            errorMessage="There is an error"
                            defaultValue={todoDescription}
                            onChange={e => setTodoDescription(e.target.value)}
                        />
                        <Button variation="warning" onClick={onReadClick}>読み込む</Button>
                        <Button variation="warning" onClick={onAddClick}>追加する</Button>
                    </Flex>
                </Card>
            </Flex>
        </Flex>
    )
}
