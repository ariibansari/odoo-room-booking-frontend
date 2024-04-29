import ProtectedAxios from "@/api/protectedAxios"
import { Input } from "@/components/ui/input"
import { ArrowRight, ArrowUpDown, CircleSlash2, Search, Tags, X } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "./ui/use-toast"
import { Room as RoomType, Tag } from "@/utils/types"
import Room from "./Room"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Skeleton } from "./ui/skeleton"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


const Rooms = () => {
    const [searchText, setSearchText] = useState("")
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null); // Timeout for debounce
    const [loadingRooms, setLoadingRooms] = useState(true)
    const [rooms, setRooms] = useState<RoomType[]>([])


    const [tagsPopoverState, setTagsPopoverState] = useState(false)
    const [loadingTags, setLoadingTags] = useState(false)
    const [tagSearchText, setTagSearchText] = useState("")
    const [tagSearchTypingTimeout, setTagSearchTypingTimeout] = useState<NodeJS.Timeout | null>(null); // Timeout for debounce
    const [tags, setTags] = useState<Tag[]>([])
    const [backupTags, setBackupTags] = useState<Tag[]>([])

    const [selectedTags, setSelectedTags] = useState<Tag[]>([])
    const [sortBy, setSortBy] = useState("none")


    
    useEffect(() => {
        getRooms(searchText, selectedTags, sortBy)
    }, [])

    useEffect(() => {
        if (tagsPopoverState) {
            getTags()
        }
    }, [tagsPopoverState])



    const getRooms = (text: string, tags: Tag[], sortBy = "none", showLoadingState = true) => {
        if (showLoadingState) {
            setLoadingRooms(true)
        }

        ProtectedAxios.post("/api/user/room/all", { searchedText: text, selectedTags: tags, sortBy })
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


    const handleSearchTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchText = e.target.value;
        setSearchText(newSearchText);

        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        setTypingTimeout(setTimeout(() => {
            getRooms(newSearchText, selectedTags, sortBy);
        }, 500));
    };


    const getTags = () => {
        setLoadingTags(true)
        ProtectedAxios.post("/api/user/tags", { selectedTags })
            .then(res => {
                setTags(res.data)
                setBackupTags(res.data)
                setLoadingTags(false)
            })
            .catch(() => {
                setLoadingTags(false)
                toast({
                    variant: "destructive",
                    title: "Could not get tags at the moment please try again later"
                })
            })
    }


    const handleTagSearchTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchText = e.target.value;
        setTagSearchText(newSearchText);

        if (tagSearchTypingTimeout) {
            clearTimeout(tagSearchTypingTimeout);
        }

        setTagSearchTypingTimeout(setTimeout(() => {
            filterTags(newSearchText);
        }, 500));
    };


    const filterTags = (text: string) => {
        setTags(() => {
            return backupTags?.filter(tag => tag.tag_name.toLowerCase().includes(text.toLowerCase()))
        })
    }


    const addSelectedTag = (_tag: Tag) => {
        const updatedTags = [...selectedTags]
        updatedTags.push(_tag)

        setSelectedTags(updatedTags)
        getRooms(searchText, updatedTags, sortBy)
        setTagsPopoverState(false)
    }


    const removeSelectedTag = (_tag: Tag) => {
        let updatedTags = selectedTags.filter(tag => tag.tag_id !== _tag.tag_id)
        setSelectedTags(updatedTags)
        getRooms(searchText, updatedTags, sortBy)
    }


    const handleSortByChange = (_sortBy: string) => {
        setSortBy(_sortBy)
        getRooms(searchText, selectedTags, _sortBy)
    }


    return (
        <section id="rooms" className="container py-10">
            <div className="flex flex-wrap items-center gap-5 lg:gap-10">
                <div className="relative">
                    <Search className="absolute top-[50%] translate-y-[-45%] left-4 w-4" />
                    <Input placeholder="search rooms" className="pl-10 w-[40rem] max-w-full" value={searchText} onChange={handleSearchTextChange} />
                </div>

                <div className="flex items-center gap-6">
                    <Popover open={tagsPopoverState} onOpenChange={setTagsPopoverState}>
                        <PopoverTrigger className="flex items-center gap-2"><Tags className="w-5 h-5" /> Filter</PopoverTrigger>
                        <PopoverContent className="w-[25rem]">
                            <div className="relative">
                                <Search className="absolute top-[50%] translate-y-[-45%] left-4 w-4" />
                                <Input placeholder="search tags" className="pl-10 w-[40rem] max-w-full" value={tagSearchText} onChange={handleTagSearchTextChange} />
                            </div>
                            <p className="text-primary/70 text-sm mt-5 mb-3 text-center">Select a tag to filter room</p>
                            <hr className="mb-5" />
                            <div className="flex gap-4 flex-wrap my-4">
                                {
                                    loadingTags
                                        ? [1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="w-24 h-7 rounded-full" />)

                                        :
                                        tags.length === 0
                                            ?
                                            <div className="flex flex-col items-center justify-center gap-1 my-4 w-full">
                                                <Tags className="w-5 h-5 text-primary/70" />
                                                <p className="text-sm text-primary/70">No tags found</p>
                                            </div>

                                            :
                                            tags.map((tag, i) => (
                                                <button
                                                    key={i}
                                                    className="px-4 py-1 rounded-full text-sm bg-primary/20 transition-all hover:bg-primary/15"
                                                    onClick={() => addSelectedTag(tag)}
                                                >
                                                    {tag.tag_name}
                                                </button>
                                            ))}
                            </div>
                        </PopoverContent>
                    </Popover>

                    <span className="h-4 w-[1px] bg-primary/50" />

                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <div className="flex items-center gap-2 relative">
                                <ArrowUpDown className="w-4 h-4" />
                                Sort Rooms

                                {sortBy !== "none"
                                    &&
                                    <span className="w-[9px] h-[9px] rounded-full bg-destructive absolute top-0 -left-2" />
                                }
                            </div>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent>
                            <DropdownMenuLabel>Sort Rooms</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="flex items-center gap-2 relative pl-6" onClick={() => handleSortByChange("none")}>None {sortBy === "none" && <span className="w-[7px] h-[7px] rounded-full bg-destructive absolute top-[50%] translate-y-[-50%] left-2" />}</DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2 relative pl-6" onClick={() => handleSortByChange("availability-low-to-high")}>Availability <span className="flex items-center text-primary/80 gap-1">(Highest <ArrowRight className="w-3 h-3" /> Lowest)</span> {sortBy === "availability-low-to-high" && <span className="w-[7px] h-[7px] rounded-full bg-destructive absolute top-[50%] translate-y-[-50%] left-2" />}</DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2 relative pl-6" onClick={() => handleSortByChange("availability-high-to-low")}>Availability <span className="flex items-center text-primary/80 gap-1">(Lowest <ArrowRight className="w-3 h-3" /> Highest)</span> {sortBy === "availability-high-to-low" && <span className="w-[7px] h-[7px] rounded-full bg-destructive absolute top-[50%] translate-y-[-50%] left-2" />}</DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2 relative pl-6" onClick={() => handleSortByChange("capacity-high-to-low")}>Capacity <span className="flex items-center text-primary/80 gap-1">(Highest <ArrowRight className="w-3 h-3" /> Lowest)</span> {sortBy === "capacity-high-to-low" && <span className="w-[7px] h-[7px] rounded-full bg-destructive absolute top-[50%] translate-y-[-50%] left-2" />}</DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2 relative pl-6" onClick={() => handleSortByChange("capacity-low-to-high")}>Capacity <span className="flex items-center text-primary/80 gap-1">(Lowest <ArrowRight className="w-3 h-3" /> Highest)</span> {sortBy === "capacity-low-to-high" && <span className="w-[7px] h-[7px] rounded-full bg-destructive absolute top-[50%] translate-y-[-50%] left-2" />}</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                </div>
            </div>



            <div className="flex flex-wrap gap-3 my-10">
                {selectedTags?.map((tag, i) => (
                    <div key={i} className="flex items-center gap-1 px-4 py-1 rounded-full bg-primary/15 transition-all hover:bg-primary/10">
                        <p>{tag.tag_name}</p>
                        <button onClick={() => removeSelectedTag(tag)}><X className="w-4 h-4" /></button>
                    </div>
                ))}
            </div>

            

            <div>
                {loadingRooms
                    ? ""

                    :
                    rooms.length === 0
                        ? <div className="h-[60dvh] flex flex-col gap-2 items-center justify-center">
                            <CircleSlash2 className="w-8 h-8 text-primary/60" />
                            <p className="text-primary/70">No room found!</p>
                        </div>

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