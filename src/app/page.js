"use client"
import { useState, useEffect } from 'react';
import { Button, Flex, Table, TableCell, TableBody, TableHead, TableRow, TextField, Card, Heading } from '@aws-amplify/ui-react';

// import { generateClient } from "aws-amplify/api";
// import { createTodo } from '../graphql/mutations';
// import { listTodos, getTodo } from "../graphql/queries";
// import { listPosts, getPost } from "../graphql/queries";
import '@aws-amplify/ui-react/styles.css';

import { Amplify } from 'aws-amplify';
import config from '../amplifyconfiguration.json';
Amplify.configure(config);

export default function Home() {
    const [todos, setTodos] = useState([])
    const [todoName, setTodoName] = useState("")
    const [todoDescription, setTodoDescription] = useState("")

    useEffect(() => {
        onReadClick()
    }, [])
    
    const onReadClick = async () => {
        try {
            // GETの場合キャッシュが強いのでPOSTにする。
            const requestOptions = {
                method: 'POST',
            }
            // 右記のキャッシュは機能していないかも。", { cache: 'no-store' }" or ", { next: { revalidate: 30 } }"
            const response = await fetch(`/api/query`, requestOptions)
            const result = await response.json()
            console.log("result", result.response.body.todos)
            setTodos(result.response.body.todos)
        } catch (error) {
            console.error('Error fetching data:', error)
        }
        // CSR
        // const client = generateClient()
        // const allTodo = await client.graphql({
        //     query: listTodos
        // });
        // console.log("allTodo", allTodo.data.listTodos.items);
        // setTodos(allTodo.data.listTodos.items)
    }

    const onAddClick = async () => {
        //e.preventDefault()
        const postData = {
            name: todoName,
            description: todoDescription,
        };
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // データがJSON形式であることを指定
                // 他に必要なヘッダーがあればここに追加
            },
            body: JSON.stringify(postData), // データをJSON文字列に変換して送信
        };
        try {
            console.log("requestOptions", requestOptions)
            const response = await fetch(`/api/create`, requestOptions);
            const result = await response.json();
            console.log("create record.", result)
            // データ最新化
            onReadClick()
        } catch (error) {
            console.error('Post error occured:', error);
        }
        // CSR
        //     const client = generateClient()
        //     const newTodo = await client.graphql({
        //         query: createTodo,
        //         variables: {
        //             input: {
        //                 "name": todoName,
        //                 "description": todoDescription
        //             }   
        //         }
        //     });
        // TODO：テキストボックス空にならない
        //setTodoName("")
        //setTodoDescription("")
    }
    
    return (
        <Flex direction="column">
            <Heading
                width='30vw'
                level={2} 
            >
                ToDoリスト
            </Heading>
            <Flex>
                <Card variation="outlined">
                    <Flex alignItems="center" >
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
                            style={{ width:"500px" }}
                        />
                        <Button onClick={onReadClick}>読み込む</Button>
                        <Button onClick={onAddClick}>追加する</Button>
                    </Flex>
                </Card>
            </Flex>
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
                        <TableCell as="th">登録日時</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {
                    todos ?
                    todos.map(todo => (
                        <TableRow key={todo.id}>
                            <TableCell>{todo.name}</TableCell>
                            <TableCell>{todo.description}</TableCell>
                            <TableCell>{todo.createdAt}</TableCell>
                        </TableRow>
                    ))
                    :
                    ''
                }
                </TableBody>
            </Table>
            
        </Flex>
    )
}
