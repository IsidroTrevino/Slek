import { Button } from "@/components/ui/button";
import { Id } from "../../../../convex/_generated/dataModel";
import { AlertTriangle, Loader, XIcon } from "lucide-react";
import { useGetMessage } from "../api/useGetMessage";
import { Message } from "@/components/message";
import { useCurrentMember } from "@/features/members/api/useCurrentMember";
import { useWorkspaceId } from "@/features/auth/hooks/useWorkspaceId";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import Quill from "quill";
import { useCreateMessage } from "../api/useCreateMessage";
import { useGenerateUploadUrl } from "@/features/upload/api/useGenerateUploadUrl";
import { useChannelId } from "@/features/auth/hooks/useChannelId";
import { toast } from "sonner";
import { useGetMessages } from "../api/useGetMessages";
import { differenceInMinutes, format, isSameDay, parseISO, startOfDay, subDays } from "date-fns";

const Editor = dynamic(() => import("@/components/ui/editor"), {ssr: false});

const TIME_THRESHOLD = 5;
interface ThreadProps {
    messageId: Id<"messages">;
    onClose: () => void;
}

type ThreadValues = {
    channelId: Id<"channels">;
    workspaceId: Id<"workspaces">;
    parentMessageId: Id<"messages">;
    body: string;
    image?: Id<"_storage"> | undefined;
}

const formatDateLabel = (dateKey: string) => {
    const today = startOfDay(new Date());
    const yesterday = subDays(today, 1);
    const messageDate = startOfDay(parseISO(dateKey));

    if (isSameDay(messageDate, today)) {
        return "Today";
    }
    
    if (isSameDay(messageDate, yesterday)) {
        return "Yesterday";
    }

    return format(messageDate, "MMMM d, yyyy");
};

