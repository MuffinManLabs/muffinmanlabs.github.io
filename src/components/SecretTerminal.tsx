"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface TermLine {
  type: "input" | "output";
  text: string;
}

const HELP_TEXT = `Available commands:
  help        Show this message
  whoami      Display current user
  ls          List site sections
  cat         Read a file (try: about.txt)
  flash       Flash firmware to target
  gpio set    Set a GPIO pin (try: gpio set 13)
  clear       Clear terminal
  exit        Close terminal
  rm -rf      You wouldn't dare...`;

const ABOUT_TEXT = `MuffinManLabs — embedded systems and firmware engineering.
Writing C, talking to peripherals over SPI and I2C,
debugging with JTAG probes. Building bare metal drivers,
RTOS tasks, and custom firmware from scratch.`;

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
        addOutput("engineer@muffinmanlabs");
      } else if (trimmed === "ls") {
        addOutput(LS_TEXT);
      } else if (trimmed === "cat about.txt") {
        addOutput(ABOUT_TEXT);
      } else if (trimmed === "flash") {
        addOutput("Connecting via JTAG...\nErasing flash...\nWriting firmware...\nVerifying checksum... OK\nFlashing firmware... done.");
      } else if (trimmed.startsWith("gpio set")) {
        const pin = trimmed.replace("gpio set", "").trim();
        if (pin) {
          addOutput(`Pin ${pin} set HIGH. LED on.`);
        } else {
          addOutput("Usage: gpio set <pin>");
        }
      } else if (trimmed === "clear") {
        setLines([]);
      } else if (trimmed === "exit") {
        setOpen(false);
        setLines([]);
      } else if (trimmed.startsWith("rm -rf") || trimmed.startsWith("rm -r")) {
        addOutput("Corrupting firmware image...");
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

  // rm -rf bricking effect
  useEffect(() => {
    if (!destroying) return;

    // Hide everything except the terminal overlay
    const allElements = Array.from(
      document.body.querySelectorAll("*:not(.secret-terminal):not(.secret-terminal *)")
    ) as HTMLElement[];

    // Quick fade everything to black
    allElements.forEach((el) => {
      el.style.opacity = "0";
      el.style.transition = "opacity 0.3s ease-out";
    });

    setTimeout(() => {
      setLines([
        { type: "output", text: "" },
        { type: "output", text: "ERROR: Firmware corrupted. Device bricked." },
      ]);

      setTimeout(() => {
        setLines((prev) => [
          ...prev,
          { type: "output", text: "" },
          { type: "output", text: "Just kidding. Rebooting..." },
        ]);

        setTimeout(() => {
          allElements.forEach((el) => {
            el.style.opacity = "";
            el.style.transition = "";
          });
          setDestroying(false);
          setOpen(false);
          setLines([]);
          window.scrollTo(0, 0);
        }, 3000);
      }, 2000);
    }, 500);

    return () => {
      allElements.forEach((el) => {
        el.style.opacity = "";
        el.style.transition = "";
      });
    };
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
            engineer@muffinmanlabs:~$
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
