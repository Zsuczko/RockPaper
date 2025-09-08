import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import React, { useEffect, useMemo, useState } from 'react'
import useWebSocket from 'react-use-websocket'
import { toast } from 'sonner'

type ChooserProps={
    username:string
}


const Chooser: React.FC<ChooserProps> = ({username}) => {

    const [allUsername, setAllUsername] = useState<string[]>([])

    // const wsUrl = "ws://localhost:8000"
    
    // const Socket = useWebSocket(wsUrl, {
    //     share:true,
    //     queryParams: {username}
    // })

    const wsUrl = useMemo(() => 'ws://localhost:8000', []);
  
    // Memoize options to prevent unnecessary reconnects
    const socketOptions = useMemo(() => ({
      share: true,
      queryParams: { username }
    }), [username]);
  
    const Socket = useWebSocket(wsUrl, socketOptions);

    const SendMessage = (userTo:string)=>{
        Socket.sendJsonMessage({
            userTo: userTo,
            ask: true
        })

        console.log("Jo")
    }

    useEffect(()=>{
        console.log('Type of message:', typeof Socket.lastJsonMessage);
        console.log('Message content:', Socket.lastJsonMessage);

        if(Array.isArray(Socket.lastJsonMessage)){

            setAllUsername([])

            Socket.lastJsonMessage.map((un:string)=>(
                setAllUsername((prev)=>[...prev, un])
            ))
        }
        else if(Socket.lastJsonMessage && (Socket.lastJsonMessage as any).ask){
            
        }

    },[Socket.lastJsonMessage])

    return (
        <div className='m-10 flex flex-col gap-2 w-72'>
            <h1 className='text-2xl'>Welcome: {username}</h1>
            {/* {
                Socket.lastJsonMessage? <p>{JSON.stringify(Socket.lastJsonMessage, null, 2)}</p>:
                <p>nem jo</p>
            } */}
            <Button onClick={()=>{
                toast("Jo")
            }}>
                toast
            </Button>
            <p className='text-4xl'>Available users: </p>
            {allUsername.length>1 ? (
                    allUsername.map((un: string) => (

                        <>{un != username? <Button onClick={()=>SendMessage(un)}>{un}</Button>:<></>}</>
                        
                    ))
                    ) : 
                    <p className='text-2xl'>There is no other player</p>
                    }
        </div>
    )
}

export default Chooser