export const Thread = ({messageId, onClose}: ThreadProps) => {
    const channelId = useChannelId();
    const workspaceId = useWorkspaceId();
    const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);
    const [editorKey, setEditorKey] = useState(0);
    const [isPending, setIsPending] = useState(false);
    const editorRef = useRef<Quill | null>(null);

    const { mutate: createMessage } = useCreateMessage();
    const { mutate: generateUploadURL} = useGenerateUploadUrl();

    const {data: message, isLoading: isLoadingMessage} = useGetMessage({messageId});
    const {data: currentMember} = useCurrentMember({workspaceId});
    const {results, status, loadMore} = useGetMessages({channelId, parentMessageId: messageId});

    const canLoadMore = status === "CanLoadMore";
    const isLoadingMore = status === "LoadingMore";

    const handleSubmit = async ({body, image} : {body: string, image: File | null}) => {
        try {
            setIsPending(true);
            editorRef?.current?.enable(false);

            const values: ThreadValues = {
                channelId,
                workspaceId,
                parentMessageId: messageId,
                body, 
                image: undefined
            };

            if (image) {
                const url = await generateUploadURL({throwError: true});

                if (!url) {
                    throw new Error("Failed to generate upload URL");
                }

                const result = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": image.type
                    },
                    body: image,
                });

                if (!result.ok) {
                    throw new Error("Failed to upload image");
                }

                const { storageId } = await result.json();

                values.image = storageId;
            }

            createMessage(values, {throwError: true});
            setEditorKey((prev) => prev + 1)
        } catch {
            toast.error("Failed to send message");
        } finally {
            setIsPending(false);
            editorRef?.current?.enable(true);
        }
    }

    const groupedMessages = results?.reduce((groups, message) => {
            const date = new Date(message._creationTime);
            const dateKey = format(date, "yyyy-MM-dd");
    
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
    
            groups[dateKey].unshift(message);
            return groups;
        },
            {} as Record<string, typeof results>
        );

    if (isLoadingMessage || status === "LoadingFirstPage" || isPending) {
        return (
            <div className="h-full flex flex-col">
                <div className="flex justify-between items-center p-2 border-b">
                    <p className="text-lg font-bold">Thread</p>
                    <Button onClick={onClose} variant={'ghost'} size={'iconsm'}>
                        <XIcon className="size-5 stroke=[1.5]"/>
                    </Button>
                </div>
                <div className="flex-1 grid place-items-center">
                    <div className="flex flex-col items-center gap-2">
                        <Loader className="size-5 animate-spin text-muted-foreground"/>
                    </div>
                </div>
            </div>
        )
    }

    if (!message) {
        return (
            <div className="h-full flex flex-col">
                <div className="flex justify-between items-center p-2 border-b">
                    <p className="text-lg font-bold">Thread</p>
                    <Button onClick={onClose} variant={'ghost'} size={'iconsm'}>
                        <XIcon className="size-5 stroke=[1.5]"/>
                    </Button>
                </div>
                <div className="flex-1 grid place-items-center">
                    <div className="flex flex-col items-center gap-2">
                        <AlertTriangle className="size-5 text-rose-500"/>
                        <p className="text-muted-foreground text-sm">
                            Message not found
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center p-2 border-b">
                <p className="text-lg font-bold">Thread</p>
                <Button onClick={onClose} variant={'ghost'} size={'iconsm'}>
                    <XIcon className="size-5 stroke=[1.5]"/>
                </Button>
            </div>
            <div className="flex-1 flex flex-col-reverse pb-4 overflow-y-auto messages-scrollbar">
                {
                    Object.entries(groupedMessages || {}).map(([dateKey, messages]) => (
                        <div key={dateKey}>
                            <div className="text-center my-2 relative">
                                <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
                                <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
                                    {formatDateLabel(dateKey)}
                                </span>
                            </div>
                            {messages.map((message, index) => {
                                const previousMessage = messages[index - 1];
                                const isCompact = previousMessage && previousMessage.user?._id === message.user?._id && differenceInMinutes(new Date(message._creationTime), new Date(previousMessage._creationTime)) < TIME_THRESHOLD;
                                
                                return (
                                    <Message 
                                        key={message._id}
                                        hideThreadButton
                                        memberId={message.memberId}
                                        authorImage={message.user.image}
                                        authorName={message.user.name ?? "Unknown User"}
                                        isAuthor={currentMember?._id === message.memberId}
                                        body={message.body}
                                        isCompact={isCompact}
                                        image={message.image}
                                        createdAt={message._creationTime}
                                        updatedAt={message.updatedAt}
                                        id={message._id}
                                        reactions={message.reactions}
                                        isEditing={editingId === message._id}
                                        setEditingId={setEditingId}
                                    />
                                );
                            })}
                        </div>
                    ))}
                    <div className="h-1" ref={(el) => {
                        if(el) {
                                const observer = new IntersectionObserver(([entry]) => {
                                    if(entry.isIntersecting && canLoadMore) {
                                        loadMore();
                                    }
                                }, {
                                    threshold: 1.0
                                }
                            );
                            observer.observe(el);
                            return () => observer.disconnect();
                        }
                    }}/>
                    {
                        isLoadingMore && (
                            <div className="text-center my-2 relative">
                                <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
                                <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
                                    <Loader className="size-4 animate-spin"/>
                                </span>
                            </div>
                        )
                    }
                <Message 
                    hideThreadButton
                    memberId={message.memberId}
                    authorImage={message.user.image}
                    authorName={message.user.name ?? "Unknown User"}
                    isAuthor={currentMember?._id === message.memberId}
                    body={message.body}
                    image={message.image}
                    createdAt={message._creationTime}
                    updatedAt={message.updatedAt}
                    id={message._id}
                    reactions={message.reactions}
                    isEditing={editingId === message._id}
                    setEditingId={setEditingId}
                />
            </div>
            <div className="px-4">
                <Editor key={editorKey} innerRef={editorRef} onSubmit={handleSubmit} disabled={false} placeholder="Reply"/>
            </div>
        </div>
    );
}