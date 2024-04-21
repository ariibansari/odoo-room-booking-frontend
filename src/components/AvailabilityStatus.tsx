import ProtectedAxios from '@/api/protectedAxios'
import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'


type Availability = {
    status: string,
    color: string
}

const AvailabilityStatus = ({ room_id }: { room_id: number }) => {
    const [loadingAvalability, setLoadingAvailability] = useState(true)
    const [avalability, setAvailability] = useState<Availability>({ status: "", color: "" })

    useEffect(() => {
        getAvailabilityStatus()
    }, [])

    const getAvailabilityStatus = () => {
        setLoadingAvailability(true)
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
    
    return (
        <div className=''>
            {
                loadingAvalability
                    ? <Skeleton className='w-[8rem] h-4' />

                    :
                    !avalability.status
                        ? "-"
                        :
                        <p className={`text-left`} style={{ color: avalability.color }}>{avalability.status}</p>
            }
        </div>
    )
}

export default AvailabilityStatus