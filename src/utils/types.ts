export type Tag = {
    tag_id: number,
    tag_name: string
}
type TagRef = {
    tag_ref: Tag
}
export type BookingDetail = {
    booking_detail_id: number,
    session_id: number,
    room_id: number,
    booking_date: string,
    booking_time_slot: string,
}
export type Room = {
    room_id: number,
    room_name: string,
    room_description: string,
    room_capacity: number,
    Tags: TagRef[],
    BookingDetail?: BookingDetail[]
}