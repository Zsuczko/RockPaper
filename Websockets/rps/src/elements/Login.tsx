import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'

type LoginProps ={
    setUsername: (newUsername:string) => void
}

const Login: React.FC<LoginProps> = ({setUsername}) => {

    const [username, setUserName] = useState("")
  return (
    <>
      <div className='flex justify-center items-center min-h-screen'>
        <div className='flex flex-col gap-3 items-center'>
          <h1 className=' text-2xl lg:text-5xl font-bold'>The ULTIMATE Rock Paper Scissor</h1>
          <div className='border-solid border-2 w-full flex flex-col items-center gap-6 p-5 lg:p-8'>
            <h1 className='text-xl'>Choose a username: </h1>
            <Input type='text' className='border-black' value={username} onChange={(e)=>{setUserName(e.target.value)}}></Input>
            <Button className='text-xl lg:text-3xl lg:p-7' onClick={()=>setUsername(username)}>Submit</Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login