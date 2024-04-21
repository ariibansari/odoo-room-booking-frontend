import ProtectedAxios from "@/api/protectedAxios"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "./ui/use-toast"
import { Room as RoomType } from "@/utils/types"
import Room from "./Room"

const Rooms = () => {
    const [searchText, setSearchText] = useState("")

    const [loadingRooms, setLoadingRooms] = useState(true)
    const [rooms, setRooms] = useState<RoomType[]>([])

    useEffect(() => {
        getRooms()
    }, [])

    const getRooms = () => {
        setLoadingRooms(true)
        ProtectedAxios.post("/api/user/room/all")
            .then(res => {
                setRooms(res.data)
                setLoadingRooms(false)
            })
            .catch(err => {
                setLoadingRooms(false)
                toast({
                    variant: "destructive",
                    title: "Could not get rooms at the moment please try again later"
                })
            })
    }

    return (
        <section id="rooms" className="container py-10">
            <div className="relative">
                <Search className="absolute top-[50%] translate-y-[-45%] left-4 w-4" />
                <Input placeholder="search rooms" className="pl-10 w-[40rem]" value={searchText} onChange={e => setSearchText(e.target.value)} />
            </div>
            <div>
                {loadingRooms
                    ? ""

                    :
                    rooms.length === 0
                        ? ""

                        :
                        <div className="grid md:grid-cols-2 gap-10 my-10">
                            {
                                rooms.map((room, i) => (
                                    <Room room={room} key={i} />
                                ))
                            }
                        </div>
                }
            </div>
        </section>
    )
}

export default Rooms