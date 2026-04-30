'use client';

import NetworkCanvas from "@/components/NetworkCanvas";
import ConfigEditor from "@/components/ConfigEditor";
import useStore from "@/store/topologyStore";
import { AnimatePresence } from "framer-motion";

export default function Home() {
  const { selectedNodeId } = useStore();

  return (
    <div className="flex flex-1 w-full h-[calc(100vh-80px)] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
      <div className="flex-1 h-full relative">
        <NetworkCanvas />
      </div>
      <AnimatePresence>
        {selectedNodeId && <ConfigEditor />}
      </AnimatePresence>
    </div>
  );
}
