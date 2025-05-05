"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Float, Text, MeshDistortMaterial } from "@react-three/drei"
import { Vector3, type Object3D, Quaternion } from "three"
import { motion } from "framer-motion"
import { ErrorBoundary } from "react-error-boundary"

// Node component representing a block in the blockchain
function Node({ position, color, pulse, size = 1, onClick }: any) {
  const meshRef = useRef<Object3D>(null)
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)

  // Store the initial position
  const initialPosition = useRef(position ? [...position] : [0, 0, 0])

  useFrame((state) => {
    if (!meshRef.current) return

    // Create a new position vector instead of modifying the original
    const pos = meshRef.current.position

    // Create a new position vector for the floating animation
    const newPos = new Vector3(
      initialPosition.current[0],
      initialPosition.current[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1,
      initialPosition.current[2],
    )
    pos.copy(newPos)

    // Pulse effect
    if (pulse) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05
      meshRef.current.scale.set(scale, scale, scale)
    }

    // Rotation - use rotateY instead of direct assignment
    meshRef.current.rotateY(0.002)
  })

  return (
    <mesh
      ref={meshRef}
      position={position || [0, 0, 0]}
      onClick={(e) => {
        e.stopPropagation()
        setClicked(!clicked)
        if (onClick) onClick()
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={clicked ? 1.2 : 1}
    >
      <sphereGeometry args={[size, 32, 32]} />
      <MeshDistortMaterial color={hovered ? "#FFDD00" : color} speed={2} distort={hovered ? 0.4 : 0.2} radius={1} />
    </mesh>
  )
}

// Connection component representing transactions between blocks
function Connection({ start, end, color }: any) {
  const ref = useRef<Object3D>(null)
  const [materialOpacity, setMaterialOpacity] = useState(0.6)
  const [direction, setDirection] = useState<Vector3>(new Vector3())
  const [length, setLength] = useState<number>(1)
  const [rotationAxis, setRotationAxis] = useState<Vector3>(new Vector3())
  const [rotationAngle, setRotationAngle] = useState<number>(0)

  // Skip rendering if we don't have valid start and end points
  const hasValidPoints = start && end

  useEffect(() => {
    if (hasValidPoints) {
      // Safely create vectors with default values if undefined
      const startVec = new Vector3(...(start || [0, 0, 0]))
      const endVec = new Vector3(...(end || [1, 0, 0]))

      // Calculate direction and length
      const newDirection = new Vector3().subVectors(endVec, startVec)
      const newLength = newDirection.length() || 1 // Prevent zero length

      // Calculate rotation to align cylinder with direction
      // We need to align the cylinder's Y axis with our direction vector
      const cylinderUpAxis = new Vector3(0, 1, 0)
      const normalizedDirection = new Vector3().copy(newDirection).normalize()

      // Calculate the rotation axis and angle
      const newRotationAxis = new Vector3().crossVectors(cylinderUpAxis, normalizedDirection).normalize()
      const newRotationAngle = Math.acos(cylinderUpAxis.dot(normalizedDirection))

      setDirection(newDirection)
      setLength(newLength)
      setRotationAxis(newRotationAxis)
      setRotationAngle(newRotationAngle)
    }
  }, [start, end, hasValidPoints])

  // Calculate midpoint for cylinder position
  const startVec = new Vector3(...(start || [0, 0, 0]))
  const endVec = new Vector3(...(end || [1, 0, 0]))
  const position = startVec.clone().add(endVec).multiplyScalar(0.5)
  // Convert Vector3 to array for the position prop
  const positionArray = [position.x, position.y, position.z]

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    setMaterialOpacity(Math.sin(t * 2) * 0.3 + 0.7)
  })

  if (!hasValidPoints) return null

  return (
    <group position={positionArray}>
      <mesh
        ref={ref}
        // Apply rotation using quaternion
        quaternion={new Quaternion().setFromAxisAngle(rotationAxis, rotationAngle)}
      >
        <cylinderGeometry args={[0.03, 0.03, length, 8]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={materialOpacity}
          emissive={color}
          emissiveIntensity={0.5}
          wireframe
        />
      </mesh>
    </group>
  )
}

// Simplified particle system to avoid matrix operations
function Particles({ count = 50 }: { count?: number }) {
  // Reduce particle count for better performance
  const actualCount = Math.min(count, 50)

  return (
    <group>
      {Array.from({ length: actualCount }).map((_, i) => (
        <SimplifiedParticle key={i} />
      ))}
    </group>
  )
}

