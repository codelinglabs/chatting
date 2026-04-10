import { code, cta, faq, list, paragraph, section } from "@/lib/blog-block-factories";

export const chattingReactNativeExpoGuideSections = [
  section("before-you-start", "Before you start", [
    list([
      "An Expo or React Native app that can install npm packages",
      "Use `https://usechatting.com` as `baseURL`",
      "Use your site/workspace ID inside Chatting as `siteId`",
      "Async storage for session persistence",
      "A physical device if you want to test Expo push notifications"
    ]),
    paragraph("That is the full default setup: `baseURL` is always `https://usechatting.com`, and `siteId` is your site/workspace ID inside Chatting.")
  ]),
  section("install", "Install the package", [
    list([
      "Install `@usechatting/react-native` in your app",
      "Install async storage so conversations stay available after app restarts",
      "Install Expo Notifications if you want push delivery"
    ], true),
    code(
      `npm install @usechatting/react-native @react-native-async-storage/async-storage\nnpx expo install expo-notifications`,
      "bash"
    ),
    paragraph("If you are using plain React Native instead of Expo, you can still use the same chat package. The Expo Notifications step is only for Expo push notifications.")
  ]),
  section("create-client", "Create the client", [
    paragraph("Create one `ChattingClient` with your Chatting URL, site ID, and session store."),
    code(
      `import AsyncStorage from "@react-native-async-storage/async-storage";\nimport { ChattingClient, createKeyValueSessionStore } from "@usechatting/react-native";\n\nconst client = new ChattingClient({\n  baseURL: "https://usechatting.com",\n  siteId: "your-site-id",\n  sessionStore: createKeyValueSessionStore(AsyncStorage, "your-site-id")\n});`,
      "tsx"
    )
  ]),
  section("support-screen", "Add the support screen", [
    paragraph("Mount `ChattingConversationScreen` in your support screen or support tab."),
    code(
      `import { useMemo } from "react";\nimport { ChattingConversationScreen } from "@usechatting/react-native";\n\nexport function SupportScreen() {\n  const context = useMemo(() => ({ pageUrl: "myapp://support" }), []);\n\n  return (\n    <ChattingConversationScreen\n      client={client}\n      context={context}\n      draftVisitorEmail="customer@example.com"\n    />\n  );\n}`,
      "tsx"
    ),
    paragraph("This gives you an in-app support screen with saved conversations and live message updates while the app is open.")
  ]),
  section("push", "Register Expo push notifications", [
    paragraph("Register an Expo push token if your app should notify users after the app is backgrounded. Refresh the chat when the app becomes active again."),
    code(
      `import { useEffect, useState } from "react";\nimport * as Notifications from "expo-notifications";\nimport { AppState, Platform } from "react-native";\nimport type { ChattingClient } from "@usechatting/react-native";\n\nNotifications.setNotificationHandler({\n  handleNotification: async () => ({\n    shouldShowAlert: false,\n    shouldPlaySound: false,\n    shouldSetBadge: false\n  })\n});\n\nexport function useChattingPush(client: ChattingClient) {\n  const [refreshKey, setRefreshKey] = useState(0);\n\n  useEffect(() => {\n    let mounted = true;\n\n    const refreshChat = async () => {\n      await client.syncPushToken();\n      if (mounted) {\n        setRefreshKey((current) => current + 1);\n      }\n    };\n\n    const registerPush = async () => {\n      const permission = await Notifications.requestPermissionsAsync();\n      if (!mounted || permission.status !== "granted") {\n        return;\n      }\n\n      const token = await Notifications.getExpoPushTokenAsync({\n        projectId: "your-expo-project-id"\n      });\n\n      await client.registerPushToken({\n        pushToken: token.data,\n        platform: Platform.OS\n      });\n    };\n\n    void registerPush();\n\n    const appStateSubscription = AppState.addEventListener("change", (nextState) => {\n      if (nextState === "active") {\n        void refreshChat();\n      }\n    });\n\n    const responseSubscription = Notifications.addNotificationResponseReceivedListener(() => {\n      void refreshChat();\n    });\n\n    return () => {\n      mounted = false;\n      appStateSubscription.remove();\n      responseSubscription.remove();\n    };\n  }, [client]);\n\n  return refreshKey;\n}\n\n// Then pass the returned key into your chat screen:\nconst refreshKey = useChattingPush(client);\n<ChattingConversationScreen key={refreshKey} client={client} />`,
      "tsx"
    ),
    paragraph("Expo documents that push notifications need a physical device for testing, and `expo-notifications` must be installed before you request a token.")
  ]),
  section("identify", "Identify signed-in users", [
    paragraph("If your app already knows the customer, identify them before or right after the support screen mounts. If not, you can pass a draft email only."),
    code(
      `await client.identify({\n  email: "customer@example.com",\n  name: "Taylor"\n});\n\n<ChattingConversationScreen\n  client={client}\n  draftVisitorEmail="customer@example.com"\n/>`,
      "tsx"
    ),
    paragraph("Use `identify(...)` for signed-in users. Use `draftVisitorEmail` if you only need an email address for follow-up.")
  ]),
  section("check-installation", "Check the installation", [
    list([
      "Open the support screen in your app",
      "Send a test message from the device",
      "Reply from the Chatting inbox and confirm the reply appears in the app",
      "Background the app and send another reply from the inbox",
      "Tap the push notification and confirm the conversation refreshes"
    ], true)
  ]),
  section("faq", "FAQ", [
    faq([
      {
        question: "Does this work in Expo?",
        answer: "Yes. The published package works in Expo and the setup above uses the package exactly as published."
      },
      {
        question: "Does this work in React Native too?",
        answer: "Yes. The core package works in React Native as well. Expo Notifications is only needed if you want the Expo push flow."
      },
      {
        question: "What should I use for baseURL?",
        answer: "Use `https://usechatting.com`."
      }
    ]),
    cta(
      "Ready to add Chatting to Expo?",
      "Install the package, add your site ID, and launch one support screen in your app first.",
      "Open Chatting",
      "/login"
    )
  ])
];
