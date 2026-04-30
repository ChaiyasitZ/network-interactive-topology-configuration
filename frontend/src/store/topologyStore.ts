import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import { io } from 'socket.io-client';

// Connect to backend socket
const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');

type RFState = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  syncNodeChanges: (changes: NodeChange[]) => void;
  syncEdgeChanges: (changes: EdgeChange[]) => void;
  syncConnectEdge: (connection: Connection | Edge) => void;
};

const useStore = create<RFState>((set, get) => {
  // Listen to remote changes
  socket.on('nodes-change', (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  });

  socket.on('edges-change', (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  });

  socket.on('connect-edge', (connection: Edge) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  });

  return {
    nodes: [],
    edges: [],
    onNodesChange: (changes: NodeChange[]) => {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
      // Emit to server
      socket.emit('nodes-change', changes);
    },
    onEdgesChange: (changes: EdgeChange[]) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
      // Emit to server
      socket.emit('edges-change', changes);
    },
    onConnect: (connection: Connection) => {
      set({
        edges: addEdge(connection, get().edges),
      });
      // Emit to server
      socket.emit('connect-edge', connection);
    },
    setNodes: (nodes: Node[]) => {
      set({ nodes });
    },
    setEdges: (edges: Edge[]) => {
      set({ edges });
    },
    // Useful for full state overwrites later
    syncNodeChanges: (changes) => set({ nodes: applyNodeChanges(changes, get().nodes) }),
    syncEdgeChanges: (changes) => set({ edges: applyEdgeChanges(changes, get().edges) }),
    syncConnectEdge: (connection) => set({ edges: addEdge(connection, get().edges) })
  };
});

export default useStore;