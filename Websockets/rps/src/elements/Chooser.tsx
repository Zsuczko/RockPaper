import { Button } from '@/components/ui/button'
// import { Toaster } from '@/components/ui/sonner'
import React, { useEffect, useMemo, useState } from 'react'
import useWebSocket from 'react-use-websocket'
import { toast } from 'sonner'
import { FaCheck, FaRegHandPaper, FaRegHandRock, FaRegHandScissors } from "react-icons/fa";
import CircleLoader from 'react-spinners/CircleLoader'


type ChooserProps={
    username:string
}




const Chooser: React.FC<ChooserProps> = ({username}) => {

    const [allUsername, setAllUsername] = useState<string[]>([])

    const [challenger, setChallenger] = useState<string>()

    const [challenge, setChallenge] = useState<boolean>(false)

    const [opponentShoosen, setOpponentChoosen] = useState<boolean>(false)
    const [opponentHand, setOpponentHand] = useState<string>()

    const [youChoosen, setYouChoosen] = useState<boolean>(false)
    const [youHand, setYouHand] = useState<string>()


    const wsUrl = useMemo(() => 'wss://rockpaper-4.onrender.com', []);
  
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
    }

    const SendHand =(hand:string)=>{

        Socket.sendJsonMessage({
            userTo:challenger,
            hand:hand
        })

        setYouHand(hand)
        setYouChoosen(true)
    }

    const AcceptChallenge =(chger:string)=>{

        setChallenger(chger)
        setChallenge(true)
        
 
        Socket.sendJsonMessage({
            userTo: chger,
            accept: true
        })
    }

    // const checking=()=>{
    //     if(youHand==="R" && opponentHand==="S"){
    //         toast.success("You've won")
    //     }
    //     if(youHand==="R" && opponentHand==="P"){
    //         toast.error("You've lost")
    //     }
    //     if(youHand==="R" && opponentHand==="R"){
    //         toast.info("Draw")
    //     }
    //     if(youHand==="P" && opponentHand==="R"){
    //         toast.success("You've won")
    //     }
    //     if(youHand==="P" && opponentHand==="S"){
    //         toast.error("You've lost")
    //     }
    //     if(youHand==="P" && opponentHand==="P"){
    //         toast.info("Draw")
    //     }
    //     if(youHand==="S" && opponentHand==="P"){
    //         toast.success("You've won")
    //     }
    //     if(youHand==="S" && opponentHand==="R"){
    //         toast.error("You've lost")
    //     }
    //     if(youHand==="S" && opponentHand==="S"){
    //         toast.info("Draw")
    //     }

    // }

    const checking = () => {
        console.log("checking function called"); // <- Add this
        const hand1 = youHand?.toUpperCase();
        const hand2 = opponentHand?.toUpperCase();

        console.log(hand1)
        console.log(hand2)
      
        if (!hand1 || !hand2) return;
      
        if (hand1 === hand2) {
          toast.info("Draw");

          console.log("draw")
          return;
        }
      
        const winMap: Record<string, string> = {
          R: "S",
          P: "R",
          S: "P",
        };
      
        if (winMap[hand1] === hand2) {
          toast.success("You've won");
          console.log("won")
        } else {
          toast.error("You've lost");
          console.log("Lost")
        }
      };

    useEffect(()=>{
        // console.log('Type of message:', typeof Socket.lastJsonMessage);
        // console.log('Message content:', Socket.lastJsonMessage);

        if(Array.isArray(Socket.lastJsonMessage)){

            setAllUsername([])

            Socket.lastJsonMessage.map((un:string)=>(
                setAllUsername((prev)=>[...prev, un])
            ))
        }
        else if(Socket.lastJsonMessage && (Socket.lastJsonMessage as any).ask){

            const challengerUser =  (Socket.lastJsonMessage as any).user
            
            toast.info(`${challengerUser} has challenged you`, {
                action:{
                    label: "Accept",
                    onClick: ()=>{AcceptChallenge(challengerUser)}
                }
            })
        }
        else if(Socket.lastJsonMessage && (Socket.lastJsonMessage as any).challenged){

            const challengerUser =  (Socket.lastJsonMessage as any).challenger
            
            setChallenger(challengerUser)
            setChallenge(true)
        }

        else if(Socket.lastJsonMessage && (Socket.lastJsonMessage as any).gotHand){

            setOpponentChoosen(true)
        }

        else if(Socket.lastJsonMessage && (Socket.lastJsonMessage as any).receiveHand){

            setOpponentChoosen(true)
            const handss = (Socket.lastJsonMessage as any).receiveHand
            setOpponentHand(handss)

            console.log((Socket.lastJsonMessage as any).receiveHand)

            // checking()
        }

        console.log(Socket.lastJsonMessage)

    },[Socket.lastJsonMessage])

    useEffect(() => {
        if (youHand && opponentHand) {
          checking();
        }
      }, [youHand, opponentHand]);
    
    const renderContent = (hands:string |undefined) => {
        switch (hands) {
          case 'R':
            return <FaRegHandRock className='text-[18em] w-full'/>;
          case 'P':
            return <FaRegHandPaper className='text-[18em] w-full'/>;
          case 'S':
            return <FaRegHandScissors className='text-[18em] w-full'/>;
          default:
            return <p>Unknown status</p>;
        }
      };

    return (

        !challenge ?
        <div className='m-10 flex flex-col gap-2 w-72'>
            <h1 className='text-2xl'>Welcome: {username}</h1>
            {/* {
                Socket.lastJsonMessage? <p>{JSON.stringify(Socket.lastJsonMessage, null, 2)}</p>:
                <p>nem jo</p>
            } */}
            <p className='text-4xl'>Available users: </p>
            {allUsername.length>1 ? (
                    allUsername.map((un: string) => (

                        <>{un != username? <Button onClick={()=>SendMessage(un)}>{un}</Button>:<></>}</>
                        
                    ))
                    ) : 
                    <p className='text-2xl'>There is no other player</p>
                    }
        </div>:

        <div className='flex justify-center flex-col h-full w-full gap-20 mr-10 p-10'>
            <h1 className='text-5xl m-auto mt-20'>{username} vs {challenger}</h1>
            <div className=' w-full h-96 flex justify-between'>
                    <div className='flex flex-col w-[50%]'>
                        <h1 className='text-3xl font-bold m-auto'>Choose a hand:</h1>
                        <div className='flex flex-row gap-3'>
                            {!youChoosen?
                            <><FaRegHandRock className='text-[18em]'  onClick={()=>{SendHand("R")}}/>
                            <FaRegHandPaper className='text-[18em]' onClick={()=>{SendHand("P")}}/>
                            <FaRegHandScissors className='text-[18em]' onClick={()=>{SendHand("S")}}/>
                                </>:
                            <>
                            {renderContent(youHand)}
                            </>}
                            
                        </div>
                    </div>
                    <div className='flex flex-col w-[50%]'>
                        <h1 className='text-3xl font-bold m-auto'>Opponent's hand:</h1>
                        {/* <div className='flex flex-row gap-3'>
                            <FaRegHandRock className='text-[18em]'  onClick={()=>{console.log("Rock")}}/>
                            <FaRegHandPaper className='text-[18em]' />
                            <FaRegHandScissors className='text-[18em]' />
                        </div> */}
                        <div className='m-auto'>
                        {opponentShoosen ? (
                            !opponentHand ? <FaCheck className='text-5xl' /> : (renderContent(opponentHand))
                        ) : (
                            <CircleLoader size={250} />
                        )}
                        </div>
                    </div>
            </div>
        </div>
    )
}

export default Chooser