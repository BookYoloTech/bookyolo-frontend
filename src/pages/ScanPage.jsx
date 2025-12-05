import React from "react";
import ChatInterface from "../components/ChatInterface";

export default function ScanPage({ me, meLoading }) {
  return <ChatInterface me={me} meLoading={meLoading} />;
}