"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface TermLine {
  type: "input" | "output";
  text: string;
}

const HELP_TEXT = `Available commands:
  help      Show this message
  whoami    Display current user
  ls        List site sections
  cat       Read a file (try: about.txt)
  clear     Clear terminal
  exit      Close terminal
  rm -rf    You wouldn't dare...`;

const ABOUT_TEXT = `Ray Malik — aspiring reverse engineer and malware analyst.
Breaking down binaries, studying Windows internals, and
building tools from scratch. Learning in public at
MuffinManLabs. Reach out: hurayrah92@gmail.com`;

const LS_TEXT = `drwxr-xr-x  home/
drwxr-xr-x  about/
drwxr-xr-x  projects/
drwxr-xr-x  blog/
drwxr-xr-x  contact/`;

export default function SecretTerminal() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<TermLine[]>([]);
  const [input, setInput] = useState("");
  const [destroying, setDestroying] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addOutput = useCallback((text: string) => {
    setLines((prev) => [...prev, { type: "output", text }]);
  }, []);

  const handleCommand = useCallback(
    (cmd: string) => {
      const trimmed = cmd.trim().toLowerCase();
      setLines((prev) => [...prev, { type: "input", text: cmd }]);

      if (trimmed === "help") {
        addOutput(HELP_TEXT);
      } else if (trimmed === "whoami") {
        addOutput("visitor@muffinmanlabs");
      } else if (trimmed === "ls") {
        addOutput(LS_TEXT);
      } else if (trimmed === "cat about.txt") {
        addOutput(ABOUT_TEXT);
      } else if (trimmed === "clear") {
        setLines([]);
      } else if (trimmed === "exit") {
        setOpen(false);
        setLines([]);
      } else if (trimmed.startsWith("rm -rf") || trimmed.startsWith("rm -r")) {
        addOutput("Initiating system destruction...");
        setDestroying(true);
      } else if (trimmed === "") {
        // do nothing
      } else {
        addOutput(`command not found: ${trimmed}`);
      }

      setInput("");
    },
    [addOutput]
  );

  // Keyboard listener for ~ key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === "`" &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.metaKey &&
        !(
          document.activeElement instanceof HTMLInputElement ||
          document.activeElement instanceof HTMLTextAreaElement
        )
      ) {
        if (!open) {
          e.preventDefault();
          setOpen(true);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Focus input when terminal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // rm -rf destruction effect
  useEffect(() => {
    if (!destroying) return;

    const el = document.documentElement;
    const allElements = Array.from(
      document.body.querySelectorAll("*:not(.secret-terminal):not(.secret-terminal *)")
    ) as HTMLElement[];

    // Reverse so we delete from bottom up
    allElements.reverse();

    let i = 0;
    const interval = setInterval(() => {
      const batch = 8;
      for (let j = 0; j < batch && i < allElements.length; j++, i++) {
        allElements[i].style.opacity = "0";
        allElements[i].style.transform = "translateX(40px)";
        allElements[i].style.transition = "all 0.15s ease-out";
      }

      if (i >= allElements.length) {
        clearInterval(interval);
        setTimeout(() => {
          document.body.style.background = "#0a0a0a";
          setLines([
            { type: "output", text: "" },
            {
              type: "output",
              text: "System destroyed. Just kidding.",
            },
            { type: "output", text: "" },
            { type: "output", text: "Reloading in 3..." },
          ]);

          setTimeout(() => {
            // Restore everything
            allElements.forEach((el) => {
              el.style.opacity = "";
              el.style.transform = "";
              el.style.transition = "";
            });
            el.style.opacity = "";
            setDestroying(false);
            setOpen(false);
            setLines([]);
            window.scrollTo(0, 0);
          }, 3000);
        }, 500);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [destroying]);

  if (!open) return null;

  return (
    <div
      className="secret-terminal fixed inset-0 z-[10002] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !destroying) {
          setOpen(false);
          setLines([]);
        }
      }}
    >
      <div className="secret-terminal w-full max-w-2xl h-[420px] bg-[#0a0a0a] border border-[#00ff41]/30 flex flex-col mx-4 shadow-lg shadow-[#00ff41]/5">
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#00ff41]/20">
          <span className="font-mono text-xs text-[#00ff41]/60">
            visitor@muffinmanlabs:~$
          </span>
          {!destroying && (
            <button
              onClick={() => {
                setOpen(false);
                setLines([]);
              }}
              className="font-mono text-xs text-[#00ff41]/40 hover:text-[#00ff41] transition-colors cursor-pointer"
            >
              [x]
            </button>
          )}
        </div>

        {/* Output area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-3 font-mono text-xs leading-6"
        >
          {lines.length === 0 && (
            <div className="text-[#00ff41]/30">
              Type &quot;help&quot; for available commands.
            </div>
          )}
          {lines.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap">
              {line.type === "input" ? (
                <>
                  <span className="text-[#a855f7]">$ </span>
                  <span className="text-[#00ff41]">{line.text}</span>
                </>
              ) : (
                <span className="text-[#00ff41]/70">{line.text}</span>
              )}
            </div>
          ))}
        </div>

        {/* Input */}
        {!destroying && (
          <div className="flex items-center px-4 py-3 border-t border-[#00ff41]/10">
            <span className="font-mono text-xs text-[#a855f7] mr-2">$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCommand(input);
                } else if (e.key === "Escape") {
                  setOpen(false);
                  setLines([]);
                }
              }}
              className="flex-1 bg-transparent text-[#00ff41] font-mono text-xs outline-none caret-[#00ff41]"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
