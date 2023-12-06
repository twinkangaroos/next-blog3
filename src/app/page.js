"use client"
import { useState, useEffect } from 'react';
import { Button, Flex, Table, TableCell, TableBody, TableHead, TableRow, TextField, Card, Heading,
    RadioGroupField, Radio } from '@aws-amplify/ui-react';

import { generateClient } from "aws-amplify/api";
import { createTodo, createPost } from '../graphql/mutations';
import { listTodos, listPosts } from '../graphql/queries';
import '@aws-amplify/ui-react/styles.css';
import { Authenticator } from '@aws-amplify/ui-react';

import { Amplify, Auth } from 'aws-amplify';
import config from '../amplifyconfiguration.json';
Amplify.configure(config);

export default function Home() {
    const [todos, setTodos] = useState([])
    const [todoName, setTodoName] = useState("")
    const [todoDescription, setTodoDescription] = useState("")
    const [table, setTable] = useState("")

    useEffect(() => {
        onReadClick()
    }, [table])
    
    const onReadClick = async () => {
        // SSR
        // Cognitoにすると、Error: No current user
        // try {
        //     // GETの場合キャッシュが強いのでPOSTにする。
        //     const postData = {
        //         table: table,
        //     }
        //     const requestOptions = {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json', // データがJSON形式であることを指定
        //         },
        //         body: JSON.stringify(postData), // データをJSON文字列に変換して送信
        //     }
        //     // 右記のキャッシュは機能していないかも。", { cache: 'no-store' }" or ", { next: { revalidate: 30 } }"
        //     const response = await fetch(`/api/query`, requestOptions)
        //     const result = await response.json()
        //     console.log("result", result.response.body.todos)
        //     setTodos(result.response.body.todos)
        // } catch (error) {
        //     console.error('Error fetching data:', error)
        // }
        // CSR
        try {
            const client = generateClient()
            let allData = ""
            console.log("table", table)
            if (table === "Post") {
                allData = await client.graphql({
                    query: listPosts
                })
            } else {
                allData = await client.graphql({
                    query: listTodos
                })
            }
            console.log("allData", allData.data.listTodos.items);
            // ソート: 作成日順 (createdAtが数値であることを仮定)
            const sortedTodos = allData.data.listTodos.items.sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt)
            })
            console.log("sortedTodos", sortedTodos);
            setTodos(sortedTodos)
        } catch (error) {
            console.error('Error fetching data:', error)
            setTodos([])
            console.log("clear.")
        }
    }

    const onAddClick = async () => {
        // SSR
        // const postData = {
        //     table: table,
        //     name: todoName,
        //     description: todoDescription,
        // }
        // const requestOptions = {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json', // データがJSON形式であることを指定
        //     },
        //     body: JSON.stringify(postData), // データをJSON文字列に変換して送信
        // };
        // try {
        //     console.log("requestOptions", requestOptions)
        //     const response = await fetch(`/api/create`, requestOptions);
        //     const result = await response.json();
        //     console.log("create record.", result)
        // } catch (error) {
        //     console.error('Post error occured:', error);
        // }
        // CSR
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
            })
        } else {
            newData = await client.graphql({
                query: createTodo,
                variables: {
                    input: {
                        "name": todoName,
                        "description": todoDescription
                    }   
                }
            })
        }
        // データ最新化
        onReadClick()
        // TODO：テキストボックス空にならない
        //setTodoName("")
        //setTodoDescription("")
    }

    // Radioボタンチェンジイベント
    const onTableChange = (e) => {
        setTable(e.target.value)
    }
    
    return (
        <Authenticator.Provider>
            <Authenticator>
            {({ signOut, user }) => (
                <>
                    <Flex direction="column">
                        <Flex direction="row">
                            <Heading
                                width='30vw'
                                level={2} 
                            >
                                ToDoリスト
                            </Heading>
                            <Flex>
                                <Button size="small" onClick={() => {signOut()}}>ログアウト</Button>
                            </Flex>
                        </Flex>
                        <Flex>
                        <RadioGroupField
                            legend="対象テーブル"
                            name="table"
                            variation="outlined"
                            direction="row"
                            onChange={(e) => onTableChange(e)}
                            defaultValue='Todo'
                        >
                            <Radio value="Todo">Todo</Radio>
                            <Radio value="Post">Post</Radio>
                        </RadioGroupField>
                        </Flex>
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
                </>
            )}
        </Authenticator>
        </Authenticator.Provider>
    )
}
