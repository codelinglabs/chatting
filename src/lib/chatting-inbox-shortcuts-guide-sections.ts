import { cta, faq, list, paragraph, section } from "@/lib/blog-block-factories";

export const chattingInboxShortcutsGuideSections = [
  section("before-you-start", "Before you start", [
    list([
      "Open the inbox first",
      "Use `Cmd` on Mac and `Ctrl` on Windows",
      "Use `Ctrl/Cmd + /` any time to open the built-in shortcuts modal"
    ]),
    paragraph("This page mirrors the shortcuts already available in the Chatting inbox.")
  ]),
  section("keyboard-shortcuts", "Inbox keyboard shortcuts", [
    list([
      "`Ctrl/Cmd + K`: open the command palette",
      "`Ctrl/Cmd + /`: show keyboard shortcuts",
      "`Ctrl/Cmd + J`: suggest a reply for the active conversation",
      "`Ctrl/Cmd + Shift + S`: summarize the active conversation",
      "`Up / Down`: move through conversations in the inbox list",
      "`Enter`: open the selected conversation",
      "`Enter` in the reply box: send your message",
      "`Escape`: close overlays or clear the current selection",
      "`R`: mark the active conversation resolved or reopen it",
      "`N`: jump to search"
    ])
  ]),
  section("ai-assist", "AI Assist shortcuts", [
    list([
      "`Ctrl/Cmd + J`: open Suggest reply for the active conversation",
      "`Ctrl/Cmd + Shift + S`: open Summarize conversation for the active conversation"
    ]),
    paragraph("These shortcuts only work when a conversation is already open in the inbox.")
  ]),
  section("command-palette", "Command palette actions", [
    paragraph("Open the command palette with `Ctrl/Cmd + K` to search actions without leaving the keyboard."),
    list([
      "Focus search",
      "Show keyboard shortcuts",
      "Open widget settings",
      "Open visitors",
      "Open settings",
      "Suggest reply when AI reply is available",
      "Summarize conversation when AI summary is available",
      "Mark conversation resolved or reopen conversation"
    ])
  ]),
  section("check-shortcuts", "Check the shortcuts", [
    list([
      "Open the inbox",
      "Press `Ctrl/Cmd + /` and confirm the shortcuts modal opens",
      "Press `Ctrl/Cmd + K` and confirm the command palette opens",
      "Open a conversation and test `Ctrl/Cmd + J` or `Ctrl/Cmd + Shift + S`"
    ], true)
  ]),
  section("faq", "FAQ", [
    faq([
      {
        question: "Do these shortcuts work on Mac and Windows?",
        answer: "Yes. Use Cmd on Mac and Ctrl on Windows."
      },
      {
        question: "Will AI Assist shortcuts work for every teammate?",
        answer: "They work when AI Assist is available for that workspace and the teammate has an active conversation open."
      },
      {
        question: "Where can teammates see these inside the product?",
        answer: "Inside the inbox, use `Ctrl/Cmd + /` to open the keyboard shortcuts modal and `Ctrl/Cmd + K` to browse actions in the command palette."
      }
    ]),
    cta(
      "Need the shortcut list in the inbox?",
      "Open the inbox and use `Ctrl/Cmd + /` to view the built-in shortcuts modal.",
      "Open Chatting",
      "/login"
    )
  ])
];
