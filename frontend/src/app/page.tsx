import NetworkCanvas from "@/components/NetworkCanvas";

export default function Home() {
  return (
    <div className="flex-1 w-full h-[calc(100vh-80px)] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
      <NetworkCanvas />
    </div>
  );
}
