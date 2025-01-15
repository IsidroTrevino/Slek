import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import Picker from "emoji-picker-react";
import { useState } from "react";

interface EmojiPopoverProps {
  children: React.ReactNode;
  hint?: string;
  onEmojiSelect: (emoji: any) => void;
}

export const EmojiPopover = ({ children, hint = "emoji", onEmojiSelect }: EmojiPopoverProps) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const onSelect = (emoji: any) => {
    onEmojiSelect(emoji);
    setPopoverOpen(false);

    setTimeout(() => {
      setTooltipOpen(false);
    }, 500);
  }

  return (
    <TooltipProvider>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen} delayDuration={50}>
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>
              {children}
            </TooltipTrigger>
          </PopoverTrigger>
          <TooltipContent className="bg-black text-white border border-white/5">
            <p className="text-xs font-medium">{hint}</p>
          </TooltipContent>
        </Tooltip>
        <PopoverContent className="p-0 w-full border-none shadow-none">
          <Picker onEmojiClick={(emojiObject) => onSelect(emojiObject)}/>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
};