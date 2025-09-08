import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'

type LoginProps ={
    setUsername: (newUsername:string) => void
}

const Login: React.FC<LoginProps> = ({setUsername}) => {

    const [username, setUserName] = useState("")
  return (
    <div className='m-10 flex flex-col w-96 gap-2'>
        <h1 className='text-5xl'>Hello</h1>
        <p>Please enter your username: </p>
        <div className='flex gap-2'>
            <Input type='text' value={username} onChange={(e)=>{setUserName(e.target.value)}}></Input>
            <Button onClick={()=>setUsername(username)}>Submit</Button>
        </div>
    </div>
  )
}

export default Login