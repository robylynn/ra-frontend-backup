import { useState, useEffect, useContext, useRef } from "react";
import { useWebSocket, WebSocketMessage} from "@/lib/components/client_components/WebsocketSubscriptionProvider";

export function LogViewerIcon() {
  const { isConnected, registerMessageListener, subscribe, unsubscribe } = useWebSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [unviewedLogCount, setUnviewedLogCount] = useState(0);
  const [allLogs, setAllLogs] = useState<WebSocketMessage[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const toggleOverlay = () => {
    setIsOpen(prev => !prev);
    if (!isOpen) { // If opening the overlay, reset count
      setUnviewedLogCount(0);
    }
  };

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) { // Only scroll to bottom if overlay is open
      scrollToBottom();
    }
  }, [allLogs, isOpen]);

  // Register a listener for ALL messages to act as the log source
  useEffect(() => {
    if (!isConnected) return;

    const listenerId = 'log-viewer-listener';
    const callback = (message: WebSocketMessage) => {
      setAllLogs(prevLogs => [...prevLogs, message]);
      if (!isOpen) {
        setUnviewedLogCount(prevCount => prevCount + 1);
      }
    };

    // Register without a filter to receive all messages (status, error, historical, live, etc.)
    const unRegisterListener = registerMessageListener(listenerId, callback, {types: ['status', 'error', 'live', 'historical'], table: 'logs'});
    subscribe('logs', true, 100);

    return () => {
      unsubscribe('logs')
      unRegisterListener(); // Clean up listener
    };
  }, [isConnected, registerMessageListener]); // Re-register if connection status or isOpen changes

  const renderLogMessage = (log: WebSocketMessage, index: number) => {
    let content;
    let className = 'p-2 my-1 rounded-lg text-sm';
    const timestamp = new Date().toLocaleTimeString(); // Add a timestamp for logs

    switch (log.type) {
      case 'historical':
        className += ' bg-blue-100 text-blue-800';
        content = (
          <>
            <span className="font-bold">[{timestamp}] HISTORICAL [{log.table}]:</span>
            <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(log.data, null, 2)}</pre>
          </>
        );
        break;
      case 'live':
        className += ' bg-green-100 text-green-800';
        content = (
          <>
            <span className="font-bold">[{timestamp}] LIVE [{log.table}]:</span>
            <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(log.data, null, 2)}</pre>
          </>
        );
        break;
      case 'status':
        className += ' bg-gray-100 text-gray-700 italic';
        content = (
          <>
            <span className="font-bold">[{timestamp}] STATUS:</span> {log.message || `Table ${log.table} is ${log.status}.`}
          </>
        );
        break;
      case 'error':
        className += ' bg-red-100 text-red-800 font-bold';
        content = (
          <>
            <span className="font-bold">[{timestamp}] ERROR:</span> {log.message}
          </>
        );
        break;
      default:
        className += ' bg-yellow-100 text-yellow-800';
        content = (
          <>
            <span className="font-bold">[{timestamp}] UNKNOWN:</span>
            <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(log, null, 2)}</pre>
          </>
        );
    }
    return (
      <li key={index} className={className}>
        {content}
      </li>
    );
  };


  return (
    <>
      {/* Icon Button */}
      <button
        onClick={toggleOverlay}
        className="fixed bottom-4 right-4 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 transition duration-200 ease-in-out z-50 flex items-center justify-center"
        aria-label="Open Log Viewer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        {unviewedLogCount > 0 && (
          <span className="absolute top-0 right-0 -mt-1 -mr-1 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full transform translate-x-1/2 -translate-y-1/2">
            {unviewedLogCount}
          </span>
        )}
      </button>

      {/* Full-page Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-40 flex items-center justify-center p-4 font-inter">
          <div className="bg-white rounded-xl shadow-2xl w-full h-full max-w-6xl max-h-[90vh] flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Application Logs</h2>
              <button
                onClick={toggleOverlay}
                className="p-2 rounded-full hover:bg-gray-200 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-300"
                aria-label="Close Log Viewer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-grow p-4 overflow-y-auto bg-gray-50 text-gray-900">
              <ul className="space-y-2">
                {allLogs.length === 0 ? (
                  <li className="text-gray-500 italic">No logs received yet.</li>
                ) : (
                  allLogs.map((log, index) => renderLogMessage(log, index))
                )}
                <div ref={logsEndRef} />
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}