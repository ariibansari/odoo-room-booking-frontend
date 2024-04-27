import ProtectedAxios from '@/api/protectedAxios'
import { useContext, useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { SocketContext } from '@/context/SocketProvider'
import { BookingDetail } from '@/utils/types'
import { SessionContext } from '@/context/SessionProvider'


type Availability = {
    status: string,
    color: string
}

const AvailabilityStatus = ({ room_id }: { room_id: number }) => {
    const { socket } = useContext(SocketContext)
    const { session } = useContext(SessionContext)
    const [loadingAvalability, setLoadingAvailability] = useState(true)
    const [avalability, setAvailability] = useState<Availability>({ status: "", color: "" })

    useEffect(() => {
        getAvailabilityStatus()
    }, [])

    const getAvailabilityStatus = (showLoader = true) => {
        if (showLoader) {
            setLoadingAvailability(true)
        }

        ProtectedAxios.get(`/api/user/room/${room_id}/availability`)
            .then(res => {
                setAvailability(res.data)
                setLoadingAvailability(false)
            })
            .catch(err => {
                console.log(err);
                setLoadingAvailability(false)
            })
    }

    useEffect(() => {
        if (socket) {
            socket.on("room_booked", (data: BookingDetail) => {
                getAvailabilityStatus(false)
                // if (data.session_id !== session?.session_id) {
                //     // only for other users and not the one who booked
                // }
            })

            socket.on("room_unbooked", (data: { deleted_booking_detail_id: number, session_id: number }) => {
                getAvailabilityStatus(false)
                // if (data.session_id !== session?.session_id) {
                //     // only for other users and not the one who unbooked
                // }
            })
        }
    }, [])

    return (
        <div className=''>
            {
                loadingAvalability
                    ? <Skeleton className='w-[8rem] h-4' />

                    :
                    !avalability.status
                        ? "-"
                        :
                        <p className={`text-right`} style={{ color: avalability.color }}>{avalability.status}</p>
            }
        </div>
    )
}

export default AvailabilityStatus