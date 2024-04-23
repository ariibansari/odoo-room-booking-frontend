import ProtectedAxios from '@/api/protectedAxios'
import { useContext, useEffect, useState } from 'react'
import { toast } from './ui/use-toast'
import { LoaderCircle } from 'lucide-react'
import { Calendar } from "@/components/ui/calendar"
import { Button } from '@/components/ui/button'
import { format, getDate, isSameDay } from 'date-fns'
import { BookingDetail, Room } from '@/utils/types'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { SessionContext } from '@/context/SessionProvider'
import { SocketContext } from '@/context/SocketProvider'


const BookRoom = ({ room, sheetState }: { room: Room, sheetState: boolean }) => {
    const { session } = useContext(SessionContext)
    const { socket } = useContext(SocketContext)

    const [loadingRoomDetails, setLoadingRoomDetails] = useState(true)
    const [roomDetails, setRoomDetails] = useState<Room>()

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

    const [timeSlots, setTimeSlots] = useState([
        { display_time_range: "10:00 - 10:30", time_range: "10:00 - 10:30" },
        { display_time_range: "10:30 - 11:00", time_range: "10:30 - 11:00" },
        { display_time_range: "11:00 - 11:30", time_range: "11:00 - 11:30" },
        { display_time_range: "11:30 - 12:00", time_range: "11:30 - 12:00" },
        { display_time_range: "12:00 - 12:30", time_range: "12:00 - 12:30" },
        { display_time_range: "12:30 - 01:00", time_range: "12:30 - 13:00" },
        { display_time_range: "02:00 - 02:30", time_range: "14:00 - 14:30" },
        { display_time_range: "02:30 - 03:00", time_range: "14:30 - 15:00" },
        { display_time_range: "03:00 - 03:30", time_range: "15:00 - 15:30" },
        { display_time_range: "03:30 - 04:00", time_range: "15:30 - 16:00" },
        { display_time_range: "04:00 - 04:30", time_range: "16:00 - 16:30" },
        { display_time_range: "04:30 - 05:00", time_range: "16:30 - 17:00" },
        { display_time_range: "05:00 - 05:30", time_range: "17:00 - 17:30" },
        { display_time_range: "05:30 - 06:00", time_range: "17:30 - 18:00" },
        { display_time_range: "06:00 - 06:30", time_range: "18:00 - 18:30" },
        { display_time_range: "06:30 - 07:00", time_range: "18:30 - 19:00" },
    ])
    const [selectedTimeRange, setSelectedTimeRange] = useState("")

    const [bookingRoom, setBookingRoom] = useState(false)
    const [unbookingRoom, setUnbookingRoom] = useState(false)

    useEffect(() => {
        if (sheetState) {
            getRoomDetails()
        }
    }, [sheetState])

    const getRoomDetails = (showLoading = true) => {
        if (showLoading) {
            setLoadingRoomDetails(true)
        }
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
                        variant: "success",
                        title: `Booking confirmed | ${room.room_name}`,
                        description: `on ${format(selectedDate, "dd/MM/yyyy")} from ${selectedTimeRange}`
                    })
                    getRoomDetails(false)
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


    const unbookRoom = () => {
        if (selectedDate && selectedTimeRange && roomDetails?.BookingDetail) {

            let booking = roomDetails.BookingDetail.filter(booking => isSameDay(booking.booking_date, selectedDate) && booking.booking_time_slot === selectedTimeRange)

            if (booking.length > 0 && booking[0].booking_detail_id) {
                let booking_detail_id = booking[0].booking_detail_id
                setUnbookingRoom(true)
                ProtectedAxios.post("/api/user/room/unbook", { session_id: session?.session_id, booking_detail_id })
                    .then(res => {
                        setRoomDetails(prev => {
                            if (prev?.BookingDetail) {
                                prev.BookingDetail = prev?.BookingDetail?.filter(booking => booking.booking_detail_id !== booking_detail_id)
                            }
                            return prev
                        })

                        toast({
                            title: `Unbooked | ${room.room_name}`,
                            description: `on ${format(selectedDate, "dd/MM/yyyy")} from ${selectedTimeRange}`
                        })

                        setUnbookingRoom(false)
                    })
                    .catch(err => {
                        console.log(err);
                        toast({
                            variant: "destructive",
                            title: "Could not unbook your booking at the moment, please try again!"
                        })
                        setUnbookingRoom(false)
                    })
            }
        }
    }


    useEffect(() => {
        if (socket) {
            socket.on("room_booked", (data: BookingDetail) => {
                if (data.session_id !== session?.session_id) {
                    // only for other users and not the one who booked
                    getRoomDetails(false)
                }
            })

            socket.on("room_unbooked", (data: { deleted_booking_detail_id: number, session_id: number }) => {
                if (data.session_id !== session?.session_id) {
                    // only for other users and not the one who unbooked
                    getRoomDetails(false)
                }
            })
        }
    }, [])

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
                        {/* {roomDetails?.BookingDetail && roomDetails.BookingDetail[11].booking_date} - 
                        {roomDetails?.BookingDetail && format(roomDetails.BookingDetail[11].booking_date, "yyyy/MM/dd")} - {selectedDate && format(selectedDate, "yyyy/MM/dd")}
                        <br />
                        {selectedDate && roomDetails?.BookingDetail && isSameDay(roomDetails.BookingDetail[11].booking_date, selectedDate) ? "yes" : "no"} */}
                        <div className='flex gap-7 items-end flex-wrap md:flex-nowrap'>
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                // fromDate={new Date()}
                                className=""
                                disabled={bookingRoom}
                            />

                            <div className='flex justify-start flex-wrap gap-6'>
                                {timeSlots.map((slot, i) => (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <button
                                                    key={i}
                                                    className={`
                                                    text-sm border outline outline-transparent px-2 py-3 rounded-md transition-all disabled:opacity-70 
                                                    ${selectedTimeRange === slot.time_range ? "border border-primary outline-1 outline-primary" : ""}
                                                    ${selectedDate && roomDetails?.BookingDetail?.some(booking => booking.booking_time_slot === slot.time_range && isSameDay(format(booking.booking_date, "yyyy/MM/dd"), format(selectedDate, "yyyy/MM/dd")))
                                                            ? roomDetails.BookingDetail.findIndex(booking => booking.session_id === session?.session_id && booking.booking_time_slot === slot.time_range && isSameDay(format(booking.booking_date, "yyyy/MM/dd"), format(selectedDate, "yyyy/MM/dd"))) >= 0
                                                                ? "bg-green-200"
                                                                : "bg-destructive/70"
                                                            : ""
                                                        }
                                                    `}
                                                    onClick={() => handleTimeSlotClick(slot.time_range)}
                                                    disabled={
                                                        bookingRoom ||
                                                        (selectedDate && roomDetails?.BookingDetail?.some(booking => booking.booking_time_slot === slot.time_range && isSameDay(format(booking.booking_date, "yyyy/MM/dd"), format(selectedDate, "yyyy/MM/dd"))) && !(roomDetails.BookingDetail.findIndex(booking => booking.session_id === session?.session_id && booking.booking_time_slot === slot.time_range && isSameDay(format(booking.booking_date, "yyyy/MM/dd"), format(selectedDate, "yyyy/MM/dd"))) >= 0))
                                                    }
                                                >
                                                    {slot.display_time_range}
                                                </button>
                                            </TooltipTrigger>

                                            <TooltipContent>
                                                <p>
                                                    {selectedDate && roomDetails?.BookingDetail?.some(booking => booking.booking_time_slot === slot.time_range && isSameDay(format(booking.booking_date, "yyyy/MM/dd"), format(selectedDate, "yyyy/MM/dd")))
                                                        ? roomDetails.BookingDetail.findIndex(booking => booking.session_id === session?.session_id && booking.booking_time_slot === slot.time_range && isSameDay(format(booking.booking_date, "yyyy/MM/dd"), format(selectedDate, "yyyy/MM/dd"))) >= 0
                                                            ? "Your booking, click to unbook"
                                                            : "Already booked!"
                                                        : "Select time slot"
                                                    }
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                            </div>
                        </div>

                        <hr className='my-8' />

                        <div className='pt-5 flex items-end flex-col'>
                            {selectedDate && selectedTimeRange && roomDetails?.BookingDetail && roomDetails.BookingDetail.findIndex(booking => booking.session_id === session?.session_id && booking.booking_time_slot === selectedTimeRange && isSameDay(booking.booking_date, selectedDate)) >= 0
                                ?
                                < Button
                                    size="lg"
                                    disabled={!selectedDate || !selectedTimeRange || unbookingRoom}
                                    className='gap-2'
                                    onClick={unbookRoom}
                                >
                                    Unbook
                                    {unbookingRoom
                                        &&
                                        <LoaderCircle className='animate-spin' size={20} />
                                    }
                                </Button>

                                :
                                < Button
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
                            }

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
        </div >
    )
}

export default BookRoom