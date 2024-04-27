import { Room as RoomType } from '@/utils/types'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { useState } from 'react'
import AvailabilityStatus from './AvailabilityStatus'
import BookRoom from './BookRoom'


const Room = ({ room, key }: { room: RoomType, key?: number }) => {
    const [sheetState, setSheetState] = useState(false)

    return (
        <Sheet open={sheetState} onOpenChange={setSheetState}>
            <SheetTrigger>
                <div key={key} className='rounded-md px-5 py-9 w-full h-full bg-gray-200/60 transition-all hover:bg-gray-200/80 border border-transparent hover:border-gray-200'>
                    <div className='flex justify-between items-center gap-5'>
                        <h4 className='text-left font-medium text-lg'>{room.room_name}</h4>
                        <AvailabilityStatus room_id={room.room_id} />
                    </div>
                    <p className='text-left text-primary/60 text-sm'>capacity for {room.room_capacity}</p>
                    <div className='flex flex-wrap gap-2 mt-5'>
                        {room.Tags.map((tag, i) => (
                            <span key={i} className='lowercase text-primary/80 bg-fuchsia-300/30 text-sm px-3 py-1 rounded-md hover:opacity-95 transition-all'>{tag.tag_ref.tag_name}</span>
                        ))}
                    </div>
                </div>
            </SheetTrigger>
            <SheetContent className='w-[60rem] max-w-full sm:max-w-[90vw] overflow-auto' style={{ maxWidth: "10rem !important" }}>
                <SheetHeader>
                    <SheetTitle className='text-2xl'>{room.room_name}</SheetTitle>
                    <SheetDescription>
                        <p>{room.room_description}</p>
                        <div className='flex flex-wrap gap-2 mt-4'>
                            {room.Tags.map((tag, i) => (
                                <span key={i} className='lowercase text-primary/90 bg-fuchsia-300/45 text-sm px-3 py-1 rounded-md hover:opacity-95 transition-all'>{tag.tag_ref.tag_name}</span>
                            ))}
                        </div>
                    </SheetDescription>

                    <BookRoom room={room} sheetState={sheetState} />

                </SheetHeader>
            </SheetContent>
        </Sheet>

    )
}

export default Room