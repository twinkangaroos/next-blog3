"use client"
import { useState, useEffect } from 'react';
import {
    Button, Flex, Table, TableCell, TableBody, TableHead, TableRow, TextField, Card, Heading,
    RadioGroupField, Radio
} from '@aws-amplify/ui-react';

import { generateClient } from "aws-amplify/api";
import { createTodo, createPost, updateTodo, updatePost } from '@/graphql/mutations';
import { listTodos, listPosts } from '@/graphql/queries';
import '@aws-amplify/ui-react/styles.css';
import { Authenticator } from '@aws-amplify/ui-react';

import { Amplify, Auth } from 'aws-amplify';
import config from '@/amplifyconfiguration.json';
//Amplify.configure(config);
Amplify.configure(config, {
    ssr: true // required when using Amplify with Next.js
});

export default function Home() {
    const [todos, setTodos] = useState([])
    const [posts, setPosts] = useState([])
    const [todoName, setTodoName] = useState("")
    const [todoDescription, setTodoDescription] = useState("")
    const [table, setTable] = useState("Todo")
    const [table2, setTable2] = useState("CSR")
    const [selectedTodo, setSelectedTodo] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);

    //useEffect(() => {
    //    onReadClick()
    //}, [table, table2])

    const onReadClick = async () => {
        // SSR
        if (table2 === "SSR") {
            try {
                // GETの場合キャッシュが強いのでPOSTにする。
                const postData = {
                    table: table,
                }
                const requestOptions = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json', // データがJSON形式であることを指定
                    },
                    body: JSON.stringify(postData), // データをJSON文字列に変換して送信
                }
                // 右記のキャッシュは機能していないかも。", { cache: 'no-store' }" or ", { next: { revalidate: 30 } }"
                const response = await fetch(`/api/query`, requestOptions)
                const result = await response.json()
                if (table === "Post") {
                    setPosts(result.response.body.todos)
                } else {
                    setTodos(result.response.body.todos)
                }
            } catch (error) {
                console.error('Error fetching data:', error)
            }
        } else {
            // CSR
            try {
                const client = generateClient()
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
                    setPosts(sortedData)
                    
                } else {
                    allData = await client.graphql({
                        query: listTodos,
                        authMode: 'iam'
                    })
                    // ソート: 作成日順 (createdAtが数値であることを仮定)
                    sortedData = allData.data.listTodos.items.sort((a, b) => {
                        return new Date(b.createdAt) - new Date(a.createdAt)
                    })
                    setTodos(sortedData)
                }
                console.log("sortedData", sortedData);                
            } catch (error) {
                console.error('Error fetching data:', error)
                setTodos([])
                setPosts([])
            }
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
                },
                authMode: 'iam'
            })
        } else {
            newData = await client.graphql({
                query: createTodo,
                variables: {
                    input: {
                        "name": todoName,
                        "description": todoDescription
                    }
                },
                authMode: 'iam'
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
    const onTable2Change = (e) => {
        setTable2(e.target.value)
    }

    
    const onRowPostClick = (_post) => {
        setTodoName(_post.title);
        setTodoDescription(_post.body);
        setSelectedPost(_post);
        console.log("post", _post)
    }
    const onRowTodoClick = (_todo) => {
        setTodoName(_todo.name);
        setTodoDescription(_todo.description);
        setSelectedTodo(_todo);
        console.log("todo", _todo)
    }

    // 更新ボタンクリック時
    const onUpdateClick = async () => {
        if (!selectedTodo) {
            // エラー処理またはユーザーに通知
            alert("更新データを選択してください。")
            return;
        }
        // CSR
        const client = generateClient()
        let newData = ""
        if (table === "Post") {
            newData = await client.graphql({
                query: updatePost,
                variables: {
                    input: {
                        "id": selectedPost.id,
                        "title": todoName,
                        "body": todoDescription
                    }
                }
            })
        } else {
            newData = await client.graphql({
                query: updateTodo,
                variables: {
                    input: {
                        "id": selectedTodo.id,
                        "name": todoName,
                        "description": todoDescription,
                    }
                }
            })
        }
        console.log("update complete.", newData)
        // 更新後にフォームをクリア
        setTodoName('')
        setTodoDescription('')
        setSelectedTodo(null)
        setSelectedPost(null)
        // データ最新化
        onReadClick()
        // TODO：Update後、なぜか行を選択してもTextFieldに反映されない。（初回のみうまくいく）
    }
    

    return (
                    <>
                        <Flex direction="column">
                            <Flex direction="row" alignItems="baseline">
                                <Heading
                                    width='30vw'
                                    level={2}
                                >
                                    ToDoリスト
                                </Heading>
                                <Flex>
                                    {
                                        
                                    }
                                </Flex>
                                <Flex>
                                    <Button size="small" onClick={() => { signOut() }}>ログアウト</Button>
                                </Flex>
                            </Flex>
                            <Flex direction="row">
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
                                    <RadioGroupField
                                        legend="CSR/SSR"
                                        name="table2"
                                        variation="outlined"
                                        direction="row"
                                        onChange={(e) => onTable2Change(e)}
                                        defaultValue='CSR'
                                    >
                                        <Radio value="CSR">CSR</Radio>
                                        <Radio value="SSR">SSR</Radio>
                                    </RadioGroupField>
                                </Flex>
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
                                            style={{ width: "500px" }}
                                        />
                                        <Button onClick={onReadClick}>読み込む</Button>
                                        <Button onClick={onAddClick}>追加する</Button>
                                        <Button onClick={onUpdateClick}>更新する</Button>
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
                                {
                                    table == "Post" ?
                                    <TableRow>
                                        <TableCell as="th">タイトル</TableCell>
                                        <TableCell as="th">本文</TableCell>
                                        <TableCell as="th">登録日時</TableCell>
                                    </TableRow>
                                    :
                                    <TableRow>
                                        <TableCell as="th">すべきこと</TableCell>
                                        <TableCell as="th">説明</TableCell>
                                        <TableCell as="th">Author</TableCell>
                                        <TableCell as="th">登録日時</TableCell>
                                    </TableRow>
                                }
                                </TableHead>
                                <TableBody>
                                    {
                                        posts && table == "Post" ?
                                            posts.map(post => (
                                                <TableRow 
                                                    key={post.id}
                                                    onClick={() => onRowPostClick(post)}
                                                    // ここでクリックされた行をセット
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <TableCell>{post.title}</TableCell>
                                                    <TableCell>{post.body}</TableCell>
                                                    <TableCell>{post.createdAt}</TableCell>
                                                </TableRow>
                                            ))
                                        :
                                        todos && table == "Todo" ?
                                            todos.map(todo => (
                                                <TableRow 
                                                    key={todo.id}
                                                    onClick={() => onRowTodoClick(todo)}
                                                    // ここでクリックされた行をセット
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <TableCell>{todo.name}</TableCell>
                                                    <TableCell>{todo.description}</TableCell>
                                                    <TableCell>{todo.author}</TableCell>
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
                
    )
}