// Individual particle to avoid instancedMesh issues
function SimplifiedParticle() {
  const ref = useRef<Object3D>(null)
  const speed = useRef({
    x: (Math.random() - 0.5) * 0.01,
    y: (Math.random() - 0.5) * 0.01,
    z: (Math.random() - 0.5) * 0.01,
  })

  // Set random initial position
  const [position] = useState([(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10])

  useFrame(() => {
    if (!ref.current) return

    // Create a new position vector and use .set() to update the position
    const newPos = ref.current.position.clone()
    newPos.x += speed.current.x
    newPos.y += speed.current.y
    newPos.z += speed.current.z
    ref.current.position.copy(newPos)

    // Reset if particle goes out of bounds
    if (
      Math.abs(ref.current.position.x) > 5 ||
      Math.abs(ref.current.position.y) > 5 ||
      Math.abs(ref.current.position.z) > 5
    ) {
      const randomPos = new Vector3((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10)
      ref.current.position.copy(randomPos)
    }
  })

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.05, 6, 6]} />
      <meshBasicMaterial color="#FFDD00" transparent opacity={0.3} />
    </mesh>
  )
}

// Main blockchain visualization component
function BlockchainVisualization() {
  const [nodes, setNodes] = useState<any[]>([])
  const [connections, setConnections] = useState<any[]>([])
  const [activeNode, setActiveNode] = useState<number | null>(null)

  // Generate blockchain nodes and connections
  useEffect(() => {
    try {
      const newNodes: any[] = []
      const newConnections: any[] = []

      // Create main chain
      const mainChainLength = 5
      for (let i = 0; i < mainChainLength; i++) {
        newNodes.push({
          id: i,
          position: [i * 1.5 - (mainChainLength * 1.5) / 2, 0, 0],
          color: i === 0 ? "#FFDD00" : "#8A4FFF",
          pulse: i === mainChainLength - 1,
          size: i === 0 ? 0.8 : 0.6,
        })

        if (i > 0 && newNodes[i - 1]) {
          newConnections.push({
            id: `main-${i - 1}-${i}`,
            start: [...newNodes[i - 1].position],
            end: [...newNodes[i].position],
            color: "#FFDD00",
          })
        }
      }

      // Create some branch chains - simplified to avoid complexity
      for (let i = 1; i < mainChainLength - 1; i++) {
        if (Math.random() > 0.5 || !newNodes[i]) continue

        const branchDirection = Math.random() > 0.5 ? 1 : -1
        const startNode = newNodes[i]

        // Just create one branch node to simplify
        const nodeId = newNodes.length
        const position = [startNode.position[0] + 1.2, startNode.position[1] + branchDirection * 1.2, 0]

        newNodes.push({
          id: nodeId,
          position: [...position],
          color: "#6B30CC",
          pulse: false,
          size: 0.5,
        })

        newConnections.push({
          id: `branch-${i}-0`,
          start: [...startNode.position],
          end: [...position],
          color: "#6B30CC",
        })
      }

      setNodes(newNodes)
      setConnections(newConnections)
    } catch (error) {
      console.error("Error generating blockchain:", error)
      // Set empty arrays as fallback
      setNodes([])
      setConnections([])
    }
  }, [])

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      <Particles count={30} />

      {/* Render nodes */}
      {nodes.map((node) => (
        <Node
          key={node.id}
          position={node.position}
          color={node.color}
          pulse={node.pulse}
          size={node.size}
          onClick={() => setActiveNode(node.id === activeNode ? null : node.id)}
        />
      ))}

      {/* Render connections */}
      {connections.map((connection) => (
        <Connection key={connection.id} start={connection.start} end={connection.end} color={connection.color} />
      ))}

      {/* Floating text */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <Text position={[0, 2, 0]} fontSize={0.5} color="#FFDD00" anchorX="center" anchorY="middle">
          SolBet Blockchain
        </Text>
      </Float>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.5}
        rotateSpeed={0.5}
      />
    </>
  )
}

// Fallback component for when 3D rendering fails
function FallbackVisualization() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-linear-to-r from-secondary-purple/30 to-primary-yellow/30 rounded-lg">
      <div className="text-center p-6">
        <div className="text-primary-yellow text-xl font-bold mb-3">SolBet Blockchain</div>
        <div className="text-text-pearl mb-4">Decentralized betting on Solana</div>
        <div className="flex justify-center">
          <div className="h-3 w-3 rounded-full bg-primary-yellow animate-pulse mr-2"></div>
          <div
            className="h-3 w-3 rounded-full bg-secondary-purple animate-pulse mr-2"
            style={{ animationDelay: "0.3s" }}
          ></div>
          <div
            className="h-3 w-3 rounded-full bg-primary-yellow animate-pulse"
            style={{ animationDelay: "0.6s" }}
          ></div>
        </div>
      </div>
    </div>
  )
}

// Wrap the BlockchainScene component with an ErrorBoundary
export default function BlockchainScene() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="w-full h-full min-h-[400px]"
    >
      <ErrorBoundary fallback={<FallbackVisualization />}>
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
          <BlockchainVisualization />
        </Canvas>
      </ErrorBoundary>
    </motion.div>
  )
}
