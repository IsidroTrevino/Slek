import { useWorkspaceId } from "@/features/auth/hooks/useWorkspaceId";
import { useCreateMessage } from "@/features/messages/api/useCreateMessage";
import { useGenerateUploadUrl } from "@/features/upload/api/useGenerateUploadUrl";
import dynamic from "next/dynamic";
import Quill from "quill";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Id } from "../../../../../../convex/_generated/dataModel";

const Editor = dynamic(() => import("@/components/ui/editor"), {ssr: false});

interface ChatInputProps {
    placeholder?: string;
    conversationId: Id<"conversations">;
}

type CreateMessageValues = {
    conversationId: Id<"conversations">;
    workspaceId: Id<"workspaces">;
    body: string;
    image?: Id<"_storage"> | undefined;
}

export const ChatInput = ({placeholder, conversationId}: ChatInputProps) => {
    const editorRef = useRef<Quill | null>(null);
    const { mutate: createMessage } = useCreateMessage();
    const [editorKey, setEditorKey] = useState(0);
    const [isPending, setIsPending] = useState(false);

    const {mutate: generateUploadURL} = useGenerateUploadUrl();
    const workspaceId = useWorkspaceId();
    
    const handleSubmit = async ({body, image} : {body: string, image: File | null}) => {
        try {
            setIsPending(true);
            editorRef?.current?.enable(false);

            const values: CreateMessageValues = {
                conversationId,
                workspaceId,
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

    return (
        <div className="px-5 w-full">
            <Editor key={editorKey} placeholder={placeholder} onSubmit={handleSubmit} disabled={isPending} innerRef={editorRef} />
        </div>
    );
}