import { Doc, Id } from "../../convex/_generated/dataModel";
import dynamic from "next/dynamic";
import { format, isToday, isYesterday } from "date-fns";
import { Hint } from "./hint";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Thumbnail } from "./thumbnail";
import { Toolbar } from "./toolbar";
import { useUpdateMessage } from "@/features/messages/api/useUpdateMessage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/features/auth/hooks/useConfirm";
import { useDeleteMessage } from "@/features/messages/api/useDeleteMessage";
import { useToggleReaction } from "@/features/reactions/api/useToggleReaction";
import { Reactions } from "./reactions";

const Renderer = dynamic(() => import("./renderer"), {ssr: false});
const Editor = dynamic(() => import("./ui/editor"), {ssr: false});

interface MessageProps {
    id: Id<"messages">;
    memberId: Id<"members">;
    authorImage?: string;
    authorName: string;
    isAuthor: boolean;
    reactions: Array<Omit<Doc<"reactions">, "memberid">> & { count: number, memberIds: Id<"members">[] };
    body: Doc<"messages">["body"];
    image: string | null | undefined;
    createdAt: Doc<"messages">["_creationTime"];
    updatedAt: Doc<"messages">["updatedAt"];
    isEditing: boolean;
    isCompact?: boolean;
    setEditingId: (id: Id<"messages"> | null) => void;
    hideThreadButton?: boolean;
    threadCount?: number;
    threadImage?: string;
    threadTimestamp?: number;
}

const formatFullTime = (date: Date) => {
    return `${isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "EEEE, MMMM d")} at ${format(date, "h:mm:ss a")}`;
}

export const Message = ({id, memberId, authorImage, authorName = "member", isAuthor, reactions, body, image, createdAt, updatedAt, isEditing, isCompact, setEditingId, hideThreadButton, threadCount, threadImage, threadTimestamp}: MessageProps) => {
    const {mutate: updateMessage, isPending: isUpdatingMessage} = useUpdateMessage();
    const {mutate: deleteMessage, isPending: isDeletingMessage} = useDeleteMessage();
    const {mutate: toggleReaction, isPending: isTogglingReaction} = useToggleReaction();

    const [ConfirmDialog, confirm] = useConfirm("Delete message", "Are you sure you want to delete this message?");

    const isPending = isUpdatingMessage;
    const handleReaction = (value: string) => {
        toggleReaction({messageId: id, value}, {
            onError: () => {
                toast.error("Failed to add reaction");
            }
        });
    }

    const handleUpdate = ({body}: {body: string}) => {
        updateMessage({messageId: id, body}, {
            onSuccess: () => {
                toast.success("Message updated successfully");
                setEditingId(null);
            },
            onError: () => {
                toast.error("Failed to update message");
            }
        });
    }

    const handleDelete = async  () => {
        const ok = await confirm();
        if (!ok) return;

        deleteMessage({messageId: id}, {
            onSuccess: () => {
                toast.success("Message deleted successfully");
            },
            onError: () => {
                toast.error("Failed to delete message");
            }
        });
    }
    
    if(isCompact) {
        return (
            <>
                <ConfirmDialog/>
                <div className={cn("flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative", 
                    isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]",
                    isDeletingMessage && "bg-gray-500/50 transform transition-all scale-y-0 origin-bottom duration-200"
                )}>
                    <div className="flex items-start gap-2">
                        <Hint label={formatFullTime(new Date(createdAt))}>
                            <button className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline">
                                {format(new Date(createdAt), "HH:mm")}
                            </button>
                        </Hint>
                        {isEditing ? (
                        <div className="h-full w-full">
                            <Editor onSubmit={handleUpdate} disabled={isPending} defaultValue={JSON.parse(body)} onCancel={() => setEditingId(null)} variant="update"/>
                        </div>
                    ) : (
                        <div className="flex flex-col w-full">
                            <Renderer value={body}/>
                            <Thumbnail url={image}/>
                            {
                                updatedAt ? (
                                    <span className="text-xs text-muted-foreground">(Edited)</span>
                                ) : null
                            }
                            <Reactions data={reactions} onChange={handleReaction}/>
                        </div>
                    )}
                    </div>
                    {!isEditing && (
                        <Toolbar
                            isAuthor={isAuthor}
                            isPending={isPending}
                            handleEdit={() => setEditingId(id)}
                            handleThread={() => {}}
                            handleDelete={handleDelete}
                            handleReaction={handleReaction}
                            hideThreadButton={hideThreadButton}
                        />
                    )}
                </div>
            </>
        );
    }

    const avatarFallback = authorName.charAt(0).toUpperCase();
    return (
        <>
            <ConfirmDialog/>
            <div className={cn("flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative", 
                isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]",
                isDeletingMessage && "bg-gray-500/50 transform transition-all scale-y-0 origin-bottom duration-200"
            )}>
                <div className="flex items-start gap-2">
                    <button>
                        <Avatar className="rounded-md">
                            <AvatarImage src={authorImage}/>
                            <AvatarFallback>
                                {avatarFallback}
                            </AvatarFallback>
                        </Avatar>
                    </button>
                    {isEditing ? (
                        <div className="h-full w-full">
                            <Editor onSubmit={handleUpdate} disabled={isPending} defaultValue={JSON.parse(body)} onCancel={() => setEditingId(null)} variant="update"/>
                        </div>
                    ) : (
                        <div className="flex flex-col w-full overflow-hidden">
                            <div className="text-sm">
                                <button className="font-bold text-primary hover:underline" onClick={() => {}}>
                                    {authorName}
                                </button>
                                <span>&nbsp;&nbsp;</span>
                                <Hint label={formatFullTime(new Date(createdAt))}>
                                    <button className="text-xs text-muted-foreground hover:underline">
                                        {format(new Date(createdAt), "h:mm a")}
                                    </button>
                                </Hint>
                            </div>
                            <Renderer value={body}/>
                            <Thumbnail url={image}/>
                            {
                                updatedAt ? (
                                    <span className="text-xs text-muted-foreground">(Edited)</span>
                                ) : null
                            }
                            <Reactions data={reactions} onChange={handleReaction}/>
                        </div>
                    )}
                </div>
                {!isEditing && (
                    <Toolbar
                        isAuthor={isAuthor}
                        isPending={isPending}
                        handleEdit={() => setEditingId(id)}
                        handleThread={() => {}}
                        handleDelete={handleDelete}
                        handleReaction={handleReaction}
                        hideThreadButton={hideThreadButton}
                    />
                )}
            </div>
        </>
    );
}