
import { useChannelId } from "@/features/auth/hooks/useChannelId";
import { useWorkspaceId } from "@/features/auth/hooks/useWorkspaceId";
import { useCreateMessage } from "@/features/messages/api/useCreateMessage";
import dynamic from "next/dynamic";
import Quill from "quill";
import { useRef, useState } from "react";
import { toast } from "sonner";

const Editor = dynamic(() => import("@/components/ui/editor"), {ssr: false});

interface ChatInputProps {
    placeholder?: string;
}

export const ChatInput = ({placeholder}: ChatInputProps) => {
    const editorRef = useRef<Quill | null>(null);
    const { mutate: createMessage } = useCreateMessage();
    const [editorKey, setEditorKey] = useState(0);
    const [isPending, setIsPending] = useState(false);

    const workspaceId = useWorkspaceId();
    const channelId = useChannelId();
    
    const handleSubmit = async ({body, image} : {body: string, image: File | null}) => {
        try {
            setIsPending(true);
            createMessage({body, workspaceId, channelId}, {throwError: true});
            setEditorKey((prev) => prev + 1)
        } catch(error) {
            toast.error("Failed to send message");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div className="px-5 w-full">
            <Editor key={editorKey} placeholder={placeholder} onSubmit={handleSubmit} disabled={isPending} innerRef={editorRef} />
        </div>
    );
}