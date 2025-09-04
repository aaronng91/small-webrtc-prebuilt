import {
  ConsoleTemplate,
  FullScreenContainer,
  ThemeProvider,
} from "@pipecat-ai/voice-ui-kit";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SmallWebRTCTransport } from "@pipecat-ai/small-webrtc-transport";

//@ts-ignore - fontsource-variable/geist is not typed
import "@fontsource-variable/geist";
//@ts-ignore - fontsource-variable/geist is not typed
import "@fontsource-variable/geist-mono";

createRoot(document.getElementById("root")!).render(
  // @ts-ignore
  <StrictMode>
    <ThemeProvider>
      <FullScreenContainer>
        <ConsoleTemplate
          connectParams={{
            connectionUrl: "/api/offer",
          }}
          transportType="smallwebrtc"
          clientOptions={{
            transport: new SmallWebRTCTransport({
              waitForICEGathering: true,
              iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
              ],
            }),
          }}
        />
      </FullScreenContainer>
    </ThemeProvider>
  </StrictMode>
);
