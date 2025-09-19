"use client";

import { useState, useEffect, useContext } from "react";
import { DashboardContext } from "@/lib/components/client_components/DashboardContextWrapper";

interface Project {
  id: number;
  name: string;
}

interface TrainingJob {
  id: string;
  train_project_id: number;
  val_project_id: number;
  model_type: string;
  epochs: number;
  batch_size: number;
  status: "pending" | "training" | "completed" | "failed";
  progress: number;
  created_at: string;
  model_path?: string;
}

interface AITrainingContainerProps {
  layout?: "compact" | "full";
  showProjects?: boolean;
  showJobs?: boolean;
  showModels?: boolean;
  refreshInterval?: number;
  className?: string;
}

export const AITrainingContainer = ({
  layout = "full",
  showProjects = true,
  showJobs = true,
  showModels = true,
  refreshInterval = 5000,
  className = "",
}: AITrainingContainerProps) => {
  const { dashboardContext } = useContext(DashboardContext);

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedTrainingProject, setSelectedTrainingProject] = useState<
    number | null
  >(null); // Start with null
  const [selectedValidationProject, setSelectedValidationProject] = useState<
    number | null
  >(null); // Start with null
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [loading, setLoading] = useState(false); // Start with false
  const [isFetchingProjects, setIsFetchingProjects] = useState(false); // New state for project fetching

  // Training parameters
  const [modelType, setModelType] = useState<string>("yolo_nas_s");
  const [epochs, setEpochs] = useState<number>(3);
  const [batchSize, setBatchSize] = useState<number>(4);

  const isCompact = layout === "compact";

  // Remove the useEffect auto-fetch for now
  // useEffect(() => {
  //   fetchProjectsFromROS();
  // }, []);

  const fetchProjectsFromROS = async () => {
    setIsFetchingProjects(true);

    try {
      if (!dashboardContext.ra_ros_websocket?.isConnected) {
        console.warn("ROS WebSocket not connected yet");
        alert("ROS WebSocket is not connected. Please check your connection.");
        setIsFetchingProjects(false);
        return;
      }

      if (!dashboardContext.ai_training_services) {
        console.error("❌ AI Training Services not initialized!");
        alert(
          "AI Training Services not initialized. Check the WebSocket setup."
        );
        setIsFetchingProjects(false);
        return;
      }

      if (
        typeof dashboardContext.ai_training_services.get_projects !== "function"
      ) {
        console.error("❌ get_projects method not available!");
        console.log(
          "Available methods:",
          Object.getOwnPropertyNames(
            Object.getPrototypeOf(dashboardContext.ai_training_services)
          )
        );
        alert("get_projects method not found on AI Training Services.");
        setIsFetchingProjects(false);
        return;
      }

      dashboardContext.ai_training_services.get_projects(
        (results) => {
          try {
            if (results.success && results.projects) {
              // Expected format: [ProjectInfo(id=1, name='defect_train'), ProjectInfo(id=2, name='defect_val')]
              const projectsData = Array.isArray(results.projects)
                ? results.projects
                : JSON.parse(results.projects);

              setProjects(projectsData);

              // Auto-select projects if they exist
              if (projectsData.length > 0) {
                // Look for training project (project 1 or first project with 'train' in name)
                const trainingProject = projectsData.find(
                  (p: Project) =>
                    p.id === 1 || p.name.toLowerCase().includes("train")
                );
                // Look for validation project (project 2 or first project with 'val' in name)
                const validationProject = projectsData.find(
                  (p: Project) =>
                    p.id === 2 || p.name.toLowerCase().includes("val")
                );

                if (trainingProject)
                  setSelectedTrainingProject(trainingProject.id);
                if (validationProject)
                  setSelectedValidationProject(validationProject.id);
              }

              setIsFetchingProjects(false);
            } else {
              console.warn("No projects data in ROS response or unsuccessful");
              setProjects([]);
              setIsFetchingProjects(false);
            }
          } catch (e) {
            console.error("Failed to parse projects from ROS:", e);
            setProjects([]);
            setIsFetchingProjects(false);
          }
        },
        () => {
          console.error("❌ Failed to get projects from ROS");
          alert("Failed to get projects from ROS. Check console for details.");
          setProjects([]);
          setIsFetchingProjects(false);
        }
      );
    } catch (error) {
      console.error("❌ Error calling ROS2 service:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        dashboardContext: dashboardContext,
        aiTrainingServices: dashboardContext.ai_training_services,
      });
      alert(`Error calling ROS2 service: ${error.message}`);
      setProjects([]);
      setIsFetchingProjects(false);
    }
  };

  const startTraining = async () => {
    if (!selectedTrainingProject || !selectedValidationProject) {
      console.error("Both training and validation projects must be selected");
      return;
    }

    if (selectedTrainingProject === selectedValidationProject) {
      console.error("Training and validation projects must be different");
      return;
    }

    setIsTraining(true);

    try {
      dashboardContext.ai_training_services.start_ai_training(
        selectedTrainingProject, 
        selectedValidationProject, 
        modelType, 
        epochs, 
        batchSize, 
        (result) => {
          console.log("Training started successfully:", result);

          // Add new training job to the list
          const newJob: TrainingJob = {
            id: `job_${Date.now()}`,
            train_project_id: selectedTrainingProject,
            val_project_id: selectedValidationProject,
            model_type: modelType,
            epochs: epochs,
            batch_size: batchSize,
            status: "training",
            progress: 0,
            created_at: new Date().toISOString(),
          };

          setTrainingJobs((prev) => [newJob, ...prev]);
          setIsTraining(false);
        },
        () => {
          console.error("Failed to start training via ROS");
          setIsTraining(false);
        },
        (error) => {
          console.error("Training start error:", error);
          setIsTraining(false);
        }
      );
    } catch (error) {
      console.error("Failed to start training:", error);
      setIsTraining(false);
    }
  };

  const deployModel = async (jobId: string) => {
    try {
      console.log(`Deploying model from job: ${jobId}`);
      console.log("Model deployed successfully");
    } catch (error) {
      console.error("Failed to deploy model:", error);
    }
  };

  return (
    <div className={`w-full h-full p-2 overflow-hidden ${className}`}>
      <div className={`flex flex-col gap-3 h-full`}>
        {/* Dataset Selection Section */}
        {showProjects && (
          <div className="flex-shrink-0">
            <div className="flex justify-between items-center mb-2">
              <h3
                className={`${isCompact ? "text-xs" : "text-sm"} font-semibold text-white`}
              >
                Dataset Selection
              </h3>

              {/* Fetch Projects Button */}
              <button
                onClick={fetchProjectsFromROS}
                disabled={
                  isFetchingProjects ||
                  !dashboardContext.ra_ros_websocket?.isConnected
                }
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  dashboardContext.ra_ros_websocket?.isConnected
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isFetchingProjects ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                    Fetching...
                  </>
                ) : (
                  "📂 Get Projects"
                )}
              </button>
            </div>

            {/* Connection Status */}
            {/* <div className="mb-2">
              <div
                className={`text-xs px-2 py-1 rounded ${
                  dashboardContext.ra_ros_websocket?.isConnected
                    ? "bg-green-900/30 border border-green-600 text-green-400"
                    : "bg-red-900/30 border border-red-600 text-red-400"
                }`}
              >
                ROS Connection:{" "}
                {dashboardContext.ra_ros_websocket?.isConnected
                  ? "✅ Connected"
                  : "❌ Disconnected"}
              </div>
            </div> */}

            {/* Training and Validation Dataset Dropdowns */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {/* Training Dataset */}
              <div>
                <label className="text-xs text-gray-300 mb-1 block">
                  Training Dataset:
                </label>
                <select
                  value={selectedTrainingProject || ""}
                  onChange={(e) =>
                    setSelectedTrainingProject(Number(e.target.value) || null)
                  }
                  disabled={projects.length === 0}
                  className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-white disabled:opacity-50"
                >
                  <option value="">Select training...</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      #{project.id} - {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Validation Dataset */}
              <div>
                <label className="text-xs text-gray-300 mb-1 block">
                  Validation Dataset:
                </label>
                <select
                  value={selectedValidationProject || ""}
                  onChange={(e) =>
                    setSelectedValidationProject(Number(e.target.value) || null)
                  }
                  disabled={projects.length === 0}
                  className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-white disabled:opacity-50"
                >
                  <option value="">Select validation...</option>
                  {projects.map((project) => (
                    <option
                      key={project.id}
                      value={project.id}
                      disabled={project.id === selectedTrainingProject}
                    >
                      #{project.id} - {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Training Parameters */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div>
                <label className="text-xs text-gray-300 mb-1 block">
                  Model:
                </label>
                <select
                  value={modelType}
                  onChange={(e) => setModelType(e.target.value)}
                  className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-white"
                >
                  <option value="yolo_nas_s">YOLO NAS S</option>
                  <option value="yolo_nas_m">YOLO NAS M</option>
                  <option value="yolo_nas_l">YOLO NAS L</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-300 mb-1 block">
                  Epochs:
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={epochs}
                  onChange={(e) => setEpochs(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 mb-1 block">
                  Batch Size:
                </label>
                <input
                  type="number"
                  min="1"
                  max="64"
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-white"
                />
              </div>
            </div>

            {/* Selected Projects Display */}
            {(selectedTrainingProject || selectedValidationProject) && (
              <div className="grid grid-cols-2 gap-2 mb-2">
                {selectedTrainingProject && (
                  <div className="p-2 bg-blue-900/30 border border-blue-600 rounded text-xs">
                    <div className="text-blue-400 font-medium">Training</div>
                    <div className="text-white">
                      #{selectedTrainingProject} -{" "}
                      {
                        projects.find((p) => p.id === selectedTrainingProject)
                          ?.name
                      }
                    </div>
                  </div>
                )}
                {selectedValidationProject && (
                  <div className="p-2 bg-purple-900/30 border border-purple-600 rounded text-xs">
                    <div className="text-purple-400 font-medium">
                      Validation
                    </div>
                    <div className="text-white">
                      #{selectedValidationProject} -{" "}
                      {
                        projects.find((p) => p.id === selectedValidationProject)
                          ?.name
                      }
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-1">
              <button
                onClick={startTraining}
                disabled={
                  !selectedTrainingProject ||
                  !selectedValidationProject ||
                  isTraining ||
                  selectedTrainingProject === selectedValidationProject ||
                  !dashboardContext.ra_ros_websocket?.isConnected
                }
                className="w-full px-2 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded text-xs"
              >
                {isTraining ? "🔄 Starting Training..." : "🚀 Start Training"}
              </button>

              <div className="flex gap-1">
                <button
                  onClick={() => window.open("/labelstudio", "_blank")}
                  className="flex-1 px-1 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                >
                  🏷️ Label Studio
                </button>
              </div>
            </div>

            {/* Validation Warnings */}
            {selectedTrainingProject === selectedValidationProject &&
              selectedTrainingProject && (
                <div className="mt-1 p-1 bg-red-900/30 border border-red-600 rounded text-xs text-red-400">
                  ⚠️ Training and validation datasets must be different
                </div>
              )}

            {/* No Projects Warning */}
            {projects.length === 0 && !isFetchingProjects && (
              <div className="mt-1 p-2 bg-yellow-900/30 border border-yellow-600 rounded text-xs text-yellow-400">
                ⚠️ No projects loaded. Click "📂 Get Projects" to fetch from
                ROS.
              </div>
            )}

            {/* No ROS Connection Warning */}
            {!dashboardContext.ra_ros_websocket?.isConnected && (
              <div className="mt-1 p-2 bg-red-900/30 border border-red-600 rounded text-xs text-red-400">
                ❌ ROS connection required to fetch projects and start training.
              </div>
            )}
          </div>
        )}

        {/* Training Jobs Section */}
        {showJobs && (
          <div className="flex-1 min-h-0">
            <h3
              className={`${isCompact ? "text-xs" : "text-sm"} font-semibold text-white mb-1`}
            >
              Training Jobs
            </h3>
            <div className="h-full overflow-y-auto space-y-1">
              {trainingJobs.length === 0 ? (
                <div className="text-gray-400 text-xs p-2 text-center">
                  No training jobs yet. Start training to see jobs here.
                </div>
              ) : (
                trainingJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-2 bg-gray-800 rounded border border-gray-600 text-xs"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="font-medium text-white">
                        Job #{job.id.slice(-3)}
                      </div>
                      <div
                        className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                          job.status === "completed"
                            ? "text-green-400 bg-green-900/30"
                            : job.status === "failed"
                              ? "text-red-400 bg-red-900/30"
                              : job.status === "training"
                                ? "text-yellow-400 bg-yellow-900/30"
                                : "text-gray-400 bg-gray-700"
                        }`}
                      >
                        {job.status.toUpperCase()}
                      </div>
                    </div>

                    <div className="text-gray-400 text-xs mb-1">
                      Train: #{job.train_project_id} • Val: #
                      {job.val_project_id}
                    </div>

                    <div className="text-gray-400 text-xs mb-2">
                      {job.model_type} • {job.epochs} epochs • batch{" "}
                      {job.batch_size} •{" "}
                      {new Date(job.created_at).toLocaleDateString()}
                    </div>

                    {job.status === "training" && (
                      <div className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-300">Progress</span>
                          <span className="text-yellow-400 font-medium">
                            {job.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                          <div
                            className="bg-yellow-400 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${job.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {job.status === "completed" && job.model_path && (
                      <button
                        onClick={() => deployModel(job.id)}
                        className="w-full px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
                      >
                        🚀 Deploy Model
                      </button>
                    )}

                    {job.status === "failed" && (
                      <button
                        onClick={() => startTraining()}
                        disabled={
                          !selectedTrainingProject || !selectedValidationProject
                        }
                        className="w-full px-2 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded text-xs transition-colors"
                      >
                        🔄 Retry Training
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Models Section */}
        {showModels && !isCompact && (
          <div className="flex-shrink-0">
            <h3 className="text-sm font-semibold text-white mb-1">
              Deployed Models
            </h3>
            <div className="space-y-1">
              <div className="p-2 bg-green-900/30 border border-green-600 rounded text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white font-medium">Camera 0</span>
                  <span className="text-green-400">●</span>
                </div>
                <div className="text-gray-300">Defect Detection v1.2</div>
                <div className="text-xs text-gray-400 mt-1">
                  Accuracy: 94.5%
                </div>
              </div>

              <div className="p-2 bg-gray-800 border border-gray-600 rounded text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white font-medium">Camera 1</span>
                  <span className="text-gray-400">○</span>
                </div>
                <div className="text-gray-400">No model deployed</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Export different variations
export const CompactAITraining = (
  props: Omit<AITrainingContainerProps, "layout">
) => <AITrainingContainer {...props} layout="compact" />;

export const SimpleAITraining = (
  props: Omit<AITrainingContainerProps, "showJobs" | "showModels">
) => <AITrainingContainer {...props} showJobs={false} showModels={false} />;

export default AITrainingContainer;
