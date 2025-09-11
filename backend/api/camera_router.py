
from fastapi import APIRouter
from loguru import logger
from api.models import CameraStreamRequestData, CameraStreamResponseData
from common_models.models import ApiResponse

camera_router = APIRouter(tags=["Camera"])

###############################################################################
################################ Camera Interface  ############################
###############################################################################

# @camera_router.get("/status", response_model=ApiResponse)
# def get_camera_status():
#     # result = initializer.ra_interface.get_camera_status()
#     return ApiResponse(error=False, data=result)


# @camera_router.post("/start", response_model=ApiResponse)
# def start_camera_stream_node(request_data: CameraStreamRequestData):
#     try:
#         # Use the model data
#         result = initializer.ra_interface.start_camera_stream_node(
#             camera_id=request_data.camera_id, uvc_camera=request_data.uvc_camera
#         )

#         # Create response model
#         response_data = CameraStreamResponseData(
#             success=result.get("success", False), message=result.get("message", "")
#         )

#         return ApiResponse(error=False, data=response_data.model_dump())

#     except Exception as e:
#         logger.error(f"Failed to start camera: {e}")
#         response_data = CameraStreamResponseData(success=False, message=str(e))
#         return ApiResponse(error=True, data=response_data.model_dump())