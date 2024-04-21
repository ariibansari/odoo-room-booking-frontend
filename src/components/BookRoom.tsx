import ProtectedAxios from '@/api/protectedAxios'
import { useEffect, useState } from 'react'
import { toast } from './ui/use-toast'
import { LoaderCircle } from 'lucide-react'
import { Calendar } from "@/components/ui/calendar"
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { Room } from '@/utils/types'


const BookRoom = ({ room, sheetState }: { room: Room, sheetState: boolean }) => {
    const [loadingRoomDetails, setLoadingRoomDetails] = useState(true)
    const [roomDetails, setRoomDetails] = useState()

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

    const [timeSlots, setTimeSlots] = useState([
        { time_range: "10:00 - 10:30" },
        { time_range: "10:30 - 11:00" },
        { time_range: "11:00 - 11:30" },
        { time_range: "11:30 - 12:00" },
        { time_range: "12:00 - 12:30" },
        { time_range: "12:30 - 01:00" },
        { time_range: "02:00 - 02:30" },
        { time_range: "02:30 - 03:00" },
        { time_range: "03:00 - 03:30" },
        { time_range: "03:30 - 04:00" },
        { time_range: "04:00 - 04:30" },
        { time_range: "04:30 - 05:00" },
        { time_range: "05:00 - 05:30" },
        { time_range: "05:30 - 06:00" },
        { time_range: "06:00 - 06:30" },
        { time_range: "06:30 - 07:00" },
    ])
    const [selectedTimeRange, setSelectedTimeRange] = useState("")

    const [bookingRoom, setBookingRoom] = useState(false)

    useEffect(() => {
        if (sheetState) {
            getRoomDetails()
        }
    }, [sheetState])

    const getRoomDetails = () => {
        setLoadingRoomDetails(true)
        ProtectedAxios.get(`/api/user/roomDetails/${room.room_id}`)
            .then(res => {
                setRoomDetails(res.data)
                setLoadingRoomDetails(false)
            })
            .catch(err => {
                console.log(err);
                toast({
                    variant: "destructive",
                    title: "Could not get chat details at the moment"
                })
                setLoadingRoomDetails(false)
            })
    }

    const handleTimeSlotClick = (_time_range: string) => {
        if (_time_range === selectedTimeRange) {
            setSelectedTimeRange("")
        } else {
            setSelectedTimeRange(_time_range)
        }
    }

    const confirmBooking = () => {
        if (selectedDate && selectedTimeRange) {
            setBookingRoom(true)
            ProtectedAxios.post("/api/user/room/book", { room_id: room.room_id, selectedDate, selectedTimeRange })
                .then(res => {
                    setBookingRoom(false)
                    toast({
                        title: `Booking confirmed | ${room.room_name}`,
                        description: `on ${format(selectedDate, "dd/MM/yyyy")} from ${selectedTimeRange}`
                    })
                    getRoomDetails()
                })
                .catch(err => {
                    console.log(err);
                    toast({
                        variant: "destructive",
                        title: "Could not confirm your booking at the moment, please try again!"
                    })
                    setBookingRoom(false)
                    getRoomDetails()
                })
        }
    }

    return (
        <div>
            {
                loadingRoomDetails
                    ?
                    <section className='h-[80dvh] flex justify-center items-center'>
                        <LoaderCircle className='animate-spin' size={35} />
                    </section >

                    :
                    <section className=''>
                        <h3 className='mt-10 text-lg font-medium'>Select Booking Details</h3>
                        <hr className='my-5' />
                        <div className='flex gap-7 items-end flex-wrap md:flex-nowrap'>
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                fromDate={new Date()}
                                className=""
                                disabled={bookingRoom}
                            />

                            <div className='flex justify-start flex-wrap gap-6'>
                                {timeSlots.map((slot, i) => (
                                    <button
                                        key={i}
                                        className={`text-sm border outline outline-transparent px-2 py-3 rounded-md transition-all disabled:opacity-60 ${selectedTimeRange === slot.time_range ? "border border-primary outline-1 outline-primary" : ""}`}
                                        onClick={() => handleTimeSlotClick(slot.time_range)}
                                        disabled={bookingRoom}
                                    >
                                        {slot.time_range}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <hr className='my-8' />

                        <div className='pt-5 flex items-end flex-col'>
                            <Button
                                size="lg"
                                disabled={!selectedDate || !selectedTimeRange || bookingRoom}
                                className='gap-2'
                                onClick={confirmBooking}
                            >
                                Book Room
                                {bookingRoom
                                    &&
                                    <LoaderCircle className='animate-spin' size={20} />
                                }
                            </Button>

                            {!selectedDate
                                ? <p className='text-destructive text-sm mt-2 px-1'>* pick a day to continue</p>
                                : <p className='text-primary/80 text-sm mt-2 px-1'>on {format(selectedDate, "dd/MM/yyyy")}</p>
                            }


                            {!selectedTimeRange
                                ? <p className='text-destructive text-sm mt-1 px-1'>* pick a time slot to continue</p>
                                : <p className='text-primary/80 text-sm mt-1 px-1'>from {selectedTimeRange}</p>
                            }

                        </div>
                    </section>
            }
        </div>
    )
}

export default BookRoom