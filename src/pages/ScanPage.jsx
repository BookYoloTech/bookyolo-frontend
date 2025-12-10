import React from "react";
import ChatInterface from "../components/ChatInterface";

export default function ScanPage({ me, meLoading, onUsageChanged }) {
  return <ChatInterface me={me} meLoading={meLoading} onUsageChanged={onUsageChanged} />;
}