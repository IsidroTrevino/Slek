import Quill, { Delta, QuillOptions, Op } from 'quill';
import "quill/dist/quill.snow.css";
import { RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button } from './button';
import { PiTextAa } from 'react-icons/pi';
import { ImageIcon, Keyboard, Smile } from 'lucide-react';
import { MdSend } from 'react-icons/md';
import { Hint } from '../hint';
import { cn } from '@/lib/utils';

type EditorValue = {
    image: File | null;
    body: string;
}

interface EditorProps {
    variant?: 'create' | 'update';
    onSubmit: ({image, body}: EditorValue) => void;
    onCancel?: () => void;
    placeholder?: string;
    defaultValue?: Delta | Op[];
    disabled?: boolean;
    innerRef?: RefObject<Quill | null>;
}

const Editor = ({variant = 'create', onCancel, onSubmit, placeholder = "Share your thoughts...", defaultValue = [], disabled = false, innerRef}: EditorProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const submitRef = useRef(onSubmit);
    const placeholderRef = useRef(placeholder);
    const quillRef = useRef<Quill | null>(null);
    const defaultValueRef = useRef(defaultValue);
    const disabledRef = useRef(disabled);

    const [text, setText] = useState('');
    const [isToolbarVisible, setToolbarVisible] = useState(false);

    useLayoutEffect(() => {
        submitRef.current = onSubmit;
        placeholderRef.current = placeholder;
        defaultValueRef.current = defaultValue;
        disabledRef.current = disabled;
    });

    useEffect(() => {
        if(!containerRef.current) return;

        const container = containerRef.current;
        const editorContainer = container.appendChild(container.ownerDocument.createElement("div"));

        const options: QuillOptions = {
            theme: "snow",
            placeholder: placeholderRef.current,
            modules: {
                toolbar: [
                    ["bold", "italic", "underline", "strike"],
                    ["link"],
                    [{ list: "ordered" }, { list: "bullet" }],
                ],
                keyboard: {
                    bindings: {
                        enter: {
                            key: "Enter",
                            handler: () => {
                                //submit form
                                return;
                            }
                        },
                        shift_enter: {
                            key: "Enter",
                            shift: true,
                            handler: () => {
                                quill.insertText(quill.getSelection()?.index || 0, "\n");
                            }
                        }
                    }
                }
            }
        }

        const quill = new Quill(editorContainer, options);
        quillRef.current = quill;
        quillRef.current.focus();

        if(innerRef) {
            innerRef.current = quill;
        }

        quill.setContents(defaultValueRef.current);
        setText(quill.getText());

        quill.on(Quill.events.TEXT_CHANGE, () => {
            setText(quill.getText());
        });

        return () => {
            quill.off(Quill.events.TEXT_CHANGE);
            if(container) {
                container.innerHTML = "";
            }
            if(quillRef.current) {
                quillRef.current = null;
            }
            if(innerRef) {
                innerRef.current = null;
            }
        }
    }, [innerRef]);

    const isEmpty = text.replace(/<\/?[^>]+(>|$)/g, "").trim().length === 0;

    const toggleToolbar = () => {
        setToolbarVisible(!isToolbarVisible);
        const toolbarElemnent = containerRef.current?.querySelector('.ql-toolbar');

        if(toolbarElemnent) {
            toolbarElemnent.classList.toggle('hidden');
        }
    };

    return (
        <div className="flex flex-col">
            <div className="flex flex-col border border-slate-200 rounded-e overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm transition bg-white">
                <div ref={containerRef} className='h-full ql-custom'/>
                <div className='flex px-2 pb-2 z-[5]'>
                    <Hint label={isToolbarVisible ? 'Show formatting' : 'Hide formatting'}>
                        <Button disabled={disabled} size={'iconsm'} variant={'ghost'} onClick={toggleToolbar}>
                            <PiTextAa className='size-4'/>
                        </Button>
                    </Hint>
                    <Hint label='Emoji'>
                        <Button disabled={disabled} size={'iconsm'} variant={'ghost'} onClick={() => {}}>
                            <Smile className='size-4'/>
                        </Button>
                    </Hint>
                    {variant === 'create' && (
                        <Hint label='Image'>
                            <Button disabled={disabled} size={'iconsm'} variant={'ghost'} onClick={() => {}}>
                                <ImageIcon className='size-4'/>
                            </Button>
                        </Hint>
                    )}
                    {variant === 'update' && (
                        <div className='ml-auto flex items-center gap-x-2'>
                            <Button variant={'outline'} size={'sm'} onClick={() => {}} disabled={disabled}>
                                Cancel
                            </Button>
                            <Button variant={'outline'} size={'sm'} onClick={() => {}} disabled={disabled || isEmpty} className='bg-[#007a5a] hover:bg-[#007a5a]/80 text-white'>
                                Save
                            </Button>
                        </div>
                    )}
                    {variant === 'create' && (
                        <Button disabled={disabled || isEmpty} onClick={() => {}} size={'iconsm'} className={cn('ml-auto', 
                            isEmpty 
                            ? 'bg-white hover:bg-white text-muted-foreground'
                            : 'bg-[#007a5a] hover:bg-[#007a5a]/80 text-white'
                        )}>
                            <MdSend className='size-4'/>
                        </Button>
                    )}
                </div>
            </div>
            <div className='p-2 text-[10px] text-muted-foreground flex justify-end'>
                <p>
                    <strong>Shift + enter </strong>to add a a new line
                </p>
            </div>
        </div>
    );
}

export default Editor;