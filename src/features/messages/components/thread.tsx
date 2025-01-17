import { Button } from "@/components/ui/button";
import { Id } from "../../../../convex/_generated/dataModel";
import { AlertTriangle, Loader, MessageCircleReply, XIcon } from "lucide-react";
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

const Editor = dynamic(() => import("@/components/ui/editor"), {ssr: false});

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
                const url = await generateUploadURL({}, {throwError: true});

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

    if (isLoadingMessage) {
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
            <div>
                <Message 
                    hideThreadButton
                    memberId={message.memberId}
                    authorImage={message.user.image}
                    authorName={message.user.name}
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