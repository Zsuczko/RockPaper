import { Button } from '@/components/ui/button'
// import { Toaster } from '@/components/ui/sonner'
import React, { useEffect, useMemo, useState } from 'react'
import useWebSocket from 'react-use-websocket'
import { toast } from 'sonner'
import { FaCheck, FaLongArrowAltLeft, FaRegHandPaper, FaRegHandRock, FaRegHandScissors } from "react-icons/fa";
import CircleLoader from 'react-spinners/CircleLoader'


type ChooserProps={
    username:string,
    setUsername: (newUsername:string | undefined) => void
}




const Chooser: React.FC<ChooserProps> = ({username, setUsername}) => {

    const [allUsername, setAllUsername] = useState<string[]>([])

    const [challenger, setChallenger] = useState<string>()

    const [challenge, setChallenge] = useState<boolean>(false)

    const [opponentShoosen, setOpponentChoosen] = useState<boolean>(false)
    const [opponentHand, setOpponentHand] = useState<string>()

    const [youChoosen, setYouChoosen] = useState<boolean>(false)
    const [youHand, setYouHand] = useState<string>()


    const [yourScore, setYourScore] = useState<number>(0)
    const [oppScore, setOppScore] = useState<number>(0)

    const url = 'wss://rockpaper-4.onrender.com'
    // const url = 'ws://localhost:8000'

    const wsUrl = useMemo(() => url, []);
  
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


    const checking = () => {
        const hand1 = youHand?.toUpperCase();
        const hand2 = opponentHand?.toUpperCase();

        console.log(hand1)
        console.log(hand2)
      
        if (!hand1 || !hand2) return;
      
        if (hand1 === hand2) {
          toast.info("Draw");

          return;
        }
      
        const winMap: Record<string, string> = {
          R: "S",
          P: "R",
          S: "P",
        };
      
        if (winMap[hand1] === hand2) {
          toast.success("You've won");
          setYourScore(yourScore +1)

        } else {
          toast.error("You've lost");
          setOppScore(oppScore+1)
        }
      };

    const BackToHome = ()=>{
        Socket.sendJsonMessage({
            backHome:true,
            userTo:challenger
        });

        setChallenge(false)
        setYourScore(0)
        setOppScore(0)
    }

    useEffect(()=>{


        if(Array.isArray(Socket.lastJsonMessage)){

            setAllUsername([])

            Socket.lastJsonMessage.map((un:string)=>(
                setAllUsername((prev)=>[...prev, un])
            ))
        }

        else if(Socket.lastJsonMessage && (Socket.lastJsonMessage as any).already){

            toast.warning((Socket.lastJsonMessage as any).error);
            setUsername(undefined)

        }

        else if(Socket.lastJsonMessage && (Socket.lastJsonMessage as any).alreadyInGame){

            toast.warning((Socket.lastJsonMessage as any).error);

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

        else if(Socket.lastJsonMessage && (Socket.lastJsonMessage as any).oppLeft){

            toast.warning("Your opponent left the game!");
            setChallenge(false)
            setYourScore(0)
            setOppScore(0)

        }

        else if(Socket.lastJsonMessage && (Socket.lastJsonMessage as any).receiveHand){

            setOpponentChoosen(true)
            const handss = (Socket.lastJsonMessage as any).receiveHand
            setOpponentHand(handss)

            console.log((Socket.lastJsonMessage as any).receiveHand)

            setTimeout(() => {
                setYouChoosen(false);
                setOpponentChoosen(false)
                setOpponentHand(undefined)
              }, 2500);


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
        <div className='flex justify-center p-5 pt-10 lg:p-20'>
            <div className='flex flex-col gap-10 items-center'>
                <h1 className='text-3xl lg:text-5xl'>Welcome here <span className='font-bold'>{username}!</span></h1>
                <p className='text-2xl lg:text-4xl'>Choose your opponent: </p>
                {allUsername.length>1 ? (
                    allUsername.map((un: string) => (

                        <>{un != username? <Button className='text-xl lg:text-3xl lg:p-7 truncate' onClick={()=>SendMessage(un)}>{un}</Button>:<></>}</>
                        
                    ))
                    ) : 
                    <p className='text-xl lg:text-4xl'>There is no available player</p>
                    }
            </div>
        

        </div>:

        <div className='flex justify-center flex-col h-full w-full gap-20 mr-10 p-10'>
            <Button className='absolute top-5 left-5' onClick={BackToHome}>
                <FaLongArrowAltLeft />
                Back to home
            </Button>
            <h1 className='text-2xl lg:text-5xl m-auto mt-20'>{username} ({yourScore}) vs {challenger} ({oppScore})</h1>
            {/* <h1>{yourScore}:{oppScore}</h1> */}
            <div className=' w-full h-96 flex justify-between flex-col items-center lg:flex-row'>
                    <div className='flex flex-col w-[50%]'>
                        <h1 className='text-xl lg:text-3xl font-bold m-auto'>Choose a hand:</h1>
                        <div className='flex items-center flex-col lg:flex-row gap-3'>
                            {!youChoosen?
                            <><FaRegHandRock className='text-[6rem] lg:text-[18em]'  onClick={()=>{SendHand("R")}}/>
                            <FaRegHandPaper className='text-[6rem] lg:text-[18em]' onClick={()=>{SendHand("P")}}/>
                            <FaRegHandScissors className='text-[6rem] lg:text-[18em]' onClick={()=>{SendHand("S")}}/>
                                </>:
                            <>
                            {renderContent(youHand)}
                            </>}
                            
                        </div>
                    </div>
                    <div className='flex flex-col w-[50%] gap-10'>
                        <h1 className='text-xl lg:text-3xl font-bold m-auto'>Opponent's hand:</h1>
                        <div className='m-auto'>
                        {opponentShoosen ? (
                            !opponentHand ? <FaCheck className='text-5xl' /> : (renderContent(opponentHand))
                        ) : (
                            <>
                              <div className="block lg:hidden">
                                    <CircleLoader size={100} />
                                </div>
                                <div className="hidden lg:block">
                                    <CircleLoader size={250} />
                                </div>
                            </>
                        )}
                        </div>
                    </div>
            </div>
        </div>
    )
}

export default Chooser